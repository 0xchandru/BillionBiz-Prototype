import { WebSocketServer, WebSocket } from 'ws';
import { Server as HttpServer } from 'http';
import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { requireAuth, JWT_SECRET } from '../middleware/auth.js';
import { resolveTenant } from '../middleware/tenant.js';

export interface RealtimeEvent {
  id: string;
  type: string;
  channel: string;
  organizationId: string;
  storeId?: string;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, any>;
  timestamp: string;
  version?: number;
}

interface AuthenticatedSocket extends WebSocket {
  isAlive?: boolean;
  userId?: string;
  organizationId?: string;
  storeId?: string;
  roles?: string[];
  permissions?: Set<string>;
  isPlatformAdmin?: boolean;
  isOwner?: boolean;
  channels?: Set<string>;
}

interface SseClient {
  id: string;
  res: Response;
  organizationId: string;
  storeId?: string;
  permissions: Set<string>;
  isPlatformAdmin: boolean;
  isOwner: boolean;
  channels: Set<string>;
}

class RealtimeGateway {
  private wss: WebSocketServer | null = null;
  private sseClients: Map<string, SseClient> = new Map();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/realtime' });

    this.wss.on('connection', (ws: AuthenticatedSocket, req) => {
      ws.isAlive = true;
      ws.channels = new Set(['*']);

      void (async () => {
        const url = new URL(req.url || '', 'http://localhost');
        const token = url.searchParams.get('token') || req.headers['authorization']?.replace('Bearer ', '');
        if (!token) {
          ws.send(JSON.stringify({ type: 'error', message: 'AUTHENTICATION_REQUIRED' }));
          ws.close(4001, 'Unauthorized');
          return;
        }

        try {
          const decoded = jwt.verify(token, JWT_SECRET) as any;
          if (typeof decoded.userId !== 'string' ||
              typeof decoded.organizationId !== 'string' ||
              typeof decoded.storeId !== 'string') {
            ws.send(JSON.stringify({ type: 'error', message: 'TENANT_CONTEXT_REQUIRED' }));
            ws.close(4003, 'Forbidden');
            return;
          }

          const identity = await query(
            `SELECT u.is_platform_admin, om.role AS membership_role, s.organization_id AS store_organization_id
             FROM users u
             LEFT JOIN organization_memberships om
               ON om.user_id = u.id AND om.organization_id = $2
             LEFT JOIN stores s ON s.id = $3
             WHERE u.id = $1
             LIMIT 1`,
            [decoded.userId, decoded.organizationId, decoded.storeId]
          );
          if (identity.rowCount === 0 ||
              identity.rows[0].store_organization_id !== decoded.organizationId ||
              (identity.rows[0].is_platform_admin !== true && !identity.rows[0].membership_role)) {
            ws.send(JSON.stringify({ type: 'error', message: 'TENANT_ACCESS_DENIED' }));
            ws.close(4003, 'Forbidden');
            return;
          }

          const isPlatformAdmin = identity.rows[0].is_platform_admin === true;
          const isOwner = identity.rows[0].membership_role === 'OWNER';
          let permissions = new Set<string>();
          if (isPlatformAdmin || isOwner) {
            permissions = new Set(['*']);
          } else {
            const permissionRows = await query(
              `SELECT DISTINCT p.code
               FROM role_assignments ra
               JOIN staff_profiles sp ON sp.id = ra.staff_profile_id
               JOIN roles r ON r.id = ra.role_id
               JOIN role_permissions rp ON rp.role_id = ra.role_id
               JOIN permissions p ON p.id = rp.permission_id
               WHERE sp.user_id = $1 AND sp.organization_id = $2
                 AND sp.store_id = $3 AND sp.is_active = TRUE
                 AND (ra.store_id = $3 OR ra.store_id IS NULL)
                 AND (r.organization_id IS NULL OR r.organization_id = $2)`,
              [decoded.userId, decoded.organizationId, decoded.storeId]
            );
            permissions = new Set(permissionRows.rows.map((row) => row.code));
          }

          ws.userId = decoded.userId;
          ws.organizationId = decoded.organizationId;
          ws.storeId = decoded.storeId;
          ws.roles = decoded.roles || [];
          ws.permissions = permissions;
          ws.isPlatformAdmin = isPlatformAdmin;
          ws.isOwner = isOwner;

          ws.send(JSON.stringify({
            type: 'connection_established',
            userId: ws.userId,
            organizationId: ws.organizationId,
            storeId: ws.storeId,
            timestamp: new Date().toISOString()
          }));

          ws.on('pong', () => { ws.isAlive = true; });
          ws.on('message', async (data) => {
            try {
              const msg = JSON.parse(data.toString());
              if (msg.action === 'ping') {
                ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
              } else if (msg.action === 'subscribe') {
                if (!Array.isArray(msg.channels) || msg.channels.length > 50 ||
                    msg.channels.some((channel: unknown) => typeof channel !== 'string' || !/^[a-z0-9._*-]{1,64}$/i.test(channel))) {
                  ws.send(JSON.stringify({ type: 'error', message: 'INVALID_CHANNEL_SUBSCRIPTION' }));
                  return;
                }
                ws.channels = new Set(msg.channels);
                ws.send(JSON.stringify({ type: 'subscribed', channels: Array.from(ws.channels) }));
              } else if (msg.action === 'catchup') {
                const cursor = typeof msg.cursor === 'string'
                  ? msg.cursor
                  : new Date(Date.now() - 3600 * 1000).toISOString();
                const page = await this.fetchHistoricalEvents(ws.organizationId!, ws.storeId, cursor);
                const events = page.events.filter((event) => this.canReceiveEvent(
                  ws.permissions || new Set(),
                  ws.isOwner === true,
                  ws.isPlatformAdmin === true,
                  event
                ));
                ws.send(JSON.stringify({
                  type: 'catchup_completed',
                  cursor,
                  nextCursor: page.nextCursor,
                  hasMore: page.hasMore,
                  count: events.length,
                  events
                }));
              } else {
                ws.send(JSON.stringify({ type: 'error', message: 'UNKNOWN_ACTION' }));
              }
            } catch {
              ws.send(JSON.stringify({ type: 'error', message: 'MALFORMED_MESSAGE' }));
            }
          });
        } catch {
          ws.send(JSON.stringify({ type: 'error', message: 'INVALID_TOKEN' }));
          ws.close(4003, 'Forbidden');
        }
      })();
    });

    // Heartbeat ping interval
    const interval = setInterval(() => {
      if (!this.wss) return;
      this.wss.clients.forEach((client: WebSocket) => {
        const authSocket = client as AuthenticatedSocket;
        if (authSocket.isAlive === false) {
          return authSocket.terminate();
        }
        authSocket.isAlive = false;
        authSocket.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });

    console.log('[Realtime Gateway] WebSocket server attached to /realtime');
  }

  public registerSseClient(
    id: string,
    res: Response,
    organizationId: string,
    storeId: string | undefined,
    channels: string[] | undefined,
    permissions: string[],
    isPlatformAdmin: boolean,
    isOwner: boolean
  ) {
    const client: SseClient = {
      id,
      res,
      organizationId,
      storeId,
      permissions: new Set(permissions),
      isPlatformAdmin,
      isOwner,
      channels: new Set(channels || ['*'])
    };
    this.sseClients.set(id, client);

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });

    res.write(`data: ${JSON.stringify({ type: 'sse_connected', timestamp: new Date().toISOString() })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(id);
    });
  }

  public canReceiveEvent(
    permissions: Set<string>,
    isOwner: boolean,
    isPlatformAdmin: boolean,
    event: { channel?: string; storeId?: string }
  ): boolean {
    if (isOwner || isPlatformAdmin || permissions.has('*')) return true;
    const channel = String(event.channel || '').toLowerCase();
    const required =
      channel.startsWith('order') ? ['orders.view'] :
      channel.startsWith('booking') || channel.startsWith('appointment') ? ['appointments.view'] :
      channel.startsWith('pos') ? ['pos.access'] :
      channel.startsWith('inventory') ? ['inventory.view', 'catalog.view'] :
      channel.startsWith('catalog') || channel.startsWith('product') ? ['catalog.view'] :
      channel.startsWith('team') || channel.startsWith('staff') ? ['team.view'] :
      channel.startsWith('storefront') || channel.startsWith('page') ? ['store.editor.view'] :
      ['org.view'];
    return required.some((permission) => permissions.has(permission) || permissions.has('org.manage'));
  }

  public async fetchHistoricalEvents(organizationId: string, storeId?: string, cursor?: string): Promise<{
    events: Array<RealtimeEvent & { cursor: string }>;
    hasMore: boolean;
    nextCursor: string | null;
  }> {
    let sql = `
      SELECT id, organization_id, store_id, event_type, aggregate_type, aggregate_id, payload, created_at,
             to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS cursor_timestamp
      FROM outbox_events
      WHERE organization_id = $1
    `;
    const params: any[] = [organizationId];

    if (storeId) {
      params.push(storeId);
      sql += ` AND (store_id = $${params.length} OR store_id IS NULL)`;
    }

    if (cursor) {
      const separator = cursor.lastIndexOf('|');
      const cursorTimestamp = separator > 0 ? cursor.slice(0, separator) : cursor;
      const cursorId = separator > 0 ? cursor.slice(separator + 1) : '';
      const parsed = new Date(cursorTimestamp);
      if (Number.isFinite(parsed.getTime())) {
        params.push(parsed.toISOString());
        if (cursorId) {
          params.push(cursorId);
          sql += ` AND (created_at > $${params.length - 1}::timestamptz OR (created_at = $${params.length - 1}::timestamptz AND id > $${params.length}))`;
        } else {
          sql += ` AND created_at >= $${params.length}::timestamptz`;
        }
      }
    }

    sql += ` ORDER BY created_at ASC, id ASC LIMIT 501`;
    const result = await query(sql, params);
    const hasMore = result.rows.length > 500;
    const pageRows = result.rows.slice(0, 500);
    const events = pageRows.map((row: any) => ({
      id: row.id,
      type: row.event_type,
      channel: String(row.aggregate_type || 'system').toLowerCase(),
      organizationId: row.organization_id,
      storeId: row.store_id || undefined,
      aggregateType: row.aggregate_type,
      aggregateId: row.aggregate_id,
      payload: row.payload,
      timestamp: new Date(row.created_at).toISOString(),
      cursor: `${row.cursor_timestamp}|${row.id}`
    }));
    return {
      events,
      hasMore,
      nextCursor: events.length > 0 ? events[events.length - 1].cursor : null
    };
  }

  public broadcast(event: RealtimeEvent) {
    const raw = JSON.stringify({
      type: 'event',
      channel: event.channel,
      data: event
    });

    // 1. WebSocket broadcast (strictly tenant isolated)
    if (this.wss) {
      this.wss.clients.forEach((client: WebSocket) => {
        const authSocket = client as AuthenticatedSocket;
        if (
          authSocket.readyState === WebSocket.OPEN &&
          authSocket.organizationId === event.organizationId
        ) {
          if (event.storeId && authSocket.storeId !== event.storeId) return;
          if (!this.canReceiveEvent(
            authSocket.permissions || new Set(),
            authSocket.isOwner === true,
            authSocket.isPlatformAdmin === true,
            event
          )) return;
          if (
            authSocket.channels?.has('*') ||
            authSocket.channels?.has(event.channel) ||
            authSocket.channels?.has(event.type)
          ) {
            authSocket.send(raw);
          }
        }
      });
    }

    // 2. SSE broadcast
    for (const [, client] of this.sseClients) {
      if (client.organizationId === event.organizationId) {
        if (event.storeId && client.storeId !== event.storeId) continue;
        if (!this.canReceiveEvent(client.permissions, client.isOwner, client.isPlatformAdmin, event)) continue;
        if (
          client.channels.has('*') ||
          client.channels.has(event.channel) ||
          client.channels.has(event.type)
        ) {
          client.res.write(`data: ${raw}\n\n`);
        }
      }
    }
  }

  public getConnectedClientCount(): number {
    return (this.wss?.clients?.size || 0) + this.sseClients.size;
  }
}

export const realtimeGateway = new RealtimeGateway();

// REST / SSE Router for fallback streaming & recovery
export const realtimeRouter = Router();

// GET /api/v1/realtime/stream (SSE Endpoint)
realtimeRouter.get('/stream', requireAuth, resolveTenant, (req: Request, res: Response) => {
  const clientId = `sse-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const channels = req.query.channels ? (req.query.channels as string).split(',') : ['*'];
  realtimeGateway.registerSseClient(
    clientId,
    res,
    req.tenant!.organizationId,
    req.tenant!.storeId,
    channels,
    req.auth?.permissions || [],
    req.auth?.isPlatformAdmin === true,
    req.auth?.role === 'OWNER'
  );
});

// GET /api/v1/realtime/catchup (Cursor-based event recovery)
realtimeRouter.get('/catchup', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const cursor = (req.query.cursor as string) || new Date(Date.now() - 3600 * 1000).toISOString();
  const page = await realtimeGateway.fetchHistoricalEvents(
    req.tenant!.organizationId,
    req.tenant!.storeId,
    cursor
  );
  const events = page.events.filter((event) => realtimeGateway.canReceiveEvent(
    new Set(req.auth?.permissions || []),
    req.auth?.role === 'OWNER',
    req.auth?.isPlatformAdmin === true,
    event
  ));
  res.json({
    cursor,
    nextCursor: page.nextCursor,
    hasMore: page.hasMore,
    count: events.length,
    events
  });
});

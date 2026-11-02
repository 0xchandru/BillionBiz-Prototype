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
  channels?: Set<string>;
}

interface SseClient {
  id: string;
  res: Response;
  organizationId: string;
  storeId?: string;
  channels: Set<string>;
}

class RealtimeGateway {
  private wss: WebSocketServer | null = null;
  private sseClients: Map<string, SseClient> = new Map();

  public init(server: HttpServer) {
    this.wss = new WebSocketServer({ server, path: '/realtime' });

    this.wss.on('connection', (ws: AuthenticatedSocket, req) => {
      ws.isAlive = true;
      ws.channels = new Set(['*']); // Subscribe to all tenant channels by default

      // Extract token from query or auth headers
      const url = new URL(req.url || '', 'http://localhost');
      const token = url.searchParams.get('token') || req.headers['authorization']?.replace('Bearer ', '');

      if (!token) {
        ws.send(JSON.stringify({ type: 'error', message: 'AUTHENTICATION_REQUIRED' }));
        ws.close(4001, 'Unauthorized');
        return;
      }

      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        ws.userId = decoded.userId;
        ws.organizationId = decoded.organizationId;
        ws.storeId = decoded.storeId;
        ws.roles = decoded.roles || [];

        ws.send(
          JSON.stringify({
            type: 'connection_established',
            userId: ws.userId,
            organizationId: ws.organizationId,
            storeId: ws.storeId,
            timestamp: new Date().toISOString()
          })
        );
      } catch (err: any) {
        ws.send(JSON.stringify({ type: 'error', message: 'INVALID_TOKEN' }));
        ws.close(4003, 'Forbidden');
        return;
      }

      ws.on('pong', () => {
        ws.isAlive = true;
      });

      ws.on('message', async (data) => {
        try {
          const msg = JSON.parse(data.toString());

          if (msg.action === 'ping') {
            ws.send(JSON.stringify({ type: 'pong', timestamp: new Date().toISOString() }));
          } else if (msg.action === 'subscribe') {
            if (Array.isArray(msg.channels)) {
              ws.channels = new Set(msg.channels);
              ws.send(JSON.stringify({ type: 'subscribed', channels: Array.from(ws.channels) }));
            }
          } else if (msg.action === 'catchup') {
            // Replay missed events from outbox based on cursor
            const cursor = msg.cursor || new Date(Date.now() - 3600 * 1000).toISOString();
            const events = await this.fetchHistoricalEvents(ws.organizationId!, ws.storeId, cursor);
            ws.send(
              JSON.stringify({
                type: 'catchup_completed',
                cursor,
                count: events.length,
                events
              })
            );
          }
        } catch (err) {
          ws.send(JSON.stringify({ type: 'error', message: 'MALFORMED_MESSAGE' }));
        }
      });
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

  public registerSseClient(id: string, res: Response, organizationId: string, storeId?: string, channels?: string[]) {
    const client: SseClient = {
      id,
      res,
      organizationId,
      storeId,
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

  public async fetchHistoricalEvents(organizationId: string, storeId?: string, cursor?: string) {
    let sql = `
      SELECT id, event_type, aggregate_type, aggregate_id, payload, created_at
      FROM outbox_events
      WHERE organization_id = $1
    `;
    const params: any[] = [organizationId];

    if (storeId) {
      params.push(storeId);
      sql += ` AND (store_id = $${params.length} OR store_id IS NULL)`;
    }

    if (cursor) {
      params.push(cursor);
      sql += ` AND created_at > $${params.length}`;
    }

    sql += ` ORDER BY created_at ASC LIMIT 100`;

    const res = await query(sql, params);
    return res.rows.map((r: any) => ({
      id: r.id,
      type: r.event_type,
      aggregateType: r.aggregate_type,
      aggregateId: r.aggregate_id,
      payload: r.payload,
      timestamp: r.created_at
    }));
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
          // If store specified, check store match or if socket has platform scope
          if (event.storeId && authSocket.storeId && authSocket.storeId !== event.storeId) {
            return;
          }
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
        if (event.storeId && client.storeId && client.storeId !== event.storeId) {
          continue;
        }
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
    channels
  );
});

// GET /api/v1/realtime/catchup (Cursor-based event recovery)
realtimeRouter.get('/catchup', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const cursor = (req.query.cursor as string) || new Date(Date.now() - 3600 * 1000).toISOString();
  const events = await realtimeGateway.fetchHistoricalEvents(
    req.tenant!.organizationId,
    req.tenant!.storeId,
    cursor
  );
  res.json({
    cursor,
    count: events.length,
    events
  });
});

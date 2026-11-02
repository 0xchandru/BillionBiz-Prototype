import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/pool.js';

export interface AuditParams {
  organizationId?: string;
  storeId?: string;
  actorId?: string;
  actorType?: 'USER' | 'SYSTEM' | 'API_KEY';
  action: string;
  targetType: string;
  targetId: string;
  changes?: Record<string, any>;
  ipAddress?: string;
  correlationId?: string;
}

export async function recordAudit(params: AuditParams) {
  try {
    const id = `aud-${uuidv4()}`;
    await query(
      `INSERT INTO audit_logs (id, organization_id, store_id, actor_id, actor_type, action, target_type, target_id, changes, ip_address, correlation_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [
        id,
        params.organizationId || null,
        params.storeId || null,
        params.actorId || 'system',
        params.actorType || 'USER',
        params.action,
        params.targetType,
        params.targetId,
        JSON.stringify(params.changes || {}),
        params.ipAddress || null,
        params.correlationId || uuidv4()
      ]
    );
  } catch (err) {
    console.error('[Audit] Failed to record audit log:', err);
  }
}

export async function publishOutboxEvent(
  client: any,
  organizationId: string,
  storeId: string,
  eventType: string,
  aggregateType: string,
  aggregateId: string,
  payload: Record<string, any>,
  correlationId?: string
) {
  const id = `evt-${uuidv4()}`;
  await client.query(
    `INSERT INTO outbox_events (id, organization_id, store_id, event_type, aggregate_type, aggregate_id, payload, correlation_id, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)`,
    [id, organizationId, storeId, eventType, aggregateType, aggregateId, JSON.stringify(payload), correlationId || uuidv4()]
  );
  return id;
}

export async function enqueueOutbox(params: {
  organizationId: string;
  storeId?: string;
  eventType: string;
  aggregateType?: string;
  aggregateId?: string;
  payload: Record<string, any>;
  correlationId?: string;
}) {
  const id = `evt-${uuidv4()}`;
  await query(
    `INSERT INTO outbox_events (id, organization_id, store_id, event_type, aggregate_type, aggregate_id, payload, correlation_id, published)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)`,
    [
      id,
      params.organizationId,
      params.storeId || null,
      params.eventType,
      params.aggregateType || 'SYSTEM',
      params.aggregateId || id,
      JSON.stringify(params.payload),
      params.correlationId || uuidv4()
    ]
  );
  return id;
}


import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';

export async function handleIdempotency(req: Request, res: Response, next: NextFunction) {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  if (!idempotencyKey || req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const orgId = req.tenant?.organizationId;
  const storeId = req.tenant?.storeId;
  const requestPath = req.originalUrl || req.path;
  const requestHash = crypto.createHash('sha256').update(JSON.stringify(req.body || {})).digest('hex');

  try {
    // Check if record exists
    const existing = await query(
      `SELECT response_code, response_body, expires_at
       FROM idempotency_records
       WHERE idempotency_key = $1`,
      [idempotencyKey]
    );

    if (existing.rowCount && existing.rowCount > 0) {
      const record = existing.rows[0];
      if (new Date() < new Date(record.expires_at)) {
        res.setHeader('X-Idempotent-Replay', 'true');
        return res.status(record.response_code).json(record.response_body);
      }
    }

    // Intercept res.json to capture response
    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      // Restore original json method
      res.json = originalJson;

      // Only cache successful or non-server-error responses
      if (res.statusCode < 500) {
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hour retention window
        query(
          `INSERT INTO idempotency_records (idempotency_key, organization_id, store_id, request_path, request_hash, response_code, response_body, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (idempotency_key) DO NOTHING`,
          [idempotencyKey, orgId, storeId, requestPath, requestHash, res.statusCode, body, expiresAt]
        ).catch(err => console.error('[Idempotency] Failed to store record', err));
      }

      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error('[Idempotency] Error handling key', err);
    next();
  }
}


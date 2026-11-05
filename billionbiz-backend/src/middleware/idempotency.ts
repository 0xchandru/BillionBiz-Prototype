import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { query } from '../db/pool.js';

const IN_PROGRESS_CODE = 102;
const IN_PROGRESS_TTL_MS = 15 * 60 * 1000;
const COMPLETED_TTL_MS = 24 * 60 * 60 * 1000;

type IdempotencyRecord = {
  response_code: number;
  response_body: any;
  request_hash: string;
  request_path: string;
  organization_id: string | null;
  store_id: string | null;
  expires_at: Date | string;
};

function sendExistingRecord(
  res: Response,
  record: IdempotencyRecord,
  requestHash: string,
  requestPath: string,
  organizationId: string | null,
  storeId: string | null
) {
  const sameScope =
    record.organization_id === organizationId &&
    record.store_id === storeId &&
    record.request_path === requestPath;
  if (!sameScope || record.request_hash !== requestHash) {
    return res.status(409).json({
      error: 'IDEMPOTENCY_KEY_REUSED',
      message: 'This idempotency key was already used with a different request. Generate a new key for a new operation.'
    });
  }

  if (record.response_code === IN_PROGRESS_CODE) {
    res.setHeader('Retry-After', '1');
    return res.status(409).json({
      error: 'IDEMPOTENCY_REQUEST_IN_PROGRESS',
      message: 'A request with this idempotency key is still being processed. Retry with the same key.'
    });
  }

  res.setHeader('X-Idempotent-Replay', 'true');
  return res.status(record.response_code).json(record.response_body);
}

export async function handleIdempotency(req: Request, res: Response, next: NextFunction) {
  if (req.method === 'GET' || req.method === 'HEAD') {
    return next();
  }

  const headerValue = req.headers['idempotency-key'];
  if (headerValue === undefined) {
    return next();
  }
  if (typeof headerValue !== 'string') {
    return res.status(400).json({
      error: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Send exactly one Idempotency-Key header value.'
    });
  }

  const idempotencyKey = headerValue.trim().replace(/^"(.*)"$/, '$1');
  if (!idempotencyKey || idempotencyKey.length > 128 || !/^[A-Za-z0-9._:-]+$/.test(idempotencyKey)) {
    return res.status(400).json({
      error: 'INVALID_IDEMPOTENCY_KEY',
      message: 'Idempotency-Key must contain 1–128 letters, numbers, dots, underscores, colons, or hyphens.'
    });
  }

  const organizationId = req.tenant?.organizationId ?? null;
  const storeId = req.tenant?.storeId ?? null;
  const requestPath = `${req.baseUrl || ''}${req.path || req.originalUrl || ''}`;
  if (requestPath.length > 255) {
    return res.status(414).json({
      error: 'IDEMPOTENCY_PATH_TOO_LONG',
      message: 'The request path is too long to be safely idempotent.'
    });
  }

  const requestHash = crypto
    .createHash('sha256')
    .update(JSON.stringify(req.body || {}))
    .digest('hex');

  try {
    const existing = await query<IdempotencyRecord>(
      `SELECT response_code, response_body, request_hash, request_path,
              organization_id, store_id, expires_at
       FROM idempotency_records
       WHERE idempotency_key = $1`,
      [idempotencyKey]
    );

    if (existing.rowCount && existing.rows[0]) {
      const record = existing.rows[0];
      if (new Date() < new Date(record.expires_at)) {
        return sendExistingRecord(res, record, requestHash, requestPath, organizationId, storeId);
      }

      await query(
        `DELETE FROM idempotency_records
         WHERE idempotency_key = $1 AND expires_at <= NOW()`,
        [idempotencyKey]
      );
    }

    const claim = await query(
      `INSERT INTO idempotency_records (
         idempotency_key, organization_id, store_id, request_path, request_hash,
         response_code, response_body, expires_at
       )
       VALUES ($1, $2, $3, $4, $5, $6, '{"state":"PROCESSING"}'::jsonb, $7)
       ON CONFLICT (idempotency_key) DO NOTHING
       RETURNING idempotency_key`,
      [
        idempotencyKey,
        organizationId,
        storeId,
        requestPath,
        requestHash,
        IN_PROGRESS_CODE,
        new Date(Date.now() + IN_PROGRESS_TTL_MS)
      ]
    );

    if (claim.rowCount === 0) {
      const concurrent = await query<IdempotencyRecord>(
        `SELECT response_code, response_body, request_hash, request_path,
                organization_id, store_id, expires_at
         FROM idempotency_records
         WHERE idempotency_key = $1`,
        [idempotencyKey]
      );
      if (concurrent.rowCount && concurrent.rows[0]) {
        return sendExistingRecord(res, concurrent.rows[0], requestHash, requestPath, organizationId, storeId);
      }
      return res.status(409).json({
        error: 'IDEMPOTENCY_REQUEST_CONFLICT',
        message: 'The request could not claim its idempotency key. Retry with the same key.'
      });
    }

    const originalJson = res.json.bind(res);
    let responseFinalized = false;
    res.json = (body: any) => {
      if (responseFinalized) return originalJson(body);
      responseFinalized = true;
      res.json = originalJson;

      const responseCode = res.statusCode;
      const finalize = responseCode >= 500
        ? query(
            `DELETE FROM idempotency_records
             WHERE idempotency_key = $1 AND request_hash = $2 AND response_code = $3`,
            [idempotencyKey, requestHash, IN_PROGRESS_CODE]
          )
        : query(
            `UPDATE idempotency_records
             SET response_code = $2, response_body = $3, expires_at = $4
             WHERE idempotency_key = $1 AND request_hash = $5 AND response_code = $6`,
            [
              idempotencyKey,
              responseCode,
              body,
              new Date(Date.now() + COMPLETED_TTL_MS),
              requestHash,
              IN_PROGRESS_CODE
            ]
          );

      finalize
        .catch((err) => {
          console.error('[Idempotency] Failed to finalize request record', err);
        })
        .finally(() => originalJson(body));

      return res;
    };

    res.once?.('close', () => {
      if (responseFinalized || res.writableEnded) return;
      query(
        `DELETE FROM idempotency_records
         WHERE idempotency_key = $1 AND request_hash = $2 AND response_code = $3`,
        [idempotencyKey, requestHash, IN_PROGRESS_CODE]
      ).catch((err) => console.error('[Idempotency] Failed to release abandoned request key', err));
    });

    return next();
  } catch (err) {
    console.error('[Idempotency] Failed to claim request key', err);
    return res.status(503).json({
      error: 'IDEMPOTENCY_UNAVAILABLE',
      message: 'The request could not be safely deduplicated. Please retry with the same idempotency key.'
    });
  }
}

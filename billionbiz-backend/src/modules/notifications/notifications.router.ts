import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { requireAuth } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { NotificationOutboxService } from '../../core/notificationWorker.js';

export const notificationsRouter = Router();

// GET /api/v1/notifications (Root endpoint for active notifications)
notificationsRouter.get('/', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const orgId = req.tenant!.organizationId;
  const userId = req.auth!.userId;

  const notifs = await query(
    `SELECT id, type, title, message, is_read, metadata, created_at
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
       AND (user_id = $3 OR user_id IS NULL)
     ORDER BY created_at DESC
     LIMIT 50`,
    [orgId, storeId, userId]
  );

  const unreadCountRes = await query(
    `SELECT COUNT(*)::int as count
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
       AND (user_id = $3 OR user_id IS NULL)
       AND is_read = FALSE`,
    [orgId, storeId, userId]
  );

  res.json({
    unreadCount: unreadCountRes.rows[0]?.count || 0,
    notifications: notifs.rows
  });
});

// GET /api/v1/notifications/inbox
notificationsRouter.get('/inbox', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const orgId = req.tenant!.organizationId;
  const userId = req.auth!.userId;

  const notifs = await query(
    `SELECT id, type, title, message, is_read, metadata, created_at
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
       AND (user_id = $3 OR user_id IS NULL)
     ORDER BY created_at DESC
     LIMIT 50`,
    [orgId, storeId, userId]
  );

  const unreadCountRes = await query(
    `SELECT COUNT(*)::int as count
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
       AND (user_id = $3 OR user_id IS NULL)
       AND is_read = FALSE`,
    [orgId, storeId, userId]
  );

  res.json({
    unreadCount: unreadCountRes.rows[0]?.count || 0,
    notifications: notifs.rows
  });
});

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/:id/read', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const { id } = req.params;
  const orgId = req.tenant!.organizationId;
  const storeId = req.tenant!.storeId;
  const userId = req.auth!.userId;

  const updateRes = await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1 AND organization_id = $2
       AND (store_id = $3 OR store_id IS NULL)
       AND (user_id = $4 OR user_id IS NULL)
     RETURNING id, is_read`,
    [id, orgId, storeId, userId]
  );

  if (updateRes.rowCount === 0) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Notification not found' });
  }

  res.json({ message: 'Marked as read', notification: updateRes.rows[0] });
});

// POST /api/v1/notifications/read-all
notificationsRouter.post('/read-all', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;
  const storeId = req.tenant!.storeId;
  const userId = req.auth!.userId;

  await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE organization_id = $1 AND (store_id = $2 OR store_id IS NULL)
       AND (user_id = $3 OR user_id IS NULL)`,
    [orgId, storeId, userId]
  );

  res.json({ message: 'All notifications marked as read' });
});

// POST /api/v1/notifications/process-outbox (Manual / Test Trigger)
notificationsRouter.post('/process-outbox', requireAuth, async (req: Request, res: Response) => {
  // This worker processes queued events for every tenant. It is a platform
  // operations endpoint and must never be callable by a store member or guest.
  if (req.auth?.isPlatformAdmin !== true) {
    return res.status(403).json({ error: 'FORBIDDEN', message: 'Only a platform administrator can trigger the global outbox worker.' });
  }
  const result = await NotificationOutboxService.processPendingEvents();
  res.json({ message: 'Outbox processed', ...result });
});

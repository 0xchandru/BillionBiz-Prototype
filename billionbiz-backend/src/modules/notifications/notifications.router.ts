import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { requireAuth } from '../../middleware/auth.js';
import { NotificationOutboxService } from '../../core/notificationWorker.js';

export const notificationsRouter = Router();

// GET /api/v1/notifications/inbox
notificationsRouter.get('/inbox', requireAuth, async (req: Request, res: Response) => {
  const storeId = req.auth?.storeId;
  const orgId = req.auth?.organizationId;
  const userId = req.auth?.userId;

  const notifs = await query(
    `SELECT id, type, title, message, is_read, metadata, created_at
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
     ORDER BY created_at DESC
     LIMIT 50`,
    [orgId, storeId]
  );

  const unreadCountRes = await query(
    `SELECT COUNT(*)::int as count
     FROM notifications
     WHERE organization_id = $1
       AND (store_id = $2 OR store_id IS NULL)
       AND is_read = FALSE`,
    [orgId, storeId]
  );

  res.json({
    unreadCount: unreadCountRes.rows[0]?.count || 0,
    notifications: notifs.rows
  });
});

// PATCH /api/v1/notifications/:id/read
notificationsRouter.patch('/:id/read', requireAuth, async (req: Request, res: Response) => {
  const { id } = req.params;
  const orgId = req.auth?.organizationId;

  const updateRes = await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE id = $1 AND organization_id = $2
     RETURNING id, is_read`,
    [id, orgId]
  );

  if (updateRes.rowCount === 0) {
    return res.status(404).json({ error: 'NOT_FOUND', message: 'Notification not found' });
  }

  res.json({ message: 'Marked as read', notification: updateRes.rows[0] });
});

// POST /api/v1/notifications/read-all
notificationsRouter.post('/read-all', requireAuth, async (req: Request, res: Response) => {
  const orgId = req.auth?.organizationId;
  const storeId = req.auth?.storeId;

  await query(
    `UPDATE notifications
     SET is_read = TRUE
     WHERE organization_id = $1 AND (store_id = $2 OR store_id IS NULL)`,
    [orgId, storeId]
  );

  res.json({ message: 'All notifications marked as read' });
});

// POST /api/v1/notifications/process-outbox (Manual / Test Trigger)
notificationsRouter.post('/process-outbox', async (_req: Request, res: Response) => {
  const result = await NotificationOutboxService.processPendingEvents();
  res.json({ message: 'Outbox processed', ...result });
});

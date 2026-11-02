import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { identityRouter } from './modules/identity/identity.router.js';
import { tenancyRouter } from './modules/tenancy/tenancy.router.js';
import { teamRouter } from './modules/team/team.router.js';
import { catalogRouter } from './modules/catalog/catalog.router.js';
import { ordersRouter } from './modules/orders/orders.router.js';
import { appointmentsRouter } from './modules/appointments/appointments.router.js';
import { posRouter } from './modules/pos/pos.router.js';
import { storefrontRouter } from './modules/storefront/storefront.router.js';
import { extensionsRouter } from './modules/extensions/extensions.router.js';
import { dashboardRouter } from './modules/dashboard/dashboard.router.js';
import { notificationsRouter } from './modules/notifications/notifications.router.js';
import { realtimeRouter, realtimeGateway } from './core/realtimeGateway.js';
import { pool } from './db/pool.js';

dotenv.config();

export const app = express();
export const server = http.createServer(app);
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// Request logging in dev
if (process.env.NODE_ENV !== 'test') {
  app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
    });
    next();
  });
}

// Attach Realtime WebSocket Gateway to HTTP server
realtimeGateway.init(server);

// Health check endpoints (REQ-OPS-003)
app.get('/health', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1;');
    res.json({
      status: 'UP',
      platform: 'BillionBiz Modular Platform',
      version: '2.0.0',
      database: dbCheck.rowCount === 1 ? 'CONNECTED' : 'DISCONNECTED',
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'DOWN', database: 'ERROR', error: err.message });
  }
});

app.get('/health/live', (req, res) => {
  res.json({ status: 'LIVE', timestamp: new Date().toISOString() });
});

app.get('/health/ready', async (req, res) => {
  try {
    const dbCheck = await pool.query('SELECT 1;');
    if (dbCheck.rowCount === 1) {
      return res.json({ status: 'READY', database: 'CONNECTED', timestamp: new Date().toISOString() });
    }
    res.status(503).json({ status: 'NOT_READY', database: 'DISCONNECTED' });
  } catch (err: any) {
    res.status(503).json({ status: 'NOT_READY', database: 'ERROR', error: err.message });
  }
});

// Domain Routers
app.use('/api/v1/auth', identityRouter);
app.use('/api/v1/tenancy', tenancyRouter);
app.use('/api/v1/team', teamRouter);
app.use('/api/v1/catalog', catalogRouter);
app.use('/api/v1/orders', ordersRouter);
app.use('/api/v1/appointments', appointmentsRouter);
app.use('/api/v1/pos', posRouter);
app.use('/api/v1/storefront', storefrontRouter);
app.use('/api/v1/extensions', extensionsRouter);
app.use('/api/v1/dashboard', dashboardRouter);
app.use('/api/v1/notifications', notificationsRouter);
app.use('/api/v1/realtime', realtimeRouter);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[Unhandled Server Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'INTERNAL_SERVER_ERROR',
    message: err.message || 'An unexpected server error occurred',
    correlationId: req.headers['x-correlation-id'] || 'err-' + Date.now()
  });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`[BillionBiz Platform Server] Running on http://localhost:${PORT}`);
  });
}

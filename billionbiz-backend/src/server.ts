import './core/env.js';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { env } from './core/env.js';
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
import { isReservedSubdomain, PLATFORM_MAIN_DOMAIN } from './core/subdomains.js';
import { pool } from './db/pool.js';

export const app = express();
export const server = http.createServer(app);
const PORT = env.PORT || 8080;

// Explicit allowlist of production & local development origins dynamically loaded from environment
const rawOrigins = [
  env.MAIN_WEBSITE_URL,
  env.ADMIN_URL,
  env.ACCOUNTS_URL,
  env.STAFF_URL,
  env.POS_URL,
  env.OPS_URL,
  env.APP_URL,
  `https://${env.ROOT_DOMAIN}`,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://localhost:8080'
];

if (env.ALLOWED_ORIGINS) {
  env.ALLOWED_ORIGINS.split(',').forEach((o) => {
    if (o.trim()) rawOrigins.push(o.trim());
  });
}
if (env.CORS_ALLOWED_ORIGINS) {
  env.CORS_ALLOWED_ORIGINS.split(',').forEach((o) => {
    if (o.trim()) rawOrigins.push(o.trim());
  });
}

const ALLOWED_EXACT_ORIGINS = new Set(rawOrigins.map((o) => o.trim().toLowerCase()));

const DEV_ORIGIN_REGEX = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const ESCAPED_ROOT = env.ROOT_DOMAIN.replace(/\./g, '\\.');
const STORE_SUBDOMAIN_REGEX = new RegExp(`^https://([a-z0-9](?:[a-z0-9-]*[a-z0-9])?)\\.${ESCAPED_ROOT}$`, 'i');

export function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return false;
  const lower = origin.trim().toLowerCase();

  // Local development origins always permitted
  if (DEV_ORIGIN_REGEX.test(lower) || ALLOWED_EXACT_ORIGINS.has(lower)) {
    return true;
  }

  // Dynamic merchant store subdomains: https://<slug>.<ROOT_DOMAIN>
  const storeSubMatch = lower.match(STORE_SUBDOMAIN_REGEX);
  if (storeSubMatch) {
    const slug = storeSubMatch[1];
    if (!isReservedSubdomain(slug)) {
      return true;
    }
  }

  // Development origins
  if (process.env.NODE_ENV !== 'production' || DEV_ORIGIN_REGEX.test(lower)) {
    return true;
  }

  return false;
}

// Strict CORS & Preflight Middleware with Explicit Origin Allowlist
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Max-Age', '86400');
    
    const reqHeaders = req.headers['access-control-request-headers'];
    if (reqHeaders) {
      res.setHeader('Access-Control-Allow-Headers', reqHeaders);
    } else {
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization, x-organization-id, x-store-id, x-store-slug, x-tenant-id, x-portal-domain, x-client-version, x-storefront-access-token, idempotency-key, ngrok-skip-browser-warning, x-correlation-id, Accept, Origin, X-Requested-With, Cache-Control, Pragma'
      );
    }
  }

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-organization-id',
      'x-store-id',
      'x-store-slug',
      'x-tenant-id',
      'x-portal-domain',
      'x-client-version',
      'idempotency-key',
      'ngrok-skip-browser-warning',
      'x-correlation-id',
      'Accept',
      'Origin',
      'X-Requested-With',
      'Cache-Control',
      'Pragma'
    ],
    exposedHeaders: [
      'x-correlation-id',
      'x-store-id',
      'x-organization-id',
      'x-store-slug'
    ]
  })
);
app.options('*', (req, res) => res.status(204).end());
app.use(express.json({
  limit: '10mb',
  verify: (req, _res, buffer) => {
    // Payment-provider signatures are calculated over the exact received bytes,
    // not a re-serialized JavaScript object.
    (req as any).rawBody = Buffer.from(buffer);
  }
}));

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
app.get(['/health', '/api/v1/health'], async (req, res) => {
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

// Authoritative Backend API Identity Endpoint (Section 3.G - api.chandraprakash.codes)
app.get(['/', '/api/v1'], (req, res) => {
  res.json({
    status: 'ONLINE',
    service: 'BillionBiz Backend API',
    version: '2.3.0',
    subdomain: 'api',
    domain: PLATFORM_MAIN_DOMAIN,
    documentation: `https://www.${PLATFORM_MAIN_DOMAIN}`,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// Explicit 404 for Unmatched API Endpoints (Returns JSON, never HTML)
app.use((req, res, next) => {
  res.status(404).json({
    error: 'API_ENDPOINT_NOT_FOUND',
    message: `API route '${req.method} ${req.originalUrl}' does not exist on api.${PLATFORM_MAIN_DOMAIN}.`
  });
});

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

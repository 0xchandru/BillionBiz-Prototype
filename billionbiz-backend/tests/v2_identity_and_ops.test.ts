import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/server.js';
import { runMigrations } from '../src/db/migrate.js';
import { seedDatabase } from '../src/db/seed.js';
import { query } from '../src/db/pool.js';

let authToken = '';

function makeRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...options.headers
  };

  if (authToken && !headers.authorization) {
    headers.authorization = `Bearer ${authToken}`;
  }

  return new Promise<{ status: number; body: any }>((resolve) => {
    const req: any = {
      method,
      url: path,
      originalUrl: path,
      path: path.split('?')[0],
      headers,
      body: options.body || {},
      query: {},
      ip: '127.0.0.1',
      get: (h: string) => headers[h.toLowerCase()],
      header: (h: string) => headers[h.toLowerCase()]
    };

    if (path.includes('?')) {
      const q = path.split('?')[1];
      const params = new URLSearchParams(q);
      for (const [k, v] of params.entries()) {
        req.query[k] = v;
      }
    }

    const res: any = {
      statusCode: 200,
      headersSent: false,
      _headers: {},
      setHeader: (k: string, v: string) => { res._headers[k.toLowerCase()] = v; },
      getHeader: (k: string) => res._headers[k.toLowerCase()],
      status: (c: number) => { res.statusCode = c; return res; },
      json: (b: any) => {
        resolve({ status: res.statusCode, body: b });
        return res;
      },
      end: () => {
        resolve({ status: res.statusCode, body: {} });
        return res;
      }
    };

    app(req, res, () => {
      resolve({ status: 404, body: { error: 'ROUTE_NOT_FOUND' } });
    });
  });
}

describe('V2 Identity, First-Store Provisioning & Outbox Services', () => {
  beforeAll(async () => {
    await runMigrations();
    await seedDatabase();
    await query("DELETE FROM store_domains WHERE domain LIKE '%chandru-boutique%'");
    await query("DELETE FROM stores WHERE slug LIKE '%chandru-boutique%'");
  });

  const testEmail = `merchant_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let verifyToken = '';
  let storeId = '';

  it('T-045: registers merchant and atomically provisions draft store shell with onboarding checklist', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/register', {
      body: {
        email: testEmail,
        password: testPassword,
        fullName: 'Chandru Prakash',
        storeName: 'Chandru Boutique',
        capabilityMode: 'BOTH'
      }
    });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.store).toBeDefined();
    expect(res.body.store.status).toBe('DRAFT');
    expect(res.body.user.emailVerified).toBe(false);
    expect(res.body.portalDestination).toBeDefined();
    expect(res.body.portalDestination.portal).toBe('MERCHANT_ADMIN');
    expect(res.body.portalDestination.url).toBe('https://admin.chandraprakash.codes');
    expect(res.body.onboardingChecklist).toBeInstanceOf(Array);
    expect(res.body.onboardingChecklist.length).toBeGreaterThanOrEqual(4);

    authToken = res.body.token;
    verifyToken = res.body.verificationTokenPreview;
    storeId = res.body.store.id;
  });

  it('T-046: verifies email address with cryptographic token and completes checklist item', async () => {
    expect(verifyToken).toBeDefined();

    const res = await makeRequest('POST', '/api/v1/auth/verify-email', {
      body: { token: verifyToken }
    });

    expect(res.status).toBe(200);
    expect(res.body.emailVerified).toBe(true);

    // Verify /me reflects emailVerified
    const meRes = await makeRequest('GET', '/api/v1/auth/me');

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email_verified).toBe(true);
    const verifiedStep = meRes.body.onboardingChecklist.find((s: any) => s.step_key === 'verify_email');
    expect(verifiedStep?.is_completed).toBe(true);
  });

  it('T-046: requests password reset and updates password securely with session invalidation', async () => {
    const forgotRes = await makeRequest('POST', '/api/v1/auth/forgot-password', {
      body: { email: testEmail }
    });

    expect(forgotRes.status).toBe(200);
    const resetToken = forgotRes.body.resetTokenPreview;
    expect(resetToken).toBeDefined();

    const newPassword = 'NewSecretPassword123!';
    const resetRes = await makeRequest('POST', '/api/v1/auth/reset-password', {
      body: { token: resetToken, newPassword }
    });

    expect(resetRes.status).toBe(200);
    expect(resetRes.body.message).toContain('Password has been reset successfully');

    // Confirm login with new password succeeds
    const loginRes = await makeRequest('POST', '/api/v1/auth/login', {
      body: { email: testEmail, password: newPassword }
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body).toHaveProperty('token');
    authToken = loginRes.body.token;
  });

  it('T-046: enrolls and verifies multi-factor authentication (MFA / TOTP)', async () => {
    const enrollRes = await makeRequest('POST', '/api/v1/auth/mfa/enroll');

    expect(enrollRes.status).toBe(200);
    expect(enrollRes.body).toHaveProperty('secret');
    expect(enrollRes.body).toHaveProperty('otpauthUrl');
    expect(enrollRes.body.recoveryCodes).toBeInstanceOf(Array);

    const verifyRes = await makeRequest('POST', '/api/v1/auth/mfa/verify', {
      body: { code: '123456' }
    });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.mfaEnabled).toBe(true);
  });

  it('T-046: logs in via Google OIDC with PKCE metadata', async () => {
    const googleEmail = `google_${Date.now()}@example.com`;
    const res = await makeRequest('POST', '/api/v1/auth/google', {
      body: {
        googleId: `gid-${Date.now()}`,
        email: googleEmail,
        fullName: 'Google User Test',
        codeVerifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
      }
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.portalDestination.portal).toBe('MERCHANT_ADMIN');
    expect(res.body.user.emailVerified).toBe(true);
  });

  it('T-047: routes roles to their respective operational portals', async () => {
    // 1. Owner portal route
    const ownerRes = await makeRequest('GET', '/api/v1/auth/portal-route');

    expect(ownerRes.status).toBe(200);
    expect(ownerRes.body.destination.portal).toBe('MERCHANT_ADMIN');
    expect(ownerRes.body.destination.url).toBe('https://admin.chandraprakash.codes');

    // 2. Cashier PIN login portal route
    const cashierRes = await makeRequest('POST', '/api/v1/auth/pin-login', {
      body: { counterId: 'cnt-shoum-01', pin: '1234' }
    });

    expect(cashierRes.status).toBe(200);
    expect(cashierRes.body.portalDestination.portal).toBe('POS');
    expect(cashierRes.body.portalDestination.url).toBe('https://pos.chandraprakash.codes');
  });

  it('T-054: only platform administrators can trigger the global outbox worker', async () => {
    const merchantToken = authToken;

    // A store owner cannot trigger a worker that processes every tenant's events.
    const merchantProcessRes = await makeRequest('POST', '/api/v1/notifications/process-outbox');
    expect(merchantProcessRes.status).toBe(403);

    const adminLogin = await makeRequest('POST', '/api/v1/auth/login', {
      body: { email: 'admin@billionbiz.com', password: 'Admin@123' }
    });
    expect(adminLogin.status).toBe(200);
    expect(adminLogin.body.token).toBeDefined();

    const processRes = await makeRequest('POST', '/api/v1/notifications/process-outbox', {
      headers: { authorization: `Bearer ${adminLogin.body.token}` }
    });
    expect(processRes.status).toBe(200);
    expect(processRes.body.processed).toBeGreaterThanOrEqual(1);

    // Restore the merchant context and verify its own inbox.
    authToken = merchantToken;
    const inboxRes = await makeRequest('GET', '/api/v1/notifications/inbox');
    expect(inboxRes.status).toBe(200);
    expect(inboxRes.body).toHaveProperty('notifications');
    expect(inboxRes.body.notifications.length).toBeGreaterThanOrEqual(1);
  });

  it('REQ-OPS-003: provides liveness and readiness health checks', async () => {
    const liveRes = await makeRequest('GET', '/health/live');
    expect(liveRes.status).toBe(200);
    expect(liveRes.body.status).toBe('LIVE');

    const readyRes = await makeRequest('GET', '/health/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.status).toBe('READY');
    expect(readyRes.body.database).toBe('CONNECTED');
  });
});

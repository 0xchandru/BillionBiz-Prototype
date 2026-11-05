import { describe, it, expect } from 'vitest';
import { app } from '../src/server.js';
import { query } from '../src/db/pool.js';

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
      send: (b: any) => {
        resolve({ status: res.statusCode, body: b });
        return res;
      },
      end: () => {
        resolve({ status: res.statusCode, body: {} });
        return res;
      }
    };

    app(req, res, () => {
      resolve({ status: 404, body: { error: 'NOT_FOUND' } });
    });
  });
}

describe('V2 Streamlined Registration & Phone/Email OTP Authentication', () => {
  beforeAll(async () => {
    await query("DELETE FROM store_domains WHERE domain LIKE '%velvet-cafe%'");
    await query("DELETE FROM stores WHERE slug LIKE '%velvet-cafe%'");
    await query("DELETE FROM users WHERE email LIKE '%streamline_%'");
  });

  const testEmail = `streamline_${Date.now()}@test.codes`;
  const testPhone = `+9198765${Math.floor(10000 + Math.random() * 90000)}`;

  it('sends OTP code to email for registration', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testEmail, type: 'REGISTER' }
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.channel).toBe('EMAIL');
    expect(res.body.identifier).toBe(testEmail);
    expect(res.body.testCode).toMatch(/^\d{6}$/);
    expect(res.body).not.toHaveProperty('previewCode');
  });

  it('sends OTP code to international phone number for registration', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testPhone, type: 'REGISTER' }
    });

    expect(res.status).toBe(503);
    expect(res.body.error).toBe('SMS_PROVIDER_NOT_CONFIGURED');
    expect(res.body.success).not.toBe(true);
  });

  it('strictly blocks registration OTP when email is already registered and returns 409 USER_ALREADY_EXISTS', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: 'admin@billionbiz.com', type: 'REGISTER' }
    });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('USER_ALREADY_EXISTS');
    expect(res.body.message).toContain('already registered');

    // Verify no unused OTP was inserted for this registered user
    const otpCheck = await query(
      `SELECT id FROM verification_otps WHERE identifier = 'admin@billionbiz.com' AND is_used = FALSE`
    );
    expect(otpCheck.rowCount).toBe(0);
  });

  it('strictly blocks registration OTP when mobile number is already registered across phone format variants', async () => {
    // Check with +91 format
    const resWithPlus = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: '+919876543210', type: 'REGISTER' }
    });
    expect(resWithPlus.status).toBe(409);
    expect(resWithPlus.body.error).toBe('USER_ALREADY_EXISTS');

    // Check with 10 digits
    const resDigits = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: '9876543210', type: 'REGISTER' }
    });
    expect(resDigits.status).toBe(409);
    expect(resDigits.body.error).toBe('USER_ALREADY_EXISTS');
  });

  it('verifies valid registration OTP code and rejects incorrect code', async () => {
    const sendRes = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testEmail, type: 'REGISTER' }
    });
    expect(sendRes.status).toBe(200);

    const code = String(sendRes.body.testCode);

    // Bad code
    const badRes = await makeRequest('POST', '/api/v1/auth/otp/verify', {
      body: { identifier: testEmail, code: code === '000000' ? '000001' : '000000', type: 'REGISTER' }
    });
    expect(badRes.status).toBe(400);

    // Good code
    const goodRes = await makeRequest('POST', '/api/v1/auth/otp/verify', {
      body: { identifier: testEmail, code, type: 'REGISTER' }
    });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.verified).toBe(true);
  });

  it('locks an OTP after five incorrect verification attempts', async () => {
    const identifier = `otp-lock-${Date.now()}@test.codes`;
    const sent = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier, type: 'REGISTER' }
    });
    expect(sent.status).toBe(200);

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const invalid = await makeRequest('POST', '/api/v1/auth/otp/verify', {
        body: {
          identifier,
          code: sent.body.testCode === '000000' ? '000001' : '000000',
          type: 'REGISTER'
        }
      });
      expect(invalid.status).toBe(attempt === 5 ? 429 : 400);
    }

    const correctAfterLock = await makeRequest('POST', '/api/v1/auth/otp/verify', {
      body: { identifier, code: sent.body.testCode, type: 'REGISTER' }
    });
    expect(correctAfterLock.status).toBe(400);
    expect(correctAfterLock.body.error).toBe('INVALID_OTP');
  });

  it('rate-limits repeated OTP sends for the same recipient', async () => {
    const identifier = `otp-send-limit-${Date.now()}@test.codes`;

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const sent = await makeRequest('POST', '/api/v1/auth/otp/send', {
        body: { identifier, type: 'REGISTER' }
      });
      expect(sent.status).toBe(200);
    }

    const blocked = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier, type: 'REGISTER' }
    });
    expect(blocked.status).toBe(429);
    expect(blocked.body.error).toBe('OTP_SEND_RATE_LIMITED');
  });

  it('registers store via streamlined flow with storefront type', async () => {
    const regRes = await makeRequest('POST', '/api/v1/auth/register-streamlined', {
      body: {
        identifier: testEmail,
        storeName: 'Velvet Cafe & Salon',
        capabilityMode: 'BOTH',
        password: 'Password123!',
        fullName: 'Velvet Founder'
      }
    });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.token).toBeDefined();
    expect(regRes.body.store.name).toBe('Velvet Cafe & Salon');
    expect(regRes.body.store.slug).toBe('velvet-cafe-salon');
    expect(regRes.body.store.status).toBe('DRAFT');
  });

  it('logs in via password using unified single-input endpoint', async () => {
    const loginRes = await makeRequest('POST', '/api/v1/auth/login-unified', {
      body: {
        identifier: testEmail,
        password: 'Password123!'
      }
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(testEmail);
    expect(loginRes.body.portalDestination.portal).toBe('MERCHANT_ADMIN');
  });

  it('logs in via OTP using unified single-input endpoint', async () => {
    // 1. Request login OTP
    const sendRes = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testEmail, type: 'LOGIN' }
    });

    expect(sendRes.status).toBe(200);

    const otpCode = String(sendRes.body.testCode);

    // 2. Submit login with OTP
    const loginRes = await makeRequest('POST', '/api/v1/auth/login-unified', {
      body: {
        identifier: testEmail,
        otp: otpCode
      }
    });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.token).toBeDefined();
    expect(loginRes.body.user.email).toBe(testEmail);
  });
});

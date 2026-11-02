import { describe, it, expect } from 'vitest';
import { app } from '../src/server.js';

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
    expect(res.body.devOtpPreview).toBeDefined();
  });

  it('sends OTP code to international phone number for registration', async () => {
    const res = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testPhone, type: 'REGISTER' }
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.channel).toBe('SMS');
    expect(res.body.identifier).toBe(testPhone);
    expect(res.body.devOtpPreview).toBeDefined();
  });

  it('verifies valid registration OTP code and rejects incorrect code', async () => {
    const sendRes = await makeRequest('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testEmail, type: 'REGISTER' }
    });

    const code = sendRes.body.devOtpPreview;

    // Bad code
    const badRes = await makeRequest('POST', '/api/v1/auth/otp/verify', {
      body: { identifier: testEmail, code: '000000', type: 'REGISTER' }
    });
    expect(badRes.status).toBe(400);

    // Good code
    const goodRes = await makeRequest('POST', '/api/v1/auth/otp/verify', {
      body: { identifier: testEmail, code, type: 'REGISTER' }
    });
    expect(goodRes.status).toBe(200);
    expect(goodRes.body.verified).toBe(true);
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
    const otpCode = sendRes.body.devOtpPreview;

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

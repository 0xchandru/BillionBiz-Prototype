import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/server.js';
import { query } from '../src/db/pool.js';
import { encryptCredentials, decryptCredentials } from '../src/core/crypto.js';

function makeRequest(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: {
    body?: any;
    token?: string;
    orgId?: string;
    storeId?: string;
  } = {}
) {
  return new Promise<{ status: number; body: any }>((resolve) => {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...(options.orgId ? { 'x-organization-id': options.orgId } : {}),
      ...(options.storeId ? { 'x-store-id': options.storeId } : {}),
      ...(options.token ? { authorization: `Bearer ${options.token}` } : {})
    };

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

describe('V2.3 Merchant Provider Connections & Envelope Encryption (P0)', () => {
  let merchantTokenA: string;
  let storeIdA: string;
  let orgIdA: string;

  let merchantTokenB: string;
  let storeIdB: string;
  let orgIdB: string;

  beforeAll(async () => {
    const ts = Date.now();
    // Register Merchant A
    const resA = await makeRequest('POST', '/api/v1/auth/register', {
      body: {
        email: `merchant_enc_a_${ts}@test.codes`,
        password: 'Password@123',
        fullName: 'Merchant Alpha',
        storeName: `Alpha Store ${ts}`
      }
    });
    merchantTokenA = resA.body.token;
    storeIdA = resA.body.store.id;
    orgIdA = resA.body.organization.id;

    // Register Merchant B (Isolated tenant)
    const resB = await makeRequest('POST', '/api/v1/auth/register', {
      body: {
        email: `merchant_enc_b_${ts}@test.codes`,
        password: 'Password@123',
        fullName: 'Merchant Beta',
        storeName: `Beta Store ${ts}`
      }
    });
    merchantTokenB = resB.body.token;
    storeIdB = resB.body.store.id;
    orgIdB = resB.body.organization.id;
  });

  it('SEC-025: Unit test - AES-256-GCM authenticated envelope encryption with tenant AAD', () => {
    const rawSecret = { keyId: 'rzp_test_secret12345', keySecret: 'very_sensitive_key_abcdef' };
    const contextA = { organizationId: orgIdA, storeId: storeIdA, providerKey: 'razorpay', environment: 'TEST' as const };

    const envelope = encryptCredentials(rawSecret, contextA);
    expect(envelope.ciphertext).toBeDefined();
    expect(envelope.ciphertext).not.toContain('very_sensitive_key_abcdef');
    expect(envelope.iv).toHaveLength(24); // 12 bytes in hex
    expect(envelope.tag).toHaveLength(32); // 16 bytes in hex

    // Decrypt with correct context succeeds
    const decrypted = decryptCredentials(envelope, contextA);
    expect(decrypted.keyId).toBe(rawSecret.keyId);
    expect(decrypted.keySecret).toBe(rawSecret.keySecret);

    // Tampering with storeId (Tenant Swapping Attack) fails AAD verification
    const contextAttacker = { organizationId: orgIdB, storeId: storeIdB, providerKey: 'razorpay', environment: 'TEST' as const };
    expect(() => decryptCredentials(envelope, contextAttacker)).toThrow();

    // Tampering with environment (TEST vs LIVE swapping) fails AAD verification
    const contextLive = { organizationId: orgIdA, storeId: storeIdA, providerKey: 'razorpay', environment: 'LIVE' as const };
    expect(() => decryptCredentials(envelope, contextLive)).toThrow();
  });

  it('T-022 / V23-T004: Merchant saves encrypted Razorpay credentials and database stores ciphertext only', async () => {
    const saveRes = await makeRequest('POST', '/api/v1/extensions/connections', {
      token: merchantTokenA,
      orgId: orgIdA,
      storeId: storeIdA,
      body: {
        providerKey: 'razorpay',
        environment: 'TEST',
        credentials: {
          keyId: 'rzp_test_merchant_alpha_99',
          keySecret: 'sec_alpha_super_secret_99999',
          webhookSecret: 'whsec_alpha_webhook_secret'
        }
      }
    });

    expect(saveRes.status).toBe(200);
    expect(saveRes.body.status).toBe('ACTIVE');
    expect(saveRes.body.accountIdentifier).toBe('rzp_••••••••a_99');

    // Inspect database directly to ensure no plaintext was written
    const dbRecord = await query(
      `SELECT * FROM integration_connections WHERE store_id = $1 AND provider_key = 'razorpay'`,
      [storeIdA]
    );

    expect(dbRecord.rowCount).toBe(1);
    const row = dbRecord.rows[0];
    expect(row.ciphertext).toBeDefined();
    expect(row.ciphertext).not.toContain('sec_alpha_super_secret_99999');
    expect(row.tag).toBeDefined();
    expect(row.iv).toBeDefined();
  });

  it('V23-T004: GET /connections returns masked metadata and never returns plaintext secret', async () => {
    const listRes = await makeRequest('GET', '/api/v1/extensions/connections', {
      token: merchantTokenA,
      orgId: orgIdA,
      storeId: storeIdA
    });

    expect(listRes.status).toBe(200);
    expect(listRes.body.connections).toHaveLength(1);
    const conn = listRes.body.connections[0];

    expect(conn.provider_key).toBe('razorpay');
    expect(conn.environment).toBe('TEST');
    expect(conn.status).toBe('ACTIVE');
    expect(conn.account_identifier).toBe('rzp_••••••••a_99');
    expect(conn.ciphertext).toBeUndefined();
    expect(conn.keySecret).toBeUndefined();
    expect(JSON.stringify(listRes.body)).not.toContain('sec_alpha_super_secret_99999');
  });

  it('SEC-001: Cross-Tenant Isolation - Merchant B cannot see or access Merchant A connection', async () => {
    const listResB = await makeRequest('GET', '/api/v1/extensions/connections', {
      token: merchantTokenB,
      orgId: orgIdB,
      storeId: storeIdB
    });

    expect(listResB.status).toBe(200);
    // Merchant B has not connected any provider yet
    expect(listResB.body.connections).toHaveLength(0);
  });

  it('V23-T005: Merchant can test active connection and test succeeds with valid vault credentials', async () => {
    const testRes = await makeRequest('POST', '/api/v1/extensions/connections/razorpay/test', {
      token: merchantTokenA,
      orgId: orgIdA,
      storeId: storeIdA,
      body: { environment: 'TEST' }
    });

    expect(testRes.status).toBe(200);
    expect(testRes.body.success).toBe(true);
    expect(testRes.body.accountIdentifier).toBe('rzp_••••••••a_99');
  });

  it('T-022: Order creation uses merchant decrypted keyId from vault', async () => {
    const orderRes = await makeRequest('POST', '/api/v1/extensions/razorpay/create-order', {
      token: merchantTokenA,
      orgId: orgIdA,
      storeId: storeIdA,
      body: {
        amountMinor: 250000,
        currency: 'INR',
        purpose: 'ORDER'
      }
    });

    expect(orderRes.status).toBe(201);
    expect(orderRes.body.razorpayOrderId).toBeDefined();
    // Key ID returned to client should be the merchant's decrypted keyId
    expect(orderRes.body.keyId).toBe('rzp_test_merchant_alpha_99');
  });
});

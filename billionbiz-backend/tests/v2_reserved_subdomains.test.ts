import { describe, it, expect } from 'vitest';
import { app } from '../src/server.js';
import { query } from '../src/db/pool.js';
import {
  validateSubdomainSlug,
  isReservedSubdomain,
  RESERVED_SUBDOMAINS,
  PLATFORM_MAIN_DOMAIN
} from '../src/core/subdomains.js';

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

describe('Reserved Subdomains & DNS Validation Specification Tests', () => {
  describe('1. Pure Subdomain Validation Unit Tests (Section 6 Test Matrix)', () => {
    it('chandru1 -> Allowed (200, valid)', () => {
      const res = validateSubdomainSlug('chandru1');
      expect(res.isValid).toBe(true);
      expect(res.normalizedSlug).toBe('chandru1');
    });

    it('Chandru1 -> Allowed (normalized to chandru1)', () => {
      const res = validateSubdomainSlug('Chandru1');
      expect(res.isValid).toBe(true);
      expect(res.normalizedSlug).toBe('chandru1');
    });

    it('admin -> Rejected (Reserved platform subdomain)', () => {
      const res = validateSubdomainSlug('admin');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('SUBDOMAIN_RESERVED');
      expect(res.error).toBe('This subdomain is reserved by BillionBiz. Please choose another store name.');
    });

    it('ADMIN -> Rejected (Case-insensitive reserved)', () => {
      const res = validateSubdomainSlug('ADMIN');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('SUBDOMAIN_RESERVED');
    });

    it('accounts -> Rejected (Reserved platform subdomain)', () => {
      const res = validateSubdomainSlug('accounts');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('SUBDOMAIN_RESERVED');
    });

    it('api -> Rejected (Reserved platform subdomain)', () => {
      const res = validateSubdomainSlug('api');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('SUBDOMAIN_RESERVED');
    });

    it('support -> Rejected (Reserved platform service)', () => {
      const res = validateSubdomainSlug('support');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('SUBDOMAIN_RESERVED');
    });

    it('my-store -> Allowed (Hyphen allowed in middle)', () => {
      const res = validateSubdomainSlug('my-store');
      expect(res.isValid).toBe(true);
      expect(res.normalizedSlug).toBe('my-store');
    });

    it('-my-store -> Rejected (Leading hyphen)', () => {
      const res = validateSubdomainSlug('-my-store');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('INVALID_FORMAT');
      expect(res.error).toBe('Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.');
    });

    it('my-store- -> Rejected (Trailing hyphen)', () => {
      const res = validateSubdomainSlug('my-store-');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('INVALID_FORMAT');
    });

    it('my_store -> Rejected (Underscores)', () => {
      const res = validateSubdomainSlug('my_store');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('INVALID_FORMAT');
    });

    it('my.store -> Rejected (Dots / Multi-level)', () => {
      const res = validateSubdomainSlug('my.store');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('INVALID_FORMAT');
    });

    it('my store -> Rejected (Spaces)', () => {
      const res = validateSubdomainSlug('my store');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('INVALID_FORMAT');
    });

    it('empty -> Rejected (Empty value)', () => {
      const res = validateSubdomainSlug('');
      expect(res.isValid).toBe(false);
      expect(res.errorCode).toBe('EMPTY_SLUG');
    });

    it('contains all required reserved subdomains in catalog', () => {
      const required = [
        'www', 'admin', 'accounts', 'account', 'staff', 'pos', 'ops', 'api',
        'auth', 'login', 'logout', 'register', 'signup', 'signin', 'profile',
        'dashboard', 'users', 'user', 'oauth', 'callback', 'sso',
        'app', 'platform', 'system', 'root', 'security', 'support', 'help',
        'docs', 'documentation', 'status', 'blog', 'news', 'marketing',
        'pricing', 'billing', 'subscription', 'subscriptions', 'payment',
        'payments', 'checkout', 'cart', 'order', 'orders', 'invoice',
        'invoices', 'webhook', 'webhooks', 'notification', 'notifications',
        'mail', 'email', 'smtp', 'imap', 'pop', 'ftp', 'sftp', 'cdn',
        'static', 'assets', 'media', 'files', 'upload', 'uploads', 'storage',
        'cache', 'images', 'fonts', 'js', 'css', 'api-docs', 'graphql',
        'ws', 'socket', 'dev', 'development', 'test', 'testing', 'staging',
        'stage', 'beta', 'demo', 'preview', 'sandbox', 'internal',
        'monitoring', 'analytics', 'logs', 'metrics'
      ];

      for (const item of required) {
        expect(isReservedSubdomain(item)).toBe(true);
      }
    });
  });

  describe('2. HTTP API: GET /api/v1/auth/check-domain', () => {
    const validSlug = `testshop-${Date.now().toString().slice(-6)}`;

    it('returns 200 for available valid slug', async () => {
      const res = await makeRequest('GET', `/api/v1/auth/check-domain?slug=${validSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.available).toBe(true);
      expect(res.body.slug).toBe(validSlug);
      expect(res.body.fullDomain).toBe(`${validSlug}.${PLATFORM_MAIN_DOMAIN}`);
    });

    it('normalizes uppercase letters (Chandru1 -> chandru1)', async () => {
      const upperSlug = `Shop${Date.now().toString().slice(-6)}`;
      const res = await makeRequest('GET', `/api/v1/auth/check-domain?slug=${upperSlug}`);
      expect(res.status).toBe(200);
      expect(res.body.slug).toBe(upperSlug.toLowerCase());
    });

    it('returns 400 for reserved subdomain admin', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=admin');
      expect(res.status).toBe(400);
      expect(res.body.available).toBe(false);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
      expect(res.body.message).toBe('This subdomain is reserved by BillionBiz. Please choose another store name.');
    });

    it('returns 400 for reserved subdomain ADMIN (case-insensitive)', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=ADMIN');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
    });

    it('returns 400 for reserved subdomain accounts', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=accounts');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
    });

    it.each(['staff', 'pos', 'help'])('rejects the reserved platform subdomain %s', (reservedSlug) => {
      const result = validateSubdomainSlug(reservedSlug);
      expect(result.isValid).toBe(false);
      expect(result.errorCode).toBe('SUBDOMAIN_RESERVED');
    });

    it('returns 400 for reserved subdomain api', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=api');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
    });

    it.each(['staff', 'pos', 'help'])('returns 400 for reserved subdomain %s', async (reservedSlug) => {
      const res = await makeRequest('GET', `/api/v1/auth/check-domain?slug=${reservedSlug}`);
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
    });

    it('returns 400 for reserved subdomain support', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=support');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('SUBDOMAIN_RESERVED');
    });

    it('returns 400 for invalid format with leading hyphen', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=-my-store');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_FORMAT');
      expect(res.body.message).toBe('Subdomain must contain only lowercase letters, numbers, and hyphens, and cannot start or end with a hyphen.');
    });

    it('returns 400 for invalid format with trailing hyphen', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=my-store-');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_FORMAT');
    });

    it('returns 400 for invalid format with underscore', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=my_store');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_FORMAT');
    });

    it('returns 400 for invalid format with dot', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=my.store');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_FORMAT');
    });

    it('returns 400 for invalid format with space', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=my%20store');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('INVALID_FORMAT');
    });

    it('returns 400 for empty slug', async () => {
      const res = await makeRequest('GET', '/api/v1/auth/check-domain?slug=');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('EMPTY_SLUG');
    });
  });

  describe('3. Registration & Store Provisioning Enforcement', () => {
    const uniqueId = Date.now().toString().slice(-6);
    const existingSlug = `taken-store-${uniqueId}`;
    let registeredStoreToken = '';

    it('successfully provisions a store with a valid non-reserved slug', async () => {
      const regRes = await makeRequest('POST', '/api/v1/auth/register-streamlined', {
        body: {
          identifier: `subdomain_test_${uniqueId}@test.codes`,
          storeName: `Unique Store ${uniqueId}`,
          slug: existingSlug,
          password: 'Password123!'
        }
      });

      expect(regRes.status).toBe(201);
      registeredStoreToken = regRes.body.token;
      expect(registeredStoreToken).toBeTruthy();
    });

    it('returns 409 SUBDOMAIN_TAKEN when checking an existing store slug', async () => {
      const checkRes = await makeRequest('GET', `/api/v1/auth/check-domain?slug=${existingSlug}`);
      expect(checkRes.status).toBe(409);
      expect(checkRes.body.available).toBe(false);
      expect(checkRes.body.error).toBe('SUBDOMAIN_TAKEN');
      expect(checkRes.body.message).toBe('This store subdomain is already taken. Please try another one.');
    });

    it('rejects registration with a reserved subdomain (400 SUBDOMAIN_RESERVED)', async () => {
      const regRes = await makeRequest('POST', '/api/v1/auth/register-streamlined', {
        body: {
          identifier: `reserved_test_${Date.now()}@test.codes`,
          storeName: 'Admin Store',
          slug: 'admin',
          password: 'Password123!'
        }
      });

      expect(regRes.status).toBe(400);
      expect(regRes.body.error).toBe('SUBDOMAIN_RESERVED');
      expect(regRes.body.message).toBe('This subdomain is reserved by BillionBiz. Please choose another store name.');
    });

    it('rejects registration with invalid formatting (400 INVALID_FORMAT)', async () => {
      const regRes = await makeRequest('POST', '/api/v1/auth/register-streamlined', {
        body: {
          identifier: `invalid_test_${Date.now()}@test.codes`,
          storeName: 'Bad Slug Store',
          slug: '-bad-slug',
          password: 'Password123!'
        }
      });

      expect(regRes.status).toBe(400);
      expect(regRes.body.error).toBe('INVALID_FORMAT');
    });

    it('rejects registration when slug is already taken (409 SUBDOMAIN_TAKEN)', async () => {
      const regRes = await makeRequest('POST', '/api/v1/auth/register-streamlined', {
        body: {
          identifier: `duplicate_test_${Date.now()}@test.codes`,
          storeName: 'Another Store',
          slug: existingSlug,
          password: 'Password123!'
        }
      });

      expect(regRes.status).toBe(409);
      expect(regRes.body.error).toBe('SUBDOMAIN_TAKEN');
    });

    it('enforces database-level uniqueness under concurrent registration (race condition prevention)', async () => {
      const raceSlug = `race-store-${Date.now().toString().slice(-6)}`;

      const [res1, res2] = await Promise.all([
        makeRequest('POST', '/api/v1/auth/register-streamlined', {
          body: {
            identifier: `race1_${Date.now()}@test.codes`,
            storeName: `Race Store 1`,
            slug: raceSlug,
            password: 'Password123!'
          }
        }),
        makeRequest('POST', '/api/v1/auth/register-streamlined', {
          body: {
            identifier: `race2_${Date.now()}@test.codes`,
            storeName: `Race Store 2`,
            slug: raceSlug,
            password: 'Password123!'
          }
        })
      ]);

      const statuses = [res1.status, res2.status].sort();
      // Exactly one must succeed (200) and the other must fail with 409 SUBDOMAIN_TAKEN
      expect(statuses).toEqual([201, 409]);
      const failed = res1.status === 409 ? res1 : res2;
      expect(failed.body.error).toBe('SUBDOMAIN_TAKEN');
    });
  });

  describe('4. Platform Protection & Host Resolution Middleware', () => {
    it('returns 404 STORE_NOT_FOUND for an unregistered store host after authentication', async () => {
      const res = await makeRequest('GET', '/api/v1/storefront/render', {
        headers: {
          host: 'completely-unregistered-store-xyz.chandraprakash.codes',
          authorization: `Bearer ${registeredStoreToken}`
        }
      });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('STORE_NOT_FOUND');
    });

    it('resolves a verified single-level merchant host to its registered tenant', async () => {
      const storeRes = await query(
        `SELECT id, slug FROM stores WHERE LOWER(slug) = LOWER($1) AND status = 'ACTIVE' LIMIT 1`,
        [existingSlug]
      );
      expect(storeRes.rowCount).toBe(1);
      const slug = storeRes.rows[0].slug;
      const domainRes = await query(
        `SELECT 1 FROM store_domains WHERE store_id = $1 AND LOWER(domain) = LOWER($2) AND is_verified = TRUE AND ssl_status = 'ACTIVE' LIMIT 1`,
        [storeRes.rows[0].id, `${slug}.${PLATFORM_MAIN_DOMAIN}`]
      );
      expect(domainRes.rowCount).toBe(1);

      const res = await makeRequest('GET', '/api/v1/storefront/render', {
        headers: {
          host: `${slug}.${PLATFORM_MAIN_DOMAIN}`,
          authorization: `Bearer ${registeredStoreToken}`
        }
      });

      expect(res.status).toBe(200);
      expect(res.body.store.slug).toBe(slug);
    });
  });
});

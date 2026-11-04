import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/server.js';
import { query } from '../src/db/pool.js';
import { generateToken } from '../src/middleware/auth.js';

async function request(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
    token?: string;
  } = {}
) {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...options.headers
  };

  if (options.token) {
    headers['authorization'] = `Bearer ${options.token}`;
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
      },
      on: () => res
    };

    app(req, res, (err: any) => {
      if (err) {
        resolve({ status: 500, body: { error: err.message } });
      } else {
        resolve({ status: 404, body: { error: 'Not Found' } });
      }
    });
  });
}

describe('Online Store Rebuild — Phase 1 Backend API Test Suite', () => {
  let storeId: string;
  let orgId: string;
  let token: string;
  let homePageId: string;

  beforeAll(async () => {
    const timestamp = Date.now();
    orgId = `org-phase1-${timestamp}`;
    storeId = `store-phase1-${timestamp}`;
    const userId = `usr-phase1-${timestamp}`;
    const slug = `phase1-store-${timestamp}`;
    homePageId = `p1-home-${timestamp}`;

    await query(
      `INSERT INTO organizations (id, name, slug) VALUES ($1, 'Phase 1 Org', $2)`,
      [orgId, `org-slug-${timestamp}`]
    );

    await query(
      `INSERT INTO stores (id, organization_id, name, slug, status) VALUES ($1, $2, 'Phase 1 Boutique', $3, 'ACTIVE')`,
      [storeId, orgId, slug]
    );

    await query(
      `INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, 'hash', 'Phase 1 Merchant')`,
      [userId, `p1_${timestamp}@test.codes`]
    );

    await query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES ($1, $2, $3, 'OWNER')`,
      [`mem-p1-${timestamp}`, orgId, userId]
    );

    token = generateToken({
      userId,
      organizationId: orgId,
      storeId,
      role: 'OWNER',
      permissions: ['store.editor.edit', 'store.publish']
    });
  });

  it('1. GET /api/v1/storefront/pages returns pages with system locked status', async () => {
    // Seed one system page and one custom page
    await query(
      `INSERT INTO store_pages (id, store_id, name, path, type, category, is_system, is_locked, template_key)
       VALUES ($1, $2, 'Home', '/', 'standard', 'storefront', TRUE, TRUE, 'home')
       ON CONFLICT (id) DO NOTHING`,
      [homePageId, storeId]
    );

    const res = await request('GET', '/api/v1/storefront/pages', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.pages)).toBe(true);
    const home = res.body.pages.find((p: any) => p.path === '/');
    expect(home).toBeDefined();
    expect(home.is_system).toBe(true);
    expect(home.is_locked).toBe(true);
  });

  it('2. POST /api/v1/storefront/pages rejects reserved system routes', async () => {
    const res = await request('POST', '/api/v1/storefront/pages', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId },
      body: {
        title: 'Collision Shop',
        path: '/shop'
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('RESERVED_SYSTEM_PATH');
  });

  it('3. POST /api/v1/storefront/pages allows creating a custom page', async () => {
    const res = await request('POST', '/api/v1/storefront/pages', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId },
      body: {
        title: 'Our Story',
        path: '/our-story',
        templateKey: 'minimal'
      }
    });

    expect(res.status).toBe(201);
    expect(res.body.path).toBe('/our-story');
  });

  it('4. PATCH /api/v1/storefront/pages/:id forbids changing path of locked system pages', async () => {
    const res = await request('PATCH', `/api/v1/storefront/pages/${homePageId}`, {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId },
      body: {
        path: '/new-home'
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('LOCKED_PAGE_ROUTE_IMMUTABLE');
  });

  it('5. DELETE /api/v1/storefront/pages/:id rejects deleting system locked pages', async () => {
    const res = await request('DELETE', `/api/v1/storefront/pages/${homePageId}`, {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('CANNOT_DELETE_SYSTEM_PAGE');
  });

  it('6. GET and PATCH /api/v1/storefront/brand manages display brand identity without duplicating admin legal profile', async () => {
    const patchRes = await request('PATCH', '/api/v1/storefront/brand', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId },
      body: {
        brandName: 'Artisan Atelier',
        tagline: 'Handmade luxury bespoke items',
        socialLinks: { instagram: 'https://instagram.com/artisanatelier' }
      }
    });
    expect(patchRes.status).toBe(200);
    expect(patchRes.body.brand.name).toBe('Artisan Atelier');
    expect(patchRes.body.brand.tagline).toBe('Handmade luxury bespoke items');

    const getRes = await request('GET', '/api/v1/storefront/brand', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });
    expect(getRes.status).toBe(200);
    expect(getRes.body.brand.name).toBe('Artisan Atelier');
  });

  it('7. Domain management: add, verify, primary, and delete custom domain', async () => {
    const addRes = await request('POST', '/api/v1/storefront/domains', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId },
      body: { domain: `shop.phase1test-${Date.now()}.com` }
    });
    expect(addRes.status).toBe(201);
    const domainId = addRes.body.domain.id;

    // Verify domain
    const verifyRes = await request('POST', `/api/v1/storefront/domains/${domainId}/verify`, {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.isVerified).toBe(true);

    // Set primary
    const primaryRes = await request('POST', `/api/v1/storefront/domains/${domainId}/primary`, {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });
    expect(primaryRes.status).toBe(200);

    // Delete custom domain after unsetting primary
    await query(`UPDATE store_domains SET is_primary = FALSE WHERE id = $1`, [domainId]);
    const delRes = await request('DELETE', `/api/v1/storefront/domains/${domainId}`, {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });
    expect(delRes.status).toBe(200);
  });

  it('8. GET /api/v1/storefront/validate-publish runs pre-flight health validation', async () => {
    const res = await request('GET', '/api/v1/storefront/validate-publish', {
      token,
      headers: { 'x-organization-id': orgId, 'x-store-id': storeId }
    });
    expect(res.status).toBe(200);
    expect(typeof res.body.canPublish).toBe('boolean');
    expect(Array.isArray(res.body.issues)).toBe(true);
  });
});


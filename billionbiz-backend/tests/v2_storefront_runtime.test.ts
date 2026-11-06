import { describe, it, expect, beforeAll } from 'vitest';
import { app } from '../src/server.js';
import { query } from '../src/db/pool.js';
import { generateToken } from '../src/middleware/auth.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

async function request(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS',
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

  return new Promise<{ status: number; body: any; headers: Record<string, string> }>((resolve) => {
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
      vary: (k: string) => { res._headers.vary = k; },
      status: (c: number) => { res.statusCode = c; return res; },
      json: (b: any) => {
        resolve({ status: res.statusCode, body: b, headers: res._headers });
        return res;
      },
      end: () => {
        resolve({ status: res.statusCode, body: {}, headers: res._headers });
        return res;
      },
      on: () => res
    };

    app(req, res, (err: any) => {
      if (err) {
        resolve({ status: 500, body: { error: err.message }, headers: res._headers });
      } else {
        resolve({ status: 404, body: { error: 'Not Found' }, headers: res._headers });
      }
    });
  });
}

describe('CORS preflight policy', () => {
  it('allows the configured storefront origin, varies by origin, and rejects unlisted origins', async () => {
    const allowed = await request('OPTIONS', '/api/v1/auth/otp/send', { headers: {
      origin: 'https://www.chandraprakash.codes',
      'access-control-request-method': 'POST',
      'access-control-request-headers': 'content-type,ngrok-skip-browser-warning'
    } });
    expect(allowed.status).toBe(204);
    expect(allowed.headers['access-control-allow-origin']).toBe('https://www.chandraprakash.codes');
    expect(allowed.headers['access-control-allow-credentials']).toBe('true');
    expect(allowed.headers.vary).toContain('Origin');

    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const denied = await request('OPTIONS', '/api/v1/auth/otp/send', { headers: {
        origin: 'https://not-allowed.invalid',
        'access-control-request-method': 'POST'
      } });
      expect(denied.status).toBe(204);
      expect(denied.headers['access-control-allow-origin']).toBeUndefined();
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
  });
});

describe('V2 Native Storefront Runtime & Multi-Tenant Isolation Suite (REQ-STOREFRONT-001)', () => {
  let storeAId: string;
  let storeASlug: string;
  let storeAToken: string;
  let storeAOrgId: string;

  let storeBId: string;
  let storeBSlug: string;
  let storeBToken: string;
  let storeBOrgId: string;

  beforeAll(async () => {
    // 1. Setup Tenant A (Shoum Store)
    const userAId = `user-a-${Date.now()}`;
    const storeARes = await query("SELECT id, organization_id, slug FROM stores WHERE slug = 'shoum' LIMIT 1");
    if (storeARes.rowCount && storeARes.rowCount > 0) {
      storeAId = storeARes.rows[0].id;
      storeAOrgId = storeARes.rows[0].organization_id;
      storeASlug = storeARes.rows[0].slug;
    } else {
      storeAOrgId = `org-test-a-${Date.now()}`;
      storeAId = `store-test-a-${Date.now()}`;
      storeASlug = 'shoum';
      await query(
        `INSERT INTO organizations (id, name, slug) VALUES ($1, 'Shoum Org', 'shoum-org') ON CONFLICT DO NOTHING`,
        [storeAOrgId]
      );
      await query(
        `INSERT INTO stores (id, organization_id, name, slug, status) VALUES ($1, $2, 'Shoum', $3, 'ACTIVE')`,
        [storeAId, storeAOrgId, storeASlug]
      );
    }

    await query(
      `INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, 'hash', 'Test User A') ON CONFLICT DO NOTHING`,
      [userAId, `usera-${Date.now()}@test.codes`]
    );
    await query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES ($1, $2, $3, 'OWNER') ON CONFLICT DO NOTHING`,
      [`mem-a-${Date.now()}`, storeAOrgId, userAId]
    );

    storeAToken = generateToken({
      userId: userAId,
      organizationId: storeAOrgId,
      storeId: storeAId,
      role: 'OWNER',
      permissions: ['store.editor.edit', 'store.publish']
    });

    // 2. Setup Tenant B (Artisan Boutique Store)
    const userBId = `user-b-${Date.now()}`;
    storeBOrgId = `org-test-b-${Date.now()}`;
    storeBId = `store-test-b-${Date.now()}`;
    storeBSlug = `artisan-${Date.now()}`;

    await query(
      `INSERT INTO organizations (id, name, slug) VALUES ($1, 'Artisan Craft Org', $2) ON CONFLICT DO NOTHING`,
      [storeBOrgId, `artisan-org-${Date.now()}`]
    );
    await query(
      `INSERT INTO stores (id, organization_id, name, slug, status) VALUES ($1, $2, 'Artisan Boutique', $3, 'ACTIVE')`,
      [storeBId, storeBOrgId, storeBSlug]
    );
    await query(
      `INSERT INTO users (id, email, password_hash, full_name) VALUES ($1, $2, 'hash', 'Test User B') ON CONFLICT DO NOTHING`,
      [userBId, `userb-${Date.now()}@test.codes`]
    );
    await query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role) VALUES ($1, $2, $3, 'OWNER') ON CONFLICT DO NOTHING`,
      [`mem-b-${Date.now()}`, storeBOrgId, userBId]
    );

    storeBToken = generateToken({
      userId: userBId,
      organizationId: storeBOrgId,
      storeId: storeBId,
      role: 'OWNER',
      permissions: ['store.editor.edit', 'store.publish']
    });
  });

  it('TC-STORE-001: Unknown store slug returns 404 STORE_NOT_FOUND, never a fallback demo store', async () => {
    const res = await request('GET', '/api/v1/storefront/by-slug/nonexistent-store-slug-xyz-999');
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('STORE_NOT_FOUND');
    expect(res.body.message).toContain('No active storefront found');
  });

  it('TC-STORE-002: Unknown host header (*.chandraprakash.codes) returns 404, never a fallback', async () => {
    const res = await request('GET', '/api/v1/storefront/render', {
      token: storeAToken,
      headers: {
        host: 'bogus-merchant.chandraprakash.codes'
      }
    });
    expect(res.status).toBe(404);
    expect(res.body.error).toBe('STORE_NOT_FOUND');
  });

  it('TC-STORE-002A: Authenticated store context cannot be overridden by tenant headers', async () => {
    const res = await request('GET', '/api/v1/storefront/pages', {
      token: storeAToken,
      headers: {
        'x-organization-id': storeAOrgId,
        'x-store-id': storeBId,
        'x-store-slug': storeBSlug
      }
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('CROSS_TENANT_ACCESS_DENIED');
  });

  it('TC-STORE-002B: Untrusted forwarded host cannot switch an authenticated tenant', async () => {
    const res = await request('GET', '/api/v1/storefront/render', {
      token: storeAToken,
      headers: {
        host: 'admin.chandraprakash.codes',
        'x-forwarded-host': `${storeBSlug}.chandraprakash.codes`
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.store.slug).toBe(storeASlug);
  });

  it('TC-STORE-003: Storefront resolves active store by slug and returns store metadata & theme', async () => {
    const res = await request('GET', `/api/v1/storefront/by-slug/${storeASlug}`);
    expect(res.status).toBe(200);
    expect(res.body.store).toBeDefined();
    expect(res.body.store.slug).toBe(storeASlug);
    expect(res.body.theme).toBeDefined();
    expect(Array.isArray(res.body.products)).toBe(true);
  });

  it('TC-STORE-003C: verified custom domains resolve to their store through the shared runtime', async () => {
    const customDomain = `store-${storeAId.slice(0, 8)}-${Date.now()}.example.com`;
    await query(
      `INSERT INTO store_domains (id, store_id, domain, is_primary, is_verified, ssl_status)
       VALUES ($1, $2, $3, FALSE, TRUE, 'ACTIVE')`,
      [`dom-test-${uuidv4()}`, storeAId, customDomain]
    );

    const origin = `https://${customDomain}`;
    const previousNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    let preflight: Awaited<ReturnType<typeof request>>;
    try {
      preflight = await request('OPTIONS', '/api/v1/storefront/resolve-host', { headers: {
        origin,
        'access-control-request-method': 'GET'
      } });
    } finally {
      process.env.NODE_ENV = previousNodeEnv;
    }
    expect(preflight.headers['access-control-allow-origin']).toBe(origin);

    const resolved = await request('GET', '/api/v1/storefront/resolve-host', { headers: { origin } });
    expect(resolved.status).toBe(200);
    expect(resolved.body.slug).toBe(storeASlug);
  });

  it('TC-STORE-003B: Store UI configuration stays draft until published, then reaches the live storefront response', async () => {
    const draftNonce = `draft-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const uiConfig = {
      showBottomNav: true,
      bottomNavStyle: 'pill',
      bottomNavLinks: [{ id: 'home', text: 'Home', link: '/', icon: 'Home' }],
      floatingActions: [{ id: 'top', type: 'back-to-top', label: 'Back to top' }],
      decorationsEnabled: false,
      decorationTrigger: 'purchase',
      testDraftNonce: draftNonce
    };
    const saved = await request('PATCH', '/api/v1/storefront/settings', { token: storeAToken, body: { uiConfig } });
    expect(saved.status).toBe(200);
    expect(saved.body.settings.ui_config).toEqual(uiConfig);

    const editorSettings = await request('GET', '/api/v1/storefront/settings', { token: storeAToken });
    expect(editorSettings.body.settings.uiConfig).toEqual(uiConfig);
    const beforePublish = await request('GET', `/api/v1/storefront/by-slug/${storeASlug}`);
    expect(beforePublish.body.settings.uiConfig).not.toEqual(uiConfig);

    const published = await request('POST', '/api/v1/storefront/publish', {
      token: storeAToken,
      body: { notes: 'Publish storefront UI settings' }
    });
    expect(published.status).toBe(201);

    const liveStore = await request('GET', `/api/v1/storefront/by-slug/${storeASlug}`);
    expect(liveStore.body.settings.uiConfig).toEqual(uiConfig);

    await request('PATCH', '/api/v1/storefront/settings', { token: storeAToken, body: { uiConfig: {} } });
  });

  it('TC-STORE-003A: Password protection blocks public data until a store-scoped token is presented', async () => {
    // Ensure Store B has a valid initial publication before testing the gate.
    const draftRender = await request('GET', '/api/v1/storefront/render', { token: storeBToken });
    expect(draftRender.status).toBe(200);

    const passwordHash = await bcrypt.hash('storefront-secret-2026', 10);
    await query(
      `INSERT INTO storefront_settings (store_id, mode, home_page, password_enabled, password_hash)
       VALUES ($1, 'COMMERCE', 'LANDING', TRUE, $2)
       ON CONFLICT (store_id) DO UPDATE SET password_enabled = TRUE, password_hash = EXCLUDED.password_hash`,
      [storeBId, passwordHash]
    );

    const locked = await request('GET', `/api/v1/storefront/by-slug/${storeBSlug}`);
    expect(locked.status).toBe(200);
    expect(locked.body.passwordRequired).toBe(true);
    expect(locked.body.pages).toBeUndefined();
    expect(locked.body.activeRelease).toBeUndefined();
    expect(locked.body.products).toBeUndefined();
    expect(locked.body.theme).toBeUndefined();

    const invalid = await request('POST', `/api/v1/storefront/by-slug/${storeBSlug}/password/verify`, {
      body: { password: 'incorrect-password' }
    });
    expect(invalid.status).toBe(200);
    expect(invalid.body.verified).toBe(false);
    expect(invalid.body.accessToken).toBeUndefined();

    const valid = await request('POST', `/api/v1/storefront/by-slug/${storeBSlug}/password/verify`, {
      body: { password: 'storefront-secret-2026' }
    });
    expect(valid.status).toBe(200);
    expect(valid.body.verified).toBe(true);
    expect(typeof valid.body.accessToken).toBe('string');

    const withToken = await request('GET', `/api/v1/storefront/by-slug/${storeBSlug}`, {
      headers: { 'x-storefront-access-token': valid.body.accessToken }
    });
    expect(withToken.status).toBe(200);
    expect(withToken.body.passwordRequired).toBeUndefined();
    expect(Array.isArray(withToken.body.pages)).toBe(true);
    expect(withToken.body.activeRelease).toBeDefined();

    const forged = await request('GET', `/api/v1/storefront/by-slug/${storeBSlug}`, {
      headers: { 'x-storefront-access-token': 'not-a-signed-token' }
    });
    expect(forged.status).toBe(200);
    expect(forged.body.passwordRequired).toBe(true);
    expect(forged.body.pages).toBeUndefined();

    await query(
      `UPDATE storefront_settings SET password_enabled = FALSE, password_hash = NULL WHERE store_id = $1`,
      [storeBId]
    );
    await query(
      `DELETE FROM storefront_password_attempts WHERE store_id = $1`,
      [storeBId]
    );
  });

  it('TC-STORE-004: Two test stores render distinct persisted content and active releases (REQ-STOREFRONT-001)', async () => {
    // 1. Create distinct page for Store A
    const runId = Date.now().toString();
    const titleA = `Shoum Lookbook ${storeAId} ${runId}`;
    const pageARes = await request('POST', '/api/v1/storefront/pages', {
      token: storeAToken,
      headers: { 'x-organization-id': storeAOrgId, 'x-store-id': storeAId },
      body: {
        title: titleA,
        slug: `lookbook-${storeAId}-${runId}`,
        sections: [{ id: 'sec-a-1', type: 'HeroBanner', name: 'Shoum Exclusive Fall Collection' }]
      }
    });
    expect(pageARes.status).toBe(201);

    // 2. Publish Store A
    const pubARes = await request('POST', '/api/v1/storefront/publish', {
      token: storeAToken,
      headers: { 'x-organization-id': storeAOrgId, 'x-store-id': storeAId },
      body: { notes: 'Shoum Lookbook Release' }
    });
    expect(pubARes.status).toBe(201);

    // 3. Create distinct page for Store B
    const titleB = `Artisan Pottery ${storeBId} ${runId}`;
    const pageBRes = await request('POST', '/api/v1/storefront/pages', {
      token: storeBToken,
      headers: { 'x-organization-id': storeBOrgId, 'x-store-id': storeBId },
      body: {
        title: titleB,
        slug: `pottery-${storeBId}-${runId}`,
        sections: [{ id: 'sec-b-1', type: 'FeaturedCollection', name: 'Handcrafted Ceramic Mugs' }]
      }
    });
    expect(pageBRes.status).toBe(201);

    // 4. Publish Store B
    const pubBRes = await request('POST', '/api/v1/storefront/publish', {
      token: storeBToken,
      headers: { 'x-organization-id': storeBOrgId, 'x-store-id': storeBId },
      body: { notes: 'Artisan Pottery Release' }
    });
    expect(pubBRes.status).toBe(201);

    // 5. Query Storefront A by slug
    const renderA = await request('GET', `/api/v1/storefront/by-slug/${storeASlug}`);
    expect(renderA.status).toBe(200);
    expect(renderA.body.store.name).toBe('Shoum');
    const pageTitlesA = (renderA.body.activeRelease?.pages || []).map((p: any) => p.name);
    expect(pageTitlesA).toContain(titleA);
    expect(pageTitlesA).not.toContain(titleB);

    // 6. Query Storefront B by slug
    const renderB = await request('GET', `/api/v1/storefront/by-slug/${storeBSlug}`);
    expect(renderB.status).toBe(200);
    expect(renderB.body.store.name).toBe('Artisan Boutique');
    const pageTitlesB = (renderB.body.activeRelease?.pages || []).map((p: any) => p.name);
    expect(pageTitlesB).toContain(titleB);
    expect(pageTitlesB).not.toContain(titleA);
  });

  it('TC-STORE-005: Atomic whole-store publish produces immutable snapshot with incremented release number', async () => {
    const pub1 = await request('POST', '/api/v1/storefront/publish', {
      token: storeAToken,
      headers: { 'x-organization-id': storeAOrgId, 'x-store-id': storeAId },
      body: { notes: 'Incremental Release 1' }
    });
    expect(pub1.status).toBe(201);
    const releaseNum1 = pub1.body.releaseNumber;

    const pub2 = await request('POST', '/api/v1/storefront/publish', {
      token: storeAToken,
      headers: { 'x-organization-id': storeAOrgId, 'x-store-id': storeAId },
      body: { notes: 'Incremental Release 2' }
    });
    expect(pub2.status).toBe(201);
    const releaseNum2 = pub2.body.releaseNumber;

    expect(releaseNum2).toBe(releaseNum1 + 1);

    const publishedEvent = await query(
      `SELECT event_type, payload
       FROM outbox_events
       WHERE store_id = $1 AND event_type = 'STOREFRONT_RELEASE_PUBLISHED'
       ORDER BY created_at DESC
       LIMIT 1`,
      [storeAId]
    );
    expect(publishedEvent.rowCount).toBe(1);
    expect(publishedEvent.rows[0].payload.releaseId).toBe(pub2.body.releaseId);

    // Verify release history contains both
    const historyRes = await request('GET', '/api/v1/storefront/releases', {
      token: storeAToken,
      headers: { 'x-organization-id': storeAOrgId, 'x-store-id': storeAId }
    });
    expect(historyRes.status).toBe(200);
    expect(historyRes.body.releases.length).toBeGreaterThanOrEqual(2);
    expect(historyRes.body.releases[0].release_number).toBe(releaseNum2);
  });

  it('TC-STORE-006: Streamlined registration automatically creates active subdomain, published home page, and initial live release', async () => {
    const timestamp = Date.now();
    const testEmail = `auto_pub_${timestamp}@chandraprakash.codes`;
    const testSlug = `auto-pub-${timestamp}`;

    // 1. Send OTP
    const sendOtp = await request('POST', '/api/v1/auth/otp/send', {
      body: { identifier: testEmail, type: 'REGISTER' }
    });
    expect(sendOtp.status).toBe(200);

    const code = String(sendOtp.body.testCode);

    // 2. Verify OTP
    const verifyOtp = await request('POST', '/api/v1/auth/otp/verify', {
      body: { identifier: testEmail, code, type: 'REGISTER' }
    });
    expect(verifyOtp.status).toBe(200);

    // 3. Register streamlined store
    const regRes = await request('POST', '/api/v1/auth/register-streamlined', {
      body: {
        identifier: testEmail,
        fullName: 'Chandru Admin',
        storeName: 'Auto Pub Store',
        slug: testSlug,
        capabilityMode: 'COMMERCE'
      }
    });
    expect(regRes.status).toBe(201);
    expect(regRes.body.store.slug).toBe(testSlug);

    // 4. Verify storefront by slug is immediately ACTIVE and serving published home page
    const liveStoreRes = await request('GET', `/api/v1/storefront/by-slug/${testSlug}`);
    expect(liveStoreRes.status).toBe(200);
    expect(liveStoreRes.body.store.status).toBe('ACTIVE');
    expect(liveStoreRes.body.releaseNumber).toBe(1);
    expect(liveStoreRes.body.pages.length).toBeGreaterThanOrEqual(1);
    expect(liveStoreRes.body.pages[0].path).toBe('/');
    expect(liveStoreRes.body.pages[0].status).toBe('published');
  });
});

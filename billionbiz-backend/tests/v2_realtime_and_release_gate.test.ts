import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { WebSocket } from 'ws';
import { server } from '../src/server.js';
import { query } from '../src/db/pool.js';
import { enqueueOutbox } from '../src/core/auditAndOutbox.js';

describe('V2 Realtime, Concurrency & Release Gate Suite', () => {
  let testPort: number;
  let baseUrl: string;
  let tenantAToken: string;
  let tenantAOrgId: string;
  let tenantAStoreId: string;
  let tenantBToken: string;
  let tenantBOrgId: string;
  let tenantBStoreId: string;

  async function api(method: string, path: string, options: { token?: string; orgId?: string; storeId?: string; body?: any; headers?: Record<string, string> } = {}) {
    const headers: Record<string, string> = {
      'content-type': 'application/json',
      ...options.headers
    };
    if (options.token) {
      headers['authorization'] = `Bearer ${options.token}`;
    }
    if (options.orgId) {
      headers['x-organization-id'] = options.orgId;
    }
    if (options.storeId) {
      headers['x-store-id'] = options.storeId;
    }

    const res = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });

    let body: any = null;
    const text = await res.text();
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
    return { status: res.status, body };
  }

  beforeAll(async () => {
    // 1. Start HTTP/WS server on dynamic ephemeral port
    await new Promise<void>((resolve) => {
      server.listen(0, () => {
        testPort = (server.address() as any).port;
        baseUrl = `http://localhost:${testPort}`;
        resolve();
      });
    });

    // 2. Register Tenant A
    const regResA = await api('POST', '/api/v1/auth/register', {
      body: {
        email: `clean_tenant_${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Clean Merchant',
        storeName: 'Clean Slate Store',
        capabilityMode: 'BOTH'
      }
    });
    expect(regResA.status).toBe(201);
    tenantAToken = regResA.body.token;
    tenantAOrgId = regResA.body.organization.id;
    tenantAStoreId = regResA.body.store.id;

    // 3. Register Tenant B (for cross-tenant isolation testing)
    const regResB = await api('POST', '/api/v1/auth/register', {
      body: {
        email: `isolated_tenant_${Date.now()}@example.com`,
        password: 'Password123!',
        fullName: 'Isolated Retailer',
        storeName: 'Isolated Store',
        capabilityMode: 'PRODUCTS'
      }
    });
    expect(regResB.status).toBe(201);
    tenantBToken = regResB.body.token;
    tenantBOrgId = regResB.body.organization.id;
    tenantBStoreId = regResB.body.store.id;
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
  });

  // ============================================================
  // SECTION 15: Honest Zeros & Clean Tenant Verification
  // ============================================================
  it('TC-DASH-001: Clean tenant returns honest zeros with zero mock data', async () => {
    const res = await api('GET', '/api/v1/dashboard/metrics', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId
    });

    expect(res.status).toBe(200);
    const { metrics, recentOrders, topProducts, orderStatusDistribution } = res.body;

    // Must be real zero - no dummy charts or fallback seed data
    expect(metrics.totalOrders).toBe(0);
    expect(metrics.totalRevenueMinor).toBe(0);
    expect(metrics.avgOrderValueMinor).toBe(0);
    expect(metrics.totalCustomers).toBe(0);
    expect(metrics.totalBookings).toBe(0);
    expect(metrics.totalAppointmentValueMinor).toBe(0);

    expect(recentOrders).toEqual([]);
    expect(topProducts).toEqual([]);
    expect(orderStatusDistribution).toEqual([]);
  });

  it('TC-DASH-002: Clean tenant onboarding checklist shows real pending milestones', async () => {
    const res = await api('GET', '/api/v1/auth/onboarding-checklist', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId
    });

    expect(res.status).toBe(200);
    expect(res.body.checklist).toBeDefined();
    expect(res.body.checklist.length).toBeGreaterThanOrEqual(4);

    // Initial items must be uncompleted (honest initial onboarding state)
    const uncompletedCount = res.body.checklist.filter((c: any) => !c.is_completed).length;
    expect(uncompletedCount).toBe(res.body.checklist.length);

    const emailStep = res.body.checklist.find((c: any) => c.step_key === 'verify_email');
    expect(emailStep).toBeDefined();
    expect(emailStep.is_completed).toBe(false);

    const paymentStep = res.body.checklist.find((c: any) => c.step_key === 'setup_payments');
    expect(paymentStep).toBeDefined();
    expect(paymentStep.is_completed).toBe(false);
  });

  // ============================================================
  // SECTION 16: Realtime Gateway & WebSocket Event Delivery
  // ============================================================
  it('TC-RT-001: Realtime Gateway establishes authenticated WebSocket connection and responds to ping', async () => {
    const ws = new WebSocket(`ws://localhost:${testPort}/realtime?token=${tenantAToken}`);

    const connectedMessage = await new Promise<any>((resolve, reject) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        resolve(msg);
      });
      ws.on('error', reject);
    });

    expect(connectedMessage.type).toBe('connection_established');
    expect(connectedMessage.organizationId).toBe(tenantAOrgId);

    // Send ping
    ws.send(JSON.stringify({ action: 'ping' }));

    const pongMessage = await new Promise<any>((resolve) => {
      ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'pong') resolve(msg);
      });
    });

    expect(pongMessage.type).toBe('pong');
    ws.close();
  });

  it('TC-RT-002: Realtime Gateway delivers events strictly within tenant boundary (Tenant Isolation)', async () => {
    const wsA = new WebSocket(`ws://localhost:${testPort}/realtime?token=${tenantAToken}`);
    const wsB = new WebSocket(`ws://localhost:${testPort}/realtime?token=${tenantBToken}`);

    await Promise.all([
      new Promise<void>((resolve) => wsA.once('open', resolve)),
      new Promise<void>((resolve) => wsB.once('open', resolve))
    ]);

    // Track messages received
    const messagesA: any[] = [];
    const messagesB: any[] = [];

    wsA.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'event') messagesA.push(msg);
    });

    wsB.on('message', (data) => {
      const msg = JSON.parse(data.toString());
      if (msg.type === 'event') messagesB.push(msg);
    });

    // Small delay for socket setup
    await new Promise((r) => setTimeout(r, 60));

    // Emit event for Tenant A
    await enqueueOutbox({
      organizationId: tenantAOrgId,
      storeId: tenantAStoreId,
      eventType: 'order.created',
      aggregateType: 'ORDER',
      aggregateId: 'ord-test-rt-999',
      payload: { orderNumber: 'BBZ-999', totalMinor: 5000 }
    });

    // Wait for delivery
    await new Promise((r) => setTimeout(r, 150));

    // Tenant A MUST have received the event
    expect(messagesA.length).toBeGreaterThanOrEqual(1);
    expect(messagesA[0].data.aggregateId).toBe('ord-test-rt-999');
    expect(messagesA[0].data.organizationId).toBe(tenantAOrgId);

    // Tenant B MUST NOT receive Tenant A's event
    expect(messagesB.length).toBe(0);

    wsA.close();
    wsB.close();
  });

  it('TC-RT-003: Reconnecting client can catch up missed events using cursor', async () => {
    const cursorTime = new Date(Date.now() - 5000).toISOString();

    const catchupRes = await api('GET', `/api/v1/realtime/catchup?cursor=${encodeURIComponent(cursorTime)}`, {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId
    });

    expect(catchupRes.status).toBe(200);
    expect(catchupRes.body.count).toBeGreaterThanOrEqual(1);
    expect(catchupRes.body.events.some((e: any) => e.aggregateId === 'ord-test-rt-999')).toBe(true);
  });

  // ============================================================
  // SECTION 16: Concurrency & Atomic Collision Protection
  // ============================================================
  it('TC-CONC-001: Concurrent appointment booking attempts for same slot trigger conflict (FOR UPDATE)', async () => {
    // 1. Create a service offering
    const offRes = await api('POST', '/api/v1/appointments/offerings', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: {
        name: 'VIP Haircut & Styling',
        durationMinutes: 30,
        priceMinor: 4500,
        depositRequiredMinor: 1000
      }
    });
    expect(offRes.status).toBe(201);
    const offeringId = offRes.body.offeringId;

    // 2. Fetch default resource for store
    const resList = await query('SELECT id FROM resources WHERE store_id = $1 LIMIT 1', [tenantAStoreId]);
    let resourceId: string;
    if (resList.rowCount && resList.rowCount > 0) {
      resourceId = resList.rows[0].id;
    } else {
      // create a resource if not present
      const newRes = await query(
        `INSERT INTO resources (id, store_id, name, type) VALUES ($1, $2, 'Staff Specialist', 'STAFF') RETURNING id`,
        [`res-${Date.now()}`, tenantAStoreId]
      );
      resourceId = newRes.rows[0].id;
    }

    const startTime = '2026-12-01T14:00:00.000Z';
    const endTime = '2026-12-01T14:30:00.000Z';

    // 3. Launch two simultaneous booking requests
    const bookingReq1 = api('POST', '/api/v1/appointments/bookings', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: {
        offeringId,
        resourceId,
        startTime,
        endTime,
        customerDetails: { email: 'client1@example.com', firstName: 'Alice' }
      }
    });

    const bookingReq2 = api('POST', '/api/v1/appointments/bookings', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: {
        offeringId,
        resourceId,
        startTime,
        endTime,
        customerDetails: { email: 'client2@example.com', firstName: 'Bob' }
      }
    });

    const [res1, res2] = await Promise.all([bookingReq1, bookingReq2]);

    const statuses = [res1.status, res2.status].sort();
    // One must succeed (201) and the other must fail with 409 Conflict
    expect(statuses[0]).toBe(201);
    expect(statuses[1]).toBe(409);

    const successfulRes = res1.status === 201 ? res1 : res2;
    const failedRes = res1.status === 201 ? res2 : res1;

    expect(successfulRes.body.bookingId).toBeDefined();
    expect(failedRes.body.message).toContain('SLOT_UNAVAILABLE');
  });

  // ============================================================
  // SECTION 14 & 16: POS Offline Checkout & Idempotency
  // ============================================================
  it('TC-POS-001: Offline POS checkout with Idempotency-Key prevents duplicate orders', async () => {
    // 1. Create a product and inventory
    const prodRes = await api('POST', '/api/v1/catalog/products', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: {
        name: 'Artisan Coffee Beans 500g',
        type: 'PHYSICAL',
        variants: [{ sku: `COF-${Date.now().toString().slice(-4)}`, title: 'Default', priceMinor: 1200, inventoryQuantity: 10 }]
      }
    });
    expect(prodRes.status).toBe(201);
    const variantId = prodRes.body.variants[0].id;

    // 2. Fetch counter or create if needed
    const counterRes = await api('GET', '/api/v1/pos/counters', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId
    });
    expect(counterRes.status).toBe(200);

    let counterId: string;
    if (counterRes.body.counters && counterRes.body.counters.length > 0) {
      counterId = counterRes.body.counters[0].id;
    } else {
      const locRes = await query('SELECT id FROM store_locations WHERE store_id = $1 LIMIT 1', [tenantAStoreId]);
      const locationId = locRes.rows[0].id;
      const cRes = await query(
        `INSERT INTO counters (id, store_id, location_id, name, code) VALUES ($1, $2, $3, 'Main Counter', 'C-01') RETURNING id`,
        [`cnt-${Date.now()}`, tenantAStoreId, locationId]
      );
      counterId = cRes.rows[0].id;
    }

    // 3. Open register
    const openRes = await api('POST', '/api/v1/pos/register/open', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: { counterId, openingFloatMinor: 5000 }
    });
    expect(openRes.status).toBe(201);
    const sessionId = openRes.body.sessionId;

    const idempotencyKey = `idemp-offline-pos-${Date.now()}`;

    // 4. First checkout call
    const checkoutRes1 = await api('POST', '/api/v1/pos/checkout', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      headers: { 'idempotency-key': idempotencyKey },
      body: {
        counterId,
        sessionId,
        items: [{ variantId, quantity: 2 }],
        paymentMethod: 'CASH',
        cashTenderedMinor: 3000
      }
    });

    expect(checkoutRes1.status).toBe(201);
    const orderNumber1 = checkoutRes1.body.receipt.orderNumber;

    // 5. Duplicate offline retry call with identical key
    const checkoutRes2 = await api('POST', '/api/v1/pos/checkout', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      headers: { 'idempotency-key': idempotencyKey },
      body: {
        counterId,
        sessionId,
        items: [{ variantId, quantity: 2 }],
        paymentMethod: 'CASH',
        cashTenderedMinor: 3000
      }
    });

    expect(checkoutRes2.status).toBe(201);
    expect(checkoutRes2.body.receipt.orderNumber).toBe(orderNumber1);

    // Verify inventory deducted exactly once (10 - 2 = 8, not 6)
    const invRes = await query('SELECT on_hand FROM inventory_balances WHERE variant_id = $1', [variantId]);
    expect(parseInt(invRes.rows[0].on_hand, 10)).toBe(8);
  });

  // ============================================================
  // SECTION 14: Native Storefront & SiteStore Complete Absence
  // ============================================================
  it('TC-STORE-001: Native Store Editor operates with zero SiteStore dependencies', async () => {
    // 1. Create a page draft
    const pageRes = await api('POST', '/api/v1/storefront/pages', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: {
        title: 'About Us',
        slug: `about-${Date.now()}`,
        sections: [
          { type: 'hero', heading: 'Our Story', subheading: 'Handcrafted with passion' },
          { type: 'text', content: 'Serving quality products since 2026.' }
        ]
      }
    });
    expect(pageRes.status).toBe(201);

    // 2. Publish atomic store release
    const pubRes = await api('POST', '/api/v1/storefront/releases/publish', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId,
      body: { notes: 'Initial public launch release' }
    });
    expect([200, 201]).toContain(pubRes.status);
    expect(pubRes.body.releaseId).toBeDefined();

    // 3. Render published storefront
    const renderRes = await api('GET', '/api/v1/storefront/render', {
      token: tenantAToken,
      orgId: tenantAOrgId,
      storeId: tenantAStoreId
    });
    expect(renderRes.status).toBe(200);
    expect(renderRes.body.theme).toBeDefined();
    expect(renderRes.body.pages.length).toBeGreaterThanOrEqual(1);

    // 4. Verify no SiteStore database tables exist
    const legacyCheck = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%sitestore%'"
    );
    expect(legacyCheck.rows.length).toBe(0);
  });
});

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import crypto from 'crypto';
import { app } from '../src/server.js';
import { pool, query } from '../src/db/pool.js';
import { runMigrations } from '../src/db/migrate.js';
import { seedDatabase } from '../src/db/seed.js';
import { generateToken } from '../src/middleware/auth.js';

let authToken: string;
const orgId = 'org-billionbiz-default';
const storeId = 'store-shoum-default';

// Helper to make mock requests to express app
async function request(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  options: {
    body?: any;
    headers?: Record<string, string>;
  } = {}
) {
  const url = `http://localhost:4000${path}`;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'x-organization-id': orgId,
    'x-store-id': storeId,
    ...options.headers
  };

  if (authToken && !headers.authorization) {
    headers.authorization = `Bearer ${authToken}`;
  }

  // Use Node.js http or supertest-like fetch against local server
  // Since we haven't started server in test mode, we can use express handle directly or supertest
  return new Promise<{ status: number; body: any }>((resolve) => {
    const req: any = {
      method,
      url: path,
      originalUrl: path,
      path: path.split('?')[0],
      headers,
      body: options.body || {},
      rawBody: Buffer.from(JSON.stringify(options.body || {})),
      query: {},
      ip: '127.0.0.1',
      get: (h: string) => headers[h.toLowerCase()],
      header: (h: string) => headers[h.toLowerCase()]
    };

    // parse query string if any
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

beforeAll(async () => {
  await runMigrations();
  await seedDatabase();

  authToken = generateToken({
    userId: 'user-admin-default',
    email: 'admin@billionbiz.com',
    fullName: 'BillionBiz Master Admin',
    isPlatformAdmin: true,
    organizationId: orgId,
    storeId: storeId,
    role: 'OWNER'
  });
});

afterAll(async () => {
  await pool.end();
});

describe('Phase 1: Tenancy, Identity & Capabilities', () => {
  it('TC-TEN-001: should return stores for authorized organization', async () => {
    const res = await request('GET', '/api/v1/tenancy/stores');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.stores)).toBe(true);
    expect(res.body.stores.length).toBeGreaterThan(0);
    expect(res.body.stores[0].id).toBe(storeId);
  });

  it('SEC-001 / SEC-002: should prevent cross-tenant access to unassociated store', async () => {
    const res = await request('GET', '/api/v1/tenancy/stores/store-invalid-fake', {
      headers: {
        'x-organization-id': orgId,
        'x-store-id': 'store-invalid-fake'
      }
    });
    expect(res.status).toBe(403);
    expect(res.body.error).toBe('CROSS_TENANT_ACCESS_DENIED');
  });

  it('TC-CAP-001: should update store capabilities', async () => {
    const res = await request('PATCH', `/api/v1/tenancy/stores/${storeId}/capabilities`, {
      body: {
        productCommerceEnabled: true,
        appointmentsEnabled: true,
        restaurantPosEnabled: true
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.capabilities.productCommerceEnabled).toBe(true);
    expect(res.body.capabilities.appointmentsEnabled).toBe(true);
  });

  it('TC-MODE-001 / T-041: should configure storefront mode presets and home page', async () => {
    const res = await request('PATCH', `/api/v1/tenancy/stores/${storeId}/storefront-mode`, {
      body: {
        mode: 'BOTH',
        homePage: 'LANDING'
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.mode).toBe('BOTH');
    expect(res.body.homePage).toBe('LANDING');
    expect(res.body.navigationConfig.length).toBeGreaterThan(0);
  });

  it('TC-IAM-001: should login with seeded admin credentials', async () => {
    const res = await request('POST', '/api/v1/auth/login', {
      body: {
        email: 'admin@billionbiz.com',
        password: 'Admin@123'
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe('admin@billionbiz.com');
  });

  it('TC-POS-PIN: should login cashier using counter PIN', async () => {
    const res = await request('POST', '/api/v1/auth/pin-login', {
      body: {
        counterId: 'cnt-shoum-01',
        pin: '1234'
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.staff.name).toBe('Admin Owner');
  });
});

describe('Phase 3: Catalog & Inventory Ledger', () => {
  let createdProductId: string;
  let createdCategoryId: string;
  let createdCategorySlug: string;

  beforeAll(async () => {
    // Ensure initial test product fixture exists
    await request('POST', '/api/v1/catalog/products', {
      body: {
        name: 'Ceramic Espresso Cup Set',
        priceMinor: 89000,
        initialStock: 25,
        variants: [
          {
            sku: 'CUP-CERAMIC-WHT',
            priceMinor: 89000,
            initialStock: 15,
            optionValues: { Color: 'White' }
          }
        ]
      }
    });
  });

  it('TC-CAT-001: should list catalog products', async () => {
    const res = await request('GET', '/api/v1/catalog/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.products)).toBe(true);
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it('TC-CAT-002: should persist, update and reject duplicate category slugs', async () => {
    createdCategorySlug = `test-category-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
    const created = await request('POST', '/api/v1/catalog/categories', {
      body: {
        name: 'Test Category',
        slug: createdCategorySlug,
        description: 'Category CRUD integration fixture'
      }
    });

    expect(created.status).toBe(201);
    expect(created.body.category.id).toBeDefined();
    createdCategoryId = created.body.category.id;

    const duplicate = await request('POST', '/api/v1/catalog/categories', {
      body: { name: 'Duplicate Category', slug: createdCategorySlug }
    });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toBe('CATEGORY_SLUG_EXISTS');

    const updatedSlug = `${createdCategorySlug}-updated`;
    const updated = await request('PATCH', `/api/v1/catalog/categories/${createdCategoryId}`, {
      body: {
        name: 'Updated Test Category',
        slug: updatedSlug,
        description: 'Updated category description'
      }
    });
    expect(updated.status).toBe(200);
    expect(updated.body.category.name).toBe('Updated Test Category');
    expect(updated.body.category.slug).toBe(updatedSlug);

    createdCategorySlug = updatedSlug;
  });

  it('TC-CAT-003: should create a new product with variant matrix and initial stock', async () => {
    const res = await request('POST', '/api/v1/catalog/products', {
      body: {
        name: 'Ceramic Espresso Cup Set',
        categoryId: createdCategoryId,
        priceMinor: 89000,
        initialStock: 25,
        variants: [
          {
            sku: 'CUP-CERAMIC-WHT',
            priceMinor: 89000,
            initialStock: 15,
            optionValues: { Color: 'White' }
          },
          {
            sku: 'CUP-CERAMIC-GRY',
            priceMinor: 89000,
            initialStock: 10,
            optionValues: { Color: 'Grey' }
          }
        ]
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.productId).toBeDefined();
    createdProductId = res.body.productId;
  });

  it('TC-CAT-004: should prevent archiving categories with linked products', async () => {
    const res = await request('DELETE', `/api/v1/catalog/categories/${createdCategoryId}`);
    expect(res.status).toBe(409);
    expect(res.body.error).toBe('CATEGORY_IN_USE');
    expect(res.body.productsCount).toBeGreaterThan(0);

    const categories = await request('GET', '/api/v1/catalog/categories');
    const category = categories.body.categories.find((item: any) => item.id === createdCategoryId);
    expect(category).toBeDefined();
    expect(category.products_count).toBeGreaterThan(0);
  });

  it('TC-INV-001: should record immutable stock movements on adjustment', async () => {
    // Get variant
    const prodRes = await request('GET', '/api/v1/catalog/products');
    const variantId = prodRes.body.products[0].variants[0].id;

    const res = await request('POST', '/api/v1/catalog/inventory/adjust', {
      body: {
        variantId,
        locationId: 'inv-shoum-warehouse',
        adjustmentQty: 10,
        movementType: 'PURCHASE',
        note: 'Restock from supplier'
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Inventory adjusted');
  });
});

describe('Phase 4: Orders & Fulfillment', () => {
  let createdOrderId: string;

  it('TC-ORD-001: should create customer order with line snapshots', async () => {
    const prodRes = await request('GET', '/api/v1/catalog/products');
    const variantId = prodRes.body.products[0].variants[0].id;

    const res = await request('POST', '/api/v1/orders', {
      body: {
        customerDetails: {
          email: 'jane.smith@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          phone: '+919876543211'
        },
        items: [
          { variantId, quantity: 2 }
        ],
        shippingAddress: {
          address1: '42 MG Road',
          city: 'Bengaluru',
          pincode: '560001'
        }
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.orderId).toBeDefined();
    expect(res.body.orderNumber).toContain('BBZ-');
    createdOrderId = res.body.orderId;
  });

  it('TC-ORD-002: should create a persistent manual order for a phone-only customer', async () => {
    const prodRes = await request('GET', '/api/v1/catalog/products');
    const variantId = prodRes.body.products[0].variants[0].id;
    const phone = `+9198765432${String(Date.now()).slice(-2)}`;

    const createRes = await request('POST', '/api/v1/orders', {
      body: {
        channel: 'MANUAL',
        customerDetails: {
          firstName: 'Priya',
          lastName: 'Sharma',
          phone
        },
        items: [{ variantId, quantity: 2 }]
      }
    });

    expect(createRes.status).toBe(201);
    expect(createRes.body.orderId).toBeDefined();
    expect(createRes.body.orderNumber).toContain('BBZ-');

    const listRes = await request('GET', `/api/v1/orders?search=${encodeURIComponent(createRes.body.orderNumber)}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.total).toBe(1);
    expect(listRes.body.orders[0].customer_name).toBe('Priya Sharma');
    expect(listRes.body.orders[0].customer_email).toBeNull();
    expect(listRes.body.orders[0].phone).toBe(phone);
    expect(listRes.body.orders[0].payment_status).toBe('PENDING');
    expect(Number(listRes.body.orders[0].item_count)).toBeGreaterThan(0);
  });

  it('TC-ORD-003: rejects invalid manual order quantities', async () => {
    const prodRes = await request('GET', '/api/v1/catalog/products');
    const variantId = prodRes.body.products[0].variants[0].id;
    const res = await request('POST', '/api/v1/orders', {
      body: {
        channel: 'MANUAL',
        items: [{ variantId, quantity: 0 }]
      }
    });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('INVALID_ORDER_QUANTITY');
  });

  it('TC-SHP-001: should fulfill order with tracking number and carrier', async () => {
    const res = await request('POST', `/api/v1/orders/${createdOrderId}/fulfill`, {
      body: {
        carrier: 'Shiprocket Express',
        trackingNumber: 'SR-123456789'
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.trackingNumber).toBe('SR-123456789');

    // Verify order fulfillment status
    const orderDetail = await request('GET', `/api/v1/orders/${createdOrderId}`);
    expect(orderDetail.body.order.fulfillment_status).toBe('FULFILLED');
  });
});

describe('Phase 6: Appointments & Availability Engine', () => {
  let offeringId: string;
  let resourceId: string;
  let candidateSlot: any;
  let holdToken: string;

  beforeAll(async () => {
    // Provision isolated test fixture resource & offering
    await query(
      `INSERT INTO resources (id, store_id, name, type, staff_profile_id, is_active)
       VALUES ('res-test-fixture', 'store-shoum-default', 'Test Stylist Room 1', 'SPACE', 'staff-admin-default', TRUE)
       ON CONFLICT (id) DO NOTHING`
    );
    await query(
      `INSERT INTO offerings (id, store_id, name, handle, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_minor, deposit_required_minor, is_active)
       VALUES ('off-test-fixture', 'store-shoum-default', 'Test Haircut Consultation', 'test-haircut-consultation', 'Test service offering', 45, 5, 10, 150000, 50000, TRUE)
       ON CONFLICT (id) DO NOTHING`
    );
    await query(
      `UPDATE staff_profiles
       SET responsibilities = '["APPOINTMENT_STAFF"]'::jsonb
       WHERE id = 'staff-admin-default' AND store_id = 'store-shoum-default'`
    );
    await query(
      `UPDATE staff_shifts
       SET start_time = '09:00:00', end_time = '20:00:00', is_active = TRUE
       WHERE staff_profile_id = 'staff-admin-default'`
    );
    await query(
      `INSERT INTO staff_shifts (id, staff_profile_id, day_of_week, start_time, end_time, is_active)
       VALUES ('shift-test-fixture-sunday', 'staff-admin-default', 0, '09:00:00', '20:00:00', TRUE)
       ON CONFLICT (id) DO UPDATE SET start_time = EXCLUDED.start_time, end_time = EXCLUDED.end_time, is_active = TRUE`
    );
    await query(
      `INSERT INTO offering_resources (offering_id, resource_id, is_primary)
       VALUES ('off-test-fixture', 'res-test-fixture', TRUE)
       ON CONFLICT DO NOTHING`
    );
  });

  it('TC-BOOK-001: should fetch service offerings', async () => {
    const res = await request('GET', '/api/v1/appointments/offerings');
    expect(res.status).toBe(200);
    expect(res.body.offerings.length).toBeGreaterThan(0);
    offeringId = res.body.offerings[0].id;
  });

  it('TC-BOOK-003: should calculate available non-overlapping time slots', async () => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);
    const dateStr = targetDate.toISOString().split('T')[0];

    const res = await request('GET', `/api/v1/appointments/availability?offeringId=${offeringId}&date=${dateStr}`);
    expect(res.status).toBe(200);
    expect(res.body.resources).toBeDefined();
    expect(res.body.resources.length).toBeGreaterThan(0);
    expect(res.body.slots.length).toBeGreaterThan(0);
    candidateSlot = res.body.slots.find((s: any) => s.isAvailable);
    expect(candidateSlot).toBeDefined();
    resourceId = candidateSlot.resourceId;
  });

  it('TC-BOOK-004: should hold a time slot temporarily with TTL', async () => {
    const res = await request('POST', '/api/v1/appointments/holds', {
      body: {
        offeringId,
        resourceId,
        startTime: candidateSlot.startTime,
        endTime: candidateSlot.endTime
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.holdToken).toBeDefined();
    holdToken = res.body.holdToken;
  });

  it('TC-BOOK-005: should confirm appointment booking and release hold', async () => {
    const res = await request('POST', '/api/v1/appointments/bookings', {
      body: {
        offeringId,
        resourceId,
        startTime: candidateSlot.startTime,
        endTime: candidateSlot.endTime,
        holdToken,
        customerDetails: {
          email: 'client@example.com',
          firstName: 'Alice',
          lastName: 'Client',
          phone: '+919988776655'
        },
        intakeNotes: 'Prefers quiet session'
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.bookingId).toBeDefined();
    expect(res.body.bookingNumber).toContain('APT-');
  });
});

describe('Phase 7: POS Counter, Billing & Register Sessions', () => {
  let sessionId: string;

  it('TC-POS-001: should open register session with opening float', async () => {
    const res = await request('POST', '/api/v1/pos/register/open', {
      body: {
        counterId: 'cnt-shoum-01',
        openingFloatMinor: 200000 // Rs 2000 float
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    sessionId = res.body.sessionId;
  });

  it('TC-POS-003: should complete fast counter checkout and adjust drawer cash', async () => {
    const prodRes = await request('GET', '/api/v1/catalog/products');
    const variantId = prodRes.body.products[0].variants[0].id;

    const res = await request('POST', '/api/v1/pos/checkout', {
      body: {
        counterId: 'cnt-shoum-01',
        sessionId,
        items: [{ variantId, quantity: 1 }],
        paymentMethod: 'CASH',
        cashTenderedMinor: 200000
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.receipt.orderNumber).toContain('POS-');
  });

  it('TC-POS-014: should close register session and generate Z-Report with variance', async () => {
    const res = await request('POST', '/api/v1/pos/register/close', {
      body: {
        sessionId,
        closingCashMinor: 392000
      }
    });
    expect(res.status).toBe(200);
    expect(res.body.zReport).toBeDefined();
    expect(res.body.zReport.sessionId).toBe(sessionId);
  });
});

describe('Phase 5: Extensions (Razorpay & Shiprocket)', () => {
  it('TC-EXT-001: should create Razorpay payment order', async () => {
    const res = await request('POST', '/api/v1/extensions/razorpay/create-order', {
      body: {
        amountMinor: 150000,
        currency: 'INR',
        purpose: 'ORDER'
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.razorpayOrderId).toBeDefined();
    expect(res.body.paymentIntentId).toBeDefined();
  });

  it('SEC-026: should verify and deduplicate webhook event in inbox (Invariant 13)', async () => {
    const testEventId = `evt_test_unique_${Date.now()}`;
    const webhookEvent = {
      event_id: testEventId,
      event: 'payment.captured',
      payload: {
        payment: { entity: { id: 'pay_9999', amount: 150000 } }
      }
    };
    const signature = crypto
      .createHmac('sha256', 'billionbiz-test-razorpay-webhook-secret')
      .update(JSON.stringify(webhookEvent))
      .digest('hex');
    const headers = {
      'x-razorpay-signature': signature,
      'x-razorpay-event-id': testEventId
    };

    const res1 = await request('POST', '/api/v1/extensions/razorpay/webhook', {
      body: webhookEvent,
      headers
    });
    expect(res1.status).toBe(200);
    expect(res1.body.status).toBe('ACKNOWLEDGED');

    const res2 = await request('POST', '/api/v1/extensions/razorpay/webhook', {
      body: webhookEvent,
      headers
    });
    expect(res2.status).toBe(200);
    expect(res2.body.status).toBe('ALREADY_RECEIVED');
  });
});

describe('Phase 2: Storefront & Atomic Releases', () => {
  it('TC-STORE-004: should atomically publish store release snapshot', async () => {
    const res = await request('POST', '/api/v1/storefront/publish', {
      body: {
        notes: 'Initial production release v1'
      }
    });
    expect(res.status).toBe(201);
    expect(res.body.releaseId).toBeDefined();
    expect(res.body.releaseNumber).toBeGreaterThan(0);
  });

  it('TC-STORE-005: should list published release history', async () => {
    const res = await request('GET', '/api/v1/storefront/releases');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.releases)).toBe(true);
    expect(res.body.releases.length).toBeGreaterThan(0);
  });
});

describe('Phase 8: Realtime Operational Dashboard Metrics', () => {
  it('TC-DASH-001: should return aggregated metrics calculated from database truth', async () => {
    const res = await request('GET', '/api/v1/dashboard/metrics');
    expect(res.status).toBe(200);
    expect(res.body.metrics.totalOrders).toBeGreaterThan(0);
    expect(res.body.metrics.totalRevenueMinor).toBeGreaterThan(0);
    expect(Array.isArray(res.body.recentOrders)).toBe(true);
  });
  it('SEC-WEBHOOK-001: rejects unsigned Razorpay webhook events', async () => {
    const body = { event: 'payment.captured', payload: {} };
    const response = await request('POST', '/api/v1/extensions/razorpay/webhook', {
      body
    });
    expect(response.status).toBe(401);
    expect(response.body.error).toBe('INVALID_WEBHOOK_SIGNATURE');
  });

  it('SEC-WEBHOOK-002: verifies signatures and stores webhook events as received exactly once', async () => {
    const eventId = `evt-test-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const event = {
      event: 'payment.captured',
      account_id: 'acc_test',
      contains: ['payment'],
      payload: { payment: { entity: { id: `pay-${eventId}` } } }
    };
    const signature = crypto
      .createHmac('sha256', 'billionbiz-test-razorpay-webhook-secret')
      .update(JSON.stringify(event))
      .digest('hex');
    const headers = {
      'x-razorpay-signature': signature,
      'x-razorpay-event-id': eventId
    };

    const first = await request('POST', '/api/v1/extensions/razorpay/webhook', { headers, body: event });
    expect(first.status).toBe(200);
    expect(first.body.status).toBe('ACKNOWLEDGED');

    const duplicate = await request('POST', '/api/v1/extensions/razorpay/webhook', { headers, body: event });
    expect(duplicate.status).toBe(200);
    expect(duplicate.body.status).toBe('ALREADY_RECEIVED');

    const stored = await query(
      `SELECT is_verified, processing_status, processed_at
       FROM provider_webhook_inbox
       WHERE provider = 'RAZORPAY' AND event_id = $1`,
      [eventId]
    );
    expect(stored.rowCount).toBe(1);
    expect(stored.rows[0].is_verified).toBe(true);
    expect(stored.rows[0].processing_status).toBe('RECEIVED');
    expect(stored.rows[0].processed_at).toBeNull();
  });

  it('SEC-WEBHOOK-003: rejects signed webhook events without a stable event ID', async () => {
    const event = { event: 'payment.captured', payload: {} };
    const signature = crypto
      .createHmac('sha256', 'billionbiz-test-razorpay-webhook-secret')
      .update(JSON.stringify(event))
      .digest('hex');
    const response = await request('POST', '/api/v1/extensions/razorpay/webhook', {
      headers: { 'x-razorpay-signature': signature },
      body: event
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('MISSING_WEBHOOK_EVENT_ID');
  });

});

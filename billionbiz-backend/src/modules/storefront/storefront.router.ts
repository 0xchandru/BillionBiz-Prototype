import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission, JWT_SECRET } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit, enqueueOutbox, publishOutboxEvent, broadcastCommittedOutboxEvent } from '../../core/auditAndOutbox.js';
import { realtimeGateway } from '../../core/realtimeGateway.js';
import { provisionDefaultStorefront } from './storefrontProvisioner.js';
import { isStoreProjectManagerEnabled, syncStoreProjects } from './storeProjectManager.js';
import { PLATFORM_MAIN_DOMAIN } from '../../core/subdomains.js';
import { env } from '../../core/env.js';
import { resolve4, resolve6, resolveCname } from 'node:dns/promises';
import { validatePageSectionDocument } from './sectionDocumentValidation.js';

export const storefrontRouter = Router();

async function resolveStorefrontOrderTenant(req: Request, res: Response, next: (error?: unknown) => void) {
  try {
    const result = await query(
      `SELECT id, organization_id, currency FROM stores WHERE LOWER(slug) = LOWER($1) AND status = 'ACTIVE'`,
      [req.params.slug]
    );
    if (!result.rowCount) {
      return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'This store is unavailable.' });
    }
    const store = result.rows[0];
    req.tenant = { storeId: store.id, organizationId: store.organization_id };
    res.locals.storefrontOrderStore = store;
    return next();
  } catch (error) {
    return next(error);
  }
}

async function resolvePublicStore(slug: string) {
  const found = await query(`SELECT id, name, slug FROM stores WHERE LOWER(slug) = LOWER($1) AND status = 'ACTIVE'`, [slug]);
  return found.rows[0] as { id: string; name: string; slug: string } | undefined;
}

function getStoreCustomer(req: Request): { storeId: string; customerId: string; email: string } | null {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;
    if (payload.type !== 'store-customer' || !payload.storeId || !payload.customerId || !payload.email) return null;
    return { storeId: String(payload.storeId), customerId: String(payload.customerId), email: String(payload.email) };
  } catch { return null; }
}

storefrontRouter.post('/by-slug/:slug/orders', resolveStorefrontOrderTenant, handleIdempotency, async (req: Request, res: Response) => {
  const storeRow = res.locals.storefrontOrderStore as { id: string; organization_id: string; currency: string };
  const customerDetails = req.body?.customerDetails || {};
  const email = typeof customerDetails.email === 'string' ? customerDetails.email.trim().toLowerCase() : '';
  const phone = typeof customerDetails.phone === 'string' ? customerDetails.phone.trim() : '';
  const fullName = typeof customerDetails.fullName === 'string' ? customerDetails.fullName.trim() : '';
  const address = req.body?.shippingAddress || {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) return res.status(400).json({ error: 'INVALID_CUSTOMER_EMAIL', message: 'Enter a valid email address.' });
  if (fullName.length < 2 || fullName.length > 128 || typeof address.line1 !== 'string' || !address.line1.trim() || typeof address.city !== 'string' || !address.city.trim() || typeof address.state !== 'string' || !address.state.trim() || typeof address.postalCode !== 'string' || !address.postalCode.trim()) return res.status(400).json({ error: 'INVALID_SHIPPING_ADDRESS', message: 'Enter your name and complete delivery address.' });
  if (String(req.body?.paymentMethod || 'cod').toLowerCase() !== 'cod') return res.status(409).json({ error: 'PAYMENT_PROVIDER_UNAVAILABLE', message: 'Online payment is not configured for this store. Choose Cash on Delivery.' });
  if (!Array.isArray(req.body?.items) || !req.body.items.length || req.body.items.length > 100) return res.status(400).json({ error: 'INVALID_ORDER_ITEMS', message: 'Your cart must contain 1 to 100 items.' });

  const quantities = new Map<string, number>();
  for (const item of req.body.items) {
    const variantId = typeof item?.variantId === 'string' ? item.variantId.trim() : '';
    const quantity = Number(item?.quantity);
    if (!variantId || !Number.isFinite(quantity) || quantity <= 0 || quantity > 9999 || Math.abs(quantity * 1000 - Math.round(quantity * 1000)) > 0.00001) return res.status(400).json({ error: 'INVALID_ORDER_QUANTITY', message: 'Each cart quantity must be a positive value with at most three decimal places.' });
    quantities.set(variantId, (quantities.get(variantId) || 0) + quantity);
  }

  const authenticatedCustomer = getStoreCustomer(req);
  if (authenticatedCustomer && authenticatedCustomer.storeId !== storeRow.id) return res.status(403).json({ error: 'CUSTOMER_STORE_MISMATCH', message: 'Sign in to the correct store before checking out.' });
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts.shift() || 'Customer';
  const lastName = nameParts.join(' ');
  const orderId = `ord-${uuidv4()}`;
  const orderNumber = `BBZ-${Date.now().toString().slice(-8)}-${uuidv4().slice(0, 4).toUpperCase()}`;
  let totalMinor = 0;
  let createdCustomerId: string | null = authenticatedCustomer?.customerId || null;
  let event: Awaited<ReturnType<typeof publishOutboxEvent>> | null = null;
  try {
    await withTransaction(async (client) => {
      if (createdCustomerId) {
        const customer = await client.query(`SELECT id FROM customers WHERE id = $1 AND store_id = $2`, [createdCustomerId, storeRow.id]);
        if (!customer.rowCount) throw new Error('CUSTOMER_NOT_FOUND');
      } else {
        const customer = await client.query(`SELECT id FROM customers WHERE store_id = $1 AND LOWER(email) = $2 FOR UPDATE`, [storeRow.id, email]);
        if (customer.rowCount) {
          createdCustomerId = customer.rows[0].id;
          await client.query(`UPDATE customers SET first_name = $1, last_name = $2, phone = COALESCE(NULLIF($3,''),phone), default_address = $4, updated_at = NOW() WHERE id = $5 AND store_id = $6`, [firstName, lastName, phone, JSON.stringify(address), createdCustomerId, storeRow.id]);
        } else {
          createdCustomerId = `cust-${uuidv4()}`;
          await client.query(`INSERT INTO customers (id, store_id, email, phone, first_name, last_name, default_address) VALUES ($1,$2,$3,$4,$5,$6,$7)`, [createdCustomerId, storeRow.id, email, phone || null, firstName, lastName, JSON.stringify(address)]);
        }
      }

      const lines: Array<{ id: string; productId: string; variantId: string; sku: string; title: string; priceMinor: number; quantity: number; totalMinor: number }> = [];
      const reservationRows: Array<{ orderLineId: string; balanceId: string; quantity: number }> = [];
      for (const [variantId, quantity] of quantities) {
        const variantResult = await client.query(
          `SELECT v.id, v.sku, v.price_minor, p.id AS product_id, p.name AS product_name, p.minimum_quantity, p.quantity_step
           FROM product_variants v JOIN products p ON p.id = v.product_id
           WHERE v.id = $1 AND p.store_id = $2 AND p.status = 'ACTIVE' AND v.is_active = TRUE FOR UPDATE OF v`,
          [variantId, storeRow.id]
        );
        if (!variantResult.rowCount) throw new Error('VARIANT_NOT_AVAILABLE');
        const variant = variantResult.rows[0];
        const minimum = Number(variant.minimum_quantity || 1);
        const step = Number(variant.quantity_step || 1);
        if (quantity + 0.000001 < minimum || Math.abs((quantity - minimum) / step - Math.round((quantity - minimum) / step)) > 0.00001) throw new Error('INVALID_PRODUCT_QUANTITY');
        const priceMinor = Number(variant.price_minor);
        if (!Number.isSafeInteger(priceMinor) || priceMinor < 0) throw new Error('INVALID_PRODUCT_PRICE');
        const quantityMilli = Math.round(quantity * 1000);
        const lineMinor = Math.round(priceMinor * quantityMilli / 1000);
        if (!Number.isSafeInteger(lineMinor) || !Number.isSafeInteger(totalMinor + lineMinor)) throw new Error('ORDER_TOTAL_TOO_LARGE');

        const balances = await client.query(
          `SELECT ib.id, ib.available
           FROM inventory_balances ib JOIN inventory_locations il ON il.id = ib.location_id
           WHERE ib.variant_id = $1 AND il.store_id = $2 AND il.status = 'ACTIVE'
           ORDER BY il.is_default DESC, il.created_at ASC FOR UPDATE OF ib`,
          [variantId, storeRow.id]
        );
        if (balances.rowCount) {
          const available = balances.rows.reduce((sum: number, balance: any) => sum + Number(balance.available), 0);
          if (available + 0.000001 < quantity) throw new Error('INSUFFICIENT_STOCK');
        }
        const lineId = `line-${uuidv4()}`;
        lines.push({ id: lineId, productId: variant.product_id, variantId, sku: variant.sku, title: variant.product_name, priceMinor, quantity, totalMinor: lineMinor });
        totalMinor += lineMinor;
        let remaining = balances.rowCount ? quantity : 0;
        for (const balance of balances.rows) {
          if (remaining <= 0) break;
          const reserve = Math.min(remaining, Number(balance.available));
          if (reserve <= 0) continue;
          await client.query(`UPDATE inventory_balances SET reserved = reserved + $1, available = available - $1, updated_at = NOW() WHERE id = $2`, [reserve, balance.id]);
          reservationRows.push({ orderLineId: lineId, balanceId: balance.id, quantity: reserve });
          remaining = Math.round((remaining - reserve) * 1000) / 1000;
        }
      }

      await client.query(
        `INSERT INTO orders (id, store_id, order_number, customer_id, channel, status, payment_status, fulfillment_status, currency, subtotal_minor, shipping_minor, total_minor, shipping_address, billing_address)
         VALUES ($1,$2,$3,$4,'STOREFRONT','OPEN','PENDING','UNFULFILLED',$5,$6,0,$6,$7,$7)`,
        [orderId, storeRow.id, orderNumber, createdCustomerId, storeRow.currency || 'INR', totalMinor, JSON.stringify(address)]
      );
      for (const line of lines) {
        await client.query(`INSERT INTO order_lines (id, order_id, product_id, variant_id, sku, title, unit_price_minor, quantity, total_minor, snapshot) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`, [line.id, orderId, line.productId, line.variantId, line.sku, line.title, line.priceMinor, line.quantity, line.totalMinor, JSON.stringify({ title: line.title, sku: line.sku, price: line.priceMinor })]);
      }
      for (const reservation of reservationRows) {
        await client.query(`INSERT INTO order_inventory_reservations (order_line_id, balance_id, quantity) VALUES ($1,$2,$3)`, [reservation.orderLineId, reservation.balanceId, reservation.quantity]);
      }
      await client.query(`INSERT INTO order_status_history (id, order_id, from_status, to_status, reason, actor_id) VALUES ($1,$2,'NONE','OPEN','Storefront checkout','guest')`, [`osh-${uuidv4()}`, orderId]);
      event = await publishOutboxEvent(client, storeRow.organization_id, storeRow.id, 'ORDER_CREATED', 'ORDER', orderId, { orderId, orderNumber, totalAmount: totalMinor, customerName: fullName, email, phone, channel: 'STOREFRONT' });
    });
  } catch (error: any) {
    if (error?.message === 'VARIANT_NOT_AVAILABLE') return res.status(409).json({ error: 'VARIANT_NOT_AVAILABLE', message: 'One or more items are no longer available. Refresh your cart and try again.' });
    if (error?.message === 'INVALID_PRODUCT_QUANTITY') return res.status(400).json({ error: 'INVALID_PRODUCT_QUANTITY', message: 'One or more item quantities do not meet the product minimum or quantity step.' });
    if (error?.message === 'INSUFFICIENT_STOCK') return res.status(409).json({ error: 'INSUFFICIENT_STOCK', message: 'There is not enough stock for one or more cart items.' });
    if (error?.message === 'CUSTOMER_NOT_FOUND') return res.status(401).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Your customer account could not be verified.' });
    if (error?.message === 'INVALID_PRODUCT_PRICE' || error?.message === 'ORDER_TOTAL_TOO_LARGE') return res.status(409).json({ error: 'PRODUCT_PRICE_UNAVAILABLE', message: 'A product price needs attention. Contact the store and try again later.' });
    throw error;
  }
  if (event) broadcastCommittedOutboxEvent(event);
  return res.status(201).json({ message: 'Order created successfully', orderId, orderNumber, totalMinor, paymentStatus: 'PENDING' });
});

storefrontRouter.post('/by-slug/:slug/customers/register', async (req: Request, res: Response) => {
  const store = await resolvePublicStore(String(req.params.slug));
  const { email: rawEmail, password, firstName = '', lastName = '' } = req.body || {};
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!store) return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'This store is unavailable.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'INVALID_CUSTOMER_ACCOUNT', message: 'Use a valid email address and a password with at least 8 characters.' });
  const existing = await query(`SELECT id FROM customers WHERE store_id = $1 AND LOWER(email) = $2`, [store.id, email]);
  if (existing.rowCount) return res.status(409).json({ error: 'CUSTOMER_EXISTS', message: 'An account with this email already exists. Sign in instead.' });
  const customerId = `cust-${uuidv4()}`;
  const passwordHash = await bcrypt.hash(password, 12);
  await query(`INSERT INTO customers (id, store_id, email, first_name, last_name, password_hash) VALUES ($1,$2,$3,$4,$5,$6)`, [customerId, store.id, email, String(firstName).trim(), String(lastName).trim(), passwordHash]);
  const token = jwt.sign({ type: 'store-customer', storeId: store.id, customerId, email }, JWT_SECRET, { expiresIn: '14d' });
  res.status(201).json({ token, customer: { id: customerId, email, firstName, lastName } });
});

storefrontRouter.post('/by-slug/:slug/customers/login', async (req: Request, res: Response) => {
  const store = await resolvePublicStore(String(req.params.slug));
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = req.body?.password;
  if (!store) return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'This store is unavailable.' });
  const customer = await query(`SELECT id, email, first_name, last_name, password_hash FROM customers WHERE store_id = $1 AND LOWER(email) = $2`, [store.id, email]);
  if (!customer.rowCount || !customer.rows[0].password_hash || typeof password !== 'string' || !(await bcrypt.compare(password, customer.rows[0].password_hash))) return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Email or password is incorrect.' });
  const profile = customer.rows[0];
  const token = jwt.sign({ type: 'store-customer', storeId: store.id, customerId: profile.id, email: profile.email }, JWT_SECRET, { expiresIn: '14d' });
  res.json({ token, customer: { id: profile.id, email: profile.email, firstName: profile.first_name, lastName: profile.last_name } });
});

storefrontRouter.get('/customer/orders', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to view your orders.' });
  const result = await query(`SELECT id, order_number, status, payment_status, fulfillment_status, currency, total_minor, created_at FROM orders WHERE store_id = $1 AND customer_id = $2 ORDER BY created_at DESC LIMIT 100`, [customer.storeId, customer.customerId]);
  res.json({ orders: result.rows });
});

storefrontRouter.get('/customer/profile', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to view your profile.' });
  const result = await query(`SELECT id, email, first_name, last_name, phone, default_address FROM customers WHERE id = $1 AND store_id = $2`, [customer.customerId, customer.storeId]);
  if (!result.rowCount) return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Customer account was not found.' });
  res.json({ customer: result.rows[0] });
});

storefrontRouter.post('/customer/tickets', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to contact store support.' });
  const { subject, message } = req.body || {};
  if (typeof subject !== 'string' || !subject.trim() || typeof message !== 'string' || !message.trim()) return res.status(400).json({ error: 'INVALID_TICKET', message: 'Subject and message are required.' });
  const profile = await query(`SELECT first_name, last_name FROM customers WHERE id = $1 AND store_id = $2`, [customer.customerId, customer.storeId]);
  const ticketId = `tkt-${uuidv4()}`;
  const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;
  await withTransaction(async (client) => {
    await client.query(`INSERT INTO customer_tickets (id, store_id, ticket_number, customer_id, customer_name, customer_email, subject, description) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [ticketId, customer.storeId, ticketNumber, customer.customerId, `${profile.rows[0]?.first_name || ''} ${profile.rows[0]?.last_name || ''}`.trim() || customer.email, customer.email, subject.trim(), message.trim()]);
    await client.query(`INSERT INTO customer_ticket_messages (id, ticket_id, author_type, author_id, body) VALUES ($1,$2,'CUSTOMER',$3,$4)`, [`msg-${uuidv4()}`, ticketId, customer.customerId, message.trim()]);
  });
  res.status(201).json({ id: ticketId, ticketNumber });
});

storefrontRouter.get('/customer/tickets', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to view support tickets.' });
  const result = await query(`SELECT id, ticket_number, subject, status, priority, created_at, updated_at FROM customer_tickets WHERE store_id = $1 AND customer_id = $2 ORDER BY created_at DESC`, [customer.storeId, customer.customerId]);
  res.json({ tickets: result.rows });
});

storefrontRouter.get('/customer/tickets/:id/messages', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to view support tickets.' });
  const access = await query(`SELECT id FROM customer_tickets WHERE id = $1 AND store_id = $2 AND customer_id = $3`, [req.params.id, customer.storeId, customer.customerId]);
  if (!access.rowCount) return res.status(404).json({ error: 'TICKET_NOT_FOUND', message: 'Support ticket was not found.' });
  const messages = await query(`SELECT id, author_type, body, created_at FROM customer_ticket_messages WHERE ticket_id = $1 ORDER BY created_at`, [req.params.id]);
  res.json({ messages: messages.rows });
});

storefrontRouter.post('/customer/tickets/:id/messages', async (req: Request, res: Response) => {
  const customer = getStoreCustomer(req);
  if (!customer) return res.status(401).json({ error: 'CUSTOMER_AUTH_REQUIRED', message: 'Sign in to reply to support.' });
  const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
  if (!body) return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Write a reply before sending.' });
  const access = await query(`SELECT id FROM customer_tickets WHERE id = $1 AND store_id = $2 AND customer_id = $3`, [req.params.id, customer.storeId, customer.customerId]);
  if (!access.rowCount) return res.status(404).json({ error: 'TICKET_NOT_FOUND', message: 'Support ticket was not found.' });
  await withTransaction(async (client) => {
    await client.query(`INSERT INTO customer_ticket_messages (id, ticket_id, author_type, author_id, body) VALUES ($1,$2,'CUSTOMER',$3,$4)`, [`msg-${uuidv4()}`, req.params.id, customer.customerId, body]);
    await client.query(`UPDATE customer_tickets SET status = CASE WHEN status IN ('RESOLVED','CLOSED') THEN 'OPEN' ELSE status END, updated_at = NOW() WHERE id = $1`, [req.params.id]);
  });
  res.status(201).json({ message: 'Reply sent.' });
});

// GET /api/v1/storefront/theme
storefrontRouter.get('/theme', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
  if (themeRes.rowCount === 0) {
    return res.json({ theme: { presetName: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} } });
  }
  res.json({ theme: themeRes.rows[0] });
});

// PATCH /api/v1/storefront/theme (Save draft theme)
storefrontRouter.patch(
  '/theme',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { presetName, palette, typography, buttons, effects, customCss } = req.body;

    const updated = await query(
      `INSERT INTO store_themes (id, store_id, preset_name, palette, typography, buttons, effects, custom_css, version, updated_at)
       VALUES (
         $1, $2, COALESCE($3, 'modern'),
         COALESCE($4, '{}'::jsonb),
         COALESCE($5, '{}'::jsonb),
         COALESCE($6, '{}'::jsonb),
         COALESCE($7, '{}'::jsonb),
         COALESCE($8, ''),
         1, NOW()
       )
       ON CONFLICT (store_id) DO UPDATE SET
         preset_name = COALESCE($3, store_themes.preset_name),
         palette = COALESCE($4, store_themes.palette),
         typography = COALESCE($5, store_themes.typography),
         buttons = COALESCE($6, store_themes.buttons),
         effects = COALESCE($7, store_themes.effects),
         custom_css = COALESCE($8, store_themes.custom_css),
         version = store_themes.version + 1,
         updated_at = NOW()
       RETURNING *`,
      [
        `thm-${uuidv4()}`,
        storeId,
        presetName ?? null,
        palette === undefined ? null : JSON.stringify(palette),
        typography === undefined ? null : JSON.stringify(typography),
        buttons === undefined ? null : JSON.stringify(buttons),
        effects === undefined ? null : JSON.stringify(effects),
        customCss === undefined ? null : customCss
      ]
    );

    res.json({ message: 'Theme updated', theme: updated.rows[0] });
  }
);

const RESERVED_SYSTEM_PATHS = [
  '/',
  '/shop',
  '/products',
  '/collections',
  '/cart',
  '/checkout',
  '/account',
  '/account/login',
  '/search',
  '/booking',
  '/policies/privacy',
  '/policies/terms',
  '/policies/refund',
  '/contact',
  '/404',
  '/password'
];

// GET /api/v1/storefront/pages (List all pages with system status and draft version)
storefrontRouter.get('/pages', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  let pagesRes = await query(
    `SELECT p.*,
            COALESCE(pd.sections, '[]'::jsonb) AS sections,
            COALESCE(pd.page_props, p.page_props) AS draft_page_props,
            COALESCE(pd.version, 0) AS draft_version
     FROM store_pages p
     LEFT JOIN LATERAL (
       SELECT sections, page_props, version
       FROM page_draft_versions
       WHERE page_id = p.id
       ORDER BY version DESC, created_at DESC
       LIMIT 1
     ) pd ON TRUE
     WHERE p.store_id = $1
     ORDER BY p.is_system DESC, p.name ASC`,
    [storeId]
  );

  // Lazy-provision starter pages for existing stores created prior to Phase 1 provisioner
  if (pagesRes.rowCount === 0) {
    const storeInfo = await query(`SELECT name, slug FROM stores WHERE id = $1`, [storeId]);
    if (storeInfo.rowCount && storeInfo.rowCount > 0) {
      await withTransaction(async (client) => {
        await provisionDefaultStorefront({
          client,
          storeId,
          storeName: storeInfo.rows[0].name || 'Online Store',
          storeSlug: storeInfo.rows[0].slug || 'store',
          mode: 'COMMERCE',
          userId: req.auth?.userId
        });
      });
      pagesRes = await query(
        `SELECT p.*,
                (SELECT pd.version FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1) as draft_version
         FROM store_pages p
         WHERE p.store_id = $1
         ORDER BY p.is_system DESC, p.name ASC`,
        [storeId]
      );
    }
  }

  res.json({ pages: pagesRes.rows });
});

// POST /api/v1/storefront/pages (Create new custom page)
storefrontRouter.post(
  '/pages',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, title, path, slug, type = 'custom', category = 'GENERAL', templateKey = 'standard', sections = [], pageProps = {} } = req.body;
    const pageName = name || title || 'New Page';
    const sectionValidation = validatePageSectionDocument(sections);
    if (!sectionValidation.valid) {
      return res.status(400).json({
        error: 'INVALID_SECTION_DOCUMENT',
        message: 'One or more sections do not match their registered schema.',
        issues: sectionValidation.issues
      });
    }
    let pagePath = path || `/${slug || pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (!pagePath.startsWith('/')) pagePath = `/${pagePath}`;

    // Prevent collision with reserved system routes
    if (RESERVED_SYSTEM_PATHS.includes(pagePath.toLowerCase())) {
      return res.status(400).json({
        error: 'RESERVED_SYSTEM_PATH',
        message: `The route path '${pagePath}' is reserved for platform system pages. Please choose a custom route path.`
      });
    }

    const pageId = `page-${uuidv4()}`;

    await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO store_pages (id, store_id, name, path, type, category, status, is_system, is_locked, template_key, page_props)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft', FALSE, FALSE, $7, $8)
         ON CONFLICT (store_id, path) DO UPDATE SET
           name = EXCLUDED.name,
           type = EXCLUDED.type,
           category = EXCLUDED.category,
           template_key = EXCLUDED.template_key,
           page_props = EXCLUDED.page_props,
           updated_at = NOW()
         RETURNING id`,
        [pageId, storeId, pageName, pagePath, type, category, templateKey, JSON.stringify(pageProps)]
      );
      const effectivePageId = inserted.rows[0]?.id || pageId;

      if (sections.length > 0) {
        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, 1, $3, $4, $5)`,
          [`draft-${uuidv4()}`, effectivePageId, JSON.stringify(sections), JSON.stringify(pageProps), req.auth?.userId]
        );
      }
    });

    res.status(201).json({ message: 'Page created successfully', pageId, path: pagePath });
  }
);

// PATCH /api/v1/storefront/pages/:id (Update page settings, SEO & visibility)
storefrontRouter.patch(
  '/pages/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;
    const { name, title, path, seoTitle, seoDescription, templateKey, pageProps, visibility, status } = req.body;

    const pageRes = await query(`SELECT * FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (pageRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const page = pageRes.rows[0];

    // Enforce lock on system pages: cannot change path/route
    if (page.is_locked && path && path !== page.path) {
      return res.status(400).json({
        error: 'LOCKED_PAGE_ROUTE_IMMUTABLE',
        message: 'System page routes are permanently locked and cannot be altered.'
      });
    }

    const updated = await query(
      `UPDATE store_pages SET
         name = COALESCE($1, name),
         path = CASE WHEN is_locked THEN path ELSE COALESCE($2, path) END,
         seo_title = COALESCE($3, seo_title),
         seo_description = COALESCE($4, seo_description),
         template_key = COALESCE($5, template_key),
         page_props = COALESCE($6, page_props),
         visibility = COALESCE($7, visibility),
         status = COALESCE($8, status),
         updated_at = NOW()
       WHERE id = $9 AND store_id = $10
       RETURNING *`,
      [
        name || title || null,
        path || null,
        seoTitle !== undefined ? seoTitle : null,
        seoDescription !== undefined ? seoDescription : null,
        templateKey || null,
        pageProps ? JSON.stringify(pageProps) : null,
        visibility ? JSON.stringify(visibility) : null,
        status || null,
        pageId,
        storeId
      ]
    );

    res.json({ message: 'Page updated successfully', page: updated.rows[0] });
  }
);

// POST /api/v1/storefront/pages/:id/duplicate (Duplicate page)
storefrontRouter.post(
  '/pages/:id/duplicate',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;

    const sourceRes = await query(`SELECT * FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (sourceRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const source = sourceRes.rows[0];

    // Get latest draft sections
    const draftRes = await query(
      `SELECT sections, page_props FROM page_draft_versions WHERE page_id = $1 ORDER BY version DESC LIMIT 1`,
      [pageId]
    );
    const sections = draftRes.rows[0]?.sections || [];
    const pageProps = draftRes.rows[0]?.page_props || source.page_props || {};

    const newId = `page-${uuidv4()}`;
    const newName = `${source.name} (Copy)`;
    const rawSlug = source.path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');
    const newPath = `/${rawSlug || 'page'}-copy-${Date.now().toString().slice(-4)}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO store_pages (
           id, store_id, name, path, type, category, status, is_system, is_locked, template_key, page_props, seo_title, seo_description
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'draft', FALSE, FALSE, $7, $8, $9, $10)`,
        [
          newId,
          storeId,
          newName,
          newPath,
          source.type,
          source.category,
          source.template_key || 'standard',
          JSON.stringify(pageProps),
          source.seo_title ? `${source.seo_title} (Copy)` : null,
          source.seo_description
        ]
      );

      if (sections.length > 0) {
        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, 1, $3, $4, $5)`,
          [`draft-${uuidv4()}`, newId, JSON.stringify(sections), JSON.stringify(pageProps), req.auth?.userId]
        );
      }
    });

    res.status(201).json({ message: 'Page duplicated successfully', pageId: newId, path: newPath, name: newName });
  }
);

// DELETE /api/v1/storefront/pages/:id (Delete custom page only)
storefrontRouter.delete(
  '/pages/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;

    const pageRes = await query(`SELECT id, name, is_system, is_locked FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (pageRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const page = pageRes.rows[0];

    if (page.is_system || page.is_locked) {
      return res.status(400).json({
        error: 'CANNOT_DELETE_SYSTEM_PAGE',
        message: `System page '${page.name}' is essential to store operations and cannot be deleted.`
      });
    }

    await query(`DELETE FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    res.json({ message: `Custom page '${page.name}' deleted successfully.` });
  }
);

// GET /api/v1/storefront/by-slug/:slug (Public Storefront by store slug, REQ-STOREFRONT-001)
// Resolve a verified custom hostname to its tenant slug so the shared frontend
// runtime can mount the same StorefrontPage used by wildcard subdomains.
storefrontRouter.get('/resolve-host', async (req: Request, res: Response) => {
  const origin = typeof req.headers.origin === 'string' ? req.headers.origin : '';
  let hostname = '';
  try {
    const parsed = new URL(origin);
    if (parsed.protocol === 'https:' && !parsed.port && !parsed.username && !parsed.password) hostname = parsed.hostname.toLowerCase();
  } catch { /* Invalid or absent origins are not mapped to a custom storefront. */ }
  if (!hostname) return res.status(400).json({ error: 'STOREFRONT_HOST_REQUIRED', message: 'A valid HTTPS storefront origin is required.' });

  const result = await query<{ slug: string }>(
    `SELECT s.slug
     FROM store_domains sd
     JOIN stores s ON s.id = sd.store_id
     WHERE LOWER(sd.domain) = LOWER($1)
       AND sd.is_verified = TRUE
       AND UPPER(sd.ssl_status) = 'ACTIVE'
       AND UPPER(s.status) = 'ACTIVE'
     LIMIT 1`,
    [hostname]
  );
  if (!result.rowCount) return res.status(404).json({ error: 'STOREFRONT_HOST_NOT_FOUND', message: 'No live storefront is mapped to this hostname.' });
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
  return res.json({ slug: result.rows[0].slug });
});

storefrontRouter.get('/by-slug/:slug', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const storeRes = await query(
    `SELECT id, organization_id, name, slug, currency, timezone, status
     FROM stores
     WHERE LOWER(slug) = LOWER($1) AND status != 'SUSPENDED'`,
    [slug]
  );

  if (storeRes.rowCount === 0) {
    return res.status(404).json({
      error: 'STORE_NOT_FOUND',
      message: `No active storefront found for '${slug}'`
    });
  }

  const store = storeRes.rows[0];

  const settingsRes = await query(
    `SELECT mode, home_page, navigation_config, icon_visibility, brand_name, tagline,
            logo_url, favicon_url, social_links, primary_domain, password_enabled,
            password_hash, maintenance_mode, ui_config
     FROM storefront_settings
     WHERE store_id = $1`,
    [store.id]
  );
  const settingsRow = settingsRes.rows[0] || {};

  if (settingsRow.password_enabled) {
    const suppliedToken = req.headers['x-storefront-access-token'];
    let hasStoreAccess = false;

    if (typeof suppliedToken === 'string' && suppliedToken.length > 0) {
      try {
        const claims = jwt.verify(suppliedToken, JWT_SECRET) as jwt.JwtPayload;
        hasStoreAccess =
          claims.scope === 'STOREFRONT_PASSWORD' &&
          claims.storeId === store.id &&
          claims.slug === store.slug;
      } catch {
        hasStoreAccess = false;
      }
    }

    if (!hasStoreAccess) {
      return res.status(200).json({
        store: { id: store.id, name: store.name, slug: store.slug, currency: store.currency, timezone: store.timezone },
        brand: {
          name: settingsRow.brand_name || store.name,
          tagline: settingsRow.tagline || '',
          logoUrl: settingsRow.logo_url || '',
          faviconUrl: settingsRow.favicon_url || '',
          socialLinks: settingsRow.social_links || {}
        },
        settings: { passwordEnabled: true },
        passwordRequired: true
      });
    }
  }

  // Public store pages are keyed by their unique slug and immutable release.
  // Permit short shared-cache reuse; password-protected stores remain private.
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=15, stale-while-revalidate=30');

  // 1. Latest immutable published release snapshot
  const releaseRes = await query(
    `SELECT r.id, r.release_number, r.snapshot, r.content_hash, r.published_by, r.notes, r.created_at
     FROM storefront_settings ss
     JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
     WHERE ss.store_id = $1
     LIMIT 1`,
    [store.id]
  );

  // 3. Public pages always come from the immutable active release.
  let publishedPages = Array.isArray(releaseRes.rows[0]?.snapshot?.pages)
    ? releaseRes.rows[0].snapshot.pages
    : [];

  // Backfill only stores that have never had their starter pages provisioned.
  // Never expose mutable page rows as public storefront content.
  if (!releaseRes.rows[0]) {
    const existingPages = await query(
      `SELECT 1 FROM store_pages WHERE store_id = $1 LIMIT 1`,
      [store.id]
    );
    if (existingPages.rowCount === 0) {
      await withTransaction(async (client) => {
        await provisionDefaultStorefront({
          client,
          storeId: store.id,
          storeName: store.name || 'Online Store',
          storeSlug: store.slug,
          mode: 'COMMERCE'
        });
      });
      const refreshedRelease = await query(
        `SELECT r.id, r.release_number, r.snapshot, r.content_hash, r.published_by, r.notes, r.created_at
         FROM storefront_settings ss
         JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
         WHERE ss.store_id = $1
         LIMIT 1`,
        [store.id]
      );
      releaseRes.rows = refreshedRelease.rows;
      publishedPages = Array.isArray(refreshedRelease.rows[0]?.snapshot?.pages)
        ? refreshedRelease.rows[0].snapshot.pages
        : [];
    }
  }

  if (!releaseRes.rows[0]) {
    return res.status(404).json({
      error: 'STOREFRONT_NOT_PUBLISHED',
      message: 'This store does not have an active publication yet.'
    });
  }

  // 4. Active catalogue products. Return one row per product with a safe
  // public variant projection; never duplicate cards because a product has
  // multiple variants, and never expose cost, SKU or private inventory fields.
  const productsRes = await query(
    `SELECT
       p.id,
       p.name,
       p.handle,
       p.description,
       p.brand,
       p.product_type,
       p.selling_unit,
       p.minimum_quantity,
       p.quantity_step,
       p.media,
       p.category_id,
       c.name AS category_name,
       c.slug AS category_slug,
       COALESCE((
         SELECT json_agg(
           json_build_object(
             'id', v.id,
             'price_minor', v.price_minor,
             'compare_at_minor', v.compare_at_minor,
             'option_values', v.option_values,
             'stock_available', stock.available,
             'stock_tracked', stock.is_tracked
           )
           ORDER BY v.created_at ASC
         )
         FROM product_variants v
         LEFT JOIN LATERAL (
           SELECT
             CASE WHEN COUNT(ib.id) = 0 THEN NULL ELSE SUM(ib.available) END AS available,
             COUNT(ib.id) > 0 AS is_tracked
           FROM inventory_balances ib
           WHERE ib.variant_id = v.id
         ) stock ON TRUE
         WHERE v.product_id = p.id AND v.is_active = TRUE
       ), '[]'::json) AS variants
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     WHERE p.store_id = $1 AND p.status = 'ACTIVE'
     ORDER BY p.created_at DESC
     LIMIT 24`,
    [store.id]
  );

  // 5. Active offerings (appointments/services)
  const offeringsRes = await query(
    `SELECT id, name, handle, description, duration_minutes, price_minor, deposit_required_minor
     FROM offerings
     WHERE store_id = $1 AND is_active = TRUE
     ORDER BY name ASC
     LIMIT 24`,
    [store.id]
  );

  // 6. Active categories
  const categoriesRes = await query(
    `SELECT id, name, slug, description FROM categories WHERE store_id = $1 AND is_active = TRUE ORDER BY name ASC`,
    [store.id]
  );

  // 7. Storefront settings & brand. Settings were loaded before any
  // publication/catalogue data so password-protected stores can fail closed.
  const activeSnapshot = releaseRes.rows[0]?.snapshot || {};
  const publishedBrand = activeSnapshot.brand || {};
  const publishedSettings = activeSnapshot.settings || {};

  res.json({
    store,
    activeRelease: activeSnapshot,
    releaseNumber: releaseRes.rows[0]?.release_number || null,
    // The public site is an immutable publication. Unpublished theme/brand/
    // navigation/settings changes remain visible only in the authenticated editor.
    // Never fall back to mutable editor theme rows on the public route.
    theme: activeSnapshot.theme || { preset_name: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} },
    pages: publishedPages,
    products: productsRes.rows,
    offerings: offeringsRes.rows,
    categories: categoriesRes.rows,
    brand: {
      name: publishedBrand.name || store.name,
      tagline: publishedBrand.tagline ?? '',
      logoUrl: publishedBrand.logoUrl ?? '',
      faviconUrl: publishedBrand.faviconUrl ?? '',
      socialLinks: publishedBrand.socialLinks || {}
    },
    settings: {
      mode: publishedSettings.mode || 'COMMERCE',
      homePage: publishedSettings.homePage || 'LANDING',
      navigation: activeSnapshot.navigation || [],
      primaryDomain: publishedSettings.primaryDomain || `${store.slug}.${PLATFORM_MAIN_DOMAIN}`,
      // Password protection is an immediate server-side security control, not a
      // cosmetic draft value. The backend gate and this client flag use the same
      // authoritative setting.
      passwordEnabled: Boolean(settingsRow.password_enabled),
      // Maintenance mode is an immediate operational control, not a draft design token.
      maintenanceMode: Boolean(settingsRow.maintenance_mode),
      seoDefaults: publishedSettings.seoDefaults || {},
      // Public rendering is pinned to the active immutable release. Draft UI
      // changes stay in the editor until a new release is activated.
      uiConfig: publishedSettings.uiConfig || {}
    }
  });
});

// GET /api/v1/storefront/by-slug/:slug/updates
// Public, read-only stream for newly activated releases. It exposes only a
// release identifier/version; customers re-fetch the active public snapshot.
storefrontRouter.get('/by-slug/:slug/updates', async (req: Request, res: Response) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const storeRes = await query(
    `SELECT id, organization_id FROM stores
     WHERE LOWER(slug) = LOWER($1) AND status = 'ACTIVE'
     LIMIT 1`,
    [slug]
  );

  if (storeRes.rowCount === 0) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store not found' });
  }

  realtimeGateway.registerSseClient(
    `storefront-${storeRes.rows[0].id}-${uuidv4()}`,
    res,
    storeRes.rows[0].organization_id,
    storeRes.rows[0].id,
    ['STOREFRONT_RELEASE_PUBLISHED'],
    [],
    false,
    true
  );
});

// POST /api/v1/storefront/by-slug/:slug/password/verify
// Password checks happen on the server; the hash is never exposed to the storefront.
// Attempts are tracked in PostgreSQL so limits are consistent across instances.

storefrontRouter.post('/by-slug/:slug/password/verify', async (req: Request, res: Response) => {
  const slug = String(req.params.slug || '').trim().toLowerCase();
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!slug || !password) {
    return res.status(400).json({ error: 'PASSWORD_REQUIRED', verified: false, message: 'Enter the storefront password.' });
  }

  const storeRes = await query(
    `SELECT s.id, s.slug, ss.password_enabled, ss.password_hash
     FROM stores s
     JOIN storefront_settings ss ON ss.store_id = s.id
     WHERE LOWER(s.slug) = LOWER($1) AND s.status != 'SUSPENDED'
     LIMIT 1`,
    [slug]
  );
  if (storeRes.rowCount === 0) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', verified: false });
  }

  const store = storeRes.rows[0];
  if (!store.password_enabled) {
    return res.json({ verified: true });
  }
  if (!store.password_hash) {
    return res.status(409).json({
      error: 'PASSWORD_CONFIGURATION_ERROR',
      verified: false,
      message: 'Password protection is enabled but no password has been configured.'
    });
  }

  const clientIp = String(req.socket?.remoteAddress || req.ip || 'unknown');
  const ipHash = crypto.createHash('sha256')
    .update(`${store.id}:${clientIp}:${JWT_SECRET}`)
    .digest('hex');

  const attemptRes = await query(
    `SELECT attempt_count, window_started_at, blocked_until
     FROM storefront_password_attempts
     WHERE store_id = $1 AND ip_hash = $2
     LIMIT 1`,
    [store.id, ipHash]
  );
  const existingAttempt = attemptRes.rows[0];
  if (existingAttempt?.blocked_until && new Date(existingAttempt.blocked_until).getTime() > Date.now()) {
    return res.status(429).json({
      error: 'TOO_MANY_ATTEMPTS',
      verified: false,
      message: 'Too many password attempts. Please wait before trying again.'
    });
  }

  const verified = await bcrypt.compare(password, store.password_hash);
  if (!verified) {
    const savedAttempt = await query(
      `INSERT INTO storefront_password_attempts (
         store_id, ip_hash, window_started_at, attempt_count, blocked_until, updated_at
       )
       VALUES ($1, $2, NOW(), 1, NULL, NOW())
       ON CONFLICT (store_id, ip_hash) DO UPDATE SET
         attempt_count = CASE
           WHEN storefront_password_attempts.window_started_at < NOW() - INTERVAL '10 minutes' THEN 1
           ELSE storefront_password_attempts.attempt_count + 1
         END,
         window_started_at = CASE
           WHEN storefront_password_attempts.window_started_at < NOW() - INTERVAL '10 minutes' THEN NOW()
           ELSE storefront_password_attempts.window_started_at
         END,
         blocked_until = CASE
           WHEN storefront_password_attempts.window_started_at < NOW() - INTERVAL '10 minutes' THEN NULL
           WHEN storefront_password_attempts.attempt_count + 1 >= 10 THEN NOW() + INTERVAL '10 minutes'
           ELSE NULL
         END,
         updated_at = NOW()
       RETURNING attempt_count, blocked_until`,
      [store.id, ipHash]
    );

    if (Number(savedAttempt.rows[0]?.attempt_count || 0) >= 10) {
      return res.status(429).json({
        error: 'TOO_MANY_ATTEMPTS',
        verified: false,
        message: 'Too many password attempts. Please wait before trying again.'
      });
    }
    return res.json({ verified: false, message: 'Incorrect storefront password.' });
  }

  await query(
    `DELETE FROM storefront_password_attempts WHERE store_id = $1 AND ip_hash = $2`,
    [store.id, ipHash]
  );

  const accessToken = jwt.sign(
    { scope: 'STOREFRONT_PASSWORD', storeId: store.id, slug: store.slug },
    JWT_SECRET,
    { expiresIn: '4h', issuer: 'billionbiz-storefront', subject: store.id }
  );
  return res.json({ verified: true, accessToken, expiresInSeconds: 4 * 60 * 60 });
});

// GET /api/v1/storefront/render (Render active storefront or draft preview)
storefrontRouter.get('/render', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const storeRes = await query(`SELECT id, name, slug, currency, timezone, status FROM stores WHERE id = $1`, [storeId]);
  const store = storeRes.rows[0];

  if (!store) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Tenant store not found' });
  }

  let pagesRes = await query(
    `SELECT p.*,
            COALESCE(pd.sections, '[]'::jsonb) AS sections,
            COALESCE(pd.page_props, p.page_props) AS draft_page_props,
            COALESCE(pd.version, 0) AS draft_version
     FROM store_pages p
     LEFT JOIN LATERAL (
       SELECT sections, page_props, version
       FROM page_draft_versions
       WHERE page_id = p.id
       ORDER BY version DESC, created_at DESC
       LIMIT 1
     ) pd ON TRUE
     WHERE p.store_id = $1
     ORDER BY (CASE WHEN p.path = '/' THEN 0 ELSE 1 END), p.is_system DESC, p.name ASC`,
    [storeId]
  );
  if (pagesRes.rowCount === 0) {
    await withTransaction(async (client) => {
      await provisionDefaultStorefront({
        client,
        storeId,
        storeName: store.name || 'Online Store',
        storeSlug: store.slug || 'store',
        mode: 'COMMERCE',
        userId: req.auth?.userId
      });
    });
    pagesRes = await query(
      `SELECT * FROM store_pages WHERE store_id = $1 ORDER BY (CASE WHEN path = '/' THEN 0 ELSE 1 END), is_system DESC, name ASC`,
      [storeId]
    );
  }

  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
  const latestRel = await query(
    `SELECT r.id, r.snapshot, r.release_number, r.content_hash
     FROM storefront_settings ss
     JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
     WHERE ss.store_id = $1
     LIMIT 1`,
    [storeId]
  );

  const productsRes = await query(
    `SELECT p.id, p.name, p.handle, p.description, p.product_type, p.media,
            v.id as variant_id, v.sku, v.price_minor, v.compare_at_minor
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.store_id = $1 AND p.status = 'ACTIVE'
     ORDER BY p.created_at DESC
     LIMIT 24`,
    [storeId]
  );

  const offeringsRes = await query(
    `SELECT id, name, handle, description, duration_minutes, price_minor, deposit_required_minor
     FROM offerings
     WHERE store_id = $1 AND is_active = TRUE
     ORDER BY name ASC
     LIMIT 24`,
    [storeId]
  );

  const categoriesRes = await query(
    `SELECT id, name, slug, description FROM categories WHERE store_id = $1 AND is_active = TRUE ORDER BY name ASC`,
    [storeId]
  );

  const settingsRes = await query(
    `SELECT mode, home_page, navigation_config, icon_visibility, brand_name, tagline, logo_url, favicon_url, social_links, primary_domain, password_enabled, maintenance_mode, ui_config
     FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const settingsRow = settingsRes.rows[0] || {};

  res.json({
    store,
    theme: themeRes.rows[0] || { preset_name: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} },
    pages: pagesRes.rows,
    products: productsRes.rows,
    offerings: offeringsRes.rows,
    categories: categoriesRes.rows,
    brand: {
      name: settingsRow.brand_name || store.name,
      tagline: settingsRow.tagline || '',
      logoUrl: settingsRow.logo_url || '',
      faviconUrl: settingsRow.favicon_url || '',
      socialLinks: settingsRow.social_links || {}
    },
    settings: {
      mode: settingsRow.mode || 'COMMERCE',
      homePage: settingsRow.home_page || 'LANDING',
      navigation: settingsRow.navigation_config || [],
      primaryDomain: settingsRow.primary_domain || `${store.slug}.${PLATFORM_MAIN_DOMAIN}`,
      passwordEnabled: settingsRow.password_enabled || false,
      maintenanceMode: settingsRow.maintenance_mode || false,
      uiConfig: settingsRow.ui_config || {}
    },
    activeRelease: latestRel.rows[0]?.snapshot || null,
    releaseNumber: latestRel.rows[0]?.release_number || null
  });
});

// PATCH /api/v1/storefront/pages/:id/draft (Save Editor Draft Sections, T-010, REQ-STORE-002)
storefrontRouter.patch(
  '/pages/:id/draft',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;
    const { sections, pageProps, expectedVersion, seoTitle, seoDescription } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'INVALID_DRAFT', message: 'Sections must be an array.' });
    }

    const sectionValidation = validatePageSectionDocument(sections);
    if (!sectionValidation.valid) {
      return res.status(400).json({
        error: 'INVALID_SECTION_DOCUMENT',
        message: 'One or more sections do not match their registered schema.',
        issues: sectionValidation.issues
      });
    }
    if (pageProps !== undefined && (!pageProps || typeof pageProps !== 'object' || Array.isArray(pageProps))) {
      return res.status(400).json({ error: 'INVALID_DRAFT', message: 'Page properties must be an object.' });
    }
    if (seoTitle !== undefined && (typeof seoTitle !== 'string' || seoTitle.length > 70)) {
      return res.status(400).json({ error: 'INVALID_SEO_TITLE', message: 'SEO title must be text with a maximum length of 70 characters.' });
    }
    if (seoDescription !== undefined && (typeof seoDescription !== 'string' || seoDescription.length > 320)) {
      return res.status(400).json({ error: 'INVALID_SEO_DESCRIPTION', message: 'SEO description must be text with a maximum length of 320 characters.' });
    }
    if (expectedVersion !== undefined && (!Number.isInteger(Number(expectedVersion)) || Number(expectedVersion) < 0)) {
      return res.status(400).json({ error: 'INVALID_DRAFT_VERSION', message: 'Expected draft version must be a non-negative integer.' });
    }

    const saveOutcome: {
      pageNotFound: boolean;
      versionConflict: { currentVersion: number } | null;
      nextVersion: number;
    } = {
      pageNotFound: false,
      versionConflict: null,
      nextVersion: 0
    };

    await withTransaction(async (client) => {
      // Lock the page row so concurrent autosaves allocate distinct versions.
      const pageRes = await client.query(
        `SELECT id FROM store_pages WHERE id = $1 AND store_id = $2 FOR UPDATE`,
        [pageId, storeId]
      );
      if (pageRes.rowCount === 0) {
        saveOutcome.pageNotFound = true;
        return;
      }

      const latestRes = await client.query(
        `SELECT version FROM page_draft_versions WHERE page_id = $1 ORDER BY version DESC LIMIT 1`,
        [pageId]
      );
      const currentVersion = Number(latestRes.rows[0]?.version || 0);
      if (expectedVersion !== undefined && Number(expectedVersion) !== currentVersion) {
        saveOutcome.versionConflict = { currentVersion };
        return;
      }

      saveOutcome.nextVersion = currentVersion + 1;
      await client.query(
        `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`draft-${uuidv4()}`, pageId, saveOutcome.nextVersion, JSON.stringify(sections), JSON.stringify(pageProps || {}), req.auth?.userId]
      );

      await client.query(
        `UPDATE store_pages SET
           status = 'draft',
           seo_title = COALESCE($1, seo_title),
           seo_description = COALESCE($2, seo_description),
           updated_at = NOW()
         WHERE id = $3 AND store_id = $4`,
        [seoTitle !== undefined ? seoTitle : null, seoDescription !== undefined ? seoDescription : null, pageId, storeId]
      );
    });

    if (saveOutcome.pageNotFound) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const versionConflict = saveOutcome.versionConflict;
    if (versionConflict) {
      return res.status(409).json({
        error: 'DRAFT_VERSION_CONFLICT',
        message: 'This page draft changed in another session. Refresh the draft before saving again.',
        currentVersion: versionConflict.currentVersion
      });
    }

    res.json({ message: 'Draft saved successfully', pageId, version: saveOutcome.nextVersion });
  }
);

// POST /api/v1/storefront/publish and /releases/publish (Atomic Whole-Store Publish All, T-011, REQ-STORE-006)
storefrontRouter.post(
  ['/publish', '/releases/publish'],
  requireAuth,
  resolveTenant,
  requirePermission('store.publish'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { notes } = req.body;

    let releaseNumber = 1;
    let releaseId = `rel-${uuidv4()}`;
    let publicationValidationIssues: Array<{ pageId: string; pageName: string; path: string; issues: Array<{ path: string; message: string }> }> = [];

    await withTransaction(async (client) => {
      // 1. Get next release number
      // Serialize publishers per store so parallel publish requests cannot
      // allocate the same release number or race the active-release pointer.
      await client.query(
        `SELECT store_id FROM storefront_settings WHERE store_id = $1 FOR UPDATE`,
        [storeId]
      );
      const numRes = await client.query(
        `SELECT COALESCE(MAX(release_number), 0) + 1 as next_num FROM store_releases WHERE store_id = $1`,
        [storeId]
      );
      releaseNumber = numRes.rows[0].next_num;

      // 2. Snapshot theme
      const themeRes = await client.query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
      const themeSnapshot = themeRes.rows[0] || {};

      // 3. Snapshot all pages + their latest drafts
      const pagesRes = await client.query(
        `SELECT p.id, p.name, p.path, p.type, p.category, p.seo_title, p.seo_description, p.template_key, p.is_system, p.is_locked, 'published'::text AS status,
                COALESCE(
                  (SELECT pd.sections FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC, pd.created_at DESC LIMIT 1),
                  '[]'::jsonb
                ) as sections,
                COALESCE(
                  (SELECT pd.page_props FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1),
                  p.page_props
                ) as page_props
         FROM store_pages p
         WHERE p.store_id = $1`,
        [storeId]
      );

      // Validate every page at the API boundary before a release can be created.
      const invalidPages = pagesRes.rows.flatMap((page: any) => {
        const validation = validatePageSectionDocument(page.sections);
        return validation.valid
          ? []
          : [{ pageId: page.id, pageName: page.name, path: page.path, issues: validation.issues }];
      });
      if (invalidPages.length > 0) {
        publicationValidationIssues = invalidPages;
        return;
      }

      // 4. Snapshot brand, navigation, settings
      const settingsRes = await client.query(`SELECT * FROM storefront_settings WHERE store_id = $1`, [storeId]);
      const settingsRow = settingsRes.rows[0] || {};

      const storeSnapshot = {
        brand: {
          name: settingsRow.brand_name,
          tagline: settingsRow.tagline,
          logoUrl: settingsRow.logo_url,
          faviconUrl: settingsRow.favicon_url,
          socialLinks: settingsRow.social_links
        },
        theme: themeSnapshot,
        navigation: settingsRow.navigation_config || [],
        settings: {
          mode: settingsRow.mode,
          homePage: settingsRow.home_page,
          primaryDomain: settingsRow.primary_domain,
          passwordEnabled: settingsRow.password_enabled,
          maintenanceMode: settingsRow.maintenance_mode,
          seoDefaults: settingsRow.seo_defaults || {},
          uiConfig: settingsRow.ui_config || {}
        },
        pages: pagesRes.rows,
        publishedAt: new Date().toISOString()
      };

      const contentHash = crypto.createHash('sha256').update(JSON.stringify(storeSnapshot)).digest('hex');

      // 5. Create immutable release record
      await client.query(
        `INSERT INTO store_releases (id, store_id, release_number, content_hash, snapshot, published_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [releaseId, storeId, releaseNumber, contentHash, JSON.stringify(storeSnapshot), req.auth?.userId, notes || 'Published release']
      );

      // 6. Update page statuses to 'published', active release pointer and ensure store is ACTIVE
      await client.query(
        `UPDATE store_pages SET status = 'published', updated_at = NOW() WHERE store_id = $1`,
        [storeId]
      );

      await client.query(
        `UPDATE storefront_settings SET active_release_id = $1, updated_at = NOW() WHERE store_id = $2`,
        [releaseId, storeId]
      );

      await client.query(
        `UPDATE stores SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1`,
        [storeId]
      );

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'PUBLISH_STORE_RELEASE',
        targetType: 'STORE_RELEASE',
        targetId: releaseId,
        changes: { releaseNumber, contentHash, pagesCount: pagesRes.rowCount }
      });
    });

    if (publicationValidationIssues.length > 0) {
      return res.status(400).json({
        error: 'INVALID_STOREFRONT_DOCUMENT',
        message: 'Publication blocked because one or more pages contain invalid section documents.',
        pages: publicationValidationIssues
      });
    }

    try {
      await enqueueOutbox({
        organizationId: req.tenant!.organizationId,
        storeId,
        eventType: 'STOREFRONT_RELEASE_PUBLISHED',
        aggregateType: 'STOREFRONT',
        aggregateId: releaseId,
        payload: { storeId, releaseId, releaseNumber }
      });
    } catch (error) {
      // Publication is already committed. Realtime delivery is best-effort;
      // clients can still fetch the active release on their next request.
      console.error('[Storefront] Failed to enqueue release notification:', error);
    }

    res.status(201).json({
      message: 'Store published atomically. New release active.',
      releaseId,
      releaseNumber
    });
  }
);

// GET /api/v1/storefront/releases (Release History)
storefrontRouter.get('/releases', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const releasesRes = await query(
    `SELECT id, release_number, content_hash, published_by, notes, created_at
     FROM store_releases
     WHERE store_id = $1
     ORDER BY release_number DESC`,
    [storeId]
  );
  res.json({ releases: releasesRes.rows });
});

// POST /api/v1/storefront/releases/:id/restore (Create and activate an immutable rollback release)
storefrontRouter.post(
  '/releases/:id/restore',
  requireAuth,
  resolveTenant,
  requirePermission('store.publish'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const sourceReleaseId = req.params.id as string;

    const sourceRes = await query(
      `SELECT release_number, snapshot
       FROM store_releases
       WHERE id = $1 AND store_id = $2`,
      [sourceReleaseId, storeId]
    );

    if (sourceRes.rowCount === 0) {
      return res.status(404).json({ error: 'RELEASE_NOT_FOUND', message: 'Release snapshot not found' });
    }

    const sourceSnapshot = sourceRes.rows[0].snapshot;
    if (!sourceSnapshot || !Array.isArray(sourceSnapshot.pages)) {
      return res.status(409).json({ error: 'INVALID_RELEASE_SNAPSHOT', message: 'The selected release does not contain a valid page snapshot.' });
    }

    const rollbackReleaseId = `rel-${uuidv4()}`;
    let rollbackReleaseNumber = 0;
    const restoredSnapshot = {
      ...sourceSnapshot,
      publishedAt: new Date().toISOString(),
      rollback: { sourceReleaseId, sourceReleaseNumber: Number(sourceRes.rows[0].release_number) }
    };
    const contentHash = crypto.createHash('sha256').update(JSON.stringify(restoredSnapshot)).digest('hex');

    await withTransaction(async (client) => {
      // Lock the store configuration row to serialize rollback with publishes.
      const settingsLock = await client.query(
        `SELECT * FROM storefront_settings WHERE store_id = $1 FOR UPDATE`,
        [storeId]
      );
      if (settingsLock.rowCount === 0) {
        throw new Error('Storefront settings are missing for this store.');
      }

      const nextRelease = await client.query(
        `SELECT COALESCE(MAX(release_number), 0) + 1 AS next_num
         FROM store_releases WHERE store_id = $1`,
        [storeId]
      );
      rollbackReleaseNumber = Number(nextRelease.rows[0].next_num);

      // Synchronize mutable editor state to the restored snapshot, but keep the
      // public storefront driven by the new immutable release pointer.
      const theme = restoredSnapshot.theme || {};
      await client.query(
        `INSERT INTO store_themes (
           id, store_id, preset_name, palette, typography, buttons, effects, custom_css, version, updated_at
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, NOW())
         ON CONFLICT (store_id) DO UPDATE SET
           preset_name = EXCLUDED.preset_name,
           palette = EXCLUDED.palette,
           typography = EXCLUDED.typography,
           buttons = EXCLUDED.buttons,
           effects = EXCLUDED.effects,
           custom_css = EXCLUDED.custom_css,
           version = store_themes.version + 1,
           updated_at = NOW()`,
        [
          `thm-${uuidv4()}`,
          storeId,
          theme.preset_name || theme.presetName || 'modern',
          JSON.stringify(theme.palette || {}),
          JSON.stringify(theme.typography || {}),
          JSON.stringify(theme.buttons || {}),
          JSON.stringify(theme.effects || {}),
          theme.custom_css || theme.customCss || ''
        ]
      );

      const brand = restoredSnapshot.brand || {};
      const settings = restoredSnapshot.settings || {};
      await client.query(
        `UPDATE storefront_settings SET
           brand_name = $1,
           tagline = $2,
           logo_url = $3,
           favicon_url = $4,
           social_links = $5,
           navigation_config = $6,
           mode = $7,
           home_page = $8,
           primary_domain = $9,
           password_enabled = $10,
           maintenance_mode = $11,
           ui_config = $12,
           updated_at = NOW()
         WHERE store_id = $13`,
        [
          brand.name || brand.brand_name || null,
          brand.tagline || '',
          brand.logoUrl || brand.logo_url || '',
          brand.faviconUrl || brand.favicon_url || '',
          JSON.stringify(brand.socialLinks || brand.social_links || {}),
          JSON.stringify(restoredSnapshot.navigation || []),
          settings.mode || 'COMMERCE',
          settings.homePage || 'LANDING',
          settings.primaryDomain || null,
          Boolean(settings.passwordEnabled ?? settings.password_enabled),
          Boolean(settings.maintenanceMode ?? settings.maintenance_mode),
          JSON.stringify(settings.uiConfig || {}),
          storeId
        ]
      );

      const snapshotPageIds: string[] = [];
      for (const page of restoredSnapshot.pages) {
        if (!page?.id) continue;
        const pageLock = await client.query(
          `SELECT id FROM store_pages WHERE id = $1 AND store_id = $2 FOR UPDATE`,
          [page.id, storeId]
        );
        if (pageLock.rowCount === 0) continue;

        snapshotPageIds.push(page.id);
        const nextVersionRes = await client.query(
          `SELECT COALESCE(MAX(version), 0) + 1 AS next_ver
           FROM page_draft_versions WHERE page_id = $1`,
          [page.id]
        );
        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            `draft-${uuidv4()}`,
            page.id,
            Number(nextVersionRes.rows[0].next_ver),
            JSON.stringify(Array.isArray(page.sections) ? page.sections : []),
            JSON.stringify(page.page_props || page.pageProps || {}),
            req.auth?.userId
          ]
        );
        await client.query(
          `UPDATE store_pages SET
             name = COALESCE($1, name),
             path = CASE WHEN is_locked THEN path ELSE COALESCE($2, path) END,
             type = COALESCE($3, type),
             category = COALESCE($4, category),
             seo_title = COALESCE($5, seo_title),
             seo_description = COALESCE($6, seo_description),
             template_key = COALESCE($7, template_key),
             status = 'published',
             updated_at = NOW()
           WHERE id = $8 AND store_id = $9`,
          [
            page.name || null,
            page.path || null,
            page.type || null,
            page.category || null,
            page.seo_title || null,
            page.seo_description || null,
            page.template_key || null,
            page.id,
            storeId
          ]
        );
      }

      if (snapshotPageIds.length > 0) {
        await client.query(
          `UPDATE store_pages SET status = 'draft', updated_at = NOW()
           WHERE store_id = $1 AND NOT (id = ANY($2::text[]))`,
          [storeId, snapshotPageIds]
        );
      }

      await client.query(
        `INSERT INTO store_releases (id, store_id, release_number, content_hash, snapshot, published_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          rollbackReleaseId,
          storeId,
          rollbackReleaseNumber,
          contentHash,
          JSON.stringify(restoredSnapshot),
          req.auth?.userId,
          `Rollback to release ${sourceRes.rows[0].release_number}`
        ]
      );

      // Insert the rollback release before activating its foreign-key pointer.
      await client.query(
        `UPDATE storefront_settings SET active_release_id = $1, updated_at = NOW() WHERE store_id = $2`,
        [rollbackReleaseId, storeId]
      );

      await client.query(
        `UPDATE stores SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1`,
        [storeId]
      );

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'RESTORE_STORE_RELEASE',
        targetType: 'STORE_RELEASE',
        targetId: rollbackReleaseId,
        changes: { restoredFrom: sourceReleaseId, releaseNumber: rollbackReleaseNumber }
      });
    });

    try {
      await enqueueOutbox({
        organizationId: req.tenant!.organizationId,
        storeId,
        eventType: 'STOREFRONT_RELEASE_PUBLISHED',
        aggregateType: 'STOREFRONT',
        aggregateId: rollbackReleaseId,
        payload: { storeId, releaseId: rollbackReleaseId, releaseNumber: rollbackReleaseNumber, restoredFrom: sourceReleaseId }
      });
    } catch (error) {
      console.error('[Storefront] Failed to enqueue rollback release notification:', error);
    }

    res.status(201).json({
      message: 'Previous storefront version restored and activated.',
      releaseId: rollbackReleaseId,
      releaseNumber: rollbackReleaseNumber,
      restoredFrom: sourceReleaseId
    });
  }
);

// GET /api/v1/storefront/navigation
storefrontRouter.get('/navigation', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT navigation_config FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );

  let navConfig = [
    { id: 'nav-home', label: 'Home', path: '/', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-shop', label: 'Shop Catalogue', path: '/shop', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-book', label: 'Book Appointment', path: '/booking', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-privacy', label: 'Privacy Policy', path: '/privacy', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-terms', label: 'Terms of Service', path: '/terms', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-contact', label: 'Contact Us', path: '/contact', target: '_self', is_active: true, menu_type: 'FOOTER' }
  ];

  if (settingsRes.rowCount && settingsRes.rowCount > 0 && settingsRes.rows[0].navigation_config) {
    const raw = settingsRes.rows[0].navigation_config;
    if (Array.isArray(raw)) {
      navConfig = raw;
    }
  }

  res.json({ navigation: navConfig });
});

// PATCH /api/v1/storefront/navigation (Update Store Menus)
storefrontRouter.patch(
  '/navigation',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { navigation } = req.body;

    if (!Array.isArray(navigation)) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Navigation must be an array of menu items' });
    }

    await query(
      `INSERT INTO storefront_settings (store_id, navigation_config, mode, home_page)
       VALUES ($1, $2, 'BOTH', 'LANDING')
       ON CONFLICT (store_id) DO UPDATE SET
         navigation_config = $2,
         updated_at = NOW()`,
      [storeId, JSON.stringify(navigation)]
    );

    res.json({ message: 'Navigation menus updated successfully', navigation });
  }
);

// GET /api/v1/storefront/brand
storefrontRouter.get('/brand', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT brand_name, tagline, logo_url, favicon_url, social_links FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const storeRes = await query(`SELECT name FROM stores WHERE id = $1`, [storeId]);
  const s = settingsRes.rows[0] || {};
  const brandDisplayName = s.brand_name || storeRes.rows[0]?.name || 'My Store';
  res.json({
    brand: {
      name: brandDisplayName,
      tagline: s.tagline || '',
      logoUrl: s.logo_url || '',
      faviconUrl: s.favicon_url || '',
      socialLinks: s.social_links || {}
    }
  });
});

// PATCH /api/v1/storefront/brand
storefrontRouter.patch(
  '/brand',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, brandName, tagline, logoUrl, faviconUrl, socialLinks } = req.body;
    const effectiveBrandName = brandName ?? name;

    if (effectiveBrandName !== undefined && (typeof effectiveBrandName !== 'string' || !effectiveBrandName.trim())) {
      return res.status(400).json({
        error: 'INVALID_BRAND_NAME',
        message: 'Brand display name must be a non-empty string.'
      });
    }

    const updated = await query(
      `INSERT INTO storefront_settings (store_id, brand_name, tagline, logo_url, favicon_url, social_links)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id) DO UPDATE SET
         brand_name = COALESCE($2, storefront_settings.brand_name),
         tagline = COALESCE($3, storefront_settings.tagline),
         logo_url = COALESCE($4, storefront_settings.logo_url),
         favicon_url = COALESCE($5, storefront_settings.favicon_url),
         social_links = COALESCE($6, storefront_settings.social_links),
         updated_at = NOW()
       RETURNING brand_name, tagline, logo_url, favicon_url, social_links`,
      [
        storeId,
        effectiveBrandName || null,
        tagline !== undefined ? tagline : null,
        logoUrl !== undefined ? logoUrl : null,
        faviconUrl !== undefined ? faviconUrl : null,
        socialLinks ? JSON.stringify(socialLinks) : null
      ]
    );

    res.json({
      message: 'Brand presentation updated successfully',
      brand: {
        name: updated.rows[0].brand_name,
        tagline: updated.rows[0].tagline,
        logoUrl: updated.rows[0].logo_url,
        faviconUrl: updated.rows[0].favicon_url,
        socialLinks: updated.rows[0].social_links
      }
    });
  }
);

// GET /api/v1/storefront/settings
storefrontRouter.get('/settings', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT mode, home_page, primary_domain, password_enabled, maintenance_mode, redirects, seo_defaults, ui_config
     FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const domainsRes = await query(
    `SELECT id, domain, is_primary, is_verified, ssl_status FROM store_domains WHERE store_id = $1 ORDER BY is_primary DESC, created_at ASC`,
    [storeId]
  );

  const s = settingsRes.rows[0] || {};
  res.json({
    settings: {
      mode: s.mode || 'COMMERCE',
      homePage: s.home_page || 'LANDING',
      primaryDomain: s.primary_domain || domainsRes.rows.find((d: any) => d.is_primary)?.domain || null,
      passwordEnabled: s.password_enabled || false,
      maintenanceMode: s.maintenance_mode || false,
      redirects: s.redirects || [],
      seoDefaults: s.seo_defaults || {},
      uiConfig: s.ui_config || {},
      domains: domainsRes.rows
    }
  });
});

// PATCH /api/v1/storefront/settings
storefrontRouter.patch(
  '/settings',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { passwordEnabled, password, maintenanceMode, redirects, seoDefaults, primaryDomain, uiConfig } = req.body;

    if (uiConfig !== undefined && (!uiConfig || typeof uiConfig !== 'object' || Array.isArray(uiConfig) || Buffer.byteLength(JSON.stringify(uiConfig), 'utf8') > 64000)) {
      return res.status(400).json({ error: 'INVALID_STOREFRONT_UI_CONFIG', message: 'Storefront interface settings must be an object smaller than 64 KB.' });
    }

    if (primaryDomain !== undefined && primaryDomain !== null && String(primaryDomain).trim() !== '') {
      const domainCheck = await query(
        `SELECT 1
         FROM store_domains
         WHERE store_id = $1
           AND LOWER(domain) = LOWER($2)
           AND is_verified = TRUE
           AND UPPER(ssl_status) = 'ACTIVE'
         LIMIT 1`,
        [storeId, String(primaryDomain).trim()]
      );
      if (domainCheck.rowCount === 0) {
        return res.status(409).json({
          error: 'DOMAIN_NOT_READY',
          message: 'Only a domain mapped to this store with completed verification and active HTTPS can be selected as the primary storefront domain.'
        });
      }
    }

    if (password !== undefined && (typeof password !== 'string' || password.trim().length < 4 || password.trim().length > 128)) {
      return res.status(400).json({
        error: 'INVALID_STOREFRONT_PASSWORD',
        message: 'Storefront passwords must contain between 4 and 128 characters.'
      });
    }

    if (passwordEnabled === true && (!password || typeof password !== 'string' || password.trim().length < 4)) {
      const existingPassword = await query(
        `SELECT password_hash FROM storefront_settings WHERE store_id = $1`,
        [storeId]
      );
      if (!existingPassword.rows[0]?.password_hash) {
        return res.status(400).json({
          error: 'STOREFRONT_PASSWORD_REQUIRED',
          message: 'Set a storefront password before enabling password protection.'
        });
      }
    }

    let passwordHash: string | null = null;
    if (password) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await query(
      `INSERT INTO storefront_settings (
         store_id, password_enabled, password_hash, maintenance_mode, redirects, seo_defaults, primary_domain, ui_config
       )
       VALUES (
         $1,
         COALESCE($2, FALSE),
         $3,
         COALESCE($4, FALSE),
         COALESCE($5::jsonb, '[]'::jsonb),
         COALESCE($6::jsonb, '{}'::jsonb),
         $7,
         COALESCE($8::jsonb, '{}'::jsonb)
       )
       ON CONFLICT (store_id) DO UPDATE SET
         password_enabled = COALESCE($2, storefront_settings.password_enabled),
         password_hash = COALESCE($3, storefront_settings.password_hash),
         maintenance_mode = COALESCE($4, storefront_settings.maintenance_mode),
         redirects = COALESCE($5, storefront_settings.redirects),
         seo_defaults = COALESCE($6, storefront_settings.seo_defaults),
         primary_domain = COALESCE($7, storefront_settings.primary_domain),
         ui_config = COALESCE($8::jsonb, storefront_settings.ui_config),
         updated_at = NOW()
       RETURNING mode, home_page, primary_domain, password_enabled, maintenance_mode, redirects, seo_defaults, ui_config`,
      [
        storeId,
        passwordEnabled !== undefined ? Boolean(passwordEnabled) : null,
        passwordHash,
        maintenanceMode !== undefined ? Boolean(maintenanceMode) : null,
        redirects ? JSON.stringify(redirects) : null,
        seoDefaults ? JSON.stringify(seoDefaults) : null,
        primaryDomain || null,
        uiConfig !== undefined ? JSON.stringify(uiConfig) : null
      ]
    );

    res.json({ message: 'Storefront settings updated successfully', settings: updated.rows[0] });
  }
);

// GET /api/v1/storefront/domains
storefrontRouter.get('/domains', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const domainsRes = await query(
    `SELECT id, domain, is_primary, is_verified, ssl_status, created_at
     FROM store_domains
     WHERE store_id = $1
     ORDER BY is_primary DESC, created_at ASC`,
    [storeId]
  );
  res.json({ domains: domainsRes.rows });
});

// Readiness is based on live DNS and HTTPS probes. A database mapping alone
// must never be presented as a public storefront.
storefrontRouter.get('/provisioning/status', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const row = await query(
    `SELECT s.slug, sp.*, sd.id AS domain_id, sd.domain, sd.is_verified, sd.ssl_status
     FROM stores s LEFT JOIN storefront_provisioning sp ON sp.store_id = s.id
     LEFT JOIN store_domains sd ON sd.store_id = s.id AND sd.is_primary = TRUE
     WHERE s.id = $1 LIMIT 1`, [storeId]);
  if (!row.rowCount) return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store was not found.' });
  const state = row.rows[0];
  let dnsStatus = 'PENDING';
  let httpsStatus = 'PENDING';
  let dnsError = '';
  const expected = env.STORE_DOMAIN_CNAME_TARGET?.trim().toLowerCase().replace(/\.$/, '');
  if (state.domain) {
    let cnames: string[] = [];
    try {
      cnames = await resolveCname(state.domain);
    } catch { /* Proxied Cloudflare wildcard records resolve to A/AAAA, not CNAME. */ }
    const normalizedCnames = cnames.map((value) => value.trim().toLowerCase().replace(/\.$/, ''));
    if (normalizedCnames.length) {
      dnsStatus = !expected || normalizedCnames.includes(expected) ? 'ACTIVE' : 'MISMATCH';
      if (dnsStatus !== 'ACTIVE') dnsError = 'DNS CNAME does not match the configured storefront runtime.';
    } else {
      const addresses = await Promise.allSettled([resolve4(state.domain), resolve6(state.domain)]);
      const hasAddress = addresses.some((result) => result.status === 'fulfilled' && result.value.length > 0);
      if (hasAddress) dnsStatus = 'ACTIVE';
      else dnsError = 'Store domain does not resolve through the configured wildcard DNS record yet.';
    }
    if (dnsStatus === 'ACTIVE') {
      try {
        const response = await fetch(`https://${state.domain}/`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5000) });
        httpsStatus = response.status >= 200 && response.status < 400 ? 'ACTIVE' : 'PENDING';
        if (httpsStatus !== 'ACTIVE') dnsError = `Storefront runtime returned HTTP ${response.status} for this hostname.`;
      } catch { httpsStatus = 'PENDING'; dnsError = 'DNS resolves, but HTTPS is not ready on this storefront hostname.'; }
    }
  } else dnsError = 'No primary store hostname is configured.';
  if (state.domain_id && dnsStatus === 'ACTIVE' && httpsStatus === 'ACTIVE') {
    await query(`UPDATE store_domains SET is_verified = TRUE, ssl_status = 'ACTIVE' WHERE id = $1`, [state.domain_id]);
    await query(`UPDATE storefront_provisioning SET status = 'LIVE', domain_status = 'ACTIVE', https_status = 'ACTIVE', last_error = NULL, updated_at = NOW() WHERE store_id = $1`, [storeId]);
  } else {
    await query(`UPDATE storefront_provisioning SET domain_status = $2, https_status = $3, last_error = $4, updated_at = NOW() WHERE store_id = $1`, [storeId, dnsStatus, httpsStatus, dnsError || (dnsStatus === 'ACTIVE' ? 'HTTPS certificate or storefront response is not ready.' : null)]);
  }
  res.json({
    // Never reflect a stale LIVE database status while the current probes fail.
    // LOCAL_READY describes an editor preview only; public readiness is LIVE only
    // after both the configured DNS target and HTTPS response have been verified.
    status: dnsStatus === 'ACTIVE' && httpsStatus === 'ACTIVE'
      ? 'LIVE'
      : state.status === 'FAILED'
        ? 'FAILED'
        : state.status === 'LOCAL_READY'
          ? 'LOCAL_READY'
          : 'PENDING',
    projectName: state.project_name || `billionbiz-store-${req.tenant!.storeId}`,
    localProjectPath: state.local_project_path || null,
    deploymentUrl: state.deployment_url || null,
    previewUrl: (() => {
      const configuredBase = process.env.BILLIONBIZ_STORE_PREVIEW_BASE_URL?.trim();
      const previewBase = configuredBase || (env.NODE_ENV === 'production' ? '' : 'http://localhost:5173');
      return previewBase ? `${previewBase.replace(/\/+$/, '')}/store/${encodeURIComponent(state.slug || 'store')}` : null;
    })(),
    domain: state.domain,
    domainStatus: dnsStatus,
    httpsStatus,
    error: dnsError || (httpsStatus !== 'ACTIVE' ? 'Public HTTPS is not ready yet.' : null),
    attempts: Number(state.attempts || 0)
  });
});

storefrontRouter.post('/provisioning/retry', requireAuth, resolveTenant, requirePermission('store.editor.edit'), async (req: Request, res: Response) => {
  if (!isStoreProjectManagerEnabled()) {
    return res.status(503).json({
      error: 'LOCAL_PREVIEW_RUNTIME_DISABLED',
      message: 'Local store previews are disabled for this backend runtime. Enable BILLIONBIZ_STORE_PROJECT_MODE=local for preview workers, or configure production deployment credentials for live publishing.'
    });
  }
  const storeId = req.tenant!.storeId;
  await query(`UPDATE storefront_provisioning SET status = 'PENDING', last_error = NULL, updated_at = NOW() WHERE store_id = $1`, [storeId]);
  await syncStoreProjects();
  res.json({ message: 'Store project provisioning was retried. Check readiness again shortly.' });
});

// POST /api/v1/storefront/domains
storefrontRouter.post(
  '/domains',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string') {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'A valid domain hostname is required (e.g. shop.example.com).' });
    }
    const cleanDomain = domain.trim().toLowerCase().replace(/\.$/, '');
    const hostnamePattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/;
    if (!hostnamePattern.test(cleanDomain) || cleanDomain === PLATFORM_MAIN_DOMAIN || cleanDomain.endsWith(`.${PLATFORM_MAIN_DOMAIN}`)) {
      return res.status(400).json({ error: 'INVALID_DOMAIN', message: 'Enter a fully qualified custom hostname. Platform subdomains are managed automatically.' });
    }

    const existing = await query(`SELECT id FROM store_domains WHERE LOWER(domain) = LOWER($1)`, [cleanDomain]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: 'DOMAIN_ALREADY_CONNECTED', message: 'This domain is already mapped to a store.' });
    }

    const domainId = `dom-${uuidv4()}`;
    const insertedDomain = await query(
      `INSERT INTO store_domains (id, store_id, domain, is_primary, is_verified, ssl_status)
       VALUES ($1, $2, $3, FALSE, FALSE, 'PENDING')
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [domainId, storeId, cleanDomain]
    );
    if (insertedDomain.rowCount === 0) {
      return res.status(409).json({
        error: 'DOMAIN_ALREADY_CONNECTED',
        message: 'This domain is already mapped to a store.'
      });
    }

    res.status(201).json({
      message: 'Domain connected. Complete DNS configuration to verify.',
      domain: {
        id: domainId,
        domain: cleanDomain,
        isPrimary: false,
        isVerified: false,
        sslStatus: 'PENDING',
        dnsInstructions: env.STORE_DOMAIN_CNAME_TARGET
          ? {
              type: 'CNAME',
              host: cleanDomain.split('.')[0],
              target: env.STORE_DOMAIN_CNAME_TARGET
            }
          : null
      }
    });
  }
);

// POST /api/v1/storefront/domains/:id/verify
storefrontRouter.post(
  '/domains/:id/verify',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(`SELECT * FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }

    // Verify the shared wildcard route without requiring a DNS row per store.
    // Cloudflare-proxied records return A/AAAA answers, while DNS-only records
    // expose their CNAME. Either is acceptable after the hostname resolves.
    const expectedCname = env.STORE_DOMAIN_CNAME_TARGET?.trim().toLowerCase().replace(/\.$/, '');
    let cnameRecords: string[] = [];
    try {
      cnameRecords = await resolveCname(domRes.rows[0].domain);
    } catch { /* proxied wildcard mode */ }
    const normalizedRecords = cnameRecords.map((record) => record.trim().toLowerCase().replace(/\.$/, ''));
    const cnameMatches = normalizedRecords.length > 0 && (!expectedCname || normalizedRecords.includes(expectedCname));
    const addresses = normalizedRecords.length ? [] : await Promise.allSettled([
      resolve4(domRes.rows[0].domain), resolve6(domRes.rows[0].domain)
    ]);
    const hasAddress = addresses.some((result) => result.status === 'fulfilled' && result.value.length > 0);
    if (!cnameMatches && !hasAddress) {
      return res.status(409).json({
        error: 'DOMAIN_DNS_NOT_READY',
        message: 'The hostname does not resolve through the shared wildcard DNS record yet.',
        expectedTarget: expectedCname || null,
        receivedTargets: normalizedRecords
      });
    }

    let httpsReady = false;
    try {
      const response = await fetch(`https://${domRes.rows[0].domain}/`, { method: 'HEAD', redirect: 'manual', signal: AbortSignal.timeout(5000) });
      httpsReady = response.status >= 200 && response.status < 400;
    } catch { httpsReady = false; }
    if (!httpsReady) {
      return res.status(409).json({ error: 'DOMAIN_HTTPS_NOT_READY', message: 'DNS resolves, but HTTPS is not active for this hostname yet.' });
    }

    await query(
      `UPDATE store_domains SET is_verified = TRUE, ssl_status = 'ACTIVE' WHERE id = $1 AND store_id = $2`,
      [domainId, storeId]
    );

    res.status(202).json({
      message: 'Wildcard DNS and HTTPS are verified for this hostname.',
      isVerified: true,
      sslStatus: 'ACTIVE'
    });
  }
);

// POST /api/v1/storefront/domains/:id/primary
storefrontRouter.post(
  '/domains/:id/primary',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(
      `SELECT domain, is_verified, ssl_status FROM store_domains WHERE id = $1 AND store_id = $2`,
      [domainId, storeId]
    );
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }
    if (!domRes.rows[0].is_verified || String(domRes.rows[0].ssl_status).toUpperCase() !== 'ACTIVE') {
      return res.status(409).json({
        error: 'DOMAIN_NOT_READY',
        message: 'A domain must pass DNS verification and have an active SSL certificate before it can become primary.'
      });
    }
    const targetDomain = domRes.rows[0].domain;

    await withTransaction(async (client) => {
      await client.query(`UPDATE store_domains SET is_primary = FALSE WHERE store_id = $1`, [storeId]);
      await client.query(`UPDATE store_domains SET is_primary = TRUE WHERE id = $1`, [domainId]);
      await client.query(
        `UPDATE storefront_settings SET primary_domain = $1, updated_at = NOW() WHERE store_id = $2`,
        [targetDomain, storeId]
      );
    });

    res.json({ message: `'${targetDomain}' is now the primary domain for your store.`, primaryDomain: targetDomain });
  }
);

// DELETE /api/v1/storefront/domains/:id
storefrontRouter.delete(
  '/domains/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(`SELECT domain, is_primary FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }
    const { domain, is_primary } = domRes.rows[0];

    if (domain.endsWith(`.${PLATFORM_MAIN_DOMAIN}`)) {
      return res.status(400).json({ error: 'CANNOT_REMOVE_PLATFORM_DOMAIN', message: 'The default platform subdomain cannot be removed.' });
    }
    if (is_primary) {
      return res.status(400).json({ error: 'CANNOT_REMOVE_PRIMARY_DOMAIN', message: 'Set another domain as primary before removing this one.' });
    }

    await query(`DELETE FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    res.json({ message: `Domain '${domain}' removed successfully.` });
  }
);

// GET /api/v1/storefront/validate-publish
storefrontRouter.get(
  '/validate-publish',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const issues: Array<{ severity: 'error' | 'warning'; code: string; message: string; field?: string }> = [];

    // 1. Check home page exists
    const homeRes = await query(`SELECT id FROM store_pages WHERE store_id = $1 AND path = '/'`, [storeId]);
    if (homeRes.rowCount === 0) {
      issues.push({ severity: 'error', code: 'MISSING_HOME_PAGE', message: 'Your store must have a root Home page (path /).' });
    }

    // 2. Check store status
    const storeRes = await query(`SELECT status, name FROM stores WHERE id = $1`, [storeId]);
    if (!storeRes.rows[0] || storeRes.rows[0].status !== 'ACTIVE') {
      issues.push({ severity: 'warning', code: 'STORE_INACTIVE', message: 'Store status is currently not ACTIVE.' });
    }

    // 3. Check primary domain
    const domRes = await query(`SELECT domain FROM store_domains WHERE store_id = $1 AND is_primary = TRUE`, [storeId]);
    if (domRes.rowCount === 0) {
      issues.push({ severity: 'warning', code: 'NO_PRIMARY_DOMAIN', message: 'No primary domain configured. Stores will fall back to platform subdomain.' });
    }

    // 4. Check policy pages
    const policiesRes = await query(
      `SELECT path FROM store_pages WHERE store_id = $1 AND path IN ('/policies/privacy', '/policies/terms', '/policies/refund')`,
      [storeId]
    );
    if ((policiesRes.rowCount || 0) < 3) {
      issues.push({ severity: 'warning', code: 'INCOMPLETE_POLICIES', message: 'One or more recommended legal policy pages (Privacy, Terms, Refund) are missing.' });
    }

    const canPublish = !issues.some(i => i.severity === 'error');
    res.json({ canPublish, issues });
  }
);

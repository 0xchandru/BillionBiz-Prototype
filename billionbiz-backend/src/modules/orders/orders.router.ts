import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const ordersRouter = Router();

// GET /api/v1/orders (T-018, REQ-ORD-001)
ordersRouter.get(
  '/',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status, paymentStatus, fulfillmentStatus, search, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT o.id, o.order_number, o.channel, o.status, o.payment_status, o.fulfillment_status,
             o.currency, o.subtotal_minor, o.discount_minor, o.tax_minor, o.shipping_minor, o.total_minor,
             o.created_at, o.updated_at,
             c.first_name, c.last_name, c.email, c.phone,
             COUNT(ol.id) as item_count
      FROM orders o
      LEFT JOIN customers c ON c.id = o.customer_id
      LEFT JOIN order_lines ol ON ol.order_id = o.id
      WHERE o.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND o.status = $${params.length}`;
    }
    if (paymentStatus) {
      params.push(paymentStatus);
      sql += ` AND o.payment_status = $${params.length}`;
    }
    if (fulfillmentStatus) {
      params.push(fulfillmentStatus);
      sql += ` AND o.fulfillment_status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (o.order_number ILIKE $${params.length} OR c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR c.email ILIKE $${params.length})`;
    }

    sql += ` GROUP BY o.id, c.first_name, c.last_name, c.email, c.phone
             ORDER BY o.created_at DESC
             LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await query(sql, params);
    res.json({ orders: result.rows, total: result.rowCount });
  }
);

// GET /api/v1/orders/customers (List customers, T-050, REQ-EXP-009)
ordersRouter.get(
  '/customers',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { search, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT id, store_id, email, phone, first_name, last_name, default_address,
             total_orders, total_spent_minor, created_at, updated_at
      FROM customers
      WHERE store_id = $1
    `;
    const params: any[] = [storeId];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (first_name ILIKE $${params.length} OR last_name ILIKE $${params.length} OR email ILIKE $${params.length} OR phone ILIKE $${params.length})`;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await query(sql, params);
    res.json({ customers: result.rows, total: result.rowCount });
  }
);

// GET /api/v1/orders/:id (Order Detail)
ordersRouter.get(
  '/:id',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const orderId = req.params.id as string;

    const orderRes = await query(
      `SELECT o.*, c.first_name, c.last_name, c.email, c.phone
       FROM orders o
       LEFT JOIN customers c ON c.id = o.customer_id
       WHERE o.id = $1 AND o.store_id = $2`,
      [orderId, storeId]
    );

    if (orderRes.rowCount === 0) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }

    const linesRes = await query(
      `SELECT * FROM order_lines WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    );

    const fulfillmentsRes = await query(
      `SELECT * FROM fulfillments WHERE order_id = $1 ORDER BY created_at DESC`,
      [orderId]
    );

    const historyRes = await query(
      `SELECT * FROM order_status_history WHERE order_id = $1 ORDER BY created_at ASC`,
      [orderId]
    );

    res.json({
      order: orderRes.rows[0],
      lines: linesRes.rows,
      fulfillments: fulfillmentsRes.rows,
      history: historyRes.rows
    });
  }
);

// POST /api/v1/orders (Create Order & Inventory Reservation)
ordersRouter.post(
  '/',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      customerId,
      customerDetails,
      items,
      channel = 'STOREFRONT',
      shippingAddress,
      billingAddress
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'EMPTY_ORDER', message: 'Order must contain at least one item' });
    }

    const orderId = `ord-${uuidv4()}`;
    const orderNumber = `BBZ-${Date.now().toString().slice(-6)}`;

    await withTransaction(async (client) => {
      // 1. Resolve or create customer
      let effectiveCustomerId = customerId;
      if (!effectiveCustomerId && customerDetails?.email) {
        const custRes = await client.query(
          `SELECT id FROM customers WHERE store_id = $1 AND email = $2`,
          [storeId, customerDetails.email.toLowerCase().trim()]
        );
        if (custRes.rowCount && custRes.rowCount > 0) {
          effectiveCustomerId = custRes.rows[0].id;
        } else {
          effectiveCustomerId = `cust-${uuidv4()}`;
          await client.query(
            `INSERT INTO customers (id, store_id, email, phone, first_name, last_name, default_address)
             VALUES ($1, $2, $3, $4, $5, $6, $7)`,
            [
              effectiveCustomerId,
              storeId,
              customerDetails.email.toLowerCase().trim(),
              customerDetails.phone || null,
              customerDetails.firstName || 'Guest',
              customerDetails.lastName || '',
              JSON.stringify(shippingAddress || {})
            ]
          );
        }
      }

      // 2. Validate items & compute totals
      let subtotalMinor = 0;
      const orderLinesToInsert: any[] = [];

      for (const item of items) {
        const variantRes = await client.query(
          `SELECT v.id, v.sku, v.price_minor, p.name as product_name, p.id as product_id
           FROM product_variants v
           JOIN products p ON p.id = v.product_id
           WHERE v.id = $1 AND p.store_id = $2`,
          [item.variantId, storeId]
        );

        if (variantRes.rowCount === 0) {
          throw new Error(`VARIANT_NOT_FOUND: Product variant ${item.variantId} not found`);
        }

        const variant = variantRes.rows[0];
        const qty = parseInt(item.quantity || 1, 10);
        const lineTotal = variant.price_minor * qty;
        subtotalMinor += lineTotal;

        orderLinesToInsert.push({
          id: `line-${uuidv4()}`,
          orderId,
          productId: variant.product_id,
          variantId: variant.id,
          sku: variant.sku,
          title: variant.product_name,
          unitPriceMinor: variant.price_minor,
          quantity: qty,
          totalMinor: lineTotal,
          snapshot: {
            title: variant.product_name,
            sku: variant.sku,
            price: variant.price_minor
          }
        });
      }

      const totalMinor = subtotalMinor; // + tax + shipping

      // 3. Insert order
      await client.query(
        `INSERT INTO orders (id, store_id, order_number, customer_id, channel, status, payment_status, fulfillment_status, subtotal_minor, total_minor, shipping_address, billing_address)
         VALUES ($1, $2, $3, $4, $5, 'OPEN', 'PENDING', 'UNFULFILLED', $6, $7, $8, $9)`,
        [
          orderId,
          storeId,
          orderNumber,
          effectiveCustomerId || null,
          channel,
          subtotalMinor,
          totalMinor,
          JSON.stringify(shippingAddress || {}),
          JSON.stringify(billingAddress || {})
        ]
      );

      // 4. Insert order lines
      for (const line of orderLinesToInsert) {
        await client.query(
          `INSERT INTO order_lines (id, order_id, product_id, variant_id, sku, title, unit_price_minor, quantity, total_minor, snapshot)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            line.id,
            line.orderId,
            line.productId,
            line.variantId,
            line.sku,
            line.title,
            line.unitPriceMinor,
            line.quantity,
            line.totalMinor,
            JSON.stringify(line.snapshot)
          ]
        );
      }

      // 5. Record status history
      await client.query(
        `INSERT INTO order_status_history (id, order_id, from_status, to_status, reason, actor_id)
         VALUES ($1, $2, 'NONE', 'OPEN', 'Order placed', $3)`,
        [`osh-${uuidv4()}`, orderId, req.auth?.userId || 'guest']
      );

      // 6. Audit
      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'CREATE_ORDER',
        targetType: 'ORDER',
        targetId: orderId,
        changes: { orderNumber, totalMinor, itemCount: items.length }
      });
    });

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      orderNumber
    });
  }
);

// POST /api/v1/orders/:id/fulfill (Create Fulfillment & Shipment)
ordersRouter.post(
  '/:id/fulfill',
  requireAuth,
  resolveTenant,
  requirePermission('fulfillment.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const orderId = req.params.id as string;
    const { carrier = 'Shiprocket Standard', trackingNumber = `TRK-${Date.now().toString().slice(-8)}` } = req.body;

    const fulfillmentId = `ful-${uuidv4()}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO fulfillments (id, order_id, tracking_number, carrier, status)
         VALUES ($1, $2, $3, $4, 'SHIPPED')`,
        [fulfillmentId, orderId, trackingNumber, carrier]
      );

      await client.query(
        `UPDATE orders
         SET fulfillment_status = 'FULFILLED', updated_at = NOW()
         WHERE id = $1 AND store_id = $2`,
        [orderId, storeId]
      );

      await client.query(
        `INSERT INTO order_status_history (id, order_id, from_status, to_status, reason, actor_id)
         VALUES ($1, $2, 'UNFULFILLED', 'FULFILLED', 'Order shipped with carrier', $3)`,
        [`osh-${uuidv4()}`, orderId, req.auth?.userId]
      );
    });

    res.json({
      message: 'Order fulfilled successfully',
      fulfillmentId,
      trackingNumber,
      carrier
    });
  }
);

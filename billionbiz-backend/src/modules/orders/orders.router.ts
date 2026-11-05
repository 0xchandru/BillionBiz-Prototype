import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit, publishOutboxEvent, broadcastCommittedOutboxEvent } from '../../core/auditAndOutbox.js';
import type { RealtimeEvent } from '../../core/realtimeGateway.js';

export const ordersRouter = Router();

// ============================================================================
// 1. ORDERS LIST & SEARCH
// ============================================================================
ordersRouter.get(
  '/',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status, paymentStatus, fulfillmentStatus, search, startDate, endDate, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT o.id, o.order_number, o.channel, o.status, o.payment_status, o.fulfillment_status,
             o.currency, o.subtotal_minor, o.discount_minor, o.tax_minor, o.shipping_minor, o.total_minor,
             o.shipping_address, o.billing_address, o.created_at, o.updated_at,
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
    if (startDate) {
      params.push(startDate);
      sql += ` AND o.created_at >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      sql += ` AND o.created_at <= $${params.length}`;
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

    // Total count for pagination
    const countSql = `SELECT COUNT(id) as total FROM orders WHERE store_id = $1`;
    const countRes = await query(countSql, [storeId]);

    res.json({ orders: result.rows, total: parseInt(countRes.rows[0]?.total || '0', 10) });
  }
);

// ============================================================================
// 2. INVOICES MODULE (Section 8.2)
// ============================================================================
ordersRouter.get(
  '/invoices',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { search, status } = req.query;

    let sql = `
      SELECT i.id, i.invoice_number, i.order_id, i.booking_id, i.customer_id,
             i.subtotal_minor, i.tax_minor, i.total_minor, i.status, i.due_date,
             i.notes, i.payment_terms, i.items, i.created_at,
             COALESCE(i.customer_name, c.first_name || ' ' || COALESCE(c.last_name, ''), 'Customer') as customer_name,
             COALESCE(i.customer_email, c.email, '') as customer_email
      FROM invoices i
      LEFT JOIN customers c ON c.id = i.customer_id
      WHERE i.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND i.status = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (i.invoice_number ILIKE $${params.length} OR i.customer_name ILIKE $${params.length} OR c.first_name ILIKE $${params.length})`;
    }

    sql += ` ORDER BY i.created_at DESC LIMIT 100;`;
    const result = await query(sql, params);
    res.json({ invoices: result.rows });
  }
);

ordersRouter.post(
  '/invoices',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      customerId,
      customerName,
      customerEmail,
      items = [],
      subtotalMinor = 0,
      taxMinor = 0,
      totalMinor = 0,
      dueDate,
      paymentTerms = 'DUE_ON_RECEIPT',
      notes,
      orderId,
      status = 'ISSUED'
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'EMPTY_INVOICE', message: 'Invoice must contain at least one line item' });
    }

    const invoiceId = `inv-${uuidv4()}`;
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

    await query(
      `INSERT INTO invoices (id, store_id, invoice_number, order_id, customer_id, customer_name, customer_email, subtotal_minor, tax_minor, total_minor, status, due_date, payment_terms, notes, items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        invoiceId,
        storeId,
        invoiceNumber,
        orderId || null,
        customerId || null,
        customerName || 'Customer',
        customerEmail || null,
        subtotalMinor,
        taxMinor,
        totalMinor,
        status,
        dueDate || new Date().toISOString().split('T')[0],
        paymentTerms,
        notes || '',
        JSON.stringify(items)
      ]
    );

    res.status(201).json({
      message: 'Invoice generated successfully',
      invoiceId,
      invoiceNumber
    });
  }
);

// ============================================================================
// 3. ABANDONED CARTS MODULE (Section 8.3)
// ============================================================================
ordersRouter.get(
  '/abandoned-carts',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;

    // Held carts / incomplete checkout sessions
    const sql = `
      SELECT hc.id, hc.hold_reference, hc.cart_data, hc.created_at, hc.updated_at,
             cnt.name as register_name
      FROM held_carts hc
      JOIN counters cnt ON cnt.id = hc.counter_id
      WHERE cnt.store_id = $1
      ORDER BY hc.updated_at DESC
      LIMIT 100
    `;
    const result = await query(sql, [storeId]);
    res.json({ abandonedCarts: result.rows });
  }
);

// ============================================================================
// 4. RETURNS & REFUNDS MODULE (Section 8.4)
// ============================================================================
ordersRouter.get(
  '/returns',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status } = req.query;

    let sql = `
      SELECT r.id, r.order_id, r.return_number, r.status, r.refund_status, r.reason,
             r.refund_amount_minor, r.restock_disposition, r.rejection_reason,
             r.items, r.created_at, r.updated_at,
             o.order_number,
             COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), 'Customer') as customer_name,
             c.email as customer_email, c.phone as customer_phone
      FROM returns r
      JOIN orders o ON o.id = r.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND r.status = $${params.length}`;
    }

    sql += ` ORDER BY r.created_at DESC LIMIT 100;`;
    const result = await query(sql, params);
    res.json({ returns: result.rows });
  }
);

ordersRouter.post(
  '/returns',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { orderId, reason, refundAmountMinor = 0, items = [], restockDisposition = 'RESTOCK' } = req.body;

    const returnId = `ret-${uuidv4()}`;
    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;

    await query(
      `INSERT INTO returns (id, order_id, store_id, return_number, status, refund_status, reason, refund_amount_minor, restock_disposition, items)
       VALUES ($1, $2, $3, $4, 'REQUESTED', 'PENDING', $5, $6, $7, $8)`,
      [returnId, orderId, storeId, returnNumber, reason, refundAmountMinor, restockDisposition, JSON.stringify(items)]
    );

    res.status(201).json({ message: 'Return request created', returnId, returnNumber });
  }
);

ordersRouter.post(
  '/returns/:id/approve',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const returnId = req.params.id as string;
    await query(`UPDATE returns SET status = 'APPROVED', updated_at = NOW() WHERE id = $1`, [returnId]);
    res.json({ message: 'Return request approved' });
  }
);

ordersRouter.post(
  '/returns/:id/reject',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const returnId = req.params.id as string;
    const { rejectionReason = 'Does not meet return criteria' } = req.body;
    await query(
      `UPDATE returns SET status = 'REJECTED', rejection_reason = $1, updated_at = NOW() WHERE id = $2`,
      [rejectionReason, returnId]
    );
    res.json({ message: 'Return request rejected' });
  }
);

ordersRouter.post(
  '/returns/:id/process-refund',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const returnId = req.params.id as string;
    const returnRes = await query(`SELECT * FROM returns WHERE id = $1`, [returnId]);
    if (returnRes.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Return request not found' });
    }
    const ret = returnRes.rows[0];

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE returns SET status = 'COMPLETED', refund_status = 'PROCESSED', updated_at = NOW() WHERE id = $1`,
        [returnId]
      );
      await client.query(
        `UPDATE orders SET payment_status = 'REFUNDED', updated_at = NOW() WHERE id = $1`,
        [ret.order_id]
      );
    });

    res.json({ message: 'Refund successfully processed and ledger balanced' });
  }
);

// ============================================================================
// 5. SHIPMENTS MODULE (Section 8.5)
// ============================================================================
ordersRouter.get(
  '/shipments',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;

    const sql = `
      SELECT f.id, f.order_id, f.tracking_number, f.carrier, f.status, f.created_at, f.updated_at,
             o.order_number, o.shipping_address, o.total_minor,
             COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), 'Customer') as customer_name,
             c.email as customer_email, c.phone as customer_phone
      FROM fulfillments f
      JOIN orders o ON o.id = f.order_id
      LEFT JOIN customers c ON c.id = o.customer_id
      WHERE o.store_id = $1
      ORDER BY f.created_at DESC
      LIMIT 100
    `;
    const result = await query(sql, [storeId]);
    res.json({ shipments: result.rows });
  }
);

// ============================================================================
// 6. WAREHOUSE MANAGEMENT (Section 8.5)
// ============================================================================
ordersRouter.get(
  '/warehouses',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const result = await query(
      `SELECT id, store_id, name, code, is_default, address_line1, city, state, postal_code, country, contact_phone, contact_email, status, created_at
       FROM inventory_locations
       WHERE store_id = $1
       ORDER BY is_default DESC, name ASC`,
      [storeId]
    );
    res.json({ warehouses: result.rows });
  }
);

ordersRouter.post(
  '/warehouses',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, code, isDefault = false, addressLine1, city, state, postalCode, country = 'IN', contactPhone, contactEmail } = req.body;

    if (!name || !code) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Warehouse name and unique code are required' });
    }

    const warehouseId = `wh-${uuidv4()}`;

    await withTransaction(async (client) => {
      if (isDefault) {
        await client.query(`UPDATE inventory_locations SET is_default = FALSE WHERE store_id = $1`, [storeId]);
      }
      await client.query(
        `INSERT INTO inventory_locations (id, store_id, name, code, is_default, address_line1, city, state, postal_code, country, contact_phone, contact_email, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'ACTIVE')`,
        [warehouseId, storeId, name, code.toUpperCase().trim(), isDefault, addressLine1, city, state, postalCode, country, contactPhone, contactEmail]
      );
    });

    res.status(201).json({ message: 'Warehouse added successfully', warehouseId });
  }
);

ordersRouter.put(
  '/warehouses/:id',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const warehouseId = req.params.id as string;
    const { name, isDefault, addressLine1, city, state, postalCode, contactPhone, contactEmail, status } = req.body;

    await withTransaction(async (client) => {
      if (isDefault) {
        await client.query(`UPDATE inventory_locations SET is_default = FALSE WHERE store_id = $1`, [storeId]);
      }
      await client.query(
        `UPDATE inventory_locations
         SET name = COALESCE($1, name),
             is_default = COALESCE($2, is_default),
             address_line1 = COALESCE($3, address_line1),
             city = COALESCE($4, city),
             state = COALESCE($5, state),
             postal_code = COALESCE($6, postal_code),
             contact_phone = COALESCE($7, contact_phone),
             contact_email = COALESCE($8, contact_email),
             status = COALESCE($9, status)
         WHERE id = $10 AND store_id = $11`,
        [name, isDefault, addressLine1, city, state, postalCode, contactPhone, contactEmail, status, warehouseId, storeId]
      );
    });

    res.json({ message: 'Warehouse updated successfully' });
  }
);

ordersRouter.delete(
  '/warehouses/:id',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const warehouseId = req.params.id as string;

    const check = await query(`SELECT is_default FROM inventory_locations WHERE id = $1 AND store_id = $2`, [warehouseId, storeId]);
    if (check.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Warehouse not found' });
    }
    if (check.rows[0].is_default) {
      return res.status(400).json({ error: 'CANNOT_DELETE_DEFAULT', message: 'Cannot delete the primary/default warehouse' });
    }

    await query(`DELETE FROM inventory_locations WHERE id = $1 AND store_id = $2`, [warehouseId, storeId]);
    res.json({ message: 'Warehouse removed successfully' });
  }
);

// ============================================================================
// 7. CUSTOMERS DIRECTORY (Section 11.1)
// ============================================================================
ordersRouter.get(
  '/customers',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { search, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT c.id, c.store_id, c.email, c.phone, c.first_name, c.last_name, c.default_address,
             c.total_orders, c.total_spent_minor, c.created_at, c.updated_at,
             COUNT(b.id) as booking_count
      FROM customers c
      LEFT JOIN bookings b ON b.customer_id = c.id
      WHERE c.store_id = $1
    `;
    const params: any[] = [storeId];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (c.first_name ILIKE $${params.length} OR c.last_name ILIKE $${params.length} OR c.email ILIKE $${params.length} OR c.phone ILIKE $${params.length})`;
    }

    sql += ` GROUP BY c.id ORDER BY c.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await query(sql, params);
    res.json({ customers: result.rows, total: result.rowCount });
  }
);

ordersRouter.get(
  '/customers/:id',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const customerId = req.params.id as string;

    const custRes = await query(
      `SELECT * FROM customers WHERE id = $1 AND store_id = $2`,
      [customerId, storeId]
    );

    if (custRes.rowCount === 0) {
      return res.status(404).json({ error: 'CUSTOMER_NOT_FOUND', message: 'Customer record not found' });
    }

    const pastOrders = await query(
      `SELECT id, order_number, total_minor, status, payment_status, created_at
       FROM orders
       WHERE customer_id = $1 AND store_id = $2
       ORDER BY created_at DESC LIMIT 10`,
      [customerId, storeId]
    );

    const pastBookings = await query(
      `SELECT b.id, b.booking_number, b.start_time, b.status, b.total_minor, o.name as service_name
       FROM bookings b
       JOIN offerings o ON o.id = b.offering_id
       WHERE b.customer_id = $1 AND b.store_id = $2
       ORDER BY b.start_time DESC LIMIT 10`,
      [customerId, storeId]
    );

    res.json({
      customer: custRes.rows[0],
      orders: pastOrders.rows,
      bookings: pastBookings.rows
    });
  }
);

// POST /api/v1/orders/customers (Add new customer profile)
ordersRouter.post(
  '/customers',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { firstName, lastName, email, phone, addressLine1, city, state, postalCode, country = 'IN' } = req.body;

    if (!firstName && !email) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'First name or email is required' });
    }

    const id = `cust-${uuidv4()}`;
    const defaultAddress = addressLine1 ? {
      addressLine1,
      city: city || '',
      state: state || '',
      postalCode: postalCode || '',
      country: country || 'IN'
    } : null;

    await query(
      `INSERT INTO customers (id, store_id, email, phone, first_name, last_name, default_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, storeId, email ? email.toLowerCase().trim() : null, phone || null, firstName || 'Guest', lastName || '', defaultAddress ? JSON.stringify(defaultAddress) : null]
    );

    res.status(201).json({ message: 'Customer created successfully', id, firstName, email });
  }
);

// GET /api/v1/orders/tickets (Support Tickets)
ordersRouter.get(
  '/tickets',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status, priority, search } = req.query;

    let sql = `
      SELECT t.id, t.ticket_number, t.customer_name, t.customer_email, t.subject,
             t.description, t.priority, t.status, t.created_at, t.updated_at,
             sp.display_name as assigned_to_name
      FROM customer_tickets t
      LEFT JOIN staff_profiles sp ON sp.id = t.assigned_to
      WHERE t.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }
    if (priority) {
      params.push(priority);
      sql += ` AND t.priority = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (t.ticket_number ILIKE $${params.length} OR t.customer_name ILIKE $${params.length} OR t.subject ILIKE $${params.length})`;
    }

    sql += ` ORDER BY t.created_at DESC`;

    const result = await query(sql, params);
    res.json({ tickets: result.rows });
  }
);

// POST /api/v1/orders/tickets (Create Ticket)
ordersRouter.post(
  '/tickets',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { customerName, customerEmail, subject, description, priority = 'MEDIUM', customerId } = req.body;

    if (!customerName || !subject) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Customer name and subject are required' });
    }

    const ticketId = `tkt-${uuidv4()}`;
    const ticketNumber = `TKT-${Date.now().toString().slice(-6)}`;

    await query(
      `INSERT INTO customer_tickets (id, store_id, ticket_number, customer_id, customer_name, customer_email, subject, description, priority, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'OPEN')`,
      [ticketId, storeId, ticketNumber, customerId || null, customerName, customerEmail || null, subject, description || '', priority]
    );

    res.status(201).json({ message: 'Ticket created successfully', id: ticketId, ticketNumber });
  }
);

// PATCH /api/v1/orders/tickets/:id (Update Status/Priority)
ordersRouter.patch(
  '/tickets/:id',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { id } = req.params;
    const { status, priority, assignedTo } = req.body;

    await query(
      `UPDATE customer_tickets
       SET status = COALESCE($1, status),
           priority = COALESCE($2, priority),
           assigned_to = COALESCE($3, assigned_to),
           updated_at = NOW()
       WHERE id = $4 AND store_id = $5`,
      [status, priority, assignedTo, id, storeId]
    );

    res.json({ message: 'Ticket updated successfully' });
  }
);

// ============================================================================
// 8. ORDER DETAILS & ACTIONS
// ============================================================================
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

ordersRouter.patch(
  '/:id/status',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const orderId = req.params.id as string;
    const { status, reason = 'Status updated by merchant' } = req.body;

    const current = await query(`SELECT status FROM orders WHERE id = $1 AND store_id = $2`, [orderId, storeId]);
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'ORDER_NOT_FOUND', message: 'Order not found' });
    }
    const fromStatus = current.rows[0].status;

    await withTransaction(async (client) => {
      await client.query(`UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2 AND store_id = $3`, [status, orderId, storeId]);
      await client.query(
        `INSERT INTO order_status_history (id, order_id, from_status, to_status, reason, actor_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`osh-${uuidv4()}`, orderId, fromStatus, status, reason, req.auth?.userId]
      );
    });

    res.json({ message: `Order status changed to ${status}` });
  }
);

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

// POST /api/v1/orders (Create Order)
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
    let committedEvent: RealtimeEvent | null = null;

    await withTransaction(async (client) => {
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

      const totalMinor = subtotalMinor;

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

      await client.query(
        `INSERT INTO order_status_history (id, order_id, from_status, to_status, reason, actor_id)
         VALUES ($1, $2, 'NONE', 'OPEN', 'Order placed', $3)`,
        [`osh-${uuidv4()}`, orderId, req.auth?.userId || 'guest']
      );

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'CREATE_ORDER',
        targetType: 'ORDER',
        targetId: orderId,
        changes: { orderNumber, totalMinor, itemCount: items.length }
      });
      committedEvent = await publishOutboxEvent(
        client,
        req.tenant!.organizationId,
        storeId,
        'ORDER_CREATED',
        'ORDER',
        orderId,
        {
          orderId,
          orderNumber,
          totalAmount: totalMinor,
          customerName: [customerDetails?.firstName, customerDetails?.lastName].filter(Boolean).join(' '),
          email: customerDetails?.email || undefined,
          channel
        }
      );
    });

    if (committedEvent) broadcastCommittedOutboxEvent(committedEvent);
    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      orderNumber
    });
  }
);

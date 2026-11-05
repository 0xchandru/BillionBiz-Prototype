import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit, publishOutboxEvent, broadcastCommittedOutboxEvent } from '../../core/auditAndOutbox.js';
import type { RealtimeEvent } from '../../core/realtimeGateway.js';

export const posRouter = Router();

const httpError = (statusCode: number, code: string, message: string) => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
};

const isMinorAmount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;

const PAYMENT_METHODS = new Set(['CASH', 'CARD', 'UPI']);

// Register catalogue.
posRouter.get('/counters', requireAuth, resolveTenant, requirePermission('pos.access'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const countersRes = await query(
    `SELECT c.id, c.name, c.code, c.is_active, COALESCE(sl.name, 'Main Location') AS location_name
     FROM counters c
     LEFT JOIN store_locations sl ON sl.id = c.location_id AND sl.store_id = c.store_id
     WHERE c.store_id = $1 AND c.is_active = TRUE
     ORDER BY c.code ASC`,
    [storeId]
  );
  res.json({ counters: countersRes.rows });
});

posRouter.post('/counters', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { name, code: rawCode } = req.body || {};
  const counterName = typeof name === 'string' ? name.trim() : '';
  if (!counterName || counterName.length > 128) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Counter name is required and must be no more than 128 characters.' });
  }

  const locRes = await query(
    `SELECT id FROM store_locations
     WHERE store_id = $1 AND is_active = TRUE
     ORDER BY is_primary DESC, created_at ASC LIMIT 1`,
    [storeId]
  );
  let locationId = locRes.rows[0]?.id;
  if (!locationId) {
    locationId = `loc-${uuidv4()}`;
    await query(
      `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
       VALUES ($1, $2, 'Main Store Location', TRUE, TRUE)`,
      [locationId, storeId]
    );
  }

  const code = (typeof rawCode === 'string' && rawCode.trim()
    ? rawCode.trim()
    : `POS-${uuidv4().slice(0, 6)}`).toUpperCase();
  if (!/^[A-Z0-9_-]{2,64}$/.test(code)) {
    return res.status(400).json({ error: 'INVALID_COUNTER_CODE', message: 'Counter code must contain 2 to 64 letters, numbers, hyphens or underscores.' });
  }

  const counterId = `cnt-${uuidv4()}`;
  await query(
    `INSERT INTO counters (id, store_id, location_id, name, code, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)`,
    [counterId, storeId, locationId, counterName, code]
  );
  res.status(201).json({ message: 'Counter created successfully', id: counterId, name: counterName, code });
});

posRouter.get('/shifts', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const shiftsRes = await query(
    `SELECT rs.id, rs.counter_id, rs.opened_by, rs.closed_by, rs.opening_float_minor,
            rs.closing_cash_minor, rs.expected_cash_minor, rs.variance_minor, rs.status,
            rs.opened_at, rs.closed_at,
            c.name AS counter_name, c.code AS counter_code,
            u1.full_name AS opened_by_name, u2.full_name AS closed_by_name
     FROM register_sessions rs
     JOIN counters c ON c.id = rs.counter_id
     LEFT JOIN users u1 ON u1.id = rs.opened_by
     LEFT JOIN users u2 ON u2.id = rs.closed_by
     WHERE c.store_id = $1
     ORDER BY rs.opened_at DESC
     LIMIT 500`,
    [storeId]
  );
  res.json({ shifts: shiftsRes.rows });
});

// A counter row lock serializes competing attempts to open the same register.
posRouter.post('/register/open', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { counterId, openingFloatMinor = 0 } = req.body || {};
  if (typeof counterId !== 'string' || !counterId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID is required.' });
  }
  if (!isMinorAmount(openingFloatMinor)) {
    return res.status(400).json({ error: 'INVALID_OPENING_FLOAT', message: 'Opening float must be a non-negative whole number in the smallest currency unit.' });
  }

  const sessionId = `ses-${uuidv4()}`;
  try {
    await withTransaction(async (client) => {
      const counter = await client.query(
        `SELECT id FROM counters
         WHERE id = $1 AND store_id = $2 AND is_active = TRUE
         FOR UPDATE`,
        [counterId, storeId]
      );
      if (counter.rowCount === 0) throw httpError(404, 'COUNTER_NOT_FOUND', 'Counter was not found in this store.');

      const existing = await client.query(
        `SELECT id FROM register_sessions WHERE counter_id = $1 AND status = 'OPEN' LIMIT 1`,
        [counterId]
      );
      if ((existing.rowCount ?? 0) > 0) throw httpError(409, 'SESSION_ALREADY_OPEN', 'This counter already has an active register session.');

      await client.query(
        `INSERT INTO register_sessions (id, counter_id, opened_by, opening_float_minor, status)
         VALUES ($1, $2, $3, $4, 'OPEN')`,
        [sessionId, counterId, req.auth?.userId || 'unknown', openingFloatMinor]
      );
      if (openingFloatMinor > 0) {
        await client.query(
          `INSERT INTO cash_movements (id, register_session_id, movement_type, amount_minor, reason, created_by)
           VALUES ($1, $2, 'CASH_IN', $3, 'Opening Float', $4)`,
          [`cm-${uuidv4()}`, sessionId, openingFloatMinor, req.auth?.userId || 'unknown']
        );
      }
    });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    throw error;
  }

  res.status(201).json({ message: 'Register session opened successfully', sessionId, openingFloatMinor });
});

posRouter.get('/register/current', requireAuth, resolveTenant, requirePermission('pos.access'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const counterId = typeof req.query.counterId === 'string' ? req.query.counterId : '';
  if (!counterId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID is required.' });
  }

  const sessionRes = await query(
    `SELECT rs.*
     FROM register_sessions rs
     JOIN counters c ON c.id = rs.counter_id
     WHERE rs.counter_id = $1 AND c.store_id = $2
       AND c.is_active = TRUE AND rs.status = 'OPEN'
     ORDER BY rs.opened_at DESC LIMIT 1`,
    [counterId, storeId]
  );
  if (sessionRes.rowCount === 0) {
    return res.json({ session: null, movements: [], expectedCashMinor: 0, message: 'No active register session.' });
  }

  const session = sessionRes.rows[0];
  const movementsRes = await query(
    `SELECT cm.*
     FROM cash_movements cm
     JOIN register_sessions rs ON rs.id = cm.register_session_id
     JOIN counters c ON c.id = rs.counter_id
     WHERE cm.register_session_id = $1 AND c.store_id = $2
     ORDER BY cm.created_at ASC`,
    [session.id, storeId]
  );

  let cashTotal = Number(session.opening_float_minor);
  for (const movement of movementsRes.rows) {
    const amount = Number(movement.amount_minor);
    if (movement.movement_type === 'CASH_IN' || movement.movement_type === 'SALE') cashTotal += amount;
    else if (movement.movement_type === 'CASH_OUT' || movement.movement_type === 'REFUND') cashTotal -= amount;
  }

  res.json({ session, movements: movementsRes.rows, expectedCashMinor: cashTotal });
});

// Close only a session owned by a counter in the active store. Locking the row
// prevents two cashiers from closing the same register concurrently.
posRouter.post('/register/close', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { sessionId, closingCashMinor } = req.body || {};
  if (typeof sessionId !== 'string' || !sessionId || !isMinorAmount(closingCashMinor)) {
    return res.status(400).json({ error: 'INVALID_CLOSE_REQUEST', message: 'Session ID and a non-negative whole-number closing cash count are required.' });
  }

  let zReport: any;
  try {
    await withTransaction(async (client) => {
      const sessionRes = await client.query(
        `SELECT rs.*
         FROM register_sessions rs
         JOIN counters c ON c.id = rs.counter_id
         WHERE rs.id = $1 AND c.store_id = $2 AND rs.status = 'OPEN'
         FOR UPDATE OF rs`,
        [sessionId, storeId]
      );
      if (sessionRes.rowCount === 0) throw httpError(404, 'SESSION_NOT_FOUND', 'Open register session was not found in this store.');

      const session = sessionRes.rows[0];
      const movementsRes = await client.query(
        `SELECT cm.*
         FROM cash_movements cm
         JOIN register_sessions rs ON rs.id = cm.register_session_id
         JOIN counters c ON c.id = rs.counter_id
         WHERE cm.register_session_id = $1 AND c.store_id = $2`,
        [sessionId, storeId]
      );

      let expectedCash = Number(session.opening_float_minor);
      for (const movement of movementsRes.rows) {
        const amount = Number(movement.amount_minor);
        if (movement.movement_type === 'CASH_IN' || movement.movement_type === 'SALE') expectedCash += amount;
        else if (movement.movement_type === 'CASH_OUT' || movement.movement_type === 'REFUND') expectedCash -= amount;
      }

      const variance = closingCashMinor - expectedCash;
      await client.query(
        `UPDATE register_sessions
         SET status = 'CLOSED',
             closed_by = $1,
             closing_cash_minor = $2,
             expected_cash_minor = $3,
             variance_minor = $4,
             closed_at = NOW()
         WHERE id = $5 AND status = 'OPEN'`,
        [req.auth?.userId || 'unknown', closingCashMinor, expectedCash, variance, sessionId]
      );

      zReport = {
        sessionId,
        openedAt: session.opened_at,
        closedAt: new Date().toISOString(),
        openingFloatMinor: Number(session.opening_float_minor),
        expectedCashMinor: expectedCash,
        closingCashMinor,
        varianceMinor: variance
      };

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'CLOSE_POS_REGISTER',
        targetType: 'REGISTER_SESSION',
        targetId: sessionId,
        changes: { expectedCashMinor: expectedCash, closingCashMinor, varianceMinor: variance }
      });
    });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    throw error;
  }

  res.json({ message: 'Register closed successfully. Z-Report generated.', zReport });
});

// POS checkout uses server-side prices and inventory. Invalid or out-of-stock
// items abort the whole transaction; no partial orders are written.
posRouter.post('/checkout', requireAuth, resolveTenant, requirePermission('pos.checkout'), handleIdempotency, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const {
    counterId,
    sessionId,
    items = [],
    appointmentBookingId,
    paymentMethod = 'CASH',
    cashTenderedMinor
  } = req.body || {};

  if (typeof counterId !== 'string' || !counterId || typeof sessionId !== 'string' || !sessionId) {
    return res.status(400).json({ error: 'REGISTER_REQUIRED', message: 'Choose a counter with an open register session before checkout.' });
  }
  if (!PAYMENT_METHODS.has(paymentMethod)) {
    return res.status(400).json({ error: 'INVALID_PAYMENT_METHOD', message: 'Payment method must be CASH, CARD or UPI.' });
  }
  if (!Array.isArray(items) || items.length > 100) {
    return res.status(400).json({ error: 'INVALID_CART', message: 'Cart must contain no more than 100 line items.' });
  }
  if (items.some((item: any) => !item || typeof item.variantId !== 'string' || !item.variantId ||
      !Number.isSafeInteger(Number(item.quantity)) || Number(item.quantity) < 1 || Number(item.quantity) > 999)) {
    return res.status(400).json({ error: 'INVALID_CART_ITEM', message: 'Each cart line requires a variant and a quantity between 1 and 999.' });
  }
  if (items.length === 0 && !appointmentBookingId) {
    return res.status(400).json({ error: 'EMPTY_CART', message: 'Add a product or select an appointment balance before checkout.' });
  }
  if (paymentMethod === 'CASH' && !isMinorAmount(cashTenderedMinor ?? 0)) {
    return res.status(400).json({ error: 'INVALID_CASH_TENDERED', message: 'Cash received must be a non-negative whole number in the smallest currency unit.' });
  }

  const orderId = `ord-pos-${uuidv4()}`;
  const orderNumber = `POS-${Date.now().toString().slice(-6)}-${uuidv4().slice(0, 4).toUpperCase()}`;
  let totalOrderAmount = 0;
  const committedEvents: RealtimeEvent[] = [];

  try {
    await withTransaction(async (client) => {
      const sessionRes = await client.query(
        `SELECT rs.id, rs.counter_id, rs.status
         FROM register_sessions rs
         JOIN counters c ON c.id = rs.counter_id
         WHERE rs.id = $1 AND rs.counter_id = $2
           AND c.store_id = $3 AND c.is_active = TRUE
           AND rs.status = 'OPEN'
         FOR UPDATE OF rs`,
        [sessionId, counterId, storeId]
      );
      if (sessionRes.rowCount === 0) {
        throw httpError(409, 'REGISTER_SESSION_NOT_OPEN', 'The selected counter does not have this active register session.');
      }

      if (appointmentBookingId) {
        const bookingRes = await client.query(
          `SELECT id, balance_due_minor, status
           FROM bookings
           WHERE id = $1 AND store_id = $2
           FOR UPDATE`,
          [appointmentBookingId, storeId]
        );
        if (bookingRes.rowCount === 0) throw httpError(404, 'APPOINTMENT_NOT_FOUND', 'Appointment was not found in this store.');
        const booking = bookingRes.rows[0];
        if (['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(booking.status)) {
          throw httpError(409, 'APPOINTMENT_NOT_PAYABLE', 'This appointment can no longer accept a POS payment.');
        }
        const balance = Number(booking.balance_due_minor);
        if (!Number.isSafeInteger(balance) || balance <= 0) {
          throw httpError(409, 'NO_APPOINTMENT_BALANCE', 'This appointment has no outstanding balance.');
        }
        totalOrderAmount += balance;

        await client.query(
          `UPDATE bookings
           SET balance_due_minor = 0, status = 'COMPLETED', updated_at = NOW()
           WHERE id = $1 AND store_id = $2`,
          [appointmentBookingId, storeId]
        );
      }

      const orderLines: Array<{
        id: string;
        productId: string;
        variantId: string;
        sku: string;
        title: string;
        unitPriceMinor: number;
        quantity: number;
        totalMinor: number;
      }> = [];

      for (const item of items) {
        const quantity = Number(item.quantity);
        const variantRes = await client.query(
          `SELECT v.id, v.sku, v.price_minor, p.name AS product_name,
                  p.id AS product_id, p.status, ib.id AS inventory_balance_id,
                  ib.available AS inventory_available, il.id AS inventory_location_id
           FROM product_variants v
           JOIN products p ON p.id = v.product_id
           LEFT JOIN LATERAL (
             SELECT id
             FROM inventory_locations
             WHERE store_id = $2
             ORDER BY is_default DESC, created_at ASC
             LIMIT 1
           ) il ON TRUE
           LEFT JOIN inventory_balances ib
             ON ib.variant_id = v.id AND ib.location_id = il.id
           WHERE v.id = $1 AND p.store_id = $2 AND v.is_active = TRUE
           FOR UPDATE OF v`,
          [item.variantId, storeId]
        );
        if (variantRes.rowCount === 0 || variantRes.rows[0].status !== 'ACTIVE') {
          throw httpError(404, 'PRODUCT_VARIANT_NOT_AVAILABLE', 'One of the selected product variants is not active in this store.');
        }

        const variant = variantRes.rows[0];
        const unitPriceMinor = Number(variant.price_minor);
        if (!Number.isSafeInteger(unitPriceMinor) || unitPriceMinor < 0) {
          throw httpError(409, 'INVALID_PRODUCT_PRICE', 'A selected product has an invalid price and cannot be sold.');
        }

        const lineTotal = unitPriceMinor * quantity;
        if (!Number.isSafeInteger(lineTotal)) {
          throw httpError(400, 'ORDER_TOTAL_OUT_OF_RANGE', 'The cart total exceeds the supported amount.');
        }

        if (variant.inventory_balance_id) {
          const stockUpdate = await client.query(
            `UPDATE inventory_balances
             SET on_hand = on_hand - $1,
                 available = available - $1,
                 updated_at = NOW()
             WHERE id = $2 AND available >= $1 AND on_hand >= $1`,
            [quantity, variant.inventory_balance_id]
          );
          if (stockUpdate.rowCount === 0) {
            throw httpError(409, 'INSUFFICIENT_STOCK', `Insufficient stock for "${variant.product_name}".`);
          }
          await client.query(
            `INSERT INTO inventory_movements (
               id, variant_id, location_id, movement_type, quantity,
               reference_type, reference_id, note
             ) VALUES ($1, $2, $3, 'SALE', $4, 'ORDER', $5, $6)`,
            [`im-${uuidv4()}`, variant.id, variant.inventory_location_id, -quantity, orderId, `POS sale ${orderNumber}`]
          );
        }

        totalOrderAmount += lineTotal;
        if (!Number.isSafeInteger(totalOrderAmount)) {
          throw httpError(400, 'ORDER_TOTAL_OUT_OF_RANGE', 'The cart total exceeds the supported amount.');
        }

        orderLines.push({
          id: `line-${uuidv4()}`,
          productId: variant.product_id,
          variantId: variant.id,
          sku: variant.sku,
          title: variant.product_name,
          unitPriceMinor,
          quantity,
          totalMinor: lineTotal
        });
      }

      if (totalOrderAmount <= 0) {
        throw httpError(400, 'INVALID_ORDER_TOTAL', 'The order total must be greater than zero.');
      }

      if (paymentMethod === 'CASH' && Number(cashTenderedMinor ?? 0) < totalOrderAmount) {
        throw httpError(400, 'INSUFFICIENT_CASH_TENDERED', 'Cash received is less than the amount due.');
      }

      const storeRes = await client.query(`SELECT currency FROM stores WHERE id = $1`, [storeId]);
      const currency = storeRes.rows[0]?.currency || 'INR';

      await client.query(
        `INSERT INTO orders (
           id, store_id, order_number, channel, status, payment_status,
           fulfillment_status, currency, total_minor, subtotal_minor
         ) VALUES ($1, $2, $3, 'POS', 'COMPLETED', 'CAPTURED', 'FULFILLED', $4, $5, $5)`,
        [orderId, storeId, orderNumber, currency, totalOrderAmount]
      );

      for (const line of orderLines) {
        await client.query(
          `INSERT INTO order_lines (
             id, order_id, product_id, variant_id, sku, title,
             unit_price_minor, quantity, total_minor
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [line.id, orderId, line.productId, line.variantId, line.sku, line.title, line.unitPriceMinor, line.quantity, line.totalMinor]
        );
      }

      const intentId = `pi-${uuidv4()}`;
      await client.query(
        `INSERT INTO payment_intents (id, store_id, purpose, reference_id, amount_minor, status, provider)
         VALUES ($1, $2, 'ORDER', $3, $4, 'CAPTURED', $5)`,
        [intentId, storeId, orderId, totalOrderAmount, `POS_MANUAL_${paymentMethod}`]
      );
      await client.query(
        `INSERT INTO payment_transactions (id, payment_intent_id, payment_method, amount_minor, status)
         VALUES ($1, $2, $3, $4, 'CAPTURED')`,
        [`tx-${uuidv4()}`, intentId, paymentMethod, totalOrderAmount]
      );

      if (paymentMethod === 'CASH') {
        await client.query(
          `INSERT INTO cash_movements (id, register_session_id, movement_type, amount_minor, reason, created_by)
           VALUES ($1, $2, 'SALE', $3, $4, $5)`,
          [`cm-${uuidv4()}`, sessionId, totalOrderAmount, `POS Sale ${orderNumber}`, req.auth?.userId || 'unknown']
        );
      }

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'POS_CHECKOUT',
        targetType: 'ORDER',
        targetId: orderId,
        changes: { orderNumber, totalOrderAmount, paymentMethod, itemCount: orderLines.length, appointmentBookingId: appointmentBookingId || null }
      });
      committedEvents.push(await publishOutboxEvent(
        client,
        req.tenant!.organizationId,
        storeId,
        'ORDER_CREATED',
        'ORDER',
        orderId,
        {
          orderId,
          orderNumber,
          totalAmount: totalOrderAmount,
          paymentMethod,
          channel: 'POS',
          itemCount: orderLines.length,
          appointmentBookingId: appointmentBookingId || null
        }
      ));
      if (appointmentBookingId) {
        committedEvents.push(await publishOutboxEvent(
          client,
          req.tenant!.organizationId,
          storeId,
          'APPOINTMENT_PAYMENT_COMPLETED',
          'BOOKING',
          appointmentBookingId,
          { bookingId: appointmentBookingId, orderId, amountMinor: totalOrderAmount, paymentMethod }
        ));
      }
    });
  } catch (error: any) {
    if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
    throw error;
  }

  committedEvents.forEach(broadcastCommittedOutboxEvent);

  const cashReceived = paymentMethod === 'CASH' ? Number(cashTenderedMinor ?? totalOrderAmount) : totalOrderAmount;
  const changeDueMinor = paymentMethod === 'CASH' ? Math.max(0, cashReceived - totalOrderAmount) : 0;

  res.status(201).json({
    message: 'POS sale completed successfully',
    receipt: {
      orderId,
      orderNumber,
      totalAmountMinor: totalOrderAmount,
      paymentMethod,
      cashTenderedMinor: cashReceived,
      changeDueMinor
    }
  });
});

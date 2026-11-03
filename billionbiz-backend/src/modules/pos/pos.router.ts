import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const posRouter = Router();

// GET /api/v1/pos/counters (T-029, REQ-POS-001)
posRouter.get('/counters', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const countersRes = await query(
    `SELECT c.id, c.name, c.code, c.is_active, COALESCE(sl.name, 'Main Location') as location_name
     FROM counters c
     LEFT JOIN store_locations sl ON sl.id = c.location_id
     WHERE c.store_id = $1 AND c.is_active = TRUE
     ORDER BY c.code ASC`,
    [storeId]
  );
  res.json({ counters: countersRes.rows });
});

// POST /api/v1/pos/counters (Add POS Counter Register)
posRouter.post('/counters', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { name, code: rawCode } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Counter name is required' });
  }

  // Get or create store location
  let locRes = await query(`SELECT id FROM store_locations WHERE store_id = $1 LIMIT 1`, [storeId]);
  let locationId = locRes.rows[0]?.id;
  if (!locationId) {
    locationId = `loc-${uuidv4()}`;
    await query(
      `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
       VALUES ($1, $2, 'Main Store Location', TRUE, TRUE)`,
      [locationId, storeId]
    );
  }

  const code = (rawCode || `POS-${Math.floor(100 + Math.random() * 900)}`).toUpperCase();
  const counterId = `cnt-${uuidv4()}`;

  await query(
    `INSERT INTO counters (id, store_id, location_id, name, code, is_active)
     VALUES ($1, $2, $3, $4, $5, TRUE)`,
    [counterId, storeId, locationId, name, code]
  );

  res.status(201).json({ message: 'Counter created successfully', id: counterId, name, code });
});

// GET /api/v1/pos/shifts (List historical and active register shifts)
posRouter.get('/shifts', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const shiftsRes = await query(
    `SELECT rs.id, rs.counter_id, rs.opened_by, rs.closed_by, rs.opening_float_minor,
            rs.closing_cash_minor, rs.expected_cash_minor, rs.variance_minor, rs.status,
            rs.opened_at, rs.closed_at,
            c.name as counter_name, c.code as counter_code,
            u1.full_name as opened_by_name, u2.full_name as closed_by_name
     FROM register_sessions rs
     JOIN counters c ON c.id = rs.counter_id
     LEFT JOIN users u1 ON u1.id = rs.opened_by
     LEFT JOIN users u2 ON u2.id = rs.closed_by
     WHERE c.store_id = $1
     ORDER BY rs.opened_at DESC`,
    [storeId]
  );
  res.json({ shifts: shiftsRes.rows });
});

// POST /api/v1/pos/register/open (Open Register Session, T-031, REQ-POS-014)
posRouter.post('/register/open', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const { counterId, openingFloatMinor = 0 } = req.body;
  if (!counterId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID is required' });
  }

  // Check if open session already exists for this counter
  const openRes = await query(
    `SELECT id FROM register_sessions WHERE counter_id = $1 AND status = 'OPEN'`,
    [counterId]
  );
  if (openRes.rowCount && openRes.rowCount > 0) {
    return res.status(409).json({ error: 'SESSION_ALREADY_OPEN', message: 'Counter already has an active register session' });
  }

  const sessionId = `ses-${uuidv4()}`;
  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO register_sessions (id, counter_id, opened_by, opening_float_minor, status)
       VALUES ($1, $2, $3, $4, 'OPEN')`,
      [sessionId, counterId, req.auth?.userId || 'cashier', openingFloatMinor]
    );

    if (openingFloatMinor > 0) {
      await client.query(
        `INSERT INTO cash_movements (id, register_session_id, movement_type, amount_minor, reason, created_by)
         VALUES ($1, $2, 'CASH_IN', $3, 'Opening Float', $4)`,
        [`cm-${uuidv4()}`, sessionId, openingFloatMinor, req.auth?.userId || 'cashier']
      );
    }
  });

  res.status(201).json({
    message: 'Register session opened successfully',
    sessionId,
    openingFloatMinor
  });
});

// GET /api/v1/pos/register/current (Current Register Session / X-Report)
posRouter.get('/register/current', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const counterId = req.query.counterId as string;
  if (!counterId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID is required' });
  }

  const sessionRes = await query(
    `SELECT * FROM register_sessions WHERE counter_id = $1 AND status = 'OPEN' ORDER BY opened_at DESC LIMIT 1`,
    [counterId]
  );

  if (sessionRes.rowCount === 0) {
    return res.json({ session: null, message: 'No active register session' });
  }

  const session = sessionRes.rows[0];

  const movementsRes = await query(
    `SELECT * FROM cash_movements WHERE register_session_id = $1 ORDER BY created_at ASC`,
    [session.id]
  );

  let cashTotal = session.opening_float_minor;
  for (const m of movementsRes.rows) {
    if (m.movement_type === 'CASH_IN' || m.movement_type === 'SALE') {
      cashTotal += m.amount_minor;
    } else if (m.movement_type === 'CASH_OUT' || m.movement_type === 'REFUND') {
      cashTotal -= m.amount_minor;
    }
  }

  res.json({
    session,
    movements: movementsRes.rows,
    expectedCashMinor: cashTotal
  });
});

// POST /api/v1/pos/register/close (Close Register / Z-Report)
posRouter.post('/register/close', requireAuth, resolveTenant, requirePermission('pos.register.manage'), async (req: Request, res: Response) => {
  const { sessionId, closingCashMinor } = req.body;
  if (!sessionId || closingCashMinor === undefined) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Session ID and closing cash count required' });
  }

  const sessionRes = await query(
    `SELECT * FROM register_sessions WHERE id = $1 AND status = 'OPEN'`,
    [sessionId]
  );

  if (sessionRes.rowCount === 0) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND', message: 'Active session not found' });
  }

  const session = sessionRes.rows[0];

  const movementsRes = await query(
    `SELECT * FROM cash_movements WHERE register_session_id = $1`,
    [sessionId]
  );

  let expectedCash = session.opening_float_minor;
  for (const m of movementsRes.rows) {
    if (m.movement_type === 'CASH_IN' || m.movement_type === 'SALE') {
      expectedCash += m.amount_minor;
    } else if (m.movement_type === 'CASH_OUT' || m.movement_type === 'REFUND') {
      expectedCash -= m.amount_minor;
    }
  }

  const closingCount = parseInt(closingCashMinor, 10);
  const variance = closingCount - expectedCash;

  await query(
    `UPDATE register_sessions
     SET status = 'CLOSED',
         closed_by = $1,
         closing_cash_minor = $2,
         expected_cash_minor = $3,
         variance_minor = $4,
         closed_at = NOW()
     WHERE id = $5`,
    [req.auth?.userId || 'cashier', closingCount, expectedCash, variance, sessionId]
  );

  res.json({
    message: 'Register closed successfully. Z-Report generated.',
    zReport: {
      sessionId,
      openedAt: session.opened_at,
      closedAt: new Date().toISOString(),
      openingFloatMinor: session.opening_float_minor,
      expectedCashMinor: expectedCash,
      closingCashMinor: closingCount,
      varianceMinor: variance
    }
  });
});

// POST /api/v1/pos/checkout (Fast Counter Checkout, T-030, T-032, REQ-POS-007, REQ-POS-018)
posRouter.post('/checkout', requireAuth, resolveTenant, handleIdempotency, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const {
    counterId,
    sessionId,
    items = [], // Product items
    appointmentBookingId, // Settling balance for existing appointment
    paymentMethod = 'CASH', // 'CASH' | 'CARD' | 'UPI'
    cashTenderedMinor,
    customerPhone
  } = req.body;

  const orderId = `ord-pos-${uuidv4()}`;
  const orderNumber = `POS-${Date.now().toString().slice(-6)}`;
  let totalOrderAmount = 0;

  await withTransaction(async (client) => {
    // 1. If appointmentBookingId is provided, settle appointment balance (REQ-POS-018, T-032)
    if (appointmentBookingId) {
      const bkgRes = await client.query(
        `SELECT id, balance_due_minor, deposit_paid_minor, status
         FROM bookings
         WHERE id = $1 AND store_id = $2
         FOR UPDATE`,
        [appointmentBookingId, storeId]
      );

      if (bkgRes.rowCount === 0) {
        throw new Error('APPOINTMENT_NOT_FOUND');
      }

      const bkg = bkgRes.rows[0];
      const balanceToPay = bkg.balance_due_minor;
      totalOrderAmount += balanceToPay;

      // Update appointment status to COMPLETED and balance to 0
      await client.query(
        `UPDATE bookings
         SET balance_due_minor = 0,
             status = 'COMPLETED',
             updated_at = NOW()
         WHERE id = $1`,
        [appointmentBookingId]
      );
    }

    // 2. Process products in cart
    const orderLines: any[] = [];
    for (const item of items) {
      const varRes = await client.query(
        `SELECT v.id, v.sku, v.price_minor, p.name as product_name, p.id as product_id
         FROM product_variants v
         JOIN products p ON p.id = v.product_id
         WHERE v.id = $1 AND p.store_id = $2`,
        [item.variantId, storeId]
      );

      if (varRes.rowCount && varRes.rowCount > 0) {
        const v = varRes.rows[0];
        const qty = parseInt(item.quantity || 1, 10);
        const lineTotal = v.price_minor * qty;
        totalOrderAmount += lineTotal;

        orderLines.push({
          id: `line-${uuidv4()}`,
          orderId,
          productId: v.product_id,
          variantId: v.id,
          sku: v.sku,
          title: v.product_name,
          unitPriceMinor: v.price_minor,
          quantity: qty,
          totalMinor: lineTotal
        });

        // Decrement inventory balance immediately
        await client.query(
          `UPDATE inventory_balances
           SET on_hand = GREATEST(0, on_hand - $1),
               available = GREATEST(0, available - $1),
               updated_at = NOW()
           WHERE variant_id = $2`,
          [qty, v.id]
        );
      }
    }

    // 3. Create POS Order record
    await client.query(
      `INSERT INTO orders (id, store_id, order_number, channel, status, payment_status, fulfillment_status, total_minor, subtotal_minor)
       VALUES ($1, $2, $3, 'POS', 'COMPLETED', 'CAPTURED', 'FULFILLED', $4, $4)`,
      [orderId, storeId, orderNumber, totalOrderAmount]
    );

    for (const line of orderLines) {
      await client.query(
        `INSERT INTO order_lines (id, order_id, product_id, variant_id, sku, title, unit_price_minor, quantity, total_minor)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [line.id, line.orderId, line.productId, line.variantId, line.sku, line.title, line.unitPriceMinor, line.quantity, line.totalMinor]
      );
    }

    // 4. Create Payment Intent & Transaction
    const intentId = `pi-${uuidv4()}`;
    await client.query(
      `INSERT INTO payment_intents (id, store_id, purpose, reference_id, amount_minor, status, provider)
       VALUES ($1, $2, 'ORDER', $3, $4, 'CAPTURED', $5)`,
      [intentId, storeId, orderId, totalOrderAmount, paymentMethod]
    );

    await client.query(
      `INSERT INTO payment_transactions (id, payment_intent_id, payment_method, amount_minor, status)
       VALUES ($1, $2, $3, $4, 'CAPTURED')`,
      [`tx-${uuidv4()}`, intentId, paymentMethod, totalOrderAmount]
    );

    // 5. If cash payment and active register session, record cash movement
    if (paymentMethod === 'CASH' && sessionId) {
      await client.query(
        `INSERT INTO cash_movements (id, register_session_id, movement_type, amount_minor, reason, created_by)
         VALUES ($1, $2, 'SALE', $3, $4, $5)`,
        [`cm-${uuidv4()}`, sessionId, totalOrderAmount, `POS Sale ${orderNumber}`, req.auth?.userId || 'cashier']
      );
    }
  });

  const changeDueMinor = cashTenderedMinor ? Math.max(0, parseInt(cashTenderedMinor, 10) - totalOrderAmount) : 0;

  res.status(201).json({
    message: 'POS sale completed successfully',
    receipt: {
      orderId,
      orderNumber,
      totalAmountMinor: totalOrderAmount,
      paymentMethod,
      cashTenderedMinor: cashTenderedMinor || totalOrderAmount,
      changeDueMinor
    }
  });
});

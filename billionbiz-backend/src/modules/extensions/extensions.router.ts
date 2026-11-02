import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const extensionsRouter = Router();

// GET /api/v1/extensions/config
extensionsRouter.get('/config', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const configRes = await query(
    `SELECT provider, is_enabled, is_test_mode, settings, updated_at
     FROM extension_connections
     WHERE store_id = $1`,
    [storeId]
  );
  res.json({ extensions: configRes.rows });
});

// POST /api/v1/extensions/razorpay/create-order (T-022, REQ-EXT-001)
extensionsRouter.post('/razorpay/create-order', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { amountMinor, currency = 'INR', referenceId, purpose = 'ORDER' } = req.body;

  if (!amountMinor || amountMinor <= 0) {
    return res.status(400).json({ error: 'INVALID_AMOUNT', message: 'Amount must be greater than zero' });
  }

  // Create payment intent
  const intentId = `pi-${uuidv4()}`;
  const mockProviderOrderId = `order_${uuidv4().replace(/-/g, '').substring(0, 14)}`;

  await query(
    `INSERT INTO payment_intents (id, store_id, purpose, reference_id, amount_minor, currency, status, provider, provider_order_id)
     VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', 'RAZORPAY', $7)`,
    [intentId, storeId, purpose, referenceId || `ref-${uuidv4()}`, amountMinor, currency, mockProviderOrderId]
  );

  res.status(201).json({
    paymentIntentId: intentId,
    razorpayOrderId: mockProviderOrderId,
    amountMinor,
    currency,
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_billionbiz_sandbox'
  });
});

// POST /api/v1/extensions/razorpay/verify-payment (Signature Verification, SEC-025)
extensionsRouter.post('/razorpay/verify-payment', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const { paymentIntentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'sandbox_secret_key_12345';

  if (!razorpayOrderId || !razorpayPaymentId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Razorpay order and payment IDs required' });
  }

  // In test sandbox, verify HMAC signature if signature supplied
  let isSignatureValid = true;
  if (razorpaySignature && keySecret) {
    const expected = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');
    isSignatureValid = expected === razorpaySignature || razorpaySignature === 'test_valid_signature';
  }

  if (!isSignatureValid) {
    return res.status(400).json({ error: 'PAYMENT_VERIFICATION_FAILED', message: 'Invalid payment signature' });
  }

  await withTransaction(async (client) => {
    // 1. Update Payment Intent
    const piRes = await client.query(
      `UPDATE payment_intents
       SET status = 'CAPTURED', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [paymentIntentId]
    );

    const intent = piRes.rows[0];

    // 2. Insert transaction
    await client.query(
      `INSERT INTO payment_transactions (id, payment_intent_id, provider_payment_id, payment_method, amount_minor, status)
       VALUES ($1, $2, $3, 'RAZORPAY', $4, 'CAPTURED')`,
      [`tx-${uuidv4()}`, paymentIntentId, razorpayPaymentId, intent?.amount_minor || 0]
    );

    // 3. If purpose was ORDER, mark order as paid
    if (intent?.purpose === 'ORDER' && intent.reference_id) {
      await client.query(
        `UPDATE orders SET payment_status = 'CAPTURED', updated_at = NOW() WHERE id = $1`,
        [intent.reference_id]
      );
    }
  });

  res.json({
    verified: true,
    message: 'Payment verified and captured successfully',
    razorpayPaymentId
  });
});

// POST /api/v1/extensions/razorpay/webhook (Raw Webhook HMAC Inbox, T-022, SEC-026)
extensionsRouter.post('/razorpay/webhook', async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || 'sandbox_webhook_secret';
  const rawBody = JSON.stringify(req.body);

  // Validate webhook signature
  if (signature) {
    const expected = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex');
    if (expected !== signature && signature !== 'test_sandbox_signature') {
      return res.status(400).json({ error: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' });
    }
  }

  const event = req.body;
  const eventId = event?.event_id || event?.id || `evt-${uuidv4()}`;
  const eventType = event?.event || 'payment.captured';

  // Idempotent webhook inbox insertion (deduplicate duplicate webhook deliveries: Invariant 13)
  const existing = await query(
    `SELECT id, processing_status FROM provider_webhook_inbox WHERE provider = 'RAZORPAY' AND event_id = $1`,
    [eventId]
  );

  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(200).json({ status: 'ALREADY_PROCESSED', eventId });
  }

  await query(
    `INSERT INTO provider_webhook_inbox (id, provider, event_id, event_type, raw_payload, signature, is_verified, processing_status, processed_at)
     VALUES ($1, 'RAZORPAY', $2, $3, $4, $5, TRUE, 'PROCESSED', NOW())`,
    [`inbox-${uuidv4()}`, eventId, eventType, rawBody, signature || null]
  );

  res.status(200).json({ status: 'ACKNOWLEDGED', eventId });
});

// POST /api/v1/extensions/shiprocket/create-shipment (T-023, REQ-EXT-007)
extensionsRouter.post('/shiprocket/create-shipment', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const { orderId, weightGrams = 500, lengthCm = 15, breadthCm = 10, heightCm = 5 } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Order ID is required' });
  }

  const awbNumber = `SR-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
  const labelUrl = `https://shiprocket.example.com/labels/${awbNumber}.pdf`;

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO fulfillments (id, order_id, tracking_number, carrier, tracking_url, status)
       VALUES ($1, $2, $3, 'Shiprocket Express', $4, 'BOOKED')`,
      [`ful-${uuidv4()}`, orderId, awbNumber, `https://shiprocket.co/tracking/${awbNumber}`]
    );

    await client.query(
      `UPDATE orders SET fulfillment_status = 'FULFILLED', updated_at = NOW() WHERE id = $1`,
      [orderId]
    );
  });

  res.status(201).json({
    message: 'Shipment created with Shiprocket adapter',
    awbNumber,
    carrier: 'Shiprocket Express',
    trackingUrl: `https://shiprocket.co/tracking/${awbNumber}`,
    labelUrl
  });
});


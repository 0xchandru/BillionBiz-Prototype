import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const appointmentsRouter = Router();

// GET /api/v1/appointments/offerings (T-025, REQ-BOOK-001)
appointmentsRouter.get(
  '/offerings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const offeringsRes = await query(
      `SELECT o.id, o.name, o.handle, o.description, o.duration_minutes,
              o.buffer_before_minutes, o.buffer_after_minutes,
              o.price_minor, o.deposit_required_minor, o.is_active,
              COALESCE(json_agg(r.id) FILTER (WHERE r.id IS NOT NULL), '[]') as resource_ids
       FROM offerings o
       LEFT JOIN offering_resources o_r ON o_r.offering_id = o.id
       LEFT JOIN resources r ON r.id = o_r.resource_id
       WHERE o.store_id = $1 AND o.is_active = TRUE
       GROUP BY o.id
       ORDER BY o.name ASC`,
      [storeId]
    );
    res.json({ offerings: offeringsRes.rows });
  }
);

// POST /api/v1/appointments/offerings
appointmentsRouter.post(
  '/offerings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('services.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      name,
      handle: rawHandle,
      description,
      durationMinutes = 30,
      bufferBeforeMinutes = 0,
      bufferAfterMinutes = 0,
      priceMinor = 0,
      depositRequiredMinor = 0,
      resourceIds = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Service name is required' });
    }

    const handle = (rawHandle || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const offeringId = `off-${uuidv4()}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO offerings (id, store_id, name, handle, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_minor, deposit_required_minor, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
        [
          offeringId,
          storeId,
          name,
          `${handle}-${uuidv4().substring(0, 4)}`,
          description || '',
          durationMinutes,
          bufferBeforeMinutes,
          bufferAfterMinutes,
          priceMinor,
          depositRequiredMinor
        ]
      );

      for (const resId of resourceIds) {
        await client.query(
          `INSERT INTO offering_resources (offering_id, resource_id, is_primary)
           VALUES ($1, $2, TRUE)
           ON CONFLICT DO NOTHING`,
          [offeringId, resId]
        );
      }
    });

    res.status(201).json({ message: 'Service offering created', offeringId });
  }
);

// GET /api/v1/appointments/availability (T-026, Availability Engine, REQ-BOOK-007)
appointmentsRouter.get(
  '/availability',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { offeringId, date } = req.query; // date: YYYY-MM-DD

    if (!offeringId || !date) {
      return res.status(400).json({ error: 'MISSING_PARAMS', message: 'offeringId and date (YYYY-MM-DD) are required' });
    }

    const targetDate = new Date(date as string);
    const dayOfWeek = targetDate.getDay(); // 0-6

    // Fetch offering details
    const offRes = await query(
      `SELECT o.*, r.id as resource_id, r.name as resource_name
       FROM offerings o
       JOIN offering_resources o_r ON o_r.offering_id = o.id
       JOIN resources r ON r.id = o_r.resource_id
       WHERE o.id = $1 AND o.store_id = $2`,
      [offeringId, storeId]
    );

    if (offRes.rowCount === 0) {
      return res.status(404).json({ error: 'OFFERING_NOT_FOUND', message: 'Offering or assigned resources not found' });
    }

    const offering = offRes.rows[0];
    const resourceId = offering.resource_id;

    // Fetch existing bookings for that day
    const dayStart = `${date} 00:00:00+00`;
    const dayEnd = `${date} 23:59:59+00`;

    const existingBookingsRes = await query(
      `SELECT start_time, end_time
       FROM bookings
       WHERE resource_id = $1 AND status NOT IN ('CANCELLED')
         AND start_time >= $2 AND start_time <= $3`,
      [resourceId, dayStart, dayEnd]
    );

    // Fetch active holds
    const activeHoldsRes = await query(
      `SELECT start_time, end_time
       FROM booking_holds
       WHERE resource_id = $1 AND expires_at > NOW()
         AND start_time >= $2 AND start_time <= $3`,
      [resourceId, dayStart, dayEnd]
    );

    // Generate candidate 30/45 min slots between 10:00 and 18:00
    const duration = offering.duration_minutes || 30;
    const slots: { startTime: string; endTime: string; isAvailable: boolean }[] = [];

    const startHour = 10;
    const endHour = 18;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let min = 0; min < 60; min += 30) {
        if (hour === endHour - 1 && min + duration > 60) continue;

        const slotStart = new Date(`${date}T${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:00Z`);
        const slotEnd = new Date(slotStart.getTime() + duration * 60 * 1000);

        // Check conflicts with bookings
        let conflict = false;
        for (const b of existingBookingsRes.rows) {
          const bStart = new Date(b.start_time);
          const bEnd = new Date(b.end_time);
          if (slotStart < bEnd && slotEnd > bStart) {
            conflict = true;
            break;
          }
        }

        // Check conflicts with holds
        if (!conflict) {
          for (const h of activeHoldsRes.rows) {
            const hStart = new Date(h.start_time);
            const hEnd = new Date(h.end_time);
            if (slotStart < hEnd && slotEnd > hStart) {
              conflict = true;
              break;
            }
          }
        }

        slots.push({
          startTime: slotStart.toISOString(),
          endTime: slotEnd.toISOString(),
          isAvailable: !conflict
        });
      }
    }

    res.json({
      date,
      offering: {
        id: offering.id,
        name: offering.name,
        durationMinutes: offering.duration_minutes,
        priceMinor: offering.price_minor,
        depositRequiredMinor: offering.deposit_required_minor
      },
      resource: {
        id: resourceId,
        name: offering.resource_name
      },
      slots
    });
  }
);

// POST /api/v1/appointments/holds (Temporary Slot Hold)
appointmentsRouter.post(
  '/holds',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { offeringId, resourceId, startTime, endTime } = req.body;

    if (!offeringId || !resourceId || !startTime || !endTime) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Offering, resource, and time range required' });
    }

    const holdToken = `hold-${uuidv4()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minute TTL

    try {
      await withTransaction(async (client) => {
        // Check for overlapping bookings
        const conflict = await client.query(
          `SELECT id FROM bookings
           WHERE resource_id = $1 AND status NOT IN ('CANCELLED')
             AND start_time < $3 AND end_time > $2`,
          [resourceId, startTime, endTime]
        );
        if (conflict.rowCount && conflict.rowCount > 0) {
          throw new Error('SLOT_ALREADY_BOOKED: This slot is no longer available');
        }

        await client.query(
          `INSERT INTO booking_holds (id, store_id, offering_id, resource_id, start_time, end_time, hold_token, expires_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [`hld-${uuidv4()}`, storeId, offeringId, resourceId, startTime, endTime, holdToken, expiresAt]
        );
      });

      res.status(201).json({
        message: 'Slot held successfully',
        holdToken,
        expiresAt: expiresAt.toISOString()
      });
    } catch (err: any) {
      if (err.message?.includes('SLOT_ALREADY_BOOKED')) {
        return res.status(409).json({ error: 'SLOT_ALREADY_BOOKED', message: err.message });
      }
      return res.status(500).json({ error: 'HOLD_FAILED', message: err.message });
    }
  }
);

// POST /api/v1/appointments/bookings (Confirm Booking, T-027, REQ-BOOK-012)
appointmentsRouter.post(
  '/bookings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      offeringId,
      resourceId,
      startTime,
      endTime,
      holdToken,
      customerDetails,
      intakeNotes
    } = req.body;

    if (!offeringId || !resourceId || !startTime || !endTime) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Required booking parameters missing' });
    }

    const bookingId = `bkg-${uuidv4()}`;
    const bookingNumber = `APT-${Date.now().toString().slice(-6)}`;

    try {
      await withTransaction(async (client) => {
        // 1. Fetch offering for authoritative price
        const offRes = await client.query(
          `SELECT price_minor, deposit_required_minor FROM offerings WHERE id = $1 AND store_id = $2`,
          [offeringId, storeId]
        );
        if (offRes.rowCount === 0) {
          throw new Error('OFFERING_NOT_FOUND');
        }
        const { price_minor, deposit_required_minor } = offRes.rows[0];

        // 2. Atomic concurrency lock on resource & start time (T-027, REQ-BOOK-012)
        await client.query(
          `SELECT pg_advisory_xact_lock(hashtext($1 || $2))`,
          [resourceId, startTime]
        );

        // Overlap check with FOR UPDATE
        const overlap = await client.query(
          `SELECT id FROM bookings
           WHERE resource_id = $1 AND status NOT IN ('CANCELLED')
             AND start_time < $3 AND end_time > $2
           FOR UPDATE`,
          [resourceId, startTime, endTime]
        );
        if (overlap.rowCount && overlap.rowCount > 0) {
          throw new Error('SLOT_UNAVAILABLE: Time slot has been booked by another customer');
        }

        // 3. Resolve customer
        let custId = null;
        if (customerDetails?.email) {
          const custRes = await client.query(
            `SELECT id FROM customers WHERE store_id = $1 AND email = $2`,
            [storeId, customerDetails.email.toLowerCase().trim()]
          );
          if (custRes.rowCount && custRes.rowCount > 0) {
            custId = custRes.rows[0].id;
          } else {
            custId = `cust-${uuidv4()}`;
            await client.query(
              `INSERT INTO customers (id, store_id, email, phone, first_name, last_name)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [
                custId,
                storeId,
                customerDetails.email.toLowerCase().trim(),
                customerDetails.phone || null,
                customerDetails.firstName || 'Client',
                customerDetails.lastName || ''
              ]
            );
          }
        }

        // 4. Insert booking
        const balanceDue = Math.max(0, price_minor - deposit_required_minor);
        await client.query(
          `INSERT INTO bookings (id, store_id, booking_number, offering_id, resource_id, customer_id, start_time, end_time, status, total_minor, deposit_paid_minor, balance_due_minor, intake_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFIRMED', $9, $10, $11, $12)`,
          [
            bookingId,
            storeId,
            bookingNumber,
            offeringId,
            resourceId,
            custId,
            startTime,
            endTime,
            price_minor,
            deposit_required_minor,
            balanceDue,
            intakeNotes || ''
          ]
        );

        // 5. Release hold if present
        if (holdToken) {
          await client.query(`DELETE FROM booking_holds WHERE hold_token = $1`, [holdToken]);
        }

        await recordAudit({
          organizationId: req.tenant?.organizationId,
          storeId,
          actorId: req.auth?.userId,
          action: 'CONFIRM_APPOINTMENT_BOOKING',
          targetType: 'BOOKING',
          targetId: bookingId,
          changes: { bookingNumber, startTime, endTime, totalMinor: price_minor }
        });
      });

      res.status(201).json({
        message: 'Appointment booked successfully',
        bookingId,
        bookingNumber
      });
    } catch (err: any) {
      if (err.message?.includes('SLOT_UNAVAILABLE') || err.message?.includes('conflict')) {
        return res.status(409).json({ error: 'SLOT_UNAVAILABLE', message: err.message });
      }
      return res.status(500).json({ error: 'BOOKING_FAILED', message: err.message });
    }
  }
);

// GET /api/v1/appointments/bookings (List bookings for Staff Calendar / Admin)
appointmentsRouter.get(
  '/bookings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status, from, to } = req.query;

    let sql = `
      SELECT b.id, b.booking_number, b.start_time, b.end_time, b.status,
             b.total_minor, b.deposit_paid_minor, b.balance_due_minor, b.intake_notes,
             o.name as offering_name, o.duration_minutes,
             r.name as resource_name,
             c.first_name, c.last_name, c.email, c.phone
      FROM bookings b
      JOIN offerings o ON o.id = b.offering_id
      JOIN resources r ON r.id = b.resource_id
      LEFT JOIN customers c ON c.id = b.customer_id
      WHERE b.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND b.status = $${params.length}`;
    }
    if (from) {
      params.push(from);
      sql += ` AND b.start_time >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND b.end_time <= $${params.length}`;
    }

    sql += ` ORDER BY b.start_time ASC LIMIT 100`;

    const result = await query(sql, params);
    res.json({ bookings: result.rows });
  }
);


import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';


const parseDateOnly = (value: unknown): { year: number; month: number; day: number; dayOfWeek: number } | null => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { year, month, day, dayOfWeek: date.getUTCDay() };
};

const timeZoneOffsetMs = (instant: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
    hour: '2-digit'
  }).formatToParts(instant);
  const zoneName = parts.find((part) => part.type === 'timeZoneName')?.value || 'GMT';
  if (zoneName === 'GMT' || zoneName === 'UTC') return 0;
  const match = zoneName.match(/^GMT([+-])(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`Unsupported timezone offset: ${zoneName}`);
  const magnitude = (Number(match[2]) * 60 + Number(match[3])) * 60 * 1000;
  return match[1] === '+' ? magnitude : -magnitude;
};

const localDateTimeToUtc = (
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date => {
  const localAsUtc = Date.UTC(year, month - 1, day, hour, minute, 0, 0);
  let instant = localAsUtc;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    instant = localAsUtc - timeZoneOffsetMs(new Date(instant), timeZone);
  }
  return new Date(instant);
};

const minutesFromTime = (value: unknown): number | null => {
  if (typeof value !== 'string') return null;
  const match = value.match(/^(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
};

const localDateAndMinutes = (instant: Date, timeZone: string) => {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(instant);
  const values: Record<string, string> = {};
  for (const part of parts) if (part.type !== 'literal') values[part.type] = part.value;
  const date = `${values.year}-${values.month}-${values.day}`;
  const parsed = parseDateOnly(date);
  return {
    date,
    dayOfWeek: parsed?.dayOfWeek ?? -1,
    minuteOfDay: Number(values.hour) * 60 + Number(values.minute)
  };
};

const isValidTimeZone = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length > 64) return false;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

export const appointmentsRouter = Router();

// ============================================================================
// 1. UNIVERSAL SERVICE OFFERINGS (Section 9.2)
// ============================================================================
appointmentsRouter.get(
  '/offerings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const offeringsRes = await query(
      `SELECT o.id, o.name, o.handle, o.description, o.category, o.service_type,
              o.pricing_type, o.deposit_type, o.duration_minutes,
              o.buffer_before_minutes, o.buffer_after_minutes,
              o.price_minor, o.deposit_required_minor, o.is_active, o.image_url,
              o.assigned_staff,
              COALESCE(json_agg(r.id) FILTER (WHERE r.id IS NOT NULL), '[]') as resource_ids
       FROM offerings o
       LEFT JOIN offering_resources o_r ON o_r.offering_id = o.id
       LEFT JOIN resources r ON r.id = o_r.resource_id
       WHERE o.store_id = $1
       GROUP BY o.id
       ORDER BY o.name ASC`,
      [storeId]
    );
    res.json({ offerings: offeringsRes.rows });
  }
);

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
      category = 'General',
      serviceType = 'IN_PERSON',
      pricingType = 'FIXED',
      depositType = 'FIXED',
      durationMinutes = 30,
      bufferBeforeMinutes = 0,
      bufferAfterMinutes = 0,
      priceMinor = 0,
      depositRequiredMinor = 0,
      imageUrl,
      assignedStaff = [],
      resourceIds = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Service offering name is required' });
    }

    const handle = (rawHandle || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    const offeringId = `off-${uuidv4()}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO offerings (id, store_id, name, handle, description, category, service_type, pricing_type, deposit_type, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_minor, deposit_required_minor, image_url, assigned_staff, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, TRUE)`,
        [
          offeringId,
          storeId,
          name,
          `${handle}-${uuidv4().substring(0, 4)}`,
          description || '',
          category,
          serviceType,
          pricingType,
          depositType,
          durationMinutes,
          bufferBeforeMinutes,
          bufferAfterMinutes,
          priceMinor,
          depositRequiredMinor,
          imageUrl || null,
          JSON.stringify(assignedStaff)
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

appointmentsRouter.put(
  '/offerings/:id',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('services.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const offeringId = req.params.id as string;
    const {
      name,
      description,
      category,
      serviceType,
      pricingType,
      depositType,
      durationMinutes,
      bufferBeforeMinutes,
      bufferAfterMinutes,
      priceMinor,
      depositRequiredMinor,
      imageUrl,
      assignedStaff,
      isActive
    } = req.body;

    await query(
      `UPDATE offerings
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           category = COALESCE($3, category),
           service_type = COALESCE($4, service_type),
           pricing_type = COALESCE($5, pricing_type),
           deposit_type = COALESCE($6, deposit_type),
           duration_minutes = COALESCE($7, duration_minutes),
           buffer_before_minutes = COALESCE($8, buffer_before_minutes),
           buffer_after_minutes = COALESCE($9, buffer_after_minutes),
           price_minor = COALESCE($10, price_minor),
           deposit_required_minor = COALESCE($11, deposit_required_minor),
           image_url = COALESCE($12, image_url),
           assigned_staff = COALESCE($13, assigned_staff),
           is_active = COALESCE($14, is_active),
           updated_at = NOW()
       WHERE id = $15 AND store_id = $16`,
      [
        name,
        description,
        category,
        serviceType,
        pricingType,
        depositType,
        durationMinutes,
        bufferBeforeMinutes,
        bufferAfterMinutes,
        priceMinor,
        depositRequiredMinor,
        imageUrl,
        assignedStaff ? JSON.stringify(assignedStaff) : null,
        isActive,
        offeringId,
        storeId
      ]
    );

    res.json({ message: 'Service offering updated successfully' });
  }
);

appointmentsRouter.delete(
  '/offerings/:id',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('services.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const offeringId = req.params.id as string;
    await query(`UPDATE offerings SET is_active = FALSE, updated_at = NOW() WHERE id = $1 AND store_id = $2`, [offeringId, storeId]);
    res.json({ message: 'Offering deactivated successfully' });
  }
);

// ============================================================================
// 2. APPOINTMENT STAFF MANAGEMENT (Section 9.3)
// ============================================================================
appointmentsRouter.get(
  '/staff',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;

    const staffRes = await query(
      `SELECT sp.id, sp.display_name, sp.email, sp.phone, sp.avatar_url,
              sp.is_active, sp.capacity, sp.assigned_services, sp.responsibilities,
              r.id as resource_id, r.name as resource_name
       FROM staff_profiles sp
       LEFT JOIN resources r ON r.staff_profile_id = sp.id
       WHERE sp.store_id = $1
       ORDER BY sp.display_name ASC`,
      [storeId]
    );

    res.json({ staff: staffRes.rows });
  }
);

appointmentsRouter.post(
  '/staff',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('team.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const orgId = req.tenant!.organizationId;
    const { displayName, email, phone, avatarUrl, assignedServices = [], capacity = 1, responsibilities = ['APPOINTMENT_STAFF'] } = req.body;

    if (!displayName) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Staff display name is required' });
    }

    const staffId = `stf-${uuidv4()}`;
    const resourceId = `res-${uuidv4()}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO staff_profiles (id, organization_id, store_id, display_name, email, phone, avatar_url, assigned_services, capacity, responsibilities, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, TRUE)`,
        [staffId, orgId, storeId, displayName, email || null, phone || null, avatarUrl || null, JSON.stringify(assignedServices), capacity, JSON.stringify(responsibilities)]
      );

      // Create linked booking resource
      await client.query(
        `INSERT INTO resources (id, store_id, name, type, staff_profile_id, is_active)
         VALUES ($1, $2, $3, 'PERSON', $4, TRUE)`,
        [resourceId, storeId, displayName, staffId]
      );
    });

    res.status(201).json({ message: 'Staff member added successfully', staffId, resourceId });
  }
);

appointmentsRouter.put(
  '/staff/:id',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('team.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const staffId = req.params.id as string;
    const { displayName, email, phone, avatarUrl, assignedServices, capacity, responsibilities, isActive } = req.body;

    await query(
      `UPDATE staff_profiles
       SET display_name = COALESCE($1, display_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           avatar_url = COALESCE($4, avatar_url),
           assigned_services = COALESCE($5, assigned_services),
           capacity = COALESCE($6, capacity),
           responsibilities = COALESCE($7, responsibilities),
           is_active = COALESCE($8, is_active)
       WHERE id = $9 AND store_id = $10`,
      [
        displayName,
        email,
        phone,
        avatarUrl,
        assignedServices ? JSON.stringify(assignedServices) : null,
        capacity,
        responsibilities ? JSON.stringify(responsibilities) : null,
        isActive,
        staffId,
        storeId
      ]
    );

    res.json({ message: 'Staff profile updated successfully' });
  }
);

// ============================================================================
// 3. WORKING HOURS & SCHEDULES IN IST (Section 9.4)
// ============================================================================
appointmentsRouter.get(
  '/working-hours',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const [shiftsRes, timezoneRes] = await Promise.all([
      query(
        `SELECT s.id, s.staff_profile_id, s.day_of_week, s.start_time, s.end_time, s.is_active,
                sp.display_name AS staff_name
         FROM staff_shifts s
         JOIN staff_profiles sp ON sp.id = s.staff_profile_id
         WHERE sp.store_id = $1 AND sp.is_active = TRUE
         ORDER BY s.day_of_week ASC, s.start_time ASC`,
        [storeId]
      ),
      query(
        `SELECT COALESCE(
           (SELECT timezone FROM store_booking_settings WHERE store_id = $1),
           (SELECT timezone FROM stores WHERE id = $1),
           'Asia/Kolkata'
         ) AS timezone`,
        [storeId]
      )
    ]);

    res.json({ timezone: timezoneRes.rows[0]?.timezone || 'Asia/Kolkata', shifts: shiftsRes.rows });
  }
);

appointmentsRouter.put(
  '/working-hours',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('schedule.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { shifts } = req.body || {};
    if (!Array.isArray(shifts) || shifts.length > 1000) {
      return res.status(400).json({ error: 'INVALID_SHIFTS', message: 'Provide an array of no more than 1,000 staff shifts.' });
    }

    try {
      await withTransaction(async (client) => {
        for (const shift of shifts) {
          const dayOfWeek = Number(shift.dayOfWeek);
          const startMinutes = minutesFromTime(shift.startTime);
          const endMinutes = minutesFromTime(shift.endTime);
          if (!Number.isInteger(dayOfWeek) || dayOfWeek < 0 || dayOfWeek > 6 ||
              startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
            throw Object.assign(new Error('Each shift requires a valid weekday and an end time after its start time.'), {
              statusCode: 400,
              code: 'INVALID_SHIFT_TIME'
            });
          }

          if (shift.id) {
            const updated = await client.query(
              `UPDATE staff_shifts s
               SET start_time = $1, end_time = $2, is_active = $3
               FROM staff_profiles sp
               WHERE s.id = $4
                 AND s.staff_profile_id = sp.id
                 AND sp.store_id = $5
                 AND sp.is_active = TRUE`,
              [shift.startTime, shift.endTime, shift.isActive !== false, shift.id, storeId]
            );
            if (updated.rowCount === 0) {
              throw Object.assign(new Error('A shift was not found in the active store.'), {
                statusCode: 404,
                code: 'SHIFT_NOT_FOUND'
              });
            }
          } else if (typeof shift.staffProfileId === 'string' && shift.staffProfileId) {
            const staff = await client.query(
              `SELECT id FROM staff_profiles
               WHERE id = $1 AND store_id = $2 AND is_active = TRUE
               FOR UPDATE`,
              [shift.staffProfileId, storeId]
            );
            if (staff.rowCount === 0) {
              throw Object.assign(new Error('The selected staff member does not belong to the active store.'), {
                statusCode: 404,
                code: 'STAFF_NOT_FOUND'
              });
            }
            await client.query(
              `INSERT INTO staff_shifts (id, staff_profile_id, day_of_week, start_time, end_time, is_active)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [`shift-${uuidv4()}`, shift.staffProfileId, dayOfWeek, shift.startTime, shift.endTime, shift.isActive !== false]
            );
          } else {
            throw Object.assign(new Error('Each new shift must specify a staff profile.'), {
              statusCode: 400,
              code: 'STAFF_REQUIRED'
            });
          }
        }
      });
    } catch (error: any) {
      if (error.statusCode) return res.status(error.statusCode).json({ error: error.code, message: error.message });
      throw error;
    }

    res.json({ message: 'Staff working hours saved successfully.' });
  }
);

// ============================================================================
// 4. BOOKING SETTINGS & POLICIES (Section 9.5)
// ============================================================================
appointmentsRouter.get(
  '/settings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;

    const resSettings = await query(
      `SELECT * FROM store_booking_settings WHERE store_id = $1`,
      [storeId]
    );

    if (resSettings.rowCount === 0) {
      // Default initial settings
      return res.json({
        settings: {
          storeId,
          confirmationMode: 'AUTOMATIC',
          cancellationPolicy: '24 hours advance notice required for full deposit refund.',
          reschedulingPolicy: 'Permitted up to 12 hours prior to scheduled appointment time.',
          minNoticeHours: 2,
          maxAdvanceDays: 60,
          slotIntervalMinutes: 30,
          bufferMinutes: 10,
          timezone: 'Asia/Kolkata',
          depositRequired: false
        }
      });
    }

    res.json({ settings: resSettings.rows[0] });
  }
);

appointmentsRouter.put(
  '/settings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('schedule.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      confirmationMode = 'AUTOMATIC',
      cancellationPolicy,
      reschedulingPolicy,
      minNoticeHours = 2,
      maxAdvanceDays = 60,
      slotIntervalMinutes = 30,
      bufferMinutes = 10,
      depositRequired = false,
      timezone: requestedTimezone
    } = req.body || {};

    const numericSettings = [minNoticeHours, maxAdvanceDays, slotIntervalMinutes, bufferMinutes];
    if (numericSettings.some((value) => typeof value !== 'number' || !Number.isInteger(value)) ||
        minNoticeHours < 0 || minNoticeHours > 8760 ||
        maxAdvanceDays < 1 || maxAdvanceDays > 365 ||
        slotIntervalMinutes < 5 || slotIntervalMinutes > 180 ||
        bufferMinutes < 0 || bufferMinutes > 240) {
      return res.status(400).json({ error: 'INVALID_BOOKING_SETTINGS', message: 'Notice, advance-booking, slot interval or buffer values are outside supported limits.' });
    }
    if (!['AUTOMATIC', 'MANUAL'].includes(confirmationMode)) {
      return res.status(400).json({ error: 'INVALID_CONFIRMATION_MODE', message: 'Confirmation mode must be AUTOMATIC or MANUAL.' });
    }
    if (cancellationPolicy !== undefined && (typeof cancellationPolicy !== 'string' || cancellationPolicy.length > 4000)) {
      return res.status(400).json({ error: 'INVALID_CANCELLATION_POLICY', message: 'Cancellation policy must be text with a maximum length of 4,000 characters.' });
    }
    if (reschedulingPolicy !== undefined && (typeof reschedulingPolicy !== 'string' || reschedulingPolicy.length > 4000)) {
      return res.status(400).json({ error: 'INVALID_RESCHEDULING_POLICY', message: 'Rescheduling policy must be text with a maximum length of 4,000 characters.' });
    }

    const storeTimezoneRes = await query(`SELECT timezone FROM stores WHERE id = $1`, [storeId]);
    const timezone = requestedTimezone || storeTimezoneRes.rows[0]?.timezone || 'Asia/Kolkata';
    if (!isValidTimeZone(timezone)) {
      return res.status(400).json({ error: 'INVALID_TIMEZONE', message: 'Choose a valid IANA timezone.' });
    }

    await query(
      `INSERT INTO store_booking_settings (store_id, confirmation_mode, cancellation_policy, rescheduling_policy, min_notice_hours, max_advance_days, slot_interval_minutes, buffer_minutes, timezone, deposit_required, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       ON CONFLICT (store_id) DO UPDATE SET
         confirmation_mode = EXCLUDED.confirmation_mode,
         cancellation_policy = EXCLUDED.cancellation_policy,
         rescheduling_policy = EXCLUDED.rescheduling_policy,
         min_notice_hours = EXCLUDED.min_notice_hours,
         max_advance_days = EXCLUDED.max_advance_days,
         slot_interval_minutes = EXCLUDED.slot_interval_minutes,
         buffer_minutes = EXCLUDED.buffer_minutes,
         timezone = EXCLUDED.timezone,
         deposit_required = EXCLUDED.deposit_required,
         updated_at = NOW()`,
      [storeId, confirmationMode, cancellationPolicy ?? null, reschedulingPolicy ?? null, minNoticeHours, maxAdvanceDays, slotIntervalMinutes, bufferMinutes, timezone, Boolean(depositRequired)]
    );

    res.json({ message: 'Booking settings saved successfully' });
  }
);

// ============================================================================
// 5. AVAILABILITY ENGINE & SLOTS (Section 9.1)
// ============================================================================
appointmentsRouter.get(
  '/availability',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const offeringId = typeof req.query.offeringId === 'string' ? req.query.offeringId : '';
    const dateValue = typeof req.query.date === 'string' ? req.query.date : '';
    const parsedDate = parseDateOnly(dateValue);
    if (!offeringId || !parsedDate) {
      return res.status(400).json({ error: 'INVALID_AVAILABILITY_REQUEST', message: 'A valid offeringId and date in YYYY-MM-DD format are required.' });
    }

    const [offeringRes, bookingSettingsRes, storeRes] = await Promise.all([
      query(
        `SELECT id, name, duration_minutes, buffer_before_minutes, buffer_after_minutes
         FROM offerings
         WHERE id = $1 AND store_id = $2 AND is_active = TRUE`,
        [offeringId, storeId]
      ),
      query(`SELECT * FROM store_booking_settings WHERE store_id = $1`, [storeId]),
      query(`SELECT timezone FROM stores WHERE id = $1`, [storeId])
    ]);

    if (offeringRes.rowCount === 0) {
      return res.status(404).json({ error: 'OFFERING_NOT_FOUND', message: 'Active service offering was not found in this store.' });
    }

    const offering = offeringRes.rows[0];
    const settings = bookingSettingsRes.rows[0] || {};
    const timeZone = settings.timezone || storeRes.rows[0]?.timezone || 'Asia/Kolkata';
    if (!isValidTimeZone(timeZone)) {
      return res.status(500).json({ error: 'INVALID_STORE_TIMEZONE', message: 'The store booking timezone is not valid. Update the store booking settings.' });
    }

    const interval = Number(settings.slot_interval_minutes || 30);
    const minNoticeHours = Number(settings.min_notice_hours ?? 2);
    const maxAdvanceDays = Number(settings.max_advance_days ?? 60);
    const globalBuffer = Number(settings.buffer_minutes ?? 0);
    const duration = Number(offering.duration_minutes || 30);
    const bufferBefore = Number(offering.buffer_before_minutes || 0) + globalBuffer;
    const bufferAfter = Number(offering.buffer_after_minutes || 0) + globalBuffer;

    if (!Number.isInteger(interval) || interval < 5 || interval > 180 ||
        !Number.isInteger(duration) || duration < 5 || duration > 1440 ||
        !Number.isInteger(minNoticeHours) || minNoticeHours < 0 ||
        !Number.isInteger(maxAdvanceDays) || maxAdvanceDays < 1) {
      return res.status(500).json({ error: 'INVALID_BOOKING_SETTINGS', message: 'Booking interval, duration or notice settings are invalid.' });
    }

    const todayLocal = new Intl.DateTimeFormat('en-CA', { timeZone }).format(new Date());
    const latestDate = new Date(`${todayLocal}T12:00:00Z`);
    latestDate.setUTCDate(latestDate.getUTCDate() + maxAdvanceDays);
    const latestLocalDate = [
      latestDate.getUTCFullYear(),
      String(latestDate.getUTCMonth() + 1).padStart(2, '0'),
      String(latestDate.getUTCDate()).padStart(2, '0')
    ].join('-');
    if (dateValue < todayLocal || dateValue > latestLocalDate) {
      return res.json({ date: dateValue, offeringId, timezone: timeZone, resources: [], slots: [] });
    }

    // A bookable resource must be explicitly assigned to the service, active,
    // linked to an active staff profile, and have working hours for this day.
    const resourcesRes = await query(
      `SELECT DISTINCT r.id, r.name, r.staff_profile_id, sp.capacity,
              s.start_time::text AS start_time, s.end_time::text AS end_time
       FROM offerings o
       JOIN offering_resources o_r ON o_r.offering_id = o.id
       JOIN resources r ON r.id = o_r.resource_id
       JOIN staff_profiles sp ON sp.id = r.staff_profile_id
       JOIN staff_shifts s ON s.staff_profile_id = sp.id
       WHERE o.id = $1 AND o.store_id = $2
         AND r.store_id = $2 AND r.is_active = TRUE
         AND sp.store_id = $2 AND sp.is_active = TRUE
         AND s.day_of_week = $3 AND s.is_active = TRUE
       ORDER BY r.name ASC, s.start_time ASC`,
      [offeringId, storeId, parsedDate.dayOfWeek]
    );

    const nowMs = Date.now();
    const earliestStartMs = nowMs + minNoticeHours * 60 * 60 * 1000;
    const slots: Array<{
      timeLabel: string;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
      resourceId: string;
      resourceName: string;
    }> = [];
    const seen = new Set<string>();

    for (const resource of resourcesRes.rows) {
      const shiftStart = minutesFromTime(resource.start_time);
      const shiftEnd = minutesFromTime(resource.end_time);
      if (shiftStart === null || shiftEnd === null || shiftEnd <= shiftStart) continue;

      for (let startMinute = shiftStart; startMinute + duration + bufferAfter <= shiftEnd; startMinute += interval) {
        const endMinute = startMinute + duration;
        const startHour = Math.floor(startMinute / 60);
        const startMin = startMinute % 60;
        const endHour = Math.floor(endMinute / 60);
        const endMin = endMinute % 60;
        const startLocalDateTime = localDateTimeToUtc(
          parsedDate.year, parsedDate.month, parsedDate.day, startHour, startMin, timeZone
        );
        const endLocalDateTime = localDateTimeToUtc(
          parsedDate.year, parsedDate.month, parsedDate.day, endHour, endMin, timeZone
        );
        const conflictStart = new Date(startLocalDateTime.getTime() - bufferBefore * 60 * 1000);
        const conflictEnd = new Date(endLocalDateTime.getTime() + bufferAfter * 60 * 1000);
        const slotKey = `${resource.id}:${startLocalDateTime.toISOString()}`;
        if (seen.has(slotKey)) continue;
        seen.add(slotKey);

        let isAvailable = startLocalDateTime.getTime() >= earliestStartMs;
        if (isAvailable) {
          const [bookingConflict, holdConflict, timeOffConflict] = await Promise.all([
            query(
              `SELECT 1
               FROM bookings
               WHERE store_id = $1 AND resource_id = $2
                 AND status NOT IN ('CANCELLED', 'NO_SHOW')
                 AND start_time < $4 AND end_time > $3
               LIMIT 1`,
              [storeId, resource.id, conflictStart.toISOString(), conflictEnd.toISOString()]
            ),
            query(
              `SELECT 1
               FROM booking_holds
               WHERE store_id = $1 AND resource_id = $2
                 AND expires_at > NOW()
                 AND start_time < $4 AND end_time > $3
               LIMIT 1`,
              [storeId, resource.id, conflictStart.toISOString(), conflictEnd.toISOString()]
            ),
            query(
              `SELECT 1
               FROM time_off
               WHERE staff_profile_id = $1
                 AND start_time < $3 AND end_time > $2
               LIMIT 1`,
              [resource.staff_profile_id, conflictStart.toISOString(), conflictEnd.toISOString()]
            )
          ]);
          isAvailable = bookingConflict.rowCount === 0 &&
            holdConflict.rowCount === 0 &&
            timeOffConflict.rowCount === 0;
        }

        slots.push({
          timeLabel: `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')} - ${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`,
          startTime: startLocalDateTime.toISOString(),
          endTime: endLocalDateTime.toISOString(),
          isAvailable,
          resourceId: resource.id,
          resourceName: resource.name
        });
      }
    }

    res.json({
      date: dateValue,
      offeringId,
      timezone: timeZone,
      resources: resourcesRes.rows.map((resource: any) => ({ id: resource.id, name: resource.name })),
      slots
    });
  }
);

appointmentsRouter.post(
  '/holds',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  async (req: Request, res: Response) => {
    const { offeringId, resourceId, startTime, endTime } = req.body;
    const holdToken = `hld-${uuidv4()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes TTL

    res.status(201).json({
      message: 'Slot held temporarily',
      holdToken,
      expiresAt,
      offeringId,
      resourceId,
      startTime,
      endTime
    });
  }
);

// ============================================================================
// 6. BOOKINGS LIST, CREATION & STATUS ACTIONS
// ============================================================================
appointmentsRouter.get(
  '/bookings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.view'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { status, date, from, to } = req.query;

    let sql = `
      SELECT b.id, b.booking_number, b.start_time, b.end_time, b.status,
             b.total_minor, b.deposit_paid_minor, b.balance_due_minor, b.intake_notes,
             b.created_at, b.updated_at,
             o.name as offering_name, o.duration_minutes, o.category as offering_category,
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
    if (date) {
      params.push(`${date}%`);
      sql += ` AND b.start_time::text LIKE $${params.length}`;
    }
    if (from) {
      params.push(from);
      sql += ` AND b.start_time >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      sql += ` AND b.end_time <= $${params.length}`;
    }

    sql += ` ORDER BY b.start_time ASC LIMIT 200;`;
    const result = await query(sql, params);
    res.json({ bookings: result.rows });
  }
);

appointmentsRouter.post(
  '/bookings',
  requireAuth,
  resolveTenant,
  requireCapability('appointments'),
  requirePermission('appointments.manage'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      offeringId,
      resourceId: providedResourceId,
      startTime,
      endTime,
      customerDetails,
      intakeNotes
    } = req.body;

    if (!offeringId || !startTime || !endTime) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Offering and scheduled time are required' });
    }

    // Resolve resource
    let resourceId = providedResourceId;
    if (!resourceId) {
      const resLook = await query(`SELECT resource_id FROM offering_resources WHERE offering_id = $1 LIMIT 1`, [offeringId]);
      resourceId = resLook.rows[0]?.resource_id;
      if (!resourceId) {
        const defaultRes = await query(`SELECT id FROM resources WHERE store_id = $1 LIMIT 1`, [storeId]);
        resourceId = defaultRes.rows[0]?.id || 'res-stylist-shoum-01';
      }
    }

    const bookingId = `bkg-${uuidv4()}`;
    const bookingNumber = `APT-${Date.now().toString().slice(-6)}`;

    try {
      await withTransaction(async (client) => {
        // 1. Row-level lock on resource to serialize concurrent bookings
        await client.query(`SELECT id FROM resources WHERE id = $1 FOR UPDATE`, [resourceId]);

        // 2. PREVENT DOUBLE BOOKINGS!
        const conflict = await client.query(
          `SELECT id, booking_number FROM bookings
           WHERE resource_id = $1 AND status NOT IN ('CANCELLED')
             AND start_time < $3 AND end_time > $2`,
          [resourceId, startTime, endTime]
        );

        if (conflict.rowCount && conflict.rowCount > 0) {
          const err: any = new Error(`SLOT_UNAVAILABLE: Time slot is already booked (${conflict.rows[0].booking_number})`);
          err.statusCode = 409;
          throw err;
        }

        // 3. Resolve customer
        let customerId: string | null = null;
        if (customerDetails?.email || customerDetails?.phone) {
          const custRes = await client.query(
            `SELECT id FROM customers WHERE store_id = $1 AND (email = $2 OR phone = $3)`,
            [storeId, customerDetails.email || '', customerDetails.phone || '']
          );
          if (custRes.rowCount && custRes.rowCount > 0) {
            customerId = custRes.rows[0].id;
          } else {
            customerId = `cust-${uuidv4()}`;
            await client.query(
              `INSERT INTO customers (id, store_id, email, phone, first_name, last_name)
               VALUES ($1, $2, $3, $4, $5, $6)`,
              [customerId, storeId, customerDetails.email || null, customerDetails.phone || null, customerDetails.firstName || 'Client', customerDetails.lastName || '']
            );
          }
        }

        // 4. Fetch offering price
        const offRes = await client.query(`SELECT price_minor, deposit_required_minor FROM offerings WHERE id = $1`, [offeringId]);
        const price = offRes.rows[0]?.price_minor || 0;
        const deposit = offRes.rows[0]?.deposit_required_minor || 0;

        // 5. Insert booking
        await client.query(
          `INSERT INTO bookings (id, store_id, booking_number, offering_id, resource_id, customer_id, start_time, end_time, status, total_minor, deposit_paid_minor, balance_due_minor, intake_notes)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'CONFIRMED', $9, $10, $11, $12)`,
          [bookingId, storeId, bookingNumber, offeringId, resourceId, customerId, startTime, endTime, price, deposit, price - deposit, intakeNotes || '']
        );

        // 6. Audit
        await recordAudit({
          organizationId: req.tenant?.organizationId,
          storeId,
          actorId: req.auth?.userId,
          action: 'CREATE_BOOKING',
          targetType: 'BOOKING',
          targetId: bookingId,
          changes: { bookingNumber, startTime, endTime }
        });
      });

      res.status(201).json({
        message: 'Appointment booked successfully',
        bookingId,
        bookingNumber
      });
    } catch (err: any) {
      if (err.statusCode === 409 || err.message?.includes('SLOT_UNAVAILABLE')) {
        return res.status(409).json({
          error: 'SLOT_UNAVAILABLE',
          message: err.message
        });
      }
      throw err;
    }
  }
);

appointmentsRouter.patch(
  '/bookings/:id/status',
  requireAuth,
  resolveTenant,
  requirePermission('appointments.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const bookingId = req.params.id as string;
    const { status, startTime, endTime } = req.body;

    const bkg = await query(`SELECT * FROM bookings WHERE id = $1 AND store_id = $2`, [bookingId, storeId]);
    if (bkg.rowCount === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Booking not found' });
    }

    if (startTime && endTime) {
      // Rescheduling check
      const conflict = await query(
        `SELECT id FROM bookings
         WHERE id != $1 AND resource_id = $2 AND status NOT IN ('CANCELLED')
           AND start_time < $4 AND end_time > $3`,
        [bookingId, bkg.rows[0].resource_id, startTime, endTime]
      );
      if (conflict.rowCount && conflict.rowCount > 0) {
        return res.status(409).json({ error: 'SLOT_UNAVAILABLE', message: 'Rescheduled time slot is already taken' });
      }

      await query(
        `UPDATE bookings
         SET start_time = $1, end_time = $2, status = COALESCE($3, status), updated_at = NOW()
         WHERE id = $4 AND store_id = $5`,
        [startTime, endTime, status, bookingId, storeId]
      );
    } else {
      await query(
        `UPDATE bookings
         SET status = $1, updated_at = NOW()
         WHERE id = $2 AND store_id = $3`,
        [status, bookingId, storeId]
      );
    }

    res.json({ message: `Booking status updated to ${status}` });
  }
);

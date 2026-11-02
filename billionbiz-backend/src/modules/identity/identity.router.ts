import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { generateToken, requireAuth } from '../../middleware/auth.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const identityRouter = Router();

// POST /api/v1/auth/login
identityRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'MISSING_CREDENTIALS', message: 'Email and password are required' });
  }

  const userRes = await query(
    `SELECT u.id, u.email, u.password_hash, u.full_name, u.is_platform_admin
     FROM users u
     WHERE u.email = $1`,
    [email.toLowerCase().trim()]
  );

  if (userRes.rowCount === 0) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }

  const user = userRes.rows[0];
  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) {
    return res.status(401).json({ error: 'INVALID_CREDENTIALS', message: 'Invalid email or password' });
  }

  // Fetch organizations and stores
  const orgsRes = await query(
    `SELECT o.id as organization_id, o.name as organization_name, om.role,
            s.id as store_id, s.name as store_name, s.slug as store_slug
     FROM organization_memberships om
     JOIN organizations o ON o.id = om.organization_id
     LEFT JOIN stores s ON s.organization_id = o.id
     WHERE om.user_id = $1`,
    [user.id]
  );

  const primaryOrg = orgsRes.rows[0]?.organization_id;
  const primaryStore = orgsRes.rows[0]?.store_id;

  const token = generateToken({
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    isPlatformAdmin: user.is_platform_admin,
    organizationId: primaryOrg,
    storeId: primaryStore,
    role: orgsRes.rows[0]?.role || 'MEMBER'
  });

  await recordAudit({
    organizationId: primaryOrg,
    storeId: primaryStore,
    actorId: user.id,
    action: 'USER_LOGIN',
    targetType: 'USER',
    targetId: user.id,
    ipAddress: req.ip
  });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      isPlatformAdmin: user.is_platform_admin
    },
    organizations: orgsRes.rows
  });
});

// POST /api/v1/auth/register (Merchant Onboarding)
identityRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password, fullName, storeName, capabilityMode } = req.body;
  if (!email || !password || !fullName || !storeName) {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'All fields are required' });
  }

  const existing = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
  if (existing.rowCount && existing.rowCount > 0) {
    return res.status(409).json({ error: 'EMAIL_EXISTS', message: 'An account with this email already exists' });
  }

  const userId = `usr-${uuidv4()}`;
  const orgId = `org-${uuidv4()}`;
  const storeId = `str-${uuidv4()}`;
  const locId = `loc-${uuidv4()}`;
  const invLocId = `inv-${uuidv4()}`;
  const staffProfileId = `stf-${uuidv4()}`;
  const passwordHash = await bcrypt.hash(password, 10);
  const storeSlug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  await withTransaction(async (client) => {
    // 1. Create User
    await client.query(
      `INSERT INTO users (id, email, password_hash, full_name)
       VALUES ($1, $2, $3, $4)`,
      [userId, email.toLowerCase().trim(), passwordHash, fullName]
    );

    // 2. Create Organization
    await client.query(
      `INSERT INTO organizations (id, name, slug)
       VALUES ($1, $2, $3)`,
      [orgId, `${storeName} Group`, `${storeSlug}-${uuidv4().substring(0, 6)}`]
    );

    // 3. Create Store
    await client.query(
      `INSERT INTO stores (id, organization_id, name, slug)
       VALUES ($1, $2, $3, $4)`,
      [storeId, orgId, storeName, storeSlug]
    );

    // 4. Create Capabilities & Storefront Settings
    const mode = (capabilityMode || 'BOTH').toUpperCase();
    const prodEnabled = mode === 'COMMERCE' || mode === 'BOTH';
    const apptEnabled = mode === 'SERVICES' || mode === 'BOTH';

    await client.query(
      `INSERT INTO store_capabilities (store_id, product_commerce_enabled, appointments_enabled, restaurant_pos_enabled)
       VALUES ($1, $2, $3, TRUE)`,
      [storeId, prodEnabled, apptEnabled]
    );

    await client.query(
      `INSERT INTO storefront_settings (store_id, mode, home_page, navigation_config, icon_visibility, version)
       VALUES ($1, $2, $3,
         '[{"id":"nav-home","label":"Home","path":"/"},{"id":"nav-shop","label":"Shop","path":"/shop"},{"id":"nav-book","label":"Book","path":"/booking"}]'::jsonb,
         '{"showCart": true, "showWishlist": true, "showAccount": true}'::jsonb,
         1
       )`,
      [storeId, mode, mode === 'SERVICES' ? 'BOOKING' : 'LANDING']
    );

    // 5. Store Location & Inventory Location
    await client.query(
      `INSERT INTO store_locations (id, store_id, name, is_primary, is_active)
       VALUES ($1, $2, 'Primary Location', TRUE, TRUE)`,
      [locId, storeId]
    );

    await client.query(
      `INSERT INTO inventory_locations (id, store_id, name, code, is_default)
       VALUES ($1, $2, 'Main Warehouse', 'DEF-WH', TRUE)`,
      [invLocId, storeId]
    );

    // 6. Organization Membership & Staff Profile
    await client.query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, 'OWNER')`,
      [`mem-${uuidv4()}`, orgId, userId]
    );

    const pinHash = await bcrypt.hash('1234', 10);
    await client.query(
      `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, pin_hash, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [staffProfileId, orgId, userId, storeId, fullName, pinHash]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id, location_id)
       VALUES ($1, $2, 'role-owner', $3, $4)`,
      [`ra-${uuidv4()}`, staffProfileId, storeId, locId]
    );

    // 7. Initialize Default Store Theme
    await client.query(
      `INSERT INTO store_themes (id, store_id, preset_name)
       VALUES ($1, $2, 'modern')`,
      [`thm-${uuidv4()}`, storeId]
    );
  });

  const token = generateToken({
    userId,
    email: email.toLowerCase().trim(),
    fullName,
    isPlatformAdmin: false,
    organizationId: orgId,
    storeId,
    role: 'OWNER'
  });

  res.status(201).json({
    message: 'Store created successfully',
    token,
    user: { id: userId, email, fullName },
    organization: { id: orgId, name: `${storeName} Group` },
    store: { id: storeId, name: storeName, slug: storeSlug }
  });
});

// POST /api/v1/auth/pin-login (POS Cashier PIN Login)
identityRouter.post('/pin-login', async (req: Request, res: Response) => {
  const { counterId, pin } = req.body;
  if (!counterId || !pin) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Counter ID and PIN required' });
  }

  // Get counter and store
  const counterRes = await query(
    `SELECT c.id, c.store_id, c.location_id, s.organization_id, s.name as store_name
     FROM counters c
     JOIN stores s ON s.id = c.store_id
     WHERE c.id = $1 AND c.is_active = TRUE`,
    [counterId]
  );

  if (counterRes.rowCount === 0) {
    return res.status(404).json({ error: 'COUNTER_NOT_FOUND', message: 'Active counter not found' });
  }

  const { store_id, organization_id } = counterRes.rows[0];

  // Find staff profiles in this org with matching PIN
  const staffRes = await query(
    `SELECT sp.id, sp.display_name, sp.pin_hash, sp.user_id, u.email
     FROM staff_profiles sp
     LEFT JOIN users u ON u.id = sp.user_id
     WHERE sp.organization_id = $1 AND sp.is_active = TRUE AND sp.pin_hash IS NOT NULL`,
    [organization_id]
  );

  let matchedStaff: any = null;
  for (const s of staffRes.rows) {
    const isMatch = await bcrypt.compare(pin, s.pin_hash);
    if (isMatch) {
      matchedStaff = s;
      break;
    }
  }

  if (!matchedStaff) {
    return res.status(401).json({ error: 'INVALID_PIN', message: 'Invalid staff PIN for this counter' });
  }

  const token = generateToken({
    userId: matchedStaff.user_id || `staff-${matchedStaff.id}`,
    email: matchedStaff.email || `${matchedStaff.display_name}@pos.local`,
    fullName: matchedStaff.display_name,
    isPlatformAdmin: false,
    organizationId: organization_id,
    storeId: store_id,
    role: 'CASHIER'
  });

  res.json({
    token,
    staff: {
      id: matchedStaff.id,
      name: matchedStaff.display_name
    },
    counter: counterRes.rows[0]
  });
});

// GET /api/v1/auth/me
identityRouter.get('/me', requireAuth, async (req: Request, res: Response) => {
  res.json({
    user: req.auth,
    permissions: req.auth?.permissions || []
  });
});


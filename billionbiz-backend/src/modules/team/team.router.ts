import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const teamRouter = Router();

// GET /api/v1/team/members (REQ-TEAM-001, T-007)
teamRouter.get('/members', requireAuth, resolveTenant, requirePermission('team.view'), async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;

  const staffRes = await query(
    `SELECT sp.id, sp.display_name, sp.is_active, sp.created_at,
            u.id as user_id, u.email,
            r.id as role_id, r.name as role_name, r.code as role_code,
            s.id as store_id, s.name as store_name
     FROM staff_profiles sp
     LEFT JOIN users u ON u.id = sp.user_id
     LEFT JOIN role_assignments ra ON ra.staff_profile_id = sp.id
     LEFT JOIN roles r ON r.id = ra.role_id
     LEFT JOIN stores s ON s.id = sp.store_id
     WHERE sp.organization_id = $1
     ORDER BY sp.created_at ASC`,
    [orgId]
  );

  res.json({ members: staffRes.rows });
});

// POST /api/v1/team/members (Invite/Create staff member)
teamRouter.post('/members', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;
  const storeId = req.tenant!.storeId;
  const { displayName, email, roleCode, pin } = req.body;

  if (!displayName || !roleCode) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Display name and role code are required' });
  }

  const roleRes = await query(`SELECT id FROM roles WHERE code = $1`, [roleCode]);
  if (roleRes.rowCount === 0) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'Role does not exist' });
  }
  const roleId = roleRes.rows[0].id;

  let pinHash = null;
  if (pin) {
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'INVALID_PIN', message: 'PIN must be 4 to 6 digits' });
    }
    pinHash = await bcrypt.hash(pin, 10);
  }

  const staffId = `stf-${uuidv4()}`;
  let userId = null;

  // If email supplied, check if user exists or create account
  if (email) {
    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (userRes.rowCount && userRes.rowCount > 0) {
      userId = userRes.rows[0].id;
    } else {
      userId = `usr-${uuidv4()}`;
      const tempPass = await bcrypt.hash(uuidv4(), 10);
      await query(
        `INSERT INTO users (id, email, password_hash, full_name)
         VALUES ($1, $2, $3, $4)`,
        [userId, email.toLowerCase().trim(), tempPass, displayName]
      );
    }
    // Add org membership
    await query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [`mem-${uuidv4()}`, orgId, userId, roleCode]
    );
  }

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, pin_hash, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
      [staffId, orgId, userId, storeId, displayName, pinHash]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id)
       VALUES ($1, $2, $3, $4)`,
      [`ra-${uuidv4()}`, staffId, roleId, storeId]
    );

    await recordAudit({
      organizationId: orgId,
      storeId,
      actorId: req.auth?.userId,
      action: 'CREATE_STAFF_MEMBER',
      targetType: 'STAFF_PROFILE',
      targetId: staffId,
      changes: { displayName, roleCode, email }
    });
  });

  res.status(201).json({
    message: 'Staff member added successfully',
    staff: { id: staffId, displayName, roleCode }
  });
});

// GET /api/v1/team/roles
teamRouter.get('/roles', requireAuth, async (req: Request, res: Response) => {
  const rolesRes = await query(
    `SELECT r.id, r.name, r.code, r.description, r.is_system,
            COALESCE(json_agg(p.code) FILTER (WHERE p.code IS NOT NULL), '[]') as permissions
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     GROUP BY r.id, r.name, r.code, r.description, r.is_system
     ORDER BY r.is_system DESC, r.name ASC`
  );
  res.json({ roles: rolesRes.rows });
});


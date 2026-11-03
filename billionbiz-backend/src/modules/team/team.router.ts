import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const teamRouter = Router();

// GET /api/v1/team/responsibilities (Available operational responsibility profiles)
teamRouter.get('/responsibilities', requireAuth, async (req: Request, res: Response) => {
  res.json({
    responsibilities: [
      { id: 'APPOINTMENT_STAFF', name: 'Appointment Staff', description: 'Can be assigned to client bookings and services' },
      { id: 'CASHIER', name: 'Counter Staff / Cashier', description: 'Can operate POS registers and cash floats' },
      { id: 'ADMIN_STAFF', name: 'Admin Staff', description: 'Catalog, pricing, and store configuration access' },
      { id: 'MANAGER', name: 'Manager', description: 'Operational oversight across orders, staff, and shifts' },
      { id: 'FULFILLMENT_STAFF', name: 'Fulfillment Specialist', description: 'Order packing, courier dispatch, and shipments' }
    ]
  });
});

// GET /api/v1/team/members (List all team members with roles & multiple responsibilities)
teamRouter.get('/members', requireAuth, resolveTenant, requirePermission('team.view'), async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;

  const staffRes = await query(
    `SELECT sp.id, sp.display_name, sp.email, sp.phone, sp.avatar_url,
            sp.is_active, sp.capacity, sp.responsibilities, sp.assigned_services, sp.created_at,
            u.id as user_id, COALESCE(sp.email, u.email) as member_email,
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

// POST /api/v1/team/members (Invite/Create staff member with multi-role / responsibilities)
teamRouter.post('/members', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;
  const storeId = req.tenant!.storeId;
  const { displayName, email, phone, roleCode = 'MANAGER', pin, responsibilities = ['APPOINTMENT_STAFF', 'CASHIER'] } = req.body;

  if (!displayName) {
    return res.status(400).json({ error: 'MISSING_DATA', message: 'Display name is required' });
  }

  const roleRes = await query(`SELECT id FROM roles WHERE code = $1`, [roleCode]);
  const roleId = roleRes.rows[0]?.id || 'role-manager';

  let pinHash = null;
  if (pin) {
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'INVALID_PIN', message: 'PIN must be 4 to 6 digits' });
    }
    pinHash = await bcrypt.hash(pin, 10);
  }

  const staffId = `stf-${uuidv4()}`;
  let userId = null;

  if (email) {
    const userRes = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
    if (userRes.rowCount && userRes.rowCount > 0) {
      userId = userRes.rows[0].id;
    } else {
      userId = `usr-${uuidv4()}`;
      const tempPass = await bcrypt.hash(uuidv4(), 10);
      await query(
        `INSERT INTO users (id, email, password_hash, full_name, phone)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, email.toLowerCase().trim(), tempPass, displayName, phone || null]
      );
    }

    await query(
      `INSERT INTO organization_memberships (id, organization_id, user_id, role)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (organization_id, user_id) DO NOTHING`,
      [`mem-${uuidv4()}`, orgId, userId, roleCode]
    );
  }

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, email, phone, pin_hash, responsibilities, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)`,
      [staffId, orgId, userId, storeId, displayName, email || null, phone || null, pinHash, JSON.stringify(responsibilities)]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id)
       VALUES ($1, $2, $3, $4)`,
      [`ra-${uuidv4()}`, staffId, roleId, storeId]
    );

    // If responsibilities include APPOINTMENT_STAFF, also register linked booking resource
    if (responsibilities.includes('APPOINTMENT_STAFF')) {
      await client.query(
        `INSERT INTO resources (id, store_id, name, type, staff_profile_id, is_active)
         VALUES ($1, $2, $3, 'PERSON', $4, TRUE)`,
        [`res-${uuidv4()}`, storeId, displayName, staffId]
      );
    }

    await recordAudit({
      organizationId: orgId,
      storeId,
      actorId: req.auth?.userId,
      action: 'CREATE_STAFF_MEMBER',
      targetType: 'STAFF_PROFILE',
      targetId: staffId,
      changes: { displayName, roleCode, email, responsibilities }
    });
  });

  res.status(201).json({
    message: 'Team member added successfully',
    staff: { id: staffId, displayName, roleCode, responsibilities }
  });
});

// PUT /api/v1/team/members/:id (Edit team member)
teamRouter.put('/members/:id', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const staffId = req.params.id as string;
  const storeId = req.tenant!.storeId;
  const { displayName, email, phone, roleCode, pin, responsibilities, isActive } = req.body;

  let pinHash = undefined;
  if (pin) {
    if (!/^\d{4,6}$/.test(pin)) {
      return res.status(400).json({ error: 'INVALID_PIN', message: 'PIN must be 4 to 6 digits' });
    }
    pinHash = await bcrypt.hash(pin, 10);
  }

  await withTransaction(async (client) => {
    await client.query(
      `UPDATE staff_profiles
       SET display_name = COALESCE($1, display_name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           responsibilities = COALESCE($4, responsibilities),
           is_active = COALESCE($5, is_active),
           pin_hash = COALESCE($6, pin_hash)
       WHERE id = $7`,
      [
        displayName,
        email,
        phone,
        responsibilities ? JSON.stringify(responsibilities) : null,
        isActive,
        pinHash,
        staffId
      ]
    );

    if (roleCode) {
      const roleRes = await client.query(`SELECT id FROM roles WHERE code = $1`, [roleCode]);
      if (roleRes.rowCount && roleRes.rowCount > 0) {
        await client.query(
          `UPDATE role_assignments SET role_id = $1 WHERE staff_profile_id = $2`,
          [roleRes.rows[0].id, staffId]
        );
      }
    }
  });

  res.json({ message: 'Team member profile updated successfully' });
});

// DELETE /api/v1/team/members/:id (Deactivate team member)
teamRouter.delete('/members/:id', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const staffId = req.params.id as string;
  await query(`UPDATE staff_profiles SET is_active = FALSE WHERE id = $1`, [staffId]);
  res.json({ message: 'Team member account deactivated' });
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

// GET /api/v1/team/permissions
teamRouter.get('/permissions', requireAuth, async (req: Request, res: Response) => {
  const perms = await query(`SELECT id, code, description, domain FROM permissions ORDER BY domain ASC, code ASC`);
  res.json({ permissions: perms.rows });
});

// POST /api/v1/team/roles (Create custom role with assigned permissions)
teamRouter.post(
  '/roles',
  requireAuth,
  resolveTenant,
  requirePermission('roles.manage'),
  async (req: Request, res: Response) => {
    const { name, code: rawCode, description = '', permissionCodes = [] } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Role name is required' });
    }

    const code = (rawCode || name).toUpperCase().replace(/[^A-Z0-9_]+/g, '_');
    const roleId = `role-${uuidv4()}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO roles (id, name, code, description, is_system)
         VALUES ($1, $2, $3, $4, FALSE)`,
        [roleId, name, code, description]
      );

      for (const pCode of permissionCodes) {
        await client.query(
          `INSERT INTO role_permissions (role_id, permission_id)
           SELECT $1, id FROM permissions WHERE code = $2
           ON CONFLICT DO NOTHING`,
          [roleId, pCode]
        );
      }
    });

    res.status(201).json({ message: 'Custom role created successfully', id: roleId, name, code });
  }
);

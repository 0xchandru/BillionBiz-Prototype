import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const teamRouter = Router();

const RESPONSIBILITY_CODES = new Set([
  'APPOINTMENT_STAFF',
  'CASHIER',
  'ADMIN_STAFF',
  'MANAGER',
  'FULFILLMENT_STAFF'
]);

const normalizeResponsibilities = (value: unknown): string[] | null => {
  if (value === undefined) return null;
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string' || !RESPONSIBILITY_CODES.has(item))) {
    return null;
  }
  return [...new Set(value)];
};

const isValidPin = (value: unknown): value is string =>
  typeof value === 'string' && /^\d{4,6}$/.test(value);

const normalizeEmail = (value: unknown): string | null => {
  if (value === undefined || value === null || value === '') return null;
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255 ? email : null;
};

const findAssignableRole = async (
  executor: { query: (text: string, values?: any[]) => Promise<any> },
  roleCode: string,
  organizationId: string
) => {
  if (!roleCode || roleCode === 'OWNER') return null;
  const result = await executor.query(
    `SELECT id, code, name
     FROM roles
     WHERE code = $1
       AND (organization_id IS NULL OR organization_id = $2)
     ORDER BY (organization_id = $2) DESC NULLS LAST, is_system DESC
     LIMIT 1`,
    [roleCode, organizationId]
  );
  return result.rows[0] || null;
};

const syncAppointmentResource = async (
  client: any,
  storeId: string,
  staffId: string,
  displayName: string,
  responsibilities: string[],
  isActive = true
) => {
  const shouldBeResource = isActive && responsibilities.includes('APPOINTMENT_STAFF');
  const resourceResult = await client.query(
    `SELECT id
     FROM resources
     WHERE store_id = $1 AND staff_profile_id = $2
     ORDER BY created_at ASC
     LIMIT 1
     FOR UPDATE`,
    [storeId, staffId]
  );

  if (shouldBeResource && resourceResult.rowCount === 0) {
    await client.query(
      `INSERT INTO resources (id, store_id, name, type, staff_profile_id, is_active)
       VALUES ($1, $2, $3, 'PERSON', $4, TRUE)`,
      [`res-${uuidv4()}`, storeId, displayName, staffId]
    );
  } else if (resourceResult.rowCount > 0) {
    await client.query(
      `UPDATE resources
       SET name = $1, is_active = $2
       WHERE id = $3 AND store_id = $4`,
      [displayName, shouldBeResource, resourceResult.rows[0].id, storeId]
    );
  }
};

// Operational responsibility catalogue.
teamRouter.get('/responsibilities', requireAuth, async (_req: Request, res: Response) => {
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

// List only staff profiles attached to the active store. A staff member is
// returned once even when multiple role assignments exist.
teamRouter.get('/members', requireAuth, resolveTenant, requirePermission('team.view'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const staffRes = await query(
    `SELECT sp.id, sp.display_name, sp.email, sp.phone, sp.avatar_url,
            sp.is_active, sp.capacity, sp.responsibilities, sp.assigned_services, sp.created_at,
            u.id AS user_id, COALESCE(sp.email, u.email) AS member_email,
            COALESCE(roles.role_id, NULL) AS role_id,
            COALESCE(roles.role_name, NULL) AS role_name,
            COALESCE(roles.role_code, NULL) AS role_code,
            COALESCE(roles.role_assignments, '[]'::json) AS roles,
            s.id AS store_id, s.name AS store_name
     FROM staff_profiles sp
     LEFT JOIN users u ON u.id = sp.user_id
     LEFT JOIN stores s ON s.id = sp.store_id
     LEFT JOIN LATERAL (
       SELECT
         (ARRAY_AGG(r.id ORDER BY r.name))[1] AS role_id,
         (ARRAY_AGG(r.name ORDER BY r.name))[1] AS role_name,
         (ARRAY_AGG(r.code ORDER BY r.name))[1] AS role_code,
         JSON_AGG(JSON_BUILD_OBJECT('id', r.id, 'name', r.name, 'code', r.code) ORDER BY r.name) AS role_assignments
       FROM role_assignments ra
       JOIN roles r ON r.id = ra.role_id
       WHERE ra.staff_profile_id = sp.id
         AND (ra.store_id = $2 OR ra.store_id IS NULL)
         AND (r.organization_id IS NULL OR r.organization_id = $1)
     ) roles ON TRUE
     WHERE sp.organization_id = $1 AND sp.store_id = $2
     ORDER BY sp.created_at ASC`,
    [organizationId, storeId]
  );

  res.json({ members: staffRes.rows });
});

// Create a store-scoped staff profile and its operational relationships atomically.
teamRouter.post('/members', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const {
    displayName,
    email: rawEmail,
    phone,
    roleCode = 'MANAGER',
    pin,
    responsibilities: rawResponsibilities = []
  } = req.body || {};

  const normalizedName = typeof displayName === 'string' ? displayName.trim() : '';
  const email = normalizeEmail(rawEmail);
  const responsibilities = normalizeResponsibilities(rawResponsibilities);

  if (!normalizedName || normalizedName.length > 120) {
    return res.status(400).json({ error: 'INVALID_DISPLAY_NAME', message: 'Display name is required and must be no more than 120 characters.' });
  }
  if (rawEmail && !email) {
    return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Enter a valid email address.' });
  }
  if (pin !== undefined && pin !== '' && !isValidPin(pin)) {
    return res.status(400).json({ error: 'INVALID_PIN', message: 'PIN must contain 4 to 6 digits.' });
  }
  if (!responsibilities) {
    return res.status(400).json({ error: 'INVALID_RESPONSIBILITIES', message: 'One or more operational responsibilities are invalid.' });
  }
  if (typeof roleCode !== 'string' || !roleCode.trim() || roleCode === 'OWNER') {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'A valid non-owner staff role is required.' });
  }

  const staffId = `stf-${uuidv4()}`;
  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;

  let assignedRole: { id: string; code: string; name: string } | null = null;
  let userId: string | null = null;

  await withTransaction(async (client) => {
    assignedRole = await findAssignableRole(client, roleCode, organizationId);
    if (!assignedRole) {
      const error: any = new Error('The selected role does not exist in this organization.');
      error.statusCode = 400;
      error.code = 'ROLE_NOT_FOUND';
      throw error;
    }

    if (email) {
      const existingUser = await client.query(
        `SELECT id FROM users WHERE LOWER(email) = LOWER($1) LIMIT 1 FOR UPDATE`,
        [email]
      );
      if (existingUser.rowCount > 0) {
        userId = existingUser.rows[0].id;
      } else {
        userId = `usr-${uuidv4()}`;
        const temporaryPasswordHash = await bcrypt.hash(uuidv4(), 10);
        await client.query(
          `INSERT INTO users (id, email, password_hash, full_name, phone)
           VALUES ($1, $2, $3, $4, $5)`,
          [userId, email, temporaryPasswordHash, normalizedName, phone || null]
        );
      }

      await client.query(
        `INSERT INTO organization_memberships (id, organization_id, user_id, role)
         VALUES ($1, $2, $3, 'MEMBER')
         ON CONFLICT (organization_id, user_id) DO NOTHING`,
        [`mem-${uuidv4()}`, organizationId, userId]
      );
    }

    await client.query(
      `INSERT INTO staff_profiles (
         id, organization_id, user_id, store_id, display_name, email, phone,
         pin_hash, responsibilities, is_active
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)`,
      [staffId, organizationId, userId, storeId, normalizedName, email, phone || null, pinHash, JSON.stringify(responsibilities)]
    );

    await client.query(
      `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id)
       VALUES ($1, $2, $3, $4)`,
      [`ra-${uuidv4()}`, staffId, assignedRole.id, storeId]
    );

    await syncAppointmentResource(client, storeId, staffId, normalizedName, responsibilities);

    await recordAudit({
      organizationId,
      storeId,
      actorId: req.auth?.userId,
      action: 'CREATE_STAFF_MEMBER',
      targetType: 'STAFF_PROFILE',
      targetId: staffId,
      changes: { displayName: normalizedName, roleCode, email, responsibilities }
    });
  });

  res.status(201).json({
    message: 'Team member created successfully.',
    staff: { id: staffId, displayName: normalizedName, userId, roleCode, responsibilities }
  });
});

// Update only a profile and assignments owned by the active organization/store.
teamRouter.put('/members/:id', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const staffId = req.params.id as string;
  const {
    displayName,
    email: rawEmail,
    phone,
    roleCode,
    pin,
    responsibilities: rawResponsibilities,
    isActive
  } = req.body || {};

  const normalizedName = displayName === undefined ? undefined : (typeof displayName === 'string' ? displayName.trim() : '');
  const email = rawEmail === undefined ? undefined : normalizeEmail(rawEmail);
  const responsibilities = normalizeResponsibilities(rawResponsibilities);

  if (normalizedName !== undefined && (!normalizedName || normalizedName.length > 120)) {
    return res.status(400).json({ error: 'INVALID_DISPLAY_NAME', message: 'Display name must contain 1 to 120 characters.' });
  }
  if (rawEmail !== undefined && rawEmail !== null && rawEmail !== '' && !email) {
    return res.status(400).json({ error: 'INVALID_EMAIL', message: 'Enter a valid email address.' });
  }
  if (pin !== undefined && pin !== '' && !isValidPin(pin)) {
    return res.status(400).json({ error: 'INVALID_PIN', message: 'PIN must contain 4 to 6 digits.' });
  }
  if (rawResponsibilities !== undefined && !responsibilities) {
    return res.status(400).json({ error: 'INVALID_RESPONSIBILITIES', message: 'One or more operational responsibilities are invalid.' });
  }
  if (roleCode !== undefined && (typeof roleCode !== 'string' || !roleCode.trim() || roleCode === 'OWNER')) {
    return res.status(400).json({ error: 'INVALID_ROLE', message: 'A valid non-owner staff role is required.' });
  }

  const pinHash = pin ? await bcrypt.hash(pin, 10) : null;
  let notFound = false;

  await withTransaction(async (client) => {
    const profileRes = await client.query(
      `SELECT id, display_name, responsibilities, is_active
       FROM staff_profiles
       WHERE id = $1 AND organization_id = $2 AND store_id = $3
       FOR UPDATE`,
      [staffId, organizationId, storeId]
    );
    if (profileRes.rowCount === 0) {
      notFound = true;
      return;
    }

    let roleId: string | undefined;
    if (roleCode !== undefined) {
      const role = await findAssignableRole(client, roleCode, organizationId);
      if (!role) {
        const error: any = new Error('The selected role does not exist in this organization.');
        error.statusCode = 400;
        error.code = 'ROLE_NOT_FOUND';
        throw error;
      }
      roleId = role.id;
    }

    const nextResponsibilities = responsibilities || profileRes.rows[0].responsibilities || [];
    const nextName = normalizedName ?? profileRes.rows[0].display_name;
    const nextActive = isActive === undefined ? profileRes.rows[0].is_active : Boolean(isActive);

    await client.query(
      `UPDATE staff_profiles
       SET display_name = COALESCE($1, display_name),
           email = CASE WHEN $2::boolean THEN $3 ELSE email END,
           phone = COALESCE($4, phone),
           responsibilities = COALESCE($5, responsibilities),
           is_active = COALESCE($6, is_active),
           pin_hash = COALESCE($7, pin_hash)
       WHERE id = $8 AND organization_id = $9 AND store_id = $10`,
      [
        normalizedName ?? null,
        rawEmail !== undefined,
        email ?? (rawEmail === '' ? null : null),
        phone ?? null,
        responsibilities ? JSON.stringify(responsibilities) : null,
        isActive === undefined ? null : Boolean(isActive),
        pinHash,
        staffId,
        organizationId,
        storeId
      ]
    );

    if (roleId) {
      const existingAssignment = await client.query(
        `SELECT id FROM role_assignments
         WHERE staff_profile_id = $1 AND store_id = $2
         ORDER BY created_at ASC
         LIMIT 1`,
        [staffId, storeId]
      );
      if (existingAssignment.rowCount > 0) {
        await client.query(
          `UPDATE role_assignments SET role_id = $1
           WHERE id = $2 AND store_id = $3`,
          [roleId, existingAssignment.rows[0].id, storeId]
        );
      } else {
        await client.query(
          `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id)
           VALUES ($1, $2, $3, $4)`,
          [`ra-${uuidv4()}`, staffId, roleId, storeId]
        );
      }
    }

    await syncAppointmentResource(client, storeId, staffId, nextName, nextResponsibilities, nextActive);

    await recordAudit({
      organizationId,
      storeId,
      actorId: req.auth?.userId,
      action: 'UPDATE_STAFF_MEMBER',
      targetType: 'STAFF_PROFILE',
      targetId: staffId,
      changes: { displayName: nextName, roleCode, responsibilities: nextResponsibilities, isActive: nextActive }
    });
  });

  if (notFound) {
    return res.status(404).json({ error: 'STAFF_NOT_FOUND', message: 'Team member was not found in this store.' });
  }
  res.json({ message: 'Team member profile updated successfully.' });
});

// Deactivation is store-scoped and removes the member from appointment capacity.
teamRouter.delete('/members/:id', requireAuth, resolveTenant, requirePermission('team.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const staffId = req.params.id as string;
  const result = await withTransaction(async (client) => {
    const update = await client.query(
      `UPDATE staff_profiles
       SET is_active = FALSE
       WHERE id = $1 AND organization_id = $2 AND store_id = $3`,
      [staffId, organizationId, storeId]
    );
    if (update.rowCount > 0) {
      await client.query(
        `UPDATE resources SET is_active = FALSE
         WHERE staff_profile_id = $1 AND store_id = $2`,
        [staffId, storeId]
      );
    }
    return update.rowCount;
  });

  if (!result) {
    return res.status(404).json({ error: 'STAFF_NOT_FOUND', message: 'Team member was not found in this store.' });
  }
  res.json({ message: 'Team member deactivated successfully.' });
});

// Only system roles and custom roles belonging to this organization are visible.
teamRouter.get('/roles', requireAuth, resolveTenant, requirePermission('team.view'), async (req: Request, res: Response) => {
  const { organizationId } = req.tenant!;
  const rolesRes = await query(
    `SELECT r.id, r.name, r.code, r.description, r.is_system,
            COALESCE(json_agg(p.code) FILTER (WHERE p.code IS NOT NULL), '[]') AS permissions
     FROM roles r
     LEFT JOIN role_permissions rp ON rp.role_id = r.id
     LEFT JOIN permissions p ON p.id = rp.permission_id
     WHERE r.organization_id IS NULL OR r.organization_id = $1
     GROUP BY r.id, r.name, r.code, r.description, r.is_system
     ORDER BY r.is_system DESC, r.name ASC`,
    [organizationId]
  );
  res.json({ roles: rolesRes.rows });
});

// Permission definitions are platform-wide, but the catalogue is disclosed
// only to users authorized to administer roles in the active organization.
teamRouter.get('/permissions', requireAuth, resolveTenant, requirePermission('roles.manage'), async (_req: Request, res: Response) => {
  const perms = await query(`SELECT id, code, description, domain FROM permissions ORDER BY domain ASC, code ASC`);
  res.json({ permissions: perms.rows });
});

// Create organization-owned custom roles. System roles are never writable here.
teamRouter.post('/roles', requireAuth, resolveTenant, requirePermission('roles.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const { name, code: rawCode, description = '', permissionCodes = [] } = req.body || {};
  const roleName = typeof name === 'string' ? name.trim() : '';
  const code = (typeof rawCode === 'string' && rawCode.trim() ? rawCode : roleName)
    .toUpperCase()
    .replace(/[^A-Z0-9_]+/g, '_');

  if (!roleName || roleName.length > 128 || !/^[A-Z][A-Z0-9_]{1,63}$/.test(code) || code === 'OWNER') {
    return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Provide a valid role name and code. Owner is a reserved system role.' });
  }
  if (typeof description !== 'string' || description.length > 1000) {
    return res.status(400).json({ error: 'INVALID_DESCRIPTION', message: 'Role description must be no more than 1,000 characters.' });
  }
  if (!Array.isArray(permissionCodes) || permissionCodes.length > 200 || permissionCodes.some((item: unknown) => typeof item !== 'string')) {
    return res.status(400).json({ error: 'INVALID_PERMISSIONS', message: 'Permission codes must be an array of registered permission identifiers.' });
  }

  const roleId = `role-${uuidv4()}`;
  await withTransaction(async (client) => {
    const existing = await client.query(
      `SELECT id FROM roles WHERE organization_id = $1 AND code = $2 LIMIT 1`,
      [organizationId, code]
    );
    if (existing.rowCount > 0) {
      const error: any = new Error('A role with this code already exists in the organization.');
      error.statusCode = 409;
      error.code = 'ROLE_CODE_EXISTS';
      throw error;
    }

    const validPermissions = await client.query(
      `SELECT code FROM permissions WHERE code = ANY($1::varchar[])`,
      [[...new Set(permissionCodes)]]
    );
    if (validPermissions.rowCount !== new Set(permissionCodes).size) {
      const error: any = new Error('One or more selected permissions are not registered.');
      error.statusCode = 400;
      error.code = 'UNKNOWN_PERMISSION';
      throw error;
    }

    await client.query(
      `INSERT INTO roles (id, organization_id, name, code, description, is_system)
       VALUES ($1, $2, $3, $4, $5, FALSE)`,
      [roleId, organizationId, roleName, code, description]
    );
    await client.query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT $1, p.id
       FROM permissions p
       WHERE p.code = ANY($2::varchar[])
       ON CONFLICT DO NOTHING`,
      [roleId, [...new Set(permissionCodes)]]
    );

    await recordAudit({
      organizationId,
      storeId,
      actorId: req.auth?.userId,
      action: 'CREATE_ROLE',
      targetType: 'ROLE',
      targetId: roleId,
      changes: { name: roleName, code, permissionCodes: [...new Set(permissionCodes)] }
    });
  });

  res.status(201).json({ message: 'Custom role created successfully.', id: roleId, name: roleName, code });
});

// Update an organization-owned custom role and replace its permission set.
teamRouter.put('/roles/:id', requireAuth, resolveTenant, requirePermission('roles.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const roleId = req.params.id as string;
  const { name, description, permissionCodes } = req.body || {};

  if (name !== undefined && (typeof name !== 'string' || !name.trim() || name.trim().length > 128)) {
    return res.status(400).json({ error: 'INVALID_ROLE_NAME', message: 'Role name must contain 1 to 128 characters.' });
  }
  if (description !== undefined && (typeof description !== 'string' || description.length > 1000)) {
    return res.status(400).json({ error: 'INVALID_DESCRIPTION', message: 'Role description must be no more than 1,000 characters.' });
  }
  if (permissionCodes !== undefined && (!Array.isArray(permissionCodes) || permissionCodes.length > 200 || permissionCodes.some((item: unknown) => typeof item !== 'string'))) {
    return res.status(400).json({ error: 'INVALID_PERMISSIONS', message: 'Permission codes must be an array of registered permission identifiers.' });
  }

  let notFound = false;
  await withTransaction(async (client) => {
    const role = await client.query(
      `SELECT id FROM roles
       WHERE id = $1 AND organization_id = $2 AND is_system = FALSE
       FOR UPDATE`,
      [roleId, organizationId]
    );
    if (role.rowCount === 0) {
      notFound = true;
      return;
    }

    if (permissionCodes !== undefined) {
      const uniqueCodes = [...new Set(permissionCodes)];
      const valid = await client.query(
        `SELECT code FROM permissions WHERE code = ANY($1::varchar[])`,
        [uniqueCodes]
      );
      if (valid.rowCount !== uniqueCodes.length) {
        const error: any = new Error('One or more selected permissions are not registered.');
        error.statusCode = 400;
        error.code = 'UNKNOWN_PERMISSION';
        throw error;
      }
      await client.query(`DELETE FROM role_permissions WHERE role_id = $1`, [roleId]);
      await client.query(
        `INSERT INTO role_permissions (role_id, permission_id)
         SELECT $1, id FROM permissions WHERE code = ANY($2::varchar[])
         ON CONFLICT DO NOTHING`,
        [roleId, uniqueCodes]
      );
    }

    await client.query(
      `UPDATE roles
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3 AND organization_id = $4 AND is_system = FALSE`,
      [name?.trim() ?? null, description ?? null, roleId, organizationId]
    );

    await recordAudit({
      organizationId,
      storeId,
      actorId: req.auth?.userId,
      action: 'UPDATE_ROLE',
      targetType: 'ROLE',
      targetId: roleId,
      changes: { name, description, permissionCodes }
    });
  });

  if (notFound) {
    return res.status(404).json({ error: 'ROLE_NOT_FOUND', message: 'Custom role was not found in this organization.' });
  }
  res.json({ message: 'Custom role updated successfully.' });
});

// Delete is blocked while a role is assigned; system roles cannot be deleted.
teamRouter.delete('/roles/:id', requireAuth, resolveTenant, requirePermission('roles.manage'), async (req: Request, res: Response) => {
  const { organizationId, storeId } = req.tenant!;
  const roleId = req.params.id as string;
  const role = await query(
    `SELECT id FROM roles
     WHERE id = $1 AND organization_id = $2 AND is_system = FALSE`,
    [roleId, organizationId]
  );
  if (role.rowCount === 0) {
    return res.status(404).json({ error: 'ROLE_NOT_FOUND', message: 'Custom role was not found in this organization.' });
  }

  const assignments = await query(
    `SELECT 1
     FROM role_assignments ra
     JOIN staff_profiles sp ON sp.id = ra.staff_profile_id
     WHERE ra.role_id = $1 AND sp.organization_id = $2
     LIMIT 1`,
    [roleId, organizationId]
  );
  if (assignments.rowCount > 0) {
    return res.status(409).json({ error: 'ROLE_IN_USE', message: 'This role is assigned to one or more team members. Reassign them before deleting it.' });
  }

  await query(
    `DELETE FROM roles WHERE id = $1 AND organization_id = $2 AND is_system = FALSE`,
    [roleId, organizationId]
  );
  await recordAudit({
    organizationId,
    storeId,
    actorId: req.auth?.userId,
    action: 'DELETE_ROLE',
    targetType: 'ROLE',
    targetId: roleId,
    changes: {}
  });
  res.json({ message: 'Custom role deleted successfully.' });
});

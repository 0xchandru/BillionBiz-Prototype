import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';
import { env } from '../core/env.js';

export const JWT_SECRET = env.JWT_SECRET;

export interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  isPlatformAdmin: boolean;
  organizationId?: string;
  storeId?: string;
  role?: string;
  permissions?: string[];
  mfaVerified?: boolean;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthContext;
      tenant?: {
        organizationId: string;
        storeId: string;
        locationId?: string;
      };
    }
  }
}

export function generateToken(payload: AuthContext, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: 'Authentication token is required'
    });
  }

  let decoded: AuthContext;
  try {
    decoded = jwt.verify(authHeader.substring(7), JWT_SECRET) as AuthContext;
  } catch {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired session token'
    });
  }

  try {
    // Authorization claims are refreshed from the database on every request.
    // A revoked platform-admin flag or downgraded organization role must take
    // effect even if the previous JWT has not reached its expiry time.
    const identityRes = await query(
      `SELECT u.is_platform_admin, u.mfa_enabled, om.role AS membership_role
       FROM users u
       LEFT JOIN organization_memberships om
         ON om.user_id = u.id
        AND ($2::varchar IS NULL OR om.organization_id = $2)
       WHERE u.id = $1
       ORDER BY om.created_at ASC NULLS LAST
       LIMIT 1`,
      [decoded.userId, decoded.organizationId || null]
    );

    if (identityRes.rowCount === 0) {
      return res.status(401).json({
        error: 'USER_NOT_FOUND',
        message: 'The account associated with this session no longer exists.'
      });
    }

    const identity = identityRes.rows[0];
    const isPlatformAdmin = identity.is_platform_admin === true;
    if (identity.mfa_enabled === true && decoded.mfaVerified !== true) {
      return res.status(401).json({
        error: 'MFA_REQUIRED',
        message: 'This account requires a completed multi-factor login. Sign in again and enter your authenticator code.'
      });
    }
    const membershipRole = identity.membership_role || undefined;

    if (decoded.organizationId && !isPlatformAdmin && !membershipRole) {
      return res.status(403).json({
        error: 'ORGANIZATION_MEMBERSHIP_REQUIRED',
        message: 'Your account is no longer a member of this organization.'
      });
    }

    req.auth = {
      ...decoded,
      isPlatformAdmin,
      role: membershipRole,
      permissions: []
    };

    if (decoded.organizationId && !isPlatformAdmin && membershipRole !== 'OWNER') {
      const permsRes = await query(
        `SELECT DISTINCT p.code
         FROM role_assignments ra
         JOIN staff_profiles sp ON sp.id = ra.staff_profile_id
         JOIN roles r ON r.id = ra.role_id
         JOIN role_permissions rp ON rp.role_id = ra.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE sp.user_id = $1
           AND sp.organization_id = $2
           AND sp.is_active = TRUE
           AND (r.organization_id IS NULL OR r.organization_id = $2)
           AND (
             $3::varchar IS NULL
             OR (
               sp.store_id = $3
               AND (ra.store_id = $3 OR ra.store_id IS NULL)
             )
           )`,
        [decoded.userId, decoded.organizationId, decoded.storeId || null]
      );
      req.auth.permissions = permsRes.rows.map((row) => row.code);
    }

    return next();
  } catch (error) {
    // Database outages are server failures, not invalid credentials.
    return next(error);
  }
}

export function requirePermission(permissionCode: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.auth) {
      return res.status(401).json({ error: 'UNAUTHORIZED', message: 'Authentication required' });
    }

    if (req.auth.isPlatformAdmin || req.auth.role === 'OWNER') {
      return next();
    }

    const perms = req.auth.permissions || [];
    if (!perms.includes(permissionCode) && !perms.includes('org.manage')) {
      return res.status(403).json({
        error: 'FORBIDDEN',
        message: `Missing required permission: ${permissionCode}`
      });
    }

    next();
  };
}

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../db/pool.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'billionbiz-secret-jwt-key-2026';

export interface AuthContext {
  userId: string;
  email: string;
  fullName: string;
  isPlatformAdmin: boolean;
  organizationId?: string;
  storeId?: string;
  role?: string;
  permissions?: string[];
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

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthContext;
    req.auth = decoded;

    // Fetch user permissions for current org/store if present
    if (decoded.organizationId) {
      const permsRes = await query(
        `SELECT DISTINCT p.code
         FROM role_assignments ra
         JOIN staff_profiles sp ON sp.id = ra.staff_profile_id
         JOIN role_permissions rp ON rp.role_id = ra.role_id
         JOIN permissions p ON p.id = rp.permission_id
         WHERE sp.user_id = $1 AND sp.organization_id = $2`,
        [decoded.userId, decoded.organizationId]
      );
      req.auth.permissions = permsRes.rows.map(r => r.code);
    }

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'INVALID_TOKEN',
      message: 'Invalid or expired session token'
    });
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

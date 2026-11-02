import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool.js';

export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
  let orgId = (req.headers['x-organization-id'] as string) || req.auth?.organizationId;
  let storeId = (req.headers['x-store-id'] as string) || req.auth?.storeId;
  const locationId = req.headers['x-location-id'] as string | undefined;

  // Fallback to default store and org if not explicitly supplied
  if (!orgId || !storeId) {
    const defaultStoreRes = await query(
      `SELECT s.id as store_id, s.organization_id
       FROM stores s
       WHERE s.status = 'ACTIVE'
       ORDER BY s.created_at ASC
       LIMIT 1;`
    );
    if (defaultStoreRes.rowCount && defaultStoreRes.rowCount > 0) {
      if (!orgId) orgId = defaultStoreRes.rows[0].organization_id;
      if (!storeId) storeId = defaultStoreRes.rows[0].store_id;
    }
  }

  if (!orgId || !storeId) {
    return res.status(400).json({
      error: 'TENANT_CONTEXT_REQUIRED',
      message: 'Active organization and store identifiers are required'
    });
  }

  // Verify store belongs to organization (prevent cross-tenant hijacking)
  const storeCheck = await query(
    `SELECT id, organization_id, status FROM stores WHERE id = $1 AND organization_id = $2`,
    [storeId, orgId]
  );

  if (storeCheck.rowCount === 0) {
    return res.status(403).json({
      error: 'CROSS_TENANT_ACCESS_DENIED',
      message: 'Specified store does not belong to the authorized organization context'
    });
  }

  // If authenticated user is present, verify membership
  if (req.auth && !req.auth.isPlatformAdmin) {
    const memCheck = await query(
      `SELECT role FROM organization_memberships WHERE organization_id = $1 AND user_id = $2`,
      [orgId, req.auth.userId]
    );
    if (memCheck.rowCount === 0) {
      return res.status(403).json({
        error: 'MEMBERSHIP_ACCESS_DENIED',
        message: 'User does not hold membership in the specified organization'
      });
    }
  }

  req.tenant = {
    organizationId: orgId,
    storeId: storeId,
    locationId: locationId
  };

  next();
}


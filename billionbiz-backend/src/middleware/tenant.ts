import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool.js';
import { isReservedSubdomain, PLATFORM_MAIN_DOMAIN } from '../core/subdomains.js';

export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
  let orgId = (req.headers['x-organization-id'] as string) || req.auth?.organizationId;
  let storeId = (req.headers['x-store-id'] as string) || req.auth?.storeId;
  const locationId = req.headers['x-location-id'] as string | undefined;

  // Resolve store from slug header, query parameter, or Host header (*.<PLATFORM_MAIN_DOMAIN>)
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host || '';
  const hostClean = host.toLowerCase().split(':')[0];
  const hostParts = hostClean.split('.');
  let hostSlug: string | undefined;

  // Single-level store subdomains only: {slug}.<PLATFORM_MAIN_DOMAIN>
  if (hostParts.length === 3 && hostClean.endsWith(PLATFORM_MAIN_DOMAIN)) {
    const candidateSub = hostParts[0];
    if (!isReservedSubdomain(candidateSub)) {
      hostSlug = candidateSub;
    }
  } else if (hostClean && !hostClean.includes('localhost') && !hostClean.includes('127.0.0.1') && !hostClean.endsWith(PLATFORM_MAIN_DOMAIN)) {
    // Custom domain resolution
    const domainRes = await query(
      `SELECT d.store_id, s.organization_id
       FROM store_domains d
       JOIN stores s ON s.id = d.store_id
       WHERE LOWER(d.domain) = LOWER($1) AND d.is_verified = TRUE AND s.status != 'SUSPENDED'`,
      [hostClean]
    );
    if (domainRes.rowCount && domainRes.rowCount > 0) {
      storeId = domainRes.rows[0].store_id;
      orgId = domainRes.rows[0].organization_id;
    } else {
      return res.status(404).json({
        error: 'STORE_NOT_FOUND',
        message: 'Store not found'
      });
    }
  }

  const explicitSlug = (req.headers['x-store-slug'] as string) || (req.query.slug as string) || hostSlug;

  if (explicitSlug) {
    const slugRes = await query(
      `SELECT id, organization_id, status FROM stores WHERE LOWER(slug) = LOWER($1) AND status != 'SUSPENDED'`,
      [explicitSlug]
    );
    if (slugRes.rowCount && slugRes.rowCount > 0) {
      storeId = slugRes.rows[0].id;
      orgId = slugRes.rows[0].organization_id;
    } else {
      // Host or slug was explicitly provided but does not match any active store => return 404, never fallback
      return res.status(404).json({
        error: 'STORE_NOT_FOUND',
        message: 'Store not found'
      });
    }
  }

  // Fallback to default store and org only if neither store nor slug was explicitly requested
  if (!orgId || !storeId) {
    const defaultStoreRes = await query(
      `SELECT s.id as store_id, s.organization_id
       FROM stores s
       WHERE s.status != 'SUSPENDED'
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


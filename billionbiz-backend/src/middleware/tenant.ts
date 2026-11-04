import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool.js';
import { isReservedSubdomain, PLATFORM_MAIN_DOMAIN } from '../core/subdomains.js';

type TenantResolution = {
  storeId: string;
  organizationId: string;
  slug: string;
};

const normalizeHost = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  // Host is the HTTP authority supplied by the connected peer. Do not accept
  // X-Forwarded-Host here: it is only safe behind an explicitly trusted proxy.
  return value.split(',')[0].trim().toLowerCase().replace(/:\\d+$/, '');
};

const isLocalHost = (host: string): boolean =>
  host === 'localhost' ||
  host === '127.0.0.1' ||
  host === '::1' ||
  host.endsWith('.localhost');

const isPlatformHost = (host: string): boolean => {
  if (!host) return true;
  if (host === PLATFORM_MAIN_DOMAIN || host === `www.${PLATFORM_MAIN_DOMAIN}`) return true;

  const suffix = `.${PLATFORM_MAIN_DOMAIN}`;
  if (!host.endsWith(suffix)) return false;
  const subdomain = host.slice(0, -suffix.length);
  return !subdomain.includes('.') && isReservedSubdomain(subdomain);
};

export async function resolveTenant(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.auth;
    const isPlatformAdmin = auth?.isPlatformAdmin === true;
    const host = normalizeHost(req.headers.host);
    const headerOrgId = typeof req.headers['x-organization-id'] === 'string'
      ? req.headers['x-organization-id'].trim()
      : '';
    const headerStoreId = typeof req.headers['x-store-id'] === 'string'
      ? req.headers['x-store-id'].trim()
      : '';
    const headerSlug = typeof req.headers['x-store-slug'] === 'string'
      ? req.headers['x-store-slug'].trim().toLowerCase()
      : '';
    const locationId = typeof req.headers['x-location-id'] === 'string'
      ? req.headers['x-location-id'].trim()
      : undefined;

    let hostTenant: TenantResolution | null = null;
    const isPlatformDomain = host === PLATFORM_MAIN_DOMAIN || host.endsWith(`.${PLATFORM_MAIN_DOMAIN}`);

    // Resolve merchant hosts exclusively through the persisted domain mapping.
    // This supports both platform subdomains and custom domains, and prevents
    // arbitrary Host headers from selecting a tenant by a guessed slug.
    if (host && !isLocalHost(host) && !isPlatformHost(host)) {
      const domainRes = await query(
        `SELECT sd.store_id, sd.is_verified, sd.ssl_status,
                s.organization_id, s.slug, s.status
         FROM store_domains sd
         JOIN stores s ON s.id = sd.store_id
         WHERE LOWER(sd.domain) = LOWER($1)
         LIMIT 1`,
        [host]
      );

      if (domainRes.rowCount === 0) {
        return res.status(404).json({
          error: 'STORE_NOT_FOUND',
          message: 'No store is mapped to this hostname'
        });
      }

      const domain = domainRes.rows[0];
      if (domain.status === 'SUSPENDED') {
        return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'This store is not available' });
      }
      if (!domain.is_verified || String(domain.ssl_status).toUpperCase() !== 'ACTIVE') {
        return res.status(404).json({
          error: 'DOMAIN_NOT_READY',
          message: 'This storefront domain has not completed verification and HTTPS activation'
        });
      }

      hostTenant = {
        storeId: domain.store_id,
        organizationId: domain.organization_id,
        slug: domain.slug
      };
    } else if (
      host &&
      isPlatformDomain &&
      host !== PLATFORM_MAIN_DOMAIN &&
      host !== `www.${PLATFORM_MAIN_DOMAIN}` &&
      !isPlatformHost(host)
    ) {
      // A non-reserved single-level platform subdomain must have a domain row.
      return res.status(404).json({
        error: 'STORE_NOT_FOUND',
        message: 'No active storefront is mapped to this subdomain'
      });
    }

    let organizationId: string | undefined;
    let storeId: string | undefined;

    if (hostTenant) {
      // A merchant hostname is authoritative. A browser header must never
      // override the tenant selected by that hostname.
      if (headerOrgId && headerOrgId !== hostTenant.organizationId) {
        return res.status(403).json({ error: 'TENANT_HEADER_MISMATCH', message: 'Organization header does not match this hostname' });
      }
      if (headerStoreId && headerStoreId !== hostTenant.storeId) {
        return res.status(403).json({ error: 'TENANT_HEADER_MISMATCH', message: 'Store header does not match this hostname' });
      }
      if (headerSlug && headerSlug !== hostTenant.slug) {
        return res.status(403).json({ error: 'TENANT_HEADER_MISMATCH', message: 'Store slug header does not match this hostname' });
      }
      if (auth && !isPlatformAdmin) {
        if (auth.organizationId && auth.organizationId !== hostTenant.organizationId) {
          return res.status(403).json({ error: 'CROSS_TENANT_ACCESS_DENIED', message: 'Authenticated organization does not match this storefront' });
        }
        if (auth.storeId && auth.storeId !== hostTenant.storeId) {
          return res.status(403).json({ error: 'CROSS_TENANT_ACCESS_DENIED', message: 'Authenticated store does not match this storefront' });
        }
      }
      organizationId = hostTenant.organizationId;
      storeId = hostTenant.storeId;
    } else if (auth) {
      // Authenticated merchant tenant context comes from the signed JWT.
      // X-Organization-ID / X-Store-ID are consistency checks, not authority.
      organizationId = isPlatformAdmin
        ? (headerOrgId || auth.organizationId)
        : auth.organizationId;
      storeId = isPlatformAdmin
        ? (headerStoreId || auth.storeId)
        : auth.storeId;

      if (!isPlatformAdmin && headerOrgId && headerOrgId !== auth.organizationId) {
        return res.status(403).json({ error: 'CROSS_TENANT_ACCESS_DENIED', message: 'Organization header cannot override the authenticated organization' });
      }
      if (!isPlatformAdmin && headerStoreId && headerStoreId !== auth.storeId) {
        return res.status(403).json({ error: 'CROSS_TENANT_ACCESS_DENIED', message: 'Store header cannot override the authenticated store' });
      }
      if (!isPlatformAdmin && headerSlug) {
        const slugRes = await query(
          `SELECT id FROM stores WHERE id = $1 AND LOWER(slug) = LOWER($2)`,
          [auth.storeId || '', headerSlug]
        );
        if (slugRes.rowCount === 0) {
          return res.status(403).json({ error: 'CROSS_TENANT_ACCESS_DENIED', message: 'Store slug header does not match the authenticated store' });
        }
      }
    }

    // No "first store" fallback. Missing context must fail closed instead of
    // silently attaching a request to somebody else's tenant.
    if (!organizationId || !storeId) {
      return res.status(400).json({
        error: 'TENANT_CONTEXT_REQUIRED',
        message: 'A store hostname or authenticated store context is required'
      });
    }

    const storeCheck = await query(
      `SELECT id, organization_id, status
       FROM stores
       WHERE id = $1 AND organization_id = $2`,
      [storeId, organizationId]
    );

    if (storeCheck.rowCount === 0) {
      return res.status(403).json({
        error: 'CROSS_TENANT_ACCESS_DENIED',
        message: 'Specified store does not belong to the authorized organization context'
      });
    }

    if (storeCheck.rows[0].status === 'SUSPENDED') {
      return res.status(403).json({ error: 'STORE_SUSPENDED', message: 'This store is suspended' });
    }

    if (auth && !isPlatformAdmin) {
      const membership = await query(
        `SELECT 1
         FROM organization_memberships
         WHERE organization_id = $1 AND user_id = $2
         LIMIT 1`,
        [organizationId, auth.userId]
      );
      if (membership.rowCount === 0) {
        return res.status(403).json({
          error: 'MEMBERSHIP_ACCESS_DENIED',
          message: 'User does not hold membership in the specified organization'
        });
      }
    }

    if (locationId) {
      const locationCheck = await query(
        `SELECT 1 FROM store_locations WHERE id = $1 AND store_id = $2 AND is_active = TRUE`,
        [locationId, storeId]
      );
      if (locationCheck.rowCount === 0) {
        return res.status(403).json({
          error: 'LOCATION_ACCESS_DENIED',
          message: 'The requested location does not belong to this store or is inactive'
        });
      }
    }

    req.tenant = { organizationId, storeId, locationId };
    return next();
  } catch (error) {
    return next(error);
  }
}

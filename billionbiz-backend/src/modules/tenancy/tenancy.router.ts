import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const tenancyRouter = Router();

// GET /api/v1/tenancy/stores
tenancyRouter.get('/stores', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const orgId = req.tenant!.organizationId;
  const storesRes = await query(
    `SELECT s.id, s.name, s.slug, s.currency, s.timezone, s.status, s.created_at,
            sc.product_commerce_enabled, sc.appointments_enabled, sc.restaurant_pos_enabled,
            ss.mode as storefront_mode, ss.home_page
     FROM stores s
     LEFT JOIN store_capabilities sc ON sc.store_id = s.id
     LEFT JOIN storefront_settings ss ON ss.store_id = s.id
     WHERE s.organization_id = $1
     ORDER BY s.created_at ASC`,
    [orgId]
  );
  res.json({ stores: storesRes.rows });
});

// GET /api/v1/tenancy/stores/:id
tenancyRouter.get('/stores/:id', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.params.id as string;
  const orgId = req.tenant!.organizationId;

  const storeRes = await query(
    `SELECT s.id, s.name, s.slug, s.currency, s.timezone, s.status, s.created_at,
            sc.product_commerce_enabled, sc.appointments_enabled, sc.restaurant_pos_enabled,
            ss.mode as storefront_mode, ss.home_page, ss.navigation_config, ss.icon_visibility, ss.version as settings_version
     FROM stores s
     LEFT JOIN store_capabilities sc ON sc.store_id = s.id
     LEFT JOIN storefront_settings ss ON ss.store_id = s.id
     WHERE s.id = $1 AND s.organization_id = $2`,
    [storeId, orgId]
  );

  if (storeRes.rowCount === 0) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store not found' });
  }

  const locationsRes = await query(
    `SELECT id, name, address_line1, city, state, postal_code, country, is_primary, is_active
     FROM store_locations
     WHERE store_id = $1
     ORDER BY is_primary DESC, created_at ASC`,
    [storeId]
  );

  res.json({
    store: storeRes.rows[0],
    locations: locationsRes.rows
  });
});

// PATCH /api/v1/tenancy/stores/:id/capabilities (REQ-CAP-001, REQ-CAP-002, T-005)
tenancyRouter.patch(
  '/stores/:id/capabilities',
  requireAuth,
  resolveTenant,
  requirePermission('store.capabilities.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.params.id as string;
    const orgId = req.tenant!.organizationId;
    const { productCommerceEnabled, appointmentsEnabled, restaurantPosEnabled } = req.body;

    const currentRes = await query(
      `SELECT sc.*, ss.mode
       FROM store_capabilities sc
       JOIN storefront_settings ss ON ss.store_id = sc.store_id
       JOIN stores s ON s.id = sc.store_id
       WHERE sc.store_id = $1 AND s.organization_id = $2`,
      [storeId, orgId]
    );

    if (currentRes.rowCount === 0) {
      return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store not found' });
    }

    const current = currentRes.rows[0];
    const newProd = productCommerceEnabled !== undefined ? Boolean(productCommerceEnabled) : current.product_commerce_enabled;
    const newAppt = appointmentsEnabled !== undefined ? Boolean(appointmentsEnabled) : current.appointments_enabled;
    const newRest = restaurantPosEnabled !== undefined ? Boolean(restaurantPosEnabled) : current.restaurant_pos_enabled;

    // Invariant: At least one primary capability must remain enabled
    if (!newProd && !newAppt) {
      return res.status(400).json({
        error: 'INVALID_CAPABILITY_COMBINATION',
        message: 'A store must have at least Product Commerce or Appointments enabled'
      });
    }

    // Adapt storefront mode if incompatible
    let targetMode = current.mode;
    if (newProd && !newAppt) targetMode = 'COMMERCE';
    else if (!newProd && newAppt) targetMode = 'SERVICES';
    else if (newProd && newAppt && targetMode !== 'BOTH') targetMode = 'BOTH';

    await withTransaction(async (client) => {
      await client.query(
        `UPDATE store_capabilities
         SET product_commerce_enabled = $1,
             appointments_enabled = $2,
             restaurant_pos_enabled = $3,
             updated_at = NOW()
         WHERE store_id = $4`,
        [newProd, newAppt, newRest, storeId]
      );

      await client.query(
        `UPDATE storefront_settings
         SET mode = $1::varchar,
             home_page = CASE WHEN $1::varchar = 'SERVICES' THEN 'BOOKING' ELSE home_page END,
             version = version + 1,
             updated_at = NOW()
         WHERE store_id = $2`,
        [targetMode, storeId]
      );

      await recordAudit({
        organizationId: orgId,
        storeId,
        actorId: req.auth?.userId,
        action: 'UPDATE_STORE_CAPABILITIES',
        targetType: 'STORE_CAPABILITIES',
        targetId: storeId,
        changes: {
          product_commerce_enabled: { from: current.product_commerce_enabled, to: newProd },
          appointments_enabled: { from: current.appointments_enabled, to: newAppt },
          restaurant_pos_enabled: { from: current.restaurant_pos_enabled, to: newRest },
          mode: { from: current.mode, to: targetMode }
        }
      });
    });

    res.json({
      message: 'Store capabilities updated successfully',
      capabilities: {
        productCommerceEnabled: newProd,
        appointmentsEnabled: newAppt,
        restaurantPosEnabled: newRest
      },
      storefrontMode: targetMode
    });
  }
);

// PATCH /api/v1/tenancy/stores/:id/storefront-mode (T-041, REQ-MODE-001, REQ-MODE-002, FL-MODE-001)
tenancyRouter.patch(
  '/stores/:id/storefront-mode',
  requireAuth,
  resolveTenant,
  requirePermission('store.capabilities.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.params.id as string;
    const orgId = req.tenant!.organizationId;
    const { mode, homePage, navigationConfig, iconVisibility } = req.body;

    const validModes = ['COMMERCE', 'SERVICES', 'BOTH'];
    if (mode && !validModes.includes(mode.toUpperCase())) {
      return res.status(400).json({ error: 'INVALID_MODE', message: 'Mode must be COMMERCE, SERVICES, or BOTH' });
    }

    const currentCap = await query(
      `SELECT sc.product_commerce_enabled, sc.appointments_enabled, ss.mode, ss.home_page, ss.version
       FROM store_capabilities sc
       JOIN storefront_settings ss ON ss.store_id = sc.store_id
       JOIN stores s ON s.id = sc.store_id
       WHERE sc.store_id = $1 AND s.organization_id = $2`,
      [storeId, orgId]
    );

    if (currentCap.rowCount === 0) {
      return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Store not found' });
    }

    const { product_commerce_enabled, appointments_enabled, version } = currentCap.rows[0];
    const targetMode = mode ? mode.toUpperCase() : currentCap.rows[0].mode;

    // Enforce that chosen mode is supported by backend capabilities
    if (targetMode === 'COMMERCE' && !product_commerce_enabled) {
      return res.status(400).json({
        error: 'CAPABILITY_MISMATCH',
        message: 'Cannot set Commerce mode when Product Commerce capability is disabled'
      });
    }
    if (targetMode === 'SERVICES' && !appointments_enabled) {
      return res.status(400).json({
        error: 'CAPABILITY_MISMATCH',
        message: 'Cannot set Services mode when Appointments capability is disabled'
      });
    }

    // Default navigation links preset according to mode
    let defaultNav = [
      { id: 'nav-home', label: 'Home', path: '/' }
    ];
    if (targetMode === 'COMMERCE' || targetMode === 'BOTH') {
      defaultNav.push({ id: 'nav-shop', label: 'Shop', path: '/shop' });
    }
    if (targetMode === 'SERVICES' || targetMode === 'BOTH') {
      defaultNav.push({ id: 'nav-book', label: 'Book Online', path: '/booking' });
    }
    defaultNav.push({ id: 'nav-contact', label: 'Contact', path: '/contact' });

    const finalNav = navigationConfig || defaultNav;
    const finalHome = homePage ? homePage.toUpperCase() : (targetMode === 'SERVICES' ? 'BOOKING' : 'LANDING');

    await query(
      `UPDATE storefront_settings
       SET mode = $1,
           home_page = $2,
           navigation_config = $3,
           icon_visibility = COALESCE($4, icon_visibility),
           version = version + 1,
           updated_at = NOW()
       WHERE store_id = $5`,
      [targetMode, finalHome, JSON.stringify(finalNav), iconVisibility ? JSON.stringify(iconVisibility) : null, storeId]
    );

    await recordAudit({
      organizationId: orgId,
      storeId,
      actorId: req.auth?.userId,
      action: 'UPDATE_STOREFRONT_MODE',
      targetType: 'STOREFRONT_SETTINGS',
      targetId: storeId,
      changes: {
        mode: { from: currentCap.rows[0].mode, to: targetMode },
        home_page: { from: currentCap.rows[0].home_page, to: finalHome }
      }
    });

    res.json({
      message: 'Storefront mode and navigation preset updated successfully',
      mode: targetMode,
      homePage: finalHome,
      navigationConfig: finalNav,
      version: version + 1
    });
  }
);

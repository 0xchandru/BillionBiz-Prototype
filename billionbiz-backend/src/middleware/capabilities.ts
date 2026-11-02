import { Request, Response, NextFunction } from 'express';
import { query } from '../db/pool.js';

export function requireCapability(capability: 'product_commerce' | 'appointments' | 'restaurant_pos') {
  return async (req: Request, res: Response, next: NextFunction) => {
    const storeId = req.tenant?.storeId || (req.headers['x-store-id'] as string);
    if (!storeId) {
      return res.status(400).json({ error: 'STORE_REQUIRED', message: 'Store context required for capability check' });
    }

    const capRes = await query(
      `SELECT sc.product_commerce_enabled, sc.appointments_enabled, sc.restaurant_pos_enabled,
              ss.mode as storefront_mode
       FROM store_capabilities sc
       JOIN storefront_settings ss ON ss.store_id = sc.store_id
       WHERE sc.store_id = $1`,
      [storeId]
    );

    if (capRes.rowCount === 0) {
      return res.status(404).json({ error: 'CAPABILITY_NOT_FOUND', message: 'Store capabilities are not configured' });
    }

    const { product_commerce_enabled, appointments_enabled, restaurant_pos_enabled, storefront_mode } = capRes.rows[0];

    if (capability === 'product_commerce') {
      if (!product_commerce_enabled) {
        return res.status(403).json({
          error: 'CAPABILITY_DISABLED',
          message: 'Product Commerce capability is disabled for this store'
        });
      }
      // If store is operating strictly in SERVICES mode, deny product checkout & cart creation
      if (storefront_mode === 'SERVICES' && req.path.includes('/checkout')) {
        return res.status(403).json({
          error: 'STOREFRONT_MODE_RESTRICTION',
          message: 'Product checkout is disabled in Services-only Storefront Mode'
        });
      }
    }

    if (capability === 'appointments') {
      if (!appointments_enabled) {
        return res.status(403).json({
          error: 'CAPABILITY_DISABLED',
          message: 'Appointments and booking capability is disabled for this store'
        });
      }
      if (storefront_mode === 'COMMERCE' && req.path.includes('/bookings')) {
        return res.status(403).json({
          error: 'STOREFRONT_MODE_RESTRICTION',
          message: 'Appointment booking is disabled in Commerce-only Storefront Mode'
        });
      }
    }

    if (capability === 'restaurant_pos' && !restaurant_pos_enabled) {
      return res.status(403).json({
        error: 'CAPABILITY_DISABLED',
        message: 'Restaurant POS capability is disabled for this store'
      });
    }

    next();
  };
}


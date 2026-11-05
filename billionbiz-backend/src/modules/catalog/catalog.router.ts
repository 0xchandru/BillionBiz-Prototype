import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const catalogRouter = Router();

// GET /api/v1/catalog/products (T-014, T-015, REQ-CAT-001)
catalogRouter.get(
  '/products',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { search, categoryId, status, limit = '50', offset = '0' } = req.query;

    let sql = `
      SELECT p.id, p.name, p.handle, p.description, p.brand, p.product_type, p.status,
             p.media, p.options, p.custom_attributes, p.created_at, p.updated_at,
             c.name as category_name,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', v.id,
                   'sku', v.sku,
                   'barcode', v.barcode,
                   'option_values', v.option_values,
                   'price_minor', v.price_minor,
                   'compare_at_minor', v.compare_at_minor,
                   'cost_minor', v.cost_minor,
                   'weight_grams', v.weight_grams,
                   'stock_available', COALESCE(ib.available, 0),
                   'stock_on_hand', COALESCE(ib.on_hand, 0)
                 )
               ) FILTER (WHERE v.id IS NOT NULL), '[]'
             ) as variants
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_variants v ON v.product_id = p.id AND v.is_active = TRUE
      LEFT JOIN inventory_balances ib ON ib.variant_id = v.id
      WHERE p.store_id = $1
    `;
    const params: any[] = [storeId];

    if (status) {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }
    if (categoryId) {
      params.push(categoryId);
      sql += ` AND p.category_id = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (p.name ILIKE $${params.length} OR p.description ILIKE $${params.length} OR v.sku ILIKE $${params.length})`;
    }

    sql += ` GROUP BY p.id, c.name ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2};`;
    params.push(parseInt(limit as string, 10), parseInt(offset as string, 10));

    const result = await query(sql, params);
    res.json({ products: result.rows, total: result.rowCount });
  }
);

// POST /api/v1/catalog/products (Create Product with Variant Matrix & Inventory)
catalogRouter.post(
  '/products',
  requireAuth,
  resolveTenant,
  requireCapability('product_commerce'),
  requirePermission('catalog.manage'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const {
      name,
      handle: rawHandle,
      description,
      categoryId,
      brand,
      status = 'ACTIVE',
      media = [],
      options = [],
      variants = [],
      customAttributes = {}
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Product name is required' });
    }

    const handle = (rawHandle || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const productId = `prod-${uuidv4()}`;

    // Get default inventory location
    const defLocRes = await query(
      `SELECT id FROM inventory_locations WHERE store_id = $1 AND is_default = TRUE LIMIT 1`,
      [storeId]
    );
    const defaultLocationId = defLocRes.rows[0]?.id;

    await withTransaction(async (client) => {
      // 1. Insert product
      await client.query(
        `INSERT INTO products (id, store_id, name, handle, description, category_id, brand, status, media, options, custom_attributes)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          productId,
          storeId,
          name,
          `${handle}-${uuidv4().substring(0, 4)}`,
          description || '',
          categoryId || null,
          brand || null,
          status,
          JSON.stringify(media),
          JSON.stringify(options),
          JSON.stringify(customAttributes)
        ]
      );

      // 2. Insert variants (if none provided, create default single variant)
      const variantsToCreate = variants.length > 0 ? variants : [
        {
          sku: `${handle.toUpperCase()}-DEF`,
          priceMinor: req.body.priceMinor || 0,
          compareAtMinor: req.body.compareAtMinor || null,
          initialStock: req.body.initialStock || 0,
          optionValues: {}
        }
      ];

      const createdVariants: any[] = [];
      for (const v of variantsToCreate) {
        const variantId = `var-${uuidv4()}`;
        const sku = v.sku || `${handle.toUpperCase()}-${uuidv4().substring(0, 4)}`;

        await client.query(
          `INSERT INTO product_variants (id, product_id, sku, barcode, option_values, price_minor, compare_at_minor, cost_minor, weight_grams, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, TRUE)`,
          [
            variantId,
            productId,
            sku,
            v.barcode || null,
            JSON.stringify(v.optionValues || {}),
            v.priceMinor || 0,
            v.compareAtMinor || null,
            v.costMinor || null,
            v.weightGrams || 0
          ]
        );

        createdVariants.push({
          id: variantId,
          sku,
          priceMinor: v.priceMinor || 0,
          inventoryQuantity: v.initialStock || v.inventoryQuantity || 0
        });

        // Initialize inventory balance if location exists
        if (defaultLocationId) {
          const initialQty = parseInt(v.initialStock || v.inventoryQuantity || '0', 10);
          await client.query(
            `INSERT INTO inventory_balances (id, variant_id, location_id, on_hand, reserved, available)
             VALUES ($1, $2, $3, $4, 0, $4)`,
            [`inv-bal-${uuidv4()}`, variantId, defaultLocationId, initialQty]
          );

          if (initialQty > 0) {
            await client.query(
              `INSERT INTO inventory_movements (id, variant_id, location_id, movement_type, quantity, note)
               VALUES ($1, $2, $3, 'OPENING', $4, 'Initial stock on product creation')`,
              [`mov-${uuidv4()}`, variantId, defaultLocationId, initialQty]
            );
          }
        }
      }

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'CREATE_PRODUCT',
        targetType: 'PRODUCT',
        targetId: productId,
        changes: { name, handle, variantsCount: variantsToCreate.length }
      });

      res.status(201).json({
        message: 'Product created successfully',
        productId,
        variants: createdVariants
      });
    });
  }
);

// GET /api/v1/catalog/categories
catalogRouter.get('/categories', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const categoriesRes = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.parent_id, c.is_active,
            c.created_at, COUNT(p.id)::int AS products_count
     FROM categories c
     LEFT JOIN products p ON p.category_id = c.id AND p.store_id = c.store_id
     WHERE c.store_id = $1 AND c.is_active = TRUE
     GROUP BY c.id, c.name, c.slug, c.description, c.parent_id, c.is_active, c.created_at
     ORDER BY c.name ASC`,
    [storeId]
  );
  res.json({ categories: categoriesRes.rows });
});

// POST /api/v1/catalog/categories
catalogRouter.post(
  '/categories',
  requireAuth,
  resolveTenant,
  requirePermission('catalog.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name: rawName, slug: rawSlug, description: rawDescription, parentId } = req.body || {};
    const name = typeof rawName === 'string' ? rawName.trim() : '';
    const description = typeof rawDescription === 'string' ? rawDescription.trim() : '';
    const slug = (typeof rawSlug === 'string' && rawSlug.trim() ? rawSlug : name)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    if (!name || name.length > 255) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_NAME', message: 'Category name is required and must be 255 characters or fewer' });
    }
    if (!slug || slug.length > 255) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_SLUG', message: 'Enter a valid category URL slug' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_DESCRIPTION', message: 'Category description must be 2,000 characters or fewer' });
    }

    const normalizedParentId = typeof parentId === 'string' && parentId.trim() ? parentId.trim() : null;
    if (normalizedParentId) {
      const parent = await query(
        `SELECT id FROM categories WHERE id = $1 AND store_id = $2 AND is_active = TRUE`,
        [normalizedParentId, storeId]
      );
      if (parent.rowCount === 0) {
        return res.status(404).json({ error: 'CATEGORY_PARENT_NOT_FOUND', message: 'The selected parent category was not found in this store' });
      }
    }

    const duplicate = await query(
      `SELECT id FROM categories WHERE store_id = $1 AND slug = $2 LIMIT 1`,
      [storeId, slug]
    );
    if (duplicate.rowCount) {
      return res.status(409).json({ error: 'CATEGORY_SLUG_EXISTS', message: 'A category with this URL slug already exists' });
    }

    const id = `cat-${uuidv4()}`;
    try {
      await query(
        `INSERT INTO categories (id, store_id, name, slug, description, parent_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
        [id, storeId, name, slug, description, normalizedParentId]
      );
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(409).json({ error: 'CATEGORY_SLUG_EXISTS', message: 'A category with this URL slug already exists' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Category created', category: { id, name, slug, description, parent_id: normalizedParentId, is_active: true, products_count: 0 } });
  }
);

catalogRouter.patch(
  '/categories/:id',
  requireAuth,
  resolveTenant,
  requirePermission('catalog.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const categoryId = req.params.id;
    const { name: rawName, slug: rawSlug, description: rawDescription } = req.body || {};

    const current = await query(
      `SELECT id, name, slug, description
       FROM categories WHERE id = $1 AND store_id = $2 AND is_active = TRUE`,
      [categoryId, storeId]
    );
    if (current.rowCount === 0) {
      return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'Category was not found in this store' });
    }

    const name = rawName === undefined
      ? current.rows[0].name
      : typeof rawName === 'string' ? rawName.trim() : '';
    const description = rawDescription === undefined
      ? current.rows[0].description || ''
      : typeof rawDescription === 'string' ? rawDescription.trim() : '';
    const slugInput = rawSlug === undefined ? current.rows[0].slug : rawSlug;
    const slug = typeof slugInput === 'string'
      ? slugInput.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      : '';

    if (!name || name.length > 255) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_NAME', message: 'Category name is required and must be 255 characters or fewer' });
    }
    if (!slug || slug.length > 255) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_SLUG', message: 'Enter a valid category URL slug' });
    }
    if (description.length > 2000) {
      return res.status(400).json({ error: 'INVALID_CATEGORY_DESCRIPTION', message: 'Category description must be 2,000 characters or fewer' });
    }

    const duplicate = await query(
      `SELECT id FROM categories WHERE store_id = $1 AND slug = $2 AND id <> $3 LIMIT 1`,
      [storeId, slug, categoryId]
    );
    if (duplicate.rowCount) {
      return res.status(409).json({ error: 'CATEGORY_SLUG_EXISTS', message: 'A category with this URL slug already exists' });
    }

    try {
      const updated = await query(
        `UPDATE categories
         SET name = $1, slug = $2, description = $3
         WHERE id = $4 AND store_id = $5 AND is_active = TRUE
         RETURNING id, name, slug, description, parent_id, is_active`,
        [name, slug, description, categoryId, storeId]
      );
      return res.json({ message: 'Category updated', category: updated.rows[0] });
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(409).json({ error: 'CATEGORY_SLUG_EXISTS', message: 'A category with this URL slug already exists' });
      }
      throw error;
    }
  }
);

catalogRouter.delete(
  '/categories/:id',
  requireAuth,
  resolveTenant,
  requirePermission('catalog.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const categoryId = req.params.id;
    const category = await query(
      `SELECT id FROM categories WHERE id = $1 AND store_id = $2 AND is_active = TRUE`,
      [categoryId, storeId]
    );
    if (category.rowCount === 0) {
      return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'Category was not found in this store' });
    }

    const [products, children] = await Promise.all([
      query(`SELECT COUNT(*)::int AS total FROM products WHERE store_id = $1 AND category_id = $2`, [storeId, categoryId]),
      query(`SELECT COUNT(*)::int AS total FROM categories WHERE store_id = $1 AND parent_id = $2 AND is_active = TRUE`, [storeId, categoryId])
    ]);
    const productCount = Number(products.rows[0]?.total || 0);
    const childCount = Number(children.rows[0]?.total || 0);

    if (productCount > 0 || childCount > 0) {
      return res.status(409).json({
        error: 'CATEGORY_IN_USE',
        message: 'Reassign linked products and child categories before archiving this category.',
        productsCount: productCount,
        childCategoriesCount: childCount
      });
    }

    await query(
      `UPDATE categories SET is_active = FALSE WHERE id = $1 AND store_id = $2`,
      [categoryId, storeId]
    );
    return res.json({ message: 'Category archived', id: categoryId });
  }
);

// POST /api/v1/catalog/inventory/adjust (REQ-INV-001, T-016)
catalogRouter.post(
  '/inventory/adjust',
  requireAuth,
  resolveTenant,
  requirePermission('inventory.adjust'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { variantId, locationId, adjustmentQty, movementType = 'ADJUSTMENT', note } = req.body;

    if (!variantId || !locationId || adjustmentQty === undefined) {
      return res.status(400).json({ error: 'MISSING_DATA', message: 'Variant, location, and adjustment quantity required' });
    }

    const qty = parseInt(adjustmentQty, 10);
    if (isNaN(qty)) {
      return res.status(400).json({ error: 'INVALID_QUANTITY', message: 'Quantity must be an integer' });
    }

    await withTransaction(async (client) => {
      // Lock balance row with FOR UPDATE
      const balRes = await client.query(
        `SELECT id, on_hand, reserved, available
         FROM inventory_balances
         WHERE variant_id = $1 AND location_id = $2
         FOR UPDATE`,
        [variantId, locationId]
      );

      let currentOnHand = 0;
      let currentReserved = 0;

      if (balRes.rowCount === 0) {
        currentOnHand = Math.max(0, qty);
        await client.query(
          `INSERT INTO inventory_balances (id, variant_id, location_id, on_hand, reserved, available)
           VALUES ($1, $2, $3, $4, 0, $4)`,
          [`inv-bal-${uuidv4()}`, variantId, locationId, currentOnHand]
        );
      } else {
        currentOnHand = balRes.rows[0].on_hand + qty;
        currentReserved = balRes.rows[0].reserved;
        if (currentOnHand < 0) {
          throw new Error('INSUFFICIENT_STOCK: Stock cannot be adjusted below zero');
        }
        const newAvailable = Math.max(0, currentOnHand - currentReserved);

        await client.query(
          `UPDATE inventory_balances
           SET on_hand = $1, available = $2, updated_at = NOW()
           WHERE id = $3`,
          [currentOnHand, newAvailable, balRes.rows[0].id]
        );
      }

      await client.query(
        `INSERT INTO inventory_movements (id, variant_id, location_id, movement_type, quantity, note)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`mov-${uuidv4()}`, variantId, locationId, movementType, qty, note || 'Manual adjustment']
      );
    });

    res.json({ message: 'Inventory adjusted successfully' });
  }
);

// GET /api/v1/catalog/pricelists
catalogRouter.get('/pricelists', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const plRes = await query(
    `SELECT id, name, description, currency, tier_type, discount_pct, is_active, created_at, updated_at
     FROM price_lists
     WHERE store_id = $1
     ORDER BY created_at DESC`,
    [storeId]
  );
  res.json({ priceLists: plRes.rows });
});

// POST /api/v1/catalog/pricelists
catalogRouter.post(
  '/pricelists',
  requireAuth,
  resolveTenant,
  requirePermission('catalog.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, description = '', currency = 'INR', tierType = 'WHOLESALE', discountPct = 0 } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Price list name is required' });
    }

    const id = `pl-${uuidv4()}`;
    await query(
      `INSERT INTO price_lists (id, store_id, name, description, currency, tier_type, discount_pct, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
      [id, storeId, name, description, currency, tierType, parseFloat(discountPct) || 0]
    );

    res.status(201).json({ message: 'Price list created successfully', id, name, tierType });
  }
);

// DELETE /api/v1/catalog/pricelists/:id
catalogRouter.delete(
  '/pricelists/:id',
  requireAuth,
  resolveTenant,
  requirePermission('catalog.manage'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { id } = req.params;

    await query(`DELETE FROM price_lists WHERE id = $1 AND store_id = $2`, [id, storeId]);
    res.json({ message: 'Price list deleted successfully' });
  }
);



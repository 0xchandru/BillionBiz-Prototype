import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { requireCapability } from '../../middleware/capabilities.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';
import { createHmac } from 'node:crypto';

export const catalogRouter = Router();

function awsEncode(value: string): string {
  return encodeURIComponent(value).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function createR2PutUrl(key: string, contentType: string): string | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  if (!accountId || !accessKey || !secretKey || !bucket) return null;
  const host = `${accountId}.r2.cloudflarestorage.com`;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = amzDate.slice(0, 8);
  const scope = `${date}/auto/s3/aws4_request`;
  const credential = `${accessKey}/${scope}`;
  const canonicalUri = `/${awsEncode(bucket)}/${key.split('/').map(awsEncode).join('/')}`;
  const query: Record<string, string> = {
    'X-Amz-Algorithm': 'AWS4-HMAC-SHA256',
    'X-Amz-Credential': credential,
    'X-Amz-Date': amzDate,
    'X-Amz-Expires': '300',
    'X-Amz-SignedHeaders': 'content-type;host',
  };
  const canonicalQuery = Object.entries(query).sort(([left], [right]) => left.localeCompare(right)).map(([name, value]) => `${awsEncode(name)}=${awsEncode(value)}`).join('&');
  const canonicalRequest = `PUT\n${canonicalUri}\n${canonicalQuery}\ncontent-type:${contentType}\nhost:${host}\n\ncontent-type;host\nUNSIGNED-PAYLOAD`;
  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${createHmac('sha256', 'AWS4' + secretKey).update(canonicalRequest).digest('hex')}`;
  const hmac = (secret: Buffer | string, value: string) => createHmac('sha256', secret).update(value).digest();
  const signingKey = hmac(hmac(hmac(hmac('AWS4' + secretKey, date), 'auto'), 's3'), 'aws4_request');
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');
  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

catalogRouter.post('/media/presign', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const { fileName, contentType, size } = req.body || {};
  const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']);
  const maxBytes = Number(process.env.R2_MAX_UPLOAD_BYTES || 10 * 1024 * 1024);
  if (typeof fileName !== 'string' || !allowedTypes.has(contentType) || !Number.isFinite(Number(size)) || Number(size) <= 0 || Number(size) > maxBytes) {
    return res.status(400).json({ error: 'INVALID_MEDIA_UPLOAD', message: `Choose a supported image up to ${Math.floor(maxBytes / 1024 / 1024)} MB.` });
  }
  const extByType: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/svg+xml': 'svg' };
  const objectKey = `stores/${req.tenant!.storeId}/media/${uuidv4()}.${extByType[contentType]}`;
  const uploadUrl = createR2PutUrl(objectKey, contentType);
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '');
  if (!uploadUrl || !publicBase) return res.status(503).json({ error: 'MEDIA_STORAGE_NOT_CONFIGURED', message: 'Configure R2 credentials and a public media URL before uploading storefront media.' });
  res.json({ uploadUrl, publicUrl: `${publicBase}/${objectKey}`, objectKey, expiresIn: 300, requiredHeaders: { 'Content-Type': contentType } });
});

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
             p.media, p.options, p.custom_attributes, p.selling_unit, p.minimum_quantity,
             p.quantity_step, p.publish_at, p.shipping_profile, p.specifications,
             p.key_features, p.size_chart, p.volume_prices, p.created_at, p.updated_at,
             c.name as category_name,
             COALESCE(json_agg(DISTINCT jsonb_build_object('id', pc.category_id, 'name', cc.name, 'slug', cc.slug))
               FILTER (WHERE pc.category_id IS NOT NULL), '[]') AS categories,
             COALESCE(
               jsonb_agg(DISTINCT
                 jsonb_build_object(
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
               ) FILTER (WHERE v.id IS NOT NULL), '[]'::jsonb
             ) as variants
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      LEFT JOIN product_categories pc ON pc.product_id = p.id
      LEFT JOIN categories cc ON cc.id = pc.category_id
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
      sql += ` AND (p.category_id = $${params.length} OR EXISTS (SELECT 1 FROM product_categories pcf WHERE pcf.product_id = p.id AND pcf.category_id = $${params.length}))`;
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
      customAttributes = {}, categoryIds = [], sellingUnit = 'pcs', minimumQuantity = 1,
      quantityStep = 1, publishAt = null, shippingProfile = {}, specifications = {},
      keyFeatures = [], sizeChart = {}, volumePrices = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Product name is required' });
    }

    if (!Array.isArray(options) || !Array.isArray(variants) || variants.length > 250) {
      return res.status(400).json({ error: 'INVALID_VARIANT_MATRIX', message: 'Provide valid product options with no more than 250 purchasable variants.' });
    }
    const optionNames = options.map((option: any) => String(option?.name || '').trim().toLowerCase());
    if (new Set(optionNames).size !== optionNames.length || options.some((option: any, index: number) =>
      !optionNames[index] || !Array.isArray(option?.values) || !option.values.length ||
      option.values.some((value: unknown) => typeof value !== 'string' || !value.trim())
    ) || (options.length > 0 && variants.length === 0)) {
      return res.status(400).json({ error: 'INVALID_PRODUCT_OPTIONS', message: 'Variant option names must be unique and each option must contain a list of values.' });
    }
    const suppliedSkus = variants.map((variant: any) => String(variant?.sku || '').trim().toLowerCase()).filter(Boolean);
    if (new Set(suppliedSkus).size !== suppliedSkus.length) {
      return res.status(400).json({ error: 'DUPLICATE_VARIANT_SKU', message: 'Every variant must have a unique SKU.' });
    }

    const normalizedCategoryIds = [...new Set([...(Array.isArray(categoryIds) ? categoryIds : []), ...(categoryId ? [categoryId] : [])])];
    const unitCheck = await query(`SELECT is_enabled FROM selling_units WHERE store_id = $1 AND code = $2`, [storeId, String(sellingUnit || 'pcs')]);
    if (!unitCheck.rowCount || !unitCheck.rows[0].is_enabled) return res.status(400).json({ error: 'SELLING_UNIT_UNAVAILABLE', message: 'Choose an enabled selling unit in catalogue settings.' });
    if (normalizedCategoryIds.length) {
      const category = await query(
        `SELECT id FROM categories WHERE id = ANY($1::varchar[]) AND store_id = $2 AND is_active = TRUE`,
        [normalizedCategoryIds, storeId]
      );
      if (category.rowCount !== normalizedCategoryIds.length) {
        return res.status(404).json({ error: 'CATEGORY_NOT_FOUND', message: 'The selected category was not found in this store' });
      }
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
        `INSERT INTO products (id, store_id, name, handle, description, category_id, brand, status, media, options, custom_attributes,
          selling_unit, minimum_quantity, quantity_step, publish_at, shipping_profile, specifications, key_features, size_chart, volume_prices)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
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
          JSON.stringify(customAttributes),
          String(sellingUnit || 'pcs'), Math.max(0.001, Number(minimumQuantity) || 1),
          Math.max(0.001, Number(quantityStep) || 1), publishAt || null,
          JSON.stringify(shippingProfile), JSON.stringify(specifications), JSON.stringify(keyFeatures),
          JSON.stringify(sizeChart), JSON.stringify(volumePrices)
        ]
      );

      for (const [position, selectedCategoryId] of normalizedCategoryIds.entries()) {
        await client.query(
          `INSERT INTO product_categories (product_id, category_id, position) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [productId, selectedCategoryId, position]
        );
      }

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
            const initialQty = Number(v.initialStock ?? v.inventoryQuantity ?? 0);
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

// Product updates keep the parent product and its purchasable variants in sync.
catalogRouter.patch('/products/:id', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const storeId = req.tenant!.storeId;
  const productId = req.params.id;
  const body = req.body || {};
  const current = await query(`SELECT id FROM products WHERE id = $1 AND store_id = $2`, [productId, storeId]);
  if (!current.rowCount) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Product was not found in this store.' });
  const ids = Array.isArray(body.categoryIds) ? [...new Set(body.categoryIds.filter((id: unknown) => typeof id === 'string'))] : undefined;
  if (ids) {
    const categories = await query(`SELECT id FROM categories WHERE store_id = $1 AND id = ANY($2::varchar[]) AND is_active = TRUE`, [storeId, ids]);
    if (categories.rowCount !== ids.length) return res.status(400).json({ error: 'INVALID_CATEGORIES', message: 'Choose active categories belonging to this store.' });
  }
  if (body.sellingUnit !== undefined) {
    const unit = await query(`SELECT is_enabled FROM selling_units WHERE store_id = $1 AND code = $2`, [storeId, body.sellingUnit]);
    if (!unit.rowCount || !unit.rows[0].is_enabled) return res.status(400).json({ error: 'SELLING_UNIT_UNAVAILABLE', message: 'Choose an enabled selling unit in catalogue settings.' });
  }
  await withTransaction(async (client) => {
    await client.query(
      `UPDATE products SET
       name = COALESCE($1, name), description = COALESCE($2, description), brand = COALESCE($3, brand),
       status = COALESCE($4, status), selling_unit = COALESCE($5, selling_unit),
       minimum_quantity = COALESCE($6, minimum_quantity), quantity_step = COALESCE($7, quantity_step),
       publish_at = CASE WHEN $8::boolean THEN $9::timestamptz ELSE publish_at END,
       media = COALESCE($10::jsonb, media), options = COALESCE($11::jsonb, options),
       shipping_profile = COALESCE($12::jsonb, shipping_profile), specifications = COALESCE($13::jsonb, specifications),
       key_features = COALESCE($14::jsonb, key_features), size_chart = COALESCE($15::jsonb, size_chart),
       volume_prices = COALESCE($16::jsonb, volume_prices), updated_at = NOW()
       WHERE id = $17 AND store_id = $18`,
      [body.name ?? null, body.description ?? null, body.brand ?? null, body.status ?? null, body.sellingUnit ?? null,
       body.minimumQuantity ?? null, body.quantityStep ?? null, Object.prototype.hasOwnProperty.call(body, 'publishAt'), body.publishAt || null,
       body.media === undefined ? null : JSON.stringify(body.media), body.options === undefined ? null : JSON.stringify(body.options),
       body.shippingProfile === undefined ? null : JSON.stringify(body.shippingProfile), body.specifications === undefined ? null : JSON.stringify(body.specifications),
       body.keyFeatures === undefined ? null : JSON.stringify(body.keyFeatures), body.sizeChart === undefined ? null : JSON.stringify(body.sizeChart),
       body.volumePrices === undefined ? null : JSON.stringify(body.volumePrices), productId, storeId]
    );
    if (ids) {
      await client.query(`DELETE FROM product_categories WHERE product_id = $1`, [productId]);
      for (const [position, categoryId] of ids.entries()) await client.query(
        `INSERT INTO product_categories (product_id, category_id, position) VALUES ($1, $2, $3)`, [productId, categoryId, position]
      );
      await client.query(`UPDATE products SET category_id = $1 WHERE id = $2`, [ids[0] || null, productId]);
    }
    if (Array.isArray(body.variants)) for (const variant of body.variants) {
      if (!variant?.id) continue;
      await client.query(
        `UPDATE product_variants SET sku = COALESCE($1, sku), barcode = COALESCE($2, barcode),
         price_minor = COALESCE($3, price_minor), compare_at_minor = CASE WHEN $10::boolean THEN $4 ELSE compare_at_minor END,
         cost_minor = COALESCE($5, cost_minor), option_values = COALESCE($6::jsonb, option_values),
         is_active = COALESCE($7, is_active), updated_at = NOW()
         WHERE id = $8 AND product_id = $9`,
        [variant.sku ?? null, variant.barcode ?? null, variant.priceMinor ?? null, variant.compareAtMinor ?? null,
         variant.costMinor ?? null, variant.optionValues === undefined ? null : JSON.stringify(variant.optionValues),
         variant.isActive ?? null, variant.id, productId, Object.prototype.hasOwnProperty.call(variant, 'compareAtMinor')]
      );
    }
  });
  return res.json({ message: 'Product updated', id: productId });
});

catalogRouter.post('/products/:id/deactivate', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const result = await query(`UPDATE products SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1 AND store_id = $2 RETURNING id`, [req.params.id, req.tenant!.storeId]);
  if (!result.rowCount) return res.status(404).json({ error: 'PRODUCT_NOT_FOUND', message: 'Product was not found in this store.' });
  return res.json({ message: 'Product deactivated', id: req.params.id });
});

catalogRouter.get('/selling-units', requireAuth, resolveTenant, async (req, res) => {
  const units = await query(`SELECT u.*, EXISTS(SELECT 1 FROM products p WHERE p.store_id = u.store_id AND p.selling_unit = u.code) AS in_use FROM selling_units u WHERE u.store_id = $1 ORDER BY u.is_custom, u.label`, [req.tenant!.storeId]);
  res.json({ units: units.rows });
});

catalogRouter.put('/selling-units', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const storeId = req.tenant!.storeId;
  const { code, label, enabled, isCustom } = req.body || {};
  if (typeof code !== 'string' || !/^[a-z0-9_-]{1,64}$/i.test(code) || typeof label !== 'string' || !label.trim()) return res.status(400).json({ error: 'INVALID_UNIT', message: 'Provide a valid unit code and label.' });
  const inUse = await query(`SELECT EXISTS(SELECT 1 FROM products WHERE store_id = $1 AND selling_unit = $2) AS used`, [storeId, code]);
  if (enabled === false && inUse.rows[0].used) return res.status(409).json({ error: 'UNIT_IN_USE', message: 'This unit is used by products and cannot be disabled.' });
  await query(`INSERT INTO selling_units (id, store_id, code, label, is_custom, is_enabled) VALUES ($1, $2, $3, $4, $5, COALESCE($6, TRUE)) ON CONFLICT (store_id, code) DO UPDATE SET label = EXCLUDED.label, is_enabled = EXCLUDED.is_enabled`, [`unit-${uuidv4()}`, storeId, code, label.trim(), Boolean(isCustom), enabled ?? true]);
  return res.json({ message: 'Selling unit saved' });
});

catalogRouter.get('/bundles', requireAuth, resolveTenant, async (req, res) => {
  const result = await query(
    `SELECT b.*, COALESCE(json_agg(json_build_object('variantId', bi.variant_id, 'quantity', bi.quantity, 'productName', p.name, 'sku', v.sku)) FILTER (WHERE bi.variant_id IS NOT NULL), '[]') AS items
     FROM product_bundles b LEFT JOIN product_bundle_items bi ON bi.bundle_id = b.id
     LEFT JOIN product_variants v ON v.id = bi.variant_id LEFT JOIN products p ON p.id = v.product_id
     WHERE b.store_id = $1 GROUP BY b.id ORDER BY b.created_at DESC`, [req.tenant!.storeId]);
  res.json({ bundles: result.rows });
});

catalogRouter.post('/bundles', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const storeId = req.tenant!.storeId;
  const { name, slug: rawSlug, description = '', pricingType = 'PERCENT_OFF', pricingValue = 0, media = [], items = [], status = 'ACTIVE' } = req.body || {};
  const slug = String(rawSlug || name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  if (!name?.trim() || !slug || !Array.isArray(items) || !items.length || !['PERCENT_OFF', 'FIXED_PRICE'].includes(pricingType)) return res.status(400).json({ error: 'INVALID_BUNDLE', message: 'Enter a name, URL, pricing rule, and at least one product variant.' });
  if (pricingType === 'PERCENT_OFF' && (Number(pricingValue) <= 0 || Number(pricingValue) >= 100)) return res.status(400).json({ error: 'INVALID_BUNDLE_DISCOUNT', message: 'Percentage off must be between 0 and 100.' });
  const variantIds = [...new Set(items.map((item: any) => String(item.variantId || '')))];
  const variants = await query(`SELECT v.id FROM product_variants v JOIN products p ON p.id = v.product_id WHERE p.store_id = $1 AND v.id = ANY($2::varchar[]) AND v.is_active = TRUE`, [storeId, variantIds]);
  if (variants.rowCount !== variantIds.length) return res.status(400).json({ error: 'INVALID_BUNDLE_ITEMS', message: 'Every bundle item must be an active variant in this store.' });
  const id = `bundle-${uuidv4()}`;
  try {
    await withTransaction(async (client) => {
      await client.query(`INSERT INTO product_bundles (id, store_id, name, slug, description, pricing_type, pricing_value, media, status) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, storeId, name.trim(), slug, description, pricingType, Number(pricingValue), JSON.stringify(media), status]);
      for (const [position, item] of items.entries()) await client.query(`INSERT INTO product_bundle_items (bundle_id, variant_id, quantity, position) VALUES ($1,$2,$3,$4)`, [id, item.variantId, Math.max(0.001, Number(item.quantity) || 1), position]);
    });
  } catch (error: any) {
    if (error?.code === '23505') return res.status(409).json({ error: 'BUNDLE_SLUG_EXISTS', message: 'A bundle with this URL already exists.' });
    throw error;
  }
  res.status(201).json({ bundle: { id, name: name.trim(), slug, description, pricingType, pricingValue, media, status, items } });
});

catalogRouter.patch('/bundles/:id', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const storeId = req.tenant!.storeId;
  const current = await query(`SELECT id FROM product_bundles WHERE id = $1 AND store_id = $2`, [req.params.id, storeId]);
  if (!current.rowCount) return res.status(404).json({ error: 'BUNDLE_NOT_FOUND', message: 'Bundle was not found.' });
  const body = req.body || {};
  await withTransaction(async (client) => {
    await client.query(`UPDATE product_bundles SET name = COALESCE($1,name), slug = COALESCE($2,slug), description = COALESCE($3,description), pricing_type = COALESCE($4,pricing_type), pricing_value = COALESCE($5,pricing_value), media = COALESCE($6::jsonb,media), status = COALESCE($7,status), updated_at = NOW() WHERE id = $8 AND store_id = $9`, [body.name ?? null, body.slug ?? null, body.description ?? null, body.pricingType ?? null, body.pricingValue ?? null, body.media === undefined ? null : JSON.stringify(body.media), body.status ?? null, req.params.id, storeId]);
    if (Array.isArray(body.items)) {
      await client.query(`DELETE FROM product_bundle_items WHERE bundle_id = $1`, [req.params.id]);
      for (const [position, item] of body.items.entries()) await client.query(`INSERT INTO product_bundle_items (bundle_id, variant_id, quantity, position) SELECT $1,$2,$3,$4 WHERE EXISTS (SELECT 1 FROM product_variants v JOIN products p ON p.id = v.product_id WHERE v.id = $2 AND p.store_id = $5)`, [req.params.id, item.variantId, Math.max(0.001, Number(item.quantity) || 1), position, storeId]);
    }
  });
  res.json({ bundle: { id: req.params.id, ...body } });
});

catalogRouter.post('/bundles/:id/deactivate', requireAuth, resolveTenant, requirePermission('catalog.manage'), async (req, res) => {
  const result = await query(`UPDATE product_bundles SET status = 'ARCHIVED', updated_at = NOW() WHERE id = $1 AND store_id = $2 RETURNING id`, [req.params.id, req.tenant!.storeId]);
  if (!result.rowCount) return res.status(404).json({ error: 'BUNDLE_NOT_FOUND', message: 'Bundle was not found.' });
  res.json({ message: 'Bundle deactivated' });
});

// GET /api/v1/catalog/categories
catalogRouter.get('/categories', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const categoriesRes = await query(
    `SELECT c.id, c.name, c.slug, c.description, c.image_url, c.parent_id, c.is_active,
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
    const { name: rawName, slug: rawSlug, description: rawDescription, parentId, imageUrl } = req.body || {};
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
        `INSERT INTO categories (id, store_id, name, slug, description, parent_id, image_url, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
        [id, storeId, name, slug, description, normalizedParentId, typeof imageUrl === 'string' ? imageUrl : null]
      );
    } catch (error: any) {
      if (error?.code === '23505') {
        return res.status(409).json({ error: 'CATEGORY_SLUG_EXISTS', message: 'A category with this URL slug already exists' });
      }
      throw error;
    }

    res.status(201).json({ message: 'Category created', category: { id, name, slug, description, parent_id: normalizedParentId, image_url: imageUrl || null, is_active: true, products_count: 0 } });
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
    const { name: rawName, slug: rawSlug, description: rawDescription, imageUrl } = req.body || {};

    const current = await query(
      `SELECT id, name, slug, description, image_url
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
         SET name = $1, slug = $2, description = $3, image_url = $6
         WHERE id = $4 AND store_id = $5 AND is_active = TRUE
         RETURNING id, name, slug, description, parent_id, is_active`,
        [name, slug, description, categoryId, storeId, imageUrl === undefined ? current.rows[0].image_url : imageUrl || null]
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
      query(`SELECT COUNT(DISTINCT p.id)::int AS total FROM products p LEFT JOIN product_categories pc ON pc.product_id = p.id WHERE p.store_id = $1 AND (p.category_id = $2 OR pc.category_id = $2)`, [storeId, categoryId]),
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

    const qty = Number(adjustmentQty);
    if (!Number.isFinite(qty) || Math.abs(qty * 1000 - Math.round(qty * 1000)) > 1e-8) {
      return res.status(400).json({ error: 'INVALID_QUANTITY', message: 'Enter a valid quantity with up to three decimal places.' });
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
        currentOnHand = Number(balRes.rows[0].on_hand) + qty;
        currentReserved = Number(balRes.rows[0].reserved);
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



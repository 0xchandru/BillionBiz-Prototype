import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';

export const storefrontRouter = Router();

// GET /api/v1/storefront/theme
storefrontRouter.get('/theme', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
  if (themeRes.rowCount === 0) {
    return res.json({ theme: { presetName: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} } });
  }
  res.json({ theme: themeRes.rows[0] });
});

// PATCH /api/v1/storefront/theme (Save draft theme)
storefrontRouter.patch(
  '/theme',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { presetName, palette, typography, buttons, effects, customCss } = req.body;

    const updated = await query(
      `INSERT INTO store_themes (id, store_id, preset_name, palette, typography, buttons, effects, custom_css, version, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 1, NOW())
       ON CONFLICT (store_id) DO UPDATE SET
         preset_name = COALESCE($3, store_themes.preset_name),
         palette = COALESCE($4, store_themes.palette),
         typography = COALESCE($5, store_themes.typography),
         buttons = COALESCE($6, store_themes.buttons),
         effects = COALESCE($7, store_themes.effects),
         custom_css = COALESCE($8, store_themes.custom_css),
         version = store_themes.version + 1,
         updated_at = NOW()
       RETURNING *`,
      [
        `thm-${uuidv4()}`,
        storeId,
        presetName || 'modern',
        JSON.stringify(palette || {}),
        JSON.stringify(typography || {}),
        JSON.stringify(buttons || {}),
        JSON.stringify(effects || {}),
        customCss || ''
      ]
    );

    res.json({ message: 'Theme updated', theme: updated.rows[0] });
  }
);

// GET /api/v1/storefront/pages (List pages with draft status)
storefrontRouter.get('/pages', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const pagesRes = await query(
    `SELECT p.*,
            (SELECT pd.version FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1) as draft_version
     FROM store_pages p
     WHERE p.store_id = $1
     ORDER BY p.name ASC`,
    [storeId]
  );
  res.json({ pages: pagesRes.rows });
});

// POST /api/v1/storefront/pages (Create new page)
storefrontRouter.post(
  '/pages',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, title, path, slug, type = 'custom', category = 'GENERAL', sections = [], pageProps = {} } = req.body;
    const pageName = name || title || 'New Page';
    const pagePath = path || `/${slug || pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    const pageId = `page-${uuidv4()}`;

    await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO store_pages (id, store_id, name, path, type, category, status, page_props)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft', $7)
         ON CONFLICT (store_id, path) DO UPDATE SET
           name = EXCLUDED.name,
           type = EXCLUDED.type,
           category = EXCLUDED.category,
           page_props = EXCLUDED.page_props,
           updated_at = NOW()
         RETURNING id`,
        [pageId, storeId, pageName, pagePath, type, category, JSON.stringify(pageProps)]
      );
      const effectivePageId = inserted.rows[0]?.id || pageId;

      if (sections.length > 0) {
        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, 1, $3, $4, $5)`,
          [`draft-${uuidv4()}`, effectivePageId, JSON.stringify(sections), JSON.stringify(pageProps), req.auth?.userId]
        );
      }
    });

    res.status(201).json({ message: 'Page created successfully', pageId, path: pagePath });
  }
);

// GET /api/v1/storefront/by-slug/:slug (Public Storefront by store slug, REQ-STOREFRONT-001)
storefrontRouter.get('/by-slug/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const storeRes = await query(
    `SELECT id, organization_id, name, slug, currency, timezone, status
     FROM stores
     WHERE slug = $1 AND status = 'ACTIVE'`,
    [slug]
  );

  if (storeRes.rowCount === 0) {
    return res.status(404).json({
      error: 'STORE_NOT_FOUND',
      message: `No active storefront found for '${slug}'`
    });
  }

  const store = storeRes.rows[0];

  // 1. Latest immutable published release snapshot
  const releaseRes = await query(
    `SELECT id, release_number, snapshot, content_hash, published_by, notes, created_at
     FROM store_releases
     WHERE store_id = $1
     ORDER BY release_number DESC
     LIMIT 1`,
    [store.id]
  );

  // 2. Active theme
  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [store.id]);

  // 3. Published pages
  const pagesRes = await query(
    `SELECT id, name, path, type, category, status, page_props
     FROM store_pages
     WHERE store_id = $1 AND status = 'published'`,
    [store.id]
  );

  // 4. Active products with variants
  const productsRes = await query(
    `SELECT p.id, p.name, p.handle, p.description, p.product_type, p.media,
            v.id as variant_id, v.sku, v.price_minor, v.compare_at_minor
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.store_id = $1 AND p.status = 'ACTIVE'
     ORDER BY p.created_at DESC
     LIMIT 24`,
    [store.id]
  );

  // 5. Active offerings (appointments/services)
  const offeringsRes = await query(
    `SELECT id, name, handle, description, duration_minutes, price_minor, deposit_required_minor
     FROM offerings
     WHERE store_id = $1 AND is_active = TRUE
     ORDER BY name ASC
     LIMIT 24`,
    [store.id]
  );

  res.json({
    store,
    activeRelease: releaseRes.rows[0]?.snapshot || null,
    releaseNumber: releaseRes.rows[0]?.release_number || null,
    theme: themeRes.rows[0] || { preset_name: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} },
    pages: pagesRes.rows,
    products: productsRes.rows,
    offerings: offeringsRes.rows
  });
});

// GET /api/v1/storefront/render (Render active storefront or draft preview)
storefrontRouter.get('/render', resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const storeRes = await query(`SELECT id, name, slug, currency, timezone, status FROM stores WHERE id = $1`, [storeId]);
  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
  const pagesRes = await query(`SELECT * FROM store_pages WHERE store_id = $1`, [storeId]);
  const latestRel = await query(
    `SELECT snapshot, release_number, content_hash FROM store_releases WHERE store_id = $1 ORDER BY release_number DESC LIMIT 1`,
    [storeId]
  );

  res.json({
    store: storeRes.rows[0] || null,
    theme: themeRes.rows[0] || { preset_name: 'modern' },
    pages: pagesRes.rows,
    activeRelease: latestRel.rows[0]?.snapshot || null,
    releaseNumber: latestRel.rows[0]?.release_number || null
  });
});

// PATCH /api/v1/storefront/pages/:id/draft (Save Editor Draft Sections, T-010, REQ-STORE-002)
storefrontRouter.patch(
  '/pages/:id/draft',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;
    const { sections, pageProps } = req.body;

    const pageRes = await query(`SELECT id FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (pageRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }

    const nextVerRes = await query(
      `SELECT COALESCE(MAX(version), 0) + 1 as next_ver FROM page_draft_versions WHERE page_id = $1`,
      [pageId]
    );
    const nextVer = nextVerRes.rows[0].next_ver;

    await query(
      `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [`draft-${uuidv4()}`, pageId, nextVer, JSON.stringify(sections || []), JSON.stringify(pageProps || {}), req.auth?.userId]
    );

    await query(
      `UPDATE store_pages SET status = 'draft', updated_at = NOW() WHERE id = $1`,
      [pageId]
    );

    res.json({ message: 'Draft saved successfully', pageId, version: nextVer });
  }
);

// POST /api/v1/storefront/publish and /releases/publish (Atomic Whole-Store Publish All, T-011, REQ-STORE-006)
storefrontRouter.post(
  ['/publish', '/releases/publish'],
  requireAuth,
  resolveTenant,
  requirePermission('store.publish'),
  handleIdempotency,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { notes } = req.body;

    let releaseNumber = 1;
    let releaseId = `rel-${uuidv4()}`;

    await withTransaction(async (client) => {
      // 1. Get next release number
      const numRes = await client.query(
        `SELECT COALESCE(MAX(release_number), 0) + 1 as next_num FROM store_releases WHERE store_id = $1`,
        [storeId]
      );
      releaseNumber = numRes.rows[0].next_num;

      // 2. Snapshot theme
      const themeRes = await client.query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
      const themeSnapshot = themeRes.rows[0] || {};

      // 3. Snapshot all pages + their latest drafts
      const pagesRes = await client.query(
        `SELECT p.id, p.name, p.path, p.type, p.category, p.seo_title, p.seo_description,
                COALESCE(
                  (SELECT pd.sections FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1),
                  p.page_props
                ) as sections,
                COALESCE(
                  (SELECT pd.page_props FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1),
                  p.page_props
                ) as page_props
         FROM store_pages p
         WHERE p.store_id = $1`,
        [storeId]
      );

      const storeSnapshot = {
        theme: themeSnapshot,
        pages: pagesRes.rows,
        publishedAt: new Date().toISOString()
      };

      const contentHash = crypto.createHash('sha256').update(JSON.stringify(storeSnapshot)).digest('hex');

      // 4. Create immutable release record
      await client.query(
        `INSERT INTO store_releases (id, store_id, release_number, content_hash, snapshot, published_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [releaseId, storeId, releaseNumber, contentHash, JSON.stringify(storeSnapshot), req.auth?.userId, notes || 'Published release']
      );

      // 5. Update page statuses to 'published' and ensure store is ACTIVE for live storefront
      await client.query(
        `UPDATE store_pages SET status = 'published', updated_at = NOW() WHERE store_id = $1`,
        [storeId]
      );

      await client.query(
        `UPDATE stores SET status = 'ACTIVE', updated_at = NOW() WHERE id = $1`,
        [storeId]
      );

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'PUBLISH_STORE_RELEASE',
        targetType: 'STORE_RELEASE',
        targetId: releaseId,
        changes: { releaseNumber, contentHash, pagesCount: pagesRes.rowCount }
      });
    });

    res.status(201).json({
      message: 'Store published atomically. New release active.',
      releaseId,
      releaseNumber
    });
  }
);

// GET /api/v1/storefront/releases (Release History)
storefrontRouter.get('/releases', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const releasesRes = await query(
    `SELECT id, release_number, content_hash, published_by, notes, created_at
     FROM store_releases
     WHERE store_id = $1
     ORDER BY release_number DESC`,
    [storeId]
  );
  res.json({ releases: releasesRes.rows });
});

// POST /api/v1/storefront/releases/:id/restore (Restore to previous snapshot)
storefrontRouter.post(
  '/releases/:id/restore',
  requireAuth,
  resolveTenant,
  requirePermission('store.publish'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const releaseId = req.params.id as string;

    const relRes = await query(
      `SELECT snapshot FROM store_releases WHERE id = $1 AND store_id = $2`,
      [releaseId, storeId]
    );

    if (relRes.rowCount === 0) {
      return res.status(404).json({ error: 'RELEASE_NOT_FOUND', message: 'Release snapshot not found' });
    }

    const { pages, theme } = relRes.rows[0].snapshot;

    await withTransaction(async (client) => {
      // Restore theme
      if (theme) {
        await client.query(
          `UPDATE store_themes
           SET preset_name = $1, palette = $2, typography = $3, buttons = $4, effects = $5, updated_at = NOW()
           WHERE store_id = $6`,
          [theme.preset_name, theme.palette, theme.typography, theme.buttons, theme.effects, storeId]
        );
      }

      // Restore pages as new draft versions
      for (const p of pages || []) {
        const nextVerRes = await client.query(
          `SELECT COALESCE(MAX(version), 0) + 1 as next_ver FROM page_draft_versions WHERE page_id = $1`,
          [p.id]
        );
        const nextVer = nextVerRes.rows[0].next_ver;

        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [`draft-${uuidv4()}`, p.id, nextVer, JSON.stringify(p.sections || []), JSON.stringify(p.page_props || {}), req.auth?.userId]
        );
      }

      await recordAudit({
        organizationId: req.tenant?.organizationId,
        storeId,
        actorId: req.auth?.userId,
        action: 'RESTORE_STORE_RELEASE',
        targetType: 'STORE_RELEASE',
        targetId: releaseId,
        changes: { restoredFrom: releaseId as string }
      });
    });

    res.json({ message: 'Store restored to snapshot draft state successfully' });
  }
);

// GET /api/v1/storefront/navigation
storefrontRouter.get('/navigation', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT navigation_config FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );

  let navConfig = [
    { id: 'nav-home', label: 'Home', path: '/', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-shop', label: 'Shop Catalogue', path: '/shop', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-book', label: 'Book Appointment', path: '/booking', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-privacy', label: 'Privacy Policy', path: '/privacy', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-terms', label: 'Terms of Service', path: '/terms', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-contact', label: 'Contact Us', path: '/contact', target: '_self', is_active: true, menu_type: 'FOOTER' }
  ];

  if (settingsRes.rowCount && settingsRes.rowCount > 0 && settingsRes.rows[0].navigation_config) {
    const raw = settingsRes.rows[0].navigation_config;
    if (Array.isArray(raw)) {
      navConfig = raw;
    }
  }

  res.json({ navigation: navConfig });
});

// PATCH /api/v1/storefront/navigation (Update Store Menus)
storefrontRouter.patch(
  '/navigation',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { navigation } = req.body;

    if (!Array.isArray(navigation)) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'Navigation must be an array of menu items' });
    }

    await query(
      `INSERT INTO storefront_settings (store_id, navigation_config, mode, home_page)
       VALUES ($1, $2, 'BOTH', 'LANDING')
       ON CONFLICT (store_id) DO UPDATE SET
         navigation_config = $2,
         updated_at = NOW()`,
      [storeId, JSON.stringify(navigation)]
    );

    res.json({ message: 'Navigation menus updated successfully', navigation });
  }
);

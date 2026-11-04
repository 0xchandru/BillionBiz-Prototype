import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { query, withTransaction } from '../../db/pool.js';
import { requireAuth, requirePermission } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';
import { handleIdempotency } from '../../middleware/idempotency.js';
import { recordAudit } from '../../core/auditAndOutbox.js';
import { provisionDefaultStorefront } from './storefrontProvisioner.js';
import { PLATFORM_MAIN_DOMAIN } from '../../core/subdomains.js';

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
       VALUES (
         $1, $2, COALESCE($3, 'modern'),
         COALESCE($4, '{}'::jsonb),
         COALESCE($5, '{}'::jsonb),
         COALESCE($6, '{}'::jsonb),
         COALESCE($7, '{}'::jsonb),
         COALESCE($8, ''),
         1, NOW()
       )
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
        presetName ?? null,
        palette === undefined ? null : JSON.stringify(palette),
        typography === undefined ? null : JSON.stringify(typography),
        buttons === undefined ? null : JSON.stringify(buttons),
        effects === undefined ? null : JSON.stringify(effects),
        customCss === undefined ? null : customCss
      ]
    );

    res.json({ message: 'Theme updated', theme: updated.rows[0] });
  }
);

const RESERVED_SYSTEM_PATHS = [
  '/',
  '/shop',
  '/products',
  '/collections',
  '/cart',
  '/checkout',
  '/account',
  '/account/login',
  '/search',
  '/booking',
  '/policies/privacy',
  '/policies/terms',
  '/policies/refund',
  '/contact',
  '/404',
  '/password'
];

// GET /api/v1/storefront/pages (List all pages with system status and draft version)
storefrontRouter.get('/pages', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  let pagesRes = await query(
    `SELECT p.*,
            COALESCE(pd.sections, '[]'::jsonb) AS sections,
            COALESCE(pd.page_props, p.page_props) AS draft_page_props,
            COALESCE(pd.version, 0) AS draft_version
     FROM store_pages p
     LEFT JOIN LATERAL (
       SELECT sections, page_props, version
       FROM page_draft_versions
       WHERE page_id = p.id
       ORDER BY version DESC, created_at DESC
       LIMIT 1
     ) pd ON TRUE
     WHERE p.store_id = $1
     ORDER BY p.is_system DESC, p.name ASC`,
    [storeId]
  );

  // Lazy-provision starter pages for existing stores created prior to Phase 1 provisioner
  if (pagesRes.rowCount === 0) {
    const storeInfo = await query(`SELECT name, slug FROM stores WHERE id = $1`, [storeId]);
    if (storeInfo.rowCount && storeInfo.rowCount > 0) {
      await withTransaction(async (client) => {
        await provisionDefaultStorefront({
          client,
          storeId,
          storeName: storeInfo.rows[0].name || 'Online Store',
          storeSlug: storeInfo.rows[0].slug || 'store',
          mode: 'COMMERCE',
          userId: req.auth?.userId
        });
      });
      pagesRes = await query(
        `SELECT p.*,
                (SELECT pd.version FROM page_draft_versions pd WHERE pd.page_id = p.id ORDER BY pd.version DESC LIMIT 1) as draft_version
         FROM store_pages p
         WHERE p.store_id = $1
         ORDER BY p.is_system DESC, p.name ASC`,
        [storeId]
      );
    }
  }

  res.json({ pages: pagesRes.rows });
});

// POST /api/v1/storefront/pages (Create new custom page)
storefrontRouter.post(
  '/pages',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, title, path, slug, type = 'custom', category = 'GENERAL', templateKey = 'standard', sections = [], pageProps = {} } = req.body;
    const pageName = name || title || 'New Page';
    let pagePath = path || `/${slug || pageName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
    if (!pagePath.startsWith('/')) pagePath = `/${pagePath}`;

    // Prevent collision with reserved system routes
    if (RESERVED_SYSTEM_PATHS.includes(pagePath.toLowerCase())) {
      return res.status(400).json({
        error: 'RESERVED_SYSTEM_PATH',
        message: `The route path '${pagePath}' is reserved for platform system pages. Please choose a custom route path.`
      });
    }

    const pageId = `page-${uuidv4()}`;

    await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO store_pages (id, store_id, name, path, type, category, status, is_system, is_locked, template_key, page_props)
         VALUES ($1, $2, $3, $4, $5, $6, 'draft', FALSE, FALSE, $7, $8)
         ON CONFLICT (store_id, path) DO UPDATE SET
           name = EXCLUDED.name,
           type = EXCLUDED.type,
           category = EXCLUDED.category,
           template_key = EXCLUDED.template_key,
           page_props = EXCLUDED.page_props,
           updated_at = NOW()
         RETURNING id`,
        [pageId, storeId, pageName, pagePath, type, category, templateKey, JSON.stringify(pageProps)]
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

// PATCH /api/v1/storefront/pages/:id (Update page settings, SEO & visibility)
storefrontRouter.patch(
  '/pages/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;
    const { name, title, path, seoTitle, seoDescription, templateKey, pageProps, visibility, status } = req.body;

    const pageRes = await query(`SELECT * FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (pageRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const page = pageRes.rows[0];

    // Enforce lock on system pages: cannot change path/route
    if (page.is_locked && path && path !== page.path) {
      return res.status(400).json({
        error: 'LOCKED_PAGE_ROUTE_IMMUTABLE',
        message: 'System page routes are permanently locked and cannot be altered.'
      });
    }

    const updated = await query(
      `UPDATE store_pages SET
         name = COALESCE($1, name),
         path = CASE WHEN is_locked THEN path ELSE COALESCE($2, path) END,
         seo_title = COALESCE($3, seo_title),
         seo_description = COALESCE($4, seo_description),
         template_key = COALESCE($5, template_key),
         page_props = COALESCE($6, page_props),
         visibility = COALESCE($7, visibility),
         status = COALESCE($8, status),
         updated_at = NOW()
       WHERE id = $9 AND store_id = $10
       RETURNING *`,
      [
        name || title || null,
        path || null,
        seoTitle !== undefined ? seoTitle : null,
        seoDescription !== undefined ? seoDescription : null,
        templateKey || null,
        pageProps ? JSON.stringify(pageProps) : null,
        visibility ? JSON.stringify(visibility) : null,
        status || null,
        pageId,
        storeId
      ]
    );

    res.json({ message: 'Page updated successfully', page: updated.rows[0] });
  }
);

// POST /api/v1/storefront/pages/:id/duplicate (Duplicate page)
storefrontRouter.post(
  '/pages/:id/duplicate',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;

    const sourceRes = await query(`SELECT * FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (sourceRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const source = sourceRes.rows[0];

    // Get latest draft sections
    const draftRes = await query(
      `SELECT sections, page_props FROM page_draft_versions WHERE page_id = $1 ORDER BY version DESC LIMIT 1`,
      [pageId]
    );
    const sections = draftRes.rows[0]?.sections || [];
    const pageProps = draftRes.rows[0]?.page_props || source.page_props || {};

    const newId = `page-${uuidv4()}`;
    const newName = `${source.name} (Copy)`;
    const rawSlug = source.path.replace(/^\//, '').replace(/[^a-z0-9]+/gi, '-');
    const newPath = `/${rawSlug || 'page'}-copy-${Date.now().toString().slice(-4)}`;

    await withTransaction(async (client) => {
      await client.query(
        `INSERT INTO store_pages (
           id, store_id, name, path, type, category, status, is_system, is_locked, template_key, page_props, seo_title, seo_description
         )
         VALUES ($1, $2, $3, $4, $5, $6, 'draft', FALSE, FALSE, $7, $8, $9, $10)`,
        [
          newId,
          storeId,
          newName,
          newPath,
          source.type,
          source.category,
          source.template_key || 'standard',
          JSON.stringify(pageProps),
          source.seo_title ? `${source.seo_title} (Copy)` : null,
          source.seo_description
        ]
      );

      if (sections.length > 0) {
        await client.query(
          `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
           VALUES ($1, $2, 1, $3, $4, $5)`,
          [`draft-${uuidv4()}`, newId, JSON.stringify(sections), JSON.stringify(pageProps), req.auth?.userId]
        );
      }
    });

    res.status(201).json({ message: 'Page duplicated successfully', pageId: newId, path: newPath, name: newName });
  }
);

// DELETE /api/v1/storefront/pages/:id (Delete custom page only)
storefrontRouter.delete(
  '/pages/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const pageId = req.params.id as string;

    const pageRes = await query(`SELECT id, name, is_system, is_locked FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    if (pageRes.rowCount === 0) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    const page = pageRes.rows[0];

    if (page.is_system || page.is_locked) {
      return res.status(400).json({
        error: 'CANNOT_DELETE_SYSTEM_PAGE',
        message: `System page '${page.name}' is essential to store operations and cannot be deleted.`
      });
    }

    await query(`DELETE FROM store_pages WHERE id = $1 AND store_id = $2`, [pageId, storeId]);
    res.json({ message: `Custom page '${page.name}' deleted successfully.` });
  }
);

// GET /api/v1/storefront/by-slug/:slug (Public Storefront by store slug, REQ-STOREFRONT-001)
storefrontRouter.get('/by-slug/:slug', async (req: Request, res: Response) => {
  const slug = req.params.slug as string;
  const storeRes = await query(
    `SELECT id, organization_id, name, slug, currency, timezone, status
     FROM stores
     WHERE LOWER(slug) = LOWER($1) AND status != 'SUSPENDED'`,
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
    `SELECT r.id, r.release_number, r.snapshot, r.content_hash, r.published_by, r.notes, r.created_at
     FROM storefront_settings ss
     JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
     WHERE ss.store_id = $1
     LIMIT 1`,
    [store.id]
  );

  // 2. Active theme
  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [store.id]);

  // 3. Public pages always come from the immutable active release.
  let publishedPages = Array.isArray(releaseRes.rows[0]?.snapshot?.pages)
    ? releaseRes.rows[0].snapshot.pages
    : [];

  // Backfill only stores that have never had their starter pages provisioned.
  // Never expose mutable page rows as public storefront content.
  if (!releaseRes.rows[0]) {
    const existingPages = await query(
      `SELECT 1 FROM store_pages WHERE store_id = $1 LIMIT 1`,
      [store.id]
    );
    if (existingPages.rowCount === 0) {
      await withTransaction(async (client) => {
        await provisionDefaultStorefront({
          client,
          storeId: store.id,
          storeName: store.name || 'Online Store',
          storeSlug: store.slug,
          mode: 'COMMERCE'
        });
      });
      const refreshedRelease = await query(
        `SELECT r.id, r.release_number, r.snapshot, r.content_hash, r.published_by, r.notes, r.created_at
         FROM storefront_settings ss
         JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
         WHERE ss.store_id = $1
         LIMIT 1`,
        [store.id]
      );
      releaseRes.rows = refreshedRelease.rows;
      publishedPages = Array.isArray(refreshedRelease.rows[0]?.snapshot?.pages)
        ? refreshedRelease.rows[0].snapshot.pages
        : [];
    }
  }

  if (!releaseRes.rows[0]) {
    return res.status(404).json({
      error: 'STOREFRONT_NOT_PUBLISHED',
      message: 'This store does not have an active publication yet.'
    });
  }

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

  // 6. Active categories
  const categoriesRes = await query(
    `SELECT id, name, slug, description FROM categories WHERE store_id = $1 AND is_active = TRUE ORDER BY name ASC`,
    [store.id]
  );

  // 7. Storefront settings & brand
  const settingsRes = await query(
    `SELECT mode, home_page, navigation_config, icon_visibility, brand_name, tagline, logo_url, favicon_url, social_links, primary_domain, password_enabled, maintenance_mode
     FROM storefront_settings WHERE store_id = $1`,
    [store.id]
  );
  const settingsRow = settingsRes.rows[0] || {};
  const activeSnapshot = releaseRes.rows[0]?.snapshot || {};
  const publishedBrand = activeSnapshot.brand || {};
  const publishedSettings = activeSnapshot.settings || {};

  res.json({
    store,
    activeRelease: activeSnapshot,
    releaseNumber: releaseRes.rows[0]?.release_number || null,
    // The public site is an immutable publication. Unpublished theme/brand/
    // navigation/settings changes remain visible only in the authenticated editor.
    theme: activeSnapshot.theme || themeRes.rows[0] || { preset_name: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} },
    pages: publishedPages,
    products: productsRes.rows,
    offerings: offeringsRes.rows,
    categories: categoriesRes.rows,
    brand: {
      name: publishedBrand.name || settingsRow.brand_name || store.name,
      tagline: publishedBrand.tagline ?? settingsRow.tagline ?? '',
      logoUrl: publishedBrand.logoUrl ?? settingsRow.logo_url ?? '',
      faviconUrl: publishedBrand.faviconUrl ?? settingsRow.favicon_url ?? '',
      socialLinks: publishedBrand.socialLinks || settingsRow.social_links || {}
    },
    settings: {
      mode: publishedSettings.mode || settingsRow.mode || 'COMMERCE',
      homePage: publishedSettings.homePage || settingsRow.home_page || 'LANDING',
      navigation: activeSnapshot.navigation || settingsRow.navigation_config || [],
      primaryDomain: publishedSettings.primaryDomain || settingsRow.primary_domain || `${store.slug}.${PLATFORM_MAIN_DOMAIN}`,
      passwordEnabled: publishedSettings.passwordEnabled ?? settingsRow.password_enabled ?? false,
      maintenanceMode: publishedSettings.maintenanceMode ?? settingsRow.maintenance_mode ?? false
    }
  });
});

// GET /api/v1/storefront/render (Render active storefront or draft preview)
storefrontRouter.get('/render', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const storeRes = await query(`SELECT id, name, slug, currency, timezone, status FROM stores WHERE id = $1`, [storeId]);
  const store = storeRes.rows[0];

  if (!store) {
    return res.status(404).json({ error: 'STORE_NOT_FOUND', message: 'Tenant store not found' });
  }

  let pagesRes = await query(
    `SELECT p.*,
            COALESCE(pd.sections, '[]'::jsonb) AS sections,
            COALESCE(pd.page_props, p.page_props) AS draft_page_props,
            COALESCE(pd.version, 0) AS draft_version
     FROM store_pages p
     LEFT JOIN LATERAL (
       SELECT sections, page_props, version
       FROM page_draft_versions
       WHERE page_id = p.id
       ORDER BY version DESC, created_at DESC
       LIMIT 1
     ) pd ON TRUE
     WHERE p.store_id = $1
     ORDER BY (CASE WHEN p.path = '/' THEN 0 ELSE 1 END), p.is_system DESC, p.name ASC`,
    [storeId]
  );
  if (pagesRes.rowCount === 0) {
    await withTransaction(async (client) => {
      await provisionDefaultStorefront({
        client,
        storeId,
        storeName: store.name || 'Online Store',
        storeSlug: store.slug || 'store',
        mode: 'COMMERCE',
        userId: req.auth?.userId
      });
    });
    pagesRes = await query(
      `SELECT * FROM store_pages WHERE store_id = $1 ORDER BY (CASE WHEN path = '/' THEN 0 ELSE 1 END), is_system DESC, name ASC`,
      [storeId]
    );
  }

  const themeRes = await query(`SELECT * FROM store_themes WHERE store_id = $1`, [storeId]);
  const latestRel = await query(
    `SELECT r.id, r.snapshot, r.release_number, r.content_hash
     FROM storefront_settings ss
     JOIN store_releases r ON r.id = ss.active_release_id AND r.store_id = ss.store_id
     WHERE ss.store_id = $1
     LIMIT 1`,
    [storeId]
  );

  const productsRes = await query(
    `SELECT p.id, p.name, p.handle, p.description, p.product_type, p.media,
            v.id as variant_id, v.sku, v.price_minor, v.compare_at_minor
     FROM products p
     LEFT JOIN product_variants v ON v.product_id = p.id
     WHERE p.store_id = $1 AND p.status = 'ACTIVE'
     ORDER BY p.created_at DESC
     LIMIT 24`,
    [storeId]
  );

  const offeringsRes = await query(
    `SELECT id, name, handle, description, duration_minutes, price_minor, deposit_required_minor
     FROM offerings
     WHERE store_id = $1 AND is_active = TRUE
     ORDER BY name ASC
     LIMIT 24`,
    [storeId]
  );

  const categoriesRes = await query(
    `SELECT id, name, slug, description FROM categories WHERE store_id = $1 AND is_active = TRUE ORDER BY name ASC`,
    [storeId]
  );

  const settingsRes = await query(
    `SELECT mode, home_page, navigation_config, icon_visibility, brand_name, tagline, logo_url, favicon_url, social_links, primary_domain, password_enabled, maintenance_mode
     FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const settingsRow = settingsRes.rows[0] || {};

  res.json({
    store,
    theme: themeRes.rows[0] || { preset_name: 'modern', palette: {}, typography: {}, buttons: {}, effects: {} },
    pages: pagesRes.rows,
    products: productsRes.rows,
    offerings: offeringsRes.rows,
    categories: categoriesRes.rows,
    brand: {
      name: settingsRow.brand_name || store.name,
      tagline: settingsRow.tagline || '',
      logoUrl: settingsRow.logo_url || '',
      faviconUrl: settingsRow.favicon_url || '',
      socialLinks: settingsRow.social_links || {}
    },
    settings: {
      mode: settingsRow.mode || 'COMMERCE',
      homePage: settingsRow.home_page || 'LANDING',
      navigation: settingsRow.navigation_config || [],
      primaryDomain: settingsRow.primary_domain || `${store.slug}.${PLATFORM_MAIN_DOMAIN}`,
      passwordEnabled: settingsRow.password_enabled || false,
      maintenanceMode: settingsRow.maintenance_mode || false
    },
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
    const { sections, pageProps, expectedVersion } = req.body;

    if (!Array.isArray(sections)) {
      return res.status(400).json({ error: 'INVALID_DRAFT', message: 'Sections must be an array.' });
    }
    if (pageProps !== undefined && (!pageProps || typeof pageProps !== 'object' || Array.isArray(pageProps))) {
      return res.status(400).json({ error: 'INVALID_DRAFT', message: 'Page properties must be an object.' });
    }
    if (expectedVersion !== undefined && (!Number.isInteger(Number(expectedVersion)) || Number(expectedVersion) < 0)) {
      return res.status(400).json({ error: 'INVALID_DRAFT_VERSION', message: 'Expected draft version must be a non-negative integer.' });
    }

    let pageNotFound = false;
    let versionConflict: { currentVersion: number } | null = null;
    let nextVersion = 0;

    await withTransaction(async (client) => {
      // Lock the page row so concurrent autosaves allocate distinct versions.
      const pageRes = await client.query(
        `SELECT id FROM store_pages WHERE id = $1 AND store_id = $2 FOR UPDATE`,
        [pageId, storeId]
      );
      if (pageRes.rowCount === 0) {
        pageNotFound = true;
        return;
      }

      const latestRes = await client.query(
        `SELECT version FROM page_draft_versions WHERE page_id = $1 ORDER BY version DESC LIMIT 1`,
        [pageId]
      );
      const currentVersion = Number(latestRes.rows[0]?.version || 0);
      if (expectedVersion !== undefined && Number(expectedVersion) !== currentVersion) {
        versionConflict = { currentVersion };
        return;
      }

      nextVersion = currentVersion + 1;
      await client.query(
        `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [`draft-${uuidv4()}`, pageId, nextVersion, JSON.stringify(sections), JSON.stringify(pageProps || {}), req.auth?.userId]
      );

      await client.query(
        `UPDATE store_pages SET status = 'draft', updated_at = NOW()
         WHERE id = $1 AND store_id = $2`,
        [pageId, storeId]
      );
    });

    if (pageNotFound) {
      return res.status(404).json({ error: 'PAGE_NOT_FOUND', message: 'Page not found' });
    }
    if (versionConflict) {
      return res.status(409).json({
        error: 'DRAFT_VERSION_CONFLICT',
        message: 'This page draft changed in another session. Refresh the draft before saving again.',
        currentVersion: versionConflict.currentVersion
      });
    }

    res.json({ message: 'Draft saved successfully', pageId, version: nextVersion });
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
        `SELECT p.id, p.name, p.path, p.type, p.category, p.seo_title, p.seo_description, p.template_key, p.is_system, p.is_locked,
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

      // 4. Snapshot brand, navigation, settings
      const settingsRes = await client.query(`SELECT * FROM storefront_settings WHERE store_id = $1`, [storeId]);
      const settingsRow = settingsRes.rows[0] || {};

      const storeSnapshot = {
        brand: {
          name: settingsRow.brand_name,
          tagline: settingsRow.tagline,
          logoUrl: settingsRow.logo_url,
          faviconUrl: settingsRow.favicon_url,
          socialLinks: settingsRow.social_links
        },
        theme: themeSnapshot,
        navigation: settingsRow.navigation_config || [],
        settings: {
          mode: settingsRow.mode,
          homePage: settingsRow.home_page,
          primaryDomain: settingsRow.primary_domain,
          passwordEnabled: settingsRow.password_enabled,
          maintenanceMode: settingsRow.maintenance_mode
        },
        pages: pagesRes.rows,
        publishedAt: new Date().toISOString()
      };

      const contentHash = crypto.createHash('sha256').update(JSON.stringify(storeSnapshot)).digest('hex');

      // 5. Create immutable release record
      await client.query(
        `INSERT INTO store_releases (id, store_id, release_number, content_hash, snapshot, published_by, notes)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [releaseId, storeId, releaseNumber, contentHash, JSON.stringify(storeSnapshot), req.auth?.userId, notes || 'Published release']
      );

      // 6. Update page statuses to 'published', active release pointer and ensure store is ACTIVE
      await client.query(
        `UPDATE store_pages SET status = 'published', updated_at = NOW() WHERE store_id = $1`,
        [storeId]
      );

      await client.query(
        `UPDATE storefront_settings SET active_release_id = $1, updated_at = NOW() WHERE store_id = $2`,
        [releaseId, storeId]
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

// GET /api/v1/storefront/brand
storefrontRouter.get('/brand', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT brand_name, tagline, logo_url, favicon_url, social_links FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const storeRes = await query(`SELECT name FROM stores WHERE id = $1`, [storeId]);
  const s = settingsRes.rows[0] || {};
  const businessName = storeRes.rows[0]?.name || s.brand_name || 'My Store';
  res.json({
    brand: {
      name: businessName,
      tagline: s.tagline || '',
      logoUrl: s.logo_url || '',
      faviconUrl: s.favicon_url || '',
      socialLinks: s.social_links || {}
    }
  });
});

// PATCH /api/v1/storefront/brand
storefrontRouter.patch(
  '/brand',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { name, brandName, tagline, logoUrl, faviconUrl, socialLinks } = req.body;
    const effectiveBrandName = brandName || name;

    if (effectiveBrandName && effectiveBrandName.trim()) {
      await query(`UPDATE stores SET name = $1, updated_at = NOW() WHERE id = $2`, [effectiveBrandName.trim(), storeId]);
      if (req.tenant?.organizationId) {
        await query(`UPDATE organizations SET name = $1, updated_at = NOW() WHERE id = $2`, [effectiveBrandName.trim(), req.tenant.organizationId]);
      }
    }

    const updated = await query(
      `INSERT INTO storefront_settings (store_id, brand_name, tagline, logo_url, favicon_url, social_links)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (store_id) DO UPDATE SET
         brand_name = COALESCE($2, storefront_settings.brand_name),
         tagline = COALESCE($3, storefront_settings.tagline),
         logo_url = COALESCE($4, storefront_settings.logo_url),
         favicon_url = COALESCE($5, storefront_settings.favicon_url),
         social_links = COALESCE($6, storefront_settings.social_links),
         updated_at = NOW()
       RETURNING brand_name, tagline, logo_url, favicon_url, social_links`,
      [
        storeId,
        effectiveBrandName || null,
        tagline !== undefined ? tagline : null,
        logoUrl !== undefined ? logoUrl : null,
        faviconUrl !== undefined ? faviconUrl : null,
        socialLinks ? JSON.stringify(socialLinks) : null
      ]
    );

    res.json({
      message: 'Brand presentation updated successfully',
      brand: {
        name: updated.rows[0].brand_name,
        tagline: updated.rows[0].tagline,
        logoUrl: updated.rows[0].logo_url,
        faviconUrl: updated.rows[0].favicon_url,
        socialLinks: updated.rows[0].social_links
      }
    });
  }
);

// GET /api/v1/storefront/settings
storefrontRouter.get('/settings', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const settingsRes = await query(
    `SELECT mode, home_page, primary_domain, password_enabled, maintenance_mode, redirects, seo_defaults
     FROM storefront_settings WHERE store_id = $1`,
    [storeId]
  );
  const domainsRes = await query(
    `SELECT id, domain, is_primary, is_verified, ssl_status FROM store_domains WHERE store_id = $1 ORDER BY is_primary DESC, created_at ASC`,
    [storeId]
  );

  const s = settingsRes.rows[0] || {};
  res.json({
    settings: {
      mode: s.mode || 'COMMERCE',
      homePage: s.home_page || 'LANDING',
      primaryDomain: s.primary_domain || domainsRes.rows.find((d: any) => d.is_primary)?.domain || null,
      passwordEnabled: s.password_enabled || false,
      maintenanceMode: s.maintenance_mode || false,
      redirects: s.redirects || [],
      seoDefaults: s.seo_defaults || {},
      domains: domainsRes.rows
    }
  });
});

// PATCH /api/v1/storefront/settings
storefrontRouter.patch(
  '/settings',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { passwordEnabled, password, maintenanceMode, redirects, seoDefaults, primaryDomain } = req.body;

    let passwordHash: string | null = null;
    if (password && password.trim().length >= 4) {
      passwordHash = await bcrypt.hash(password.trim(), 10);
    }

    const updated = await query(
      `INSERT INTO storefront_settings (
         store_id, password_enabled, password_hash, maintenance_mode, redirects, seo_defaults, primary_domain
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (store_id) DO UPDATE SET
         password_enabled = COALESCE($2, storefront_settings.password_enabled),
         password_hash = COALESCE($3, storefront_settings.password_hash),
         maintenance_mode = COALESCE($4, storefront_settings.maintenance_mode),
         redirects = COALESCE($5, storefront_settings.redirects),
         seo_defaults = COALESCE($6, storefront_settings.seo_defaults),
         primary_domain = COALESCE($7, storefront_settings.primary_domain),
         updated_at = NOW()
       RETURNING mode, home_page, primary_domain, password_enabled, maintenance_mode, redirects, seo_defaults`,
      [
        storeId,
        passwordEnabled !== undefined ? Boolean(passwordEnabled) : null,
        passwordHash,
        maintenanceMode !== undefined ? Boolean(maintenanceMode) : null,
        redirects ? JSON.stringify(redirects) : null,
        seoDefaults ? JSON.stringify(seoDefaults) : null,
        primaryDomain || null
      ]
    );

    res.json({ message: 'Storefront settings updated successfully', settings: updated.rows[0] });
  }
);

// GET /api/v1/storefront/domains
storefrontRouter.get('/domains', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const domainsRes = await query(
    `SELECT id, domain, is_primary, is_verified, ssl_status, created_at
     FROM store_domains
     WHERE store_id = $1
     ORDER BY is_primary DESC, created_at ASC`,
    [storeId]
  );
  res.json({ domains: domainsRes.rows });
});

// POST /api/v1/storefront/domains
storefrontRouter.post(
  '/domains',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const { domain } = req.body;
    if (!domain || typeof domain !== 'string' || !domain.includes('.')) {
      return res.status(400).json({ error: 'VALIDATION_FAILED', message: 'A valid domain hostname is required (e.g. shop.example.com).' });
    }
    const cleanDomain = domain.toLowerCase().trim();

    const existing = await query(`SELECT id FROM store_domains WHERE domain = $1`, [cleanDomain]);
    if (existing.rowCount && existing.rowCount > 0) {
      return res.status(409).json({ error: 'DOMAIN_ALREADY_CONNECTED', message: 'This domain is already mapped to a store.' });
    }

    const domainId = `dom-${uuidv4()}`;
    await query(
      `INSERT INTO store_domains (id, store_id, domain, is_primary, is_verified, ssl_status)
       VALUES ($1, $2, $3, FALSE, FALSE, 'PENDING')`,
      [domainId, storeId, cleanDomain]
    );

    res.status(201).json({
      message: 'Domain connected. Complete DNS configuration to verify.',
      domain: {
        id: domainId,
        domain: cleanDomain,
        isPrimary: false,
        isVerified: false,
        sslStatus: 'PENDING',
        dnsInstructions: {
          type: 'CNAME',
          host: cleanDomain.split('.')[0],
          target: PLATFORM_MAIN_DOMAIN
        }
      }
    });
  }
);

// POST /api/v1/storefront/domains/:id/verify
storefrontRouter.post(
  '/domains/:id/verify',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(`SELECT * FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }

    // Simulate DNS and SSL verification success
    await query(
      `UPDATE store_domains SET is_verified = TRUE, ssl_status = 'ACTIVE' WHERE id = $1`,
      [domainId]
    );

    res.json({ message: 'Domain verified successfully. SSL certificate issued.', isVerified: true, sslStatus: 'ACTIVE' });
  }
);

// POST /api/v1/storefront/domains/:id/primary
storefrontRouter.post(
  '/domains/:id/primary',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(`SELECT domain FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }
    const targetDomain = domRes.rows[0].domain;

    await withTransaction(async (client) => {
      await client.query(`UPDATE store_domains SET is_primary = FALSE WHERE store_id = $1`, [storeId]);
      await client.query(`UPDATE store_domains SET is_primary = TRUE WHERE id = $1`, [domainId]);
      await client.query(
        `UPDATE storefront_settings SET primary_domain = $1, updated_at = NOW() WHERE store_id = $2`,
        [targetDomain, storeId]
      );
    });

    res.json({ message: `'${targetDomain}' is now the primary domain for your store.`, primaryDomain: targetDomain });
  }
);

// DELETE /api/v1/storefront/domains/:id
storefrontRouter.delete(
  '/domains/:id',
  requireAuth,
  resolveTenant,
  requirePermission('store.editor.edit'),
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const domainId = req.params.id as string;

    const domRes = await query(`SELECT domain, is_primary FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    if (domRes.rowCount === 0) {
      return res.status(404).json({ error: 'DOMAIN_NOT_FOUND', message: 'Domain not found' });
    }
    const { domain, is_primary } = domRes.rows[0];

    if (domain.endsWith(`.${PLATFORM_MAIN_DOMAIN}`)) {
      return res.status(400).json({ error: 'CANNOT_REMOVE_PLATFORM_DOMAIN', message: 'The default platform subdomain cannot be removed.' });
    }
    if (is_primary) {
      return res.status(400).json({ error: 'CANNOT_REMOVE_PRIMARY_DOMAIN', message: 'Set another domain as primary before removing this one.' });
    }

    await query(`DELETE FROM store_domains WHERE id = $1 AND store_id = $2`, [domainId, storeId]);
    res.json({ message: `Domain '${domain}' removed successfully.` });
  }
);

// GET /api/v1/storefront/validate-publish
storefrontRouter.get(
  '/validate-publish',
  requireAuth,
  resolveTenant,
  async (req: Request, res: Response) => {
    const storeId = req.tenant!.storeId;
    const issues: Array<{ severity: 'error' | 'warning'; code: string; message: string; field?: string }> = [];

    // 1. Check home page exists
    const homeRes = await query(`SELECT id FROM store_pages WHERE store_id = $1 AND path = '/'`, [storeId]);
    if (homeRes.rowCount === 0) {
      issues.push({ severity: 'error', code: 'MISSING_HOME_PAGE', message: 'Your store must have a root Home page (path /).' });
    }

    // 2. Check store status
    const storeRes = await query(`SELECT status, name FROM stores WHERE id = $1`, [storeId]);
    if (!storeRes.rows[0] || storeRes.rows[0].status !== 'ACTIVE') {
      issues.push({ severity: 'warning', code: 'STORE_INACTIVE', message: 'Store status is currently not ACTIVE.' });
    }

    // 3. Check primary domain
    const domRes = await query(`SELECT domain FROM store_domains WHERE store_id = $1 AND is_primary = TRUE`, [storeId]);
    if (domRes.rowCount === 0) {
      issues.push({ severity: 'warning', code: 'NO_PRIMARY_DOMAIN', message: 'No primary domain configured. Stores will fall back to platform subdomain.' });
    }

    // 4. Check policy pages
    const policiesRes = await query(
      `SELECT path FROM store_pages WHERE store_id = $1 AND path IN ('/policies/privacy', '/policies/terms', '/policies/refund')`,
      [storeId]
    );
    if ((policiesRes.rowCount || 0) < 3) {
      issues.push({ severity: 'warning', code: 'INCOMPLETE_POLICIES', message: 'One or more recommended legal policy pages (Privacy, Terms, Refund) are missing.' });
    }

    const canPublish = !issues.some(i => i.severity === 'error');
    res.json({ canPublish, issues });
  }
);

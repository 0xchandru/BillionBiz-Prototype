import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import type { PoolClient } from 'pg';
import { PLATFORM_MAIN_DOMAIN } from '../../core/subdomains.js';

export interface ProvisionStorefrontOptions {
  client: PoolClient;
  storeId: string;
  storeName: string;
  storeSlug: string;
  mode: 'COMMERCE' | 'SERVICES' | 'BOTH';
  userId?: string;
}

export interface SystemPageDefinition {
  name: string;
  path: string;
  type: string;
  category: string;
  templateKey: string;
  seoTitle: string;
  seoDescription: string;
  initialSections?: any[];
  pageProps?: Record<string, any>;
}

export function getSystemPageCatalog(storeName: string, mode: 'COMMERCE' | 'SERVICES' | 'BOTH'): SystemPageDefinition[] {
  const isServices = mode === 'SERVICES';
  const hasCommerce = mode === 'COMMERCE' || mode === 'BOTH';
  const hasServices = mode === 'SERVICES' || mode === 'BOTH';

  const pages: SystemPageDefinition[] = [
    {
      name: 'Home',
      path: '/',
      type: 'standard',
      category: 'storefront',
      templateKey: 'home',
      seoTitle: `${storeName} | Official Online Store`,
      seoDescription: `Welcome to the official online store of ${storeName}. Discover our latest offerings.`,
      initialSections: [],
      pageProps: { showHero: false, gridColumns: 4 }
    },
    {
      name: 'Product Listing',
      path: '/shop',
      type: 'commerce_products',
      category: 'commerce',
      templateKey: 'products',
      seoTitle: `Shop All Products | ${storeName}`,
      seoDescription: `Browse the complete collection of products at ${storeName}.`,
      pageProps: { itemsPerPage: 16, enableSorting: true, enableFiltering: true }
    },
    {
      name: 'Collections',
      path: '/collections',
      type: 'commerce_collections',
      category: 'commerce',
      templateKey: 'collections',
      seoTitle: `Collections & Categories | ${storeName}`,
      seoDescription: `Browse product categories and seasonal collections.`,
      pageProps: { layout: 'grid' }
    },
    {
      name: 'Product Detail',
      path: '/products/:handle',
      type: 'commerce_product_detail',
      category: 'commerce',
      templateKey: 'product_detail',
      seoTitle: `Product Detail | ${storeName}`,
      seoDescription: `View specifications, photos, and order online.`,
      pageProps: { showRelatedProducts: true, allowZoom: true }
    },
    {
      name: 'Shopping Cart',
      path: '/cart',
      type: 'commerce_cart',
      category: 'commerce',
      templateKey: 'cart',
      seoTitle: `Shopping Cart | ${storeName}`,
      seoDescription: `Review items in your cart and proceed to secure checkout.`,
      pageProps: { showShippingEstimator: true }
    },
    {
      name: 'Checkout',
      path: '/checkout',
      type: 'commerce_checkout',
      category: 'commerce',
      templateKey: 'checkout',
      seoTitle: `Secure Checkout | ${storeName}`,
      seoDescription: `Complete your purchase securely.`,
      pageProps: { expressCheckout: true }
    },
    {
      name: 'Customer Login',
      path: '/account/login',
      type: 'account_login',
      category: 'customer',
      templateKey: 'account_login',
      seoTitle: `Customer Login | ${storeName}`,
      seoDescription: `Sign in to your customer account to track orders and save addresses.`,
      pageProps: { allowGuestCheckout: true }
    },
    {
      name: 'Account Dashboard',
      path: '/account',
      type: 'account_dashboard',
      category: 'customer',
      templateKey: 'account',
      seoTitle: `My Account | ${storeName}`,
      seoDescription: `Manage your orders, profile, and addresses.`,
      pageProps: {}
    },
    {
      name: 'Search',
      path: '/search',
      type: 'search',
      category: 'storefront',
      templateKey: 'search',
      seoTitle: `Search Store | ${storeName}`,
      seoDescription: `Search products and articles in our store.`,
      pageProps: { liveSearch: true }
    }
  ];

  if (hasServices) {
    pages.push({
      name: 'Book Appointment',
      path: '/booking',
      type: 'services_booking',
      category: 'commerce',
      templateKey: 'booking',
      seoTitle: `Book an Appointment | ${storeName}`,
      seoDescription: `Schedule an appointment or service booking with ${storeName}.`,
      pageProps: { slotIntervalMinutes: 30, allowGuestBooking: true }
    });
  }

  pages.push(
    {
      name: 'Privacy Policy',
      path: '/policies/privacy',
      type: 'policy_privacy',
      category: 'legal',
      templateKey: 'policy',
      seoTitle: `Privacy Policy | ${storeName}`,
      seoDescription: `Information about how ${storeName} collects, protects and uses your data.`,
      pageProps: { policyType: 'privacy' }
    },
    {
      name: 'Terms of Service',
      path: '/policies/terms',
      type: 'policy_terms',
      category: 'legal',
      templateKey: 'policy',
      seoTitle: `Terms of Service | ${storeName}`,
      seoDescription: `Terms and conditions governing the use of ${storeName} storefront.`,
      pageProps: { policyType: 'terms' }
    },
    {
      name: 'Refund & Shipping Policy',
      path: '/policies/refund',
      type: 'policy_refund',
      category: 'legal',
      templateKey: 'policy',
      seoTitle: `Refund & Shipping Policy | ${storeName}`,
      seoDescription: `Details regarding returns, refunds, and shipping timelines.`,
      pageProps: { policyType: 'refund' }
    },
    {
      name: 'Contact Us',
      path: '/contact',
      type: 'contact',
      category: 'storefront',
      templateKey: 'contact',
      seoTitle: `Contact Us | ${storeName}`,
      seoDescription: `Get in touch with the ${storeName} team.`,
      pageProps: { showMap: false, showPhone: true, showEmail: true }
    },
    {
      name: '404 Not Found',
      path: '/404',
      type: 'system_404',
      category: 'system',
      templateKey: '404',
      seoTitle: `Page Not Found | ${storeName}`,
      seoDescription: `The page you are looking for does not exist or has been moved.`,
      pageProps: {}
    },
    {
      name: 'Store Password / Maintenance',
      path: '/password',
      type: 'system_password',
      category: 'system',
      templateKey: 'password',
      seoTitle: `Opening Soon | ${storeName}`,
      seoDescription: `Our store is currently password protected or undergoing maintenance.`,
      pageProps: {}
    }
  );

  return pages;
}

export async function provisionDefaultStorefront(options: ProvisionStorefrontOptions): Promise<{
  domain: string;
  releaseId: string;
  pageCount: number;
}> {
  const { client, storeId, storeName, storeSlug, mode, userId } = options;
  const platformDomain = `${storeSlug}.${PLATFORM_MAIN_DOMAIN}`;

  // 1. Primary Subdomain Mapping
  await client.query(
    `INSERT INTO store_domains (id, store_id, domain, is_primary, is_verified, ssl_status)
     VALUES ($1, $2, $3, TRUE, TRUE, 'ACTIVE')
     ON CONFLICT (domain) DO UPDATE SET is_primary = TRUE, is_verified = TRUE`,
    [`dom-${uuidv4()}`, storeId, platformDomain]
  );

  // 2. Default Store Navigation
  const defaultNav = [
    { id: 'nav-home', label: 'Home', path: '/', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-shop', label: 'Shop', path: '/shop', target: '_self', is_active: true, menu_type: 'HEADER' },
    ...(mode === 'SERVICES' || mode === 'BOTH'
      ? [{ id: 'nav-book', label: 'Book Appointment', path: '/booking', target: '_self', is_active: true, menu_type: 'HEADER' }]
      : []),
    { id: 'nav-contact', label: 'Contact', path: '/contact', target: '_self', is_active: true, menu_type: 'HEADER' },
    { id: 'nav-privacy', label: 'Privacy Policy', path: '/policies/privacy', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-terms', label: 'Terms of Service', path: '/policies/terms', target: '_self', is_active: true, menu_type: 'FOOTER' },
    { id: 'nav-refund', label: 'Refund Policy', path: '/policies/refund', target: '_self', is_active: true, menu_type: 'FOOTER' },
  ];

  // 3. Storefront Settings & Brand Defaults
  await client.query(
    `INSERT INTO storefront_settings (
       store_id, mode, home_page, navigation_config, icon_visibility, version,
       brand_name, tagline, logo_url, favicon_url, social_links, primary_domain
     )
     VALUES ($1, $2, $3, $4, $5, 1, $6, $7, '', '', '{}'::jsonb, $8)
     ON CONFLICT (store_id) DO UPDATE SET
       mode = EXCLUDED.mode,
       home_page = EXCLUDED.home_page,
       brand_name = COALESCE(storefront_settings.brand_name, EXCLUDED.brand_name),
       primary_domain = COALESCE(storefront_settings.primary_domain, EXCLUDED.primary_domain),
       updated_at = NOW()`,
    [
      storeId,
      mode,
      mode === 'SERVICES' ? 'BOOKING' : 'LANDING',
      JSON.stringify(defaultNav),
      JSON.stringify({ showCart: true, showWishlist: true, showAccount: true }),
      storeName,
      'Handcrafted Quality & Direct Commerce',
      platformDomain
    ]
  );

  // 4. Default Store Theme
  const defaultPalette = {
    brand: { primary: '#18181b', secondary: '#71717a', accent: '#0284c7' },
    background: { background: '#ffffff', surface: '#f8fafc', sectionBg: '#ffffff' },
    text: { heading: '#0f172a', body: '#334155', muted: '#64748b' }
  };
  const defaultTypography = {
    headingFont: 'Inter, system-ui, sans-serif',
    bodyFont: 'Inter, system-ui, sans-serif',
    baseSize: '16px'
  };
  const defaultButtons = {
    borderRadius: '8px',
    padding: '10px 20px',
    primaryBg: '#18181b',
    primaryText: '#ffffff'
  };

  await client.query(
    `INSERT INTO store_themes (id, store_id, preset_name, palette, typography, buttons, effects, version)
     VALUES ($1, $2, 'modern', $3, $4, $5, '{}'::jsonb, 1)
     ON CONFLICT (store_id) DO NOTHING`,
    [`thm-${uuidv4()}`, storeId, JSON.stringify(defaultPalette), JSON.stringify(defaultTypography), JSON.stringify(defaultButtons)]
  );

  // 5. System Pages Catalog Provisioning
  const catalog = getSystemPageCatalog(storeName, mode);
  const provisionedPages: any[] = [];

  for (const pageDef of catalog) {
    const pageId = `page-${uuidv4()}`;
    const sections = pageDef.initialSections || [];
    const pageProps = pageDef.pageProps || {};

    const pageRes = await client.query(
      `INSERT INTO store_pages (
         id, store_id, name, path, type, category, status,
         seo_title, seo_description, page_props, is_system, is_locked, template_key
       )
       VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, $8, $9, TRUE, TRUE, $10)
       ON CONFLICT (store_id, path) DO UPDATE SET
         name = EXCLUDED.name,
         type = EXCLUDED.type,
         category = EXCLUDED.category,
         is_system = TRUE,
         is_locked = TRUE,
         template_key = EXCLUDED.template_key
       RETURNING id, name, path, type, category, status, page_props, template_key`,
      [
        pageId,
        storeId,
        pageDef.name,
        pageDef.path,
        pageDef.type,
        pageDef.category,
        pageDef.seoTitle,
        pageDef.seoDescription,
        JSON.stringify(pageProps),
        pageDef.templateKey
      ]
    );

    const actualPageId = pageRes.rows[0].id;

    if (sections.length > 0) {
      await client.query(
        `INSERT INTO page_draft_versions (id, page_id, version, sections, page_props, created_by)
         VALUES ($1, $2, 1, $3, $4, $5)`,
        [`draft-${uuidv4()}`, actualPageId, JSON.stringify(sections), JSON.stringify(pageProps), userId || null]
      );
    }

    provisionedPages.push({
      id: actualPageId,
      name: pageDef.name,
      path: pageDef.path,
      type: pageDef.type,
      category: pageDef.category,
      templateKey: pageDef.templateKey,
      sections,
      pageProps
    });
  }

  // 6. Initial Atomic Publication Snapshot
  const initialReleaseId = `rel-${uuidv4()}`;
  const initialSnapshot = {
    brand: {
      name: storeName,
      tagline: 'Handcrafted Quality & Direct Commerce',
      logoUrl: '',
      faviconUrl: '',
      socialLinks: {}
    },
    theme: {
      presetName: 'modern',
      palette: defaultPalette,
      typography: defaultTypography,
      buttons: defaultButtons
    },
    navigation: defaultNav,
    pages: provisionedPages,
    publishedAt: new Date().toISOString()
  };
  const contentHash = crypto.createHash('sha256').update(JSON.stringify(initialSnapshot)).digest('hex');

  await client.query(
    `INSERT INTO store_releases (id, store_id, release_number, content_hash, snapshot, published_by, notes)
     VALUES ($1, $2, 1, $3, $4, $5, 'Initial starter publication')
     ON CONFLICT (store_id, release_number) DO NOTHING`,
    [initialReleaseId, storeId, contentHash, JSON.stringify(initialSnapshot), userId || null]
  );

  await client.query(
    `UPDATE storefront_settings SET active_release_id = $1 WHERE store_id = $2`,
    [initialReleaseId, storeId]
  );

  return {
    domain: platformDomain,
    releaseId: initialReleaseId,
    pageCount: provisionedPages.length
  };
}


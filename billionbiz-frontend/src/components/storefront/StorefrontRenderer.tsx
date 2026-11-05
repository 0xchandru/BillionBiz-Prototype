import React, { Suspense, lazy, useEffect, useState } from 'react';
import { ThemeTokenProvider } from './ThemeTokenProvider';
import { StoreLayout } from './StoreLayout';
import { Hammer } from 'lucide-react';
import { sanitizeHtml } from '../../utils/sanitizeHtml';

const HomePageView = lazy(() => import('./pages/HomePageView').then((module) => ({ default: module.HomePageView })));
const ShopPageView = lazy(() => import('./pages/ShopPageView').then((module) => ({ default: module.ShopPageView })));
const ProductDetailPageView = lazy(() => import('./pages/ProductDetailPageView').then((module) => ({ default: module.ProductDetailPageView })));
const CollectionsPageView = lazy(() => import('./pages/CollectionsPageView').then((module) => ({ default: module.CollectionsPageView })));
const CartPageView = lazy(() => import('./pages/CartPageView').then((module) => ({ default: module.CartPageView })));
const CheckoutPageView = lazy(() => import('./pages/CheckoutPageView').then((module) => ({ default: module.CheckoutPageView })));
const AccountPageView = lazy(() => import('./pages/AccountPageView').then((module) => ({ default: module.AccountPageView })));
const BookingPageView = lazy(() => import('./pages/BookingPageView').then((module) => ({ default: module.BookingPageView })));
const PolicyPageView = lazy(() => import('./pages/PolicyPageView').then((module) => ({ default: module.PolicyPageView })));
const ContactPageView = lazy(() => import('./pages/ContactPageView').then((module) => ({ default: module.ContactPageView })));
const PasswordGateView = lazy(() => import('./pages/PasswordGateView').then((module) => ({ default: module.PasswordGateView })));
const System404View = lazy(() => import('./pages/System404View').then((module) => ({ default: module.System404View })));

const StorefrontContentSkeleton: React.FC = () => (
    <div aria-label="Loading storefront page" role="status" style={{ maxWidth: 1180, margin: '32px auto', padding: '24px', display: 'grid', gap: 18 }}>
    <div style={{ height: 210, borderRadius: 16, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-shimmer 1.4s ease infinite' }} />
    <div style={{ height: 28, width: '42%', borderRadius: 8, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-shimmer 1.4s ease infinite' }} />
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,minmax(0,1fr))', gap: 14 }}>{[1, 2, 3].map((item) => <div key={item} style={{ height: 190, borderRadius: 12, background: 'linear-gradient(90deg,#e2e8f0,#f8fafc,#e2e8f0)', backgroundSize: '200% 100%', animation: 'bbiz-shimmer 1.4s ease infinite' }} />)}</div>
  </div>
);

export interface StorefrontRendererProps {
  store?: {
    id?: string;
    name?: string;
    slug?: string;
    primary_domain?: string;
    currency?: string;
  };
  brand?: {
    name?: string;
    brand_name?: string;
    tagline?: string;
    logo_url?: string;
    favicon_url?: string;
    social_links?: Record<string, string>;
  };
  themeTokens?: Record<string, any>;
  settings?: Record<string, any>;
  pages?: any[];
  currentPath?: string;
  products?: any[];
  categories?: any[];
  offerings?: any[];
  onNavigate?: (path: string) => void;
  previewMode?: boolean;
  useEditorChrome?: boolean;
  device?: 'desktop' | 'tablet' | 'mobile';
}

export const StorefrontRenderer: React.FC<StorefrontRendererProps> = ({
  store,
  brand,
  themeTokens,
  settings,
  pages = [],
  currentPath = '/',
  products = [],
  categories = [],
  offerings = [],
  onNavigate,
  previewMode = false,
  useEditorChrome = false,
  device
}) => {
  const [runtimeDevice, setRuntimeDevice] = useState<'desktop' | 'tablet' | 'mobile'>(device || 'desktop');

  useEffect(() => {
    if (device) {
      setRuntimeDevice(device);
      return;
    }
    const updateDevice = () => {
      const width = window.innerWidth;
      setRuntimeDevice(width <= 600 ? 'mobile' : width <= 900 ? 'tablet' : 'desktop');
    };
    updateDevice();
    window.addEventListener('resize', updateDevice);
    return () => window.removeEventListener('resize', updateDevice);
  }, [device]);
  const [internalPath, setInternalPath] = useState<string>(currentPath);
  const activePath = previewMode ? (currentPath || internalPath) : (window.location.pathname || currentPath || '/');
  const brandDisplayName = brand?.brand_name || brand?.name || store?.name || 'Store';

  const seoDefaults = (settings as any)?.seoDefaults || (settings as any)?.seo_defaults || {};
  const normalizedActivePath = activePath.replace(/\/+$/, '') || '/';
  const activePageMetadata = pages.find((page: any) =>
    (page.path || '/') === normalizedActivePath
  ) || pages.find((page: any) => page.slug && `/${page.slug}` === normalizedActivePath);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const pageName = activePageMetadata?.name || (normalizedActivePath === '/' ? 'Home' : normalizedActivePath.split('/').filter(Boolean).pop() || 'Page');
    const template = String(seoDefaults.titleTemplate || '{page} · {store}');
    const generatedTitle = template
      .replace(/\{page\}/g, pageName)
      .replace(/\{store\}/g, brandDisplayName);
    const title = activePageMetadata?.seo_title || activePageMetadata?.seoTitle || generatedTitle;
    const description = activePageMetadata?.seo_description ||
      activePageMetadata?.seoDescription ||
      seoDefaults.metaDescription ||
      brand?.tagline ||
      '';
    const allowIndexing = seoDefaults.allowIndexing !== false;

    document.title = title;

    const setMeta = (selector: string, attribute: string, value: string) => {
      let element = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        if (selector.startsWith('meta[name=')) element.name = selector.slice(11, -2);
        else if (selector.startsWith('meta[property=')) element.setAttribute('property', selector.slice(14, -2));
        document.head.appendChild(element);
      }
      element.setAttribute(attribute, value);
    };

    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[name="robots"]', 'content', allowIndexing ? 'index,follow' : 'noindex,nofollow');
    setMeta('meta[property="og:title"]', 'content', title);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', activePageMetadata?.social_image || activePageMetadata?.socialImage || seoDefaults.socialImage || '');

    const canonicalBase = String(seoDefaults.canonicalBase || '').trim().replace(/\/+$/, '');
    const pageCanonical = activePageMetadata?.canonical_url || activePageMetadata?.canonicalUrl;
    const canonicalUrl = pageCanonical || (canonicalBase ? `${canonicalBase}${normalizedActivePath === '/' ? '' : normalizedActivePath}` : `${window.location.origin}${normalizedActivePath}`);
    let canonicalLink = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;
  }, [activePageMetadata, normalizedActivePath, seoDefaults.titleTemplate, seoDefaults.metaDescription, seoDefaults.allowIndexing, seoDefaults.socialImage, seoDefaults.canonicalBase, brandDisplayName, brand?.tagline]);

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      setInternalPath(path);
      if (typeof window !== 'undefined') {
        window.history.pushState({}, '', path);
      }
    }
  };

  const homePageForChrome = pages.find((page: any) => page.path === '/' || page.id === 'landing-page');
  const headerSectionForChrome = homePageForChrome?.sections?.find((section: any) => section.type === 'Header');
  const footerSectionForChrome = homePageForChrome?.sections?.find((section: any) =>
    ['Footer', 'FooterMain'].includes(section.type)
  );
  const headerEditorProps = headerSectionForChrome?.props || {};
  const footerEditorConfig = footerSectionForChrome?.props?._footerEditor || {};
  const publishedFooterTree = Array.isArray(footerEditorConfig.tree) ? footerEditorConfig.tree : undefined;
  const publishedFooterRows = Array.isArray(footerEditorConfig.rows) ? footerEditorConfig.rows : undefined;
  const maintenanceMode = settings?.maintenance_mode ?? (settings as any)?.maintenanceMode ?? false;

  // Check Maintenance Mode
  if (maintenanceMode && !previewMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
        <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto">
            <Hammer size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">{brandDisplayName}</h1>
          <p className="text-xs text-slate-500">
            We are currently performing scheduled maintenance to improve your experience. We will be back online shortly!
          </p>
        </div>
      </div>
    );
  }

  // Password protection is enforced by the public data API before this
  // renderer receives any private publication or catalogue content.

  // Route Resolver
  const renderPageView = () => {
    const cleanPath = activePath.split('?')[0].replace(/\/+$/, '') || '/';

    // 1. Home
    if (cleanPath === '/' || cleanPath === '') {
      const homePage = pages.find((p: any) => p.path === '/' || p.id === 'landing-page');
      return (
        <HomePageView
          brandName={brandDisplayName}
          tagline={brand?.tagline}
          products={products}
          categories={categories}
          offerings={offerings}
          currencyCode={store?.currency || 'INR'}
          onNavigate={handleNavigate}
          device={runtimeDevice}
          sections={homePage?.sections || []}
        />
      );
    }

    // 2. Shop / Catalogue / Search
    if (cleanPath === '/shop' || cleanPath === '/catalog' || cleanPath === '/products' || cleanPath === '/search') {
      return (
        <ShopPageView
          products={products}
          categories={categories}
          onNavigate={handleNavigate}
        />
      );
    }

    // 3. Product Detail (/products/:id or /product/:id)
    if (cleanPath.startsWith('/products/') || cleanPath.startsWith('/product/')) {
      const parts = cleanPath.split('/');
      const productKey = parts[2];
      const selectedProduct = products.find(
        (p) => String(p.id) === productKey || p.slug === productKey || p.handle === productKey
      );

      return (
        <ProductDetailPageView
          product={selectedProduct}
          relatedProducts={products.filter((p) => p.id !== selectedProduct?.id).slice(0, 4)}
          onNavigate={handleNavigate}
        />
      );
    }

    // 4. Collections
    if (cleanPath === '/collections' || cleanPath === '/categories' || cleanPath.startsWith('/collections/')) {
      return (
        <CollectionsPageView
          categories={categories}
          products={products}
          onNavigate={handleNavigate}
        />
      );
    }

    // 5. Cart
    if (cleanPath === '/cart') {
      return <CartPageView onNavigate={handleNavigate} />;
    }

    // 6. Checkout
    if (cleanPath === '/checkout') {
      return <CheckoutPageView onNavigate={handleNavigate} brandName={brandDisplayName} />;
    }

    // 7. Account / Login
    if (
      cleanPath === '/account' ||
      cleanPath === '/account/orders' ||
      cleanPath === '/account/profile' ||
      cleanPath === '/account/login' ||
      cleanPath === '/login' ||
      cleanPath === '/customer'
    ) {
      return <AccountPageView onNavigate={handleNavigate} brandName={brandDisplayName} />;
    }

    // 8. Services / Booking
    if (
      cleanPath === '/book' ||
      cleanPath === '/booking' ||
      cleanPath === '/services' ||
      cleanPath.startsWith('/book/')
    ) {
      return (
        <BookingPageView
          offerings={offerings}
          onNavigate={handleNavigate}
          brandName={brandDisplayName}
        />
      );
    }

    // 9. Contact
    if (cleanPath === '/contact' || cleanPath === '/contact-us') {
      return (
        <ContactPageView
          brandName={brandDisplayName}
        />
      );
    }

    // 10. Legal Policies
    if (cleanPath === '/privacy' || cleanPath === '/policies/privacy') {
      return <PolicyPageView type="privacy" brandName={brandDisplayName} />;
    }
    if (cleanPath === '/terms' || cleanPath === '/policies/terms') {
      return <PolicyPageView type="terms" brandName={brandDisplayName} />;
    }
    if (cleanPath === '/refund' || cleanPath === '/returns' || cleanPath === '/policies/refund') {
      return <PolicyPageView type="refund" brandName={brandDisplayName} />;
    }

    // 11. Password Gate route
    if (cleanPath === '/password') {
      return (
        <PasswordGateView
          brandName={brandDisplayName}
          tagline={brand?.tagline}
        />
      );
    }

    // 11. Custom Page check from pages catalog
    const matchedCustomPage = pages.find((p) => p.slug === cleanPath || `/${p.slug}` === cleanPath);
    if (matchedCustomPage) {
      return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {matchedCustomPage.name || matchedCustomPage.title}
          </h1>
          <div className="prose dark:prose-invert max-w-none text-sm text-slate-700 dark:text-slate-300">
            {matchedCustomPage.content ? (
              <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(matchedCustomPage.content) }} />
            ) : (
              <p className="text-slate-500 italic">This page has no content published yet.</p>
            )}
          </div>
        </div>
      );
    }

    // 12. 404 System View
    return <System404View onNavigate={handleNavigate} brandName={brandDisplayName} />;
  };

  return (
    <ThemeTokenProvider theme={themeTokens}>
      <StoreLayout
        brand={{
          name: brandDisplayName,
          tagline: brand?.tagline,
          logoUrl: brand?.logo_url || (brand as any)?.logoUrl,
          faviconUrl: brand?.favicon_url || (brand as any)?.faviconUrl,
          socialLinks: brand?.social_links || (brand as any)?.socialLinks
        }}
        previewMode={previewMode}
        onNavigate={handleNavigate}
        headerProps={headerEditorProps}
        footerTree={publishedFooterTree}
        footerRows={publishedFooterRows}
        useEditorChrome={useEditorChrome}
        device={runtimeDevice}
        currentPath={activePath}
        settings={{ ...(settings || {}), ...(settings?.uiConfig || {}) }}
      >
        <Suspense fallback={<StorefrontContentSkeleton />}>{renderPageView()}</Suspense>
      </StoreLayout>
    </ThemeTokenProvider>
  );
};


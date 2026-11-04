import React, { useEffect, useState } from 'react';
import { ThemeTokenProvider } from './ThemeTokenProvider';
import { StoreLayout } from './StoreLayout';
import { HomePageView } from './pages/HomePageView';
import { ShopPageView } from './pages/ShopPageView';
import { ProductDetailPageView } from './pages/ProductDetailPageView';
import { CollectionsPageView } from './pages/CollectionsPageView';
import { CartPageView } from './pages/CartPageView';
import { CheckoutPageView } from './pages/CheckoutPageView';
import { AccountPageView } from './pages/AccountPageView';
import { BookingPageView } from './pages/BookingPageView';
import { PolicyPageView } from './pages/PolicyPageView';
import { ContactPageView } from './pages/ContactPageView';
import { System404View } from './pages/System404View';
import { Hammer } from 'lucide-react';

export interface StorefrontRendererProps {
  store?: {
    id?: string;
    name?: string;
    slug?: string;
    primary_domain?: string;
  };
  brand?: {
    brand_name?: string;
    tagline?: string;
    logo_url?: string;
    favicon_url?: string;
    social_links?: Record<string, string>;
  };
  themeTokens?: Record<string, any>;
  settings?: {
    password_enabled?: boolean;
    password_hash?: string;
    maintenance_mode?: boolean;
    seo_defaults?: any;
    primary_domain?: string;
  };
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

  const brandDisplayName = brand?.brand_name || brand?.name || store?.name || 'Online Store';
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
              <div dangerouslySetInnerHTML={{ __html: matchedCustomPage.content }} />
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
        currentPath={activePath}
      >
        {renderPageView()}
      </StoreLayout>
    </ThemeTokenProvider>
  );
};


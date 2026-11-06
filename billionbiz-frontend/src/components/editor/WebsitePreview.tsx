import React, { useEffect, useState, useMemo } from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import { useAuthStore } from '../../store/authStore';
import { apiClient } from '../../api/client';
import { getStoreUrl } from '../../utils/subdomain';
import { StorefrontRenderer } from '../storefront/StorefrontRenderer';
import { StorefrontPreviewViewport } from '../storefront/StorefrontPreviewViewport';

interface WebsitePreviewProps {
  pagePath?: string;
  overrideDevice?: 'desktop' | 'tablet' | 'mobile';
  highlightSection?: 'header' | 'footer' | null;
  className?: string;
  style?: React.CSSProperties;
  useEditorChrome?: boolean;
}

export const WebsitePreview: React.FC<WebsitePreviewProps> = ({
  pagePath,
  overrideDevice,
  highlightSection: _highlightSection,
  className = '',
  style = {},
  useEditorChrome = true
}) => {
  const storeDevice = useLandingEditorStore((s) => s.device);
  const selectedPageId = useLandingEditorStore((s) => s.selectedPageId);

  const { theme, settings, pages } = useSiteStore();
  const isLoadingEditorData = useSiteStore((s) => s.isLoading);
  const authStoreSlug = useAuthStore((s) => s.storeSlug);
  const localSlug = typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_slug') : null;
  const storeSlug = authStoreSlug || localSlug || '';

  const activeDevice = (overrideDevice || (storeDevice === 'all' ? 'desktop' : storeDevice) || 'desktop') as 'desktop' | 'tablet' | 'mobile';

  const [serverData, setServerData] = useState<any>(null);
  const [isLoadingServerData, setIsLoadingServerData] = useState(true);
  const [serverDataError, setServerDataError] = useState<string | null>(null);

  // Fetch the current tenant's authoritative runtime data once. Never fall
  // back to another endpoint or a demo tenant: a failed request must be visible.
  useEffect(() => {
    let cancelled = false;
    const fetchAuthoritativeData = async () => {
      setIsLoadingServerData(true);
      setServerDataError(null);
      if (!storeSlug) {
        setServerDataError('No active store is selected. Return to the dashboard and open a store first.');
        setIsLoadingServerData(false);
        return;
      }
      try {
        const res = await apiClient<any>('/storefront/render');
        if (!res?.store) {
          throw new Error('The storefront API returned an incomplete store response.');
        }
        if (!cancelled) setServerData(res);
      } catch (error: any) {
        if (!cancelled) {
          setServerData(null);
          setServerDataError(error?.message || 'Unable to load the selected store preview.');
        }
      } finally {
        if (!cancelled) setIsLoadingServerData(false);
      }
    };
    void fetchAuthoritativeData();
    return () => { cancelled = true; };
  }, [storeSlug]);

  // Determine current active path based on selectedPageId
  const currentPath = useMemo(() => {
    if (pagePath) return pagePath;
    if (!selectedPageId || selectedPageId === 'landing-page' || selectedPageId.endsWith('-global')) {
      return '/';
    }

    // Map common page IDs to their canonical URL routes
    const pathToIdMap: Record<string, string> = {
      'shop-page': '/shop',
      'shop': '/shop',
      'product-details-page': '/products',
      'product_detail': '/products',
      'collections-page': '/collections',
      'collection': '/collections',
      'cart-page': '/cart',
      'cart': '/cart',
      'checkout-page': '/checkout',
      'checkout': '/checkout',
      'account-page': '/account',
      'account': '/account',
      'booking-page': '/book',
      'booking': '/book',
      'contact-page': '/contact',
      'contact': '/contact',
      'privacy-policy-page': '/policies/privacy',
      'terms-conditions-page': '/policies/terms',
      'refund-policy-page': '/policies/refund',
      '404': '/404',
      'password': '/password'
    };

    if (pathToIdMap[selectedPageId]) {
      return pathToIdMap[selectedPageId];
    }

    const matched = pages.find((p) => p.id === selectedPageId || p.type === selectedPageId);
    return matched?.path || '/';
  }, [selectedPageId, pagePath, pages]);

  // Business Name: Inherit authoritatively from Admin Settings / Store Settings
  const effectiveBusinessName =
    serverData?.store?.name ||
    serverData?.brand?.brand_name ||
    settings?.storeName ||
    '';

  const effectiveBrand = {
    brand_name: effectiveBusinessName,
    tagline: settings?.tagline || serverData?.brand?.tagline || '',
    logo_url: settings?.logoUrl || serverData?.brand?.logo_url,
    favicon_url: settings?.faviconUrl || serverData?.brand?.favicon_url,
    social_links: settings?.socialLinks || serverData?.brand?.social_links || {}
  };

  const effectiveTheme = theme || serverData?.theme || {};
  const effectiveSettings = {
    ...(serverData?.settings || {}),
    ...(serverData?.settings?.uiConfig || {}),
    ...(settings || {}),
  };
  const effectiveProducts = serverData?.products || [];
  const effectiveCategories = serverData?.categories || [];
  const effectiveOfferings = serverData?.offerings || [];

  if (isLoadingServerData || isLoadingEditorData) {
    return (
      <div className="website-preview-loading" role="status" aria-live="polite">
        <div className="website-preview-skeleton-bar" />
        <div className="website-preview-skeleton-hero">
          <div className="website-preview-skeleton-line" />
          <div className="website-preview-skeleton-line short" />
          <div className="website-preview-skeleton-button" />
        </div>
        <div className="website-preview-skeleton-grid">
          <span /><span /><span />
        </div>
        <span className="website-preview-skeleton-label">Loading your store preview…</span>
      </div>
    );
  }

  if (serverDataError || !serverData?.store) {
    return (
      <div className="website-preview-error" role="alert">
        <strong>Store preview unavailable</strong>
        <p>{serverDataError || 'The active store could not be resolved.'}</p>
        <button type="button" onClick={() => window.location.reload()}>Retry preview</button>
      </div>
    );
  }

  if (storeDevice === 'all' && !overrideDevice) {
    return (
      <div className="store-preview-compare-grid" style={{ height: '100%', minHeight: 0, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 12, overflow: 'hidden', padding: 12, boxSizing: 'border-box' }}>
        {(['desktop', 'tablet', 'mobile'] as const).map((device) => (
          <div key={device} style={{ minWidth: 0, minHeight: 0, height: '100%', overflow: 'hidden', display: 'grid', gridTemplateRows: '30px minmax(0, 1fr)', border: '1px solid #dbe3ec', borderRadius: 12, background: '#eef2f7' }}>
            <div style={{ height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#475569', borderBottom: '1px solid #dbe3ec', background: '#fff' }}>{device === 'desktop' ? 'Desktop · 1280px' : device === 'tablet' ? 'Tablet · 768px' : 'Mobile · 375px'}</div>
            <div style={{ minHeight: 0, overflow: 'hidden' }}><WebsitePreview overrideDevice={device} useEditorChrome={useEditorChrome} /></div>
          </div>
        ))}
      </div>
    );
  }

  const frameStyle: React.CSSProperties = activeDevice === 'mobile'
    ? {
        backgroundColor: '#ffffff',
        borderRadius: '20px',
        boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0,0,0,0.06)',
        overflowX: 'hidden',
        overflowY: 'auto',
        height: '100%',
        minHeight: '100%',
        overscrollBehavior: 'contain',
      }
    : activeDevice === 'tablet'
      ? {
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0,0,0,0.06)',
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100%',
          minHeight: '100%',
          overscrollBehavior: 'contain',
        }
      : {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 12px -2px rgba(0, 0, 0, 0.06)',
          overflowX: 'hidden',
          overflowY: 'auto',
          height: '100%',
          minHeight: '100%',
          overscrollBehavior: 'contain',
        };

  return (
    <StorefrontPreviewViewport
      device={activeDevice}
      className={`website-preview-outer-container ${className}`}
      frameClassName="website-preview-frame"
      minHeight={activeDevice === 'desktop' ? '100%' : activeDevice === 'tablet' ? 850 : 750}
      stageStyle={{
        height: '100%',
        overflowX: 'hidden',
        overflowY: 'hidden',
        alignItems: 'flex-start',
        padding: activeDevice === 'desktop' ? '24px 28px 32px' : activeDevice === 'tablet' ? '20px 16px 32px' : '16px 12px 28px',
        ...style
      }}
      frameStyle={frameStyle}
      onClickCapture={(e) => {
        // Prevent navigation away from the editor when interacting with preview links.
        const target = e.target as HTMLElement;
        const anchor = target.closest('a');
        if (anchor) e.preventDefault();
      }}
    >
      <StorefrontRenderer
        store={{
          id: serverData?.store?.id,
          name: effectiveBusinessName,
          slug: storeSlug,
          primary_domain: getStoreUrl(storeSlug).replace(/^https?:\/\//, ''),
          currency: serverData?.store?.currency || 'INR'
        }}
        brand={effectiveBrand}
        themeTokens={effectiveTheme}
        settings={effectiveSettings}
        pages={pages && pages.length > 0 ? pages : (serverData?.pages || [])}
        currentPath={currentPath}
        products={effectiveProducts}
        categories={effectiveCategories}
        offerings={effectiveOfferings}
        previewMode={true}
        useEditorChrome={useEditorChrome}
        device={activeDevice}
        onNavigate={(targetPath) => {
          const matched = pages.find((p) => p.path === targetPath);
          if (matched) {
            useLandingEditorStore.getState().navigateToPage(matched.id);
          }
        }}
      />
    </StorefrontPreviewViewport>
  );
};

export default WebsitePreview;

import React, { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sliders, 
  RefreshCw, 
  ExternalLink, 
  ChevronDown
} from 'lucide-react';
import { StorefrontRenderer } from './StorefrontRenderer';
import { apiClient } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useSiteStore } from '../../store/siteStore';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { getStoreUrl } from '../../utils/subdomain';

interface StorefrontPreviewProps {
  initialPath?: string;
  className?: string;
}

export const StorefrontPreview: React.FC<StorefrontPreviewProps> = ({
  initialPath = '/',
  className = ''
}) => {
  const storeSlug = useAuthStore((s) => s.storeSlug) || (typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_slug') : null) || 'chandru';
  const siteStore = useSiteStore();
  const selectedPageId = useLandingEditorStore((s) => s.selectedPageId);

  const [activePath, setActivePath] = useState<string>(initialPath);
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile' | 'custom'>('desktop');
  const [customWidth, setCustomWidth] = useState<number>(1024);
  const [previewMode, setPreviewMode] = useState<'draft' | 'published'>('draft');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [serverData, setServerData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Sync active preview path whenever user selects a page in the left sidebar
  useEffect(() => {
    if (!selectedPageId) return;
    if (selectedPageId.endsWith('-global')) return; // Header or Footer global editors

    const matched = siteStore.pages.find((p) => p.id === selectedPageId || p.type === selectedPageId);
    if (matched && matched.path && matched.path !== activePath) {
      setActivePath(matched.path);
    }
  }, [selectedPageId, siteStore.pages]);

  // Measure container width for responsive scaling
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch real authoritative tenant data from backend
  const fetchTenantData = async () => {
    try {
      setIsRefreshing(true);
      let res: any;
      try {
        res = await apiClient<any>('/storefront/render');
      } catch {
        res = await apiClient<any>(`/storefront/by-slug/${storeSlug}`);
      }
      if (res && res.store) {
        setServerData(res);
      }
    } catch (err) {
      console.warn('[StorefrontPreview] Failed to fetch live tenant data:', err);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenantData();
  }, [storeSlug]);

  // Determine target preview width & scale
  let targetWidth: string | number = '100%';
  let scale = 1;

  if (deviceMode === 'tablet') {
    targetWidth = 768;
    scale = containerWidth > 0 && containerWidth < 800 ? (containerWidth - 32) / 768 : 1;
  } else if (deviceMode === 'mobile') {
    targetWidth = 375;
    scale = containerWidth > 0 && containerWidth < 400 ? (containerWidth - 32) / 375 : 1;
  } else if (deviceMode === 'custom') {
    const w = Math.max(300, Math.min(1440, customWidth));
    targetWidth = w;
    scale = containerWidth > 0 && containerWidth < w + 32 ? (containerWidth - 32) / w : 1;
  } else {
    // Desktop: full native desktop width, never squished
    targetWidth = '100%';
    scale = 1;
  }

  // Pages Catalog for selector
  const standardPages = [
    { label: 'Home Page', path: '/' },
    { label: 'Shop / Catalogue', path: '/shop' },
    { label: 'Collections', path: '/collections' },
    { label: 'Cart', path: '/cart' },
    { label: 'Checkout', path: '/checkout' },
    { label: 'Customer Account', path: '/account' },
    { label: 'Book Appointment', path: '/book' },
    { label: 'Contact Us', path: '/contact' },
    { label: 'Privacy Policy', path: '/policies/privacy' },
    { label: 'Terms of Service', path: '/policies/terms' },
    { label: 'Refund Policy', path: '/policies/refund' },
    { label: 'Password Gate', path: '/password' },
    { label: 'Error 404', path: '/404' }
  ];

  // Merge custom pages from server data or local store
  const allPages = [
    ...standardPages,
    ...(serverData?.pages || siteStore.pages || [])
      .filter((p: any) => !standardPages.some((sp) => sp.path === p.path))
      .map((p: any) => ({ label: `${p.name} (Custom)`, path: p.path }))
  ];

  const handlePageChange = (newPath: string) => {
    setActivePath(newPath);
    const matched = siteStore.pages.find((p) => p.path === newPath);
    if (matched) {
      useLandingEditorStore.getState().navigateToPage(matched.id);
    }
  };

  // Real store data source based on Draft vs Published mode
  const effectiveTheme = previewMode === 'draft' && siteStore.theme
    ? siteStore.theme
    : serverData?.theme || {};

  const effectiveBrand = previewMode === 'draft' && siteStore.settings
    ? {
        brand_name: siteStore.settings.storeName || serverData?.brand?.brand_name || serverData?.brand?.name,
        tagline: siteStore.settings.tagline || serverData?.brand?.tagline,
        logo_url: siteStore.settings.logoUrl || serverData?.brand?.logo_url || serverData?.brand?.logoUrl,
        favicon_url: siteStore.settings.faviconUrl || serverData?.brand?.favicon_url || serverData?.brand?.faviconUrl,
        social_links: siteStore.settings.socialLinks || serverData?.brand?.social_links || serverData?.brand?.socialLinks
      }
    : serverData?.brand || {};

  const effectiveSettings = previewMode === 'draft' && siteStore.settings
    ? { ...serverData?.settings, ...siteStore.settings }
    : serverData?.settings || {};

  const effectiveSlug = serverData?.store?.slug || storeSlug;
  const pathSuffix = activePath === '/' ? '' : activePath;
  const liveStorefrontUrl = getStoreUrl(effectiveSlug, pathSuffix);

  return (
    <div className={`flex flex-col h-full bg-slate-100 dark:bg-slate-950 ${className}`}>
      {/* ─── Top Preview Controls Toolbar ─── */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 z-10 shadow-xs">
        {/* Left: Device Switcher & Width Slider */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setDeviceMode('desktop')}
              title="Desktop (1280px)"
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                deviceMode === 'desktop'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Monitor size={15} />
            </button>
            <button
              onClick={() => setDeviceMode('tablet')}
              title="Tablet (768px)"
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                deviceMode === 'tablet'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Tablet size={15} />
            </button>
            <button
              onClick={() => setDeviceMode('mobile')}
              title="Mobile (375px)"
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                deviceMode === 'mobile'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Smartphone size={15} />
            </button>
            <button
              onClick={() => setDeviceMode('custom')}
              title="Custom Width (300px - 1440px)"
              className={`p-1.5 rounded-md text-xs font-medium transition cursor-pointer ${
                deviceMode === 'custom'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders size={15} />
            </button>
          </div>

          {/* Width Display & Slider */}
          {deviceMode === 'custom' && (
            <div className="flex items-center gap-2 text-xs text-slate-500 pl-2">
              <input
                type="range"
                min="300"
                max="1440"
                value={customWidth}
                onChange={(e) => setCustomWidth(Number(e.target.value))}
                className="w-24 accent-indigo-600 cursor-pointer"
              />
              <span className="font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                {customWidth}px
              </span>
            </div>
          )}
        </div>

        {/* Center: Page Picker Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Page:
          </label>
          <div className="relative">
            <select
              value={activePath}
              onChange={(e) => handlePageChange(e.target.value)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {allPages.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.label} ({p.path})
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Right: Draft/Published Switch, Refresh, Open in Tab */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
            <button
              onClick={() => setPreviewMode('draft')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                previewMode === 'draft'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Draft
            </button>
            <button
              onClick={() => setPreviewMode('published')}
              className={`px-2.5 py-1 rounded-md font-semibold text-[11px] transition cursor-pointer ${
                previewMode === 'published'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Published
            </button>
          </div>

          {/* Refresh Button */}
          <button
            onClick={fetchTenantData}
            title="Refresh Preview"
            disabled={isRefreshing}
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-indigo-600' : ''} />
          </button>

          {/* Open in New Tab */}
          <a
            href={liveStorefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Storefront"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition border border-indigo-200 dark:border-indigo-800/50"
          >
            <span>Live Store</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </div>

      {/* ─── Canvas Preview Stage ─── */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 sm:p-6 flex items-start justify-center"
      >
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400 gap-2 text-xs">
            <RefreshCw size={16} className="animate-spin text-indigo-600" />
            <span>Loading preview environment...</span>
          </div>
        ) : (
          <div
            style={{
              width: typeof targetWidth === 'number' ? `${targetWidth}px` : targetWidth,
              maxWidth: deviceMode === 'desktop' ? '1280px' : undefined,
              minHeight: '820px',
              transform: scale < 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top center',
              transition: 'all 0.2s ease'
            }}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden shrink-0"
          >
            <StorefrontRenderer
              store={serverData?.store || { name: 'Demo Store', slug: storeSlug }}
              brand={effectiveBrand}
              themeTokens={effectiveTheme?.palette || effectiveTheme?.tokens}
              settings={effectiveSettings}
              pages={serverData?.pages || []}
              products={serverData?.products || []}
              offerings={serverData?.offerings || []}
              categories={serverData?.categories || []}
              currentPath={activePath}
              onNavigate={(path) => setActivePath(path)}
              previewMode={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};


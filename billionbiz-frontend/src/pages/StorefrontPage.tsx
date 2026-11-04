import React, { useCallback, useEffect, useState } from 'react';
import { StorefrontRenderer } from '../components/storefront/StorefrontRenderer';
import { apiClient, getApiBaseUrl } from '../api/client';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface StorefrontPageProps {
  slug?: string;
}

export const StorefrontPage: React.FC<StorefrontPageProps> = ({ slug = 'shoum' }) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadStore = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) setLoading(true);
      setNotFound(false);
      const data = await apiClient<any>(`/storefront/by-slug/${encodeURIComponent(slug)}`);
      if (!data || !data.store) {
        setNotFound(true);
        setStoreData(null);
      } else {
        setStoreData(data);
      }
    } catch (err: any) {
      console.warn(`[Storefront] Failed to load store '${slug}':`, err);
      setNotFound(true);
      setStoreData(null);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    if (!slug) return;

    void loadStore(true);

    // A public, store-scoped SSE stream sends only release metadata. Re-fetch
    // the immutable active snapshot when a merchant publishes or rolls back.
    const updatesUrl = `${getApiBaseUrl()}/storefront/by-slug/${encodeURIComponent(slug)}/updates`;
    const updates = new EventSource(updatesUrl);

    updates.onmessage = (message) => {
      try {
        const envelope = JSON.parse(message.data);
        if (envelope?.data?.type === 'STOREFRONT_RELEASE_PUBLISHED') {
          void loadStore(false);
        }
      } catch {
        // Ignore malformed frames and keep the stream open.
      }
    };

    updates.onerror = () => {
      // EventSource reconnects automatically. The current published page
      // remains usable while the stream is temporarily unavailable.
    };

    return () => {
      updates.close();
    };
  }, [slug, loadStore]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-medium">Resolving storefront publication...</span>
        </div>
      </div>
    );
  }

  // A store without a publication is not served as a demo or draft storefront.
  if (notFound || !storeData) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-red-100 dark:bg-red-950/40 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle size={32} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          Storefront Not Found
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-md text-sm mb-8">
          The online store for <code className="font-mono bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-800 dark:text-slate-200">'{slug}'</code> does not exist or has not been published yet.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition"
          >
            <ArrowLeft size={14} />
            BillionBiz Home
          </a>
          <a
            href="/admin"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Merchant Admin Login
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  return (
    <StorefrontRenderer
      store={storeData.store}
      brand={storeData.brand}
      themeTokens={storeData.theme}
      settings={storeData.settings}
      pages={storeData.pages}
      products={storeData.products}
      offerings={storeData.offerings}
      categories={storeData.categories}
      previewMode={false}
      currentPath={typeof window !== 'undefined' ? window.location.pathname : '/'}
    />
  );
};

export default StorefrontPage;

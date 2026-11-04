import React, { useEffect, useState } from 'react';
import { StorefrontRenderer } from '../components/storefront/StorefrontRenderer';
import { apiClient } from '../api/client';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface StorefrontPageProps {
  slug?: string;
}

export const StorefrontPage: React.FC<StorefrontPageProps> = ({ slug = 'shoum' }) => {
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadStore() {
      try {
        setLoading(true);
        setNotFound(false);
        const data = await apiClient<any>(`/storefront/by-slug/${slug}`);
        if (!data || !data.store) {
          setNotFound(true);
        } else {
          setStoreData(data);
        }
      } catch (err: any) {
        console.warn(`[Storefront] Failed to load store '${slug}':`, err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadStore();
    }
  }, [slug]);

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

  // P0 Launch Gate: Dedicated 404 Store Not Found UI (Never a fake demo store)
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

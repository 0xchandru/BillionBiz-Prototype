import React, { useCallback, useEffect, useState } from 'react';
import { StorefrontRenderer } from '../components/storefront/StorefrontRenderer';
import { PasswordGateView } from '../components/storefront/pages/PasswordGateView';
import { apiClient, getApiBaseUrl } from '../api/client';
import { AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface StorefrontPageProps {
  slug?: string;
}

export const StorefrontPage: React.FC<StorefrontPageProps> = ({ slug = '' }) => {
  const accessStorageKey = `billionbiz_storefront_access:${slug}`;
  const [accessToken, setAccessToken] = useState<string | null>(() =>
    typeof window !== 'undefined' ? sessionStorage.getItem(accessStorageKey) : null
  );
  const [storeData, setStoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const loadStore = useCallback(async (showLoading = false, tokenOverride?: string | null): Promise<boolean> => {
    const tokenToUse = tokenOverride === undefined ? accessToken : tokenOverride;
    if (!slug) {
      setNotFound(true);
      setStoreData(null);
      setLoading(false);
      return false;
    }
    try {
      if (showLoading) setLoading(true);
      setNotFound(false);
      const data = await apiClient<any>(
        `/storefront/by-slug/${encodeURIComponent(slug)}`,
        {
          headers: tokenToUse
            ? { 'x-storefront-access-token': tokenToUse }
            : {}
        }
      );

      if (!data || !data.store) {
        setNotFound(true);
        setStoreData(null);
        return false;
      }

      if (data.passwordRequired) {
        if (tokenToUse) {
          sessionStorage.removeItem(accessStorageKey);
          setAccessToken(null);
        }
        setStoreData(data);
        return false;
      }

      setStoreData(data);
      return true;
    } catch (err: any) {
      console.warn(`[Storefront] Failed to load store '${slug}':`, err);
      setNotFound(true);
      setStoreData(null);
      return false;
    } finally {
      setLoading(false);
    }
  }, [slug, accessStorageKey, accessToken]);

  const handlePasswordUnlock = useCallback(async (password: string): Promise<boolean> => {
    try {
      const result = await apiClient.post<{ verified: boolean; accessToken?: string }>(
        `/storefront/by-slug/${encodeURIComponent(slug)}/password/verify`,
        { password }
      );
      if (!result.verified || !result.accessToken) return false;

      sessionStorage.setItem(accessStorageKey, result.accessToken);
      setAccessToken(result.accessToken);
      return await loadStore(false, result.accessToken);
    } catch (error) {
      console.warn('[Storefront] Password verification failed:', error);
      return false;
    }
  }, [slug, accessStorageKey, loadStore]);

  useEffect(() => {
    if (!slug) return;

    void loadStore(true, sessionStorage.getItem(accessStorageKey));

    // A public, store-scoped SSE stream sends release metadata only. The
    // active publication is re-fetched with the same scoped access token.
    const updatesUrl = `${getApiBaseUrl()}/storefront/by-slug/${encodeURIComponent(slug)}/updates`;
    const updates = new EventSource(updatesUrl);

    updates.onmessage = (message) => {
      try {
        const envelope = JSON.parse(message.data);
        if (envelope?.data?.type === 'STOREFRONT_RELEASE_PUBLISHED') {
          void loadStore(false, sessionStorage.getItem(accessStorageKey));
        }
      } catch {
        // Ignore malformed frames and keep the stream open.
      }
    };

    updates.onerror = () => {
      // EventSource reconnects automatically. Existing published content stays usable.
    };

    return () => {
      updates.close();
    };
  }, [slug, accessStorageKey, loadStore]);

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
          <a href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 text-white dark:bg-white dark:text-slate-900 hover:opacity-90 transition">
            <ArrowLeft size={14} />
            BillionBiz Home
          </a>
          <a href="/admin" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition">
            Merchant Admin Login
            <ExternalLink size={12} />
          </a>
        </div>
      </div>
    );
  }

  // The API returns only public identity metadata until a valid server-issued
  // store-scoped password token is presented.
  if (storeData.passwordRequired) {
    return (
      <PasswordGateView
        brandName={storeData.brand?.name || storeData.store?.name}
        tagline={storeData.brand?.tagline}
        onUnlock={handlePasswordUnlock}
      />
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

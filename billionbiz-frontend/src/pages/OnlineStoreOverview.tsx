import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ExternalLink,
  Edit3,
  Layers,
  Palette,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Clock,
  Sparkles,
  Sliders
} from 'lucide-react';
import { apiClient } from '../api/client';
import { useAuthStore } from '../store/authStore';
import { getStoreUrl } from '../utils/subdomain';
import styles from './OnlineStoreOverview.module.css';

export const OnlineStoreOverview: React.FC = () => {
  const navigate = useNavigate();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const storeSlug = useAuthStore((s) => s.storeSlug) || (typeof window !== 'undefined' ? localStorage.getItem('billionbiz_store_slug') : null) || 'chandru';
  const platformDomain = `${storeSlug}.${rootDomain}`;

  const [loading, setLoading] = useState(true);
  const [storeData, setStoreData] = useState<any>(null);
  const [pagesCount, setPagesCount] = useState({ total: 0, system: 0, custom: 0 });
  const [provisioning, setProvisioning] = useState<any>(null);
  const [retrying, setRetrying] = useState(false);
  const [validation, setValidation] = useState<{ canPublish: boolean; issues: any[] }>({
    canPublish: true,
    issues: []
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [renderRes, pagesRes, valRes, provisioningRes] = await Promise.allSettled([
        apiClient<any>('/storefront/render'),
        apiClient<any>('/storefront/pages'),
        apiClient<any>('/storefront/validate-publish'),
        apiClient<any>('/storefront/provisioning/status')
      ]);

      if (renderRes.status === 'fulfilled' && renderRes.value && renderRes.value.store) {
        setStoreData(renderRes.value);
      } else {
        try {
          const bySlug = await apiClient<any>(`/storefront/by-slug/${storeSlug}`);
          if (bySlug && bySlug.store) setStoreData(bySlug);
        } catch (e) {
          console.warn('Fallback by-slug failed:', e);
        }
      }

      if (pagesRes.status === 'fulfilled' && pagesRes.value?.pages && pagesRes.value.pages.length > 0) {
        const pages = pagesRes.value.pages;
        setPagesCount({
          total: pages.length,
          system: pages.filter((p: any) => p.is_system).length,
          custom: pages.filter((p: any) => !p.is_system).length
        });
      } else setPagesCount({ total: 0, system: 0, custom: 0 });

      if (provisioningRes.status === 'fulfilled') setProvisioning(provisioningRes.value);

      if (valRes.status === 'fulfilled' && valRes.value) {
        setValidation(valRes.value);
      }
    } catch (err) {
      console.error('Failed to load online store overview data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [storeSlug]);

  const liveStoreUrl = getStoreUrl(storeSlug);
  const liveReady = provisioning?.status === 'LIVE' && provisioning?.domainStatus === 'ACTIVE' && provisioning?.httpsStatus === 'ACTIVE';
  const localHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const localSharedPreviewUrl = localHost ? `/store/${encodeURIComponent(storeSlug)}` : null;
  const storefrontUrl = liveReady ? liveStoreUrl : provisioning?.previewUrl || localSharedPreviewUrl;
  const retryProvisioning = async () => {
    setRetrying(true);
    try { await apiClient('/storefront/provisioning/retry', { method: 'POST', body: JSON.stringify({}) }); await loadData(); }
    catch (error) { console.error('Store provisioning retry failed:', error); }
    finally { setRetrying(false); }
  };

  return (
    <div className={styles.overviewContainer}>
      {/* Top Banner & Header */}
      <div className={styles.topBanner}>
        <div className={styles.headerTextGroup}>
          <div className={styles.headerTitleRow}>
            <h1 className={styles.pageTitle}>Online Store</h1>
            <span className={styles.liveBadge} style={!liveReady ? { background: '#fff7ed', color: '#9a3412', borderColor: '#fed7aa' } : undefined}>
              <span className={styles.liveDot} style={!liveReady ? { background: '#d97706' } : undefined} />
              {liveReady ? 'Live · DNS & HTTPS verified' : provisioning?.status === 'LOCAL_READY' ? 'Preview ready · domain pending' : 'Store provisioning'}
            </span>
          </div>
          <p className={styles.pageSubtitle}>
            Manage your customer-facing website, branding, themes, pages, and domain resolution.
          </p>
        </div>

        <div className={styles.headerActions}>
          {!liveReady && <button type="button" onClick={() => void retryProvisioning()} disabled={retrying} className={styles.btnOutline}>
            <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
            <span>{retrying ? 'Checking…' : 'Retry domain check'}</span>
          </button>}
          {storefrontUrl ? <a
            href={storefrontUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.btnOutline}
          >
            <Globe size={16} />
            <span>{liveReady ? 'View Live Store' : 'Open Store Preview'}</span>
            <ExternalLink size={14} style={{ color: '#94a3b8' }} />
          </a> : <button type="button" disabled className={styles.btnOutline} title="Configure the shared storefront preview runtime URL to open a preview here."><Globe size={16} /><span>Preview runtime unavailable</span></button>}
          <button
            onClick={() => navigate('/editor/pages')}
            className={styles.btnPrimary}
          >
            <Edit3 size={16} />
            <span>Open Store Editor</span>
          </button>
        </div>
      </div>

      {/* Primary KPI & Health Cards */}
      <div className={styles.kpiGrid}>
        {/* Domain Status */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Subdomain</span>
            {liveReady ? <ShieldCheck size={16} style={{ color: '#059669' }} /> : <AlertTriangle size={16} style={{ color: '#d97706' }} />}
          </div>
          <div className={styles.kpiValue} title={platformDomain}>
            {platformDomain}
          </div>
          <div className={styles.kpiSub}>
            {liveReady ? <CheckCircle2 size={13} style={{ color: '#059669' }} /> : <Clock size={13} style={{ color: '#d97706' }} />}
            <span className={liveReady ? styles.kpiSuccess : ''}>{liveReady ? 'DNS & HTTPS verified' : provisioning?.error || 'Waiting for DNS and HTTPS verification'}</span>
          </div>
        </div>

        {/* Publication Status */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Publication</span>
            <Clock size={16} style={{ color: '#2563eb' }} />
          </div>
          <div className={styles.kpiValue}>
            {storeData?.releaseNumber ? `Release #${storeData.releaseNumber}` : 'No live release'}
          </div>
          <div className={styles.kpiSub}>
            <span>{storeData?.releaseNumber ? 'Saved release snapshot' : 'Publish your store to create a release'}</span>
          </div>
        </div>

        {/* Active Theme */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Active Theme</span>
            <Palette size={16} style={{ color: '#7c3aed' }} />
          </div>
          <div className={styles.kpiValue} style={{ textTransform: 'capitalize' }}>
            {storeData?.theme?.preset_name || 'Modern'}
          </div>
          <div className={styles.kpiSub}>
            <span>Customizable in Design tab</span>
          </div>
        </div>

        {/* Total Page Catalog */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiLabel}>Page Catalog</span>
            <Layers size={16} style={{ color: '#083e47' }} />
          </div>
          <div className={styles.kpiValue}>
            {pagesCount.total} Pages
          </div>
          <div className={styles.kpiSub}>
            <span>{pagesCount.system} system locked · {pagesCount.custom} custom</span>
          </div>
        </div>
      </div>

      {/* Pre-Publish Checklist & Setup Warnings */}
      <div className={styles.sectionCard}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            <Sparkles size={18} style={{ color: '#d97706' }} />
            Storefront Launch Readiness Checklist
          </h2>
          <button
            onClick={loadData}
            className={styles.refreshBtn}
            title="Refresh status"
          >
            <RefreshCw size={15} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
        </div>

        <div className={styles.checklistGrid}>
          <div className={styles.checklistItem}>
            <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p className={styles.checklistTitle}>Subdomain Provisioned</p>
              <p className={styles.checklistDesc}>Unique tenant store address created and active.</p>
            </div>
          </div>

          <div className={styles.checklistItem}>
            <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p className={styles.checklistTitle}>System Page Catalog Ready</p>
              <p className={styles.checklistDesc}>Commerce, checkout, policies, and account workflows initialized.</p>
            </div>
          </div>

          <div className={styles.checklistItem}>
            {validation.issues.some((i) => i.code === 'INCOMPLETE_POLICIES') ? (
              <AlertTriangle size={18} style={{ color: '#d97706', flexShrink: 0, marginTop: '2px' }} />
            ) : (
              <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            )}
            <div>
              <p className={styles.checklistTitle}>Legal Policy Review</p>
              <p className={styles.checklistDesc}>Review Privacy, Terms, and Refund policies in Pages manager.</p>
            </div>
          </div>

          <div className={styles.checklistItem}>
            <CheckCircle2 size={18} style={{ color: '#059669', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p className={styles.checklistTitle}>Unified Preview Runtime</p>
              <p className={styles.checklistDesc}>Editor and live customer site share real tokens, header, and footer.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className={styles.navGrid}>
        {/* Pages Manager */}
        <div
          onClick={() => navigate('/online-store/pages')}
          className={styles.navCard}
        >
          <div className={`${styles.navIconWrap} ${styles.navIconBlue}`}>
            <Layers size={22} />
          </div>
          <div>
            <h3 className={styles.navCardTitle}>
              Pages Manager
            </h3>
            <p className={styles.navCardDesc}>
              Browse system locked pages, manage custom content pages, duplicate, and edit SEO.
            </p>
          </div>
          <div className={styles.navCardLink}>
            <span>Manage Pages</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Store Editor */}
        <div
          onClick={() => navigate('/editor/pages')}
          className={styles.navCard}
        >
          <div className={`${styles.navIconWrap} ${styles.navIconPurple}`}>
            <Edit3 size={22} />
          </div>
          <div>
            <h3 className={styles.navCardTitle}>
              Visual Store Editor
            </h3>
            <p className={styles.navCardDesc}>
              Four tab experience: Pages, Brand, Design tokens, and Online Store Settings.
            </p>
          </div>
          <div className={styles.navCardLink}>
            <span>Open 4-Tab Editor</span>
            <ArrowRight size={14} />
          </div>
        </div>

        {/* Header & Footer Editor */}
        <div
          onClick={() => navigate('/editor/pages?pageId=header-global')}
          className={styles.navCard}
        >
          <div className={`${styles.navIconWrap} ${styles.navIconGreen}`}>
            <Sliders size={22} />
          </div>
          <div>
            <h3 className={styles.navCardTitle}>
              Header &amp; Footer
            </h3>
            <p className={styles.navCardDesc}>
              Customize universal navigation bars, announcers, columns, and brand badges.
            </p>
          </div>
          <div className={styles.navCardLink}>
            <span>Customize Chrome</span>
            <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnlineStoreOverview;

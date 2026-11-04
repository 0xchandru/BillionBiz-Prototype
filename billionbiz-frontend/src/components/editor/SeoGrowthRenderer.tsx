import React from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore, type PageData } from '../../store/siteStore';
import styles from '../../pages/editor/EditorLayout.module.css';
import {
  Globe, FileText, Search, CheckCircle2, AlertCircle,
  ExternalLink, Eye, Image, Shield,
} from 'lucide-react';

export const SeoGrowthRenderer: React.FC = () => {
  const { seoSection, selectedSeoPageId } = useLandingEditorStore();

  if (seoSection === 'page' && selectedSeoPageId) {
    return <PageSeoView />;
  }

  if (seoSection === 'page') {
    return <PageSeoSelector />;
  }

  return <GlobalSeoView />;
};

// ─── GLOBAL SEO VIEW ───
const GlobalSeoView: React.FC = () => {
  const { settings, updateSettings } = useSiteStore();

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>SEO & Growth — Global SEO</h2>
          <p>These settings apply to all pages unless overridden at the page level.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Column 1: Meta Tags & Social Sharing */}
          <div className={styles.scCol}>
            {/* Global Meta */}
            <div className={styles.scCard}>
              <h3><Globe size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Global Meta</h3>
              <p>Default meta tags for search engines</p>

              <div className={styles.scFormGroup}>
                <label>Site Title</label>
                <input type="text" value={settings.siteTitle || ''} onChange={(e) => updateSettings({ siteTitle: e.target.value })} placeholder="BillionBiz" />
                <span className={styles.scHint}>Appears in browser tabs and search results</span>
              </div>
              <div className={styles.scFormGroup}>
                <label>Default Meta Description</label>
                <textarea rows={3} value={settings.siteDescription || ''} onChange={(e) => updateSettings({ siteDescription: e.target.value })} placeholder="A compelling description of your site" />
                <span className={styles.scCharCount}>{(settings.siteDescription || '').length} of 160 characters</span>
              </div>
              <div className={styles.scFormGroup}>
                <label>Default Keywords</label>
                <input type="text" value={settings.metaKeywords || ''} onChange={(e) => updateSettings({ metaKeywords: e.target.value })} placeholder="keyword1, keyword2, keyword3" />
                <span className={styles.scHint}>Comma-separated keywords</span>
              </div>
              <div className={styles.scFormGroup}>
                <label>Canonical URL</label>
                <input type="url" value={settings.canonicalUrl || ''} onChange={(e) => updateSettings({ canonicalUrl: e.target.value })} placeholder="https://www.yoursite.com" />
              </div>
            </div>

            {/* Social Sharing Defaults */}
            <div className={styles.scCard}>
              <h3><Image size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Social Sharing Defaults</h3>
              <p>Default Open Graph and Twitter Card settings</p>

              <div className={styles.scFormGroup}>
                <label>Default OG Image</label>
                <input type="url" value={settings.ogImageUrl || ''} onChange={(e) => updateSettings({ ogImageUrl: e.target.value })} placeholder="https://..." />
                <span className={styles.scHint}>Recommended: 1200×630px</span>
                {settings.ogImageUrl && (
                  <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={settings.ogImageUrl} alt="OG Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </div>

              <div className={styles.scFormGroup}>
                <label>Twitter Card Type</label>
                <select value={settings.twitterCardType || 'summary_large_image'} onChange={(e) => updateSettings({ twitterCardType: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <option value="summary_large_image">Summary with Large Image</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
            </div>
          </div>

          {/* Column 2: Indexing, Structured Data & Analytics */}
          <div className={styles.scCol}>
            {/* Indexing & Sitemap */}
            <div className={styles.scCard}>
              <h3><Search size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Search Engine Indexing</h3>
              <p>Control how search engines crawl your site</p>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '12px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500, display: 'block' }}>Allow Indexing</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>If disabled, adds noindex/nofollow</span>
                </div>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={settings.allowIndexing !== false} onChange={(e) => updateSettings({ allowIndexing: e.target.checked })} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 500, display: 'block' }}>Enable Sitemap</span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Auto-generate sitemap.xml</span>
                </div>
                <input type="checkbox" style={{ width: '18px', height: '18px' }} checked={settings.enableSitemap !== false} onChange={(e) => updateSettings({ enableSitemap: e.target.checked })} />
              </div>

              <div className={styles.scFormGroup}>
                <label><Shield size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />Custom Robots.txt</label>
                <textarea rows={3} value={settings.customRobots || ''} onChange={(e) => updateSettings({ customRobots: e.target.value })} placeholder="User-agent: *&#10;Allow: /" style={{ fontFamily: 'monospace', fontSize: '12px' }} />
              </div>
            </div>

            {/* Structured Data & Analytics */}
            <div className={styles.scCard}>
              <h3><FileText size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Structured Data &amp; Analytics</h3>
              <p>Rich snippets configuration and tracking codes</p>

              <div className={styles.scFormGroup}>
                <label>Organization Name</label>
                <input type="text" value={settings.orgName || ''} onChange={(e) => updateSettings({ orgName: e.target.value })} placeholder="BillionBiz Inc." />
              </div>
              <div className={styles.scFormGroup}>
                <label>Organization Logo URL</label>
                <input type="url" value={settings.orgLogoUrl || ''} onChange={(e) => updateSettings({ orgLogoUrl: e.target.value })} placeholder="https://..." />
                <span className={styles.scHint}>Logo shown in Google knowledge panels</span>
              </div>

              <div className={styles.scFormGroup}>
                <label>Google Analytics ID</label>
                <input type="text" value={settings.gaId || ''} onChange={(e) => updateSettings({ gaId: e.target.value })} placeholder="G-XXXXXXXXXX" />
              </div>
              <div className={styles.scFormGroup}>
                <label>Search Console Verification</label>
                <input type="text" value={settings.gscVerification || ''} onChange={(e) => updateSettings({ gscVerification: e.target.value })} placeholder="Verification code" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE SEO SELECTOR ───
const PageSeoSelector: React.FC = () => {
  const { pages } = useSiteStore();
  const { setSelectedSeoPageId } = useLandingEditorStore();

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>SEO & Growth — Page SEO</h2>
          <p>Select a page to configure its SEO settings, social cards, and search appearance.</p>
        </div>

        <div style={{ padding: '0 24px 24px', maxWidth: '800px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {pages.map(page => {
              const hasTitle = Boolean(page.seoTitle);
              const hasDesc = Boolean(page.seoDescription);
              const score = (hasTitle ? 40 : 0) + (hasDesc ? 40 : 0) + (page.socialImage ? 20 : 0);
              const scoreColor = score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626';

              return (
                <div
                  key={page.id}
                  onClick={() => setSelectedSeoPageId(page.id)}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', borderRadius: '10px', border: '1px solid var(--border-color)',
                    cursor: 'pointer', transition: 'all 0.12s', background: '#fff',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#93c5fd'; e.currentTarget.style.background = '#f8fafc'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = '#fff'; }}
                >
                  <div>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{page.name}</h4>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#94a3b8' }}>{page.path}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '11px', fontWeight: 700, color: scoreColor,
                      background: score >= 80 ? '#ecfdf5' : score >= 50 ? '#fffbeb' : '#fef2f2',
                      padding: '2px 8px', borderRadius: '10px',
                    }}>
                      {score}%
                    </span>
                    <ExternalLink size={14} color="#94a3b8" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE SEO VIEW ───
const PageSeoView: React.FC = () => {
  const { selectedSeoPageId, setSelectedSeoPageId } = useLandingEditorStore();
  const { pages, updatePageProps } = useSiteStore();
  const page = pages.find(p => p.id === selectedSeoPageId);

  if (!page) return null;

  const updatePage = (updates: Partial<PageData>) => {
    updatePageProps(page.id, updates);
  };

  const hasTitle = Boolean(page.seoTitle);
  const hasDesc = Boolean(page.seoDescription);
  const hasSocialImage = Boolean(page.socialImage);
  const hasCanonical = Boolean(page.canonicalUrl);
  const score = (hasTitle ? 25 : 0) + (hasDesc ? 25 : 0) + (hasSocialImage ? 25 : 0) + (hasCanonical ? 10 : 0) + (page.searchVisibility !== false ? 15 : 0);

  // Google SERP preview
  const serpTitle = page.seoTitle || page.name || 'Untitled Page';
  const serpDesc = page.seoDescription || 'No description provided.';
  const serpUrl = page.canonicalUrl || `https://yourstore.com${page.path}`;

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <button
              onClick={() => setSelectedSeoPageId(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontSize: '13px', fontWeight: 600, padding: '4px 8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              ← All Pages
            </button>
          </div>
          <h2>{page.name} — SEO</h2>
          <p>Configure search engine optimization for this page.</p>
        </div>

        <div className={styles.scGrid}>
          {/* SEO Score */}
          <div className={styles.scCardFull}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <h3 style={{ margin: 0 }}>SEO Score</h3>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>How well optimized this page is for search</p>
              </div>
              <div style={{
                fontSize: '24px', fontWeight: 800, color: score >= 80 ? '#059669' : score >= 50 ? '#d97706' : '#dc2626',
                background: score >= 80 ? '#ecfdf5' : score >= 50 ? '#fffbeb' : '#fef2f2',
                padding: '8px 16px', borderRadius: '12px',
              }}>
                {score}%
              </div>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { label: 'SEO Title', done: hasTitle },
                { label: 'Meta Description', done: hasDesc },
                { label: 'Social Image', done: hasSocialImage },
                { label: 'Canonical URL', done: hasCanonical },
                { label: 'Search Visibility', done: page.searchVisibility !== false },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', background: item.done ? '#f0fdf4' : '#fefce8', borderRadius: '6px' }}>
                  {item.done ? <CheckCircle2 size={14} color="#10b981" /> : <AlertCircle size={14} color="#f59e0b" />}
                  <span style={{ fontSize: '13px', color: item.done ? '#065f46' : '#92400e' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SERP Preview */}
          <div className={styles.scCardFull}>
            <h3><Eye size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }} />Search Preview</h3>
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', marginTop: '8px' }}>
              <div style={{ fontSize: '18px', color: '#1a0dab', fontWeight: 400, marginBottom: '4px', cursor: 'pointer' }}>
                {serpTitle.length > 60 ? serpTitle.slice(0, 60) + '...' : serpTitle}
              </div>
              <div style={{ fontSize: '13px', color: '#006621', marginBottom: '4px' }}>{serpUrl}</div>
              <div style={{ fontSize: '13px', color: '#545454', lineHeight: 1.5 }}>
                {serpDesc.length > 160 ? serpDesc.slice(0, 160) + '...' : serpDesc}
              </div>
            </div>
          </div>

          {/* SEO Fields */}
          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <h3>Page Meta</h3>

              <div className={styles.scFormGroup}>
                <label>SEO Title</label>
                <input type="text" value={page.seoTitle || ''} onChange={(e) => updatePage({ seoTitle: e.target.value })} placeholder={page.name} />
                <span className={styles.scCharCount}>{(page.seoTitle || '').length} of 60 characters</span>
              </div>
              <div className={styles.scFormGroup}>
                <label>Meta Description</label>
                <textarea rows={3} value={page.seoDescription || ''} onChange={(e) => updatePage({ seoDescription: e.target.value })} placeholder="A compelling page description" />
                <span className={styles.scCharCount}>{(page.seoDescription || '').length} of 160 characters</span>
              </div>
              <div className={styles.scFormGroup}>
                <label>URL / Slug</label>
                <input type="text" value={page.path || ''} onChange={(e) => updatePage({ path: e.target.value })} />
              </div>
              <div className={styles.scFormGroup}>
                <label>Canonical URL</label>
                <input type="url" value={page.canonicalUrl || ''} onChange={(e) => updatePage({ canonicalUrl: e.target.value })} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <h3>Indexing Controls</h3>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', border: '1px solid var(--border-color)', borderRadius: '6px', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: 500 }}>Search Visibility (Index)</span>
                <input type="checkbox" checked={page.searchVisibility !== false} onChange={(e) => updatePage({ searchVisibility: e.target.checked })} style={{ width: '16px', height: '16px' }} />
              </div>
            </div>

            {/* Social Image */}
            <div className={styles.scCard} style={{ marginTop: '16px' }}>
              <h3>Social Image</h3>
              <p>Image shown when shared on social media</p>

              <div className={styles.scFormGroup}>
                <input type="url" value={page.socialImage || ''} onChange={(e) => updatePage({ socialImage: e.target.value })} placeholder="https://..." />
                {page.socialImage && (
                  <div style={{ marginTop: '8px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={page.socialImage} alt="Social Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

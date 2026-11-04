import React, { useMemo, useState } from 'react';
import {
  ChevronRight, Search, Share2, Globe2, FileText,
  ExternalLink, Eye, EyeOff, CheckCircle2
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { useAuthStore } from '../../../store/authStore';
import { getHomePage, resolveEditorPage } from '../utils/pageIdentity';
import styles from '../../../pages/editor/EditorLayout.module.css';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #d8dee8',
  borderRadius: 8,
  padding: '10px 11px',
  color: '#0f172a',
  background: '#fff',
  fontSize: 13,
  outline: 'none'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: '#475569',
  fontSize: 11,
  fontWeight: 650
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 11,
  background: '#fff',
  padding: 14,
  marginBottom: 12
};

export const GrowthRightPanel: React.FC = () => {
  const { brandSection, closeRightSidebar, selectedPageId, setSelectedPageId } = useLandingEditorStore();
  const { settings, updateSettings, pages, updatePageProps } = useSiteStore();
  const { storeName, storeSlug } = useAuthStore();
  const seoDefaults = settings.seoDefaults || {};
  const page = resolveEditorPage(pages, selectedPageId) || getHomePage(pages) || pages[0];
  const [pageSelector, setPageSelector] = useState(page?.id || '');
  const section = brandSection || 'global-seo';

  const sectionTitle = section === 'social-sharing' ? 'Social previews'
    : section === 'indexing' ? 'Indexing & sitemap'
    : section === 'page-seo' ? 'Page metadata'
    : 'Search appearance';

  const updateSeo = (key: string, value: any) => {
    updateSettings({
      seoDefaults: {
        ...seoDefaults,
        [key]: value
      }
    });
  };

  const selectedPage = useMemo(
    () => pages.find((item) => item.id === pageSelector) || page,
    [pages, pageSelector, page]
  );

  const storeTitle = storeName || settings.storeName || 'Your store';
  const titleTemplate = seoDefaults.titleTemplate || '{page} · {store}';
  const previewTitle = titleTemplate.replace('{page}', selectedPage?.name || 'Home').replace('{store}', storeTitle);
  const previewDescription = seoDefaults.metaDescription || selectedPage?.seoDescription || 'Add a short description to help customers understand your store.';

  const updatePageSeo = (patch: Record<string, any>) => {
    if (!selectedPage) return;
    updatePageProps(selectedPage.id, patch);
  };

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px' }}>
        <div className={styles.phLeft} style={{ gap: 8 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close panel">
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: 15 }}>{sectionTitle}</h3>
        </div>
      </div>

      <div className={styles.propContent} style={{ padding: 16, overflowY: 'auto' }}>
        {section === 'global-seo' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <Search size={16} /> Default search metadata
              </div>
              <label style={labelStyle}>Title template</label>
              <input style={fieldStyle} value={titleTemplate} maxLength={120} onChange={(event) => updateSeo('titleTemplate', event.target.value)} />
              <p style={{ margin: '5px 0 12px', color: '#64748b', fontSize: 10 }}>Use {'{page}'} for the current page name and {'{store}'} for your store name.</p>
              <label style={labelStyle}>Default meta description</label>
              <textarea style={{ ...fieldStyle, minHeight: 92, resize: 'vertical' }} value={seoDefaults.metaDescription || ''} maxLength={320} onChange={(event) => updateSeo('metaDescription', event.target.value)} placeholder="Describe what customers can find in your store." />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 5, color: '#94a3b8', fontSize: 10 }}>
                <span>Used when a page has no custom description</span>
                <span>{(seoDefaults.metaDescription || '').length}/320</span>
              </div>
              <label style={{ ...labelStyle, marginTop: 14 }}>Default keywords</label>
              <input style={fieldStyle} value={seoDefaults.keywords || ''} onChange={(event) => updateSeo('keywords', event.target.value)} placeholder="Separate terms with commas" />
              <label style={{ ...labelStyle, marginTop: 14 }}>Canonical base URL</label>
              <input style={fieldStyle} value={seoDefaults.canonicalBase || ''} onChange={(event) => updateSeo('canonicalBase', event.target.value)} placeholder={storeSlug ? `https://${storeSlug}.chandraprakash.codes` : 'https://your-domain.com'} />
            </div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <Eye size={15} /> Search result preview
              </div>
              <div style={{ color: '#1d4ed8', fontSize: 14, lineHeight: 1.35, fontWeight: 600 }}>{previewTitle}</div>
              <div style={{ color: '#15803d', fontSize: 10, margin: '4px 0' }}>{seoDefaults.canonicalBase || (storeSlug ? `${storeSlug}.chandraprakash.codes` : 'your-store-domain')}</div>
              <p style={{ margin: 0, color: '#475569', fontSize: 11, lineHeight: 1.5 }}>{previewDescription}</p>
            </div>
          </>
        )}

        {section === 'social-sharing' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <Share2 size={16} /> Social sharing image
              </div>
              <label style={labelStyle}>Default Open Graph image URL</label>
              <input style={fieldStyle} value={seoDefaults.socialImage || ''} onChange={(event) => updateSeo('socialImage', event.target.value)} placeholder="https://… or uploaded asset path" />
              {seoDefaults.socialImage && <img src={seoDefaults.socialImage} alt="Social preview" style={{ display: 'block', width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, marginTop: 10 }} />}
              <p style={{ margin: '10px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>Use a 1200 × 630 image for consistent link previews. Page-specific social images can override this default when that workflow is enabled.</p>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Share card text</div>
              <strong style={{ display: 'block', fontSize: 13, color: '#0f172a' }}>{previewTitle}</strong>
              <p style={{ margin: '5px 0 0', fontSize: 11, lineHeight: 1.5, color: '#64748b' }}>{previewDescription}</p>
            </div>
          </>
        )}

        {section === 'indexing' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <Globe2 size={16} /> Search engine visibility
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: 12, color: '#334155' }}>
                <span>
                  <strong style={{ display: 'block' }}>Allow search indexing</strong>
                  <span style={{ display: 'block', marginTop: 3, color: '#64748b', fontSize: 10 }}>When disabled, the storefront emits a noindex directive.</span>
                </span>
                <input type="checkbox" checked={seoDefaults.allowIndexing !== false} onChange={(event) => updateSeo('allowIndexing', event.target.checked)} />
              </label>
              <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 14, paddingTop: 12 }}>
                <div style={{ fontSize: 11, color: '#475569', fontWeight: 650 }}>Storefront status</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6, fontSize: 11, color: seoDefaults.allowIndexing === false ? '#b45309' : '#15803d' }}>
                  {seoDefaults.allowIndexing === false ? <EyeOff size={14} /> : <CheckCircle2 size={14} />}
                  {seoDefaults.allowIndexing === false ? 'Search indexing disabled by your setting' : 'Search indexing allowed by your setting'}
                </div>
              </div>
            </div>
            <div style={cardStyle}>
              <strong style={{ display: 'block', fontSize: 12, marginBottom: 6 }}>Important</strong>
              <p style={{ margin: 0, fontSize: 11, lineHeight: 1.5, color: '#64748b' }}>
                This controls the storefront robots directive. Search engines choose when to crawl and index pages; enabling indexing does not guarantee ranking or inclusion.
              </p>
            </div>
          </>
        )}

        {section === 'page-seo' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <FileText size={16} /> Page-specific metadata
              </div>
              <label style={labelStyle}>Page</label>
              <select style={fieldStyle} value={selectedPage?.id || ''} onChange={(event) => {
                setPageSelector(event.target.value);
                setSelectedPageId(event.target.value);
              }}>
                {pages.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.path}</option>)}
              </select>
              {selectedPage && (
                <>
                  <label style={{ ...labelStyle, marginTop: 12 }}>SEO title</label>
                  <input style={fieldStyle} value={selectedPage.seoTitle || ''} maxLength={70} onChange={(event) => updatePageSeo({ seoTitle: event.target.value })} placeholder={selectedPage.name} />
                  <div style={{ textAlign: 'right', marginTop: 4, fontSize: 10, color: '#94a3b8' }}>{(selectedPage.seoTitle || '').length}/70</div>
                  <label style={{ ...labelStyle, marginTop: 12 }}>Meta description</label>
                  <textarea style={{ ...fieldStyle, minHeight: 94, resize: 'vertical' }} value={selectedPage.seoDescription || ''} maxLength={320} onChange={(event) => updatePageSeo({ seoDescription: event.target.value })} placeholder="Explain what this page contains." />
                  <div style={{ textAlign: 'right', marginTop: 4, fontSize: 10, color: '#94a3b8' }}>{(selectedPage.seoDescription || '').length}/320</div>
                </>
              )}
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 7 }}>Preview</div>
              <strong style={{ color: '#1d4ed8', fontSize: 13 }}>{selectedPage?.seoTitle || selectedPage?.name || 'Page title'}</strong>
              <p style={{ margin: '6px 0 0', color: '#475569', fontSize: 11, lineHeight: 1.5 }}>{selectedPage?.seoDescription || 'This page will inherit the default description until you add a page-specific one.'}</p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default GrowthRightPanel;

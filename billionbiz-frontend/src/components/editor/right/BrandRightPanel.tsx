import React from 'react';
import { ChevronRight, Sparkles, CheckCircle2, Image, Search } from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import styles from '../../../pages/editor/EditorLayout.module.css';

export const BrandRightPanel: React.FC = () => {
  const { brandSection, storeBrandSection, closeRightSidebar } = useLandingEditorStore();
  const { settings } = useSiteStore();

  const section = brandSection || storeBrandSection || 'store-profile';

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px' }}>
        <div className={styles.phLeft} style={{ gap: '8px' }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close Panel">
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: '15px' }}>
            Brand Insights &amp; Tips
          </h3>
        </div>
      </div>

      <div className={styles.propContent} style={{ padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Section Context Card */}
        {(section === 'store-profile' || section === 'general') && (
          <>
            <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#4f46e5', fontWeight: 600, fontSize: '13px' }}>
                <Sparkles size={16} />
                <span>Store Profile Tips</span>
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5, margin: 0 }}>
                Keep your store name punchy (1–3 words). A memorable tagline clearly tells shoppers what value you provide in under 8 words.
              </p>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', background: '#ffffff' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginBottom: '10px' }}>
                Profile Completeness
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: settings.storeName ? '#16a34a' : '#94a3b8' }}>
                  <CheckCircle2 size={14} />
                  <span>Store Name Defined</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: settings.tagline ? '#16a34a' : '#94a3b8' }}>
                  <CheckCircle2 size={14} />
                  <span>Tagline Added</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: settings.supportEmail ? '#16a34a' : '#94a3b8' }}>
                  <CheckCircle2 size={14} />
                  <span>Support Email Configured</span>
                </div>
              </div>
            </div>
          </>
        )}

        {(section === 'logo-favicon' || section === 'branding') && (
          <>
            <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#16a34a', fontWeight: 600, fontSize: '13px' }}>
                <Image size={16} />
                <span>Asset Dimension Guidelines</span>
              </div>
              <ul style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6, margin: 0, paddingLeft: '16px' }}>
                <li><strong>Primary Logo:</strong> 250×60px transparent PNG or SVG</li>
                <li><strong>Browser Favicon:</strong> 32×32px or 64×64px PNG/ICO</li>
                <li><strong>Social Share (OG):</strong> 1200×630px high resolution JPG/PNG</li>
              </ul>
            </div>
          </>
        )}

        {(section === 'whatsapp') && (
          <>
            <div style={{ padding: '14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#16a34a', fontWeight: 600, fontSize: '13px' }}>
                <Sparkles size={16} />
                <span>WhatsApp Conversion Power</span>
              </div>
              <p style={{ fontSize: '12px', color: '#334155', lineHeight: 1.5, margin: 0 }}>
                Direct WhatsApp chat buttons increase direct sales queries by up to 34%. A friendly pre-filled greeting helps customers start conversations with zero hesitation.
              </p>
            </div>
          </>
        )}

        {(section === 'global-seo' || section === 'seo' || section === 'social-sharing' || section === 'indexing') && (
          <>
            <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', color: '#1d4ed8', fontWeight: 600, fontSize: '13px' }}>
                <Search size={16} />
                <span>Google Search Best Practices</span>
              </div>
              <ul style={{ fontSize: '12px', color: '#334155', lineHeight: 1.6, margin: 0, paddingLeft: '16px' }}>
                <li><strong>Title:</strong> Under 60 characters for zero truncation</li>
                <li><strong>Meta Description:</strong> 120–160 characters with clear call-to-action</li>
                <li><strong>Keywords:</strong> 3–5 targeted search terms relevant to products</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

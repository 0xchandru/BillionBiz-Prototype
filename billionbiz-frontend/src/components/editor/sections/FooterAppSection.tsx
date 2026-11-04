// ============================================================
// FOOTER APP DOWNLOAD SECTION (Footer Stack Section #5)
// Supports 10 Looks: Simple CTA, Split Promo, Phone Mockup,
// QR Badges, Large Banner, Dark Promo, Benefits, Compact Strip, etc.
// Fully responsive with global palette inheritance.
// ============================================================

import React from 'react';
import { Smartphone, QrCode, Apple, Play, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterAppSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterAppSection: React.FC<FooterAppSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;
  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'app' || r.id === props.rowId || r.id === 'row-app' || r.id?.includes('app')
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const lookId = layout.variantId || 'simple-app-cta';
  const heading = elProps.heading || 'Get the Mobile Experience';
  const subtitle = elProps.subtitle || 'Shop exclusive app-only drops, track packages in real time, and enjoy 1-click checkout.';
  const appStoreUrl = elProps.appStoreUrl || '#';
  const googlePlayUrl = elProps.googlePlayUrl || '#';
  const qrEnabled = elProps.qrEnabled !== false && ['qr-app-badges', 'split-app-promo', 'custom-app'].includes(lookId);

  const bgColor = styling.bgColor || (lookId === 'large-app-banner' ? '#1e1b4b' : lookId === 'dark-app-promo' ? '#0f172a' : 'var(--theme-bg-surface, #f8fafc)');
  const textColor = styling.textColor || (['large-app-banner', 'dark-app-promo'].includes(lookId) ? '#f8fafc' : 'var(--theme-text-heading, #0f172a)');
  const borderColor = styling.borderColor || 'var(--theme-border-divider, #e2e8f0)';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-app');

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-app');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-app'));
        store.setEditorType('footer');
      }
      if (activeRow) {
        selectTarget({ type: 'row', editorType: 'footer', rowId: activeRow.id });
        setSelectedSectionId(activeRow.id);
        setRightSidebarOpen(true);
      }
    };

    if (selectedPageId !== 'footer-global') {
      requestEditorSwitch({
        targetPageId: 'footer-global',
        targetSectionId: activeRow?.id || 'footer-app',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isMobile = device === 'mobile';

  return (
    <section
      id={activeRow?.id || 'footer-row-app'}
      data-section-type="FooterApp"
      data-footer-row-type="app"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 36}px`,
        paddingBottom: `${layout.paddingY ?? 36}px`,
        paddingLeft: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        color: textColor,
      }}
    >
      <div
        style={{
          maxWidth: layout.container === 'full' ? '100%' : '1200px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: isMobile ? 'column' : (lookId === 'split-app-promo' || lookId === 'app-benefits' ? 'row' : 'column'),
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: isMobile ? '24px' : '32px',
          textAlign: (lookId === 'split-app-promo' || lookId === 'app-benefits') && !isMobile ? 'left' : 'center',
        }}
      >
        {/* App Info Box */}
        <div style={{ flex: 1, maxWidth: isMobile ? '100%' : '640px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: 'rgba(99, 102, 241, 0.1)', color: '#6366f1', borderRadius: '16px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '10px' }}>
            <Smartphone size={12} />
            <span>Mobile App</span>
          </div>

          <h3 style={{ fontSize: isMobile ? '20px' : '26px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.02em', color: textColor }}>
            {heading}
          </h3>

          <p style={{ fontSize: '14px', lineHeight: 1.6, opacity: 0.85, margin: '0 0 20px 0' }}>
            {subtitle}
          </p>

          {/* Benefits bullets if look is app-benefits */}
          {lookId === 'app-benefits' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '0 0 24px 0' }}>
              {['Live package GPS tracking & instant push notifications', 'Exclusive 15% VIP app-only welcome discount', 'Biometric instant Apple Pay and Google Pay'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          )}

          {/* Download Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: (lookId === 'split-app-promo' || lookId === 'app-benefits') && !isMobile ? 'flex-start' : 'center' }}>
            <a
              href={appStoreUrl}
              onClick={(e) => isEditorInteractive && e.preventDefault()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 18px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Apple size={22} color="#ffffff" />
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' }}>Download on the</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>App Store</div>
              </div>
            </a>

            <a
              href={googlePlayUrl}
              onClick={(e) => isEditorInteractive && e.preventDefault()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 18px',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '8px',
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                transition: 'transform 0.15s ease',
              }}
            >
              <Play size={20} color="#ffffff" fill="#ffffff" />
              <div style={{ textAlign: 'left', lineHeight: 1.15 }}>
                <div style={{ fontSize: '10px', opacity: 0.8, textTransform: 'uppercase' }}>Get it on</div>
                <div style={{ fontSize: '14px', fontWeight: 700 }}>Google Play</div>
              </div>
            </a>
          </div>
        </div>

        {/* QR Code or Mockup Flank */}
        {(qrEnabled || lookId === 'phone-mockup') && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 20px',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
            }}
          >
            <div
              style={{
                width: '110px',
                height: '110px',
                backgroundColor: '#f1f5f9',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
              }}
            >
              <QrCode size={80} color="#0f172a" />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', marginTop: '8px' }}>
              Scan to install
            </span>
          </div>
        )}
      </div>
    </section>
  );
};

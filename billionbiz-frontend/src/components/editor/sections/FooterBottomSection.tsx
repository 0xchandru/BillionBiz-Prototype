import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Globe,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterBottomSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

// Payment method badge SVG icons
const PaymentBadgeIcon: React.FC<{ provider: string }> = ({ provider }) => {
  const p = provider.toLowerCase();
  switch (p) {
    case 'visa':
      return (
        <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '13px', color: '#1a1f71', letterSpacing: '0.04em' }}>
          VISA
        </span>
      );
    case 'mastercard':
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#eb001b', display: 'inline-block' }} />
          <span style={{ width: '13px', height: '13px', borderRadius: '50%', backgroundColor: '#f79e1b', display: 'inline-block', marginLeft: '-6px', opacity: 0.9 }} />
        </div>
      );
    case 'amex':
    case 'american-express':
      return (
        <span style={{ fontWeight: 800, fontSize: '10px', color: '#006fcf', letterSpacing: '0.05em' }}>
          AMEX
        </span>
      );
    case 'paypal':
      return (
        <span style={{ fontWeight: 800, fontSize: '12px', color: '#003087', letterSpacing: '-0.02em' }}>
          Pay<span style={{ color: '#0079c1' }}>Pal</span>
        </span>
      );
    case 'apple-pay':
    case 'applepay':
      return (
        <span style={{ fontWeight: 700, fontSize: '11px', color: '#000000', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
          Pay
        </span>
      );
    case 'google-pay':
    case 'googlepay':
      return (
        <span style={{ fontWeight: 700, fontSize: '11px', color: '#5f6368' }}>
          G<span style={{ color: '#ea4335' }}>P</span>ay
        </span>
      );
    case 'klarna':
      return (
        <span style={{ fontWeight: 800, fontSize: '11px', color: '#ffb3c7', padding: '1px 4px', borderRadius: '3px', background: '#0a0a0a' }}>
          Klarna.
        </span>
      );
    case 'shop-pay':
    case 'shoppay':
      return (
        <span style={{ fontWeight: 800, fontSize: '11px', color: '#5a31f4' }}>
          shop<span style={{ color: '#000' }}>Pay</span>
        </span>
      );
    default:
      return (
        <span style={{ fontSize: '10.5px', fontWeight: 600, textTransform: 'uppercase' }}>
          {provider}
        </span>
      );
  }
};

export const FooterBottomSection: React.FC<FooterBottomSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'legal' || r.type === 'payment' || r.id === props.rowId || r.id === 'row-bottom-legal'
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};

  // Find copyright element, policy links element, payment methods element
  const elements = (activeRow?.columns || []).flatMap((c) => c.elements) || [];
  const copyrightEl: any = elements.find((e) => e.type === 'copyright');
  const policyEl: any = elements.find((e) => e.type === 'policy-links');
  const paymentEl: any = elements.find((e) => e.type === 'payment-methods');

  const currentYear = new Date().getFullYear();
  const rawCopyright =
    copyrightEl?.props?.text || props.copyright || '© {year} BillionBiz Technologies Inc. All rights reserved.';
  const copyrightText = rawCopyright.replace('{year}', String(currentYear));

  const policyLinks = policyEl?.props?.links || [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Cookie Settings', href: '#cookies' },
    { label: 'Refund Policy', href: '/refund' },
  ];

  const paymentProviders = paymentEl?.props?.methods?.filter((m: any) => m.enabled !== false).map((m: any) => m.id || m.name) || [
    'visa',
    'mastercard',
    'apple-pay',
    'google-pay',
    'paypal',
    'klarna',
  ];

  const showBackToTop = store.footerSettings?.backToTop !== false;

  // Localization interactive switcher popover state
  const [isLocalePickerOpen, setIsLocalePickerOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD ($)');
  const [selectedLanguage, setSelectedLanguage] = useState('English (US)');

  const bgColor = styling.bgColor || 'var(--theme-footer-bg, #090d16)';
  const textColor = styling.textColor || 'var(--theme-footer-muted, #94a3b8)';
  const borderColor = styling.borderColor || 'rgba(255, 255, 255, 0.1)';
  const containerMode = layout.container || 'constrained';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-bottom-legal');

  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-bottom');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-bottom'));
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
        targetSectionId: activeRow?.id || 'footer-bottom',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleBackToTop = () => {
    const scrollContainer =
      document.getElementById('editor-preview-scroll-container') ||
      document.querySelector('[data-preview-scroll-container="true"]');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const isMobile = device === 'mobile';

  return (
    <div
      id={activeRow?.id || 'footer-row-bottom'}
      data-section-type="FooterBottom"
      data-footer-row-type="legal"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTop: `1px solid ${borderColor}`,
        paddingTop: `${layout.paddingY ?? 24}px`,
        paddingBottom: `${layout.paddingY ?? 24}px`,
        paddingLeft: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        fontSize: '12px',
        position: 'relative',
      }}
    >
      <div
        className={
          containerMode === 'boxed'
            ? styles.containerBoxed
            : containerMode === 'full'
            ? styles.containerFull
            : styles.containerConstrained
        }
      >
        <div
          className={styles.bottomBarFlex}
          style={{
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '18px' : '20px',
          }}
        >
          {/* Left: Copyright & Policy Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <span>{copyrightText}</span>
              <a
                href="https://billionbiz.in"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: 'inherit',
                  textDecoration: 'none',
                  fontWeight: 600,
                  opacity: 0.85,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <span>⚡ Powered by BillionBiz</span>
              </a>
            </div>

            <div className={styles.policyLinksRow}>
              {policyLinks.map((link: any, idx: number) => (
                <a
                  key={idx}
                  href={link.href || '#'}
                  onClick={(e) => {
                    if (isEditorInteractive) e.preventDefault();
                  }}
                  className={styles.policyLinkItem}
                  style={{ color: textColor }}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* Right: Payment Badges & Localization & Back to top */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px',
              width: isMobile ? '100%' : 'auto',
              justifyContent: isMobile ? 'space-between' : 'flex-end',
            }}
          >
            {/* Accepted Payments */}
            {paymentProviders.length > 0 && (
              <div className={styles.paymentBadgesRow}>
                {paymentProviders.map((provider: string, idx: number) => (
                  <div
                    key={idx}
                    className={styles.paymentBadgeItem}
                    style={{
                      height: '24px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                    }}
                    title={provider}
                  >
                    <PaymentBadgeIcon provider={provider} />
                  </div>
                ))}
              </div>
            )}

            {/* Interactive Currency / Region Selector */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLocalePickerOpen((o) => !o);
                }}
                className={styles.backToTopBtn}
                style={{
                  color: textColor,
                  borderColor: 'rgba(255, 255, 255, 0.18)',
                }}
              >
                <Globe size={13} />
                <span>{selectedCurrency} / {selectedLanguage.split(' ')[0]}</span>
                <ChevronDown size={12} />
              </button>

              {isLocalePickerOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    right: 0,
                    marginBottom: '8px',
                    width: '240px',
                    padding: '14px',
                    backgroundColor: '#1e293b',
                    color: '#ffffff',
                    border: '1px solid #334155',
                    borderRadius: '10px',
                    boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
                    zIndex: 100,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#94a3b8' }}>
                      Localization
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLocalePickerOpen(false)}
                      style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                      Currency
                    </label>
                    <select
                      value={selectedCurrency}
                      onChange={(e) => setSelectedCurrency(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    >
                      <option value="USD ($)">USD - US Dollar ($)</option>
                      <option value="EUR (€)">EUR - Euro (€)</option>
                      <option value="GBP (£)">GBP - British Pound (£)</option>
                      <option value="INR (₹)">INR - Indian Rupee (₹)</option>
                      <option value="CAD ($)">CAD - Canadian Dollar ($)</option>
                      <option value="AUD ($)">AUD - Australian Dollar ($)</option>
                      <option value="JPY (¥)">JPY - Japanese Yen (¥)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: '#cbd5e1', display: 'block', marginBottom: '4px' }}>
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        backgroundColor: '#0f172a',
                        border: '1px solid #475569',
                        borderRadius: '6px',
                        color: '#ffffff',
                        fontSize: '12px',
                        outline: 'none',
                      }}
                    >
                      <option value="English (US)">English (US)</option>
                      <option value="Spanish (ES)">Español (ES)</option>
                      <option value="French (FR)">Français (FR)</option>
                      <option value="German (DE)">Deutsch (DE)</option>
                      <option value="Japanese (JA)">日本語 (JA)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Back to top button */}
            {showBackToTop && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleBackToTop();
                }}
                className={styles.backToTopBtn}
                title="Scroll back to top"
                style={{
                  color: textColor,
                  borderColor: 'rgba(255, 255, 255, 0.2)',
                }}
              >
                <ChevronUp size={14} />
                <span>Top</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FooterBottomSection;

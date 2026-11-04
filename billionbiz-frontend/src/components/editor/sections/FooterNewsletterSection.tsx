import React, { useState } from 'react';
import {
  Mail,
  CheckCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterNewsletterSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterNewsletterSection: React.FC<FooterNewsletterSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'newsletter' || r.id === props.rowId
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  // Interactive Form State in Canvas
  const [emailInput, setEmailInput] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hasCopiedCode, setHasCopiedCode] = useState(false);
  const [consentChecked, setConsentChecked] = useState(true);

  const headline = elProps.title || elProps.headline || 'Join Our VIP Insider Club';
  const description =
    elProps.subtitle ||
    elProps.description ||
    'Unlock 15% off your first purchase, secret sales, and weekly design drops.';
  const placeholder = elProps.placeholder || 'Enter your email address...';
  const buttonText = elProps.buttonText || 'Subscribe';
  const discountCode = elProps.discountCode || 'WELCOME15';
  const showConsent = elProps.showConsent !== false;
  const consentText =
    elProps.consentText || 'By subscribing you agree to our Terms of Service & Privacy Policy.';

  const bgColor = styling.bgColor || 'var(--theme-bg-surface, #0f172a)';
  const textColor = styling.textColor || '#ffffff';
  const borderColor = styling.borderColor || 'rgba(255, 255, 255, 0.12)';
  const accentColor = 'var(--theme-primary, #6366f1)';
  const containerMode = layout.container || 'constrained';

  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    selectedTarget.rowId === activeRow?.id;

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-newsletter');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-newsletter'));
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
        targetSectionId: activeRow?.id || 'footer-newsletter',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    setIsSubscribed(true);
  };

  const handleCopyCode = () => {
    navigator.clipboard?.writeText(discountCode);
    setHasCopiedCode(true);
    setTimeout(() => setHasCopiedCode(false), 2500);
  };

  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  return (
    <section
      id={activeRow?.id || 'footer-row-newsletter'}
      data-section-type="FooterNewsletter"
      data-footer-row-type="newsletter"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 48}px`,
        paddingBottom: `${layout.paddingY ?? 48}px`,
        paddingLeft: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
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
          onClick={handleRowClick}
          className={styles.newsletterHeroCard}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: `1px solid ${borderColor}`,
            display: 'flex',
            flexDirection: isMobile || isTablet ? 'column' : 'row',
            alignItems: isMobile || isTablet ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '24px' : '40px',
          }}
        >
          {/* Left Column: Heading & Incentive */}
          <div style={{ maxWidth: isMobile || isTablet ? '100%' : '520px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                borderRadius: '999px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: '#818cf8',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}
            >
              <Sparkles size={12} /> Special Welcome Privilege
            </div>
            <h3
              style={{
                margin: '0 0 8px 0',
                fontSize: isMobile ? '22px' : '26px',
                fontWeight: 800,
                lineHeight: 1.25,
                color: textColor,
                letterSpacing: '-0.02em',
              }}
            >
              {headline}
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: '14px',
                opacity: 0.8,
                lineHeight: 1.55,
              }}
            >
              {description}
            </p>
          </div>

          {/* Right Column: Form or Success */}
          <div style={{ width: isMobile || isTablet ? '100%' : '440px', flexShrink: 0 }}>
            {isSubscribed ? (
              <div className={styles.newsletterSuccessBanner}>
                <CheckCircle size={20} color="#059669" style={{ flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>
                    Welcome to the club!
                  </div>
                  <div style={{ fontSize: '12.5px', opacity: 0.9 }}>
                    Your coupon code is ready to use:
                  </div>
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      background: '#ffffff',
                      border: '1px dashed #059669',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#065f46',
                      cursor: 'pointer',
                    }}
                    onClick={handleCopyCode}
                  >
                    <span>{discountCode}</span>
                    {hasCopiedCode ? <Check size={14} color="#059669" /> : <Copy size={13} color="#059669" />}
                    <span style={{ fontSize: '11px', fontWeight: 600 }}>
                      {hasCopiedCode ? 'Copied!' : 'Click to copy'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubscribed(false);
                    setEmailInput('');
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#059669',
                    fontSize: '11px',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Reset
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div className={styles.newsletterInputWrapper}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: 'rgba(255, 255, 255, 0.45)',
                      pointerEvents: 'none',
                      display: 'flex',
                    }}
                  >
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder={placeholder}
                    className={styles.newsletterInput}
                    style={{
                      paddingLeft: '40px',
                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: textColor,
                    }}
                    required
                  />
                  <button
                    type="submit"
                    className={styles.newsletterSubmitBtn}
                    style={{
                      backgroundColor: accentColor,
                      color: '#ffffff',
                    }}
                  >
                    <span>{buttonText}</span>
                    <ArrowRight size={15} />
                  </button>
                </div>

                {showConsent && (
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      fontSize: '11.5px',
                      opacity: 0.65,
                      cursor: 'pointer',
                      userSelect: 'none',
                      lineHeight: 1.4,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={consentChecked}
                      onChange={(e) => setConsentChecked(e.target.checked)}
                      style={{ marginTop: '2px', accentColor }}
                    />
                    <span>{consentText}</span>
                  </label>
                )}
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterNewsletterSection;

// ============================================================
// FOOTER PAYMENT & SECURITY SECTION (Footer Stack Section #7)
// Supports 10 Looks: Payment Logos, Payment + Security, Security Badges,
// Trust Message, Compact Strip, Centered, Dark Security, Cards, COD, etc.
// Fully responsive with global palette inheritance.
// ============================================================

import React from 'react';
import { Lock, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterPaymentSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

const PAYMENT_PROVIDERS = [
  { id: 'visa', label: 'Visa', color: '#1a1f71', bg: '#f1f5f9' },
  { id: 'mastercard', label: 'Mastercard', color: '#eb001b', bg: '#fef2f2' },
  { id: 'amex', label: 'AMEX', color: '#006fcf', bg: '#eff6ff' },
  { id: 'paypal', label: 'PayPal', color: '#003087', bg: '#eff6ff' },
  { id: 'applepay', label: 'Apple Pay', color: '#000000', bg: '#f1f5f9' },
  { id: 'googlepay', label: 'Google Pay', color: '#4285f4', bg: '#f8fafc' },
  { id: 'klarna', label: 'Klarna', color: '#ffb3c7', bg: '#fdf2f8' },
];

export const FooterPaymentSection: React.FC<FooterPaymentSectionProps> = ({
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
    (r) => r.type === 'payment' || r.id === props.rowId || r.id === 'row-payment' || r.id?.includes('payment')
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const lookId = layout.variantId || 'payment-logos';
  const showSecurity = ['payment-security', 'security-badge-row', 'dark-security-section'].includes(lookId);
  const showCOD = lookId === 'payment-cod' || elProps.showCOD === true;

  const bgColor = styling.bgColor || (lookId === 'dark-security-section' ? '#090d16' : 'var(--theme-bg-surface, #ffffff)');
  const textColor = styling.textColor || (lookId === 'dark-security-section' ? '#f8fafc' : 'var(--theme-text-heading, #0f172a)');
  const borderColor = styling.borderColor || 'var(--theme-border-divider, #e2e8f0)';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-payment');

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-payment');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-payment'));
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
        targetSectionId: activeRow?.id || 'footer-payment',
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
      id={activeRow?.id || 'footer-row-payment'}
      data-section-type="FooterPayment"
      data-footer-row-type="payment"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 22}px`,
        paddingBottom: `${layout.paddingY ?? 22}px`,
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
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: lookId === 'centered-payment-section' ? 'center' : 'space-between',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {/* Security Message / Trust Tag */}
        {showSecurity && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
            <Lock size={15} color="#10b981" />
            <span>256-Bit Bank Grade SSL Encrypted Checkout</span>
          </div>
        )}

        {/* COD Indicator */}
        {showCOD && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', backgroundColor: '#ecfdf5', color: '#047857', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
            <Banknote size={15} />
            <span>Cash on Delivery (COD) Available</span>
          </div>
        )}

        {/* Payment Gateways Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PAYMENT_PROVIDERS.map((p) => (
            <div
              key={p.id}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '4px 10px',
                borderRadius: '5px',
                border: '1px solid #e2e8f0',
                backgroundColor: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                color: p.color,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                letterSpacing: '0.02em',
              }}
            >
              {p.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

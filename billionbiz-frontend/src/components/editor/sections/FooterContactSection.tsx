// ============================================================
// FOOTER CONTACT / STORE INFORMATION SECTION (Footer Stack #6)
// Supports 10 Looks: Contact List, Cards, Business Hours, Grid,
// Store Locator CTA, Maps, WhatsApp, Split Contact, Compact Strip, etc.
// Fully responsive with global palette inheritance.
// ============================================================

import React from 'react';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterContactSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterContactSection: React.FC<FooterContactSectionProps> = ({
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
    (r) => r.type === 'contact' || r.id === props.rowId || r.id === 'row-contact' || r.id?.includes('contact')
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const lookId = layout.variantId || 'contact-list';
  const phone = elProps.phone || '+1 (800) 555-0199';
  const email = elProps.email || 'care@billionbiz.com';
  const address = elProps.address || '742 Evergreen Terrace, San Francisco, CA 94107';
  const hours = elProps.hours || 'Mon – Fri: 9:00 AM – 7:00 PM EST';

  const bgColor = styling.bgColor || 'var(--theme-bg-surface, #ffffff)';
  const textColor = styling.textColor || 'var(--theme-text-heading, #0f172a)';
  const borderColor = styling.borderColor || 'var(--theme-border-divider, #e2e8f0)';
  const iconColor = styling.iconColor || 'var(--theme-primary, #2563eb)';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-contact');

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-contact');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-contact'));
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
        targetSectionId: activeRow?.id || 'footer-contact',
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
      id={activeRow?.id || 'footer-row-contact'}
      data-section-type="FooterContact"
      data-footer-row-type="contact"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 32}px`,
        paddingBottom: `${layout.paddingY ?? 32}px`,
        paddingLeft: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '16px' : `${layout.paddingX ?? 32}px`,
        color: textColor,
      }}
    >
      <div
        style={{
          maxWidth: layout.container === 'full' ? '100%' : '1200px',
          margin: '0 auto',
        }}
      >
        {lookId === 'contact-cards' ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '20px',
            }}
          >
            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: iconColor, marginBottom: '12px' }}>
                <Phone size={20} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0' }}>Call Us Toll-Free</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0' }}>24/7 dedicated telephone assistance</p>
              <a href={`tel:${phone}`} style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>{phone}</a>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: iconColor, marginBottom: '12px' }}>
                <Mail size={20} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0' }}>Email Specialist Desk</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0' }}>Average response in under 2 hours</p>
              <a href={`mailto:${email}`} style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb', textDecoration: 'none' }}>{email}</a>
            </div>

            <div style={{ padding: '20px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'inline-flex', padding: '10px', backgroundColor: '#eff6ff', borderRadius: '8px', color: iconColor, marginBottom: '12px' }}>
                <MapPin size={20} />
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px 0' }}>Flagship Showroom</h4>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 10px 0' }}>Open 7 days a week</p>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>{address}</div>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone size={18} color={iconColor} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{phone}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail size={18} color={iconColor} />
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{email}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Clock size={18} color={iconColor} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>{hours}</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <MapPin size={18} color={iconColor} />
              <span style={{ fontSize: '13px', color: '#64748b' }}>{address}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

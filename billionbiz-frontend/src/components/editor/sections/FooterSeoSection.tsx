import React, { useState } from 'react';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterSeoSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterSeoSection: React.FC<FooterSeoSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'seo' || r.id === props.rowId
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const currentLookId = layout.variantId || 'keyword-story';
  const heading = elProps.heading || 'Discover Premium Online Shopping with BillionBiz';
  const text = elProps.text || 'We curate authentic, premium essentials crafted for conscious consumers. Enjoy lightning-fast doorstep shipping across India, guaranteed genuine products, hassle-free returns, and dedicated 24/7 customer concierge support.';
  const keywords: string[] = elProps.keywords || [
    'Organic Skincare',
    'Ayurvedic Products',
    'Eco-Friendly Essentials',
    'Pan-India Fast Delivery',
    '100% Genuine Certified',
  ];
  const isExpandableEnabled = elProps.isExpandable ?? true;

  const bgColor = styling.bgColor || '#ffffff';
  const textColor = styling.textColor || '#475569';
  const borderColor = styling.borderColor || '#e2e8f0';
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
        navigateToPage('footer-global', activeRow?.id || 'footer-seo');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-seo'));
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
        targetSectionId: activeRow?.id || 'footer-seo',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isMobile = device === 'mobile';

  // Sample FAQs for FAQ Look
  const sampleFaqs = [
    { q: 'How long does nationwide delivery take?', a: 'Standard orders arrive within 2–4 business days. Priority expedited orders reach metro areas in under 24 hours.' },
    { q: 'What is your return & exchange guarantee?', a: 'We offer an unconditional 30-day return policy with free doorstep pickup and instant UPI / card refunds.' },
    { q: 'Are all products certified authentic?', a: 'Every item is 100% genuine, sourced directly from verified manufacturers with batch lab reports.' },
  ];

  return (
    <section
      id={activeRow?.id || 'footer-row-seo'}
      data-section-type="FooterSeo"
      data-footer-row-type="seo"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTop: styling.borderTop ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 36}px`,
        paddingBottom: `${layout.paddingY ?? 36}px`,
        paddingLeft: isMobile ? '20px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '20px' : `${layout.paddingX ?? 32}px`,
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
        style={{
          maxWidth: layout.maxWidth ? `${layout.maxWidth}px` : undefined,
          margin: '0 auto',
        }}
      >
        {/* Look 4: FAQ Accordion */}
        {currentLookId === 'faq-accordion' ? (
          <div>
            {heading && (
              <h4 style={{ fontSize: '16px', fontWeight: 700, color: styling.textColor || '#0f172a', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <HelpCircle size={18} color="#2563eb" /> {heading}
              </h4>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {sampleFaqs.map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    backgroundColor: activeFaqIdx === idx ? 'rgba(37,99,235,0.03)' : '#ffffff',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveFaqIdx(activeFaqIdx === idx ? null : idx);
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: styling.textColor || '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    <span>{faq.q}</span>
                    {activeFaqIdx === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                  </button>
                  {activeFaqIdx === idx && (
                    <div style={{ padding: '0 16px 14px', fontSize: '12.5px', color: '#64748b', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : currentLookId === 'category-cloud' ? (
          /* Look 2: Category & Keyword Cloud */
          <div style={{ textAlign: layout.alignment === 'left' ? 'left' : 'center' }}>
            {heading && (
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: styling.textColor || '#0f172a', marginBottom: '12px' }}>
                {heading}
              </h4>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${layout.gap ?? 8}px`, justifyContent: layout.alignment === 'left' ? 'flex-start' : 'center' }}>
              {keywords.map((kw, idx) => (
                <span
                  key={idx}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '5px 12px',
                    borderRadius: '9999px',
                    backgroundColor: '#ffffff',
                    border: `1px solid ${borderColor}`,
                    fontSize: '12px',
                    fontWeight: 500,
                    color: textColor,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                  }}
                >
                  <Tag size={11} color="#6366f1" /> {kw}
                </span>
              ))}
            </div>
          </div>
        ) : currentLookId === 'rich-snippet-summary' ? (
          /* Look 9: Rich Snippet & Certifications */
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 300px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '12px', marginBottom: '4px' }}>
                <CheckCircle size={14} /> Verified Google Merchant & Organic Certified
              </div>
              <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 6px', color: '#0f172a' }}>{heading}</h4>
              <p style={{ fontSize: '12.5px', color: textColor, margin: 0, lineHeight: 1.5 }}>{text}</p>
            </div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>4.9 / 5.0</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Customer Reviews</div>
              </div>
              <div style={{ padding: '8px 14px', backgroundColor: '#f1f5f9', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>100K+</div>
                <div style={{ fontSize: '10.5px', color: '#64748b' }}>Happy Shoppers</div>
              </div>
            </div>
          </div>
        ) : (
          /* Standard Keyword Story / Rich Editorial */
          <div style={{ textAlign: layout.alignment === 'center' ? 'center' : 'left' }}>
            {heading && (
              <h4
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: styling.textColor || '#0f172a',
                  marginBottom: '8px',
                  letterSpacing: '-0.01em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  justifyContent: layout.alignment === 'center' ? 'center' : 'flex-start',
                }}
              >
                <Sparkles size={14} color="#f59e0b" />
                {heading}
              </h4>
            )}

            <div
              style={{
                fontSize: `${styling.fontSize ?? 12.5}px`,
                lineHeight: 1.6,
                color: textColor,
                position: 'relative',
                maxHeight: isExpandableEnabled && !isExpanded ? '65px' : 'none',
                overflow: isExpandableEnabled && !isExpanded ? 'hidden' : 'visible',
              }}
            >
              <p style={{ margin: 0 }}>{text}</p>
              {isExpandableEnabled && !isExpanded && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '35px',
                    background: `linear-gradient(transparent, ${bgColor})`,
                  }}
                />
              )}
            </div>

            {isExpandableEnabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '8px',
                  background: 'none',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                {isExpanded ? (
                  <>Show Less <ChevronUp size={13} /></>
                ) : (
                  <>Read More <ChevronDown size={13} /></>
                )}
              </button>
            )}

            {keywords.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '6px',
                  marginTop: '12px',
                  justifyContent: layout.alignment === 'center' ? 'center' : 'flex-start',
                }}
              >
                {keywords.map((kw, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      backgroundColor: '#f8fafc',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FooterSeoSection;

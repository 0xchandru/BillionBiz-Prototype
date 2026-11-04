import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterSocialSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const FooterSocialSection: React.FC<FooterSocialSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;
  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'social' || r.id === props.rowId || r.id === 'row-social-1'
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const headline = elProps.heading || elProps.title || 'Join Our Creative Community';
  const subtext =
    elProps.subtext || 'Follow @billionbiz for curated drops, creator features, and exclusive previews.';

  const platforms = elProps.platforms || [
    { platform: 'Instagram', handle: '@billionbiz', count: '124K followers', url: 'https://instagram.com', color: '#e1306c' },
    { platform: 'Twitter / X', handle: '@billionbiz_app', count: '89K followers', url: 'https://twitter.com', color: '#1da1f2' },
    { platform: 'YouTube', handle: 'BillionBiz Studios', count: '52K subscribers', url: 'https://youtube.com', color: '#ff0000' },
    { platform: 'Discord', handle: 'BillionBiz Club', count: '18K members', url: 'https://discord.com', color: '#5865f2' },
  ];

  const bgColor = styling.bgColor || 'var(--theme-bg-surface, #1e293b)';
  const textColor = styling.textColor || '#ffffff';
  const borderColor = styling.borderColor || 'rgba(255, 255, 255, 0.1)';
  const containerMode = layout.container || 'constrained';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-social-1');

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-social');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-social'));
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
        targetSectionId: activeRow?.id || 'footer-social',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  return (
    <section
      id={activeRow?.id || 'footer-row-social'}
      data-section-type="FooterSocial"
      data-footer-row-type="social"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        color: textColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 36}px`,
        paddingBottom: `${layout.paddingY ?? 36}px`,
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
          style={{
            display: 'flex',
            flexDirection: isMobile || isTablet ? 'column' : 'row',
            alignItems: isMobile || isTablet ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '20px' : '32px',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#38bdf8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              <Users size={13} /> Global Community
            </div>
            <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: textColor }}>
              {headline}
            </h4>
            <p style={{ margin: 0, fontSize: '13px', opacity: 0.75 }}>{subtext}</p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            {platforms.map((p: any, idx: number) => (
              <a
                key={idx}
                href={p.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: textColor,
                  textDecoration: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  transition: 'all 0.15s ease',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: p.color || '#38bdf8',
                  }}
                />
                <span>{p.platform}</span>
                {p.count && (
                  <span
                    style={{
                      fontSize: '11px',
                      opacity: 0.65,
                      fontWeight: 500,
                    }}
                  >
                    ({p.count})
                  </span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FooterSocialSection;

import React, { useState } from 'react';
import {
  ShieldCheck,
  Truck,
  RefreshCw,
  Headphones,
  Lock,
  Award,
  Heart,
  Star,
  Zap,
  Globe,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import styles from './FooterSections.module.css';

interface FooterTrustSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

const ICON_MAP: Record<string, any> = {
  'shield-check': ShieldCheck,
  truck: Truck,
  'refresh-cw': RefreshCw,
  headphones: Headphones,
  lock: Lock,
  award: Award,
  heart: Heart,
  star: Star,
  zap: Zap,
  globe: Globe,
  clock: Clock,
  sparkles: Sparkles,
};

export const FooterTrustSection: React.FC<FooterTrustSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;
  const [hoveredCardIdx, setHoveredCardIdx] = useState<number | null>(null);

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'trust' || r.id === props.rowId || r.id === 'row-trust-1'
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const element = activeRow?.columns?.[0]?.elements?.[0] || props.element || {};
  const elProps = element.props || props.props || {};

  const items = elProps.items || [
    { icon: 'shield-check', title: 'Bank-Grade Security', description: '256-bit SSL encrypted payments' },
    { icon: 'truck', title: 'Fast Free Delivery', description: 'Orders shipped within 24 hours' },
    { icon: 'refresh-cw', title: '30-Day Guarantees', description: 'Zero question return policy' },
    { icon: 'headphones', title: '24/7 Priority Support', description: 'Direct access to support specialists' },
  ];

  const bgColor = styling.bgColor || 'var(--theme-bg-surface, #f8fafc)';
  const textColor = styling.textColor || 'var(--theme-text-heading, #0f172a)';
  const borderColor = styling.borderColor || 'var(--theme-border-divider, #e2e8f0)';
  const iconColor = elProps.iconColor || 'var(--theme-primary, #6366f1)';
  const containerMode = layout.container || 'constrained';

  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-trust-1');

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-trust');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-trust'));
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
        targetSectionId: activeRow?.id || 'footer-trust',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const gridColumns = isMobile
    ? 'repeat(1, 1fr)'
    : isTablet
    ? 'repeat(2, 1fr)'
    : `repeat(${Math.min(items.length, 4)}, 1fr)`;

  return (
    <section
      id={activeRow?.id || 'footer-row-trust'}
      data-section-type="FooterTrust"
      data-footer-row-type="trust"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        backgroundColor: bgColor,
        borderTop: styling.borderTop !== false ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 28}px`,
        paddingBottom: `${layout.paddingY ?? 28}px`,
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
          className={styles.trustGrid}
          style={{
            gridTemplateColumns: gridColumns,
            gap: isMobile ? '16px' : `${layout.gap ?? 24}px`,
          }}
        >
          {items.map((item: any, idx: number) => {
            const IconComponent = (item.icon && ICON_MAP[item.icon]) ? ICON_MAP[item.icon] : ShieldCheck;
            const isHovered = hoveredCardIdx === idx;

            return (
              <div
                key={idx}
                className={styles.trustItemCard}
                onMouseEnter={() => setHoveredCardIdx(idx)}
                onMouseLeave={() => setHoveredCardIdx(null)}
                style={{
                  backgroundColor: isHovered ? 'rgba(99, 102, 241, 0.05)' : 'transparent',
                  border: isHovered ? '1px solid rgba(99, 102, 241, 0.2)' : '1px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div
                  className={styles.trustIconWrapper}
                  style={{
                    backgroundColor: isHovered ? iconColor : 'rgba(99, 102, 241, 0.1)',
                    color: isHovered ? '#ffffff' : iconColor,
                  }}
                >
                  <IconComponent size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      fontWeight: 700,
                      color: textColor,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {item.title}
                  </h4>
                  {item.description && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12.5px',
                        color: elProps.descColor || 'var(--theme-text-muted, #64748b)',
                        lineHeight: 1.4,
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FooterTrustSection;

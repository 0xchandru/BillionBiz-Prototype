import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronDown,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Download,
  Smartphone,
  ShieldCheck,
  Truck,
  RotateCcw,
  Lock,
  Award,
  Heart,
  Star,
  Check,
  MessageCircle,
  Users,
  Headphones,
  Banknote,
  Apple,
  Play,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { getEditorPath } from '../utils/editorNavigation';
import type { FooterColumn, FooterElement } from '../engine/types';
import { computeFooterPaletteVariables, isColorDark } from '../engine/footerDirectoryModel';
import { FooterTreeRenderer } from './FooterTreeRenderer';
import styles from './FooterSections.module.css';

interface FooterMainSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

// Payment method badge SVG icons
const PaymentBadgeIcon: React.FC<{ provider: string }> = ({ provider }) => {
  const p = (provider || '').toLowerCase();
  switch (p) {
    case 'visa':
      return (
        <span style={{ fontWeight: 800, fontStyle: 'italic', fontSize: '12px', color: '#1a1f71', letterSpacing: '0.04em' }}>
          VISA
        </span>
      );
    case 'mastercard':
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#eb001b', display: 'inline-block' }} />
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#f79e1b', display: 'inline-block', marginLeft: '-5px', opacity: 0.9 }} />
        </div>
      );
    case 'amex':
    case 'american-express':
      return (
        <span style={{ fontWeight: 800, fontSize: '9.5px', color: '#006fcf', letterSpacing: '0.05em' }}>
          AMEX
        </span>
      );
    case 'paypal':
      return (
        <span style={{ fontWeight: 800, fontSize: '11px', color: '#003087', letterSpacing: '-0.02em' }}>
          Pay<span style={{ color: '#0079c1' }}>Pal</span>
        </span>
      );
    case 'apple-pay':
    case 'applepay':
      return (
        <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#000000', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
          Pay
        </span>
      );
    case 'google-pay':
    case 'googlepay':
      return (
        <span style={{ fontWeight: 700, fontSize: '10.5px', color: '#5f6368' }}>
          G<span style={{ color: '#ea4335' }}>P</span>ay
        </span>
      );
    case 'klarna':
      return (
        <span style={{ fontWeight: 800, fontSize: '10px', color: '#ffb3c7', padding: '1px 3px', borderRadius: '3px', background: '#0a0a0a' }}>
          Klarna.
        </span>
      );
    case 'shop-pay':
    case 'shoppay':
      return (
        <span style={{ fontWeight: 800, fontSize: '10.5px', color: '#5a31f4' }}>
          shop<span style={{ color: '#000' }}>Pay</span>
        </span>
      );
    default:
      return (
        <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
          {provider}
        </span>
      );
  }
};

// Trust badge icon map
const TRUST_ICON_MAP: Record<string, React.FC<any>> = {
  'shield-check': ShieldCheck,
  truck: Truck,
  'rotate-ccw': RotateCcw,
  'refresh-cw': RotateCcw,
  lock: Lock,
  award: Award,
  heart: Heart,
  star: Star,
  sparkles: Sparkles,
};

// Social platform icon helper
const renderSocialIcon = (platform: string, size = 16) => {
  const p = platform.toLowerCase();
  switch (p) {
    case 'twitter':
    case 'x':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
        </svg>
      );
    case 'facebook':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );
    case 'youtube':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );
    case 'linkedin':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.761-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case 'tiktok':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-1.01-.02 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
        </svg>
      );
    default:
      return <Sparkles size={size} />;
  }
};

export const FooterMainSection: React.FC<FooterMainSectionProps> = ({
  props = {},
  device = 'desktop',
  isEditorInteractive = false,
  useEditorModel = true,
}) => {
  const store = useEditorContextStore();
  const { selectedTarget, selectTarget } = store;

  // Derive row from store if in editor context
  const activeRow = (store.footerRows || []).find(
    (r) => r.type === 'navigation' || r.id === props.rowId || r.id === 'row-main-nav'
  );

  const styling = activeRow?.styling || props.styling || {};
  const layout = activeRow?.layout || props.layout || {};
  const columns: FooterColumn[] = activeRow?.columns || props.columns || [];

  // Mobile Accordion state: map of columnId -> boolean open state
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  const toggleAccordion = (colId: string) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [colId]: !prev[colId],
    }));
  };

  // Column newsletter form local state
  const [newsletterEmails, setNewsletterEmails] = useState<Record<string, string>>({});
  const [newsletterSubscribed, setNewsletterSubscribed] = useState<Record<string, boolean>>({});

  const isMobile = device === 'mobile';
  const isTablet = device === 'tablet';

  const bgColor = styling.bgColor || 'var(--footer-bg, #ffffff)';
  const textColor = styling.textColor || 'var(--footer-text, #334155)';
  const borderColor = styling.borderColor || 'var(--footer-border, #e2e8f0)';
  const containerMode = layout.container || 'constrained';

  const isRowSelected =
    selectedTarget.type === 'row' &&
    selectedTarget.editorType === 'footer' &&
    (selectedTarget.rowId === activeRow?.id || selectedTarget.rowId === 'row-main-nav');

  const navigate = useNavigate();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, setSelectedSectionId, requestEditorSwitch } = useLandingEditorStore();

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-main');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-main'));
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
        targetSectionId: activeRow?.id || 'footer-main',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleElementClick = (e: React.MouseEvent, element: FooterElement) => {
    if (!isEditorInteractive && !useEditorModel) return;
    e.stopPropagation();

    const executeSelect = () => {
      if (selectedPageId !== 'footer-global') {
        navigateToPage('footer-global', activeRow?.id || 'footer-main');
        navigate(getEditorPath('footer-global', activeRow?.id || 'footer-main'));
        store.setEditorType('footer');
      }
      if (activeRow) {
        selectTarget({
          type: 'element',
          editorType: 'footer',
          rowId: activeRow.id,
          elementId: element.id,
          elementType: element.type,
        });
        setSelectedSectionId(activeRow.id);
        setRightSidebarOpen(true);
      }
    };

    if (selectedPageId !== 'footer-global') {
      requestEditorSwitch({
        targetPageId: 'footer-global',
        targetSectionId: activeRow?.id || 'footer-main',
        targetName: 'Footer Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const isCentered = layout.variantId === 'centered-brand';
  const isBento = layout.variantId === 'bento-grid';



  // Dynamic flexbox column styling supporting flex columns, auto width, custom widths, and responsive wrapping
  const getColumnStyle = (col: FooterColumn | any): React.CSSProperties => {
    if (isMobile) {
      return {
        flex: '1 1 100%',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }
    if (isTablet) {
      return {
        flex: '0 1 calc(50% - 20px)',
        minWidth: '200px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }

    if (col?.widthMode === 'fill') {
      return {
        flex: '1 1 0px',
        minWidth: '160px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }

    if (col?.widthMode === 'fit-max') {
      return {
        flex: '0 1 auto',
        maxWidth: col.maxWidth ? (typeof col.maxWidth === 'number' ? `${col.maxWidth}px` : col.maxWidth) : undefined,
        boxSizing: 'border-box',
      };
    }

    const w = (typeof col === 'string' ? col : col?.width || 'auto').trim().toLowerCase();

    // Explicit fill / grow
    if (w === 'fill' || w === 'grow') {
      return {
        flex: '1 1 180px',
        minWidth: '160px',
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }

    // Percentage width (e.g. 20%, 25%, 33.3%, 50%)
    if (w.endsWith('%')) {
      return {
        flex: `0 0 ${w}`,
        width: w,
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }

    // Pixel width (e.g. 200px, 240px, 280px)
    if (w.endsWith('px')) {
      return {
        flex: `0 0 ${w}`,
        width: w,
        maxWidth: '100%',
        boxSizing: 'border-box',
      };
    }

    return {
      flex: '0 1 auto',
      minWidth: '160px',
      maxWidth: '100%',
      boxSizing: 'border-box',
    };
  };

  const paletteVars = computeFooterPaletteVariables(styling);

  const treeToRender = store.pendingFooterTree || (store.footerTree && store.footerTree.length > 0 ? store.footerTree : activeRow?.children);

  if (treeToRender && treeToRender.length > 0) {
    return (
      <FooterTreeRenderer
        tree={treeToRender}
        isEditorInteractive={isEditorInteractive}
        device={device as any}
      />
    );
  }

  return (
    <footer
      id={activeRow?.id || 'footer-row-main'}
      data-section-type="FooterMain"
      data-footer-row-type="navigation"
      className={`${styles.footerRow} ${isEditorInteractive ? styles.footerRowEditable : ''} ${
        isRowSelected ? styles.footerRowSelected : ''
      }`}
      onClick={handleRowClick}
      style={{
        ...paletteVars as any,
        backgroundColor: bgColor,
        color: textColor,
        borderTop: styling.borderTop ? `1px solid ${borderColor}` : 'none',
        borderBottom: styling.borderBottom ? `1px solid ${borderColor}` : 'none',
        paddingTop: `${layout.paddingY ?? 64}px`,
        paddingBottom: `${layout.paddingY ?? 64}px`,
        paddingLeft: isMobile ? '20px' : `${layout.paddingX ?? 32}px`,
        paddingRight: isMobile ? '20px' : `${layout.paddingX ?? 32}px`,
      }}
    >
      <div
        className={
          containerMode === 'boxed' || containerMode === 'narrow'
            ? styles.containerNarrow
            : containerMode === 'wide'
            ? styles.containerWide
            : containerMode === 'full'
            ? styles.containerFull
            : styles.containerStandard
        }
        style={{
          width: '100%',
          maxWidth:
            containerMode === 'full' ||
            (activeRow?.rows && activeRow.rows.some((r: any) => {
              const w = String(r.layout?.containerWidth || r.layout?.columnsContainerWidth || '').toLowerCase();
              return w === 'full' || w === 'wide';
            }))
              ? '100%'
              : undefined,
          margin: '0 auto',
        }}
      >
        {(activeRow?.rows && activeRow.rows.length > 0 ? activeRow.rows : [{ id: 'row-default', name: 'Row 1', columns, layout }]).map((rowBand: any, rIdx: number) => {
          const rowLayout = { ...layout, ...rowBand.layout };
          const rowCols: FooterColumn[] = rowBand.columns || [];
          const rowJustify = (() => {
            const jc = rowLayout.justifyContent || rowLayout.alignment;
            if (jc === 'left' || jc === 'start' || jc === 'flex-start') return 'flex-start';
            if (jc === 'right' || jc === 'end' || jc === 'flex-end') return 'flex-end';
            if (jc === 'center') return 'center';
            if (jc === 'space-between') return 'space-between';
            if (jc === 'space-around') return 'space-around';
            if (jc === 'space-evenly') return 'space-evenly';
            return isCentered ? 'center' : 'space-between';
          })();

          // 4 Width Sizing Options: narrow (1024px), standard (1280px), wide (1440px), full (100%)
          const widthMode = String(rowLayout.containerWidth || rowLayout.columnsContainerWidth || rowLayout.container || layout.containerWidth || layout.container || 'standard').toLowerCase();

          let rowMaxWidth = '1280px';
          let rowWidth = '100%';

          if (widthMode === 'narrow' || widthMode === 'boxed') {
            rowMaxWidth = '1024px';
          } else if (widthMode === 'wide') {
            rowMaxWidth = '1440px';
          } else if (widthMode === 'full') {
            rowMaxWidth = '100%';
          } else if (widthMode === 'custom') {
            const customVal = rowLayout.customWidth || rowLayout.columnsContainerCustomWidth || 1200;
            rowMaxWidth = typeof customVal === 'number' ? `${customVal}px` : customVal;
          } else if (widthMode === 'auto' || widthMode === 'fit-content') {
            rowMaxWidth = '100%';
            rowWidth = 'fit-content';
          } else {
            // standard / constrained default (1280px)
            rowMaxWidth = '1280px';
          }

          const rawAlign = String(rowLayout.columnsContainerAlignment || rowLayout.columnsContainerAlign || 'center').toLowerCase();
          const parentJustify =
            rawAlign === 'left' || rawAlign === 'flex-start' || rawAlign === 'start'
              ? 'flex-start'
              : rawAlign === 'right' || rawAlign === 'flex-end' || rawAlign === 'end'
              ? 'flex-end'
              : 'center';

          return (
            <div
              key={rowBand.id || rIdx}
              style={{
                display: 'flex',
                justifyContent: parentJustify,
                width: '100%',
                marginBottom: rIdx < (activeRow?.rows?.length || 1) - 1 ? `${rowLayout.gapY ?? 32}px` : 0,
              }}
            >
              <div
                className={styles.mainFooterGrid}
                style={{
                  display: 'flex',
                  flexWrap: rowLayout.flexWrap || 'wrap',
                  justifyContent: rowJustify,
                  alignItems: rowLayout.alignItems || (rowLayout.verticalAlignment === 'center' ? 'center' : rowLayout.verticalAlignment === 'bottom' ? 'flex-end' : rowLayout.verticalAlignment === 'stretch' ? 'stretch' : 'flex-start'),
                  gap: isMobile ? '28px' : `${rowLayout.gap ?? 40}px`,
                  rowGap: isMobile ? '28px' : `${rowLayout.gapY ?? rowLayout.gap ?? 40}px`,
                  maxWidth: isCentered && rowCols.length === 1 ? '680px' : rowMaxWidth,
                  margin: isCentered && rowCols.length === 1 ? '0 auto' : undefined,
                  width: rowWidth,
                  boxSizing: 'border-box',
                }}
              >
              {rowCols.map((col, colIdx) => {
                const isAccordionOpen = openAccordions[col.id] ?? false;
                const colDirection = col.direction === 'row' ? 'row' : col.direction === 'wrap' ? 'row' : 'column';
                const colWrap = col.direction === 'wrap' ? 'wrap' : 'nowrap';
                const colGap = col.gap !== undefined ? `${col.gap}px` : undefined;
                const colAlign = col.alignment === 'center' ? 'center' : col.alignment === 'end' ? 'flex-end' : isCentered ? 'center' : 'flex-start';
                const colPadding = col.padding ? `${col.padding.top ?? 0}px ${col.padding.right ?? 0}px ${col.padding.bottom ?? 0}px ${col.padding.left ?? 0}px` : undefined;

                return (
                  <div
                    key={col.id || colIdx}
                    className={styles.columnCard}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    style={{
                      ...getColumnStyle(col),
                      display: 'flex',
                      flexDirection: colDirection,
                      flexWrap: colWrap,
                      gap: colGap,
                      padding: colPadding,
                      alignItems: colAlign,
                      textAlign: isCentered ? 'center' : 'left',
                      ...(isBento
                        ? {
                            backgroundColor: 'rgba(255, 255, 255, 0.035)',
                            border: '1px solid rgba(255, 255, 255, 0.09)',
                            borderRadius: '12px',
                            padding: '24px 20px',
                          }
                        : {}),
                    }}
                  >
                {col.elements.map(function renderItem(el: FooterElement): React.ReactNode {
                  const isElSelected =
                    selectedTarget.type === 'element' &&
                    selectedTarget.editorType === 'footer' &&
                    selectedTarget.elementId === el.id;

                  const elProps = el.props || {};

                  // ─── 1. Brand Logo ───
                  if (el.type === 'logo') {
                    const isElVisible = elProps.isVisible !== false;
                    if (!isEditorInteractive && !isElVisible) return null;
                    const logoImgUrl = elProps.imageUrl || elProps.image;
                    const logoType = elProps.logoType || (elProps.sourceType === 'image' ? 'image' : 'both');
                    const showImg = (logoType === 'image' || logoType === 'both') && Boolean(logoImgUrl);
                    const showTxt = logoType === 'text' || logoType === 'both';
                    const isTwoLines = Boolean(elProps.isTwoLines);
                    const brandTitle = elProps.brandName || elProps.text || 'BillionBiz';
                    const upperText = elProps.upperText || brandTitle;
                    const lowerText = elProps.lowerText || '';
                    const tagline = elProps.tagline;
                    const logoHeight = (elProps.logoHeight || elProps.height) ?? 40;
                    const logoWidth = isMobile
                      ? (elProps.mobileWidth || elProps.width || 110)
                      : isTablet
                      ? (elProps.tabletWidth || elProps.width || 130)
                      : (elProps.desktopWidth || elProps.width || 150);
                    const shape = elProps.shape || 'none';
                    const borderRadius =
                      shape === 'circle'
                        ? '50%'
                        : shape === 'rounded'
                        ? `${elProps.borderRadius ?? 8}px`
                        : shape === 'pill'
                        ? '9999px'
                        : shape === 'square'
                        ? '4px'
                        : '0';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: '10px',
                          justifyContent: isCentered ? 'center' : 'flex-start',
                          marginBottom: '6px',
                          cursor: isEditorInteractive ? 'pointer' : 'default',
                          opacity: isElVisible ? 1 : 0.45,
                          flexShrink: 0,
                        }}
                      >
                        {showImg && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: elProps.imagePadding ? `${elProps.imagePadding}px` : 0,
                              backgroundColor: elProps.imageBg || 'transparent',
                              borderRadius,
                              border: elProps.border || 'none',
                              boxShadow: elProps.shadow || 'none',
                              overflow: 'hidden',
                              flexShrink: 0,
                            }}
                          >
                            <img
                              src={logoImgUrl}
                              alt={brandTitle || 'Store Logo'}
                              style={{
                                height: `${logoHeight}px`,
                                width: 'auto',
                                maxWidth: `${logoWidth}px`,
                                maxHeight: `${logoHeight}px`,
                                objectFit: elProps.objectFit || 'contain',
                                borderRadius,
                                display: 'block',
                              }}
                            />
                          </div>
                        )}
                        {showTxt && (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: isCentered ? 'center' : 'flex-start' }}>
                            {isTwoLines ? (
                              <div style={{ lineHeight: 1.15 }}>
                                <div style={{
                                  fontSize: `${elProps.fontSize ?? 20}px`,
                                  fontWeight: elProps.fontWeight ?? 800,
                                  color: elProps.textColor || textColor,
                                  letterSpacing: '-0.02em',
                                }}>
                                  {upperText}
                                </div>
                                {lowerText && (
                                  <div style={{
                                    fontSize: `${Math.round((elProps.fontSize ?? 20) * 0.65)}px`,
                                    fontWeight: 700,
                                    color: elProps.textColor || textColor,
                                    letterSpacing: '0.08em',
                                    opacity: 0.8,
                                  }}>
                                    {lowerText}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div style={{
                                fontSize: `${elProps.fontSize ?? 22}px`,
                                fontWeight: elProps.fontWeight ?? 800,
                                color: elProps.textColor || textColor,
                                letterSpacing: '-0.03em',
                              }}>
                                {brandTitle}
                              </div>
                            )}
                            {tagline && (
                              <span style={{ fontSize: '11px', color: elProps.taglineColor || 'rgba(255,255,255,0.6)', marginTop: '2px', fontWeight: 500 }}>
                                {tagline}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ─── 2. Brand Description / Bio ───
                  if (el.type === 'brand-description' || el.type === 'brand-mission') {
                    const isElVisible = elProps.isVisible !== false;
                    if (!isEditorInteractive && !isElVisible) return null;
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{ opacity: isElVisible ? 1 : 0.45 }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: `${elProps.fontSize ?? 13.5}px`,
                            color: elProps.textColor || textColor,
                            lineHeight: elProps.lineHeight ?? 1.65,
                            maxWidth: elProps.maxWidth ? `${elProps.maxWidth}px` : isCentered ? '540px' : '340px',
                            textAlign: isCentered ? 'center' : (elProps.textAlign || 'left'),
                          }}
                        >
                          {elProps.text ||
                            'Empowering modern online merchants with frictionless store infrastructure, intelligent workflows, and conversion-optimized retail tools.'}
                        </p>
                      </div>
                    );
                  }

                  const isElVisible = elProps.isVisible !== false;
                  if (!isEditorInteractive && !isElVisible) return null;

                  // ─── 3. Contact Information ───
                  if (el.type === 'contact' || el.type === 'address') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', opacity: isElVisible ? 1 : 0.45 }}
                      >
                        {elProps.phone && (
                          <a
                            href={`tel:${elProps.phone}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'rgba(255,255,255,0.75)',
                              textDecoration: 'none',
                            }}
                          >
                            <Phone size={14} color="#38bdf8" />
                            <span>{elProps.phone}</span>
                          </a>
                        )}
                        {elProps.email && (
                          <a
                            href={`mailto:${elProps.email}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'rgba(255,255,255,0.75)',
                              textDecoration: 'none',
                            }}
                          >
                            <Mail size={14} color="#ec4899" />
                            <span>{elProps.email}</span>
                          </a>
                        )}
                        {elProps.address && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'flex-start',
                              gap: '8px',
                              color: 'rgba(255,255,255,0.75)',
                            }}
                          >
                            <MapPin size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <span>{elProps.address}</span>
                          </div>
                        )}
                        {elProps.whatsapp && (
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: 'rgba(255,255,255,0.75)',
                            }}
                          >
                            <Phone size={14} color="#10b981" />
                            <span>{elProps.whatsapp}</span>
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ─── 3b. Business Hours ───
                  if (el.type === 'business-hours') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', width: '100%', opacity: isElVisible ? 1 : 0.45 }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isCentered ? 'center' : 'space-between', gap: '8px' }}>
                          <span style={{ fontWeight: 700, color: elProps.headingColor || textColor, fontSize: `${elProps.headingSize ?? 13.5}px` }}>
                            {elProps.heading || 'Business Hours'}
                          </span>
                          {elProps.showLiveStatus !== false && (
                            <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                              Open Now
                            </span>
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'rgba(255,255,255,0.72)', fontSize: '12.5px' }}>
                          <div>{elProps.weekdayHours || 'Mon – Fri: 9:00 AM – 7:00 PM EST'}</div>
                          <div>{elProps.weekendHours || 'Saturday: 10:00 AM – 5:00 PM EST'}</div>
                        </div>
                      </div>
                    );
                  }

                  // ─── 4. Social Links ───
                  if (el.type === 'social-links' || el.type === 'social-icons' || el.type === 'social-follow') {
                    const platforms = elProps.platforms || [
                      { platform: 'twitter', url: 'https://twitter.com', enabled: true },
                      { platform: 'instagram', url: 'https://instagram.com', enabled: true },
                      { platform: 'linkedin', url: 'https://linkedin.com', enabled: true },
                      { platform: 'youtube', url: 'https://youtube.com', enabled: true },
                    ];
                    const variant = elProps.variant || 'circles';
                    const iconSize = elProps.size || 15;
                    const gap = elProps.gap ?? 8;
                    const showHeading = elProps.showHeading && Boolean(elProps.heading);

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: isCentered ? 'center' : 'flex-start',
                          width: isCentered ? '100%' : 'auto',
                        }}
                      >
                        {showHeading && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: elProps.headingColor || textColor,
                            }}
                          >
                            {elProps.heading}
                          </div>
                        )}
                        <div
                          className={styles.socialIconRow}
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: `${gap}px`,
                            justifyContent: isCentered ? 'center' : 'flex-start',
                          }}
                        >
                          {platforms
                            .filter((p: any) => p.enabled !== false)
                            .map((p: any, pIdx: number) => {
                              const isMinimal = variant === 'minimal';
                              const isPill = variant === 'pills';
                              const isRounded = variant === 'rounded';
                              const borderRadius = isMinimal ? '4px' : isRounded ? '8px' : isPill ? '20px' : '50%';
                              const bg = isMinimal ? 'transparent' : 'rgba(255, 255, 255, 0.08)';
                              const border = isMinimal ? 'none' : '1px solid rgba(255, 255, 255, 0.15)';

                              return (
                                <a
                                  key={pIdx}
                                  href={p.url || '#'}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={styles.socialIconBtn}
                                  style={{
                                    backgroundColor: bg,
                                    border: border,
                                    borderRadius: borderRadius,
                                    color: elProps.iconColor && elProps.iconColor !== 'currentColor' ? elProps.iconColor : textColor,
                                    width: isMinimal ? 'auto' : `${iconSize + 18}px`,
                                    height: isMinimal ? 'auto' : `${iconSize + 18}px`,
                                    padding: isMinimal ? '4px' : undefined,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.15s ease',
                                  }}
                                  title={p.platform}
                                >
                                  {renderSocialIcon(p.platform, iconSize)}
                                </a>
                              );
                            })}
                        </div>
                      </div>
                    );
                  }

                  // ─── 5. Link Group (Directory Columns) ───
                  if (el.type === 'link-group' || el.type === 'navigation-menu' || el.type === 'category-menu') {
                    const links = elProps.links || [
                      { label: 'All Products', href: '/products' },
                      { label: 'Featured Collections', href: '/collections', badge: 'HOT' },
                      { label: 'New Arrivals', href: '/new', badge: 'NEW' },
                      { label: 'Special Discounts', href: '/sale' },
                    ];

                    const heading = elProps.heading || el.name || 'Quick Links';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          // Use auto width so the link group only takes up the space it needs
                          // and can be positioned/aligned within the flex column
                          width: isCentered ? '100%' : 'auto',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCentered ? 'center' : 'flex-start',
                        }}
                      >
                        {/* Column Header (Clickable Accordion on Mobile) */}
                        <div
                          className={styles.linkGroupHeading}
                          onClick={isMobile ? (e) => { e.stopPropagation(); toggleAccordion(col.id); } : undefined}
                          style={{
                            color: elProps.headingColor || textColor,
                            fontSize: `${elProps.headingSize ?? 13.5}px`,
                            cursor: isMobile ? 'pointer' : 'default',
                            paddingBottom: isMobile ? '8px' : '14px',
                            borderBottom: isMobile ? '1px solid rgba(255,255,255,0.08)' : 'none',
                            justifyContent: isCentered ? 'center' : 'flex-start',
                            textAlign: isCentered ? 'center' : 'left',
                          }}
                        >
                          <span>{heading}</span>
                          {isMobile && (
                            <span
                              style={{
                                transform: isAccordionOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                transition: 'transform 0.2s ease',
                                display: 'flex',
                              }}
                            >
                              <ChevronDown size={16} />
                            </span>
                          )}
                        </div>

                        {/* Link Items (Collapsible on Mobile) */}
                        {(!isMobile || isAccordionOpen) && (
                          <ul
                            className={styles.linkList}
                            style={{
                              paddingTop: isMobile ? '10px' : '0',
                              gap: isCentered ? '18px' : `${elProps.gap ?? 11}px`,
                              display: 'flex',
                              flexDirection: isCentered && columns.length <= 1 && !isMobile ? 'row' : 'column',
                              flexWrap: 'wrap',
                              justifyContent: isCentered ? 'center' : 'flex-start',
                              alignItems: isCentered ? 'center' : 'flex-start',
                            }}
                          >
                            {links.map((link: any, lIdx: number) => (
                              <li key={lIdx}>
                                <a
                                  href={link.href || '#'}
                                  onClick={(e) => {
                                    if (isEditorInteractive) e.preventDefault();
                                  }}
                                  className={styles.linkItemAnchor}
                                  style={{
                                    color: elProps.textColor || 'rgba(255, 255, 255, 0.72)',
                                    fontSize: `${elProps.fontSize ?? 13.5}px`,
                                  }}
                                >
                                  <span>{link.label}</span>
                                  {link.badge && (
                                    <span
                                      className={styles.linkBadge}
                                      style={{
                                        backgroundColor:
                                          link.badge === 'HOT'
                                            ? '#ef4444'
                                            : link.badge === 'NEW'
                                            ? '#10b981'
                                            : link.badge === 'SALE'
                                            ? '#f59e0b'
                                            : '#6366f1',
                                        color: '#ffffff',
                                      }}
                                    >
                                      {link.badge}
                                    </span>
                                  )}
                                  {link.openInNewTab && (
                                    <ArrowUpRight size={11} style={{ opacity: 0.6 }} />
                                  )}
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  }

                  // ─── 6. Newsletter Form in Column ───
                  if (el.type === 'newsletter-form') {
                    const formLayout = elProps.layout || 'stacked';
                    const isStacked = formLayout === 'stacked';
                    const isJoined = formLayout === 'joined';
                    const btnStyle = elProps.buttonStyle || 'solid';
                    const title = elProps.title || elProps.headline || 'Newsletter';
                    const subtitle = elProps.subtitle || elProps.subheadline || elProps.description;
                    const placeholder = elProps.placeholder || 'Enter your email address...';
                    const buttonText = elProps.buttonText || 'Subscribe';
                    const buttonBg = elProps.buttonBg || 'var(--footer-accent, var(--primary, #2563eb))';
                    const buttonColor = elProps.buttonColor || '#ffffff';
                    const showDisclaimer = elProps.showDisclaimer !== false && Boolean(elProps.disclaimerText);
                    const disclaimerText = elProps.disclaimerText || 'By subscribing you agree to our Privacy Policy.';

                    const isWhiteOrLight = (c?: string) => {
                      if (!c) return false;
                      const lower = c.trim().toLowerCase();
                      return lower === '#fff' || lower === '#ffffff' || lower === 'white' || lower.startsWith('rgba(255, 255, 255') || lower.startsWith('rgb(255, 255, 255');
                    };

                    const isDarkTheme = styling?.bgType === 'dark';
                    const isDarkCanvas = isColorDark(styling?.bgColor || (isDarkTheme ? '#0f172a' : '#ffffff'));

                    // All colors cleanly inherited from CSS palette variables
                    const headingColor = (elProps.headingColor && (isDarkCanvas || !isWhiteOrLight(elProps.headingColor)))
                      ? elProps.headingColor
                      : 'var(--footer-heading, currentColor)';
                    const subtitleColor = (elProps.textColor && (isDarkCanvas || !isWhiteOrLight(elProps.textColor)))
                      ? elProps.textColor
                      : 'var(--footer-muted-text, var(--footer-text, #475569))';
                    const inputBg = 'var(--footer-input-bg, #f8fafc)';
                    const inputBorder = '1px solid var(--footer-input-border, var(--footer-border, #cbd5e1))';
                    const inputTextColor = 'var(--footer-input-text, var(--footer-heading, #0f172a))';
                    const disclaimerColor = 'var(--footer-muted-text, #64748b)';

                    const handleNewsletterSubmit = (e: React.FormEvent | React.MouseEvent) => {
                      e.preventDefault();
                      if (isEditorInteractive) {
                        handleElementClick(e as any, el);
                        return;
                      }
                      e.stopPropagation();
                      setNewsletterSubscribed((prev) => ({ ...prev, [el.id]: true }));
                      setTimeout(() => {
                        setNewsletterSubscribed((prev) => ({ ...prev, [el.id]: false }));
                      }, 3000);
                    };

                    const renderButton = (customStyle?: React.CSSProperties) => (
                      <button
                        type="button"
                        onClick={handleNewsletterSubmit}
                        style={{
                          height: '42px',
                          padding: isStacked ? '10px 18px' : '10px 18px',
                          borderRadius: btnStyle === 'pill' ? '24px' : '8px',
                          backgroundColor: newsletterSubscribed[el.id]
                            ? '#10b981'
                            : btnStyle === 'outline'
                            ? 'transparent'
                            : buttonBg,
                          color:
                            btnStyle === 'outline' && !newsletterSubscribed[el.id]
                              ? buttonBg
                              : buttonColor,
                          border: btnStyle === 'outline' ? `1.5px solid ${buttonBg}` : 'none',
                          fontWeight: 700,
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          flexShrink: 0,
                          transition: 'all 0.2s ease',
                          whiteSpace: 'nowrap',
                          boxShadow: btnStyle === 'solid' ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                          ...customStyle,
                        }}
                      >
                        {newsletterSubscribed[el.id] ? (
                          <>
                            <Check size={15} /> Subscribed!
                          </>
                        ) : (
                          buttonText
                        )}
                      </button>
                    );

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          width: '100%',
                          maxWidth: isCentered ? '440px' : '380px',
                          alignItems: isCentered ? 'center' : 'stretch',
                          textAlign: isCentered ? 'center' : 'left',
                          marginTop: '4px',
                        }}
                      >
                        {title && (
                          <h4
                            style={{
                              margin: 0,
                              fontSize: '16px',
                              fontWeight: 700,
                              color: headingColor,
                              lineHeight: 1.3,
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {title}
                          </h4>
                        )}
                        {subtitle && (
                          <p
                            style={{
                              margin: 0,
                              fontSize: '13.5px',
                              color: subtitleColor,
                              lineHeight: 1.5,
                            }}
                          >
                            {subtitle}
                          </p>
                        )}

                        {isJoined ? (
                          /* Joined Capsule layout */
                          <form
                            onSubmit={handleNewsletterSubmit}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              width: '100%',
                              backgroundColor: inputBg,
                              border: inputBorder,
                              borderRadius: btnStyle === 'pill' ? '28px' : '10px',
                              padding: '3px 4px 3px 14px',
                              transition: 'all 0.2s ease',
                              boxSizing: 'border-box',
                            }}
                          >
                            <input
                              type="email"
                              placeholder={placeholder}
                              value={newsletterEmails[el.id] || ''}
                              onChange={(e) => setNewsletterEmails((prev) => ({ ...prev, [el.id]: e.target.value }))}
                              onClick={(e) => isEditorInteractive && e.stopPropagation()}
                              className={styles.columnNewsletterInput}
                              style={{
                                flex: 1,
                                minWidth: 0,
                                height: '36px',
                                background: 'transparent',
                                border: 'none',
                                outline: 'none',
                                color: inputTextColor,
                                fontSize: '13.5px',
                                padding: 0,
                              }}
                            />
                            {renderButton({ height: '36px', padding: '8px 16px', borderRadius: btnStyle === 'pill' ? '24px' : '7px' })}
                          </form>
                        ) : (
                          /* Stacked or Inline row layout */
                          <form
                            onSubmit={handleNewsletterSubmit}
                            style={{
                              display: 'flex',
                              flexDirection: isStacked ? 'column' : 'row',
                              alignItems: isStacked ? 'stretch' : 'center',
                              gap: '8px',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            <input
                              type="email"
                              placeholder={placeholder}
                              value={newsletterEmails[el.id] || ''}
                              onChange={(e) => setNewsletterEmails((prev) => ({ ...prev, [el.id]: e.target.value }))}
                              onClick={(e) => isEditorInteractive && e.stopPropagation()}
                              className={styles.columnNewsletterInput}
                              style={{
                                height: '42px',
                                minHeight: '42px',
                                maxHeight: '42px',
                                padding: '10px 14px',
                                borderRadius: btnStyle === 'pill' ? '24px' : '8px',
                                backgroundColor: inputBg,
                                border: inputBorder,
                                color: inputTextColor,
                              }}
                            />
                            {renderButton(isStacked ? { width: '100%' } : undefined)}
                          </form>
                        )}

                        {showDisclaimer && (
                          <span
                            style={{
                              fontSize: '11.5px',
                              color: disclaimerColor,
                              lineHeight: 1.4,
                            }}
                          >
                            {disclaimerText}
                          </span>
                        )}
                      </div>
                    );
                  }

                  // ─── 7. Payment Methods Badges in Column ───
                  if (el.type === 'payment-methods') {
                    const providers = elProps.providers || ['visa', 'mastercard', 'amex', 'paypal', 'applepay', 'googlepay'];
                    const showHeading = elProps.showHeading !== false && Boolean(elProps.heading);
                    const gap = elProps.gap ?? 6;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: isCentered ? 'center' : 'flex-start',
                          width: '100%',
                          marginTop: '4px',
                        }}
                      >
                        {showHeading && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: elProps.headingColor || textColor,
                            }}
                          >
                            {elProps.heading || 'Payment Options'}
                          </div>
                        )}
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: `${gap}px`,
                            alignItems: 'center',
                            justifyContent: isCentered ? 'center' : 'flex-start',
                          }}
                        >
                          {providers.map((provider: string, pIdx: number) => (
                            <div
                              key={pIdx}
                              style={{
                                padding: '4px 8px',
                                minWidth: '40px',
                                height: '26px',
                                backgroundColor: '#ffffff',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
                              }}
                              title={provider}
                            >
                              <PaymentBadgeIcon provider={provider} />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // ─── 8. Trust Badges in Column ───
                  if (el.type === 'trust-badges') {
                    const items = elProps.items || [
                      { icon: 'shield-check', title: '256-Bit SSL Protection' },
                      { icon: 'truck', title: 'Express Tracked Shipping' },
                      { icon: 'rotate-ccw', title: '30-Day Free Returns' },
                    ];
                    const showHeading = elProps.showHeading && Boolean(elProps.heading);
                    const iconColor = elProps.iconColor || '#10b981';
                    const fontSize = elProps.fontSize ?? 12.5;
                    const gap = elProps.gap ?? 8;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: `${gap}px`,
                          width: '100%',
                          alignItems: isCentered ? 'center' : 'flex-start',
                          marginTop: '4px',
                        }}
                      >
                        {showHeading && (
                          <div
                            style={{
                              fontSize: '12px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              color: elProps.headingColor || textColor,
                            }}
                          >
                            {elProps.heading}
                          </div>
                        )}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '7px',
                            width: '100%',
                          }}
                        >
                          {items.map((item: any, itIdx: number) => {
                            const IconCmp = TRUST_ICON_MAP[item.icon] || ShieldCheck;
                            return (
                              <div
                                key={itIdx}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  justifyContent: isCentered ? 'center' : 'flex-start',
                                  fontSize: `${fontSize}px`,
                                  color: elProps.textColor || 'rgba(255,255,255,0.85)',
                                }}
                              >
                                <IconCmp size={15} color={iconColor} style={{ flexShrink: 0 }} />
                                <span style={{ fontWeight: 500 }}>{item.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // ─── 9. App Download & QR Code ───
                  if (el.type === 'app-download' || el.type === 'qr-code') {
                    const heading = elProps.heading || elProps.title || 'Get Our App';
                    const showHeading = elProps.showHeading !== false;
                    const showAppStore = elProps.showAppStore !== false;
                    const showGooglePlay = elProps.showGooglePlay !== false;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          alignItems: isCentered ? 'center' : 'flex-start',
                          width: '100%',
                          marginTop: '4px',
                        }}
                      >
                        {showHeading && (
                          <span style={{ fontSize: '12px', fontWeight: 700, color: elProps.headingColor || textColor, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {heading}
                          </span>
                        )}
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: isCentered ? 'center' : 'flex-start' }}>
                          {showAppStore && (
                            <a
                              href={elProps.appStoreUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => isEditorInteractive && e.preventDefault()}
                              style={{
                                padding: '7px 12px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: textColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <Smartphone size={14} /> App Store
                            </a>
                          )}
                          {showGooglePlay && (
                            <a
                              href={elProps.googlePlayUrl || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => isEditorInteractive && e.preventDefault()}
                              style={{
                                padding: '7px 12px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.15)',
                                color: textColor,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '12px',
                                fontWeight: 600,
                                textDecoration: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <Download size={14} /> Google Play
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ─── 10. Copyright Notice in Column ───
                  if (el.type === 'copyright') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          marginTop: '6px',
                          display: 'flex',
                          justifyContent: isCentered ? 'center' : 'flex-start',
                          width: '100%',
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: `${elProps.fontSize ?? 12}px`,
                            color: elProps.textColor || 'rgba(255,255,255,0.6)',
                            lineHeight: 1.5,
                            textAlign: isCentered ? 'center' : 'left',
                          }}
                        >
                          {elProps.text || '© 2026 BillionBiz, Inc. All rights reserved.'}
                        </p>
                      </div>
                    );
                  }

                  // ─── 8. Rich Text ───
                  if (el.type === 'rich-text') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          fontSize: `${elProps.fontSize ?? 13}px`,
                          color: elProps.textColor || 'rgba(255,255,255,0.75)',
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      >
                        {elProps.heading && (
                          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textColor }}>
                            {elProps.heading}
                          </h4>
                        )}
                        <p style={{ margin: 0, lineHeight: 1.6 }}>{elProps.content || ''}</p>
                      </div>
                    );
                  }

                  // ─── 9. Image ───
                  if (el.type === 'image') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          justifyContent: isCentered ? 'center' : 'flex-start',
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      >
                        {elProps.imageUrl ? (
                          <img
                            src={elProps.imageUrl}
                            alt={elProps.altText || ''}
                            style={{
                              maxWidth: `${elProps.width ?? 220}px`,
                              maxHeight: `${elProps.height ?? 120}px`,
                              borderRadius: `${elProps.radius ?? 6}px`,
                              objectFit: elProps.objectFit || 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '180px',
                              height: '90px',
                              border: '1px dashed rgba(255,255,255,0.2)',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'rgba(255,255,255,0.4)',
                              fontSize: '12px',
                            }}
                          >
                            Image Placeholder
                          </div>
                        )}
                      </div>
                    );
                  }

                  // ─── 10. Divider ───
                  if (el.type === 'divider') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          width: elProps.width || '100%',
                          marginTop: `${elProps.marginTop ?? 12}px`,
                          marginBottom: `${elProps.marginBottom ?? 12}px`,
                          borderTop: `${elProps.thickness ?? 1}px ${elProps.style || 'solid'} ${
                            elProps.color || 'rgba(255,255,255,0.12)'
                          }`,
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      />
                    );
                  }

                  // ─── 11. Spacer ───
                  if (el.type === 'spacer') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          height: `${elProps.height ?? 20}px`,
                          width: '100%',
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      />
                    );
                  }

                  // ─── 12. Custom HTML ───
                  if (el.type === 'custom-html') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        dangerouslySetInnerHTML={{ __html: elProps.html || '' }}
                        style={{ opacity: isElVisible ? 1 : 0.45 }}
                      />
                    );
                  }

                  // ─── 13. Group Container ───
                  if (el.type === 'group') {
                    const gDir = elProps.direction === 'row' ? 'row' : elProps.direction === 'wrap' ? 'row' : 'column';
                    const gWrap = elProps.direction === 'wrap' ? 'wrap' : 'nowrap';
                    const gGap = elProps.gap !== undefined ? `${elProps.gap}px` : '12px';
                    const gAlign = elProps.alignItems || (isCentered ? 'center' : 'flex-start');
                    const gJustify = elProps.justifyContent || (isCentered ? 'center' : 'flex-start');
                    const children: FooterElement[] = elProps.children || (el as any).children || [];

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: gDir,
                          flexWrap: gWrap,
                          gap: gGap,
                          alignItems: gAlign,
                          justifyContent: gJustify,
                          width: '100%',
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      >
                        {children.map(renderItem)}
                      </div>
                    );
                  }

                  // ─── 14. Column Heading ───
                  if (el.type === 'column-heading') {
                    const headingTitle = elProps.title || el.name || 'Directory';
                    const kicker = elProps.kicker;
                    const size = elProps.size || 'md';
                    const hasAccentBar = elProps.hasAccentBar ?? false;
                    const accentColor = elProps.accentColor || '#6366f1';
                    const titleColor = elProps.color || textColor;
                    const fontSize = size === 'lg' ? '18px' : size === 'sm' ? '13px' : '15px';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: isCentered ? 'center' : 'flex-start',
                          marginBottom: '10px',
                          opacity: isElVisible ? 1 : 0.45,
                        }}
                      >
                        {kicker && (
                          <span
                            style={{
                              fontSize: '11px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.08em',
                              fontWeight: 700,
                              color: accentColor,
                              marginBottom: '4px',
                            }}
                          >
                            {kicker}
                          </span>
                        )}
                        <h4
                          style={{
                            margin: 0,
                            fontSize,
                            fontWeight: 700,
                            color: titleColor,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          {headingTitle}
                        </h4>
                        {hasAccentBar && (
                          <div
                            style={{
                              width: '26px',
                              height: '3px',
                              borderRadius: '2px',
                              backgroundColor: accentColor,
                              marginTop: '6px',
                            }}
                          />
                        )}
                      </div>
                    );
                  }

                  // ─── 15. Brand Rating ───
                  if (el.type === 'brand-rating') {
                    const rating = elProps.rating ?? 4.9;
                    const maxRating = elProps.maxRating ?? 5;
                    const reviewCount = elProps.reviewCount || '2,400+ reviews';
                    const platform = elProps.platform || 'Customer Reviews';
                    const showStars = elProps.showStars !== false;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          flexWrap: 'wrap',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '8px',
                        }}
                      >
                        {showStars && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', color: '#f59e0b' }}>
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={13} fill={i < Math.floor(rating) ? '#f59e0b' : 'none'} />
                            ))}
                          </div>
                        )}
                        <span style={{ fontSize: '13px', fontWeight: 700, color: textColor }}>
                          {rating}/{maxRating}
                        </span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>•</span>
                        <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>
                          {reviewCount} ({platform})
                        </span>
                      </div>
                    );
                  }

                  // ─── 16. Brand Story ───
                  if (el.type === 'brand-story') {
                    const headline = elProps.headline || 'Crafted with Purpose';
                    const story = elProps.story || 'Born from a desire to elevate everyday experiences through meticulous design and sustainable craftsmanship.';
                    const founder = elProps.founder || '';
                    const year = elProps.year || 'Est. 2024';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textColor }}>{headline}</h5>
                          {year && <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.04em' }}>({year})</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'rgba(255,255,255,0.75)' }}>{story}</p>
                        {founder && <span style={{ fontSize: '12px', fontStyle: 'italic', color: 'rgba(255,255,255,0.6)' }}>— {founder}</span>}
                      </div>
                    );
                  }

                  // ─── 17. Store Locator ───
                  if (el.type === 'store-locator') {
                    const storeTitle = elProps.title || 'Flagship Boutique';
                    const storeAddress = elProps.address || '452 Broadway, SoHo, New York, NY';
                    const hours = elProps.hours || 'Mon–Sat: 10am – 8pm';
                    const ctaText = elProps.ctaText || 'Get Directions';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <MapPin size={15} color="#38bdf8" />
                          <span style={{ fontSize: '13.5px', fontWeight: 600, color: textColor }}>{storeTitle}</span>
                        </div>
                        <span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{storeAddress}</span>
                        {hours && <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>{hours}</span>}
                        {ctaText && (
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '3px', marginTop: '2px', cursor: 'pointer' }}>
                            {ctaText} <ArrowUpRight size={13} />
                          </span>
                        )}
                      </div>
                    );
                  }

                  // ─── 18. WhatsApp Contact ───
                  if (el.type === 'whatsapp-contact') {
                    const phone = elProps.phone || '+1 (555) 019-2834';
                    const label = elProps.label || 'WhatsApp Support';
                    const subtext = elProps.subtext || 'Quick response';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: '24px',
                          backgroundColor: 'rgba(37, 211, 102, 0.12)',
                          border: '1px solid rgba(37, 211, 102, 0.3)',
                          color: '#25D366',
                          cursor: 'pointer',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '8px',
                        }}
                      >
                        <MessageCircle size={18} fill="#25D366" color="#ffffff" />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#ffffff' }}>{label}</span>
                          <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{phone} • {subtext}</span>
                        </div>
                      </div>
                    );
                  }

                  // ─── 19. Support CTA ───
                  if (el.type === 'support-cta') {
                    const title = elProps.title || 'Need Help?';
                    const desc = elProps.description || 'Our concierge team is available around the clock.';
                    const btnText = elProps.buttonText || 'Contact Concierge';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '14px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Headphones size={16} color="#818cf8" />
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>{title}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{desc}</p>
                        <button
                          type="button"
                          style={{
                            marginTop: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#818cf8',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {btnText}
                        </button>
                      </div>
                    );
                  }

                  // ─── 20. Guarantees ───
                  if (el.type === 'guarantees') {
                    const items = Array.isArray(elProps.items)
                      ? elProps.items
                      : ['30-Day Money Back', '100% Authentic Guarantee', 'Free Returns'];

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        {items.map((item: any, i: number) => {
                          const text = typeof item === 'string' ? item : item.text || item.title || '';
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.85)' }}>
                              <ShieldCheck size={15} color="#10b981" />
                              <span>{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // ─── 21. Shipping Highlights ───
                  if (el.type === 'shipping-highlights' || el.type === 'shipping-benefits') {
                    const items = Array.isArray(elProps.items)
                      ? elProps.items
                      : ['Free Express Shipping on Orders $75+', 'Worldwide Dispatch in 24 Hours'];

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        {items.map((item: any, i: number) => {
                          const text = typeof item === 'string' ? item : item.text || item.title || '';
                          return (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'rgba(255,255,255,0.85)' }}>
                              <Truck size={15} color="#38bdf8" />
                              <span>{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // ─── 22. Cash on Delivery ───
                  if (el.type === 'cod-availability') {
                    const title = elProps.title || 'Cash on Delivery Available';
                    const desc = elProps.description || 'Pay securely when your package arrives.';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '8px',
                        }}
                      >
                        <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                          <Banknote size={18} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{title}</span>
                          <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)' }}>{desc}</span>
                        </div>
                      </div>
                    );
                  }

                  // ─── 23. Security Badges ───
                  if (el.type === 'security-badges' || el.type === 'security') {
                    const items = Array.isArray(elProps.items)
                      ? elProps.items
                      : ['256-Bit SSL Encryption', 'PCI-DSS Compliant Checkout'];

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '8px',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '8px',
                        }}
                      >
                        {items.map((item: any, i: number) => {
                          const text = typeof item === 'string' ? item : item.text || item.title || '';
                          return (
                            <div
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                border: '1px solid rgba(255, 255, 255, 0.09)',
                                fontSize: '11.5px',
                                color: 'rgba(255,255,255,0.8)',
                              }}
                            >
                              <Lock size={12} color="#10b981" />
                              <span>{text}</span>
                            </div>
                          );
                        })}
                      </div>
                    );
                  }

                  // ─── 24. Community CTA ───
                  if (el.type === 'community-cta') {
                    const title = elProps.title || 'Join the Community';
                    const desc = elProps.description || 'Access private drops, member perks, and private releases.';
                    const btnText = elProps.buttonText || 'Join 50k+ Members';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(99, 102, 241, 0.08)',
                          border: '1px solid rgba(99, 102, 241, 0.2)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Users size={16} color="#818cf8" />
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: textColor }}>{title}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{desc}</p>
                        <button
                          type="button"
                          style={{
                            marginTop: '4px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {btnText}
                        </button>
                      </div>
                    );
                  }

                  // ─── 25. App Store Badge ───
                  if (el.type === 'app-store-badge') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '6px',
                        }}
                      >
                        <Apple size={22} fill="#ffffff" color="#ffffff" />
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.7)' }}>Download on the</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>App Store</span>
                        </div>
                      </div>
                    );
                  }

                  // ─── 26. Google Play Badge ───
                  if (el.type === 'google-play-badge') {
                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 14px',
                          borderRadius: '8px',
                          backgroundColor: '#000000',
                          color: '#ffffff',
                          border: '1px solid rgba(255,255,255,0.2)',
                          cursor: 'pointer',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '6px',
                        }}
                      >
                        <Play size={20} fill="#ffffff" color="#ffffff" />
                        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: 1.2 }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.04em', color: 'rgba(255,255,255,0.7)' }}>GET IT ON</span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.01em' }}>Google Play</span>
                        </div>
                      </div>
                    );
                  }

                  // ─── 27. Image + Text ───
                  if (el.type === 'image-text') {
                    const imgUrl = elProps.imageUrl;
                    const title = elProps.title || 'Featured Story';
                    const text = elProps.text || 'Discover the craftsmanship and heritage behind every piece.';
                    const layoutMode = elProps.layout || 'vertical';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: layoutMode === 'horizontal' ? 'row' : 'column',
                          gap: '10px',
                          alignItems: layoutMode === 'horizontal' ? 'center' : 'flex-start',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        {imgUrl ? (
                          <img
                            src={imgUrl}
                            alt={title}
                            style={{
                              width: layoutMode === 'horizontal' ? '64px' : '100%',
                              height: layoutMode === 'horizontal' ? '64px' : '110px',
                              borderRadius: '8px',
                              objectFit: 'cover',
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: layoutMode === 'horizontal' ? '64px' : '100%',
                              height: layoutMode === 'horizontal' ? '64px' : '90px',
                              borderRadius: '8px',
                              backgroundColor: 'rgba(255,255,255,0.06)',
                              border: '1px dashed rgba(255,255,255,0.15)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              color: 'rgba(255,255,255,0.4)',
                            }}
                          >
                            Media
                          </div>
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <h5 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: textColor }}>{title}</h5>
                          <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.4 }}>{text}</p>
                        </div>
                      </div>
                    );
                  }

                  // ─── 28. Promo Card ───
                  if (el.type === 'promo-card') {
                    const badge = elProps.badge || 'EXCLUSIVE';
                    const headline = elProps.headline || '20% Off Your First Order';
                    const code = elProps.code || 'WELCOME20';
                    const btnText = elProps.buttonText || 'Claim Offer';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          padding: '14px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 100%)',
                          border: '1px solid rgba(99, 102, 241, 0.25)',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a855f7', backgroundColor: 'rgba(168, 85, 247, 0.15)', padding: '2px 7px', borderRadius: '4px' }}>
                            {badge}
                          </span>
                          {code && (
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', fontWeight: 700, color: '#38bdf8', border: '1px dashed #38bdf8', padding: '1px 6px', borderRadius: '4px' }}>
                              {code}
                            </span>
                          )}
                        </div>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: textColor }}>{headline}</h5>
                        <button
                          type="button"
                          style={{
                            marginTop: '2px',
                            padding: '6px 12px',
                            borderRadius: '6px',
                            backgroundColor: '#6366f1',
                            color: '#ffffff',
                            border: 'none',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            alignSelf: 'flex-start',
                          }}
                        >
                          {btnText}
                        </button>
                      </div>
                    );
                  }

                  // ─── 29. Featured Link ───
                  if (el.type === 'featured-link') {
                    const title = elProps.title || 'Explore Latest Arrivals';
                    const tag = elProps.tag || 'NEW';
                    const desc = elProps.description;

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(255, 255, 255, 0.04)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          opacity: isElVisible ? 1 : 0.45,
                          cursor: 'pointer',
                          marginBottom: '6px',
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 600, color: textColor }}>{title}</span>
                            {tag && (
                              <span style={{ fontSize: '10px', fontWeight: 800, color: '#ec4899', backgroundColor: 'rgba(236, 72, 153, 0.15)', padding: '1px 5px', borderRadius: '3px' }}>
                                {tag}
                              </span>
                            )}
                          </div>
                          {desc && <span style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.6)' }}>{desc}</span>}
                        </div>
                        <ArrowUpRight size={15} color="rgba(255,255,255,0.7)" />
                      </div>
                    );
                  }

                  // ─── 30. Legal Links Group ───
                  if (
                    el.type === 'legal-link-group' ||
                    el.type === 'policy-links' ||
                    el.type === 'privacy' ||
                    el.type === 'terms' ||
                    el.type === 'refund' ||
                    el.type === 'shipping-policy' ||
                    el.type === 'cookie-preferences' ||
                    el.type === 'accessibility'
                  ) {
                    const links = Array.isArray(elProps.links)
                      ? elProps.links
                      : [
                          { label: 'Privacy Policy', url: '/privacy' },
                          { label: 'Terms of Service', url: '/terms' },
                          { label: 'Cookie Preferences', url: '/cookies' },
                        ];
                    const layoutMode = elProps.layout || 'row';
                    const sep = elProps.separator || '•';

                    return (
                      <div
                        key={el.id}
                        onClick={(e) => handleElementClick(e, el)}
                        className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                          isElSelected ? styles.elementSelected : ''
                        }`}
                        style={{
                          display: 'flex',
                          flexDirection: layoutMode === 'column' ? 'column' : 'row',
                          flexWrap: 'wrap',
                          gap: layoutMode === 'column' ? '6px' : '10px',
                          alignItems: 'center',
                          opacity: isElVisible ? 1 : 0.45,
                          marginBottom: '6px',
                        }}
                      >
                        {links.map((link: any, i: number) => (
                          <React.Fragment key={i}>
                            {i > 0 && layoutMode !== 'column' && (
                              <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>{sep}</span>
                            )}
                            <a
                              href={link.url || '#'}
                              onClick={(e) => e.preventDefault()}
                              style={{
                                fontSize: '12px',
                                color: 'rgba(255,255,255,0.65)',
                                textDecoration: 'none',
                                transition: 'color 0.15s ease',
                              }}
                            >
                              {link.label || 'Legal Link'}
                            </a>
                          </React.Fragment>
                        ))}
                      </div>
                    );
                  }

                  // Fallback generic element
                  return (
                    <div
                      key={el.id}
                      onClick={(e) => handleElementClick(e, el)}
                      className={`${isEditorInteractive ? styles.elementEditable : ''} ${
                        isElSelected ? styles.elementSelected : ''
                      }`}
                    >
                      <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                        {el.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  })}
</div>
</footer>
  );
};

export default FooterMainSection;

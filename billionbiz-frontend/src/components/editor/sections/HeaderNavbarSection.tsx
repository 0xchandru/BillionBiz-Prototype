import React, { useState, useMemo } from 'react';
import {
  Search,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { getEditorPath } from '../utils/editorNavigation';
import type { HeaderRow, HeaderElement, HeaderSlotArrangement, ActionItemConfig } from '../engine/types';
import { getDefaultActionItems, renderActionIcon } from '../engine/actionIconLibraries';
import { createDefaultHeaderStack } from '../engine/headerPresets';
import styles from './HeaderSections.module.css';

interface NormalizedNavItem {
  id: string;
  label: string;
  href: string;
  children?: NormalizedNavItem[];
  hasDropdown?: boolean;
  hasMegaMenu?: boolean;
  megaMenu?: { columns?: Array<{ title?: string; items?: Array<{ label?: string; href?: string; url?: string }> }> };
  badge?: string;
}

const normalizeNavItems = (rawItems: any): NormalizedNavItem[] => {
  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item: any, index: number) => {
    const children = item.children || item.items || item.dropdownItems;
    return {
      id: String(item.id || `nav-item-${index}`),
      label: String(item.label || item.name || `Navigation item ${index + 1}`),
      href: String(item.href || item.url || item.link || '#'),
      children: Array.isArray(children) ? normalizeNavItems(children) : undefined,
      hasDropdown: Boolean(item.hasDropdown),
      hasMegaMenu: Boolean(item.hasMegaMenu || item.megaMenu || item.columns),
      megaMenu: item.megaMenu || (item.columns ? { columns: item.columns } : undefined),
      badge: item.badge,
    };
  });
};

interface HeaderNavbarSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
  isSideRail?: boolean;
}

export const HeaderNavbarSection: React.FC<HeaderNavbarSectionProps> = ({
  props: passedProps,
  device: passedDevice,
  isEditorInteractive = true,
  useEditorModel = false,
  isSideRail: propIsSideRail = false,
}) => {
  const navigate = useNavigate();
  const store = useEditorContextStore();
  const { selectedPageId, isRightSidebarOpen, setRightSidebarOpen, navigateToPage, requestEditorSwitch } = useLandingEditorStore();
  const storeDevice = useLandingEditorStore((s) => s.device);
  const { theme, settings } = useSiteStore();
  const storeName = settings?.storeName || 'BillionBiz';

  const device = passedDevice || storeDevice || 'desktop';
  const isEditingHeader = selectedPageId === 'header-global' && isRightSidebarOpen;

  // Derive effective rows & settings considering live variant/preset hover preview
  const isPresetPreviewActive = Boolean(
    store.presetPreview?.isActive && store.presetPreview?.editorType === 'header'
  );
  const persistedRows = (passedProps?._headerEditor?.rows || passedProps?._headerRows) as HeaderRow[] | undefined;
  const persistedSettings = passedProps?._headerEditor?.globalSettings || passedProps?._headerSettings;
  const effectiveRows = isPresetPreviewActive && store.presetPreview?.previewRows
    ? (store.presetPreview.previewRows as HeaderRow[])
    : (useEditorModel && store.headerRows.length > 0 ? store.headerRows : (persistedRows || store.headerRows));
  const effectiveSettings = isPresetPreviewActive && store.presetPreview?.previewSettings
    ? { ...store.headerSettings, ...store.presetPreview.previewSettings }
    : (useEditorModel ? store.headerSettings : (persistedSettings || store.headerSettings));

  // Find row data from store or fallback
  const row: HeaderRow = useMemo(() => {
    const found = effectiveRows.find(
      (r) => r.type === 'primary-nav' || r.id === 'row-primary-nav' || r.id.includes('primary')
    );
    if (found) return found;
    const defaultStack = createDefaultHeaderStack();
    return defaultStack.find((r) => r.type === 'primary-nav') || defaultStack[0];
  }, [effectiveRows]);

  const globalSettings = effectiveSettings;
  const variantId = row.layout?.variantId || 'standard';
  const isSideRail = propIsSideRail || variantId === 'side-rail';
  const isFloating = variantId === 'floating';
  const isTransparent = variantId === 'transparent';

  // Active state / Mobile drawer
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [rowHovered, setRowHovered] = useState(false);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  if (!row.isVisible && !isSideRail) {
    return null;
  }
  if (device === 'desktop' && row.responsive?.showOnDesktop === false) return null;
  if (device === 'mobile' && row.responsive?.showOnMobile === false) return null;

  // Row selection
  const isRowSelected =
    isEditingHeader &&
    isRightSidebarOpen &&
    store.selectedTarget.type === 'row' &&
    store.selectedTarget.editorType === 'header' &&
    (store.selectedTarget.rowId === row.id ||
     store.selectedTarget.rowId === 'header-main' ||
     store.selectedTarget.rowId.includes('primary'));

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive) return;
    e.stopPropagation();
    const executeSelect = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', 'header-main');
        navigate(getEditorPath('header-global', 'header-main'));
        useEditorContextStore.getState().setEditorType('header');
      }
      store.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
      useLandingEditorStore.getState().setSelectedSectionId('header-main');
      setRightSidebarOpen(true);
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: 'header-main',
        targetName: 'Header Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleElementClick = (e: React.MouseEvent, el: HeaderElement) => {
    e.stopPropagation();
    const executeSelect = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', 'header-main');
        navigate(getEditorPath('header-global', 'header-main'));
        useEditorContextStore.getState().setEditorType('header');
      }
      store.selectTarget({
        type: 'element',
        editorType: 'header',
        rowId: row.id,
        elementId: el.id,
        elementType: el.type,
      });
      useLandingEditorStore.getState().setSelectedSectionId('header-main');
      setRightSidebarOpen(true);
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: 'header-main',
        targetName: 'Header Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  // Find standard elements with robust fallbacks
  const logoEl = row.elements.find((e) => e.type === 'logo') || row.elements[0];
  const navEl = row.elements.find(
    (e) => e.type === 'navigation' || e.type === 'primary-nav' || e.type === 'navigation-menu'
  ) || {
    id: 'el-nav-default',
    type: 'navigation' as const,
    name: 'Navigation',
    isVisible: true,
    props: {
      links: [
        { id: 'nav-home', label: 'Home', url: '/' },
        { id: 'nav-shop', label: 'Shop', url: '/shop' },
        { id: 'nav-collections', label: 'Collections', url: '/collections' },
        { id: 'nav-about', label: 'About Us', url: '/about' },
        { id: 'nav-contact', label: 'Contact', url: '/contact' },
      ],
    },
  };
  const searchEl = row.elements.find((e) => e.type === 'search') || {
    id: 'el-search-default',
    type: 'search' as const,
    name: 'Search Bar',
    isVisible: true,
    props: {
      mode: 'large-inline',
      placeholder: 'Search products, collections, brands...',
      showCategoryFilter: true,
    },
  };
  const actionsEl = row.elements.find((e) => e.type === 'actions' || e.type === 'action-group');
  const menuEl = row.elements.find((e) => e.type === 'menu');
  const ctaEl = row.elements.find((e) => e.type === 'cta');
  const cartEl = row.elements.find((e) => e.type === 'cart');

  const actionProps = actionsEl?.props || {};
  const rawNavItems = navEl?.props?.items || navEl?.props?.links;
  const normalizedNavItems = (() => {
    const normalized = normalizeNavItems(rawNavItems);
    return normalized.length > 0 ? normalized : [
      { id: 'home', label: 'Home', href: '/' },
      { id: 'shop', label: 'Shop', href: '/collections/all', hasMegaMenu: true },
      { id: 'categories', label: 'Categories', href: '/collections', children: [{ id: 'all-products', label: 'All Products', href: '/collections' }] },
      { id: 'about', label: 'About', href: '/about' },
      { id: 'contact', label: 'Contact', href: '/contact' },
    ];
  })();

  // Theme colors
  const palette = theme?.palette || (theme as any)?.colors;
  const brandPrimary = palette?.brand?.primary || '#2563eb';
  const themeSurface = palette?.background?.surface || '#ffffff';
  const themeBorder = palette?.border?.border || '#e2e8f0';

  const bgColor = isFloating
    ? (row.styling?.bgGlass ? 'rgba(255, 255, 255, 0.92)' : row.styling?.bgColor || '#ffffff')
    : isTransparent
    ? 'transparent'
    : row.styling?.bgColor || themeSurface;
  const textColor = row.styling?.textColor || '#0f172a';
  const borderColor = row.styling?.borderColor || themeBorder;
  const backgroundImage = row.styling?.bgType === 'gradient'
    ? row.styling.bgGradient
    : row.styling?.bgType === 'image' && row.styling.bgImage
      ? `url(${row.styling.bgImage})`
      : undefined;
  const interactionMode = globalSettings.navInteraction || 'hybrid';
  const openOnHover = interactionMode !== 'click';
  const menuType = globalSettings.mobileMenuType || 'drawer';
  const responsiveHeight = device === 'mobile'
    ? row.layout?.mobileHeight
    : device === 'tablet'
      ? row.layout?.tabletHeight
      : row.layout?.desktopHeight;
  const height = `${responsiveHeight || row.layout?.height || 64}px`;
  const horizontalPadding = row.layout?.responsivePadding?.[device]?.left ?? row.layout?.paddingX ?? 24;

  const renderSearch = () => {
    if (!searchEl) return null;
    const isSelected =
      isEditingHeader &&
      store.selectedTarget.type === 'element' &&
      (store.selectedTarget.elementId === searchEl.id || store.selectedTarget.elementType === 'search');
    const isHovered = hoveredElementId === searchEl.id;
    const searchProps = searchEl.props || {};

    const responsiveArrangement = row.layout?.responsiveArrangement?.[device as 'desktop' | 'tablet' | 'mobile'];
    const isCenterSlot = Boolean(responsiveArrangement?.center?.includes('search'));
    const isLargeSearch =
      isCenterSlot ||
      variantId === 'prominent-search' ||
      row.layout?.arrangementId === 'search-center' ||
      row.layout?.searchPosition === 'center' ||
      searchProps.mode === 'large-inline' ||
      searchProps.mode === 'inline' ||
      searchProps.mode === 'command';

    if (isLargeSearch) {
      return (
        <div
          id="header-search-element"
          className={`${styles.elementEditable} ${isSelected ? styles.elementSelected : isHovered ? styles.elementHovered : ''}`}
          onClick={(event) => handleElementClick(event, searchEl)}
          onMouseEnter={() => setHoveredElementId(searchEl.id)}
          onMouseLeave={() => setHoveredElementId(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: isCenterSlot ? '640px' : '360px',
            margin: isCenterSlot ? '0 auto' : undefined,
            cursor: isEditorInteractive ? 'pointer' : 'default',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              height: '42px',
              backgroundColor: '#f8fafc',
              border: `1.5px solid ${isSelected ? brandPrimary : '#cbd5e1'}`,
              borderRadius: `${searchProps.radius ?? 8}px`,
              padding: '0 4px 0 14px',
              gap: '10px',
              boxShadow: isSelected ? `0 0 0 3px rgba(37, 99, 235, 0.15)` : '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', color: '#64748b', flexShrink: 0 }}>
              <Search size={18} />
            </div>

            {searchProps.showCategoryFilter !== false && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#475569',
                  whiteSpace: 'nowrap',
                  borderRight: '1px solid #e2e8f0',
                  flexShrink: 0,
                }}
              >
                <span>{searchProps.categoryFilterLabel || 'All Categories'}</span>
                <ChevronDown size={12} style={{ opacity: 0.6 }} />
              </div>
            )}

            <div
              style={{
                flex: 1,
                fontSize: '13px',
                color: '#64748b',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {searchProps.placeholder || 'Search products, collections, brands...'}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
              <span
                style={{
                  display: device === 'desktop' ? 'inline-flex' : 'none',
                  alignItems: 'center',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#94a3b8',
                  padding: '2px 6px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                }}
              >
                ⌘K
              </span>
              <button
                type="button"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 16px',
                  height: '34px',
                  backgroundColor: brandPrimary,
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: `${Math.max(4, (searchProps.radius ?? 8) - 2)}px`,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: isEditorInteractive ? 'pointer' : 'default',
                  gap: '6px',
                }}
              >
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    const searchIcon = searchProps.iconUrl ? <img src={searchProps.iconUrl} alt="" style={{ width: 18, height: 18, objectFit: 'contain' }} /> : searchProps.iconType === 'command' ? <span style={{ fontSize: 16, lineHeight: 1 }}>⌘</span> : <Search size={18} />;
    return (
      <div
        id="header-search-element"
        className={`${styles.elementEditable} ${isSelected ? styles.elementSelected : isHovered ? styles.elementHovered : ''}`}
        onClick={(event) => handleElementClick(event, searchEl)}
        onMouseEnter={() => setHoveredElementId(searchEl.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        style={{ display: 'flex', alignItems: 'center', minWidth: 0, cursor: isEditorInteractive ? 'pointer' : 'default' }}
      >
        <button type="button" className={styles.iconBtn} title="Search" aria-label="Search" style={{ color: textColor }}>
          {searchIcon}
        </button>
      </div>
    );
  };

  const renderCta = () => {
    if (!ctaEl || ctaEl.isVisible === false) return null;
    const isSelected =
      isEditingHeader &&
      store.selectedTarget.type === 'element' &&
      (store.selectedTarget.elementId === ctaEl.id || store.selectedTarget.elementType === 'cta');
    const isHovered = hoveredElementId === ctaEl.id;
    const ctaProps = ctaEl.props || {};
    return (
      <button
        type="button"
        className={`${styles.elementEditable} ${isSelected ? styles.elementSelected : isHovered ? styles.elementHovered : ''}`}
        onClick={(event) => { event.stopPropagation(); handleElementClick(event, ctaEl); }}
        onMouseEnter={() => setHoveredElementId(ctaEl.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        style={{ border: `1px solid ${brandPrimary}`, borderRadius: `${ctaProps.radius || 7}px`, padding: '8px 14px', background: ctaProps.variant === 'outline' ? 'transparent' : brandPrimary, color: ctaProps.variant === 'outline' ? brandPrimary : '#ffffff', fontSize: '12px', fontWeight: 700, cursor: isEditorInteractive ? 'pointer' : 'default', whiteSpace: 'nowrap' }}
      >
        {ctaProps.text || ctaProps.label || 'Shop Now'}
      </button>
    );
  };

  // ── Render Logo ──
  const renderLogo = () => {
    if (!logoEl || logoEl.isVisible === false) return null;
    const isElSelected =
      isEditingHeader &&
      store.selectedTarget.type === 'element' &&
      store.selectedTarget.editorType === 'header' &&
      (store.selectedTarget.elementId === logoEl.id || store.selectedTarget.elementType === 'logo');
    const isElHovered = hoveredElementId === logoEl.id;

    const logoProps = logoEl.props || {};
    const logoType = logoProps.logoType || 'both';
    const isTwoLines = Boolean(logoProps.isTwoLines);
    const upperText = logoProps.upperText || logoProps.text || storeName || 'BILLION';
    const lowerText = logoProps.lowerText || 'BIZ COUTURE';
    const logoText = logoProps.text || storeName || 'BillionBiz';

    const logoHeight = logoProps.logoHeight || logoProps.height || 40;
    const logoWidth =
      device === 'mobile'
        ? logoProps.mobileWidth || 110
        : device === 'tablet'
        ? logoProps.tabletWidth || 130
        : logoProps.desktopWidth || 150;
    const imageUrl = logoProps.imageUrl || logoProps.image;

    // Logo shape and frame
    const shape = logoProps.shape || 'none';
    const borderRadius =
      shape === 'circle'
        ? '50%'
        : shape === 'pill'
        ? '9999px'
        : shape === 'rounded'
        ? `${logoProps.borderRadius ?? 8}px`
        : shape === 'square'
        ? '4px'
        : '0px';

    const border =
      logoProps.borderStyle && logoProps.borderStyle !== 'none'
        ? `${logoProps.borderWidth || 1}px ${logoProps.borderStyle} ${logoProps.borderColor || '#cbd5e1'}`
        : 'none';

    const shadow =
      logoProps.shadow === 'soft'
        ? '0 2px 8px rgba(0,0,0,0.06)'
        : logoProps.shadow === 'medium'
        ? '0 4px 14px rgba(0,0,0,0.12)'
        : logoProps.shadow === 'strong'
        ? '0 8px 24px rgba(0,0,0,0.18)'
        : 'none';

    const imagePadding = logoProps.imagePadding ? `${logoProps.imagePadding}px` : '0px';
    const imageBg = logoProps.imageBg || 'transparent';

    // Typography & Colors for Line 1
    const firstLineSize = logoProps.firstLineSize || logoProps.fontSize || 20;
    const firstLineWeight = logoProps.firstLineWeight || logoProps.fontWeight || 800;
    const firstLineColor = logoProps.firstLineColor || logoProps.textColor || logoProps.color || textColor;
    const firstLineSpacing = logoProps.firstLineSpacing || '-0.02em';

    // Typography & Colors for Line 2
    const secondLineSize =
      logoProps.secondLineSize || Math.max(10, Math.round(firstLineSize * 0.58));
    const secondLineWeight = logoProps.secondLineWeight || 600;
    const secondLineColor = logoProps.secondLineColor || logoProps.lowerTextColor || '#64748b';
    const secondLineSpacing = logoProps.secondLineSpacing || '0.08em';

    const logoGap = logoProps.logoGap !== undefined ? `${logoProps.logoGap}px` : '8px';

    return (
      <div
        id="header-logo-element"
        className={`${styles.elementEditable} ${
          isElSelected ? styles.elementSelected : isElHovered ? styles.elementHovered : ''
        }`}
        onClick={(e) => handleElementClick(e, logoEl)}
        onMouseEnter={() => setHoveredElementId(logoEl.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: logoGap,
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {(logoType === 'image' || logoType === 'both') && imageUrl && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: imagePadding,
              backgroundColor: imageBg,
              borderRadius,
              border,
              boxShadow: shadow,
              overflow: 'hidden',
            }}
          >
            <img
              src={imageUrl}
              alt={logoText}
              style={{
                maxWidth: `${logoWidth}px`,
                maxHeight: `${logoHeight}px`,
                height: `${logoHeight}px`,
                objectFit: logoProps.objectFit || 'contain',
                borderRadius: shape === 'circle' ? '50%' : 'inherit',
                display: 'block',
              }}
            />
          </div>
        )}
        {(logoType === 'text' || logoType === 'both' || !imageUrl) && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {isTwoLines ? (
              <>
                <span
                  style={{
                    fontSize: `${firstLineSize}px`,
                    fontWeight: firstLineWeight,
                    color: firstLineColor,
                    letterSpacing: firstLineSpacing,
                    lineHeight: 1.15,
                    fontFamily: logoProps.fontFamily || 'inherit',
                  }}
                >
                  {upperText}
                </span>
                <span
                  style={{
                    fontSize: `${secondLineSize}px`,
                    fontWeight: secondLineWeight,
                    color: secondLineColor,
                    letterSpacing: secondLineSpacing,
                    lineHeight: 1.2,
                    fontFamily: logoProps.fontFamily || 'inherit',
                    textTransform: 'uppercase',
                  }}
                >
                  {lowerText}
                </span>
              </>
            ) : (
              <span
                style={{
                  fontSize: `${firstLineSize}px`,
                  fontWeight: firstLineWeight,
                  color: firstLineColor,
                  letterSpacing: firstLineSpacing,
                  lineHeight: 1.15,
                  fontFamily: logoProps.fontFamily || 'inherit',
                }}
              >
                {logoText}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  // ── Render Navigation Links ──
  const renderNavigation = (customItems?: any[]) => {
    if (device === 'mobile') return null;
    const isElSelected =
      isEditingHeader &&
      store.selectedTarget.type === 'element' &&
      store.selectedTarget.editorType === 'header' &&
      (store.selectedTarget.elementId === navEl.id ||
       store.selectedTarget.elementType === 'navigation' ||
       store.selectedTarget.elementType === 'primary-nav' ||
       store.selectedTarget.elementType === 'navigation-menu');
    const isElHovered = hoveredElementId === navEl.id;

    const items = customItems || normalizedNavItems;

    return (
      <nav
        id="header-nav-element"
        className={`${styles.elementEditable} ${
          isElSelected ? styles.elementSelected : isElHovered ? styles.elementHovered : ''
        }`}
        onClick={(e) => handleElementClick(e, navEl)}
        onMouseEnter={() => setHoveredElementId(navEl.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        style={{
          display: 'flex',
          alignItems: isSideRail ? 'flex-start' : 'center',
          flexDirection: isSideRail ? 'column' : 'row',
          gap: isSideRail ? '12px' : `${row.layout?.desktopGap ?? row.layout?.gap ?? 20}px`,
          padding: '4px 8px',
          width: isSideRail ? '100%' : 'auto',
        }}
      >
        {items.map((item: any) => {
          const hasChildren = item.hasDropdown || item.hasMegaMenu || item.children?.length > 0;
          return (
            <div
              key={item.id || item.label}
              style={{ position: 'relative' }}
              onMouseEnter={() => openOnHover && hasChildren && setActiveDropdown(item.id)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <a
                href={item.href || '#'}
                onClick={(e) => {
                  if (isEditorInteractive) {
                    e.preventDefault();
                    handleElementClick(e, navEl);
                  } else if (hasChildren && interactionMode === 'click') {
                    e.preventDefault();
                    setActiveDropdown(activeDropdown === item.id ? null : item.id);
                  }
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: `${row.styling?.fontSize || 14}px`,
                  fontWeight: row.styling?.fontWeight || 600,
                  color: textColor,
                  textDecoration: 'none',
                  padding: '6px 0',
                  opacity: 0.9,
                  transition: 'opacity 0.15s ease',
                }}
              >
                <span>{item.label}</span>
                {hasChildren && <ChevronDown size={13} style={{ opacity: 0.6 }} />}
              </a>

              {/* Standard Dropdown Menu */}
              {activeDropdown === item.id && !item.hasMegaMenu && (
                <div className={styles.dropdownMenu}>
                  {(item.children || []).map((sub: NormalizedNavItem) => (
                    <a
                      key={sub.id}
                      href={sub.href || '#'}
                      onClick={(e) => isEditorInteractive && e.preventDefault()}
                      style={{
                        display: 'block',
                        padding: '8px 16px',
                        fontSize: '13px',
                        color: '#334155',
                        textDecoration: 'none',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      {sub.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Mega Menu Dropdown */}
              {activeDropdown === item.id && item.hasMegaMenu && (
                <div className={styles.megaMenuContainer}>
                  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(4, Math.max(1, item.megaMenu?.columns?.length || 1))}, 1fr)`, gap: '24px' }}>
                    {(item.megaMenu?.columns?.length ? item.megaMenu.columns : [{ title: item.label, items: item.children || [] }]).map((column: any, columnIndex: number) => (
                      <div key={`${item.id}-column-${columnIndex}`}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '12px' }}>
                          {column.title || `Collection ${columnIndex + 1}`}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(column.items || []).map((link: any, linkIndex: number) => (
                            <a
                              key={link.id || `${item.id}-link-${columnIndex}-${linkIndex}`}
                              href={link.href || link.url || '#'}
                              onClick={(e) => isEditorInteractive && e.preventDefault()}
                              style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none' }}
                            >
                              {link.label || link.name || link.title || String(link)}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  };

  // ── Render Actions ──
  const renderActions = () => {
    const isActionsSelected =
      isEditingHeader &&
      store.selectedTarget.type === 'element' &&
      actionsEl &&
      (store.selectedTarget.elementId === actionsEl.id ||
       store.selectedTarget.elementType === 'actions' ||
       store.selectedTarget.elementType === 'action-group');
    const isActionsHovered = actionsEl && hoveredElementId === actionsEl.id;

    const responsiveArrangement = row.layout?.responsiveArrangement?.[device as 'desktop' | 'tablet' | 'mobile'];
    const isSearchInActiveSlots = responsiveArrangement
      ? Boolean(
          responsiveArrangement.left?.includes('search') ||
          responsiveArrangement.center?.includes('search') ||
          responsiveArrangement.right?.includes('search')
        )
      : false;
    const isSearchInDisabled = Boolean(responsiveArrangement?.disabled?.includes('search'));
    const isSearchDisabled = responsiveArrangement
      ? (isSearchInDisabled || !isSearchInActiveSlots || !searchEl || searchEl.isVisible === false)
      : (!searchEl || searchEl.isVisible === false);

    const items: ActionItemConfig[] = getDefaultActionItems(actionProps);
    const activeItems = items.filter((it) => it.isEnabled !== false);

    const iconColor =
      actionProps.iconColorMode === 'custom' && actionProps.iconColor
        ? actionProps.iconColor
        : actionProps.iconColor || textColor;
    const iconSize = Number(actionProps.iconSize) || 18;
    const gapSpacing =
      actionProps.spacing !== undefined
        ? `${actionProps.spacing}px`
        : isSideRail
        ? '12px'
        : '14px';

    const cartCount =
      actionProps.cartItemCount !== undefined
        ? actionProps.cartItemCount
        : (cartEl?.props?.itemCount ?? 2);
    const showCartBadge = actionProps.showCartBadge !== false;
    const cartBadgeBg = actionProps.cartBadgeBg || brandPrimary;
    const cartBadgeColor = actionProps.cartBadgeColor || '#ffffff';
    const cartBadgeStyle = actionProps.cartBadgeStyle || 'pill';

    return (
      <div
        id="header-actions-element"
        className={`${styles.elementEditable} ${
          isActionsSelected ? styles.elementSelected : isActionsHovered ? styles.elementHovered : ''
        }`}
        onClick={(e) => actionsEl && handleElementClick(e, actionsEl)}
        onMouseEnter={() => actionsEl && setHoveredElementId(actionsEl.id)}
        onMouseLeave={() => setHoveredElementId(null)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: gapSpacing,
          flexDirection: isSideRail ? 'column' : 'row',
          padding: '4px 6px',
        }}
      >
        {activeItems.map((item) => {
          if (item.type === 'search' && !isSearchDisabled) {
            return null;
          }
          const isCart = item.type === 'cart';
          const itemIconColor =
            item.colorMode === 'custom' && item.color
              ? item.color
              : iconColor;

          return (
            <button
              key={item.id}
              type="button"
              className={styles.iconBtn}
              title={item.label}
              aria-label={item.label}
              onClick={(e) => {
                if (actionsEl) handleElementClick(e, actionsEl);
              }}
              style={{
                position: 'relative',
                color: itemIconColor,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {renderActionIcon(item, iconSize, itemIconColor)}

              {isCart && showCartBadge && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-6px',
                    background: cartBadgeBg,
                    color: cartBadgeColor,
                    fontSize: '10px',
                    fontWeight: 700,
                    borderRadius: cartBadgeStyle === 'dot' ? '50%' : cartBadgeStyle === 'square' ? '2px' : '9999px',
                    padding: cartBadgeStyle === 'dot' ? '3px' : '1px 5px',
                    minWidth: cartBadgeStyle === 'dot' ? '7px' : '16px',
                    height: cartBadgeStyle === 'dot' ? '7px' : 'auto',
                    textAlign: 'center',
                    lineHeight: cartBadgeStyle === 'dot' ? '0' : '1.3',
                  }}
                >
                  {cartBadgeStyle !== 'dot' ? cartCount : ''}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  };

  const renderMenuTrigger = () => (
    (menuEl?.isVisible !== false && (menuEl || variantId === 'minimal-hamburger')) ?
    <button
      type="button"
      className={styles.iconBtn}
      onClick={(event) => {
        event.stopPropagation();
        if (menuEl) handleElementClick(event, menuEl);
        else handleRowClick(event);
        setMobileDrawerOpen(true);
      }}
      title="Open Menu"
      aria-label="Open Menu"
      style={{ color: textColor }}
    >
      <Menu size={20} />
    </button> : null
  );

  // ── Render Dynamic Navbar Layout ──
  const renderNavbarLayout = () => {
    const responsiveArrangement = row.layout?.responsiveArrangement?.[device as 'desktop' | 'tablet' | 'mobile'];
    if (responsiveArrangement) {
      const componentMap: Record<string, () => React.ReactNode> = {
        logo: renderLogo,
        navigation: () => renderNavigation(),
        'navigation-left': () => renderNavigation(normalizedNavItems.slice(0, Math.ceil(normalizedNavItems.length / 2))),
        'navigation-right': () => renderNavigation(normalizedNavItems.slice(Math.ceil(normalizedNavItems.length / 2))),
        search: renderSearch,
        actions: renderActions,
        cta: renderCta,
        menu: renderMenuTrigger,
      };
      const leftKeys = responsiveArrangement.left || [];
      const centerKeys = responsiveArrangement.center || [];
      const rightKeys = responsiveArrangement.right || [];

      const hasLeft = leftKeys.length > 0;
      const hasCenter = centerKeys.length > 0;
      const hasRight = rightKeys.length > 0;

      const gapVal = `${row.layout?.[`${device}Gap` as 'desktopGap' | 'tabletGap' | 'mobileGap'] || row.layout?.gap || 16}px`;
      const maxWidth =
        row.layout?.container === 'full' || row.layout?.container === 'edge-to-edge'
          ? '100%'
          : row.layout?.container === 'boxed'
          ? '1120px'
          : '1280px';

      const renderSlot = (slot: keyof HeaderSlotArrangement, customJustify?: string, customStyle?: React.CSSProperties) => {
        const keys = responsiveArrangement[slot] || [];
        if (keys.length === 0) return null;
        return (
          <div
            key={slot}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: customJustify || (slot === 'left' ? 'flex-start' : slot === 'right' ? 'flex-end' : 'center'),
              gap: gapVal,
              minWidth: 0,
              flex: slot === 'center' && !customJustify ? 1 : '0 1 auto',
              ...customStyle,
            }}
          >
            {keys.map((componentKey) => {
              const renderComponent = componentMap[componentKey];
              return renderComponent ? <React.Fragment key={componentKey}>{renderComponent()}</React.Fragment> : null;
            })}
          </div>
        );
      };

      // Case 1: Exactly 2 visible containers have child items
      if (hasLeft && hasRight && !hasCenter) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('left', 'flex-start', { flex: '1 1 auto', minWidth: 0 })}
            {renderSlot('right', 'flex-end', { flex: '0 0 auto' })}
          </div>
        );
      }

      if (!hasLeft && hasCenter && hasRight) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('center', centerKeys.includes('search') ? 'center' : 'flex-start', { flex: '1 1 auto', minWidth: 0, width: centerKeys.includes('search') ? '100%' : undefined, maxWidth: centerKeys.includes('search') ? '640px' : undefined, margin: centerKeys.includes('search') ? '0 16px' : undefined })}
            {renderSlot('right', 'flex-end', { flex: '0 0 auto' })}
          </div>
        );
      }

      if (hasLeft && hasCenter && !hasRight) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('left', 'flex-start', { flex: '0 0 auto' })}
            {renderSlot('center', centerKeys.includes('search') ? 'center' : 'flex-end', { flex: '1 1 auto', minWidth: 0, width: centerKeys.includes('search') ? '100%' : undefined, maxWidth: centerKeys.includes('search') ? '640px' : undefined, margin: centerKeys.includes('search') ? '0 16px' : undefined })}
          </div>
        );
      }

      // Case 2: Only 1 visible container has items
      if (hasLeft && !hasCenter && !hasRight) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('left', 'flex-start')}
          </div>
        );
      }

      if (!hasLeft && hasCenter && !hasRight) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('center', 'center')}
          </div>
        );
      }

      if (!hasLeft && !hasCenter && hasRight) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('right', 'flex-end')}
          </div>
        );
      }

      // Case 3: All 3 visible containers have child items
      // 3A: Prominent Search in center container -> wide, expansive searchbar
      if (centerKeys.includes('search')) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
            {renderSlot('left', 'flex-start', { flex: '0 0 auto' })}
            {renderSlot('center', 'center', { flex: '1 1 auto', width: '100%', maxWidth: '640px', margin: '0 16px' })}
            {renderSlot('right', 'flex-end', { flex: '0 0 auto' })}
          </div>
        );
      }

      // 3B: Centered brand masthead -> symmetrical grid so logo is 100% centered
      if (centerKeys.includes('logo')) {
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', width: '100%', maxWidth, margin: '0 auto', gap: '20px' }}>
            {renderSlot('left', 'flex-start')}
            {renderSlot('center', 'center')}
            {renderSlot('right', 'flex-end')}
          </div>
        );
      }

      // 3C: Standard balanced navbar (Nav in Center) -> flex: 1 1 auto so navigation never gets squished
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth, margin: '0 auto', gap: gapVal }}>
          {renderSlot('left', 'flex-start', { flex: '0 0 auto' })}
          {renderSlot('center', 'center', { flex: '1 1 auto', minWidth: 0 })}
          {renderSlot('right', 'flex-end', { flex: '0 0 auto' })}
        </div>
      );
    }
    const logoPos = row.layout?.logoPosition || 'left';
    const navPos = row.layout?.navPosition || 'center';
    const allNavItems = normalizedNavItems;

    // Minimal Hamburger Variant
    if (variantId === 'minimal-hamburger') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: row.layout?.container === 'boxed' ? '1024px' : '1240px',
            margin: '0 auto',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              className={styles.hamburgerBtn}
              onClick={(e) => {
                e.stopPropagation();
                setMobileDrawerOpen(true);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '36px',
                height: '36px',
                borderRadius: '6px',
                border: `1px solid ${borderColor}`,
                background: 'transparent',
                color: textColor,
                cursor: 'pointer',
              }}
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
            {renderLogo()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderActions()}
          </div>
        </div>
      );
    }

    // Split Nav: Logo Center with Nav split evenly left & right
    if (logoPos === 'center' && navPos === 'split') {
      const mid = Math.ceil(allNavItems.length / 2);
      const leftItems = allNavItems.slice(0, mid);
      const rightItems = allNavItems.slice(mid);

      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            maxWidth: row.layout?.container === 'boxed' ? '1024px' : '1240px',
            margin: '0 auto',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '20px' }}>
            {renderNavigation(leftItems)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderLogo()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
            {renderNavigation(rightItems)}
            {renderActions()}
          </div>
        </div>
      );
    }

    // Centered Logo: Nav Left, Logo Center, Actions Right
    if (logoPos === 'center') {
      return (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            width: '100%',
            maxWidth: row.layout?.container === 'boxed' ? '1024px' : '1240px',
            margin: '0 auto',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '20px' }}>
            {navPos !== 'right' && renderNavigation()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {renderLogo()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
            {navPos === 'right' && renderNavigation()}
            {renderActions()}
          </div>
        </div>
      );
    }

    // Logo Right: Actions Left, Nav Center, Logo Right
    if (logoPos === 'right') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            maxWidth: row.layout?.container === 'boxed' ? '1024px' : '1240px',
            margin: '0 auto',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderActions()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {renderNavigation()}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            {renderLogo()}
          </div>
        </div>
      );
    }

    // Default: Logo Left, Nav Center / Left, Actions Right
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: row.layout?.container === 'boxed' ? '1024px' : '1240px',
          margin: '0 auto',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {renderLogo()}
          {navPos === 'left' && renderNavigation()}
        </div>

        {navPos !== 'left' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            {renderNavigation()}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renderActions()}
        </div>
      </div>
    );
  };

  // ── SIDE RAIL DESKTOP LAYOUT ──
  if (isSideRail) {
    return (
      <aside
        id={`header-row-${row.id}`}
        data-header-row-id={row.id}
        data-header-row-type="primary-nav"
          className={`${styles.headerRow} ${row.styling?.customClass || ''} ${globalSettings.customClasses || ''} ${isEditorInteractive ? styles.headerRowEditable : ''} ${
          isRowSelected && isEditingHeader ? styles.headerRowSelected : ''
        } ${rowHovered && !isRowSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
        onClick={handleRowClick}
        onMouseEnter={() => setRowHovered(true)}
        onMouseLeave={() => setRowHovered(false)}
        style={{
          width: '240px',
          minWidth: '240px',
          height: '100vh',
          backgroundColor: bgColor,
          backgroundImage,
          backgroundSize: row.styling?.bgSize || 'cover',
          backgroundPosition: row.styling?.bgPosition || 'center',
          opacity: row.styling?.bgOpacity ?? 1,
          color: textColor,
          borderRight: `1px solid ${borderColor}`,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          position: 'sticky',
          top: 0,
          zIndex: 40,
          boxSizing: 'border-box',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {renderLogo()}
          {renderNavigation()}
        </div>
        <div style={{ borderTop: `1px solid ${borderColor}`, paddingTop: '16px' }}>
          {renderActions()}
        </div>
      </aside>
    );
  }

  // ── STANDARD / FLOATING / TRANSPARENT NAVBAR ──
  return (
    <>
      <header
        id={`header-row-${row.id}`}
        data-header-row-id={row.id}
        data-header-row-type="primary-nav"
        className={`${styles.headerRow} ${isEditorInteractive ? styles.headerRowEditable : ''} ${
          isRowSelected && isEditingHeader ? styles.headerRowSelected : ''
        } ${rowHovered && !isRowSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
        onClick={handleRowClick}
        onMouseEnter={() => setRowHovered(true)}
        onMouseLeave={() => setRowHovered(false)}
        style={{
          backgroundColor: bgColor,
          color: textColor,
          minHeight: height,
          backdropFilter: isFloating || row.styling?.bgGlass ? 'blur(16px)' : undefined,
          borderBottom: isFloating ? '1px solid rgba(226, 232, 240, 0.85)' : row.styling?.borderBottom !== false ? `1px solid ${borderColor}` : 'none',
          borderTop: isFloating ? '1px solid rgba(226, 232, 240, 0.85)' : 'none',
          borderLeft: isFloating ? '1px solid rgba(226, 232, 240, 0.85)' : 'none',
          borderRight: isFloating ? '1px solid rgba(226, 232, 240, 0.85)' : 'none',
          borderRadius: isFloating ? '9999px' : row.styling?.radius ? `${row.styling.radius}px` : 0,
          boxShadow: isFloating
            ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            : row.styling?.shadow === 'soft'
            ? '0 2px 4px rgba(0,0,0,0.04)'
            : 'none',
          maxWidth: isFloating ? 'min(1240px, calc(100% - 32px))' : '100%',
          marginTop: isFloating ? '14px' : 0,
          marginBottom: isFloating ? '14px' : 0,
          marginLeft: isFloating ? 'auto' : 0,
          marginRight: isFloating ? 'auto' : 0,
          position: globalSettings?.stickyHeader !== false ? 'sticky' : 'relative',
          top: isFloating ? '14px' : 0,
          zIndex: 35,
          padding: isFloating ? '0 28px' : `0 ${horizontalPadding}px`,
          transition: globalSettings.transitions === 'none' ? 'none' : `all ${globalSettings.transitionDuration || 200}ms ${globalSettings.transitionEasing || 'ease'}`,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {renderNavbarLayout()}
      </header>

      {/* ── MOBILE DRAWER NAVIGATION ── */}
      {mobileDrawerOpen && (
        <div className={styles.mobileDrawerOverlay} onClick={() => setMobileDrawerOpen(false)}>
          <div
            className={styles.mobileDrawerContent}
            onClick={(e) => e.stopPropagation()}
            style={menuType === 'full-screen'
              ? { width: '100%', height: '100%', maxWidth: 'none', borderRadius: 0 }
              : menuType === 'bottom-sheet'
                ? { width: '100%', maxWidth: 'none', alignSelf: 'flex-end', borderRadius: '18px 18px 0 0' }
                : undefined}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <span style={{ fontWeight: 700, fontSize: '16px', color: '#0f172a' }}>Menu</span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {normalizedNavItems.map((item) => (
                <div key={item.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px' }}>
                  <a
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    style={{ fontSize: '15px', fontWeight: 600, color: '#1e293b', textDecoration: 'none', padding: '8px 0' }}
                  >
                    {item.label}
                  </a>
                  {item.children?.map((child) => (
                    <a
                      key={child.id}
                      href={child.href}
                      onClick={() => setMobileDrawerOpen(false)}
                      style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', paddingLeft: '12px' }}
                    >
                      {child.label}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HeaderNavbarSection;

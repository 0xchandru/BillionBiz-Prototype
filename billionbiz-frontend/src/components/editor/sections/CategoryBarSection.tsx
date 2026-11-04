import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getEditorPath } from '../utils/editorNavigation';
import {
  Grid, Sparkles, Flame, Smartphone, ShoppingBag, Heart, Store, Tag, Zap, Star,
  Monitor, ChevronLeft, ChevronRight, ChevronDown, Package, Globe,
  Phone, Mail, Truck, Gift, MapPin, HelpCircle, CreditCard, User, Lock,
} from 'lucide-react';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { createDefaultHeaderStack } from '../engine/headerPresets';
import type { HeaderRow } from '../engine/types';
import {
  resolveSecondaryNavData,
  type SecondaryNavData,
  type NavigationItem,
  type NavIconConfig,
} from '../engine/secondaryNavModel';
import styles from './HeaderSections.module.css';

// ─── Icon renderer ──────────────────────────────────────────
const renderNavIcon = (icon?: NavIconConfig, size?: number, color?: string): React.ReactNode => {
  if (!icon || icon.source === 'none') return null;
  const s = size || icon.size || 16;
  const c = color || icon.color;
  const style = c ? { color: c } : undefined;
  const sw = icon.strokeWidth || 2;

  if (icon.source === 'custom' || icon.source === 'upload') {
    if (icon.customSvgOrUrl) {
      return <img src={icon.customSvgOrUrl} alt="" style={{ width: s, height: s, objectFit: 'contain' }} />;
    }
    return null;
  }

  const name = (icon.iconName || '').toLowerCase();
  switch (name) {
    case 'grid': return <Grid size={s} style={style} strokeWidth={sw} />;
    case 'sparkles': return <Sparkles size={s} style={style} strokeWidth={sw} />;
    case 'flame': return <Flame size={s} style={style} strokeWidth={sw} />;
    case 'smartphone': return <Smartphone size={s} style={style} strokeWidth={sw} />;
    case 'shoppingbag': return <ShoppingBag size={s} style={style} strokeWidth={sw} />;
    case 'heart': return <Heart size={s} style={style} strokeWidth={sw} />;
    case 'store': return <Store size={s} style={style} strokeWidth={sw} />;
    case 'tag': return <Tag size={s} style={style} strokeWidth={sw} />;
    case 'zap': return <Zap size={s} style={style} strokeWidth={sw} />;
    case 'star': return <Star size={s} style={style} strokeWidth={sw} />;
    case 'monitor': return <Monitor size={s} style={style} strokeWidth={sw} />;
    case 'package': return <Package size={s} style={style} strokeWidth={sw} />;
    case 'globe': return <Globe size={s} style={style} strokeWidth={sw} />;
    case 'phone': return <Phone size={s} style={style} strokeWidth={sw} />;
    case 'mail': return <Mail size={s} style={style} strokeWidth={sw} />;
    case 'truck': return <Truck size={s} style={style} strokeWidth={sw} />;
    case 'gift': return <Gift size={s} style={style} strokeWidth={sw} />;
    case 'mappin': return <MapPin size={s} style={style} strokeWidth={sw} />;
    case 'helpcircle': return <HelpCircle size={s} style={style} strokeWidth={sw} />;
    case 'creditcard': return <CreditCard size={s} style={style} strokeWidth={sw} />;
    case 'user': return <User size={s} style={style} strokeWidth={sw} />;
    case 'lock': return <Lock size={s} style={style} strokeWidth={sw} />;
    default: return <Grid size={s} style={style} strokeWidth={sw} />;
  }
};

interface CategoryBarSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const CategoryBarSection: React.FC<CategoryBarSectionProps> = ({
  props: passedProps,
  device: _passedDevice,
  isEditorInteractive = true,
  useEditorModel = false,
}) => {
  const navigate = useNavigate();
  const store = useEditorContextStore();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, isRightSidebarOpen, requestEditorSwitch } = useLandingEditorStore();
  const { theme } = useSiteStore();

  const isEditingHeader = selectedPageId === 'header-global';

  const previewRows = store.presetPreview?.isActive && store.presetPreview.editorType === 'header'
    ? store.presetPreview.previewRows as HeaderRow[] | undefined
    : undefined;
  const persistedRows = (passedProps?._headerEditor?.rows || passedProps?._headerRows) as HeaderRow[] | undefined;
  const effectiveRows = previewRows || (useEditorModel ? store.headerRows : (persistedRows || store.headerRows));

  const row: HeaderRow = useMemo(() => {
    const found = effectiveRows.find(
      (r) => r.type === 'secondary-nav' || r.id === 'row-secondary-nav' || r.id.includes('secondary') || r.id.includes('category')
    );
    if (found) return found;
    const defaultStack = createDefaultHeaderStack();
    const fallback = defaultStack.find((r) => r.type === 'secondary-nav') || defaultStack[0];
    if (passedProps && fallback.elements[0]) {
      return {
        ...fallback,
        elements: [{ ...fallback.elements[0], props: { ...fallback.elements[0].props, ...passedProps } }],
      };
    }
    return fallback;
  }, [effectiveRows, passedProps]);

  const themePalette = theme?.palette || (theme as any)?.colors;

  const location = useLocation();

  // Resolve full navigation data from model
  const navData: SecondaryNavData = useMemo(() => {
    return resolveSecondaryNavData(row, passedProps, themePalette);
  }, [row, passedProps, themePalette]);

  const { look, content, layout, design, behavior } = navData;
  const items = content.items.filter((item) => item.enabled);
  const secondaryItems = content.secondaryItems?.filter((item) => item.enabled) || [];

  const [hovered, setHovered] = useState(false);

  // Active matching logic: only mark active/underlined if the link matches the current page
  const isItemActive = (item: NavigationItem): boolean => {
    if (item.isActive) return true;
    if (activeCategory && activeCategory === item.id) return true;

    const currentPath = (location?.pathname || window?.location?.pathname || '/').toLowerCase().trim();
    const rawHref = (item.href || '').toLowerCase().trim();

    if (!rawHref || rawHref === '#') return false;

    const cleanHref = rawHref.replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') || '/';
    const cleanPath = currentPath.replace(/\/+$/, '') || '/';

    // 1. Direct path match
    if (cleanHref === cleanPath && cleanHref !== '/') return true;

    // 2. Editor page id match (e.g. selectedPageId is 'shop' and link is /shop or /collections/all)
    if (selectedPageId && selectedPageId !== 'header-global') {
      const pageSlug = selectedPageId.replace(/-page$/, '');
      const hrefSlug = cleanHref.replace(/^\//, '');
      if (pageSlug && hrefSlug && (pageSlug === hrefSlug || pageSlug.includes(hrefSlug) || hrefSlug.includes(pageSlug))) {
        return true;
      }
    }

    return false;
  };

  const [activeCategory, setActiveCategory] = useState<string>(() => {
    // Only activate if a link actually matches the current page! Do NOT default to items[0].id
    const currentPath = (window?.location?.pathname || '/').toLowerCase().trim();
    const match = items.find((i) => {
      const h = (i.href || '').toLowerCase().trim().replace(/^https?:\/\/[^/]+/, '').replace(/\/+$/, '') || '/';
      return h === currentPath && h !== '/';
    });
    return match?.id || '';
  });
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const openDropdownItem = useMemo(() => {
    return items.find((i) => i.id === openDropdownId);
  }, [items, openDropdownId]);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  if (!row.isVisible || !content.enabled) {
    return null;
  }

  // Selection & Hover
  const isSelected =
    isEditingHeader &&
    isRightSidebarOpen &&
    store.selectedTarget.type === 'row' &&
    store.selectedTarget.editorType === 'header' &&
    (store.selectedTarget.rowId === row.id ||
     store.selectedTarget.rowId === 'category-bar' ||
     store.selectedTarget.rowId === 'secondary-nav' ||
     store.selectedTarget.rowId.includes('secondary') ||
     store.selectedTarget.rowId.includes('category'));

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive) return;
    e.stopPropagation();
    const executeSelect = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', 'category-bar');
        navigate(getEditorPath('header-global', 'category-bar'));
        useEditorContextStore.getState().setEditorType('header');
      }
      store.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
      useLandingEditorStore.getState().setSelectedSectionId('category-bar');
      setRightSidebarOpen(true);
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: 'category-bar',
        targetName: 'Header Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleScrollLeft = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -(layout.scrollAmount || 200), behavior: 'smooth' });
    }
  };

  const handleScrollRight = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: layout.scrollAmount || 200, behavior: 'smooth' });
    }
  };

  const brandPrimary = design.indicatorColor || themePalette?.brand?.primary || '#2563eb';
  const bgColor = design.bgColorMode === 'custom' ? design.bgColor : (row.styling?.bgColor || '#ffffff');
  const textColor = design.textColorMode === 'custom' ? design.textColor : (row.styling?.textColor || '#334155');
  const activeTextColor = design.activeTextColorMode === 'custom' ? design.activeTextColor : brandPrimary;
  const iconColor = design.iconColorMode === 'custom' ? design.iconColor : '#64748b';
  const iconActiveColor = design.iconActiveColorMode === 'custom' ? design.iconActiveColor : brandPrimary;

  // Render based on look
  const renderItem = (item: NavigationItem, isSecondaryRow = false) => {
    const isActive = isItemActive(item);
    const itemKey = `nav-${item.id}-${isSecondaryRow ? 'sec' : 'pri'}`;

    // === ICON ABOVE + LABEL BELOW ===
    if (look === 'icon_label') {
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${layout.iconLabelGap}px`,
            padding: `${layout.itemPaddingY}px ${layout.itemPaddingX}px`,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative',
            minWidth: '60px',
          }}
        >
          <div style={{ color: isActive ? iconActiveColor : iconColor, transition: 'color 0.15s ease' }}>
            {renderNavIcon(item.icon, layout.iconSize, isActive ? iconActiveColor : iconColor)}
          </div>
          <span style={{
            fontSize: `${design.fontSize}px`,
            fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
            color: isActive ? activeTextColor : textColor,
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            textTransform: design.textTransform as any,
          }}>
            {item.label}
          </span>
          {isActive && design.indicatorType !== 'none' && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: design.indicatorWidthMode === 'full' ? 0 : '20%',
              right: design.indicatorWidthMode === 'full' ? 0 : '20%',
              height: `${design.indicatorThickness}px`,
              backgroundColor: design.indicatorColor,
              borderRadius: `${design.indicatorRadius}px`,
              transition: 'all 0.2s ease',
            }} />
          )}
        </button>
      );
    }

    // === PILL / CHIP / FILTER ===
    if (look === 'pill_tabs' || look === 'filter_chip') {
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: `${layout.itemPaddingY}px ${layout.itemPaddingX}px`,
            borderRadius: look === 'pill_tabs' ? '9999px' : '6px',
            fontSize: `${design.fontSize}px`,
            fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
            backgroundColor: isActive ? brandPrimary : '#f1f5f9',
            color: isActive ? '#ffffff' : textColor,
            border: isActive ? `1px solid ${brandPrimary}` : '1px solid #e2e8f0',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          {item.icon && renderNavIcon(item.icon, 12, isActive ? '#ffffff' : iconColor)}
          <span>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: '9px', fontWeight: 800,
              backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (item.badgeColor || '#ef4444'),
              color: '#ffffff', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase',
            }}>{item.badge}</span>
          )}
        </button>
      );
    }

    // === BACKGROUND HIGHLIGHT ===
    if (look === 'bg_highlight') {
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: `${layout.itemPaddingY}px ${layout.itemPaddingX}px`,
            borderRadius: `${design.itemBorderRadius}px`,
            fontSize: `${design.fontSize}px`,
            fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
            backgroundColor: isActive ? (design.activeBgColorMode === 'custom' ? design.activeBgColor : brandPrimary) : 'transparent',
            color: isActive ? '#ffffff' : textColor,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
          }}
        >
          <span>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: '9px', fontWeight: 800,
              backgroundColor: isActive ? 'rgba(255,255,255,0.25)' : (item.badgeColor || '#ef4444'),
              color: '#ffffff', padding: '1px 5px', borderRadius: '4px',
            }}>{item.badge}</span>
          )}
        </button>
      );
    }

    // === ICON + TEXT (inline icon left) ===
    if (look === 'icon_text' || look === 'promo_rail') {
      return (
        <a
          key={itemKey}
          href={item.href || '#'}
          onClick={(e) => {
            if (isEditorInteractive) { e.preventDefault(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: `${layout.itemPaddingY}px 0`,
            fontSize: `${design.fontSize}px`,
            fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
            color: isActive ? activeTextColor : textColor,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            position: 'relative',
            borderBottom: isActive && design.indicatorType === 'underline' ? `${design.indicatorThickness}px solid ${design.indicatorColor}` : `${design.indicatorThickness}px solid transparent`,
          }}
        >
          {item.icon && renderNavIcon(item.icon, 14, isActive ? activeTextColor : iconColor)}
          <span>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: '9px', fontWeight: 800, backgroundColor: item.badgeColor || '#ef4444',
              color: '#ffffff', padding: '1px 5px', borderRadius: '4px',
            }}>{item.badge}</span>
          )}
        </a>
      );
    }

    // === ICON ONLY ===
    if (look === 'icon_only') {
      return (
        <button
          key={itemKey}
          type="button"
          title={item.label}
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: isActive ? (design.activeBgColor || '#eff6ff') : 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            color: isActive ? iconActiveColor : iconColor,
          }}
        >
          {renderNavIcon(item.icon, layout.iconSize, isActive ? iconActiveColor : iconColor)}
        </button>
      );
    }

    // === COMPACT DROPDOWN ===
    if (look === 'compact_dropdown') {
      return null; // Handled separately in the container
    }

    // === FULL WIDTH TABS ===
    if (look === 'full_width_tabs') {
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: `${layout.itemPaddingY + 2}px ${layout.itemPaddingX}px`,
            fontSize: `${design.fontSize}px`,
            fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
            color: isActive ? activeTextColor : textColor,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            whiteSpace: 'nowrap',
            position: 'relative',
            borderBottom: isActive ? `${design.indicatorThickness}px solid ${design.indicatorColor}` : `${design.indicatorThickness}px solid transparent`,
          }}
        >
          <span>{item.label}</span>
          {item.badge && (
            <span style={{
              fontSize: '9px', fontWeight: 800, backgroundColor: item.badgeColor || '#ef4444',
              color: '#ffffff', padding: '1px 5px', borderRadius: '4px',
            }}>{item.badge}</span>
          )}
        </button>
      );
    }

    // === IMAGE CATEGORY NAVIGATION ===
    if (look === 'image_category') {
      const fallbackImg = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=160&auto=format&fit=crop&q=80';
      const imgUrl = item.image?.url || fallbackImg;
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: `${layout.iconLabelGap || 8}px`,
            padding: `${layout.itemPaddingY}px ${layout.itemPaddingX}px`,
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            position: 'relative',
            minWidth: '64px',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: `${(layout.iconSize || 20) * 2}px`,
              height: `${(layout.iconSize || 20) * 2}px`,
              borderRadius: `${item.image?.borderRadius ?? 9999}px`,
              overflow: 'hidden',
              boxShadow: isActive ? `0 0 0 2px ${brandPrimary}` : '0 1px 3px rgba(0,0,0,0.1)',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
          >
            <img
              src={imgUrl}
              alt={item.label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transform: isActive || (item.image?.hoverZoom !== false) ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.2s ease',
              }}
            />
          </div>
          <span
            style={{
              fontSize: `${design.fontSize}px`,
              fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
              color: isActive ? activeTextColor : textColor,
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
              textTransform: design.textTransform as any,
            }}
          >
            {item.label}
          </span>
          {isActive && design.indicatorType !== 'none' && (
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: design.indicatorWidthMode === 'full' ? 0 : '15%',
                right: design.indicatorWidthMode === 'full' ? 0 : '15%',
                height: `${design.indicatorThickness}px`,
                backgroundColor: design.indicatorColor,
                borderRadius: `${design.indicatorRadius}px`,
                transition: 'all 0.2s ease',
              }}
            />
          )}
        </button>
      );
    }

    // === CATEGORY CARDS ===
    if (look === 'category_cards') {
      const fallbackImg = 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=160&auto=format&fit=crop&q=80';
      const imgUrl = item.image?.url || fallbackImg;
      return (
        <button
          key={itemKey}
          type="button"
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
            setActiveCategory(item.id);
          }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: `${layout.itemPaddingY || 10}px ${layout.itemPaddingX || 14}px`,
            borderRadius: `${design.itemBorderRadius || 10}px`,
            border: isActive ? `1.5px solid ${brandPrimary}` : `1px solid ${design.borderColor || '#e2e8f0'}`,
            backgroundColor: isActive ? (design.activeBgColor || '#f8fafc') : '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            minWidth: '100px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '60px',
              height: '48px',
              borderRadius: '6px',
              overflow: 'hidden',
              marginBottom: '6px',
            }}
          >
            <img
              src={imgUrl}
              alt={item.label}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <span
            style={{
              fontSize: `${design.fontSize}px`,
              fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
              color: isActive ? activeTextColor : textColor,
              whiteSpace: 'nowrap',
            }}
          >
            {item.label}
          </span>
          {item.count !== undefined && item.count > 0 && (
            <span style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>
              {item.count} items
            </span>
          )}
          {item.badge && (
            <span
              style={{
                marginTop: '4px',
                fontSize: '9px',
                fontWeight: 700,
                color: '#ffffff',
                backgroundColor: item.badgeColor || '#ef4444',
                padding: '1px 6px',
                borderRadius: '4px',
              }}
            >
              {item.badge}
            </span>
          )}
        </button>
      );
    }

    // === DEFAULT / TEXT LINKS (minimal, active_underline, centered, scrollable, border_indicator, etc.) ===
    return (
      <a
        key={itemKey}
        href={item.href || '#'}
        onMouseEnter={() => {
          if (look === 'mega_menu' || look === 'mega_banner' || look === 'icon_text_dropdown') {
            setOpenDropdownId(item.id);
          }
        }}
        onClick={(e) => {
          if (isEditorInteractive) { e.preventDefault(); handleClick(e); }
          setActiveCategory(item.id);
          if (look === 'mega_menu' || look === 'mega_banner' || look === 'icon_text_dropdown') {
            setOpenDropdownId(openDropdownId === item.id ? null : item.id);
          }
        }}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: `${layout.itemPaddingY}px 0`,
          fontSize: `${design.fontSize}px`,
          fontWeight: isActive ? design.activeFontWeight : design.fontWeight,
          color: isActive ? activeTextColor : textColor,
          textDecoration: 'none',
          position: 'relative',
          whiteSpace: 'nowrap',
          borderBottom: (isActive && (look === 'active_underline' || look === 'border_indicator' || look === 'centered' || look === 'scrollable_rail' || look === 'brand_theme' || look === 'gradient' || look === 'sticky_nav'))
            ? `${design.indicatorThickness}px solid ${design.indicatorColor}` : `${design.indicatorThickness}px solid transparent`,
          transition: 'all 0.15s ease',
          textTransform: design.textTransform as any,
        }}
      >
        {item.icon && (look === 'icon_text_dropdown' || look === 'mega_menu' || look === 'mega_banner') &&
          renderNavIcon(item.icon, 14, isActive ? activeTextColor : iconColor)
        }
        <span>{item.label}</span>
        {item.badge && (
          <span style={{
            fontSize: '9px', fontWeight: 800,
            backgroundColor: item.badgeColor || '#ef4444',
            color: '#ffffff', padding: '1px 5px', borderRadius: '4px', textTransform: 'uppercase',
          }}>{item.badge}</span>
        )}
        {(look === 'icon_text_dropdown' || look === 'mega_menu' || look === 'mega_banner') && (
          <ChevronDown size={12} style={{ opacity: 0.6, transform: openDropdownId === item.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
        )}
      </a>
    );
  };

  const isMobile = _passedDevice === 'mobile' || _passedDevice === 'mobile-sm';
  const paddingX = isMobile && layout.mobilePaddingX !== undefined ? layout.mobilePaddingX : layout.paddingX;
  const paddingY = isMobile && layout.mobilePaddingY !== undefined ? layout.mobilePaddingY : layout.paddingY;

  // Sticky behavior
  const stickyMode = behavior?.stickyMode || 'normal';
  const isStickyHeader = stickyMode === 'sticky_header' || stickyMode === 'sticky';
  const isStickyTop = stickyMode === 'sticky_top';
  const isFixed = stickyMode === 'fixed';

  // Container style
  const containerStyle: React.CSSProperties = {
    backgroundColor: bgColor,
    color: textColor,
    minHeight: `${layout.barHeight}px`,
    borderBottom: design.borderPosition !== 'none' ? `${design.borderWidth}px ${design.borderStyle} ${design.borderColor}` : 'none',
    borderTop: (design.borderPosition === 'top' || design.borderPosition === 'both') ? `${design.borderWidth}px ${design.borderStyle} ${design.borderColor}` : 'none',
    display: 'flex',
    alignItems: 'center',
    position: isStickyHeader || isStickyTop ? 'sticky' : isFixed ? 'fixed' : 'relative',
    top: isStickyHeader ? 'var(--header-main-height, 0px)' : isStickyTop || isFixed ? 0 : undefined,
    left: isFixed ? 0 : undefined,
    right: isFixed ? 0 : undefined,
    zIndex: isFixed ? 50 : isStickyTop ? 40 : isStickyHeader ? 35 : 18,
    padding: `${paddingY}px ${paddingX}px`,
    overflow: openDropdownId ? 'visible' : 'hidden',
    fontFamily: design.fontFamily !== 'inherit' ? design.fontFamily : undefined,
    boxShadow: design.boxShadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)' : design.boxShadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)' : design.boxShadow === 'lg' ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
  };

  // Gradient background
  if (look === 'gradient' && design.bgGradient) {
    containerStyle.background = `linear-gradient(${design.bgGradient.angle}deg, ${design.bgGradient.from}, ${design.bgGradient.to})`;
  }

  // Compact dropdown special rendering
  if (look === 'compact_dropdown') {
    return (
      <div
        id={`header-row-${row.id}`}
        data-header-row-id={row.id}
        data-header-row-type="secondary-nav"
        className={`${styles.headerRow} ${isEditorInteractive ? styles.headerRowEditable : ''} ${isSelected && isEditingHeader ? styles.headerRowSelected : ''} ${hovered && !isSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setOpenDropdownId(null); }}
        style={containerStyle}
      >
        <button
          type="button"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '6px',
            border: `1px solid ${design.borderColor}`,
            backgroundColor: '#f8fafc',
            color: textColor,
            fontSize: `${design.fontSize}px`,
            fontWeight: design.fontWeight,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            if (isEditorInteractive) { e.stopPropagation(); handleClick(e); }
          }}
        >
          <Grid size={14} />
          All Categories
          <ChevronDown size={14} />
        </button>
      </div>
    );
  }

  // Scroll container alignment
  const justifyContent =
    layout.position === 'center' || layout.alignment === 'center' ? 'center' :
    layout.position === 'right' ? 'flex-end' :
    layout.position === 'space_between' ? 'space-between' :
    layout.position === 'space_evenly' ? 'space-evenly' : 'flex-start';

  return (
    <div
      id={`header-row-${row.id}`}
      data-header-row-id={row.id}
      data-header-row-type="secondary-nav"
      className={`${styles.headerRow} ${isEditorInteractive ? styles.headerRowEditable : ''} ${isSelected && isEditingHeader ? styles.headerRowSelected : ''} ${hovered && !isSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setOpenDropdownId(null); }}
      style={containerStyle}
    >
      {/* Left scroll arrow */}
      {Boolean(layout.showLeftArrow) && (
        <button
          type="button"
          onClick={handleScrollLeft}
          style={{
            padding: '4px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: textColor,
            opacity: 0.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Scroll left"
        >
          <ChevronLeft size={layout.arrowSize || 18} />
        </button>
      )}

      {/* Two-Row Layout */}
      {look === 'two_row' ? (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: `${layout.rowGap}px` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: `${layout.itemGap}px`,
              justifyContent,
              overflowX: layout.overflow === 'scroll' ? 'auto' : undefined,
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {items.map((item) => renderItem(item))}
          </div>
          {secondaryItems.length > 0 && (
            <>
              <div style={{ borderBottom: `1px solid ${design.dividerColor}`, margin: '0 -8px' }} />
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${layout.itemGap}px`,
                  justifyContent,
                  overflowX: layout.overflow === 'scroll' ? 'auto' : undefined,
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  opacity: 0.85,
                }}
              >
                {secondaryItems.map((item) => renderItem(item, true))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Standard single row */
        <div
          ref={scrollContainerRef}
          className={styles.categoryBarScroll}
          style={{
            width: '100%',
            gap: `${layout.itemGap}px`,
            justifyContent,
            overflowX: layout.overflow === 'scroll' ? 'auto' : undefined,
            flexWrap: layout.overflow === 'wrap' ? 'wrap' : 'nowrap',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item) => renderItem(item))}
        </div>
      )}

      {/* Right scroll arrow */}
      {Boolean(layout.showRightArrow) && (
        <button
          type="button"
          onClick={handleScrollRight}
          style={{
            padding: '4px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: textColor,
            opacity: 0.5,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
          }}
          aria-label="Scroll right"
        >
          <ChevronRight size={layout.arrowSize || 18} />
        </button>
      )}

      {/* Mega Menu Dropdown */}
      {openDropdownItem && (look === 'mega_menu' || look === 'mega_banner') && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: design.dropdownBgColor || design.dropdownBg || '#ffffff',
            color: design.dropdownTextColor || '#1e293b',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            borderTop: `1px solid ${design.borderColor || '#e2e8f0'}`,
            borderBottom: `1px solid ${design.borderColor || '#e2e8f0'}`,
            padding: '24px 36px',
            zIndex: 100,
            display: 'flex',
            gap: '36px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Columns */}
          <div style={{ flex: 1, display: 'flex', gap: '36px', flexWrap: 'wrap' }}>
            {(openDropdownItem.megaColumns || []).map((col) => (
              <div key={col.id} style={{ minWidth: '130px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {col.title}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: `${col.itemSpacing || 8}px` }}>
                  {col.links.map((link, lIdx) => (
                    <a
                      key={lIdx}
                      href={link.href}
                      onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
                      style={{ fontSize: '13px', color: '#64748b', textDecoration: 'none', transition: 'color 0.15s ease' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = brandPrimary)}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Promo Banner Card */}
          {openDropdownItem.megaPromo && (
            <div style={{
              width: '260px',
              borderRadius: '8px',
              padding: '18px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              border: '1px solid #bfdbfe',
            }}>
              <div>
                <span style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Featured</span>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: '4px 0 6px 0' }}>
                  {openDropdownItem.megaPromo.heading}
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.4 }}>
                  {openDropdownItem.megaPromo.description}
                </p>
              </div>
              {openDropdownItem.megaPromo.ctaText && (
                <button
                  type="button"
                  style={{
                    marginTop: '12px',
                    padding: '6px 12px',
                    backgroundColor: brandPrimary,
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    alignSelf: 'flex-start',
                  }}
                >
                  {openDropdownItem.megaPromo.ctaText}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Subcategory Simple Dropdown for icon_text_dropdown */}
      {openDropdownItem && look === 'icon_text_dropdown' && (openDropdownItem.children || []).length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0',
            padding: '6px 0',
            minWidth: '150px',
            zIndex: 100,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {openDropdownItem.children?.map((sub) => (
            <a
              key={sub.id}
              href={sub.href}
              onClick={(e) => { if (isEditorInteractive) e.preventDefault(); }}
              style={{
                display: 'block',
                padding: '6px 14px',
                fontSize: '12px',
                color: '#334155',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f8fafc')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              {sub.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryBarSection;

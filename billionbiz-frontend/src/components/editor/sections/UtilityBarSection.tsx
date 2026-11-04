import React, { useState, useMemo, useEffect } from 'react';
import {
  Phone,
  Mail,
  Clock,
  Truck,
  Globe,
  HelpCircle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
  Info,
  Shield,
  ShieldCheck,
  Gift,
  Tag,
  MapPin,
  Headphones,
  ShoppingBag,
  Store,
  Share2,
  CreditCard,
  Smartphone,
  Sparkles,
  Flame,
  Zap,
  Package,
  Download,
  QrCode,
  Play,
  X,
  Lock,
  ArrowRight,
  MessageSquare,
  Star,
  Heart,
  User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEditorPath } from '../utils/editorNavigation';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';
import { createDefaultHeaderStack } from '../engine/headerPresets';
import type { HeaderRow } from '../engine/types';
import {
  resolveUtilityBarData,
  getInheritedUtilityColors,
  type UtilityBarData,
  type UtilityItem,
  type UtilityIconConfig,
} from '../engine/utilityBarModel';
import styles from './HeaderSections.module.css';

// ─── Inline Social Brand Icons ──────────────────────────────
const BrandInstagramIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const BrandFacebookIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const BrandTwitterIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
);
const BrandYoutubeIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);
const BrandWhatsAppIcon: React.FC<{ size?: number }> = ({ size = 13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
);

const renderIconHelper = (name?: string, size = 13, color?: string, strokeWidth = 2): React.ReactNode => {
  if (!name) return null;
  const style = color ? { color } : undefined;
  switch (name.toLowerCase()) {
    case 'instagram': return <BrandInstagramIcon size={size} />;
    case 'facebook': return <BrandFacebookIcon size={size} />;
    case 'twitter':
    case 'x': return <BrandTwitterIcon size={size} />;
    case 'youtube': return <BrandYoutubeIcon size={size} />;
    case 'whatsapp': return <BrandWhatsAppIcon size={size} />;
    case 'phone': return <Phone size={size} style={style} strokeWidth={strokeWidth} />;
    case 'mail': return <Mail size={size} style={style} strokeWidth={strokeWidth} />;
    case 'message':
    case 'messagesquare': return <MessageSquare size={size} style={style} strokeWidth={strokeWidth} />;
    case 'truck': return <Truck size={size} style={style} strokeWidth={strokeWidth} />;
    case 'gift': return <Gift size={size} style={style} strokeWidth={strokeWidth} />;
    case 'tag': return <Tag size={size} style={style} strokeWidth={strokeWidth} />;
    case 'globe': return <Globe size={size} style={style} strokeWidth={strokeWidth} />;
    case 'mappin': return <MapPin size={size} style={style} strokeWidth={strokeWidth} />;
    case 'headphones': return <Headphones size={size} style={style} strokeWidth={strokeWidth} />;
    case 'shield': return <Shield size={size} style={style} strokeWidth={strokeWidth} />;
    case 'shieldcheck': return <ShieldCheck size={size} style={style} strokeWidth={strokeWidth} />;
    case 'clock': return <Clock size={size} style={style} strokeWidth={strokeWidth} />;
    case 'star': return <Star size={size} style={style} strokeWidth={strokeWidth} />;
    case 'heart': return <Heart size={size} style={style} strokeWidth={strokeWidth} />;
    case 'user': return <User size={size} style={style} strokeWidth={strokeWidth} />;
    case 'shoppingbag': return <ShoppingBag size={size} style={style} strokeWidth={strokeWidth} />;
    case 'store': return <Store size={size} style={style} strokeWidth={strokeWidth} />;
    case 'share2': return <Share2 size={size} style={style} strokeWidth={strokeWidth} />;
    case 'helpcircle': return <HelpCircle size={size} style={style} strokeWidth={strokeWidth} />;
    case 'creditcard': return <CreditCard size={size} style={style} strokeWidth={strokeWidth} />;
    case 'smartphone': return <Smartphone size={size} style={style} strokeWidth={strokeWidth} />;
    case 'sparkles': return <Sparkles size={size} style={style} strokeWidth={strokeWidth} />;
    case 'flame': return <Flame size={size} style={style} strokeWidth={strokeWidth} />;
    case 'zap': return <Zap size={size} style={style} strokeWidth={strokeWidth} />;
    case 'package': return <Package size={size} style={style} strokeWidth={strokeWidth} />;
    case 'download': return <Download size={size} style={style} strokeWidth={strokeWidth} />;
    case 'qrcode': return <QrCode size={size} style={style} strokeWidth={strokeWidth} />;
    case 'play': return <Play size={size} style={style} strokeWidth={strokeWidth} />;
    case 'lock': return <Lock size={size} style={style} strokeWidth={strokeWidth} />;
    default: return <Sparkles size={size} style={style} strokeWidth={strokeWidth} />;
  }
};

const renderIconConfig = (config?: UtilityIconConfig, fallbackIcon = 'Sparkles', defaultSize = 13): React.ReactNode => {
  if (!config || config.source === 'none') return null;
  if (config.source === 'upload' && config.customSvgOrUrl) {
    return (
      <img
        src={config.customSvgOrUrl}
        alt="icon"
        style={{
          width: `${config.size || defaultSize}px`,
          height: `${config.size || defaultSize}px`,
          objectFit: 'contain',
        }}
      />
    );
  }
  if (config.source === 'custom' && config.customSvgOrUrl) {
    return (
      <img
        src={config.customSvgOrUrl}
        alt="icon"
        style={{
          width: `${config.size || defaultSize}px`,
          height: `${config.size || defaultSize}px`,
          objectFit: 'contain',
        }}
      />
    );
  }
  return renderIconHelper(config.iconName || fallbackIcon, config.size || defaultSize, config.color, config.strokeWidth || 2);
};

interface UtilityBarSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

export const UtilityBarSection: React.FC<UtilityBarSectionProps> = ({
  props: passedProps,
  device: passedDevice,
  isEditorInteractive = true,
  useEditorModel = false,
}) => {
  const navigate = useNavigate();
  const store = useEditorContextStore();
  const siteStore = useSiteStore();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, isRightSidebarOpen, requestEditorSwitch } = useLandingEditorStore();
  const storeDevice = useLandingEditorStore((s) => s.device);
  const device = passedDevice || storeDevice || 'desktop';

  const isEditingHeader = selectedPageId === 'header-global';

  const previewRows = store.presetPreview?.isActive && store.presetPreview.editorType === 'header'
    ? store.presetPreview.previewRows as HeaderRow[] | undefined
    : undefined;
  const persistedRows = (passedProps?._headerEditor?.rows || passedProps?._headerRows) as HeaderRow[] | undefined;
  const effectiveRows = previewRows || (useEditorModel ? store.headerRows : (persistedRows || store.headerRows));

  const row: HeaderRow = useMemo(() => {
    const found = effectiveRows.find(
      (r) => r.type === 'utility' || r.id === 'row-utility' || r.id.includes('utility')
    );
    if (found) return found;
    const defaultStack = createDefaultHeaderStack();
    const fallback = defaultStack.find((r) => r.type === 'utility') || defaultStack[0];
    if (passedProps && fallback.elements[0]) {
      return {
        ...fallback,
        elements: [{ ...fallback.elements[0], props: { ...fallback.elements[0].props, ...passedProps } }],
      };
    }
    return fallback;
  }, [effectiveRows, passedProps]);

  const themePalette = siteStore.theme?.palette || (siteStore.theme as any)?.colors || getDefaultTheme().palette;

  // Unified Utility Bar Model Resolution
  const barData: UtilityBarData = useMemo(() => {
    return resolveUtilityBarData(row, passedProps, themePalette);
  }, [row, passedProps, themePalette]);

  const semanticColors = useMemo(() => {
    return getInheritedUtilityColors(themePalette);
  }, [themePalette]);

  const { look, content, layout, behavior, design, responsive } = barData;

  // Local state
  const [hovered, setHovered] = useState(false);
  const [linkToast, setLinkToast] = useState<string | null>(null);
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 0,
    hours: 2,
    minutes: 14,
    seconds: 36,
    isExpired: false,
  });

  // Check persistent dismissal
  useEffect(() => {
    if (typeof window !== 'undefined' && behavior.rememberDismissal) {
      try {
        const stored = localStorage.getItem(`utility_dismissed_${row.id}`);
        if (stored === 'true') {
          setIsDismissed(true);
        }
      } catch {
        // ignore
      }
    }
  }, [behavior.rememberDismissal, row.id]);

  // Live countdown ticker
  useEffect(() => {
    if (look !== 'countdown' || !content.countdown?.endDate) return;

    const calcTime = () => {
      const targetStr = `${content.countdown?.endDate}T${content.countdown?.endTime || '23:59'}:00`;
      const target = new Date(targetStr).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calcTime();
    const interval = setInterval(calcTime, 1000);
    return () => clearInterval(interval);
  }, [look, content.countdown?.endDate, content.countdown?.endTime]);

  // Live slider rotation
  useEffect(() => {
    if (look !== 'slider' || behavior.sliderAutoplay === false || !content.slides?.length) return;
    const intervalTime = (behavior.sliderInterval || 4) * 1000;
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % (content.slides?.length || 1));
    }, intervalTime);
    return () => clearInterval(timer);
  }, [look, behavior.sliderAutoplay, behavior.sliderInterval, content.slides?.length]);

  if (!row.isVisible || content.enabled === false || isDismissed) {
    return null;
  }

  // Selection state
  const isSelected =
    isEditingHeader &&
    isRightSidebarOpen &&
    store.selectedTarget.type === 'row' &&
    store.selectedTarget.editorType === 'header' &&
    (store.selectedTarget.rowId === row.id ||
      store.selectedTarget.rowId === 'utility-bar' ||
      store.selectedTarget.rowId.includes('utility'));

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive) return;
    e.stopPropagation();
    const executeSelect = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', 'utility-bar');
        navigate(getEditorPath('header-global', 'utility-bar'));
        useEditorContextStore.getState().setEditorType('header');
      }
      store.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
      useLandingEditorStore.getState().setSelectedSectionId('utility-bar');
      setRightSidebarOpen(true);
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: 'utility-bar',
        targetName: 'Header Editor',
        onConfirm: executeSelect,
      });
      return;
    }
    executeSelect();
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    if (isEditorInteractive) {
      e.preventDefault();
      handleClick(e);
      setLinkToast('Link does not work here');
      setTimeout(() => setLinkToast(null), 2500);
    }
  };

  const handleCopyCoupon = (code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(code);
    }
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2000);
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (behavior.rememberDismissal && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`utility_dismissed_${row.id}`, 'true');
      } catch {
        // ignore
      }
    }
  };

  // Resolved independent semantic colors
  const resolvedBg = design.bgColorMode === 'custom' && design.bgColor ? design.bgColor : semanticColors.bg;
  const resolvedText = design.textColorMode === 'custom' && design.textColor ? design.textColor : semanticColors.text;
  const resolvedMutedText = design.mutedTextColorMode === 'custom' && design.mutedTextColor ? design.mutedTextColor : semanticColors.mutedText;
  const resolvedAccent = design.accentColorMode === 'custom' && design.accentColor ? design.accentColor : semanticColors.accent;
  const resolvedLink = design.linkColorMode === 'custom' && design.linkColor ? design.linkColor : semanticColors.link;
  const resolvedBorder = design.borderColorMode === 'custom' && design.borderColor ? design.borderColor : semanticColors.border;
  const resolvedDivider = design.dividerColorMode === 'custom' && design.dividerColor ? design.dividerColor : semanticColors.divider;
  const resolvedIcon = design.iconColorMode === 'custom' && design.iconColor ? design.iconColor : semanticColors.icon;
  const resolvedButtonBg = design.buttonBgColorMode === 'custom' && design.buttonBgColor ? design.buttonBgColor : semanticColors.buttonBg;
  const resolvedButtonText = design.buttonTextColorMode === 'custom' && design.buttonTextColor ? design.buttonTextColor : semanticColors.buttonText;

  // Background style computation
  let backgroundStyle: string = resolvedBg;
  if (design.bgGradient) {
    const { angle = 90, from = '#0f172a', to = '#1e293b', type = 'linear' } = design.bgGradient;
    backgroundStyle = type === 'radial'
      ? `radial-gradient(circle, ${from}, ${to})`
      : `linear-gradient(${angle}deg, ${from}, ${to})`;
  }

  const isSticky = behavior.stickyPosition === 'top' || behavior.displayMode === 'sticky';
  const minHeight = look === 'two_tier'
    ? (layout.barHeight ? `${Math.max(layout.barHeight, 52)}px` : '56px')
    : (layout.barHeight ? `${layout.barHeight}px` : '34px');
  const fontSize = device === 'mobile' && responsive.mobileFontSize ? `${responsive.mobileFontSize}px` : (design.fontSize ? `${design.fontSize}px` : '11px');
  const fontWeight = Number(design.fontWeight) || 500;
  const fontFamily = design.fontFamily === 'inherit' ? undefined : design.fontFamily;

  // Border computation
  const borderPosition = design.borderPosition || 'bottom';
  const borderType = design.borderType || 'solid';
  const borderWidth = `${design.borderWidth || 1}px`;
  const borderDef = borderType !== 'none' ? `${borderWidth} ${borderType} ${resolvedBorder}` : 'none';

  // Render Item helper
  const renderItemContent = (item: UtilityItem) => {
    if (!item.enabled) return null;
    const hideOnMobile = device === 'mobile' && item.hideOnMobile;
    if (hideOnMobile) return null;

    const iconElement = item.icon && item.icon.source !== 'none'
      ? renderIconConfig(item.icon, 'Sparkles', item.icon.size || 13)
      : (resolvedIcon ? null : null);

    return (
      <div
        key={item.id}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: `${item.icon?.gap || 5}px`,
          color: 'inherit',
          whiteSpace: 'nowrap',
        }}
      >
        {item.icon?.position !== 'right' && iconElement}
        {item.link ? (
          <a
            href={item.link}
            target={item.target || '_self'}
            onClick={handleLinkClick}
            style={{
              color: resolvedLink,
              textDecoration: 'none',
              fontWeight: 500,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <span>{item.label}</span>
            {item.value && <strong style={{ fontWeight: 600 }}>{item.value}</strong>}
            {item.target === '_blank' && <ExternalLink size={10} style={{ opacity: 0.6 }} />}
          </a>
        ) : (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
            <span>{item.label}</span>
            {item.value && <strong style={{ fontWeight: 600 }}>{item.value}</strong>}
          </span>
        )}
        {item.icon?.position === 'right' && iconElement}
        {item.separator !== false && (
          <span style={{ color: resolvedDivider, marginLeft: '6px', marginRight: '6px', opacity: 0.6 }}>|</span>
        )}
      </div>
    );
  };

  return (
    <div
      id={`header-row-${row.id}`}
      data-header-row-id={row.id}
      data-header-row-type="utility"
      className={`${styles.headerRow} ${isEditorInteractive ? styles.headerRowEditable : ''} ${
        isSelected && isEditingHeader ? styles.headerRowSelected : ''
      } ${hovered && !isSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: backgroundStyle,
        color: resolvedText,
        minHeight,
        fontSize,
        fontWeight,
        fontFamily,
        borderBottom: borderPosition === 'bottom' || borderPosition === 'all' || borderPosition === 'both' ? borderDef : 'none',
        borderTop: borderPosition === 'top' || borderPosition === 'all' || borderPosition === 'both' ? borderDef : 'none',
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 0 : undefined,
        zIndex: isSticky ? 35 : 22,
        boxShadow: design.shadow && design.shadow !== 'none'
          ? design.shadow === 'sm' ? '0 1px 2px rgba(0,0,0,0.05)'
          : design.shadow === 'md' ? '0 4px 6px -1px rgba(0,0,0,0.1)'
          : '0 10px 15px -3px rgba(0,0,0,0.1)'
          : 'none',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: look === 'two_tier' ? `4px ${layout.paddingX || 20}px` : `0 ${layout.paddingX || 20}px`,
        overflow: device === 'mobile' && responsive.mobileOverflow === 'horizontal_scroll' ? 'auto' : 'hidden',
        boxSizing: 'border-box',
        width: '100%',
      }}
    >
      {/* ── Main Look Content Area (preserves right content on right) ── */}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: look === 'two_tier' ? 'column' : 'row',
          alignItems: look === 'two_tier' ? 'stretch' : 'center',
          justifyContent: look === 'minimal' ? 'center' : (layout.alignment || 'space-between'),
          width: '100%',
        }}
      >
      {/* ─── A. SPLIT SUPPORT & TRACKING ─── */}
      {look === 'split_support' && (
        <>
          {/* Left Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 12}px` }}>
            {(content.leftItems || []).map(renderItemContent)}
          </div>

          {/* Right Side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 12}px` }}>
            {(content.rightItems || []).map(renderItemContent)}
          </div>
        </>
      )}

      {/* ─── B. CONTACT & SUPPORT ─── */}
      {look === 'contact_support' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 12}px` }}>
            {(content.items || []).map(renderItemContent)}
          </div>

          {content.businessHours?.enabled !== false && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: resolvedMutedText }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              <span>Open: {content.businessHours?.openingTime || '09:00'} - {content.businessHours?.closingTime || '18:00'} ({content.businessHours?.days || 'Mon - Sat'})</span>
            </div>
          )}
        </>
      )}

      {/* ─── C. PROMO + CTA ─── */}
      {look === 'promo_cta' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {content.promotion?.icon && renderIconConfig(content.promotion.icon, 'Gift', 14)}
            <span style={{ fontWeight: 600 }}>{content.promotion?.text || '🎁 Get 10% OFF your entire order'}</span>

            {content.coupon?.enabled !== false && content.coupon?.code && (
              <div
                onClick={(e) => handleCopyCoupon(content.coupon?.code || 'SAVE10', e)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  border: '1px dashed rgba(255,255,255,0.3)',
                  cursor: 'pointer',
                  fontSize: '10px',
                  fontWeight: 700,
                  marginLeft: '4px',
                }}
                title="Click to copy promo code"
              >
                <span>{content.coupon.code}</span>
                {copiedCoupon === content.coupon.code ? (
                  <Check size={11} color="#10b981" />
                ) : (
                  <Copy size={11} style={{ opacity: 0.7 }} />
                )}
                <span style={{ fontSize: '9px', textTransform: 'uppercase', opacity: 0.8 }}>
                  {copiedCoupon === content.coupon.code ? 'Copied!' : content.coupon.copyButtonText || 'Copy'}
                </span>
              </div>
            )}
          </div>

          {content.cta?.enabled !== false && (
            <a
              href={content.cta?.url || '#'}
              onClick={handleLinkClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '3px 10px',
                borderRadius: '4px',
                backgroundColor: resolvedButtonBg,
                color: resolvedButtonText,
                fontSize: '11px',
                fontWeight: 600,
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              <span>{content.cta?.text || 'Shop Now'}</span>
              <ArrowRight size={11} />
            </a>
          )}
        </div>
      )}

      {/* ─── D. FREE SHIPPING + TRUST ─── */}
      {look === 'free_shipping_trust' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', width: '100%', gap: '16px' }}>
          {(content.trustItems || []).map((t) => (
            <div key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              {t.icon && renderIconConfig(t.icon, 'ShieldCheck', 13)}
              <span style={{ fontWeight: 600 }}>{t.label}</span>
              {t.value && <span style={{ color: resolvedMutedText, fontSize: '10px' }}>({t.value})</span>}
            </div>
          ))}
        </div>
      )}

      {/* ─── E. LANGUAGE / COUNTRY / CURRENCY ─── */}
      {look === 'currency_language' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Selectors Group */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {content.languageSelector?.enabled !== false && (
              <div
                onClick={() => setActiveDropdown(activeDropdown === 'lang' ? null : 'lang')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                <Globe size={12} style={{ opacity: 0.7 }} />
                <span>{content.languageSelector?.defaultLanguage || 'English'}</span>
                <ChevronDown size={10} style={{ opacity: 0.6 }} />
              </div>
            )}

            {content.currencySelector?.enabled !== false && (
              <div
                onClick={() => setActiveDropdown(activeDropdown === 'curr' ? null : 'curr')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 500 }}
              >
                <span>{content.currencySelector?.defaultCurrency || 'INR (₹)'}</span>
                <ChevronDown size={10} style={{ opacity: 0.6 }} />
              </div>
            )}
          </div>

          {/* Quick links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <a href="/track-order" onClick={handleLinkClick} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Truck size={12} style={{ opacity: 0.7 }} />
              <span>Track Order</span>
            </a>
            <a href="/help" onClick={handleLinkClick} style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={12} style={{ opacity: 0.7 }} />
              <span>Help</span>
            </a>
          </div>
        </div>
      )}

      {/* ─── F. SOCIAL + PROMOTION ─── */}
      {look === 'social_promo' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {/* Social Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {(content.socialLinks || []).filter((s) => s.enabled !== false).map((s) => (
              <a
                key={s.platform}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleLinkClick}
                style={{ color: 'inherit', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', opacity: 0.85 }}
                title={`Follow us on ${s.platform}`}
              >
                {renderIconHelper(s.platform, 13)}
              </a>
            ))}
            <span style={{ color: resolvedDivider, marginLeft: '4px', marginRight: '4px' }}>|</span>
            <span style={{ color: resolvedMutedText, fontSize: '10px' }}>Follow Us</span>
          </div>

          {/* Promotion */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 600 }}>{content.promotion?.text || 'Get 10% OFF with code SAVE10'}</span>
          </div>
        </div>
      )}

      {/* ─── G. MULTI-MESSAGE SLIDER ─── */}
      {look === 'slider' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          {behavior.sliderArrows !== false && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev - 1 + (content.slides?.length || 1)) % (content.slides?.length || 1));
              }}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px 4px', opacity: 0.7 }}
            >
              <ChevronLeft size={14} />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', flex: 1, textAlign: 'center' }}>
            {content.slides?.[currentSlideIndex] && (
              <>
                {content.slides[currentSlideIndex].icon && renderIconConfig(content.slides[currentSlideIndex].icon, 'Sparkles', 13)}
                <span style={{ fontWeight: 600 }}>{content.slides[currentSlideIndex].label}</span>
                {content.slides[currentSlideIndex].value && (
                  <span style={{ color: resolvedMutedText }}>— {content.slides[currentSlideIndex].value}</span>
                )}
              </>
            )}
          </div>

          {behavior.sliderArrows !== false && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlideIndex((prev) => (prev + 1) % (content.slides?.length || 1));
              }}
              style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', padding: '2px 4px', opacity: 0.7 }}
            >
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ─── H. COUNTDOWN PROMOTION ─── */}
      {look === 'countdown' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Flame size={14} color="#f97316" />
            <span style={{ fontWeight: 600 }}>{content.countdown?.label || '⚡ Flash Sale — 50% OFF'}</span>
          </div>

          {/* Live countdown tiles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'monospace', fontWeight: 700 }}>
            <span style={{ opacity: 0.7, marginRight: '4px', fontSize: '10px' }}>Ends in:</span>
            <div style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.12)' }}>
              {String(timeLeft.days).padStart(2, '0')}d
            </div>
            <span>:</span>
            <div style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.12)' }}>
              {String(timeLeft.hours).padStart(2, '0')}h
            </div>
            <span>:</span>
            <div style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.12)' }}>
              {String(timeLeft.minutes).padStart(2, '0')}m
            </div>
            <span>:</span>
            <div style={{ padding: '2px 5px', borderRadius: '4px', backgroundColor: 'rgba(0,0,0,0.12)' }}>
              {String(timeLeft.seconds).padStart(2, '0')}s
            </div>
          </div>
        </div>
      )}

      {/* ─── I. MARQUEE UTILITY ─── */}
      {look === 'marquee' && (
        <div style={{ overflow: 'hidden', width: '100%', whiteSpace: 'nowrap' }}>
          <div
            className={styles.marqueeTrack}
            style={{
              animationDuration: `${behavior.marqueeSpeed || 25}s`,
              display: 'flex',
              alignItems: 'center',
              gap: '24px',
            }}
          >
            {[...(content.marqueeMessages || []), ...(content.marqueeMessages || [])].map((msg, i) => (
              <div key={`${msg.id}-${i}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                {msg.icon && renderIconConfig(msg.icon, 'Sparkles', 13)}
                <span style={{ fontWeight: 600 }}>{msg.label}</span>
                <span style={{ color: resolvedAccent, margin: '0 8px' }}>✦</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── J. TWO-TIER UTILITY ─── */}
      {look === 'two_tier' && (
        <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '2px' }}>
          {/* Top Row: Contact & Shortcuts */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0', borderBottom: `1px solid ${resolvedDivider}`, width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 12}px` }}>
              {(() => {
                const items = content.topTierItems || content.topRowItems || [];
                const splitAt = Math.ceil(items.length / 2);
                return items.slice(0, splitAt).map(renderItemContent);
              })()}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 12}px` }}>
              {(() => {
                const items = content.topTierItems || content.topRowItems || [];
                const splitAt = Math.ceil(items.length / 2);
                return items.slice(splitAt).map(renderItemContent);
              })()}
            </div>
          </div>
          {/* Bottom Row: Promo & Shipping */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px 0', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: `${layout.itemGap || 14}px` }}>
              {(content.bottomTierItems || content.bottomRowItems || []).map(renderItemContent)}
            </div>
          </div>
        </div>
      )}

      {/* ─── K. ANNOUNCEMENT + LINKS ─── */}
      {look === 'announcement_links' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color={resolvedAccent} />
            <span style={{ fontWeight: 600 }}>{content.minimalText || '📢 We are now live with festive collection!'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {(content.items || []).map(renderItemContent)}
          </div>
        </div>
      )}

      {/* ─── L. APP DOWNLOAD ─── */}
      {look === 'app_download' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Smartphone size={13} style={{ opacity: 0.8 }} />
            <span style={{ fontWeight: 600 }}>{content.appDownload?.headline || 'Download our mobile app for exclusive VIP offers'}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href={content.appDownload?.iosUrl || '#'}
              onClick={handleLinkClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0,0,0,0.12)',
                color: 'inherit',
                fontSize: '10px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              App Store
            </a>
            <a
              href={content.appDownload?.androidUrl || '#'}
              onClick={handleLinkClick}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(0,0,0,0.12)',
                color: 'inherit',
                fontSize: '10px',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              Google Play
            </a>
            {content.appDownload?.showQrCode !== false && (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontSize: '10px', opacity: 0.8, cursor: 'pointer' }}>
                <QrCode size={13} />
                <span>QR Code</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── M. MINIMAL UTILITY ─── */}
      {look === 'minimal' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: '6px' }}>
          {content.promotion?.icon && renderIconConfig(content.promotion.icon, 'Sparkles', 13)}
          <span style={{ fontWeight: 500 }}>{content.minimalText || 'Free shipping on all orders over ₹999'}</span>
        </div>
      )}

      {/* ─── N. CUSTOM / FLEXIBLE ─── */}
      {look === 'custom' && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: layout.alignment || 'space-between', width: '100%', gap: `${layout.itemGap || 12}px` }}>
          {(content.items || []).map(renderItemContent)}
        </div>
      )}
      </div>

      {/* Dismiss / Close Button: placed on the far right with a dedicated 14px space, never displacing the right content */}
      {(behavior.dismissible || behavior.enableCloseButton) && (
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            opacity: 0.65,
            cursor: 'pointer',
            padding: '4px',
            marginLeft: '14px',
            flexShrink: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '4px',
            transition: 'opacity 0.15s ease',
          }}
          title="Dismiss utility bar"
          aria-label="Dismiss utility bar"
        >
          <X size={13} />
        </button>
      )}

      {/* Floating Link Toast Warning */}
      {linkToast && (
        <div
          style={{
            position: 'absolute',
            bottom: '-32px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: 600,
            boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap',
            border: '1px solid rgba(255,255,255,0.15)',
            pointerEvents: 'none',
          }}
        >
          <Info size={12} color="#38bdf8" />
          <span>{linkToast}</span>
        </div>
      )}
    </div>
  );
};

export default UtilityBarSection;

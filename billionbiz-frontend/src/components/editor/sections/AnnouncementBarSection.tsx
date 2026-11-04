import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  X,
  ArrowRight,
  Flame,
  Clock,
  Sparkles,
  Tag,
  Truck,
  Gift,
  Star,
  Zap,
  Shield,
  Bell,
  Info,
  Heart,
  ShoppingBag,
  Percent,
  Megaphone,
  Award,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getEditorPath } from '../utils/editorNavigation';
import { useEditorContextStore } from '../../../store/editorContextStore';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { createDefaultHeaderStack } from '../engine/headerPresets';
import type { HeaderRow } from '../engine/types';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';
import {
  resolveAnnouncementBarData,
  type AnnouncementBarData,
} from '../engine/announcementBarModel';
import styles from './HeaderSections.module.css';

interface AnnouncementBarSectionProps {
  props?: any;
  device?: string;
  isEditorInteractive?: boolean;
  useEditorModel?: boolean;
}

// Icon helper supporting Lucide icons, custom image URLs/base64, and emojis
const renderIcon = (name?: string, size = 14, color?: string) => {
  if (!name || name === 'none') return null;

  // 1. Custom image / base64 / external URL
  if (name.startsWith('data:image/') || name.startsWith('http://') || name.startsWith('https://') || name.startsWith('/') || name.startsWith('blob:')) {
    return (
      <img
        src={name}
        alt=""
        style={{
          width: `${size}px`,
          height: `${size}px`,
          objectFit: 'contain',
          display: 'inline-block',
          verticalAlign: 'middle',
          flexShrink: 0,
        }}
      />
    );
  }

  // 2. Preset Lucide Icons
  const props = { size, color: color || 'currentColor', style: { flexShrink: 0 } };
  switch (name) {
    case 'Sparkles':
      return <Sparkles {...props} />;
    case 'Flame':
      return <Flame {...props} />;
    case 'Tag':
      return <Tag {...props} />;
    case 'Truck':
      return <Truck {...props} />;
    case 'Gift':
      return <Gift {...props} />;
    case 'Star':
      return <Star {...props} />;
    case 'Zap':
      return <Zap {...props} />;
    case 'Shield':
      return <Shield {...props} />;
    case 'Bell':
      return <Bell {...props} />;
    case 'Clock':
      return <Clock {...props} />;
    case 'Heart':
      return <Heart {...props} />;
    case 'Info':
      return <Info {...props} />;
    case 'ShoppingBag':
      return <ShoppingBag {...props} />;
    case 'Percent':
      return <Percent {...props} />;
    case 'Megaphone':
      return <Megaphone {...props} />;
    case 'Award':
      return <Award {...props} />;
    case 'CheckCircle2':
      return <CheckCircle2 {...props} />;
    default:
      // 3. Fallback emoji or raw symbol
      return (
        <span
          style={{
            fontSize: `${size}px`,
            lineHeight: 1,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {name}
        </span>
      );
  }
};

export const AnnouncementBarSection: React.FC<AnnouncementBarSectionProps> = ({
  props: passedProps,
  device: passedDevice,
  isEditorInteractive = true,
  useEditorModel = false,
}) => {
  const navigate = useNavigate();
  const headerRows = useEditorContextStore((s) => s.headerRows);
  const store = useEditorContextStore();
  const { selectedPageId, navigateToPage, setRightSidebarOpen, isRightSidebarOpen, requestEditorSwitch } = useLandingEditorStore();
  const editorDevice = useLandingEditorStore((s) => s.device);
  const effectiveDevice = passedDevice || editorDevice || 'desktop';
  const isMobile = effectiveDevice === 'mobile';

  const isEditingHeader = selectedPageId === 'header-global';
  const effectiveUseEditorModel = Boolean(
    useEditorModel ||
    passedProps?.useEditorModel ||
    isEditingHeader ||
    (headerRows && headerRows.length > 0)
  );

  const previewRows = store.presetPreview?.isActive && store.presetPreview.editorType === 'header'
    ? store.presetPreview.previewRows as HeaderRow[] | undefined
    : undefined;
  const persistedRows = (passedProps?._headerEditor?.rows || passedProps?._headerRows) as HeaderRow[] | undefined;
  const effectiveRows = previewRows || (effectiveUseEditorModel ? headerRows : (persistedRows || headerRows));

  const row: HeaderRow = useMemo(() => {
    const found = effectiveRows.find(
      (r) => r.type === 'announcement' || r.id === 'row-announcement' || r.id.includes('announcement')
    );
    if (found) return found;
    const defaultStack = createDefaultHeaderStack();
    const fallback = defaultStack.find((r) => r.type === 'announcement') || defaultStack[0];
    if (passedProps && fallback.elements[0]) {
      return {
        ...fallback,
        elements: [{ ...fallback.elements[0], props: { ...fallback.elements[0].props, ...passedProps } }],
      };
    }
    return fallback;
  }, [effectiveRows, passedProps, headerRows]);

  const theme = useSiteStore((s) => s.theme);
  const themePalette = theme?.palette || (theme as any)?.colors || getDefaultTheme().palette;

  // Unified Announcement Bar Model
  const barData: AnnouncementBarData = useMemo(() => {
    return resolveAnnouncementBarData(row, passedProps, themePalette);
  }, [row, passedProps, themePalette]);

  const { look, content, design, behavior } = barData;

  // Reduced motion preference
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const media = window.matchMedia('(prefers-reduced-motion: reduce)');
      setSystemReducedMotion(media.matches);
      const listener = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, []);

  // Dismissal state
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && behavior.rememberDismissal === 'persistent') {
      try {
        const stored = localStorage.getItem(`announcement_dismissed_${row.id}`);
        if (stored === 'true') setIsDismissed(true);
      } catch {
        // Ignore storage errors
      }
    }
  }, [row.id, behavior.rememberDismissal]);

  // Carousel / Slide state
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const slides = content.slides && content.slides.length > 0 ? content.slides : [];

  useEffect(() => {
    if (look !== 'slider' || slides.length <= 1 || !behavior.slideAutoplay || isPaused) return;
    const intervalMs = Math.max(1500, (behavior.slideInterval || 4) * 1000);
    const timer = setInterval(() => {
      setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [look, slides.length, behavior.slideAutoplay, behavior.slideInterval, isPaused]);

  // Countdown timer calculation
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean }>({
    days: 0,
    hours: 23,
    minutes: 59,
    seconds: 59,
    isExpired: false,
  });

  useEffect(() => {
    if (look !== 'countdown') return;

    const calculateTime = () => {
      if (!content.countdownTarget) {
        setTimeLeft({ days: 0, hours: 23, minutes: 59, seconds: 59, isExpired: false });
        return;
      }

      const target = new Date(content.countdownTarget).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [look, content.countdownTarget, content.timezone]);

  // Scheduling check
  const isScheduleActive = useMemo(() => {
    if (behavior.visibilityMode !== 'scheduled') return true;
    const now = Date.now();
    if (behavior.startDate) {
      const start = new Date(behavior.startDate).getTime();
      if (now < start) return false;
    }
    if (behavior.endDate) {
      const end = new Date(behavior.endDate).getTime();
      if (now > end) return false;
    }
    return true;
  }, [behavior.visibilityMode, behavior.startDate, behavior.endDate]);

  // Check if countdown expired action should hide the bar
  if (!row.isVisible || isDismissed) {
    return null;
  }

  if (!isScheduleActive && !isEditorInteractive) {
    return null;
  }

  if (look === 'countdown' && timeLeft.isExpired && behavior.countdownEndAction === 'hide' && !isEditorInteractive) {
    return null;
  }

  // Selection & Hover
  const isSelected =
    isEditingHeader &&
    isRightSidebarOpen &&
    store.selectedTarget.type === 'row' &&
    store.selectedTarget.editorType === 'header' &&
    (store.selectedTarget.rowId === row.id ||
      store.selectedTarget.rowId === 'announcement-bar' ||
      store.selectedTarget.rowId.includes('announcement'));

  const [hovered, setHovered] = useState(false);
  const [linkToast, setLinkToast] = useState<string | null>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!isEditorInteractive) return;
    e.stopPropagation();
    const executeSelect = () => {
      if (selectedPageId !== 'header-global') {
        navigateToPage('header-global', 'announcement-bar');
        navigate(getEditorPath('header-global', 'announcement-bar'));
        useEditorContextStore.getState().setEditorType('header');
      }
      store.selectTarget({ type: 'row', editorType: 'header', rowId: row.id });
      useLandingEditorStore.getState().setSelectedSectionId('announcement-bar');
      setRightSidebarOpen(true);
    };

    if (selectedPageId !== 'header-global') {
      requestEditorSwitch({
        targetPageId: 'header-global',
        targetSectionId: 'announcement-bar',
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

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    if (behavior.rememberDismissal === 'persistent' && typeof window !== 'undefined') {
      try {
        localStorage.setItem(`announcement_dismissed_${row.id}`, 'true');
      } catch {
        // ignore
      }
    }
  };

  // Background style computation
  let backgroundStyle: string = design.bgColor || '#0f172a';
  if (design.bgType === 'gradient' && design.bgGradient) {
    const { angle = 90, from = '#1e293b', to = '#0f172a', type = 'linear' } = design.bgGradient;
    backgroundStyle = type === 'radial'
      ? `radial-gradient(circle, ${from}, ${to})`
      : `linear-gradient(${angle}deg, ${from}, ${to})`;
  }

  // Border style computation
  const borderPosition = design.borderPosition || 'bottom';
  const borderType = design.borderType || 'solid';
  const borderWidth = `${design.borderWidth || 1}px`;
  const borderColor = design.borderColor || 'rgba(255, 255, 255, 0.12)';
  const borderDef = borderType !== 'none' ? `${borderWidth} ${borderType} ${borderColor}` : 'none';

  const borderStyles: React.CSSProperties = {
    borderTop: borderPosition === 'top' || borderPosition === 'all' ? borderDef : 'none',
    borderBottom: borderPosition === 'bottom' || borderPosition === 'all' ? borderDef : 'none',
    borderLeft: borderPosition === 'all' ? borderDef : 'none',
    borderRight: borderPosition === 'all' ? borderDef : 'none',
    borderRadius: design.borderRadius ? `${design.borderRadius}px` : undefined,
  };

  const isSticky = Boolean(behavior.isSticky || behavior.position === 'sticky');
  const effectiveHeight = isMobile ? Math.max(34, design.barHeight - 4) : design.barHeight;
  const effectiveFontSize = isMobile ? Math.max(10, design.fontSize - 1) : design.fontSize;

  // Render CTA helper
  const renderCtaButton = (text: string, link: string, inNewTab = false, isItemCta = false) => {
    const styleType = design.ctaStyle || 'solid';
    const ctaRadius = `${design.ctaRadius ?? 6}px`;

    let ctaBg = design.ctaBgColor || '#2563eb';
    let ctaFg = design.ctaTextColor || '#ffffff';
    let ctaBorder = 'none';

    if (styleType === 'outline') {
      ctaBg = 'transparent';
      ctaFg = design.ctaBgColor || '#ffffff';
      ctaBorder = `1.5px solid ${design.ctaBgColor || '#ffffff'}`;
    } else if (styleType === 'ghost') {
      ctaBg = 'rgba(255, 255, 255, 0.12)';
      ctaFg = design.textColor || '#ffffff';
      ctaBorder = 'none';
    }

    const padding = design.ctaSize === 'lg' ? '6px 14px' : design.ctaSize === 'sm' ? '3px 9px' : '4px 11px';
    const ctaFontSize = design.ctaSize === 'lg' ? '12px' : design.ctaSize === 'sm' ? '10px' : '11px';

    return (
      <a
        href={link || '#'}
        target={inNewTab ? '_blank' : '_self'}
        rel={inNewTab ? 'noopener noreferrer' : undefined}
        onClick={handleLinkClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: ctaBg,
          color: ctaFg,
          border: ctaBorder,
          borderRadius: ctaRadius,
          padding,
          fontSize: ctaFontSize,
          fontWeight: 700,
          textDecoration: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          transition: 'all 0.15s ease',
          boxShadow: styleType === 'solid' ? '0 1px 3px rgba(0,0,0,0.15)' : 'none',
          marginLeft: isItemCta ? '4px' : `${design.ctaSpacing || 12}px`,
        }}
      >
        <span>{text}</span>
        {inNewTab ? <ExternalLink size={10} /> : <ArrowRight size={11} />}
      </a>
    );
  };

  // Separator helper for marquee
  const renderMarqueeSeparator = () => {
    const sep = design.marqueeSeparatorStyle || 'star';
    if (sep === 'none') return null;
    let symbol = '★';
    if (sep === 'bullet') symbol = '•';
    else if (sep === 'dash') symbol = '—';
    else if (sep === 'slash') symbol = '/';
    else if (sep === 'emoji') symbol = '✨';
    return (
      <span
        style={{
          color: design.accentColor || '#f59e0b',
          opacity: 0.8,
          margin: `0 ${Math.max(6, Math.floor(design.messageSpacing / 2))}px`,
          fontSize: '11px',
        }}
      >
        {symbol}
      </span>
    );
  };

  // Marquee animation speed and direction
  const isReducedMotionActive =
    (systemReducedMotion || behavior.marqueeReducedMotion === 'pause') && look === 'marquee';
  const marqueeDuration = behavior.marqueeSpeed ? `${behavior.marqueeSpeed}s` : '25s';
  const marqueeReverse = behavior.marqueeDirection === 'rtl';

  return (
    <div
      id={`header-row-${row.id}`}
      data-header-row-id={row.id}
      data-header-row-type="announcement"
      className={`${styles.headerRow} ${isEditorInteractive ? styles.headerRowEditable : ''} ${isSelected && isEditingHeader ? styles.headerRowSelected : ''
        } ${hovered && !isSelected && isEditingHeader ? styles.headerRowHovered : ''}`}
      onClick={handleClick}
      onMouseEnter={() => {
        setHovered(true);
        if (behavior.marqueePauseOnHover || behavior.slidePauseOnHover) setIsPaused(true);
      }}
      onMouseLeave={() => {
        setHovered(false);
        setIsPaused(false);
      }}
      style={{
        background: backgroundStyle,
        color: design.textColor || '#ffffff',
        minHeight: `${effectiveHeight}px`,
        fontFamily: design.fontFamily || 'Inter, sans-serif',
        fontSize: `${effectiveFontSize}px`,
        fontWeight: design.fontWeight || 500,
        lineHeight: design.lineHeight || 1.3,
        letterSpacing: design.letterSpacing ? `${design.letterSpacing}px` : undefined,
        padding: `${design.paddingY || 8}px ${design.paddingX || 16}px`,
        position: isSticky ? 'sticky' : 'relative',
        top: isSticky ? 0 : undefined,
        zIndex: isSticky ? 100 : 25,
        display: 'flex',
        alignItems: 'center',
        justifyContent: design.alignment === 'left' ? 'flex-start' : design.alignment === 'right' ? 'flex-end' : 'center',
        overflow: 'hidden',
        boxSizing: 'border-box',
        ...borderStyles,
      }}
    >
      {/* Background Image Overlay if image background is active */}
      {design.bgType === 'image' && design.bgImage?.url && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${design.bgImage.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: design.bgImage.opacity ?? 0.8,
            zIndex: 0,
          }}
        >
          {design.bgImage.overlayColor && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: design.bgImage.overlayColor,
              }}
            />
          )}
        </div>
      )}

      {/* Background Video Overlay if video background is active */}
      {design.bgType === 'video' && (design as any).bgVideo?.url && (
        <video
          autoPlay
          loop
          muted
          playsInline
          src={(design as any).bgVideo.url}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: (design as any).bgVideo.opacity ?? 0.6,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Content wrapper */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: look === 'marquee' ? '100%' : '1280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: design.alignment === 'left' ? 'flex-start' : design.alignment === 'right' ? 'flex-end' : 'center',
          textAlign: design.alignment,
        }}
      >
        {/* ══════════════════════════════════════════════════════
            LOOK 1: SINGLE MESSAGE
           ══════════════════════════════════════════════════════ */}
        {look === 'single' && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: `${design.iconSpacing || 8}px`,
              maxWidth: '100%',
            }}
          >
            {content.icon && content.icon !== 'none' && (
              <span style={{ color: design.accentColor || 'currentColor', display: 'inline-flex' }}>
                {renderIcon(content.icon, design.iconSize || 14, design.accentColor)}
              </span>
            )}

            {content.link ? (
              <a
                href={content.link}
                target={content.openInNewTab ? '_blank' : '_self'}
                rel={content.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={handleLinkClick}
                style={{
                  color: 'inherit',
                  textDecoration: 'underline',
                  textUnderlineOffset: '2px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <span>{content.message}</span>
                {content.openInNewTab && <ExternalLink size={10} style={{ opacity: 0.7 }} />}
              </a>
            ) : (
              <span>{content.message}</span>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LOOK 2: SINGLE MESSAGE + CTA
           ══════════════════════════════════════════════════════ */}
        {look === 'single_cta' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: isMobile ? 'center' : design.alignment === 'left' ? 'space-between' : 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: `${isMobile ? 6 : design.ctaSpacing || 12}px`,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: `${design.iconSpacing || 8}px` }}>
              {content.icon && content.icon !== 'none' && (
                <span style={{ color: design.accentColor || 'currentColor', display: 'inline-flex' }}>
                  {renderIcon(content.icon, design.iconSize || 14, design.accentColor)}
                </span>
              )}
              <span>{content.message}</span>
            </div>

            {content.ctaLabel && (
              <div>
                {renderCtaButton(
                  content.ctaLabel,
                  content.ctaLink || '#',
                  content.ctaOpenInNewTab || false
                )}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LOOK 3: MESSAGE + COUNTDOWN
           ══════════════════════════════════════════════════════ */}
        {look === 'countdown' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              gap: `${isMobile ? 8 : 14}px`,
            }}
          >
            {/* If expired and replacement message requested */}
            {timeLeft.isExpired && behavior.countdownEndAction === 'replacement_message' ? (
              <span style={{ fontWeight: 600 }}>
                {behavior.countdownReplacementMessage || 'This limited time sale has ended!'}
              </span>
            ) : (
              <>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  {content.icon && content.icon !== 'none' ? (
                    <span style={{ color: design.accentColor || '#f59e0b', display: 'inline-flex' }}>
                      {renderIcon(content.icon, design.iconSize || 14, design.accentColor || '#f59e0b')}
                    </span>
                  ) : (
                    <Flame size={14} color={design.accentColor || '#f59e0b'} />
                  )}
                  <span style={{ fontWeight: 600 }}>{content.message}</span>
                </div>

                {/* Offer ended tag */}
                {timeLeft.isExpired && behavior.countdownEndAction === 'offer_ended' ? (
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 800,
                      backgroundColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      textTransform: 'uppercase',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                    }}
                  >
                    Offer Ended
                  </span>
                ) : (
                  /* Stacked Countdown Display: days:hours:minutes:seconds with unit labels underneath */
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    {[
                      { val: String(timeLeft.days).padStart(2, '0'), label: 'Days' },
                      { val: String(timeLeft.hours).padStart(2, '0'), label: 'Hours' },
                      { val: String(timeLeft.minutes).padStart(2, '0'), label: 'Minutes' },
                      { val: String(timeLeft.seconds).padStart(2, '0'), label: 'Seconds' },
                    ].map((unit, uIdx) => (
                      <React.Fragment key={unit.label}>
                        <div
                          style={{
                            display: 'inline-flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: isMobile ? '28px' : '36px',
                            background: design.countdownNumberStyle !== 'plain'
                              ? (design.countdownDigitBg || 'rgba(255, 255, 255, 0.18)')
                              : 'transparent',
                            color: design.countdownDigitColor || design.textColor || '#ffffff',
                            padding: design.countdownNumberStyle === 'card'
                              ? '2px 6px'
                              : design.countdownNumberStyle === 'pill'
                              ? '2px 8px'
                              : '0 2px',
                            borderRadius: design.countdownNumberStyle === 'pill' ? '9999px' : '5px',
                            boxShadow: design.countdownNumberStyle === 'card' ? '0 1px 2px rgba(0,0,0,0.12)' : 'none',
                          }}
                        >
                          <span
                            style={{
                              fontFamily: design.countdownTypography === 'sans' ? 'inherit' : 'ui-monospace, SFMono-Regular, monospace',
                              fontSize: isMobile ? '11px' : `${Math.max(12, effectiveFontSize)}px`,
                              fontWeight: 700,
                              lineHeight: 1.1,
                            }}
                          >
                            {unit.val}
                          </span>
                          <span
                            style={{
                              fontSize: isMobile ? '8px' : '9px',
                              fontWeight: 600,
                              opacity: 0.8,
                              textTransform: 'uppercase',
                              letterSpacing: '0.2px',
                              lineHeight: 1,
                              marginTop: '1px',
                            }}
                          >
                            {unit.label}
                          </span>
                        </div>

                        {uIdx < 3 && (
                          <span
                            style={{
                              fontSize: isMobile ? '12px' : '14px',
                              fontWeight: 800,
                              opacity: 0.6,
                              marginBottom: '8px',
                            }}
                          >
                            {design.countdownSeparatorStyle === 'dot' ? '•' : design.countdownSeparatorStyle === 'slash' ? '/' : ':'}
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                )}

                {/* Optional Countdown CTA */}
                {content.showCountdownCta && content.countdownCtaText && !timeLeft.isExpired && (
                  <div>
                    {renderCtaButton(
                      content.countdownCtaText,
                      content.countdownCtaLink || '#',
                      content.countdownCtaOpenInNewTab || false
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LOOK 4: MARQUEE TICKER
           ══════════════════════════════════════════════════════ */}
        {look === 'marquee' && (
          <div
            style={{
              width: '100%',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              maskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
              WebkitMaskImage: 'linear-gradient(to right, transparent, black 2%, black 98%, transparent)',
            }}
          >
            <style>{`
              @keyframes abMarqueeScrollLeft {
                0% { transform: translate3d(0, 0, 0); }
                100% { transform: translate3d(-50%, 0, 0); }
              }
              @keyframes abMarqueeScrollRight {
                0% { transform: translate3d(-50%, 0, 0); }
                100% { transform: translate3d(0, 0, 0); }
              }
            `}</style>
            {behavior.marqueeReducedMotion === 'static' ? (
              // Static display for reduced motion
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: `${design.messageSpacing || 24}px`,
                  width: '100%',
                  overflowX: 'auto',
                  padding: '0 8px',
                }}
              >
                {(content.marqueeItems || []).map((item, idx) => (
                  <div key={item.id || idx} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}>
                    {item.badge && (
                      <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', backgroundColor: design.accentColor || '#2563eb', color: '#ffffff', padding: '1px 5px', borderRadius: '3px' }}>
                        {item.badge}
                      </span>
                    )}
                    <span>{item.text}</span>
                    {idx < (content.marqueeItems || []).length - 1 && renderMarqueeSeparator()}
                  </div>
                ))}
              </div>
            ) : (
              // Animated seamless marquee
              <div
                className={styles.marqueeTrack}
                style={{
                  display: 'flex',
                  width: 'max-content',
                  willChange: 'transform',
                  animation: `${marqueeReverse ? 'abMarqueeScrollRight' : 'abMarqueeScrollLeft'} ${marqueeDuration} linear infinite`,
                  animationPlayState: (!isEditorInteractive && behavior.marqueePauseOnHover && isPaused) || isReducedMotionActive ? 'paused' : 'running',
                }}
              >
                {(() => {
                  const rawItems = (content.marqueeItems && content.marqueeItems.length > 0)
                    ? content.marqueeItems
                    : [
                        { id: 'm-1', text: content.message || 'Free worldwide shipping on orders over $50', badge: 'SALE' },
                        { id: 'm-2', text: '⚡ Exclusive seasonal promotions and discounts', badge: 'HOT' },
                      ];
                  const half = rawItems.length < 3 ? [...rawItems, ...rawItems] : rawItems;
                  const loopItems = [...half, ...half];

                  return loopItems.map((item, idx) => (
                    <div
                      key={`${item.id || idx}-${idx}`}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: `0 ${Math.max(12, Math.floor((design.messageSpacing || 32) / 2))}px`,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.badge && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                            backgroundColor: design.accentColor || '#f59e0b',
                            color: '#000000',
                            padding: '1px 5px',
                            borderRadius: '3px',
                            lineHeight: 1.2,
                          }}
                        >
                          {item.badge}
                        </span>
                      )}

                      {item.icon && renderIcon(item.icon, design.iconSize || 13, design.accentColor)}

                      {item.link ? (
                        <a
                          href={item.link}
                          onClick={handleLinkClick}
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{item.text}</span>
                        </a>
                      ) : (
                        <span>{item.text}</span>
                      )}

                      {item.ctaText && (
                        <span
                          onClick={handleLinkClick}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            fontWeight: 700,
                            color: design.accentColor || '#f59e0b',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '11px',
                            marginLeft: '2px',
                          }}
                        >
                          {item.ctaText} <ArrowRight size={11} />
                        </span>
                      )}

                      {renderMarqueeSeparator()}
                    </div>
                  ));
                })()}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            LOOK 5: SLIDE MESSAGES
           ══════════════════════════════════════════════════════ */}
        {look === 'slider' && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              maxWidth: '1200px',
              position: 'relative',
            }}
          >
            {/* Left arrow */}
            {slides.length > 1 && (behavior.slideNavigation === 'arrows' || behavior.slideNavigation === 'both') && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: design.slideNavColor || design.textColor || '#ffffff',
                  opacity: 0.75,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'opacity 0.15s ease',
                }}
                aria-label="Previous announcement"
              >
                <ChevronLeft size={16} />
              </button>
            )}

            {/* Slide active content with transition */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: design.slideAlignment === 'left' ? 'flex-start' : design.slideAlignment === 'right' ? 'flex-end' : 'center',
                gap: '8px',
                textAlign: design.slideAlignment || 'center',
                transition: behavior.slideTransition === 'fade' ? 'opacity 0.3s ease' : 'transform 0.3s ease',
              }}
            >
              {slides[currentSlideIndex]?.badge && (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    backgroundColor: design.accentColor || '#ffffff',
                    color: design.bgColor || '#0f766e',
                    padding: '1px 6px',
                    borderRadius: '4px',
                  }}
                >
                  {slides[currentSlideIndex].badge}
                </span>
              )}

              {slides[currentSlideIndex]?.icon &&
                renderIcon(slides[currentSlideIndex].icon, design.iconSize || 14, design.accentColor)}

              <span style={{ fontWeight: 500 }}>
                {slides[currentSlideIndex]?.text || 'Announcing our new seasonal collection'}
              </span>

              {slides[currentSlideIndex]?.ctaText && (
                <div>
                  {renderCtaButton(
                    slides[currentSlideIndex].ctaText!,
                    slides[currentSlideIndex].ctaLink || '#',
                    false,
                    true
                  )}
                </div>
              )}
            </div>

            {/* Right arrow */}
            {slides.length > 1 && (behavior.slideNavigation === 'arrows' || behavior.slideNavigation === 'both') && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: design.slideNavColor || design.textColor || '#ffffff',
                  opacity: 0.75,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'opacity 0.15s ease',
                }}
                aria-label="Next announcement"
              >
                <ChevronRight size={16} />
              </button>
            )}

            {/* Dot indicators */}
            {slides.length > 1 && (behavior.slideNavigation === 'dots' || behavior.slideNavigation === 'both') && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  marginLeft: '8px',
                }}
              >
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentSlideIndex(i);
                    }}
                    style={{
                      width: currentSlideIndex === i ? '12px' : '5px',
                      height: '5px',
                      borderRadius: '3px',
                      backgroundColor: currentSlideIndex === i ? (design.accentColor || '#ffffff') : (design.slideNavColor || 'rgba(255,255,255,0.4)'),
                      border: 'none',
                      padding: 0,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {behavior.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: 'none',
            color: design.textColor || '#ffffff',
            opacity: 0.65,
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '4px',
            zIndex: 10,
          }}
          title="Dismiss Announcement"
          aria-label="Dismiss Announcement"
        >
          <X size={14} />
        </button>
      )}

      {/* Editor Link Notice Toast */}
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

export default AnnouncementBarSection;

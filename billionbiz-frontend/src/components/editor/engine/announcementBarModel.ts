import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme, type ThemeColorPalette } from '../theme/themePresets';

export type AnnouncementLook = 'single' | 'single_cta' | 'countdown' | 'marquee' | 'slider';

export interface AnnouncementItem {
  id: string;
  text: string;
  icon?: string;
  badge?: string;
  link?: string;
  openInNewTab?: boolean;
  ctaText?: string;
  ctaLink?: string;
  ctaOpenInNewTab?: boolean;
}

export interface AnnouncementBarContent {
  // Single Message & General
  message: string;
  icon?: string;
  link?: string;
  openInNewTab?: boolean;

  // Single Message + CTA
  ctaLabel?: string;
  ctaLink?: string;
  ctaOpenInNewTab?: boolean;

  // Countdown
  countdownTarget?: string; // e.g. 2026-10-15T23:59
  timezone: string; // e.g. 'UTC', 'America/New_York', 'Asia/Kolkata', 'store'
  countdownFormat: 'dhms' | 'hms' | 'compact' | 'boxes';
  showCountdownCta?: boolean;
  countdownCtaText?: string;
  countdownCtaLink?: string;
  countdownCtaOpenInNewTab?: boolean;

  // Marquee
  marqueeItems: AnnouncementItem[];

  // Slide Messages
  slides: AnnouncementItem[];
}

export interface AnnouncementBarDesign {
  // Color Modes (defaults to 'inherit' to inherit from /editor/design color palette)
  bgColorMode?: 'inherit' | 'custom' | 'gradient' | 'image' | 'video';
  textColorMode?: 'inherit' | 'custom';
  accentColorMode?: 'inherit' | 'custom';
  ctaBgColorMode?: 'inherit' | 'custom' | 'gradient';
  ctaTextColorMode?: 'inherit' | 'custom';
  borderColorMode?: 'inherit' | 'custom';

  // Background
  bgType: 'solid' | 'gradient' | 'image' | 'video';
  bgColor: string;
  bgGradient: {
    type: 'linear' | 'radial';
    angle: number;
    from: string;
    to: string;
  };
  bgImage: {
    url: string;
    opacity: number;
    overlayColor: string;
  };
  bgVideo?: {
    url: string;
    opacity: number;
  };

  // Colors
  textColor: string;
  accentColor: string;
  ctaBgColor: string;
  ctaTextColor: string;
  borderColor: string;

  // Typography
  fontFamily: string;
  fontSize: number; // in px
  fontWeight: string | number; // '400', '500', '600', '700'
  lineHeight: number; // e.g. 1.3
  letterSpacing: number; // in px, e.g. 0, 0.5, 1

  // Layout & Spacing
  alignment: 'left' | 'center' | 'right';
  barHeight: number; // in px, e.g. 38
  paddingY: number; // in px
  paddingX: number; // in px
  messageSpacing: number; // in px, for marquee & slides

  // Border
  borderType: 'none' | 'solid' | 'dashed' | 'dotted';
  borderPosition: 'bottom' | 'top' | 'all' | 'none';
  borderWidth: number; // in px
  borderColorManual?: string;
  borderRadius: number; // in px

  // Look-Specific: Single Message
  iconSize: number;
  iconSpacing: number;

  // Look-Specific: Single Message + CTA
  ctaStyle: 'solid' | 'outline' | 'ghost';
  ctaSize: 'sm' | 'md' | 'lg';
  ctaRadius: number;
  ctaSpacing: number;

  // Look-Specific: Countdown
  countdownNumberStyle: 'pill' | 'card' | 'plain';
  countdownTypography: 'mono' | 'sans';
  countdownSeparatorStyle: 'colon' | 'dot' | 'slash';
  countdownDigitBg: string;
  countdownDigitColor: string;

  // Look-Specific: Marquee
  marqueeSeparatorStyle: 'bullet' | 'star' | 'dash' | 'slash' | 'emoji' | 'none';

  // Look-Specific: Slide Messages
  slideAlignment: 'left' | 'center' | 'right';
  slideNavStyle: 'arrows' | 'dots' | 'both' | 'none';
  slideNavColor: string;
}

export interface AnnouncementBarBehavior {
  // Common
  position?: 'normal' | 'sticky';
  isSticky?: boolean;
  visibilityMode: 'always' | 'scheduled';
  startDate?: string;
  endDate?: string;
  timezone: string;
  dismissible: boolean;
  rememberDismissal: 'session' | 'persistent';

  // Marquee
  marqueeDirection: 'ltr' | 'rtl';
  marqueeSpeed: number; // seconds for loop, e.g. 25
  marqueePauseOnHover: boolean;
  marqueeReducedMotion: 'pause' | 'slow' | 'static';

  // Slide Messages
  slideAutoplay: boolean;
  slideInterval: number; // seconds, e.g. 4
  slideTransition: 'slide' | 'fade';
  slideDirection: 'horizontal' | 'vertical';
  slidePauseOnHover: boolean;
  slideNavigation: 'arrows' | 'dots' | 'both' | 'none';

  // Countdown
  countdownEndAction: 'hide' | 'replacement_message' | 'offer_ended' | 'keep_visible';
  countdownReplacementMessage?: string;
}

export interface AnnouncementBarData {
  look: AnnouncementLook;
  content: AnnouncementBarContent;
  design: AnnouncementBarDesign;
  behavior: AnnouncementBarBehavior;
  customOverrides?: Partial<Record<string, any>>;
}

export interface AnnouncementLookDefinition {
  id: AnnouncementLook;
  name: string;
  description: string;
  badge: string;
  previewWireframe: {
    type: AnnouncementLook;
    label: string;
    hasCta?: boolean;
    hasTimer?: boolean;
    hasTicker?: boolean;
    hasArrows?: boolean;
  };
}

export const ANNOUNCEMENT_LOOKS: AnnouncementLookDefinition[] = [
  {
    id: 'single',
    name: 'Single Message',
    description: 'Clean static announcement centered on your storefront.',
    badge: 'Classic',
    previewWireframe: {
      type: 'single',
      label: '✨ Free worldwide shipping on orders over $50',
    },
  },
  {
    id: 'single_cta',
    name: 'Single Message + CTA',
    description: 'Prominent announcement paired with an actionable button or link.',
    badge: 'High Conversion',
    previewWireframe: {
      type: 'single_cta',
      label: '✨ Mid-Season Sale is live',
      hasCta: true,
    },
  },
  {
    id: 'countdown',
    name: 'Message + Countdown',
    description: 'Real-time countdown timer to build urgency for limited flash sales.',
    badge: 'Urgency',
    previewWireframe: {
      type: 'countdown',
      label: '🔥 Flash Sale Ends:',
      hasTimer: true,
      hasCta: true,
    },
  },
  {
    id: 'marquee',
    name: 'Marquee',
    description: 'Continuously scrolling ticker banner looping through multiple offers.',
    badge: 'Trending',
    previewWireframe: {
      type: 'marquee',
      label: 'Free Shipping ★ 40% Off ★ VIP Club ★ Free Returns',
      hasTicker: true,
    },
  },
  {
    id: 'slider',
    name: 'Slide Messages',
    description: 'Automatically rotating sequence of promotional slides with controls.',
    badge: 'Multi-Notice',
    previewWireframe: {
      type: 'slider',
      label: '✨ New Summer Arrivals Now Available',
      hasArrows: true,
    },
  },
];

export const TIMEZONE_OPTIONS = [
  { value: 'store', label: 'Store Timezone (Auto)' },
  { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
  { value: 'America/New_York', label: 'New York (EDT / EST)' },
  { value: 'America/Chicago', label: 'Chicago (CDT / CST)' },
  { value: 'America/Denver', label: 'Denver (MDT / MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PDT / PST)' },
  { value: 'Europe/London', label: 'London (GMT / BST)' },
  { value: 'Europe/Paris', label: 'Paris / Berlin (CET / CEST)' },
  { value: 'Asia/Dubai', label: 'Dubai (GST - UTC+4)' },
  { value: 'Asia/Kolkata', label: 'India (IST - UTC+5:30)' },
  { value: 'Asia/Singapore', label: 'Singapore (SGT - UTC+8)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST - UTC+9)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEST / AEDT)' },
];

export const ICON_OPTIONS = [
  { id: 'none', label: 'None', emoji: '' },
  { id: 'Sparkles', label: 'Sparkles', emoji: '✨' },
  { id: 'Flame', label: 'Flame / Hot', emoji: '🔥' },
  { id: 'Tag', label: 'Sale Tag', emoji: '🏷️' },
  { id: 'Truck', label: 'Delivery Truck', emoji: '🚚' },
  { id: 'Gift', label: 'Gift Box', emoji: '🎁' },
  { id: 'Star', label: 'Star', emoji: '⭐' },
  { id: 'Zap', label: 'Lightning', emoji: '⚡' },
  { id: 'Shield', label: 'Shield / Guarantee', emoji: '🛡️' },
  { id: 'Bell', label: 'Notification', emoji: '🔔' },
  { id: 'Clock', label: 'Clock', emoji: '⏰' },
  { id: 'Info', label: 'Information', emoji: 'ℹ️' },
  { id: 'Heart', label: 'Heart', emoji: '❤️' },
];

export const getInheritedThemeColors = (passedPalette?: ThemeColorPalette) => {
  let palette = passedPalette;
  if (!palette) {
    try {
      palette = useSiteStore.getState().theme?.palette || getDefaultTheme().palette;
    } catch {
      palette = getDefaultTheme().palette;
    }
  }

  // Top Announcement Bar Contrast Tokens:
  // Using footerBg (richly contrasting dark/slate in all presets, e.g. #0f172a, #18181b),
  // paired with text.inverse (#ffffff) or text.footerText (#f8fafc) so text and bg NEVER have the same color variable.
  const themeBg = palette?.background?.footerBg || palette?.brand?.primary || '#0f172a';
  const themeText = palette?.text?.inverse || palette?.text?.footerText || '#ffffff';
  const themeAccent = palette?.brand?.accent || '#38bdf8';
  const themeCtaBg = palette?.brand?.primary || '#2563eb';
  const themeCtaText = palette?.text?.inverse || '#ffffff';
  const themeBorder = palette?.border?.footerBorder || palette?.border?.border || 'rgba(255, 255, 255, 0.15)';

  return { themeBg, themeText, themeAccent, themeCtaBg, themeCtaText, themeBorder };
};

export const getLookDefaultDesign = (
  look: AnnouncementLook,
  passedPalette?: ThemeColorPalette
): AnnouncementBarDesign => {
  const { themeBg, themeText, themeAccent, themeCtaBg, themeCtaText, themeBorder } = getInheritedThemeColors(passedPalette);

  const base: AnnouncementBarDesign = {
    bgColorMode: 'inherit',
    textColorMode: 'inherit',
    accentColorMode: 'inherit',
    ctaBgColorMode: 'inherit',
    ctaTextColorMode: 'inherit',
    borderColorMode: 'inherit',

    bgType: 'solid',
    bgColor: themeBg,
    bgGradient: {
      type: 'linear',
      angle: 90,
      from: themeBg,
      to: '#020617',
    },
    bgImage: {
      url: '',
      opacity: 0.8,
      overlayColor: 'rgba(15, 23, 42, 0.75)',
    },
    bgVideo: {
      url: '',
      opacity: 0.6,
    },
    textColor: themeText,
    accentColor: themeAccent,
    ctaBgColor: themeCtaBg,
    ctaTextColor: themeCtaText,
    borderColor: themeBorder,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.3,
    letterSpacing: 0,
    alignment: 'center',
    barHeight: 38,
    paddingY: 8,
    paddingX: 16,
    messageSpacing: 24,
    borderType: 'solid',
    borderPosition: 'bottom',
    borderWidth: 1,
    borderRadius: 0,
    iconSize: 14,
    iconSpacing: 8,
    ctaStyle: 'solid',
    ctaSize: 'sm',
    ctaRadius: 6,
    ctaSpacing: 12,
    countdownNumberStyle: 'card',
    countdownTypography: 'mono',
    countdownSeparatorStyle: 'colon',
    countdownDigitBg: 'rgba(255, 255, 255, 0.18)',
    countdownDigitColor: themeText,
    marqueeSeparatorStyle: 'star',
    slideAlignment: 'center',
    slideNavStyle: 'both',
    slideNavColor: themeText,
  };

  switch (look) {
    case 'single':
      return {
        ...base,
        barHeight: 38,
        alignment: 'center',
      };

    case 'single_cta':
      return {
        ...base,
        barHeight: 42,
        alignment: 'center',
        ctaStyle: 'solid',
        ctaRadius: 6,
        ctaSpacing: 14,
      };

    case 'countdown':
      return {
        ...base,
        countdownNumberStyle: 'card',
        barHeight: 44,
        alignment: 'center',
      };

    case 'marquee':
      return {
        ...base,
        barHeight: 38,
        messageSpacing: 32,
        marqueeSeparatorStyle: 'star',
      };

    case 'slider':
      return {
        ...base,
        barHeight: 40,
        alignment: 'center',
        slideNavStyle: 'both',
      };

    default:
      return base;
  }
};

export const getLookDefaultBehavior = (_look: AnnouncementLook): AnnouncementBarBehavior => {
  return {
    isSticky: false,
    position: 'normal',
    visibilityMode: 'always',
    timezone: 'store',
    dismissible: false, // Defaultly UNCHECKED as requested
    rememberDismissal: 'session',

    marqueeDirection: 'ltr',
    marqueeSpeed: 25,
    marqueePauseOnHover: true,
    marqueeReducedMotion: 'pause',

    slideAutoplay: true,
    slideInterval: 4,
    slideTransition: 'slide',
    slideDirection: 'horizontal',
    slidePauseOnHover: true,
    slideNavigation: 'both',

    countdownEndAction: 'offer_ended',
    countdownReplacementMessage: 'This special promotion has concluded. Stay tuned for future offers!',
  };
};

export const resolveAnnouncementBarData = (
  row?: any,
  passedProps?: any,
  passedPalette?: ThemeColorPalette
): AnnouncementBarData => {
  const el = row?.elements?.[0];
  const props = { ...(passedProps || {}), ...(el?.props || {}) };
  const existing = (el?.props?.announcementBar || passedProps?.announcementBar) as AnnouncementBarData | undefined;

  const { themeBg, themeText, themeAccent, themeCtaBg, themeCtaText, themeBorder } = getInheritedThemeColors(passedPalette);

  // Determine look
  let look: AnnouncementLook = 'single';
  if (el?.props?.announcementBar?.look) {
    look = el.props.announcementBar.look;
  } else if (passedProps?.announcementBar?.look) {
    look = passedProps.announcementBar.look;
  } else if (row?.layout?.variantId && ['single', 'single_cta', 'countdown', 'marquee', 'slider'].includes(row.layout.variantId)) {
    look = row.layout.variantId as AnnouncementLook;
  } else if (el?.props?.variant && ['single', 'single_cta', 'countdown', 'marquee', 'slider'].includes(el.props.variant)) {
    look = el.props.variant as AnnouncementLook;
  } else if (props.variant && ['single', 'single_cta', 'countdown', 'marquee', 'slider'].includes(props.variant)) {
    look = props.variant as AnnouncementLook;
  } else if (props.variant === 'split') {
    look = 'single_cta';
  } else if (props.variant === 'carousel') {
    look = 'slider';
  } else if (props.showCountdown) {
    look = 'countdown';
  } else if (props.stylePreset === 'marquee') {
    look = 'marquee';
  } else if (props.ctaText || props.cta) {
    look = 'single_cta';
  }

  // Base message from existing
  const baseMessage =
    existing?.content?.message ||
    props.text ||
    (Array.isArray(props.announcements) && props.announcements[0]?.text) ||
    (Array.isArray(props.slides) && props.slides[0]?.text) ||
    '✨ Free worldwide shipping on orders over $50!';

  const defaultMarqueeItems: AnnouncementItem[] = [
    {
      id: 'm-1',
      text: baseMessage,
      badge: 'SALE',
      link: '/collections/sale',
    },
    {
      id: 'm-2',
      text: '⚡ Summer Special: Save up to 40% on selected seasonal items',
      badge: 'HOT',
      link: '/collections/featured',
    },
    {
      id: 'm-3',
      text: '🎁 Complimentary Gift Box with every luxury purchase',
      badge: 'GIFT',
      link: '/shop',
    },
  ];

  const defaultSlides: AnnouncementItem[] = [
    {
      id: 's-1',
      text: baseMessage,
      badge: 'HOT',
      ctaText: 'Shop Now',
      ctaLink: '/collections/sale',
    },
    {
      id: 's-2',
      text: '🚚 Free Express Shipping across all orders over $99',
      badge: 'FREE',
      ctaText: 'View Details',
      ctaLink: '/shipping',
    },
    {
      id: 's-3',
      text: '🌟 Members receive an extra 15% discount at checkout',
      badge: 'VIP',
      ctaText: 'Join Club',
      ctaLink: '/membership',
    },
  ];

  const content: AnnouncementBarContent = {
    message: baseMessage,
    icon: existing?.content?.icon ?? (props.icon || 'Sparkles'),
    link: existing?.content?.link ?? (props.link || props.ctaLink || ''),
    openInNewTab: existing?.content?.openInNewTab ?? Boolean(props.openInNewTab),

    ctaLabel: existing?.content?.ctaLabel ?? (props.ctaText || props.cta || 'Shop Now'),
    ctaLink: existing?.content?.ctaLink ?? (props.ctaLink || props.link || '/collections/sale'),
    ctaOpenInNewTab: existing?.content?.ctaOpenInNewTab ?? false,

    countdownTarget: existing?.content?.countdownTarget ?? (props.countdownTarget || '2026-12-31T23:59'),
    timezone: existing?.content?.timezone ?? 'store',
    countdownFormat: existing?.content?.countdownFormat ?? (props.countdownFormat || 'dhms'),
    showCountdownCta: existing?.content?.showCountdownCta ?? true,
    countdownCtaText: existing?.content?.countdownCtaText ?? (props.ctaText || 'Claim Offer'),
    countdownCtaLink: existing?.content?.countdownCtaLink ?? (props.ctaLink || '/collections/sale'),
    countdownCtaOpenInNewTab: existing?.content?.countdownCtaOpenInNewTab ?? false,

    marqueeItems: existing?.content?.marqueeItems && existing.content.marqueeItems.length > 0
      ? existing.content.marqueeItems
      : Array.isArray(props.announcements) && props.announcements.length > 0
      ? props.announcements.map((a: any, i: number) => ({
          id: `m-${i + 1}`,
          text: a.text || 'Announcement',
          badge: a.badge || '',
          link: a.link || '',
          ctaText: a.cta || '',
        }))
      : defaultMarqueeItems,

    slides: existing?.content?.slides && existing.content.slides.length > 0
      ? existing.content.slides
      : Array.isArray(props.slides) && props.slides.length > 0
      ? props.slides.map((s: any, i: number) => ({
          id: `s-${i + 1}`,
          text: s.text || 'Slide message',
          badge: s.badge || '',
          ctaText: s.cta || 'Shop Now',
          ctaLink: s.link || '/collections/sale',
        }))
      : defaultSlides,
  };

  const defaultDesign = getLookDefaultDesign(look, passedPalette);
  const customOverrides = existing?.customOverrides || {};
  const isSameLook = existing?.look === look;

  const bgColorMode = (existing?.design?.bgColorMode || (customOverrides.bgColorMode as any) || 'inherit') as 'inherit' | 'custom';
  const textColorMode = (existing?.design?.textColorMode || (customOverrides.textColorMode as any) || 'inherit') as 'inherit' | 'custom';
  const accentColorMode = (existing?.design?.accentColorMode || (customOverrides.accentColorMode as any) || 'inherit') as 'inherit' | 'custom';
  const ctaBgColorMode = (existing?.design?.ctaBgColorMode || (customOverrides.ctaBgColorMode as any) || 'inherit') as 'inherit' | 'custom';
  const ctaTextColorMode = (existing?.design?.ctaTextColorMode || (customOverrides.ctaTextColorMode as any) || 'inherit') as 'inherit' | 'custom';
  const borderColorMode = (existing?.design?.borderColorMode || (customOverrides.borderColorMode as any) || 'inherit') as 'inherit' | 'custom';

  const design: AnnouncementBarDesign = {
    ...defaultDesign,
    ...(isSameLook ? (existing?.design || {}) : {}),
    ...customOverrides,

    bgColorMode,
    textColorMode,
    accentColorMode,
    ctaBgColorMode,
    ctaTextColorMode,
    borderColorMode,

    bgColor: bgColorMode === 'custom'
      ? (customOverrides.bgColor || existing?.design?.bgColor || row?.styling?.bgColor || themeBg)
      : themeBg,

    textColor: textColorMode === 'custom'
      ? (customOverrides.textColor || existing?.design?.textColor || row?.styling?.textColor || themeText)
      : themeText,

    accentColor: accentColorMode === 'custom'
      ? (customOverrides.accentColor || existing?.design?.accentColor || themeAccent)
      : themeAccent,

    ctaBgColor: ctaBgColorMode === 'custom'
      ? (customOverrides.ctaBgColor || existing?.design?.ctaBgColor || themeCtaBg)
      : themeCtaBg,

    ctaTextColor: ctaTextColorMode === 'custom'
      ? (customOverrides.ctaTextColor || existing?.design?.ctaTextColor || themeCtaText)
      : themeCtaText,

    borderColor: borderColorMode === 'custom'
      ? (customOverrides.borderColor || existing?.design?.borderColor || row?.styling?.borderColor || themeBorder)
      : themeBorder,

    barHeight: customOverrides.barHeight !== undefined
      ? customOverrides.barHeight
      : (existing?.design?.barHeight || row?.layout?.height || defaultDesign.barHeight),
  };

  const defaultBehavior = getLookDefaultBehavior(look);
  const behavior: AnnouncementBarBehavior = {
    ...defaultBehavior,
    ...(existing?.behavior || {}),
    dismissible: existing?.behavior?.dismissible ?? (props.showCloseButton === true ? true : false),
    isSticky: existing?.behavior?.isSticky ?? (props.isSticky === true ? true : false),
    position: existing?.behavior?.position ?? (props.isSticky ? 'sticky' : 'normal'),
    marqueeSpeed: existing?.behavior?.marqueeSpeed ?? (props.speed || 25),
    marqueePauseOnHover: existing?.behavior?.marqueePauseOnHover ?? (props.pauseOnHover !== false),
  };

  return {
    look,
    content,
    design,
    behavior,
    customOverrides,
  };
};

/**
 * Switch Look while preserving compatible existing data and manual custom design overrides.
 */
export const switchAnnouncementLook = (
  current: AnnouncementBarData,
  newLook: AnnouncementLook,
  passedPalette?: ThemeColorPalette
): AnnouncementBarData => {
  const currentMessage =
    current.content.message ||
    current.content.marqueeItems?.[0]?.text ||
    current.content.slides?.[0]?.text ||
    '✨ Free worldwide shipping on orders over $50!';

  // Preserve content into new look structures
  const nextContent: AnnouncementBarContent = {
    ...current.content,
    message: currentMessage,
  };

  // If switching to marquee, ensure item 1 has the active message
  if (newLook === 'marquee') {
    const nextMarquee = [...current.content.marqueeItems];
    if (nextMarquee.length > 0) {
      nextMarquee[0] = { ...nextMarquee[0], text: currentMessage };
    } else {
      nextMarquee.push({ id: 'm-1', text: currentMessage, badge: 'SALE' });
    }
    nextContent.marqueeItems = nextMarquee;
  }

  // If switching to slider, ensure slide 1 has the active message
  if (newLook === 'slider') {
    const nextSlides = [...current.content.slides];
    if (nextSlides.length > 0) {
      nextSlides[0] = { ...nextSlides[0], text: currentMessage };
    } else {
      nextSlides.push({ id: 's-1', text: currentMessage, ctaText: current.content.ctaLabel || 'Shop Now' });
    }
    nextContent.slides = nextSlides;
  }

  // If switching to single_cta, guarantee cta defaults
  if (newLook === 'single_cta') {
    if (!nextContent.ctaLabel) nextContent.ctaLabel = 'Shop Now';
    if (!nextContent.ctaLink) nextContent.ctaLink = '/collections/sale';
  }

  // Load new Look defaults inheriting from theme palette, and retain custom overrides if set
  const newDefaults = getLookDefaultDesign(newLook, passedPalette);
  const nextDesign: AnnouncementBarDesign = {
    ...newDefaults,
    ...(current.customOverrides || {}),
    bgColorMode: current.design?.bgColorMode || 'inherit',
    textColorMode: current.design?.textColorMode || 'inherit',
    accentColorMode: current.design?.accentColorMode || 'inherit',
    ctaBgColorMode: current.design?.ctaBgColorMode || 'inherit',
    ctaTextColorMode: current.design?.ctaTextColorMode || 'inherit',
    borderColorMode: current.design?.borderColorMode || 'inherit',
    bgColor: current.design?.bgColorMode === 'custom' ? current.design.bgColor : newDefaults.bgColor,
    textColor: current.design?.textColorMode === 'custom' ? current.design.textColor : newDefaults.textColor,
    accentColor: current.design?.accentColorMode === 'custom' ? current.design.accentColor : newDefaults.accentColor,
    ctaBgColor: current.design?.ctaBgColorMode === 'custom' ? current.design.ctaBgColor : newDefaults.ctaBgColor,
    ctaTextColor: current.design?.ctaTextColorMode === 'custom' ? current.design.ctaTextColor : newDefaults.ctaTextColor,
    borderColor: current.design?.borderColorMode === 'custom' ? current.design.borderColor : newDefaults.borderColor,
  };

  const nextBehavior: AnnouncementBarBehavior = {
    ...current.behavior,
  };

  return {
    look: newLook,
    content: nextContent,
    design: nextDesign,
    behavior: nextBehavior,
    customOverrides: current.customOverrides || {},
  };
};

/**
 * Reset Look / Design to its default values
 */
export const resetAnnouncementBarDesign = (
  current: AnnouncementBarData,
  passedPalette?: ThemeColorPalette
): AnnouncementBarData => {
  const defaults = getLookDefaultDesign(current.look, passedPalette);
  return {
    ...current,
    design: defaults,
    customOverrides: {},
  };
};

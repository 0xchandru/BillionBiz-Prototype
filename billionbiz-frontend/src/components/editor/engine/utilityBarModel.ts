// ============================================================
// UTILITY BAR ENGINE MODEL & CONFIGURATION SCHEMA
// Comprehensive specifications for 14 Looks, Dynamic Tabs,
// Universal Icon System, Semantic Palette Variables & Behaviors
// ============================================================

export type UtilityBarLook =
  | 'split_support'        // A. Split Support & Tracking
  | 'contact_support'      // B. Contact & Support
  | 'promo_cta'            // C. Promo + CTA
  | 'free_shipping_trust'  // D. Free Shipping + Trust
  | 'currency_language'    // E. Language / Country / Currency
  | 'social_promo'         // F. Social + Promotion
  | 'slider'               // G. Multi-Message Slider
  | 'countdown'            // H. Countdown Promotion
  | 'marquee'              // I. Marquee Utility
  | 'two_tier'             // J. Two-Tier Utility
  | 'announcement_links'   // K. Announcement + Links
  | 'app_download'         // L. App Download
  | 'minimal'              // M. Minimal Utility
  | 'custom';              // N. Custom / Flexible

export type UtilityTabId =
  | 'look'
  | 'content'
  | 'layout'
  | 'behavior'
  | 'design'
  | 'responsive'
  | 'visibility'
  | 'advanced';

// ─── Universal Icon System Types ────────────────────────────
export type IconSource = 'none' | 'library' | 'custom' | 'upload';

export interface UtilityIconConfig {
  source: IconSource;
  iconName?: string;       // e.g. 'Phone', 'Truck', 'Globe', 'Sparkles'
  customSvgOrUrl?: string; // Image / SVG URL
  size?: number;           // in pixels (10-24)
  color?: string;          // Hex or 'inherit'
  strokeWidth?: number;    // 1-3
  position?: 'left' | 'right';
  gap?: number;            // in pixels (2-12)
}

// ─── Individual Reorderable Utility Item ────────────────────
export interface UtilityItem {
  id: string;
  enabled: boolean;
  label: string;
  value?: string;
  link?: string;
  target?: '_self' | '_blank';
  icon?: UtilityIconConfig;
  separator?: boolean;
  hideOnMobile?: boolean;
  width?: 'auto' | 'fill' | number;
  alignment?: 'left' | 'center' | 'right';
  tooltip?: string;
  badge?: string;
  type?: string;
}

// ─── Look Definition Schema ─────────────────────────────────
export interface UtilityBarLookMeta {
  id: UtilityBarLook;
  name: string;
  badge: string;
  description: string;
  example: string;
  supportedTabs: UtilityTabId[];
}

export const UTILITY_BAR_LOOKS: UtilityBarLookMeta[] = [
  {
    id: 'split_support',
    name: 'Split Support & Tracking',
    badge: 'Standard E-comm',
    description: 'Direct contact info on the left, order tracking & support shortcuts on the right.',
    example: '+91 98765 43210 | support@store.com  —  Track Order | Help',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'contact_support',
    name: 'Contact & Support',
    badge: 'Customer Care',
    description: 'Prominent phone, email, live chat and active business hours status.',
    example: '☎ +91 98765 43210 | ✉ support@store.com | Open 9am-6pm IST',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'promo_cta',
    name: 'Promo + CTA',
    badge: 'High Conversion',
    description: 'Highlight flash promotion with coupon copy button and direct action link.',
    example: '🎁 Get 10% OFF with code SAVE10 [Copy]  [Shop Now →]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'free_shipping_trust',
    name: 'Free Shipping + Trust',
    badge: 'Credibility',
    description: 'Display buyer protection, return guarantee, original products and free shipping threshold.',
    example: '🚚 Free shipping over ₹999 | 🛡️ Easy Returns | 🔒 Secure Payments',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'currency_language',
    name: 'Language / Country / Currency',
    badge: 'Global Store',
    description: 'Interactive internationalization dropdowns for multi-market storefronts.',
    example: 'English ▾ | India ▾ | INR ₹ ▾ — Track Order | Help',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'social_promo',
    name: 'Social + Promotion',
    badge: 'Community',
    description: 'Connect brand social channels with a limited-time community coupon code.',
    example: 'Instagram Facebook YouTube X | Follow Us Get 10% OFF',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'slider',
    name: 'Multi-Message Slider',
    badge: 'Rotating',
    description: 'Smooth rotating slider showcasing multiple value propositions in a single line.',
    example: '← Free Shipping | Easy Returns | Secure Payments →',
    supportedTabs: ['look', 'content', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'countdown',
    name: 'Countdown Promotion',
    badge: 'Urgency',
    description: 'Live ticking promotional countdown with headline, coupon and CTA.',
    example: '⚡ Flash Sale — 50% OFF | Ends in 02:14:36 [Shop Now →]',
    supportedTabs: ['look', 'content', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'marquee',
    name: 'Marquee Utility',
    badge: 'Dynamic Ticker',
    description: 'Continuous horizontal scrolling ticker with icons and promotion tags.',
    example: 'Free Shipping ✦ New Arrivals ✦ Code: SAVE10 ✦ Easy Returns ✦',
    supportedTabs: ['look', 'content', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'two_tier',
    name: 'Two-Tier Utility',
    badge: 'Comprehensive',
    description: 'Two independent stacked utility tiers: contact on top, shipping & promo below.',
    example: 'Top: Phone | Email | Store Locator — Bottom: 🚚 Free Shipping | SAVE10',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'announcement_links',
    name: 'Announcement + Links',
    badge: 'Informative',
    description: 'Primary announcement headline paired with quick utility links and separator.',
    example: '📢 We are now live | Collections | Blog | Support',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'app_download',
    name: 'App Download',
    badge: 'Mobile App',
    description: 'Invite customers to install iOS & Android apps with store badges or QR code.',
    example: 'Download our app for exclusive offers [App Store] [Google Play]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
  },
  {
    id: 'minimal',
    name: 'Minimal Utility',
    badge: 'Clean & Ultra-Compact',
    description: 'A whisper-quiet single line utility bar for ultra-clean minimalist storefronts.',
    example: 'Free shipping on orders over ₹999',
    supportedTabs: ['look', 'content', 'design', 'responsive'],
  },
  {
    id: 'custom',
    name: 'Custom / Flexible',
    badge: 'Fully Configurable',
    description: 'Freeform drag-and-drop utility bar with flexible multi-column distributions.',
    example: 'Merchant configurable custom items and links',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
  },
];

// ─── Semantic Color Palette Variables ───────────────────────
export interface UtilitySemanticColors {
  bg: string;
  text: string;
  mutedText: string;
  accent: string;
  link: string;
  linkHover: string;
  border: string;
  divider: string;
  icon: string;
  iconHover: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
  close: string;
}

export function getInheritedUtilityColors(themePalette: any): UtilitySemanticColors {
  const bg =
    themePalette?.background?.surface ||
    themePalette?.background?.sectionBg ||
    themePalette?.background?.background ||
    '#f8fafc';

  let text = themePalette?.text?.body || themePalette?.text?.heading || '#334155';
  if (text.toLowerCase() === bg.toLowerCase()) {
    text = '#0f172a';
  }

  const mutedText = themePalette?.text?.muted || '#64748b';
  const accent = themePalette?.brand?.accent || themePalette?.brand?.primary || '#2563eb';
  const link = themePalette?.brand?.primary || '#2563eb';
  const linkHover = themePalette?.brand?.secondary || '#1d4ed8';
  const border = themePalette?.border?.border || '#e2e8f0';
  const divider = themePalette?.border?.subtle || 'rgba(0, 0, 0, 0.12)';
  const icon = themePalette?.text?.muted || '#64748b';
  const iconHover = themePalette?.brand?.primary || '#2563eb';
  const buttonBg = themePalette?.brand?.primary || '#2563eb';
  const buttonText = themePalette?.text?.inverse || '#ffffff';
  const buttonHoverBg = themePalette?.brand?.secondary || '#1d4ed8';
  const buttonHoverText = themePalette?.text?.inverse || '#ffffff';
  const close = themePalette?.text?.muted || '#94a3b8';

  return {
    bg,
    text,
    mutedText,
    accent,
    link,
    linkHover,
    border,
    divider,
    icon,
    iconHover,
    buttonBg,
    buttonText,
    buttonHoverBg,
    buttonHoverText,
    close,
  };
}

// ─── Full Utility Bar Data Model ────────────────────────────
export interface UtilityBarContent {
  enabled: boolean;
  contentMode: 'preset' | 'custom';
  items: UtilityItem[];

  // Look-specific dynamic sections
  // Split Support:
  leftItems?: UtilityItem[];
  rightItems?: UtilityItem[];

  // Contact & Support:
  contactItems?: UtilityItem[];
  businessHours?: {
    enabled?: boolean;
    openingTime?: string;
    closingTime?: string;
    days?: string;
    timezone?: string;
  };

  // Promo + CTA:
  promoText?: string;
  highlightText?: string;
  couponCode?: string;
  enableCoupon?: boolean;
  copyConfirmationText?: string;
  enableCta?: boolean;
  ctaText?: string;
  ctaLink?: string;
  ctaOpenInNewTab?: boolean;
  ctaIcon?: UtilityIconConfig;

  // Free Shipping + Trust:
  trustItems?: UtilityItem[];

  // Language / Country / Currency:
  languageSelector?: {
    enabled?: boolean;
    defaultLanguage?: string;
    availableLanguages?: string[];
    displayMode?: 'text' | 'flag_text' | 'flag' | string;
  };
  countrySelector?: {
    enabled?: boolean;
    defaultCountry?: string;
    countries?: string[];
    showFlag?: boolean;
  };
  currencySelector?: {
    enabled?: boolean;
    defaultCurrency?: string;
    currencies?: string[];
    displayMode?: 'code' | 'symbol' | 'both' | string;
    format?: string;
  };
  extraLinks?: UtilityItem[];

  // Social + Promotion:
  socialLinks?: Array<{
    platform: string;
    url: string;
    openInNewTab: boolean;
    tooltip: string;
    enabled: boolean;
  }>;

  // Multi-Message Slider:
  slides?: UtilityItem[];

  // Countdown Promotion:
  countdownHeadline?: string;
  countdownTarget?: string;
  countdownTimezone?: string;
  countdownFormat?: 'dhms' | 'hms' | 'compact' | 'boxes';
  countdownAfterAction?: 'hide' | 'expired_message' | 'keep_visible' | 'redirect';
  countdownExpiredMessage?: string;
  countdownRedirectUrl?: string;

  // Marquee Utility:
  marqueeMessages?: UtilityItem[];

  // Two-Tier Utility:
  topTierItems?: UtilityItem[];
  bottomTierItems?: UtilityItem[];
  topRowItems?: UtilityItem[];
  bottomRowItems?: UtilityItem[];

  // Announcement + Links:
  announcementText?: string;
  announcementIcon?: UtilityIconConfig;
  announcementLinks?: UtilityItem[];
  linkSeparatorText?: string;

  // App Download:
  appHeading?: string;
  appSubheading?: string;
  androidAppUrl?: string;
  iosAppUrl?: string;
  showPlayStoreBadge?: boolean;
  showAppStoreBadge?: boolean;
  showQrCode?: boolean;
  qrCodeUrl?: string;

  // Schema-driven & look-specific convenience fields
  freeShippingThreshold?: string;
  minimalText?: string;
  promotion?: { text?: string; icon?: UtilityIconConfig };
  coupon?: { enabled?: boolean; code?: string; copyButtonText?: string };
  cta?: { enabled?: boolean; text?: string; url?: string };
  countdown?: { label?: string; endDate?: string; endTime?: string; format?: string };
  appDownload?: { headline?: string; iosUrl?: string; androidUrl?: string; showQrCode?: boolean };
}

export interface UtilityBarLayout {
  structure: 'one_row' | 'two_columns' | 'three_columns' | 'left_center_right' | 'custom_distribution';
  alignment: 'left' | 'center' | 'right' | 'space_between' | 'space_around' | 'space_evenly';
  direction: 'horizontal' | 'vertical';
  itemWrapping: 'no_wrap' | 'wrap' | 'scroll';
  itemGap: number;
  sectionGap: number;
  separatorGap: number;
  barHeight: number;
  minHeight: number;
  maxHeight?: number;
  contentMaxWidth: 'full' | 'contained';
  paddingX: number;
  paddingY: number;
}

export interface UtilityBarBehavior {
  // Sticky behavior (strictly isolated to utility bar)
  stickyPosition: 'none' | 'top' | 'header_relative';
  displayMode: 'static' | 'sticky' | 'fixed' | 'hide_on_scroll' | 'show_on_scroll' | 'hide_after_delay';
  hideDelaySeconds?: number;

  // Dismiss behavior
  enableCloseButton: boolean;
  rememberDismissal: 'session' | '1_day' | '7_days' | '30_days' | 'never';
  dismissible?: boolean;
  dismissDuration?: 'session' | '1_day' | '7_days' | '30_days' | 'never';

  // Slider behavior (slider look)
  sliderAutoplay?: boolean;
  sliderInterval?: number;
  sliderTransition?: 'slide' | 'fade';
  sliderTransitionSpeed?: number;
  sliderInfiniteLoop?: boolean;
  sliderPauseOnHover?: boolean;
  sliderShowArrows?: boolean;
  sliderShowDots?: boolean;
  sliderArrows?: boolean;
  sliderDots?: boolean;

  // Marquee behavior (marquee look)
  marqueeDirection?: 'rtl' | 'ltr';
  marqueeSpeed?: number;
  marqueePauseOnHover?: boolean;
  marqueePauseOnTouch?: boolean;

  // Countdown behavior (countdown look)
  countdownAutoRedirect?: boolean;
}

export interface UtilityBarDesign {
  // Background
  bgType: 'solid' | 'gradient' | 'image';
  bgColorMode: 'inherit' | 'custom' | 'gradient' | 'image';
  bgColor: string;
  bgGradient?: {
    type: 'linear' | 'radial';
    angle: number;
    from: string;
    to: string;
  };
  bgImage?: {
    url: string;
    opacity: number;
    overlayColor?: string;
  };

  // Borders & Shadows
  borderColor?: string;
  borderColorMode?: 'inherit' | 'custom';
  borderPosition: 'none' | 'bottom' | 'top' | 'all' | 'both';
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderType?: 'solid' | 'dashed' | 'dotted' | 'none';
  borderWidth: number;
  borderRadius: number;
  boxShadow: 'none' | 'sm' | 'md' | 'lg' | 'custom';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'custom';

  // Semantic Colors
  textColorMode: 'inherit' | 'custom';
  textColor: string;

  mutedTextColorMode: 'inherit' | 'custom';
  mutedTextColor: string;

  accentColorMode: 'inherit' | 'custom';
  accentColor: string;

  linkColorMode: 'inherit' | 'custom';
  linkColor: string;

  iconColorMode: 'inherit' | 'custom';
  iconColor: string;

  dividerColorMode: 'inherit' | 'custom';
  dividerColor: string;

  buttonBgColorMode: 'inherit' | 'custom' | 'gradient';
  buttonBgColor: string;

  buttonTextColorMode: 'inherit' | 'custom';
  buttonTextColor: string;

  hoverColorMode: 'inherit' | 'custom';
  hoverColor: string;

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';

  // Separators
  showSeparators: boolean;
  separatorType: 'line' | 'dot' | 'vertical_line' | 'custom_icon';
  separatorHeight: number;
  separatorThickness: number;

  // Button Design (CTA)
  buttonRadius: number;
  buttonPaddingX: number;
  buttonPaddingY: number;
  buttonFontSize: number;
  buttonFontWeight: number;

  // Icon Design
  iconSize: number;
  iconStrokeWidth: number;
  iconContainerRadius?: number;
}

export interface UtilityBarResponsive {
  showOnMobile: boolean;
  mobileLayout: 'horizontal' | 'vertical' | 'scrollable' | 'wrapped' | 'single_line';
  mobileFontSize: number;
  mobileItemGap: number;
  mobileIconSize: number;
  hideMobileIcons: boolean;
  showMobileCta: boolean;
  mobileCtaFullWidth: boolean;
  mobileOverflow: 'clip' | 'horizontal_scroll' | 'marquee' | 'wrap';
}

export interface UtilityBarVisibility {
  displayOnPages: 'all' | 'selected' | 'homepage_only' | 'product_pages' | 'collection_pages' | 'cart' | 'custom';
  selectedPageList?: string[];
  device: 'all' | 'desktop' | 'tablet' | 'mobile';
  customerVisibility: 'everyone' | 'logged_in' | 'guest';
  schedulingEnabled: boolean;
  startDate?: string;
  startTime?: string;
  endDate?: string;
  endTime?: string;
  timezone: string;
}

export interface UtilityBarAdvanced {
  customCss?: string;
  htmlId?: string;
  cssClass?: string;
  ariaLabel?: string;
  role?: string;
  screenReaderText?: string;
  keyboardNavigation: boolean;
  enableAnalytics: boolean;
  eventName?: string;
  ctaTracking: boolean;
  linkTracking: boolean;
  customDataAttributes?: Record<string, string>;
  customAnchorId?: string;
}

export interface UtilityBarData {
  look: UtilityBarLook;
  content: UtilityBarContent;
  layout: UtilityBarLayout;
  behavior: UtilityBarBehavior;
  design: UtilityBarDesign;
  responsive: UtilityBarResponsive;
  visibility: UtilityBarVisibility;
  advanced: UtilityBarAdvanced;
  customOverrides?: Record<string, any>;
}

// ─── Default Content Factory Per Look ───────────────────────
export function getDefaultContentForLook(look: UtilityBarLook): UtilityBarContent {
  switch (look) {
    case 'split_support':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        leftItems: [
          {
            id: 'u-phone',
            enabled: true,
            label: 'Phone',
            value: '+91 98765 43210',
            link: 'tel:+919876543210',
            icon: { source: 'library', iconName: 'Phone', size: 12, position: 'left' },
            separator: true,
          },
          {
            id: 'u-email',
            enabled: true,
            label: 'Email',
            value: 'support@store.com',
            link: 'mailto:support@store.com',
            icon: { source: 'library', iconName: 'Mail', size: 12, position: 'left' },
            separator: false,
          },
        ],
        rightItems: [
          {
            id: 'u-track',
            enabled: true,
            label: 'Track Order',
            link: '/track-order',
            icon: { source: 'library', iconName: 'Truck', size: 12, position: 'left' },
            separator: true,
          },
          {
            id: 'u-help',
            enabled: true,
            label: 'Help & FAQ',
            link: '/help',
            icon: { source: 'library', iconName: 'HelpCircle', size: 12, position: 'left' },
            separator: false,
          },
        ],
      };

    case 'contact_support':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        contactItems: [
          {
            id: 'c-phone',
            enabled: true,
            label: 'Phone Support',
            value: '+91 98765 43210',
            link: 'tel:+919876543210',
            icon: { source: 'library', iconName: 'Phone', size: 12 },
          },
          {
            id: 'c-email',
            enabled: true,
            label: 'Email Care',
            value: 'support@store.com',
            link: 'mailto:support@store.com',
            icon: { source: 'library', iconName: 'Mail', size: 12 },
          },
          {
            id: 'c-whatsapp',
            enabled: true,
            label: 'WhatsApp Chat',
            value: '+91 98765 43210',
            link: 'https://wa.me/919876543210',
            icon: { source: 'library', iconName: 'MessageSquare', size: 12 },
          },
        ],
        businessHours: {
          enabled: true,
          openingTime: '09:00',
          closingTime: '18:00',
          days: 'Mon - Sat',
          timezone: 'Asia/Kolkata',
        },
      };

    case 'promo_cta':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        promoText: 'Get 10% OFF your entire first order!',
        highlightText: 'SAVE10',
        couponCode: 'SAVE10',
        enableCoupon: true,
        copyConfirmationText: 'Copied!',
        enableCta: true,
        ctaText: 'Shop Now',
        ctaLink: '/collections/all',
        ctaOpenInNewTab: false,
        ctaIcon: { source: 'library', iconName: 'ArrowRight', size: 12, position: 'right' },
      };

    case 'free_shipping_trust':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        trustItems: [
          {
            id: 't-shipping',
            enabled: true,
            label: 'Free shipping over ₹999',
            icon: { source: 'library', iconName: 'Truck', size: 13 },
            separator: true,
          },
          {
            id: 't-returns',
            enabled: true,
            label: '30-Day Easy Returns',
            icon: { source: 'library', iconName: 'RotateCcw', size: 13 },
            separator: true,
          },
          {
            id: 't-secure',
            enabled: true,
            label: '100% Secure Payments',
            icon: { source: 'library', iconName: 'ShieldCheck', size: 13 },
            separator: false,
          },
        ],
      };

    case 'currency_language':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        languageSelector: {
          enabled: true,
          defaultLanguage: 'English',
          availableLanguages: ['English', 'Español', 'Français', 'Deutsch', 'Hindi'],
          displayMode: 'flag_text',
        },
        countrySelector: {
          enabled: true,
          defaultCountry: 'India',
          countries: ['India', 'United States', 'United Kingdom', 'Canada', 'Australia'],
          showFlag: true,
        },
        currencySelector: {
          enabled: true,
          defaultCurrency: 'INR',
          currencies: ['INR (₹)', 'USD ($)', 'EUR (€)', 'GBP (£)', 'AED (د.إ)'],
          displayMode: 'both',
        },
        extraLinks: [
          { id: 'el-track', enabled: true, label: 'Track Order', link: '/track-order' },
          { id: 'el-help', enabled: true, label: 'Customer Help', link: '/help' },
        ],
      };

    case 'social_promo':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        socialLinks: [
          { platform: 'Instagram', url: 'https://instagram.com', openInNewTab: true, tooltip: 'Follow us on Instagram', enabled: true },
          { platform: 'Facebook', url: 'https://facebook.com', openInNewTab: true, tooltip: 'Like us on Facebook', enabled: true },
          { platform: 'YouTube', url: 'https://youtube.com', openInNewTab: true, tooltip: 'Subscribe on YouTube', enabled: true },
          { platform: 'X', url: 'https://x.com', openInNewTab: true, tooltip: 'Follow us on X', enabled: true },
        ],
        promoText: 'Follow us & get an extra 10% off with code SOCIAL10',
        couponCode: 'SOCIAL10',
        ctaText: 'Claim Offer',
        ctaLink: '/collections/sale',
      };

    case 'slider':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        slides: [
          { id: 's-1', enabled: true, label: '🚚 Free Express Shipping across all orders over ₹999', link: '/shipping' },
          { id: 's-2', enabled: true, label: '🛡️ 30-Day Hassle-Free Returns & Replacements', link: '/returns' },
          { id: 's-3', enabled: true, label: '💳 100% Encrypted & Secure Checkout Experience', link: '/security' },
        ],
      };

    case 'countdown':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        countdownHeadline: '⚡ Flash Sale Ends Soon:',
        countdownTarget: '2026-12-31T23:59',
        countdownTimezone: 'Asia/Kolkata',
        countdownFormat: 'dhms',
        enableCta: true,
        ctaText: 'Shop Deals',
        ctaLink: '/collections/flash-sale',
        countdownAfterAction: 'keep_visible',
        countdownExpiredMessage: 'This flash offer has concluded!',
      };

    case 'marquee':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        marqueeMessages: [
          { id: 'm-1', enabled: true, label: 'Free Worldwide Shipping on Orders Over ₹999', icon: { source: 'library', iconName: 'Truck', size: 12 } },
          { id: 'm-2', enabled: true, label: 'Mid-Season Clearance: Up to 50% Off Selected Styles', icon: { source: 'library', iconName: 'Flame', size: 12 } },
          { id: 'm-3', enabled: true, label: 'Use Code SAVE10 for Extra 10% Off', icon: { source: 'library', iconName: 'Tag', size: 12 } },
        ],
      };

    case 'two_tier': {
      const topItems: UtilityItem[] = [
        { id: 'tt-phone', enabled: true, label: 'Phone', value: '+91 98765 43210', link: 'tel:+919876543210', icon: { source: 'library', iconName: 'Phone', size: 11 }, separator: true },
        { id: 'tt-email', enabled: true, label: 'Email', value: 'support@store.com', link: 'mailto:support@store.com', icon: { source: 'library', iconName: 'Mail', size: 11 }, separator: true },
        { id: 'tt-locator', enabled: true, label: 'Store Locator', link: '/stores', icon: { source: 'library', iconName: 'MapPin', size: 11 }, separator: true },
        { id: 'tt-track', enabled: true, label: 'Track Order', link: '/track-order', icon: { source: 'library', iconName: 'Truck', size: 11 }, separator: false },
      ];
      const bottomItems: UtilityItem[] = [
        { id: 'tt-free', enabled: true, label: '🚚 Free Express Shipping Over ₹999', link: '/shipping', separator: true },
        { id: 'tt-coupon', enabled: true, label: '🎁 Save 10% With Code SAVE10', link: '/sale', separator: true },
        { id: 'tt-cta', enabled: true, label: 'Shop New Arrivals →', link: '/collections/new', separator: false },
      ];
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        topTierItems: topItems,
        bottomTierItems: bottomItems,
        topRowItems: topItems,
        bottomRowItems: bottomItems,
      };
    }

    case 'announcement_links':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        announcementText: '📢 We are now officially shipping worldwide!',
        announcementIcon: { source: 'library', iconName: 'Megaphone', size: 13 },
        linkSeparatorText: '|',
        announcementLinks: [
          { id: 'al-collections', enabled: true, label: 'Collections', link: '/collections' },
          { id: 'al-blog', enabled: true, label: 'Journal', link: '/blog' },
          { id: 'al-support', enabled: true, label: 'Support', link: '/support' },
        ],
      };

    case 'app_download':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [],
        appHeading: 'Download our app for VIP discounts & fast tracking',
        androidAppUrl: 'https://play.google.com',
        iosAppUrl: 'https://apple.com/app-store',
        showPlayStoreBadge: true,
        showAppStoreBadge: true,
        showQrCode: true,
      };

    case 'minimal':
      return {
        enabled: true,
        contentMode: 'preset',
        items: [
          {
            id: 'min-1',
            enabled: true,
            label: 'Free shipping on all domestic orders over ₹999',
            link: '/collections/all',
            icon: { source: 'library', iconName: 'Sparkles', size: 11 },
          },
        ],
      };

    case 'custom':
    default:
      return {
        enabled: true,
        contentMode: 'custom',
        items: [
          { id: 'cust-1', enabled: true, label: '+91 98765 43210', link: 'tel:+919876543210', icon: { source: 'library', iconName: 'Phone', size: 12 }, separator: true },
          { id: 'cust-2', enabled: true, label: 'Track Order', link: '/track', icon: { source: 'library', iconName: 'Truck', size: 12 }, separator: true },
          { id: 'cust-3', enabled: true, label: 'Language: English', icon: { source: 'library', iconName: 'Globe', size: 12 }, separator: false },
        ],
      };
  }
}

// ─── Default Layout Factory Per Look ────────────────────────
export function getDefaultLayoutForLook(look: UtilityBarLook): UtilityBarLayout {
  switch (look) {
    case 'split_support':
    case 'currency_language':
    case 'social_promo':
    case 'announcement_links':
      return {
        structure: 'two_columns',
        alignment: 'space_between',
        direction: 'horizontal',
        itemWrapping: 'no_wrap',
        itemGap: 16,
        sectionGap: 24,
        separatorGap: 12,
        barHeight: 34,
        minHeight: 30,
        contentMaxWidth: 'contained',
        paddingX: 20,
        paddingY: 6,
      };

    case 'free_shipping_trust':
    case 'slider':
    case 'countdown':
    case 'promo_cta':
    case 'minimal':
      return {
        structure: 'one_row',
        alignment: 'center',
        direction: 'horizontal',
        itemWrapping: 'no_wrap',
        itemGap: 18,
        sectionGap: 18,
        separatorGap: 12,
        barHeight: 34,
        minHeight: 30,
        contentMaxWidth: 'contained',
        paddingX: 16,
        paddingY: 6,
      };

    case 'marquee':
      return {
        structure: 'one_row',
        alignment: 'left',
        direction: 'horizontal',
        itemWrapping: 'no_wrap',
        itemGap: 32,
        sectionGap: 32,
        separatorGap: 16,
        barHeight: 34,
        minHeight: 30,
        contentMaxWidth: 'full',
        paddingX: 0,
        paddingY: 6,
      };

    case 'two_tier':
      return {
        structure: 'two_columns',
        alignment: 'space_between',
        direction: 'vertical',
        itemWrapping: 'wrap',
        itemGap: 12,
        sectionGap: 16,
        separatorGap: 10,
        barHeight: 64,
        minHeight: 56,
        contentMaxWidth: 'contained',
        paddingX: 20,
        paddingY: 6,
      };

    case 'contact_support':
    case 'app_download':
    case 'custom':
    default:
      return {
        structure: 'two_columns',
        alignment: 'space_between',
        direction: 'horizontal',
        itemWrapping: 'no_wrap',
        itemGap: 14,
        sectionGap: 20,
        separatorGap: 12,
        barHeight: 36,
        minHeight: 30,
        contentMaxWidth: 'contained',
        paddingX: 20,
        paddingY: 6,
      };
  }
}

// ─── Default Behavior Factory Per Look ──────────────────────
export function getDefaultBehaviorForLook(look: UtilityBarLook): UtilityBarBehavior {
  return {
    stickyPosition: 'none',
    displayMode: 'static',
    enableCloseButton: false,
    rememberDismissal: 'session',

    sliderAutoplay: look === 'slider',
    sliderInterval: 4,
    sliderTransition: 'slide',
    sliderTransitionSpeed: 300,
    sliderInfiniteLoop: true,
    sliderPauseOnHover: true,
    sliderShowArrows: true,
    sliderShowDots: false,

    marqueeDirection: 'rtl',
    marqueeSpeed: 25,
    marqueePauseOnHover: true,
    marqueePauseOnTouch: true,

    countdownAutoRedirect: false,
  };
}

// ─── Default Design Factory ─────────────────────────────────
export function getDefaultDesign(themePalette: any): UtilityBarDesign {
  const c = getInheritedUtilityColors(themePalette);
  return {
    bgType: 'solid',
    bgColorMode: 'inherit',
    bgColor: c.bg,

    textColorMode: 'inherit',
    textColor: c.text,

    mutedTextColorMode: 'inherit',
    mutedTextColor: c.mutedText,

    accentColorMode: 'inherit',
    accentColor: c.accent,

    linkColorMode: 'inherit',
    linkColor: c.link,

    iconColorMode: 'inherit',
    iconColor: c.icon,

    dividerColorMode: 'inherit',
    dividerColor: c.divider,

    buttonBgColorMode: 'inherit',
    buttonBgColor: c.buttonBg,

    buttonTextColorMode: 'inherit',
    buttonTextColor: c.buttonText,

    hoverColorMode: 'inherit',
    hoverColor: c.linkHover,

    fontFamily: 'inherit',
    fontSize: 11,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0.1,
    textTransform: 'none',

    borderPosition: 'bottom',
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 0,
    boxShadow: 'none',

    showSeparators: true,
    separatorType: 'vertical_line',
    separatorHeight: 12,
    separatorThickness: 1,

    buttonRadius: 4,
    buttonPaddingX: 10,
    buttonPaddingY: 3,
    buttonFontSize: 11,
    buttonFontWeight: 600,

    iconSize: 12,
    iconStrokeWidth: 2,
    iconContainerRadius: 4,
  };
}

// ─── Default Responsive Factory ─────────────────────────────
export function getDefaultResponsive(): UtilityBarResponsive {
  return {
    showOnMobile: true,
    mobileLayout: 'horizontal',
    mobileFontSize: 10,
    mobileItemGap: 10,
    mobileIconSize: 11,
    hideMobileIcons: false,
    showMobileCta: true,
    mobileCtaFullWidth: false,
    mobileOverflow: 'horizontal_scroll',
  };
}

// ─── Default Visibility Factory ─────────────────────────────
export function getDefaultVisibility(): UtilityBarVisibility {
  return {
    displayOnPages: 'all',
    device: 'all',
    customerVisibility: 'everyone',
    schedulingEnabled: false,
    timezone: 'Asia/Kolkata',
  };
}

// ─── Default Advanced Factory ───────────────────────────────
export function getDefaultAdvanced(): UtilityBarAdvanced {
  return {
    keyboardNavigation: true,
    enableAnalytics: false,
    ctaTracking: true,
    linkTracking: true,
  };
}

// ─── Central Resolver Function ──────────────────────────────
export function resolveUtilityBarData(
  row: any,
  passedProps: any,
  themePalette: any
): UtilityBarData {
  const el = row?.elements?.[0];
  const props = { ...(passedProps || {}), ...(el?.props || {}) };
  const existing = (el?.props?.utilityBar || passedProps?.utilityBar) as UtilityBarData | undefined;

  let look: UtilityBarLook = 'split_support';
  if (existing?.look) {
    look = existing.look;
  } else if (props.look) {
    look = props.look;
  } else if (props.variant && UTILITY_BAR_LOOKS.some((l) => l.id === props.variant)) {
    look = props.variant;
  } else if (row?.layout?.variantId && UTILITY_BAR_LOOKS.some((l) => l.id === row.layout.variantId)) {
    look = row.layout.variantId;
  }

  const defaultContent = getDefaultContentForLook(look);
  const defaultLayout = getDefaultLayoutForLook(look);
  const defaultBehavior = getDefaultBehaviorForLook(look);
  const defaultDesign = getDefaultDesign(themePalette);
  const defaultResponsive = getDefaultResponsive();
  const defaultVisibility = getDefaultVisibility();
  const defaultAdvanced = getDefaultAdvanced();

  const isSameLook = existing?.look === look;

  return {
    look,
    content: {
      ...defaultContent,
      ...(isSameLook ? (existing?.content || {}) : {}),
      ...(existing?.content?.topRowItems && !existing?.content?.topTierItems ? { topTierItems: existing.content.topRowItems } : {}),
      ...(existing?.content?.topTierItems && !existing?.content?.topRowItems ? { topRowItems: existing.content.topTierItems } : {}),
      ...(existing?.content?.bottomRowItems && !existing?.content?.bottomTierItems ? { bottomTierItems: existing.content.bottomRowItems } : {}),
      ...(existing?.content?.bottomTierItems && !existing?.content?.bottomRowItems ? { bottomRowItems: existing.content.bottomTierItems } : {}),
      ...(props.phone ? { leftItems: defaultContent.leftItems?.map(i => i.id === 'u-phone' ? { ...i, value: props.phone } : i) } : {}),
      ...(props.email ? { leftItems: defaultContent.leftItems?.map(i => i.id === 'u-email' ? { ...i, value: props.email } : i) } : {}),
    },
    layout: {
      ...defaultLayout,
      ...(isSameLook ? (existing?.layout || {}) : {}),
      ...(row?.layout?.height ? { barHeight: row.layout.height } : {}),
    },
    behavior: {
      ...defaultBehavior,
      ...(isSameLook ? (existing?.behavior || {}) : {}),
    },
    design: {
      ...defaultDesign,
      ...(isSameLook ? (existing?.design || {}) : {}),
      ...(row?.styling?.bgColor ? { bgColor: row.styling.bgColor, bgColorMode: 'custom' as const } : {}),
      ...(row?.styling?.textColor ? { textColor: row.styling.textColor, textColorMode: 'custom' as const } : {}),
    },
    responsive: {
      ...defaultResponsive,
      ...(isSameLook ? (existing?.responsive || {}) : {}),
    },
    visibility: {
      ...defaultVisibility,
      ...(isSameLook ? (existing?.visibility || {}) : {}),
    },
    advanced: {
      ...defaultAdvanced,
      ...(isSameLook ? (existing?.advanced || {}) : {}),
    },
    customOverrides: existing?.customOverrides || {},
  };
}

// ─── Switch Look with Clean Defaults ────────────────────────
export function switchUtilityBarLook(
  current: UtilityBarData,
  newLook: UtilityBarLook,
  themePalette: any
): UtilityBarData {
  return {
    look: newLook,
    content: getDefaultContentForLook(newLook),
    layout: getDefaultLayoutForLook(newLook),
    behavior: getDefaultBehaviorForLook(newLook),
    design: {
      ...getDefaultDesign(themePalette),
      ...(current.customOverrides || {}),
    },
    responsive: getDefaultResponsive(),
    visibility: current.visibility,
    advanced: current.advanced,
    customOverrides: current.customOverrides || {},
  };
}

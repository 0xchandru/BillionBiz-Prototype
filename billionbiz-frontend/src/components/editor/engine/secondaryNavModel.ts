// ============================================================
// SECONDARY NAVIGATION ENGINE MODEL & CONFIGURATION SCHEMA
// 24 Looks, Dynamic Tabs, Capability-Driven Controls,
// Semantic Palette Variables, Responsive Architecture
// ============================================================

export type SecondaryNavLook =
  | 'minimal_text'         // 1. Minimal Text Links
  | 'active_underline'     // 2. Active Underline
  | 'pill_tabs'            // 3. Pill / Rounded Tabs
  | 'icon_text'            // 4. Icon + Text
  | 'icon_label'           // 5. Icon Above + Label Below ⭐
  | 'icon_text_dropdown'   // 6. Icon + Text with Dropdown
  | 'image_category'       // 7. Image Category Navigation
  | 'category_cards'       // 8. Category Cards
  | 'scrollable_rail'      // 9. Scrollable Category Rail
  | 'mega_menu'            // 10. Mega Menu Navigation
  | 'full_width_tabs'      // 11. Full-Width Tabs
  | 'centered'             // 12. Centered Navigation
  | 'two_row'              // 13. Two-Row Navigation
  | 'filter_chip'          // 14. Filter / Chip Navigation
  | 'bg_highlight'         // 15. Background Highlight
  | 'border_indicator'     // 16. Border / Bottom Indicator
  | 'mega_banner'          // 17. Category + Banner Mega Navigation
  | 'compact_dropdown'     // 18. Compact Dropdown
  | 'brand_theme'          // 19. Brand / Theme Navigation
  | 'gradient'             // 20. Gradient Navigation
  | 'sticky_nav'           // 21. Sticky Secondary Navigation
  | 'icon_only'            // 22. Icon-Only Navigation
  | 'promo_rail'           // 23. Promotional Category Rail
  | 'custom';              // 24. Custom / Flexible

export type SecondaryNavTabId =
  | 'look'
  | 'content'
  | 'layout'
  | 'behavior'
  | 'design'
  | 'responsive'
  | 'visibility'
  | 'advanced';

// ─── Icon System Types (shared with UtilityBar) ─────────────
export type IconSource = 'none' | 'library' | 'custom' | 'upload';

export interface NavIconConfig {
  source: IconSource;
  iconName?: string;
  customSvgOrUrl?: string;
  size?: number;
  color?: string;
  hoverColor?: string;
  activeColor?: string;
  strokeWidth?: number;
  width?: number;
  height?: number;
  position?: 'left' | 'right' | 'top' | 'bottom';
  gap?: number;
}

// ─── Navigation Item Model ──────────────────────────────────
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: NavIconConfig;
  image?: {
    url?: string;
    alt?: string;
    position?: 'top' | 'left' | 'right' | 'bottom' | 'background';
    hoverZoom?: boolean;
    hoverOverlay?: boolean;
    borderRadius?: number;
  };
  badge?: string;
  badgeColor?: string;
  count?: number;
  subtitle?: string;
  description?: string;
  tooltip?: string;
  target?: '_self' | '_blank';
  linkType?: 'internal' | 'external' | 'dropdown' | 'mega_menu' | 'category';
  enabled: boolean;
  isActive?: boolean;
  hideOnMobile?: boolean;
  cssClass?: string;
  customId?: string;
  children?: NavigationItem[];
  styleOverrides?: Record<string, any>;

  // Mega-menu specific
  megaColumns?: MegaMenuColumn[];
  megaPromo?: {
    image?: string;
    heading?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
  };
}

export interface MegaMenuColumn {
  id: string;
  title: string;
  links: { label: string; href: string; description?: string }[];
  image?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  itemSpacing?: number;
}

// ─── Look Capability Map ────────────────────────────────────
export interface LookCapabilities {
  icons: boolean;
  images: boolean;
  dropdown: boolean;
  megaMenu: boolean;
  slider: boolean;
  badges: boolean;
  sticky: boolean;
  nestedItems: boolean;
  activeIndicator: boolean;
  tooltips: boolean;
}

// ─── Look Definition Schema ─────────────────────────────────
export interface SecondaryNavLookMeta {
  id: SecondaryNavLook;
  name: string;
  badge: string;
  description: string;
  example: string;
  supportedTabs: SecondaryNavTabId[];
  capabilities: LookCapabilities;
  defaults: {
    alignment?: string;
    itemGap?: number;
    iconPosition?: string;
    activeIndicator?: string;
    overflow?: string;
  };
}

export const SECONDARY_NAV_LOOKS: SecondaryNavLookMeta[] = [
  {
    id: 'minimal_text',
    name: 'Minimal Text Links',
    badge: 'Simple',
    description: 'Clean horizontal text links. Best for simple stores with fewer categories.',
    example: 'All Products   New In   Best Sellers   Sale   Collections',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'none', overflow: 'scroll' },
  },
  {
    id: 'active_underline',
    name: 'Active Underline',
    badge: 'Popular',
    description: 'Active category highlighted with a bottom underline indicator.',
    example: 'All Products   New In   Best Sellers   Sale   Collections\n                              ───────',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'pill_tabs',
    name: 'Pill / Rounded Tabs',
    badge: 'Modern',
    description: 'Categories styled as pill-shaped buttons with rounded corners.',
    example: '[ All ] [ New In ] [ Best Sellers ] [ Sale ] [ Collections ]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 8, activeIndicator: 'background', overflow: 'scroll' },
  },
  {
    id: 'icon_text',
    name: 'Icon + Text',
    badge: 'Visual',
    description: 'Icon placed beside the category text for visual clarity.',
    example: '▦ All     ☆ New In     ♢ Best Sellers     🎁 Sale',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: true, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 20, iconPosition: 'left', activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'icon_label',
    name: 'Icon Above + Label Below',
    badge: '⭐ Featured',
    description: 'Icon on top, label below with active underline. Scrollable horizontal category rail.',
    example: '🛍️  For You  |  👕  Fashion  |  📱  Mobiles  |  💻  Electronics  |  💄  Beauty',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    capabilities: { icons: true, images: false, dropdown: false, megaMenu: false, slider: true, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: true },
    defaults: { alignment: 'center', itemGap: 28, iconPosition: 'top', activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'icon_text_dropdown',
    name: 'Icon + Text with Dropdown',
    badge: 'Multi-Level',
    description: 'Categories with icons and dropdown arrows for subcategory access.',
    example: '👕 Fashion ▾    👟 Shoes ▾    👜 Bags ▾    ⌚ Watches',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    capabilities: { icons: true, images: false, dropdown: true, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: true, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 20, iconPosition: 'left', activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'image_category',
    name: 'Image Category Navigation',
    badge: 'Visual',
    description: 'Category images with labels below. Best for fashion and lifestyle stores.',
    example: '[shirt img] [shoe img] [bag img] [watch img]\n   Fashion       Shoes        Bags       Watches',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    capabilities: { icons: false, images: true, dropdown: false, megaMenu: false, slider: true, badges: true, sticky: false, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 16, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'category_cards',
    name: 'Category Cards',
    badge: 'Rich Content',
    description: 'Larger cards with image, title, optional count and description.',
    example: '┌─────────┐ ┌─────────┐ ┌─────────┐\n│  Image   │ │  Image   │ │  Image   │\n│ Fashion  │ │  Shoes   │ │   Bags   │\n│  128 items│ │  64 items│ │  42 items│\n└─────────┘ └─────────┘ └─────────┘',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    capabilities: { icons: true, images: true, dropdown: false, megaMenu: false, slider: true, badges: true, sticky: false, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 12, activeIndicator: 'background', overflow: 'scroll' },
  },
  {
    id: 'scrollable_rail',
    name: 'Scrollable Category Rail',
    badge: 'Many Items',
    description: 'Horizontally scrollable rail with arrows. Ideal for many categories.',
    example: '← All | T-Shirts | Shirts | Hoodies | Jackets | Jeans | Accessories →',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: true, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 20, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'mega_menu',
    name: 'Mega Menu Navigation',
    badge: 'Enterprise',
    description: 'Full-width dropdown panels with multi-column layouts and promotional areas.',
    example: 'Fashion ▾ | Shoes ▾ | Bags ▾ | Accessories ▾\n─────────────────────────────────────────────',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    capabilities: { icons: true, images: true, dropdown: true, megaMenu: true, slider: false, badges: true, sticky: true, nestedItems: true, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'wrap' },
  },
  {
    id: 'full_width_tabs',
    name: 'Full-Width Tabs',
    badge: 'Stretch',
    description: 'Categories distributed evenly across the entire available width.',
    example: '|  All Products  |  New In  |  Best Sellers  |  Sale  |  Collections  |',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 0, activeIndicator: 'underline', overflow: 'wrap' },
  },
  {
    id: 'centered',
    name: 'Centered Navigation',
    badge: 'Clean',
    description: 'Items centered inside the content container with balanced spacing.',
    example: '          All Products   New In   Best Sellers   Sale          ',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 24, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'two_row',
    name: 'Two-Row Navigation',
    badge: 'Dense',
    description: 'Two stacked navigation rows for primary and secondary category tiers.',
    example: 'Men | Women | Kids | Shoes | Bags | Accessories\n──────────────────────────────────────\nAll | T-Shirts | Shirts | Hoodies | Jackets',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: true, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 20, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'filter_chip',
    name: 'Filter / Chip Navigation',
    badge: 'Interactive',
    description: 'Compact chips that function as toggleable category filters.',
    example: '[All] [T-Shirts] [Shirts] [Hoodies] [Jackets] [Jeans]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 8, activeIndicator: 'background', overflow: 'scroll' },
  },
  {
    id: 'bg_highlight',
    name: 'Background Highlight',
    badge: 'Bold',
    description: 'Active category receives a filled background color for strong visual emphasis.',
    example: 'All Products   [New In]   Best Sellers   Sale   Collections',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 16, activeIndicator: 'background', overflow: 'scroll' },
  },
  {
    id: 'border_indicator',
    name: 'Border / Bottom Indicator',
    badge: 'Minimal',
    description: 'Active item identified using bottom border, top border, or side indicator.',
    example: 'All Products   New In   Best Sellers   Sale\n                         ─────────────',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'mega_banner',
    name: 'Category + Banner Mega',
    badge: 'Advanced',
    description: 'Hovering a category opens subcategories with promotional banner and CTA.',
    example: 'Fashion ▾ → [Subcategories + Banner + CTA]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    capabilities: { icons: true, images: true, dropdown: true, megaMenu: true, slider: false, badges: true, sticky: true, nestedItems: true, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'wrap' },
  },
  {
    id: 'compact_dropdown',
    name: 'Compact Dropdown',
    badge: 'Mobile-First',
    description: 'Single dropdown button containing all categories. Useful for dense layouts.',
    example: '[ All Categories ▾ ]',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: true, images: false, dropdown: true, megaMenu: false, slider: false, badges: false, sticky: true, nestedItems: true, activeIndicator: false, tooltips: false },
    defaults: { alignment: 'left', itemGap: 0, activeIndicator: 'none', overflow: 'wrap' },
  },
  {
    id: 'brand_theme',
    name: 'Brand / Theme Navigation',
    badge: 'On-Brand',
    description: 'Uses the site\'s primary brand treatment for colors, fonts and styling.',
    example: 'All Products   New In   Best Sellers   Sale   Collections',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'gradient',
    name: 'Gradient Navigation',
    badge: 'Trendy',
    description: 'Uses gradient background or active state for a modern, vibrant feel.',
    example: '═══ All Products   New In   Best Sellers   Sale ═══',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'center', itemGap: 24, activeIndicator: 'background', overflow: 'scroll' },
  },
  {
    id: 'sticky_nav',
    name: 'Sticky Secondary Nav',
    badge: 'Persistent',
    description: 'Navigation becomes sticky after scrolling past the header.',
    example: '▓▓▓ [Sticky] All Products   New In   Best Sellers   Sale ▓▓▓',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'advanced'],
    capabilities: { icons: false, images: false, dropdown: false, megaMenu: false, slider: false, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 24, activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'icon_only',
    name: 'Icon-Only Navigation',
    badge: 'Compact',
    description: 'Icons without labels, with tooltip support. Useful for compact layouts.',
    example: '🛍️  👕  📱  💻  💄  🏠  📺',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: true, images: false, dropdown: false, megaMenu: false, slider: true, badges: false, sticky: true, nestedItems: false, activeIndicator: true, tooltips: true },
    defaults: { alignment: 'center', itemGap: 16, iconPosition: 'top', activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'promo_rail',
    name: 'Promotional Category Rail',
    badge: 'Engaging',
    description: 'Categories with promotional emoji accents for engagement.',
    example: '🔥 New Arrivals | ⚡ Sale | 🎁 Offers | ✨ Trending',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive'],
    capabilities: { icons: true, images: false, dropdown: false, megaMenu: false, slider: true, badges: true, sticky: true, nestedItems: false, activeIndicator: true, tooltips: false },
    defaults: { alignment: 'left', itemGap: 20, iconPosition: 'left', activeIndicator: 'underline', overflow: 'scroll' },
  },
  {
    id: 'custom',
    name: 'Custom / Flexible',
    badge: 'Full Control',
    description: 'Build the navigation structure manually with complete control.',
    example: 'Merchant-configurable custom navigation items and links',
    supportedTabs: ['look', 'content', 'layout', 'behavior', 'design', 'responsive', 'visibility', 'advanced'],
    capabilities: { icons: true, images: true, dropdown: true, megaMenu: true, slider: true, badges: true, sticky: true, nestedItems: true, activeIndicator: true, tooltips: true },
    defaults: { alignment: 'left', itemGap: 20, activeIndicator: 'underline', overflow: 'scroll' },
  },
];

// ─── Semantic Color Palette Variables ───────────────────────
export interface SecondaryNavSemanticColors {
  bg: string;
  text: string;
  mutedText: string;
  link: string;
  linkHover: string;
  activeText: string;
  activeBg: string;
  icon: string;
  iconHover: string;
  iconActive: string;
  border: string;
  divider: string;
  indicator: string;
  dropdownBg: string;
  dropdownText: string;
  buttonBg: string;
  buttonText: string;
  buttonHoverBg: string;
  buttonHoverText: string;
}

export function getInheritedSecondaryNavColors(themePalette: any): SecondaryNavSemanticColors {
  const bg =
    themePalette?.background?.surface ||
    themePalette?.background?.sectionBg ||
    themePalette?.background?.background ||
    '#ffffff';

  let text = themePalette?.text?.body || themePalette?.text?.heading || '#334155';
  if (text.toLowerCase() === bg.toLowerCase()) {
    text = '#0f172a';
  }

  const mutedText = themePalette?.text?.muted || '#64748b';
  const link = themePalette?.brand?.primary || '#2563eb';
  const linkHover = themePalette?.brand?.secondary || '#1d4ed8';
  const activeText = themePalette?.brand?.primary || '#2563eb';
  const activeBg = themePalette?.brand?.accent || '#eff6ff';
  const icon = themePalette?.text?.muted || '#64748b';
  const iconHover = themePalette?.brand?.primary || '#2563eb';
  const iconActive = themePalette?.brand?.primary || '#2563eb';
  const border = themePalette?.border?.border || '#e2e8f0';
  const divider = themePalette?.border?.subtle || 'rgba(0, 0, 0, 0.08)';
  const indicator = themePalette?.brand?.primary || '#2563eb';
  const dropdownBg = themePalette?.background?.surface || '#ffffff';
  const dropdownText = text;
  const buttonBg = themePalette?.brand?.primary || '#2563eb';
  const buttonText = themePalette?.text?.inverse || '#ffffff';
  const buttonHoverBg = themePalette?.brand?.secondary || '#1d4ed8';
  const buttonHoverText = themePalette?.text?.inverse || '#ffffff';

  return {
    bg, text, mutedText, link, linkHover, activeText, activeBg,
    icon, iconHover, iconActive, border, divider, indicator,
    dropdownBg, dropdownText, buttonBg, buttonText, buttonHoverBg, buttonHoverText,
  };
}

// ─── Content Model ──────────────────────────────────────────
export interface SecondaryNavContent {
  enabled: boolean;
  source: 'manual' | 'product_categories' | 'collections' | 'pages' | 'custom_links' | 'dynamic';
  items: NavigationItem[];

  // Two-Row look specific
  secondaryItems?: NavigationItem[];
}

// ─── Layout Model ───────────────────────────────────────────
export interface SecondaryNavLayout {
  width: 'full' | 'contained' | 'custom';
  customWidth?: number;
  position: 'left' | 'center' | 'right' | 'space_between' | 'space_evenly';
  direction: 'horizontal' | 'vertical';
  alignment: 'start' | 'center' | 'end';
  itemGap: number;
  rowGap: number;
  columnGap: number;

  // Item sizing
  itemWidth: 'auto' | 'fixed' | 'fill';
  itemMinWidth?: number;
  itemMaxWidth?: number;
  itemPaddingX: number;
  itemPaddingY: number;
  itemMargin: number;

  // Icon-label specific
  iconSize: number;
  iconLabelGap: number;
  labelWidth?: 'auto' | number;
  itemHeight?: number;
  indicatorWidth?: 'auto' | 'full' | number;

  // Overflow
  overflow: 'wrap' | 'scroll' | 'clip' | 'auto_scroll' | 'dropdown' | 'more_button';
  showLeftArrow: boolean;
  showRightArrow: boolean;
  arrowPosition: 'inside' | 'outside' | 'overlay';
  arrowSize: number;
  scrollAmount: number;

  barHeight: number;
  paddingX: number;
  paddingY: number;

  // Mobile layout
  mobileEdgeToEdge?: boolean;
  mobilePaddingX?: number;
  mobilePaddingY?: number;
}

// ─── Behavior Model ─────────────────────────────────────────
export interface SecondaryNavBehavior {
  // Sticky
  stickyMode: 'normal' | 'sticky_header' | 'sticky_top' | 'fixed' | 'static' | 'sticky';
  stickyTrigger: 'immediately' | 'after_header' | 'after_scroll' | 'custom';
  stickyScrollDistance?: number;

  // Hover
  hoverEffect: 'none' | 'color_change' | 'underline' | 'background' | 'scale' | 'icon_animation';

  // Dropdown / Mega Menu
  dropdownTrigger: 'hover' | 'click' | 'touch';
  openDelay: number;
  closeDelay: number;
  closeOnOutsideClick: boolean;
  closeOnNavigation: boolean;

  // Mega Menu specific
  megaOpenAnimation: 'none' | 'fade' | 'slide_down' | 'scale';
  megaAnimationDuration: number;
  megaOverlay: boolean;
  megaCloseOnScroll: boolean;

  // Mobile scroll
  swipeEnabled: boolean;
  autoScroll: boolean;
  snapToItem: boolean;
  showArrows: boolean;
  showScrollbar: boolean;
}

// ─── Design Model ───────────────────────────────────────────
export interface SecondaryNavDesign {
  // Background
  bgType: 'inherit' | 'color' | 'gradient' | 'image';
  bgColor: string;
  bgColorMode: 'inherit' | 'custom';
  bgGradient?: { type: 'linear' | 'radial'; angle: number; from: string; to: string };
  bgImage?: { url: string; position: string; size: string; repeat: string; overlay?: string; overlayOpacity?: number };

  // Text
  textColor: string;
  textColorMode: 'inherit' | 'custom';
  mutedTextColor: string;
  mutedTextColorMode: 'inherit' | 'custom';

  // Links
  linkColor: string;
  linkColorMode: 'inherit' | 'custom';
  linkHoverColor: string;
  linkHoverColorMode: 'inherit' | 'custom';

  // Icons
  iconColor: string;
  iconColorMode: 'inherit' | 'custom';
  iconHoverColor: string;
  iconHoverColorMode: 'inherit' | 'custom';
  iconActiveColor: string;
  iconActiveColorMode: 'inherit' | 'custom';

  // Active state
  activeTextColor: string;
  activeTextColorMode: 'inherit' | 'custom';
  activeBgColor: string;
  activeBgColorMode: 'inherit' | 'custom';
  indicatorColor: string;
  indicatorColorMode: 'inherit' | 'custom';

  // Borders
  borderColor: string;
  borderColorMode: 'inherit' | 'custom';
  borderPosition: 'none' | 'bottom' | 'top' | 'both' | 'all';
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderWidth: number;
  dividerColor: string;
  dividerColorMode: 'inherit' | 'custom';

  // Dropdown
  dropdownBg?: string;
  dropdownBgColor: string;
  dropdownBgColorMode: 'inherit' | 'custom';
  dropdownText?: string;
  dropdownTextColor: string;
  dropdownTextColorMode: 'inherit' | 'custom';
  dropdownBorderColor: string;
  dropdownShadow: 'none' | 'sm' | 'md' | 'lg';

  // Typography
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  textTransform: 'none' | 'uppercase' | 'capitalize' | 'lowercase';
  activeFontSize?: number;
  activeFontWeight: number;

  // Active indicator
  indicatorType: 'none' | 'underline' | 'bottom_border' | 'top_border' | 'background' | 'pill' | 'dot' | 'side';
  indicatorThickness: number;
  indicatorWidthMode: 'auto' | 'full' | 'custom';
  indicatorCustomWidth?: number;
  indicatorRadius: number;
  indicatorOffset: number;
  indicatorAnimation: 'none' | 'slide' | 'fade' | 'scale';

  // Icon styling
  iconSize: number;
  iconStrokeWidth: number;

  // Shadow & radius
  boxShadow: 'none' | 'sm' | 'md' | 'lg';
  borderRadius: number;
  itemBorderRadius: number;

  // Button (for CTA/dropdown)
  buttonBgColor: string;
  buttonBgColorMode: 'inherit' | 'custom';
  buttonTextColor: string;
  buttonTextColorMode: 'inherit' | 'custom';
  buttonRadius: number;
}

// ─── Responsive Model ───────────────────────────────────────
export interface SecondaryNavResponsive {
  desktop: {
    itemsVisible: number;
    itemWidth: 'auto' | number;
    gap: number;
    iconSize: number;
    fontSize: number;
    alignment: string;
  };
  tablet: {
    itemDensity: 'normal' | 'compact';
    gap: number;
    iconSize: number;
    horizontalScroll: boolean;
  };
  mobile: {
    navigationMode: 'scroll' | 'dropdown' | 'grid' | 'compact_tabs' | 'icon_rail';
    iconSize: number;
    textSize: number;
    itemWidth: 'auto' | number;
    gap: number;
    padding: number;
    overflow: 'scroll' | 'wrap' | 'clip' | 'more_button';
    showArrows: boolean;
  };
  perItemVisibility?: Record<string, { desktop: boolean; tablet: boolean; mobile: boolean }>;
}

// ─── Visibility Model ───────────────────────────────────────
export interface SecondaryNavVisibility {
  displayOnPages: 'all' | 'selected' | 'homepage_only' | 'product_pages' | 'collection_pages' | 'cart' | 'search' | 'custom';
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

// ─── Advanced Model ─────────────────────────────────────────
export interface SecondaryNavAdvanced {
  customCss?: string;
  htmlId?: string;
  cssClass?: string;
  ariaLabel?: string;
  navRole?: string;
  keyboardNavigation: boolean;
  screenReaderLabel?: string;
  enableClickTracking: boolean;
  eventName?: string;
  categoryTracking: boolean;
  megaMenuTracking: boolean;
  customDataAttributes?: Record<string, string>;
}

// ─── Full Data Model ────────────────────────────────────────
export interface SecondaryNavData {
  look: SecondaryNavLook;
  content: SecondaryNavContent;
  layout: SecondaryNavLayout;
  behavior: SecondaryNavBehavior;
  design: SecondaryNavDesign;
  responsive: SecondaryNavResponsive;
  visibility: SecondaryNavVisibility;
  advanced: SecondaryNavAdvanced;
  customOverrides?: Record<string, any>;
}

// ─── Default Content Factory Per Look ───────────────────────
export function getDefaultContentForLook(look: SecondaryNavLook): SecondaryNavContent {
  const baseItems: NavigationItem[] = [
    { id: 'nav-all', label: 'All Products', href: '/collections/all', enabled: true, icon: { source: 'library', iconName: 'Grid', size: 20 } },
    { id: 'nav-new', label: 'New Arrivals', href: '/collections/new', enabled: true, badge: 'NEW', badgeColor: '#3b82f6', icon: { source: 'library', iconName: 'Sparkles', size: 20 } },
    { id: 'nav-trending', label: 'Trending', href: '/collections/trending', enabled: true, badge: 'HOT', badgeColor: '#ef4444', icon: { source: 'library', iconName: 'Flame', size: 20 } },
    { id: 'nav-electronics', label: 'Electronics', href: '/collections/electronics', enabled: true, icon: { source: 'library', iconName: 'Smartphone', size: 20 } },
    { id: 'nav-fashion', label: 'Fashion', href: '/collections/fashion', enabled: true, icon: { source: 'library', iconName: 'ShoppingBag', size: 20 } },
    { id: 'nav-beauty', label: 'Beauty', href: '/collections/beauty', enabled: true, icon: { source: 'library', iconName: 'Heart', size: 20 } },
    { id: 'nav-home', label: 'Home & Kitchen', href: '/collections/home', enabled: true, icon: { source: 'library', iconName: 'Store', size: 20 } },
    { id: 'nav-sale', label: 'Sale', href: '/collections/sale', enabled: true, badge: 'SALE', badgeColor: '#f59e0b', icon: { source: 'library', iconName: 'Tag', size: 20 } },
  ];

  const iconLabelItems: NavigationItem[] = [
    { id: 'nav-foryou', label: 'For You', href: '/for-you', enabled: true, isActive: true, icon: { source: 'library', iconName: 'ShoppingBag', size: 22 } },
    { id: 'nav-fashion', label: 'Fashion', href: '/collections/fashion', enabled: true, icon: { source: 'library', iconName: 'ShoppingBag', size: 22 } },
    { id: 'nav-mobiles', label: 'Mobiles', href: '/collections/mobiles', enabled: true, icon: { source: 'library', iconName: 'Smartphone', size: 22 } },
    { id: 'nav-electronics', label: 'Electronics', href: '/collections/electronics', enabled: true, icon: { source: 'library', iconName: 'Monitor', size: 22 } },
    { id: 'nav-beauty', label: 'Beauty', href: '/collections/beauty', enabled: true, icon: { source: 'library', iconName: 'Heart', size: 22 } },
    { id: 'nav-home', label: 'Home', href: '/collections/home', enabled: true, icon: { source: 'library', iconName: 'Store', size: 22 } },
    { id: 'nav-appliances', label: 'Appliances', href: '/collections/appliances', enabled: true, icon: { source: 'library', iconName: 'Zap', size: 22 } },
  ];

  switch (look) {
    case 'icon_label':
      return { enabled: true, source: 'manual', items: iconLabelItems };

    case 'icon_text':
    case 'icon_text_dropdown':
    case 'icon_only':
    case 'promo_rail':
      return { enabled: true, source: 'manual', items: baseItems };

    case 'mega_menu':
    case 'mega_banner':
      return {
        enabled: true,
        source: 'manual',
        items: [
          {
            id: 'mega-fashion', label: 'Fashion', href: '/collections/fashion', enabled: true,
            icon: { source: 'library', iconName: 'ShoppingBag', size: 16 },
            megaColumns: [
              { id: 'mc-men', title: 'Men', links: [{ label: 'Shirts', href: '/men/shirts' }, { label: 'Jeans', href: '/men/jeans' }, { label: 'Jackets', href: '/men/jackets' }], width: '25%', alignment: 'left', itemSpacing: 8 },
              { id: 'mc-women', title: 'Women', links: [{ label: 'Dresses', href: '/women/dresses' }, { label: 'Tops', href: '/women/tops' }, { label: 'Skirts', href: '/women/skirts' }], width: '25%', alignment: 'left', itemSpacing: 8 },
              { id: 'mc-kids', title: 'Kids', links: [{ label: 'T-Shirts', href: '/kids/tshirts' }, { label: 'Shorts', href: '/kids/shorts' }], width: '25%', alignment: 'left', itemSpacing: 8 },
            ],
            megaPromo: { heading: 'Season Sale', description: 'Up to 50% off on all styles', ctaText: 'Shop Now', ctaUrl: '/sale' },
          },
          { id: 'mega-shoes', label: 'Shoes', href: '/collections/shoes', enabled: true, icon: { source: 'library', iconName: 'ShoppingBag', size: 16 } },
          { id: 'mega-bags', label: 'Bags', href: '/collections/bags', enabled: true, icon: { source: 'library', iconName: 'ShoppingBag', size: 16 } },
          { id: 'mega-accessories', label: 'Accessories', href: '/collections/accessories', enabled: true, icon: { source: 'library', iconName: 'Star', size: 16 } },
        ],
      };

    case 'image_category':
    case 'category_cards':
      return {
        enabled: true,
        source: 'manual',
        items: [
          { id: 'img-fashion', label: 'Fashion', href: '/collections/fashion', enabled: true, count: 128, image: { url: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=160&auto=format&fit=crop&q=80', alt: 'Fashion', borderRadius: 8, hoverZoom: true } },
          { id: 'img-shoes', label: 'Shoes', href: '/collections/shoes', enabled: true, count: 64, image: { url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=160&auto=format&fit=crop&q=80', alt: 'Shoes', borderRadius: 8, hoverZoom: true } },
          { id: 'img-bags', label: 'Bags', href: '/collections/bags', enabled: true, count: 42, image: { url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&auto=format&fit=crop&q=80', alt: 'Bags', borderRadius: 8, hoverZoom: true } },
          { id: 'img-watches', label: 'Watches', href: '/collections/watches', enabled: true, count: 35, image: { url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=160&auto=format&fit=crop&q=80', alt: 'Watches', borderRadius: 8, hoverZoom: true } },
          { id: 'img-beauty', label: 'Beauty', href: '/collections/beauty', enabled: true, count: 89, image: { url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&auto=format&fit=crop&q=80', alt: 'Beauty', borderRadius: 8, hoverZoom: true } },
        ],
      };

    case 'two_row':
      return {
        enabled: true,
        source: 'manual',
        items: [
          { id: 'row1-men', label: 'Men', href: '/collections/men', enabled: true },
          { id: 'row1-women', label: 'Women', href: '/collections/women', enabled: true },
          { id: 'row1-kids', label: 'Kids', href: '/collections/kids', enabled: true },
          { id: 'row1-shoes', label: 'Shoes', href: '/collections/shoes', enabled: true },
          { id: 'row1-bags', label: 'Bags', href: '/collections/bags', enabled: true },
          { id: 'row1-accessories', label: 'Accessories', href: '/collections/accessories', enabled: true },
        ],
        secondaryItems: [
          { id: 'row2-all', label: 'All', href: '/collections/all', enabled: true },
          { id: 'row2-tshirts', label: 'T-Shirts', href: '/collections/tshirts', enabled: true },
          { id: 'row2-shirts', label: 'Shirts', href: '/collections/shirts', enabled: true },
          { id: 'row2-hoodies', label: 'Hoodies', href: '/collections/hoodies', enabled: true },
          { id: 'row2-jackets', label: 'Jackets', href: '/collections/jackets', enabled: true },
        ],
      };

    case 'compact_dropdown':
      return {
        enabled: true,
        source: 'manual',
        items: baseItems.map((item) => ({ ...item, children: [] })),
      };

    default:
      return { enabled: true, source: 'manual', items: baseItems.slice(0, 6) };
  }
}

// ─── Default Layout Factory Per Look ────────────────────────
export function getDefaultLayoutForLook(look: SecondaryNavLook): SecondaryNavLayout {
  const base: SecondaryNavLayout = {
    width: 'full',
    position: 'left',
    direction: 'horizontal',
    alignment: 'start',
    itemGap: 24,
    rowGap: 0,
    columnGap: 0,
    itemWidth: 'auto',
    itemPaddingX: 12,
    itemPaddingY: 8,
    itemMargin: 0,
    iconSize: 16,
    iconLabelGap: 6,
    overflow: 'scroll',
    showLeftArrow: false,
    showRightArrow: false,
    arrowPosition: 'outside',
    arrowSize: 24,
    scrollAmount: 200,
    barHeight: 44,
    paddingX: 24,
    paddingY: 0,
    mobileEdgeToEdge: true,
    mobilePaddingX: 16,
    mobilePaddingY: 6,
  };

  switch (look) {
    case 'icon_label':
      return {
        ...base,
        position: 'center',
        alignment: 'center',
        itemGap: 28,
        itemPaddingX: 16,
        itemPaddingY: 10,
        iconSize: 22,
        iconLabelGap: 6,
        indicatorWidth: 'auto',
        barHeight: 72,
        showLeftArrow: false,
        showRightArrow: false,
        overflow: 'scroll',
      };

    case 'pill_tabs':
    case 'filter_chip':
      return { ...base, itemGap: 8, itemPaddingX: 14, itemPaddingY: 6, alignment: 'center', position: 'center' };

    case 'full_width_tabs':
      return { ...base, itemGap: 0, itemWidth: 'fill', position: 'center', alignment: 'center' };

    case 'centered':
      return { ...base, position: 'center', alignment: 'center' };

    case 'two_row':
      return { ...base, rowGap: 4, barHeight: 80, direction: 'horizontal' };

    case 'mega_menu':
    case 'mega_banner':
      return { ...base, itemGap: 28, barHeight: 46 };

    case 'category_cards':
      return { ...base, itemGap: 12, itemPaddingX: 0, itemPaddingY: 0, barHeight: 120 };

    case 'image_category':
      return { ...base, itemGap: 16, barHeight: 100, alignment: 'center', position: 'center' };

    case 'scrollable_rail':
      return { ...base, showLeftArrow: false, showRightArrow: false, overflow: 'scroll' };

    case 'icon_only':
      return { ...base, itemGap: 16, iconSize: 24, barHeight: 48, alignment: 'center', position: 'center' };

    case 'compact_dropdown':
      return { ...base, barHeight: 40, itemGap: 0 };

    case 'bg_highlight':
    case 'gradient':
      return { ...base, itemPaddingX: 16, itemPaddingY: 8 };

    default:
      return base;
  }
}

// ─── Default Behavior Factory Per Look ──────────────────────
export function getDefaultBehaviorForLook(look: SecondaryNavLook): SecondaryNavBehavior {
  return {
    stickyMode: look === 'sticky_nav' ? 'sticky_header' : 'normal',
    stickyTrigger: look === 'sticky_nav' ? 'after_header' : 'immediately',

    hoverEffect: 'color_change',

    dropdownTrigger: 'hover',
    openDelay: 150,
    closeDelay: 300,
    closeOnOutsideClick: true,
    closeOnNavigation: true,

    megaOpenAnimation: 'fade',
    megaAnimationDuration: 200,
    megaOverlay: false,
    megaCloseOnScroll: true,

    swipeEnabled: true,
    autoScroll: false,
    snapToItem: false,
    showArrows: false,
    showScrollbar: false,
  };
}

// ─── Default Design Factory ─────────────────────────────────
export function getDefaultDesign(themePalette: any): SecondaryNavDesign {
  const c = getInheritedSecondaryNavColors(themePalette);
  return {
    bgType: 'inherit',
    bgColor: c.bg,
    bgColorMode: 'inherit',

    textColor: c.text,
    textColorMode: 'inherit',
    mutedTextColor: c.mutedText,
    mutedTextColorMode: 'inherit',

    linkColor: c.link,
    linkColorMode: 'inherit',
    linkHoverColor: c.linkHover,
    linkHoverColorMode: 'inherit',

    iconColor: c.icon,
    iconColorMode: 'inherit',
    iconHoverColor: c.iconHover,
    iconHoverColorMode: 'inherit',
    iconActiveColor: c.iconActive,
    iconActiveColorMode: 'inherit',

    activeTextColor: c.activeText,
    activeTextColorMode: 'inherit',
    activeBgColor: c.activeBg,
    activeBgColorMode: 'inherit',
    indicatorColor: c.indicator,
    indicatorColorMode: 'inherit',

    borderColor: c.border,
    borderColorMode: 'inherit',
    borderPosition: 'bottom',
    borderStyle: 'solid',
    borderWidth: 1,
    dividerColor: c.divider,
    dividerColorMode: 'inherit',

    dropdownBgColor: c.dropdownBg,
    dropdownBgColorMode: 'inherit',
    dropdownTextColor: c.dropdownText,
    dropdownTextColorMode: 'inherit',
    dropdownBorderColor: c.border,
    dropdownShadow: 'md',

    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: 0,
    textTransform: 'none',
    activeFontWeight: 700,

    indicatorType: 'underline',
    indicatorThickness: 2,
    indicatorWidthMode: 'auto',
    indicatorRadius: 1,
    indicatorOffset: 0,
    indicatorAnimation: 'none',

    iconSize: 16,
    iconStrokeWidth: 2,

    boxShadow: 'none',
    borderRadius: 0,
    itemBorderRadius: 4,

    buttonBgColor: c.buttonBg,
    buttonBgColorMode: 'inherit',
    buttonTextColor: c.buttonText,
    buttonTextColorMode: 'inherit',
    buttonRadius: 6,
  };
}

// ─── Default Responsive Factory ─────────────────────────────
export function getDefaultResponsive(): SecondaryNavResponsive {
  return {
    desktop: {
      itemsVisible: 8,
      itemWidth: 'auto',
      gap: 24,
      iconSize: 22,
      fontSize: 13,
      alignment: 'center',
    },
    tablet: {
      itemDensity: 'compact',
      gap: 16,
      iconSize: 18,
      horizontalScroll: true,
    },
    mobile: {
      navigationMode: 'scroll',
      iconSize: 20,
      textSize: 11,
      itemWidth: 'auto',
      gap: 16,
      padding: 12,
      overflow: 'scroll',
      showArrows: true,
    },
  };
}

// ─── Default Visibility Factory ─────────────────────────────
export function getDefaultVisibility(): SecondaryNavVisibility {
  return {
    displayOnPages: 'all',
    device: 'all',
    customerVisibility: 'everyone',
    schedulingEnabled: false,
    timezone: 'Asia/Kolkata',
  };
}

// ─── Default Advanced Factory ───────────────────────────────
export function getDefaultAdvanced(): SecondaryNavAdvanced {
  return {
    keyboardNavigation: true,
    enableClickTracking: false,
    categoryTracking: true,
    megaMenuTracking: false,
    ariaLabel: 'Secondary navigation',
    navRole: 'navigation',
  };
}

// ─── Central Resolver Function ──────────────────────────────
export function resolveSecondaryNavData(
  row: any,
  passedProps: any,
  themePalette: any
): SecondaryNavData {
  const el = row?.elements?.[0];
  const props = { ...(passedProps || {}), ...(el?.props || {}) };
  const existing = (el?.props?.secondaryNav || passedProps?.secondaryNav) as SecondaryNavData | undefined;

  let look: SecondaryNavLook = 'active_underline';
  if (existing?.look) {
    look = existing.look;
  } else if (props.look) {
    look = props.look;
  } else if (props.variant && SECONDARY_NAV_LOOKS.some((l) => l.id === props.variant)) {
    look = props.variant;
  } else if (row?.layout?.variantId && SECONDARY_NAV_LOOKS.some((l) => l.id === row.layout.variantId)) {
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

// ─── Switch Look with Override Preservation ─────────────────
export function switchSecondaryNavLook(
  current: SecondaryNavData,
  newLook: SecondaryNavLook,
  themePalette: any
): SecondaryNavData {
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

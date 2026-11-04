// ============================================================
// PAGE EDITOR CONFIGURATION TYPES
// Configuration-driven dynamic page-level editing system
// ============================================================

import type { LucideIcon } from 'lucide-react';

// Re-use field types from section configs
export type {
  FieldType,
  FieldCondition,
  FieldOption,
  ListItemField,
  FieldGroup,
} from '../sectionConfigs/types';

import type {
  FieldGroup,
  FieldCondition,
} from '../sectionConfigs/types';

// ------------------------------------------------------------
// Page Categories
// ------------------------------------------------------------

export type PageCategory = 'storefront' | 'commerce' | 'customer' | 'legal' | 'system';

// ------------------------------------------------------------
// Page Tab Config
// ------------------------------------------------------------

export interface PageTabConfig {
  /** Tab ID (must be unique within page) */
  id: string;
  /** Tab label */
  label: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Field groups within this tab */
  groups: FieldGroup[];
  /** Show this tab only when condition is met */
  showWhen?: FieldCondition;
}

// ------------------------------------------------------------
// Page Layout Options
// ------------------------------------------------------------

export interface PageLayoutOption {
  /** Layout ID (stored in page props as `selectedLayout`) */
  id: string;
  /** Human-readable label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: LucideIcon;
}

// ------------------------------------------------------------
// Default Section Definition
// ------------------------------------------------------------

export interface DefaultSectionDef {
  /** Section type key */
  type: string;
  /** Display name */
  name: string;
  /** Group: header, content, footer */
  group: 'header' | 'content' | 'footer';
  /** Default props for this section instance */
  defaultProps?: Record<string, any>;
}

// ------------------------------------------------------------
// Header/Footer Variants
// ------------------------------------------------------------

export type HeaderVariant = 'default' | 'transparent' | 'minimal' | 'checkout';
export type FooterVariant = 'default' | 'minimal' | 'checkout';

// ------------------------------------------------------------
// SEO Config
// ------------------------------------------------------------

export interface PageSEOConfig {
  /** Whether SEO data is dynamically generated (e.g., product pages) */
  dynamic: boolean;
  /** SEO title template (e.g., "{product.name} - BillionBiz") */
  template?: string;
}

// ------------------------------------------------------------
// Master Page Config
// ------------------------------------------------------------

export interface PageConfig {
  /** Page type key (matches PageData.type) */
  type: string;
  /** Human-readable name */
  name: string;
  /** Category for grouping */
  category: PageCategory;
  /** Icon for page list */
  icon?: LucideIcon;
  /** Description for page list */
  description?: string;
  /** Default URL path */
  path: string;

  /** Default header variant */
  headerVariant: HeaderVariant;
  /** Default footer variant */
  footerVariant: FooterVariant;

  /** Default sections for this page type */
  defaultSections: DefaultSectionDef[];

  /** Available page layout options */
  layouts?: PageLayoutOption[];

  /**
   * Generate tabs based on the selected layout and current props.
   * This is the core of the dynamic editor — different pages and
   * layouts produce different tabs and fields.
   */
  getTabs: (selectedLayout?: string, props?: Record<string, any>) => PageTabConfig[];

  /** Default page-level props */
  defaultProps: Record<string, any>;

  /** SEO configuration */
  seoConfig?: PageSEOConfig;

  /** Tags for search */
  tags?: string[];
}

// ------------------------------------------------------------
// Page-Level Prop Types
// ------------------------------------------------------------

export interface PageLayoutProps {
  selectedLayout?: string;
  pageWidth?: 'full' | 'wide' | 'standard' | 'narrow' | 'custom';
  customMaxWidth?: number;
  containerType?: 'full' | 'centered' | 'custom';
  containerMaxWidth?: number;
  sideMargins?: number;
  contentAlignment?: 'left' | 'center' | 'right';
  sectionGap?: number;
  headerVariant?: HeaderVariant;
  footerVariant?: FooterVariant;
  showBreadcrumbs?: boolean;
  breadcrumbPosition?: 'top' | 'below-header';
  breadcrumbAlignment?: 'left' | 'center' | 'right';
  showPageHeader?: boolean;
  pageHeaderFullWidth?: boolean;
  pageHeaderHeight?: 'small' | 'medium' | 'large' | 'custom';
  pageHeaderAlignment?: 'left' | 'center' | 'right';
  stickyHeader?: boolean;
  showFooter?: boolean;
  showAnnouncementBar?: boolean;
}

export interface PageSpacingProps {
  sectionGap?: number;
  padding?: {
    desktop?: { top?: number; bottom?: number; left?: number; right?: number };
    tablet?: { top?: number; bottom?: number; left?: number; right?: number };
    mobile?: { top?: number; bottom?: number; left?: number; right?: number };
  };
  containerMaxWidth?: number;
  containerSidePadding?: number;
  fullWidth?: boolean;
  linked?: boolean;
}

export interface PageStyleProps {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundPosition?: string;
  backgroundSize?: string;
  backgroundRepeat?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textColor?: string;
  headingColor?: string;
  linkColor?: string;
  borderRadius?: string;
  shadow?: string;
}

export interface PageVisibilityProps {
  status?: 'draft' | 'published';
  desktop?: boolean;
  tablet?: boolean;
  mobile?: boolean;
}

export interface PageSEOProps {
  seoTitle?: string;
  metaDescription?: string;
  socialImage?: string;
  searchVisibility?: boolean;
  canonicalUrl?: string;
}

export interface PageAdvancedProps {
  pageId?: string;
  customClass?: string;
  anchor?: string;
  animationDefault?: 'none' | 'fade-in' | 'slide-up';
}

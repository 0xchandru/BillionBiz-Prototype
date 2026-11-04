// ============================================================
// FOOTER TREE — RECURSIVE GROUP-BASED ARCHITECTURE
// Core types for the composable footer editor tree system.
// Every footer is a single root node containing groups and
// components in an arbitrarily nested tree.
// ============================================================

// ─── Node Types ──────────────────────────────────────────────

/** All supported footer component types */
export type FooterNodeType =
  | 'group'
  | 'heading'
  | 'text'
  | 'image'
  | 'logo'
  | 'icon'
  | 'link-list'
  | 'social-links'
  | 'button'
  | 'newsletter'
  | 'divider'
  | 'spacer'
  | 'payment-icons'
  | 'copyright'
  | 'contact-info'
  | 'trust-badge'
  | 'app-download'
  | 'localization'
  | 'custom-html';

/** Node categories for the component picker */
export type FooterNodeCategory =
  | 'layout'
  | 'content'
  | 'navigation'
  | 'actions'
  | 'forms'
  | 'structure'
  | 'store-info';

// ─── Sizing ──────────────────────────────────────────────────

export type SizingMode = 'fit' | 'fill' | 'custom';

export interface SizingValue {
  mode: SizingMode;
  value?: number;
  unit?: 'px' | '%' | 'rem';
  min?: number;
  max?: number;
}

// ─── Group Layout ────────────────────────────────────────────

export type GroupDirection = 'horizontal' | 'vertical';

export type MainAxisDistribution =
  | 'start'
  | 'center'
  | 'end'
  | 'space-between'
  | 'space-around'
  | 'space-evenly';

export type CrossAxisAlignment = 'start' | 'center' | 'end' | 'stretch';

export interface GroupLayoutSettings {
  direction: GroupDirection;
  width: SizingValue;
  height: SizingValue;
  mainAxisDistribution: MainAxisDistribution;
  crossAxisAlignment: CrossAxisAlignment;
  gap: number;
  rowGap?: number;
  columnGap?: number;
  padding: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
  wrap?: boolean;
  overflow?: 'visible' | 'hidden' | 'auto';
  maxWidth?: number;
}

// ─── Responsive ──────────────────────────────────────────────

export interface ResponsiveOverrides {
  tablet?: Partial<GroupLayoutSettings> & { visible?: boolean };
  mobile?: Partial<GroupLayoutSettings> & { visible?: boolean };
}

// ─── Styling ─────────────────────────────────────────────────

export type BgType = 'inherit' | 'color' | 'gradient' | 'image';

export interface NodeStyling {
  bgType: BgType;
  bgColor?: string;
  bgGradient?: string;
  bgImage?: string;
  bgSize?: 'cover' | 'contain' | 'auto';
  bgPosition?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'none' | 'solid' | 'dashed' | 'dotted';
  borderRadius?: number;
  boxShadow?: string;
  opacity?: number;
}

// ─── The Core Node ───────────────────────────────────────────

/**
 * FooterTreeNode — the recursive building block of the footer.
 * A group node can contain children (other groups or components).
 * A component node is a leaf with type-specific props.
 */
export interface FooterTreeNode {
  /** Stable unique identifier */
  id: string;
  /** The node type — 'group' for containers, others for leaf components */
  nodeType: FooterNodeType;
  /** User-facing display name (editable) */
  name: string;
  /** Whether the node is visible */
  visible: boolean;
  /** Whether the node is locked from editing */
  locked?: boolean;

  // ─── Group-specific (only when nodeType === 'group') ───
  /** Children — only valid for groups */
  children?: FooterTreeNode[];
  /** Layout settings — only valid for groups */
  layout?: GroupLayoutSettings;
  /** Responsive overrides — only valid for groups */
  responsive?: ResponsiveOverrides;

  // ─── Component-specific (leaf nodes) ───
  /** Type-specific component props */
  props?: Record<string, any>;

  // ─── Shared visual styling ───
  /** Visual styling overrides */
  styling?: NodeStyling;
}

// ─── Component Registration for Picker ───────────────────────

export interface FooterComponentDefinition {
  nodeType: FooterNodeType;
  name: string;
  category: FooterNodeCategory;
  icon: string; // Lucide icon name
  description: string;
  /** Whether this component can contain children */
  isContainer: boolean;
  /** Which parent types can contain this component */
  allowedParents: ('root' | 'group')[];
  /** Default props for newly created instances */
  defaultProps: Record<string, any>;
  /** Default layout (for groups) */
  defaultLayout?: GroupLayoutSettings;
  /** Default styling */
  defaultStyling?: NodeStyling;
}

// ─── Tree Selection ──────────────────────────────────────────

export interface FooterTreeSelection {
  /** Selected node ID (empty = root/footer selected) */
  nodeId: string | null;
  /** Right sidebar mode */
  mode: 'inspector' | 'templates';
}

// ─── Footer Template ─────────────────────────────────────────

export interface FooterTreeTemplate {
  id: string;
  name: string;
  description: string;
  /** Category for grouping templates */
  category: string;
  /** ASCII-style layout preview */
  previewDiagram?: string;
  /** The complete tree structure */
  tree: FooterTreeNode[];
}

// ─── Constants ───────────────────────────────────────────────

/** Maximum allowed nesting depth for groups */
export const MAX_NESTING_DEPTH = 8;

/** Generate a unique stable node ID */
export function generateNodeId(prefix: string = 'fn'): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 6)}`;
}

/** Default group layout */
export function createDefaultGroupLayout(direction: GroupDirection = 'horizontal'): GroupLayoutSettings {
  return {
    direction,
    width: { mode: 'fill' },
    height: { mode: 'fit' },
    mainAxisDistribution: 'start',
    crossAxisAlignment: 'stretch',
    gap: 24,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    wrap: false,
    overflow: 'visible',
  };
}

/** Default node styling (inherit everything) */
export function createDefaultStyling(): NodeStyling {
  return {
    bgType: 'inherit',
  };
}

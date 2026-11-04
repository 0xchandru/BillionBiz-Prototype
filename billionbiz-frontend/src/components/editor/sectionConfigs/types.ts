// ============================================================
// SECTION EDITOR CONFIGURATION TYPES
// Configuration-driven dynamic section editing system
// ============================================================

import type { LucideIcon } from 'lucide-react';

// ------------------------------------------------------------
// Field Types
// ------------------------------------------------------------

/** All supported field input types */
export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'color'
  | 'image'
  | 'url'
  | 'toggle'
  | 'select'
  | 'segmented'  // Horizontal pill selector (e.g., left|center|right)
  | 'slider'
  | 'range'      // Min/max range
  | 'list'       // Repeatable items
  | 'spacing'    // Margin/Padding editor
  | 'icon'       // Icon picker
  ;

/** Condition for showing/hiding a field */
export interface FieldCondition {
  /** The field key to check */
  field: string;
  /** Show this field when the target field equals one of these values */
  value: any | any[];
  /** Optional: negate the condition (show when NOT equal) */
  negate?: boolean;
}

/** A single option for select/segmented fields */
export interface FieldOption {
  label: string;
  value: string | number | boolean;
  icon?: LucideIcon;
  description?: string;
}

/** Configuration for list/repeater field items */
export interface ListItemField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'url' | 'image' | 'icon' | 'color' | 'select' | 'toggle' | 'number' | 'list';
  placeholder?: string;
  options?: FieldOption[];
  defaultValue?: any;
  isStringList?: boolean;
  addLabel?: string;
}

/** Complete field definition */
export interface SectionFieldConfig {
  /** Unique key within the section (maps to props) */
  key: string;
  /** Human-readable label (no CSS jargon!) */
  label: string;
  /** Field input type */
  type: FieldType;
  /** Placeholder text */
  placeholder?: string;
  /** Help/tooltip text */
  helpText?: string;
  /** Default value */
  defaultValue?: any;

  // --- Type-specific options ---
  /** Options for select/segmented */
  options?: FieldOption[];
  /** Min value for number/slider/range */
  min?: number;
  /** Max value for number/slider/range */
  max?: number;
  /** Step for number/slider */
  step?: number;
  /** Unit label (e.g., "px", "%", "ms") */
  unit?: string;
  /** Fields for list/repeater items */
  listFields?: ListItemField[];
  /** Max items for list */
  maxItems?: number;
  /** Label for "Add item" button */
  addLabel?: string;
  /** Whether list items are simple strings (vs objects) */
  isStringList?: boolean;

  // --- Conditional & responsive ---
  /** Show this field only when condition is met */
  showWhen?: FieldCondition;
  /** Whether this field supports per-device values */
  responsive?: boolean;

  // --- Layout ---
  /** If true, render full-width (no label on side) */
  fullWidth?: boolean;
}

// ------------------------------------------------------------
// Field Groups (collapsible sections within a tab)
// ------------------------------------------------------------

export interface FieldGroup {
  /** Group ID */
  id: string;
  /** Group label */
  label: string;
  /** Whether collapsed by default */
  defaultCollapsed?: boolean;
  /** Fields in this group */
  fields: SectionFieldConfig[];
  /** Show this group only when condition is met */
  showWhen?: FieldCondition;
}

// ------------------------------------------------------------
// Tabs
// ------------------------------------------------------------

export interface SectionTabConfig {
  /** Tab ID (must be unique within section) */
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
// Layouts
// ------------------------------------------------------------

export interface SectionLayoutOption {
  /** Layout ID (stored in section props as `selectedLayout`) */
  id: string;
  /** Human-readable label */
  label: string;
  /** Optional description */
  description?: string;
  /** Optional icon */
  icon?: LucideIcon;
  /** Optional preview image URL */
  preview?: string;
}

// ------------------------------------------------------------
// Section Category (for the "Add Section" picker)
// ------------------------------------------------------------

export type SectionCategory =
  | 'header'
  | 'hero'
  | 'commerce'
  | 'content'
  | 'conversion'
  | 'footer';

// ------------------------------------------------------------
// Master Section Config
// ------------------------------------------------------------

export interface SectionConfig {
  /** Section type key (matches SectionData.type) */
  type: string;
  /** Human-readable name */
  name: string;
  /** Category for grouping in the section picker */
  category: SectionCategory;
  /** Icon for the section */
  icon?: LucideIcon;
  /** Description for the section picker */
  description?: string;
  /** Preview image for the section picker */
  previewImage?: string;

  /** Available layout options. If empty/undefined, no layout tab is shown. */
  layouts?: SectionLayoutOption[];

  /**
   * Generate tabs based on the currently selected layout.
   * This is the core of the dynamic editor — different layouts produce
   * different tabs and fields.
   *
   * @param selectedLayout - The current layout ID (or undefined if no layout selected)
   * @param props - Current section props (for conditional logic)
   * @returns Array of tabs to display
   */
  getTabs: (selectedLayout?: string, props?: Record<string, any>) => SectionTabConfig[];

  /**
   * Maps a variant/layout to its content configuration key.
   * Multiple layouts can share the same key → shared content state.
   * If not provided, each layout gets its own isolated content config (key = layoutId).
   */
  getContentConfigKey?: (selectedLayout: string) => string;

  /**
   * Returns the list of content field keys for a given content config key.
   * These are the fields managed by the content state system (save/restore/clear).
   * If not provided, the system auto-extracts content field keys from the 'content' tab.
   */
  getContentFieldKeys?: (contentConfigKey: string) => string[];

  /** Default props for a newly created section of this type */
  defaultProps: Record<string, any>;

  /** Tags for search in the section picker */
  tags?: string[];
}

// ------------------------------------------------------------
// Spacing Value Types
// ------------------------------------------------------------

export interface SpacingSide {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

export interface ResponsiveSpacing {
  desktop?: SpacingSide;
  tablet?: SpacingSide;
  mobile?: SpacingSide;
}

export interface SpacingValue {
  margin?: ResponsiveSpacing;
  padding?: ResponsiveSpacing;
  linked?: boolean; // Whether all sides are linked
}

// ------------------------------------------------------------
// Visibility Value Types
// ------------------------------------------------------------

export interface DeviceVisibility {
  desktop: boolean;
  tablet: boolean;
  mobile: boolean;
}

export interface VisibilityValue {
  enabled?: boolean;
  devices?: DeviceVisibility;
  showFrom?: string;
  hideAfter?: string;
  audience?: 'everyone' | 'logged-in' | 'guests';
}

// ------------------------------------------------------------
// Advanced Value Types
// ------------------------------------------------------------

export interface AdvancedValue {
  sectionId?: string;
  cssClass?: string;
  anchorId?: string;
  animation?: 'none' | 'fade-in' | 'slide-up' | 'slide-left' | 'slide-right' | 'zoom-in' | 'bounce';
  animationDelay?: number;
  animationEnabled?: boolean;
}

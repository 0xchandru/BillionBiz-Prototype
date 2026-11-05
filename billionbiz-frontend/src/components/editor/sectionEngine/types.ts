export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
export type SettingControl =
  | 'text' | 'textarea' | 'number' | 'toggle' | 'select'
  | 'image' | 'url' | 'color' | 'token' | 'spacing';

export interface SettingOption {
  label: string;
  value: string | number | boolean;
}

export interface SettingDefinition {
  key: string;
  label: string;
  control: SettingControl;
  defaultValue?: JsonValue;
  required?: boolean;
  min?: number;
  max?: number;
  maxLength?: number;
  options?: SettingOption[];
  tokenType?: 'color' | 'font' | 'radius' | 'shadow' | 'spacing';
  description?: string;
}

export interface ResponsiveValue<T = JsonValue> {
  desktop?: T;
  tablet?: T;
  mobile?: T;
}

export interface BlockInstance {
  id: string;
  type: string;
  schemaVersion: number;
  enabled: boolean;
  settings: Record<string, JsonValue>;
  designOverrides?: Record<string, JsonValue>;
  responsiveOverrides?: Record<string, ResponsiveValue>;
}

export interface SectionInstance {
  id: string;
  type: string;
  schemaVersion: number;
  enabled: boolean;
  settings: Record<string, JsonValue>;
  blocks: BlockInstance[];
  designOverrides?: Record<string, JsonValue>;
  responsiveOverrides?: Record<string, ResponsiveValue>;
}

export interface SectionDefinition {
  type: string;
  schemaVersion: number;
  label: string;
  category: 'header' | 'hero' | 'commerce' | 'content' | 'conversion' | 'footer';
  description: string;
  renderer: string;
  allowedPageTypes: string[];
  settings: SettingDefinition[];
  allowedBlocks: string[];
  minBlocks?: number;
  maxBlocks?: number;
  defaultSettings: Record<string, JsonValue>;
  createDefaultBlocks: () => BlockInstance[];
}

export interface BlockDefinition {
  type: string;
  schemaVersion: number;
  label: string;
  description: string;
  allowedSections: string[];
  settings: SettingDefinition[];
  defaultSettings: Record<string, JsonValue>;
  maxPerSection?: number;
}

export interface ValidationIssue {
  path: string;
  code: 'unknown-section' | 'unknown-block' | 'invalid-shape' | 'invalid-setting'
    | 'missing-setting' | 'too-many-blocks' | 'too-few-blocks' | 'duplicate-id';
  message: string;
}

export interface VersionedSectionDocument {
  schemaVersion: 1;
  sections: SectionInstance[];
}

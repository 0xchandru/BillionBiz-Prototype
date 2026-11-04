import type { GlobalThemeData } from './themePresets';
import { getDefaultTheme, themePresets } from './themePresets';
import type { ThemeCategoryType } from '../../../store/landingEditorStore';

/**
 * Deep equality helper for objects and primitives
 */
export function isDeepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a === null || a === undefined || b === null || b === undefined) {
    return a === b;
  }
  if (typeof a !== 'object' || typeof b !== 'object') {
    return a === b;
  }

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!isDeepEqual(a[key], b[key])) return false;
  }

  return true;
}

/**
 * Check if the current theme configuration has been modified from its selected preset's defaults
 */
export function isThemeModified(theme: GlobalThemeData): boolean {
  if (!theme) return false;
  const preset = themePresets[theme.presetName] || getDefaultTheme();
  return (
    !isDeepEqual(theme.palette, preset.palette) ||
    !isDeepEqual(theme.colors, preset.colors) ||
    !isDeepEqual(theme.typography, preset.typography) ||
    !isDeepEqual(theme.buttons, preset.buttons) ||
    !isDeepEqual(theme.effects, preset.effects) ||
    !isDeepEqual(theme.ui, preset.ui) ||
    Boolean(theme.customCss && theme.customCss.trim().length > 0)
  );
}

/**
 * Check if the entire theme matches the selected theme preset defaults
 */
export function isThemeDefault(theme: GlobalThemeData): boolean {
  return !isThemeModified(theme);
}

/**
 * Check if the color palette matches the default for current preset
 */
export function isPaletteDefault(theme: GlobalThemeData): boolean {
  if (!theme) return true;
  const preset = themePresets[theme.presetName] || getDefaultTheme();
  return (
    isDeepEqual(theme.palette, preset.palette) &&
    isDeepEqual(theme.colors, preset.colors)
  );
}

/**
 * Check if typography matches the default for current preset
 */
export function isTypographyDefault(theme: GlobalThemeData): boolean {
  if (!theme) return true;
  const preset = themePresets[theme.presetName] || getDefaultTheme();
  return isDeepEqual(theme.typography, preset.typography);
}

/**
 * Check if buttons match the default for current preset
 */
export function isButtonsDefault(theme: GlobalThemeData): boolean {
  if (!theme) return true;
  const preset = themePresets[theme.presetName] || getDefaultTheme();
  return isDeepEqual(theme.buttons, preset.buttons);
}

/**
 * Check if effects match the default for current preset
 */
export function isEffectsDefault(theme: GlobalThemeData): boolean {
  if (!theme) return true;
  const preset = themePresets[theme.presetName] || getDefaultTheme();
  return (
    isDeepEqual(theme.effects, preset.effects) &&
    isDeepEqual(theme.ui, preset.ui)
  );
}

/**
 * Check if custom CSS is at default (empty)
 */
export function isCustomCssDefault(theme: GlobalThemeData): boolean {
  if (!theme) return true;
  return !theme.customCss || theme.customCss.trim().length === 0;
}

/**
 * Check whether the active theme category is currently at default
 */
export function isCategoryDefault(category: ThemeCategoryType, theme: GlobalThemeData): boolean {
  switch (category) {
    case 'themes':
      return isThemeDefault(theme);
    case 'colors':
      return isPaletteDefault(theme);
    case 'typography':
      return isTypographyDefault(theme);
    case 'buttons':
      return isButtonsDefault(theme);
    case 'effects':
      return isEffectsDefault(theme);
    case 'custom-css':
      return isCustomCssDefault(theme);
    default:
      return true;
  }
}

import React, { useMemo } from 'react';
import type { GlobalThemeData } from '../editor/theme/themePresets';
import { DEFAULT_THEME_SPACING, getDefaultTheme } from '../editor/theme/themePresets';

interface ThemeTokenProviderProps {
  theme?: GlobalThemeData | Record<string, any>;
  tokens?: Record<string, any>;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

type ThemeRecord = Record<string, any>;

const mergeRecord = (base: ThemeRecord, override?: ThemeRecord): ThemeRecord => {
  const result: ThemeRecord = { ...base };
  if (!override || typeof override !== 'object' || Array.isArray(override)) return result;

  for (const [key, value] of Object.entries(override)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const baseValue = result[key] && typeof result[key] === 'object' && !Array.isArray(result[key])
        ? result[key]
        : {};
      result[key] = { ...baseValue, ...value };
    } else if (value !== undefined && value !== null) {
      result[key] = value;
    }
  }
  return result;
};

export const ThemeTokenProvider: React.FC<ThemeTokenProviderProps> = ({
  theme,
  tokens,
  children,
  className = '',
  style = {}
}) => {
  const defaultTheme = useMemo(() => getDefaultTheme() as Record<string, any>, []);

  const resolvedTheme = useMemo(() => {
    const source = theme ?? tokens ?? {};
    const isThemeDocument = Boolean(
      source &&
      typeof source === 'object' &&
      !Array.isArray(source) &&
      ('palette' in source || 'typography' in source || 'buttons' in source || 'effects' in source)
    );
    const overrides: ThemeRecord = isThemeDocument ? source : { palette: source };

    return {
      ...defaultTheme,
      ...overrides,
      palette: mergeRecord(defaultTheme.palette as ThemeRecord, overrides.palette),
      typography: mergeRecord(defaultTheme.typography as ThemeRecord, overrides.typography),
      buttons: mergeRecord(defaultTheme.buttons as ThemeRecord, overrides.buttons),
      effects: mergeRecord(defaultTheme.effects as ThemeRecord, overrides.effects),
      spacing: mergeRecord(DEFAULT_THEME_SPACING as unknown as ThemeRecord, overrides.spacing),
    } as Record<string, any>;
  }, [defaultTheme, theme, tokens]);

  const cssVariables = useMemo(() => {
    const p: Record<string, any> = resolvedTheme.palette || {};
    const t: Record<string, any> = resolvedTheme.typography || {};
    const b: Record<string, any> = resolvedTheme.buttons || {};
    const e: Record<string, any> = resolvedTheme.effects || {};
    const s: Record<string, any> = resolvedTheme.spacing || DEFAULT_THEME_SPACING;
    const legacyColors: Record<string, any> = resolvedTheme.colors || {};
    const baseSize = typeof t.baseSize === 'number'
      ? `${t.baseSize}px`
      : (t.baseSize || '16px');

    return {
      /* Brand palette */
      '--theme-primary': legacyColors.brand?.primary || p.brand?.primary || '#18181b',
      '--theme-secondary': legacyColors.brand?.secondary || p.brand?.secondary || '#71717a',
      '--theme-accent': legacyColors.brand?.accent || p.brand?.accent || '#0284c7',
      '--theme-link': legacyColors.text?.link || p.brand?.link || p.brand?.primary || '#18181b',
      '--theme-brand-primary': legacyColors.brand?.primary || p.brand?.primary || '#18181b',
      '--theme-brand-secondary': legacyColors.brand?.secondary || p.brand?.secondary || '#71717a',
      '--theme-brand-accent': legacyColors.brand?.accent || p.brand?.accent || '#0284c7',
      '--theme-brand-link': legacyColors.text?.link || p.brand?.link || p.brand?.primary || '#18181b',

      /* Backgrounds and surfaces */
      '--theme-bg': legacyColors.surface?.canvas || p.background?.background || '#ffffff',
      '--theme-surface': legacyColors.surface?.page || p.background?.surface || '#f8fafc',
      '--theme-section-bg': legacyColors.surface?.card || p.background?.sectionBg || '#ffffff',
      '--theme-container-bg': legacyColors.surface?.subtle || p.background?.containerBg || '#ffffff',
      '--theme-bg-background': legacyColors.surface?.canvas || p.background?.background || '#ffffff',
      '--theme-bg-surface': legacyColors.surface?.page || p.background?.surface || '#f8fafc',
      '--theme-bg-section': legacyColors.surface?.card || p.background?.sectionBg || '#ffffff',
      '--theme-bg-container': legacyColors.surface?.subtle || p.background?.containerBg || '#ffffff',
      '--theme-footer-bg': p.background?.footerBg || '#0f172a',

      /* Text */
      '--theme-text-heading': legacyColors.text?.primary || p.text?.heading || '#0f172a',
      '--theme-text-subheading': legacyColors.text?.secondary || p.text?.subheading || '#334155',
      '--theme-text-body': legacyColors.text?.body || p.text?.body || '#475569',
      '--theme-text-muted': legacyColors.text?.muted || p.text?.muted || '#64748b',
      '--theme-text-inverse': legacyColors.text?.inverse || p.text?.inverse || '#ffffff',
      '--theme-footer-text': p.text?.footerText || '#ffffff',
      '--theme-footer-muted': p.text?.footerMuted || '#94a3b8',

      /* Borders */
      '--theme-border': legacyColors.border?.default || p.border?.border || '#e2e8f0',
      '--theme-divider': p.border?.divider || '#f1f5f9',
      '--theme-footer-border': p.border?.footerBorder || 'rgba(255, 255, 255, 0.1)',

      /* Typography */
      '--theme-font-heading': t.fontFamily?.heading || t.headingFont || 'Inter, -apple-system, sans-serif',
      '--theme-font-body': t.fontFamily?.body || t.bodyFont || 'Inter, -apple-system, sans-serif',
      '--theme-base-size': baseSize,

      /* Buttons */
      '--theme-btn-primary-bg': b.primary?.bg || b.primaryBg || p.brand?.primary || '#18181b',
      '--theme-btn-primary-text': b.primary?.text || b.primaryText || '#ffffff',
      '--theme-btn-primary-border': b.primary?.border || 'transparent',
      '--theme-btn-radius': b.radius || b.primary?.borderRadius || b.borderRadius || '8px',
      '--theme-btn-secondary-bg': b.secondary?.bg || '#f1f5f9',
      '--theme-btn-secondary-text': b.secondary?.text || '#0f172a',
      '--theme-btn-secondary-border': b.secondary?.border || '#e2e8f0',

      /* Effects */
      '--theme-card-shadow': e.shadows?.card || '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      '--theme-card-radius': e.radii?.card || '12px',
      '--theme-transition-speed': e.motion?.duration || '200ms',

      /* Layout rhythm */
      '--theme-section-space-y': `${s.sectionY ?? 72}px`,
      '--theme-content-gap': `${s.contentGap ?? 32}px`,
      '--theme-grid-gap': `${s.gridGap ?? 20}px`,
      '--theme-card-padding': `${s.cardPadding ?? 24}px`,
      '--theme-container-max-width': `${s.containerMaxWidth ?? 1280}px`,
    } as React.CSSProperties;
  }, [resolvedTheme]);

  return (
    <div
      className={`storefront-theme-scope ${className}`}
      style={{
        ...cssVariables,
        ...style,
        fontFamily: 'var(--theme-font-body)',
        color: 'var(--theme-text-body)',
        backgroundColor: 'var(--theme-bg)',
        minHeight: '100%',
        width: '100%',
      }}
    >
      {children}
    </div>
  );
};

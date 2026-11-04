import React, { useMemo } from 'react';
import type { GlobalThemeData } from '../editor/theme/themePresets';
import { getDefaultTheme } from '../editor/theme/themePresets';

interface ThemeTokenProviderProps {
  theme?: GlobalThemeData | any;
  tokens?: any;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ThemeTokenProvider: React.FC<ThemeTokenProviderProps> = ({
  theme,
  tokens,
  children,
  className = '',
  style = {}
}) => {
  const defaultTheme = getDefaultTheme();
  const safeTheme = theme || (tokens ? { palette: tokens } : null) || defaultTheme;
  const p = safeTheme.palette || defaultTheme.palette;
  const t = safeTheme.typography || defaultTheme.typography;
  const b = safeTheme.buttons || defaultTheme.buttons;
  const e = safeTheme.effects || defaultTheme.effects;

  const cssVariables = useMemo(() => {
    return {
      /* Brand Palette */
      '--theme-primary': safeTheme.colors?.brand?.primary || p.brand?.primary || '#18181b',
      '--theme-secondary': safeTheme.colors?.brand?.secondary || p.brand?.secondary || '#71717a',
      '--theme-accent': safeTheme.colors?.brand?.accent || p.brand?.accent || '#0284c7',
      '--theme-link': safeTheme.colors?.text?.link || p.brand?.link || p.brand?.primary || '#18181b',

      /* Backgrounds & Surfaces */
      '--theme-bg': safeTheme.colors?.surface?.canvas || p.background?.background || '#ffffff',
      '--theme-surface': safeTheme.colors?.surface?.page || p.background?.surface || '#f8fafc',
      '--theme-section-bg': safeTheme.colors?.surface?.card || p.background?.sectionBg || '#ffffff',
      '--theme-container-bg': safeTheme.colors?.surface?.subtle || p.background?.containerBg || '#ffffff',
      '--theme-footer-bg': p.background?.footerBg || '#0f172a',

      /* Text Colors */
      '--theme-text-heading': safeTheme.colors?.text?.primary || p.text?.heading || '#0f172a',
      '--theme-text-subheading': safeTheme.colors?.text?.secondary || p.text?.subheading || '#334155',
      '--theme-text-body': safeTheme.colors?.text?.primary || p.text?.body || '#475569',
      '--theme-text-muted': safeTheme.colors?.text?.secondary || p.text?.muted || '#94a3b8',
      '--theme-text-inverse': safeTheme.colors?.text?.inverse || p.text?.inverse || '#ffffff',
      '--theme-footer-text': p.text?.footerText || '#ffffff',
      '--theme-footer-muted': p.text?.footerMuted || '#94a3b8',

      /* Borders */
      '--theme-border': safeTheme.colors?.border?.default || p.border?.border || '#e2e8f0',
      '--theme-divider': p.border?.divider || '#f1f5f9',
      '--theme-footer-border': p.border?.footerBorder || 'rgba(255, 255, 255, 0.1)',

      /* Typography */
      '--theme-font-heading': safeTheme.typography?.fontFamily?.heading || t.headingFont || 'Inter, -apple-system, sans-serif',
      '--theme-font-body': safeTheme.typography?.fontFamily?.body || t.bodyFont || 'Inter, -apple-system, sans-serif',
      '--theme-base-size': `${t.baseSize || 16}px`,

      /* Buttons & Radii */
      '--theme-btn-primary-bg': b.primary?.bg || safeTheme.colors?.brand?.primary || p.brand?.primary || '#18181b',
      '--theme-btn-primary-text': b.primary?.text || '#ffffff',
      '--theme-btn-primary-border': b.primary?.border || 'transparent',
      '--theme-btn-radius': safeTheme.buttons?.radius || b.primary?.borderRadius || '8px',

      '--theme-btn-secondary-bg': b.secondary?.bg || '#f1f5f9',
      '--theme-btn-secondary-text': b.secondary?.text || '#0f172a',
      '--theme-btn-secondary-border': b.secondary?.border || '#e2e8f0',

      /* Effects & Shadows */
      '--theme-card-shadow': e?.shadows?.card || '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
      '--theme-card-radius': e?.radii?.card || '12px',
      '--theme-transition-speed': e?.motion?.duration || '200ms',
    } as React.CSSProperties;
  }, [p, t, b, e]);

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


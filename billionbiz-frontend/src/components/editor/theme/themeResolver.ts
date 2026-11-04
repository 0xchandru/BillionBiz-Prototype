// ============================================================
// THEME RESOLVER
// Resolves theme tokens and section-level local overrides
// ============================================================

export type ThemeOverrideMode = 'inherit' | 'color' | 'gradient' | 'image' | 'video';

export interface GradientOverride {
  type: 'linear' | 'radial';
  color1: string;
  color2: string;
  angle: string;
}

export interface ImageOverride {
  url: string;
  position?: string;
  size?: string;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface VideoOverride {
  url: string;
  opacity?: number;
  overlayOpacity?: number;
  overlayColor?: string;
}

export interface ThemeOverrideValue {
  mode: ThemeOverrideMode;
  color?: string;
  gradient?: GradientOverride;
  gradientCss?: string;
  image?: ImageOverride;
  video?: VideoOverride;
}

export interface ThemeTokenInfo {
  tokenVar: string;
  label: string;
  palettePath: string;
  isBackground: boolean;
}

// Maps section property keys to their default global theme CSS variables
export const themeTokenMap: Record<string, { tokenVar: string; label: string; isBackground: boolean; palettePath?: string }> = {
  bgColor: { tokenVar: 'var(--theme-bg-section)', label: 'Section Background', isBackground: true, palettePath: 'background.sectionBg' },
  backgroundColor: { tokenVar: 'var(--theme-bg-section)', label: 'Background', isBackground: true, palettePath: 'background.sectionBg' },
  containerBg: { tokenVar: 'var(--theme-bg-container)', label: 'Container Background', isBackground: true, palettePath: 'background.containerBg' },
  sectionBg: { tokenVar: 'var(--theme-bg-section)', label: 'Section Background', isBackground: true, palettePath: 'background.sectionBg' },
  cardBg: { tokenVar: 'var(--theme-bg-surface)', label: 'Card Background', isBackground: true, palettePath: 'background.surface' },
  itemBg: { tokenVar: 'var(--theme-bg-surface)', label: 'Item Background', isBackground: true, palettePath: 'background.surface' },
  inputBg: { tokenVar: 'var(--theme-bg-surface)', label: 'Input Background', isBackground: true, palettePath: 'background.surface' },
  badgeBg: { tokenVar: 'var(--theme-brand-secondary)', label: 'Badge Background', isBackground: true, palettePath: 'brand.secondary' },
  highlightedBg: { tokenVar: 'var(--theme-brand-primary)', label: 'Highlighted Card Bg', isBackground: true, palettePath: 'brand.primary' },
  
  textColor: { tokenVar: 'var(--theme-text-body)', label: 'Body Text Color', isBackground: false, palettePath: 'text.body' },
  bodyColor: { tokenVar: 'var(--theme-text-body)', label: 'Body Text Color', isBackground: false, palettePath: 'text.body' },
  headingColor: { tokenVar: 'var(--theme-text-heading)', label: 'Heading Color', isBackground: false, palettePath: 'text.heading' },
  titleColor: { tokenVar: 'var(--theme-text-heading)', label: 'Title Color', isBackground: false, palettePath: 'text.heading' },
  subheadingColor: { tokenVar: 'var(--theme-text-subheading)', label: 'Subheading Color', isBackground: false, palettePath: 'text.subheading' },
  mutedColor: { tokenVar: 'var(--theme-text-muted)', label: 'Muted Text Color', isBackground: false, palettePath: 'text.muted' },
  linkColor: { tokenVar: 'var(--theme-brand-link)', label: 'Link Color', isBackground: false, palettePath: 'brand.link' },
  accentColor: { tokenVar: 'var(--theme-brand-accent)', label: 'Accent Color', isBackground: false, palettePath: 'brand.accent' },
  priceColor: { tokenVar: 'var(--theme-brand-primary)', label: 'Price Color', isBackground: false, palettePath: 'brand.primary' },
  badgeColor: { tokenVar: 'var(--theme-text-inverse)', label: 'Badge Text Color', isBackground: false, palettePath: 'text.inverse' },
  inputColor: { tokenVar: 'var(--theme-text-body)', label: 'Input Text Color', isBackground: false, palettePath: 'text.body' },
  starColor: { tokenVar: 'var(--theme-brand-accent)', label: 'Star Rating Color', isBackground: false, palettePath: 'brand.accent' },
  dateColor: { tokenVar: 'var(--theme-brand-primary)', label: 'Date Color', isBackground: false, palettePath: 'brand.primary' },
  iconColor: { tokenVar: 'var(--theme-brand-primary)', label: 'Icon Color', isBackground: false, palettePath: 'brand.primary' },
  questionColor: { tokenVar: 'var(--theme-text-heading)', label: 'Question Text', isBackground: false, palettePath: 'text.heading' },
  answerColor: { tokenVar: 'var(--theme-text-body)', label: 'Answer Text', isBackground: false, palettePath: 'text.body' },
  nameColor: { tokenVar: 'var(--theme-text-heading)', label: 'Name Color', isBackground: false, palettePath: 'text.heading' },
  highlightedText: { tokenVar: 'var(--theme-text-inverse)', label: 'Highlighted Card Text', isBackground: false, palettePath: 'text.inverse' },
  
  borderColor: { tokenVar: 'var(--theme-border-border)', label: 'Border Color', isBackground: false, palettePath: 'border.border' },
  dividerColor: { tokenVar: 'var(--theme-border-divider)', label: 'Divider Color', isBackground: false, palettePath: 'border.divider' },
  
  buttonBg: { tokenVar: 'var(--theme-btn-primary-bg)', label: 'Button Background', isBackground: false, palettePath: 'brand.primary' },
  buttonColor: { tokenVar: 'var(--theme-btn-primary-text)', label: 'Button Text Color', isBackground: false, palettePath: 'text.inverse' },
  primaryBtnBg: { tokenVar: 'var(--theme-btn-primary-bg)', label: 'Primary Button Bg', isBackground: false, palettePath: 'brand.primary' },
  primaryBtnColor: { tokenVar: 'var(--theme-btn-primary-text)', label: 'Primary Button Text', isBackground: false, palettePath: 'text.inverse' },
  secondaryBtnBg: { tokenVar: 'var(--theme-btn-secondary-bg)', label: 'Secondary Button Bg', isBackground: false, palettePath: 'brand.secondary' },
  secondaryBtnColor: { tokenVar: 'var(--theme-btn-secondary-text)', label: 'Secondary Button Text', isBackground: false, palettePath: 'brand.secondary' },
  footerBg: { tokenVar: 'var(--theme-footer-bg)', label: 'Footer Background', isBackground: true, palettePath: 'background.footerBg' },
  footerText: { tokenVar: 'var(--theme-footer-text)', label: 'Footer Text', isBackground: false, palettePath: 'text.footerText' },
};

/**
 * Intelligent section-specific token mapper.
 * Returns the exact global theme token, display label, and palette key that a property inherits from.
 */
export function getSectionDefaultToken(
  sectionType?: string,
  fieldKey: string = ''
): ThemeTokenInfo {
  const key = fieldKey.toLowerCase();
  const type = sectionType || '';

  // Direct map check
  if (themeTokenMap[fieldKey]) {
    const item = themeTokenMap[fieldKey];
    return {
      tokenVar: item.tokenVar,
      label: item.label,
      palettePath: item.palettePath || 'text.body',
      isBackground: item.isBackground,
    };
  }

  // 1. ANNOUNCEMENT BAR SPECIALIZATION (Secondary Color + Inverse Text)
  if (type === 'AnnouncementBar') {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-brand-secondary)',
        label: 'Secondary Color',
        palettePath: 'brand.secondary',
        isBackground: true,
      };
    }
    if (key.includes('text') || key.includes('color')) {
      return {
        tokenVar: 'var(--theme-text-inverse)',
        label: 'Inverse Text',
        palettePath: 'text.inverse',
        isBackground: false,
      };
    }
  }

  // 2. UTILITY BAR SPECIALIZATION (Surface Background + Muted Text)
  if (type === 'UtilityBar') {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-bg-surface)',
        label: 'Surface Background',
        palettePath: 'background.surface',
        isBackground: true,
      };
    }
    if (key.includes('text') || key.includes('color')) {
      return {
        tokenVar: 'var(--theme-text-muted)',
        label: 'Muted Text',
        palettePath: 'text.muted',
        isBackground: false,
      };
    }
  }

  // 3. HEADER SPECIALIZATION (Page Background + Heading Text)
  if (type === 'Header') {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-bg-background)',
        label: 'Page Background',
        palettePath: 'background.background',
        isBackground: true,
      };
    }
    if (key.includes('heading') || key.includes('logo') || key.includes('text')) {
      return {
        tokenVar: 'var(--theme-text-heading)',
        label: 'Heading Text',
        palettePath: 'text.heading',
        isBackground: false,
      };
    }
  }

  // 4. FOOTER & FOOTER BLOCKS (Footer Background + Footer Text)
  if (['Footer', 'FooterMenu', 'FooterText', 'FooterNewsletter'].includes(type)) {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-footer-bg)',
        label: 'Footer Background',
        palettePath: 'background.footerBg',
        isBackground: true,
      };
    }
    if (key.includes('text') || key.includes('color') || key.includes('link')) {
      return {
        tokenVar: 'var(--theme-footer-text)',
        label: 'Footer Text',
        palettePath: 'text.footerText',
        isBackground: false,
      };
    }
  }

  // 5. NEWSLETTER SPECIALIZATION (Surface Background)
  if (type === 'Newsletter') {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-bg-surface)',
        label: 'Surface Background',
        palettePath: 'background.surface',
        isBackground: true,
      };
    }
  }

  // 6. PRICE SPECIALIZATION (Brand Primary)
  if (key.includes('price')) {
    return {
      tokenVar: 'var(--theme-brand-primary)',
      label: 'Price Color',
      palettePath: 'brand.primary',
      isBackground: false,
    };
  }

  // 7. BADGE SPECIALIZATION (Brand Secondary + Inverse Text)
  if (key.includes('badge')) {
    if (key.includes('bg') || key.includes('background')) {
      return {
        tokenVar: 'var(--theme-brand-secondary)',
        label: 'Badge Background',
        palettePath: 'brand.secondary',
        isBackground: true,
      };
    }
    return {
      tokenVar: 'var(--theme-text-inverse)',
      label: 'Badge Text',
      palettePath: 'text.inverse',
      isBackground: false,
    };
  }

  // 8. CARD / ITEM BACKGROUND (Surface Background)
  if (key.includes('cardbg') || key.includes('itembg') || key.includes('surface')) {
    return {
      tokenVar: 'var(--theme-bg-surface)',
      label: 'Card Background',
      palettePath: 'background.surface',
      isBackground: true,
    };
  }

  // 9. GENERAL FIELD KEY MAPPINGS ACROSS ALL SECTIONS
  if (key.includes('containerbg') || key.includes('container')) {
    return {
      tokenVar: 'var(--theme-bg-container)',
      label: 'Container Background',
      palettePath: 'background.containerBg',
      isBackground: true,
    };
  }
  if (key.includes('bg') || key.includes('background')) {
    return {
      tokenVar: 'var(--theme-bg-section)',
      label: 'Section Background',
      palettePath: 'background.sectionBg',
      isBackground: true,
    };
  }
  if (key.includes('heading') || key.includes('title') || key.includes('name') || key.includes('question')) {
    return {
      tokenVar: 'var(--theme-text-heading)',
      label: 'Heading Text',
      palettePath: 'text.heading',
      isBackground: false,
    };
  }
  if (key.includes('subheading') || key.includes('subtitle')) {
    return {
      tokenVar: 'var(--theme-text-subheading)',
      label: 'Subheading Text',
      palettePath: 'text.subheading',
      isBackground: false,
    };
  }
  if (key.includes('muted') || key.includes('caption')) {
    return {
      tokenVar: 'var(--theme-text-muted)',
      label: 'Muted Text',
      palettePath: 'text.muted',
      isBackground: false,
    };
  }
  if (key.includes('accent') || key.includes('star')) {
    return {
      tokenVar: 'var(--theme-brand-accent)',
      label: 'Accent Color',
      palettePath: 'brand.accent',
      isBackground: false,
    };
  }
  if (key.includes('link') || key.includes('date') || key.includes('icon')) {
    return {
      tokenVar: 'var(--theme-brand-link)',
      label: 'Link Color',
      palettePath: 'brand.link',
      isBackground: false,
    };
  }
  if (key.includes('border') || key.includes('divider')) {
    return {
      tokenVar: 'var(--theme-border-border)',
      label: 'Border Color',
      palettePath: 'border.border',
      isBackground: false,
    };
  }
  if (key.includes('primarybtn') || key.includes('btnbg') || key.includes('buttonbg')) {
    return {
      tokenVar: 'var(--theme-btn-primary-bg)',
      label: 'Primary Button',
      palettePath: 'brand.primary',
      isBackground: false,
    };
  }
  if (key.includes('secondarybtn')) {
    return {
      tokenVar: 'var(--theme-btn-secondary-bg)',
      label: 'Secondary Button',
      palettePath: 'brand.secondary',
      isBackground: false,
    };
  }
  if (key.includes('buttontext') || key.includes('btntext') || key.includes('buttoncolor') || key.includes('primarybtncolor')) {
    return {
      tokenVar: 'var(--theme-btn-primary-text)',
      label: 'Button Text',
      palettePath: 'text.inverse',
      isBackground: false,
    };
  }

  // Default fallback to body text
  return {
    tokenVar: 'var(--theme-text-body)',
    label: 'Body Text',
    palettePath: 'text.body',
    isBackground: false,
  };
}

/**
 * Resolves an individual property value (which may be a string, an override object, or undefined)
 * into a valid CSS value.
 */
export function resolveThemeProp(
  propValue: any,
  defaultCssVar: string,
  isBackground: boolean = false
): string {
  if (propValue === undefined || propValue === null || propValue === '') {
    return defaultCssVar;
  }

  // Already a raw string (e.g. hex, rgb, var(...), linear-gradient(...))
  if (typeof propValue === 'string') {
    if (propValue === 'inherit') {
      return defaultCssVar;
    }
    return propValue;
  }

  // Structured override object
  if (typeof propValue === 'object') {
    const mode: ThemeOverrideMode = propValue.mode || 'inherit';

    if (mode === 'inherit') {
      return defaultCssVar;
    }

    if (mode === 'color') {
      return propValue.color || defaultCssVar;
    }

    if (mode === 'gradient' && isBackground) {
      if (propValue.gradientCss) {
        return propValue.gradientCss;
      }
      const g: GradientOverride = propValue.gradient || {
        type: 'linear',
        color1: '#2563eb',
        color2: '#4f46e5',
        angle: '135deg',
      };
      if (g.type === 'radial') {
        return `radial-gradient(circle, ${g.color1 || '#2563eb'}, ${g.color2 || '#4f46e5'})`;
      }
      return `linear-gradient(${g.angle || '135deg'}, ${g.color1 || '#2563eb'}, ${g.color2 || '#4f46e5'})`;
    }

    if (mode === 'image' && isBackground) {
      const img: ImageOverride = propValue.image || { url: '' };
      if (!img.url) return defaultCssVar;
      const overlay =
        img.overlayColor && (img.overlayOpacity ?? 0) > 0
          ? `linear-gradient(${img.overlayColor}, ${img.overlayColor}), `
          : '';
      return `${overlay}url('${img.url}') ${img.position || 'center'} / ${img.size || 'cover'} no-repeat`;
    }
  }

  return defaultCssVar;
}

/**
 * Resolves all theme-aware props in a section's prop dictionary,
 * converting override objects into rendered CSS strings before section rendering.
 */
export function resolveSectionProps(
  props: Record<string, any>,
  sectionType?: string
): Record<string, any> {
  const resolved = { ...props };

  for (const key of Object.keys(resolved)) {
    const val = resolved[key];
    const isColorProp = 
      key.toLowerCase().includes('color') || 
      key.toLowerCase().includes('bg') || 
      key.toLowerCase().includes('background');

    if (isColorProp || key in themeTokenMap) {
      const tokenInfo = getSectionDefaultToken(sectionType, key);
      resolved[key] = resolveThemeProp(val, tokenInfo.tokenVar, tokenInfo.isBackground);
    }
  }

  // Ensure background property is consistently accessible for styling
  if (resolved.bgColor) {
    resolved._resolvedBackground = resolved.bgColor;
  }

  return resolved;
}

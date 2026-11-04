// ============================================================
// THEME PRESETS & DESIGN TOKENS
// Centralized theme design tokens for Shopify-like website builder
// ============================================================

export interface ThemeColorPalette {
  brand: {
    primary: string;
    secondary: string;
    accent: string;
    link: string;
  };
  background: {
    background: string;
    surface: string;
    sectionBg: string;
    containerBg: string;
    footerBg: string;
  };
  text: {
    heading: string;
    subheading: string;
    body: string;
    muted: string;
    inverse: string;
    footerText: string;
    footerMuted?: string;
  };
  border: {
    border: string;
    divider: string;
    footerBorder?: string;
  };
  states: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

export interface TypographyScaleItem {
  fontSize: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: number;
  fontFamily?: 'heading' | 'body' | 'accent' | 'button';
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  buttonFont: string;
  accentFont: string;
  baseSize: number;
  styles: {
    h1: TypographyScaleItem;
    h2: TypographyScaleItem;
    h3: TypographyScaleItem;
    h4: TypographyScaleItem;
    body: TypographyScaleItem;
    small: TypographyScaleItem;
    caption: TypographyScaleItem;
    label: TypographyScaleItem;
    navigation: TypographyScaleItem;
    button: TypographyScaleItem;
    quote: TypographyScaleItem;
  };
}

export interface ThemeButtons {
  primary: {
    bg: string;
    text: string;
    border: string;
    borderRadius: string;
    fontWeight: number;
  };
  secondary: {
    bg: string;
    text: string;
    border: string;
    borderRadius: string;
  };
  states: {
    hoverOpacity: number;
    hoverLift: boolean;
    focusRingColor: string;
    pressedScale: number;
    disabledOpacity: number;
  };
  style: 'filled' | 'outline' | 'ghost' | 'soft';
  shape: 'square' | 'rounded' | 'pill';
}

export interface ThemeEffects {
  borderRadius: string;
  shadow: string;
  transition: string;
  hoverBehavior: 'lift' | 'scale' | 'glow' | 'none';
  animationStyle: 'smooth' | 'snappy' | 'fade' | 'none';
  animationSpeed: 'fast' | 'normal' | 'slow';
}

export interface GlobalThemeData {
  presetName: string;
  description: string;
  // Legacy backward compatibility
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
    border: string;
  };
  ui: {
    borderRadius: string;
    shadow: string;
    buttonHover: string;
    glassmorphism: boolean;
  };
  layout: {
    maxWidth: number;
  };
  animation: {
    enableScrollReveal: boolean;
  };
  // Full Design Tokens
  palette: ThemeColorPalette;
  typography: ThemeTypography;
  buttons: ThemeButtons;
  effects: ThemeEffects;
  customCss?: string;
}

const defaultTypographyStyles: ThemeTypography['styles'] = {
  h1: { fontSize: 44, fontWeight: 700, lineHeight: 1.15, letterSpacing: -1, fontFamily: 'heading' },
  h2: { fontSize: 34, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, fontFamily: 'heading' },
  h3: { fontSize: 26, fontWeight: 600, lineHeight: 1.25, letterSpacing: -0.3, fontFamily: 'heading' },
  h4: { fontSize: 20, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, fontFamily: 'heading' },
  body: { fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, fontFamily: 'body' },
  small: { fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'body' },
  caption: { fontSize: 12, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0.2, fontFamily: 'body' },
  label: { fontSize: 13, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0.5, fontFamily: 'body' },
  navigation: { fontSize: 15, fontWeight: 500, lineHeight: 1.2, letterSpacing: 0.2, fontFamily: 'body' },
  button: { fontSize: 15, fontWeight: 600, lineHeight: 1, letterSpacing: 0.3, fontFamily: 'button' },
  quote: { fontSize: 18, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, fontFamily: 'heading' },
};

// --- PRESET DEFINITIONS ---

export const themePresets: Record<string, GlobalThemeData> = {
  Modern: {
    presetName: 'Modern',
    description: 'Crisp royal blue and indigo with sleek geometry',
    colors: {
      primary: '#2563eb',
      secondary: '#4f46e5',
      background: '#ffffff',
      text: '#0f172a',
      accent: '#f59e0b',
      border: '#e2e8f0',
    },
    ui: {
      borderRadius: '8px',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      buttonHover: 'lift',
      glassmorphism: false,
    },
    layout: { maxWidth: 1280 },
    animation: { enableScrollReveal: true },
    palette: {
      brand: {
        primary: '#2563eb',
        secondary: '#4f46e5',
        accent: '#f59e0b',
        link: '#2563eb',
      },
      background: {
        background: '#ffffff',
        surface: '#f8fafc',
        sectionBg: '#f8fafc',
        containerBg: '#ffffff',
        footerBg: '#0f172a',
      },
      text: {
        heading: '#0f172a',
        subheading: '#334155',
        body: '#475569',
        muted: '#94a3b8',
        inverse: '#ffffff',
        footerText: '#f8fafc',
        footerMuted: '#94a3b8',
      },
      border: {
        border: '#e2e8f0',
        divider: '#f1f5f9',
        footerBorder: '#1e293b',
      },
      states: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
    },
    typography: {
      headingFont: 'Outfit, sans-serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Inter, sans-serif',
      accentFont: 'Space Grotesk, sans-serif',
      baseSize: 16,
      styles: { ...defaultTypographyStyles },
    },
    buttons: {
      primary: {
        bg: '#2563eb',
        text: '#ffffff',
        border: '1px solid #2563eb',
        borderRadius: '8px',
        fontWeight: 600,
      },
      secondary: {
        bg: '#f1f5f9',
        text: '#0f172a',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      },
      states: {
        hoverOpacity: 0.9,
        hoverLift: true,
        focusRingColor: '#93c5fd',
        pressedScale: 0.98,
        disabledOpacity: 0.5,
      },
      style: 'filled',
      shape: 'rounded',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      hoverBehavior: 'lift',
      animationStyle: 'smooth',
      animationSpeed: 'normal',
    },
  },

  Minimal: {
    presetName: 'Minimal',
    description: 'Understated monochrome, strict typography, clean lines',
    colors: {
      primary: '#18181b',
      secondary: '#71717a',
      background: '#ffffff',
      text: '#18181b',
      accent: '#09090b',
      border: '#e4e4e7',
    },
    ui: {
      borderRadius: '2px',
      shadow: 'none',
      buttonHover: 'none',
      glassmorphism: false,
    },
    layout: { maxWidth: 1200 },
    animation: { enableScrollReveal: false },
    palette: {
      brand: {
        primary: '#18181b',
        secondary: '#71717a',
        accent: '#27272a',
        link: '#18181b',
      },
      background: {
        background: '#ffffff',
        surface: '#fafafa',
        sectionBg: '#f4f4f5',
        containerBg: '#ffffff',
        footerBg: '#18181b',
      },
      text: {
        heading: '#09090b',
        subheading: '#27272a',
        body: '#52525b',
        muted: '#a1a1aa',
        inverse: '#ffffff',
        footerText: '#fafafa',
        footerMuted: '#a1a1aa',
      },
      border: {
        border: '#e4e4e7',
        divider: '#f4f4f5',
        footerBorder: '#27272a',
      },
      states: {
        success: '#15803d',
        warning: '#b45309',
        error: '#b91c1c',
        info: '#1d4ed8',
      },
    },
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Inter, sans-serif',
      accentFont: 'Inter, sans-serif',
      baseSize: 15,
      styles: {
        ...defaultTypographyStyles,
        h1: { fontSize: 40, fontWeight: 600, lineHeight: 1.15, letterSpacing: -0.5, fontFamily: 'heading' },
        h2: { fontSize: 30, fontWeight: 600, lineHeight: 1.2, letterSpacing: -0.3, fontFamily: 'heading' },
      },
    },
    buttons: {
      primary: {
        bg: '#18181b',
        text: '#ffffff',
        border: '1px solid #18181b',
        borderRadius: '2px',
        fontWeight: 500,
      },
      secondary: {
        bg: '#ffffff',
        text: '#18181b',
        border: '1px solid #18181b',
        borderRadius: '2px',
      },
      states: {
        hoverOpacity: 0.85,
        hoverLift: false,
        focusRingColor: '#a1a1aa',
        pressedScale: 0.99,
        disabledOpacity: 0.4,
      },
      style: 'filled',
      shape: 'square',
    },
    effects: {
      borderRadius: '2px',
      shadow: 'none',
      transition: 'all 0.15s ease',
      hoverBehavior: 'none',
      animationStyle: 'snappy',
      animationSpeed: 'fast',
    },
  },

  Luxury: {
    presetName: 'Luxury',
    description: 'Gold & obsidian prestige with editorial serif headings',
    colors: {
      primary: '#c5a880',
      secondary: '#e5d5be',
      background: '#0d0d12',
      text: '#f8f6f0',
      accent: '#d4af37',
      border: '#2a2a38',
    },
    ui: {
      borderRadius: '0px',
      shadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)',
      buttonHover: 'glow',
      glassmorphism: true,
    },
    layout: { maxWidth: 1320 },
    animation: { enableScrollReveal: true },
    palette: {
      brand: {
        primary: '#c5a880',
        secondary: '#e5d5be',
        accent: '#d4af37',
        link: '#c5a880',
      },
      background: {
        background: '#0d0d12',
        surface: '#15151e',
        sectionBg: '#12121a',
        containerBg: '#181824',
        footerBg: '#08080c',
      },
      text: {
        heading: '#f8f6f0',
        subheading: '#dcd6cd',
        body: '#b8b2a7',
        muted: '#7a756c',
        inverse: '#0d0d12',
        footerText: '#f8f6f0',
        footerMuted: '#a8a29e',
      },
      border: {
        border: '#2a2a38',
        divider: '#20202e',
        footerBorder: '#22222e',
      },
      states: {
        success: '#10b981',
        warning: '#f59e0b',
        error: '#f43f5e',
        info: '#38bdf8',
      },
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Playfair Display, serif',
      accentFont: 'Playfair Display, serif',
      baseSize: 16,
      styles: {
        ...defaultTypographyStyles,
        h1: { fontSize: 48, fontWeight: 600, lineHeight: 1.1, letterSpacing: -0.5, fontFamily: 'heading' },
        h2: { fontSize: 36, fontWeight: 600, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'heading' },
        button: { fontSize: 14, fontWeight: 600, lineHeight: 1, letterSpacing: 1.5, fontFamily: 'button' },
      },
    },
    buttons: {
      primary: {
        bg: '#c5a880',
        text: '#0d0d12',
        border: '1px solid #c5a880',
        borderRadius: '0px',
        fontWeight: 600,
      },
      secondary: {
        bg: 'transparent',
        text: '#c5a880',
        border: '1px solid #c5a880',
        borderRadius: '0px',
      },
      states: {
        hoverOpacity: 0.9,
        hoverLift: true,
        focusRingColor: '#d4af37',
        pressedScale: 0.98,
        disabledOpacity: 0.4,
      },
      style: 'filled',
      shape: 'square',
    },
    effects: {
      borderRadius: '0px',
      shadow: '0 20px 25px -5px rgb(0 0 0 / 0.4)',
      transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      hoverBehavior: 'glow',
      animationStyle: 'smooth',
      animationSpeed: 'normal',
    },
  },

  Ocean: {
    presetName: 'Ocean',
    description: 'Refreshing marine blues and teals with soft curves',
    colors: {
      primary: '#0284c7',
      secondary: '#0d9488',
      background: '#f0f9ff',
      text: '#0c4a6e',
      accent: '#38bdf8',
      border: '#bae6fd',
    },
    ui: {
      borderRadius: '999px',
      shadow: '0 10px 15px -3px rgba(2, 132, 199, 0.12)',
      buttonHover: 'lift',
      glassmorphism: false,
    },
    layout: { maxWidth: 1280 },
    animation: { enableScrollReveal: true },
    palette: {
      brand: {
        primary: '#0284c7',
        secondary: '#0d9488',
        accent: '#38bdf8',
        link: '#0284c7',
      },
      background: {
        background: '#f0f9ff',
        surface: '#ffffff',
        sectionBg: '#e0f2fe',
        containerBg: '#ffffff',
        footerBg: '#082f49',
      },
      text: {
        heading: '#0c4a6e',
        subheading: '#0369a1',
        body: '#334155',
        muted: '#64748b',
        inverse: '#ffffff',
        footerText: '#f0f9ff',
        footerMuted: '#7dd3fc',
      },
      border: {
        border: '#bae6fd',
        divider: '#e0f2fe',
        footerBorder: '#0c4a6e',
      },
      states: {
        success: '#14b8a6',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0284c7',
      },
    },
    typography: {
      headingFont: 'Outfit, sans-serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Outfit, sans-serif',
      accentFont: 'Outfit, sans-serif',
      baseSize: 16,
      styles: { ...defaultTypographyStyles },
    },
    buttons: {
      primary: {
        bg: '#0284c7',
        text: '#ffffff',
        border: 'none',
        borderRadius: '999px',
        fontWeight: 600,
      },
      secondary: {
        bg: '#e0f2fe',
        text: '#0284c7',
        border: '1px solid #bae6fd',
        borderRadius: '999px',
      },
      states: {
        hoverOpacity: 0.9,
        hoverLift: true,
        focusRingColor: '#7dd3fc',
        pressedScale: 0.97,
        disabledOpacity: 0.5,
      },
      style: 'filled',
      shape: 'pill',
    },
    effects: {
      borderRadius: '16px',
      shadow: '0 10px 15px -3px rgba(2, 132, 199, 0.1)',
      transition: 'all 0.25s ease',
      hoverBehavior: 'lift',
      animationStyle: 'smooth',
      animationSpeed: 'normal',
    },
  },

  Warm: {
    presetName: 'Warm',
    description: 'Earthy terracotta, warm cream background, organic comfort',
    colors: {
      primary: '#b45309',
      secondary: '#78350f',
      background: '#fdfbf7',
      text: '#292524',
      accent: '#d97706',
      border: '#e7e5e4',
    },
    ui: {
      borderRadius: '12px',
      shadow: '0 4px 12px rgba(180, 83, 9, 0.08)',
      buttonHover: 'lift',
      glassmorphism: false,
    },
    layout: { maxWidth: 1240 },
    animation: { enableScrollReveal: true },
    palette: {
      brand: {
        primary: '#b45309',
        secondary: '#78350f',
        accent: '#d97706',
        link: '#b45309',
      },
      background: {
        background: '#fdfbf7',
        surface: '#ffffff',
        sectionBg: '#f7f3ec',
        containerBg: '#ffffff',
        footerBg: '#1c1917',
      },
      text: {
        heading: '#292524',
        subheading: '#44403c',
        body: '#57534e',
        muted: '#a8a29e',
        inverse: '#ffffff',
        footerText: '#fafaf9',
        footerMuted: '#a8a29e',
      },
      border: {
        border: '#e7e5e4',
        divider: '#f5f5f4',
        footerBorder: '#292524',
      },
      states: {
        success: '#15803d',
        warning: '#d97706',
        error: '#dc2626',
        info: '#0369a1',
      },
    },
    typography: {
      headingFont: 'Playfair Display, serif',
      bodyFont: 'Lato, sans-serif',
      buttonFont: 'Lato, sans-serif',
      accentFont: 'Playfair Display, serif',
      baseSize: 16,
      styles: {
        ...defaultTypographyStyles,
        h1: { fontSize: 44, fontWeight: 700, lineHeight: 1.15, letterSpacing: -0.5, fontFamily: 'heading' },
        h2: { fontSize: 32, fontWeight: 700, lineHeight: 1.2, letterSpacing: 0, fontFamily: 'heading' },
      },
    },
    buttons: {
      primary: {
        bg: '#b45309',
        text: '#ffffff',
        border: 'none',
        borderRadius: '10px',
        fontWeight: 600,
      },
      secondary: {
        bg: '#f7f3ec',
        text: '#78350f',
        border: '1px solid #e7e5e4',
        borderRadius: '10px',
      },
      states: {
        hoverOpacity: 0.92,
        hoverLift: true,
        focusRingColor: '#fcd34d',
        pressedScale: 0.98,
        disabledOpacity: 0.5,
      },
      style: 'filled',
      shape: 'rounded',
    },
    effects: {
      borderRadius: '12px',
      shadow: '0 4px 12px rgba(180, 83, 9, 0.08)',
      transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
      hoverBehavior: 'lift',
      animationStyle: 'smooth',
      animationSpeed: 'normal',
    },
  },

  Corporate: {
    presetName: 'Corporate',
    description: 'Commanding sapphire blue, stable structure, business clarity',
    colors: {
      primary: '#1e3a8a',
      secondary: '#0284c7',
      background: '#ffffff',
      text: '#1e293b',
      accent: '#2563eb',
      border: '#cbd5e1',
    },
    ui: {
      borderRadius: '6px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      buttonHover: 'none',
      glassmorphism: false,
    },
    layout: { maxWidth: 1280 },
    animation: { enableScrollReveal: false },
    palette: {
      brand: {
        primary: '#1e3a8a',
        secondary: '#0284c7',
        accent: '#2563eb',
        link: '#1e3a8a',
      },
      background: {
        background: '#ffffff',
        surface: '#f8fafc',
        sectionBg: '#f1f5f9',
        containerBg: '#ffffff',
        footerBg: '#0f172a',
      },
      text: {
        heading: '#1e293b',
        subheading: '#334155',
        body: '#475569',
        muted: '#94a3b8',
        inverse: '#ffffff',
        footerText: '#ffffff',
        footerMuted: '#94a3b8',
      },
      border: {
        border: '#cbd5e1',
        divider: '#e2e8f0',
        footerBorder: '#1e293b',
      },
      states: {
        success: '#16a34a',
        warning: '#ca8a04',
        error: '#dc2626',
        info: '#2563eb',
      },
    },
    typography: {
      headingFont: 'Inter, sans-serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Inter, sans-serif',
      accentFont: 'Inter, sans-serif',
      baseSize: 15,
      styles: {
        ...defaultTypographyStyles,
        h1: { fontSize: 40, fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.5, fontFamily: 'heading' },
        h2: { fontSize: 30, fontWeight: 700, lineHeight: 1.25, letterSpacing: -0.3, fontFamily: 'heading' },
      },
    },
    buttons: {
      primary: {
        bg: '#1e3a8a',
        text: '#ffffff',
        border: '1px solid #1e3a8a',
        borderRadius: '6px',
        fontWeight: 600,
      },
      secondary: {
        bg: '#ffffff',
        text: '#1e3a8a',
        border: '1px solid #cbd5e1',
        borderRadius: '6px',
      },
      states: {
        hoverOpacity: 0.9,
        hoverLift: false,
        focusRingColor: '#93c5fd',
        pressedScale: 0.98,
        disabledOpacity: 0.5,
      },
      style: 'filled',
      shape: 'rounded',
    },
    effects: {
      borderRadius: '6px',
      shadow: '0 2px 4px rgba(0, 0, 0, 0.06)',
      transition: 'all 0.15s ease',
      hoverBehavior: 'none',
      animationStyle: 'snappy',
      animationSpeed: 'normal',
    },
  },

  Custom: {
    presetName: 'Custom',
    description: 'Fully personalized design system tokens',
    colors: {
      primary: '#198754',
      secondary: '#ff6b00',
      background: '#ffffff',
      text: '#0f172a',
      accent: '#facc15',
      border: '#e2e8f0',
    },
    ui: {
      borderRadius: '8px',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      buttonHover: 'lift',
      glassmorphism: false,
    },
    layout: { maxWidth: 1280 },
    animation: { enableScrollReveal: true },
    palette: {
      brand: {
        primary: '#198754',
        secondary: '#ff6b00',
        accent: '#facc15',
        link: '#198754',
      },
      background: {
        background: '#ffffff',
        surface: '#f8fafc',
        sectionBg: '#f8fafc',
        containerBg: '#ffffff',
        footerBg: '#0f172a',
      },
      text: {
        heading: '#0f172a',
        subheading: '#334155',
        body: '#0f172a',
        muted: '#64748b',
        inverse: '#ffffff',
        footerText: '#f8fafc',
        footerMuted: '#94a3b8',
      },
      border: {
        border: '#e2e8f0',
        divider: '#f1f5f9',
        footerBorder: '#1e293b',
      },
      states: {
        success: '#198754',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#0d6efd',
      },
    },
    typography: {
      headingFont: 'Outfit, sans-serif',
      bodyFont: 'Inter, sans-serif',
      buttonFont: 'Inter, sans-serif',
      accentFont: 'Space Grotesk, sans-serif',
      baseSize: 16,
      styles: { ...defaultTypographyStyles },
    },
    buttons: {
      primary: {
        bg: '#198754',
        text: '#ffffff',
        border: '1px solid #198754',
        borderRadius: '8px',
        fontWeight: 600,
      },
      secondary: {
        bg: '#f1f5f9',
        text: '#0f172a',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
      },
      states: {
        hoverOpacity: 0.9,
        hoverLift: true,
        focusRingColor: '#86efac',
        pressedScale: 0.98,
        disabledOpacity: 0.5,
      },
      style: 'filled',
      shape: 'rounded',
    },
    effects: {
      borderRadius: '8px',
      shadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
      transition: 'all 0.2s ease',
      hoverBehavior: 'lift',
      animationStyle: 'smooth',
      animationSpeed: 'normal',
    },
  },
};

export const getDefaultTheme = (): GlobalThemeData => JSON.parse(JSON.stringify(themePresets.Modern));

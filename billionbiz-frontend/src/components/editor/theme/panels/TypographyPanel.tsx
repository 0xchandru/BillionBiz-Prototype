import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../../../store/siteStore';
import type { TypographyScaleItem, ThemeTypography } from '../themePresets';

const FONT_OPTIONS = [
  { label: 'Inter (Modern Sans)', value: 'Inter, sans-serif' },
  { label: 'Outfit (Geometric Clean)', value: 'Outfit, sans-serif' },
  { label: 'Playfair Display (Editorial Serif)', value: 'Playfair Display, serif' },
  { label: 'Space Grotesk (Tech / Brutalist)', value: 'Space Grotesk, sans-serif' },
  { label: 'Plus Jakarta Sans (Crisp Modern)', value: 'Plus Jakarta Sans, sans-serif' },
  { label: 'Cinzel (Classical Luxury)', value: 'Cinzel, serif' },
  { label: 'Montserrat (Friendly Geometric)', value: 'Montserrat, sans-serif' },
  { label: 'Merriweather (Warm Serif)', value: 'Merriweather, serif' },
  { label: 'Roboto (Neutral Clean)', value: 'Roboto, sans-serif' },
  { label: 'Poppins (Soft Rounded)', value: 'Poppins, sans-serif' },
  { label: 'Lato (Warm Sans)', value: 'Lato, sans-serif' },
];

const STYLE_LABELS: Record<keyof ThemeTypography['styles'], { label: string; desc: string }> = {
  h1: { label: 'Heading 1 (H1)', desc: 'Primary hero banner headline' },
  h2: { label: 'Heading 2 (H2)', desc: 'Main section titles' },
  h3: { label: 'Heading 3 (H3)', desc: 'Card and subsection titles' },
  h4: { label: 'Heading 4 (H4)', desc: 'Minor titles and widgets' },
  body: { label: 'Body', desc: 'Standard paragraph content' },
  small: { label: 'Small', desc: 'Secondary details and footer links' },
  caption: { label: 'Caption', desc: 'Micro-copy, badges and helper text' },
  label: { label: 'Label', desc: 'Form field headers and inputs' },
  navigation: { label: 'Navigation', desc: 'Header menu and tab text' },
  button: { label: 'Button', desc: 'Call to action button labels' },
  quote: { label: 'Quote', desc: 'Testimonials and blockquotes' },
};

export const TypographyPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const typography = theme.typography;
  const [activeStyleKey, setActiveStyleKey] = useState<string | null>('h1');

  const updateFamily = (key: keyof ThemeTypography, val: string) => {
    updateTheme({
      typography: {
        ...typography,
        [key]: val,
      },
    });
  };

  const updateStyleItem = (
    styleKey: keyof ThemeTypography['styles'],
    prop: keyof TypographyScaleItem,
    val: any
  ) => {
    const updatedStyles = {
      ...typography.styles,
      [styleKey]: {
        ...typography.styles[styleKey],
        [prop]: val,
      },
    };
    updateTheme({
      typography: {
        ...typography,
        styles: updatedStyles,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Configure global font families and typographical scale. Changes immediately update all inheriting text elements across all pages.
      </p>

      {/* 1. FONT FAMILIES */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
          Font Families
        </h4>

        {/* Heading Font */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Heading Font</label>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: typography.headingFont }}>
              Aa Preview
            </span>
          </div>
          <select
            value={typography.headingFont}
            onChange={(e) => updateFamily('headingFont', e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Body Font */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Body Font</label>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: typography.bodyFont }}>
              Aa Preview
            </span>
          </div>
          <select
            value={typography.bodyFont}
            onChange={(e) => updateFamily('bodyFont', e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Button Font */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Button Font</label>
          <select
            value={typography.buttonFont || typography.bodyFont}
            onChange={(e) => updateFamily('buttonFont', e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>

        {/* Accent Font */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 500, color: '#334155' }}>Optional Accent Font</label>
          <select
            value={typography.accentFont || typography.headingFont}
            onChange={(e) => updateFamily('accentFont', e.target.value)}
            style={{
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '13px',
              color: '#1e293b',
              backgroundColor: '#ffffff',
              cursor: 'pointer',
            }}
          >
            {FONT_OPTIONS.map((font) => (
              <option key={font.value} value={font.value}>{font.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. GLOBAL TYPOGRAPHY STYLES */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#ffffff',
      }}>
        <div style={{
          padding: '12px 14px',
          backgroundColor: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
        }}>
          <h4 style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
            Global Typography Styles (Scale)
          </h4>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {(Object.keys(STYLE_LABELS) as Array<keyof ThemeTypography['styles']>).map((styleKey) => {
            const item = typography.styles?.[styleKey];
            if (!item) return null;

            const isExpanded = activeStyleKey === styleKey;
            const meta = STYLE_LABELS[styleKey];

            return (
              <div key={styleKey} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <div
                  onClick={() => setActiveStyleKey(isExpanded ? null : styleKey)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    backgroundColor: isExpanded ? '#f8fafc' : '#ffffff',
                    userSelect: 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                      {meta.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {item.fontSize}px / {item.fontWeight}
                    </span>
                  </div>
                  {isExpanded ? <ChevronDown size={15} color="#64748b" /> : <ChevronRight size={15} color="#64748b" />}
                </div>

                {isExpanded && (
                  <div style={{
                    padding: '12px 14px 16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    backgroundColor: '#fafbfc',
                  }}>
                    <p style={{ margin: 0, fontSize: '11px', color: '#64748b' }}>
                      {meta.desc}
                    </p>

                    {/* Font Size */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', color: '#475569' }}>Font Size</label>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="72"
                        value={item.fontSize}
                        onChange={(e) => updateStyleItem(styleKey, 'fontSize', parseInt(e.target.value))}
                        style={{ accentColor: 'var(--primary, #2563eb)' }}
                      />
                    </div>

                    {/* Font Weight */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '12px', color: '#475569' }}>Font Weight</label>
                      <select
                        value={item.fontWeight}
                        onChange={(e) => updateStyleItem(styleKey, 'fontWeight', parseInt(e.target.value))}
                        style={{
                          padding: '6px 8px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          fontSize: '12px',
                          color: '#1e293b',
                          backgroundColor: '#ffffff',
                        }}
                      >
                        <option value="300">300 - Light</option>
                        <option value="400">400 - Regular</option>
                        <option value="500">500 - Medium</option>
                        <option value="600">600 - Semi Bold</option>
                        <option value="700">700 - Bold</option>
                        <option value="800">800 - Extra Bold</option>
                      </select>
                    </div>

                    {/* Line Height */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', color: '#475569' }}>Line Height</label>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.lineHeight}</span>
                      </div>
                      <input
                        type="range"
                        min="0.9"
                        max="2.0"
                        step="0.05"
                        value={item.lineHeight}
                        onChange={(e) => updateStyleItem(styleKey, 'lineHeight', parseFloat(e.target.value))}
                        style={{ accentColor: 'var(--primary, #2563eb)' }}
                      />
                    </div>

                    {/* Letter Spacing */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <label style={{ fontSize: '12px', color: '#475569' }}>Letter Spacing</label>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>{item.letterSpacing}px</span>
                      </div>
                      <input
                        type="range"
                        min="-2"
                        max="6"
                        step="0.2"
                        value={item.letterSpacing}
                        onChange={(e) => updateStyleItem(styleKey, 'letterSpacing', parseFloat(e.target.value))}
                        style={{ accentColor: 'var(--primary, #2563eb)' }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

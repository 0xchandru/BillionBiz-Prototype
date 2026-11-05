import React from 'react';
import { useSiteStore } from '../../../../store/siteStore';
import { getThemeSpacing } from '../themePresets';

const fields = [
  {
    key: 'sectionY' as const,
    label: 'Section vertical spacing',
    description: 'Default space above and below storefront sections.',
    min: 0,
    max: 180,
    step: 4,
    unit: 'px'
  },
  {
    key: 'contentGap' as const,
    label: 'Content gap',
    description: 'Default distance between related content elements.',
    min: 0,
    max: 96,
    step: 2,
    unit: 'px'
  },
  {
    key: 'gridGap' as const,
    label: 'Grid gap',
    description: 'Space between cards in product and collection grids.',
    min: 0,
    max: 64,
    step: 2,
    unit: 'px'
  },
  {
    key: 'cardPadding' as const,
    label: 'Card padding',
    description: 'Default internal spacing for cards and grouped surfaces.',
    min: 0,
    max: 64,
    step: 2,
    unit: 'px'
  },
  {
    key: 'containerMaxWidth' as const,
    label: 'Content maximum width',
    description: 'Maximum width for centered page content.',
    min: 960,
    max: 1800,
    step: 20,
    unit: 'px'
  }
];

export const SpacingPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const spacing = getThemeSpacing(theme);

  const update = (key: keyof typeof spacing, value: number) => {
    updateTheme({
      spacing: {
        ...spacing,
        [key]: value
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
      <div style={{
        padding: 13,
        borderRadius: 10,
        border: '1px solid #dbeafe',
        background: '#eff6ff',
        color: '#1e40af',
        fontSize: 11,
        lineHeight: 1.55
      }}>
        These are global layout tokens. Sections and blocks inherit them unless they have an explicit local spacing override. Changing a token does not erase those local overrides.
      </div>

      {fields.map((field) => (
        <section key={field.key} style={{
          padding: 14,
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          background: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: 9
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{field.label}</div>
              <p style={{ margin: '4px 0 0', fontSize: 10.5, color: '#64748b', lineHeight: 1.5 }}>{field.description}</p>
            </div>
            <output style={{
              flexShrink: 0,
              padding: '5px 8px',
              borderRadius: 7,
              background: '#f1f5f9',
              color: '#0f172a',
              fontFamily: 'ui-monospace, monospace',
              fontSize: 11,
              fontWeight: 700
            }}>
              {spacing[field.key]}{field.unit}
            </output>
          </div>
          <input
            type="range"
            min={field.min}
            max={field.max}
            step={field.step}
            value={spacing[field.key]}
            onChange={(event) => update(field.key, Number(event.target.value))}
            aria-label={field.label}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8', fontSize: 10 }}>
            <span>{field.min}{field.unit}</span>
            <span>{field.max}{field.unit}</span>
          </div>
        </section>
      ))}

      <div style={{ padding: 13, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ fontSize: 11, color: '#475569', fontWeight: 700, marginBottom: 9 }}>Layout rhythm preview</div>
        <div style={{
          padding: spacing.sectionY / 3,
          borderRadius: 9,
          background: '#e2e8f0'
        }}>
          <div style={{
            height: 14,
            maxWidth: spacing.containerMaxWidth / 18,
            borderRadius: 4,
            background: '#64748b',
            margin: '0 auto 8px'
          }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: Math.min(spacing.gridGap / 4, 12) }}>
            {[0, 1, 2].map((item) => (
              <div key={item} style={{
                height: Math.max(18, spacing.cardPadding),
                background: '#fff',
                borderRadius: 5,
                border: '1px solid #cbd5e1'
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpacingPanel;

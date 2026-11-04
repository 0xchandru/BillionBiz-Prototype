import React from 'react';
import { CollapsibleGroup } from './CollapsibleGroup';

interface AdvancedValue {
  sectionId?: string;
  cssClass?: string;
  anchorId?: string;
  animation?: string;
  animationDelay?: number;
  animationEnabled?: boolean;
}

interface AdvancedEditorProps {
  value: AdvancedValue;
  onChange: (value: AdvancedValue) => void;
}

const Toggle: React.FC<{ value: boolean; onChange: (v: boolean) => void }> = ({ value, onChange }) => (
  <button
    onClick={() => onChange(!value)}
    style={{
      width: '44px', height: '24px', borderRadius: '12px',
      backgroundColor: value ? 'var(--primary)' : '#e2e8f0',
      border: 'none', cursor: 'pointer', position: 'relative',
      transition: 'background-color 0.2s', padding: 0, flexShrink: 0,
    }}
  >
    <div style={{
      width: '18px', height: '18px', borderRadius: '50%', backgroundColor: 'white',
      position: 'absolute', top: '3px',
      left: value ? '23px' : '3px',
      transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
    }} />
  </button>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  fontSize: '13px',
  fontFamily: 'inherit',
  backgroundColor: '#f8fafc',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export const AdvancedEditor: React.FC<AdvancedEditorProps> = ({
  value = {},
  onChange,
}) => {
  const handleChange = (key: keyof AdvancedValue, val: any) => {
    onChange({ ...value, [key]: val });
  };

  const animationOptions = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-left', label: 'Slide from Left' },
    { value: 'slide-right', label: 'Slide from Right' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'bounce', label: 'Bounce' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {/* Identifiers */}
      <CollapsibleGroup label="Identifiers">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Section ID</span>
          <input
            type="text"
            value={value.sectionId || ''}
            onChange={(e) => handleChange('sectionId', e.target.value)}
            placeholder="e.g., hero-section"
            style={inputStyle}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Unique identifier for targeting with scripts or styles.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>CSS Class</span>
          <input
            type="text"
            value={value.cssClass || ''}
            onChange={(e) => handleChange('cssClass', e.target.value)}
            placeholder="e.g., custom-hero"
            style={inputStyle}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Add custom CSS classes for additional styling.
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Anchor ID</span>
          <input
            type="text"
            value={value.anchorId || ''}
            onChange={(e) => handleChange('anchorId', e.target.value)}
            placeholder="e.g., about-us"
            style={inputStyle}
          />
          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
            Allows linking directly to this section (e.g., #about-us).
          </span>
        </div>
      </CollapsibleGroup>

      {/* Animation */}
      <CollapsibleGroup label="Animation">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '4px',
        }}>
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-main)' }}>
            Enable Animation
          </span>
          <Toggle
            value={value.animationEnabled ?? false}
            onChange={(v) => handleChange('animationEnabled', v)}
          />
        </div>

        {value.animationEnabled && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>Entrance Animation</span>
              <select
                value={value.animation || 'none'}
                onChange={(e) => handleChange('animation', e.target.value)}
                style={{
                  ...inputStyle,
                  cursor: 'pointer',
                }}
              >
                {animationOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Animation Delay
                </span>
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {value.animationDelay || 0}ms
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={2000}
                step={100}
                value={value.animationDelay || 0}
                onChange={(e) => handleChange('animationDelay', parseInt(e.target.value))}
                style={{ accentColor: 'var(--primary)' }}
              />
            </div>
          </>
        )}
      </CollapsibleGroup>
    </div>
  );
};

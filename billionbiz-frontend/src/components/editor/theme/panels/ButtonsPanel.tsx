import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useSiteStore } from '../../../../store/siteStore';
import type { ThemeButtons } from '../themePresets';
import { ColorPickerPopover } from '../../ui/ColorPickerPopover';

export const ButtonsPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const buttons = theme.buttons;
  const [activeGroup, setActiveGroup] = useState<'primary' | 'secondary' | 'states'>('primary');

  const updatePrimary = (key: keyof ThemeButtons['primary'], val: any) => {
    updateTheme({
      buttons: {
        ...buttons,
        primary: {
          ...buttons.primary,
          [key]: val,
        },
      },
    });
  };

  const updateSecondary = (key: keyof ThemeButtons['secondary'], val: any) => {
    updateTheme({
      buttons: {
        ...buttons,
        secondary: {
          ...buttons.secondary,
          [key]: val,
        },
      },
    });
  };

  const updateStates = (key: keyof ThemeButtons['states'], val: any) => {
    updateTheme({
      buttons: {
        ...buttons,
        states: {
          ...buttons.states,
          [key]: val,
        },
      },
    });
  };

  const setShape = (shape: ThemeButtons['shape']) => {
    const radiusMap: Record<ThemeButtons['shape'], string> = {
      square: '0px',
      rounded: '8px',
      pill: '9999px',
    };
    const radius = radiusMap[shape];
    updateTheme({
      buttons: {
        ...buttons,
        shape,
        primary: {
          ...buttons.primary,
          borderRadius: radius,
        },
        secondary: {
          ...buttons.secondary,
          borderRadius: radius,
        },
      },
    });
  };

  const setStyle = (style: ThemeButtons['style']) => {
    updateTheme({
      buttons: {
        ...buttons,
        style,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Customize global primary and secondary button styling, states, shapes, and borders.
      </p>

      {/* LIVE BUTTON PREVIEW */}
      <div style={{
        padding: '20px 16px',
        borderRadius: '12px',
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Interactive Button Preview
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {/* Primary Button Preview */}
          <button
            style={{
              backgroundColor: buttons.style === 'outline' || buttons.style === 'ghost' ? 'transparent' : buttons.primary.bg,
              color: buttons.style === 'outline' || buttons.style === 'ghost' ? buttons.primary.bg : buttons.primary.text,
              border: buttons.style === 'ghost' ? '1px solid transparent' : buttons.primary.border,
              borderRadius: buttons.primary.borderRadius,
              fontWeight: buttons.primary.fontWeight,
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: buttons.states.hoverLift ? '0 4px 10px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Primary Action
          </button>

          {/* Secondary Button Preview */}
          <button
            style={{
              backgroundColor: buttons.secondary.bg,
              color: buttons.secondary.text,
              border: buttons.secondary.border,
              borderRadius: buttons.secondary.borderRadius,
              fontWeight: 500,
              padding: '10px 20px',
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Secondary Action
          </button>
        </div>
      </div>

      {/* BUTTON SHAPE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Global Button Shape</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
        }}>
          {(['square', 'rounded', 'pill'] as const).map((shape) => {
            const isSelected = buttons.shape === shape;
            return (
              <button
                key={shape}
                onClick={() => setShape(shape)}
                style={{
                  padding: '8px',
                  borderRadius: shape === 'square' ? '2px' : shape === 'rounded' ? '6px' : '20px',
                  border: isSelected ? '2px solid var(--primary, #2563eb)' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {shape}
              </button>
            );
          })}
        </div>
      </div>

      {/* BUTTON STYLE */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>Global Button Style</label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr',
          gap: '6px',
        }}>
          {(['filled', 'outline', 'ghost', 'soft'] as const).map((s) => {
            const isSelected = buttons.style === s;
            return (
              <button
                key={s}
                onClick={() => setStyle(s)}
                style={{
                  padding: '8px 4px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid var(--primary, #2563eb)' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                {s}
              </button>
            );
          })}
        </div>
      </div>

      {/* 1. PRIMARY BUTTON SETTINGS */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => setActiveGroup(activeGroup === 'primary' ? ('' as any) : 'primary')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Primary Button</span>
          {activeGroup === 'primary' ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
        </div>
        {activeGroup === 'primary' && (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
            {/* Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorPickerPopover
                  value={buttons.primary.bg}
                  onChange={(v) => updatePrimary('bg', v)}
                  size="sm"
                />
                <span style={{ fontSize: '13px', color: '#334155' }}>Background</span>
              </div>
              <input
                type="text"
                value={buttons.primary.bg}
                onChange={(e) => updatePrimary('bg', e.target.value)}
                style={{ width: '78px', padding: '4px 6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            {/* Text Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorPickerPopover
                  value={buttons.primary.text}
                  onChange={(v) => updatePrimary('text', v)}
                  size="sm"
                />
                <span style={{ fontSize: '13px', color: '#334155' }}>Text Color</span>
              </div>
              <input
                type="text"
                value={buttons.primary.text}
                onChange={(e) => updatePrimary('text', e.target.value)}
                style={{ width: '78px', padding: '4px 6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            {/* Border */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Border</span>
              <input
                type="text"
                value={buttons.primary.border}
                onChange={(e) => updatePrimary('border', e.target.value)}
                placeholder="1px solid #2563eb"
                style={{ width: '130px', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            {/* Border Radius */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Border Radius</span>
              <input
                type="text"
                value={buttons.primary.borderRadius}
                onChange={(e) => updatePrimary('borderRadius', e.target.value)}
                placeholder="8px"
                style={{ width: '74px', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            {/* Font Weight */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Font Weight</span>
              <select
                value={buttons.primary.fontWeight}
                onChange={(e) => updatePrimary('fontWeight', parseInt(e.target.value))}
                style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #cbd5e1', fontSize: '12px' }}
              >
                <option value="400">400 - Regular</option>
                <option value="500">500 - Medium</option>
                <option value="600">600 - Semi Bold</option>
                <option value="700">700 - Bold</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 2. SECONDARY BUTTON SETTINGS */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => setActiveGroup(activeGroup === 'secondary' ? ('' as any) : 'secondary')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Secondary Button</span>
          {activeGroup === 'secondary' ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
        </div>
        {activeGroup === 'secondary' && (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
            {/* Background */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorPickerPopover
                  value={buttons.secondary.bg}
                  onChange={(v) => updateSecondary('bg', v)}
                  size="sm"
                />
                <span style={{ fontSize: '13px', color: '#334155' }}>Background</span>
              </div>
              <input
                type="text"
                value={buttons.secondary.bg}
                onChange={(e) => updateSecondary('bg', e.target.value)}
                style={{ width: '78px', padding: '4px 6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            {/* Text Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorPickerPopover
                  value={buttons.secondary.text}
                  onChange={(v) => updateSecondary('text', v)}
                  size="sm"
                />
                <span style={{ fontSize: '13px', color: '#334155' }}>Text Color</span>
              </div>
              <input
                type="text"
                value={buttons.secondary.text}
                onChange={(e) => updateSecondary('text', e.target.value)}
                style={{ width: '78px', padding: '4px 6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            {/* Border */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Border</span>
              <input
                type="text"
                value={buttons.secondary.border}
                onChange={(e) => updateSecondary('border', e.target.value)}
                placeholder="1px solid #e2e8f0"
                style={{ width: '130px', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>

            {/* Border Radius */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Border Radius</span>
              <input
                type="text"
                value={buttons.secondary.borderRadius}
                onChange={(e) => updateSecondary('borderRadius', e.target.value)}
                placeholder="8px"
                style={{ width: '74px', padding: '4px 6px', fontSize: '12px', border: '1px solid #cbd5e1', borderRadius: '4px' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 3. BUTTON STATES */}
      <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
        <div
          onClick={() => setActiveGroup(activeGroup === 'states' ? ('' as any) : 'states')}
          style={{
            padding: '10px 14px',
            backgroundColor: '#f8fafc',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            userSelect: 'none',
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Button States</span>
          {activeGroup === 'states' ? <ChevronDown size={16} color="#64748b" /> : <ChevronRight size={16} color="#64748b" />}
        </div>
        {activeGroup === 'states' && (
          <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
            {/* Hover Lift */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: '#334155' }}>Hover Lift Effect</span>
              <input
                type="checkbox"
                checked={buttons.states.hoverLift}
                onChange={(e) => updateStates('hoverLift', e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary, #2563eb)' }}
              />
            </div>

            {/* Focus Ring Color */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ColorPickerPopover
                  value={buttons.states.focusRingColor}
                  onChange={(v) => updateStates('focusRingColor', v)}
                  size="sm"
                />
                <span style={{ fontSize: '13px', color: '#334155' }}>Focus Ring</span>
              </div>
              <input
                type="text"
                value={buttons.states.focusRingColor}
                onChange={(e) => updateStates('focusRingColor', e.target.value)}
                style={{ width: '78px', padding: '4px 6px', fontSize: '12px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            {/* Pressed Scale */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#334155' }}>Pressed Scale</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{buttons.states.pressedScale}</span>
              </div>
              <input
                type="range"
                min="0.9"
                max="1.0"
                step="0.01"
                value={buttons.states.pressedScale}
                onChange={(e) => updateStates('pressedScale', parseFloat(e.target.value))}
                style={{ accentColor: 'var(--primary, #2563eb)' }}
              />
            </div>

            {/* Disabled Opacity */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#334155' }}>Disabled Opacity</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{buttons.states.disabledOpacity}</span>
              </div>
              <input
                type="range"
                min="0.2"
                max="0.8"
                step="0.05"
                value={buttons.states.disabledOpacity}
                onChange={(e) => updateStates('disabledOpacity', parseFloat(e.target.value))}
                style={{ accentColor: 'var(--primary, #2563eb)' }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

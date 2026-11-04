import React from 'react';
import { useSiteStore } from '../../../../store/siteStore';
import type { ThemeEffects } from '../themePresets';

export const EffectsPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const effects = theme.effects;

  const updateEffectProp = <K extends keyof ThemeEffects>(key: K, val: ThemeEffects[K]) => {
    updateTheme({
      effects: {
        ...effects,
        [key]: val,
      },
      ui: {
        ...theme.ui,
        borderRadius: key === 'borderRadius' ? (val as string) : theme.ui.borderRadius,
        shadow: key === 'shadow' ? (val as string) : theme.ui.shadow,
      },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
        Configure site-wide visual effects, shadows, transitions, and hover animations.
      </p>

      {/* 1. DEFAULT BORDER RADIUS */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Default Border Radius
        </label>
        <select
          value={effects.borderRadius}
          onChange={(e) => updateEffectProp('borderRadius', e.target.value)}
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
          <option value="0px">Sharp (0px)</option>
          <option value="4px">Subtle (4px)</option>
          <option value="8px">Rounded (8px)</option>
          <option value="12px">Smooth (12px)</option>
          <option value="16px">Extra Rounded (16px)</option>
          <option value="24px">Soft (24px)</option>
          <option value="9999px">Pill (9999px)</option>
        </select>
      </div>

      {/* 2. DEFAULT SHADOW */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Default Shadow
        </label>
        <select
          value={effects.shadow}
          onChange={(e) => updateEffectProp('shadow', e.target.value)}
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
          <option value="none">None</option>
          <option value="0 1px 3px 0 rgb(0 0 0 / 0.1)">Subtle (sm)</option>
          <option value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Medium (md)</option>
          <option value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Large (lg)</option>
          <option value="0 20px 25px -5px rgb(0 0 0 / 0.1)">Elevated (xl)</option>
        </select>
      </div>

      {/* 3. DEFAULT TRANSITION */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Default Transition
        </label>
        <select
          value={effects.transition}
          onChange={(e) => updateEffectProp('transition', e.target.value)}
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
          <option value="all 0.15s ease">Fast (150ms)</option>
          <option value="all 0.2s cubic-bezier(0.16, 1, 0.3, 1)">Normal (200ms)</option>
          <option value="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)">Smooth (300ms)</option>
          <option value="all 0.4s ease-out">Deliberate (400ms)</option>
        </select>
      </div>

      {/* 4. GLOBAL HOVER BEHAVIOR */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Global Hover Behavior
        </label>
        <select
          value={effects.hoverBehavior}
          onChange={(e) => updateEffectProp('hoverBehavior', e.target.value as any)}
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
          <option value="lift">Lift (Elevates on hover)</option>
          <option value="scale">Scale (Gentle scale-up)</option>
          <option value="glow">Glow (Border / shadow glow)</option>
          <option value="none">None (Static)</option>
        </select>
      </div>

      {/* 5. GLOBAL ANIMATION STYLE */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Global Animation Style
        </label>
        <select
          value={effects.animationStyle}
          onChange={(e) => updateEffectProp('animationStyle', e.target.value as any)}
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
          <option value="smooth">Smooth (Eased reveal)</option>
          <option value="snappy">Snappy (Fast spring)</option>
          <option value="fade">Fade (Opacity crossfade)</option>
          <option value="none">None (Instant)</option>
        </select>
      </div>

      {/* 6. GLOBAL ANIMATION SPEED */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <label style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
          Global Animation Speed
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
        }}>
          {(['fast', 'normal', 'slow'] as const).map((spd) => {
            const isSelected = effects.animationSpeed === spd;
            return (
              <button
                key={spd}
                onClick={() => updateEffectProp('animationSpeed', spd)}
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: isSelected ? '2px solid var(--primary, #2563eb)' : '1px solid #cbd5e1',
                  backgroundColor: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#1d4ed8' : '#334155',
                  fontSize: '12px',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                }}
              >
                {spd}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

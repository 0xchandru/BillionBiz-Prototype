import React, { useState } from 'react';
import { CheckCircle2, Circle, Sparkles } from 'lucide-react';
import { useSiteStore } from '../../../../store/siteStore';
import { themePresets } from '../themePresets';
import { isThemeModified } from '../themeDefaultChecker';

export const ThemesPanel: React.FC = () => {
  const { theme, updateTheme } = useSiteStore();
  const [pendingPresetKey, setPendingPresetKey] = useState<string | null>(null);

  const isModified = isThemeModified(theme);

  const handleSelectPreset = (presetKey: string) => {
    const selected = themePresets[presetKey];
    if (selected) {
      updateTheme({
        presetName: selected.presetName,
        description: selected.description,
        palette: JSON.parse(JSON.stringify(selected.palette)),
        typography: JSON.parse(JSON.stringify(selected.typography)),
        buttons: JSON.parse(JSON.stringify(selected.buttons)),
        effects: JSON.parse(JSON.stringify(selected.effects)),
        colors: { ...selected.colors },
        ui: { ...selected.ui },
      }, true);
    }
  };

  const handleCardClick = (presetKey: string) => {
    if (theme.presetName === presetKey) return;
    if (isModified) {
      setPendingPresetKey(presetKey);
    } else {
      handleSelectPreset(presetKey);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Current Preset Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 14px',
        backgroundColor: '#f8fafc',
        borderRadius: '10px',
        border: '1px solid #e2e8f0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} style={{ color: 'var(--primary, #2563eb)' }} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>
            Theme: <strong style={{ color: '#0f172a' }}>{theme.presetName || 'Modern'}</strong>
            {isModified && (
              <span style={{
                marginLeft: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#b45309',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                padding: '2px 7px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                • Modified
              </span>
            )}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>
          Choose a theme preset to update global color palette, typography, buttons, and effects. Section overrides will be preserved.
        </p>
      </div>

      {/* Presets List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {Object.entries(themePresets).map(([key, preset]) => {
          const isActive = theme.presetName === preset.presetName;
          const p = preset.palette;

          return (
            <div
              key={key}
              onClick={() => handleCardClick(key)}
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                border: isActive ? '2px solid var(--primary, #2563eb)' : '1px solid #e2e8f0',
                backgroundColor: isActive ? '#f0f7ff' : '#ffffff',
                boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                cursor: 'pointer',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#93c5fd';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.borderColor = '#e2e8f0';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      {preset.presetName}
                    </h4>
                    {isActive && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          backgroundColor: '#2563eb',
                          color: '#ffffff',
                          padding: '2px 7px',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.4px'
                        }}>
                          Active
                        </span>
                        {isModified && (
                          <span style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            backgroundColor: '#fef3c7',
                            color: '#b45309',
                            border: '1px solid #fde68a',
                            padding: '1px 6px',
                            borderRadius: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.4px'
                          }}>
                            Modified
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>
                    {preset.description}
                  </p>
                </div>
                {isActive ? (
                  <CheckCircle2 size={18} style={{ color: 'var(--primary, #2563eb)', flexShrink: 0, marginTop: '2px' }} />
                ) : (
                  <Circle size={18} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: '2px' }} />
                )}
              </div>

              {/* Preview preview chips */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '6px',
                borderTop: '1px solid #f1f5f9'
              }}>
                {/* Font sample */}
                <span style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  fontFamily: preset.typography.headingFont,
                  color: p.brand.primary
                }}>
                  {preset.typography.headingFont.split(',')[0]}
                </span>

                {/* Color swatches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div title="Primary" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: p.brand.primary, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div title="Secondary" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: p.brand.secondary, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div title="Accent" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: p.brand.accent, border: '1px solid rgba(0,0,0,0.1)' }} />
                  <div title="Background" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: p.background.background, border: '1px solid #cbd5e1' }} />
                  <div title="Text" style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: p.text.heading, border: '1px solid rgba(0,0,0,0.1)' }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {pendingPresetKey && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            padding: '24px',
            maxWidth: '380px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            border: '1px solid #e2e8f0',
          }}>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 600, color: '#0f172a' }}>
                Apply new theme?
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.5 }}>
                This will replace your current theme customizations.
              </p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setPendingPresetKey(null)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f1f5f9';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  handleSelectPreset(pendingPresetKey);
                  setPendingPresetKey(null);
                }}
                style={{
                  padding: '8px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--primary, #2563eb)',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.3)',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2563eb';
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

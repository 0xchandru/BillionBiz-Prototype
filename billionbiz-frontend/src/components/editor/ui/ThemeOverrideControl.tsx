import React, { useState } from 'react';
import { RotateCcw, Sparkles, SlidersHorizontal } from 'lucide-react';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';
import { getSectionDefaultToken, type ThemeOverrideMode } from '../theme/themeResolver';
import { ColorPickerPopover } from './ColorPickerPopover';

interface ThemeOverrideControlProps {
  label: string;
  value: any;
  onChange: (newValue: any) => void;
  isBackground?: boolean;
  fieldKey?: string;
  sectionType?: string;
}

const GRADIENT_PRESETS = [
  { name: 'Sunset', css: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)', color1: '#ff7e5f', color2: '#feb47b', angle: '135deg' },
  { name: 'Ocean', css: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)', color1: '#2b5876', color2: '#4e4376', angle: '135deg' },
  { name: 'Berry', css: 'linear-gradient(135deg, #8a2387 0%, #e94057 50%, #f27121 100%)', color1: '#8a2387', color2: '#f27121', angle: '135deg' },
  { name: 'Emerald', css: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color1: '#11998e', color2: '#38ef7d', angle: '135deg' },
  { name: 'Violet', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color1: '#667eea', color2: '#764ba2', angle: '135deg' },
  { name: 'Amber', css: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color1: '#f59e0b', color2: '#d97706', angle: '135deg' },
  { name: 'Midnight', css: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color1: '#0f172a', color2: '#1e293b', angle: '135deg' },
];

export const ThemeOverrideControl: React.FC<ThemeOverrideControlProps> = ({
  label,
  value,
  onChange,
  isBackground = false,
  fieldKey = '',
  sectionType,
}) => {
  const { theme } = useSiteStore();
  const defaultPalette = getDefaultTheme().palette;
  const palette = theme?.palette || defaultPalette;

  // Resolve active section-specific default token
  const defaultToken = getSectionDefaultToken(sectionType, fieldKey);

  // Determine actual color for the token path
  const getTokenColor = (palettePath: string): string => {
    const parts = palettePath.split('.');
    if (parts[0] === 'buttons') {
      const b = theme?.buttons || getDefaultTheme().buttons;
      let cur: any = b;
      for (let i = 1; i < parts.length; i++) {
        cur = cur?.[parts[i]];
      }
      if (cur) return cur;
    }
    let current: any = palette;
    let fallback: any = defaultPalette;
    for (const part of parts) {
      current = current?.[part];
      fallback = fallback?.[part];
    }
    if (current) return current;
    if (fallback) return fallback;
    if (palettePath === 'background.footerBg') return '#0f172a';
    if (palettePath === 'text.footerText') return '#ffffff';
    if (palettePath === 'text.inverse') return '#ffffff';
    return '#2563eb';
  };

  const tokenInfo = {
    name: defaultToken.label,
    color: getTokenColor(defaultToken.palettePath),
    tokenVar: defaultToken.tokenVar,
  };

  // Normalize current mode and values
  let currentMode: ThemeOverrideMode = 'inherit';
  let currentColor = tokenInfo.color;
  let currentGradient = {
    type: 'linear' as 'linear' | 'radial',
    color1: palette?.brand?.primary || defaultPalette.brand.primary,
    color2: palette?.brand?.secondary || defaultPalette.brand.secondary,
    angle: '135deg',
    customCss: '',
  };
  let currentImage = {
    url: '',
    position: 'center',
    size: 'cover',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
  };
  let currentVideo = {
    url: '',
    overlayColor: '#000000',
    overlayOpacity: 0.3,
  };

  if (value && typeof value === 'object' && value.mode) {
    currentMode = value.mode;
    if (value.color) currentColor = value.color;
    if (value.gradient) currentGradient = { ...currentGradient, ...value.gradient };
    if (value.gradientCss) currentGradient.customCss = value.gradientCss;
    if (value.image) currentImage = { ...currentImage, ...value.image };
    if (value.video) currentVideo = { ...currentVideo, ...value.video };
  } else if (typeof value === 'string') {
    if (value.startsWith('var(--theme') || value === 'inherit') {
      currentMode = 'inherit';
    } else if (value.includes('gradient')) {
      currentMode = 'gradient';
      currentGradient.customCss = value;
    } else if (value.startsWith('url(')) {
      currentMode = 'image';
    } else if (value.endsWith('.mp4') || value.endsWith('.webm')) {
      currentMode = 'video';
      currentVideo.url = value;
    } else if (value.startsWith('#') || value.startsWith('rgb')) {
      currentMode = 'color';
      currentColor = value;
    }
  }

  const [angleValue, setAngleValue] = useState<number>(
    parseInt(currentGradient.angle?.replace(/[^0-9]/g, '') || '135', 10) || 135
  );

  const handleModeChange = (newMode: ThemeOverrideMode) => {
    if (newMode === 'inherit') {
      onChange({ mode: 'inherit' });
    } else if (newMode === 'color') {
      onChange({ mode: 'color', color: currentColor });
    } else if (newMode === 'gradient') {
      onChange({ 
        mode: 'gradient', 
        gradient: currentGradient,
        gradientCss: currentGradient.customCss || undefined
      });
    } else if (newMode === 'image') {
      onChange({ mode: 'image', image: currentImage });
    } else if (newMode === 'video') {
      onChange({ mode: 'video', video: currentVideo });
    }
  };

  const handleColorChange = (newColor: string) => {
    onChange({
      mode: 'color',
      color: newColor,
    });
  };

  const handleGradientChange = (partial: Partial<typeof currentGradient>) => {
    const updated = { ...currentGradient, ...partial };
    // Clear customCss if editing individual colors or angle to stay in sync
    if (partial.color1 || partial.color2 || partial.angle || partial.type) {
      updated.customCss = '';
    }
    onChange({
      mode: 'gradient',
      gradient: updated,
      gradientCss: updated.customCss || undefined,
    });
  };

  const handleCustomGradientCssChange = (cssString: string) => {
    const updated = { ...currentGradient, customCss: cssString };
    onChange({
      mode: 'gradient',
      gradient: updated,
      gradientCss: cssString,
    });
  };

  const handleAngleChange = (newAngle: number) => {
    setAngleValue(newAngle);
    handleGradientChange({ angle: `${newAngle}deg` });
  };

  const handleImageChange = (partial: Partial<typeof currentImage>) => {
    onChange({
      mode: 'image',
      image: { ...currentImage, ...partial },
    });
  };

  const handleVideoChange = (partial: Partial<typeof currentVideo>) => {
    onChange({
      mode: 'video',
      video: { ...currentVideo, ...partial },
    });
  };

  const handleResetToInherit = () => {
    onChange({ mode: 'inherit' });
  };

  const isOverridden = currentMode !== 'inherit';

  // Compute live rendered gradient CSS for preview
  const renderedGradient = currentGradient.customCss || (
    currentGradient.type === 'radial'
      ? `radial-gradient(circle, ${currentGradient.color1}, ${currentGradient.color2})`
      : `linear-gradient(${currentGradient.angle || '135deg'}, ${currentGradient.color1}, ${currentGradient.color2})`
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      padding: '10px 12px',
      backgroundColor: isOverridden ? '#fffbeb' : '#fafbfc',
      border: isOverridden ? '1px solid #fef3c7' : '1px solid #e2e8f0',
      borderRadius: '8px',
      transition: 'all 0.15s ease',
    }}>
      {/* Header with Label and Source Dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>
            {label}
          </span>
          {isOverridden ? (
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#d97706', display: 'flex', alignItems: 'center', gap: '3px' }}>
              ● Custom ({currentMode})
            </span>
          ) : (
            <span style={{ fontSize: '10px', color: '#2563eb', display: 'flex', alignItems: 'center', gap: '3px' }}>
              ● Inherited
            </span>
          )}
        </div>

        {/* Source Dropdown */}
        <select
          value={currentMode}
          onChange={(e) => handleModeChange(e.target.value as ThemeOverrideMode)}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: currentMode === 'inherit' ? '#2563eb' : '#b45309',
            cursor: 'pointer',
            outline: 'none',
            maxWidth: '160px',
          }}
        >
          <option value="inherit">Inherit</option>
          <option value="color">Custom Color</option>
          {isBackground && <option value="gradient">Custom Gradient</option>}
          {isBackground && <option value="image">Custom Image</option>}
          {isBackground && <option value="video">Custom Video</option>}
        </select>
      </div>

      {/* 1. INHERIT VIEW */}
      {currentMode === 'inherit' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 10px',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          border: '1px dashed #bfdbfe',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
            <Sparkles size={13} style={{ color: '#2563eb', flexShrink: 0 }} />
            <span style={{ fontSize: '11px', color: '#1e40af', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              Following <strong>{tokenInfo.name}</strong>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
              {tokenInfo.color}
            </span>
            <div
              title={`${tokenInfo.name}: ${tokenInfo.color}`}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: tokenInfo.color,
                border: '1px solid rgba(0,0,0,0.15)',
                flexShrink: 0,
              }}
            />
          </div>
        </div>
      )}

      {/* 2. COLOR OVERRIDE VIEW */}
      {currentMode === 'color' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600 }}>
                Custom Color
              </span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>
                Default: {tokenInfo.name} ({tokenInfo.color})
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ColorPickerPopover
                value={currentColor}
                onChange={handleColorChange}
                size="md"
              />
              <input
                type="text"
                value={currentColor || ''}
                onChange={(e) => handleColorChange(e.target.value)}
                placeholder="#000000"
                style={{
                  width: '78px',
                  padding: '5px 6px',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  backgroundColor: '#ffffff',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToInherit}
            title="Reset this property to inherit from global theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#2563eb';
              e.currentTarget.style.borderColor = '#93c5fd';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#475569';
              e.currentTarget.style.borderColor = '#e2e8f0';
            }}
          >
            <RotateCcw size={11} />
            Reset to Inherit
          </button>
        </div>
      )}

      {/* 3. GRADIENT OVERRIDE VIEW */}
      {currentMode === 'gradient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Gradient preview swatch */}
          <div 
            title={renderedGradient}
            style={{
              height: '30px',
              borderRadius: '6px',
              background: renderedGradient,
              border: '1px solid #cbd5e1',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.08)',
            }} 
          />

          {/* Preset Chips */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Gradient Presets
            </span>
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {GRADIENT_PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => {
                    handleGradientChange({ color1: p.color1, color2: p.color2, angle: p.angle, customCss: p.css });
                  }}
                  style={{
                    padding: '2px 6px',
                    fontSize: '10px',
                    borderRadius: '4px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: p.css, display: 'inline-block' }} />
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Type & Angle */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select
              value={currentGradient.type}
              onChange={(e) => handleGradientChange({ type: e.target.value as any })}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#fff' }}
            >
              <option value="linear">Linear</option>
              <option value="radial">Radial</option>
            </select>

            {currentGradient.type === 'linear' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
                <SlidersHorizontal size={12} color="#64748b" />
                <input
                  type="number"
                  min={0}
                  max={360}
                  value={angleValue}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  style={{ width: '46px', padding: '4px 4px', fontSize: '11px', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
                <span style={{ fontSize: '11px', color: '#64748b' }}>deg</span>
                <input
                  type="range"
                  min={0}
                  max={360}
                  value={angleValue}
                  onChange={(e) => handleAngleChange(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb' }}
                />
              </div>
            )}
          </div>

          {/* Color 1 & Color 2 with ColorPickerPopover and direct inputs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ColorPickerPopover
                  value={currentGradient.color1}
                  onChange={(c) => handleGradientChange({ color1: c })}
                  size="sm"
                />
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>Color 1</span>
              </div>
              <input
                type="text"
                value={currentGradient.color1}
                onChange={(e) => handleGradientChange({ color1: e.target.value })}
                style={{ width: '74px', padding: '3px 5px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ColorPickerPopover
                  value={currentGradient.color2}
                  onChange={(c) => handleGradientChange({ color2: c })}
                  size="sm"
                />
                <span style={{ fontSize: '11px', color: '#475569', fontWeight: 500 }}>Color 2</span>
              </div>
              <input
                type="text"
                value={currentGradient.color2}
                onChange={(e) => handleGradientChange({ color2: e.target.value })}
                style={{ width: '74px', padding: '3px 5px', fontSize: '11px', fontFamily: 'monospace', border: '1px solid #cbd5e1', borderRadius: '4px', textAlign: 'center' }}
              />
            </div>
          </div>

          {/* Direct Raw CSS Gradient Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '10px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>
              Direct CSS Gradient Input
            </label>
            <input
              type="text"
              value={currentGradient.customCss || renderedGradient}
              onChange={(e) => handleCustomGradientCssChange(e.target.value)}
              placeholder="linear-gradient(135deg, #2563eb, #4f46e5)"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '5px 8px',
                fontSize: '11px',
                fontFamily: 'monospace',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#334155',
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleResetToInherit}
            title="Reset this property to inherit from global theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <RotateCcw size={11} />
            Reset to Inherit
          </button>
        </div>
      )}

      {/* 4. IMAGE OVERRIDE VIEW */}
      {currentMode === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#475569' }}>Image URL</label>
            <input
              type="text"
              value={currentImage.url}
              onChange={(e) => handleImageChange({ url: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
              }}
            />
          </div>

          {/* Position & Size */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={currentImage.position}
              onChange={(e) => handleImageChange({ position: e.target.value })}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="center">Center</option>
              <option value="top">Top</option>
              <option value="bottom">Bottom</option>
            </select>
            <select
              value={currentImage.size}
              onChange={(e) => handleImageChange({ size: e.target.value })}
              style={{ flex: 1, padding: '4px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            >
              <option value="cover">Cover</option>
              <option value="contain">Contain</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleResetToInherit}
            title="Reset this property to inherit from global theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <RotateCcw size={11} />
            Reset to Inherit
          </button>
        </div>
      )}

      {/* 5. VIDEO OVERRIDE VIEW */}
      {currentMode === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '11px', color: '#475569' }}>Video URL (MP4 / WebM)</label>
            <input
              type="text"
              value={currentVideo.url}
              onChange={(e) => handleVideoChange({ url: e.target.value })}
              placeholder="https://assets.mixkit.co/.../video.mp4"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                fontSize: '12px',
                border: '1px solid #cbd5e1',
                borderRadius: '4px',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#64748b' }}>Overlay Color</label>
              <input
                type="color"
                value={currentVideo.overlayColor || '#000000'}
                onChange={(e) => handleVideoChange({ overlayColor: e.target.value })}
                style={{ width: '100%', height: '28px', padding: 0, border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}
              />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '10px', color: '#64748b' }}>Overlay Opacity ({Math.round((currentVideo.overlayOpacity ?? 0.3) * 100)}%)</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={currentVideo.overlayOpacity ?? 0.3}
                onChange={(e) => handleVideoChange({ overlayOpacity: parseFloat(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetToInherit}
            title="Reset this property to inherit from global theme"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 500,
              color: '#475569',
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <RotateCcw size={11} />
            Reset to Inherit
          </button>
        </div>
      )}
    </div>
  );
};

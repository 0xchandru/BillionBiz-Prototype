import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Image as ImageIcon,
  Video as VideoIcon,
  Check,
  Upload,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';
import { ColorPickerPopover } from '../ui/ColorPickerPopover';

export type ColorMode = 'inherit' | 'color' | 'gradient' | 'image' | 'video';

interface ColorInheritanceControlProps {
  label: string;
  mode?: ColorMode;
  value?: string;
  inheritedColor?: string;
  inheritedTokenName?: string;
  allowedModes?: ColorMode[];
  gradientValue?: string;
  imageUrl?: string;
  imageFit?: 'cover' | 'contain' | 'auto';
  imagePosition?: string;
  imageOpacity?: number;
  videoUrl?: string;
  videoOpacity?: number;
  overlayColor?: string;
  onModeChange: (mode: ColorMode) => void;
  onChange: (value: string) => void;
  onGradientChange?: (gradient: string) => void;
  onImageChange?: (image: string) => void;
  onImageFitChange?: (fit: 'cover' | 'contain' | 'auto') => void;
  onImagePositionChange?: (pos: string) => void;
  onImageOpacityChange?: (opacity: number) => void;
  onVideoChange?: (video: string) => void;
  onVideoOpacityChange?: (opacity: number) => void;
  onOverlayColorChange?: (color: string) => void;
}

const GRADIENT_PRESETS = [
  { name: 'Subtle Dark', value: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)' },
  { name: 'Deep Midnight', value: 'linear-gradient(135deg, #020617 0%, #0f172a 100%)' },
  { name: 'Ocean Mist', value: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' },
  { name: 'Emerald Forest', value: 'linear-gradient(135deg, #059669 0%, #047857 100%)' },
  { name: 'Sunset Glow', value: 'linear-gradient(135deg, #f97316 0%, #db2777 100%)' },
  { name: 'Soft Pearl', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' },
  { name: 'Warm Cream', value: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' },
  { name: 'Glass Frost', value: 'linear-gradient(135deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.4) 100%)' },
];

export const ColorInheritanceControl: React.FC<ColorInheritanceControlProps> = ({
  label,
  mode = 'inherit',
  value,
  inheritedColor: propInheritedColor,
  inheritedTokenName: propInheritedTokenName,
  allowedModes = ['inherit', 'color', 'gradient'],
  gradientValue,
  imageUrl,
  imageFit = 'cover',
  imagePosition = 'center',
  imageOpacity = 100,
  videoUrl,
  videoOpacity = 100,
  overlayColor = 'rgba(0,0,0,0.3)',
  onModeChange,
  onChange,
  onGradientChange,
  onImageChange,
  onImageFitChange,
  onImagePositionChange,
  onImageOpacityChange,
  onVideoChange,
  onVideoOpacityChange,
  onOverlayColorChange,
}) => {
  const { theme } = useSiteStore();
  const defaultPalette = getDefaultTheme().palette;
  const palette = theme?.palette || (theme as any)?.colors || defaultPalette;

  // Resolve fallback inherited token and color if not provided
  const isBg = label.toLowerCase().includes('background') || label.toLowerCase().includes('fill');
  const isBorder = label.toLowerCase().includes('border');
  const isText = label.toLowerCase().includes('text') || label.toLowerCase().includes('font');

  const defaultInheritedColor = isBg
    ? palette.background?.surface || '#ffffff'
    : isBorder
    ? palette.border?.border || '#e2e8f0'
    : isText
    ? palette.text?.heading || '#0f172a'
    : palette.brand?.primary || '#2563eb';

  const defaultTokenName = isBg
    ? 'Theme Surface'
    : isBorder
    ? 'Theme Border'
    : isText
    ? 'Theme Heading Text'
    : 'Brand Primary';

  const resolvedInheritedColor = propInheritedColor || defaultInheritedColor;
  const resolvedTokenName = propInheritedTokenName || defaultTokenName;

  const [showGradientDropdown, setShowGradientDropdown] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
      {/* Label and Mode Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main, #0f172a)' }}>
          {label}
        </span>

        {/* Mode Pills */}
        {allowedModes.length > 1 && (
          <div
            style={{
              display: 'inline-flex',
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              padding: '2px',
              gap: '2px',
              border: '1px solid #e2e8f0',
            }}
          >
            {allowedModes.map((m) => {
              const isActive = mode === m;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => onModeChange(m)}
                  style={{
                    padding: '3px 7px',
                    fontSize: '11px',
                    fontWeight: isActive ? 600 : 500,
                    borderRadius: '4px',
                    border: 'none',
                    backgroundColor: isActive ? '#ffffff' : 'transparent',
                    color: isActive ? '#2563eb' : '#64748b',
                    boxShadow: isActive ? '0 1px 2px rgba(0, 0, 0, 0.08)' : 'none',
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {m === 'inherit' && <Sparkles size={11} />}
                  {m === 'color' && <Palette size={11} />}
                  {m === 'gradient' && <Layers size={11} />}
                  {m === 'image' && <ImageIcon size={11} />}
                  {m === 'video' && <VideoIcon size={11} />}
                  {m}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── 1. INHERIT MODE: Show Inherited Box ─── */}
      {mode === 'inherit' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 12px',
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                backgroundColor: resolvedInheritedColor,
                border: '1px solid rgba(0,0,0,0.15)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
                flexShrink: 0,
              }}
            />
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                {resolvedTokenName}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>
                {resolvedInheritedColor}
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#059669',
              backgroundColor: '#ecfdf5',
              padding: '2px 8px',
              borderRadius: '999px',
              border: '1px solid #a7f3d0',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={11} />
            Inherited
          </span>
        </div>
      )}

      {/* ─── 2. COLOR MODE: Custom Color Picker ─── */}
      {mode === 'color' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
        >
          <ColorPickerPopover
            value={value || resolvedInheritedColor}
            onChange={onChange}
            size="md"
          />
          <div style={{ flex: 1 }}>
            <input
              type="text"
              value={value || resolvedInheritedColor}
              onChange={(e) => onChange(e.target.value)}
              placeholder="#000000"
              style={{
                width: '100%',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#0f172a',
              }}
            />
          </div>
        </div>
      )}

      {/* ─── 3. GRADIENT MODE: Preset & Custom Gradient ─── */}
      {mode === 'gradient' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Gradient Preview & Selector */}
          <div
            onClick={() => setShowGradientDropdown(!showGradientDropdown)}
            style={{
              padding: '10px 12px',
              borderRadius: '8px',
              background: gradientValue || GRADIENT_PRESETS[0].value,
              border: '1px solid #cbd5e1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '40px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <span
              style={{
                fontSize: '12px',
                fontWeight: 600,
                color: '#ffffff',
                textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                backgroundColor: 'rgba(0,0,0,0.3)',
                padding: '2px 8px',
                borderRadius: '4px',
              }}
            >
              Choose Gradient Preset
            </span>
            <ChevronDown size={16} color="#ffffff" style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }} />
          </div>

          {/* Preset Swatches Dropdown */}
          {showGradientDropdown && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '6px',
                padding: '8px',
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              {GRADIENT_PRESETS.map((g) => (
                <button
                  key={g.name}
                  type="button"
                  onClick={() => {
                    if (onGradientChange) onGradientChange(g.value);
                    setShowGradientDropdown(false);
                  }}
                  style={{
                    background: g.value,
                    border: gradientValue === g.value ? '2px solid #2563eb' : '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '8px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.8)',
                  }}
                >
                  {g.name}
                </button>
              ))}
            </div>
          )}

          {/* Custom Gradient String Input */}
          <input
            type="text"
            value={gradientValue || ''}
            onChange={(e) => onGradientChange?.(e.target.value)}
            placeholder="linear-gradient(135deg, #1e293b, #0f172a)"
            style={{
              width: '100%',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '11px',
              fontFamily: 'monospace',
              color: '#0f172a',
            }}
          />
        </div>
      )}

      {/* ─── 4. IMAGE MODE: Image URL, Upload & Sizing ─── */}
      {mode === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              type="text"
              value={imageUrl || ''}
              onChange={(e) => onImageChange?.(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              style={{
                flex: 1,
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '12px',
                color: '#0f172a',
              }}
            />
            <label
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                backgroundColor: '#f1f5f9',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <Upload size={12} />
              Browse
              <input
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      if (ev.target?.result && onImageChange) {
                        onImageChange(ev.target.result as string);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>

          {/* Sizing & Position */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Fit</span>
              <select
                value={imageFit}
                onChange={(e) => onImageFitChange?.(e.target.value as any)}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="cover">Cover (Full bleed)</option>
                <option value="contain">Contain (Fit inside)</option>
                <option value="auto">Auto / Tile</option>
              </select>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b' }}>Position</span>
              <select
                value={imagePosition}
                onChange={(e) => onImagePositionChange?.(e.target.value)}
                style={{ width: '100%', padding: '6px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </div>

          {/* Overlay Tint & Opacity */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Overlay Tint</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ColorPickerPopover
                value={overlayColor}
                onChange={(c) => onOverlayColorChange?.(c)}
                size="sm"
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Opacity {imageOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={imageOpacity}
                onChange={(e) => onImageOpacityChange?.(Number(e.target.value))}
                style={{ width: '70px' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. VIDEO MODE: Video URL & Overlay ─── */}
      {mode === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            type="text"
            value={videoUrl || ''}
            onChange={(e) => onVideoChange?.(e.target.value)}
            placeholder="https://example.com/ambient-loop.mp4"
            style={{
              width: '100%',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              padding: '6px 8px',
              fontSize: '12px',
              color: '#0f172a',
            }}
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <span style={{ fontSize: '11px', color: '#64748b' }}>Overlay Tint</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ColorPickerPopover
                value={overlayColor}
                onChange={(c) => onOverlayColorChange?.(c)}
                size="sm"
              />
              <span style={{ fontSize: '11px', color: '#64748b' }}>Opacity {videoOpacity}%</span>
              <input
                type="range"
                min="0"
                max="100"
                value={videoOpacity}
                onChange={(e) => onVideoOpacityChange?.(Number(e.target.value))}
                style={{ width: '70px' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

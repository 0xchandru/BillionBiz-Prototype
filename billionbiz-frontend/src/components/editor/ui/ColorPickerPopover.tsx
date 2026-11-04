import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Pipette, Check } from 'lucide-react';
import { useSiteStore } from '../../../store/siteStore';
import { getDefaultTheme } from '../theme/themePresets';

interface ColorPickerPopoverProps {
  value?: string;
  onChange: (color: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
}

const COMMON_PRESET_COLORS = [
  // High-utility core neutrals (clean, distinct)
  '#000000', '#1e293b', '#64748b', '#94a3b8', '#cbd5e1', '#e2e8f0', '#ffffff',
  // Warm & vibrant spectrum
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981', '#14b8a6',
  // Cool, rich & deep spectrum
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e', '#78350f'
];

export const ColorPickerPopover: React.FC<ColorPickerPopoverProps> = ({
  value,
  onChange,
  size = 'md',
  className,
  style,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 308,
    isAbove: false,
    arrowLeft: 40,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const hiddenColorInputRef = useRef<HTMLInputElement>(null);

  const { theme } = useSiteStore();
  const defaultPalette = getDefaultTheme().palette;
  const palette = theme?.palette || defaultPalette;

  // 1. Collect all active theme colors
  const rawThemeTokens = [
    { label: 'Primary', color: palette.brand?.primary || '#2563eb' },
    { label: 'Secondary', color: palette.brand?.secondary || '#4f46e5' },
    { label: 'Accent', color: palette.brand?.accent || '#f59e0b' },
    { label: 'Surface', color: palette.background?.surface || '#f8fafc' },
    { label: 'Section Bg', color: palette.background?.sectionBg || '#ffffff' },
    { label: 'Heading', color: palette.text?.heading || '#0f172a' },
    { label: 'Body Text', color: palette.text?.body || '#475569' },
    { label: 'Border', color: palette.border?.border || '#e2e8f0' },
  ];

  // 2. Deduplicate Theme Colors by normalized hex so NO duplicate colors appear
  const uniqueThemeSwatches: { label: string; color: string; aliases: string[] }[] = [];
  const themeHexSet = new Set<string>();

  for (const token of rawThemeTokens) {
    if (!token.color) continue;
    const hex = token.color.toLowerCase().trim();
    const existing = uniqueThemeSwatches.find(s => s.color === hex);
    if (existing) {
      if (!existing.aliases.includes(token.label)) {
        existing.aliases.push(token.label);
        // Combine names like "Surface / Section" or "Heading / Body"
        if (existing.aliases.length === 2) {
          existing.label = `${existing.aliases[0]} / ${existing.aliases[1]}`;
        }
      }
    } else {
      themeHexSet.add(hex);
      uniqueThemeSwatches.push({
        label: token.label,
        color: hex,
        aliases: [token.label],
      });
    }
  }

  // 3. Filter Preset Swatches so they NEVER duplicate any color already in Theme Colors
  const uniquePresetColors = COMMON_PRESET_COLORS.filter(
    (hex) => !themeHexSet.has(hex.toLowerCase().trim())
  );

  // Calculate safe and aligned position inside the viewport
  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();

    // Check if trigger is inside the right sidebar (aside)
    const sidebar = triggerRef.current.closest('aside') || document.querySelector('aside');
    let left = 0;
    let popoverWidth = 308;

    if (sidebar) {
      const sRect = sidebar.getBoundingClientRect();
      // Match sidebar content width with equal 16px margins on both sides
      popoverWidth = Math.min(308, Math.max(260, sRect.width - 24));
      left = sRect.left + (sRect.width - popoverWidth) / 2;
    } else {
      // Outside sidebar (e.g. standalone page or modal)
      popoverWidth = 280;
      left = rect.left;
      if (left + popoverWidth > window.innerWidth - 12) {
        left = window.innerWidth - popoverWidth - 12;
      }
      if (left < 12) left = 12;
    }

    // Measure or estimate popover height
    const popoverHeight = popoverRef.current ? popoverRef.current.offsetHeight : 290;
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 54; // Account for 46px topbar + 8px gap

    let isAbove = false;
    let top = 0;

    // Prefer opening directly below the trigger row if room exists
    if (spaceBelow >= popoverHeight + 8) {
      isAbove = false;
      top = rect.bottom + 8;
    } else if (spaceAbove >= popoverHeight + 8) {
      // Open directly above the trigger row
      isAbove = true;
      top = rect.top - popoverHeight - 8;
    } else {
      // Clamp to whichever side has more space
      if (spaceBelow >= spaceAbove) {
        isAbove = false;
        top = Math.max(54, window.innerHeight - popoverHeight - 12);
      } else {
        isAbove = true;
        top = Math.max(54, rect.top - popoverHeight - 8);
      }
    }

    // Pointer arrow aligned with trigger center
    const triggerCenter = rect.left + rect.width / 2;
    const arrowLeft = Math.max(20, Math.min(popoverWidth - 20, triggerCenter - left));

    setPopoverPos({ top, left, width: popoverWidth, isAbove, arrowLeft });
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Re-adjust position after open when popover DOM node is measured
  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen]);

  // Close on outside click or scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current && 
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleResizeOrScroll = () => {
      updatePosition();
    };

    window.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResizeOrScroll);
    window.addEventListener('scroll', handleResizeOrScroll, true);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResizeOrScroll);
      window.removeEventListener('scroll', handleResizeOrScroll, true);
    };
  }, [isOpen]);

  // Eyedropper API support
  const handleEyeDropper = async () => {
    if (typeof window !== 'undefined' && 'EyeDropper' in window) {
      try {
        const eyeDropper = new (window as any).EyeDropper();
        const result = await eyeDropper.open();
        if (result?.sRGBHex) {
          onChange(result.sRGBHex);
        }
      } catch {
        // User cancelled eyedropper
      }
    } else if (hiddenColorInputRef.current) {
      hiddenColorInputRef.current.click();
    }
  };

  const sizeDimensions = {
    sm: { width: '22px', height: '22px', borderRadius: '4px' },
    md: { width: '28px', height: '28px', borderRadius: '6px' },
    lg: { width: '34px', height: '34px', borderRadius: '8px' },
  }[size];

  const currentColor = value || '#2563eb';

  return (
    <>
      {/* Trigger Swatch Button */}
      <div
        ref={triggerRef}
        onClick={handleToggle}
        className={className}
        title="Click to choose color"
        style={{
          ...sizeDimensions,
          position: 'relative',
          backgroundColor: currentColor,
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'transform 0.1s ease, box-shadow 0.1s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ...style,
        }}
      >
        {/* Subtle inner highlight to make white/light swatches clearly visible */}
        <div style={{
          position: 'absolute',
          inset: 0,
          borderRadius: sizeDimensions.borderRadius,
          boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.06)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Portal-Rendered Color Picker Popover */}
      {isOpen && createPortal(
        <div
          ref={popoverRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.08)',
            zIndex: 999999,
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontFamily: 'Inter, -apple-system, sans-serif',
            animation: 'fadeIn 0.12s ease-out',
            boxSizing: 'border-box',
          }}
        >
          {/* Pointer Arrow */}
          <div
            style={{
              position: 'absolute',
              [popoverPos.isAbove ? 'bottom' : 'top']: '-5px',
              left: `${popoverPos.arrowLeft}px`,
              width: '10px',
              height: '10px',
              backgroundColor: '#ffffff',
              transform: 'translateX(-50%) rotate(45deg)',
              borderLeft: popoverPos.isAbove ? 'none' : '1px solid rgba(0,0,0,0.1)',
              borderTop: popoverPos.isAbove ? 'none' : '1px solid rgba(0,0,0,0.1)',
              borderRight: popoverPos.isAbove ? '1px solid rgba(0,0,0,0.1)' : 'none',
              borderBottom: popoverPos.isAbove ? '1px solid rgba(0,0,0,0.1)' : 'none',
              zIndex: 1,
            }}
          />

          {/* Header Row: Current swatch, Hex input, and Eyedropper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                backgroundColor: currentColor,
                border: '1px solid #cbd5e1',
                boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)',
                flexShrink: 0,
              }}
            />
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                type="text"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  outline: 'none',
                  color: '#1e293b',
                  backgroundColor: '#f8fafc',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
                onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
              />
            </div>
            {/* Eyedropper / Native Picker button */}
            <button
              type="button"
              onClick={handleEyeDropper}
              title="Pick color with eyedropper or system chooser"
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                backgroundColor: '#ffffff',
                color: '#475569',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f1f5f9')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ffffff')}
            >
              <Pipette size={15} />
            </button>
            {/* Hidden native input positioned safely inside portal */}
            <input
              ref={hiddenColorInputRef}
              type="color"
              value={currentColor.startsWith('#') ? currentColor : '#2563eb'}
              onChange={(e) => onChange(e.target.value)}
              style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
            />
          </div>

          {/* Theme Palette Swatches (Clean 2-column layout with no text wrapping) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              Theme Colors
            </span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
              {uniqueThemeSwatches.map((item) => {
                const isSelected = value?.toLowerCase() === item.color.toLowerCase();
                return (
                  <button
                    key={item.color}
                    type="button"
                    onClick={() => onChange(item.color)}
                    title={`${item.aliases.join(' & ')}: ${item.color}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 10px',
                      backgroundColor: isSelected ? '#eff6ff' : '#f8fafc',
                      border: isSelected ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.1s ease',
                      minWidth: 0,
                    }}
                  >
                    <div style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: item.color,
                      border: '1px solid rgba(0,0,0,0.15)',
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#334155',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Standard Color Palette Swatches (Unique & Non-colliding) */}
          {uniquePresetColors.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                Preset Swatches
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px' }}>
                {uniquePresetColors.map((hex) => {
                  const isSelected = value?.toLowerCase() === hex.toLowerCase();
                  return (
                    <div
                      key={hex}
                      onClick={() => onChange(hex)}
                      title={hex}
                      style={{
                        height: '24px',
                        borderRadius: '5px',
                        backgroundColor: hex,
                        border: isSelected ? '2px solid #2563eb' : '1px solid rgba(0,0,0,0.12)',
                        boxShadow: isSelected ? '0 0 0 1px #2563eb' : 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.1s ease, box-shadow 0.1s ease',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.15)')}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                    >
                      {isSelected && (
                        <Check size={12} color={['#ffffff', '#f8fafc', '#f1f5f9', '#e2e8f0', '#fef08a'].includes(hex) ? '#0f172a' : '#ffffff'} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

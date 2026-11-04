import React, { useState } from 'react';
import { Link, Unlink } from 'lucide-react';
import { DeviceSelector, type DeviceType } from './DeviceSelector';

interface SpacingValue {
  top?: number;
  bottom?: number;
  left?: number;
  right?: number;
}

interface ResponsiveSpacingValue {
  desktop?: SpacingValue;
  tablet?: SpacingValue;
  mobile?: SpacingValue;
}

interface SpacingEditorProps {
  label: string;
  value: ResponsiveSpacingValue;
  onChange: (value: ResponsiveSpacingValue) => void;
  showLeftRight?: boolean;
}

export const SpacingEditor: React.FC<SpacingEditorProps> = ({
  label,
  value = {},
  onChange,
  showLeftRight = true,
}) => {
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [linked, setLinked] = useState(false);

  const currentValue: SpacingValue = value[device] || {};

  const handleChange = (side: keyof SpacingValue, val: string) => {
    const numVal = val === '' ? undefined : parseInt(val, 10);

    if (linked) {
      // Apply same value to all sides
      const newSideValue: SpacingValue = {
        top: numVal,
        bottom: numVal,
        ...(showLeftRight ? { left: numVal, right: numVal } : {}),
      };
      onChange({
        ...value,
        [device]: newSideValue,
      });
    } else {
      onChange({
        ...value,
        [device]: {
          ...currentValue,
          [side]: numVal,
        },
      });
    }
  };

  const sides: { key: keyof SpacingValue; label: string }[] = [
    { key: 'top', label: 'Top' },
    { key: 'bottom', label: 'Bottom' },
    ...(showLeftRight
      ? [
          { key: 'left' as const, label: 'Left' },
          { key: 'right' as const, label: 'Right' },
        ]
      : []),
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
    }}>
      {/* Header with device selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{
          fontSize: '13px',
          fontWeight: 600,
          color: 'var(--text-main)',
        }}>
          {label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={() => setLinked(!linked)}
            title={linked ? 'Unlink values' : 'Link all values'}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '6px',
              border: `1px solid ${linked ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: linked ? 'rgba(25, 135, 84, 0.08)' : 'transparent',
              color: linked ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              padding: 0,
            }}
          >
            {linked ? <Link size={12} /> : <Unlink size={12} />}
          </button>
          <DeviceSelector value={device} onChange={setDevice} compact />
        </div>
      </div>

      {/* Spacing inputs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '8px',
      }}>
        {sides.map((side) => (
          <div key={side.key} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <span style={{
              fontSize: '11px',
              color: 'var(--text-muted)',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}>
              {side.label}
            </span>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              overflow: 'hidden',
              backgroundColor: '#f8fafc',
            }}>
              <input
                type="number"
                value={currentValue[side.key] ?? ''}
                onChange={(e) => handleChange(side.key, e.target.value)}
                placeholder="0"
                style={{
                  width: '100%',
                  padding: '8px 4px 8px 10px',
                  border: 'none',
                  outline: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  backgroundColor: 'transparent',
                  fontFamily: 'inherit',
                }}
              />
              <span style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                paddingRight: '8px',
                fontWeight: 500,
              }}>
                px
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simplified spacing editor for section width controls
interface SectionWidthEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const SectionWidthEditor: React.FC<SectionWidthEditorProps> = ({
  value = 'wide',
  onChange,
}) => {
  const widthOptions = [
    { id: 'narrow', label: 'Narrow', desc: '720px' },
    { id: 'standard', label: 'Standard', desc: '1100px' },
    { id: 'wide', label: 'Wide', desc: '1400px' },
    { id: 'full', label: 'Full Width', desc: '100%' },
  ];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <span style={{
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-main)',
      }}>
        Section Width
      </span>
      <div style={{
        display: 'flex',
        borderRadius: '8px',
        border: '1px solid var(--border-color)',
        overflow: 'hidden',
        backgroundColor: '#f8fafc',
      }}>
        {widthOptions.map((opt) => {
          const isActive = value === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => onChange(opt.id)}
              style={{
                flex: 1,
                padding: '10px 6px',
                border: 'none',
                borderRight: '1px solid var(--border-color)',
                backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                color: isActive ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
                <span>{opt.label}</span>
                <span style={{ fontSize: '10px', opacity: 0.8, fontWeight: 400 }}>{opt.desc}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

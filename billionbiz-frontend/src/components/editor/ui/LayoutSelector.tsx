import React from 'react';
import { Check } from 'lucide-react';
import type { SectionLayoutOption } from '../sectionConfigs/types';

interface LayoutSelectorProps {
  layouts: SectionLayoutOption[];
  value: string;
  onChange: (layoutId: string) => void;
}

export const LayoutSelector: React.FC<LayoutSelectorProps> = ({
  layouts,
  value,
  onChange,
}) => {
  // Use grid for 2+ columns, auto-size based on count
  const columns = layouts.length <= 3 ? layouts.length : layouts.length <= 6 ? 3 : 4;

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${Math.min(columns, 2)}, 1fr)`,
      gap: '10px',
    }}>
      {layouts.map((layout) => {
        const isActive = value === layout.id;
        const Icon = layout.icon;
        return (
          <div
            key={layout.id}
            onClick={() => onChange(layout.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 10px',
              borderRadius: '10px',
              border: `2px solid ${isActive ? 'var(--primary)' : 'var(--border-color)'}`,
              backgroundColor: isActive ? 'rgba(25, 135, 84, 0.04)' : '#fafbfc',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              position: 'relative',
              textAlign: 'center',
            }}
          >
            {/* Active check */}
            {isActive && (
              <div style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Check size={11} color="white" strokeWidth={3} />
              </div>
            )}

            {/* Icon or preview */}
            {layout.preview ? (
              <img
                src={layout.preview}
                alt={layout.label}
                style={{
                  width: '100%',
                  height: '48px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  opacity: isActive ? 1 : 0.7,
                }}
              />
            ) : Icon ? (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(25, 135, 84, 0.1)' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}>
                <Icon size={18} />
              </div>
            ) : (
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(25, 135, 84, 0.1)' : '#f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <div style={{
                  width: '20px',
                  height: '14px',
                  border: `2px solid ${isActive ? 'var(--primary)' : '#cbd5e1'}`,
                  borderRadius: '3px',
                }} />
              </div>
            )}

            {/* Label */}
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: isActive ? 'var(--primary)' : 'var(--text-main)',
              lineHeight: '1.3',
            }}>
              {layout.label}
            </span>

            {/* Description */}
            {layout.description && (
              <span style={{
                fontSize: '10px',
                color: 'var(--text-muted)',
                lineHeight: '1.3',
                marginTop: '-4px',
              }}>
                {layout.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

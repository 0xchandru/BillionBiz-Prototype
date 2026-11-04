import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';

interface ThemeResetButtonProps {
  onClick: () => void;
  isDefault: boolean;
  label?: string;
  title?: string;
  size?: 'sm' | 'md';
  style?: React.CSSProperties;
}

export const ThemeResetButton: React.FC<ThemeResetButtonProps> = ({
  onClick,
  isDefault,
  label = 'Reset to default',
  title,
  size = 'md',
  style = {},
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const defaultTitle = isDefault ? 'Already default' : (title || label);
  const isSm = size === 'sm';

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: isSm ? '5px' : '6px',
    padding: isSm ? '4px 9px' : '6px 12px',
    fontSize: isSm ? '11px' : '12px',
    fontWeight: 600,
    borderRadius: '6px',
    border: isDefault
      ? '1px solid #e2e8f0'
      : isHovered
      ? '1px solid #b91c1c'
      : '1px solid #dc2626',
    backgroundColor: isDefault
      ? '#f1f5f9'
      : isHovered
      ? '#b91c1c'
      : '#dc2626',
    color: isDefault ? '#94a3b8' : '#ffffff',
    cursor: isDefault ? 'not-allowed' : 'pointer',
    opacity: isDefault ? 0.55 : 1,
    boxShadow: isDefault
      ? 'none'
      : isHovered
      ? '0 3px 8px rgba(220, 38, 38, 0.35)'
      : '0 2px 4px rgba(220, 38, 38, 0.2)',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    userSelect: 'none',
    flexShrink: 0,
    ...style,
  };

  return (
    <button
      type="button"
      onClick={() => {
        if (!isDefault) {
          onClick();
        }
      }}
      disabled={isDefault}
      title={defaultTitle}
      style={baseStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <RotateCcw
        size={isSm ? 12 : 13}
        style={{
          color: isDefault ? '#94a3b8' : '#ffffff',
          transition: 'transform 0.2s ease',
          transform: isHovered && !isDefault ? 'rotate(-30deg)' : 'none',
        }}
      />
      <span>{label}</span>
    </button>
  );
};

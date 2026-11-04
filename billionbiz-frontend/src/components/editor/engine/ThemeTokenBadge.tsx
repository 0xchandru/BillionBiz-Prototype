// ============================================================
// MASTER EDITOR ENGINE — THEME TOKEN BADGE
// Visual indicator communicating inheritance source
// ("Theme inherited", "Preset inherited", "Custom override") (spec §51).
// ============================================================

import React from 'react';
import { Palette, Sparkles, Sliders, RotateCcw } from 'lucide-react';

export type TokenSource = 'theme' | 'preset' | 'override';

interface ThemeTokenBadgeProps {
  source: TokenSource;
  onReset?: () => void;
  label?: string;
}

export const ThemeTokenBadge: React.FC<ThemeTokenBadgeProps> = ({
  source,
  onReset,
  label,
}) => {
  const getBadgeDetails = () => {
    switch (source) {
      case 'theme':
        return {
          icon: <Palette size={11} color="#6366f1" />,
          text: label || 'Theme inherited',
          bgColor: '#eef2ff',
          textColor: '#4338ca',
          borderColor: '#c7d2fe',
        };
      case 'preset':
        return {
          icon: <Sparkles size={11} color="#059669" />,
          text: label || 'Preset inherited',
          bgColor: '#ecfdf5',
          textColor: '#047857',
          borderColor: '#a7f3d0',
        };
      case 'override':
        return {
          icon: <Sliders size={11} color="#d97706" />,
          text: label || 'Custom override',
          bgColor: '#fffbeb',
          textColor: '#b45309',
          borderColor: '#fde68a',
        };
    }
  };

  const details = getBadgeDetails();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '2px 6px',
        borderRadius: '10px',
        backgroundColor: details.bgColor,
        border: `1px solid ${details.borderColor}`,
        color: details.textColor,
        fontSize: '10px',
        fontWeight: 600,
      }}
    >
      {details.icon}
      <span>{details.text}</span>
      {source === 'override' && onReset && (
        <button
          type="button"
          onClick={onReset}
          title="Reset to inherited theme"
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: details.textColor,
            marginLeft: '2px',
          }}
        >
          <RotateCcw size={10} />
        </button>
      )}
    </div>
  );
};

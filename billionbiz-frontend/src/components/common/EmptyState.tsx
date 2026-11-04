import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: React.CSSProperties;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
  style
}) => {
  const buttonLabel = actionLabel || actionText;
  return (
    <div
      style={{
        padding: '64px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#f1f5f9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#64748b',
          marginBottom: '16px'
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 700, color: '#083e47' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '440px', lineHeight: 1.5 }}>
        {description}
      </p>
      {buttonLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          style={{
            marginTop: '20px',
            padding: '9px 18px',
            borderRadius: '8px',
            backgroundColor: '#083e47',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease',
            border: 'none'
          }}
        >
          {buttonLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;


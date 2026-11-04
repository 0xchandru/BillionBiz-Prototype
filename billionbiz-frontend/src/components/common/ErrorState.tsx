import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  style?: React.CSSProperties;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Unable to Load Data',
  message = 'An unexpected network error or server timeout occurred. Please retry.',
  onRetry,
  style
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #fee2e2',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        ...style
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: '#fee2e2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#dc2626',
          marginBottom: '16px'
        }}
      >
        <AlertCircle size={26} />
      </div>
      <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700, color: '#991b1b' }}>
        {title}
      </h3>
      <p style={{ margin: 0, fontSize: '14px', color: '#64748b', maxWidth: '420px', lineHeight: 1.5 }}>
        {message}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          style={{
            marginTop: '18px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};


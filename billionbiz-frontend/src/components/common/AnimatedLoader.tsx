import React from 'react';
import { Store } from 'lucide-react';

interface AnimatedLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  message = 'Loading...',
  fullScreen = true
}) => {
  return (
    <div
      style={{
        minHeight: fullScreen ? '100vh' : '300px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        color: '#0f172a',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        transition: 'opacity 0.25s ease'
      }}
    >
      <div style={{ position: 'relative', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Outer Rotating Glowing Ring */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#064652',
            borderRightColor: '#2563eb',
            animation: 'bbz-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite'
          }}
        />

        {/* Inner Pulsing Ring */}
        <div
          style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            backgroundColor: 'rgba(6, 70, 82, 0.06)',
            animation: 'bbz-pulse 1.8s ease-in-out infinite'
          }}
        />

        {/* Center Logo Icon */}
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            backgroundColor: '#064652',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: '0 4px 12px rgba(6, 70, 82, 0.25)',
            zIndex: 1
          }}
        >
          <Store size={18} />
        </div>
      </div>

      {message && (
        <span
          style={{
            marginTop: '1.25rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            color: '#475569',
            letterSpacing: '0.02em',
            animation: 'bbz-fade 1.8s ease-in-out infinite alternate'
          }}
        >
          {message}
        </span>
      )}

      {/* Global Animation Keyframes for the Loader */}
      <style>{`
        @keyframes bbz-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes bbz-pulse {
          0%, 100% { transform: scale(0.92); opacity: 0.6; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes bbz-fade {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default AnimatedLoader;


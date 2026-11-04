import React from 'react';
import { parseSubdomain, getPortalUrl } from '../utils/subdomain';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC<{ message?: string }> = ({ message }) => {
  const subInfo = parseSubdomain();

  const getHomeLink = () => {
    switch (subInfo.type) {
      case 'admin':
        return '/dashboard';
      case 'pos':
        return '/pos';
      case 'staff':
        return '/staff';
      case 'ops':
        return '/ops';
      case 'store':
        return '/';
      default:
        return '/';
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        padding: '2rem 1rem',
        color: '#0f172a',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          borderRadius: '20px',
          border: '1px solid #e2e8f0',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ef4444',
            marginBottom: '1.25rem'
          }}
        >
          <AlertCircle size={30} />
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '0.5rem',
            color: '#0f172a'
          }}
        >
          404 - Not Found
        </h1>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#64748b',
            lineHeight: 1.5,
            marginBottom: '1.75rem'
          }}
        >
          {message ||
            'The requested page is not accessible on this domain or does not exist.'}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
          <a
            href={getHomeLink()}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: '#083e47',
              color: '#ffffff',
              borderRadius: '12px',
              fontSize: '0.85rem',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'background-color 0.15s ease'
            }}
          >
            <Home size={16} />
            <span>Return to Home</span>
          </a>

          {subInfo.type !== 'admin' && (
            <a
              href={getPortalUrl('admin', '/login')}
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: '#ffffff',
                color: '#2563eb',
                border: '1px solid #cbd5e1',
                borderRadius: '12px',
                fontSize: '0.85rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <span>Admin Portal</span>
              <ArrowLeft size={16} style={{ transform: 'rotate(180deg)' }} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;

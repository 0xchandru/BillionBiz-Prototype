import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/services';
import { CheckCircle2, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Verification token is missing from the link.');
      setLoading(false);
      return;
    }

    api
      .verifyEmail(token)
      .then(() => {
        setVerified(true);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Verification token is invalid or has expired.');
        setLoading(false);
      });
  }, [token]);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
          padding: '2.5rem 2rem',
          textAlign: 'center'
        }}
      >
        {loading ? (
          <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Loader2 size={36} color="#064652" className="animate-spin" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Verifying your email...</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Please wait while we confirm your cryptographic token.</p>
          </div>
        ) : verified ? (
          <div>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={32} color="#15803d" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Email verified!</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Your email has been confirmed. You now have full store publishing and team invitation permissions.
            </p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: '#064652',
                color: '#ffffff',
                padding: '0.85rem 1.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Continue to dashboard <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <AlertCircle size={32} color="#dc2626" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Verification failed</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              {error}
            </p>
            <Link
              to="/dashboard"
              style={{
                display: 'inline-block',
                backgroundColor: '#064652',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Go to workspace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

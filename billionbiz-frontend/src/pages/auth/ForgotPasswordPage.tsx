import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/services';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = (email || '').trim();
    if (!trimmed) {
      setError('Please enter your registered email address.');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
    if (!emailRegex.test(trimmed) || !trimmed.includes('.')) {
      setError('Please enter a valid email address (e.g. name@example.com).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.forgotPassword(trimmed);
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Unable to process reset request. Please verify your email address.');
    } finally {
      setLoading(false);
    }
  };

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
          padding: '2.5rem 2rem'
        }}
      >
        <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#64748b', fontSize: '0.85rem', textDecoration: 'none', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} /> Back to Sign in
        </Link>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={30} color="#15803d" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Check your email</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              If an account exists for <strong style={{ color: '#334155' }}>{email}</strong>, we have dispatched a password reset link. For your security, the link expires in 15 minutes.
            </p>
            <Link
              to="/login"
              style={{
                display: 'block',
                backgroundColor: '#064652',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none',
                textAlign: 'center'
              }}
            >
              Return to login
            </Link>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Reset your password</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Enter the email associated with your BillionBiz account and we will send a secure 15-minute recovery link.
            </p>

            {error && (
              <div style={{ backgroundColor: '#fef2f2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '0.85rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Registered Email
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@business.com"
                    style={{
                      width: '100%',
                      padding: '0.75rem 0.75rem 0.75rem 2.4rem',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.95rem',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <Mail size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#064652',
                  color: '#ffffff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Sending link...' : 'Send recovery link'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

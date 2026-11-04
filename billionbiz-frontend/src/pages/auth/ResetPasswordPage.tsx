import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../api/services';
import { Lock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (!token) {
      setError('Missing or invalid reset token. Please request a new recovery link.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await api.resetPassword({ token, password });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Reset token has expired or is invalid. Please request a new link.');
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
        {success ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: '54px', height: '54px', borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
              <CheckCircle2 size={30} color="#15803d" />
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Password reset successfully</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.75rem' }}>
              Your password has been updated. You can now sign in with your new credentials.
            </p>
            <Link
              to="/login"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                backgroundColor: '#064652',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '8px',
                fontWeight: 700,
                textDecoration: 'none'
              }}
            >
              Sign in to workspace <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#064652', marginBottom: '0.5rem' }}>Choose new password</h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Enter a strong, unique password to secure your BillionBiz merchant workspace.
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
                  New Password (min 8 chars)
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
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
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '0.4rem' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
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
                  <Lock size={18} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
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
                {loading ? 'Resetting password...' : 'Update password & sign in'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

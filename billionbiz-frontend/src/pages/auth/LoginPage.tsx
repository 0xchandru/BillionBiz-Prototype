import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/services';
import { CountryPhoneInput, COUNTRIES } from '../../components/auth/CountryPhoneInput';
import type { Country } from '../../components/auth/CountryPhoneInput';
import { validateContactInput, validateOtpCode } from '../../utils/validators';
import { initiateGoogleSignIn } from '../../utils/googleAuth';
import { getPortalUrl } from '../../utils/subdomain';
import logoLightBg from '../../assets/logo-light-bg.png';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  MessageSquare
} from 'lucide-react';

type LoginView = 'PASSWORD' | 'OTP_REQUEST' | 'OTP_VERIFY';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUnified, loginGoogle, isAuthenticated, isLoading: isAuthLoading, error: authError, clearError } = useAuthStore();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Current view: PASSWORD (default), OTP_REQUEST (single input), OTP_VERIFY (enter code)
  const [view, setView] = useState<LoginView>('PASSWORD');

  const [searchParams] = useSearchParams();
  const initialIdentifier = searchParams.get('identifier') || (location.state as any)?.identifier || '';

  // Input states — shared across views so entering in phase 1 autofills phase 2!
  const [rawIdentifier, setRawIdentifier] = useState(initialIdentifier);
  const [formattedIdentifier, setFormattedIdentifier] = useState(initialIdentifier);
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // OTP cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  useEffect(() => {
    const idParam = searchParams.get('identifier');
    if (idParam) {
      setRawIdentifier(idParam);
      setFormattedIdentifier(idParam);
    }
  }, [searchParams]);

  const targetIdentifier = (formattedIdentifier || rawIdentifier).trim();

  // 1. Password-based Login Submit
  const handlePasswordLogin = async (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);
    clearError();

    const validation = validateContactInput(rawIdentifier, selectedCountry.code);
    if (!validation.isValid) {
      setUiError(validation.errorMessage || 'Please enter a valid mobile number or email.');
      return;
    }

    if (!password) {
      setUiError('Please enter your password.');
      return;
    }

    const res = await loginUnified(validation.cleanValue, { password });
    if (res.success) {
      navigate(res.destination || from, { replace: true });
    } else if (res.error) {
      setUiError(res.error);
    }
  };

  // 2. Transition from Password view to OTP view (retains entered identifier!)
  const handleOpenOtpView = () => {
    setUiError(null);
    clearError();
    setView('OTP_REQUEST');
  };

  // 3. Request OTP code
  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setUiError(null);
    clearError();

    const validation = validateContactInput(rawIdentifier, selectedCountry.code);
    if (!validation.isValid) {
      setUiError(validation.errorMessage || 'Please enter a valid mobile number or email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.sendOtp({
        identifier: validation.cleanValue,
        type: 'LOGIN'
      });

      setResendCooldown(45);
      setView('OTP_VERIFY');
    } catch (err: any) {
      setUiError(err.message || 'Failed to send OTP code. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. Verify OTP and login
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);
    clearError();

    const otpValidation = validateOtpCode(otpCode);
    if (!otpValidation.isValid) {
      setUiError(otpValidation.errorMessage || 'Please enter the 6-digit verification code.');
      return;
    }

    const contactValidation = validateContactInput(rawIdentifier, selectedCountry.code);
    const identifierToVerify = contactValidation.isValid ? contactValidation.cleanValue : targetIdentifier;

    const res = await loginUnified(identifierToVerify, { otp: otpCode.trim() });
    if (res.success) {
      navigate(res.destination || from, { replace: true });
    } else if (res.error) {
      setUiError(res.error);
    }
  };

  // 5. Google Sign-In Handler
  const handleGoogleAuth = async () => {
    setUiError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await initiateGoogleSignIn(
        async (credential) => {
          const res = await loginGoogle({ credential });
          setIsSubmitting(false);
          if (res.success) {
            navigate(res.destination || from, { replace: true });
          } else if (res.error) {
            setUiError(res.error);
          }
        },
        (err) => {
          setIsSubmitting(false);
          setUiError(err);
        }
      );
    } catch (err: any) {
      setIsSubmitting(false);
      setUiError(err.message || 'Google sign-in could not be completed.');
    }
  };

  return (
    <div className="auth-wrapper">
      {/* Brand Header */}
      <Link to="/" className="auth-brand" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
        <img 
          src={logoLightBg} 
          alt="BillionBiz" 
          style={{ height: '42px', width: 'auto', objectFit: 'contain' }} 
        />
        <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Merchant Portal
        </span>
      </Link>

      {/* Main Login Card */}
      <div className="auth-card">
        {/* Error Alert */}
        {(uiError || authError) && (
          <div className="auth-alert-error">
            <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
            <span>{uiError || authError}</span>
          </div>
        )}

        {/* VIEW 1: MINIMAL SIGN IN (EMAIL/PHONE + PASSWORD) */}
        {view === 'PASSWORD' && (
          <div>
            <div className="auth-card-header">
              <h1 className="auth-card-title">Sign In</h1>
              <p className="auth-card-desc">
                Enter your details to access your merchant account.
              </p>
            </div>

            <form onSubmit={handlePasswordLogin}>
              {/* Email or Phone Input */}
              <div className="auth-form-group">
                <label className="auth-label">Email or Mobile Number</label>
                <CountryPhoneInput
                  value={rawIdentifier}
                  onChange={(raw, _isMail, formatted, country) => {
                    setRawIdentifier(raw);
                    setFormattedIdentifier(formatted);
                    if (country) setSelectedCountry(country);
                  }}
                  onCountryChange={setSelectedCountry}
                  placeholder="Enter your mobile number or email"
                  autoFocus
                />
              </div>

              {/* Password Input */}
              <div className="auth-form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <label className="auth-label" style={{ marginBottom: 0 }}>Password</label>
                  <Link
                    to="/forgot-password"
                    style={{ fontSize: '0.75rem', color: '#2563eb', fontWeight: 500 }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon">
                    <Lock style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="auth-input"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ paddingRight: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
                  >
                    {showPassword ? <EyeOff style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
                  </button>
                </div>
              </div>

              {/* Primary Sign In Button */}
              <button
                type="submit"
                disabled={isAuthLoading || !rawIdentifier.trim() || !password}
                className="auth-btn-primary"
              >
                {isAuthLoading ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16 }} className="animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>

              {/* Sign in with OTP Button below */}
              <button
                type="button"
                onClick={handleOpenOtpView}
                className="auth-btn-secondary"
                style={{ marginTop: '0.75rem' }}
              >
                <MessageSquare style={{ width: 16, height: 16, color: '#2563eb' }} />
                <span>Sign in with OTP</span>
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Or</span>
            </div>

            {/* Continue with Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isAuthLoading}
              className="auth-google-btn"
            >
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* VIEW 2: OTP REQUEST (ONLY ONE INPUT ASKING EMAIL/PHONE — AUTOFILLS FROM VIEW 1) */}
        {view === 'OTP_REQUEST' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setView('PASSWORD');
                setUiError(null);
              }}
              className="auth-back-btn"
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Back to password sign in</span>
            </button>

            <div className="auth-card-header" style={{ marginTop: '0.5rem' }}>
              <h1 className="auth-card-title">Sign in with OTP</h1>
              <p className="auth-card-desc">
                Enter your mobile number or email address to receive a verification code.
              </p>
            </div>

            <form onSubmit={handleSendOtp}>
              {/* Only One Input Field */}
              <div className="auth-form-group">
                <label className="auth-label">Email or Mobile Number</label>
                <CountryPhoneInput
                  value={rawIdentifier}
                  onChange={(raw, _isMail, formatted, country) => {
                    setRawIdentifier(raw);
                    setFormattedIdentifier(formatted);
                    if (country) setSelectedCountry(country);
                  }}
                  onCountryChange={setSelectedCountry}
                  placeholder="Enter your mobile number or email"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !rawIdentifier.trim()}
                className="auth-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16 }} className="animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    Send OTP
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Or</span>
            </div>

            {/* Google Sign-in Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isAuthLoading}
              className="auth-google-btn"
            >
              <svg style={{ width: 18, height: 18 }} viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>
        )}

        {/* VIEW 3: OTP VERIFICATION (ENTER 6-DIGIT CODE) */}
        {view === 'OTP_VERIFY' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setView('OTP_REQUEST');
                setOtpCode('');
                setUiError(null);
              }}
              className="auth-back-btn"
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Change email or phone</span>
            </button>

            <div className="auth-card-header" style={{ marginTop: '0.5rem' }}>
              <h1 className="auth-card-title">Enter Verification Code</h1>
              <p className="auth-card-desc">
                Enter the 6-digit code sent to <strong style={{ color: '#0f172a' }}>{targetIdentifier}</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp}>
              <div className="auth-form-group">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="auth-otp-input"
                  autoFocus
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '0.5rem', color: '#64748b' }}>
                  <span>Code valid for 10 mins</span>
                  <button
                    type="button"
                    disabled={resendCooldown > 0 || isSubmitting}
                    onClick={() => handleSendOtp()}
                    style={{
                      color: resendCooldown > 0 ? '#94a3b8' : '#2563eb',
                      fontWeight: 600,
                      border: 'none',
                      background: 'none',
                      cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isAuthLoading || otpCode.length !== 6}
                className="auth-btn-primary"
              >
                {isAuthLoading ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16 }} className="animate-spin" />
                    Verifying & Signing In...
                  </>
                ) : (
                  <>
                    Verify & Sign In
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Footer: Register Link (Directs strictly to root domain registration) */}
      <p className="auth-footer-link">
        Don't have a store yet?{' '}
        <a href={getPortalUrl('root', '/register')}>Create Store</a>
      </p>
    </div>
  );
}

import { useState, useEffect, useCallback } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../api/services';
import { CountryPhoneInput, COUNTRIES } from '../../components/auth/CountryPhoneInput';
import type { Country } from '../../components/auth/CountryPhoneInput';
import { validateContactInput, validateOtpCode } from '../../utils/validators';
import { initiateGoogleSignIn, decodeGoogleCredential } from '../../utils/googleAuth';
import { redirectToAdminDashboard } from '../../utils/crossDomainAuth';
import { validateSubdomainSlug, PLATFORM_MAIN_DOMAIN } from '../../utils/reservedSubdomains';
import logoLightBg from '../../assets/logo-light-bg.png';
import {
  Store,
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  Globe,
  Sparkles,
  Check
} from 'lucide-react';

type RegisterPhase = 'contact' | 'otp' | 'details' | 'plan';

interface PlanOption {
  id: string;
  name: string;
  price: string;
  period: string;
  badge?: string;
  description: string;
  features: string[];
}

const PLANS: PlanOption[] = [
  {
    id: 'STARTER',
    name: 'Starter Plan',
    price: '₹0',
    period: 'Free 14-day trial',
    description: 'Perfect for new entrepreneurs launching their first storefront.',
    features: [
      `Free subdomain (*.${import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes'})`,
      'Catalog up to 50 items',
      'POS register & cashier terminal',
      'Standard analytics & order tracking'
    ]
  },
  {
    id: 'GROWTH',
    name: 'Growth Plan',
    price: '₹1,499',
    period: '/ month',
    badge: 'Recommended',
    description: 'Most popular for expanding retail and service businesses.',
    features: [
      'Custom domain & priority subdomain',
      'Unlimited products & service bookings',
      'Multi-register POS & staff management',
      'Real-time inventory sync & audit telemetry',
      'Zero platform transaction fees'
    ]
  },
  {
    id: 'ENTERPRISE',
    name: 'Enterprise Plan',
    price: '₹4,999',
    period: '/ month',
    description: 'Advanced capabilities for high-volume, multi-location stores.',
    features: [
      'Multi-warehouse routing & fulfillment',
      'Advanced reporting & financial ledgers',
      'Custom webhook integrations & APIs',
      'Dedicated onboarding & priority SLA'
    ]
  }
];

export default function RegisterPage() {
  const { registerStreamlined, isAuthenticated, isLoading: isStoreLoading, error: storeError, clearError } = useAuthStore();

  // UI status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [quotaNotice, setQuotaNotice] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isSubmitting) {
      redirectToAdminDashboard();
    }
  }, [isAuthenticated, isSubmitting]);

  // Phase flow: contact -> otp -> details -> plan
  const [phase, setPhase] = useState<RegisterPhase>('contact');
  const [isGoogleVerified, setIsGoogleVerified] = useState(false);

  // Phase 1: Contact
  const [rawIdentifier, setRawIdentifier] = useState('');
  const [formattedIdentifier, setFormattedIdentifier] = useState('');
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);

  // Phase 2: OTP
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Phase 3: Store & Account Details
  const [fullName, setFullName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Live Domain Availability State
  const [isCheckingDomain, setIsCheckingDomain] = useState(false);
  const [domainAvailable, setDomainAvailable] = useState<boolean | null>(null);
  const [domainMessage, setDomainMessage] = useState<string>('');

  // Phase 4: Plan Selection
  const [selectedPlan, setSelectedPlan] = useState<string>('GROWTH');

  const targetIdentifier = (formattedIdentifier || rawIdentifier).trim();

  // OTP resend timer countdown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Auto-generate slug when businessName changes if user hasn't manually customized it
  const handleStoreNameChange = (val: string) => {
    setStoreName(val);
    if (!isSlugManuallyEdited) {
      const derived = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setSlug(derived);
    }
  };

  // Real-time debounced domain check
  const checkDomainAvailability = useCallback(async (slugToCheck: string) => {
    const trimmed = (slugToCheck || '').trim().toLowerCase();
    if (!trimmed) {
      setIsCheckingDomain(false);
      setDomainAvailable(null);
      setDomainMessage('');
      return;
    }

    // 1. Instant client-side validation
    const localValidation = validateSubdomainSlug(trimmed);
    if (!localValidation.isValid) {
      setIsCheckingDomain(false);
      setDomainAvailable(false);
      setDomainMessage(localValidation.error || 'Invalid subdomain format');
      return;
    }

    setIsCheckingDomain(true);
    setDomainAvailable(null);
    try {
      const res = await api.checkDomain(localValidation.normalizedSlug);
      setDomainAvailable(res.available);
      setDomainMessage(res.message);
    } catch (err: any) {
      setDomainAvailable(false);
      setDomainMessage(err.message || 'This store subdomain is already taken. Please try another one.');
    } finally {
      setIsCheckingDomain(false);
    }
  }, []);

  useEffect(() => {
    if (phase !== 'details') return;
    if (!slug || slug.trim().length === 0) {
      setDomainAvailable(null);
      setDomainMessage('');
      return;
    }

    const timer = setTimeout(() => {
      checkDomainAvailability(slug);
    }, 250);

    return () => clearTimeout(timer);
  }, [slug, phase, checkDomainAvailability]);

  // =========================================================================
  // ACTION HANDLERS
  // =========================================================================

  // Step 1: Send OTP
  const handleSendOtp = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    setUiError(null);
    setIsAlreadyRegistered(false);
    clearError();

    const validation = validateContactInput(rawIdentifier, selectedCountry.code);
    if (!validation.isValid) {
      setUiError(validation.errorMessage || 'Please enter a valid mobile number or email.');
      return;
    }

    const validatedIdentifier = validation.cleanValue;
    setFormattedIdentifier(validatedIdentifier);

    setIsSubmitting(true);
    try {
      const res = await api.sendOtp({
        identifier: validatedIdentifier,
        type: 'REGISTER'
      });

      if ((res as any)?.devOtpPreview) {
        const preview = String((res as any).devOtpPreview);
        setOtpCode(preview);
        setQuotaNotice(`Development preview only: verification code auto-filled. No external email was sent.`);
      } else {
        setQuotaNotice(null);
      }

      setResendCooldown(45);
      setPhase('otp');
    } catch (err: any) {
      const msg = err.message || '';
      const isDuplicate =
        err.error === 'USER_ALREADY_EXISTS' ||
        err.error === 'ACCOUNT_EXISTS' ||
        err.status === 409 ||
        msg.toLowerCase().includes('already registered') ||
        msg.toLowerCase().includes('already exists');

      if (isDuplicate) {
        setIsAlreadyRegistered(true);
        setUiError(msg || 'This email or mobile number is already registered. Please log in.');
      } else {
        setUiError(msg || 'Failed to send verification code. Please check your details.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);

    const otpValidation = validateOtpCode(otpCode);
    if (!otpValidation.isValid) {
      setUiError(otpValidation.errorMessage || 'Please enter the 6-digit verification code.');
      return;
    }

    const contactValidation = validateContactInput(rawIdentifier, selectedCountry.code);
    const identifierToVerify = contactValidation.isValid ? contactValidation.cleanValue : targetIdentifier;

    setIsSubmitting(true);
    try {
      await api.verifyOtp({
        identifier: identifierToVerify,
        code: otpCode.trim(),
        type: 'REGISTER'
      });

      setPhase('details');
    } catch (err: any) {
      setUiError(err.message || 'Invalid or expired verification code.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Google OAuth Handler (Bypasses OTP directly into details)
  const handleGoogleAuth = async () => {
    setUiError(null);
    clearError();
    setIsSubmitting(true);
    try {
      await initiateGoogleSignIn(
        (credential) => {
          setIsSubmitting(false);
          const profile = decodeGoogleCredential(credential);
          if (profile?.email) {
            setRawIdentifier(profile.email);
            setFormattedIdentifier(profile.email);
            if (profile.name) {
              setFullName(profile.name);
              const firstName = profile.name.split(' ')[0] || 'My';
              const suggestedStore = `${firstName} Studio`;
              setStoreName(suggestedStore);
              setSlug(suggestedStore.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
            }
            setIsGoogleVerified(true);
            setPhase('details');
          } else {
            setUiError('Google profile could not be retrieved.');
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

  // Step 3: Validate Details & Proceed to Plan
  const handleDetailsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUiError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setUiError('Please enter your full name (at least 2 characters).');
      return;
    }

    if (!storeName.trim() || storeName.trim().length < 2) {
      setUiError('Please enter a business or shop name (at least 2 characters).');
      return;
    }

    const localValidation = validateSubdomainSlug(slug);
    if (!localValidation.isValid) {
      setUiError(localValidation.error || 'Invalid subdomain format.');
      return;
    }

    if (domainAvailable !== true) {
      setUiError(domainMessage || 'Please choose an available store subdomain.');
      return;
    }

    if (!isGoogleVerified) {
      if (!password || password.length < 6) {
        setUiError('Password must be at least 6 characters.');
        return;
      }
      if (confirmPassword && password !== confirmPassword) {
        setUiError('Passwords do not match.');
        return;
      }
    }

    setPhase('plan');
  };

  // Step 4: Final Plan Selection & Launch Store
  const handleFinalLaunch = async () => {
    setUiError(null);
    clearError();

    const cleanStoreName = storeName.trim();
    const cleanSlug = slug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    const contactValidation = validateContactInput(rawIdentifier, selectedCountry.code);
    const finalIdentifier = contactValidation.isValid ? contactValidation.cleanValue : targetIdentifier;

    setIsSubmitting(true);
    try {
      const res = await registerStreamlined({
        storeName: cleanStoreName,
        slug: cleanSlug,
        identifier: finalIdentifier,
        capabilityMode: 'COMMERCE',
        fullName: fullName.trim() || cleanStoreName,
        password: password.trim() || 'GoogleSession123!',
        plan: selectedPlan
      });

      if (res.success) {
        redirectToAdminDashboard({
          token: res.token,
          orgId: res.orgId,
          storeId: res.storeId,
          storeSlug: res.storeSlug
        });
      } else if (res.error) {
        setUiError(res.error);
      }
    } catch (err: any) {
      setUiError(err.message || 'Failed to complete registration and launch store.');
    } finally {
      setIsSubmitting(false);
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
          Business Platform
        </span>
      </Link>

      {/* Main Register Card - Minimal, Clean, Distraction-Free */}
      <div className="auth-card" style={{ maxWidth: phase === 'plan' ? '480px' : '440px' }}>
        {/* Error Alert */}
        {(uiError || storeError) && (
          <div className="auth-alert-error" style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle style={{ width: 16, height: 16, flexShrink: 0, marginTop: 2 }} />
              <span style={{ flex: 1, fontSize: '13px', lineHeight: 1.4 }}>{uiError || storeError}</span>
            </div>
            {isAlreadyRegistered && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingTop: '8px', borderTop: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <Link
                  to={`/login?identifier=${encodeURIComponent(rawIdentifier)}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <span>Already registered? Please Log In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* 1. CONTACT PHASE (Email or Mobile)                       */}
        {/* ======================================================== */}
        {phase === 'contact' && (
          <div>
            <div className="auth-card-header">
              <h1 className="auth-card-title">Create Your Store</h1>
              <p className="auth-card-desc">
                Enter your email address or mobile number to get started.
              </p>
            </div>

            <form onSubmit={handleSendOtp}>
              <div className="auth-form-group">
                <label className="auth-label">Email or Mobile Number</label>
                <CountryPhoneInput
                  value={rawIdentifier}
                  onChange={(raw, _isMail, formatted, country) => {
                    setRawIdentifier(raw);
                    setFormattedIdentifier(formatted);
                    setIsAlreadyRegistered(false);
                    setUiError(null);
                    if (country) setSelectedCountry(country);
                  }}
                  onCountryChange={setSelectedCountry}
                  placeholder="Enter your email or phone number"
                  autoFocus
                  required
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
                    Sending Code...
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <div className="auth-divider-line" />
              <span className="auth-divider-text">Or</span>
            </div>

            {/* Google Sign-In: Direct to details, skipping OTP */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isSubmitting || isStoreLoading}
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

        {/* ======================================================== */}
        {/* 2. OTP VERIFICATION PHASE (Skipped for Google)           */}
        {/* ======================================================== */}
        {phase === 'otp' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setPhase('contact');
                setOtpCode('');
                setUiError(null);
              }}
              className="auth-back-btn"
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Back</span>
            </button>

            <div className="auth-card-header" style={{ marginTop: '0.5rem' }}>
              <h1 className="auth-card-title">Verification Code</h1>
              <p className="auth-card-desc">
                Enter the 6-digit code sent to <strong style={{ color: '#083e47' }}>{targetIdentifier}</strong>
              </p>
            </div>

            {quotaNotice && (
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: '#92400e',
                lineHeight: 1.45
              }}>
                <div style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                  <span>⚠️</span> Provider Quota Notice
                </div>
                <div>{quotaNotice}</div>
              </div>
            )}

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
                  <button
                    type="button"
                    onClick={() => {
                      setPhase('contact');
                      setOtpCode('');
                      setUiError(null);
                    }}
                    style={{ color: '#2563eb', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Change contact
                  </button>
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
                disabled={isSubmitting || otpCode.length !== 6}
                className="auth-btn-primary"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw style={{ width: 16, height: 16 }} className="animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <span>Verify Code</span>
                    <ArrowRight style={{ width: 16, height: 16 }} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. STORE DETAILS PHASE                                   */}
        {/* ======================================================== */}
        {phase === 'details' && (
          <div>
            <button
              type="button"
              onClick={() => {
                if (isGoogleVerified) {
                  setPhase('contact');
                } else {
                  setPhase('otp');
                }
                setUiError(null);
              }}
              className="auth-back-btn"
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Back</span>
            </button>

            <div className="auth-card-header" style={{ marginTop: '0.5rem' }}>
              <h1 className="auth-card-title">Store Details</h1>
              <p className="auth-card-desc">
                Name your business and customize your web domain.
              </p>
            </div>

            <form onSubmit={handleDetailsSubmit}>
              {/* Merchant Name */}
              <div className="auth-form-group">
                <label className="auth-label">Merchant Name</label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon">
                    <User style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Chandraprakash"
                    className="auth-input"
                    autoFocus
                    required
                  />
                </div>
              </div>

              {/* Business Name */}
              <div className="auth-form-group">
                <label className="auth-label">Business Name</label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon">
                    <Store style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => handleStoreNameChange(e.target.value)}
                    placeholder="e.g. Aura Studio"
                    className="auth-input"
                    required
                  />
                </div>
              </div>

              {/* Domain & Availability Check */}
              <div className="auth-form-group">
                <label className="auth-label">Store Domain</label>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div className="auth-input-wrapper" style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}>
                    <div className="auth-input-icon">
                      <Globe style={{ width: 18, height: 18 }} />
                    </div>
                    <input
                      type="text"
                      value={slug}
                      onChange={(e) => {
                        setIsSlugManuallyEdited(true);
                        setSlug(e.target.value.toLowerCase().trim());
                      }}
                      placeholder="aurastudio"
                      className="auth-input"
                      required
                    />
                  </div>
                  <div style={{
                    padding: '0.75rem 0.85rem',
                    backgroundColor: '#f1f5f9',
                    border: '1.5px solid #cbd5e1',
                    borderLeft: 'none',
                    borderTopRightRadius: '10px',
                    borderBottomRightRadius: '10px',
                    fontSize: '0.8rem',
                    color: '#475569',
                    fontWeight: 600,
                    whiteSpace: 'nowrap'
                  }}>
                    .{PLATFORM_MAIN_DOMAIN}
                  </div>
                </div>

                {/* Domain status banner */}
                {slug.trim().length > 0 && (
                  <div style={{ marginTop: '0.4rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {isCheckingDomain ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" style={{ color: '#64748b' }} />
                        <span style={{ color: '#64748b' }}>Checking availability...</span>
                      </>
                    ) : domainAvailable === true ? (
                      <>
                        <CheckCircle2 size={13} style={{ color: '#16a34a' }} />
                        <span style={{ color: '#16a34a', fontWeight: 600 }}>
                          {slug.trim().toLowerCase()}.{PLATFORM_MAIN_DOMAIN} is available!
                        </span>
                      </>
                    ) : domainAvailable === false ? (
                      <>
                        <AlertCircle size={13} style={{ color: '#dc2626' }} />
                        <span style={{ color: '#dc2626', fontWeight: 600 }}>{domainMessage}</span>
                      </>
                    ) : null}
                  </div>
                )}
              </div>

              {/* Password (Optional if Google Verified) */}
              <div className="auth-form-group">
                <label className="auth-label">
                  {isGoogleVerified ? 'Password (Optional for direct login)' : 'Password'}
                </label>
                <div className="auth-input-wrapper">
                  <div className="auth-input-icon">
                    <Lock style={{ width: 18, height: 18 }} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="auth-input"
                    autoComplete="new-password"
                    required={!isGoogleVerified}
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

              {/* Confirm Password */}
              {(!isGoogleVerified || password.length > 0) && (
                <div className="auth-form-group">
                  <label className="auth-label">Confirm Password</label>
                  <div className="auth-input-wrapper">
                    <div className="auth-input-icon">
                      <Lock style={{ width: 18, height: 18 }} />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="auth-input"
                      autoComplete="new-password"
                      required={!isGoogleVerified}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={
                  !fullName.trim() ||
                  !storeName.trim() ||
                  !slug.trim() ||
                  domainAvailable !== true ||
                  isCheckingDomain ||
                  (!isGoogleVerified && (!password || password.length < 6))
                }
                className="auth-btn-primary"
                style={{ marginTop: '0.5rem' }}
              >
                <span>Continue to Plans</span>
                <ArrowRight style={{ width: 16, height: 16 }} />
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. PLAN PURCHASE PHASE                                   */}
        {/* ======================================================== */}
        {phase === 'plan' && (
          <div>
            <button
              type="button"
              onClick={() => {
                setPhase('details');
                setUiError(null);
              }}
              className="auth-back-btn"
            >
              <ArrowLeft style={{ width: 14, height: 14 }} />
              <span>Back to store details</span>
            </button>

            <div className="auth-card-header" style={{ marginTop: '0.5rem' }}>
              <h1 className="auth-card-title">Choose Your Plan</h1>
              <p className="auth-card-desc">
                Select an activation tier for <strong style={{ color: '#083e47' }}>{slug.trim().toLowerCase()}.{PLATFORM_MAIN_DOMAIN}</strong>
              </p>
            </div>

            {/* Plan Cards */}
            <div className="auth-plan-grid">
              {PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`auth-plan-card ${isSelected ? 'selected' : ''}`}
                    style={{ position: 'relative' }}
                  >
                    {plan.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-10px',
                          right: '16px',
                          backgroundColor: '#083e47',
                          color: '#ffffff',
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '99px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}

                    <div className="auth-plan-header">
                      <div className="auth-plan-name">
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid #083e47' : '2px solid #cbd5e1',
                            marginRight: '6px'
                          }}
                        />
                        {plan.name}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span className="auth-plan-price">{plan.price}</span>
                        <span style={{ fontSize: '11px', color: '#64748b', marginLeft: '4px' }}>{plan.period}</span>
                      </div>
                    </div>

                    <p className="auth-plan-desc">{plan.description}</p>

                    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {plan.features.slice(0, 3).map((feat, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#475569' }}>
                          <Check size={12} color="#16a34a" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleFinalLaunch}
              disabled={isSubmitting || isStoreLoading}
              className="auth-btn-primary"
              style={{ marginTop: '0.75rem' }}
            >
              {isSubmitting || isStoreLoading ? (
                <>
                  <RefreshCw style={{ width: 16, height: 16 }} className="animate-spin" />
                  Activating Store & Domain...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Activate Plan & Launch Store</span>
                  <ArrowRight style={{ width: 16, height: 16 }} />
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer: Sign in link */}
      <p className="auth-footer-link">
        Already have an account?{' '}
        <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

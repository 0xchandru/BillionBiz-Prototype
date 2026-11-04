import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Laptop, 
  Smartphone, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  RotateCcw
} from 'lucide-react';

export const SecuritySettingsPage: React.FC = () => {
  // MFA states
  const [mfaEnabled, setMfaEnabled] = useState(false);

  // Password Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // POS PIN states
  const [posPin, setPosPin] = useState('1234');
  const [autoLockMinutes, setAutoLockMinutes] = useState('15');
  const [supervisorPin, setSupervisorPin] = useState('9999');
  const [pinSuccess, setPinSuccess] = useState(false);

  // Sessions
  const [sessionsRevoked, setSessionsRevoked] = useState(false);

  const handlePasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setIsChangingPassword(true);
      await new Promise((r) => setTimeout(r, 600));
      setPasswordSuccess('Password successfully updated. Please use your new password next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSavePinSettings = (e: FormEvent) => {
    e.preventDefault();
    setPinSuccess(true);
    setTimeout(() => setPinSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Security & Login</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Security & Access Settings
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Protect your workspace with two-factor authentication, strong passwords, cashier POS PINs, and session governance.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Two-Factor Authentication */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Two-Factor Authentication (TOTP / Authenticator)
                </h3>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: mfaEnabled ? '#dcfce7' : '#f1f5f9',
                  color: mfaEnabled ? '#15803d' : '#64748b'
                }}>
                  {mfaEnabled ? 'Enrolled & Active' : 'Not Enabled'}
                </span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '13.5px', color: '#64748b' }}>
                Add a second security layer requiring a 6-digit code from your authenticator app on every login.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMfaEnabled(!mfaEnabled)}
              style={{
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: mfaEnabled ? '#fee2e2' : '#083e47',
                color: mfaEnabled ? '#b91c1c' : '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {mfaEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>

          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', gap: '16px', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Smartphone size={20} color="#083e47" />
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>Supported Authenticator Apps</div>
              <div style={{ fontSize: '12.5px', color: '#64748b' }}>Google Authenticator, Microsoft Authenticator, 1Password, or Authy.</div>
            </div>
          </div>
        </div>

        {/* Section 2: Change Password */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lock size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Change Account Password
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Ensure your account is using a long, random password to stay secure.
          </p>

          {passwordSuccess && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#fef2f2', color: '#b91c1c', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Current Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  style={{ width: '100%', padding: '9px 38px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                New Password (minimum 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '9px 38px 9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              style={{
                alignSelf: 'flex-start',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#083e47',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: isChangingPassword ? 'not-allowed' : 'pointer',
                marginTop: '6px'
              }}
            >
              {isChangingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Section 3: POS PINs */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <KeyRound size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Cashier POS & Counter PIN Governance
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Set 4-digit numeric passcodes for fast cashier switching on physical retail checkout terminals.
          </p>

          {pinSuccess && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>POS PIN configuration saved!</span>
            </div>
          )}

          <form onSubmit={handleSavePinSettings} style={{ maxWidth: '520px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Default Cashier Quick PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength={4}
                value={posPin}
                onChange={(e) => setPosPin(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', letterSpacing: '4px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                POS Terminal Idle Auto-Lock
              </label>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              >
                <option value="5">After 5 minutes of inactivity</option>
                <option value="15">After 15 minutes of inactivity</option>
                <option value="30">After 30 minutes of inactivity</option>
                <option value="60">After 1 hour of inactivity</option>
                <option value="0">Never auto-lock during shift</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Manager Supervisor Override PIN (4 digits)
              </label>
              <input
                type="password"
                maxLength={4}
                value={supervisorPin}
                onChange={(e) => setSupervisorPin(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', letterSpacing: '4px' }}
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Required to approve refunds, custom discounts, and drawer opening without sale.
              </span>
            </div>

            <button
              type="submit"
              style={{
                alignSelf: 'flex-start',
                padding: '9px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#083e47',
                color: '#ffffff',
                fontSize: '13.5px',
                fontWeight: '600',
                cursor: 'pointer',
                marginTop: '6px'
              }}
            >
              Save PIN Settings
            </button>
          </form>
        </div>

        {/* Section 4: Sessions */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Laptop size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Active Devices & Sessions
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
                Review all browsers and devices that currently have access to your BillionBiz account.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setSessionsRevoked(true);
                setTimeout(() => setSessionsRevoked(false), 3000);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#b91c1c',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={14} />
              <span>Revoke All Other Sessions</span>
            </button>
          </div>

          {sessionsRevoked && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', background: '#f0fdf4', color: '#15803d', fontSize: '13.5px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} />
              <span>All other device sessions have been revoked.</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid #bbf7d0', borderRadius: '8px', backgroundColor: '#f0fdf4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Laptop size={22} color="#15803d" />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#0f172a' }}>
                    Current Active Browser (This Device)
                  </div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Chrome on Windows • IP: 103.212.x.x • Bengaluru, India
                  </div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                Active Now
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;

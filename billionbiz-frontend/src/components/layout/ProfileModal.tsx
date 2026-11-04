import React, { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  X, 
  CheckCircle2, 
  Laptop, 
  AlertCircle 
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, role, organizationName, storeName, checkAuth } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'sessions'>('profile');
  
  // Profile fields
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState((user as any)?.phone || '');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      // In production/prototype, update user state
      if (checkAuth) await checkAuth();
      setSuccessMsg('Profile information updated successfully.');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setErrorMsg(null);

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New passwords do not match.');
      return;
    }

    setSaving(true);
    try {
      // Simulate password update
      await new Promise(r => setTimeout(r, 600));
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                backgroundColor: '#083e47',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '16px'
              }}
            >
              {(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {user?.fullName || 'Merchant Account'}
              </h2>
              <span style={{ fontSize: '12px', color: '#64748b' }}>
                Role: <strong style={{ color: '#083e47' }}>{role || 'OWNER'}</strong> • {organizationName || storeName || 'Primary Store'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              padding: '6px',
              borderRadius: '8px',
              color: '#94a3b8',
              cursor: 'pointer',
              border: 'none',
              background: 'none'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc',
            padding: '0 24px'
          }}
        >
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'profile' ? '#083e47' : '#64748b',
              borderBottom: activeTab === 'profile' ? '2px solid #083e47' : '2px solid transparent',
              cursor: 'pointer',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('security')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'security' ? '#083e47' : '#64748b',
              borderBottom: activeTab === 'security' ? '2px solid #083e47' : '2px solid transparent',
              cursor: 'pointer',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            Security & Password
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            style={{
              padding: '12px 16px',
              fontSize: '13px',
              fontWeight: 600,
              color: activeTab === 'sessions' ? '#083e47' : '#64748b',
              borderBottom: activeTab === 'sessions' ? '2px solid #083e47' : '2px solid transparent',
              cursor: 'pointer',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none'
            }}
          >
            Active Sessions
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '24px', maxHeight: '420px', overflowY: 'auto' }}>
          {/* Alerts */}
          {(successMsg || passwordSuccess) && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg || passwordSuccess}</span>
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                marginBottom: '16px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#fee2e2',
                color: '#b91c1c',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: PROFILE DETAILS */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Email Address
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#083e47',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === 'security' && (
            <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Current Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: '#94a3b8' }} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{
                      width: '100%',
                      padding: '9px 12px 9px 36px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="submit"
                  disabled={saving || !newPassword}
                  style={{
                    padding: '9px 18px',
                    borderRadius: '8px',
                    backgroundColor: '#083e47',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer'
                  }}
                >
                  {saving ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SESSIONS */}
          {activeTab === 'sessions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#f8fafc'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Laptop size={20} color="#083e47" />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                      Current Browser Session
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>
                      IP: 127.0.0.1 • Active Now
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '11px',
                    fontWeight: 700
                  }}
                >
                  ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;

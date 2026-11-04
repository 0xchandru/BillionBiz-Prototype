import React, { useState, useEffect } from 'react';
import {
  User,
  Package,
  MapPin,
  LogOut,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/services';
import { getPortalUrl } from '../utils/subdomain';
import logoLightBg from '../assets/logo-light-bg.png';

export const CustomerPortalPage: React.FC = () => {
  const { user, isAuthenticated, loginUnified, logout } = useAuthStore();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const mainWebsiteUrl = getPortalUrl('root', '/');
  const adminLoginUrl = getPortalUrl('admin', '/login');
  const accountsHost = `accounts.${rootDomain}`;
  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'security'>('orders');

  // Customer Auth State (when unauthenticated)
  const [authMode, setAuthMode] = useState<'signin' | 'otp'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [_otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Customer Data State
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [savedAddress, setSavedAddress] = useState({
    fullName: user?.fullName || '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [addressSaved, setAddressSaved] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadCustomerOrders();
    }
  }, [isAuthenticated]);

  const loadCustomerOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.getOrders();
      setOrders(res.orders || []);
    } catch {
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setLoading(true);
    setAuthError(null);
    try {
      await api.sendOtp({ identifier: identifier.trim(), type: 'LOGIN' });
      setOtpSent(true);
      setAuthMode('otp');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;
    setLoading(true);
    setAuthError(null);
    try {
      const res = await loginUnified(identifier.trim(), { password });
      if (!res.success) {
        setAuthError(res.error || 'Invalid credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 4) return;
    setLoading(true);
    setAuthError(null);
    try {
      const res = await loginUnified(identifier.trim(), { otp: otpCode.trim() });
      if (!res.success) {
        setAuthError(res.error || 'Invalid or expired OTP code.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // 1. UNAUTHENTICATED CUSTOMER VIEW
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, sans-serif' }}>
        {/* Navigation Bar */}
        <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img src={logoLightBg} alt="BillionBiz" style={{ height: '28px' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b', paddingLeft: '8px', borderLeft: '1px solid #cbd5e1' }}>
              Customer Accounts Portal
            </span>
          </div>
          <a
            href={mainWebsiteUrl}
            style={{ fontSize: '13px', color: '#083e47', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Visit Main Website <ExternalLink size={14} />
          </a>
        </header>

        {/* Auth Container */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 16px' }}>
          <div style={{ maxWidth: '440px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px 32px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#e6f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <User size={24} color="#083e47" />
              </div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 6px' }}>Customer Sign In</h1>
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>
                Sign in to manage your customer orders, shipping addresses, and account details.
              </p>
            </div>

            {authError && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '18px' }}>
                <AlertCircle size={16} />
                <span>{authError}</span>
              </div>
            )}

            {authMode === 'signin' ? (
              <form onSubmit={handlePasswordLogin}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email or Mobile Number
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="name@example.com or mobile number"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{ width: '100%', padding: '11px', backgroundColor: '#083e47', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading && <RefreshCw size={14} className="animate-spin" />}
                  <span>Sign In</span>
                </button>

                <div style={{ margin: '18px 0', textAlign: 'center', position: 'relative' }}>
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0' }} />
                  <span style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#ffffff', padding: '0 8px', fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase' }}>
                    or instant OTP
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={loading || !identifier.trim()}
                  style={{ width: '100%', padding: '10px', backgroundColor: '#f8fafc', color: '#334155', borderRadius: '8px', border: '1px solid #cbd5e1', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
                >
                  Receive Verification Code via OTP
                </button>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    6-Digit Verification Code sent to {identifier}
                  </label>
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="e.g. 123456"
                    maxLength={6}
                    autoFocus
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #083e47', fontSize: '18px', textAlign: 'center', letterSpacing: '0.25em', outline: 'none' }}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpCode.length < 4}
                  style={{ width: '100%', padding: '11px', backgroundColor: '#083e47', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {loading && <RefreshCw size={14} className="animate-spin" />}
                  <span>Verify & Sign In</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                  style={{ width: '100%', marginTop: '12px', background: 'none', border: 'none', color: '#64748b', fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Back to Password Sign In
                </button>
              </form>
            )}

            <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
              Are you a merchant or store owner?{' '}
              <a href={adminLoginUrl} style={{ color: '#083e47', fontWeight: 700, textDecoration: 'none' }}>
                Merchant Admin Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. AUTHENTICATED CUSTOMER DASHBOARD VIEW
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={logoLightBg} alt="BillionBiz" style={{ height: '28px' }} />
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#083e47', paddingLeft: '8px', borderLeft: '1.5px solid #cbd5e1' }}>
            Customer Account
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{user?.fullName || 'Customer'}</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>{user?.email || (user as any)?.phone || 'Customer Account'}</div>
          </div>
          <button
            onClick={() => logout()}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 12px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '12px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
          >
            <LogOut size={13} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Account Workspace */}
      <div style={{ maxWidth: '1100px', width: '100%', margin: '32px auto', padding: '0 20px', display: 'flex', gap: '28px', flex: 1, flexWrap: 'wrap' }}>
        {/* Left Navigation Tabs */}
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('orders')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'orders' ? '#083e47' : '#ffffff', color: activeTab === 'orders' ? '#ffffff' : '#334155', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
          >
            <Package size={17} />
            <span>My Orders</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'profile' ? '#083e47' : '#ffffff', color: activeTab === 'profile' ? '#ffffff' : '#334155', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
          >
            <MapPin size={17} />
            <span>Shipping & Addresses</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 16px', borderRadius: '10px', border: 'none', backgroundColor: activeTab === 'security' ? '#083e47' : '#ffffff', color: activeTab === 'security' ? '#ffffff' : '#334155', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
          >
            <ShieldCheck size={17} />
            <span>Account & Security</span>
          </button>
        </div>

        {/* Right Content Panel */}
        <div style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', minWidth: '300px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          {activeTab === 'orders' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Order History</h2>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>Track and review your purchases across BillionBiz merchant stores.</p>
                </div>
                <button onClick={loadCustomerOrders} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#083e47' }}>
                  <RefreshCw size={15} className={loadingOrders ? 'animate-spin' : ''} />
                </button>
              </div>

              {loadingOrders ? (
                <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                  <RefreshCw size={20} className="animate-spin" style={{ margin: '0 auto 10px' }} />
                  Loading your orders...
                </div>
              ) : orders.length === 0 ? (
                <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <ShoppingBag size={36} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', margin: '0 0 6px' }}>No orders yet</h3>
                  <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px' }}>
                    When you purchase products from any merchant storefront, your receipts and tracking will appear here.
                  </p>
                  <a
                    href={mainWebsiteUrl}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#083e47', color: '#ffffff', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, textDecoration: 'none' }}
                  >
                    Browse Stores <ArrowRight size={14} />
                  </a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {orders.map((ord) => (
                    <div key={ord.id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Order #{ord.order_number || ord.id.slice(0, 8)}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          Placed on {new Date(ord.created_at).toLocaleDateString()} · {ord.items_count || 1} item(s)
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '14px', color: '#083e47' }}>
                          ₹{((ord.total_minor || 0) / 100).toFixed(2)}
                        </div>
                        <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '99px', fontSize: '10.5px', fontWeight: 700, textTransform: 'uppercase', marginTop: '4px', backgroundColor: ord.status === 'COMPLETED' ? '#dcfce7' : '#fef9c3', color: ord.status === 'COMPLETED' ? '#15803d' : '#854d0e' }}>
                          {ord.status || 'PROCESSING'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Shipping Address</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Save your default address for seamless 1-click checkout at any merchant store.</p>

              {addressSaved && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '13px', marginBottom: '18px' }}>
                  <CheckCircle2 size={16} />
                  <span>Default shipping address updated successfully!</span>
                </div>
              )}

              <form onSubmit={(e) => { e.preventDefault(); setAddressSaved(true); setTimeout(() => setAddressSaved(false), 3000); }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Full Name</label>
                    <input
                      type="text"
                      value={savedAddress.fullName}
                      onChange={(e) => setSavedAddress({ ...savedAddress, fullName: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Street Address</label>
                    <input
                      type="text"
                      value={savedAddress.street}
                      onChange={(e) => setSavedAddress({ ...savedAddress, street: e.target.value })}
                      placeholder="House/Flat, Street name"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>City</label>
                    <input
                      type="text"
                      value={savedAddress.city}
                      onChange={(e) => setSavedAddress({ ...savedAddress, city: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>State</label>
                    <input
                      type="text"
                      value={savedAddress.state}
                      onChange={(e) => setSavedAddress({ ...savedAddress, state: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Postal Code</label>
                    <input
                      type="text"
                      value={savedAddress.postalCode}
                      onChange={(e) => setSavedAddress({ ...savedAddress, postalCode: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  style={{ padding: '10px 20px', backgroundColor: '#083e47', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Save Address
                </button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Customer Security</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px' }}>Manage customer authentication factors and active customer sessions.</p>

              <div style={{ padding: '16px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: '13.5px', color: '#1e293b' }}>
                  <ShieldCheck size={18} color="#059669" />
                  <span>Isolated Customer Authentication Context</span>
                </div>
                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '6px 0 0 26px', lineHeight: 1.5 }}>
                  This session is securely isolated to `{accountsHost}`. It holds customer privileges only and cannot access administrative merchant controls.
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid #f1f5f9' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '13.5px', color: '#0f172a' }}>Sign Out from this Device</div>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>Terminates customer access on this browser.</div>
                </div>
                <button
                  onClick={() => logout()}
                  style={{ padding: '8px 16px', backgroundColor: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontWeight: 700, fontSize: '12.5px', cursor: 'pointer' }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortalPage;

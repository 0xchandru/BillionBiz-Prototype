import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  LogOut, 
  Phone, 
  Mail, 
  ChevronRight, 
  Shield, 
  Activity 
} from 'lucide-react';
import { api } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { getPortalUrl } from '../utils/subdomain';

export const StaffPortalPage: React.FC = () => {
  const { user, storeName, isAuthenticated, loginUnified, logout } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed'>('today');
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  // Staff Login State (when unauthenticated on staff.chandraprakash.codes)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadStaffSchedule();
    }
  }, [isAuthenticated]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) return;
    setLoginLoading(true);
    setLoginError(null);
    try {
      const res = await loginUnified(loginIdentifier.trim(), { password: loginPassword });
      if (!res.success) {
        setLoginError(res.error || 'Invalid staff credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Staff authentication failed.');
    } finally {
      setLoginLoading(false);
    }
  };

  const loadStaffSchedule = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings();
      setBookings(res.bookings || []);
      if (res.bookings && res.bookings.length > 0) {
        setSelectedBooking(res.bookings[0]);
      }
    } catch (err) {
      console.error('[StaffPortal] Failed to load assigned bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const status = (b.status || '').toUpperCase();
    if (activeTab === 'completed') return status === 'COMPLETED';
    if (activeTab === 'today') return status === 'CONFIRMED' || status === 'IN_PROGRESS';
    return status === 'PENDING' || status === 'CONFIRMED';
  });

  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const adminLoginUrl = getPortalUrl('admin', '/login');
  const staffHost = `staff.${rootDomain}`;

  // Dedicated Staff Login view when unauthenticated
  if (!isAuthenticated) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F6F4EE', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <div style={{ maxWidth: '420px', width: '100%', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '36px 32px', boxShadow: '0 10px 25px -5px rgba(6,70,82,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#064652', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontWeight: 'bold', fontSize: '24px' }}>
              B
            </div>
            <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#064652', margin: '0 0 6px' }}>Staff Portal Login</h1>
            <p style={{ fontSize: '12.5px', color: '#64748b', margin: 0 }}>
              {staffHost}
            </p>
          </div>

          {loginError && (
            <div style={{ padding: '10px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#dc2626', fontSize: '13px', marginBottom: '18px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleStaffLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Staff Email / Phone</label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
                placeholder="staff@example.com or phone"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Password or Staff PIN</label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password or PIN"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none' }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              style={{ width: '100%', padding: '11px', backgroundColor: '#064652', color: '#ffffff', borderRadius: '8px', border: 'none', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}
            >
              {loginLoading ? 'Signing in...' : 'Sign In to Staff Portal'}
            </button>
          </form>

          <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
            Store Owner or Admin?{' '}
            <a href={adminLoginUrl} style={{ color: '#064652', fontWeight: 700, textDecoration: 'none' }}>
              Merchant Admin Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F6F4EE', color: '#1a1f36', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* Top Header */}
      <header style={{ backgroundColor: '#064652', color: '#FFFFFF', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 8px rgba(6,70,82,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#5A9A20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '20px' }}>
            B
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '700', letterSpacing: '-0.01em' }}>BillionBiz Staff Portal</span>
              <span style={{ backgroundColor: '#FFBF15', color: '#064652', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase' }}>
                Staff
              </span>
            </div>
            <span style={{ fontSize: '12px', color: '#B2D8D8' }}>Assigned Store: {storeName || 'Shoum Flagship'}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Duty status toggle */}
          <button 
            onClick={() => setIsOnDuty(!isOnDuty)}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              backgroundColor: isOnDuty ? '#5A9A20' : '#475569', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '20px', 
              padding: '6px 14px', 
              fontSize: '13px', 
              fontWeight: '600', 
              cursor: 'pointer' 
            }}
          >
            <Activity size={14} />
            <span>{isOnDuty ? 'On Duty' : 'Off Duty'}</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#B2D8D8', color: '#064652', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              {(user?.fullName || 'Staff')[0]}
            </div>
            <div style={{ textAlign: 'left', lineHeight: '1.2' }}>
              <div style={{ fontSize: '13px', fontWeight: '600' }}>{user?.fullName || 'Staff Member'}</div>
              <div style={{ fontSize: '11px', color: '#B2D8D8' }}>{user?.email}</div>
            </div>
          </div>

          <button 
            onClick={() => logout()}
            title="Sign out"
            style={{ backgroundColor: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', borderRadius: '8px', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '12px' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Staff Container */}
      <div style={{ maxWidth: '1200px', margin: '24px auto', padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
        {/* Left Column: Schedule & Bookings */}
        <div>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <button 
              onClick={() => setActiveTab('today')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: activeTab === 'today' ? '#064652' : '#FFFFFF', 
                color: activeTab === 'today' ? '#FFFFFF' : '#475569', 
                fontWeight: '600', 
                fontSize: '14px', 
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              Today's Queue ({bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'IN_PROGRESS').length})
            </button>
            <button 
              onClick={() => setActiveTab('upcoming')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: activeTab === 'upcoming' ? '#064652' : '#FFFFFF', 
                color: activeTab === 'upcoming' ? '#FFFFFF' : '#475569', 
                fontWeight: '600', 
                fontSize: '14px', 
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              All Bookings ({bookings.length})
            </button>
            <button 
              onClick={() => setActiveTab('completed')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '8px', 
                border: 'none', 
                backgroundColor: activeTab === 'completed' ? '#064652' : '#FFFFFF', 
                color: activeTab === 'completed' ? '#FFFFFF' : '#475569', 
                fontWeight: '600', 
                fontSize: '14px', 
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              Completed ({bookings.filter(b => b.status === 'COMPLETED').length})
            </button>
          </div>

          {/* Bookings Card List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', color: '#64748b' }}>
                Loading your assigned appointments...
              </div>
            ) : filteredBookings.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center', backgroundColor: '#FFFFFF', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <CheckCircle size={40} color="#5A9A20" style={{ margin: '0 auto 12px' }} />
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700', color: '#064652' }}>Schedule Clear</h3>
                <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>No pending appointments in this view.</p>
              </div>
            ) : (
              filteredBookings.map((booking) => {
                const isSelected = selectedBooking?.id === booking.id;
                const statusColor = booking.status === 'CONFIRMED' ? '#5A9A20' : booking.status === 'IN_PROGRESS' ? '#FFBF15' : '#064652';
                return (
                  <div
                    key={booking.id}
                    onClick={() => setSelectedBooking(booking)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#FFFFFF',
                      border: isSelected ? '2px solid #064652' : '1px solid #E2E8F0',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'border-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F0F9FF', color: '#0284C7', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: '700' }}>
                        <Clock size={16} />
                        <span style={{ fontSize: '11px', marginTop: '2px' }}>
                          {booking.start_time ? new Date(booking.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                        </span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a' }}>{booking.customer_name || 'Client Visit'}</span>
                          <span style={{ backgroundColor: `${statusColor}20`, color: statusColor, fontSize: '11px', fontWeight: '700', padding: '2px 6px', borderRadius: '6px' }}>
                            {booking.status}
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>
                          {booking.offering_name || 'Service Consultation'} · Booking #{booking.booking_number || booking.id.substring(0, 8)}
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={18} color="#94A3B8" />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Client Context / Actions */}
        <div>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', padding: '20px', border: '1px solid #E2E8F0', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: '#064652', borderBottom: '1px solid #E2E8F0', paddingBottom: '12px' }}>
              Appointment Details
            </h3>

            {selectedBooking ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: '#064652', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '700', fontSize: '16px' }}>
                    {(selectedBooking.customer_name || 'C')[0]}
                  </div>
                  <div>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>{selectedBooking.customer_name || 'Client'}</h4>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Booking #{selectedBooking.booking_number || selectedBooking.id}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <Mail size={14} color="#64748b" />
                    <span>{selectedBooking.customer_email || 'client@example.com'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <Phone size={14} color="#64748b" />
                    <span>{selectedBooking.customer_phone || '+91 98765 43210'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569' }}>
                    <Calendar size={14} color="#64748b" />
                    <span>
                      {selectedBooking.start_time ? new Date(selectedBooking.start_time).toLocaleString() : 'Today'}
                    </span>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>Service Offering</label>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#064652' }}>{selectedBooking.offering_name || 'Professional Consultation'}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Duration: 45 minutes · Deposit Captured</div>
                </div>

                {/* Staff Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => alert(`Marked booking #${selectedBooking.id} in progress.`)}
                    style={{
                      backgroundColor: '#5A9A20',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Start Appointment
                  </button>
                  <button
                    onClick={() => alert(`Marked booking #${selectedBooking.id} completed.`)}
                    style={{
                      backgroundColor: '#064652',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Completed
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '32px 12px', color: '#94a3b8', fontSize: '13px' }}>
                Select an appointment from the queue to view customer details and status actions.
              </div>
            )}
          </div>

          {/* Privacy & Guard Notice */}
          <div style={{ marginTop: '16px', padding: '12px 14px', borderRadius: '8px', backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: '#475569' }}>
            <Shield size={16} color="#064652" />
            <span>Staff Portal: Scoped to your assigned store and appointments only.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffPortalPage;

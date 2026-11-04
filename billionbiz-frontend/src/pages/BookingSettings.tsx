import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  CheckCircle2,
  Calendar,
  Bell,
  CreditCard
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';

export const BookingSettingsPage: FC = () => {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Form State
  const [confirmationMode, setConfirmationMode] = useState('AUTOMATIC');
  const [minNoticeHours, setMinNoticeHours] = useState(2);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(60);
  const [slotInterval, setSlotInterval] = useState(30);
  const [bufferMinutes, setBufferMinutes] = useState(10);
  const [cancellationPolicy, setCancellationPolicy] = useState('24 hours advance notice required for full refund.');
  const [reschedulingPolicy, setReschedulingPolicy] = useState('Permitted up to 12 hours prior to scheduled start.');
  const [depositRequired, setDepositRequired] = useState(false);

  const fetchSettings = () => {
    setLoading(true);
    api.getBookingSettings()
      .then((res) => {
        const s = res.settings;
        if (s) {
          setConfirmationMode(s.confirmation_mode || 'AUTOMATIC');
          setMinNoticeHours(s.min_notice_hours || 2);
          setMaxAdvanceDays(s.max_advance_days || 60);
          setSlotInterval(s.slot_interval_minutes || 30);
          setBufferMinutes(s.buffer_minutes || 10);
          setCancellationPolicy(s.cancellation_policy || '24 hours advance notice required for full refund.');
          setReschedulingPolicy(s.rescheduling_policy || 'Permitted up to 12 hours prior to scheduled start.');
          setDepositRequired(Boolean(s.deposit_required));
        }
      })
      .catch((err) => {
        console.error('Failed to load booking settings', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.updateBookingSettings({
        confirmationMode,
        minNoticeHours,
        maxAdvanceDays,
        slotIntervalMinutes: slotInterval,
        bufferMinutes,
        cancellationPolicy,
        reschedulingPolicy,
        depositRequired
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    } catch (err: any) {
      alert(err.message || 'Failed to save booking settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Appointments</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Booking Policies</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Booking Policies & Rules
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px' }}>
            Configure client lead times, automatic confirmation rules, and cancellation terms.
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          style={{
            backgroundColor: '#083e47',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: isSaving ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
          }}
        >
          {isSaving ? 'Saving...' : 'Save Policies'}
        </button>
      </div>

      {saveSuccess && (
        <div style={{ padding: '12px 18px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontSize: '14px', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle2 size={18} />
          <span>Booking settings saved and applied to customer calendar!</span>
        </div>
      )}

      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={2} />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Scheduling Policies */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Calendar size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Scheduling & Availability Policies
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Control when clients can reserve slots and how appointments are confirmed.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Confirmation Mode
                </label>
                <select
                  value={confirmationMode}
                  onChange={(e) => setConfirmationMode(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                >
                  <option value="AUTOMATIC">Automatic Instant Confirmation</option>
                  <option value="MANUAL">Manual Review by Staff</option>
                </select>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Automatic instantly holds the slot and sends the calendar invitation.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Slot Interval
                </label>
                <select
                  value={slotInterval}
                  onChange={(e) => setSlotInterval(parseInt(e.target.value, 10))}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', background: '#fff' }}
                >
                  <option value="15">Every 15 minutes</option>
                  <option value="30">Every 30 minutes</option>
                  <option value="45">Every 45 minutes</option>
                  <option value="60">Every 60 minutes</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Minimum Notice Required (Hours)
                </label>
                <input
                  type="number"
                  min="0"
                  value={minNoticeHours}
                  onChange={(e) => setMinNoticeHours(parseInt(e.target.value, 10) || 0)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Clients cannot book appointments starting sooner than this.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Maximum Advance Booking (Days)
                </label>
                <input
                  type="number"
                  min="1"
                  value={maxAdvanceDays}
                  onChange={(e) => setMaxAdvanceDays(parseInt(e.target.value, 10) || 60)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Cancellation Policy
                </label>
                <textarea
                  rows={2}
                  value={cancellationPolicy}
                  onChange={(e) => setCancellationPolicy(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Rescheduling Policy
                </label>
                <textarea
                  rows={2}
                  value={reschedulingPolicy}
                  onChange={(e) => setReschedulingPolicy(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Confirmation & Reminders */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Email & SMS Reminders
              </h3>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '13.5px', color: '#64748b' }}>
              Automated appointment notifications dispatched 24 hours and 2 hours before scheduled slot to minimize no-shows.
            </p>

            <div style={{ padding: '16px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span style={{ fontSize: '13px', color: '#334155' }}>
                Active: Calendar invitations (.ics) and 24-hr reminder emails are triggered automatically for all confirmed appointments.
              </span>
            </div>
          </div>

          {/* Section 3: Deposit & Payment Rules */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                Deposit & Advance Payment Rules
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Require customers to pay a deposit at booking time to confirm reservations.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', fontWeight: 600, color: '#0f172a', cursor: 'pointer', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
              <input
                type="checkbox"
                checked={depositRequired}
                onChange={(e) => setDepositRequired(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: '#083e47' }}
              />
              <div>
                <div>Enforce Advance Deposit on All Online Service Bookings</div>
                <div style={{ fontSize: '12.5px', color: '#64748b', fontWeight: 400, marginTop: '2px' }}>
                  Clients must tender the required deposit via UPI, cards, or Razorpay to finalize reservation hold tokens.
                </div>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                backgroundColor: '#083e47',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSaving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
              }}
            >
              {isSaving ? 'Saving...' : 'Save Policies'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default BookingSettingsPage;

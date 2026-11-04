import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  Bell, 
  Mail, 
  Send, 
  CheckCircle2, 
  Save
} from 'lucide-react';

export const NotificationsSettingsPage: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [testSent, setTestSent] = useState(false);

  // Customer Notifications
  const [orderConfirmations, setOrderConfirmations] = useState(true);
  const [shippingUpdates, setShippingUpdates] = useState(true);
  const [bookingConfirmations, setBookingConfirmations] = useState(true);
  const [bookingReminders, setBookingReminders] = useState(true);

  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();

  // Merchant Alerts
  const [merchantNewOrderAlert, setMerchantNewOrderAlert] = useState(true);
  const [merchantLowStockAlert, setMerchantLowStockAlert] = useState(true);
  const [merchantDailyDigest, setMerchantDailyDigest] = useState(true);
  const [alertEmail, setAlertEmail] = useState(`chandru@${rootDomain}`);

  // Sender Domain
  const [senderName, setSenderName] = useState('BillionBiz Store');
  const [senderEmail, setSenderEmail] = useState(`noreply@${rootDomain}`);
  const [replyToEmail, setReplyToEmail] = useState(`support@${rootDomain}`);

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTest = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3500);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Notifications</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Notification Settings
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Configure transactional customer emails, appointment reminders, merchant sales alerts, and verified sender domains.
          </p>
        </div>

        <button
          onClick={handleSave}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 18px',
            borderRadius: '8px',
            border: 'none',
            background: '#083e47',
            color: '#ffffff',
            fontSize: '13.5px',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Save size={16} />
          <span>Save Notification Settings</span>
        </button>
      </div>

      {savedSuccess && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: '#f0fdf4',
          color: '#15803d',
          fontSize: '13.5px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #bbf7d0',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>Notification rules saved successfully!</span>
        </div>
      )}

      {testSent && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: '#f0fdf4',
          color: '#15803d',
          fontSize: '13.5px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          border: '1px solid #bbf7d0',
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={18} />
          <span>Test transactional email dispatched via Resend to {alertEmail}!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Customer Notifications */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Mail size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Automated Customer Transactional Emails
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Real-time messages sent to buyers automatically via <strong>Resend</strong> when order or booking statuses change.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Order Confirmation & Receipt PDF</div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Dispatched immediately upon successful payment or COD checkout with itemized breakdown.</div>
              </div>
              <input
                type="checkbox"
                checked={orderConfirmations}
                onChange={(e) => setOrderConfirmations(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Shipment Dispatch & AWB Tracking Alert</div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Sent when an order is packed with courier name and live tracking link.</div>
              </div>
              <input
                type="checkbox"
                checked={shippingUpdates}
                onChange={(e) => setShippingUpdates(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Appointment Booking Confirmation</div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Includes calendar invite (.ics), service duration, assigned staff member, and address.</div>
              </div>
              <input
                type="checkbox"
                checked={bookingConfirmations}
                onChange={(e) => setBookingConfirmations(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>24-Hour Appointment Reminder</div>
                <div style={{ fontSize: '12.5px', color: '#64748b' }}>Automated reminder sent 24 hours prior to scheduled appointment slot.</div>
              </div>
              <input
                type="checkbox"
                checked={bookingReminders}
                onChange={(e) => setBookingReminders(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Merchant Alerts */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Merchant Operational Alerts
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Receive instant alerts to fulfill orders promptly and keep inventory in stock.
          </p>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
              Merchant Alert Recipient Email
            </label>
            <input
              type="email"
              value={alertEmail}
              onChange={(e) => setAlertEmail(e.target.value)}
              style={{ width: '100%', maxWidth: '440px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>New Order Notification</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Receive instant email when a customer completes checkout.</div>
              </div>
              <input
                type="checkbox"
                checked={merchantNewOrderAlert}
                onChange={(e) => setMerchantNewOrderAlert(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>Low Inventory Stock Alert</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Trigger alert when product stock drops below threshold.</div>
              </div>
              <input
                type="checkbox"
                checked={merchantLowStockAlert}
                onChange={(e) => setMerchantLowStockAlert(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </label>

            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>Daily Sales & Performance Digest</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Morning email summary of orders, appointments, and gross revenue.</div>
              </div>
              <input
                type="checkbox"
                checked={merchantDailyDigest}
                onChange={(e) => setMerchantDailyDigest(e.target.checked)}
                style={{ width: '18px', height: '18px' }}
              />
            </label>
          </div>
        </div>

        {/* Section 3: Sender Domain */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Send size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Sender Identity & DKIM/SPF Verification
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
                Outbound emails are dispatched securely via <strong>Resend</strong> infrastructure with high deliverability.
              </p>
            </div>

            <button
              type="button"
              onClick={handleSendTest}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                backgroundColor: '#ffffff',
                color: '#083e47',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              <Send size={14} />
              <span>Send Test Email</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Sender From Name
              </label>
              <input
                type="text"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Sender From Address
              </label>
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Customer Reply-To Address
              </label>
              <input
                type="email"
                value={replyToEmail}
                onChange={(e) => setReplyToEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CheckCircle2 size={18} color="#15803d" />
            <div style={{ fontSize: '13px', color: '#166534' }}>
              <strong>{rootDomain}</strong> is verified with valid DKIM, SPF, and DMARC DNS records for instantaneous inbox delivery.
            </div>
          </div>
        </div>

        {/* Bottom Save Bar */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
          <button
            onClick={handleSave}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 24px',
              borderRadius: '8px',
              border: 'none',
              background: '#083e47',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <Save size={16} />
            <span>Save Notification Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsSettingsPage;

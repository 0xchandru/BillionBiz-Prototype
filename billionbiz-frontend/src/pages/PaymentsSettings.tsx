import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  CreditCard, 
  Percent, 
  Landmark, 
  CheckCircle2, 
  Save, 
  QrCode
} from 'lucide-react';

export const PaymentsSettingsPage: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Gateway Toggles
  const [razorpayEnabled, setRazorpayEnabled] = useState(true);
  const [upiEnabled, setUpiEnabled] = useState(true);
  const [codEnabled, setCodEnabled] = useState(true);

  // Taxes States
  const [gstin, setGstin] = useState('22AAAAA0000A1Z5');
  const [defaultTaxRate, setDefaultTaxRate] = useState('18');
  const [taxInclusive, setTaxInclusive] = useState(true);

  // Payout States
  const [bankName, setBankName] = useState('HDFC Bank');
  const [accountHolder, setAccountHolder] = useState('Chandru Commerce Private Limited');
  const [accountNumber, setAccountNumber] = useState('50200012345678');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [payoutSchedule, setPayoutSchedule] = useState('DAILY');

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Payments</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Payment Settings
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Manage checkout payment gateways, UPI QR tenders, GST tax calculation, and settlement bank accounts.
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
          <span>Save Payment Settings</span>
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
          marginBottom: '24px'
        }}>
          <CheckCircle2 size={18} />
          <span>Payment and tax settings saved successfully!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Accepted Payment Gateways */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                  Accepted Online Payment Tenders
                </h3>
              </div>
              <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '13.5px' }}>
                Primary currency: <strong>INR (₹)</strong>. Customers can checkout via UPI, Cards, Netbanking, or Cash.
              </p>
            </div>

            <a
              href="/extensions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '8px',
                backgroundColor: '#083e47',
                color: '#ffffff',
                fontSize: '13px',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              <CreditCard size={14} />
              <span>Configure Keys in Extensions</span>
            </a>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Razorpay Payment Gateway</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Supports Credit/Debit Cards, Google Pay, PhonePe, Paytm, Netbanking.</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={razorpayEnabled}
                  onChange={(e) => setRazorpayEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: razorpayEnabled ? '#15803d' : '#64748b' }}>
                  {razorpayEnabled ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <QrCode size={20} color="#15803d" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>UPI Dynamic QR Code (POS & Storefront)</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Show on-screen QR for instantaneous payment confirmation without cards.</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={upiEnabled}
                  onChange={(e) => setUpiEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: upiEnabled ? '#15803d' : '#64748b' }}>
                  {upiEnabled ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Landmark size={20} color="#ca8a04" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Cash on Delivery (COD)</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Collect payment in cash upon courier parcel delivery.</div>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={codEnabled}
                  onChange={(e) => setCodEnabled(e.target.checked)}
                  style={{ width: '18px', height: '18px' }}
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: codEnabled ? '#15803d' : '#64748b' }}>
                  {codEnabled ? 'Active' : 'Disabled'}
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Section 2: Taxes & GSTIN */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Percent size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Goods and Services Tax (GST) & Invoicing
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Configure your registered GSTIN and tax slabs for compliant tax invoices.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Merchant GSTIN Registration Number
              </label>
              <input
                type="text"
                value={gstin}
                onChange={(e) => setGstin(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                placeholder="22AAAAA0000A1Z5"
              />
              <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginTop: '4px' }}>
                Included on all generated PDF receipts and invoices.
              </span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Default GST Tax Slab
              </label>
              <select
                value={defaultTaxRate}
                onChange={(e) => setDefaultTaxRate(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              >
                <option value="18">Standard GST (18%)</option>
                <option value="12">Essential Goods (12%)</option>
                <option value="5">Concessional Rate (5%)</option>
                <option value="28">Luxury Goods (28%)</option>
                <option value="0">Zero-rated / Exempt (0%)</option>
              </select>
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: '#f8fafc', borderRadius: '8px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
            <input
              type="checkbox"
              checked={taxInclusive}
              onChange={(e) => setTaxInclusive(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            <div>
              <div style={{ fontWeight: '600', fontSize: '13.5px', color: '#0f172a' }}>All listed prices include GST</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Tax amount will be calculated and broken down backwards from product price on checkout.</div>
            </div>
          </label>
        </div>

        {/* Section 3: Bank Payouts */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Landmark size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Merchant Settlement Bank Account
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Funds from storefront sales and appointment deposits are settled directly into this account.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Bank Name
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Beneficiary / Account Holder Name
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Bank Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                IFSC Code
              </label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                Settlement Schedule
              </label>
              <select
                value={payoutSchedule}
                onChange={(e) => setPayoutSchedule(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              >
                <option value="DAILY">Daily Automatic Settlement (T+1)</option>
                <option value="WEEKLY">Weekly on Mondays</option>
                <option value="MONTHLY">Monthly</option>
              </select>
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
            <span>Save Payment Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentsSettingsPage;

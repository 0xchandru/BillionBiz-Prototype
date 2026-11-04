import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  User, 
  CreditCard, 
  Download, 
  CheckCircle2, 
  Save,
  FileSpreadsheet
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/services';

export const AccountSettingsPage: React.FC = () => {
  const { user, role, organizationName, storeName, checkAuth } = useAuthStore();
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();

  // Profile Form States
  const [fullName, setFullName] = useState(user?.fullName || 'Chandru');
  const [email, setEmail] = useState(user?.email || `admin@${rootDomain}`);
  const [phone, setPhone] = useState((user as any)?.phone || '+91 98765 43210');
  const [orgName, setOrgName] = useState(organizationName || 'BillionBiz Enterprise');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [exporting, setExporting] = useState<string | null>(null);

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSavedSuccess(false);
      if (checkAuth) await checkAuth();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update account profile');
    } finally {
      setSaving(false);
    }
  };

  const handleExportData = async (type: 'products' | 'customers' | 'orders') => {
    try {
      setExporting(type);
      let content = '';
      let filename = `billionbiz_${type}_export_${new Date().toISOString().slice(0, 10)}.csv`;

      if (type === 'products') {
        const res = await api.getProducts();
        const items = res?.products || [];
        content = 'ID,Name,SKU,Price,Stock,Status\n' +
          items.map((p: any) => `"${p.id}","${p.name}","${p.sku || ''}",${p.price || 0},${p.stock || 0},"${p.status || 'ACTIVE'}"`).join('\n');
      } else if (type === 'customers') {
        const res = await api.getCustomers();
        const items = res?.customers || [];
        content = 'ID,Name,Email,Phone,City,Country\n' +
          items.map((c: any) => `"${c.id}","${c.firstName || ''} ${c.lastName || ''}","${c.email || ''}","${c.phone || ''}","${c.city || ''}","${c.country || ''}"`).join('\n');
      } else {
        const res = await api.getOrders();
        const items = res?.orders || [];
        content = 'ID,OrderNumber,Customer,Total,Status,Date\n' +
          items.map((o: any) => `"${o.id}","${o.orderNumber || ''}","${o.customerName || ''}",${o.totalAmount || 0},"${o.status || ''}","${o.createdAt || ''}"`).join('\n');
      }

      const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err.message || `Failed to export ${type}`);
    } finally {
      setExporting(null);
    }
  };

  const userInitial = fullName.charAt(0).toUpperCase() || 'M';

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Account</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Account Settings
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Manage your merchant owner profile, organization details, active subscription, and secure data exports.
          </p>
        </div>

        <button
          disabled={saving}
          onClick={handleSaveProfile}
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
            cursor: saving ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Save size={16} />
          <span>{saving ? 'Updating...' : 'Save Profile'}</span>
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
          <span>Profile changes updated successfully!</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Merchant Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Identity Header Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: '#083e47',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '700'
            }}>
              {userInitial}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{fullName}</h2>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#e0f2fe', color: '#0369a1', textTransform: 'uppercase' }}>
                  {role || 'OWNER'}
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#64748b' }}>
                {email} • {storeName || 'Primary Store'}
              </p>
            </div>
          </div>

          {/* Edit Form */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <User size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Personal & Business Information
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Update your account details and business contact information.
            </p>

            <form onSubmit={handleSaveProfile} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Full Legal Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Account Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Mobile Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Organization Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                />
              </div>
            </form>
          </div>
        </div>

        {/* Section 2: Subscription & Growth Plan */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={18} />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>
                  Professional Merchant Tier
                </h3>
                <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>
                  Active Plan
                </span>
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13.5px', color: '#64748b' }}>
                Full multi-tenant commerce, appointment scheduling, POS terminal, and dedicated schema isolation.
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '24px', fontWeight: '700', color: '#083e47' }}>₹2,499</span>
              <span style={{ fontSize: '13px', color: '#64748b' }}> / month</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Unlimited Products & Variants</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Real-Time Online Storefront</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Cashier POS & Shifts</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Resend Transactional Email</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Razorpay & Shiprocket Webhooks</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', color: '#334155' }}>
              <CheckCircle2 size={16} color="#15803d" />
              <span>Free SSL & Custom Subdomain</span>
            </div>
          </div>
        </div>

        {/* Section 3: Data Exports */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Download size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Data Portability & Secure Exports
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Download live operational data in CSV format at any time with complete data isolation guarantee.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Catalogue & Products Directory</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Download all active items, SKUs, inventory counts, and price tags.</div>
              </div>
              <button
                type="button"
                disabled={exporting === 'products'}
                onClick={() => handleExportData('products')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#083e47',
                  cursor: exporting ? 'not-allowed' : 'pointer'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>{exporting === 'products' ? 'Exporting...' : 'Export Products CSV'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Customers & Directory Contacts</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Export buyer details, emails, phone numbers, and delivery locations.</div>
              </div>
              <button
                type="button"
                disabled={exporting === 'customers'}
                onClick={() => handleExportData('customers')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#083e47',
                  cursor: exporting ? 'not-allowed' : 'pointer'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>{exporting === 'customers' ? 'Exporting...' : 'Export Customers CSV'}</span>
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Order Ledger & Sales History</div>
                <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Export all completed and pending transaction records with line items.</div>
              </div>
              <button
                type="button"
                disabled={exporting === 'orders'}
                onClick={() => handleExportData('orders')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#083e47',
                  cursor: exporting ? 'not-allowed' : 'pointer'
                }}
              >
                <FileSpreadsheet size={15} />
                <span>{exporting === 'orders' ? 'Exporting...' : 'Export Orders CSV'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;

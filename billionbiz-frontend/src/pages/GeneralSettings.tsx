import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { 
  Save, 
  Store, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Building2
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { getStoreUrl } from '../utils/subdomain';

export const GeneralSettingsPage: React.FC = () => {
  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const [store, setStore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // General Settings Form States
  const [mode, setMode] = useState<'COMMERCE' | 'SERVICES' | 'BOTH'>('BOTH');
  const [homePage, setHomePage] = useState<'LANDING' | 'BOOKING'>('LANDING');
  const [prodCommerce, setProdCommerce] = useState(true);
  const [appointments, setAppointments] = useState(true);
  const [restaurantPos, setRestaurantPos] = useState(true);

  // Store Identity States
  const [storeName, setStoreName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [businessAddress, setBusinessAddress] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const storeId = localStorage.getItem('billionbiz_store_id') || 'store-shoum-default';
      const res = await api.getStoreDetails(storeId);
      if (res && res.store) {
        setStore(res.store);
        setMode(res.store.storefront_mode || 'BOTH');
        setHomePage(res.store.home_page || 'LANDING');
        setProdCommerce(res.store.product_commerce_enabled ?? true);
        setAppointments(res.store.appointments_enabled ?? true);
        setRestaurantPos(res.store.restaurant_pos_enabled ?? true);
        setStoreName(res.store.name || 'Chandru Store');
        setLegalName(res.store.legal_name || res.store.name || 'Chandru Commerce Private Limited');
        setSupportEmail(res.store.support_email || `support@${rootDomain}`);
        setSupportPhone(res.store.support_phone || '+91 98765 43210');
        setCurrency(res.store.currency || 'INR');
        setBusinessAddress(res.store.address || 'Bengaluru, Karnataka, India');
      }
    } catch (err) {
      console.error('Failed to load store settings', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveAll = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!store) return;
    try {
      setSaving(true);
      setSavedSuccess(false);

      await api.updateCapabilities(store.id, {
        productCommerceEnabled: prodCommerce,
        appointmentsEnabled: appointments,
        restaurantPosEnabled: restaurantPos
      });

      await api.updateStorefrontMode(store.id, {
        mode,
        homePage
      });

      // Synchronize business identity across Admin Settings & Store Editor
      await api.updateStoreIdentity(store.id, {
        name: storeName,
        currency
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
      await loadSettings();
    } catch (err: any) {
      alert(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const storeSlug = store?.slug || 'chandru-store';
  const liveStoreUrl = getStoreUrl(storeSlug);

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>General</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            General Settings
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Configure storefront operating mode, primary customer layout, brand identity, and core engine entitlements.
          </p>
        </div>

        <button
          disabled={saving || loading}
          onClick={() => handleSaveAll()}
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
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
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
          <span>General settings saved successfully! Changes are applied across your storefront and administrative dashboard.</span>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={4} columns={3} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Section 1: Store Identity & Profile */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Store Identity & Contact Details
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Business profile details printed on invoices, customer receipts, and notifications.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Display Store Name
                </label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  placeholder="Chandru Store"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Legal Business Name
                </label>
                <input
                  type="text"
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  placeholder="Chandru Commerce Pvt Ltd"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Customer Support Email
                </label>
                <input
                  type="email"
                  value={supportEmail}
                  onChange={(e) => setSupportEmail(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  placeholder={`support@${rootDomain}`}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Customer Support Phone
                </label>
                <input
                  type="tel"
                  value={supportPhone}
                  onChange={(e) => setSupportPhone(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Operating Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  Registered Business Address
                </label>
                <input
                  type="text"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                  placeholder="Bengaluru, Karnataka, India"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Storefront Mode & Layout */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Customer Storefront Operating Mode
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Choose how your online storefront presents your business to buyers. BillionBiz automatically adjusts navigation, cart, and checkout flow.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '24px' }}>
              <div
                onClick={() => {
                  setMode('COMMERCE');
                  if (!prodCommerce) setProdCommerce(true);
                }}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: mode === 'COMMERCE' ? '2px solid #083e47' : '1px solid #cbd5e1',
                  background: mode === 'COMMERCE' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>
                  Commerce Store
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Physical and digital product catalogue, product variants, shopping cart, checkout, delivery dispatch, and order fulfillment.
                </p>
              </div>

              <div
                onClick={() => {
                  setMode('SERVICES');
                  if (!appointments) setAppointments(true);
                  setHomePage('BOOKING');
                }}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: mode === 'SERVICES' ? '2px solid #083e47' : '1px solid #cbd5e1',
                  background: mode === 'SERVICES' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>
                  Services & Appointments
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Appointment scheduling, service offerings, calendar booking, staff availability, and reservation deposits. Hides product cart.
                </p>
              </div>

              <div
                onClick={() => {
                  setMode('BOTH');
                  if (!prodCommerce) setProdCommerce(true);
                  if (!appointments) setAppointments(true);
                }}
                style={{
                  padding: '18px',
                  borderRadius: '10px',
                  border: mode === 'BOTH' ? '2px solid #083e47' : '1px solid #cbd5e1',
                  background: mode === 'BOTH' ? '#f0fdfa' : '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontWeight: '700', fontSize: '15px', color: '#0f172a', marginBottom: '6px' }}>
                  Unified Hybrid (Both)
                </div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0, lineHeight: 1.45 }}>
                  Full unified commerce: sell products and book services side by side with shared customers, unified cart, and unified reporting.
                </p>
              </div>
            </div>

            {/* Default Landing Experience */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '18px', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: '600', color: '#0f172a', marginBottom: '8px' }}>
                Default Storefront Entry Page
              </label>
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="homepage"
                    checked={homePage === 'LANDING'}
                    onChange={() => setHomePage('LANDING')}
                  />
                  <span>Store Landing Page (Hero banner, Collections, Featured Products)</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13.5px', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="homepage"
                    checked={homePage === 'BOOKING'}
                    onChange={() => setHomePage('BOOKING')}
                  />
                  <span>Direct Booking Funnel (Instant calendar and service slot picker)</span>
                </label>
              </div>
            </div>

            {/* Live Preview Bar */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '14px' }}>Active Storefront Preview</span>
                <div style={{ fontSize: '12.5px', color: '#64748b', marginTop: '2px' }}>Mode: <strong>{mode}</strong> • Entry: <strong>{homePage}</strong></div>
              </div>
              <a
                href={liveStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', color: '#083e47', textDecoration: 'none' }}
              >
                <span>Visit Storefront</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>

          {/* Section 3: Core Capabilities */}
          <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Layers size={18} />
              </div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
                Core Engine Entitlements
              </h3>
            </div>
            <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
              Toggle backend feature engines and administrative dashboard navigation for your workspace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Product Commerce Engine</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Inventory management, product variants, price lists, and shipping dispatch.</div>
                </div>
                <input
                  type="checkbox"
                  checked={prodCommerce}
                  onChange={(e) => setProdCommerce(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Appointments & Booking Engine</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Staff scheduling, customer booking calendar, and service slots.</div>
                </div>
                <input
                  type="checkbox"
                  checked={appointments}
                  onChange={(e) => setAppointments(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f8fafc', borderRadius: '10px', cursor: 'pointer', border: '1px solid #e2e8f0' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Cashier POS & Counters</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '2px' }}>Physical retail checkout terminal, cash drawers, shifts, and barcode scanner.</div>
                </div>
                <input
                  type="checkbox"
                  checked={restaurantPos}
                  onChange={(e) => setRestaurantPos(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
              </label>
            </div>
          </div>

          {/* Bottom Save Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              disabled={saving || loading}
              onClick={() => handleSaveAll()}
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
                cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <Save size={16} />
              <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneralSettingsPage;

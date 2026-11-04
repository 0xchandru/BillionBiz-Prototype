import React, { useState } from 'react';
import { 
  Building2, Globe, 
  ChevronDown, Shield, FileText,
  Compass, Bell, ArrowRight, MessageCircle, Sparkles,
  Check, Mail, Clock, Plug, Code, Key, Copy
} from 'lucide-react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import styles from '../../pages/editor/EditorLayout.module.css';
import type { SettingsSection } from '../../store/landingEditorStore';
import { CardHeader } from './ui/CardHeader';

export const SettingsRenderer: React.FC = () => {
  const { settingsSection, setSettingsSection, setActivePanel, setBrandSection } = useLandingEditorStore();
  const { settings, updateSettings } = useSiteStore();
  const [copiedKey, setCopiedKey] = useState(false);

  const currentSection: SettingsSection = settingsSection || 'launch-checklist';

  const copyApiKey = () => {
    navigator.clipboard?.writeText('bb_live_9f8384819d9b8e21a8f903847');
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>
            {(currentSection === 'setup' || currentSection === 'launch-checklist') && 'Store Setup & Launch Guide'}
            {currentSection === 'general' && 'Store Profile & Identity'}
            {currentSection === 'refund-policy' && 'Refund & Returns Policy'}
            {currentSection === 'privacy-policy' && 'Privacy Policy & GDPR Compliance'}
            {currentSection === 'terms-of-service' && 'Terms of Service & Agreements'}
            {currentSection === 'shipping-policy' && 'Shipping & Delivery Policy'}
            {currentSection === 'policies' && 'Store Policies & Legal Terms'}
            {(currentSection === 'language' || currentSection === 'language-region') && 'Language, Region & Currency'}
            {currentSection === 'notifications' && 'Storefront Alerts & Notifications'}
            {currentSection === 'integrations' && 'Third-Party Integrations & Marketing'}
            {currentSection === 'custom-code' && 'Custom Code & Script Injection'}
            {currentSection === 'api-webhooks' && 'API Keys & Developer Webhooks'}
          </h2>
          <p>
            {(currentSection === 'setup' || currentSection === 'launch-checklist') && 'Track your launch readiness, verify essential store configurations, and prepare your storefront for customers.'}
            {currentSection === 'general' && 'Store details, profile, contacts, and physical address have moved to Brand.'}
            {currentSection === 'refund-policy' && 'Manage customer return eligibility windows, refund processing rules, and return conditions.'}
            {currentSection === 'privacy-policy' && 'Configure customer data privacy, GDPR compliance statements, and cookies consent.'}
            {currentSection === 'terms-of-service' && 'Establish binding legal terms, store ordering rules, and acceptable usage agreements.'}
            {currentSection === 'shipping-policy' && 'Specify order fulfillment timeframes, delivery destinations, and shipping terms.'}
            {currentSection === 'policies' && 'Manage your customer-facing refund policy, terms of service, privacy policy, and delivery guidelines.'}
            {(currentSection === 'language' || currentSection === 'language-region') && 'Configure storefront default display language, currency symbol placement, unit systems, and date formatting.'}
            {currentSection === 'notifications' && 'Manage storefront top announcement banners, customer support WhatsApp chat, and order alert emails.'}
            {currentSection === 'integrations' && 'Connect analytics tracking pixels, live support chat widgets, and advertising tools.'}
            {currentSection === 'custom-code' && 'Safely inject custom CSS or JavaScript snippets into the storefront <head> and <body>.'}
            {currentSection === 'api-webhooks' && 'Access developer API keys and configure real-time store event webhook triggers.'}
          </p>
        </div>

        {/* ── 1. STORE SETUP & LAUNCH GUIDE ── */}
        {(currentSection === 'setup' || currentSection === 'launch-checklist') && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Compass size={18} />}
                  iconBg="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  title="Launch Readiness Checklist"
                  description="Complete these core store foundations before going live"
                  badgeText="83% Ready"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  {/* Progress Bar */}
                  <div style={{ marginBottom: '20px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>Setup Progress</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0284c7' }}>5 of 6 steps completed</span>
                    </div>
                    <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: '83.33%', height: '100%', background: 'linear-gradient(90deg, #0284c7 0%, #06b6d4 100%)', borderRadius: '4px' }} />
                    </div>
                  </div>

                  {/* Checklist Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {/* Step 1 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <Check size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>1. Store Name &amp; Profile</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>"{settings.storeName || 'My Store'}" configured</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          setBrandSection('store-profile');
                          setActivePanel('brand');
                        }}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Edit in Brand
                      </button>
                    </div>

                    {/* Step 2 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                          <Check size={14} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>2. Global Theme &amp; Brand Colors</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Design system styling applied</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setActivePanel('design')}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#fff', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Design
                      </button>
                    </div>

                    {/* Step 3 */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                          <Clock size={13} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>3. Store Policies &amp; Legal</div>
                          <div style={{ fontSize: '11.5px', color: '#64748b' }}>Refund, Privacy, and Terms</div>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSettingsSection('refund-policy')}
                        style={{ fontSize: '12px', padding: '4px 10px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.scCol}>
              {/* Store Status Card */}
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Sparkles size={18} />}
                  iconBg="linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)"
                  title="Storefront Publication Status"
                  description="Control public visibility of your online store"
                  badgeText="Live"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Storefront Password Protection</span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Lock storefront behind a password while in pre-launch</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.passwordProtection || false}
                      onChange={(e) => updateSettings({ passwordProtection: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Maintenance Notice Message</label>
                    <textarea
                      rows={3}
                      value={settings.maintenanceMessage || 'Our storefront is currently undergoing scheduled updates. Please check back shortly!'}
                      onChange={(e) => updateSettings({ maintenanceMessage: e.target.value })}
                      placeholder="Maintenance notice..."
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 2. GENERAL (MOVED TO BRAND DEDUPLICATION NOTICE) ── */}
        {currentSection === 'general' && (
          <div className={styles.scGrid}>
            <div className={styles.scCol} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.scCard} style={{ textAlign: 'center', padding: '48px 24px' }}>
                <Building2 size={42} color="#6366f1" style={{ margin: '0 auto 16px', opacity: 0.9 }} />
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>
                  Store Profile &amp; Details have moved to Brand
                </h3>
                <p style={{ fontSize: '14px', color: '#64748b', maxWidth: '520px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  To eliminate duplicate settings across tabs, your store name, tagline, contacts, and official business address are now centralized under <strong>Brand &gt; Identity</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setBrandSection('store-profile');
                    setActivePanel('brand');
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '8px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                  }}
                >
                  <span>Go to Brand &gt; Identity</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── 3. REFUND & RETURN POLICY ── */}
        {(currentSection === 'refund-policy' || currentSection === 'policies') && (
          <div className={styles.scGrid} style={{ marginBottom: currentSection === 'policies' ? '20px' : '0' }}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Shield size={18} />}
                  iconBg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                  title="Refund &amp; Return Policy"
                  description="Customer return eligibility, reimbursement terms & restocking rules"
                  badgeText="Legal"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div className={styles.formRowHalf}>
                    <div className={styles.scFormGroup}>
                      <label>Return Window (Days)</label>
                      <input
                        type="number"
                        value={settings.returnWindowDays || 30}
                        onChange={(e) => updateSettings({ returnWindowDays: parseInt(e.target.value) || 30 })}
                        min={0}
                        max={365}
                      />
                    </div>
                    <div className={styles.scFormGroup}>
                      <label>Refund Processing Time</label>
                      <input
                        type="text"
                        value={settings.refundProcessingTime || '5–7 Business Days'}
                        onChange={(e) => updateSettings({ refundProcessingTime: e.target.value })}
                        placeholder="5–7 Business Days"
                      />
                    </div>
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Full Refund Policy Text</label>
                    <textarea
                      rows={6}
                      value={settings.refundPolicyText || 'We accept returns within 30 days of receipt. Items must be in original condition with all tags attached. Refunds are processed within 5-7 business days to the original payment method.'}
                      onChange={(e) => updateSettings({ refundPolicyText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. PRIVACY POLICY ── */}
        {(currentSection === 'privacy-policy' || currentSection === 'policies') && (
          <div className={styles.scGrid} style={{ marginBottom: currentSection === 'policies' ? '20px' : '0' }}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<FileText size={18} />}
                  iconBg="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                  title="Privacy Policy &amp; GDPR Notice"
                  description="Customer data processing, cookies usage, and privacy disclosures"
                  badgeText="GDPR"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'block' }}>Require Explicit Cookie Consent</span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Show GDPR/CCPA cookie banner to first-time visitors</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.cookieConsentEnabled !== false}
                      onChange={(e) => updateSettings({ cookieConsentEnabled: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                    />
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Privacy Policy Statement</label>
                    <textarea
                      rows={6}
                      value={settings.privacyPolicyText || 'We value your privacy. We collect personal data solely to process orders, improve browsing experiences, and communicate order updates. We do not sell your personal information to third parties.'}
                      onChange={(e) => updateSettings({ privacyPolicyText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. TERMS OF SERVICE ── */}
        {(currentSection === 'terms-of-service' || currentSection === 'policies') && (
          <div className={styles.scGrid} style={{ marginBottom: currentSection === 'policies' ? '20px' : '0' }}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<FileText size={18} />}
                  iconBg="linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)"
                  title="Terms of Service"
                  description="Terms governing order placement, payment rules, and account usage"
                  badgeText="Required"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Terms of Service Agreement</label>
                    <textarea
                      rows={6}
                      value={settings.termsOfServiceText || 'By placing an order on our store, you agree to these Terms of Service. Prices and availability are subject to change without notice. All intellectual property remains the property of the store owner.'}
                      onChange={(e) => updateSettings({ termsOfServiceText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 6. SHIPPING POLICY ── */}
        {(currentSection === 'shipping-policy' || currentSection === 'policies') && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<FileText size={18} />}
                  iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  title="Shipping &amp; Delivery Policy"
                  description="Shipping rates, estimated delivery timelines, and international orders"
                />
                <div className={styles.cardBody}>
                  <div className={styles.formRowHalf}>
                    <div className={styles.scFormGroup}>
                      <label>Estimated Standard Delivery</label>
                      <input
                        type="text"
                        value={settings.standardDeliveryDays || '3–5 Business Days'}
                        onChange={(e) => updateSettings({ standardDeliveryDays: e.target.value })}
                        placeholder="3–5 Business Days"
                      />
                    </div>
                    <div className={styles.scFormGroup}>
                      <label>Free Shipping Minimum Cart Value</label>
                      <input
                        type="text"
                        value={settings.freeShippingThreshold || '$50'}
                        onChange={(e) => updateSettings({ freeShippingThreshold: e.target.value })}
                        placeholder="$50"
                      />
                    </div>
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Shipping Guidelines &amp; Exceptions</label>
                    <textarea
                      rows={5}
                      value={settings.shippingPolicyText || 'Orders are processed Monday through Friday. Standard shipping takes 3-5 business days. Tracking numbers are emailed upon order dispatch.'}
                      onChange={(e) => updateSettings({ shippingPolicyText: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 7. LANGUAGE & CURRENCY ── */}
        {(currentSection === 'language' || currentSection === 'language-region') && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Globe size={18} />}
                  iconBg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  title="Storefront Display Language"
                  description="Default language displayed to incoming visitors"
                  badgeText="Locale"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Default Store Language</label>
                    <div className={styles.selectBoxFull} style={{ position: 'relative' }}>
                      <select
                        value={settings.storeLanguage || 'en'}
                        onChange={(e) => updateSettings({ storeLanguage: e.target.value })}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', appearance: 'none', paddingRight: '20px' }}
                      >
                        <option value="en">English (United States / Global)</option>
                        <option value="es">Español (Spanish)</option>
                        <option value="fr">Français (French)</option>
                        <option value="de">Deutsch (German)</option>
                        <option value="hi">हिन्दी (Hindi)</option>
                        <option value="ar">العربية (Arabic)</option>
                        <option value="ja">日本語 (Japanese)</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<FileText size={18} />}
                  iconBg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                  title="Currency &amp; Formatting"
                  description="Display currency symbols, positioning and date rules"
                  badgeText="Active"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Storefront Display Currency</label>
                    <div className={styles.selectBoxFull} style={{ position: 'relative' }}>
                      <select
                        value={settings.currency || 'USD ($)'}
                        onChange={(e) => updateSettings({ currency: e.target.value })}
                        style={{ width: '100%', border: 'none', background: 'transparent', outline: 'none', appearance: 'none', paddingRight: '20px' }}
                      >
                        <option value="USD ($)">USD — United States Dollar ($)</option>
                        <option value="INR (₹)">INR — Indian Rupee (₹)</option>
                        <option value="EUR (€)">EUR — Euro (€)</option>
                        <option value="GBP (£)">GBP — British Pound (£)</option>
                        <option value="CAD ($)">CAD — Canadian Dollar ($)</option>
                        <option value="AUD ($)">AUD — Australian Dollar ($)</option>
                        <option value="AED (د.إ)">AED — United Arab Emirates Dirham (د.إ)</option>
                        <option value="SGD ($)">SGD — Singapore Dollar ($)</option>
                        <option value="JPY (¥)">JPY — Japanese Yen (¥)</option>
                      </select>
                      <ChevronDown size={14} style={{ position: 'absolute', right: '12px', top: '12px', pointerEvents: 'none' }} />
                    </div>
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Currency Symbol Position</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {['before', 'after'].map(pos => (
                        <button
                          key={pos}
                          type="button"
                          onClick={() => updateSettings({ currencyPos: pos })}
                          style={{
                            flex: 1, padding: '7px', borderRadius: '6px',
                            border: `1px solid ${ (settings.currencyPos || 'before') === pos ? '#2563eb' : '#cbd5e1' }`,
                            background: (settings.currencyPos || 'before') === pos ? '#eff6ff' : '#fff',
                            color: (settings.currencyPos || 'before') === pos ? '#1d4ed8' : '#475569',
                            fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                          }}
                        >
                          {pos === 'before' ? '$99.00 (Before)' : '99.00$ (After)'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 8. STOREFRONT ALERTS & NOTIFICATIONS ── */}
        {currentSection === 'notifications' && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              {/* Top Announcement Bar */}
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Bell size={18} />}
                  iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                  title="Storefront Announcement Banner"
                  description="Top header banner for discounts, urgent updates or store news"
                  badgeText="Header"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '14px' }}>
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: '#0f172a' }}>Enable Announcement Bar</span>
                      <span style={{ fontSize: '11.5px', color: '#64748b' }}>Show promotional bar above the header</span>
                    </div>
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px' }}
                      checked={settings.announcementBarEnabled !== false}
                      onChange={(e) => updateSettings({ announcementBarEnabled: e.target.checked })}
                    />
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Announcement Headline Text</label>
                    <input
                      type="text"
                      value={settings.announcementText || 'Free express shipping on all orders over $75 • Use code LAUNCH20'}
                      onChange={(e) => updateSettings({ announcementText: e.target.value })}
                      placeholder="Free shipping notice..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.scCol}>
              {/* Order Notification Recipient */}
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Mail size={18} />}
                  iconBg="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                  title="Order Notification Recipient"
                  description="Email address to receive customer order notifications"
                  badgeText="Alerts"
                  badgeType="active"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Store Manager Notification Email</label>
                    <input
                      type="email"
                      value={settings.orderAlertEmail || settings.supportEmail || 'orders@billionbiz.com'}
                      onChange={(e) => updateSettings({ orderAlertEmail: e.target.value })}
                      placeholder="orders@billionbiz.com"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 9. ADVANCED: INTEGRATIONS ── */}
        {currentSection === 'integrations' && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Plug size={18} />}
                  iconBg="linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)"
                  title="Analytics &amp; Tracking Pixels"
                  description="Connect Google Analytics, Meta Pixel, and TikTok tracking"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Google Analytics Measurement ID (GA4)</label>
                    <input
                      type="text"
                      value={settings.googleAnalyticsId || ''}
                      onChange={(e) => updateSettings({ googleAnalyticsId: e.target.value })}
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Meta (Facebook) Pixel ID</label>
                    <input
                      type="text"
                      value={settings.metaPixelId || ''}
                      onChange={(e) => updateSettings({ metaPixelId: e.target.value })}
                      placeholder="e.g. 123456789012345"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<MessageCircle size={18} />}
                  iconBg="linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)"
                  title="Live Chat Integrations"
                  description="Connect customer support chat providers"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Intercom / Crisp App ID</label>
                    <input
                      type="text"
                      value={settings.chatAppId || ''}
                      onChange={(e) => updateSettings({ chatAppId: e.target.value })}
                      placeholder="e.g. abcd1234"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 10. ADVANCED: CUSTOM CODE ── */}
        {currentSection === 'custom-code' && (
          <div className={styles.scGrid}>
            <div className={styles.scCol} style={{ gridColumn: '1 / -1' }}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Code size={18} />}
                  iconBg="linear-gradient(135deg, #0f172a 0%, #334155 100%)"
                  title="Custom Script &amp; Code Injection"
                  description="Inject external tracking, fonts, or custom scripts into page header and body"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Header Scripts (Appended inside &lt;head&gt;)</label>
                    <textarea
                      rows={5}
                      value={settings.customHeadScripts || ''}
                      onChange={(e) => updateSettings({ customHeadScripts: e.target.value })}
                      placeholder="<!-- Paste your custom tracking scripts here -->"
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Body Footer Scripts (Appended before &lt;/body&gt;)</label>
                    <textarea
                      rows={5}
                      value={settings.customBodyScripts || ''}
                      onChange={(e) => updateSettings({ customBodyScripts: e.target.value })}
                      placeholder="<!-- Paste your custom footer code here -->"
                      style={{ fontFamily: 'monospace', fontSize: '12px' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── 11. ADVANCED: API & WEBHOOKS ── */}
        {currentSection === 'api-webhooks' && (
          <div className={styles.scGrid}>
            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Key size={18} />}
                  iconBg="linear-gradient(135deg, #d97706 0%, #b45309 100%)"
                  title="Store API Credentials"
                  description="Use these keys to access your store data programmatically"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Live API Secret Key</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="password"
                        readOnly
                        value="bb_live_9f8384819d9b8e21a8f903847"
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                      />
                      <button
                        type="button"
                        onClick={copyApiKey}
                        style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px' }}
                      >
                        {copiedKey ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                        <span>{copiedKey ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.scCol}>
              <div className={styles.scCard}>
                <CardHeader
                  icon={<Globe size={18} />}
                  iconBg="linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)"
                  title="Webhook Notifications"
                  description="Receive HTTP POST payloads when store orders or customer events occur"
                />
                <div className={styles.cardBody}>
                  <div className={styles.scFormGroup}>
                    <label>Order Created Webhook Endpoint URL</label>
                    <input
                      type="url"
                      value={settings.orderWebhookUrl || ''}
                      onChange={(e) => updateSettings({ orderWebhookUrl: e.target.value })}
                      placeholder="https://api.yourdomain.com/webhooks/orders"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

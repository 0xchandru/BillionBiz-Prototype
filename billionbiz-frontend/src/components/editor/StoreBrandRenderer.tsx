import React, { useState } from 'react';
import { useLandingEditorStore } from '../../store/landingEditorStore';
import { useSiteStore } from '../../store/siteStore';
import { SeoGrowthRenderer } from './SeoGrowthRenderer';
import styles from '../../pages/editor/EditorLayout.module.css';
import {
  Building2, Phone, MapPin, Clock, Globe, FileText,
  Image, Upload, Palette, Type,
  Link2, Plus, Trash2, GripVertical, Eye,
  Shield, Copy, Check
} from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
);
const FacebookIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);
const TwitterIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733 -16z"/><path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772"/></svg>
);
const YoutubeIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
);
const LinkedinIcon: React.FC<{ size?: number }> = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);

const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15ZM16.56 14.39C16.31 14.26 15.09 13.66 14.86 13.58C14.63 13.5 14.47 13.46 14.31 13.71C14.15 13.95 13.69 14.5 13.55 14.66C13.41 14.82 13.27 14.84 13.02 14.72C12.77 14.59 11.98 14.33 11.04 13.49C10.3 12.84 9.8 12.03 9.66 11.78C9.52 11.54 9.64 11.4 9.77 11.28C9.88 11.17 10.02 10.99 10.14 10.84C10.27 10.7 10.31 10.59 10.39 10.43C10.47 10.27 10.43 10.13 10.37 10.01C10.31 9.89 9.83 8.7 9.62 8.21C9.43 7.73 9.23 7.79 9.07 7.78C8.93 7.78 8.76 7.77 8.6 7.77C8.44 7.77 8.17 7.83 7.95 8.07C7.72 8.32 7.09 8.91 7.09 10.11C7.09 11.32 7.97 12.48 8.09 12.64C8.21 12.8 9.82 15.28 12.28 16.34C12.87 16.59 13.32 16.74 13.68 16.85C14.27 17.04 14.81 17.01 15.24 16.95C15.72 16.88 16.71 16.35 16.92 15.76C17.12 15.17 17.12 14.66 17.06 14.56C17 14.45 16.82 14.39 16.56 14.39Z"
    />
  </svg>
);

const renderSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case 'instagram': return <InstagramIcon size={14} />;
    case 'facebook': return <FacebookIcon size={14} />;
    case 'twitter / x':
    case 'twitter': return <TwitterIcon size={14} />;
    case 'youtube': return <YoutubeIcon size={14} />;
    case 'linkedin': return <LinkedinIcon size={14} />;
    default: return <Link2 size={14} />;
  }
};

// Premium Card Header component — imported from shared ui module
import { CardHeader } from './ui/CardHeader';

export const StoreBrandRenderer: React.FC = () => {
  const { brandSection, storeBrandSection } = useLandingEditorStore();
  const { settings, updateSettings } = useSiteStore();
  const section = brandSection || storeBrandSection || 'store-profile';

  if (section === 'branding' || section === 'logo-favicon') {
    return <BrandingView settings={settings} updateSettings={updateSettings} />;
  }

  if (section === 'business-details') {
    return <BusinessDetailsView settings={settings} updateSettings={updateSettings} />;
  }

  if (section === 'socials' || section === 'social-profiles') {
    return <SocialsView settings={settings} updateSettings={updateSettings} />;
  }

  if (section === 'whatsapp') {
    return <WhatsAppView settings={settings} updateSettings={updateSettings} />;
  }

  if (section === 'domain-urls') {
    return <DomainUrlsView settings={settings} updateSettings={updateSettings} />;
  }

  if (section === 'seo' || section === 'global-seo' || section === 'social-sharing' || section === 'indexing' || section === 'page-seo' || section === 'structured-data') {
    return <SeoGrowthRenderer />;
  }

  return <GeneralView settings={settings} updateSettings={updateSettings} />;
};

export const BrandRenderer = StoreBrandRenderer;

// ─── GENERAL VIEW ───
const GeneralView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  const [useCustomHours, setUseCustomHours] = useState(settings.useCustomHours || false);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Store & Brand — General Identity & Info</h2>
          <p>Configure your business identity, customer support channels, business address, operating hours, and tax information.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Column 1: Core Store Info & Regional */}
          <div className={styles.scCol}>
            {/* Store Identity */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Building2 size={18} />}
                iconBg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                title="Store Identity"
                description="Primary business identity & storefront description"
                badgeText="Required"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Business &amp; Store Name</label>
                <input type="text" value={settings.storeName || settings.siteName || ''} onChange={(e) => updateSettings({ storeName: e.target.value, name: e.target.value })} placeholder="Store Name" />
                <span style={{ fontSize: '11px', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  Inherited from and synchronized with Admin Settings. Changes update across your platform automatically.
                </span>
              </div>
              <div className={styles.scFormGroup}>
                <label>Legal Business Name</label>
                <input type="text" value={settings.legalName || ''} onChange={(e) => updateSettings({ legalName: e.target.value })} placeholder="BillionBiz Technologies Inc." />
              </div>
              <div className={styles.scFormGroup}>
                <label>Tagline</label>
                <input type="text" value={settings.tagline || ''} onChange={(e) => updateSettings({ tagline: e.target.value })} placeholder="Build, Launch &amp; Scale Your Brand" />
              </div>
              <div className={styles.scFormGroup}>
                <label>Brand Description</label>
                <textarea rows={3} value={settings.brandDescription || settings.siteDescription || ''} onChange={(e) => updateSettings({ brandDescription: e.target.value })} placeholder="A compelling short bio for your storefront..." />
                <span className={styles.scCharCount}>{(settings.brandDescription || settings.siteDescription || '').length} characters</span>
              </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Phone size={18} />}
                iconBg="linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)"
                title="Support Contact"
                description="Direct communication channels for customer inquiries"
                badgeText="Configured"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Support Email</label>
                <input type="email" value={settings.supportEmail || settings.contactEmail || ''} onChange={(e) => updateSettings({ supportEmail: e.target.value })} placeholder="support@yourbrand.com" />
              </div>
              <div className={styles.scFormGroup}>
                <label>Support Phone</label>
                <input type="tel" value={settings.supportPhone || ''} onChange={(e) => updateSettings({ supportPhone: e.target.value })} placeholder="+1 (555) 123-4567" />
              </div>
              <div className={styles.scFormGroup}>
                <label>WhatsApp Number</label>
                <input type="tel" value={settings.whatsappNumber || ''} onChange={(e) => updateSettings({ whatsappNumber: e.target.value })} placeholder="+15551234567" />
                <span className={styles.scHint}>Format with country code (e.g. +14155552671)</span>
              </div>
              </div>
            </div>

            {/* Regional Settings */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Globe size={18} />}
                iconBg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                title="Regional & Locale"
                description="Storefront timezone, primary currency, and language"
                badgeText="Active"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Timezone</label>
                <select value={settings.timezone || 'UTC'} onChange={(e) => updateSettings({ timezone: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }}>
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US &amp; Canada)</option>
                  <option value="America/Chicago">Central Time (US &amp; Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US &amp; Canada)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Paris">Paris, Berlin (CET)</option>
                  <option value="Asia/Kolkata">India Standard Time (IST)</option>
                  <option value="Asia/Tokyo">Tokyo (JST)</option>
                  <option value="Australia/Sydney">Sydney (AEST)</option>
                </select>
              </div>

              <div className={styles.scFormGroup}>
                <label>Storefront Currency</label>
                <select value={settings.currency || 'USD'} onChange={(e) => updateSettings({ currency: e.target.value })} style={{ width: '100%', padding: '9px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px' }}>
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                </select>
              </div>
              </div>
            </div>
          </div>

          {/* Column 2: Operations, Address & Compliance */}
          <div className={styles.scCol}>
            {/* Business Address */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<MapPin size={18} />}
                iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                title="Business Address"
                description="Physical store or registered corporate headquarters"
                badgeText="Optional"
                badgeType="optional"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Address Line 1</label>
                <input type="text" value={settings.addressLine1 || ''} onChange={(e) => updateSettings({ addressLine1: e.target.value })} placeholder="123 Commerce Way" />
              </div>
              <div className={styles.scFormGroup}>
                <label>Address Line 2</label>
                <input type="text" value={settings.addressLine2 || ''} onChange={(e) => updateSettings({ addressLine2: e.target.value })} placeholder="Suite 400" />
              </div>
              <div className={styles.formRowHalf}>
                <div className={styles.scFormGroup}>
                  <label>City</label>
                  <input type="text" value={settings.city || ''} onChange={(e) => updateSettings({ city: e.target.value })} placeholder="San Francisco" />
                </div>
                <div className={styles.scFormGroup}>
                  <label>State / Province</label>
                  <input type="text" value={settings.state || ''} onChange={(e) => updateSettings({ state: e.target.value })} placeholder="CA" />
                </div>
              </div>
              <div className={styles.formRowHalf}>
                <div className={styles.scFormGroup}>
                  <label>Postal Code</label>
                  <input type="text" value={settings.postalCode || ''} onChange={(e) => updateSettings({ postalCode: e.target.value })} placeholder="94105" />
                </div>
                <div className={styles.scFormGroup}>
                  <label>Country</label>
                  <input type="text" value={settings.country || ''} onChange={(e) => updateSettings({ country: e.target.value })} placeholder="United States" />
                </div>
              </div>
              </div>
            </div>

            {/* Business Hours */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Clock size={18} />}
                iconBg="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
                title="Business Hours"
                description="Customer-facing operating schedule"
                badgeText="Optional"
                badgeType="optional"
              />
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <input
                    type="checkbox"
                    checked={useCustomHours}
                    onChange={(e) => {
                      setUseCustomHours(e.target.checked);
                      updateSettings({ useCustomHours: e.target.checked });
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Use custom text instead</span>
                </div>
              {useCustomHours ? (
                <div className={styles.scFormGroup}>
                  <label>Custom Hours Summary Text</label>
                  <textarea
                    rows={4}
                    value={settings.businessHoursText || ''}
                    onChange={(e) => updateSettings({ businessHoursText: e.target.value })}
                    placeholder="e.g. Monday - Friday: 9am - 7pm EST&#10;Saturday: 10am - 4pm&#10;Sunday: Closed"
                  />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {daysOfWeek.map((day) => (
                    <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', width: '80px' }}>{day}</span>
                      <input
                        type="text"
                        value={settings[`hours_${day}`] || (['Saturday', 'Sunday'].includes(day) ? 'Closed' : '9:00 AM - 6:00 PM')}
                        onChange={(e) => updateSettings({ [`hours_${day}`]: e.target.value })}
                        placeholder="e.g. 9:00 AM - 6:00 PM or Closed"
                        style={{ flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              </div>
            </div>

            {/* Legal & Tax ID */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<FileText size={18} />}
                iconBg="linear-gradient(135deg, #ef4444 0%, #dc2626 100%)"
                title="Legal & Tax Compliance"
                description="Government identifiers for invoicing & customer receipts"
                badgeText="Optional"
                badgeType="optional"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Tax ID / GST / VAT / VRN</label>
                <input type="text" value={settings.taxId || ''} onChange={(e) => updateSettings({ taxId: e.target.value })} placeholder="e.g. US-EIN-123456789 or GSTIN29ABCDE1234F1Z5" />
              </div>
              <div className={styles.scFormGroup}>
                <label>Business Registration Number (BRN / CIN)</label>
                <input type="text" value={settings.businessRegNumber || ''} onChange={(e) => updateSettings({ businessRegNumber: e.target.value })} placeholder="e.g. REG-2026-987654" />
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BRANDING VIEW ───
const BrandingView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Store &amp; Brand — Branding &amp; Visual Identity</h2>
          <p>Maintain consistent brand assets across desktop and mobile: logos, favicons, brand palette, and typography.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Column 1: Brand Assets */}
          <div className={styles.scCol}>
            {/* Logo & Dark Logo */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Image size={18} />}
                iconBg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                title="Brand Logo Assets"
                description="Main light storefront logo and dark mode equivalent"
                badgeText="Required"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Main Storefront Logo</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '20px', textAlign: 'center', background: '#fafbfc' }}>
                  {settings.mainLogo ? (
                    <img src={settings.mainLogo} alt="Main Logo" style={{ maxHeight: '52px', maxWidth: '220px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ color: '#94a3b8' }}>
                      <Upload size={22} style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, fontSize: '12px' }}>Upload main logo (PNG, SVG, WebP)</p>
                    </div>
                  )}
                </div>
                <input 
                  type="url" 
                  value={settings.mainLogo || ''} 
                  onChange={(e) => updateSettings({ mainLogo: e.target.value })} 
                  placeholder="Paste image URL (e.g. https://...)" 
                  style={{ marginTop: '8px' }} 
                />
              </div>

              <div className={styles.scFormGroup}>
                <label>Dark-mode Logo (Optional)</label>
                <div style={{ border: '2px dashed #475569', borderRadius: '10px', padding: '20px', textAlign: 'center', background: '#0f172a' }}>
                  {settings.darkLogo ? (
                    <img src={settings.darkLogo} alt="Dark Logo" style={{ maxHeight: '52px', maxWidth: '220px', objectFit: 'contain' }} />
                  ) : (
                    <div style={{ color: '#94a3b8' }}>
                      <Upload size={22} style={{ marginBottom: '6px' }} />
                      <p style={{ margin: 0, fontSize: '12px' }}>Upload logo for dark surfaces</p>
                    </div>
                  )}
                </div>
                <input 
                  type="url" 
                  value={settings.darkLogo || ''} 
                  onChange={(e) => updateSettings({ darkLogo: e.target.value })} 
                  placeholder="Paste dark logo image URL..." 
                  style={{ marginTop: '8px' }} 
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
                  <input
                    type="checkbox"
                    id="fallbackMainLogo"
                    checked={settings.fallbackToMainLogo !== false}
                    onChange={(e) => updateSettings({ fallbackToMainLogo: e.target.checked })}
                  />
                  <label htmlFor="fallbackMainLogo" style={{ fontSize: '12px', color: '#64748b', cursor: 'pointer', margin: 0 }}>
                    Automatically fallback to Main Logo when Dark Logo is not configured
                  </label>
                </div>
              </div>
              </div>
            </div>

            {/* Favicon & Web App Icon */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Globe size={18} />}
                iconBg="linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)"
                title="Favicon & App Icons"
                description="Browser tab icon and mobile homescreen bookmark (32×32px recommended)"
                badgeText="Recommended"
                badgeType="pending"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Browser Favicon</label>
                <div style={{ border: '2px dashed #cbd5e1', borderRadius: '10px', padding: '16px', textAlign: 'center', background: '#fafbfc' }}>
                  {settings.favicon ? (
                    <img src={settings.favicon} alt="Favicon" style={{ width: '32px', height: '32px' }} />
                  ) : (
                    <div style={{ color: '#94a3b8' }}>
                      <Upload size={18} />
                      <p style={{ margin: '4px 0 0', fontSize: '12px' }}>Upload .ico or .png favicon</p>
                    </div>
                  )}
                </div>
                <input 
                  type="url" 
                  value={settings.favicon || ''} 
                  onChange={(e) => updateSettings({ favicon: e.target.value })} 
                  placeholder="https://..." 
                  style={{ marginTop: '8px' }} 
                />
              </div>

              <div className={styles.scFormGroup}>
                <label>Apple Touch / Mobile App Icon</label>
                <input 
                  type="url" 
                  value={settings.appleTouchIcon || ''} 
                  onChange={(e) => updateSettings({ appleTouchIcon: e.target.value })} 
                  placeholder="https://... (180×180px PNG)" 
                />
                <span className={styles.scHint}>Icon used when visitors save your storefront to mobile homescreen</span>
              </div>
              </div>
            </div>
          </div>

          {/* Column 2: Design Tokens & Typography */}
          <div className={styles.scCol}>
            {/* Brand Colors */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Palette size={18} />}
                iconBg="linear-gradient(135deg, #ec4899 0%, #db2777 100%)"
                title="Brand Colors"
                description="Core color tokens used throughout the entire customer experience"
                badgeText="Active"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              {[
                { key: 'primary', label: 'Primary Brand Color', default: '#198754' },
                { key: 'secondary', label: 'Secondary / Accent Color', default: '#ff6b00' },
                { key: 'accent', label: 'Highlight / Pill Color', default: '#6366f1' },
              ].map(c => (
                <div className={styles.scFormGroup} key={c.key}>
                  <label>{c.label}</label>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={settings[`brandColor_${c.key}`] || c.default}
                      onChange={(e) => updateSettings({ [`brandColor_${c.key}`]: e.target.value })}
                      style={{ width: '40px', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', padding: '2px' }}
                    />
                    <input
                      type="text"
                      value={settings[`brandColor_${c.key}`] || ''}
                      onChange={(e) => updateSettings({ [`brandColor_${c.key}`]: e.target.value })}
                      placeholder={c.default}
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '13px' }}
                    />
                  </div>
                </div>
              ))}
              </div>
            </div>

            {/* Typography */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Type size={18} />}
                iconBg="linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                title="Brand Typography"
                description="Primary typography face rendered across all pages"
                badgeText="Active"
                badgeType="active"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Primary Font Family</label>
                <select 
                  value={settings.primaryFont || 'Inter'} 
                  onChange={(e) => updateSettings({ primaryFont: e.target.value })} 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '14px' }}
                >
                  <option value="Inter">Inter (Clean modern grotesque)</option>
                  <option value="Outfit">Outfit (Geometric &amp; friendly)</option>
                  <option value="Roboto">Roboto (Versatile &amp; clear)</option>
                  <option value="Poppins">Poppins (Bold geometric sans)</option>
                  <option value="Montserrat">Montserrat (Classic uppercase elegance)</option>
                  <option value="Playfair Display">Playfair Display (Editorial luxury serif)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary digital)</option>
                </select>
              </div>

              {/* Live Font Sample */}
              <div style={{ padding: '14px', borderRadius: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', fontFamily: settings.primaryFont || 'Inter' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '4px' }}>
                  Live Font Preview ({settings.primaryFont || 'Inter'})
                </span>
                <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'block' }}>
                  Build High-Converting E-Commerce Stores
                </span>
                <span style={{ fontSize: '13px', color: '#64748b' }}>
                  The quick brown fox jumps over the lazy dog. 1234567890
                </span>
              </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── SOCIALS VIEW ───
const SocialsView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  const [orderedSocials, setOrderedSocials] = useState<{ id: string; platform: string; url: string }[]>(
    settings.orderedSocialLinks || [
      { id: 's-1', platform: 'Instagram', url: settings.instagramUrl || 'https://instagram.com/billionbiz' },
      { id: 's-2', platform: 'Facebook', url: settings.facebookUrl || 'https://facebook.com/billionbiz' },
      { id: 's-3', platform: 'Twitter / X', url: settings.twitterUrl || 'https://x.com/billionbiz' },
      { id: 's-4', platform: 'YouTube', url: settings.youtubeUrl || 'https://youtube.com/@billionbiz' },
    ]
  );

  const saveSocialOrder = (updated: { id: string; platform: string; url: string }[]) => {
    setOrderedSocials(updated);
    updateSettings({ orderedSocialLinks: updated });
  };

  const handleAddSocial = () => {
    const newItem = { id: `s-${Date.now()}`, platform: 'LinkedIn', url: '' };
    saveSocialOrder([...orderedSocials, newItem]);
  };

  const handleRemoveSocial = (id: string) => {
    saveSocialOrder(orderedSocials.filter(s => s.id !== id));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedSocials.length) return;
    const next = [...orderedSocials];
    const [removed] = next.splice(index, 1);
    next.splice(targetIdx, 0, removed);
    saveSocialOrder(next);
  };

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Store & Brand — Social Channels & WhatsApp Widget</h2>
          <p>Manage ordered social media icons, custom appearance, and live floating WhatsApp support chat widget.</p>
        </div>

        <div className={styles.scGrid}>
          {/* Ordered Social Links */}
          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <CardHeader
                icon={<Link2 size={18} />}
                iconBg="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                title="Ordered Social Links"
                description="Reorder channels to match your preferred storefront display order"
                badgeText={`${orderedSocials.length} Links`}
                badgeType="active"
              />
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '12px' }}>
                <button
                  onClick={handleAddSocial}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px',
                    borderRadius: '6px', background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                    fontSize: '11.5px', fontWeight: 600, cursor: 'pointer'
                  }}
                >
                  <Plus size={13} />
                  <span>Add Link</span>
                </button>
                </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '14px' }}>
                {orderedSocials.map((item, idx) => (
                  <div 
                    key={item.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                      background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px'
                    }}
                  >
                    <GripVertical size={14} color="#94a3b8" style={{ cursor: 'grab' }} />
                    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '24px', height: '24px', background: '#e2e8f0', borderRadius: '6px', color: '#334155' }}>
                      {renderSocialIcon(item.platform)}
                    </span>

                    <select
                      value={item.platform}
                      onChange={(e) => {
                        const next = [...orderedSocials];
                        next[idx].platform = e.target.value;
                        saveSocialOrder(next);
                      }}
                      style={{ padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', fontWeight: 600 }}
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="Twitter / X">Twitter / X</option>
                      <option value="YouTube">YouTube</option>
                      <option value="LinkedIn">LinkedIn</option>
                      <option value="TikTok">TikTok</option>
                    </select>

                    <input
                      type="url"
                      value={item.url}
                      onChange={(e) => {
                        const next = [...orderedSocials];
                        next[idx].url = e.target.value;
                        saveSocialOrder(next);
                      }}
                      placeholder="https://..."
                      style={{ flex: 1, padding: '6px 10px', fontSize: '12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        onClick={() => handleMove(idx, 'up')}
                        disabled={idx === 0}
                        style={{ background: 'none', border: 'none', cursor: idx === 0 ? 'not-allowed' : 'pointer', color: idx === 0 ? '#cbd5e1' : '#64748b' }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => handleMove(idx, 'down')}
                        disabled={idx === orderedSocials.length - 1}
                        style={{ background: 'none', border: 'none', cursor: idx === orderedSocials.length - 1 ? 'not-allowed' : 'pointer', color: idx === orderedSocials.length - 1 ? '#cbd5e1' : '#64748b' }}
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      onClick={() => handleRemoveSocial(item.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '2px' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
              </div>
            </div>

            {/* Social Appearance Customization */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Eye size={18} />}
                iconBg="linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)"
                title="Social Icons Appearance"
                description="Layout and icon geometries across desktop & mobile"
                badgeText="Optional"
                badgeType="optional"
              />
              <div className={styles.cardBody}>
              <div className={styles.scFormGroup}>
                <label>Layout</label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['default', 'horizontal', 'vertical'].map(l => (
                    <button
                      key={l}
                      onClick={() => updateSettings({ socialLayout: l })}
                      style={{
                        flex: 1, padding: '7px', borderRadius: '6px',
                        border: `1px solid ${ (settings.socialLayout || 'horizontal') === l ? '#2563eb' : '#cbd5e1' }`,
                        background: (settings.socialLayout || 'horizontal') === l ? '#eff6ff' : '#fff',
                        color: (settings.socialLayout || 'horizontal') === l ? '#2563eb' : '#475569',
                        fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                      }}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.scFormGroup}>
                <label>Icon Style</label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {['circular', 'rounded', 'square', 'borderless'].map(style => (
                    <button
                      key={style}
                      onClick={() => updateSettings({ socialIconStyle: style })}
                      style={{
                        padding: '6px 12px', borderRadius: '6px',
                        border: `1px solid ${ (settings.socialIconStyle || 'circular') === style ? '#2563eb' : '#cbd5e1' }`,
                        background: (settings.socialIconStyle || 'circular') === style ? '#eff6ff' : '#fff',
                        color: (settings.socialIconStyle || 'circular') === style ? '#2563eb' : '#475569',
                        fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                      }}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formRowHalf}>
                <div className={styles.scFormGroup}>
                  <label>Desktop Size ({settings.desktopSocialIconSize || 22}px)</label>
                  <input
                    type="range" min="16" max="36"
                    value={settings.desktopSocialIconSize || 22}
                    onChange={(e) => updateSettings({ desktopSocialIconSize: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div className={styles.scFormGroup}>
                  <label>Mobile Size ({settings.mobileSocialIconSize || 20}px)</label>
                  <input
                    type="range" min="16" max="36"
                    value={settings.mobileSocialIconSize || 20}
                    onChange={(e) => updateSettings({ mobileSocialIconSize: parseInt(e.target.value) })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>
              </div>
            </div>
          </div>

          {/* WhatsApp Chat Widget */}
          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <CardHeader
                icon={<WhatsAppIcon size={18} />}
                iconBg="linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                title="WhatsApp Floating Chat Widget"
                description="Instant conversational sales channel for visitors"
                badgeText={settings.whatsappWidgetEnabled !== false ? 'Enabled' : 'Disabled'}
                badgeType={settings.whatsappWidgetEnabled !== false ? 'active' : 'optional'}
              />
              <div className={styles.cardBody}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: '#0f172a' }}>Enable Floating Widget</span>
                  <span style={{ fontSize: '11.5px', color: '#64748b' }}>Render floating button on all storefront pages</span>
                </div>
                <input
                  type="checkbox"
                  style={{ width: '18px', height: '18px' }}
                  checked={settings.whatsappWidgetEnabled !== false}
                  onChange={(e) => updateSettings({ whatsappWidgetEnabled: e.target.checked })}
                />
              </div>

              {settings.whatsappWidgetEnabled !== false && (
                <>
                  <div className={styles.scFormGroup}>
                    <label>WhatsApp Phone Number</label>
                    <input 
                      type="tel" 
                      value={settings.whatsappWidgetPhone || settings.whatsappNumber || ''} 
                      onChange={(e) => updateSettings({ whatsappWidgetPhone: e.target.value })} 
                      placeholder="+1 (555) 123-4567" 
                    />
                  </div>

                  {/* Widget Style Variant */}
                  <div className={styles.scFormGroup}>
                    <label>Widget Style Variant</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {[
                        { id: 'round', label: 'Classic Round Bubble', desc: 'Exact round official icon' },
                        { id: 'pill', label: 'Expandable Pill Badge', desc: 'Icon + custom text' },
                        { id: 'glow', label: 'Pulsating Glow Aura', desc: 'Eye-catching radar pulse' },
                        { id: 'badge', label: 'Modern Squircle Badge', desc: 'Rounded squircle with online dot' },
                      ].map(v => {
                        const isCurrent = (settings.whatsappWidgetVariant || 'round') === v.id;
                        return (
                          <div
                            key={v.id}
                            onClick={() => updateSettings({ whatsappWidgetVariant: v.id })}
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              border: `1.5px solid ${isCurrent ? '#198754' : '#e2e8f0'}`,
                              background: isCurrent ? '#f0fdf4' : '#ffffff',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span style={{ fontSize: '12px', fontWeight: 700, color: isCurrent ? '#15803d' : '#334155', display: 'block' }}>{v.label}</span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>{v.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {(settings.whatsappWidgetVariant === 'pill') && (
                    <div className={styles.scFormGroup}>
                      <label>Pill Button Label</label>
                      <input 
                        type="text" 
                        value={settings.whatsappPillText || ''} 
                        onChange={(e) => updateSettings({ whatsappPillText: e.target.value })} 
                        placeholder="Chat on WhatsApp" 
                      />
                    </div>
                  )}

                  <div className={styles.scFormGroup}>
                    <label>Prefilled Customer Message</label>
                    <textarea 
                      rows={2} 
                      value={settings.whatsappWidgetMessage || ''} 
                      onChange={(e) => updateSettings({ whatsappWidgetMessage: e.target.value })} 
                      placeholder="Hi! I have a question about my order from BillionBiz..." 
                    />
                  </div>

                  <div className={styles.formRowHalf}>
                    <div className={styles.scFormGroup}>
                      <label>Horizontal Position</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['left', 'right'].map(pos => (
                          <button
                            key={pos}
                            onClick={() => updateSettings({ whatsappWidgetPosition: pos })}
                            style={{
                              flex: 1, padding: '7px', borderRadius: '6px',
                              border: `1px solid ${ (settings.whatsappWidgetPosition || 'right') === pos ? '#198754' : '#cbd5e1' }`,
                              background: (settings.whatsappWidgetPosition || 'right') === pos ? '#ecfdf5' : '#fff',
                              color: (settings.whatsappWidgetPosition || 'right') === pos ? '#059669' : '#475569',
                              fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                            }}
                          >
                            {pos}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.scFormGroup}>
                      <label>Vertical Position</label>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['bottom', 'middle'].map(vpos => (
                          <button
                            key={vpos}
                            onClick={() => updateSettings({ whatsappVerticalPosition: vpos })}
                            style={{
                              flex: 1, padding: '7px', borderRadius: '6px',
                              border: `1px solid ${ (settings.whatsappVerticalPosition || 'bottom') === vpos ? '#198754' : '#cbd5e1' }`,
                              background: (settings.whatsappVerticalPosition || 'bottom') === vpos ? '#ecfdf5' : '#fff',
                              color: (settings.whatsappVerticalPosition || 'bottom') === vpos ? '#059669' : '#475569',
                              fontSize: '12px', fontWeight: 600, textTransform: 'capitalize', cursor: 'pointer'
                            }}
                          >
                            {vpos}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className={styles.scFormGroup}>
                    <label>Pixel Offset ({settings.whatsappPixelOffset || 24}px)</label>
                    <input
                      type="range" min="10" max="80"
                      value={settings.whatsappPixelOffset || 24}
                      onChange={(e) => updateSettings({ whatsappPixelOffset: parseInt(e.target.value) })}
                      style={{ width: '100%' }}
                    />
                  </div>

                  {/* Live WhatsApp Widget Interactive Mock Preview */}
                  <div style={{ marginTop: '16px', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '16px', background: '#f8fafc' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                      <Eye size={13} color="#64748b" />
                      <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
                        Live Widget Preview
                      </span>
                    </div>

                    <div style={{
                      position: 'relative', height: '140px', background: '#ffffff', borderRadius: '8px',
                      border: '1px solid #cbd5e1', overflow: 'hidden', padding: '14px',
                      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                    }}>
                      <div style={{
                        position: 'absolute',
                        [settings.whatsappWidgetPosition === 'left' ? 'left' : 'right']: `${Math.min(settings.whatsappPixelOffset || 24, 40)}px`,
                        [settings.whatsappVerticalPosition === 'middle' ? 'top' : 'bottom']: settings.whatsappVerticalPosition === 'middle' ? '40%' : `${Math.min(settings.whatsappPixelOffset || 24, 40)}px`,
                        zIndex: 10,
                      }}>
                        {settings.whatsappWidgetVariant === 'pill' ? (
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: '#25D366', color: '#ffffff', padding: '8px 14px', borderRadius: '24px',
                            boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)', fontWeight: 600, fontSize: '12px'
                          }}>
                            <WhatsAppIcon size={16} />
                            <span>{settings.whatsappPillText || 'Chat on WhatsApp'}</span>
                          </div>
                        ) : settings.whatsappWidgetVariant === 'glow' ? (
                          <div style={{
                            width: '46px', height: '46px', borderRadius: '50%',
                            background: '#25D366', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 0 6px rgba(37, 211, 102, 0.25), 0 4px 12px rgba(37, 211, 102, 0.4)'
                          }}>
                            <WhatsAppIcon size={22} />
                          </div>
                        ) : settings.whatsappWidgetVariant === 'badge' ? (
                          <div style={{ position: 'relative' }}>
                            <div style={{
                              width: '44px', height: '44px', borderRadius: '12px',
                              background: '#25D366', color: '#ffffff',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)'
                            }}>
                              <WhatsAppIcon size={20} />
                            </div>
                            <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#10b981', border: '2px solid #fff' }} />
                          </div>
                        ) : (
                          <div style={{
                            width: '46px', height: '46px', borderRadius: '50%',
                            background: '#25D366', color: '#ffffff',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 14px rgba(37, 211, 102, 0.45)'
                          }}>
                            <WhatsAppIcon size={22} />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── BUSINESS DETAILS VIEW ───
const BusinessDetailsView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  const [useCustomHours, setUseCustomHours] = useState(settings.useCustomHours || false);
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Business Details &amp; Registration</h2>
          <p>Authoritative legal details are managed in Admin Settings. Storefront displays approved public records.</p>
        </div>

        {/* Canonical Admin Settings Notice */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '14px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="#16a34a" />
            <div>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#166534', display: 'block' }}>Authoritative Admin Settings Source</span>
              <span style={{ fontSize: '12px', color: '#15803d' }}>Tax registration (GST/EIN), CIN, and legal corporate address originate in your Admin Settings. Changes there sync here automatically.</span>
            </div>
          </div>
          <a href="/settings" style={{ fontSize: '12px', fontWeight: 600, color: '#166534', background: '#dcfce7', padding: '6px 12px', borderRadius: '8px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Manage in Admin →
          </a>
        </div>

        <div className={styles.scGrid}>
          <div className={styles.scCol}>
            {/* Legal Entity */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Building2 size={18} />}
                iconBg="linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)"
                title="Legal Business Entity"
                description="Official registered business information"
                badgeText="Required"
                badgeType="active"
              />
              <div className={styles.cardBody}>
                <div className={styles.scFormGroup}>
                  <label>Legal Business Name</label>
                  <input
                    type="text"
                    value={settings.legalName || ''}
                    onChange={(e) => updateSettings({ legalName: e.target.value })}
                    placeholder="BillionBiz Technologies Inc."
                  />
                </div>
                <div className={styles.scFormGroup}>
                  <label>Business Registration / CIN Number</label>
                  <input
                    type="text"
                    value={settings.businessRegNumber || ''}
                    onChange={(e) => updateSettings({ businessRegNumber: e.target.value })}
                    placeholder="e.g. U72900KA2023PTC123456"
                  />
                </div>
                <div className={styles.scFormGroup}>
                  <label>GST / Tax Identification Number (VAT / EIN)</label>
                  <input
                    type="text"
                    value={settings.taxId || ''}
                    onChange={(e) => updateSettings({ taxId: e.target.value })}
                    placeholder="e.g. 29AAAAA0000A1Z5"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Clock size={18} />}
                iconBg="linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)"
                title="Operating Hours &amp; Schedule"
                description="Store opening hours displayed on customer storefront"
              />
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: '#0f172a' }}>24/7 Storefront Operations</span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Store accepts online orders anytime around the clock</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px' }}
                    checked={!useCustomHours}
                    onChange={(e) => {
                      setUseCustomHours(!e.target.checked);
                      updateSettings({ useCustomHours: !e.target.checked });
                    }}
                  />
                </div>

                {useCustomHours && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {daysOfWeek.map((day) => (
                      <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#f8fafc', borderRadius: '6px', fontSize: '13px' }}>
                        <span style={{ fontWeight: 500, color: '#334155' }}>{day}</span>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input
                            type="time"
                            defaultValue="09:00"
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          />
                          <span style={{ color: '#94a3b8' }}>to</span>
                          <input
                            type="time"
                            defaultValue="18:00"
                            style={{ padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.scCol}>
            {/* Physical Address */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<MapPin size={18} />}
                iconBg="linear-gradient(135deg, #10b981 0%, #059669 100%)"
                title="Physical Business Address"
                description="Used for invoices, shipping origin, and footer display"
                badgeText="Required"
                badgeType="active"
              />
              <div className={styles.cardBody}>
                <div className={styles.scFormGroup}>
                  <label>Street Address</label>
                  <input
                    type="text"
                    value={settings.address || ''}
                    onChange={(e) => updateSettings({ address: e.target.value })}
                    placeholder="123 Commerce Way, Suite 400"
                  />
                </div>
                <div className={styles.formRowHalf}>
                  <div className={styles.scFormGroup}>
                    <label>City</label>
                    <input
                      type="text"
                      value={settings.city || ''}
                      onChange={(e) => updateSettings({ city: e.target.value })}
                      placeholder="Bengaluru"
                    />
                  </div>
                  <div className={styles.scFormGroup}>
                    <label>State / Province</label>
                    <input
                      type="text"
                      value={settings.state || ''}
                      onChange={(e) => updateSettings({ state: e.target.value })}
                      placeholder="Karnataka"
                    />
                  </div>
                </div>
                <div className={styles.formRowHalf}>
                  <div className={styles.scFormGroup}>
                    <label>Postal / ZIP Code</label>
                    <input
                      type="text"
                      value={settings.postalCode || ''}
                      onChange={(e) => updateSettings({ postalCode: e.target.value })}
                      placeholder="560001"
                    />
                  </div>
                  <div className={styles.scFormGroup}>
                    <label>Country / Region</label>
                    <input
                      type="text"
                      value={settings.country || 'India'}
                      onChange={(e) => updateSettings({ country: e.target.value })}
                      placeholder="India"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DEDICATED WHATSAPP VIEW ───
const WhatsAppView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>WhatsApp Floating Chat Widget</h2>
          <p>Enable direct customer chat, lead conversion, and real-time support right from your storefront pages.</p>
        </div>

        <div className={styles.scGrid}>
          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <CardHeader
                icon={<WhatsAppIcon size={18} />}
                iconBg="linear-gradient(135deg, #25D366 0%, #128C7E 100%)"
                title="Widget Settings"
                description="Core WhatsApp integration parameters"
                badgeText={settings.whatsappWidgetEnabled !== false ? 'Active' : 'Disabled'}
                badgeType={settings.whatsappWidgetEnabled !== false ? 'active' : 'optional'}
              />
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px' }}>
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, display: 'block', color: '#0f172a' }}>Enable Floating Widget</span>
                    <span style={{ fontSize: '11.5px', color: '#64748b' }}>Render WhatsApp chat bubble on all storefront pages</span>
                  </div>
                  <input
                    type="checkbox"
                    style={{ width: '18px', height: '18px' }}
                    checked={settings.whatsappWidgetEnabled !== false}
                    onChange={(e) => updateSettings({ whatsappWidgetEnabled: e.target.checked })}
                  />
                </div>

                <div className={styles.scFormGroup}>
                  <label>WhatsApp Business Phone Number</label>
                  <input
                    type="text"
                    value={settings.whatsappWidgetPhone || settings.whatsappNumber || ''}
                    onChange={(e) => updateSettings({ whatsappWidgetPhone: e.target.value, whatsappNumber: e.target.value })}
                    placeholder="+91 98765 43210 (include country code)"
                  />
                  <span className={styles.scHint}>Include country code with plus prefix (e.g. +1 or +91)</span>
                </div>

                <div className={styles.scFormGroup}>
                  <label>Prefilled Customer Greeting Message</label>
                  <textarea
                    rows={2}
                    value={settings.whatsappPrefilledMessage || ''}
                    onChange={(e) => updateSettings({ whatsappPrefilledMessage: e.target.value })}
                    placeholder="Hi! I have a question about your products on BillionBiz."
                  />
                </div>

                <div className={styles.scFormGroup}>
                  <label>Widget Button Style</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', marginTop: '6px' }}>
                    {[
                      { id: 'round', label: 'Round Icon' },
                      { id: 'pill', label: 'Pill Bar' },
                      { id: 'glow', label: 'Pulse Glow' },
                      { id: 'badge', label: 'Online Dot' },
                    ].map((v) => {
                      const isCurrent = (settings.whatsappWidgetVariant || 'round') === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => updateSettings({ whatsappWidgetVariant: v.id })}
                          style={{
                            padding: '10px 6px', borderRadius: '8px',
                            border: `1.5px solid ${isCurrent ? '#25D366' : '#e2e8f0'}`,
                            background: isCurrent ? '#f0fdf4' : '#ffffff',
                            color: isCurrent ? '#166534' : '#475569',
                            fontSize: '11.5px', fontWeight: 600, cursor: 'pointer'
                          }}
                        >
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {settings.whatsappWidgetVariant === 'pill' && (
                  <div className={styles.scFormGroup}>
                    <label>Pill Button Label</label>
                    <input
                      type="text"
                      value={settings.whatsappPillText || ''}
                      onChange={(e) => updateSettings({ whatsappPillText: e.target.value })}
                      placeholder="Chat on WhatsApp"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className={styles.scCol}>
            {/* Live Simulation */}
            <div className={styles.scCard}>
              <CardHeader
                icon={<Eye size={18} />}
                iconBg="linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)"
                title="Live Widget Preview"
                description="Real-time simulation of storefront position"
              />
              <div className={styles.cardBody}>
                <div style={{
                  position: 'relative', height: '220px', background: '#f8fafc', borderRadius: '12px',
                  border: '1.5px dashed #cbd5e1', overflow: 'hidden', padding: '16px',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-end'
                }}>
                  <div style={{ position: 'absolute', top: 12, left: 14, fontSize: '12px', color: '#94a3b8', fontWeight: 500 }}>
                    Storefront viewport mockup
                  </div>
                  <div style={{
                    position: 'absolute',
                    [settings.whatsappWidgetPosition === 'left' ? 'left' : 'right']: '20px',
                    bottom: '20px',
                    zIndex: 10,
                  }}>
                    {settings.whatsappWidgetVariant === 'pill' ? (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        background: '#25D366', color: '#ffffff', padding: '10px 18px', borderRadius: '24px',
                        boxShadow: '0 4px 14px rgba(37, 211, 102, 0.4)', fontWeight: 600, fontSize: '13px'
                      }}>
                        <WhatsAppIcon size={18} />
                        <span>{settings.whatsappPillText || 'Chat on WhatsApp'}</span>
                      </div>
                    ) : (
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '50%',
                        background: '#25D366', color: '#ffffff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 6px 18px rgba(37, 211, 102, 0.45)'
                      }}>
                        <WhatsAppIcon size={26} />
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.formRowHalf} style={{ marginTop: '16px' }}>
                  <div className={styles.scFormGroup}>
                    <label>Position</label>
                    <select
                      value={settings.whatsappWidgetPosition || 'right'}
                      onChange={(e) => updateSettings({ whatsappWidgetPosition: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="right">Bottom Right</option>
                      <option value="left">Bottom Left</option>
                    </select>
                  </div>
                  <div className={styles.scFormGroup}>
                    <label>Show on Mobile</label>
                    <select
                      value={settings.whatsappMobileVisible !== false ? 'yes' : 'no'}
                      onChange={(e) => updateSettings({ whatsappMobileVisible: e.target.value === 'yes' })}
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="yes">Visible on Mobile</option>
                      <option value="no">Hide on Mobile</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── DOMAIN & URLS VIEW ───
const DomainUrlsView: React.FC<{ settings: Record<string, any>; updateSettings: (s: Record<string, any>) => void }> = ({ settings, updateSettings }) => {
  const [copied, setCopied] = useState(false);
  const storeSlug = settings.storeSlug || (settings.storeName || 'my-store').toLowerCase().replace(/[^a-z0-9]/g, '-');
  const defaultUrl = `https://${storeSlug}.billionbiz.store`;

  const copyToClipboard = () => {
    navigator.clipboard?.writeText(defaultUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={styles.settingsContentArea}>
      <div className={styles.settingsInner}>
        <div className={styles.scHeader}>
          <h2>Domain &amp; URLs</h2>
          <p>Configure your storefront domain name, subdomains, SSL security certificates, and canonical URL structure.</p>
        </div>

        <div className={styles.scGrid}>
          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <CardHeader
                icon={<Globe size={18} />}
                iconBg="linear-gradient(135deg, #0284c7 0%, #0369a1 100%)"
                title="BillionBiz Storefront Subdomain"
                description="Your default cloud-hosted storefront address"
                badgeText="Active & SSL Secured"
                badgeType="active"
              />
              <div className={styles.cardBody}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '14px' }}>
                  <Globe size={16} color="#0284c7" />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', flex: 1, fontFamily: 'monospace' }}>
                    {defaultUrl}
                  </span>
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className={styles.scFormGroup}>
                  <label>Store Handle / Subdomain Slug</label>
                  <input
                    type="text"
                    value={settings.storeSlug || ''}
                    onChange={(e) => updateSettings({ storeSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    placeholder={storeSlug}
                  />
                  <span className={styles.scHint}>Only lowercase letters, numbers, and hyphens</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.scCol}>
            <div className={styles.scCard}>
              <CardHeader
                icon={<Shield size={18} />}
                iconBg="linear-gradient(135deg, #6366f1 0%, #4338ca 100%)"
                title="Custom Domain Connection"
                description="Connect your own domain (e.g. yourbrand.com)"
                badgeText={settings.customDomain ? 'Connected' : 'Optional'}
                badgeType={settings.customDomain ? 'active' : 'optional'}
              />
              <div className={styles.cardBody}>
                <div className={styles.scFormGroup}>
                  <label>Custom Domain Name</label>
                  <input
                    type="text"
                    value={settings.customDomain || ''}
                    onChange={(e) => updateSettings({ customDomain: e.target.value })}
                    placeholder="www.yourbrandname.com"
                  />
                  <span className={styles.scHint}>Enter your root domain or subdomain without http://</span>
                </div>

                <div style={{ marginTop: '16px', padding: '14px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', marginBottom: '8px' }}>DNS Configuration:</div>
                  <div style={{ fontSize: '12px', color: '#475569', lineHeight: 1.6 }}>
                    <div><strong>CNAME Record:</strong> Host <code>www</code> &rarr; Points to <code>cname.billionbiz.store</code></div>
                    <div><strong>A Record:</strong> Host <code>@</code> &rarr; Points to <code>76.76.21.21</code></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

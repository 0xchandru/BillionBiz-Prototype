import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight, CheckCircle2, Circle, Globe2, FileText, Bell,
  ShieldCheck, Plug, Code, ExternalLink, AlertCircle, LockKeyhole, Wrench
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { useAuthStore } from '../../../store/authStore';
import { api } from '../../../api/services';
import { apiClient } from '../../../api/client';
import { getEditorPath } from '../utils/editorNavigation';
import styles from '../../../pages/editor/EditorLayout.module.css';

type StoreRecord = {
  id: string;
  name: string;
  slug: string;
  currency: string;
  timezone: string;
  status: string;
};

const cardStyle: React.CSSProperties = {
  padding: 14,
  border: '1px solid #e2e8f0',
  borderRadius: 11,
  background: '#fff',
  marginBottom: 12
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  fontSize: 11,
  color: '#475569',
  fontWeight: 650
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  padding: '10px 11px',
  border: '1px solid #d8dee8',
  borderRadius: 8,
  color: '#0f172a',
  background: '#fff',
  fontSize: 12
};

const CURRENCIES = [
  { value: 'INR', label: 'INR · Indian Rupee' },
  { value: 'USD', label: 'USD · US Dollar' },
  { value: 'EUR', label: 'EUR · Euro' },
  { value: 'GBP', label: 'GBP · Pound Sterling' },
  { value: 'AED', label: 'AED · UAE Dirham' },
  { value: 'AUD', label: 'AUD · Australian Dollar' },
  { value: 'CAD', label: 'CAD · Canadian Dollar' },
  { value: 'SGD', label: 'SGD · Singapore Dollar' }
];

const TIMEZONES = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Europe/London',
  'Europe/Paris',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
  'UTC'
];

const POLICY_ROUTES = [
  { name: 'Privacy policy', routes: ['/policies/privacy', '/privacy'], aliases: ['privacy-policy-page', 'privacy-page'] },
  { name: 'Terms of service', routes: ['/policies/terms', '/terms'], aliases: ['terms-conditions-page', 'terms-page'] },
  { name: 'Refund and returns', routes: ['/policies/refund', '/refund', '/returns'], aliases: ['return-policy-page', 'refund-policy-page'] },
  { name: 'Shipping and delivery', routes: ['/policies/shipping', '/shipping'], aliases: ['shipping-policy-page'] }
];

export const SettingsRightPanel: React.FC = () => {
  const { settingsSection, closeRightSidebar, navigateToPage, setSelectedPageId } = useLandingEditorStore();
  const { settings, pages, updateSettings, markSaved } = useSiteStore();
  const { storeId } = useAuthStore();
  const navigate = useNavigate();

  const section = settingsSection || 'launch-checklist';
  const [storeRecord, setStoreRecord] = useState<StoreRecord | null>(null);
  const [currency, setCurrency] = useState('INR');
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [loadingStore, setLoadingStore] = useState(false);
  const [savingRegion, setSavingRegion] = useState(false);
  const [message, setMessage] = useState('');
  const [loadError, setLoadError] = useState('');
  const [passwordEnabled, setPasswordEnabled] = useState(Boolean(settings.passwordEnabled));
  const [maintenanceMode, setMaintenanceMode] = useState(Boolean(settings.maintenanceMode));
  const [newStorefrontPassword, setNewStorefrontPassword] = useState('');
  const [savingAccess, setSavingAccess] = useState(false);
  const [accessMessage, setAccessMessage] = useState('');
  const [accessError, setAccessError] = useState('');

  useEffect(() => {
    setPasswordEnabled(Boolean(settings.passwordEnabled));
    setMaintenanceMode(Boolean(settings.maintenanceMode));
  }, [settings.passwordEnabled, settings.maintenanceMode]);

  useEffect(() => {
    if (section !== 'language-region' && section !== 'language') return;
    if (!storeId) {
      setLoadError('No active store is selected.');
      return;
    }
    let cancelled = false;
    setLoadingStore(true);
    setLoadError('');
    api.getStoreDetails(storeId)
      .then((response: any) => {
        if (cancelled) return;
        const record = response.store as StoreRecord;
        setStoreRecord(record);
        setCurrency(record.currency || 'INR');
        setTimezone(record.timezone || 'Asia/Kolkata');
      })
      .catch((error: any) => {
        if (!cancelled) setLoadError(error.message || 'Could not load regional settings.');
      })
      .finally(() => {
        if (!cancelled) setLoadingStore(false);
      });
    return () => { cancelled = true; };
  }, [section, storeId]);

  const saveRegion = async () => {
    if (!storeId || savingRegion) return;
    setSavingRegion(true);
    setMessage('');
    setLoadError('');
    try {
      const response = await api.updateStoreIdentity(storeId, { currency, timezone });
      setStoreRecord(response.store || storeRecord);
      setMessage('Currency and timezone saved for this store.');
    } catch (error: any) {
      setLoadError(error.message || 'Regional settings could not be saved.');
    } finally {
      setSavingRegion(false);
    }
  };

  const saveStoreAccess = async () => {
    if (savingAccess) return;
    setSavingAccess(true);
    setAccessMessage('');
    setAccessError('');
    try {
      const payload: Record<string, any> = {
        passwordEnabled,
        maintenanceMode
      };
      if (newStorefrontPassword) payload.password = newStorefrontPassword;
      await apiClient.patch('/storefront/settings', payload);
      updateSettings({ passwordEnabled, maintenanceMode });
      markSaved();
      setNewStorefrontPassword('');
      setAccessMessage('Storefront access settings saved.');
    } catch (error: any) {
      setAccessError(error.message || 'Storefront access settings could not be saved.');
    } finally {
      setSavingAccess(false);
    }
  };

  const openPage = (pageId: string) => {
    setSelectedPageId(pageId);
    navigateToPage(pageId);
    navigate(getEditorPath(pageId));
  };

  const findPolicyPage = (policy: (typeof POLICY_ROUTES)[number]) => pages.find((page: any) =>
    policy.routes.includes(page.path) ||
    policy.aliases.includes(page.id) ||
    (page.type === 'policy' && policy.name.toLowerCase().split(' ')[0] === String(page.name || '').toLowerCase().split(' ')[0])
  );

  const identityReady = Boolean(settings.storeName || storeRecord?.name);
  const brandReady = Boolean(settings.logoUrl);
  const homePage = pages.find((page: any) => page.path === '/');
  const homeReady = Boolean(homePage && homePage.sections?.length > 0);
  const pageSeoReady = pages.some((page: any) => page.seoTitle || page.seoDescription);
  const published = pages.some((page: any) => page.status === 'published');
  const checklist = [
    { label: 'Store identity configured', detail: 'Name and store record', done: identityReady },
    { label: 'Brand asset added', detail: 'Upload or connect a store logo', done: brandReady },
    { label: 'Homepage content added', detail: 'At least one homepage section', done: homeReady },
    { label: 'Search metadata configured', detail: 'At least one page has SEO metadata', done: pageSeoReady },
    { label: 'A page is published', detail: 'Publish a storefront release', done: published }
  ];

  const title = section === 'language-region' || section === 'language' ? 'Language & region'
    : section === 'store-access' ? 'Store access'
    : section.includes('policy') || section === 'policies' ? 'Policies & legal'
    : section === 'store-access' ? 'Store access'
    : section === 'notifications' ? 'Notifications'
    : section === 'integrations' ? 'Integrations'
    : section === 'api-webhooks' ? 'API & webhooks'
    : section === 'custom-code' ? 'Developer settings'
    : 'Launch checklist';

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px' }}>
        <div className={styles.phLeft} style={{ gap: 8 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close panel">
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: 15 }}>{title}</h3>
        </div>
      </div>

      <div className={styles.propContent} style={{ padding: 16, overflowY: 'auto' }}>
        {(section === 'launch-checklist' || section === 'setup') && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <strong style={{ fontSize: 12, color: '#0f172a' }}>Store readiness</strong>
                <span style={{ fontSize: 11, color: '#64748b' }}>{checklist.filter((item) => item.done).length}/{checklist.length} complete</span>
              </div>
              <div style={{ height: 6, marginTop: 11, background: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${(checklist.filter((item) => item.done).length / checklist.length) * 100}%`, height: '100%', background: '#0f766e', transition: 'width 180ms ease' }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 16 }}>
                {checklist.map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    {item.done ? <CheckCircle2 size={16} color="#15803d" /> : <Circle size={16} color="#94a3b8" />}
                    <div>
                      <div style={{ fontSize: 11.5, fontWeight: 650, color: '#1e293b' }}>{item.label}</div>
                      <div style={{ marginTop: 2, fontSize: 10.5, color: '#64748b' }}>{item.detail}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: 12, color: '#0f172a' }}>
                <ShieldCheck size={15} /> Before you launch
              </div>
              <p style={{ fontSize: 11, lineHeight: 1.55, color: '#64748b', margin: '8px 0 0' }}>
                This checklist reflects store data loaded by the editor. It does not verify payment credentials, DNS propagation, checkout delivery or legal compliance.
              </p>
            </div>
          </>
        )}

        {(section === 'language-region' || section === 'language') && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 13 }}>
              <Globe2 size={16} /> Store regional defaults
            </div>
            {loadingStore ? <div style={{ fontSize: 11, color: '#64748b' }}>Loading store settings…</div> : (
              <>
                <label style={labelStyle}>Store currency</label>
                <select style={inputStyle} value={currency} onChange={(event) => setCurrency(event.target.value)}>
                  {CURRENCIES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
                </select>
                <label style={{ ...labelStyle, marginTop: 13 }}>Store timezone</label>
                <select style={inputStyle} value={timezone} onChange={(event) => setTimezone(event.target.value)}>
                  {TIMEZONES.map((item) => <option key={item} value={item}>{item}</option>)}
                  {!TIMEZONES.includes(timezone) && <option value={timezone}>{timezone}</option>}
                </select>
                <p style={{ fontSize: 10.5, color: '#64748b', lineHeight: 1.5, margin: '10px 0 0' }}>
                  The store timezone controls operational dates and times. Use the business location's timezone, not the visitor's device timezone.
                </p>
                <button type="button" disabled={savingRegion || loadingStore} onClick={() => void saveRegion()} style={{ width: '100%', marginTop: 13, padding: '10px 12px', border: 0, borderRadius: 8, background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>
                  {savingRegion ? 'Saving…' : 'Save regional settings'}
                </button>
              </>
            )}
            {message && <p role="status" style={{ fontSize: 11, color: '#15803d', margin: '10px 0 0' }}>{message}</p>}
            {loadError && <div role="alert" style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 11, color: '#b91c1c', marginTop: 10 }}><AlertCircle size={14} />{loadError}</div>}
          </div>
        )}

        {(section === 'refund-policy' || section === 'privacy-policy' || section === 'terms-of-service' || section === 'shipping-policy' || section === 'policies') && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
              <FileText size={16} /> Customer-facing policy pages
            </div>
            {POLICY_ROUTES.map((policy) => {
              const page = findPolicyPage(policy);
              return (
                <div key={policy.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '10px 0', borderTop: '1px solid #f1f5f9' }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 650, color: '#1e293b' }}>{policy.name}</div>
                    <div style={{ fontSize: 10, marginTop: 3, color: page ? '#64748b' : '#b45309' }}>{page ? page.path : 'Page not provisioned'}</div>
                  </div>
                  {page && <button type="button" onClick={() => openPage(page.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, border: '1px solid #dbe1ea', borderRadius: 7, padding: '7px 9px', background: '#fff', color: '#334155', fontSize: 10.5, cursor: 'pointer' }}>Edit <ExternalLink size={12} /></button>}
                </div>
              );
            })}
            <p style={{ margin: '10px 0 0', fontSize: 10.5, color: '#64748b', lineHeight: 1.5 }}>
              Legal text is store-specific. Review policy wording before publishing.
            </p>
          </div>
        )}

        {section === 'store-access' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                <LockKeyhole size={16} /> Password protection
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span>
                  <strong style={{ display: 'block', fontSize: 11.5, color: '#1e293b' }}>Require a password to visit the store</strong>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 10, color: '#64748b' }}>Customers must enter the password before browsing.</span>
                </span>
                <input type="checkbox" checked={passwordEnabled} onChange={(event) => setPasswordEnabled(event.target.checked)} />
              </label>
              {passwordEnabled && (
                <div style={{ marginTop: 14 }}>
                  <label style={labelStyle}>Set or replace storefront password</label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    style={inputStyle}
                    value={newStorefrontPassword}
                    minLength={4}
                    maxLength={128}
                    onChange={(event) => setNewStorefrontPassword(event.target.value)}
                    placeholder="At least 4 characters"
                  />
                  <p style={{ fontSize: 10, color: '#64748b', margin: '6px 0 0', lineHeight: 1.5 }}>
                    Leave this blank to keep the existing password. The password is verified on the server and is never included in the public storefront response.
                  </p>
                </div>
              )}
            </div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
                <Wrench size={16} /> Maintenance mode
              </div>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span>
                  <strong style={{ display: 'block', fontSize: 11.5, color: '#1e293b' }}>Temporarily hide the storefront</strong>
                  <span style={{ display: 'block', marginTop: 3, fontSize: 10, color: '#64748b' }}>Visitors see a maintenance screen. Merchant preview stays available.</span>
                </span>
                <input type="checkbox" checked={maintenanceMode} onChange={(event) => setMaintenanceMode(event.target.checked)} />
              </label>
            </div>
            <button
              type="button"
              onClick={() => void saveStoreAccess()}
              disabled={savingAccess || (passwordEnabled && newStorefrontPassword.length > 0 && newStorefrontPassword.length < 4)}
              style={{ width: '100%', padding: '10px 12px', border: 0, borderRadius: 8, background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            >
              {savingAccess ? 'Saving access settings…' : 'Save access settings'}
            </button>
            {accessMessage && <p role="status" style={{ margin: '10px 0 0', color: '#15803d', fontSize: 11 }}>{accessMessage}</p>}
            {accessError && <p role="alert" style={{ margin: '10px 0 0', color: '#b91c1c', fontSize: 11 }}>{accessError}</p>}
          </>
        )}

        {section === 'notifications' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              <Bell size={16} /> Storefront announcements
            </div>
            <p style={{ margin: 0, fontSize: 11, lineHeight: 1.55, color: '#64748b' }}>
              Announcement bars and utility messages are edited as global storefront sections under Pages → Global Header. Order and staff notifications are configured in their operations modules.
            </p>
            <button type="button" onClick={() => openPage('header-global')} style={{ marginTop: 12, padding: '9px 11px', border: 0, borderRadius: 8, background: '#0f172a', color: '#fff', fontSize: 11.5, fontWeight: 650, cursor: 'pointer' }}>
              Open global header editor
            </button>
          </div>
        )}

        {(section === 'integrations' || section === 'api-webhooks' || section === 'custom-code') && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
              {section === 'integrations' ? <Plug size={16} /> : <Code size={16} />}
              {section === 'integrations' ? 'Connected services' : 'Developer access'}
            </div>
            <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.55, margin: 0 }}>
              {section === 'integrations'
                ? 'No analytics, marketing or external integration provider is currently connected through this Store Editor workflow.'
                : 'API credentials, webhooks and executable custom code are not configured from this panel. Do not paste secret keys or scripts into storefront content fields.'}
            </p>
            <div style={{ marginTop: 12, padding: 9, borderRadius: 8, background: '#f8fafc', color: '#64748b', fontSize: 10.5 }}>
              Status: Not connected in Store Editor
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default SettingsRightPanel;

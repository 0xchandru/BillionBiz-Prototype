import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronRight, Store, Image as ImageIcon, Link2, Globe2,
  CheckCircle2, AlertCircle, ExternalLink, Plus, RefreshCw
} from 'lucide-react';
import { useLandingEditorStore } from '../../../store/landingEditorStore';
import { useSiteStore } from '../../../store/siteStore';
import { useAuthStore } from '../../../store/authStore';
import { apiClient } from '../../../api/client';
import styles from '../../../pages/editor/EditorLayout.module.css';

type ConnectedDomain = {
  id: string;
  domain: string;
  is_primary: boolean;
  is_verified: boolean;
  ssl_status: string;
};

const fieldStyle: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  border: '1px solid #d8dee8',
  borderRadius: 8,
  padding: '10px 11px',
  color: '#0f172a',
  background: '#fff',
  fontSize: 13,
  outline: 'none'
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 6,
  color: '#475569',
  fontSize: 11,
  fontWeight: 650
};

const cardStyle: React.CSSProperties = {
  border: '1px solid #e2e8f0',
  borderRadius: 11,
  background: '#fff',
  padding: 14,
  marginBottom: 12
};

export const BrandRightPanel: React.FC = () => {
  const { brandSection, storeBrandSection, closeRightSidebar } = useLandingEditorStore();
  const { settings, updateSettings } = useSiteStore();
  const { storeSlug } = useAuthStore();
  const section = brandSection || storeBrandSection || 'store-profile';
  const [domains, setDomains] = useState<ConnectedDomain[]>([]);
  const [domainDraft, setDomainDraft] = useState('');
  const [domainLoading, setDomainLoading] = useState(false);
  const [domainSaving, setDomainSaving] = useState(false);
  const [domainMessage, setDomainMessage] = useState('');
  const [businessNameDraft, setBusinessNameDraft] = useState(settings.storeName || '');

  useEffect(() => {
    setBusinessNameDraft(settings.storeName || '');
  }, [settings.storeName]);

  const loadDomains = async () => {
    setDomainLoading(true);
    setDomainMessage('');
    try {
      const response = await apiClient.get<{ domains: ConnectedDomain[] }>('/storefront/domains');
      setDomains(response.domains || []);
    } catch (error: any) {
      setDomainMessage(error.message || 'Unable to load domains.');
    } finally {
      setDomainLoading(false);
    }
  };

  useEffect(() => {
    if (section === 'domain-urls') void loadDomains();
  }, [section]);

  const currentHost = useMemo(
    () => settings.primaryDomain || (storeSlug ? `${storeSlug}.chandraprakash.codes` : ''),
    [settings.primaryDomain, storeSlug]
  );

  const updateField = (key: string, value: any) => {
    updateSettings({ [key]: value });
  };

  const updateSocial = (key: string, value: string) => {
    updateSettings({
      socialLinks: {
        ...(settings.socialLinks || {}),
        [key]: value
      }
    });
  };

  const addDomain = async () => {
    const value = domainDraft.trim().toLowerCase();
    if (!value) return;
    setDomainSaving(true);
    setDomainMessage('');
    try {
      await apiClient.post('/storefront/domains', { domain: value });
      setDomainDraft('');
      setDomainMessage('Domain added. Configure its DNS record, then verify ownership.');
      await loadDomains();
    } catch (error: any) {
      setDomainMessage(error.message || 'Domain could not be added.');
    } finally {
      setDomainSaving(false);
    }
  };

  const verifyDomain = async (domainId: string) => {
    setDomainSaving(true);
    setDomainMessage('');
    try {
      const response = await apiClient.post<any>(`/storefront/domains/${encodeURIComponent(domainId)}/verify`, {});
      setDomainMessage(response.message || 'Verification request completed.');
      await loadDomains();
    } catch (error: any) {
      setDomainMessage(error.message || 'Domain verification failed.');
      await loadDomains();
    } finally {
      setDomainSaving(false);
    }
  };

  const makePrimary = async (domainId: string) => {
    setDomainSaving(true);
    setDomainMessage('');
    try {
      await apiClient.post(`/storefront/domains/${encodeURIComponent(domainId)}/primary`, {});
      await loadDomains();
      setDomainMessage('Primary domain updated.');
    } catch (error: any) {
      setDomainMessage(error.message || 'This domain is not ready to become primary.');
    } finally {
      setDomainSaving(false);
    }
  };

  const heading = section === 'store-profile' ? 'Brand profile'
    : section === 'business-details' ? 'Business identity'
    : section === 'logo-favicon' ? 'Brand assets'
    : section === 'social-profiles' ? 'Social profiles'
    : section === 'domain-urls' ? 'Domains'
    : 'Store identity';

  return (
    <aside className={styles.rightPanel}>
      <div className={styles.panelHeader} style={{ padding: '14px 18px' }}>
        <div className={styles.phLeft} style={{ gap: 8 }}>
          <button className={styles.iconBtn} onClick={closeRightSidebar} title="Close panel">
            <ChevronRight size={18} className={styles.backIcon} />
          </button>
          <h3 className={styles.fw600} style={{ margin: 0, fontSize: 15 }}>{heading}</h3>
        </div>
      </div>

      <div className={styles.propContent} style={{ padding: 16, overflowY: 'auto' }}>
        {(section === 'store-profile' || section === 'general') && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, color: '#0f172a', marginBottom: 12 }}>
                <Store size={16} /> Public storefront identity
              </div>
              <label style={labelStyle}>Store display name</label>
              <input style={fieldStyle} value={settings.storeName || ''} maxLength={100} onChange={(event) => updateField('storeName', event.target.value)} placeholder="Your store name" />
              <label style={{ ...labelStyle, marginTop: 12 }}>Tagline</label>
              <input style={fieldStyle} value={settings.tagline || ''} maxLength={160} onChange={(event) => updateField('tagline', event.target.value)} placeholder="A short description of your store" />
              <p style={{ margin: '8px 0 0', color: '#64748b', fontSize: 11, lineHeight: 1.5 }}>
                This changes the public storefront brand display. It does not rename your legal organization or store record.
              </p>
            </div>
            <div style={cardStyle}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Profile completeness</div>
              {[
                ['Store name', Boolean(settings.storeName)],
                ['Tagline', Boolean(settings.tagline)],
                ['Logo', Boolean(settings.logoUrl)]
              ].map(([name, done]) => (
                <div key={String(name)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: done ? '#15803d' : '#64748b', fontSize: 12 }}>
                  <CheckCircle2 size={14} /> {String(name)} {done ? 'configured' : 'not set'}
                </div>
              ))}
            </div>
          </>
        )}

        {section === 'business-details' && (
          <div style={cardStyle}>
            <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Business record</div>
            <p style={{ fontSize: 11, lineHeight: 1.5, color: '#64748b', margin: '0 0 12px' }}>
              The legal store record is managed separately from the public brand display. Changing it can also update the organization name used across BillionBiz.
            </p>
            <label style={labelStyle}>Business/store record name</label>
            <input style={fieldStyle} value={businessNameDraft} onChange={(event) => setBusinessNameDraft(event.target.value)} maxLength={120} />
            <button
              type="button"
              style={{ marginTop: 10, padding: '9px 12px', border: 0, borderRadius: 8, background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}
              onClick={async () => {
                const storeId = useAuthStore.getState().storeId;
                if (!storeId || !businessNameDraft.trim()) return;
                try {
                  await apiClient.patch(`/tenancy/stores/${encodeURIComponent(storeId)}`, { name: businessNameDraft.trim() });
                  updateSettings({ storeName: businessNameDraft.trim() });
                  setDomainMessage('Business identity updated.');
                } catch (error: any) {
                  setDomainMessage(error.message || 'Business identity could not be updated.');
                }
              }}
            >
              Update business record
            </button>
            {domainMessage && <p style={{ fontSize: 11, color: '#475569' }}>{domainMessage}</p>}
          </div>
        )}

        {section === 'logo-favicon' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
                <ImageIcon size={16} /> Logo and browser icon
              </div>
              <label style={labelStyle}>Logo asset URL</label>
              <input style={fieldStyle} value={settings.logoUrl || ''} onChange={(event) => updateField('logoUrl', event.target.value)} placeholder="https://… or uploaded asset path" />
              {settings.logoUrl && <img src={settings.logoUrl} alt="Store logo preview" style={{ maxWidth: '100%', maxHeight: 72, objectFit: 'contain', marginTop: 12 }} />}
              <label style={{ ...labelStyle, marginTop: 14 }}>Favicon URL</label>
              <input style={fieldStyle} value={settings.faviconUrl || ''} onChange={(event) => updateField('faviconUrl', event.target.value)} placeholder="https://… or uploaded asset path" />
              {settings.faviconUrl && <img src={settings.faviconUrl} alt="Favicon preview" style={{ width: 32, height: 32, objectFit: 'contain', marginTop: 10 }} />}
              <p style={{ margin: '12px 0 0', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>
                Use secure HTTPS URLs or assets uploaded through your media library. Changes are saved with the Brand profile.
              </p>
            </div>
          </>
        )}

        {section === 'social-profiles' && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 12 }}>
              <Link2 size={16} /> Public social destinations
            </div>
            {[
              ['instagram', 'Instagram'],
              ['facebook', 'Facebook'],
              ['youtube', 'YouTube'],
              ['tiktok', 'TikTok'],
              ['linkedin', 'LinkedIn'],
              ['x', 'X']
            ].map(([key, title]) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={labelStyle}>{title} URL</label>
                <input
                  style={fieldStyle}
                  value={(settings.socialLinks || {})[key] || ''}
                  onChange={(event) => updateSocial(key, event.target.value)}
                  placeholder={`https://${key}.com/your-profile`}
                />
              </div>
            ))}
            <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>Only add links to profiles owned by your business.</p>
          </div>
        )}

        {section === 'domain-urls' && (
          <>
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                <Globe2 size={16} /> Default storefront domain
              </div>
              <div style={{ padding: '10px 11px', borderRadius: 8, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 12, fontFamily: 'monospace', color: '#0f172a', wordBreak: 'break-all' }}>
                {currentHost || 'Store domain is being provisioned'}
              </div>
              <p style={{ fontSize: 11, color: '#64748b', lineHeight: 1.5, margin: '8px 0 0' }}>
                BillionBiz store handles use the single-level subdomain format. Reserved platform hosts cannot be used as store names.
              </p>
            </div>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <strong style={{ fontSize: 12 }}>Custom domains</strong>
                <button type="button" onClick={() => void loadDomains()} disabled={domainLoading} title="Refresh domains" style={{ border: 0, background: 'transparent', color: '#64748b', cursor: 'pointer' }}>
                  <RefreshCw size={14} />
                </button>
              </div>
              <label style={labelStyle}>Connect a domain</label>
              <input style={fieldStyle} value={domainDraft} onChange={(event) => setDomainDraft(event.target.value)} placeholder="www.yourdomain.com" />
              <button type="button" onClick={() => void addDomain()} disabled={domainSaving || !domainDraft.trim()} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, width: '100%', marginTop: 8, padding: '9px 12px', border: 0, borderRadius: 8, background: '#0f172a', color: '#fff', fontSize: 12, fontWeight: 650, cursor: 'pointer' }}>
                <Plus size={14} /> Add domain
              </button>
              {domains.map((domain) => {
                const ready = domain.is_verified && String(domain.ssl_status).toUpperCase() === 'ACTIVE';
                return (
                  <div key={domain.id} style={{ marginTop: 12, padding: 11, border: '1px solid #e2e8f0', borderRadius: 9 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                      <strong style={{ fontSize: 12, wordBreak: 'break-all' }}>{domain.domain}</strong>
                      {domain.is_primary && <span style={{ fontSize: 10, color: '#15803d', fontWeight: 700 }}>PRIMARY</span>}
                    </div>
                    <div style={{ marginTop: 5, fontSize: 10, color: ready ? '#15803d' : '#b45309' }}>
                      {ready ? 'DNS verified · HTTPS active' : `DNS ${domain.is_verified ? 'verified' : 'pending'} · HTTPS ${domain.ssl_status.toLowerCase()}`}
                    </div>
                    <div style={{ display: 'flex', gap: 7, marginTop: 9 }}>
                      {!ready && <button type="button" disabled={domainSaving} onClick={() => void verifyDomain(domain.id)} style={{ ...fieldStyle, width: 'auto', padding: '7px 9px', cursor: 'pointer' }}>Verify DNS</button>}
                      {ready && !domain.is_primary && <button type="button" disabled={domainSaving} onClick={() => void makePrimary(domain.id)} style={{ ...fieldStyle, width: 'auto', padding: '7px 9px', cursor: 'pointer' }}>Make primary</button>}
                    </div>
                  </div>
                );
              })}
              {domains.length === 0 && !domainLoading && <p style={{ fontSize: 11, color: '#64748b' }}>No custom domains are connected.</p>}
              {domainMessage && <div role="status" style={{ display: 'flex', alignItems: 'flex-start', gap: 7, marginTop: 10, color: '#475569', fontSize: 11, lineHeight: 1.45 }}><AlertCircle size={14} />{domainMessage}</div>}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

export default BrandRightPanel;

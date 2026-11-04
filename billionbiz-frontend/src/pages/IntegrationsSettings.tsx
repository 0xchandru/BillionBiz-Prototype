import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { 
  Globe, 
  Webhook, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Plus, 
  ShieldCheck,
  Zap,
  Mail,
  CreditCard,
  Truck
} from 'lucide-react';
import { getStoreUrl } from '../utils/subdomain';

export const IntegrationsSettingsPage: React.FC = () => {
  const [customDomain, setCustomDomain] = useState('');
  const [domainConnected, setDomainConnected] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Webhooks
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhooksList, setWebhooksList] = useState<any[]>([]);

  const rootDomain = (import.meta.env.VITE_ROOT_DOMAIN || 'chandraprakash.codes').toLowerCase();
  const storeSlug = localStorage.getItem('billionbiz_store_slug') || 'chandru-store';
  const liveStoreUrl = getStoreUrl(storeSlug);

  const handleConnectDomain = (e: FormEvent) => {
    e.preventDefault();
    if (!customDomain.trim()) return;
    setDomainConnected(true);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleAddWebhook = (e: FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim()) return;
    setWebhooksList([
      ...webhooksList,
      { id: `wh-${Date.now()}`, url: webhookUrl, events: ['order.created', 'booking.created'], active: true }
    ]);
    setWebhookUrl('');
  };

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1100px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Breadcrumb & Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#64748b', marginBottom: '6px' }}>
            <span>Settings</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Integrations</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#0f172a', margin: 0 }}>
            Integrations & Custom Domains
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Manage custom web domains, SSL certificates, developer webhooks, API keys, and connected platform bridges.
          </p>
        </div>
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
          <span>Domain configuration saved! Provisioning automatic SSL certificate.</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Section 1: Storefront Domains */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Storefront Domains & DNS
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Your store is provisioned automatically with TLS 1.3 encryption and dedicated multi-tenant routing.
          </p>

          <div style={{ padding: '18px', border: '1px solid #bbf7d0', borderRadius: '10px', backgroundColor: '#f0fdf4', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: '700', color: '#15803d', fontSize: '14.5px' }}>Default Production URL</span>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#15803d', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px' }}>Active & Live</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <a
                href={liveStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: '15px', fontWeight: '600', color: '#083e47', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <span>{liveStoreUrl}</span>
                <ExternalLink size={14} />
              </a>
              <button
                type="button"
                onClick={() => handleCopy(liveStoreUrl)}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', fontSize: '12.5px', cursor: 'pointer' }}
              >
                <Copy size={13} />
                <span>{copiedKey ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* Connect Custom Domain */}
          <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
              Connect Your Own Domain (e.g. store.yourbrand.com)
            </h4>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0' }}>
              Point a <strong>CNAME</strong> record in your DNS provider (Cloudflare, GoDaddy, Namecheap) to <code>{rootDomain}</code>.
            </p>

            <form onSubmit={handleConnectDomain} style={{ display: 'flex', gap: '10px', maxWidth: '560px', flexWrap: 'wrap' }}>
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                placeholder="shop.mybrand.com"
                style={{ flex: 1, minWidth: '220px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              />
              <button
                type="submit"
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#083e47',
                  color: '#ffffff',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Connect Domain
              </button>
            </form>

            {domainConnected && (
              <div style={{ marginTop: '16px', padding: '12px 16px', borderRadius: '8px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', fontSize: '13px', color: '#475569' }}>
                Target Domain: <strong>{customDomain}</strong> • CNAME: <code>{rootDomain}</code> • SSL: <strong>Active (Let's Encrypt TLS)</strong>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Webhooks */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Webhook size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Merchant Developer API & Webhooks
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Receive real-time HTTP POST notifications in your custom backend when platform events occur.
          </p>

          <form onSubmit={handleAddWebhook} style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://api.yourdomain.com/webhooks/billionbiz"
              style={{ flex: 1, minWidth: '240px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
              required
            />
            <button
              type="submit"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 18px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#083e47',
                color: '#ffffff',
                fontWeight: '600',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Plus size={15} />
              <span>Add Webhook Endpoint</span>
            </button>
          </form>

          {webhooksList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '36px', border: '1px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '13.5px' }}>
              No custom webhooks configured yet. Add your HTTP callback URL above to receive order and booking notifications.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {webhooksList.map((wh) => (
                <div key={wh.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontWeight: '600', color: '#0f172a', fontSize: '13.5px' }}>{wh.url}</span>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Events: {wh.events.join(', ')}</div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Active</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 3: Connected Services */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Zap size={18} />
            </div>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>
              Connected Platform Bridges
            </h3>
          </div>
          <p style={{ color: '#64748b', fontSize: '13.5px', marginBottom: '20px' }}>
            Active external software bridges powering authentication, payment collection, and notification delivery.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={20} color="#2563eb" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Google OAuth 2.0 Identity</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Google Continue sign-in for seamless merchant and staff login.</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Connected</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mail size={20} color="#15803d" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Resend Transactional Email Engine</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Delivers order receipts, booking confirmations, and OTP codes.</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Live & Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CreditCard size={20} color="#083e47" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Razorpay Payment Gateway</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Instant UPI, Cards, and Netbanking tender processing.</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Configured</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Truck size={20} color="#ca8a04" />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14.5px', color: '#0f172a' }}>Shiprocket Logistics Dispatch</div>
                  <div style={{ fontSize: '12.5px', color: '#64748b' }}>Courier automation, label generation, and real-time tracking.</div>
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#dcfce7', color: '#15803d' }}>Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegrationsSettingsPage;

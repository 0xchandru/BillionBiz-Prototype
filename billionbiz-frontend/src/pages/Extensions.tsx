import React, { useState, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  Truck, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  X, 
  Lock, 
  MessageSquare, 
  Mail, 
  PackageCheck,
  Search, 
  Download, 
  Settings, 
  Trash2, 
  Share2, 
  ShieldCheck, 
  Smartphone,
  Sparkles,
  Zap
} from 'lucide-react';
import { api } from '../api/services';

interface ProviderConnection {
  id: string;
  provider_key: string;
  environment: 'TEST' | 'LIVE';
  status: string;
  account_identifier?: string;
  last_verified_at?: string;
  last_error_code?: string;
}

type PluginStatus = 'ACTIVE' | 'INSTALLED' | 'AVAILABLE' | 'COMING_SOON';

interface ExtensionDefinition {
  id: string;
  name: string;
  category: 'payments' | 'shipping' | 'messaging' | 'marketing' | 'channels';
  categoryLabel: string;
  description: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  isInstallable: boolean;
}

const EXTENSIONS_CATALOG: ExtensionDefinition[] = [
  {
    id: 'razorpay',
    name: 'Razorpay Payments',
    category: 'payments',
    categoryLabel: 'Payments',
    description: 'Accept UPI, Credit/Debit Cards, Netbanking, and Wallets with automated instant reconciliation.',
    icon: CreditCard,
    iconBg: '#083e47',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'shiprocket',
    name: 'Shiprocket Logistics',
    category: 'shipping',
    categoryLabel: 'Shipping',
    description: 'Automate order courier dispatch, print shipping labels, and track deliveries across 24,000+ pin codes.',
    icon: Truck,
    iconBg: '#5a9a20',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    category: 'messaging',
    categoryLabel: 'Messaging',
    description: 'Automated order status alerts, booking reminders, and customer support via official WhatsApp Cloud API.',
    icon: MessageSquare,
    iconBg: '#25D366',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'delhivery',
    name: 'Delhivery Express Freight',
    category: 'shipping',
    categoryLabel: 'Shipping',
    description: 'Direct door-to-door courier logistics with express surface shipping, RTO reduction, and COD remittance.',
    icon: PackageCheck,
    iconBg: '#ea580c',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'email-marketing',
    name: 'Email Campaigns & Broadcasts',
    category: 'marketing',
    categoryLabel: 'Marketing',
    description: 'Automated abandoned checkout recoveries, customer newsletters, and promotional marketing broadcasts.',
    icon: Mail,
    iconBg: '#0284c7',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'sms-gateway',
    name: 'Twilio SMS Gateway',
    category: 'messaging',
    categoryLabel: 'Communications',
    description: 'Transactional SMS alerts, delivery updates, and OTP dispatch for order notifications and staff.',
    icon: Smartphone,
    iconBg: '#f43f5e',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'cod-shield',
    name: 'COD Fraud Shield',
    category: 'payments',
    categoryLabel: 'Risk Protection',
    description: 'AI-based high-risk order detection with automated customer OTP confirmations before shipment dispatch.',
    icon: ShieldCheck,
    iconBg: '#4f46e5',
    iconColor: '#ffffff',
    isInstallable: true
  },
  {
    id: 'instagram-shop',
    name: 'Instagram & Meta Shop',
    category: 'channels',
    categoryLabel: 'Channels',
    description: 'Sync your products seamlessly with Instagram Shop and Facebook product catalogue feeds.',
    icon: Share2,
    iconBg: '#e1306c',
    iconColor: '#ffffff',
    isInstallable: false
  }
];

interface ExtensionsPageProps {
  defaultTab?: 'all' | 'installed' | 'available' | 'coming_soon' | 'marketplace';
}

export const ExtensionsPage: React.FC<ExtensionsPageProps> = ({ defaultTab = 'all' }) => {
  const [connections, setConnections] = useState<ProviderConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Status tab filter: 'all' | 'installed' | 'available' | 'coming_soon'
  const initialTab = defaultTab === 'marketplace' ? 'available' : (defaultTab === 'installed' ? 'installed' : 'all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'installed' | 'available' | 'coming_soon'>(initialTab);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [testResult, setTestResult] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  // Dynamic Credential Configuration Modal
  const [activeModalPlugin, setActiveModalPlugin] = useState<ExtensionDefinition | null>(null);
  const [envMode, setEnvMode] = useState<'TEST' | 'LIVE'>('TEST');
  const [saving, setSaving] = useState(false);

  // Generic credential inputs
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');
  const [field3, setField3] = useState('');

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    try {
      setLoading(true);
      const res = await api.getIntegrationConnections();
      setConnections(res.connections || []);
    } catch (err: any) {
      console.error('[Extensions] Failed to load connections:', err);
    } finally {
      setLoading(false);
    }
  };

  const getConn = (provider: string): ProviderConnection | undefined => {
    return connections.find(c => c.provider_key.toLowerCase() === provider.toLowerCase());
  };

  const getPluginStatus = (ext: ExtensionDefinition): PluginStatus => {
    const conn = getConn(ext.id);
    if (conn && conn.status !== 'DISCONNECTED') {
      return conn.status === 'ACTIVE' ? 'ACTIVE' : 'INSTALLED';
    }
    return ext.isInstallable ? 'AVAILABLE' : 'COMING_SOON';
  };

  const handleInstall = async (plugin: ExtensionDefinition) => {
    try {
      setActionLoading(prev => ({ ...prev, [plugin.id]: true }));
      setTestResult(null);
      await api.installExtension(plugin.id);
      setTestResult({
        type: 'success',
        message: `${plugin.name} installed successfully! Please configure your credentials.`
      });
      await loadConnections();
      openConfigModal(plugin);
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: err.message || `Failed to install ${plugin.name}.`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [plugin.id]: false }));
    }
  };

  const handleToggle = async (plugin: ExtensionDefinition, currentStatus: string) => {
    try {
      setActionLoading(prev => ({ ...prev, [plugin.id]: true }));
      setTestResult(null);
      const willEnable = currentStatus !== 'ACTIVE';
      await api.toggleIntegrationConnection(plugin.id, willEnable);
      setTestResult({
        type: 'success',
        message: `${plugin.name} is now ${willEnable ? 'Active & Enabled' : 'Paused / Disabled'}.`
      });
      await loadConnections();
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: err.message || `Failed to update ${plugin.name} status.`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [plugin.id]: false }));
    }
  };

  const handleDelete = async (plugin: ExtensionDefinition) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete and uninstall ${plugin.name}?\n\nThis will purge all stored API credentials and disable automated sync.`
    );
    if (!confirmed) return;

    try {
      setActionLoading(prev => ({ ...prev, [plugin.id]: true }));
      setTestResult(null);
      await api.uninstallExtension(plugin.id);
      setTestResult({
        type: 'success',
        message: `${plugin.name} was successfully deleted and uninstalled.`
      });
      await loadConnections();
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: err.message || `Failed to delete ${plugin.name}.`
      });
    } finally {
      setActionLoading(prev => ({ ...prev, [plugin.id]: false }));
    }
  };

  const openConfigModal = (plugin: ExtensionDefinition) => {
    const conn = getConn(plugin.id);
    setActiveModalPlugin(plugin);
    setEnvMode(conn?.environment || 'TEST');
    setField1('');
    setField2('');
    setField3('');
  };

  const handleSaveConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModalPlugin) return;

    try {
      setSaving(true);
      setTestResult(null);

      let credentials: any = {};
      if (activeModalPlugin.id === 'razorpay') {
        credentials = {
          keyId: field1.trim(),
          keySecret: field2.trim(),
          webhookSecret: field3.trim() || undefined
        };
      } else if (activeModalPlugin.id === 'shiprocket') {
        credentials = {
          email: field1.trim(),
          password: field2.trim()
        };
      } else {
        credentials = {
          apiKey: field1.trim(),
          secretKey: field2.trim() || undefined,
          accountIdentifier: field3.trim() || undefined
        };
      }

      await api.saveIntegrationConnection({
        providerKey: activeModalPlugin.id,
        environment: envMode,
        credentials
      });

      setTestResult({
        type: 'success',
        message: `Credentials for ${activeModalPlugin.name} (${envMode}) securely encrypted in your tenant vault.`
      });

      setActiveModalPlugin(null);
      await loadConnections();
    } catch (err: any) {
      setTestResult({
        type: 'error',
        message: err.message || 'Failed to save encrypted credentials.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Compute live counts
  const counts = useMemo(() => {
    let installed = 0;
    let available = 0;
    let comingSoon = 0;

    for (const ext of EXTENSIONS_CATALOG) {
      const status = getPluginStatus(ext);
      if (status === 'ACTIVE' || status === 'INSTALLED') installed++;
      else if (status === 'AVAILABLE') available++;
      else if (status === 'COMING_SOON') comingSoon++;
    }

    return {
      all: EXTENSIONS_CATALOG.length,
      installed,
      available,
      comingSoon
    };
  }, [connections]);

  // Filter and sort plugins: INSTALLED plugins always appear first!
  const sortedAndFilteredPlugins = useMemo(() => {
    return EXTENSIONS_CATALOG
      .filter((ext) => {
        // Search query filter
        const matchesSearch = 
          ext.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          ext.description.toLowerCase().includes(searchQuery.toLowerCase());
        
        // Category filter
        const matchesCat = activeCategory === 'all' || ext.category === activeCategory;

        // Status tab filter
        const status = getPluginStatus(ext);
        let matchesStatus = true;
        if (statusFilter === 'installed') {
          matchesStatus = status === 'ACTIVE' || status === 'INSTALLED';
        } else if (statusFilter === 'available') {
          matchesStatus = status === 'AVAILABLE';
        } else if (statusFilter === 'coming_soon') {
          matchesStatus = status === 'COMING_SOON';
        }

        return matchesSearch && matchesCat && matchesStatus;
      })
      .sort((a, b) => {
        const statusA = getPluginStatus(a);
        const statusB = getPluginStatus(b);

        // Score: ACTIVE (4) > INSTALLED (3) > AVAILABLE (2) > COMING_SOON (1)
        const score = (status: PluginStatus) => {
          if (status === 'ACTIVE') return 4;
          if (status === 'INSTALLED') return 3;
          if (status === 'AVAILABLE') return 2;
          return 1;
        };

        return score(statusB) - score(statusA);
      });
  }, [connections, searchQuery, activeCategory, statusFilter]);

  return (
    <div style={{ maxWidth: '1300px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* 1. Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Admin</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Plugins</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Plugins & Integrations
          </h1>
          <p style={{ color: '#64748b', marginTop: '4px', fontSize: '14px' }}>
            Extend your store with payment gateways, logistics bridges, messaging channels, and marketing integrations.
          </p>
        </div>

        <button 
          onClick={loadConnections}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            color: '#334155',
            fontSize: '13.5px',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)'
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {/* 2. Alert Notification Banner */}
      {testResult && (
        <div style={{
          padding: '12px 18px',
          borderRadius: '8px',
          background: testResult.type === 'success' ? '#f0fdf4' : '#fef2f2',
          color: testResult.type === 'success' ? '#15803d' : '#b91c1c',
          fontSize: '13.5px',
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          border: `1px solid ${testResult.type === 'success' ? '#bbf7d0' : '#fecaca'}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {testResult.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{testResult.message}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setTestResult(null)} 
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'inherit' }}
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 3. Status Tabs (All, Installed First, Available, Coming Soon) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
        {[
          { id: 'all', label: 'All Plugins', count: counts.all },
          { id: 'installed', label: 'Installed', count: counts.installed },
          { id: 'available', label: 'Available', count: counts.available },
          { id: 'coming_soon', label: 'Coming Soon', count: counts.comingSoon }
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id as any)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: isActive ? '#083e47' : '#f1f5f9',
                color: isActive ? '#ffffff' : '#475569',
                fontSize: '13.5px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span>{tab.label}</span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#e2e8f0',
                  color: isActive ? '#ffffff' : '#64748b'
                }}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 4. Search and Category Filter Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
        {/* Search Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '0 12px', width: '320px', height: '38px' }}>
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search plugins by name or features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13.5px', color: '#0f172a' }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'payments', label: 'Payments' },
            { id: 'shipping', label: 'Shipping & Logistics' },
            { id: 'messaging', label: 'Messaging' },
            { id: 'marketing', label: 'Marketing' },
            { id: 'channels', label: 'Sales Channels' }
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '9999px',
                fontSize: '12.5px',
                fontWeight: activeCategory === cat.id ? 700 : 500,
                border: activeCategory === cat.id ? '1px solid #083e47' : '1px solid #e2e8f0',
                backgroundColor: activeCategory === cat.id ? '#083e47' : '#ffffff',
                color: activeCategory === cat.id ? '#ffffff' : '#475569',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Plugins Grid or Empty State */}
      {sortedAndFilteredPlugins.length === 0 ? (
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#f1f5f9',
              color: '#083e47',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px'
            }}
          >
            <Zap size={28} />
          </div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
            {statusFilter === 'installed' ? 'No Installed Plugins Found' : 'No Plugins Match Your Filter'}
          </h3>
          <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '14px', maxWidth: '440px' }}>
            {statusFilter === 'installed'
              ? 'You have not installed any plugins yet. Browse available plugins below to connect payment gateways, courier shipping, or messaging channels.'
              : 'Try searching for different keywords or resetting your category and status filters.'}
          </p>
          <button
            type="button"
            onClick={() => {
              setStatusFilter('all');
              setActiveCategory('all');
              setSearchQuery('');
            }}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              backgroundColor: '#083e47',
              color: '#ffffff',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Show All Available Plugins
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            gap: '20px'
          }}
        >
          {sortedAndFilteredPlugins.map((ext) => {
            const Icon = ext.icon;
            const conn = getConn(ext.id);
            const status = getPluginStatus(ext);
            const isInstalled = status === 'ACTIVE' || status === 'INSTALLED';
            const isActive = status === 'ACTIVE';
            const isLoading = Boolean(actionLoading[ext.id]);

            return (
              <div
                key={ext.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: isInstalled ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  padding: '20px',
                  boxShadow: isInstalled ? '0 2px 6px rgba(8,62,71,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {/* Card Header & Status Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '10px',
                          backgroundColor: ext.iconBg,
                          color: ext.iconColor,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.08)'
                        }}
                      >
                        <Icon size={22} />
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: '#0f172a' }}>
                          {ext.name}
                        </h3>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                          {ext.categoryLabel}
                        </span>
                      </div>
                    </div>

                    {/* Accurate Status Badges: Active / Installed / Available / Coming Soon */}
                    {status === 'ACTIVE' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#dcfce7',
                          color: '#15803d',
                          border: '1px solid #bbf7d0'
                        }}
                      >
                        <CheckCircle2 size={12} />
                        Active
                      </span>
                    )}

                    {status === 'INSTALLED' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#fef3c7',
                          color: '#b45309',
                          border: '1px solid #fde68a'
                        }}
                      >
                        <AlertCircle size={12} />
                        Installed (Paused)
                      </span>
                    )}

                    {status === 'AVAILABLE' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          backgroundColor: '#f0fdfa',
                          color: '#083e47',
                          border: '1px solid #ccfbf1'
                        }}
                      >
                        <Download size={12} />
                        Available
                      </span>
                    )}

                    {status === 'COMING_SOON' && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11.5px',
                          fontWeight: 600,
                          backgroundColor: '#f1f5f9',
                          color: '#64748b',
                          border: '1px solid #e2e8f0'
                        }}
                      >
                        <Sparkles size={12} />
                        Coming Soon
                      </span>
                    )}
                  </div>

                  {/* Plugin Description */}
                  <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                    {ext.description}
                  </p>

                  {/* Installed Metadata Tag */}
                  {isInstalled && (
                    <div
                      style={{
                        backgroundColor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '6px',
                        padding: '8px 10px',
                        fontSize: '12px',
                        color: '#475569',
                        marginBottom: '16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <span>
                        <strong>Mode:</strong> {conn?.environment || 'Test'}
                      </span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '160px', whiteSpace: 'nowrap' }}>
                        {conn?.account_identifier || 'Credentials Encrypted'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div style={{ paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
                  {isInstalled ? (
                    /* INSTALLED: Enable/Disable Switch + Configure + DELETE Option */
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleToggle(ext, conn?.status || 'DISABLED')}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 10px',
                          borderRadius: '8px',
                          border: isActive ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
                          backgroundColor: isActive ? '#f0fdf4' : '#f8fafc',
                          color: isActive ? '#15803d' : '#64748b',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title={isActive ? 'Click to pause/disable' : 'Click to enable'}
                      >
                        <div
                          style={{
                            width: '30px',
                            height: '16px',
                            borderRadius: '9999px',
                            backgroundColor: isActive ? '#16a34a' : '#cbd5e1',
                            position: 'relative',
                            transition: 'background-color 0.2s ease'
                          }}
                        >
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: '#ffffff',
                              position: 'absolute',
                              top: '2px',
                              left: isActive ? '16px' : '2px',
                              transition: 'left 0.2s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.2)'
                            }}
                          />
                        </div>
                        <span>{isActive ? 'Active' : 'Paused'}</span>
                      </button>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {/* Configure Button */}
                        <button
                          type="button"
                          onClick={() => openConfigModal(ext)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #cbd5e1',
                            backgroundColor: '#ffffff',
                            color: '#083e47',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                          title="Configure credentials"
                        >
                          <Settings size={13} />
                          <span>Configure</span>
                        </button>

                        {/* DELETE / UNINSTALL BUTTON */}
                        <button
                          type="button"
                          disabled={isLoading}
                          onClick={() => handleDelete(ext)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            border: '1px solid #fecaca',
                            backgroundColor: '#fef2f2',
                            color: '#dc2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                          }}
                          title="Delete & uninstall plugin"
                        >
                          <Trash2 size={13} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  ) : ext.isInstallable ? (
                    /* AVAILABLE: Show Install Button */
                    <button
                      type="button"
                      disabled={isLoading}
                      onClick={() => handleInstall(ext)}
                      style={{
                        width: '100%',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#083e47',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '13px',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#062f36')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#083e47')}
                    >
                      <Download size={14} />
                      <span>{isLoading ? 'Installing...' : 'Install Plugin'}</span>
                    </button>
                  ) : (
                    /* COMING SOON: Disabled indicator */
                    <button
                      type="button"
                      disabled
                      style={{
                        width: '100%',
                        height: '36px',
                        borderRadius: '8px',
                        backgroundColor: '#f8fafc',
                        color: '#94a3b8',
                        border: '1px solid #e2e8f0',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'not-allowed',
                        textAlign: 'center'
                      }}
                    >
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Dynamic Credential Configuration Modal */}
      {activeModalPlugin && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '14px',
            maxWidth: '520px',
            width: '100%',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#e6fffa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Lock size={18} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                    Configure {activeModalPlugin.name}
                  </h3>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Credentials are encrypted with AES-256-GCM in your dedicated store vault.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModalPlugin(null)}
                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Environment Toggle (Test vs Live) */}
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Operational Environment
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setEnvMode('TEST')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: envMode === 'TEST' ? '2px solid #083e47' : '1px solid #cbd5e1',
                    backgroundColor: envMode === 'TEST' ? '#f0fdfa' : '#ffffff',
                    color: envMode === 'TEST' ? '#083e47' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Test Sandbox
                </button>
                <button
                  type="button"
                  onClick={() => setEnvMode('LIVE')}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: envMode === 'LIVE' ? '2px solid #083e47' : '1px solid #cbd5e1',
                    backgroundColor: envMode === 'LIVE' ? '#f0fdfa' : '#ffffff',
                    color: envMode === 'LIVE' ? '#083e47' : '#64748b',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Live Production
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveConnection}>
              {activeModalPlugin.id === 'razorpay' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Key ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="rzp_test_..."
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Key Secret *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Webhook Secret (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Webhook signature secret"
                      value={field3}
                      onChange={(e) => setField3(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </>
              ) : activeModalPlugin.id === 'shiprocket' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Shiprocket Email *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="shipping@yourstore.com"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Shiprocket Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </>
              ) : activeModalPlugin.id === 'whatsapp' ? (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      WhatsApp Business Phone Number ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 104829104810294"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      Meta System User Permanent Token *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="EAAG..."
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      API Key / Client ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter provider key or ID"
                      value={field1}
                      onChange={(e) => setField1(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                      API Secret / Token *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••••••"
                      value={field2}
                      onChange={(e) => setField2(e.target.value)}
                      style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13.5px' }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setActiveModalPlugin(null)}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    flex: 1,
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#083e47',
                    color: '#ffffff',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    cursor: saving ? 'not-allowed' : 'pointer'
                  }}
                >
                  {saving ? 'Encrypting & Saving...' : 'Save & Encrypt'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtensionsPage;

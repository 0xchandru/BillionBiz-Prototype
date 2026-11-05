import React, { useState, useEffect } from 'react';
import { 
  Store, 
  ExternalLink, 
  RefreshCw, 
  Tablet,
  MapPin,
  Plus,
  X
} from 'lucide-react';
import { api } from '../api/services';
import { getPortalUrl } from '../utils/subdomain';

export const POSCountersPage: React.FC = () => {
  const [counters, setCounters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [counterName, setCounterName] = useState('');
  const [counterCode, setCounterCode] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadCounters();
  }, []);

  const loadCounters = async () => {
    try {
      setLoading(true);
      const res = await api.getCounters();
      setCounters(res.counters || []);
      setError(null);
    } catch (err: any) {
      console.error('[POSCounters] Failed to load counters:', err);
      setError(err.message || 'Failed to load POS counters.');
    } finally {
      setLoading(false);
    }
  };

  const createCounter = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!counterName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      await api.createPOSCounter({
        name: counterName.trim(),
        code: counterCode.trim() || undefined
      });
      setCounterName('');
      setCounterCode('');
      setShowCreate(false);
      await loadCounters();
    } catch (err: any) {
      setError(err.message || 'Could not create POS counter.');
    } finally {
      setCreating(false);
    }
  };

  const posPortalUrl = getPortalUrl('pos', '/');

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#064652', margin: 0 }}>POS Counters & Registers</h1>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>
            Manage physical counters, cash drawers, approved terminal devices, and cashier assignments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '9px 14px', borderRadius: 8, border: 0, background: '#0f766e', color: '#fff', fontSize: 13, fontWeight: 650, cursor: 'pointer' }}>
            <Plus size={15} /> Create counter
          </button>
          <a
            href={posPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '8px', backgroundColor: '#064652', color: '#fff', fontSize: '13px', fontWeight: '600', textDecoration: 'none', boxShadow: '0 2px 4px rgba(6,70,82,0.2)' }}
          >
            <Store size={16} />
            <span>Open Cashier POS Portal</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>

      {error && <div role="alert" style={{ marginBottom: 14, padding: 12, borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: 12 }}>{error}</div>}

      {/* Counter List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', gridColumn: '1 / -1', color: '#64748b' }}>
            <RefreshCw size={24} className="animate-spin" style={{ margin: '0 auto 12px' }} />
            <div>Loading registered counters...</div>
          </div>
        ) : counters.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', gridColumn: '1 / -1', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Store size={40} color="#94a3b8" style={{ margin: '0 auto 12px' }} />
            <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#064652' }}>No Counters Configured</h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>Create your first POS register counter to begin in-store checkout.</p>
          </div>
        ) : (
          counters.map((c) => (
            <div
              key={c.id}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                padding: '20px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{c.name}</h3>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>Code: {c.code || 'POS-01'}</span>
                  </div>
                  <span style={{ backgroundColor: '#e6fffa', color: '#0d8a3e', fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '12px' }}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: '#475569', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MapPin size={14} color="#64748b" />
                    <span>Location: {c.location_name || 'Main store location'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Tablet size={14} color="#64748b" />
                    <span>Terminal pairing is not configured</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
                <a
                  href={`${posPortalUrl}?counterId=${c.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '8px',
                    borderRadius: '6px',
                    backgroundColor: '#064652',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: '600',
                    textDecoration: 'none'
                  }}
                >
                  Launch Register
                </a>
              </div>
            </div>
          ))
        )}
      </div>
      {showCreate && (
        <div role="dialog" aria-modal="true" aria-label="Create POS counter" style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <form onSubmit={createCounter} style={{ background: '#fff', width: '100%', maxWidth: 440, borderRadius: 14, padding: 22, boxShadow: '0 20px 50px rgba(0,0,0,.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={{ margin: 0, fontSize: 17, color: '#0f172a' }}>Create POS counter</h2>
              <button type="button" onClick={() => setShowCreate(false)} aria-label="Close" style={{ border: 0, background: 'transparent', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
            </div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#334155', marginBottom: 6 }}>Counter name *</label>
            <input required maxLength={128} value={counterName} onChange={(event) => setCounterName(event.target.value)} placeholder="e.g. Front Desk" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8, marginBottom: 13 }} />
            <label style={{ display: 'block', fontSize: 12, fontWeight: 650, color: '#334155', marginBottom: 6 }}>Counter code (optional)</label>
            <input maxLength={64} value={counterCode} onChange={(event) => setCounterCode(event.target.value)} placeholder="e.g. POS-01" style={{ width: '100%', boxSizing: 'border-box', padding: '10px 12px', border: '1px solid #cbd5e1', borderRadius: 8 }} />
            <p style={{ margin: '8px 0 16px', fontSize: 11, color: '#64748b', lineHeight: 1.5 }}>The counter will be attached to the active store's primary location. Register sessions are opened separately by an authorized cashier.</p>
            <button type="submit" disabled={creating || !counterName.trim()} style={{ width: '100%', padding: 11, border: 0, borderRadius: 8, background: '#064652', color: '#fff', fontWeight: 700, cursor: creating ? 'wait' : 'pointer' }}>
              {creating ? 'Creating…' : 'Create counter'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default POSCountersPage;

import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Building2,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  MapPin,
  Phone,
  Mail
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const WarehousesPage: FC = () => {
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCode, setFormCode] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formPostalCode, setFormPostalCode] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formIsDefault, setFormIsDefault] = useState(false);

  const fetchWarehouses = () => {
    setLoading(true);
    api.getWarehouses()
      .then((res) => {
        setWarehouses(res.warehouses || []);
      })
      .catch((err) => {
        console.error('Failed to load warehouses', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const handleCreateWarehouse = async (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formCode.trim()) {
      setError('Warehouse name and unique code are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await api.createWarehouse({
        name: formName.trim(),
        code: formCode.trim().toUpperCase(),
        addressLine1: formAddress.trim(),
        city: formCity.trim(),
        state: formState.trim(),
        postalCode: formPostalCode.trim(),
        contactPhone: formPhone.trim(),
        contactEmail: formEmail.trim(),
        isDefault: formIsDefault
      });

      setShowAddModal(false);
      // Reset form
      setFormName('');
      setFormCode('');
      setFormAddress('');
      setFormCity('');
      setFormState('');
      setFormPostalCode('');
      setFormPhone('');
      setFormEmail('');
      setFormIsDefault(false);
      fetchWarehouses();
    } catch (err: any) {
      setError(err.message || 'Failed to save warehouse.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteWarehouse = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove warehouse "${name}"?`)) return;
    try {
      await api.deleteWarehouse(id);
      fetchWarehouses();
    } catch (err: any) {
      alert(err.message || 'Failed to delete warehouse');
    }
  };

  const filteredWarehouses = warehouses.filter((wh) => {
    const matchesSearch =
      wh.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wh.city?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={26} color="#083e47" />
            Warehouses & Inventory Hubs
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Configure real physical fulfillment centers, regional stock hubs, and shipping points for order routing.
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setShowAddModal(true);
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#083e47',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)',
            transition: 'background 0.15s ease'
          }}
        >
          <Plus size={16} />
          Add Warehouse
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search warehouse by name, code or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 12px 9px 36px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={3} columns={5} />
        </div>
      ) : filteredWarehouses.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={searchQuery ? 'No matching warehouses' : 'No warehouses configured'}
          description={
            searchQuery
              ? 'No warehouse matched your search query. Try clearing the filter.'
              : 'Add your physical storage locations, regional stock centers, or store backrooms to track inventory.'
          }
          actionLabel="Add First Warehouse"
          onAction={() => {
            setError(null);
            setShowAddModal(true);
          }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredWarehouses.map((wh) => (
            <div
              key={wh.id}
              style={{
                background: '#ffffff',
                border: wh.is_default ? '2px solid #0d9488' : '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '22px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                      {wh.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          background: '#f1f5f9',
                          color: '#475569',
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          letterSpacing: '0.05em'
                        }}
                      >
                        {wh.code}
                      </span>
                      {wh.is_default && (
                        <span
                          style={{
                            background: '#ccfbf1',
                            color: '#0f766e',
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCircle size={12} />
                          Primary Facility
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteWarehouse(wh.id, wh.name)}
                    title="Delete Warehouse"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '6px',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#ef4444')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Details */}
                <div style={{ fontSize: '13px', color: '#475569', display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                    <MapPin size={15} color="#0d9488" style={{ marginTop: '2px', flexShrink: 0 }} />
                    <span>
                      {wh.address_line1 || 'No street address specified'}
                      {wh.city && `, ${wh.city}`}
                      {wh.state && `, ${wh.state}`}
                      {wh.postal_code && ` - ${wh.postal_code}`}
                    </span>
                  </div>

                  {wh.contact_phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} color="#64748b" />
                      <span>{wh.contact_phone}</span>
                    </div>
                  )}

                  {wh.contact_email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Mail size={14} color="#64748b" />
                      <span>{wh.contact_email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', marginTop: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#94a3b8' }}>
                <span>Status: <strong style={{ color: '#16a34a' }}>Active</strong></span>
                <span>Added: {new Date(wh.created_at || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Warehouse Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            backdropFilter: 'blur(3px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '560px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Add New Warehouse
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} style={{ padding: '24px' }}>
              {error && (
                <div style={{ padding: '10px 14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '13px', marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Warehouse / Facility Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar Regional Hub"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BLR-HUB-01"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot No. 42, 2nd Main Industrial Area"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Bengaluru"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="Karnataka"
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Postal Code
                  </label>
                  <input
                    type="text"
                    placeholder="560038"
                    value={formPostalCode}
                    onChange={(e) => setFormPostalCode(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="hub@billionbiz.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                  />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155', cursor: 'pointer', marginBottom: '24px' }}>
                <input
                  type="checkbox"
                  checked={formIsDefault}
                  onChange={(e) => setFormIsDefault(e.target.checked)}
                  style={{ accentColor: '#0d9488', width: '16px', height: '16px' }}
                />
                <span>Set as default primary fulfillment warehouse</span>
              </label>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Warehouse'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousesPage;

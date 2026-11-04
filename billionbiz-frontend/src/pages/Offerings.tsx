import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Sparkles,
  Plus,
  Search,
  Clock,
  Tag
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const OfferingsPage: FC = () => {
  const [offerings, setOfferings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Hair Styling & Care');
  const [duration, setDuration] = useState(45);
  const [pricingType, setPricingType] = useState('FIXED');
  const [price, setPrice] = useState('1500');
  const bufferBefore = 5;
  const bufferAfter = 10;
  const depositRequired = true;
  const depositAmount = '500';
  const [description, setDescription] = useState('');

  const fetchOfferings = () => {
    setLoading(true);
    api.getOfferings()
      .then((res) => {
        setOfferings(res.offerings || []);
      })
      .catch((err) => {
        console.error('Failed to load offerings', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const handleCreateOffering = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Service name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.createOffering({
        name: name.trim(),
        category,
        description: description.trim(),
        durationMinutes: duration,
        bufferBeforeMinutes: bufferBefore,
        bufferAfterMinutes: bufferAfter,
        pricingType,
        priceMinor: Math.round(parseFloat(price || '0') * 100),
        depositRequiredMinor: depositRequired ? Math.round(parseFloat(depositAmount || '0') * 100) : 0,
        serviceType: 'IN_PERSON'
      });

      setShowAddModal(false);
      setName('');
      setDescription('');
      fetchOfferings();
    } catch (err: any) {
      alert(err.message || 'Failed to create service offering');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredOfferings = offerings.filter((off) => {
    const matchesSearch =
      off.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      off.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Appointments</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Services & Offerings</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={26} color="#0d9488" />
            Services & Appointment Offerings
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Configure bookable service menus, duration blocks, buffer times, and deposit policies.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0d9488',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 1px 3px rgba(13, 148, 136, 0.25)'
          }}
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search service name or category..."
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

      {/* Cards Grid */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={5} />
        </div>
      ) : filteredOfferings.length === 0 ? (
        <EmptyState
          icon={Sparkles}
          title={searchQuery ? 'No matching services' : 'No service offerings configured'}
          description={
            searchQuery
              ? 'No offering matches your search query.'
              : 'Add your appointment services, durations, and pricing to activate client scheduling.'
          }
          actionLabel="Add First Service"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '20px' }}>
          {filteredOfferings.map((off) => (
            <div
              key={off.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#0d9488', background: '#f0fdfa', padding: '2px 8px', borderRadius: '4px' }}>
                    {off.category || 'General Service'}
                  </span>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    ₹{((off.price_minor || 0) / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                  {off.name}
                </h3>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 0', lineHeight: 1.5 }}>
                  {off.description || 'Professional one-on-one client consultation with specialized equipment.'}
                </p>

                <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#475569', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={14} color="#64748b" />
                    <span>{off.duration_minutes || 45} mins</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Tag size={14} color="#64748b" />
                    <span>Buffer: +{off.buffer_after_minutes || 10}m</span>
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                <span style={{ color: off.deposit_required_minor > 0 ? '#b45309' : '#15803d', fontWeight: 600 }}>
                  {off.deposit_required_minor > 0
                    ? `Deposit: ₹${(off.deposit_required_minor / 100).toFixed(0)}`
                    : 'No Deposit Required'}
                </span>
                <span style={{ color: '#16a34a', fontWeight: 600 }}>Active</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '520px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Add Service Offering</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateOffering} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Service Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Haircut & Keratin Treatment"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Category</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Duration (minutes)</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value, 10) || 45)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Pricing Type</label>
                  <select
                    value={pricingType}
                    onChange={(e) => setPricingType(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="FIXED">Fixed Price</option>
                    <option value="HOURLY">Hourly Rate</option>
                    <option value="CUSTOM">Custom Assessment</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Price (₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={2}
                  placeholder="Explain client expectations and requirements..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Saving...' : 'Save Offering'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferingsPage;

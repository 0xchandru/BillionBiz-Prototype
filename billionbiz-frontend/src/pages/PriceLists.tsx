import { useState, useEffect } from 'react';
import type { FC } from 'react';
import { Tag, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../api/services';
import SkeletonLoader from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const PriceLists: FC = () => {
  const [priceLists, setPriceLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [tierType, setTierType] = useState('WHOLESALE');
  const currency = 'INR';
  const [discountPct, setDiscountPct] = useState('10.00');

  const fetchPriceLists = async () => {
    setLoading(true);
    try {
      const res = await api.getPriceLists();
      setPriceLists(res.priceLists || []);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch price lists:', err);
      setError(err.message || 'Unable to load price lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceLists();
  }, []);

  const handleCreatePriceList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      await api.createPriceList({
        name: name.trim(),
        description: description.trim(),
        currency,
        tierType,
        discountPct: parseFloat(discountPct) || 0
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setDiscountPct('10.00');
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Failed to create price list');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this price list?')) return;
    try {
      await api.deletePriceList(id);
      fetchPriceLists();
    } catch (err: any) {
      alert(err.message || 'Failed to delete price list');
    }
  };

  const filteredLists = priceLists.filter((pl) => {
    const matchesSearch =
      pl.name.toLowerCase().includes(search.toLowerCase()) ||
      (pl.description && pl.description.toLowerCase().includes(search.toLowerCase()));

    return matchesSearch;
  });

  return (
    <div style={{ padding: '24px 32px', maxWidth: '1400px', margin: '0 auto', color: '#0f172a' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Catalogue</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Price Lists</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0, color: '#0f172a' }}>Price Lists & Wholesale Tiers</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '14px' }}>
            Manage custom wholesale rates, B2B volume pricing tiers, and VIP discounts across your catalog.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#083e47',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 18px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.15s ease'
          }}
        >
          <Plus size={16} />
          Create Price List
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Price Lists</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{priceLists.length}</div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Wholesale Tiers</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#083e47', marginTop: '6px' }}>
            {priceLists.filter(p => p.tier_type === 'WHOLESALE').length}
          </div>
        </div>
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>VIP Discount Lists</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#7c3aed', marginTop: '6px' }}>
            {priceLists.filter(p => p.tier_type === 'VIP').length}
          </div>
        </div>
      </div>

      {/* Search Bar Row */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            placeholder="Search price lists..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              padding: '8px 12px 8px 36px',
              color: '#0f172a',
              fontSize: '13px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <SkeletonLoader count={4} height={70} />
      ) : error ? (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '16px', color: '#b91c1c' }}>
          {error}
        </div>
      ) : filteredLists.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No Price Lists Found"
          description={
            search
              ? 'No price lists match your filter query.'
              : 'You have not created any price lists yet. Price lists allow you to define tiered discounts or wholesale rates.'
          }
          actionLabel="Create First Price List"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0', color: '#64748b', backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>PRICE LIST NAME</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>TIER TYPE</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>DISCOUNT %</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>CURRENCY</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredLists.map((pl) => (
                <tr key={pl.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s ease' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{pl.name}</div>
                    {pl.description && <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>{pl.description}</div>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: pl.tier_type === 'WHOLESALE' ? '#f0fdfa' : '#f5f3ff',
                        color: pl.tier_type === 'WHOLESALE' ? '#083e47' : '#7c3aed',
                        border: `1px solid ${pl.tier_type === 'WHOLESALE' ? '#ccfbf1' : '#ede9fe'}`
                      }}
                    >
                      {pl.tier_type}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', color: '#16a34a', fontWeight: 600 }}>
                    {parseFloat(pl.discount_pct) > 0 ? `${pl.discount_pct}% OFF` : 'Standard Base'}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#334155' }}>{pl.currency}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontSize: '12px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#16a34a' }} />
                      Active
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(pl.id)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        padding: '6px',
                        borderRadius: '4px',
                        transition: 'color 0.15s'
                      }}
                      title="Delete Price List"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(2px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '28px',
              width: '100%',
              maxWidth: '520px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}
          >
            <h2 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Create Price List</h2>
            <p style={{ margin: '0 0 20px', color: '#64748b', fontSize: '13px' }}>
              Define pricing tiers for specific merchant channels or customer segments.
            </p>

            <form onSubmit={handleCreatePriceList}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Price List Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Wholesale B2B Tier 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Tier Type
                  </label>
                  <select
                    value={tierType}
                    onChange={(e) => setTierType(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="VIP">VIP Customer</option>
                    <option value="RETAIL">Custom Retail</option>
                    <option value="CONTRACT">Corporate Contract</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Discount Percentage (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={discountPct}
                    onChange={(e) => setDiscountPct(e.target.value)}
                    style={{
                      width: '100%',
                      backgroundColor: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      color: '#0f172a',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Description / Channel Terms
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g., Applicable for minimum order quantities above 50 units."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#0f172a',
                    fontSize: '13px',
                    outline: 'none',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #cbd5e1',
                    color: '#64748b',
                    borderRadius: '8px',
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    backgroundColor: '#083e47',
                    border: 'none',
                    color: '#fff',
                    borderRadius: '8px',
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    opacity: submitting ? 0.7 : 1
                  }}
                >
                  {submitting ? 'Creating...' : 'Create Price List'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceLists;

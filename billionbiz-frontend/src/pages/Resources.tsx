import { useState } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Box,
  Plus,
  Search,
  Trash2
} from 'lucide-react';
import EmptyState from '../components/common/EmptyState';

export const ResourcesPage: FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState('SPACE');
  const [capacity, setCapacity] = useState(1);

  const handleCreateResource = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Resource name is required.');
      return;
    }

    setIsSubmitting(true);
    const newRes = {
      id: `res-${Date.now()}`,
      name: name.trim(),
      type,
      capacity,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      setResources((prev) => [newRes, ...prev]);
      setIsSubmitting(false);
      setShowAddModal(false);
      setName('');
      setCapacity(1);
    }, 300);
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const filteredResources = resources.filter((r) => {
    const matchesSearch = r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Box size={26} color="#083e47" />
            Equipment & Room Resources
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Manage treatment rooms, specialized salon equipment, vehicles, and shared booking assets.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
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
            boxShadow: '0 1px 3px rgba(8, 62, 71, 0.25)'
          }}
        >
          <Plus size={16} />
          Add Resource
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search resource by name..."
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

      {/* List */}
      {filteredResources.length === 0 ? (
        <EmptyState
          icon={Box}
          title={searchQuery ? 'No matching resources' : 'No equipment or rooms configured'}
          description={
            searchQuery
              ? 'No resource matches your search query.'
              : 'Add physical rooms, massage chairs, lasers, or equipment to track resource capacity.'
          }
          actionLabel="Add First Resource"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredResources.map((res) => (
            <div
              key={res.id}
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  {res.name}
                </h3>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '4px', background: '#f1f5f9', fontWeight: 600 }}>
                    {res.type === 'SPACE' ? 'Room / Suite' : 'Equipment'}
                  </span>
                  <span>Capacity: {res.capacity}</span>
                </div>
              </div>

              <button
                onClick={() => handleDelete(res.id)}
                title="Delete Resource"
                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '440px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Add Resource</h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleCreateResource} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Resource Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Therapy Suite 1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="SPACE">Room / Space</option>
                    <option value="ASSET">Equipment / Machinery</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Concurrent Capacity</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={capacity}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10) || 1)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
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
                  {isSubmitting ? 'Saving...' : 'Save Resource'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;

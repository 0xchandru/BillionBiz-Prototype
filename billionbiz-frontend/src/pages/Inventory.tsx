import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Layers,
  Plus,
  Search
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const InventoryPage: FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [selectedVariantName, setSelectedVariantName] = useState('');
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [adjustQty, setAdjustQty] = useState(10);
  const [movementType, setMovementType] = useState('PURCHASE');
  const [note, setNote] = useState('Stock replenishment from supplier');

  const fetchInventory = () => {
    setLoading(true);
    Promise.all([
      api.getProducts(),
      api.getWarehouses().catch(() => ({ warehouses: [] }))
    ])
      .then(([prodRes, whRes]) => {
        setProducts(prodRes.products || []);
        const whs = whRes.warehouses || [];
        setWarehouses(whs);
        if (whs.length > 0 && !selectedLocationId) {
          setSelectedLocationId(whs[0].id);
        }
      })
      .catch((err) => {
        console.error('Failed to load products for inventory', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  // Extract all variants from products
  const allVariants: any[] = [];
  products.forEach((p) => {
    (p.variants || []).forEach((v: any) => {
      allVariants.push({
        ...v,
        productName: p.name,
        available: v.inventory_quantity || v.available || 0,
        sku: v.sku || 'SKU-NONE'
      });
    });
  });

  const handleAdjustStock = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedVariantId) {
      alert('Please select a product variant to adjust.');
      return;
    }

    const locId = selectedLocationId || (warehouses.length > 0 ? warehouses[0].id : 'loc-default');

    setIsSubmitting(true);
    try {
      await api.adjustInventory({
        variantId: selectedVariantId,
        locationId: locId,
        adjustmentQty: adjustQty,
        movementType,
        note
      });

      setShowAdjustModal(false);
      fetchInventory();
    } catch (err: any) {
      alert(err.message || 'Failed to adjust inventory');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVariants = allVariants.filter((v) => {
    const matchesSearch =
      v.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.sku?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const totalOnHand = allVariants.reduce((acc, v) => acc + (v.available || 0), 0);
  const lowStockCount = allVariants.filter((v) => (v.available || 0) < 5).length;
  const outOfStockCount = allVariants.filter((v) => (v.available || 0) === 0).length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Catalogue</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Stock & Inventory</span>
          </div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={26} color="#0d9488" />
            Stock Reconciliation & Inventory
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Live stock balance tracking, physical audit adjustments, and reorder warnings.
          </p>
        </div>

        <button
          onClick={() => {
            if (allVariants.length > 0) {
              setSelectedVariantId(allVariants[0].id);
              setSelectedVariantName(`${allVariants[0].productName} (${allVariants[0].sku})`);
            }
            setShowAdjustModal(true);
          }}
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
          Adjust Stock
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total SKUs Tracked</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{allVariants.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0d9488', fontWeight: 600, textTransform: 'uppercase' }}>Total Units on Hand</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0d9488', marginTop: '6px' }}>{totalOnHand}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Low Stock SKUs (&lt; 5)</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>{lowStockCount}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase' }}>Out of Stock</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#ef4444', marginTop: '6px' }}>{outOfStockCount}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search variant name or SKU..."
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

      {/* Table */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={5} />
        </div>
      ) : filteredVariants.length === 0 ? (
        <EmptyState
          icon={Layers}
          title={searchQuery ? 'No matching stock records' : 'No inventory records found'}
          description={
            searchQuery
              ? 'No inventory variant matched your search.'
              : 'Add products and variants to manage real-time inventory balances and stock reordering.'
          }
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Product & Variant</th>
                <th style={{ padding: '14px 18px' }}>SKU</th>
                <th style={{ padding: '14px 18px' }}>On Hand</th>
                <th style={{ padding: '14px 18px' }}>Availability Status</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVariants.map((v) => (
                <tr key={v.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a' }}>
                    {v.productName}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '13px' }}>
                    <code>{v.sku}</code>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {v.available} units
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background:
                          v.available === 0
                            ? '#fee2e2'
                            : v.available < 5
                            ? '#fef3c7'
                            : '#dcfce7',
                        color:
                          v.available === 0
                            ? '#b91c1c'
                            : v.available < 5
                            ? '#b45309'
                            : '#15803d'
                      }}
                    >
                      {v.available === 0 ? 'Out of Stock' : v.available < 5 ? 'Low Stock' : 'In Stock'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => {
                        setSelectedVariantId(v.id);
                        setSelectedVariantName(`${v.productName} (${v.sku})`);
                        setShowAdjustModal(true);
                      }}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#fff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Adjust
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Adjust Modal */}
      {showAdjustModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '460px', width: '100%', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Adjust Stock Units{selectedVariantName ? ` - ${selectedVariantName}` : ''}
              </h2>
              <button onClick={() => setShowAdjustModal(false)} style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
            </div>

            <form onSubmit={handleAdjustStock} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Select SKU / Variant *</label>
                <select
                  required
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                >
                  {allVariants.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.productName} ({v.sku}) - Current: {v.available}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Movement Reason</label>
                  <select
                    value={movementType}
                    onChange={(e) => setMovementType(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', backgroundColor: '#fff' }}
                  >
                    <option value="PURCHASE">Stock Purchase / Restock (+)</option>
                    <option value="CORRECTION">Count Correction</option>
                    <option value="DAMAGE">Damaged / Written-off (-)</option>
                    <option value="RETURN">Customer Return (+)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Quantity Change *</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(parseInt(e.target.value, 10) || 0)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Audit Note</label>
                <input
                  type="text"
                  placeholder="e.g. PO-8921 received at warehouse"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 600, color: '#fff', cursor: 'pointer' }}
                >
                  {isSubmitting ? 'Adjusting...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

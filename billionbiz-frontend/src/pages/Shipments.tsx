import { useState, useEffect } from 'react';
import type { FC, FormEvent } from 'react';
import {
  Truck,
  Plus,
  Search
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import EmptyState from '../components/common/EmptyState';

export const ShipmentsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered'>('all');
  const [shipments, setShipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCarrier, setSelectedCarrier] = useState('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Form State
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formCarrier, setFormCarrier] = useState('Shiprocket');
  const [formTrackingNumber, setFormTrackingNumber] = useState('');

  const fetchShipments = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const res = await api.getShipments();
      setShipments(res.shipments || []);
    } catch (err: any) {
      setLoadError(err.message || 'Shipments could not be loaded.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchShipments();
  }, []);

  const handleCreateShipment = async (e: FormEvent) => {
    e.preventDefault();
    const orderNumber = formOrderNumber.trim().toUpperCase();
    const trackingNumber = formTrackingNumber.trim().toUpperCase();
    const carrier = formCarrier.trim();

    if (!orderNumber || !trackingNumber || !carrier) {
      setActionError('Order number, carrier and tracking number are required.');
      return;
    }

    setIsSubmitting(true);
    setActionError(null);
    setNotice(null);
    try {
      const orderResult = await api.getOrders({ search: orderNumber });
      const order = (orderResult.orders || []).find(
        (item: any) => String(item.order_number || '').toUpperCase() === orderNumber
      );
      if (!order) {
        throw new Error('Order number was not found in this store. Check the number and try again.');
      }
      if (order.fulfillment_status === 'FULFILLED') {
        throw new Error('This order is already marked as fulfilled.');
      }
      if (['CANCELLED', 'VOIDED'].includes(String(order.status || '').toUpperCase())) {
        throw new Error('Cancelled or voided orders cannot be handed to a carrier.');
      }

      const idempotencyKey = typeof window !== 'undefined' && window.crypto?.randomUUID
        ? window.crypto.randomUUID()
        : `fulfillment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const result = await api.fulfillOrder(order.id, { carrier, trackingNumber }, idempotencyKey);

      setShowAddModal(false);
      setFormOrderNumber('');
      setFormTrackingNumber('');
      setNotice(`Order ${order.order_number} was marked as handed to ${result.carrier}. Tracking number: ${result.trackingNumber}. Carrier scan updates are not connected yet.`);
      await fetchShipments();
    } catch (err: any) {
      setActionError(err.message || 'Shipment handoff could not be recorded.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredShipments = shipments.filter((shp) => {
    const matchesSearch =
      shp.tracking_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.order_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shp.carrier?.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (selectedCarrier !== 'ALL' && shp.carrier?.toUpperCase() !== selectedCarrier) {
      return false;
    }

    if (activeTab === 'pending') return shp.status === 'PENDING_PICKUP';
    if (activeTab === 'in_transit') return shp.status === 'SHIPPED' || shp.status === 'IN_TRANSIT';
    if (activeTab === 'out_for_delivery') return shp.status === 'OUT_FOR_DELIVERY';
    if (activeTab === 'delivered') return shp.status === 'DELIVERED';
    return true;
  });

  const countDelivered = shipments.filter((s) => s.status === 'DELIVERED').length;
  const countInTransit = shipments.filter((s) => s.status === 'SHIPPED' || s.status === 'IN_TRANSIT').length;
  const countPending = shipments.filter((s) => s.status === 'PENDING_PICKUP').length;

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Truck size={26} color="#0d9488" />
            Shipments & Courier Tracking
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Record carrier handoffs and tracking numbers. Live carrier scan updates require a carrier integration.
          </p>
        </div>

        <button
          onClick={() => { setActionError(null); setNotice(null); setShowAddModal(true); }}
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
          Create Shipment
        </button>
      </div>

      {notice && <div role="status" style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid #bfdbfe', borderRadius: '9px', background: '#eff6ff', color: '#1e40af', fontSize: '13px' }}>{notice}</div>}
      {actionError && !showAddModal && <div role="alert" style={{ marginBottom: '16px', padding: '12px 14px', border: '1px solid #fecaca', borderRadius: '9px', background: '#fef2f2', color: '#b91c1c', fontSize: '13px' }}>{actionError}</div>}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Shipments</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{shipments.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Handed Off / In Transit</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7', marginTop: '6px' }}>{countInTransit}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Delivered</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>{countDelivered}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Pending Pickup</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>{countPending}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('all')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'all' ? 600 : 500,
            color: activeTab === 'all' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'all' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          All ({shipments.length})
        </button>
        <button
          onClick={() => setActiveTab('in_transit')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'in_transit' ? 600 : 500,
            color: activeTab === 'in_transit' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'in_transit' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Handed Off / In Transit ({countInTransit})
        </button>
        <button
          onClick={() => setActiveTab('out_for_delivery')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'out_for_delivery' ? 600 : 500,
            color: activeTab === 'out_for_delivery' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'out_for_delivery' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Out For Delivery
        </button>
        <button
          onClick={() => setActiveTab('delivered')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'delivered' ? 600 : 500,
            color: activeTab === 'delivered' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'delivered' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Delivered ({countDelivered})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'pending' ? 600 : 500,
            color: activeTab === 'pending' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'pending' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Pending Pickup ({countPending})
        </button>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '360px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search tracking number, order or courier..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Courier:</span>
          <select
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid #e2e8f0',
              fontSize: '13px',
              outline: 'none',
              backgroundColor: '#ffffff'
            }}
          >
            <option value="ALL">All Couriers</option>
            <option value="SHIPROCKET">Shiprocket</option>
            <option value="DELHIVERY">Delhivery</option>
            <option value="BLUEDART">BlueDart</option>
            <option value="DTDC">DTDC</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      {loading ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={4} columns={6} />
        </div>
      ) : loadError ? (
        <div role="alert" style={{ background: '#fff', border: '1px solid #fecaca', borderRadius: '12px', padding: '24px', color: '#991b1b' }}>
          <p style={{ margin: '0 0 12px', fontSize: '13px' }}>{loadError}</p>
          <button type="button" onClick={() => void fetchShipments()} style={{ minHeight: '40px', padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', cursor: 'pointer', fontWeight: 600 }}>Retry</button>
        </div>
      ) : filteredShipments.length === 0 ? (
        <EmptyState
          icon={Truck}
          title={searchQuery ? 'No matching shipments' : 'No active shipments found'}
          description={
            searchQuery
              ? 'No shipment matches your search or courier filter.'
              : 'Dispatched orders with AWB tracking numbers will appear here once processed.'
          }
          actionLabel="Create New Shipment"
          onAction={() => { setActionError(null); setNotice(null); setShowAddModal(true); }}
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>AWB / Tracking Number</th>
                <th style={{ padding: '14px 18px' }}>Order Number</th>
                <th style={{ padding: '14px 18px' }}>Courier Partner</th>
                <th style={{ padding: '14px 18px' }}>Status</th>
                <th style={{ padding: '14px 18px' }}>Dispatched Date</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((shp) => (
                <tr key={shp.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0d9488' }}>
                    {shp.tracking_number}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 500 }}>
                    {shp.order_number}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569' }}>
                    {shp.carrier || 'Shiprocket'}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background:
                          shp.status === 'DELIVERED'
                            ? '#dcfce7'
                            : shp.status === 'OUT_FOR_DELIVERY'
                            ? '#fef3c7'
                            : '#e0f2fe',
                        color:
                          shp.status === 'DELIVERED'
                            ? '#15803d'
                            : shp.status === 'OUT_FOR_DELIVERY'
                            ? '#b45309'
                            : '#0369a1'
                      }}
                    >
                      {shp.status === 'SHIPPED' ? 'Handed to carrier' : shp.status || 'Unknown'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {new Date(shp.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => {
                        if (navigator.clipboard?.writeText) {
                          void navigator.clipboard.writeText(shp.tracking_number).then(
                            () => setNotice(`Copied tracking number ${shp.tracking_number}.`),
                            () => setNotice(`Tracking number: ${shp.tracking_number}`)
                          );
                        } else {
                          setNotice(`Tracking number: ${shp.tracking_number}`);
                        }
                      }}
                      style={{
                        minHeight: '36px',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: '#0f172a'
                      }}
                    >
                      Copy tracking number
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showAddModal && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isSubmitting) setShowAddModal(false);
          }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.56)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="shipment-modal-title" style={{ backgroundColor: '#ffffff', borderRadius: '16px', maxWidth: '540px', width: '100%', maxHeight: 'calc(100dvh - 32px)', overflowY: 'auto', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.24)' }}>
            <div style={{ padding: '20px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <h2 id="shipment-modal-title" style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Record carrier handoff</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Use the tracking number issued by your carrier.</p>
              </div>
              <button type="button" disabled={isSubmitting} onClick={() => setShowAddModal(false)} aria-label="Close shipment dialog" style={{ width: '40px', height: '40px', border: '1px solid #e2e8f0', borderRadius: '9px', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '18px' }}>×</button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ padding: '22px' }}>
              <label htmlFor="shipment-order-number" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>Order number *</label>
              <input id="shipment-order-number" type="text" required maxLength={64} placeholder="e.g. BBZ-1002" value={formOrderNumber} onChange={(event) => setFormOrderNumber(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '16px' }} />

              <label htmlFor="shipment-carrier" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>Carrier *</label>
              <select id="shipment-carrier" required value={formCarrier} onChange={(event) => setFormCarrier(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', marginBottom: '16px' }}>
                <option value="Shiprocket">Shiprocket</option>
                <option value="Delhivery">Delhivery</option>
                <option value="BlueDart">BlueDart</option>
                <option value="DTDC">DTDC</option>
                <option value="Other">Other carrier</option>
              </select>

              <label htmlFor="shipment-tracking-number" style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#475569', marginBottom: '6px' }}>AWB / tracking number *</label>
              <input id="shipment-tracking-number" type="text" required minLength={3} maxLength={128} placeholder="e.g. SR982736154" value={formTrackingNumber} onChange={(event) => setFormTrackingNumber(event.target.value.toUpperCase())} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', marginBottom: '14px', textTransform: 'uppercase' }} />

              <div style={{ padding: '11px 12px', marginBottom: '16px', borderRadius: '8px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', fontSize: '11px', lineHeight: 1.5 }}>
                Saving this handoff marks the order as fulfilled and records the supplied tracking number. It does not book a pickup, buy a shipping label, or receive live carrier scan events. The delivery address is read from the selected order.
              </div>

              {actionError && <div role="alert" style={{ padding: '10px 12px', marginBottom: '14px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px' }}>{actionError}</div>}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
                <button type="button" disabled={isSubmitting} onClick={() => setShowAddModal(false)} style={{ minHeight: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} style={{ minHeight: '42px', padding: '0 18px', borderRadius: '8px', border: 'none', background: '#0d9488', fontSize: '13px', fontWeight: 650, color: '#fff', cursor: isSubmitting ? 'wait' : 'pointer', opacity: isSubmitting ? 0.65 : 1 }}>{isSubmitting ? 'Saving handoff…' : 'Record handoff'}</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default ShipmentsPage;

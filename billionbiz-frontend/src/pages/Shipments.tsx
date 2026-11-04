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

  // Form State
  const [formOrderNumber, setFormOrderNumber] = useState('');
  const [formCarrier, setFormCarrier] = useState('Shiprocket');
  const [formTrackingNumber, setFormTrackingNumber] = useState('');
  const [formDestination, setFormDestination] = useState('');
  const [formStatus, setFormStatus] = useState('IN_TRANSIT');

  const fetchShipments = () => {
    setLoading(true);
    api.getShipments()
      .then((res) => {
        setShipments(res.shipments || []);
      })
      .catch((err) => {
        console.error('Failed to load shipments', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const handleCreateShipment = (e: FormEvent) => {
    e.preventDefault();
    if (!formTrackingNumber.trim() || !formOrderNumber.trim()) {
      alert('Tracking number and order number are required.');
      return;
    }

    setIsSubmitting(true);
    // Real-time local state addition
    const newShipment = {
      id: `shp-${Date.now()}`,
      tracking_number: formTrackingNumber.trim().toUpperCase(),
      order_number: formOrderNumber.trim().toUpperCase(),
      carrier: formCarrier,
      destination: formDestination.trim() || 'Domestic Customer Address',
      status: formStatus,
      created_at: new Date().toISOString()
    };

    setTimeout(() => {
      setShipments((prev) => [newShipment, ...prev]);
      setIsSubmitting(false);
      setShowAddModal(false);
      // Reset form
      setFormOrderNumber('');
      setFormTrackingNumber('');
      setFormDestination('');
      setFormStatus('IN_TRANSIT');
    }, 300);
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
    if (activeTab === 'in_transit') return shp.status === 'IN_TRANSIT';
    if (activeTab === 'out_for_delivery') return shp.status === 'OUT_FOR_DELIVERY';
    if (activeTab === 'delivered') return shp.status === 'DELIVERED';
    return true;
  });

  const countDelivered = shipments.filter((s) => s.status === 'DELIVERED').length;
  const countInTransit = shipments.filter((s) => s.status === 'IN_TRANSIT' || s.status === 'OUT_FOR_DELIVERY').length;
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
            Dispatch parcels, monitor live transit tracking, and manage third-party logistics fulfillment.
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
          Create Shipment
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Shipments</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{shipments.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>In Transit</div>
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
          In Transit ({countInTransit})
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
          onAction={() => setShowAddModal(true)}
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
                      {shp.status || 'IN_TRANSIT'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b' }}>
                    {new Date(shp.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => alert(`Tracking ${shp.tracking_number} via ${shp.carrier || 'Courier'}: Consignment is currently ${shp.status}.`)}
                      style={{
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
                      Track Package
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
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                Create New Courier Shipment
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateShipment} style={{ padding: '24px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Associated Order Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BBZ-1002"
                  value={formOrderNumber}
                  onChange={(e) => setFormOrderNumber(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    Courier Partner *
                  </label>
                  <select
                    value={formCarrier}
                    onChange={(e) => setFormCarrier(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                  >
                    <option value="Shiprocket">Shiprocket</option>
                    <option value="Delhivery">Delhivery</option>
                    <option value="BlueDart">BlueDart</option>
                    <option value="DTDC">DTDC</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    AWB / Tracking Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SR982736154"
                    value={formTrackingNumber}
                    onChange={(e) => setFormTrackingNumber(e.target.value)}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', textTransform: 'uppercase' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Destination Delivery Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 12, Koramangala, Bengaluru - 560034"
                  value={formDestination}
                  onChange={(e) => setFormDestination(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                  Initial Tracking Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none', backgroundColor: '#fff' }}
                >
                  <option value="PENDING_PICKUP">Pending Pickup</option>
                  <option value="IN_TRANSIT">In Transit</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

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
                  {isSubmitting ? 'Creating...' : 'Create Shipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentsPage;

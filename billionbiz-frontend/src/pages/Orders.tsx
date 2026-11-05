import React, { useState, useEffect } from 'react';
import { 
  Search, 
  RefreshCw, 
  ShoppingCart, 
  Plus, 
  Printer 
} from 'lucide-react';
import { api } from '../api/services';
import { TableSkeleton } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';

type ManualOrderLine = {
  variantId: string;
  quantity: number;
  title: string;
  sku: string;
  unitPriceMinor: number;
  stockAvailable: number;
};

const createIdempotencyKey = () => {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }
  return `manual-order-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export const OrdersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'unfulfilled' | 'unpaid' | 'completed' | 'cancelled'>('all');
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isFulfillModalOpen, setIsFulfillModalOpen] = useState(false);
  const [carrier, setCarrier] = useState('Shiprocket Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // New Order Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newOrderCustomer, setNewOrderCustomer] = useState('');
  const [newOrderEmail, setNewOrderEmail] = useState('');
  const [newOrderPhone, setNewOrderPhone] = useState('');
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogSearch, setCatalogSearch] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [newOrderQty, setNewOrderQty] = useState(1);
  const [manualOrderLines, setManualOrderLines] = useState<ManualOrderLine[]>([]);
  const [createOrderError, setCreateOrderError] = useState<string | null>(null);
  const [createdOrderNotice, setCreatedOrderNotice] = useState<string | null>(null);
  const [createOrderKey, setCreateOrderKey] = useState('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const loadOrders = async (overrides: { search?: string; status?: string } = {}) => {
    try {
      setLoadingOrders(true);
      setOrderError(null);
      const effectiveSearch = overrides.search !== undefined ? overrides.search : search;
      const effectiveStatus = overrides.status !== undefined ? overrides.status : statusFilter;
      const res = await api.getOrders({
        search: effectiveSearch || undefined,
        status: effectiveStatus || undefined
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('Failed to load orders', err);
      setOrderError(err.message || 'Failed to connect to orders repository.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleUpdateStatus = async (orderId: string, status: string, fulfillmentStatus?: string) => {
    try {
      setActionLoading(true);
      await api.updateOrderStatus(orderId, status);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev: any) => ({
          ...prev,
          status,
          fulfillment_status: fulfillmentStatus || prev.fulfillment_status
        }));
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFulfillOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      setActionLoading(true);
      await api.fulfillOrder(selectedOrder.id, {
        trackingNumber,
        carrier
      });
      setIsFulfillModalOpen(false);
      await loadOrders();
      setSelectedOrder((prev: any) => ({
        ...prev,
        fulfillment_status: 'FULFILLED',
        tracking_number: trackingNumber,
        carrier
      }));
    } catch (err: any) {
      alert(err.message || 'Failed to fulfill order');
    } finally {
      setActionLoading(false);
    }
  };

  const resetCreateOrderForm = () => {
    setNewOrderCustomer('');
    setNewOrderEmail('');
    setNewOrderPhone('');
    setCatalogProducts([]);
    setCatalogSearch('');
    setSelectedVariantId('');
    setNewOrderQty(1);
    setManualOrderLines([]);
    setCatalogError(null);
    setCreateOrderError(null);
    setCreateOrderKey('');
  };

  const openCreateOrderModal = async () => {
    resetCreateOrderForm();
    setCreatedOrderNotice(null);
    setCreateOrderKey(createIdempotencyKey());
    setShowCreateModal(true);
    setCatalogLoading(true);
    try {
      const res = await api.getProducts({ status: 'ACTIVE', limit: 100, offset: 0 });
      const products = res.products || [];
      setCatalogProducts(products);
      const firstVariant = products.find((product: any) => Array.isArray(product.variants) && product.variants.length > 0)?.variants?.[0];
      setSelectedVariantId(firstVariant?.id || '');
      if (products.length === 0) {
        setCatalogError('No active products are available. Add or activate a product before creating a manual order.');
      }
    } catch (err: any) {
      setCatalogError(err.message || 'Could not load the product catalogue. Try again.');
    } finally {
      setCatalogLoading(false);
    }
  };

  const handleCatalogSearch = async () => {
    setCatalogLoading(true);
    setCatalogError(null);
    try {
      const res = await api.getProducts({
        status: 'ACTIVE',
        search: catalogSearch.trim() || undefined,
        limit: 100,
        offset: 0
      });
      setCatalogProducts(res.products || []);
      const variants = (res.products || []).flatMap((product: any) => product.variants || []);
      if (!variants.some((variant: any) => variant.id === selectedVariantId)) {
        setSelectedVariantId(variants[0]?.id || '');
      }
      if ((res.products || []).length === 0) {
        setCatalogError('No active products matched this search. Try another name or SKU.');
      }
    } catch (err: any) {
      setCatalogError(err.message || 'Could not search the product catalogue.');
    } finally {
      setCatalogLoading(false);
    }
  };

  const selectedCatalogVariant = catalogProducts
    .flatMap((product: any) => (product.variants || []).map((variant: any) => ({ product, variant })))
    .find(({ variant }: any) => variant.id === selectedVariantId);

  const manualOrderSubtotal = manualOrderLines.reduce(
    (total, line) => total + line.unitPriceMinor * line.quantity,
    0
  );

  const handleAddManualOrderLine = () => {
    if (!selectedCatalogVariant) {
      setCreateOrderError('Select an active product variant first.');
      return;
    }

    const { product, variant } = selectedCatalogVariant;
    const line: ManualOrderLine = {
      variantId: variant.id,
      quantity: Math.max(1, Math.min(9999, Math.floor(newOrderQty))),
      title: product.name,
      sku: variant.sku || 'No SKU',
      unitPriceMinor: Number(variant.price_minor) || 0,
      stockAvailable: Number(variant.stock_available) || 0
    };

    setManualOrderLines((previous) => {
      const existing = previous.find((item) => item.variantId === line.variantId);
      if (!existing) return [...previous, line];
      return previous.map((item) => item.variantId === line.variantId
        ? { ...item, quantity: Math.min(9999, item.quantity + line.quantity) }
        : item
      );
    });
    setNewOrderQty(1);
    setCreateOrderError(null);
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = newOrderCustomer.trim();
    const customerEmail = newOrderEmail.trim().toLowerCase();
    const customerPhone = newOrderPhone.trim();

    if (!customerName) {
      setCreateOrderError('Enter the customer name.');
      return;
    }
    if (!customerEmail && !customerPhone) {
      setCreateOrderError('Enter at least one customer contact: email or phone number.');
      return;
    }
    if (manualOrderLines.length === 0) {
      setCreateOrderError('Add at least one product to this order.');
      return;
    }
    if (!Number.isSafeInteger(manualOrderSubtotal) || manualOrderSubtotal < 0) {
      setCreateOrderError('The selected order total is outside the supported amount range.');
      return;
    }

    const nameParts = customerName.split(/\s+/);
    const firstName = nameParts.shift() || 'Guest';
    const lastName = nameParts.join(' ');
    setIsCreatingOrder(true);
    setCreateOrderError(null);

    try {
      const result = await api.createOrder({
        channel: 'MANUAL',
        customerDetails: {
          firstName,
          lastName,
          ...(customerEmail ? { email: customerEmail } : {}),
          ...(customerPhone ? { phone: customerPhone } : {})
        },
        items: manualOrderLines.map((line) => ({
          variantId: line.variantId,
          quantity: line.quantity
        }))
      }, createOrderKey || createIdempotencyKey());

      setShowCreateModal(false);
      resetCreateOrderForm();
      setActiveTab('all');
      setStatusFilter('');
      setSearch('');
      setCreatedOrderNotice(`Order ${result.orderNumber} was saved successfully. Payment is pending.`);
      await loadOrders({ search: '', status: '' });
    } catch (err: any) {
      setCreateOrderError(err.message || 'The order could not be saved. Check the details and try again.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'unfulfilled') return o.fulfillment_status === 'UNFULFILLED';
    if (activeTab === 'unpaid') return o.payment_status === 'PENDING' || o.payment_status === 'FAILED';
    if (activeTab === 'completed') return o.status === 'COMPLETED';
    if (activeTab === 'cancelled') return o.status === 'CANCELLED';
    return true;
  });

  const countUnfulfilled = orders.filter((o) => o.fulfillment_status === 'UNFULFILLED').length;
  const countUnpaid = orders.filter((o) => o.payment_status === 'PENDING').length;
  const countCompleted = orders.filter((o) => o.status === 'COMPLETED').length;
  const countCancelled = orders.filter((o) => o.status === 'CANCELLED').length;
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total_minor || 0), 0);

  return (
    <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, -apple-system, sans-serif' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShoppingCart size={26} color="#0d9488" />
            Orders Management
          </h1>
          <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
            Track, fulfill, and manage customer orders across online store, POS terminal, and digital channels.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => loadOrders()}
            title="Refresh Orders"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              fontSize: '13px',
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>

          <button
            onClick={openCreateOrderModal}
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
            Create Order
          </button>
        </div>
      </div>

      {createdOrderNotice && (
        <div role="status" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '12px 16px', marginBottom: '18px', border: '1px solid #bbf7d0', borderRadius: '10px', background: '#f0fdf4', color: '#166534', fontSize: '13px' }}>
          <span>{createdOrderNotice}</span>
          <button type="button" onClick={() => setCreatedOrderNotice(null)} aria-label="Dismiss order confirmation" style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', fontSize: '18px' }}>×</button>
        </div>
      )}

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', marginTop: '6px' }}>{orders.length}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#d97706', fontWeight: 600, textTransform: 'uppercase' }}>Unfulfilled</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginTop: '6px' }}>{countUnfulfilled}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>Completed</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#0284c7', marginTop: '6px' }}>{countCompleted}</div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginTop: '6px' }}>{formatCurrency(totalRevenue)}</div>
        </div>
      </div>

      {/* Local Tabs */}
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
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('unfulfilled')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'unfulfilled' ? 600 : 500,
            color: activeTab === 'unfulfilled' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'unfulfilled' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Unfulfilled ({countUnfulfilled})
        </button>
        <button
          onClick={() => setActiveTab('unpaid')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'unpaid' ? 600 : 500,
            color: activeTab === 'unpaid' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'unpaid' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Unpaid ({countUnpaid})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'completed' ? 600 : 500,
            color: activeTab === 'completed' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'completed' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Completed ({countCompleted})
        </button>
        <button
          onClick={() => setActiveTab('cancelled')}
          style={{
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: activeTab === 'cancelled' ? 600 : 500,
            color: activeTab === 'cancelled' ? '#0d9488' : '#64748b',
            border: 'none',
            background: 'none',
            borderBottom: activeTab === 'cancelled' ? '2px solid #0d9488' : '2px solid transparent',
            cursor: 'pointer'
          }}
        >
          Cancelled ({countCancelled})
        </button>
      </div>

      {/* Search and Filters */}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <form onSubmit={handleSearchSubmit} style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search order number, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 14px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            fontSize: '13px',
            outline: 'none',
            backgroundColor: '#ffffff'
          }}
        >
          <option value="">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      {loadingOrders ? (
        <div style={{ background: '#ffffff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : orderError ? (
        <ErrorState message={orderError} onRetry={loadOrders} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={search ? 'No matching orders' : 'No orders found'}
          description={
            search
              ? 'No orders matched your search criteria.'
              : 'When customers checkout through your storefront, counter POS, or invoices, they will appear here.'
          }
          actionLabel="Create Test Order"
          onAction={() => setShowCreateModal(true)}
        />
      ) : (
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '12px', textTransform: 'uppercase' }}>
                <th style={{ padding: '14px 18px' }}>Order Number</th>
                <th style={{ padding: '14px 18px' }}>Date</th>
                <th style={{ padding: '14px 18px' }}>Customer</th>
                <th style={{ padding: '14px 18px' }}>Payment</th>
                <th style={{ padding: '14px 18px' }}>Fulfillment</th>
                <th style={{ padding: '14px 18px' }}>Total Amount</th>
                <th style={{ padding: '14px 18px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setIsDetailsModalOpen(true);
                  }}
                >
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0d9488' }}>
                    {ord.order_number}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '13px' }}>
                    {new Date(ord.created_at || Date.now()).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{ord.customer_name || 'Retail Shopper'}</div>
                    {ord.customer_email && <div style={{ fontSize: '12px', color: '#64748b' }}>{ord.customer_email}</div>}
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: ord.payment_status === 'CAPTURED' ? '#dcfce7' : '#fef3c7',
                        color: ord.payment_status === 'CAPTURED' ? '#15803d' : '#b45309'
                      }}
                    >
                      {ord.payment_status || 'PENDING'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        background: ord.fulfillment_status === 'FULFILLED' ? '#dcfce7' : '#fee2e2',
                        color: ord.fulfillment_status === 'FULFILLED' ? '#15803d' : '#b91c1c'
                      }}
                    >
                      {ord.fulfillment_status || 'UNFULFILLED'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#0f172a' }}>
                    {formatCurrency(ord.total_minor || 0)}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedOrder(ord);
                        setIsDetailsModalOpen(true);
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {isDetailsModalOpen && selectedOrder && (
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
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                  Order {selectedOrder.order_number}
                </h2>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  Placed on {new Date(selectedOrder.created_at || Date.now()).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
              {/* Customer and Status Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Customer</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>{selectedOrder.customer_name || 'Retail Shopper'}</div>
                  <div style={{ fontSize: '13px', color: '#475569' }}>{selectedOrder.customer_email || 'No email provided'}</div>
                </div>

                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Order Status</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#dcfce7', color: '#15803d' }}>
                      {selectedOrder.status}
                    </span>
                    <span style={{ padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, background: '#e0f2fe', color: '#0369a1' }}>
                      {selectedOrder.fulfillment_status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Ordered Items</h4>
                <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                  {(selectedOrder.lines || [
                    { id: '1', title: 'Standard Merchandise Item', quantity: 1, total_minor: selectedOrder.total_minor }
                  ]).map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '13px' }}>
                      <div>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{item.title}</div>
                        <div style={{ color: '#64748b', fontSize: '12px' }}>Qty: {item.quantity}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(item.total_minor || 0)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                  <span>Subtotal:</span>
                  <span style={{ fontWeight: 600, color: '#0f172a' }}>{formatCurrency(selectedOrder.subtotal_minor || selectedOrder.total_minor || 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '8px', fontSize: '16px', fontWeight: 700, color: '#0d9488' }}>
                  <span>Total Amount:</span>
                  <span>{formatCurrency(selectedOrder.total_minor || 0)}</span>
                </div>
              </div>
            </div>

            {/* Actions Footer */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                onClick={() => window.print()}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                <Printer size={14} />
                Print Invoice
              </button>

              <div style={{ display: 'flex', gap: '10px' }}>
                {selectedOrder.fulfillment_status !== 'FULFILLED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => setIsFulfillModalOpen(true)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: 'none',
                      background: '#0d9488',
                      color: '#fff',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Mark as Fulfilled
                  </button>
                )}

                {selectedOrder.status !== 'CANCELLED' && (
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #fca5a5',
                      background: '#fef2f2',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Cancel Order
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Courier Modal */}
      {isFulfillModalOpen && selectedOrder && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#ffffff', borderRadius: '14px', maxWidth: '440px', width: '100%', padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
              Fulfill Order {selectedOrder.order_number}
            </h3>
            <form onSubmit={handleFulfillOrder}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>Courier Service</label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="Shiprocket Express">Shiprocket Express</option>
                  <option value="Delhivery Surface">Delhivery Surface</option>
                  <option value="BlueDart Air">BlueDart Air</option>
                  <option value="DTDC Standard">DTDC Standard</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>AWB / Tracking Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AWB987654321"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsFulfillModalOpen(false)}
                  style={{ padding: '8px 14px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '13px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  style={{ padding: '8px 18px', borderRadius: '6px', border: 'none', background: '#0d9488', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Confirm Shipment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Manual Order Modal */}
      {showCreateModal && (
        <div
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !isCreatingOrder) setShowCreateModal(false);
          }}
          style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.58)', backdropFilter: 'blur(3px)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-order-title"
            style={{ background: '#ffffff', borderRadius: '16px', maxWidth: '720px', width: '100%', maxHeight: 'calc(100dvh - 24px)', overflow: 'hidden', boxShadow: '0 24px 70px rgba(15, 23, 42, 0.28)', display: 'flex', flexDirection: 'column' }}
          >
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div>
                <h2 id="create-order-title" style={{ margin: 0, fontSize: '18px', fontWeight: 750, color: '#0f172a' }}>Create manual order</h2>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>Add real catalogue products and customer details.</p>
              </div>
              <button type="button" disabled={isCreatingOrder} onClick={() => setShowCreateModal(false)} aria-label="Close create order dialog" style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', cursor: 'pointer', fontSize: '20px' }}>×</button>
            </div>

            <form onSubmit={handleCreateOrder} style={{ padding: '20px 22px', overflowY: 'auto' }}>
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '13px', fontWeight: 700 }}>Customer details</h3>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Email or phone required</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                    Customer name *
                    <input type="text" required maxLength={257} autoComplete="name" placeholder="e.g. Priya Sharma" value={newOrderCustomer} onChange={(event) => setNewOrderCustomer(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                    Email address
                    <input type="email" maxLength={255} autoComplete="email" placeholder="priya@example.com" value={newOrderEmail} onChange={(event) => setNewOrderEmail(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a' }} />
                  </label>
                  <label style={{ display: 'grid', gap: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                    Phone number
                    <input type="tel" maxLength={32} autoComplete="tel" placeholder="+91 98765 43210" value={newOrderPhone} onChange={(event) => setNewOrderPhone(event.target.value)} style={{ width: '100%', minHeight: '42px', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', color: '#0f172a' }} />
                  </label>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '18px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' }}>
                  <h3 style={{ margin: 0, color: '#0f172a', fontSize: '13px', fontWeight: 700 }}>Products</h3>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>Prices are verified by the server</span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                  <input type="search" value={catalogSearch} onChange={(event) => setCatalogSearch(event.target.value)} placeholder="Search products or SKU..." aria-label="Search products or SKU" onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void handleCatalogSearch(); } }} style={{ flex: 1, minWidth: 0, minHeight: '42px', padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px' }} />
                  <button type="button" onClick={() => void handleCatalogSearch()} disabled={catalogLoading} style={{ padding: '0 14px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '12px', fontWeight: 650, cursor: catalogLoading ? 'wait' : 'pointer' }}>Search</button>
                </div>

                {catalogLoading ? (
                  <div role="status" style={{ padding: '18px', textAlign: 'center', border: '1px dashed #cbd5e1', borderRadius: '10px', color: '#64748b', fontSize: '13px' }}>Loading active products…</div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 100px auto', alignItems: 'end', gap: '10px' }}>
                    <label style={{ display: 'grid', gap: '6px', minWidth: 0, color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                      Product / variant
                      <select value={selectedVariantId} onChange={(event) => setSelectedVariantId(event.target.value)} disabled={!catalogProducts.some((product: any) => product.variants?.length)} style={{ minWidth: 0, width: '100%', minHeight: '42px', padding: '8px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', fontSize: '12px' }}>
                        <option value="">Select a product variant</option>
                        {catalogProducts.map((product: any) => (
                          <optgroup key={product.id} label={product.name}>
                            {(product.variants || []).map((variant: any) => {
                              const optionLabel = variant.option_values && typeof variant.option_values === 'object'
                                ? Object.entries(variant.option_values).map(([key, value]) => key + ': ' + String(value)).join(', ')
                                : '';
                              return (
                                <option key={variant.id} value={variant.id}>
                                  {(optionLabel ? optionLabel + ' · ' : '') + (variant.sku || 'No SKU') + ' · ' + formatCurrency(Number(variant.price_minor) || 0)}
                                </option>
                              );
                            })}
                          </optgroup>
                        ))}
                      </select>
                    </label>
                    <label style={{ display: 'grid', gap: '6px', color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                      Quantity
                      <input type="number" min="1" max="9999" step="1" value={newOrderQty} onChange={(event) => setNewOrderQty(Math.max(1, Math.min(9999, Number(event.target.value) || 1)))} style={{ minHeight: '42px', width: '100%', padding: '9px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }} />
                    </label>
                    <button type="button" onClick={handleAddManualOrderLine} disabled={!selectedCatalogVariant || catalogLoading} style={{ minHeight: '42px', padding: '0 14px', border: 0, borderRadius: '8px', background: '#0d9488', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: selectedCatalogVariant ? 'pointer' : 'not-allowed', whiteSpace: 'nowrap' }}>Add item</button>
                  </div>
                )}

                {selectedCatalogVariant && !catalogLoading && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', marginTop: '10px', color: '#64748b', fontSize: '11px' }}>
                    <span>{selectedCatalogVariant.product.name} · {selectedCatalogVariant.variant.sku || 'No SKU'}</span>
                    <span>Available stock: <strong style={{ color: Number(selectedCatalogVariant.variant.stock_available) > 0 ? '#15803d' : '#b45309' }}>{Number(selectedCatalogVariant.variant.stock_available) || 0}</strong></span>
                  </div>
                )}

                {catalogError && (
                  <div role="alert" style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '8px', background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', fontSize: '12px' }}>{catalogError}</div>
                )}
              </div>

              <div style={{ border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden', marginBottom: '18px' }}>
                <div style={{ padding: '11px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <strong style={{ color: '#334155', fontSize: '12px' }}>Order items</strong>
                  <span style={{ color: '#64748b', fontSize: '11px' }}>{manualOrderLines.length} line item(s)</span>
                </div>
                {manualOrderLines.length === 0 ? (
                  <div style={{ padding: '22px 14px', textAlign: 'center', color: '#64748b', fontSize: '12px' }}>No products added yet. Select a product variant above.</div>
                ) : (
                  <div>
                    {manualOrderLines.map((line) => (
                      <div key={line.variantId} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: '12px', padding: '12px 14px', borderBottom: '1px solid #f1f5f9' }}>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ color: '#0f172a', fontSize: '12px', fontWeight: 650, overflowWrap: 'anywhere' }}>{line.title}</div>
                          <div style={{ color: '#64748b', fontSize: '10px', marginTop: '3px' }}>{line.sku} · {formatCurrency(line.unitPriceMinor)} each</div>
                          {line.stockAvailable < line.quantity && <div style={{ color: '#b45309', fontSize: '10px', marginTop: '3px' }}>Quantity exceeds currently available stock ({line.stockAvailable}). Inventory is not reserved by this action.</div>}
                        </div>
                        <div style={{ color: '#334155', fontSize: '12px', whiteSpace: 'nowrap' }}>× {line.quantity}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <strong style={{ color: '#0f172a', fontSize: '12px', whiteSpace: 'nowrap' }}>{formatCurrency(line.unitPriceMinor * line.quantity)}</strong>
                          <button type="button" onClick={() => setManualOrderLines((previous) => previous.filter((item) => item.variantId !== line.variantId))} aria-label={'Remove ' + line.title} style={{ border: 0, background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px', background: '#f8fafc' }}>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Estimated catalogue subtotal</span>
                  <strong style={{ color: '#0f172a', fontSize: '16px' }}>{formatCurrency(manualOrderSubtotal)}</strong>
                </div>
              </div>

              <div style={{ padding: '11px 13px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '9px', color: '#1e40af', fontSize: '11px', lineHeight: 1.5, marginBottom: '16px' }}>
                This creates an open order with payment pending. It does not collect payment or reserve inventory. Product prices are recalculated from the active catalogue when saved.
              </div>

              {createOrderError && (
                <div role="alert" style={{ padding: '10px 12px', marginBottom: '16px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', fontSize: '12px' }}>{createOrderError}</div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap', paddingTop: '4px' }}>
                <button type="button" disabled={isCreatingOrder} onClick={() => setShowCreateModal(false)} style={{ minHeight: '42px', padding: '0 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={isCreatingOrder || catalogLoading || manualOrderLines.length === 0} style={{ minHeight: '42px', padding: '0 20px', borderRadius: '8px', border: 'none', background: '#0d9488', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: isCreatingOrder ? 'wait' : 'pointer', opacity: isCreatingOrder || catalogLoading || manualOrderLines.length === 0 ? 0.65 : 1 }}>
                  {isCreatingOrder ? 'Saving order…' : 'Create order'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

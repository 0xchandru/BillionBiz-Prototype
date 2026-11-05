import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Plus,
  ArrowRight,
  Store,
  Package,
  Activity,
  AlertCircle,
  Clock,
  CheckCircle2,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { api, type DashboardMetricsResponse } from '../api/services';
import { useAuthStore } from '../store/authStore';
import { useRealtime } from '../hooks/useRealtime';
import { DashboardSkeleton } from '../components/common/SkeletonLoader';
import styles from './Dashboard.module.css';

const formatCurrency = (minor: number) => {
  return '₹' + (minor / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatRelativeTime = (isoString?: string) => {
  if (!isoString) return '';
  try {
    const diffMs = Date.now() - new Date(isoString).getTime();
    const diffSec = Math.floor(diffMs / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDays = Math.floor(diffHour / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(isoString).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
  } catch {
    return isoString;
  }
};

const getStatusBadge = (status: string) => {
  const s = (status || '').toUpperCase();
  if (['COMPLETED', 'CAPTURED', 'FULFILLED', 'DELIVERED', 'ACTIVE'].includes(s)) {
    return <span className={`${styles.statusBadge} ${styles.badgeSuccess}`}>{status}</span>;
  }
  if (['PROCESSING', 'IN_TRANSIT', 'OPEN', 'CONFIRMED'].includes(s)) {
    return <span className={`${styles.statusBadge} ${styles.badgeProcessing}`}>{status}</span>;
  }
  if (['PENDING', 'UNPAID', 'DRAFT'].includes(s)) {
    return <span className={`${styles.statusBadge} ${styles.badgePending}`}>{status}</span>;
  }
  return <span className={`${styles.statusBadge} ${styles.badgeCancelled}`}>{status}</span>;
};

export const Dashboard = () => {
  const { storeName } = useAuthStore();
  const [data, setData] = useState<DashboardMetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [topItemsTab, setTopItemsTab] = useState<'products' | 'services'>('products');

  const loadMetrics = async (period: '7d' | '30d' | '90d' | '1y' = selectedPeriod) => {
    try {
      setLoading(true);
      setError(null);
      const metrics = await api.getDashboardMetrics(period);
      setData(metrics);
    } catch (err: any) {
      console.error('[Dashboard] Error fetching live metrics:', err);
      setError(err.message || 'Unable to fetch dashboard metrics. Please check server connectivity.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics(selectedPeriod);
  }, [selectedPeriod]);

  useRealtime((event) => {
    if (['order.created', 'order.fulfilled', 'booking.created', 'payment.captured', 'inventory.updated'].includes(event.type)) {
      loadMetrics(selectedPeriod);
    }
  });

  const m = data?.metrics;
  const totalOrders = m?.totalOrders || 0;
  const totalRevenue = m?.totalRevenueMinor || 0;
  const avgOrderValue = m?.avgOrderValueMinor || 0;
  const totalBookings = m?.totalBookings || 0;
  const totalAppointmentValue = m?.totalAppointmentValueMinor || 0;
  const totalCustomers = m?.totalCustomers || 0;
  const totalProducts = m?.totalProducts || 0;
  const pendingOrders = m?.pendingOrders || 0;
  const completedOrders = m?.completedOrders || 0;
  const revenueGrowth = m?.revenueGrowth ?? 0;

  // Chart data formatting
  const salesTrends = (data?.salesTrends && data.salesTrends.length > 0)
    ? data.salesTrends.map(t => ({
        date: new Date(t.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        revenue: Math.round(t.revenue_minor / 100),
        orders: Number(t.orders_count)
      }))
    : [{ date: 'Today', revenue: Math.round(totalRevenue / 100), orders: totalOrders }];

  // Donut chart colors
  const statusColors: Record<string, string> = {
    COMPLETED: '#16a34a',
    OPEN: '#0284c7',
    PENDING: '#d97706',
    CANCELLED: '#ef4444'
  };

  const pieData = (data?.orderStatusDistribution || []).map(item => ({
    name: item.status,
    value: parseInt(String(item.count), 10),
    color: statusColors[item.status.toUpperCase()] || '#64748b'
  }));

  if (loading && !data) {
    return (
      <div style={{ padding: '28px 32px', maxWidth: '1440px', margin: '0 auto' }}>
        <DashboardSkeleton />
      </div>
    );
  }

  const fulfillmentRate = totalOrders > 0
    ? Math.round((completedOrders / totalOrders) * 100)
    : 100;

  return (
    <div className={styles.dashboard}>
      {/* 1. Executive Header */}
      <div className={styles.headerRow}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '13px', marginBottom: '4px' }}>
            <span>Workspace</span>
            <span>/</span>
            <span style={{ color: '#083e47', fontWeight: 600 }}>Executive Overview</span>
          </div>
          <h1 className={styles.headerTitle}>
            <span>{storeName || 'Merchant Business Console'}</span>
            <span className={styles.liveBadge}>
              <span className={styles.pulseDot} />
              <span>Live Sync</span>
            </span>
          </h1>
          <p className={styles.headerSubtitle}>
            Unified operational overview across storefront commerce, POS counters, and service appointments.
          </p>
        </div>

        <div className={styles.headerActions}>
          {/* Timeframe Control */}
          <div className={styles.segmentedControl}>
            {(['7d', '30d', '90d', '1y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className={`${styles.segmentBtn} ${selectedPeriod === p ? styles.segmentBtnActive : ''}`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={() => loadMetrics(selectedPeriod)}
            disabled={loading}
            className={styles.actionBtnSecondary}
            title="Refresh Real-Time Telemetry"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Sync</span>
          </button>

          <Link to="/products" className={styles.actionBtnSecondary}>
            <Plus size={14} />
            <span>Product</span>
          </Link>

          <Link to="/pos-counters" className={styles.actionBtnPrimary}>
            <Store size={14} />
            <span>POS Register</span>
          </Link>
        </div>
      </div>

      {/* 2. Error Notice */}
      {error && (
        <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#991b1b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertCircle size={18} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{error}</span>
          </div>
          <button
            onClick={() => loadMetrics(selectedPeriod)}
            style={{ backgroundColor: '#991b1b', color: '#fff', border: 'none', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* 3. Actionable Operations Center */}
      <div className={styles.operationsBanner}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#f0fdfa', color: '#083e47', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={16} />
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Operational Action Center</div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              {pendingOrders > 0
                ? `${pendingOrders} order(s) awaiting processing & fulfillment.`
                : 'All channels running smoothly. No unfulfilled backlog.'}
            </div>
          </div>
        </div>

        <div className={styles.operationsQueue}>
          <Link to="/orders" className={styles.queueItem}>
            <span>Pending Orders</span>
            <span className={`${styles.queueBadge} ${pendingOrders > 0 ? styles.queueBadgeAmber : styles.queueBadgeTeal}`}>
              {pendingOrders}
            </span>
          </Link>

          <span style={{ color: '#cbd5e1' }}>•</span>

          <Link to="/appointments" className={styles.queueItem}>
            <span>Service Bookings</span>
            <span className={`${styles.queueBadge} ${styles.queueBadgeBlue}`}>
              {totalBookings}
            </span>
          </Link>

          <span style={{ color: '#cbd5e1' }}>•</span>

          <Link to="/products" className={styles.queueItem}>
            <span>Catalog Items</span>
            <span className={`${styles.queueBadge} ${styles.queueBadgeTeal}`}>
              {totalProducts}
            </span>
          </Link>

          <span style={{ color: '#cbd5e1' }}>•</span>

          <Link to="/people" className={styles.queueItem}>
            <span>Active Customers</span>
            <span className={`${styles.queueBadge} ${styles.queueBadgeTeal}`}>
              {totalCustomers}
            </span>
          </Link>
        </div>
      </div>

      {/* 4. Core Performance KPIs (4 Clean Cards) */}
      <div className={styles.kpiGrid}>
        {/* KPI 1: Gross Revenue */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Gross Revenue</span>
            <div className={styles.kpiIconWrapper}>
              <DollarSign size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCurrency(totalRevenue)}</div>
          <div className={styles.kpiMeta}>
            <span
              className={`${styles.trendBadge} ${
                revenueGrowth > 0
                  ? styles.trendBadgeUp
                  : revenueGrowth < 0
                  ? styles.trendBadgeDown
                  : styles.trendBadgeNeutral
              }`}
            >
              {revenueGrowth > 0 ? (
                <TrendingUp size={12} />
              ) : revenueGrowth < 0 ? (
                <TrendingDown size={12} />
              ) : null}
              <span>{revenueGrowth !== 0 ? `${revenueGrowth > 0 ? '+' : ''}${revenueGrowth}%` : 'Baseline'}</span>
            </span>
            <span>vs previous {selectedPeriod}</span>
          </div>
        </div>

        {/* KPI 2: Total Orders */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Total Orders Placed</span>
            <div className={styles.kpiIconWrapper}>
              <ShoppingBag size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{totalOrders.toLocaleString()}</div>
          <div className={styles.kpiMeta}>
            <span style={{ fontWeight: 600, color: '#16a34a' }}>{completedOrders} Fulfilled</span>
            <span>•</span>
            <span style={{ color: '#d97706' }}>{pendingOrders} Open</span>
            <span>•</span>
            <span>{fulfillmentRate}% rate</span>
          </div>
        </div>

        {/* KPI 3: Average Order Value & Customers */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Average Basket Size</span>
            <div className={styles.kpiIconWrapper}>
              <Users size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{formatCurrency(avgOrderValue)}</div>
          <div className={styles.kpiMeta}>
            <span style={{ fontWeight: 600, color: '#0f172a' }}>{totalCustomers}</span>
            <span>registered customer accounts</span>
          </div>
        </div>

        {/* KPI 4: Service Appointments */}
        <div className={styles.kpiCard}>
          <div className={styles.kpiHeader}>
            <span className={styles.kpiTitle}>Service Bookings</span>
            <div className={styles.kpiIconWrapper}>
              <Calendar size={16} />
            </div>
          </div>
          <div className={styles.kpiValue}>{totalBookings.toLocaleString()}</div>
          <div className={styles.kpiMeta}>
            <span style={{ fontWeight: 600, color: '#0d9488' }}>
              {formatCurrency(totalAppointmentValue)}
            </span>
            <span>pipeline booking value</span>
          </div>
        </div>
      </div>

      {/* 5. Revenue Trend & Order Status Distribution Grid */}
      <div className={styles.analyticsGrid}>
        {/* Revenue Trend Area Chart */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <TrendingUp size={16} style={{ color: '#083e47' }} />
                <span>Gross Revenue Performance</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Settled sales volume over {selectedPeriod.toUpperCase()} timeframe
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(totalRevenue)}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>INR Gross Total</div>
            </div>
          </div>

          <div className={styles.chartContainer}>
            {totalRevenue === 0 && salesTrends.length <= 1 ? (
              <div style={{ height: '230px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <DollarSign size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>No Sales Data for Selected Period</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>
                  Orders placed online or at the counter POS will plot live here.
                </span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={salesTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#083e47" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="#083e47" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis
                    tickFormatter={(val) => `₹${val}`}
                    stroke="#94a3b8"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      fontSize: '12px'
                    }}
                    formatter={(val: any) => [`₹${val}`, 'Gross Sales']}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#083e47"
                    strokeWidth={2.2}
                    fillOpacity={1}
                    fill="url(#revenueFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Fulfillment Status Donut */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <Package size={16} style={{ color: '#083e47' }} />
                <span>Fulfillment Status</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Current pipeline status distribution
              </div>
            </div>
            <Link to="/orders" className={styles.viewAllLink}>
              <span>Manage</span>
              <ArrowRight size={12} />
            </Link>
          </div>

          <div className={styles.donutWrapper}>
            {pieData.length === 0 ? (
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
                <CheckCircle2 size={32} color="#cbd5e1" style={{ marginBottom: '8px' }} />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>No Orders Logged</span>
                <span style={{ fontSize: '12px', color: '#94a3b8', marginTop: '3px' }}>Awaiting initial checkout orders</span>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={68}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className={styles.donutCenterLabel}>
                  <div className={styles.donutCenterCount}>{totalOrders}</div>
                  <div className={styles.donutCenterSub}>Orders</div>
                </div>

                <div className={styles.donutLegend}>
                  {pieData.map((p, idx) => {
                    const pct = totalOrders > 0 ? Math.round((p.value / totalOrders) * 100) : 0;
                    return (
                      <div key={idx} className={styles.legendRow}>
                        <div className={styles.legendLabel}>
                          <span className={styles.legendDot} style={{ backgroundColor: p.color }} />
                          <span>{p.name}</span>
                        </div>
                        <div className={styles.legendValue}>
                          <span>{p.value}</span>
                          <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '11px', marginLeft: '6px' }}>
                            ({pct}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 6. Operational Orders Queue & Best Performers Grid */}
      <div className={styles.operationalGrid}>
        {/* Recent Orders Queue */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <ShoppingBag size={16} style={{ color: '#083e47' }} />
                <span>Recent Customer Orders</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Latest checkouts across storefront and POS
              </div>
            </div>
            <Link to="/orders" className={styles.viewAllLink}>
              <span>All Orders</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.tableContainer}>
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <table className={styles.dataTable}>
                <thead>
                  <tr>
                    <th>Order Ref</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th style={{ textAlign: 'right' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((order) => (
                    <tr key={order.id}>
                      <td data-label="Order ref">
                        <Link to="/orders" className={styles.orderLink}>
                          {order.order_number}
                        </Link>
                      </td>
                      <td data-label="Customer">
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{order.customer_name}</div>
                        {order.customer_email && (
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>{order.customer_email}</div>
                        )}
                      </td>
                      <td data-label="Date" style={{ color: '#64748b', fontSize: '12px' }}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td data-label="Status">{getStatusBadge(order.status)}</td>
                      <td data-label="Amount" style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                        {formatCurrency(order.total_minor)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                <ShoppingBag size={30} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>No Orders Recorded</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', marginBottom: '14px' }}>
                  Orders placed online or at the POS register will appear here.
                </div>
                <Link to="/products" className={styles.actionBtnPrimary} style={{ display: 'inline-flex' }}>
                  <Plus size={14} />
                  <span>Add First Product</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Top Performers (Toggleable Products vs Services) */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <Layers size={16} style={{ color: '#083e47' }} />
                <span>Top Performing Items</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Ranked by settled customer revenue
              </div>
            </div>

            {/* Toggle Tab */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '6px', padding: '2px' }}>
              <button
                onClick={() => setTopItemsTab('products')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: topItemsTab === 'products' ? '#ffffff' : 'transparent',
                  color: topItemsTab === 'products' ? '#083e47' : '#64748b',
                  boxShadow: topItemsTab === 'products' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Products
              </button>
              <button
                onClick={() => setTopItemsTab('services')}
                style={{
                  padding: '4px 10px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: topItemsTab === 'services' ? '#ffffff' : 'transparent',
                  color: topItemsTab === 'services' ? '#083e47' : '#64748b',
                  boxShadow: topItemsTab === 'services' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                Services
              </button>
            </div>
          </div>

          <div className={styles.tableContainer}>
            {topItemsTab === 'products' ? (
              data?.topProducts && data.topProducts.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Orders</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topProducts.map((prod, idx) => (
                      <tr key={idx}>
                        <td data-label="Product">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{prod.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Rank #{idx + 1}</div>
                        </td>
                        <td data-label="Orders">{prod.orders_count}</td>
                        <td data-label="Revenue" style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(prod.revenue_minor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                  <Package size={28} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>No Product Sales Recorded</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Top selling products will rank here as checkouts occur.
                  </div>
                </div>
              )
            ) : (
              data?.bestServices && data.bestServices.length > 0 ? (
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Service</th>
                      <th>Bookings</th>
                      <th style={{ textAlign: 'right' }}>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.bestServices.map((srv, idx) => (
                      <tr key={idx}>
                        <td data-label="Service">
                          <div style={{ fontWeight: 600, color: '#0f172a' }}>{srv.name}</div>
                          <div style={{ fontSize: '11px', color: '#94a3b8' }}>Rank #{idx + 1}</div>
                        </td>
                        <td data-label="Bookings">{srv.bookings_count}</td>
                        <td data-label="Revenue" style={{ textAlign: 'right', fontWeight: 700, color: '#0f172a' }}>
                          {formatCurrency(srv.revenue_minor)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                  <Calendar size={28} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 600, fontSize: '13px' }}>No Service Revenue Logged</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                    Most popular appointments will automatically rank here.
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* 7. Secondary Operations Panels: Recent Bookings & Audit Stream */}
      <div className={styles.secondaryGrid}>
        {/* Recent Bookings Panel */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <Calendar size={16} style={{ color: '#083e47' }} />
                <span>Upcoming & Recent Bookings</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Service appointments and client consults
              </div>
            </div>
            <Link to="/appointments" className={styles.viewAllLink}>
              <span>Calendar</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div style={{ padding: '16px' }}>
            {data?.recentBookings && data.recentBookings.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.recentBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '13px', color: '#0f172a' }}>
                        {b.customer_name} • <span style={{ color: '#083e47' }}>{b.service_name}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        Specialist: {b.staff_name} • {new Date(b.start_time).toLocaleDateString()} at {new Date(b.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {getStatusBadge(b.status)}
                      <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                        {formatCurrency(b.total_minor)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <Calendar size={28} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '13px' }}>No Bookings Scheduled</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px', marginBottom: '12px' }}>
                  Client reservations from online booking or staff counter will list here.
                </div>
                <Link to="/appointments/new" className={styles.actionBtnSecondary} style={{ display: 'inline-flex' }}>
                  <Plus size={13} />
                  <span>New Appointment</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Audit Log Activity Stream */}
        <div className={styles.panelCard}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>
                <Activity size={16} style={{ color: '#083e47' }} />
                <span>Operational Audit Stream</span>
              </h2>
              <div className={styles.panelSubtitle}>
                Live store event & access log
              </div>
            </div>
          </div>

          <div style={{ padding: '16px' }}>
            {data?.recentActivities && data.recentActivities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {data.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #f1f5f9',
                      fontSize: '12.5px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#083e47' }} />
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{act.action}</span>
                        <span style={{ color: '#64748b', marginLeft: '6px' }}>{act.target_type}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {formatRelativeTime(act.created_at)}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '32px 16px', textAlign: 'center', color: '#64748b' }}>
                <Activity size={28} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 600, fontSize: '13px' }}>Audit Stream Active</div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                  Administrative actions and fulfillment events will stream here automatically.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

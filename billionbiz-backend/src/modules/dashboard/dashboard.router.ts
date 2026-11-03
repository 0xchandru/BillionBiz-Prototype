import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { requireAuth } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';

export const dashboardRouter = Router();

// GET /api/v1/dashboard/metrics (Complete Overview, Charts & Multi-Tenant Analytics)
dashboardRouter.get('/metrics', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;
  const { period = '30d' } = req.query;

  // Compute date range
  let days = 30;
  if (period === '7d') days = 7;
  else if (period === '90d') days = 90;
  else if (period === '1y') days = 365;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // 1. Total Orders & Revenue Overview
  const ordersSummaryRes = await query(
    `SELECT
       COUNT(id) as total_orders,
       COALESCE(SUM(total_minor), 0) as total_revenue_minor,
       COALESCE(AVG(total_minor), 0) as avg_order_value_minor,
       COUNT(id) FILTER (WHERE status = 'OPEN' OR status = 'PENDING') as pending_orders,
       COUNT(id) FILTER (WHERE status = 'COMPLETED') as completed_orders,
       COUNT(id) FILTER (WHERE status = 'CANCELLED') as cancelled_orders
     FROM orders
     WHERE store_id = $1`,
    [storeId]
  );
  const ordersSummary = ordersSummaryRes.rows[0];

  // Previous period for growth calculation
  const prevStartDate = new Date(startDate);
  prevStartDate.setDate(prevStartDate.getDate() - days);

  const prevOrdersSummaryRes = await query(
    `SELECT COALESCE(SUM(total_minor), 0) as prev_revenue_minor
     FROM orders
     WHERE store_id = $1 AND status != 'CANCELLED' AND created_at >= $2 AND created_at < $3`,
    [storeId, prevStartDate.toISOString(), startDate.toISOString()]
  );
  const prevRev = parseInt(prevOrdersSummaryRes.rows[0]?.prev_revenue_minor || '0', 10);
  const currRev = parseInt(ordersSummary.total_revenue_minor || '0', 10);
  const revenueGrowth = prevRev > 0 ? Math.round(((currRev - prevRev) / prevRev) * 100) : currRev > 0 ? 100 : 0;

  // 2. Total Customers
  const custRes = await query(
    `SELECT COUNT(id) as total_customers FROM customers WHERE store_id = $1`,
    [storeId]
  );
  const totalCustomers = custRes.rows[0]?.total_customers || 0;

  // 3. Total Products & Catalog
  const prodRes = await query(
    `SELECT COUNT(id) as total_products FROM products WHERE store_id = $1 AND status != 'ARCHIVED'`,
    [storeId]
  );
  const totalProducts = prodRes.rows[0]?.total_products || 0;

  // 4. Appointments Summary
  const apptSummaryRes = await query(
    `SELECT
       COUNT(id) as total_bookings,
       COALESCE(SUM(total_minor), 0) as total_appointment_value_minor,
       COUNT(id) FILTER (WHERE status = 'CONFIRMED' OR status = 'CHECKED_IN') as active_bookings
     FROM bookings
     WHERE store_id = $1 AND status != 'CANCELLED'`,
    [storeId]
  );
  const apptSummary = apptSummaryRes.rows[0];

  // 5. Order Status Distribution
  const statusRes = await query(
    `SELECT status, COUNT(id) as count
     FROM orders
     WHERE store_id = $1
     GROUP BY status`,
    [storeId]
  );

  // 6. Sales Trends (Daily aggregation for charts)
  const salesTrendsRes = await query(
    `SELECT 
       TO_CHAR(DATE_TRUNC('day', created_at), 'YYYY-MM-DD') as date,
       COUNT(id) as orders_count,
       COALESCE(SUM(total_minor), 0) as revenue_minor
     FROM orders
     WHERE store_id = $1 AND status != 'CANCELLED' AND created_at >= $2
     GROUP BY DATE_TRUNC('day', created_at)
     ORDER BY date ASC`,
    [storeId, startDate.toISOString()]
  );

  // 7. Recent Orders (Top 5)
  const recentOrdersRes = await query(
    `SELECT o.id, o.order_number, o.created_at, o.status, o.payment_status, o.fulfillment_status, o.total_minor,
            COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), 'Guest Customer') as customer_name,
            c.email as customer_email
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.store_id = $1
     ORDER BY o.created_at DESC
     LIMIT 6`,
    [storeId]
  );

  // 8. Recent Bookings (Top 5)
  const recentBookingsRes = await query(
    `SELECT b.id, b.booking_number, b.start_time, b.end_time, b.status, b.total_minor,
            o.name as service_name,
            r.name as staff_name,
            COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), 'Walk-in Client') as customer_name
     FROM bookings b
     JOIN offerings o ON o.id = b.offering_id
     JOIN resources r ON r.id = b.resource_id
     LEFT JOIN customers c ON c.id = b.customer_id
     WHERE b.store_id = $1
     ORDER BY b.start_time DESC
     LIMIT 5`,
    [storeId]
  );

  // 9. Recent Customers
  const recentCustomersRes = await query(
    `SELECT id, first_name, last_name, email, phone, total_orders, total_spent_minor, created_at
     FROM customers
     WHERE store_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [storeId]
  );

  // 10. Top-Selling Products
  const topProductsRes = await query(
    `SELECT p.id, p.name,
            COUNT(ol.id) as orders_count,
            COALESCE(SUM(ol.total_minor), 0) as revenue_minor
     FROM order_lines ol
     JOIN products p ON p.id = ol.product_id
     JOIN orders o ON o.id = ol.order_id
     WHERE o.store_id = $1 AND o.status != 'CANCELLED'
     GROUP BY p.id, p.name
     ORDER BY revenue_minor DESC
     LIMIT 5`,
    [storeId]
  );

  // 11. Best-Performing Services
  const bestServicesRes = await query(
    `SELECT o.id, o.name,
            COUNT(b.id) as bookings_count,
            COALESCE(SUM(b.total_minor), 0) as revenue_minor
     FROM bookings b
     JOIN offerings o ON o.id = b.offering_id
     WHERE b.store_id = $1 AND b.status != 'CANCELLED'
     GROUP BY o.id, o.name
     ORDER BY revenue_minor DESC
     LIMIT 5`,
    [storeId]
  );

  // 12. Recent Activities (from audit_logs)
  const activitiesRes = await query(
    `SELECT id, action, target_type, target_id, changes, created_at, actor_id
     FROM audit_logs
     WHERE store_id = $1
     ORDER BY created_at DESC
     LIMIT 6`,
    [storeId]
  );

  // 13. Important Notifications
  const notificationsRes = await query(
    `SELECT id, title, message, type, is_read, created_at
     FROM notifications
     WHERE store_id = $1
     ORDER BY created_at DESC
     LIMIT 5`,
    [storeId]
  );

  res.json({
    metrics: {
      totalOrders: parseInt(ordersSummary.total_orders, 10),
      totalRevenueMinor: parseInt(ordersSummary.total_revenue_minor, 10),
      avgOrderValueMinor: Math.round(parseFloat(ordersSummary.avg_order_value_minor)),
      totalCustomers: parseInt(totalCustomers, 10),
      totalProducts: parseInt(totalProducts, 10),
      totalBookings: parseInt(apptSummary.total_bookings, 10),
      totalAppointmentValueMinor: parseInt(apptSummary.total_appointment_value_minor, 10),
      pendingOrders: parseInt(ordersSummary.pending_orders || '0', 10),
      completedOrders: parseInt(ordersSummary.completed_orders || '0', 10),
      cancelledOrders: parseInt(ordersSummary.cancelled_orders || '0', 10),
      revenueGrowth
    },
    salesTrends: salesTrendsRes.rows,
    orderStatusDistribution: statusRes.rows,
    recentOrders: recentOrdersRes.rows,
    recentBookings: recentBookingsRes.rows,
    recentCustomers: recentCustomersRes.rows,
    topProducts: topProductsRes.rows,
    bestServices: bestServicesRes.rows,
    recentActivities: activitiesRes.rows,
    importantNotifications: notificationsRes.rows
  });
});

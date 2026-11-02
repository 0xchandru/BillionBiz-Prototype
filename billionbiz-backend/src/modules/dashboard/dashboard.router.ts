import { Router, Request, Response } from 'express';
import { query } from '../../db/pool.js';
import { requireAuth } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant.js';

export const dashboardRouter = Router();

// GET /api/v1/dashboard/metrics (T-036, REQ-DASH-001)
dashboardRouter.get('/metrics', requireAuth, resolveTenant, async (req: Request, res: Response) => {
  const storeId = req.tenant!.storeId;

  // 1. Total Orders & Revenue
  const ordersSummaryRes = await query(
    `SELECT
       COUNT(id) as total_orders,
       COALESCE(SUM(total_minor), 0) as total_revenue_minor,
       COALESCE(AVG(total_minor), 0) as avg_order_value_minor
     FROM orders
     WHERE store_id = $1 AND status != 'CANCELLED'`,
    [storeId]
  );
  const ordersSummary = ordersSummaryRes.rows[0];

  // 2. Total Customers
  const custRes = await query(`SELECT COUNT(id) as total_customers FROM customers WHERE store_id = $1`, [storeId]);
  const totalCustomers = custRes.rows[0]?.total_customers || 0;

  // 3. Appointments summary
  const apptSummaryRes = await query(
    `SELECT
       COUNT(id) as total_bookings,
       COALESCE(SUM(total_minor), 0) as total_appointment_value_minor
     FROM bookings
     WHERE store_id = $1 AND status != 'CANCELLED'`,
    [storeId]
  );
  const apptSummary = apptSummaryRes.rows[0];

  // 4. Order status distribution
  const statusRes = await query(
    `SELECT status, COUNT(id) as count
     FROM orders
     WHERE store_id = $1
     GROUP BY status`,
    [storeId]
  );

  // 5. Recent orders
  const recentOrdersRes = await query(
    `SELECT o.id, o.order_number, o.created_at, o.status, o.total_minor,
            COALESCE(c.first_name || ' ' || COALESCE(c.last_name, ''), 'Guest') as customer_name
     FROM orders o
     LEFT JOIN customers c ON c.id = o.customer_id
     WHERE o.store_id = $1
     ORDER BY o.created_at DESC
     LIMIT 5`,
    [storeId]
  );

  // 6. Top products
  const topProductsRes = await query(
    `SELECT p.name,
            COUNT(ol.id) as orders_count,
            COALESCE(SUM(ol.total_minor), 0) as revenue_minor
     FROM order_lines ol
     JOIN products p ON p.id = ol.product_id
     JOIN orders o ON o.id = ol.order_id
     WHERE o.store_id = $1 AND o.status != 'CANCELLED'
     GROUP BY p.name
     ORDER BY revenue_minor DESC
     LIMIT 5`,
    [storeId]
  );

  res.json({
    metrics: {
      totalOrders: parseInt(ordersSummary.total_orders, 10),
      totalRevenueMinor: parseInt(ordersSummary.total_revenue_minor, 10),
      avgOrderValueMinor: Math.round(parseFloat(ordersSummary.avg_order_value_minor)),
      totalCustomers: parseInt(totalCustomers, 10),
      totalBookings: parseInt(apptSummary.total_bookings, 10),
      totalAppointmentValueMinor: parseInt(apptSummary.total_appointment_value_minor, 10)
    },
    orderStatusDistribution: statusRes.rows,
    recentOrders: recentOrdersRes.rows,
    topProducts: topProductsRes.rows
  });
});


import { query } from './pool.js';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  console.log('[Seed] Seeding default platform data...');

  // 1. Permissions
  const permissionsList = [
    // Identity & Tenancy
    { code: 'org.view', domain: 'tenancy', description: 'View organization details' },
    { code: 'org.manage', domain: 'tenancy', description: 'Manage organization settings' },
    { code: 'store.view', domain: 'tenancy', description: 'View store details' },
    { code: 'store.manage', domain: 'tenancy', description: 'Manage store settings' },
    { code: 'store.capabilities.manage', domain: 'tenancy', description: 'Configure store capabilities and mode' },

    // Team & Roles
    { code: 'team.view', domain: 'team', description: 'View staff members' },
    { code: 'team.manage', domain: 'team', description: 'Invite and manage staff' },
    { code: 'roles.manage', domain: 'team', description: 'Create and assign roles' },

    // Storefront & Editor
    { code: 'store.editor.view', domain: 'storefront', description: 'Access visual store editor' },
    { code: 'store.editor.edit', domain: 'storefront', description: 'Edit store pages and theme' },
    { code: 'store.publish', domain: 'storefront', description: 'Publish store releases' },

    // Catalog & Inventory
    { code: 'catalog.view', domain: 'catalog', description: 'View catalog and products' },
    { code: 'catalog.manage', domain: 'catalog', description: 'Create and edit products and variants' },
    { code: 'inventory.view', domain: 'inventory', description: 'View stock levels' },
    { code: 'inventory.adjust', domain: 'inventory', description: 'Perform inventory adjustments' },

    // Orders & Fulfillment
    { code: 'orders.view', domain: 'orders', description: 'View customer orders' },
    { code: 'orders.manage', domain: 'orders', description: 'Create and update orders' },
    { code: 'fulfillment.manage', domain: 'orders', description: 'Create shipments and generate labels' },
    { code: 'returns.manage', domain: 'orders', description: 'Process returns and restocks' },

    // Appointments & Scheduling
    { code: 'appointments.view', domain: 'appointments', description: 'View appointments calendar' },
    { code: 'appointments.manage', domain: 'appointments', description: 'Book, reschedule, or cancel appointments' },
    { code: 'services.manage', domain: 'appointments', description: 'Create and manage service offerings' },
    { code: 'schedule.manage', domain: 'appointments', description: 'Manage staff shifts and availability' },

    // POS
    { code: 'pos.access', domain: 'pos', description: 'Access POS counter register' },
    { code: 'pos.checkout', domain: 'pos', description: 'Perform checkout and tender payments' },
    { code: 'pos.register.manage', domain: 'pos', description: 'Open/close register and cash handovers' },

    // Finance & Extensions
    { code: 'finance.view', domain: 'finance', description: 'View financial ledger and invoices' },
    { code: 'refunds.issue', domain: 'finance', description: 'Authorize and issue payment refunds' },
    { code: 'extensions.manage', domain: 'extensions', description: 'Configure payment & shipping gateways' },
    { code: 'analytics.view', domain: 'analytics', description: 'View operational analytics and dashboards' },
    { code: 'audit.view', domain: 'audit', description: 'View system audit trails' }
  ];

  for (const p of permissionsList) {
    await query(
      `INSERT INTO permissions (id, code, description, domain)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (code) DO UPDATE SET description = EXCLUDED.description, domain = EXCLUDED.domain`,
      [`perm-${p.code}`, p.code, p.description, p.domain]
    );
  }

  // 2. Roles (System)
  const rolesList = [
    { id: 'role-owner', name: 'Store Owner', code: 'OWNER', description: 'Full access to all platform domains and settings' },
    { id: 'role-admin', name: 'Administrator', code: 'ADMIN', description: 'Store administrative operations' },
    { id: 'role-manager', name: 'Store Manager', code: 'MANAGER', description: 'Operational management across catalog, orders, and POS' },
    { id: 'role-cashier', name: 'Cashier', code: 'CASHIER', description: 'POS counter operations, billing, and register closing' },
    { id: 'role-provider', name: 'Service Provider', code: 'SERVICE_PROVIDER', description: 'Personal appointment scheduling and client intake' },
    { id: 'role-fulfillment', name: 'Fulfillment Staff', code: 'FULFILLMENT_STAFF', description: 'Order packing, label generation, and shipments' }
  ];

  for (const r of rolesList) {
    await query(
      `INSERT INTO roles (id, name, code, description, is_system)
       VALUES ($1, $2, $3, $4, TRUE)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description`,
      [r.id, r.name, r.code, r.description]
    );
  }

  // Assign all permissions to OWNER
  const allPerms = await query(`SELECT id FROM permissions;`);
  for (const p of allPerms.rows) {
    await query(
      `INSERT INTO role_permissions (role_id, permission_id)
       VALUES ('role-owner', $1)
       ON CONFLICT DO NOTHING`,
      [p.id]
    );
  }

  // Assign POS & Order perms to CASHIER
  const cashierPermCodes = ['pos.access', 'pos.checkout', 'pos.register.manage', 'orders.view', 'catalog.view', 'appointments.view'];
  for (const code of cashierPermCodes) {
    await query(
      `INSERT INTO role_permissions (role_id, permission_id)
       SELECT 'role-cashier', id FROM permissions WHERE code = $1
       ON CONFLICT DO NOTHING`,
      [code]
    );
  }

  // 3. Organization & Store
  const orgId = 'org-billionbiz-default';
  await query(
    `INSERT INTO organizations (id, name, slug, status)
     VALUES ($1, 'BillionBiz Retail Group', 'billionbiz-retail', 'ACTIVE')
     ON CONFLICT (slug) DO NOTHING`,
    [orgId]
  );

  const storeId = 'store-shoum-default';
  await query(
    `INSERT INTO stores (id, organization_id, name, slug, currency, timezone, status)
     VALUES ($1, $2, 'Shoum', 'shoum', 'INR', 'Asia/Kolkata', 'ACTIVE')
     ON CONFLICT (id) DO NOTHING`,
    [storeId, orgId]
  );

  // Store Capabilities: Both Product Commerce & Appointments enabled
  await query(
    `INSERT INTO store_capabilities (store_id, product_commerce_enabled, appointments_enabled, restaurant_pos_enabled)
     VALUES ($1, TRUE, TRUE, TRUE)
     ON CONFLICT (store_id) DO UPDATE SET
       product_commerce_enabled = TRUE,
       appointments_enabled = TRUE,
       restaurant_pos_enabled = TRUE`,
    [storeId]
  );

  // Storefront Settings: Mode = BOTH, Home = LANDING
  await query(
    `INSERT INTO storefront_settings (store_id, mode, home_page, navigation_config, icon_visibility, version)
     VALUES ($1, 'BOTH', 'LANDING',
       '[{"id":"nav-home","label":"Home","path":"/"},{"id":"nav-shop","label":"Shop","path":"/shop"},{"id":"nav-book","label":"Book Appointment","path":"/booking"}]'::jsonb,
       '{"showCart": true, "showWishlist": true, "showAccount": true}'::jsonb,
       1
     )
     ON CONFLICT (store_id) DO UPDATE SET mode = 'BOTH', home_page = 'LANDING'`,
    [storeId]
  );

  // Store Location
  const locationId = 'loc-shoum-main';
  await query(
    `INSERT INTO store_locations (id, store_id, name, address_line1, city, state, postal_code, country, is_primary, is_active)
     VALUES ($1, $2, 'Shoum Flagship Store', '100 Commercial Road, Indiranagar', 'Bengaluru', 'Karnataka', '560038', 'IN', TRUE, TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [locationId, storeId]
  );

  // Inventory Location
  const invLocId = 'inv-shoum-warehouse';
  await query(
    `INSERT INTO inventory_locations (id, store_id, name, code, is_default)
     VALUES ($1, $2, 'Main Bengaluru Warehouse', 'BLR-WH-01', TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [invLocId, storeId]
  );

  // 4. Default Admin User
  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const pinHash = await bcrypt.hash('1234', 10);
  const userId = 'user-admin-default';

  await query(
    `INSERT INTO users (id, email, password_hash, full_name, phone, is_platform_admin)
     VALUES ($1, 'admin@billionbiz.com', $2, 'BillionBiz Master Admin', '+919876543210', TRUE)
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [userId, passwordHash]
  );

  await query(
    `INSERT INTO organization_memberships (id, organization_id, user_id, role)
     VALUES ('mem-admin-default', $1, $2, 'OWNER')
     ON CONFLICT (organization_id, user_id) DO NOTHING`,
    [orgId, userId]
  );

  const staffProfileId = 'staff-admin-default';
  await query(
    `INSERT INTO staff_profiles (id, organization_id, user_id, store_id, display_name, pin_hash, is_active)
     VALUES ($1, $2, $3, $4, 'Admin Owner', $5, TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [staffProfileId, orgId, userId, storeId, pinHash]
  );

  await query(
    `INSERT INTO role_assignments (id, staff_profile_id, role_id, store_id, location_id)
     VALUES ('ra-admin-owner', $1, 'role-owner', $2, $3)
     ON CONFLICT (id) DO NOTHING`,
    [staffProfileId, storeId, locationId]
  );

  // 5. Default Counter for POS
  const counterId = 'cnt-shoum-01';
  await query(
    `INSERT INTO counters (id, store_id, location_id, name, code, is_active)
     VALUES ($1, $2, $3, 'Counter 1 - Main Express', 'POS-01', TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [counterId, storeId, locationId]
  );

  // Device registration for POS
  await query(
    `INSERT INTO devices (id, counter_id, device_token_hash, device_name, is_approved)
     VALUES ('dev-pos-terminal-01', $1, 'terminal-01-hash', 'Counter Register Tablet 01', TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [counterId]
  );

  // 6. Default Categories & Sample Products
  const catFashion = 'cat-fashion-01';
  await query(
    `INSERT INTO categories (id, store_id, name, slug, description, is_active)
     VALUES ($1, $2, 'Apparel & Fashion', 'apparel-fashion', 'Premium fashion, accessories, and wear', TRUE)
     ON CONFLICT (store_id, slug) DO NOTHING`,
    [catFashion, storeId]
  );

  const prod1Id = 'prod-desk-lamp-01';
  await query(
    `INSERT INTO products (id, store_id, name, handle, description, category_id, brand, product_type, status, media, options)
     VALUES ($1, $2, 'Modern Nordic Desk Lamp', 'modern-nordic-desk-lamp', 'Minimalist matte aluminum architectural desk lamp with touch dimmer.', $3, 'Lumina Nordic', 'PHYSICAL', 'ACTIVE',
       '[{"url": "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop", "alt": "Modern Desk Lamp"}]'::jsonb,
       '[{"name": "Color", "values": ["Matte Black", "Brushed Brass"]}]'::jsonb
     )
     ON CONFLICT (store_id, handle) DO NOTHING`,
    [prod1Id, storeId, catFashion]
  );

  const variant1Id = 'var-desk-lamp-black';
  await query(
    `INSERT INTO product_variants (id, product_id, sku, barcode, option_values, price_minor, compare_at_minor, cost_minor, weight_grams, is_active)
     VALUES ($1, $2, 'LAMP-NORDIC-BLK', '8901234567890', '{"Color": "Matte Black"}'::jsonb, 192000, 240000, 110000, 1200, TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [variant1Id, prod1Id]
  );

  await query(
    `INSERT INTO inventory_balances (id, variant_id, location_id, on_hand, reserved, available)
     VALUES ('inv-bal-lamp-blk', $1, $2, 45, 3, 42)
     ON CONFLICT (variant_id, location_id) DO UPDATE SET on_hand = 45, available = 42`,
    [variant1Id, invLocId]
  );

  // 7. Default Service Offerings & Resource for Appointments
  const service1Id = 'srv-haircut-styling';
  await query(
    `INSERT INTO offerings (id, store_id, name, handle, description, duration_minutes, buffer_before_minutes, buffer_after_minutes, price_minor, deposit_required_minor, is_active)
     VALUES ($1, $2, 'Master Haircut & Style Consultation', 'master-haircut-style', 'Full hair analysis, customized cut, wash, and blow dry styling with senior stylist.', 45, 5, 10, 150000, 50000, TRUE)
     ON CONFLICT (store_id, handle) DO NOTHING`,
    [service1Id, storeId]
  );

  const res1Id = 'res-stylist-shoum-01';
  await query(
    `INSERT INTO resources (id, store_id, name, type, staff_profile_id, is_active)
     VALUES ($1, $2, 'Master Stylist Room 1', 'SPACE', $3, TRUE)
     ON CONFLICT (id) DO NOTHING`,
    [res1Id, storeId, staffProfileId]
  );

  await query(
    `INSERT INTO offering_resources (offering_id, resource_id, is_primary)
     VALUES ($1, $2, TRUE)
     ON CONFLICT DO NOTHING`,
    [service1Id, res1Id]
  );

  // Shifts: Monday to Saturday 10:00 to 19:00
  for (let day = 1; day <= 6; day++) {
    await query(
      `INSERT INTO staff_shifts (id, staff_profile_id, day_of_week, start_time, end_time, is_active)
       VALUES ($1, $2, $3, '10:00:00', '19:00:00', TRUE)
       ON CONFLICT (id) DO NOTHING`,
      [`shift-admin-day-${day}`, staffProfileId, day]
    );
  }

  // 8. Sample Customer & Initial Order
  const custId = 'cust-david-01';
  await query(
    `INSERT INTO customers (id, store_id, email, phone, first_name, last_name, total_orders, total_spent_minor)
     VALUES ($1, $2, 'david.johnson@example.com', '+919123456789', 'David', 'Johnson', 1, 192000)
     ON CONFLICT (id) DO NOTHING`,
    [custId, storeId]
  );

  const orderId = 'ord-bbz-1001';
  await query(
    `INSERT INTO orders (id, store_id, order_number, customer_id, channel, status, payment_status, fulfillment_status, currency, subtotal_minor, total_minor)
     VALUES ($1, $2, 'BBZ-1001', $3, 'STOREFRONT', 'COMPLETED', 'CAPTURED', 'FULFILLED', 'INR', 192000, 192000)
     ON CONFLICT (store_id, order_number) DO NOTHING`,
    [orderId, storeId, custId]
  );

  await query(
    `INSERT INTO order_lines (id, order_id, product_id, variant_id, sku, title, variant_title, unit_price_minor, quantity, total_minor)
     VALUES ('line-bbz-1001-1', $1, $2, $3, 'LAMP-NORDIC-BLK', 'Modern Nordic Desk Lamp', 'Matte Black', 192000, 1, 192000)
     ON CONFLICT (id) DO NOTHING`,
    [orderId, prod1Id, variant1Id]
  );

  // 10. Default Store Pages & Theme (Store Editor Native Persistence)
  await query(
    `INSERT INTO store_themes (id, store_id, preset_name, palette, typography, buttons, effects, custom_css, version)
     VALUES ('thm-shoum-default', $1, 'modern', '{"primary":"#0066cc","secondary":"#6c757d"}'::jsonb, '{"heading":"Inter","body":"Inter"}'::jsonb, '{}'::jsonb, '{}'::jsonb, '', 1)
     ON CONFLICT (store_id) DO NOTHING`,
    [storeId]
  );

  const initialPages = [
    { id: 'landing-page', name: 'Landing page', path: '/', type: 'landing', category: 'storefront', seoTitle: 'BillionBiz | Build, Launch & Grow Your Business' },
    { id: 'maintenance-page', name: 'Maintenance', path: '/maintenance', type: 'maintenance', category: 'system', seoTitle: 'Under Maintenance - BillionBiz' },
    { id: 'booking-page', name: 'Booking', path: '/booking', type: 'booking', category: 'commerce', seoTitle: 'Book an Appointment - BillionBiz' },
    { id: 'order-confirmation-page', name: 'Order Confirmation', path: '/order-confirmation', type: 'order-confirmation', category: 'commerce', seoTitle: 'Order Confirmed - BillionBiz' },
    { id: 'order-tracking-page', name: 'Order Tracking', path: '/order-tracking', type: 'order-tracking', category: 'commerce', seoTitle: 'Track Your Package - BillionBiz' }
  ];

  for (const p of initialPages) {
    await query(
      `INSERT INTO store_pages (id, store_id, name, path, type, category, status, seo_title, page_props)
       VALUES ($1, $2, $3, $4, $5, $6, 'published', $7, '{}'::jsonb)
       ON CONFLICT (id) DO NOTHING`,
      [p.id, storeId, p.name, p.path, p.type, p.category, p.seoTitle]
    );
  }

  console.log('[Seed] Database seeding completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Seeding finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Failed:', err);
      process.exit(1);
    });
}

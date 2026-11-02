import { query } from './pool.js';

export async function runMigrations() {
  console.log('[Migration] Starting BillionBiz platform database migration...');

  // 1. Extensions
  await query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

  // 2. Identity & Tenancy
  await query(`
    CREATE TABLE IF NOT EXISTS organizations (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) UNIQUE NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS stores (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
      status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_store_org_slug UNIQUE (organization_id, slug)
    );

    CREATE TABLE IF NOT EXISTS store_locations (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      address_line1 TEXT,
      city VARCHAR(128),
      state VARCHAR(128),
      postal_code VARCHAR(32),
      country VARCHAR(8) DEFAULT 'IN',
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS store_capabilities (
      store_id VARCHAR(64) PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
      product_commerce_enabled BOOLEAN NOT NULL DEFAULT TRUE,
      appointments_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      restaurant_pos_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS storefront_settings (
      store_id VARCHAR(64) PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
      mode VARCHAR(32) NOT NULL DEFAULT 'COMMERCE', -- 'COMMERCE' | 'SERVICES' | 'BOTH'
      home_page VARCHAR(32) NOT NULL DEFAULT 'LANDING', -- 'LANDING' | 'BOOKING'
      navigation_config JSONB NOT NULL DEFAULT '[]'::jsonb,
      icon_visibility JSONB NOT NULL DEFAULT '{}'::jsonb,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS store_domains (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      domain VARCHAR(255) UNIQUE NOT NULL,
      is_primary BOOLEAN NOT NULL DEFAULT FALSE,
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      ssl_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      full_name VARCHAR(255) NOT NULL,
      phone VARCHAR(32),
      is_platform_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS organization_memberships (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(64) NOT NULL DEFAULT 'MEMBER',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_org_user UNIQUE (organization_id, user_id)
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) UNIQUE NOT NULL,
      ip_address VARCHAR(64),
      user_agent TEXT,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 3. Team & Permissions
  await query(`
    CREATE TABLE IF NOT EXISTS roles (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      code VARCHAR(64) NOT NULL,
      description TEXT,
      is_system BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS permissions (
      id VARCHAR(64) PRIMARY KEY,
      code VARCHAR(128) UNIQUE NOT NULL,
      description TEXT,
      domain VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS role_permissions (
      role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      permission_id VARCHAR(64) NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
      PRIMARY KEY (role_id, permission_id)
    );

    CREATE TABLE IF NOT EXISTS staff_profiles (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE SET NULL,
      display_name VARCHAR(255) NOT NULL,
      pin_hash VARCHAR(255),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS role_assignments (
      id VARCHAR(64) PRIMARY KEY,
      staff_profile_id VARCHAR(64) NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      role_id VARCHAR(64) NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
      location_id VARCHAR(64) REFERENCES store_locations(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 4. Platform Core: Audit, Outbox, Idempotency
  await query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE SET NULL,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE SET NULL,
      actor_id VARCHAR(64),
      actor_type VARCHAR(32) NOT NULL DEFAULT 'USER',
      action VARCHAR(128) NOT NULL,
      target_type VARCHAR(64) NOT NULL,
      target_id VARCHAR(64) NOT NULL,
      changes JSONB NOT NULL DEFAULT '{}'::jsonb,
      ip_address VARCHAR(64),
      correlation_id VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS idempotency_records (
      idempotency_key VARCHAR(128) PRIMARY KEY,
      organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
      request_path VARCHAR(255) NOT NULL,
      request_hash VARCHAR(64) NOT NULL,
      response_code INTEGER NOT NULL,
      response_body JSONB NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS outbox_events (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) REFERENCES organizations(id) ON DELETE CASCADE,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
      event_type VARCHAR(128) NOT NULL,
      aggregate_type VARCHAR(64) NOT NULL,
      aggregate_id VARCHAR(64) NOT NULL,
      payload JSONB NOT NULL,
      correlation_id VARCHAR(64),
      published BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      published_at TIMESTAMPTZ
    );
  `);

  // 5. Storefront & Releases
  await query(`
    CREATE TABLE IF NOT EXISTS store_themes (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      preset_name VARCHAR(64) NOT NULL DEFAULT 'modern',
      palette JSONB NOT NULL DEFAULT '{}'::jsonb,
      typography JSONB NOT NULL DEFAULT '{}'::jsonb,
      buttons JSONB NOT NULL DEFAULT '{}'::jsonb,
      effects JSONB NOT NULL DEFAULT '{}'::jsonb,
      custom_css TEXT,
      version INTEGER NOT NULL DEFAULT 1,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_theme_store UNIQUE (store_id)
    );

    CREATE TABLE IF NOT EXISTS store_pages (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      path VARCHAR(255) NOT NULL,
      type VARCHAR(64) NOT NULL,
      category VARCHAR(64) NOT NULL DEFAULT 'storefront',
      status VARCHAR(32) NOT NULL DEFAULT 'draft',
      seo_title VARCHAR(255),
      seo_description TEXT,
      page_props JSONB NOT NULL DEFAULT '{}'::jsonb,
      visibility JSONB NOT NULL DEFAULT '{"desktop": true, "tablet": true, "mobile": true}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_page_store_path UNIQUE (store_id, path)
    );

    CREATE TABLE IF NOT EXISTS page_draft_versions (
      id VARCHAR(64) PRIMARY KEY,
      page_id VARCHAR(64) NOT NULL REFERENCES store_pages(id) ON DELETE CASCADE,
      version INTEGER NOT NULL DEFAULT 1,
      sections JSONB NOT NULL DEFAULT '[]'::jsonb,
      page_props JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS store_releases (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      release_number INTEGER NOT NULL,
      content_hash VARCHAR(64) NOT NULL,
      snapshot JSONB NOT NULL,
      published_by VARCHAR(64),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_release_store_num UNIQUE (store_id, release_number)
    );
  `);

  // 6. Catalog & Inventory
  await query(`
    CREATE TABLE IF NOT EXISTS categories (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT,
      parent_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_category_store_slug UNIQUE (store_id, slug)
    );

    CREATE TABLE IF NOT EXISTS category_attribute_schemas (
      id VARCHAR(64) PRIMARY KEY,
      category_id VARCHAR(64) NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      version INTEGER NOT NULL DEFAULT 1,
      schema_definition JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS products (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      handle VARCHAR(255) NOT NULL,
      description TEXT,
      category_id VARCHAR(64) REFERENCES categories(id) ON DELETE SET NULL,
      brand VARCHAR(128),
      product_type VARCHAR(64) NOT NULL DEFAULT 'PHYSICAL',
      status VARCHAR(32) NOT NULL DEFAULT 'DRAFT', -- 'DRAFT' | 'ACTIVE' | 'ARCHIVED'
      media JSONB NOT NULL DEFAULT '[]'::jsonb,
      options JSONB NOT NULL DEFAULT '[]'::jsonb,
      tax_category VARCHAR(64) DEFAULT 'STANDARD',
      seo_title VARCHAR(255),
      seo_description TEXT,
      custom_attributes JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_product_store_handle UNIQUE (store_id, handle)
    );

    CREATE TABLE IF NOT EXISTS product_variants (
      id VARCHAR(64) PRIMARY KEY,
      product_id VARCHAR(64) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      sku VARCHAR(128) NOT NULL,
      barcode VARCHAR(128),
      option_values JSONB NOT NULL DEFAULT '{}'::jsonb,
      price_minor BIGINT NOT NULL DEFAULT 0,
      compare_at_minor BIGINT,
      cost_minor BIGINT,
      weight_grams INTEGER DEFAULT 0,
      dimensions JSONB,
      media_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS inventory_locations (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(64) NOT NULL,
      is_default BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_inv_loc_store_code UNIQUE (store_id, code)
    );

    CREATE TABLE IF NOT EXISTS inventory_balances (
      id VARCHAR(64) PRIMARY KEY,
      variant_id VARCHAR(64) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      location_id VARCHAR(64) NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
      on_hand INTEGER NOT NULL DEFAULT 0,
      reserved INTEGER NOT NULL DEFAULT 0,
      available INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_inv_variant_location UNIQUE (variant_id, location_id)
    );

    CREATE TABLE IF NOT EXISTS inventory_movements (
      id VARCHAR(64) PRIMARY KEY,
      variant_id VARCHAR(64) NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
      location_id VARCHAR(64) NOT NULL REFERENCES inventory_locations(id) ON DELETE CASCADE,
      movement_type VARCHAR(64) NOT NULL, -- 'OPENING' | 'PURCHASE' | 'SALE' | 'ADJUSTMENT' | 'RETURN'
      quantity INTEGER NOT NULL,
      reference_type VARCHAR(64),
      reference_id VARCHAR(64),
      note TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 7. Customers & Orders & Fulfillment
  await query(`
    CREATE TABLE IF NOT EXISTS customers (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      email VARCHAR(255),
      phone VARCHAR(32),
      first_name VARCHAR(128),
      last_name VARCHAR(128),
      default_address JSONB,
      total_orders INTEGER NOT NULL DEFAULT 0,
      total_spent_minor BIGINT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS orders (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      order_number VARCHAR(64) NOT NULL,
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      channel VARCHAR(32) NOT NULL DEFAULT 'STOREFRONT', -- 'STOREFRONT' | 'POS' | 'MANUAL'
      status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- 'OPEN' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
      payment_status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'CAPTURED' | 'REFUNDED' | 'FAILED'
      fulfillment_status VARCHAR(32) NOT NULL DEFAULT 'UNFULFILLED', -- 'UNFULFILLED' | 'PARTIAL' | 'FULFILLED'
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      subtotal_minor BIGINT NOT NULL DEFAULT 0,
      discount_minor BIGINT NOT NULL DEFAULT 0,
      tax_minor BIGINT NOT NULL DEFAULT 0,
      shipping_minor BIGINT NOT NULL DEFAULT 0,
      total_minor BIGINT NOT NULL DEFAULT 0,
      shipping_address JSONB,
      billing_address JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_order_store_number UNIQUE (store_id, order_number)
    );

    CREATE TABLE IF NOT EXISTS order_lines (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id VARCHAR(64) REFERENCES products(id) ON DELETE SET NULL,
      variant_id VARCHAR(64) REFERENCES product_variants(id) ON DELETE SET NULL,
      sku VARCHAR(128) NOT NULL,
      title VARCHAR(255) NOT NULL,
      variant_title VARCHAR(255),
      unit_price_minor BIGINT NOT NULL DEFAULT 0,
      quantity INTEGER NOT NULL DEFAULT 1,
      tax_minor BIGINT NOT NULL DEFAULT 0,
      discount_minor BIGINT NOT NULL DEFAULT 0,
      total_minor BIGINT NOT NULL DEFAULT 0,
      snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS order_status_history (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      from_status VARCHAR(32) NOT NULL,
      to_status VARCHAR(32) NOT NULL,
      reason TEXT,
      actor_id VARCHAR(64),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS fulfillments (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      tracking_number VARCHAR(128),
      carrier VARCHAR(64),
      tracking_url TEXT,
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS returns (
      id VARCHAR(64) PRIMARY KEY,
      order_id VARCHAR(64) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      return_number VARCHAR(64) NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'REQUESTED',
      items JSONB NOT NULL DEFAULT '[]'::jsonb,
      reason TEXT,
      refund_amount_minor BIGINT DEFAULT 0,
      restock_disposition VARCHAR(32) DEFAULT 'RESTOCK',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 8. Appointments & Scheduling
  await query(`
    CREATE TABLE IF NOT EXISTS offerings (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      handle VARCHAR(255) NOT NULL,
      description TEXT,
      duration_minutes INTEGER NOT NULL DEFAULT 30,
      buffer_before_minutes INTEGER NOT NULL DEFAULT 0,
      buffer_after_minutes INTEGER NOT NULL DEFAULT 0,
      price_minor BIGINT NOT NULL DEFAULT 0,
      deposit_required_minor BIGINT NOT NULL DEFAULT 0,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_offering_store_handle UNIQUE (store_id, handle)
    );

    CREATE TABLE IF NOT EXISTS resources (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(32) NOT NULL DEFAULT 'PERSON', -- 'PERSON' | 'SPACE' | 'EQUIPMENT'
      staff_profile_id VARCHAR(64) REFERENCES staff_profiles(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS offering_resources (
      offering_id VARCHAR(64) NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
      resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      is_primary BOOLEAN NOT NULL DEFAULT TRUE,
      PRIMARY KEY (offering_id, resource_id)
    );

    CREATE TABLE IF NOT EXISTS staff_shifts (
      id VARCHAR(64) PRIMARY KEY,
      staff_profile_id VARCHAR(64) NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      day_of_week INTEGER NOT NULL, -- 0 = Sunday, 6 = Saturday
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS time_off (
      id VARCHAR(64) PRIMARY KEY,
      staff_profile_id VARCHAR(64) NOT NULL REFERENCES staff_profiles(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS booking_holds (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      offering_id VARCHAR(64) NOT NULL REFERENCES offerings(id) ON DELETE CASCADE,
      resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE CASCADE,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      hold_token VARCHAR(128) UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      booking_number VARCHAR(64) NOT NULL,
      offering_id VARCHAR(64) NOT NULL REFERENCES offerings(id) ON DELETE RESTRICT,
      resource_id VARCHAR(64) NOT NULL REFERENCES resources(id) ON DELETE RESTRICT,
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      start_time TIMESTAMPTZ NOT NULL,
      end_time TIMESTAMPTZ NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'CONFIRMED', -- 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
      total_minor BIGINT NOT NULL DEFAULT 0,
      deposit_paid_minor BIGINT NOT NULL DEFAULT 0,
      balance_due_minor BIGINT NOT NULL DEFAULT 0,
      intake_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_booking_store_number UNIQUE (store_id, booking_number)
    );
  `);

  // 9. Point of Sale (POS)
  await query(`
    CREATE TABLE IF NOT EXISTS counters (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      location_id VARCHAR(64) NOT NULL REFERENCES store_locations(id) ON DELETE CASCADE,
      name VARCHAR(128) NOT NULL,
      code VARCHAR(64) NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_counter_store_code UNIQUE (store_id, code)
    );

    CREATE TABLE IF NOT EXISTS devices (
      id VARCHAR(64) PRIMARY KEY,
      counter_id VARCHAR(64) NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
      device_token_hash VARCHAR(255) UNIQUE NOT NULL,
      device_name VARCHAR(128) NOT NULL,
      is_approved BOOLEAN NOT NULL DEFAULT TRUE,
      last_seen_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS register_sessions (
      id VARCHAR(64) PRIMARY KEY,
      counter_id VARCHAR(64) NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
      opened_by VARCHAR(64) NOT NULL,
      closed_by VARCHAR(64),
      opening_float_minor BIGINT NOT NULL DEFAULT 0,
      closing_cash_minor BIGINT,
      expected_cash_minor BIGINT,
      variance_minor BIGINT,
      status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- 'OPEN' | 'CLOSED'
      opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      closed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS cash_movements (
      id VARCHAR(64) PRIMARY KEY,
      register_session_id VARCHAR(64) NOT NULL REFERENCES register_sessions(id) ON DELETE CASCADE,
      movement_type VARCHAR(32) NOT NULL, -- 'CASH_IN' | 'CASH_OUT' | 'SALE' | 'REFUND'
      amount_minor BIGINT NOT NULL,
      reason TEXT,
      created_by VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS held_carts (
      id VARCHAR(64) PRIMARY KEY,
      counter_id VARCHAR(64) NOT NULL REFERENCES counters(id) ON DELETE CASCADE,
      hold_reference VARCHAR(128) NOT NULL,
      cart_data JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by VARCHAR(64) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 10. Finance & Payments
  await query(`
    CREATE TABLE IF NOT EXISTS payment_intents (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      purpose VARCHAR(32) NOT NULL DEFAULT 'ORDER', -- 'ORDER' | 'BOOKING_DEPOSIT' | 'BOOKING_BALANCE'
      reference_id VARCHAR(64) NOT NULL,
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      amount_minor BIGINT NOT NULL,
      currency VARCHAR(8) NOT NULL DEFAULT 'INR',
      status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING' | 'CAPTURED' | 'FAILED'
      provider VARCHAR(32) NOT NULL DEFAULT 'MANUAL', -- 'RAZORPAY' | 'CASH' | 'MANUAL'
      provider_order_id VARCHAR(128),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS payment_transactions (
      id VARCHAR(64) PRIMARY KEY,
      payment_intent_id VARCHAR(64) NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
      provider_payment_id VARCHAR(128),
      payment_method VARCHAR(64) NOT NULL DEFAULT 'CASH',
      amount_minor BIGINT NOT NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'CAPTURED',
      raw_response JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id VARCHAR(64) PRIMARY KEY,
      payment_intent_id VARCHAR(64) NOT NULL REFERENCES payment_intents(id) ON DELETE CASCADE,
      amount_minor BIGINT NOT NULL,
      reason TEXT,
      provider_refund_id VARCHAR(128),
      status VARCHAR(32) NOT NULL DEFAULT 'PROCESSED',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS invoices (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      invoice_number VARCHAR(64) NOT NULL,
      order_id VARCHAR(64) REFERENCES orders(id) ON DELETE SET NULL,
      booking_id VARCHAR(64) REFERENCES bookings(id) ON DELETE SET NULL,
      customer_id VARCHAR(64) REFERENCES customers(id) ON DELETE SET NULL,
      subtotal_minor BIGINT NOT NULL DEFAULT 0,
      tax_minor BIGINT NOT NULL DEFAULT 0,
      total_minor BIGINT NOT NULL DEFAULT 0,
      status VARCHAR(32) NOT NULL DEFAULT 'PAID',
      pdf_url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_invoice_store_number UNIQUE (store_id, invoice_number)
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      account_type VARCHAR(64) NOT NULL, -- 'REVENUE' | 'TAX_PAYABLE' | 'ACCOUNTS_RECEIVABLE' | 'CASH'
      entry_type VARCHAR(16) NOT NULL, -- 'DEBIT' | 'CREDIT'
      amount_minor BIGINT NOT NULL,
      reference_type VARCHAR(64),
      reference_id VARCHAR(64),
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // 11. Extensions & Webhooks
  await query(`
    CREATE TABLE IF NOT EXISTS extension_connections (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      provider VARCHAR(64) NOT NULL, -- 'RAZORPAY' | 'SHIPROCKET'
      is_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      is_test_mode BOOLEAN NOT NULL DEFAULT TRUE,
      credentials_encrypted JSONB NOT NULL DEFAULT '{}'::jsonb,
      settings JSONB NOT NULL DEFAULT '{}'::jsonb,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_ext_store_provider UNIQUE (store_id, provider)
    );

    CREATE TABLE IF NOT EXISTS provider_webhook_inbox (
      id VARCHAR(64) PRIMARY KEY,
      provider VARCHAR(64) NOT NULL,
      event_id VARCHAR(128) NOT NULL,
      event_type VARCHAR(128) NOT NULL,
      raw_payload TEXT NOT NULL,
      signature VARCHAR(255),
      is_verified BOOLEAN NOT NULL DEFAULT FALSE,
      processing_status VARCHAR(32) NOT NULL DEFAULT 'RECEIVED', -- 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED'
      error_message TEXT,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_webhook_provider_event UNIQUE (provider, event_id)
    );
  `);

  // Indexes for high performance
  await query(`
    CREATE INDEX IF NOT EXISTS idx_products_store_status ON products(store_id, status);
    CREATE INDEX IF NOT EXISTS idx_variants_product ON product_variants(product_id);
    CREATE INDEX IF NOT EXISTS idx_variants_sku ON product_variants(sku);
    CREATE INDEX IF NOT EXISTS idx_orders_store_status ON orders(store_id, status);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_bookings_store_time ON bookings(store_id, start_time, end_time);
    CREATE INDEX IF NOT EXISTS idx_holds_expiry ON booking_holds(expires_at);
    CREATE INDEX IF NOT EXISTS idx_inv_balance_variant ON inventory_balances(variant_id);
    CREATE INDEX IF NOT EXISTS idx_audit_store_created ON audit_logs(store_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON outbox_events(published) WHERE published = FALSE;

    -- V2 Identity, Onboarding & Notification Extensions
    ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_secret VARCHAR(255);
    ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);

    CREATE TABLE IF NOT EXISTS email_verification_tokens (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS onboarding_checklists (
      id VARCHAR(64) PRIMARY KEY,
      store_id VARCHAR(64) NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
      step_key VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      is_completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT uq_store_step UNIQUE (store_id, step_key)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(64) PRIMARY KEY,
      organization_id VARCHAR(64) NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      store_id VARCHAR(64) REFERENCES stores(id) ON DELETE CASCADE,
      user_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
      type VARCHAR(64) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_store_read ON notifications(store_id, is_read);
    CREATE INDEX IF NOT EXISTS idx_checklists_store ON onboarding_checklists(store_id);

    -- 26. Streamlined Registration & Phone/Email OTP Authentication
    ALTER TABLE users ALTER COLUMN email DROP NOT NULL;
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
    ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN NOT NULL DEFAULT FALSE;
    CREATE UNIQUE INDEX IF NOT EXISTS uq_users_phone ON users(phone) WHERE phone IS NOT NULL AND phone != '';

    CREATE TABLE IF NOT EXISTS verification_otps (
      id VARCHAR(64) PRIMARY KEY,
      identifier VARCHAR(255) NOT NULL,
      code VARCHAR(16) NOT NULL,
      type VARCHAR(32) NOT NULL DEFAULT 'REGISTER', -- 'REGISTER' | 'LOGIN' | 'RECOVERY'
      expires_at TIMESTAMPTZ NOT NULL,
      is_used BOOLEAN NOT NULL DEFAULT FALSE,
      attempts INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_otps_identifier_type ON verification_otps(identifier, type, is_used);
  `);

  console.log('[Migration] All migrations completed successfully.');
}

if (process.argv[1] && process.argv[1].endsWith('migrate.ts')) {
  runMigrations()
    .then(() => {
      console.log('[Migration] Migration script finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Migration] Failed:', err);
      process.exit(1);
    });
}

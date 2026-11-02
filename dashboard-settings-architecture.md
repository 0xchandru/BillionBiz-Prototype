# Dashboard, Analytics and Settings Architecture

## 1. Dashboard data architecture

Dashboard is a read-model layer, not an independent source of transaction truth. Build queries/aggregates from committed orders, payment transactions/refunds, inventory movements, shipments and bookings. Rebuildable projections may be cached/materialized; each KPI must have a documented definition and date basis.

## 2. Required metric definitions

- Gross merchandise value / gross sales: define inclusion of taxes, shipping and discounts.
- Discounts: recorded separately from gross line value.
- Captured amount: verified captured transactions, excluding authorized-only and failed attempts.
- Refunds: completed refund transactions, not requested/pending refunds.
- Net sales: define whether taxes/shipping are included; publish formula in UI.
- Outstanding: unpaid balance on eligible orders/bookings.
- Orders: count by created/placed date and selected channel.
- Appointments: count by scheduled start date and status; cancellations/no-shows shown separately.
- Deposits: show captured deposit and outstanding booking balance without double counting.
- Inventory on hand/available/committed: use precise definitions and selected location.
- Shipment performance: use provider event timestamps and normalized status definitions.

## 3. Dashboard query safety

- Filter by authenticated organization/store/location scope on server.
- Respect financial/customer permissions.
- Do not cache private values under keys that omit tenant, location, role scope or filters.
- Reconcile delayed events and update projection watermark; show freshness timestamp when data is asynchronous.
- Make date boundaries store-timezone aware.

## 4. Analytics architecture

Initial: PostgreSQL query projections/materialized views for operational reporting. Later, if volume or query patterns require, stream outbox events into analytical storage (e.g. ClickHouse). The analytic store is not authoritative for checkout, stock, booking or payment decisions.

## 5. Settings modules

### Business
Legal/business identity, contact, addresses, registration/tax identifiers as applicable, locale, currency and timezone.

### Locations
Store locations, addresses, timezone override only when business policy permits, warehouses/pickup locations and location opening hours.

### Capabilities and plans
Enable products/appointments and optional POS verticals separately from plan entitlements. Explain the effect of enabling/disabling and protect existing obligations.

### Taxes and invoices
Tax policy, inclusive/exclusive pricing behavior, tax classifications, invoice prefix/series, numbering and legal invoice identity. Changes apply prospectively according to policy; old documents remain immutable.

### Payments
Provider connections, enabled methods, settlement/reconciliation settings and payment policy. Secret credentials edited through secure extension setup, not plain text exposed in general settings.

### Shipping
Carrier connections, pickup locations, packaging defaults, shipping rules and delivery zones. Product parcel data remains on product/variant records.

### Appointments
Minimum notice, booking horizon, slot increment, cancellation window, deposit, no-show and reminder policies. Snapshot relevant policy to each booking.

### Notifications
Merchant channels, customer event preferences, templates, quiet-hour rules and delivery history. Delivery states must be truthful.

### Security
Members, roles, MFA, active sessions, devices, audit history and domain verification.

### Extensions
Provider setup, connection health, webhook history, retry/reconciliation actions and disconnect flow.

## 6. Change-impact model

Before a setting changes, show whether it applies to new records only or existing records too. For settings that affect future obligations (cancellation window, tax rules, prices, timezone, shipment defaults), store a policy snapshot on the order/booking/document where required. Do not retroactively reinterpret existing transactions.


## V2 real-data requirement

All dashboard metrics and widgets must be backed by authorized persisted data or documented read models. No static demo numbers, mock trends, generated recent activity or fallback sample records are permitted in production. A new store sees real zeroes and onboarding empty states. API errors render error/stale/retry states, not fabricated zeroes. See `realtime-data-quality-architecture.md` for metric contracts, event freshness and testing rules.

## V2 settings requirement

Use `settings-control-plane.md` as the canonical hierarchy. Settings are grouped by merchant intent and show scope, saved/unsaved state, impact on existing/new records, permission, updated-by/time, validation and audit evidence.

## V2.2 merchant product boundary

The `admin` dashboard belongs to the merchant. Its purpose is to build and operate that merchant's store: Online Store/Pages Editor/Theme, products, categories, bundles, inventory, orders, customers (People), appointments/services, POS & Counters resource management, Extensions with the merchant's own provider connections, Team, Analytics and Settings. Do not show internal BillionBiz platform operations here. Do not show SiteStore anywhere. Do not populate any chart or KPI using mock/static values; query the current tenant's real records and show zero/empty states for new stores.

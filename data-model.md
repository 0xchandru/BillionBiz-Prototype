# Canonical Data Model and Invariants

This is a logical model, not a ready-to-run SQL schema. The implementation agent must produce physical ERDs and migrations after auditing current tables. Avoid generic one-table-for-everything designs.

## 1. Entity groups

### Identity and tenancy
- `users`, `auth_identities`, `sessions`, `mfa_factors`
- `organizations`, `organization_memberships`
- `stores`, `store_locations`, `store_capabilities`, `storefront_settings` (mode + home-page choice), `store_domains`
- `subscriptions`, `plans`, `entitlements`, `usage_counters`

### Storefront
- `templates`, `template_versions`, `template_capability_requirements`
- `store_pages`, `page_draft_versions`, `page_sections`
- `store_themes`, `theme_tokens`, `store_releases`, `release_pages`
- `template_applications`, `store_snapshots`, `navigation_menus`, `media_assets`

### Team
- `staff_profiles`, `store_memberships`, `location_assignments`
- `roles`, `permissions`, `role_permissions`, `role_assignments`
- `staff_resources`, `resource_offering_assignments`, `staff_shifts`, `time_off`, `schedule_blocks`
- `devices`, `device_approvals`, `counter_registers`, `device_sessions`

### Catalogue and inventory
- `products`, `product_options`, `product_option_values`, `product_variants`, `product_attribute_schema_versions`, `product_attribute_values`
- `categories`, `collections`, `product_category_links`, `product_media`
- `bundles`, `bundle_components`, `product_attributes`, `channel_listings` (deferred until a marketplace/channel connector is approved)
- `inventory_locations`, `inventory_balances`, `inventory_movements`, `inventory_reservations`

### Commerce and finance
- `customers`, `customer_addresses`, `customer_consents`
- `orders`, `order_lines`, `order_status_history`
- `fulfillment_orders`, `fulfillment_lines`, `shipments`, `shipment_events`, `packages`
- `return_requests`, `return_lines`, `refunds`
- `payment_intents`, `payment_attempts`, `payment_transactions`, `provider_webhook_inbox`
- `invoices`, `invoice_lines`, `ledger_entries`, `settlements`, `cash_movements`, `reconciliation_cases`

### POS
- `pos_carts`, `held_bills`, `pos_sale_sessions`, `register_sessions`, `register_counts`, `register_handoffs`
- POS sale/order records should reference shared order/finance models rather than duplicate financial truth.

### Appointments
- `offerings`, `offering_resources`, `intake_form_versions`, `intake_responses`
- `booking_holds`, `bookings`, `booking_resources`, `resource_reservations`
- `booking_status_history`, `booking_policy_snapshots`, `booking_payment_obligations`

### Platform
- `extension_connections`, `extension_credentials_refs`, `integration_operations`
- `notification_templates`, `notification_jobs`, `notification_attempts`
- `outbox_events`, `consumer_inbox`, `idempotency_records`, `audit_logs`

## 2.1 Store configuration semantics

Persist backend capability flags and customer-facing presentation settings separately. Suggested fields:

- `store_capabilities.product_commerce_enabled`
- `store_capabilities.appointments_enabled`
- `store_capabilities.restaurant_pos_enabled` (optional vertical)
- `storefront_settings.mode`: `COMMERCE | SERVICES | BOTH`
- `storefront_settings.home_page`: `LANDING | BOOKING`
- `storefront_settings.navigation_config` and icon visibility overrides (merchant-editable after applying a mode preset)
- `storefront_settings.version` for optimistic concurrency

The service validates that the mode is compatible with enabled capabilities. Mode presets never grant entitlements or enable backend features. A capability cannot be disabled while in-use obligations would be orphaned; require a dependency report and safe deactivation workflow.

## 2. Key invariants

1. Every tenant-owned row is bound to a valid organization and, where applicable, store/location.
2. Cross-tenant foreign key relationships are impossible by schema/constraints or enforced repository-level composite checks.
3. Product SKU/barcode uniqueness scope is explicitly decided (store vs organization) and enforced in DB.
4. Product parent and variant quantities are not double-counted in catalog metrics.
5. Historical order lines contain snapshots and do not change when product data is edited.
6. Category attribute schemas are versioned; an edit/import cannot silently discard fields unknown to the currently active schema.
7. Inventory balances are derived from or reconciled with immutable stock movements.
8. An order cannot be paid above its payable balance except where explicit overpayment/store-credit policy exists.
9. A refund cannot exceed refundable captured value after prior refunds.
10. A booking cannot reserve overlapping exclusive resources or exceed group capacity.
11. Booking reschedule releases and claims reservations atomically.
12. Appointment deposit captured value is counted once when POS collects the remaining balance.
13. One provider webhook event ID is processed at most once effectively, even if delivered repeatedly.
14. One client idempotency key maps to one operation result within the required retention window.
15. A live storefront points to one immutable release; drafts never leak into live rendering.
16. Store template apply/undo history is retained; restore creates a new release rather than deleting history.
17. Offline POS transactions are not reported as server-accepted before acknowledgement.
18. Storefront Mode does not grant backend capability or entitlement; direct route/API access is checked server-side.
19. Home-page selection is persisted independently from Storefront Mode.
20. Capability changes do not delete historical orders, bookings, payments, invoices or audit history.

## 3. Required physical design decisions

The implementation agent must document: PK strategy, composite FK patterns, tenant RLS, soft deletion policy, money precision, timezone storage, interval/range representation, JSONB boundaries, index strategy, partition candidates, retention, backup, restore and migration approach.

## V2.2 integration, release and tenant routing entities

The canonical model must include (or map to existing equivalent tables) the following entities. Do not duplicate entities if the repository already has a sound equivalent; document the mapping.

- `integration_connections`: organization/store scope, provider key, TEST/LIVE, connection state, non-secret provider account metadata, scopes, encrypted credential envelope/key version, verification and rotation metadata.
- `integration_credential_versions`: immutable key/credential version history, created/retired timestamps and actor, without plaintext.
- `integration_webhook_endpoints`, `integration_webhook_inbox`: provider-specific endpoint metadata, verified signature state, provider event IDs, idempotency/replay status and sanitized payload references.
- `store_domains`: normalized hostname, store/tenant, verification and certificate state, canonical policy and audit metadata.
- `store_page_revisions`, `store_theme_revisions`, `store_releases`: versioned drafts and immutable published release snapshots with schema versions and immutable asset references.
- `store_active_release`: atomic reference/pointer to the currently served immutable release (or equivalent transactional relation).
- `outbox_events`, `inbox_events`: transactional event delivery and deduplication/recovery metadata.

### Additional invariants

1. Integration credentials are ciphertext at rest, scoped by tenant/store/provider/environment, and never returned in API responses.
2. `(store_id, provider_key, environment)` is unique unless an explicitly documented multi-account connection model is implemented.
3. A merchant cannot read, rotate, disconnect or invoke another merchant's connection.
4. `store_domains` has one active owner per normalized host; reserved system hosts cannot be attached as merchant domains.
5. Published storefront state points to one immutable release; failed publish never changes the prior active pointer.
6. Code deployment never edits, clears or recreates merchant store content or release pointers.
7. Schema migrations preserve unknown content fields or produce a blocking migration exception; never silently discard customizations.
8. Outbox event publication follows a committed transaction; clients cannot receive uncommitted state.
9. No production seed inserts demonstration merchant records.

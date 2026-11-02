# API Contracts and Integration Conventions

## 1. API rules

- Version external APIs (e.g. `/api/v1`).
- Use OpenAPI as the canonical HTTP contract.
- Generate typed frontend clients from contracts where possible.
- Use command/query separation at domain boundary; do not expose DB table CRUD directly.
- Use consistent pagination (`cursor` preferred for large/changing lists), filtering, sorting and field selection.
- Return stable machine-readable error codes plus safe human-readable messages and correlation ID.
- Validate inputs server-side with shared schema definitions.
- Resolve tenant context from authenticated session and membership; do not trust client tenant IDs.
- Use idempotency keys for non-idempotent operations.
- Use ETag/version for concurrent editing.

## 2. Suggested endpoint families

- `/auth/*`, `/organizations/*`, `/stores/*`, `/locations/*`, `/entitlements/*`
- `/team/*`, `/roles/*`, `/permissions/*`, `/devices/*`
- `/store-editor/*`, `/templates/*`, `/store-releases/*`, `/domains/*`
- `/catalog/products/*`, `/catalog/categories/*`, `/catalog/bundles/*`, `/inventory/*`
- `/orders/*`, `/fulfillment/*`, `/shipments/*`, `/returns/*`, `/refunds/*`
- `/pos/counters/*`, `/pos/carts/*`, `/pos/checkout/*`, `/pos/registers/*`, `/pos/offline-sync/*`
- `/appointments/offerings/*`, `/appointments/resources/*`, `/appointments/availability/*`, `/appointments/bookings/*`
- `/payments/*`, `/invoices/*`, `/finance/*`, `/reconciliation/*`
- `/extensions/*`, `/webhooks/*`, `/notifications/*`, `/analytics/*`

## 3. Example operation contracts

### Create product
`POST /api/v1/catalog/products`
- Input: product fields, variant definitions, status, version context.
- Server: validates capabilities/permissions, SKU uniqueness, prices, media references and inventory rules.
- Output: created product and variants with IDs/version.
- Idempotency: required for import/upsert job; optional for ordinary user create but recommended.

### Preview appointment availability
`GET /api/v1/appointments/availability?offeringId=...&from=...&to=...&resourceId=...`
- Return: candidate slots, timezone, required resources and remaining group capacity where applicable.
- This is advisory; booking confirmation revalidates in transaction.

### Confirm appointment
`POST /api/v1/appointments/bookings`
- Required: hold token/reference, offering, customer, intake answers, idempotency key.
- Server: validates hold, rechecks availability, locks/claims resources/capacity, creates booking and outbox event atomically.

### POS checkout
`POST /api/v1/pos/checkout`
- Required: counter/device/session, cart/version, tenders, idempotency key.
- Server: revalidates prices/tax/discount/stock; verifies manual/cash/provider tender state; commits order/stock/register/finance records.

### Ship order
`POST /api/v1/fulfillment/orders/{id}/shipments`
- Required: eligible lines/quantities, origin, destination, package measurements, provider connection, idempotency key.
- Server: persists operation intent; invokes provider; reconciles timeout before retry; stores shipment and tracking references.

### Publish store
`POST /api/v1/store-releases/publish`
- Required: expected draft version, review token, idempotency key.
- Server: validates all included page/theme/capability schemas and permissions; atomically creates immutable release and switches active release pointer.

## 4. Error model

Use stable codes such as `TENANT_ACCESS_DENIED`, `VERSION_CONFLICT`, `SKU_DUPLICATE`, `INSUFFICIENT_STOCK`, `BOOKING_SLOT_UNAVAILABLE`, `CAPACITY_EXCEEDED`, `PAYMENT_NOT_VERIFIED`, `REFUND_LIMIT_EXCEEDED`, `PROVIDER_TIMEOUT_RECONCILIATION_REQUIRED`, `STORE_RELEASE_VALIDATION_FAILED`.

Do not reveal whether another tenant's object exists. Return 404 or 403 according to documented resource discovery policy.

## 5. Webhooks

Webhook endpoint must preserve raw body, verify signature, persist inbox event before acknowledging, deduplicate by provider event ID and process asynchronously. Expose operational state only to authorized integration managers. Never expose provider secrets in API responses.

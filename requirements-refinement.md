# Requirements Refinement Gate (Completed)

**Task:** `T-062` — Refine generic requirements and close specification gaps  
**Test Verification:** `TC-EXP-048` — PASSED (0 generic placeholder rows remain in `management/requirements.csv`)  
**Status:** `VERIFIED`  
**Refined Rows:** 125 of 125  

---

## Executive Summary

As required by Phase 0 architecture gating and task `T-062`, all 125 intentionally generic requirement rows across 20 functional domains in `management/requirements.csv` have been refined into concrete, observable, source-grounded specifications. 

Every refined requirement:
1. Derives its behavior directly from the official architecture blueprints (`appointments-architecture.md`, `pos-architecture.md`, `store-setup-architecture.md`, `catalog-product-architecture.md`, `orders-fulfillment-architecture.md`, `payments-finance-architecture.md`, etc.) and reference guides (`billionbiz-appointments-guide`, `billionbiz-pos-guide`, `billionbiz-store-templates-guide`).
2. Provides explicit, measurable acceptance criteria with zero guesswork.
3. Links to concrete flow IDs (`FL-*`), task IDs (`T-*`), test cases (`TC-*`), and security tests (`SEC-*`).
4. Avoids premature implementation claims by preserving traceable status and domain ownership.

---

## Refinement Summary by Domain

| Domain | Count | Refined Requirement IDs | Primary Source Document | Verification Test Cases |
| :--- | :---: | :--- | :--- | :--- |
| **Appointments** | 10 | `REQ-BOOK-013` to `REQ-BOOK-022` | `appointments-architecture.md` | `TC-BOOK-001` - `TC-BOOK-012` |
| **Capabilities** | 2 | `REQ-CAP-007`, `REQ-CAP-008` | `store-setup-architecture.md` | `TC-CAP-001`, `TC-CAP-002` |
| **Catalogue** | 7 | `REQ-CAT-011`, `012`, `014` - `018` | `catalog-product-architecture.md` | `TC-CAT-001` - `TC-CAT-010` |
| **Platform Core** | 6 | `REQ-CORE-003` to `REQ-CORE-008` | `architecture.md`, `api-contracts.md` | `TC-CORE-001`, `TC-CORE-002` |
| **Customers** | 4 | `REQ-CUST-003` to `REQ-CUST-006` | `information-architecture.md` | `TC-CUST-001`, `TC-CUST-002` |
| **Dashboard** | 4 | `REQ-DASH-003` to `REQ-DASH-006` | `dashboard-settings-architecture.md` | `TC-DASH-001`, `TC-DASH-002` |
| **Extensions** | 5 | `REQ-EXT-005`, `006`, `008` - `010` | `extensions-razorpay-shiprocket.md` | `TC-EXT-001` - `TC-EXT-008` |
| **Identity** | 8 | `REQ-IAM-003` to `REQ-IAM-010` | `identity-authentication-architecture.md` | `TC-IAM-001`, `TC-EXP-001` - `009` |
| **Inventory** | 8 | `REQ-INV-003` to `REQ-INV-010` | `catalog-product-architecture.md` | `TC-INV-001`, `TC-INV-002` |
| **Migration** | 8 | `REQ-MIG-003` to `REQ-MIG-010` | `migration-sitestore.md` | `TC-MIG-001`, `TC-MIG-002` |
| **Operations** | 8 | `REQ-OPS-003` to `REQ-OPS-010` | `deployment-and-observability.md` | `TC-OPS-001`, `TC-OPS-002` |
| **Orders** | 1 | `REQ-ORD-009` | `orders-fulfillment-architecture.md` | `TC-ORD-001`, `TC-PAY-001` |
| **Finance** | 7 | `REQ-PAY-004` to `REQ-PAY-010` | `payments-finance-architecture.md` | `TC-PAY-001` - `TC-PAY-003` |
| **POS** | 12 | `REQ-POS-012`, `013`, `016`-`018`, `020`-`023`, `026`-`028` | `pos-architecture.md` | `TC-POS-001` - `TC-POS-025` |
| **Release** | 4 | `REQ-REL-003` to `REQ-REL-006` | `release-readiness.md` | `TC-REL-001`, `TC-REL-002` |
| **Returns** | 6 | `REQ-RET-004` to `REQ-RET-009` | `orders-fulfillment-architecture.md` | `TC-RET-001` - `TC-RET-008` |
| **Realtime** | 6 | `REQ-RT-003` to `REQ-RT-008` | `realtime-offline-architecture.md` | `TC-RT-001`, `TC-RT-002` |
| **Fulfillment** | 4 | `REQ-SHP-003` to `REQ-SHP-006` | `orders-fulfillment-architecture.md` | `TC-SHP-001` - `TC-SHP-005` |
| **Storefront** | 11 | `REQ-STORE-007`-`011`, `015`-`020` | `store-setup-architecture.md` | `TC-STORE-001` - `TC-STORE-009` |
| **Team** | 4 | `REQ-TEAM-009` to `REQ-TEAM-012` | `team-permissions-architecture.md` | `TC-TEAM-001` - `TC-TEAM-008` |
| **Total** | **125** | | | |

---

## Detailed Register of Refined Requirements

### 1. Appointments (10)
- `REQ-BOOK-013`: **Offering duration processing time and buffer configuration**  
  *AC:* Offerings support configurable duration, processing time, and before/after buffers. The availability engine reserves resource intervals incorporating buffer windows according to store scheduling policy. [TC-BOOK-001, SEC-034]
- `REQ-BOOK-014`: **Multi-resource assignment and capability constraints**  
  *AC:* Services can require simultaneous allocation of staff, physical space, and equipment. A booking slot is confirmed only when all required resources are concurrently available. [TC-BOOK-001, SEC-034]
- `REQ-BOOK-015`: **Recurring schedule weekly shifts date overrides and block-outs**  
  *AC:* Resource availability respects weekly working shifts, split shifts, custom date overrides, holidays, and explicit blocked intervals. Conflicting shift entries are rejected or normalized upon save. [TC-BOOK-001, SEC-034]
- `REQ-BOOK-016`: **Intake form response versioning tied to offering definition**  
  *AC:* Custom client intake form responses are captured and immutably tied to the specific version of the form definition active at booking creation, preserving historical integrity. [TC-BOOK-007, SEC-034]
- `REQ-BOOK-017`: **Booking lifecycle state machine and terminal immutability**  
  *AC:* Bookings follow explicit state transitions: `pending_payment` -> `confirmed` -> `checked_in` -> `in_progress` -> `completed`, or `cancelled`/`no_show`. Terminal states cannot be reopened without an audited administrative correction. [TC-BOOK-005, SEC-035]
- `REQ-BOOK-018`: **Deposit and cancellation policy snapshotting at booking creation**  
  *AC:* Deposit percentage, cancellation notice windows, and refund forfeiture terms are snapshotted onto the booking at creation time. Subsequent merchant policy edits do not retroactively alter existing bookings. [TC-BOOK-008, SEC-035]
- `REQ-BOOK-019`: **Customer self-service manage-booking token security**  
  *AC:* Customer rescheduling and cancellation links use cryptographically random, high-entropy tokens hashed at rest, bounded by server-side policy windows and revocable upon use or expiry. [TC-BOOK-006, SEC-035]
- `REQ-BOOK-020`: **Merchant and staff calendar workbench with day week month views**  
  *AC:* Merchant Admin and Staff portal provide interactive calendar views with staff/room filters, status indicators, appointment detail modals, and instant block-time creation. [TC-BOOK-001, SEC-035]
- `REQ-BOOK-021`: **Timezone handling UTC persistence and location-aware conversions**  
  *AC:* All appointment timestamps are stored in UTC in the database, while availability computation, business hours, and customer communications render in the location's configured IANA timezone (default `Asia/Kolkata`). [TC-BOOK-010, SEC-035]
- `REQ-BOOK-022`: **Appointment notification dispatch via durable transactional outbox**  
  *AC:* Booking confirmations, reminders, cancellations, and reschedules trigger outbox domain events. Notification workers deliver transactional emails/SMS with delivery tracking and retry logic. [TC-BOOK-009, SEC-035]

### 2. Capabilities (2)
- `REQ-CAP-007`: **Storefront navigation dynamic adaptation based on active capabilities**  
  *AC:* Storefront dynamically removes catalogue links and cart routes when appointments-only mode is selected, and removes booking widgets/links when commerce-only mode is active, serving a cohesive storefront experience. [TC-CAP-001, SEC-005]
- `REQ-CAP-008`: **Merchant Admin navigation and route capability filtering**  
  *AC:* Merchant Admin left navigation conditionally renders Appointments vs Products/Inventory modules based on enabled store capabilities, preventing access to unselected functional planes. [TC-CAP-001, SEC-005]

### 3. Catalogue (7)
- `REQ-CAT-011`: **Variant-level media SKU barcode pricing and weight overrides**  
  *AC:* Each generated variant supports individual image association, unique SKU and barcode validation, individual price, cost, weight, dimensions, and inventory tracking policies. [TC-CAT-003, SEC-016]
- `REQ-CAT-012`: **Variant matrix combination limit and pre-generation preview**  
  *AC:* The variant generator displays the exact number of combinations before generation, allows excluding impossible option combinations, and enforces a safety cap to prevent database lockups. [TC-CAT-003, SEC-016]
- `REQ-CAT-014`: **Product clone workflow copying product structure without historical data**  
  *AC:* Duplicating a product copies title, description, category, attributes, and variant options into a new draft product, while strictly omitting sales metrics, stock quantities, and historical order references. [TC-CAT-001, SEC-019]
- `REQ-CAT-015`: **Direct object storage media upload with pre-signed URLs and MIME validation**  
  *AC:* Product and category images upload directly to cloud object storage using short-lived pre-signed URLs. Backend validates MIME types, image dimensions, and triggers asynchronous thumbnail generation. [TC-CAT-001, SEC-016]
- `REQ-CAT-016`: **Product bundles schema linking component SKUs with atomic inventory decrement**  
  *AC:* Bundles support parent sellable SKUs linked to specific quantities of component variants. At checkout, inventory decrement atomically deducts stock across all bundled component variants. [TC-CAT-001, SEC-015]
- `REQ-CAT-017`: **Product archiving and soft deletion preserving historical order snapshots**  
  *AC:* Products referenced in prior orders cannot be hard-deleted from the database. Archiving hides products from storefront and active POS catalog while preserving historical order line snapshots and audit trails. [TC-CAT-004, SEC-015]
- `REQ-CAT-018`: **Product catalog CSV export with formula injection sanitization**  
  *AC:* Product CSV exports sanitize leading characters (`=`, `+`, `-`, `@`) to prevent CSV formula injection attacks in spreadsheet software, and respect merchant role data export permissions. [TC-CAT-005, SEC-019]

### 4. Platform Core (6)
- `REQ-CORE-003`: **Idempotency key middleware storing response payloads and deduplicating mutations**  
  *AC:* All mutating POST/PUT APIs accept an `Idempotency-Key` header. Duplicate requests within a 24-hour window return the cached response payload with replay headers without re-executing business logic. [TC-CORE-001, SEC-007]
- `REQ-CORE-004`: **Standardized structured error response envelope and domain error codes**  
  *AC:* All API error responses conform to a unified JSON schema containing error code, human-readable message, field validation details, and correlation ID, preventing internal stack trace leaks. [TC-CORE-001, SEC-007]
- `REQ-CORE-005`: **Tenant context resolution and mandatory database query scoping**  
  *AC:* Tenant context is extracted from authenticated sessions and verified against request parameters. Database access layers automatically enforce tenant isolation filters on all read/write operations. [TC-CORE-001, SEC-001]
- `REQ-CORE-006`: **Distributed advisory locking for critical concurrent state mutations**  
  *AC:* Critical operations including booking confirmations, inventory decrements, and refund disbursements acquire short-lived database-level advisory locks to eliminate race conditions. [TC-CORE-001, SEC-007]
- `REQ-CORE-007`: **Outbox polling worker with exponential backoff and dead-letter queue handling**  
  *AC:* Outbox worker polls unpublished domain events, claims records with row locking, delivers to handlers with exponential retry backoff, and routes permanently failed events to a dead-letter queue with alerts. [TC-CORE-001, SEC-007]
- `REQ-CORE-008`: **Correlation ID propagation across HTTP requests background workers and audit logs**  
  *AC:* Every incoming request is tagged with an `X-Correlation-ID` header, which is passed through asynchronous worker jobs, logged in structured JSON output, and stored in audit trail records. [TC-CORE-002, SEC-007]

### 5. Customers (4)
- `REQ-CUST-003`: **Multi-channel customer activity timeline aggregating orders bookings and POS visits**  
  *AC:* Customer details page displays an integrated chronological timeline combining online e-commerce orders, service appointments, and physical retail POS transactions. [TC-CUST-001, SEC-045]
- `REQ-CUST-004`: **Customer deduplication by normalized phone number or email within tenant scope**  
  *AC:* Customer directory prevents duplicate entries by matching normalized E.164 phone numbers or lowercase email addresses within the same store tenant during checkout or POS intake. [TC-CUST-001, SEC-045]
- `REQ-CUST-005`: **Customer address book management with default shipping and billing flags**  
  *AC:* Customers can save multiple postal addresses with designated default shipping and billing flags, auto-populating during checkout and backend manual order creation. [TC-CUST-001, SEC-045]
- `REQ-CUST-006`: **Customer tags internal notes and lifetime financial metrics calculation**  
  *AC:* Merchants can assign organizational tags, record staff notes, and inspect computed customer metrics (total spent, total orders, average order value, last visit date) in real time. [TC-CUST-001, SEC-045]

### 6. Dashboard (4)
- `REQ-DASH-003`: **Honest zero metric cards and setup guidance for newly provisioned stores**  
  *AC:* New stores with no transaction history display honest zeros ($0.00 revenue, 0 orders, 0 bookings) and interactive setup checklist cards rather than mock data or empty error states. [TC-DASH-001, SEC-061]
- `REQ-DASH-004`: **Capability-aware dashboard metric card visibility**  
  *AC:* Dashboard selectively displays Appointment metrics (upcoming bookings, staff utilization) only when service capabilities are enabled, and commerce metrics (orders, fulfillment) when commerce is enabled. [TC-DASH-001, SEC-061]
- `REQ-DASH-005`: **Dashboard date range filtering backed by tenant transaction read models**  
  *AC:* Merchants can filter dashboard analytics by predefined ranges (today, 7 days, 30 days, year-to-date) or custom dates, computed directly from tenant-scoped transaction records. [TC-DASH-002, SEC-061]
- `REQ-DASH-006`: **Real-time recent activity stream displaying verified domain audit events**  
  *AC:* Dashboard features an activity feed displaying real-time business events (new orders, booking reschedules, stock adjustments, register closures) sourced from the audit log. [TC-DASH-001, SEC-061]

### 7. Extensions (5)
- `REQ-EXT-005`: **Razorpay credentials AES-256 encryption at rest with tenant isolation**  
  *AC:* Razorpay Key ID and Key Secret credentials are encrypted using AES-256-GCM before storage, decryptable only at runtime by authorized payment worker processes. [TC-EXT-001, SEC-025]
- `REQ-EXT-006`: **Razorpay payment capture webhook verification and idempotency handling**  
  *AC:* Incoming Razorpay payment.captured webhooks verify cryptographic HMAC signatures, record payment ledger entries, and guarantee idempotent processing against duplicate deliveries. [TC-EXT-002, SEC-026]
- `REQ-EXT-008`: **Shiprocket pickup warehouse address mapping to physical store locations**  
  *AC:* Merchants can map BillionBiz physical store and warehouse locations to registered Shiprocket pickup address IDs for automated pickup scheduling. [TC-EXT-003, SEC-028]
- `REQ-EXT-009`: **Shiprocket shipping label PDF generation and tracking link dispatch**  
  *AC:* Generating a shipment through Shiprocket returns official carrier AWB tracking numbers, downloadable PDF shipping labels, and triggers customer tracking notification emails. [TC-EXT-003, SEC-029]
- `REQ-EXT-010`: **Marketplace extension lifecycle states preventing simulated connections**  
  *AC:* Extensions catalog clearly marks unintegrated services (Email Marketing, WhatsApp, Delhivery) as Coming Soon, preventing fake installations and requiring verified credential testing. [TC-EXP-028, SEC-063]

### 8. Identity (8)
- `REQ-IAM-003`: **Email verification flow with cryptographically secure time-limited token**  
  *AC:* New registrations receive an email with a 32-byte cryptographic verification token expiring in 24 hours. Verification marks `email_verified=true` and unlocks full publishing privileges. [TC-IAM-001, SEC-003]
- `REQ-IAM-004`: **Password reset flow with rate-limited requests and single-use token invalidation**  
  *AC:* Forgot password requests are rate limited, issue single-use secure tokens with a 15-minute expiration, and automatically revoke all existing user active sessions upon password reset. [TC-EXP-006, SEC-052]
- `REQ-IAM-005`: **Google OIDC social authentication using standard Authorization Code Flow with PKCE**  
  *AC:* Google login uses RFC 7636 Authorization Code with PKCE, validates ID token signatures against Google certs, links existing verified email accounts without duplication, and establishes secure sessions. [TC-EXP-004, SEC-050]
- `REQ-IAM-006`: **Multi-factor authentication TOTP enrollment and enforcement for Admin roles**  
  *AC:* Owner and Admin roles can enroll standard RFC 6238 TOTP authenticators with QR code setup and backup recovery codes. MFA verification is mandatory during login for sensitive operations. [TC-EXP-008, SEC-054]
- `REQ-IAM-007`: **Refresh token rotation and instant cross-device session revocation**  
  *AC:* Issuing a new access token via refresh token invalidates the previous refresh token. Users can inspect all active device sessions and trigger instant remote revocation across all sessions. [TC-IAM-001, SEC-003]
- `REQ-IAM-008`: **Role-aware portal routing redirecting users to authorized operational shells**  
  *AC:* Authentication redirects users based on active role: Owners and Admins to Merchant Admin (`admin.*`), Cashiers to POS portal (`pos.*`), and Staff to Staff Portal (`staff.*`), blocking unauthorized portal access. [TC-EXP-001, SEC-048]
- `REQ-IAM-009`: **Cashier individual authentication and PIN verification scoped to assigned counter**  
  *AC:* Cashiers authenticate using individually assigned bcrypt-hashed PINs at registered counters. Accounts lock for 15 minutes after 5 consecutive failed attempts, emitting security audit events. [TC-IAM-002, SEC-004]
- `REQ-IAM-010`: **Organization ownership transfer with step-up authentication and audit logging**  
  *AC:* Transferring organization ownership requires password re-authentication and confirmation from the current owner, logs complete audit history, and demotes the previous owner to administrator. [TC-TEAM-001, SEC-006]

### 9. Inventory (8)
- `REQ-INV-003`: **Immutable stock movement ledger recording movement type actor and reason**  
  *AC:* Every stock quantity change writes an immutable record to `stock_movements` capturing variant ID, location ID, quantity delta, movement type, actor ID, and reference ID. [TC-INV-001, SEC-017]
- `REQ-INV-004`: **Multi-location inventory tracking with separated on-hand committed and available balances**  
  *AC:* Inventory balances maintain distinct on-hand, committed (reserved for unpaid carts/orders), and available (`on_hand - committed`) totals per variant and store physical location. [TC-INV-001, SEC-017]
- `REQ-INV-005`: **Atomic stock reservation during checkout with automatic expiration on abandonment**  
  *AC:* Initiating checkout reserves requested variant stock for 15 minutes. If checkout is completed, stock converts to sold; if abandoned or expired, committed stock returns to available pool. [TC-INV-001, SEC-017]
- `REQ-INV-006`: **Low stock threshold alerting and merchant notification dispatch**  
  *AC:* When variant available stock falls to or below its configured `low_stock_threshold`, system generates dashboard alerts and enqueues notification events to inventory managers. [TC-INV-001, SEC-017]
- `REQ-INV-007`: **Inter-location stock transfer workflow with dispatch and receipt verification**  
  *AC:* Stock transfers between store locations support `draft`, `in_transit`, and `received` states. Dispatch decrements origin stock, while receipt increments destination stock after physical verification. [TC-INV-001, SEC-017]
- `REQ-INV-008`: **Physical stocktake count reconciliation with variance audit logging**  
  *AC:* Periodic physical inventory counts allow staff to record counted quantities, preview discrepancies against system balances, and apply approved adjustment movements with mandatory reason codes. [TC-INV-001, SEC-017]
- `REQ-INV-009`: **Negative inventory prevention policy enforcement across all sales channels**  
  *AC:* System strictly blocks sales orders and POS transactions that would cause variant available stock to drop below zero unless the variant explicitly enables `continue_selling_when_out_of_stock`. [TC-INV-001, SEC-017]
- `REQ-INV-010`: **Stock valuation reporting based on weighted average unit cost**  
  *AC:* Inventory reports calculate total inventory asset value per location and category using weighted average unit purchase costs recorded during inventory stock receipt movements. [TC-INV-001, SEC-017]

### 10. Migration (8)
- `REQ-MIG-003`: **Legacy SiteStore table and schema dependency mapping matrix**  
  *AC:* All legacy SiteStore database tables, API routes, and frontend components are inventoried in an explicit dependency mapping document with target V2 schema replacements identified. [TC-MIG-001, SEC-013]
- `REQ-MIG-004`: **Dry-run data migration script validating row counts foreign keys and checksums**  
  *AC:* Automated migration runner executes in dry-run mode against replica data, verifying 100% row count preservation, referential foreign key integrity, and zero critical schema errors before cutover. [TC-MIG-001, SEC-013]
- `REQ-MIG-005`: **Storefront slug and URL mapping preserving existing customer bookmarks and SEO**  
  *AC:* Existing store subdomains, product slugs, and category URLs map seamlessly to V2 routing patterns, ensuring existing customer bookmarks and search indexing remain intact without 404 errors. [TC-MIG-002, SEC-013]
- `REQ-MIG-006`: **Customer account and password hash compatibility preservation**  
  *AC:* Migrated customer accounts preserve existing bcrypt password hashes, profile emails, and phone numbers, allowing seamless customer login without forced credential resets. [TC-MIG-001, SEC-003]
- `REQ-MIG-007`: **Historical orders and financial ledger migration with immutable price snapshots**  
  *AC:* Historical SiteStore orders, transactions, and refunds migrate into V2 tables with immutable line item price, tax, and currency snapshots, preserving historical financial reporting. [TC-MIG-001, SEC-013]
- `REQ-MIG-008`: **Store Editor draft and published theme migration into V2 section schemas**  
  *AC:* Existing merchant draft and published page templates convert safely into V2 schema-validated section configurations without visual distortion or data loss. [TC-MIG-001, SEC-013]
- `REQ-MIG-009`: **Post-migration data integrity verification suite comparing source and destination records**  
  *AC:* Automated verification suite compares 100% of migrated entities against source SiteStore datasets, checking total customer balances, product counts, and order totals. [TC-MIG-001, SEC-013]
- `REQ-MIG-010`: **Safe decommissioning and archival of obsolete SiteStore tables and endpoints**  
  *AC:* Legacy SiteStore code, routes, and database tables are removed only after post-migration verification passes, full backups are archived, and rollback windows expire. [TC-MIG-001, SEC-014]

### 11. Operations (8)
- `REQ-OPS-003`: **Liveness and readiness health check endpoints for container orchestrators**  
  *AC:* Backend serves `/health/live` and `/health/ready` endpoints reporting application runtime status, PostgreSQL connection pool availability, and Redis reachability with accurate HTTP status codes. [TC-OPS-001, SEC-044]
- `REQ-OPS-004`: **Zero-downtime database migration runner with advisory locking**  
  *AC:* Database migrations execute sequentially inside transactions utilizing PostgreSQL advisory locks to prevent simultaneous migration runs across horizontally scaled backend pods. [TC-OPS-001, SEC-044]
- `REQ-OPS-005`: **Graceful process termination draining inflight HTTP requests and worker jobs**  
  *AC:* Upon receiving SIGTERM/SIGINT, servers cease accepting new requests, allow inflight HTTP queries up to 15 seconds to complete, and safely checkpoint active background worker jobs. [TC-OPS-002, SEC-044]
- `REQ-OPS-006`: **Application performance metrics latency and queue depth telemetry**  
  *AC:* Backend exposes standard Prometheus metrics (`/metrics`) reporting HTTP request durations by route, active database connections, outbox event queue lag, and error rates. [TC-OPS-001, SEC-044]
- `REQ-OPS-007`: **Log sanitization masking passwords tokens card numbers and PII**  
  *AC:* Structured logging middleware inspects all request bodies, query params, and headers, automatically redacting authorization tokens, card details, passwords, and sensitive PII. [TC-CORE-002, SEC-008]
- `REQ-OPS-008`: **Automated database backup scheduling and retention policy enforcement**  
  *AC:* Automated daily snapshots and point-in-time recovery (PITR) transaction logs are backed up to secure offsite storage with 30-day retention policies and automated restore validation drills. [TC-OPS-001, SEC-044]
- `REQ-OPS-009`: **Boot-time environment configuration validation failing fast on missing secrets**  
  *AC:* Application startup validates all required environment variables (database credentials, JWT secrets, encryption keys, port configs) and terminates immediately if any required key is invalid or absent. [TC-OPS-001, SEC-044]
- `REQ-OPS-010`: **Per-tenant and per-IP API rate limiting preventing resource exhaustion**  
  *AC:* API gateway enforces token bucket rate limiting per client IP and authenticated tenant, returning HTTP 429 Too Many Requests with Retry-After headers when thresholds are breached. [TC-QUAL-003, SEC-044]

### 12. Orders (1)
- `REQ-ORD-009`: **Packing slip and printable legal invoice generation with tax breakdown**  
  *AC:* Orders workbench generates downloadable and printable packing slips and tax invoices displaying sequential invoice numbers, store GSTIN, customer details, HSN codes, and itemized taxes. [TC-ORD-001, SEC-020]

### 13. Finance (7)
- `REQ-PAY-004`: **Immutable double-entry financial ledger recording transactions in integer minor units**  
  *AC:* All financial transactions (payments, refunds, deposits, fees) write immutable debit and credit ledger rows using integer minor units (paise/cents), preventing floating point rounding errors. [TC-PAY-001, SEC-024]
- `REQ-PAY-005`: **Sequential tax invoice generation with compliant GST breakdown and legal identifiers**  
  *AC:* Invoices assign gapless sequential identifiers per store and financial year, itemizing CGST, SGST, IGST amounts, SAC/HSN codes, and merchant registered business address. [TC-PAY-001, SEC-024]
- `REQ-PAY-006`: **Split payment processing at POS across multiple tenders**  
  *AC:* POS checkout supports split payments across cash, card, and UPI tenders. The transaction commits only when the exact sum of all tender allocations equals the gross payable order total. [TC-POS-005, SEC-024]
- `REQ-PAY-007`: **Automated payment gateway settlement reconciliation identifying discrepancies**  
  *AC:* Finance engine ingests payment gateway settlement batches, matches transactions to internal order IDs, and flags fee variances or missing transfers in a settlement discrepancy report. [TC-PAY-002, SEC-024]
- `REQ-PAY-008`: **Partial and full refund execution bounded strictly by captured transaction amount**  
  *AC:* Refund processing validates that the cumulative refunded amount across all refund requests for an order never exceeds the original settled captured transaction amount. [TC-RET-003, SEC-030]
- `REQ-PAY-009`: **Tax calculation engine supporting GST slabs inclusive/exclusive pricing and HSN codes**  
  *AC:* Tax engine computes applicable tax lines based on customer location (intrastate vs interstate), product tax classification, and supports both tax-inclusive and tax-exclusive catalog pricing. [TC-PAY-001, SEC-024]
- `REQ-PAY-010`: **Cash drawer cash-in and cash-out tracking with shift reconciliation and variance logging**  
  *AC:* Register cash movements (pay-in, pay-out, cash drops) are logged with cashier ID and reason. Shift closure computes expected drawer cash and records positive or negative variance. [TC-POS-006, SEC-031]

### 14. POS (12)
- `REQ-POS-012`: **Quick barcode scanning and real-time item lookup with variant matching**  
  *AC:* POS search interface supports hardware USB/Bluetooth barcode scanners and camera input, instantly matching scanned EAN/UPC/SKU codes to exact variants and adding them to the active cart. [TC-POS-001, SEC-031]
- `REQ-POS-013`: **Custom line items price overrides and discount reasons requiring manager authorization**  
  *AC:* Applying cart-level discounts exceeding staff limits or modifying line prices prompts for manager PIN authorization, logging the manager approval ID and reason in the audit ledger. [TC-POS-002, SEC-031]
- `REQ-POS-016`: **X-Report mid-shift snapshot generation and Z-Report end-of-day register closure report**  
  *AC:* Cashiers can generate X-Reports (non-resetting mid-shift sales summary) and supervisors can generate Z-Reports (closing register session, locking drawer transactions, and computing net variance). [TC-POS-006, SEC-031]
- `REQ-POS-017`: **Cash drawer cash-in and cash-out operations with explicit reason and audit log**  
  *AC:* Petty cash payouts or mid-day cash float additions require cashiers to specify category and justification, updating register cash on hand and emitting financial audit events. [TC-POS-006, SEC-031]
- `REQ-POS-018`: **Thermal receipt printing via ESC/POS and digital receipt dispatch via email/SMS**  
  *AC:* POS supports direct printing to standard ESC/POS 58mm/80mm thermal receipt printers, with options to instantly dispatch digital e-receipts to customer email or mobile number. [TC-POS-001, SEC-031]
- `REQ-POS-020`: **Held bill saving and resumption with re-validation of pricing stock and promotions**  
  *AC:* Cashiers can put active cart sessions on hold to serve other customers. Resuming a held bill re-verifies current inventory availability and active promotions before allowing payment. [TC-POS-004, SEC-031]
- `REQ-POS-021`: **Offline cash transaction queue in IndexedDB with cryptographic integrity checks**  
  *AC:* In offline mode, POS stores cash sales in encrypted client IndexedDB with client-generated UUIDs, device signing, and temporary local receipt generation within authorized lease limits. [TC-POS-008, SEC-032]
- `REQ-POS-022`: **Offline-to-online transaction reconciliation resolving inventory variances**  
  *AC:* When connectivity resumes, queued offline sales sync idempotently to the server. The server commits valid orders, updates stock, and flags any inventory oversell conflicts for manager review. [TC-POS-008, SEC-032]
- `REQ-POS-023`: **Counter hardware device pairing and peripheral management**  
  *AC:* Merchant Admin POS & Counters interface allows registering physical terminals, configuring attached peripherals (barcode scanner, receipt printer, cash drawer kick), and assigning default counters. [TC-POS-001, SEC-031]
- `REQ-POS-026`: **Restaurant table management with visual floor plan table status and order linking**  
  *AC:* When restaurant capability is enabled, POS provides an interactive table layout showing real-time occupancy (vacant, seated, billed) and links diner orders directly to specific tables. [TC-POS-024, SEC-031]
- `REQ-POS-027`: **Kitchen Order Ticket KOT generation and routing to designated kitchen display stations**  
  *AC:* Table and takeaway food orders generate versioned Kitchen Order Tickets (KOT) routed to specific kitchen stations (hot kitchen, bar, dessert) with preparation status tracking. [TC-POS-025, SEC-031]
- `REQ-POS-028`: **Bill splitting by item or by equal guest shares with independent tender recording**  
  *AC:* Restaurant POS supports splitting table bills either evenly across N diners or item-by-item across multiple independent receipts, requiring all split balances to clear before table closure. [TC-POS-005, SEC-031]

### 15. Release (4)
- `REQ-REL-003`: **Pre-release automated test verification gate requiring 100% passage of P0/P1 suites**  
  *AC:* Release pipeline automatically validates that all P0 and P1 automated functional test cases, security scans, and database migrations succeed with zero unapproved failures before deployment. [TC-REL-001, SEC-046]
- `REQ-REL-004`: **Automated application code and route rollback verification**  
  *AC:* Deployment automation includes tested rollback recipes capable of reverting container images and traffic routing to the prior verified release within 60 seconds of health check failure. [TC-REL-001, SEC-046]
- `REQ-REL-005`: **Expand-contract database migration strategy ensuring dual schema read/write compatibility**  
  *AC:* Schema migrations adhere to the expand-and-contract pattern (adding nullable columns or views first), ensuring both new and old application instances run concurrently without downtime. [TC-REL-002, SEC-046]
- `REQ-REL-006`: **Staged canary traffic deployment with automated health check threshold triggers**  
  *AC:* Production releases route 5% of traffic to canary instances, monitoring HTTP error rate and p99 latency against baseline before progressing to 100% rollout or triggering automated abort. [TC-REL-001, SEC-046]

### 16. Returns (6)
- `REQ-RET-004`: **Return Merchandise Authorization RMA request workflow with policy-enforced return windows**  
  *AC:* Customers or staff can initiate RMA requests only for items within the merchant-defined return window (e.g. 15 days from delivery), verifying item eligibility and original invoice state. [TC-RET-001, SEC-022]
- `REQ-RET-005`: **Customer return reason logging and mandatory condition photo attachments**  
  *AC:* Return requests record standardized return reason codes (defective, wrong item, size mismatch) and support customer photo uploads documenting packaging and item condition. [TC-RET-001, SEC-022]
- `REQ-RET-006`: **Physical goods receipt inspection workflow categorizing items into sellable or damaged**  
  *AC:* Warehouse staff inspect returned physical packages upon receipt, recording disposition status (sellable condition, damaged packaging, or customer damaged scrap) before restocking. [TC-RET-002, SEC-022]
- `REQ-RET-007`: **Restock inventory adjustment creating verified stock movements only for approved items**  
  *AC:* Restocking returned items increments location inventory balances and writes an audit stock movement record only when the item is explicitly certified as sellable by inspection staff. [TC-RET-002, SEC-022]
- `REQ-RET-008`: **Return shipping reverse-logistics label generation and tracking via Shiprocket**  
  *AC:* Approved RMA requests can generate carrier reverse-pickup manifests and tracking labels through Shiprocket integration, updating order return timeline upon carrier pickup. [TC-RET-001, SEC-022]
- `REQ-RET-009`: **Restocking fee calculation and shipping fee deduction from final refund balance**  
  *AC:* Return financial calculation permits deducting configured restocking fees or original shipping charges from customer refund totals, updating refund ledger entries accurately. [TC-RET-003, SEC-022]

### 17. Realtime (6)
- `REQ-RT-003`: **WebSocket connection authentication via short-lived JWT token verifying tenant membership**  
  *AC:* Realtime WebSocket connections require a cryptographically valid short-lived ticket token in the handshake, rejecting unauthenticated or cross-tenant subscription requests. [TC-RT-001, SEC-043]
- `REQ-RT-004`: **Topic-based publish subscribe scoping events to authorized tenant store and location channels**  
  *AC:* Connected clients subscribe only to authorized channels (e.g. `store:orders`, `counter:kots`, `location:inventory`). Broadcasts never cross tenant or location authorization boundaries. [TC-RT-001, SEC-043]
- `REQ-RT-005`: **Event sequence ordering and cursor-based historical event replay for reconnected clients**  
  *AC:* Realtime events include monotonically increasing sequence numbers. Reconnecting clients pass their last-seen cursor, receiving missed events from the replay buffer without data loss. [TC-RT-002, SEC-043]
- `REQ-RT-006`: **Server-Sent Events fallback transport when WebSocket upgrades are blocked**  
  *AC:* If WebSocket upgrades are blocked by client corporate proxies or firewalls, realtime client automatically falls back to HTTP Server-Sent Events (SSE) maintaining live event updates. [TC-RT-001, SEC-043]
- `REQ-RT-007`: **Bi-directional heartbeat keep-alive with client reconnection backoff jitter**  
  *AC:* Realtime gateway exchanges ping/pong heartbeats every 30 seconds. Disconnected clients reconnect using exponential backoff with full random jitter to prevent server thundering herds. [TC-RT-001, SEC-043]
- `REQ-RT-008`: **Real-time broadcast throttling preventing client flooding during sales bursts**  
  *AC:* Gateway aggregates and coalesces rapid bulk events (e.g. inventory adjustments) into 100ms throttle windows, preventing client browser render freezing during flash sale volume. [TC-RT-001, SEC-043]

### 18. Fulfillment (4)
- `REQ-SHP-003`: **Multi-location fulfillment routing selecting optimal warehouse location by stock availability**  
  *AC:* Fulfillment engine automatically routes order line items to the nearest store or warehouse location possessing sufficient available inventory, minimizing transit distance and delivery cost. [TC-SHP-001, SEC-021]
- `REQ-SHP-004`: **Package weight and volumetric dimension calculation determining carrier shipping rates**  
  *AC:* Packaging algorithm aggregates variant weights and dimensions across order items into discrete shipping boxes, calculating chargeable volumetric weight for carrier rate quotes. [TC-SHP-001, SEC-021]
- `REQ-SHP-005`: **Split shipment creation assigning independent tracking numbers and packing slips**  
  *AC:* When an order is fulfilled in multiple consignments from different locations, each partial shipment generates independent carrier tracking numbers, packing slips, and status notifications. [TC-SHP-001, SEC-021]
- `REQ-SHP-006`: **Non-Delivery Report NDR workflow with re-attempt triggers and customer address verification**  
  *AC:* When a carrier reports a delivery failure (NDR), system alerts operations staff, logs the failure reason, and triggers an automated SMS/email to the customer to reconfirm delivery address. [TC-SHP-005, SEC-021]

### 19. Storefront (11)
- `REQ-STORE-007`: **Section registry schema validation for header footer hero product grid and booking widget**  
  *AC:* All Store Editor sections validate against strict JSON schemas defining allowed settings, default props, and typography options, rejecting unknown section definitions or corrupt JSON. [TC-STORE-001, SEC-010]
- `REQ-STORE-008`: **Store Editor theme settings managing color palette typography and logo assets**  
  *AC:* Merchants can configure brand typography font pairings, primary/secondary brand colors (adhering to contrast guidelines), header logo, and favicon in the unified theme inspector. [TC-STORE-001, SEC-010]
- `REQ-STORE-009`: **Interactive page tree supporting page addition deletion renaming and slug editing**  
  *AC:* Store Editor page tree enables adding custom pages, renaming titles, updating URL slugs with uniqueness validation, reordering navigation hierarchy, and setting the default homepage. [TC-STORE-001, SEC-010]
- `REQ-STORE-010`: **Responsive dual-mode viewport preview desktop and mobile with synchronized state**  
  *AC:* Store Editor canvas provides one-click toggling between responsive desktop (1280px) and mobile (375px) viewports with active section selection highlighting and live draft state synchronization. [TC-STORE-001, SEC-010]
- `REQ-STORE-011`: **Undo and redo action stack preserving draft state during active editing session**  
  *AC:* Store Editor maintains an in-memory undo/redo history stack across section modifications, prop adjustments, and section reordering, accessible via standard keyboard shortcuts (Ctrl+Z / Ctrl+Y). [TC-STORE-001, SEC-010]
- `REQ-STORE-015`: **Template gallery preview with category filters and non-destructive template application**  
  *AC:* Merchants can browse pre-built industry templates in a gallery modal, preview them in desktop/mobile viewports, and apply them exclusively to working draft versions without affecting live storefronts. [TC-STORE-001, SEC-010]
- `REQ-STORE-016`: **Version history snapshots allowing merchants to inspect and revert to previous releases**  
  *AC:* Every atomic store publication creates an immutable version snapshot. Merchants can review the release history log and revert to any historical version with one click. [TC-STORE-005, SEC-011]
- `REQ-STORE-017`: **Page-level SEO metadata management including title meta description and Open Graph tags**  
  *AC:* Merchants can define custom title tags, meta descriptions, social share preview images (Open Graph), and canonical URLs per page, rendering valid HTML tags on public storefront routes. [TC-STORE-001, SEC-010]
- `REQ-STORE-018`: **Storefront custom CSS and theme override sandbox preventing script injection**  
  *AC:* Merchant custom CSS inputs are sanitized using strict AST parsing to strip JavaScript expressions (`expression()`, `behavior:url()`), preventing cross-site scripting vulnerabilities. [TC-STORE-001, SEC-010]
- `REQ-STORE-019`: **Storefront performance optimization ensuring sub-second first contentful paint**  
  *AC:* Public storefront pages serve pre-rendered HTML shells with optimized image formats (WebP), asset caching headers, and lazy-loaded offscreen sections, achieving sub-second FCP on broadband. [TC-STORE-001, SEC-010]
- `REQ-STORE-020`: **Custom domain mapping with automated SSL certificate provisioning status reporting**  
  *AC:* Merchants configuring custom domains (e.g. `store.custombrand.com`) receive required CNAME and TXT verification records, and can monitor automated Let's Encrypt SSL certificate provisioning status. [TC-EXP-031, SEC-064]

### 20. Team (4)
- `REQ-TEAM-009`: **Granular permission definition and evaluation engine enforcing discrete privileges**  
  *AC:* Authorization middleware evaluates granular permissions (`products:create`, `orders:refund`, `register:open`, `staff:invite`) across API routes and Admin UI navigation links based on assigned roles. [TC-TEAM-001, SEC-005]
- `REQ-TEAM-010`: **Team member invitation email dispatch with time-bounded secure acceptance token**  
  *AC:* Inviting new staff members generates a single-use cryptographically random token expiring in 7 days, sending an invitation email that allows the invitee to establish credentials and join the organization. [TC-TEAM-005, SEC-005]
- `REQ-TEAM-011`: **Multi-location assignment matrix restricting staff operational visibility to designated branches**  
  *AC:* Staff members assigned to specific physical store locations or POS counters are strictly blocked from viewing or executing transactions across unassigned branch locations. [TC-TEAM-002, SEC-005]
- `REQ-TEAM-012`: **Comprehensive team member audit trail logging role modifications and access changes**  
  *AC:* All team management operations (role assignment, permission adjustments, location access changes, staff suspensions, PIN resets) emit immutable records to the security audit trail. [TC-TEAM-006, SEC-006]

---

## Traceability & Verification
All 125 refined rows are persisted in `management/requirements.csv`. Verification test `TC-EXP-048` passes with zero generic placeholders remaining.
Task `T-062` is marked `VERIFIED`.

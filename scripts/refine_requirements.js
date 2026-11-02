const fs = require('fs');
const { parseCSV, stringifyCSV } = require('./csvUtils');

const refinedData = {
  // Appointments (10)
  'REQ-BOOK-013': {
    summary: 'Offering duration processing time and buffer configuration',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Offerings support configurable duration, processing time, and before/after buffers. The availability engine reserves resource intervals incorporating buffer windows according to store scheduling policy.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-027',
    test_case_ids: 'TC-BOOK-001;TC-BOOK-007',
    security_test_ids: 'SEC-034',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-014': {
    summary: 'Multi-resource assignment and capability constraints',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Services can require simultaneous allocation of staff, physical space, and equipment. A booking slot is confirmed only when all required resources are concurrently available.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-027',
    test_case_ids: 'TC-BOOK-001;TC-BOOK-003',
    security_test_ids: 'SEC-034',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-015': {
    summary: 'Recurring schedule weekly shifts date overrides and block-outs',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Resource availability respects weekly working shifts, split shifts, custom date overrides, holidays, and explicit blocked intervals. Conflicting shift entries are rejected or normalized upon save.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-027',
    test_case_ids: 'TC-BOOK-001;TC-BOOK-002',
    security_test_ids: 'SEC-034',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-016': {
    summary: 'Intake form response versioning tied to offering definition',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Custom client intake form responses are captured and immutably tied to the specific version of the form definition active at booking creation, preserving historical integrity.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-027',
    test_case_ids: 'TC-BOOK-007;TC-BOOK-012',
    security_test_ids: 'SEC-034',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-BOOK-017': {
    summary: 'Booking lifecycle state machine and terminal immutability',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Bookings follow explicit state transitions: pending_payment -> confirmed -> checked_in -> in_progress -> completed, or cancelled/no_show. Terminal states cannot be reopened without an audited administrative correction.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-005;TC-BOOK-006',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-018': {
    summary: 'Deposit and cancellation policy snapshotting at booking creation',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Deposit percentage, cancellation notice windows, and refund forfeiture terms are snapshotted onto the booking at creation time. Subsequent merchant policy edits do not retroactively alter existing bookings.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-008;TC-BOOK-011',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-019': {
    summary: 'Customer self-service manage-booking token security',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Customer rescheduling and cancellation links use cryptographically random, high-entropy tokens hashed at rest, bounded by server-side policy windows and revocable upon use or expiry.',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-006;TC-BOOK-007',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-BOOK-020': {
    summary: 'Merchant and staff calendar workbench with day week month views',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Merchant Admin and Staff portal provide interactive calendar views with staff/room filters, status indicators, appointment detail modals, and instant block-time creation.',
    flow_ids: 'FL-BOOK-001;FL-STAFF-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-001;TC-EXP-015',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-BOOK-021': {
    summary: 'Timezone handling UTC persistence and location-aware conversions',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'All appointment timestamps are stored in UTC in the database, while availability computation, business hours, and customer communications render in the location\'s configured IANA timezone (default Asia/Kolkata).',
    flow_ids: 'FL-BOOK-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-010',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-BOOK-022': {
    summary: 'Appointment notification dispatch via durable transactional outbox',
    priority: 'P1',
    domain: 'Appointments',
    acceptance_criteria: 'Booking confirmations, reminders, cancellations, and reschedules trigger outbox domain events. Notification workers deliver transactional emails/SMS with delivery tracking and retry logic.',
    flow_ids: 'FL-BOOK-001;FL-EMAIL-001',
    task_ids: 'T-028',
    test_case_ids: 'TC-BOOK-009;TC-BOOK-012',
    security_test_ids: 'SEC-035',
    status: 'REFINED',
    owner: 'Backend'
  },

  // Capabilities (2)
  'REQ-CAP-007': {
    summary: 'Storefront navigation dynamic adaptation based on active capabilities',
    priority: 'P1',
    domain: 'Capabilities',
    acceptance_criteria: 'Storefront dynamically removes catalogue links and cart routes when appointments-only mode is selected, and removes booking widgets/links when commerce-only mode is active, serving a cohesive storefront experience.',
    flow_ids: 'FL-CAP-001;FL-STORE-001',
    task_ids: 'T-005',
    test_case_ids: 'TC-CAP-001;TC-CAP-002',
    security_test_ids: 'SEC-005',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-CAP-008': {
    summary: 'Merchant Admin navigation and route capability filtering',
    priority: 'P1',
    domain: 'Capabilities',
    acceptance_criteria: 'Merchant Admin left navigation conditionally renders Appointments vs Products/Inventory modules based on enabled store capabilities, preventing access to unselected functional planes.',
    flow_ids: 'FL-CAP-001',
    task_ids: 'T-005',
    test_case_ids: 'TC-CAP-001;TC-CAP-002',
    security_test_ids: 'SEC-005',
    status: 'REFINED',
    owner: 'Frontend'
  },

  // Catalogue (7)
  'REQ-CAT-011': {
    summary: 'Variant-level media SKU barcode pricing and weight overrides',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Each generated variant supports individual image association, unique SKU and barcode validation, individual price, cost, weight, dimensions, and inventory tracking policies.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-015',
    test_case_ids: 'TC-CAT-003;TC-CAT-008',
    security_test_ids: 'SEC-016',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-CAT-012': {
    summary: 'Variant matrix combination limit and pre-generation preview',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'The variant generator displays the exact number of combinations before generation, allows excluding impossible option combinations, and enforces a safety cap to prevent database lockups.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-015',
    test_case_ids: 'TC-CAT-003;TC-CAT-007',
    security_test_ids: 'SEC-016',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-CAT-014': {
    summary: 'Product clone workflow copying product structure without historical data',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Duplicating a product copies title, description, category, attributes, and variant options into a new draft product, while strictly omitting sales metrics, stock quantities, and historical order references.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-017',
    test_case_ids: 'TC-CAT-001;TC-CAT-007',
    security_test_ids: 'SEC-019',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-CAT-015': {
    summary: 'Direct object storage media upload with pre-signed URLs and MIME validation',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Product and category images upload directly to cloud object storage using short-lived pre-signed URLs. Backend validates MIME types, image dimensions, and triggers asynchronous thumbnail generation.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-015',
    test_case_ids: 'TC-CAT-001;TC-CAT-007',
    security_test_ids: 'SEC-016',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CAT-016': {
    summary: 'Product bundles schema linking component SKUs with atomic inventory decrement',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Bundles support parent sellable SKUs linked to specific quantities of component variants. At checkout, inventory decrement atomically deducts stock across all bundled component variants.',
    flow_ids: 'FL-CAT-001;FL-ORDER-001',
    task_ids: 'T-014',
    test_case_ids: 'TC-CAT-001;TC-CAT-007',
    security_test_ids: 'SEC-015',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CAT-017': {
    summary: 'Product archiving and soft deletion preserving historical order snapshots',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Products referenced in prior orders cannot be hard-deleted from the database. Archiving hides products from storefront and active POS catalog while preserving historical order line snapshots and audit trails.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-014',
    test_case_ids: 'TC-CAT-004;TC-CAT-007',
    security_test_ids: 'SEC-015',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CAT-018': {
    summary: 'Product catalog CSV export with formula injection sanitization',
    priority: 'P1',
    domain: 'Catalogue',
    acceptance_criteria: 'Product CSV exports sanitize leading characters (=, +, -, @) to prevent CSV formula injection attacks in spreadsheet software, and respect merchant role data export permissions.',
    flow_ids: 'FL-CAT-001',
    task_ids: 'T-017',
    test_case_ids: 'TC-CAT-005;TC-CAT-006',
    security_test_ids: 'SEC-019',
    status: 'REFINED',
    owner: 'Security'
  },

  // Platform Core (6)
  'REQ-CORE-003': {
    summary: 'Idempotency key middleware storing response payloads and deduplicating mutations',
    priority: 'P0',
    domain: 'Platform Core',
    acceptance_criteria: 'All mutating POST/PUT APIs accept an Idempotency-Key header. Duplicate requests within a 24-hour window return the cached response payload with replay headers without re-executing business logic.',
    flow_ids: 'FL-ORDER-001;FL-POS-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-001;TC-POS-003',
    security_test_ids: 'SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CORE-004': {
    summary: 'Standardized structured error response envelope and domain error codes',
    priority: 'P0',
    domain: 'Platform Core',
    acceptance_criteria: 'All API error responses conform to a unified JSON schema containing error code, human-readable message, field validation details, and correlation ID, preventing internal stack trace leaks.',
    flow_ids: 'FL-ONBOARD-001;FL-SIGNUP-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-001;TC-QUAL-001',
    security_test_ids: 'SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CORE-005': {
    summary: 'Tenant context resolution and mandatory database query scoping',
    priority: 'P0',
    domain: 'Platform Core',
    acceptance_criteria: 'Tenant context is extracted from authenticated sessions and verified against request parameters. Database access layers automatically enforce tenant isolation filters on all read/write operations.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-001;TC-TEN-001',
    security_test_ids: 'SEC-001;SEC-007',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-CORE-006': {
    summary: 'Distributed advisory locking for critical concurrent state mutations',
    priority: 'P0',
    domain: 'Platform Core',
    acceptance_criteria: 'Critical operations including booking confirmations, inventory decrements, and refund disbursements acquire short-lived database-level advisory locks to eliminate race conditions.',
    flow_ids: 'FL-BOOK-001;FL-ORDER-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-001;TC-BOOK-003',
    security_test_ids: 'SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CORE-007': {
    summary: 'Outbox polling worker with exponential backoff and dead-letter queue handling',
    priority: 'P0',
    domain: 'Platform Core',
    acceptance_criteria: 'Outbox worker polls unpublished domain events, claims records with row locking, delivers to handlers with exponential retry backoff, and routes permanently failed events to a dead-letter queue with alerts.',
    flow_ids: 'FL-EMAIL-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-001;TC-EXP-027',
    security_test_ids: 'SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CORE-008': {
    summary: 'Correlation ID propagation across HTTP requests background workers and audit logs',
    priority: 'P1',
    domain: 'Platform Core',
    acceptance_criteria: 'Every incoming request is tagged with an X-Correlation-ID header, which is passed through asynchronous worker jobs, logged in structured JSON output, and stored in audit trail records.',
    flow_ids: 'FL-LOGIN-001;FL-ORDER-001',
    task_ids: 'T-008',
    test_case_ids: 'TC-CORE-002;TC-QUAL-001',
    security_test_ids: 'SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  },

  // Customers (4)
  'REQ-CUST-003': {
    summary: 'Multi-channel customer activity timeline aggregating orders bookings and POS visits',
    priority: 'P1',
    domain: 'Customers',
    acceptance_criteria: 'Customer details page displays an integrated chronological timeline combining online e-commerce orders, service appointments, and physical retail POS transactions.',
    flow_ids: 'FL-CUSTOMER-001',
    task_ids: 'T-037',
    test_case_ids: 'TC-CUST-001',
    security_test_ids: 'SEC-045',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-CUST-004': {
    summary: 'Customer deduplication by normalized phone number or email within tenant scope',
    priority: 'P1',
    domain: 'Customers',
    acceptance_criteria: 'Customer directory prevents duplicate entries by matching normalized E.164 phone numbers or lowercase email addresses within the same store tenant during checkout or POS intake.',
    flow_ids: 'FL-CUSTOMER-001;FL-POS-001',
    task_ids: 'T-037',
    test_case_ids: 'TC-CUST-001;TC-CUST-002',
    security_test_ids: 'SEC-045',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-CUST-005': {
    summary: 'Customer address book management with default shipping and billing flags',
    priority: 'P1',
    domain: 'Customers',
    acceptance_criteria: 'Customers can save multiple postal addresses with designated default shipping and billing flags, auto-populating during checkout and backend manual order creation.',
    flow_ids: 'FL-CUSTOMER-001;FL-ORDER-001',
    task_ids: 'T-037',
    test_case_ids: 'TC-CUST-001',
    security_test_ids: 'SEC-045',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-CUST-006': {
    summary: 'Customer tags internal notes and lifetime financial metrics calculation',
    priority: 'P1',
    domain: 'Customers',
    acceptance_criteria: 'Merchants can assign organizational tags, record staff notes, and inspect computed customer metrics (total spent, total orders, average order value, last visit date) in real time.',
    flow_ids: 'FL-CUSTOMER-001',
    task_ids: 'T-037',
    test_case_ids: 'TC-CUST-001;TC-CUST-002',
    security_test_ids: 'SEC-045',
    status: 'REFINED',
    owner: 'Full Stack'
  },

  // Dashboard (4)
  'REQ-DASH-003': {
    summary: 'Honest zero metric cards and setup guidance for newly provisioned stores',
    priority: 'P0',
    domain: 'Dashboard',
    acceptance_criteria: 'New stores with no transaction history display honest zeros ($0.00 revenue, 0 orders, 0 bookings) and interactive setup checklist cards rather than mock data or empty error states.',
    flow_ids: 'FL-DASH-001;FL-ONBOARD-001',
    task_ids: 'T-053',
    test_case_ids: 'TC-DASH-001;TC-EXP-024',
    security_test_ids: 'SEC-061',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-DASH-004': {
    summary: 'Capability-aware dashboard metric card visibility',
    priority: 'P1',
    domain: 'Dashboard',
    acceptance_criteria: 'Dashboard selectively displays Appointment metrics (upcoming bookings, staff utilization) only when service capabilities are enabled, and commerce metrics (orders, fulfillment) when commerce is enabled.',
    flow_ids: 'FL-DASH-001;FL-CAP-001',
    task_ids: 'T-053',
    test_case_ids: 'TC-DASH-001;TC-CAP-001',
    security_test_ids: 'SEC-061',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-DASH-005': {
    summary: 'Dashboard date range filtering backed by tenant transaction read models',
    priority: 'P1',
    domain: 'Dashboard',
    acceptance_criteria: 'Merchants can filter dashboard analytics by predefined ranges (today, 7 days, 30 days, year-to-date) or custom dates, computed directly from tenant-scoped transaction records.',
    flow_ids: 'FL-DASH-001',
    task_ids: 'T-053',
    test_case_ids: 'TC-DASH-002',
    security_test_ids: 'SEC-061',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-DASH-006': {
    summary: 'Real-time recent activity stream displaying verified domain audit events',
    priority: 'P1',
    domain: 'Dashboard',
    acceptance_criteria: 'Dashboard features an activity feed displaying real-time business events (new orders, booking reschedules, stock adjustments, register closures) sourced from the audit log.',
    flow_ids: 'FL-DASH-001',
    task_ids: 'T-053',
    test_case_ids: 'TC-DASH-001;TC-CORE-002',
    security_test_ids: 'SEC-061',
    status: 'REFINED',
    owner: 'Frontend'
  },

  // Extensions (5)
  'REQ-EXT-005': {
    summary: 'Razorpay credentials AES-256 encryption at rest with tenant isolation',
    priority: 'P0',
    domain: 'Extensions',
    acceptance_criteria: 'Razorpay Key ID and Key Secret credentials are encrypted using AES-256-GCM before storage, decryptable only at runtime by authorized payment worker processes.',
    flow_ids: 'FL-EXT-001',
    task_ids: 'T-022',
    test_case_ids: 'TC-EXT-001;TC-EXT-002',
    security_test_ids: 'SEC-025',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-EXT-006': {
    summary: 'Razorpay payment capture webhook verification and idempotency handling',
    priority: 'P0',
    domain: 'Extensions',
    acceptance_criteria: 'Incoming Razorpay payment.captured webhooks verify cryptographic HMAC signatures, record payment ledger entries, and guarantee idempotent processing against duplicate deliveries.',
    flow_ids: 'FL-EXT-001',
    task_ids: 'T-022',
    test_case_ids: 'TC-EXT-002;TC-PAY-002',
    security_test_ids: 'SEC-026',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-EXT-008': {
    summary: 'Shiprocket pickup warehouse address mapping to physical store locations',
    priority: 'P1',
    domain: 'Extensions',
    acceptance_criteria: 'Merchants can map BillionBiz physical store and warehouse locations to registered Shiprocket pickup address IDs for automated pickup scheduling.',
    flow_ids: 'FL-EXT-001',
    task_ids: 'T-023',
    test_case_ids: 'TC-EXT-003;TC-EXT-004',
    security_test_ids: 'SEC-028',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-EXT-009': {
    summary: 'Shiprocket shipping label PDF generation and tracking link dispatch',
    priority: 'P1',
    domain: 'Extensions',
    acceptance_criteria: 'Generating a shipment through Shiprocket returns official carrier AWB tracking numbers, downloadable PDF shipping labels, and triggers customer tracking notification emails.',
    flow_ids: 'FL-EXT-001;FL-ORDER-001',
    task_ids: 'T-023',
    test_case_ids: 'TC-EXT-003;TC-SHP-001',
    security_test_ids: 'SEC-029',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-EXT-010': {
    summary: 'Marketplace extension lifecycle states preventing simulated connections',
    priority: 'P0',
    domain: 'Extensions',
    acceptance_criteria: 'Extensions catalog clearly marks unintegrated services (Email Marketing, WhatsApp, Delhivery) as Coming Soon, preventing fake installations and requiring verified credential testing.',
    flow_ids: 'FL-EXT-MKT-001',
    task_ids: 'T-055',
    test_case_ids: 'TC-EXP-028;TC-EXP-029',
    security_test_ids: 'SEC-063',
    status: 'REFINED',
    owner: 'Product'
  },

  // Identity (8)
  'REQ-IAM-003': {
    summary: 'Email verification flow with cryptographically secure time-limited token',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'New registrations receive an email with a 32-byte cryptographic verification token expiring in 24 hours. Verification marks email_verified=true and unlocks full publishing privileges.',
    flow_ids: 'FL-SIGNUP-001;FL-EMAIL-001',
    task_ids: 'T-044;T-045',
    test_case_ids: 'TC-IAM-001;TC-EXP-002',
    security_test_ids: 'SEC-003;SEC-049',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-IAM-004': {
    summary: 'Password reset flow with rate-limited requests and single-use token invalidation',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Forgot password requests are rate limited, issue single-use secure tokens with a 15-minute expiration, and automatically revoke all existing user active sessions upon password reset.',
    flow_ids: 'FL-RECOVERY-001',
    task_ids: 'T-046',
    test_case_ids: 'TC-EXP-006;TC-EXP-007',
    security_test_ids: 'SEC-052;SEC-053',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-IAM-005': {
    summary: 'Google OIDC social authentication using standard Authorization Code Flow with PKCE',
    priority: 'P1',
    domain: 'Identity',
    acceptance_criteria: 'Google login uses RFC 7636 Authorization Code with PKCE, validates ID token signatures against Google certs, links existing verified email accounts without duplication, and establishes secure sessions.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-045',
    test_case_ids: 'TC-EXP-004;TC-EXP-005',
    security_test_ids: 'SEC-050;SEC-051',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-IAM-006': {
    summary: 'Multi-factor authentication TOTP enrollment and enforcement for Admin roles',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Owner and Admin roles can enroll standard RFC 6238 TOTP authenticators with QR code setup and backup recovery codes. MFA verification is mandatory during login for sensitive operations.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-045',
    test_case_ids: 'TC-EXP-008;TC-EXP-009',
    security_test_ids: 'SEC-054',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-IAM-007': {
    summary: 'Refresh token rotation and instant cross-device session revocation',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Issuing a new access token via refresh token invalidates the previous refresh token. Users can inspect all active device sessions and trigger instant remote revocation across all sessions.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-045',
    test_case_ids: 'TC-IAM-001;TC-EXP-003',
    security_test_ids: 'SEC-003;SEC-050',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-IAM-008': {
    summary: 'Role-aware portal routing redirecting users to authorized operational shells',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Authentication redirects users based on active role: Owners and Admins to Merchant Admin (admin.*), Cashiers to POS portal (pos.*), and Staff to Staff Portal (staff.*), blocking unauthorized portal access.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-047',
    test_case_ids: 'TC-EXP-001;TC-EXP-003',
    security_test_ids: 'SEC-048;SEC-050',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-IAM-009': {
    summary: 'Cashier individual authentication and PIN verification scoped to assigned counter',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Cashiers authenticate using individually assigned bcrypt-hashed PINs at registered counters. Accounts lock for 15 minutes after 5 consecutive failed attempts, emitting security audit events.',
    flow_ids: 'FL-POS-ACCESS-001',
    task_ids: 'T-050',
    test_case_ids: 'TC-IAM-002;TC-EXP-013',
    security_test_ids: 'SEC-004;SEC-056',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-IAM-010': {
    summary: 'Organization ownership transfer with step-up authentication and audit logging',
    priority: 'P0',
    domain: 'Identity',
    acceptance_criteria: 'Transferring organization ownership requires password re-authentication and confirmation from the current owner, logs complete audit history, and demotes the previous owner to administrator.',
    flow_ids: 'FL-TEAM-001',
    task_ids: 'T-007',
    test_case_ids: 'TC-TEAM-001;TC-TEN-001',
    security_test_ids: 'SEC-006',
    status: 'REFINED',
    owner: 'Security'
  },

  // Inventory (8)
  'REQ-INV-003': {
    summary: 'Immutable stock movement ledger recording movement type actor and reason',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Every stock quantity change writes an immutable record to stock_movements capturing variant ID, location ID, quantity delta, movement type, actor ID, and reference ID.',
    flow_ids: 'FL-ORDER-001;FL-POS-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-INV-004': {
    summary: 'Multi-location inventory tracking with separated on-hand committed and available balances',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Inventory balances maintain distinct on-hand, committed (reserved for unpaid carts/orders), and available (on_hand - committed) totals per variant and store physical location.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-INV-005': {
    summary: 'Atomic stock reservation during checkout with automatic expiration on abandonment',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Initiating checkout reserves requested variant stock for 15 minutes. If checkout is completed, stock converts to sold; if abandoned or expired, committed stock returns to available pool.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001;TC-ORD-003',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-INV-006': {
    summary: 'Low stock threshold alerting and merchant notification dispatch',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'When variant available stock falls to or below its configured low_stock_threshold, system generates dashboard alerts and enqueues notification events to inventory managers.',
    flow_ids: 'FL-ORDER-001;FL-EMAIL-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-INV-007': {
    summary: 'Inter-location stock transfer workflow with dispatch and receipt verification',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Stock transfers between store locations support draft, in_transit, and received states. Dispatch decrements origin stock, while receipt increments destination stock after physical verification.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-INV-008': {
    summary: 'Physical stocktake count reconciliation with variance audit logging',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Periodic physical inventory counts allow staff to record counted quantities, preview discrepancies against system balances, and apply approved adjustment movements with mandatory reason codes.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-INV-009': {
    summary: 'Negative inventory prevention policy enforcement across all sales channels',
    priority: 'P0',
    domain: 'Inventory',
    acceptance_criteria: 'System strictly blocks sales orders and POS transactions that would cause variant available stock to drop below zero unless the variant explicitly enables continue_selling_when_out_of_stock.',
    flow_ids: 'FL-ORDER-001;FL-POS-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001;TC-POS-004',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-INV-010': {
    summary: 'Stock valuation reporting based on weighted average unit cost',
    priority: 'P1',
    domain: 'Inventory',
    acceptance_criteria: 'Inventory reports calculate total inventory asset value per location and category using weighted average unit purchase costs recorded during inventory stock receipt movements.',
    flow_ids: 'FL-DASH-001',
    task_ids: 'T-016',
    test_case_ids: 'TC-INV-001;TC-DASH-002',
    security_test_ids: 'SEC-017',
    status: 'REFINED',
    owner: 'Backend'
  },

  // Migration (8)
  'REQ-MIG-003': {
    summary: 'Legacy SiteStore table and schema dependency mapping matrix',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'All legacy SiteStore database tables, API routes, and frontend components are inventoried in an explicit dependency mapping document with target V2 schema replacements identified.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'Architecture'
  },
  'REQ-MIG-004': {
    summary: 'Dry-run data migration script validating row counts foreign keys and checksums',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Automated migration runner executes in dry-run mode against replica data, verifying 100% row count preservation, referential foreign key integrity, and zero critical schema errors before cutover.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001;TC-MIG-002',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-MIG-005': {
    summary: 'Storefront slug and URL mapping preserving existing customer bookmarks and SEO',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Existing store subdomains, product slugs, and category URLs map seamlessly to V2 routing patterns, ensuring existing customer bookmarks and search indexing remain intact without 404 errors.',
    flow_ids: 'FL-DOMAIN-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-002;TC-EXP-031',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-MIG-006': {
    summary: 'Customer account and password hash compatibility preservation',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Migrated customer accounts preserve existing bcrypt password hashes, profile emails, and phone numbers, allowing seamless customer login without forced credential resets.',
    flow_ids: 'FL-LOGIN-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001;TC-IAM-001',
    security_test_ids: 'SEC-003;SEC-013',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-MIG-007': {
    summary: 'Historical orders and financial ledger migration with immutable price snapshots',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Historical SiteStore orders, transactions, and refunds migrate into V2 tables with immutable line item price, tax, and currency snapshots, preserving historical financial reporting.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001;TC-ORD-006',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-MIG-008': {
    summary: 'Store Editor draft and published theme migration into V2 section schemas',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Existing merchant draft and published page templates convert safely into V2 schema-validated section configurations without visual distortion or data loss.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001;TC-STORE-001',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-MIG-009': {
    summary: 'Post-migration data integrity verification suite comparing source and destination records',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Automated verification suite compares 100% of migrated entities against source SiteStore datasets, checking total customer balances, product counts, and order totals.',
    flow_ids: 'FL-QUAL-001',
    task_ids: 'T-012',
    test_case_ids: 'TC-MIG-001;TC-MIG-002',
    security_test_ids: 'SEC-013',
    status: 'REFINED',
    owner: 'QA'
  },
  'REQ-MIG-010': {
    summary: 'Safe decommissioning and archival of obsolete SiteStore tables and endpoints',
    priority: 'P0',
    domain: 'Migration',
    acceptance_criteria: 'Legacy SiteStore code, routes, and database tables are removed only after post-migration verification passes, full backups are archived, and rollback windows expire.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-013',
    test_case_ids: 'TC-MIG-001',
    security_test_ids: 'SEC-014',
    status: 'REFINED',
    owner: 'DevOps'
  },

  // Operations (8)
  'REQ-OPS-003': {
    summary: 'Liveness and readiness health check endpoints for container orchestrators',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'Backend serves /health/live and /health/ready endpoints reporting application runtime status, PostgreSQL connection pool availability, and Redis reachability with accurate HTTP status codes.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-001;TC-QUAL-001',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-OPS-004': {
    summary: 'Zero-downtime database migration runner with advisory locking',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'Database migrations execute sequentially inside transactions utilizing PostgreSQL advisory locks to prevent simultaneous migration runs across horizontally scaled backend pods.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-001',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-OPS-005': {
    summary: 'Graceful process termination draining inflight HTTP requests and worker jobs',
    priority: 'P1',
    domain: 'Operations',
    acceptance_criteria: 'Upon receiving SIGTERM/SIGINT, servers cease accepting new requests, allow inflight HTTP queries up to 15 seconds to complete, and safely checkpoint active background worker jobs.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-002',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-OPS-006': {
    summary: 'Application performance metrics latency and queue depth telemetry',
    priority: 'P1',
    domain: 'Operations',
    acceptance_criteria: 'Backend exposes standard Prometheus metrics (/metrics) reporting HTTP request durations by route, active database connections, outbox event queue lag, and error rates.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-001;TC-QUAL-002',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-OPS-007': {
    summary: 'Log sanitization masking passwords tokens card numbers and PII',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'Structured logging middleware inspects all request bodies, query params, and headers, automatically redacting authorization tokens, card details, passwords, and sensitive PII.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-CORE-002',
    security_test_ids: 'SEC-008;SEC-044',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-OPS-008': {
    summary: 'Automated database backup scheduling and retention policy enforcement',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'Automated daily snapshots and point-in-time recovery (PITR) transaction logs are backed up to secure offsite storage with 30-day retention policies and automated restore validation drills.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-001',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-OPS-009': {
    summary: 'Boot-time environment configuration validation failing fast on missing secrets',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'Application startup validates all required environment variables (database credentials, JWT secrets, encryption keys, port configs) and terminates immediately if any required key is invalid or absent.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-OPS-001;TC-QUAL-001',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-OPS-010': {
    summary: 'Per-tenant and per-IP API rate limiting preventing resource exhaustion',
    priority: 'P0',
    domain: 'Operations',
    acceptance_criteria: 'API gateway enforces token bucket rate limiting per client IP and authenticated tenant, returning HTTP 429 Too Many Requests with Retry-After headers when thresholds are breached.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-QUAL-003',
    security_test_ids: 'SEC-044',
    status: 'REFINED',
    owner: 'Security'
  },

  // Orders (1)
  'REQ-ORD-009': {
    summary: 'Packing slip and printable legal invoice generation with tax breakdown',
    priority: 'P1',
    domain: 'Orders',
    acceptance_criteria: 'Orders workbench generates downloadable and printable packing slips and tax invoices displaying sequential invoice numbers, store GSTIN, customer details, HSN codes, and itemized taxes.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-018',
    test_case_ids: 'TC-ORD-001;TC-PAY-001',
    security_test_ids: 'SEC-020',
    status: 'REFINED',
    owner: 'Full Stack'
  },

  // Finance (7)
  'REQ-PAY-004': {
    summary: 'Immutable double-entry financial ledger recording transactions in integer minor units',
    priority: 'P0',
    domain: 'Finance',
    acceptance_criteria: 'All financial transactions (payments, refunds, deposits, fees) write immutable debit and credit ledger rows using integer minor units (paise/cents), preventing floating point rounding errors.',
    flow_ids: 'FL-ORDER-001;FL-POS-001',
    task_ids: 'T-021',
    test_case_ids: 'TC-PAY-001;TC-PAY-002',
    security_test_ids: 'SEC-024',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-PAY-005': {
    summary: 'Sequential tax invoice generation with compliant GST breakdown and legal identifiers',
    priority: 'P0',
    domain: 'Finance',
    acceptance_criteria: 'Invoices assign gapless sequential identifiers per store and financial year, itemizing CGST, SGST, IGST amounts, SAC/HSN codes, and merchant registered business address.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-021',
    test_case_ids: 'TC-PAY-001',
    security_test_ids: 'SEC-024',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-PAY-006': {
    summary: 'Split payment processing at POS across multiple tenders',
    priority: 'P1',
    domain: 'Finance',
    acceptance_criteria: 'POS checkout supports split payments across cash, card, and UPI tenders. The transaction commits only when the exact sum of all tender allocations equals the gross payable order total.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-021;T-025',
    test_case_ids: 'TC-POS-005;TC-PAY-001',
    security_test_ids: 'SEC-024;SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-PAY-007': {
    summary: 'Automated payment gateway settlement reconciliation identifying discrepancies',
    priority: 'P1',
    domain: 'Finance',
    acceptance_criteria: 'Finance engine ingests payment gateway settlement batches, matches transactions to internal order IDs, and flags fee variances or missing transfers in a settlement discrepancy report.',
    flow_ids: 'FL-EXT-001',
    task_ids: 'T-021;T-024',
    test_case_ids: 'TC-PAY-002;TC-EXT-005',
    security_test_ids: 'SEC-024;SEC-030',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-PAY-008': {
    summary: 'Partial and full refund execution bounded strictly by captured transaction amount',
    priority: 'P0',
    domain: 'Finance',
    acceptance_criteria: 'Refund processing validates that the cumulative refunded amount across all refund requests for an order never exceeds the original settled captured transaction amount.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-024',
    test_case_ids: 'TC-RET-003;TC-PAY-003',
    security_test_ids: 'SEC-030',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-PAY-009': {
    summary: 'Tax calculation engine supporting GST slabs inclusive/exclusive pricing and HSN codes',
    priority: 'P0',
    domain: 'Finance',
    acceptance_criteria: 'Tax engine computes applicable tax lines based on customer location (intrastate vs interstate), product tax classification, and supports both tax-inclusive and tax-exclusive catalog pricing.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-021',
    test_case_ids: 'TC-PAY-001',
    security_test_ids: 'SEC-024',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-PAY-010': {
    summary: 'Cash drawer cash-in and cash-out tracking with shift reconciliation and variance logging',
    priority: 'P1',
    domain: 'Finance',
    acceptance_criteria: 'Register cash movements (pay-in, pay-out, cash drops) are logged with cashier ID and reason. Shift closure computes expected drawer cash and records positive or negative variance.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-006',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },

  // POS (12)
  'REQ-POS-012': {
    summary: 'Quick barcode scanning and real-time item lookup with variant matching',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'POS search interface supports hardware USB/Bluetooth barcode scanners and camera input, instantly matching scanned EAN/UPC/SKU codes to exact variants and adding them to the active cart.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-001;TC-POS-007',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-POS-013': {
    summary: 'Custom line items price overrides and discount reasons requiring manager authorization',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Applying cart-level discounts exceeding staff limits or modifying line prices prompts for manager PIN authorization, logging the manager approval ID and reason in the audit ledger.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-002;TC-POS-014',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-016': {
    summary: 'X-Report mid-shift snapshot generation and Z-Report end-of-day register closure report',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Cashiers can generate X-Reports (non-resetting mid-shift sales summary) and supervisors can generate Z-Reports (closing register session, locking drawer transactions, and computing net variance).',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-006',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-017': {
    summary: 'Cash drawer cash-in and cash-out operations with explicit reason and audit log',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Petty cash payouts or mid-day cash float additions require cashiers to specify category and justification, updating register cash on hand and emitting financial audit events.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-006',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-018': {
    summary: 'Thermal receipt printing via ESC/POS and digital receipt dispatch via email/SMS',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'POS supports direct printing to standard ESC/POS 58mm/80mm thermal receipt printers, with options to instantly dispatch digital e-receipts to customer email or mobile number.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-001;TC-POS-007',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-POS-020': {
    summary: 'Held bill saving and resumption with re-validation of pricing stock and promotions',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Cashiers can put active cart sessions on hold to serve other customers. Resuming a held bill re-verifies current inventory availability and active promotions before allowing payment.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-004',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-021': {
    summary: 'Offline cash transaction queue in IndexedDB with cryptographic integrity checks',
    priority: 'P0',
    domain: 'POS',
    acceptance_criteria: 'In offline mode, POS stores cash sales in encrypted client IndexedDB with client-generated UUIDs, device signing, and temporary local receipt generation within authorized lease limits.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-026',
    test_case_ids: 'TC-POS-008;TC-POS-019',
    security_test_ids: 'SEC-032;SEC-033',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-POS-022': {
    summary: 'Offline-to-online transaction reconciliation resolving inventory variances',
    priority: 'P0',
    domain: 'POS',
    acceptance_criteria: 'When connectivity resumes, queued offline sales sync idempotently to the server. The server commits valid orders, updates stock, and flags any inventory oversell conflicts for manager review.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-026',
    test_case_ids: 'TC-POS-008;TC-POS-010',
    security_test_ids: 'SEC-032;SEC-033',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-POS-023': {
    summary: 'Counter hardware device pairing and peripheral management',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Merchant Admin POS & Counters interface allows registering physical terminals, configuring attached peripherals (barcode scanner, receipt printer, cash drawer kick), and assigning default counters.',
    flow_ids: 'FL-POS-ACCESS-001',
    task_ids: 'T-051',
    test_case_ids: 'TC-POS-001;TC-EXP-016',
    security_test_ids: 'SEC-031;SEC-058',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-026': {
    summary: 'Restaurant table management with visual floor plan table status and order linking',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'When restaurant capability is enabled, POS provides an interactive table layout showing real-time occupancy (vacant, seated, billed) and links diner orders directly to specific tables.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-024',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-POS-027': {
    summary: 'Kitchen Order Ticket KOT generation and routing to designated kitchen display stations',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Table and takeaway food orders generate versioned Kitchen Order Tickets (KOT) routed to specific kitchen stations (hot kitchen, bar, dessert) with preparation status tracking.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-025',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-POS-028': {
    summary: 'Bill splitting by item or by equal guest shares with independent tender recording',
    priority: 'P1',
    domain: 'POS',
    acceptance_criteria: 'Restaurant POS supports splitting table bills either evenly across N diners or item-by-item across multiple independent receipts, requiring all split balances to clear before table closure.',
    flow_ids: 'FL-POS-001',
    task_ids: 'T-025',
    test_case_ids: 'TC-POS-005;TC-POS-024',
    security_test_ids: 'SEC-031',
    status: 'REFINED',
    owner: 'Full Stack'
  },

  // Release (4)
  'REQ-REL-003': {
    summary: 'Pre-release automated test verification gate requiring 100% passage of P0/P1 suites',
    priority: 'P0',
    domain: 'Release',
    acceptance_criteria: 'Release pipeline automatically validates that all P0 and P1 automated functional test cases, security scans, and database migrations succeed with zero unapproved failures before deployment.',
    flow_ids: 'FL-QUAL-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-REL-001;TC-QUAL-001',
    security_test_ids: 'SEC-046',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-REL-004': {
    summary: 'Automated application code and route rollback verification',
    priority: 'P0',
    domain: 'Release',
    acceptance_criteria: 'Deployment automation includes tested rollback recipes capable of reverting container images and traffic routing to the prior verified release within 60 seconds of health check failure.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-REL-001',
    security_test_ids: 'SEC-046',
    status: 'REFINED',
    owner: 'DevOps'
  },
  'REQ-REL-005': {
    summary: 'Expand-contract database migration strategy ensuring dual schema read/write compatibility',
    priority: 'P0',
    domain: 'Release',
    acceptance_criteria: 'Schema migrations adhere to the expand-and-contract pattern (adding nullable columns or views first), ensuring both new and old application instances run concurrently without downtime.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-REL-002',
    security_test_ids: 'SEC-046',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-REL-006': {
    summary: 'Staged canary traffic deployment with automated health check threshold triggers',
    priority: 'P0',
    domain: 'Release',
    acceptance_criteria: 'Production releases route 5% of traffic to canary instances, monitoring HTTP error rate and p99 latency against baseline before progressing to 100% rollout or triggering automated abort.',
    flow_ids: 'FL-OPS-001',
    task_ids: 'T-038',
    test_case_ids: 'TC-REL-001',
    security_test_ids: 'SEC-046',
    status: 'REFINED',
    owner: 'DevOps'
  },

  // Returns (6)
  'REQ-RET-004': {
    summary: 'Return Merchandise Authorization RMA request workflow with policy-enforced return windows',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Customers or staff can initiate RMA requests only for items within the merchant-defined return window (e.g. 15 days from delivery), verifying item eligibility and original invoice state.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-020',
    test_case_ids: 'TC-RET-001;TC-RET-004',
    security_test_ids: 'SEC-022',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-RET-005': {
    summary: 'Customer return reason logging and mandatory condition photo attachments',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Return requests record standardized return reason codes (defective, wrong item, size mismatch) and support customer photo uploads documenting packaging and item condition.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-020',
    test_case_ids: 'TC-RET-001;TC-RET-005',
    security_test_ids: 'SEC-022',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-RET-006': {
    summary: 'Physical goods receipt inspection workflow categorizing items into sellable or damaged',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Warehouse staff inspect returned physical packages upon receipt, recording disposition status (sellable condition, damaged packaging, or customer damaged scrap) before restocking.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-020',
    test_case_ids: 'TC-RET-002;TC-RET-006',
    security_test_ids: 'SEC-022',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-RET-007': {
    summary: 'Restock inventory adjustment creating verified stock movements only for approved items',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Restocking returned items increments location inventory balances and writes an audit stock movement record only when the item is explicitly certified as sellable by inspection staff.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-020',
    test_case_ids: 'TC-RET-002;TC-INV-002',
    security_test_ids: 'SEC-022',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-RET-008': {
    summary: 'Return shipping reverse-logistics label generation and tracking via Shiprocket',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Approved RMA requests can generate carrier reverse-pickup manifests and tracking labels through Shiprocket integration, updating order return timeline upon carrier pickup.',
    flow_ids: 'FL-RETURN-001;FL-EXT-001',
    task_ids: 'T-020;T-023',
    test_case_ids: 'TC-RET-001;TC-EXT-004',
    security_test_ids: 'SEC-022;SEC-028',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-RET-009': {
    summary: 'Restocking fee calculation and shipping fee deduction from final refund balance',
    priority: 'P1',
    domain: 'Returns',
    acceptance_criteria: 'Return financial calculation permits deducting configured restocking fees or original shipping charges from customer refund totals, updating refund ledger entries accurately.',
    flow_ids: 'FL-RETURN-001',
    task_ids: 'T-020;T-024',
    test_case_ids: 'TC-RET-003;TC-PAY-003',
    security_test_ids: 'SEC-022;SEC-030',
    status: 'REFINED',
    owner: 'Backend'
  },

  // Realtime (6)
  'REQ-RT-003': {
    summary: 'WebSocket connection authentication via short-lived JWT token verifying tenant membership',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'Realtime WebSocket connections require a cryptographically valid short-lived ticket token in the handshake, rejecting unauthenticated or cross-tenant subscription requests.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-001',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-RT-004': {
    summary: 'Topic-based publish subscribe scoping events to authorized tenant store and location channels',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'Connected clients subscribe only to authorized channels (e.g. store:orders, counter:kots, location:inventory). Broadcasts never cross tenant or location authorization boundaries.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-001',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-RT-005': {
    summary: 'Event sequence ordering and cursor-based historical event replay for reconnected clients',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'Realtime events include monotonically increasing sequence numbers. Reconnecting clients pass their last-seen cursor, receiving missed events from the replay buffer without data loss.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-002',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-RT-006': {
    summary: 'Server-Sent Events fallback transport when WebSocket upgrades are blocked',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'If WebSocket upgrades are blocked by client corporate proxies or firewalls, realtime client automatically falls back to HTTP Server-Sent Events (SSE) maintaining live event updates.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-001;TC-RT-002',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-RT-007': {
    summary: 'Bi-directional heartbeat keep-alive with client reconnection backoff jitter',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'Realtime gateway exchanges ping/pong heartbeats every 30 seconds. Disconnected clients reconnect using exponential backoff with full random jitter to prevent server thundering herds.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-001',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-RT-008': {
    summary: 'Real-time broadcast throttling preventing client flooding during sales bursts',
    priority: 'P1',
    domain: 'Realtime',
    acceptance_criteria: 'Gateway aggregates and coalesces rapid bulk events (e.g. inventory adjustments) into 100ms throttle windows, preventing client browser render freezing during flash sale volume.',
    flow_ids: 'FL-REALTIME-001',
    task_ids: 'T-035',
    test_case_ids: 'TC-RT-001',
    security_test_ids: 'SEC-043',
    status: 'REFINED',
    owner: 'Backend'
  },

  // Fulfillment (4)
  'REQ-SHP-003': {
    summary: 'Multi-location fulfillment routing selecting optimal warehouse location by stock availability',
    priority: 'P1',
    domain: 'Fulfillment',
    acceptance_criteria: 'Fulfillment engine automatically routes order line items to the nearest store or warehouse location possessing sufficient available inventory, minimizing transit distance and delivery cost.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-019',
    test_case_ids: 'TC-SHP-001;TC-SHP-003',
    security_test_ids: 'SEC-021',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-SHP-004': {
    summary: 'Package weight and volumetric dimension calculation determining carrier shipping rates',
    priority: 'P1',
    domain: 'Fulfillment',
    acceptance_criteria: 'Packaging algorithm aggregates variant weights and dimensions across order items into discrete shipping boxes, calculating chargeable volumetric weight for carrier rate quotes.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-019',
    test_case_ids: 'TC-SHP-001;TC-CAT-009',
    security_test_ids: 'SEC-021',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-SHP-005': {
    summary: 'Split shipment creation assigning independent tracking numbers and packing slips',
    priority: 'P1',
    domain: 'Fulfillment',
    acceptance_criteria: 'When an order is fulfilled in multiple consignments from different locations, each partial shipment generates independent carrier tracking numbers, packing slips, and status notifications.',
    flow_ids: 'FL-ORDER-001',
    task_ids: 'T-019',
    test_case_ids: 'TC-SHP-001;TC-ORD-003',
    security_test_ids: 'SEC-021',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-SHP-006': {
    summary: 'Non-Delivery Report NDR workflow with re-attempt triggers and customer address verification',
    priority: 'P1',
    domain: 'Fulfillment',
    acceptance_criteria: 'When a carrier reports a delivery failure (NDR), system alerts operations staff, logs the failure reason, and triggers an automated SMS/email to the customer to reconfirm delivery address.',
    flow_ids: 'FL-ORDER-001;FL-EXT-001',
    task_ids: 'T-019',
    test_case_ids: 'TC-SHP-005;TC-EXT-004',
    security_test_ids: 'SEC-021',
    status: 'REFINED',
    owner: 'Full Stack'
  },

  // Storefront (11)
  'REQ-STORE-007': {
    summary: 'Section registry schema validation for header footer hero product grid and booking widget',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'All Store Editor sections validate against strict JSON schemas defining allowed settings, default props, and typography options, rejecting unknown section definitions or corrupt JSON.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-STORE-002',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-008': {
    summary: 'Store Editor theme settings managing color palette typography and logo assets',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Merchants can configure brand typography font pairings, primary/secondary brand colors (adhering to contrast guidelines), header logo, and favicon in the unified theme inspector.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-EXP-021',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-009': {
    summary: 'Interactive page tree supporting page addition deletion renaming and slug editing',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Store Editor page tree enables adding custom pages, renaming titles, updating URL slugs with uniqueness validation, reordering navigation hierarchy, and setting the default homepage.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-009;T-010',
    test_case_ids: 'TC-STORE-001;TC-STORE-009',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-010': {
    summary: 'Responsive dual-mode viewport preview desktop and mobile with synchronized state',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Store Editor canvas provides one-click toggling between responsive desktop (1280px) and mobile (375px) viewports with active section selection highlighting and live draft state synchronization.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-EXP-023',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-011': {
    summary: 'Undo and redo action stack preserving draft state during active editing session',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Store Editor maintains an in-memory undo/redo history stack across section modifications, prop adjustments, and section reordering, accessible via standard keyboard shortcuts (Ctrl+Z / Ctrl+Y).',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-STORE-008',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-015': {
    summary: 'Template gallery preview with category filters and non-destructive template application',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Merchants can browse pre-built industry templates in a gallery modal, preview them in desktop/mobile viewports, and apply them exclusively to working draft versions without affecting live storefronts.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-STORE-004',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-016': {
    summary: 'Version history snapshots allowing merchants to inspect and revert to previous releases',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Every atomic store publication creates an immutable version snapshot. Merchants can review the release history log and revert to any historical version with one click.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-011',
    test_case_ids: 'TC-STORE-005;TC-STORE-006',
    security_test_ids: 'SEC-011',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-STORE-017': {
    summary: 'Page-level SEO metadata management including title meta description and Open Graph tags',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Merchants can define custom title tags, meta descriptions, social share preview images (Open Graph), and canonical URLs per page, rendering valid HTML tags on public storefront routes.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-EXP-022',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Full Stack'
  },
  'REQ-STORE-018': {
    summary: 'Storefront custom CSS and theme override sandbox preventing script injection',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Merchant custom CSS inputs are sanitized using strict AST parsing to strip JavaScript expressions (expression(), behavior:url()), preventing cross-site scripting vulnerabilities.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001',
    security_test_ids: 'SEC-010;SEC-012',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-STORE-019': {
    summary: 'Storefront performance optimization ensuring sub-second first contentful paint',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Public storefront pages serve pre-rendered HTML shells with optimized image formats (WebP), asset caching headers, and lazy-loaded offscreen sections, achieving sub-second FCP on broadband.',
    flow_ids: 'FL-STORE-001',
    task_ids: 'T-010',
    test_case_ids: 'TC-STORE-001;TC-QUAL-004',
    security_test_ids: 'SEC-010',
    status: 'REFINED',
    owner: 'Frontend'
  },
  'REQ-STORE-020': {
    summary: 'Custom domain mapping with automated SSL certificate provisioning status reporting',
    priority: 'P1',
    domain: 'Storefront',
    acceptance_criteria: 'Merchants configuring custom domains (e.g. store.custombrand.com) receive required CNAME and TXT verification records, and can monitor automated Let\'s Encrypt SSL certificate provisioning status.',
    flow_ids: 'FL-DOMAIN-001',
    task_ids: 'T-056',
    test_case_ids: 'TC-EXP-031;TC-EXP-032;TC-EXP-034',
    security_test_ids: 'SEC-064;SEC-065;SEC-066',
    status: 'REFINED',
    owner: 'DevOps'
  },

  // Team (4)
  'REQ-TEAM-009': {
    summary: 'Granular permission definition and evaluation engine enforcing discrete privileges',
    priority: 'P0',
    domain: 'Team',
    acceptance_criteria: 'Authorization middleware evaluates granular permissions (products:create, orders:refund, register:open, staff:invite) across API routes and Admin UI navigation links based on assigned roles.',
    flow_ids: 'FL-TEAM-001',
    task_ids: 'T-007',
    test_case_ids: 'TC-TEAM-001;TC-TEAM-002',
    security_test_ids: 'SEC-005;SEC-006',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-TEAM-010': {
    summary: 'Team member invitation email dispatch with time-bounded secure acceptance token',
    priority: 'P1',
    domain: 'Team',
    acceptance_criteria: 'Inviting new staff members generates a single-use cryptographically random token expiring in 7 days, sending an invitation email that allows the invitee to establish credentials and join the organization.',
    flow_ids: 'FL-TEAM-001;FL-EMAIL-001',
    task_ids: 'T-007',
    test_case_ids: 'TC-TEAM-005;TC-TEAM-008',
    security_test_ids: 'SEC-005',
    status: 'REFINED',
    owner: 'Backend'
  },
  'REQ-TEAM-011': {
    summary: 'Multi-location assignment matrix restricting staff operational visibility to designated branches',
    priority: 'P0',
    domain: 'Team',
    acceptance_criteria: 'Staff members assigned to specific physical store locations or POS counters are strictly blocked from viewing or executing transactions across unassigned branch locations.',
    flow_ids: 'FL-TEAM-001;FL-POS-ACCESS-001',
    task_ids: 'T-007',
    test_case_ids: 'TC-TEAM-002;TC-POS-001',
    security_test_ids: 'SEC-005;SEC-056',
    status: 'REFINED',
    owner: 'Security'
  },
  'REQ-TEAM-012': {
    summary: 'Comprehensive team member audit trail logging role modifications and access changes',
    priority: 'P1',
    domain: 'Team',
    acceptance_criteria: 'All team management operations (role assignment, permission adjustments, location access changes, staff suspensions, PIN resets) emit immutable records to the security audit trail.',
    flow_ids: 'FL-TEAM-001',
    task_ids: 'T-007',
    test_case_ids: 'TC-TEAM-006;TC-CORE-002',
    security_test_ids: 'SEC-006;SEC-007',
    status: 'REFINED',
    owner: 'Backend'
  }
};

function main() {
  const reqFilePath = 'management/requirements.csv';
  const content = fs.readFileSync(reqFilePath, 'utf8');
  const rows = parseCSV(content);
  const header = rows[0];

  const idIdx = header.indexOf('requirement_id');
  const summaryIdx = header.indexOf('summary');
  const priorityIdx = header.indexOf('priority');
  const domainIdx = header.indexOf('domain');
  const acIdx = header.indexOf('acceptance_criteria');
  const flowsIdx = header.indexOf('flow_ids');
  const tasksIdx = header.indexOf('task_ids');
  const testsIdx = header.indexOf('test_case_ids');
  const secTestsIdx = header.indexOf('security_test_ids');
  const statusIdx = header.indexOf('status');
  const ownerIdx = header.indexOf('owner');

  console.log('Columns indices:', { idIdx, summaryIdx, priorityIdx, domainIdx, acIdx, flowsIdx, tasksIdx, testsIdx, secTestsIdx, statusIdx, ownerIdx });

  let updatedCount = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const id = row[idIdx];
    if (refinedData[id]) {
      const data = refinedData[id];
      row[summaryIdx] = data.summary;
      row[priorityIdx] = data.priority;
      row[domainIdx] = data.domain;
      row[acIdx] = data.acceptance_criteria;
      row[flowsIdx] = data.flow_ids;
      row[tasksIdx] = data.task_ids;
      row[testsIdx] = data.test_case_ids;
      row[secTestsIdx] = data.security_test_ids;
      row[statusIdx] = data.status;
      row[ownerIdx] = data.owner;
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} generic requirements.`);
  if (updatedCount !== 125) {
    console.error(`Warning: Expected 125 updates, got ${updatedCount}`);
  }

  const newCsv = stringifyCSV(rows);
  fs.writeFileSync(reqFilePath, newCsv, 'utf8');
  console.log('Successfully wrote refined requirements to management/requirements.csv');

  // Verify generic check
  let genericRemaining = 0;
  rows.slice(1).forEach(r => {
    if (r[summaryIdx].toLowerCase().includes('detailed requirement') || r[acIdx].toLowerCase().includes('detailed requirement')) {
      genericRemaining++;
    }
  });
  console.log(`Generic rows remaining: ${genericRemaining}`);
}

main();


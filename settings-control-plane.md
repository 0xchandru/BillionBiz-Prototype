# Complete Merchant Settings Architecture

## 1. Settings principles

Settings are a governed control plane, not one flat form. Group by merchant intent. Show saved state, scope, impact, permission, updated-by/time and preview/test action where relevant. High-impact changes require confirmation and audit. Explain whether a setting affects existing records or only new transactions.

## 2. Settings navigation

### Business and organization
- Legal/business name, display name, registration identifiers where applicable.
- Business category, contact details, support email/phone.
- Organization members, ownership and organization preferences.

### Store profile
- Store name, logo, favicon, description and contact details.
- Storefront mode (Commerce / Services / Both) and enabled capabilities.
- Store slug/default domain, canonical URL and publication state.
- Default language, locale, date/time format and store timezone.

### Locations and regional preferences
- Locations, addresses, business hours, holidays.
- Currency and number formats; do not silently change existing transaction currencies.
- IANA timezone per store/location; recurring shifts/bookings use selected location timezone.
- Tax registration and tax behavior, subject to applicable jurisdiction and qualified review.

### Online Store
- Storefront pages and navigation links.
- Theme, typography, colors, logo and reusable assets.
- Template behavior and publication/history.
- SEO, social metadata, canonical URLs, redirects and indexing preferences.
- Domains, verification and TLS state.
- Customer account experience and consent notices.

### Payments and finance
- Provider connections, test/live mode and supported methods.
- Capture/refund rules, payment confirmation and settlement references.
- Taxes, invoice/receipt numbering and payment-exception workflow.
- Refund approval thresholds and finance permissions.

### Checkout and customers
- Checkout fields, address validation and guest checkout policy.
- Customer account options and account linking.
- Cart/order confirmation behavior.
- Customer communication and privacy preferences.

### Shipping and delivery
- Pickup/warehouse locations, package defaults, providers, rates, tracking, COD and returns.
- Service-area rules, delivery restrictions and exceptions.
- Show only when physical product fulfilment is enabled.

### Appointments
- Offerings, durations, buffers, capacity and booking windows.
- Working hours, staff/resource eligibility, holidays and blocked time.
- Confirmation, cancellation, reschedule, late/no-show and deposit policies.
- Reminder schedule and store-local timezone.
- Customer intake fields, privacy and communication rules.

### POS and counters
- Locations, counters, registers, devices, printers and supported peripherals.
- Cash drawer opening/closing and reconciliation.
- Tender types, tax, receipt layout, barcode/product search and offline policy.
- Staff/counter assignments.
- Discounts, voids, returns/refunds and approval thresholds.

### Team and access
- Members, invitations, roles and custom permissions when supported.
- Staff profiles, resource skills and appointment assignments.
- POS/counter/device assignments.
- Session policy, MFA enforcement and access review.

### Notifications and email
- Transactional template branding/language and customer-facing preferences.
- Merchant/staff in-app alert preferences.
- Verified sender domain/provider state and message delivery history.
- Test email and troubleshooting.
- Mandatory security/transactional notices cannot be silently disabled.

### Extensions and developer tools
- Installed providers, permissions and connection health.
- API credentials, webhook endpoints/events, delivery history and rotation.
- Export scopes and integration logs.
- Secrets are write-only/masked after save; never reveal existing secret values.

### Data, privacy and compliance
- Import/export jobs, retention, data subject requests and consent logs.
- Account closure/store deletion with retention/legal holds.
- Audit log access and export permissions.

### Plan and billing
- Plan, usage, invoices, payment method and changes only once billing exists.
- Entitlement changes explain effects on active features/data.

### Advanced
- Security events, active sessions, trusted devices and supported risk policies.
- Audit log.
- Developer diagnostics/service status for authorized admins only.

## 3. Settings UX contract

Every page shows: scope (account/organization/store/location/counter/user); current saved value and unsaved state; purpose and affected systems; who may change it; impact on existing versus new data; validation and preview/test; updated-by/time; confirmation for irreversible/high-risk changes.

## 4. Capability-aware settings

Do not show appointment-only options for product-only stores or shipping options for service-only stores unless they serve a shared need. Disabling a capability must not delete data. It disables new operations, preserves allowed historical access and provides a re-enable path. Plan entitlements remain separate from capability toggles.

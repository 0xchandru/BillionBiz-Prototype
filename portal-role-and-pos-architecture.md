# Portal Separation, Roles, Staff and Counter Operations

## 1. Critical separation

The cashier billing screen must not be a normal Merchant Admin page. Build three separately routed experiences over shared identity and APIs:
- Merchant Admin: owners/managers configure POS resources and permissions.
- Staff Portal: staff see assigned operational work.
- POS Portal: cashiers sign into assigned counters and process transactions.

Do not duplicate the database or create separate identities for each shell.

## 2. Merchant Admin POS management

`POS & Counters` manages:
- Business locations and their timezone/contact details.
- Counter definitions, opening status and counter receipt settings.
- Registers/cash drawers and opening/closing balances.
- Trusted device enrollment/revocation.
- Printers, barcode scanners and supported payment-terminal setup.
- Staff-to-location and staff-to-counter assignments.
- Register session history, cash movements, handovers and variance approvals.
- Tender types, receipt format, tax/discount/void/return policies.
- Offline capability and maximum offline risk/limits.

**Open POS** navigates to the separate POS host and uses an authorized short-lived launch handoff. Never put a long-lived token in a URL. POS revalidates identity, staff assignment, device trust and counter scope.

## 3. Staff Portal

Access begins with owner/manager invitation. A staff member accepts a single-use invitation, verifies identity, establishes authentication and joins only with the role and assignments in the invitation. Owners can suspend/revoke access.

Staff see their schedule, assigned appointment queue, permitted customer details needed for work, authorized booking actions, assigned location/resource/counter, shifts/time-off where enabled and work notifications. They must not see merchant-wide revenue, all-customer exports, API secrets, billing, domains or team management unless explicitly granted.

## 4. Role and permission model

Use permissions, scopes and assignments rather than scattered role-name checks.

| Suggested role | Intended access |
|---|---|
| Organization Owner | Full organization/store control; sensitive ownership transfer protected by re-auth/MFA |
| Store Admin | Broad store administration without organization ownership transfer |
| Store Manager | Assigned stores/locations and approved operational actions |
| Catalogue Manager | Products, categories, bundles and inventory |
| Order/Fulfillment Staff | Orders, shipment and permitted return tasks |
| Appointment Coordinator | Calendar, bookings, offerings and permitted customer communication |
| Service Provider | Assigned appointments/resources and personal availability |
| Cashier | Assigned POS counter/register and sale/receipt tasks |
| Finance/Accountant | Payments, refunds within limits, invoices and reports |
| Analyst/Read Only | Explicitly granted read-only data |
| Platform Operator | Internal platform duties; no implicit access to merchant data |

Permissions follow a `domain.resource.action` pattern, e.g. `pos.sale.create`, `pos.register.close`, `appointment.booking.reschedule`, `catalog.product.publish`, `people.customer.export`, `settings.domain.manage`.

Role grants are scoped to organization/store/location. Resource/counter assignment narrows further. High-risk actions may require limits, approval or dual control.

## 5. Authorization enforcement

- Enforce permission checks on every API command/query, export, download, search result, WebSocket topic and background job.
- Enforce object ownership and store/location/counter membership server-side.
- Route hiding and disabled buttons are not authorization.
- Audit role/assignment changes.
- Cache permissions only with reliable versioning/invalidation.
- Test cross-tenant, cross-store, cross-location, cross-counter and stale-session access.

## 6. POS sign-in and device controls

- Staff use individual identities; shared static counter passwords are prohibited.
- Trusted devices may use short-lived device-bound sessions and optional staff quick-switch PINs; the PIN is not a replacement for initial authenticated enrollment or server-side authorization.
- Lost devices can be revoked centrally.
- Opening a register requires a valid assignment and permitted opening workflow.
- Cash movements and register close record actor, timestamp, amount, reason and audit event.
- Discounts, voids, returns and refunds are independently permissioned; thresholds may require manager approval.

## 7. POS transaction correctness

POS is a sales channel, not a separate source of truth. Use shared order/payment/inventory/finance domains. Every sale has an idempotency key and durable transaction reference. Inventory, payment state and receipt issuance must be coherent. Offline sales stay explicitly provisional/queued until reconciliation policy permits finalization; never label a queued payment provider-confirmed.

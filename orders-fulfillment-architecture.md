# Orders, Fulfillment, Shipment, Returns and Refunds Architecture

## 1. Primary design rule

Do not model every operational state as one `order.status`. Separate the commercial order, payment state, fulfillment state, shipment state, return state and refund state. They are related but independently transitionable.

## 2. Orders navigation

- **All Orders** — searchable, filterable order workbench.
- **Draft Orders / Quotes** — only if confirmed as an existing/proposed business requirement; do not build speculative screens.
- **Fulfillment / Shipments** — orders awaiting pick/pack, labels, dispatch or delivery exception.
- **Returns** — return requests, eligibility, approvals, received items and disposition.
- **Refunds** — refund status, amount, payment reference and exceptions.
- **Payment Exceptions** — failed/pending/reconciliation-required payments.

## 3. Order model

Order header includes tenant/store/customer/channel, currency, address snapshots, totals, discounts, taxes, notes, source and status history. Order lines preserve product/variant identity and immutable title, SKU, quantity, unit price, discounts, tax and bundle-component snapshots at purchase time.

Order sources include storefront, POS and supported staff-created orders. Appointment bookings have their own aggregate and financial obligation; if linked to an order/invoice for checkout, retain explicit booking association and avoid converting an appointment into a physical shipment order.

## 4. Independent state machines

Order: draft -> open/confirmed -> completed/closed or cancelled (define exact states in implementation ADR).

Payment: not_required -> pending -> authorized/captured/partially_captured/failed/cancelled; refunds are separate refund records.

Fulfillment: unfulfilled -> partially_fulfilled -> fulfilled; may have multiple fulfillment orders and shipments.

Shipment: draft -> label_pending -> label_ready -> booked/pickup_scheduled -> in_transit -> out_for_delivery -> delivered; exception/failed/RTO states are provider-mapped and normalized.

Return: requested -> approved/rejected -> in_transit/received -> inspected -> restocked/damaged/disposed -> closed.

Refund: requested -> pending_provider -> processed/failed/reversed. Only actual provider success or controlled manual cash/card confirmation may mark refund completed.

## 5. Order detail experience

Use a unified order detail page with:
- Order summary, source and customer.
- Timeline/activity stream.
- Payment summary and transactions.
- Fulfillment and shipment cards.
- Line items and inventory allocation.
- Return/refund history.
- Tax/invoice documents.
- Internal notes and staff activity.
- Contextual actions based on state and permissions.

Show payment and fulfillment states separately. Avoid ambiguous badges such as "Completed" without explaining whether that means paid, shipped or both.

## 6. Shipment operations

Physical product lines may be fulfilled. Digital items and appointments do not create Shiprocket shipments. Support partial fulfillment and multiple parcels when business rules allow.

Shipment record stores carrier/provider, warehouse/origin, destination snapshot, parcel dimensions/weight, item allocation, provider shipment ID, AWB/tracking ID, label URI, manifest/pickup details, normalized status, latest tracking event and raw provider reference.

Do not assume shipment creation succeeded after a timeout. Query provider using idempotency/reference data or reconcile before retrying to avoid duplicate shipments.

## 7. Returns and refunds

- Validate return eligibility by item, quantity, order state, dates and policy snapshot.
- Return quantity cannot exceed purchased quantity minus already returned quantity.
- Restocking is a distinct disposition; returned items may be damaged or not resellable.
- Refund amount cannot exceed captured/eligible funds, adjusted for prior refunds and approved fees.
- Return and refund are related but not identical. A refund can exist without a return where policy permits; a return may be received before refund approval.
- Record immutable audit history and external transaction IDs.
- Refund provider calls are idempotent and reconciled.

## 8. Search and filters

Support search by order number, customer, email/phone (permission/PII-aware), SKU, tracking number and provider reference. Filters include date, channel, payment state, fulfillment state, shipment state, location, exception and staff. Bulk actions must show preview, affected count, permission validation and per-item outcome. Avoid bulk destructive actions without confirmation.

## 9. Reporting invariants

Gross sales, discounts, tax, captured payments, refunds, net sales, outstanding balance, shipping, returns and voids must have documented definitions. Do not double subtract a void and its refund. Appointment deposits must be represented once as captured funds against the booking obligation.

## 10. Operational navigation and shipment work queues

Use a small number of clear operational destinations. Do not duplicate the same shipment record across many unrelated screens; each page is a filtered view over the same fulfillment/shipment model.

| Page / queue | Purpose | Visibility rule |
|---|---|---|
| All Orders | Search and operate every authorized order source | Order read permission |
| Fulfillment Queue | Pick, pack and allocate unfulfilled physical quantities | Fulfillment permission + physical order capability |
| All Shipments | Track booked, in-transit, delivered and cancelled parcels | Shipping permission + installed carrier capability |
| Failed Bookings | Provider shipment creation attempts needing reconciliation/retry | Shipping integration permission |
| Rate Calculator | Check serviceability and courier price before booking | Connected carrier + shipping permission |
| Pickup Management / Calendar | Schedule warehouse pickups and view upcoming collections | Connected carrier + warehouse access |
| Manifests | Generate/download handover manifests where provider supports it | Connected carrier capability |
| NDR Center | Resolve delivery exceptions, retry delivery or initiate permitted RTO action | Carrier supports event/action and user is authorized |
| Return Shipments | Manage reverse pickup for approved physical returns | Return/shipping permissions |
| COD Remittance | Reconcile carrier COD collections and remittance references | COD capability + finance permission |
| Insurance / Weight Disputes | Manage provider-supported claims and disputes | Provider capability + elevated permission |

Only render provider-specific pages when the connected provider and account actually support them. Never display a control that cannot produce a real backend operation. A carrier adapter must expose its supported capabilities through a verified capability contract.

## 11. Orders and shipment action rules

- Payment capture, fulfillment, shipment booking, pickup, delivery, return and refund are different state transitions.
- A paid order is not automatically fulfilled; a delivered parcel is not proof that a refund completed.
- Every bulk action previews selected order count, eligible/ineligible rows, quantities, financial impact and provider side effects.
- For multiple packages, allocate each order line quantity to a parcel and prevent total allocations from exceeding remaining fulfillable quantity.
- When provider APIs time out, use stored idempotency/correlation references to discover whether the provider accepted the command before retrying.
- Tracking events are normalized and de-duplicated, while raw provider status and source timestamp remain available for audit/debugging.
- Shipment exceptions need an owner, next action, due time where appropriate and escalation visibility on the dashboard.

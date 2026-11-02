# FL-ORDER-001 — Fulfill Order and Create Shiprocket Shipment

- **Version:** 1.0
- **Actors:** Fulfillment Staff; Shiprocket adapter; customer.
- **Preconditions:** Paid/fulfillable order, physical item lines, Shiprocket connected and location mapped.

## Main flow
1. Staff opens Orders -> All Orders and selects an eligible order.
2. Order detail shows payment state separately from fulfillment state.
3. Staff selects Create shipment for eligible unfulfilled physical quantities.
4. System validates delivery address, warehouse, product weight/dimensions, parcel and line quantities.
5. System requests serviceability/rates from Shiprocket and displays available choices.
6. Staff selects service/package and confirms shipment.
7. Backend persists shipment operation intent with idempotency key before provider call.
8. Adapter creates/queries provider shipment and stores provider shipment ID, AWB and status.
9. Label/manifest/pickup actions are available when provider reports them ready.
10. Tracking webhooks are verified and normalized to shipment events.
11. Customer and merchant timelines update; notification is queued.

## Alternate/failure paths
- Appointment or digital-only order: shipment action is unavailable.
- Missing weight/dimensions/address: show exact missing data; do not invent defaults without merchant policy.
- Provider rate unavailable: offer retry or supported alternate provider/manual fulfillment.
- Timeout during shipment creation: reconcile by provider reference before retry to avoid duplicate shipment.
- Webhook missing: scheduled reconciliation queries provider.
- Partial fulfillment: only selected quantities are allocated; remaining quantities stay unfulfilled.

## Invariants
- Shipment references a valid fulfillment allocation.
- Total shipped quantity cannot exceed ordered eligible quantity.
- Duplicate provider callbacks do not duplicate tracking events.
- Shipment creation is tenant/account scoped.

## Traceability
- Requirements: REQ-ORD-001..010;REQ-SHP-001..009
- Tasks: T-018;T-019;T-023
- Tests: TC-ORD-001..008;TC-SHP-001..005;TC-EXT-003
- Security: SEC-030..SEC-034

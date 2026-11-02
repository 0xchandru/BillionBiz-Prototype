# FL-CAP-001 — Enable or Disable a Store Capability

- **Version:** 1.0
- **Actors:** Owner; Entitlement service; Store Editor; domain services.

## Main flow
1. Owner opens Settings -> Business capabilities.
2. UI shows current Product Commerce and Appointments states with a plain-language explanation of each.
3. Owner selects enable/disable and sees dependent pages, customer routes, operational requirements and plan impacts.
4. Backend checks entitlement and owner permission.
5. Enabling creates only required route/navigation/setup scaffolding and checklist tasks; does not fabricate products/services/orders/staff.
6. Disabling checks for active obligations: unpaid orders, future bookings, shipments, refunds, subscriptions/entitlements or in-progress operations.
7. Backend shows consequences and requires explicit confirmation if existing records remain.
8. Existing records/history are retained; new selling/booking entry points are disabled only according to approved policy.
9. Store release/feature registry updates and emits event; connected clients refresh relevant modules.
10. Audit record captures before/after capability set and actor.

## Safety rules
- Never delete historical orders/bookings or financial records when disabling a capability.
- Do not disable appointments while future confirmed bookings are unresolved without an approved handling plan.
- Do not disable product commerce while fulfillments/returns/payments are pending without warning and controlled policy.
- Capability flags and plan entitlements are distinct: a feature may be commercially entitled but not enabled by merchant, or enabled in setup but blocked by plan.

## Traceability
- Requirements: REQ-CAP-001..008
- Tasks: T-005..T-008
- Tests: TC-CAP-001..006
- Security: SEC-001..SEC-004

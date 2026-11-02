# FL-BOOK-001 — Customer Appointment Booking and Concurrent Reservation

- **Version:** 1.0
- **Actors:** Customer; Availability Engine; Booking Engine; Payment Provider; assigned team.
- **Preconditions:** Appointment capability enabled; offering active/visible; eligible resource and schedules exist.

## Main flow
1. Customer opens Services and selects an offering.
2. Customer chooses a staff preference or Any available.
3. Client requests available slots for a date range.
4. Backend calculates availability using store timezone, shifts, breaks, leave, blocks, buffers, existing reservations and capacity.
5. Customer selects a slot; backend creates a short-lived hold tied to session/customer and resource interval.
6. Customer enters contact/intake details and completes required verification.
7. Customer confirms booking. If a deposit is required, booking enters the defined pending-payment state and payment intent is created.
8. Backend revalidates hold expiry, availability and policy inside a database transaction.
9. Backend atomically claims exclusive resources/group capacity, creates booking/reservation and records policy snapshot.
10. Verified deposit capture transitions booking according to state machine. Outbox event triggers confirmation and schedule updates.
11. Customer sees confirmation and secure manage-booking link.
12. Staff calendar and personal schedule update in realtime.

## Concurrent path
Two customers attempt to confirm the same exclusive resource interval simultaneously. Both may see a slot before one confirms, but database constraint/transaction ensures at most one commits. The losing request receives `BOOKING_SLOT_UNAVAILABLE` and is offered alternatives. For group booking, atomic capacity claim ensures booked count never exceeds capacity.

## Alternate paths
- Hold expires: customer must select a new slot.
- Payment fails/timeouts: booking remains in defined pending state until reconciliation/timeout policy decides; do not assume failed callback means failed provider payment.
- Reschedule: release old and claim new reservation in one transaction; notify customer after commit.
- Cancellation/no-show: apply policy snapshot; record kept/refunded deposit separately.
- Resource unavailable/leave added: re-evaluate future bookings and show conflict resolution to staff; do not silently cancel bookings.

## Invariants
- Availability query is advisory; confirmation is authoritative.
- Holds are not the only collision protection.
- No over-capacity or overlapping active exclusive reservation.
- Booking policy snapshot is immutable after confirmation except explicit audited override.
- Deposit is counted once and can be applied to POS remaining balance.

## Traceability
- Requirements: REQ-BOOK-001..016
- Tasks: T-025;T-026;T-027;T-028;T-032
- Tests: TC-BOOK-001..012
- Security: SEC-040..SEC-045

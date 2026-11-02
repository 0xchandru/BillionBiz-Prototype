# Appointments and Booking Architecture

## 1. Scope

A vertical-neutral service scheduling engine suitable for doctor/clinic appointment slots, haircuts, tutoring, studios, repair services and other bookable services. It is not automatically a clinical record/diagnosis system. Regulated healthcare workflows require a separately approved privacy/compliance design.

## 2. Domain objects

- Offering/service: name, description, category, duration, processing time, before/after buffers, price model, taxes, deposit policy, booking model, capacity and visibility.
- Resource: person, space or equipment. Person resources may link to a shared staff profile.
- Offering-resource assignment: eligible people and required spaces/equipment.
- Schedule: weekly shifts, date overrides, breaks, leave, holiday and explicit blocked intervals.
- Booking: customer, offering, assigned resources, time range, status and policy snapshot.
- Booking hold: short-lived temporary reservation during checkout.
- Resource reservation: confirmed interval/capacity allocation.
- Booking payment obligation: total, deposit due, captured amount, balance and refunds.
- Intake response: versioned response against a specific offering form definition.

## 3. Availability engine

The backend is authoritative. A slot is bookable only if all relevant requirements are satisfied:

- Store opening hours/timezone.
- Employee shifts and breaks.
- Resource active status and eligibility.
- Leave, holidays and blocked intervals.
- Offering duration, processing time and buffers.
- Existing holds and confirmed reservations.
- Room/equipment constraints.
- Minimum notice and booking horizon.
- Group capacity rules.
- Store-local calendar and daylight-saving transition behavior where applicable.

Use half-open interval semantics `[start, end)` consistently. Define whether buffers reserve the same resource and how multiple resource requirements are allocated. Validate overlapping shifts and blocks; reject or normalize duplicates rather than silently saving conflicting data.

## 4. Concurrency and double-booking protection

For one-to-one resources, enforce non-overlapping active reservations at the database level where supported (e.g. PostgreSQL exclusion constraints on a range column scoped by resource and tenant), with transactions and explicit state rules. For group capacity, atomically claim capacity inside a transaction using a row lock or conditional update. A Redis lock can help reduce contention but is not the correctness boundary.

Booking confirmation must atomically:
1. Validate hold ownership and expiry.
2. Recalculate authoritative availability.
3. Acquire/confirm all required resource allocations.
4. Validate capacity.
5. Persist booking state and reservation records.
6. Persist payment obligation or verified payment linkage.
7. Write outbox events.

Two simultaneous requests for an unavailable one-to-one interval must not both commit. Capacity must never exceed its configured maximum.

## 5. Booking holds

Holds are short-lived, server-issued and tied to the session/customer and selected resource/time. Expiration is enforced server-side. Holds reduce customer collision but are not a replacement for the database reservation constraint. Expired holds are reclaimed through a durable worker and also ignored by authoritative availability calculation when expired.

## 6. Booking lifecycle

The state machine should include pending payment (when a deposit is required), confirmed, checked in, in progress, completed, cancelled and no-show. Reschedule is an auditable transition that atomically releases old reservation and claims the new reservation. Define exactly which states permit cancellation, check-in, service start, completion, no-show and reschedule. Reject invalid transitions with stable error codes.

Do not allow a terminal booking to be silently reopened. Corrections require an authorized, audited workflow.

## 7. Deposits and payment

Deposit is a payment obligation rule; captured deposit is an actual transaction. On POS checkout, retrieve the authoritative captured deposit and remaining balance. Never count a deposit as another POS payment. Cancellation and no-show refund/forfeiture behavior uses a policy snapshot stored on the booking, so later settings changes do not retroactively rewrite existing bookings.

## 8. Customer booking journey

1. Browse services.
2. Select service and optional staff preference.
3. Request availability.
4. Select slot and obtain a server hold.
5. Enter contact and intake details.
6. Enforce configured verification.
7. Confirm and/or pay deposit.
8. Receive confirmation and secure manage-booking link.
9. Customer can view/cancel/reschedule only within server-enforced policy.

Manage-booking tokens are high entropy, hashed at rest, scoped to a single booking/action set, expiring and revocable. Do not put personal data or authorization state in unsigned query parameters.

## 9. Staff/merchant calendar

Provide calendar day/week/month, resource filters, status filters, conflict visibility, booking detail panel and staff personal view. Support block-time actions directly from calendar as well as resource schedule settings. Display group capacity remaining and utilization. Provide clear warnings when offerings have no eligible resource or resources have no working hours.

## 10. Timezones

Store IANA timezone per store/location. Persist booking instants in UTC and store the intended timezone/local date-time context where needed for audit. Convert and calculate availability using the store's configured timezone, not server local time. All-day holidays and weekly recurring shifts are evaluated in local time. Test DST skipped/repeated times in affected timezones and keep Indian store behavior in `Asia/Kolkata` when configured.

## 11. Notifications and jobs

Notifications are triggered from committed domain events. Include confirmation, reminders, cancellation, no-show, reschedule, payment-link, check-in/start/completion when merchant-enabled and provider capabilities exist. Track queued/submitted/delivered/read/failed separately; never label provider acceptance as guaranteed delivery. Job workers use durable scheduling, idempotency and row-claiming. Monitor overdue jobs and failed provider messages.

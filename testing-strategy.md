# Testing Strategy and Quality Gates

## 1. Test pyramid

- Unit tests: domain calculations, validation, state machine, policy, money and availability.
- Integration tests: repository/database constraints, transaction boundaries, provider adapters and queue handlers.
- API tests: authorization, tenant isolation, idempotency, contract and error behavior.
- Component tests: editor field behavior, product variant matrix, tables, filters and empty/error states.
- End-to-end tests: merchant/customer workflows in browser/POS PWA.
- Concurrency tests: simultaneous booking, payment, inventory, checkout and publish operations.
- Security tests: see `security-test-plan.md` and `management/security-tests.csv`.
- Performance/resilience tests: load, spike, soak, worker restart, provider timeout, database failover and offline reconnection.

## 2. Release gates

Every release candidate must pass:
1. Static typecheck/lint/build.
2. Unit and integration suites.
3. Database migration forward and rollback/restore validation in non-production.
4. Tenant isolation and permission regression suite.
5. Domain-specific workflow acceptance cases.
6. Payment/booking/inventory concurrency tests.
7. Security scans and high-risk manual tests.
8. Accessibility/responsive smoke tests for key flows.
9. Observability checks: metrics, logs, traces, alerts and runbooks.
10. Regression suite for existing POS, appointment and store editor rules that remain in scope.

## 3. Test data strategy

Use isolated tenant fixtures, deterministic clocks, seeded locations/timezones, test payment provider, fake shipping adapter in automated tests, and sandbox provider accounts in integration validation. Never use production customer/payment data in test fixtures. Mask PII in test evidence.

## 4. Time and concurrency tests

Use controllable clocks for holds, payment timeouts, reminders and expiry. Test Asia/Kolkata and at least one DST-observing timezone. Booking tests must submit parallel requests for the same resource interval and group capacity. Inventory tests must run concurrent order creation against finite stock. Payment tests replay webhook events and parallel refund requests.

## 5. Test result statuses

`NOT_RUN`, `PASS`, `FAIL`, `BLOCKED`, `KNOWN_LIMITATION`, `NOT_APPLICABLE`, `NEEDS_RETEST`.

A test cannot be PASS without environment/build reference, test data identifier, execution timestamp, steps/automation output and evidence link/path. A known limitation must reference a signed-off decision/defect, not be used to hide a regression.

## 6. Defect severity

- P0: cross-tenant exposure, unauthorized money movement, data loss, duplicate capture, systemic double-booking, platform unavailable.
- P1: major core workflow blocked or materially incorrect with no reasonable workaround.
- P2: important defect with workaround, partial workflow failure or incorrect noncritical display.
- P3: cosmetic, minor usability or low-impact edge issue.

## 7. Completion definition

A feature is complete only when implementation, authorization, migrations, unit/integration/E2E tests, failure states, observability, docs, accessibility basics and acceptance evidence are complete. A UI that only looks functional is not complete.

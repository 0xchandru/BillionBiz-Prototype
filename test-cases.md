# Test Case Management

## 1. Source of truth

`management/test-cases.csv` is the test definition register. Each case has a stable ID. Never renumber an existing case; create a new ID for new scope. Keep requirement-to-test mapping in `management/requirement-test-traceability.csv`. `management/test-runs.csv` is the append-only execution history; add one row for every run and retest.

## 2. Required test case fields

ID, requirement ID, domain, title, type, priority, preconditions, test data, steps, expected results, automation level, environment, status, build/commit, actual result, evidence, defect ID, owner and execution timestamp.

## 3. Coverage requirements

Each critical requirement needs:
- Happy path.
- Validation/negative path.
- Permission/tenant path.
- Failure/retry path when integrations/jobs are involved.
- Concurrency path when shared resources/money/stock/capacity are involved.
- Audit/history verification for sensitive operations.

## 4. Traceability

Every `REQ-*` has one or more `TC-*` IDs. Every P0 security/financial requirement also maps to `SEC-*`. A requirement without a test is a coverage gap, not complete.

## 5. Execution rules

- Use reproducible test data and isolated tenants.
- Record exact build/commit and environment.
- Attach screenshots/logs/trace IDs without PII/secrets.
- A failed test creates a defect with severity, reproduction, expected/actual result and evidence. Do not overwrite previous run rows when a retest passes; update only the current summary status on the case definition.
- After a fix, set test to `NEEDS_RETEST`; do not erase the failure history.
- `BLOCKED` requires reason and owner; `KNOWN_LIMITATION` requires an approved decision.

## 6. Automation

Automate deterministic unit/API/integration/concurrency cases first. E2E should focus on high-value user journeys and avoid brittle selectors. Use stable test IDs and seed data. Provider operations should use sandbox adapters, with a separate controlled live integration smoke test.

## 7. Run history

Each execution row records test case ID, exact environment, build/commit, run type, status, tester, timestamp, duration, sanitized result/evidence, defect and trace ID. A case may have many run records. The latest result shown in `test-cases.csv` is a convenience summary, not the full history.


## V2 experience test coverage

The V2 additions include tests for public landing CTAs, idempotent signup/store provisioning, OIDC/session controls, role routing, expandable navigation, Quick Find tenant scoping, People, staff invitation/access, separate POS shell and counter assignment, mail delivery/retry, marketplace Coming Soon behavior, host/domain/TLS checks, brand consistency, dashboard database truth, clean tenant empty states, realtime recovery and settings authorization. All new tests begin as NOT_RUN. Update actual results/evidence only after execution.

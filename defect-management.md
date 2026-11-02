# Defect and Issue Management

## 1. Source of truth

`management/defects.csv` is the defect register. Do not keep defects only in chat, commit messages or free-form notes.

## 2. Required defect record

Each defect contains stable ID, title, severity, priority, domain, environment/build, affected requirement/flow/task/test/security IDs, preconditions, exact reproducible steps, expected result, actual result, evidence, logs/trace ID, tenant-safe sample data, workaround, owner, status, fix commit, retest result and closure date.

## 3. Severity

- **S0 Critical:** cross-tenant exposure, unauthorized financial action, systemic duplicate charges, confirmed double booking, irreversible data loss, secret exposure or active compromise. Disable/contain affected operation immediately.
- **S1 High:** major business workflow unavailable or security/data integrity issue with broad impact and no safe workaround.
- **S2 Medium:** important workflow degraded with a workable alternative; incorrect but bounded behavior.
- **S3 Low:** cosmetic, wording, minor usability or low-impact edge case.

Priority is separate from severity. Product owner may prioritize S2/S3, but cannot reclassify a security/data-integrity defect without documented reasoning.

## 4. Lifecycle

`NEW -> TRIAGED -> IN_PROGRESS -> FIXED -> RETEST -> VERIFIED -> CLOSED`

Alternative states: `BLOCKED`, `KNOWN_LIMITATION`, `WONT_FIX` (requires decision record), `DUPLICATE` (link canonical defect). A fix is not verified until the original reproducer and related regression tests pass. Preserve failed execution history.

## 5. Triage rules

1. Reproduce on a known build/environment.
2. Identify whether it is product defect, source/document mismatch, environment/configuration gap, provider outage or test-data issue.
3. Link requirements and flows.
4. Assign severity and affected tenants/operations.
5. For data/money/booking/security defects, stop or disable unsafe paths while investigation continues.
6. Create a task and regression test before or alongside the fix.
7. Record the fix, migration/recovery steps and retest evidence.

Never include live API keys, OTPs, PINs, card data or unnecessary customer PII in the defect register.

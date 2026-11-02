# Project Management Registers

All CSV files in this directory are intended to be editable in Excel/Google Sheets and consumable by an AI agent or issue-import script. Keep the header names and stable IDs unchanged. Use semicolon-separated explicit IDs in machine-readable registers; do not use compressed ranges there. Append to run logs instead of overwriting historical executions.

| Register | Purpose | Update rule |
|---|---|---|
| `requirements.csv` | Requirement acceptance and ownership | Create one stable requirement per independently testable behavior; do not reuse IDs |
| `tasks.csv` | Implementation backlog | Update status/dependencies/evidence as work progresses |
| `test-cases.csv` | Functional, integration, concurrency and recovery case definitions | Keep definitions stable; link each case to requirements |
| `test-runs.csv` | Append-only history of functional test executions | Add one row per execution/retest; never overwrite prior runs |
| `security-test-runs.csv` | Append-only security test execution history | Record authorized scope, sanitized evidence and retest lineage |
| `agent-execution-log.csv` | Agent/human work log by phase and commit | Add a checkpoint row at meaningful milestones and handoffs |
| `security-tests.csv` | Security verification register | Scope every test to an authorized environment and record evidence |
| `flows.csv` | Workflow owner/version/status/links | Update when flow or traceability changes |
| `requirement-test-traceability.csv` | Requirement-to-task/flow/test/security coverage | No P0/P1 requirement may be marked verified without linked passing tests |
| `defects.csv` | Defect triage, fix and retest register | Keep failures and retest evidence; never delete defect history |
| `agent-checkpoint.md` | Session recovery state | Update before session limit or major handoff |

## Stable IDs

- Requirements: `REQ-<DOMAIN>-NNN`
- Tasks: `T-NNN`
- Flows: `FL-<DOMAIN>-NNN`
- Test cases: `TC-<DOMAIN>-NNN`
- Security tests: `SEC-NNN`
- Defects: `BUG-NNNN`

Never reuse a retired ID. Mark it `DEFERRED` or `SUPERSEDED` and link the decision.

## CSV status values

- Task: `NOT_STARTED`, `READY`, `IN_PROGRESS`, `BLOCKED`, `READY_FOR_REVIEW`, `VERIFIED`, `DEFERRED`.
- Test: `NOT_RUN`, `PASS`, `FAIL`, `BLOCKED`, `KNOWN_LIMITATION`, `NOT_APPLICABLE`, `NEEDS_RETEST`.
- Requirement: `DRAFT`, `APPROVED`, `IN_PROGRESS`, `VERIFIED`, `DEFERRED`.
- Flow: `DRAFT`, `IN_REVIEW`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`, `DEPRECATED`.

Do not mark any register item verified without evidence.


## V2 register rules
- Keep prior task/requirement/test/security/flow IDs stable. Append new unique IDs.
- Proposed hostnames remain unverified until DNS/TLS evidence exists.
- Signup, store provisioning, portal routing, staff invitations, counter assignment, email delivery, domain activation and dashboard freshness require dedicated flow/test evidence.
- Dashboard tests must compare displayed values with persisted tenant-scoped fixtures; API absence must not fall back to mock data.
- POS UI is a separate shell; Merchant Admin POS & Counters is configuration only.
- `COMING_SOON` extensions cannot be installed. Core transactional email is a required service, even if marketing extensions are unavailable.


## Requirement refinement gate

Before feature implementation, complete root `requirements-refinement.md` and task `T-062`. The requirements CSV currently contains generic draft rows; each must be made specific and testable against the supplied guides and approved architecture. Do not convert unresolved assumptions into acceptance criteria.

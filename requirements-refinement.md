# Requirements Refinement Gate

**Mandatory Phase 0 work.** The current requirement register contains rows whose titles and acceptance criteria are intentionally generic. They are not ready for implementation and must not be treated as fully specified requirements.

## Rules
1. For each ID below, inspect the corresponding domain architecture, supplied source guide(s), existing repository behavior, related flows, tasks and tests.
2. Replace generic summary and acceptance criteria with a specific, observable behavior. Do not invent business rules absent from evidence.
3. For any unresolved policy/decision, create an ADR or explicit decision question; keep the requirement `DRAFT` and mark it blocked instead of guessing.
4. Add or link test cases and security tests where applicable. Update flow/task/traceability references without changing existing IDs.
5. Preserve historical source behavior unless the approved V2 architecture deliberately changes it. Record every intended change and migration consequence.
6. Do not start implementation of the affected feature until its requirement is refined and reviewed. The architecture audit and safe repository discovery may proceed in parallel.

## Generic requirement rows requiring refinement
Total: **125**. These are existing rows in `management/requirements.csv`; IDs must not be renumbered or removed.

### Appointments (10)

- `REQ-BOOK-013`
- `REQ-BOOK-014`
- `REQ-BOOK-015`
- `REQ-BOOK-016`
- `REQ-BOOK-017`
- `REQ-BOOK-018`
- `REQ-BOOK-019`
- `REQ-BOOK-020`
- `REQ-BOOK-021`
- `REQ-BOOK-022`

### Capabilities (2)

- `REQ-CAP-007`
- `REQ-CAP-008`

### Catalogue (7)

- `REQ-CAT-011`
- `REQ-CAT-012`
- `REQ-CAT-014`
- `REQ-CAT-015`
- `REQ-CAT-016`
- `REQ-CAT-017`
- `REQ-CAT-018`

### Customers (4)

- `REQ-CUST-003`
- `REQ-CUST-004`
- `REQ-CUST-005`
- `REQ-CUST-006`

### Dashboard (4)

- `REQ-DASH-003`
- `REQ-DASH-004`
- `REQ-DASH-005`
- `REQ-DASH-006`

### Extensions (5)

- `REQ-EXT-005`
- `REQ-EXT-006`
- `REQ-EXT-008`
- `REQ-EXT-009`
- `REQ-EXT-010`

### Finance (7)

- `REQ-PAY-004`
- `REQ-PAY-005`
- `REQ-PAY-006`
- `REQ-PAY-007`
- `REQ-PAY-008`
- `REQ-PAY-009`
- `REQ-PAY-010`

### Fulfillment (4)

- `REQ-SHP-003`
- `REQ-SHP-004`
- `REQ-SHP-005`
- `REQ-SHP-006`

### Identity (8)

- `REQ-IAM-003`
- `REQ-IAM-004`
- `REQ-IAM-005`
- `REQ-IAM-006`
- `REQ-IAM-007`
- `REQ-IAM-008`
- `REQ-IAM-009`
- `REQ-IAM-010`

### Inventory (8)

- `REQ-INV-003`
- `REQ-INV-004`
- `REQ-INV-005`
- `REQ-INV-006`
- `REQ-INV-007`
- `REQ-INV-008`
- `REQ-INV-009`
- `REQ-INV-010`

### Migration (8)

- `REQ-MIG-003`
- `REQ-MIG-004`
- `REQ-MIG-005`
- `REQ-MIG-006`
- `REQ-MIG-007`
- `REQ-MIG-008`
- `REQ-MIG-009`
- `REQ-MIG-010`

### Operations (8)

- `REQ-OPS-003`
- `REQ-OPS-004`
- `REQ-OPS-005`
- `REQ-OPS-006`
- `REQ-OPS-007`
- `REQ-OPS-008`
- `REQ-OPS-009`
- `REQ-OPS-010`

### Orders (1)

- `REQ-ORD-009`

### POS (12)

- `REQ-POS-012`
- `REQ-POS-013`
- `REQ-POS-016`
- `REQ-POS-017`
- `REQ-POS-018`
- `REQ-POS-020`
- `REQ-POS-021`
- `REQ-POS-022`
- `REQ-POS-023`
- `REQ-POS-026`
- `REQ-POS-027`
- `REQ-POS-028`

### Platform Core (6)

- `REQ-CORE-003`
- `REQ-CORE-004`
- `REQ-CORE-005`
- `REQ-CORE-006`
- `REQ-CORE-007`
- `REQ-CORE-008`

### Realtime (6)

- `REQ-RT-003`
- `REQ-RT-004`
- `REQ-RT-005`
- `REQ-RT-006`
- `REQ-RT-007`
- `REQ-RT-008`

### Release (4)

- `REQ-REL-003`
- `REQ-REL-004`
- `REQ-REL-005`
- `REQ-REL-006`

### Returns (6)

- `REQ-RET-004`
- `REQ-RET-005`
- `REQ-RET-006`
- `REQ-RET-007`
- `REQ-RET-008`
- `REQ-RET-009`

### Storefront (11)

- `REQ-STORE-007`
- `REQ-STORE-008`
- `REQ-STORE-009`
- `REQ-STORE-010`
- `REQ-STORE-011`
- `REQ-STORE-015`
- `REQ-STORE-016`
- `REQ-STORE-017`
- `REQ-STORE-018`
- `REQ-STORE-019`
- `REQ-STORE-020`

### Team (4)

- `REQ-TEAM-009`
- `REQ-TEAM-010`
- `REQ-TEAM-011`
- `REQ-TEAM-012`

## Completion evidence

- Every listed row has a meaningful summary and testable acceptance criteria.
- Every P0/P1 row has at least one relevant test case or a documented, justified reason it cannot be automated.
- All flow/task/test/security references resolve to existing IDs.
- `TC-EXP-048` passes and the requirement register contains no generic `detailed requirement` placeholders.
- The agent records changed rows and source references in the execution log.

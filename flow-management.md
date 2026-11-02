# Flow and Workflow Management

## 1. Purpose

The `flows/` directory contains source-of-truth user journeys and system workflows. Each workflow must describe actor, prerequisites, trigger, main path, alternate paths, failure/recovery, permissions, domain events, side effects, data invariants and linked tests/tasks.

## 2. Required structure

Each flow file must contain:
1. Flow ID and version.
2. Goal and scope.
3. Actors.
4. Preconditions.
5. Trigger.
6. Main happy path.
7. Alternate/exception paths.
8. Backend transaction boundary.
9. Events emitted/consumed.
10. Permissions and tenant scope.
11. Failure/retry/compensation behavior.
12. Audit requirements.
13. Linked requirements, tasks, test cases and security tests.
14. Acceptance criteria.

## 3. Flow standards

- Mermaid diagrams are encouraged for sequence/state/decision flows.
- Do not put implementation details that contradict API/database architecture into UX flows.
- Every customer-facing status and merchant action must have a backend state transition.
- Define disabled/hidden behavior when a capability is off.
- Define loading, empty, failure, retry and conflict states.
- Mark provider side effects and their idempotency/reconciliation strategy.
- Version flows when meaning changes; record change in the flow index.

## 4. Change control

When a requirement changes, update the requirement, flow, task, API and test traceability in one change. A flow cannot be declared implemented until its linked test cases pass and its critical events/permissions are verified.


V2 requires explicit flows for signup/store provisioning, login/portal routing, account recovery/MFA, team invitation, counter management/POS access, transactional email, domain activation, extensions lifecycle and realtime dashboards. Flow IDs and links live in `management/flows.csv`; never treat a UI mock as a flow implementation.

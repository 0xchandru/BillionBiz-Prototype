# Task Management Protocol

## 1. Source of truth

`management/tasks.csv` is the task register. `tasks.md` defines the phase and dependency order. Update both only when a scope or dependency changes. Do not track work solely in chat messages.

## 2. Status lifecycle

- `NOT_STARTED`: no implementation started.
- `READY`: dependencies satisfied and ready to start.
- `IN_PROGRESS`: actively being implemented.
- `BLOCKED`: cannot progress due to a specific external/technical blocker; include owner and next unblock action.
- `READY_FOR_REVIEW`: code and tests complete, awaiting review/acceptance.
- `VERIFIED`: acceptance criteria and required tests pass with evidence.
- `DEFERRED`: intentionally moved out of scope by recorded decision.

Never set `VERIFIED` from code generation alone.

## 3. Priority

- `P0`: security, financial correctness, data loss, tenant isolation, core transaction correctness.
- `P1`: required launch functionality.
- `P2`: valuable follow-on functionality.
- `P3`: polish/optional improvements.

## 4. Task fields

Every task needs: stable ID, phase, domain, title, description, priority, status, dependencies, acceptance criteria, test case IDs, security test IDs where relevant, owner/agent, updated date, evidence path and blocker.

## 5. Task decomposition

Tasks should be independently testable and small enough for a bounded implementation cycle. A broad item like "build POS" must be decomposed into device, identity, cart, checkout, tender, order, inventory, register, offline and reporting tasks.

## 6. Dependency rules

Do not implement a domain before its foundations are present or explicitly stubbed behind a documented interface. Do not bypass dependency links to mark downstream tasks complete. Keep a dependency graph and identify critical path.

## 7. Agent rules

- Inspect repository and task state before doing work.
- Choose the highest-priority unblocked task in dependency order.
- Work on another unblocked task if one task is blocked.
- Update status at start, meaningful checkpoint and finish.
- Record files changed, migration, tests, evidence and remaining risks.
- Never mark a task complete without its acceptance tests.
- Never overwrite existing working code without understanding dependents.
- Do not run destructive production operations without authorized human approval.
- When session/context limits approach, write `management/agent-checkpoint.md` with exact task, branch/commit, files changed, tests, blockers and next steps. Resume from that file in the next session.

## 8. Completion and stopping

The agent must not stop merely because a phase summary was written or a partial UI was produced. It should continue through all unblocked tasks in scope and maintain a truthful completion report. However, no prompt can override a tool/runtime/session limit, unavailable credential, human approval gate or legal/security requirement. When such a limit occurs, checkpoint precisely and resume in the next authorized session. Do not claim unattended/background work continues.

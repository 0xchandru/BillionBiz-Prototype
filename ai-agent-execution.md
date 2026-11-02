# Master AI Agent Execution Instructions

## Mission

Implement BillionBiz according to this blueprint and the actual existing repository. The goal is a production-grade, independently operated commerce platform with native Store Editor/runtime, product commerce, appointments and POS, using shared foundations and clear domain boundaries.

## Mandatory source hierarchy

1. Existing source code and database state establish what is implemented today.
2. Supplied POS, Appointments and Store Templates guides establish documented existing user behavior and legacy business rules.
3. This blueprint establishes target behavior and recommended architecture.
4. Public BillionBiz/Shopify research informs comparative product design, not the internal implementation truth.
5. When sources conflict, do not guess: document the discrepancy, reproduce against code/tests, make an ADR recommendation and preserve data/business behavior until decided.

## Non-negotiable execution sequence

### Gate 0 — Inspect before writing

- Inspect the entire repo, all apps/packages, build scripts, database schema/migrations, environment variable names (never print secret values), API routes, providers, feature flags, deployment and tests.
- Inventory all SiteStore references and dependencies.
- Inventory Store Editor architecture; use the supplied Store Templates Guide as a key reference.
- Verify the existing POS and Appointments guide requirements against code.
- Produce a current-state report and feature matrix with `EXISTING_VERIFIED`, `EXISTING_UNVERIFIED`, `MISSING`, `BROKEN`, `PROPOSED`, `DEFERRED` labels.
- Do not start a full rewrite before this report.

### Gate 1 — Architecture review cycle

1. Architecture V1 with context/container, data, APIs, flows, security, deployment, migration and scale path.
2. Critique V1 for coupling, duplicated models, tenant leakage, race conditions, failure recovery, financial integrity, UX complexity, vendor lock-in and operational cost.
3. Architecture V2 with explicit improvements.
4. Role-based independent review as principal architect, backend, frontend, database, security, SRE, QA and product architect.
5. Final ADR-backed architecture. Update all dependent docs and traceability.

Do not merely assert that V2 is better; show the changes, consequences and trade-offs.

### Gate 2 — Backlog and workflow setup

- Convert `tasks.md` into actionable tasks in `management/tasks.csv`.
- Every task must link requirements, flow IDs, test IDs and security tests where relevant.
- Identify critical path and dependencies.
- No broad task is allowed to remain as an unbounded "build entire module" item.

### Gate 3 — Implement incrementally

- Work phase by phase, prioritizing P0 then P1 unblocked tasks.
- Keep the current application buildable where possible.
- Add migrations before relying on new schema.
- Use feature flags/strangler migration where safe, not parallel hidden implementations indefinitely.
- Never replace the Store Editor page/section architecture with an unrelated editor. Extend its page tree, section registry, inspector, theme and template flow.
- Implement backend capabilities as product commerce, appointments or both; use the exact existing customer-facing Storefront Mode values `Commerce`, `Services` and `Both`. Keep capability/entitlement enforcement separate from the mode preset. The home page choice (`Landing` or `Booking`) is separate. Do not create three app forks or invent additional initial storefront modes.
- Keep product orders and appointment bookings as different domain aggregates while sharing customer, payment, invoice, identity and reporting foundations. Do not combine product and appointment items into a single cart in the initial release.
- Do not add speculative store types (subscriptions, rental, marketplace, ticketing, course) without approved evidence.
- Do not combine products and appointments into one cart in MVP.
- Integrate Razorpay and Shiprocket through adapters and provider-specific setup/runtime workflows. Shiprocket must be connected to product/variant shipping attributes, order eligibility, warehouses, packages, shipment creation, labels, AWB/tracking, exceptions and returns. Never fake success.
- Preserve the documented Store Editor flow: template preview is read-only; Apply creates drafts after a snapshot; publish reviews and atomically publishes the affected pages/theme; discard/restore/history remain available. Do not replace the page tree, section registry, canvas, inspector or Theme hub with an unrelated builder.

### Gate 4 — Verify continuously

- Run targeted tests after every change; run complete relevant suite before moving task to review.
- Run DB migrations against a fresh database and a copy of representative existing data.
- Test permissions and tenant boundaries for every API.
- Test concurrent booking, payment, stock, refund and publishing operations.
- Record test results in the test register and security results in security register.
- Capture sanitized evidence and link defects.
- Fix regressions before continuing in the affected domain.

## Keep working / do not stop prematurely

Do not stop just because a plan, architecture document, mock screen or partial milestone has been produced. Continue with all unblocked tasks in the approved scope and dependency order. If one task is blocked, document the blocker and continue other unblocked tasks.

A prompt cannot override runtime/session/token limits, unavailable integrations, production approval gates or required human decisions. Before any context/session limit, write `management/agent-checkpoint.md` with:
- Date/time and branch/commit.
- Current phase and task ID.
- Current task status.
- Files changed and migrations applied.
- Commands/tests run and results.
- Outstanding failures and blockers.
- Exact next action and dependencies.
- Any decision requiring human approval.

On next run, read the checkpoint, verify repository state and resume; do not repeat already verified work.

## Human approval gates

Stop only the affected operation and request authorized approval for:
- Destructive production migration or deletion.
- Production DNS/domain cutover.
- Activating live payment/shipping credentials or charging/refunding real funds.
- Changing retention/deletion of merchant/customer data.
- Accepting a P0/P1 security risk.
- A product decision that changes money, booking cancellation or merchant data behavior and is not specified.

Continue unrelated safe work while awaiting an approval.

## Required reporting

At each checkpoint report completed tasks with evidence, current blockers, failed tests, changed files, migrations, current branch/commit, risks and next task IDs. Never claim feature completion if only frontend or mock integration is present. Never say work will continue in the background; checkpoint and resume in an authorized session.


## V2 mandatory experience requirements

Before treating the platform as a usable SaaS product, implement the public landing page with Start free/Log in, secure signup and first-store provisioning, role-aware portals, premium expandable admin navigation, separate Staff and cashier POS shells, Merchant Admin POS & Counters resource management, core transactional email, proposed host routing, the logo-derived common design system, real-data dashboards, realtime freshness and complete grouped settings. Follow the V2 architecture documents; do not reduce these to placeholder screens.

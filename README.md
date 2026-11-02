# BillionBiz Platform Blueprint

**Specification:** V2.1.0 · 2026-11-02 · See `CHANGELOG.md` for this revision.

**Purpose:** a source-of-truth product, architecture, execution, workflow, QA and security specification for rebuilding BillionBiz as a unified commerce platform.

## Start here

1. Read `product-requirements.md` and `research-and-benchmarks.md`.
2. Audit the live prototype and the files listed in `project-manifest.yaml`.
3. Read `architecture.md` and all relevant domain architecture documents.
4. Review `decisions/architecture-decisions.md`; record proposed changes there rather than silently changing the design.
5. Follow `tasks.md` in dependency order. Update the CSV registers in `management/` as work progresses.
6. Implement the flows in `flows/` and validate against `test-cases.md` and `security-test-plan.md`.
7. Start the coding agent with `AI_EXECUTION_PROMPT.md`, then follow `ai-agent-execution.md` for the detailed execution, checkpoint, recovery and completion rules.

## Project principles

- **One platform, separate experiences:** merchant admin, store editor, public storefront, POS, booking portal and staff portal share domain services and identity.
- **Capability composition:** a merchant can enable product commerce, appointments or both. The customer-facing Storefront Mode uses the existing BillionBiz vocabulary: Commerce, Services or Both. Storefront Mode is a preset, not a replacement for backend capability/entitlement checks.
- **Reuse the established Store Editor architecture:** page tree, section canvas, reusable section registry, inspector, theme controls, template gallery, responsive preview, drafts, atomic publish, version history and restore. Do not replace it with an unrelated page-builder model.
- **Native ownership:** remove SiteStore as a runtime/deployment/data dependency only after safe replacement and migration. BillionBiz owns stores, pages, templates, domains, content and published releases.
- **Modular monolith first:** explicit domain boundaries and contracts; extract services only when evidence justifies it.
- **Database is authoritative:** transactions, inventory, payment state, booking capacity and tenant boundaries are enforced server-side and at the database where possible.
- **No fake completion:** no mock data, placeholder screens, fake integrations or success toasts disconnected from real backend operations.
- **Evidence-driven progress:** every task has acceptance criteria and tests; every test has a result and evidence; every exception is recorded.

## Source documents to provide to the implementation agent

- Existing POS guide: `billionbiz-pos-guide_261023_202149(3).pdf`.
- Existing Appointments guide: `billionbiz-appointments-guide_260912_152532(1).pdf`.
- Existing Store Templates guide: `billionbiz-store-templates-guide_261016_045403.pdf`.
- Existing landing page editor screenshot and any current prototype source/repository.

The store templates guide is the controlling reference for the existing store-page setup approach. Its documented behavior includes template preview, apply-to-draft, snapshot, whole-store Publish all, discard, undo and history. Preserve and improve this architecture instead of replacing it. The public BillionBiz Storefront Mode documentation defines Commerce, Services and Both; the blueprint adopts those exact modes while separately enforcing backend capabilities.

## Files in this pack

| File | Purpose |
|---|---|
| `architecture.md` | System architecture, boundaries and target operating model |
| `CHANGELOG.md` | V2.1.0 revision summary and implementation limitations |
| `platform-experience-architecture.md` | Public landing, acquisition, signup, store provisioning, customer and internal operations experiences |
| `identity-authentication-architecture.md` | Login, signup, Google OIDC, MFA, account lifecycle and role-aware routing |
| `portal-role-and-pos-architecture.md` | Merchant Admin vs Staff Portal vs dedicated cashier POS separation |
| `domains-routing-architecture.md` | chandraprakash.social host map, tenant routing, domain verification and DNS safeguards |
| `notifications-email-architecture.md` | Transactional email, in-app notifications, delivery events and templates |
| `design-system-architecture.md` | Logo-derived color tokens, shared components and accessibility rules |
| `settings-control-plane.md` | Complete grouped settings architecture and safe settings UX |
| `realtime-data-quality-architecture.md` | Real database dashboards, mock-data removal and platform-wide realtime consistency |
| `extension-marketplace-architecture.md` | Extension catalog, install lifecycle and Razorpay/Shiprocket/Coming Soon policy |
| `product-requirements.md` | Product scope, user types and feature requirements |
| `information-architecture.md` | Merchant navigation, dashboard composition and UX rules |
| `dashboard-settings-architecture.md` | KPI definitions, analytics and settings modules |
| `release-readiness.md` | Staging, production cutover and rollback checklist |
| `deployment-and-observability.md` | Environment, CI/CD, monitoring, backup and recovery architecture |
| `defect-management.md` | Defect intake, severity, triage and retest protocol |
| `store-setup-architecture.md` | Existing Store Editor architecture and native runtime |
| `catalog-product-architecture.md` | Product creation, variants, bundles and catalog |
| `orders-fulfillment-architecture.md` | Orders, shipment, returns, refunds and Shiprocket |
| `appointments-architecture.md` | Scheduling and booking engine |
| `pos-architecture.md` | Counter, checkout, register and offline POS |
| `team-permissions-architecture.md` | Shared teams, identity, roles and access |
| `payments-finance-architecture.md` | Payments, accounting records, deposits and invoices |
| `extensions-razorpay-shiprocket.md` | Provider integrations and operational setup |
| `realtime-offline-architecture.md` | Realtime, concurrency and offline sync |
| `data-model.md` | Canonical entity model and invariants |
| `api-contracts.md` | API conventions and key command/query contracts |
| `security-architecture.md` | Security controls and threat boundaries |
| `migration-sitestore.md` | SiteStore dependency audit, data migration and cutover |
| `testing-strategy.md` | Quality gates and automation strategy |
| `tasks.md` | Sequenced implementation backlog |
| `requirements-refinement.md` | Mandatory Phase 0 refinement list for generic draft requirements |
| `task-management.md` | Status, ownership, dependencies and agent work rules |
| `test-cases.md` | Test-case management rules and coverage model |
| `security-test-plan.md` | Security test catalogue and execution requirements |
| `flow-management.md` | Flow ownership, versioning and traceability |
| `research-and-benchmarks.md` | Product benchmark notes and design principles |
| `AI_EXECUTION_PROMPT.md` | Ready-to-paste bootstrap prompt for the coding agent |
| `ai-agent-execution.md` | Detailed master instructions for an AI implementation agent |
| `project-manifest.yaml` | Project scope and operating constraints |
| `decisions/architecture-decisions.md` | Architecture decision records |
| `flows/` | User and system workflows, including the cross-cutting quality/release gate |
| `management/` | Importable requirement, task, defect, test-definition, test-run, security-test, security-run, execution-log and flow registers |
| `management/test-runs.csv` | Append-only execution/retest history for functional test cases |
| `management/security-test-runs.csv` | Append-only security assessment/retest history |
| `management/agent-execution-log.csv` | Phase/task/commit execution history and handoff log |
| `examples/` | Example store capability, page documents, portal entrypoints and brand tokens |
| `templates/` | Reusable task, test case, security test, workflow, ADR and defect templates |
| `reference/billionbiz-logo-source.png` | User-supplied logo reference used to derive the shared design tokens |

## Status convention

This pack is a **target specification**, not evidence that the prototype already implements these capabilities. The AI agent must label findings as `EXISTING_VERIFIED`, `EXISTING_UNVERIFIED`, `MISSING`, `BROKEN`, `PROPOSED` or `DEFERRED`.

## V2 experience and domain upgrades (2026-11-02)

This revision expands the domain architecture into the complete acquisition-to-operation experience. Before implementation, read `platform-experience-architecture.md`, `identity-authentication-architecture.md`, `information-architecture.md`, `portal-role-and-pos-architecture.md`, `domains-routing-architecture.md`, `notifications-email-architecture.md`, `design-system-architecture.md`, `settings-control-plane.md`, `realtime-data-quality-architecture.md` and `extension-marketplace-architecture.md`.

The proposed hosts are `chandraprakash.social`, `admin.chandraprakash.social`, `accounts.chandraprakash.social`, `staff.chandraprakash.social`, `pos.chandraprakash.social`, `api.chandraprakash.social`, restricted `ops.chandraprakash.social` and `{store}.stores.chandraprakash.social`. These are target names, not verified DNS/deployed endpoints. DNS records, certificates, OAuth credentials, mail sender records and production cutover require authorized provider access.

The supplied logo establishes shared tokens: teal `#064652`, green `#5A9A20`, yellow `#FFBF15`, warm off-white `#F6F4EE`. See `design-system-architecture.md`. Cashier POS is a separate portal; Merchant Admin → POS & Counters manages its resources. All production dashboards and operational pages must use real tenant-scoped data; demo fixtures are restricted to development/test/demo tenants.

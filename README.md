# BillionBiz Platform Blueprint

**Specification:** V2.3.0 · 2026-11-02  
**Product:** Multi-tenant commerce SaaS for merchants to build, publish and operate their own websites/stores.

## Start here

1. Read `saas-commerce-platform-architecture.md` to understand the product boundary.
2. Read `technology-stack-and-repository-architecture.md` and audit the actual source repository before adopting the target structure.
3. Read `portal-applications-and-host-routing.md` and `domains-routing-architecture.md`; each hostname must serve its own use case.
4. Read `merchant-integration-credentials-architecture.md`; client-owned provider secrets are encrypted per merchant/store in database records, never global `.env`/Vercel variables.
5. Read `native-storefront-engine-architecture.md`, `store-setup-architecture.md` and `store-data-preservation-and-versioning.md` before touching store content or schema.
6. Read `migration-sitestore.md`; SiteStore must be retired only after complete verified migration. Do not remove the native Online Store/Store Editor.
7. Use the management CSV registers, flows, tests and security test plan. Record evidence; do not mark untested work verified.
8. Run `ANTIGRAVITY_MASTER_PROMPT_V3.md` in Antigravity with access to the real repository and these reference files.

## Product boundary

BillionBiz is one merchant commerce operating platform with configurable Commerce, Services or Both storefront modes. A merchant signs up, receives a tenant/store workspace, builds a real website through the established BillionBiz Store Editor, connects their own providers, then operates products, inventory, orders, customers, bookings, POS counters, staff and analytics from Merchant Admin.

It is not a generic portal directory or a set of disconnected demos. A shared design system and API client are allowed; each host needs a distinct app experience and permission boundary.

## Mandatory V2.2 decisions

- **No SiteStore:** remove legacy SiteStore from navigation, code, APIs, data/runtime dependencies and deployment after successful data migration. Keep and improve the native Online Store, Store Editor, templates, theme, pages and publishing.
- **No data wipe on version changes:** application, database schema, page schema, template/theme and published store-release versions are separate. Every release/update must preserve merchant data and customizations. A failed publish retains the last live release.
- **Real data only:** production dashboards and all operational screens use actual tenant-scoped backend data. New stores show honest zero/empty states. No static fake KPIs, orders, customers or bookings.
- **Merchant-specific provider secrets:** Razorpay/Shiprocket and future merchant credentials are encrypted in store-scoped database records using envelope encryption; never set client secrets in `.env` or Vercel. Platform-owned secrets are separately classified.
- **Distinct subdomains:** marketing, identity, merchant admin, staff, POS, internal operations, API and storefront hosts are distinct applications/route shells. DNS aliases alone do not create those experiences.
- **Real-time:** committed database changes flow via durable outbox/workers into authenticated real-time channels; reconnects refetch authoritative state.
- **Production readiness:** laptop/ngrok backend is development or controlled beta only. Public commercial launch requires reliable always-on backend/database/storage, backups, monitoring and verified integrations.

## Domain map

| Host | Purpose |
|---|---|
| `chandraprakash.codes` | Public marketing and signup entry |
| `accounts.chandraprakash.codes` | Central identity |
| `admin.chandraprakash.codes` | Merchant Admin and Store Editor |
| `staff.chandraprakash.codes` | Invited staff work portal |
| `pos.chandraprakash.codes` | Dedicated cashier POS |
| `ops.chandraprakash.codes` | BillionBiz internal operations only |
| `api.chandraprakash.codes` | Backend API ingress |
| `*.stores.chandraprakash.codes` | Native merchant storefronts |

The user reports Name.com nameservers have been delegated to Vercel DNS, CNAMEs configured, frontend hosted on Vercel, local backend on `localhost:8080`, and ngrok forwarding to port 8080. See `deployment-domain-update.md`; values are user-reported and must be re-verified before each deployment. The temporary ngrok URL is not a production endpoint.

## Technology recommendation

Prefer TypeScript for frontend and Node.js backend, React/Next.js for separately deployed portal/storefront apps, a modular monolith API, PostgreSQL as source of truth, one ORM/migration system, Redis/BullMQ where justified, transactional outbox/inbox, authenticated WebSockets/SSE, object storage for media, REST/OpenAPI contracts, Playwright and unit/integration tests, CI/CD and OpenTelemetry-based monitoring. Existing stable choices take precedence after repository audit; do not rewrite merely to match a recommendation or prematurely split microservices. Full target is in `technology-stack-and-repository-architecture.md`.

## Key documents

| Document | Purpose |
|---|---|
| `saas-commerce-platform-architecture.md` | Product identity, merchant journey, domains and capabilities |
| `portal-applications-and-host-routing.md` | Distinct host apps, route guards and application boundary |
| `technology-stack-and-repository-architecture.md` | Language, framework, monorepo and modular backend recommendation |
| `domains-routing-architecture.md` | Host mapping, tenant/domain resolution and Vercel deployment rules |
| `merchant-integration-credentials-architecture.md` | Encrypted per-merchant provider credentials and DB model |
| `environment-and-secrets-policy.md` | Environment policy; forbids merchant provider keys in env |
| `native-storefront-engine-architecture.md` | Native website builder and storefront runtime |
| `store-data-preservation-and-versioning.md` | Non-destructive versions, publish and upgrade invariants |
| `migration-sitestore.md` | SiteStore data migration and complete retirement |
| `product-requirements.md` | Product scope and requirements |
| `architecture.md` | Cross-cutting architecture and boundaries |
| `data-model.md` | Entity model and invariants |
| `api-contracts.md` | API conventions |
| `security-architecture.md` | Security boundaries |
| `information-architecture.md` | Admin and role-specific navigation |
| `dashboard-settings-architecture.md` | Merchant dashboard and settings |
| `extension-marketplace-architecture.md` | Provider marketplace status and connection flows |
| `realtime-data-quality-architecture.md` | Live data and removal of mock data |
| `release-readiness.md` | Launch gates and sign-off |
| `deployment-and-observability.md` | Environment, operations and monitoring |
| `AI_EXECUTION_PROMPT.md` / `ANTIGRAVITY_MASTER_PROMPT_V3.md` | Implementation bootstrap/master prompt |
| `management/` | Importable tasks, requirements, traceability, tests, security tests, defects and agent execution logs |
| `flows/` | End-to-end domain workflows |
| `reference/` | Existing BillionBiz guides supplied by user; keep as controlling input when implementing the relevant module |

## Source-of-truth reference material

Preserve the existing Store Templates guide's architecture: template gallery, preview, apply-to-draft, snapshots, section/page editor, theme editing, discard, undo/history and atomic Publish all. Also preserve the supplied POS and Appointments guides as controlling references for their current flows. Do not invent or silently omit behavior from those guides.

## Status and honesty

This ZIP is a specification and execution pack, not an implementation or proof of production readiness. Agent status values must distinguish `EXISTING_VERIFIED`, `EXISTING_UNVERIFIED`, `MISSING`, `BROKEN`, `PROPOSED`, `BLOCKED` and `DEFERRED`. Every verified claim needs test evidence. Do not say the platform is built, SiteStore removed, DNS live, or payments integrated until each has been independently tested.

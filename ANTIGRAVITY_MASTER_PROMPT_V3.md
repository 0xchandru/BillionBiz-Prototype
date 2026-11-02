# BILLIONBIZ V2.3 — MASTER ANTIGRAVITY IMPLEMENTATION PROMPT

You are responsible for auditing, implementing, integrating, testing and preparing the existing BillionBiz codebase for a controlled production launch. This is a Shopify-style multi-tenant commerce SaaS product: merchants use BillionBiz to build, publish and operate their own websites and stores. It is NOT a generic portal directory, a marketplace of merchants, or a set of dashboards that display the same default page.

## Mandatory reading and source-of-truth order
1. Inspect the actual repository and current Vercel projects before changing code. Do not assume the repository matches this specification.
2. Read `README.md`, `project-manifest.yaml`, all architecture documents, ADRs, flows, tasks, requirements, functional/security test registers and execution checkpoints.
3. Read `saas-commerce-platform-architecture.md`, `portal-applications-and-host-routing.md`, `domains-routing-architecture.md`, `technology-stack-and-repository-architecture.md`, `merchant-integration-credentials-architecture.md`, `environment-and-secrets-policy.md`, `native-storefront-engine-architecture.md`, `store-data-preservation-and-versioning.md`, and `migration-sitestore.md`.
4. Treat the supplied Store Templates guide as the controlling reference for the existing Store Editor/template workflow; the supplied POS and Appointments guides are controlling references for their covered workflows. Do not replace these flows with assumptions.
5. Refine unresolved/generic requirements before implementing affected features. Preserve every existing ID. Do not claim that the existing feature set or requirements are fully specified when they are not.

## 1. Product identity and boundaries
BillionBiz lets merchants sign up, receive a private workspace/store, build a real responsive website using the native BillionBiz Store Editor, publish it on a tenant storefront domain, connect their own providers, and operate products, inventory, orders, customers, appointments/services (when enabled), POS counters, staff, analytics and settings.

Merchant Admin is the customer portal for BillionBiz clients. It manages the merchant's store and business. `ops` is a different, restricted console for BillionBiz internal operators only. Store visitors are customers of each merchant and must only see that merchant's active published storefront. Do not confuse the platform with a generic ERP/CRM or unrelated portal suite.

Commerce capabilities: Products, Services/Appointments, or Both. Use shared tenant, identity, customer, payments, notifications and reporting foundations. Product checkout and appointment booking can remain distinct transaction journeys unless a reviewed ADR explicitly justifies merging them.

## 2. Distinct subdomains and application experiences — P0
Every hostname must render the correct application experience with its own entrypoint (or rigorously host-dispatched root layout), navigation, route allow-list, authentication guard, permissions and page identity. It is a release-blocking defect if every subdomain shows the same default page, generic dashboard, mock data or navigation.

- `chandraprakash.codes`: public marketing landing page, product explanation, Start free, Log in, help/legal pages.
- `www.chandraprakash.codes`: canonical redirect to apex.
- `accounts.chandraprakash.codes`: central identity, sign in/up, verification, password recovery, MFA/passkeys when implemented, invitation acceptance and secure return routing.
- `admin.chandraprakash.codes`: merchant workspace, onboarding, real dashboard, Online Store editor, catalogue, orders, People/customers, appointments, POS & Counters resource management, Extensions, Team, Analytics and all merchant settings.
- `staff.chandraprakash.codes`: invited staff only; assigned bookings, shifts, schedule, tasks and permitted customer context.
- `pos.chandraprakash.codes`: dedicated cashier-first POS; assigned store/location/counter/register, cash session, product search/scan, cart, tender, receipt and safe offline sync where supported. Never show Merchant Admin as the POS page.
- `ops.chandraprakash.codes`: BillionBiz internal operators only, strong auth/MFA, platform tenant health, operational queues and audited support access. No public registration and no ordinary merchant dashboard.
- `api.chandraprakash.codes`: API ingress only when a real backend is deployed there. No HTML dashboard.
- `*.stores.chandraprakash.codes`: native storefront renderer; trusted hostname resolves exactly one active store and serves its published release. Unknown host => proper not-found, never a demo store.

Audit the current repo and choose either separate Vercel projects/apps (preferred where independent release/auth boundaries matter) or one deployment with strict trusted-host dispatch. Shared UI packages/API clients are encouraged; generic catch-all UI is prohibited. DNS records by themselves do not create apps. Each hostname also needs the correct Vercel project assignment, root directory/build configuration, route dispatch and TLS. Test every host in a browser/smoke test.

## 3. Merchant credentials and environment variables — mandatory
Merchant Admin serves many client stores. Each merchant owns their own Razorpay, Shiprocket and future provider accounts. Client-specific provider keys/secrets/tokens/webhook secrets MUST be saved as tenant/store-scoped encrypted database connection records, never as shared environment variables, Vercel variables, `.env` values, frontend variables or source-code constants.

Create/use a provider connection model containing: organization/store ID, provider key, TEST/LIVE mode, status, non-secret account metadata, encrypted credential envelope, key version, verification time, actor/audit history and rotation/revocation state. Enforce unique scope as appropriate. Use envelope encryption with authenticated encryption; production key-encryption keys must be managed by KMS/secret manager; local-only dev key is backend-only. Bind encryption context to tenant/store/provider/environment/connection ID. Store only ciphertext, nonce, tag and key version. Never return saved plaintext. Admin UI shows connection status, masked metadata and write-only credential fields. Only the backend adapter decrypts credentials just in time for provider calls.

Enforce tenant authorization before reading/decrypting or invoking a connection. One merchant must never see, edit, rotate, invoke or disconnect another merchant's provider account. Separate TEST and LIVE. Verify webhook signatures on raw request bytes, implement replay prevention, event inbox/idempotency and secret redaction.

Remove merchant/client plugin variables from backend `.env`, `.env.example`, Vercel variables and all frontend builds. In particular do not add per-merchant `RAZORPAY_*`, `SHIPROCKET_*`, `DELHIVERY_*`, `WHATSAPP_*`, `PLUGIN_*` or `EXTENSION_*` variables. `.env` may contain only BillionBiz platform infrastructure config and BillionBiz-owned credentials (database, server session/JWT signing, KMS reference, platform email delivery provider, platform shared OAuth app credentials where applicable, storage, queue, observability). Record each secret owner as PLATFORM or MERCHANT_CONNECTION. Public frontend variables must never contain secrets. See the credential and environment policies.

The Extensions UI is a marketplace/connection manager for merchants to connect their own providers. Razorpay and Shiprocket may be available only when their adapters and test flows actually work. Other providers can show Coming soon. Core transactional email delivery is platform infrastructure, not a client plugin credential.

## 4. Completely retire SiteStore without losing store data — P0
I do not want SiteStore anywhere in BillionBiz. Remove its navigation, dashboards, UI, routes, APIs, SDK/dependencies, backend services, jobs, webhooks, settings, permissions, env/config and deployment references after mapping and migrating all required data.

CRITICAL: Do NOT remove the native BillionBiz Online Store or Store Editor. Preserve and improve the Store Templates architecture: template gallery, responsive previews, apply-to-draft, page tree, section canvas, inspector, theme typography/colors, snapshots, draft editing, preview, undo/history, discard and atomic Publish all. Build/maintain the native storefront renderer and durable store content model. SiteStore is the legacy system to retire; Online Store is the replacement product feature.

Before removal: inventory every SiteStore reference and dependency; map current content/media/pages/themes/navigation/domains/SEO/drafts/live release/analytics to native entities; export and snapshot; build idempotent migration; dry-run counts/checksums; validate rendered pages/media/URLs; run parity tests; cut over behind a controlled feature/traffic switch; keep rollback and retention; only then remove the SiteStore runtime/data dependencies after explicit owner-approved destructive cleanup. If a mapping or validation fails, block removal and report the exact issue. Do not merely hide a sidebar link; do not simply delete files/tables.

## 5. Absolutely prevent merchant data loss during version updates — P0
The reported defect: updating a store version clears SiteStore data. Find the exact cause in update endpoints, seed scripts, ORM sync/reset, migrations, version hooks, template application, publishing, storage, deploy scripts and client state resets. Fix root cause, not symptoms.

Separate versions: platform app/build, database schema migration, page/content schema, section/template schema, theme schema, and merchant's immutable published store release. A platform deployment or template catalog update must never delete/recreate merchant content. Never run destructive ORM schema sync, reset migrations, demo seed or delete/recreate store records in production. Use expand/backfill/validate/contract migrations. Preserve unknown fields in page JSON. Template updates affect the catalog, not already customized store pages.

Persist drafts/revisions and immutable published releases. Build/validate all pages/assets first, then atomically point the store to the new active release. A failed publish keeps the previous release live. Rollback changes only the active release pointer; it must not erase orders, products, customers, bookings, assets or edit history. Backup and verify database and media references before migrations. Add before/after counts and checksums per store and block release on unexplained loss.

## 6. Real data only; remove mock data
Remove fabricated/hardcoded business data from all production portals: dashboard KPIs/charts, orders, products, inventory, customers, appointments, POS, payment/shipping status, notifications, reports and activity feeds. Every value must come from real tenant-scoped backend records/read models. New stores must display honest zero values and useful empty states. API/database outage must show a real error/stale-state message, not mock fallback. Never display success before persistence/provider confirmation. No fake `Live` indicator.

Fixtures are allowed only in isolated unit/integration/e2e test environments and never in production tenants or seed flows. Remove demo/test seeds from production startup and deployment.

## 7. Real-time and reliable operations
Database is authoritative. Use transactionally written outbox events and durable workers/queues; publish committed events to authenticated, tenant/role-scoped WebSocket or SSE channels. Implement idempotent inbox/webhook processing, reconnect/resume/refetch, event versioning, backpressure and observability. Relevant updates include orders, inventory, booking, POS transactions, payment/refunds, shipments, staff assignment, notifications, store publish and team changes. For critical operations use DB transactions, optimistic/concurrency control and idempotency keys. Inventory cannot oversell; appointment slots cannot double-book; POS sync must reconcile without duplicate sales. When real-time is disconnected, show status accurately and refetch authoritative state on reconnect.

## 8. Recommended technical architecture and languages
First inspect the actual repository. Preserve stable working technologies unless a documented ADR proves a migration is necessary. Do not rewrite the whole platform merely to match a preferred stack, and do not prematurely split into microservices.

Preferred target if the current stack is not already sound:
- Language: TypeScript end-to-end for frontend, API contracts and Node backend; SQL for schema/queries; small PowerShell scripts for Windows developer operations.
- Frontend: React with Next.js App Router for marketing, identity, merchant Admin, staff, POS and storefront apps; Tailwind CSS or existing stable UI system; shared typed design-system packages; accessible components.
- Backend: Node.js + TypeScript modular monolith (NestJS or Fastify based on repository fit) with clear domain modules and REST/OpenAPI contracts. Avoid separate microservices until scale/team/operational reasons justify them.
- Database: PostgreSQL as source of truth; Prisma or Drizzle (choose one based on current codebase); version-controlled migrations, constraints and tenant-scoped indexes/RLS where appropriate.
- Cache/jobs: Redis + BullMQ or equivalent when needed, with durable retry, dead-letter handling and idempotency.
- Realtime: authenticated WebSocket or SSE plus transactional outbox; don't make browser cache the source of truth.
- Store media: durable object storage with public/private access policies, versioned object keys and backup/retention; never production content on ephemeral local disk.
- Validation/contracts: Zod or equivalent shared schemas; OpenAPI-generated typed clients where practical.
- Testing: Vitest/Jest for units, integration tests against isolated PostgreSQL, Playwright for host/portal/merchant workflows, security tests and load tests.
- Observability: structured logs, error tracking, OpenTelemetry-compatible traces/metrics and health endpoints.

Choose one ORM and one validation approach. Record choices in ADRs. Keep apps deployable independently if that fits existing Vercel setup, while sharing packages. Backend API and workers remain separate runtimes where needed. The laptop/ngrok arrangement is development/controlled beta only, not unrestricted production hosting.

## 9. Design and merchant experience
Use one consistent design system across hosts, based on BillionBiz logo-derived colors: deep teal `#064652`, logo green `#5A9A20`, yellow `#FFBF15`, warm off-white `#F6F4EE`; verify accessibility contrast. Give each application a distinct shell appropriate to its purpose while sharing brand tokens and components. Merchant Admin should be premium and usable, with expandable navigation: Home, Orders, Appointments, Catalogue, People, Online Store, POS & Counters, Extensions, Team, Analytics, Settings. SiteStore must not appear. POS is separate. Staff sees assigned work only. Ops is internal-only.

## 10. Deployment and domains
Canonical domain is `chandraprakash.codes`. User reports Name.com nameservers delegated to Vercel DNS, records configured, frontend hosted on Vercel, backend on Windows laptop `localhost:8080`, and ngrok forwarding to that port. Local `GET /health` returned HTTP 200, status UP and database CONNECTED. Current ngrok endpoint reported by user is `https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app`; it is ephemeral and must be rechecked before use. Preserve the existing `/health` route; add `/health/live` and `/health/ready` appropriately. Never expose PostgreSQL/Redis/admin ports. Do not modify live DNS/nameservers without explicit approval. Verify each hostname's Vercel project assignment, build/root directory, routing, SSL and host-specific smoke test. Vercel frontend environment variables contain only public config or server-only backend origin where appropriate; no merchant provider credentials.

## 11. Execution and task management
Use `management/tasks.csv`, requirements, traceability, test cases, security tests, flows, defects, test/security run logs and agent checkpoint. Preserve IDs. Add unique IDs for new work. Do not mark a task VERIFIED without actual evidence. Use statuses consistently. Maintain an implementation gap matrix with EXISTING_VERIFIED, EXISTING_UNVERIFIED, MISSING, BROKEN, PROPOSED, BLOCKED or DEFERRED. Keep checkpoint updated so work can resume.

Phase A: repository/current-state audit and host map. Phase B: requirements refinement and ADR. Phase C: identity, tenancy, store provisioning, data backup/migration foundation. Phase D: distinct host applications and guards. Phase E: native storefront engine/Store Editor and SiteStore migration. Phase F: catalog/orders/payments/appointments/POS/team/extensions. Phase G: real-time, email, observability and security. Phase H: production hardening, staging, restore drills and release gates. Adjust ordering based on dependencies but document why.

For each task: inspect → implement → migrate safely → test → security-check → update registers → attach evidence. Continue independent tasks when blocked. No broad destructive change without backup, migration dry run, rollback and owner approval.

## 12. Mandatory regression/acceptance tests
- Visit every hostname and assert distinct application identity, title, shell, navigation, routes and authorization; verify no host renders the same generic mock dashboard.
- Confirm only merchant users can access `admin`; only invited assigned staff reach staff portal; only assigned cashiers reach POS; only BillionBiz operators reach ops.
- Merchant A cannot enumerate/read/change/use Merchant B's products, store, integration connections, credentials, webhooks, assets, customer records or reports.
- Save Razorpay and Shiprocket test credentials for two separate test merchants; confirm values are encrypted at rest, masked on read, unavailable in frontend/Vercel/env/logs, and only each merchant's backend adapter can use its own connection.
- Update app version, page schema, template catalog and database schema; verify each merchant's pages, themes, media, SEO, products, orders, bookings and settings remain intact.
- Force failed page migration and failed publish; verify previous published site stays live and data remains recoverable.
- Migrate SiteStore content and prove counts/checksums/render parity before removing dependencies.
- Start a new merchant tenant; dashboard must show real zero/empty state, not fake sample metrics.
- Create product/order/booking/POS transaction; confirm persistence and authorized cross-portal real-time updates.
- Verify unknown storefront hostname returns 404 and cannot fall through to another store/demo.
- Verify backend down/reconnect and outbox recovery without false success or duplicate operations.
- Security tests for IDOR/BOLA, secret retrieval, webhook replay, SSRF, XSS, CSRF where applicable, file upload, auth/session, rate limiting and tenant isolation.

## 13. Production release honesty and safety
A prompt or code scaffold does not prove production readiness. Do not claim “better than Shopify,” “fully real-time,” “secure” or “launch-ready” without measurable tests. This ZIP is a target spec, not completed implementation. Public commercial launch requires an always-on backend, durable production database and object storage, backups with restore test, monitoring/on-call process, verified DNS/TLS/email, provider live credentials and end-to-end transactions. Laptop/ngrok is temporary development/controlled beta only.

Do not perform irreversible production database migrations, remove the only copy of SiteStore data, switch live domain traffic, send real provider transactions/refunds, or change production DNS without explicit approval. First produce an audit and migration plan; then perform safe development/staging implementation. Do not stop after a plan or pretty UI—implement real backend behavior and verify it.

## First action
Audit the actual repository and the Vercel deployment mapping. Explain why all subdomains currently show the same default mock pages. Identify current apps, host routing, DB, SiteStore dependencies, version-reset mechanism, mock data sources and provider credential handling. Produce a gap report and a safe ordered migration plan. Then start implementing P0 foundational work and update the management registers. Do not ask me to repeat information already in this blueprint. Do not silently invent details. Report real blockers and continue with independent work.

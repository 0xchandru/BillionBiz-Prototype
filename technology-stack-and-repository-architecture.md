# BillionBiz Technology Stack and Repository Architecture

**Revision:** V2.2.0 · **Status:** Recommended default; repository audit has priority

## 1. Language direction

Prefer **TypeScript across frontend and Node.js backend**, plus SQL for schema/query work. Shared language and validation types reduce API contract drift. Do not rewrite stable existing code solely to match this recommendation.

## 2. Recommended stack

| Layer | Recommended default | Notes |
|---|---|---|
| Public/merchant/staff/storefront web apps | React + Next.js + TypeScript | App Router/SSR where useful; distinct app entrypoints per host |
| UI | Tailwind CSS + accessible component primitives (e.g. Radix-based library) + BillionBiz design tokens | Shared primitives, app-specific shells |
| POS | React/Next.js PWA + Service Worker + IndexedDB | Offline queue is bounded and never claims provider payment confirmation while offline |
| Backend | Node.js LTS + TypeScript + NestJS modular monolith (or current well-structured Express/Fastify app) | Domain modules and explicit application contracts; not premature microservices |
| API contracts | REST + OpenAPI; generated typed client | Versioned endpoints, request/response schemas |
| Validation | Zod or class-validator based on chosen framework | One consistent boundary strategy; don't duplicate schema definitions without generation |
| Database | PostgreSQL | Transactional source of truth, tenant constraints and migrations |
| ORM/data access | Keep existing ORM; otherwise choose Prisma or Drizzle after a small evaluation | Exactly one primary schema/migration system |
| Cache and queues | Redis + BullMQ where useful, backed by PostgreSQL outbox/inbox | Redis is not the only durable record of money or bookings |
| Realtime | Authenticated WebSockets (Socket.IO or native) and SSE for one-way updates | Per-user/store/location/counter scopes and recovery cursor |
| Files/media | S3-compatible durable object storage | Signed URLs, versioning, malware/type checks; not local laptop disk for production |
| Search | PostgreSQL full-text/trigram initially | Add dedicated search only when volume/quality justifies it |
| Testing | Vitest/Jest, API integration tests, Playwright E2E | Test real data workflows in isolated databases |
| Observability | Structured logs, OpenTelemetry, error tracking | Correlation IDs across API, workers and provider calls |
| Delivery | GitHub Actions CI + Vercel web deployments + Dockerized backend/worker | Environment-specific deploy, migration gate, rollback |

If the existing project already uses a sound framework, ORM or deployment arrangement, retain it and document why. Do not add multiple ORMs, queue systems, state managers or UI frameworks without a measured need.

## 3. Monorepo target layout

```text
apps/
  marketing/          # chandraprakash.codes
  identity/           # accounts.chandraprakash.codes
  merchant-admin/     # admin.chandraprakash.codes
  staff/              # staff.chandraprakash.codes
  pos/                # pos.chandraprakash.codes
  storefront/         # *.stores.chandraprakash.codes and verified custom domains
  platform-ops/       # ops.chandraprakash.codes
  api/                # backend API if one repository is appropriate
  worker/             # background jobs, same domain modules/contracts
packages/
  ui/
  design-tokens/
  api-client/
  auth-contracts/
  validation/
  shared-types/
  config/
infra/
  docker/
  migrations/
  scripts/
docs/
```

This is a target organization, not an instruction to move every file immediately. Map current repository first and migrate incrementally. Each Vercel project can point at its own `apps/*` root while importing shared workspace packages.

## 4. Backend modular boundaries

Suggested modules: Identity, Tenancy, Merchant Onboarding, Storefront Engine, Templates, Domains, Catalog, Inventory, Customers, Orders, Fulfillment, Appointments, Scheduling, POS, Team, Integrations, Finance, Notifications, Analytics, Audit, Platform Operations.

Each module owns its validation, application services, persistence boundary and published events. Avoid controllers writing arbitrary cross-module tables. Use explicit application contracts and transactional events.

## 5. API and code quality

- Generate OpenAPI from actual endpoint schemas and typed frontend clients.
- Keep provider-specific details behind adapters.
- Separate presentation, application/domain logic and persistence.
- Validate input server-side; never trust browser-calculated prices/permissions/tenant IDs.
- Use lint, typecheck, unit/integration/E2E, dependency scan and build gates in CI.
- No `any` spread across contracts, no giant universal service, no duplicate business logic in frontends.

## 6. Scaling path

Start as a modular monolith and split only when evidence shows a clear bottleneck or separate operational need. Keep API stateless where practical, workers independently runnable, media durable, cache rebuildable and transactions in PostgreSQL. A laptop backend is development/beta-only; production launch needs reliable always-on hosting, backups, monitoring and incident response.

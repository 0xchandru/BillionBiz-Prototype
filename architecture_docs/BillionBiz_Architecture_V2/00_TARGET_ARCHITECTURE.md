# BillionBiz Architecture V2 — Target System Design

Status: active implementation blueprint  
Supersedes: Online Store Architecture V1 where this document explicitly differs  
Routing baseline: `*.chandraprakash.codes` plus verified custom domains  
Reserved platform hosts include: `admin`, `accounts`, `staff`, `pos`, `ops`, `api`, `help`, and the full reserved-label registry.

## 1. Product and engineering objective

BillionBiz is not only a website builder. It is a multi-tenant commerce and business operating platform with a storefront composition system connected to real Catalogue, Inventory, Orders, Payments, Customers, Appointments, POS, Team and Analytics domains.

The target is not to copy another platform's implementation. The target is to provide stronger tenant safety, a clearer source of truth, safer extensibility, faster editing, more predictable publishing and better operational visibility. Claims such as "better than Shopify" must be demonstrated through measurable outcomes: reliability, storefront performance, merchant task completion, accessibility, extension safety, total operating cost and support burden.

The architecture is intentionally evolutionary. Existing working Admin Portal, Header Editor, Footer Editor and business modules remain in place while their contracts are made explicit. A wholesale rewrite would create more risk than value.

## 2. Design principles

1. **One owner per fact.** Product price belongs to Catalogue; available stock belongs to Inventory; orders belong to Orders; appointments belong to Appointments; legal/business identity belongs to the Admin business profile; public brand presentation belongs to Storefront.
2. **Hostnames never grant authorization.** A verified host resolves a public store. A signed user token and current membership authorize private merchant operations.
3. **Draft and live are different data products.** Draft edits cannot leak into public runtime. Public runtime reads an immutable active release plus explicitly live business data.
4. **Publish is an atomic pointer switch.** Build and validate the release first, insert it immutably, then activate its pointer in one transaction. A failure leaves the previous publication active.
5. **Shared renderer, explicit adapters.** Editor preview and public storefront share page resolution, theme resolution and layout composition; only their data source and editor interaction layer differ.
6. **Configuration is typed and versioned.** Theme, page, section, block and component JSON all carry schema versions and are validated at write/publish boundaries.
7. **No fake success.** Save, domain verification, upload, publish, payment and booking operations return success only after the authoritative service confirms completion.
8. **Modular monolith first.** Keep strong domain boundaries in one deployable backend until independent scaling or ownership justifies extraction.
9. **IST is a business default, not a storage timezone.** Store timestamps as UTC instants; store each merchant's IANA timezone (default `Asia/Kolkata`) for display, schedules and date boundaries.
10. **Accessibility and responsive behavior are functional requirements.** Storefront content must reflow at 300px and 320px, not merely fit a desktop screenshot.

## 3. System topology

### 3.1 Control plane

Owns platform identity, registration, organizations, memberships, permissions, store handles, domain mappings, provisioning state, feature entitlements, billing and platform operations.

### 3.2 Merchant operating plane

Owns the canonical commerce and service domains:

- Identity and organization membership
- Catalogue, products, variants, collections and product media
- Inventory balances, reservations and stock movements
- Orders, refunds and fulfillment
- Payment provider intents, capture, refund and webhook reconciliation
- Customers, customer consent and account access
- Appointments, staff/resources, availability and booking
- POS registers, sessions and offline idempotency
- Storefront presentation, pages, themes, navigation and releases
- Media assets and tenant-scoped uploads
- Team roles, permissions and audit history

These are domain modules with explicit service interfaces. A storefront renderer must not duplicate pricing, stock, payment, customer authorization or appointment rules.

### 3.3 Experience plane

One frontend deployment serves:
- Main website and account flows
- Admin Portal
- Staff Portal
- POS
- Store Editor
- Public merchant storefronts

Route selection is an application concern; it is not a substitute for API authorization. Public storefront requests are resolved by hostname/domain mapping or an explicit slug lookup used by preview/tests.

### 3.4 Runtime data flow

```text
Browser request
   |
   +--> Normalize Host / scheme / path
   |
   +--> Platform host? ------> platform application route
   |
   +--> Merchant/custom host -> exact domain mapping
                                  |
                                  +--> domain active + SSL active?
                                  |
                                  +--> store active?
                                  |
                                  +--> active release pointer
                                           |
                                           +--> typed page resolver
                                           +--> theme/chrome adapter
                                           +--> live Catalogue adapter
                                           +--> live Inventory/availability adapter
                                           +--> common StoreLayout + page renderer
```

Private admin APIs use the signed JWT tenant context. A merchant-supplied `x-store-id`, `x-organization-id`, `x-store-slug` or forwarded-host header is never allowed to change that context. Platform admins use an explicit, permission-checked tenant selection path.

## 4. Domain and tenant architecture

### 4.1 Platform host namespace

The root domain is configured once through `ROOT_DOMAIN`. The current merchant namespace is `{slug}.chandraprakash.codes`; do not silently reintroduce the old `stores.` label. All reserved host labels are centralized in the backend registry and mirrored by tests.

### 4.2 Host resolution

1. Normalize hostname, lowercase it, strip only a valid port and normalize IDNA.
2. Identify platform hosts by an explicit platform-host registry.
3. For non-platform hosts, query an exact case-insensitive `store_domains` mapping.
4. Require active store, verified domain and active TLS state.
5. Resolve to one store; reject unknown, conflicting, suspended and not-ready mappings.
6. Canonicalize to the primary host only after the destination is known to be active.
7. Scope cache, media, events, analytics and storage paths by `store_id` and release/version.

Never derive tenant authorization from an unchecked subdomain string. Never trust `X-Forwarded-Host` unless a configured trusted proxy is the only actor allowed to set it.

### 4.3 Domain lifecycle

```text
Platform subdomain:
PROVISIONING -> WILDCARD_READY -> ACTIVE

Custom domain:
CONNECTED -> DNS_PENDING -> DNS_VERIFIED -> TLS_PENDING -> ACTIVE
                         |                 |
                         +-> DNS_INVALID   +-> TLS_FAILED

Any state -> SUSPENDED
```

The wildcard host/certificate is platform infrastructure. Registration must not pretend that an individual merchant's DNS or certificate was provisioned. Custom domain ownership and TLS activation require a real hosting-provider or certificate-manager result. A pending custom domain never disables the platform hostname.

### 4.4 Tenant transaction rules

- Tenant, organization, membership, store, capability, initial settings, theme, default navigation, page catalog and initial release are provisioned idempotently.
- Unique constraints enforce normalized store slug and normalized domain mapping across organizations.
- External provider operations use durable jobs/outbox events; they are not hidden inside a database transaction.
- Retries repair missing rows and pointers but never overwrite a later publication or reassign a domain.
- A failed provisioning step remains visible as a recoverable state, not a falsely successful store.

## 5. Storefront content and data ownership

### 5.1 Presentation model

A store has:
- Public brand presentation
- Global theme token document
- Navigation configuration
- Typed page catalog and template assignments
- Global Header/Footer composition, adapted from the existing editors
- Draft revisions
- Immutable publication releases
- Domain and launch/health status

The public site does not read merchant editor Zustand/localStorage state. Header/Footer are serialized as part of the store presentation snapshot and rendered once by `StoreLayout`.

### 5.2 Page model

A page has stable identity, type, route, template key, visibility, SEO metadata and typed presentation data. Required system routes are protected. Custom page routes cannot shadow system routes, resource routes or each other.

The page resolver handles, in order:
1. Reserved system routes
2. Typed commerce/service resources (product, collection, service, article)
3. Custom pages
4. Tenant-themed 404

A product page is a product template bound to a real Catalogue product, never a free-form text page containing copied price/stock values.

### 5.3 Future section/block composition

Use a versioned registry:
- Section definition: key, schema version, supported page types, allowed blocks, data requirements, responsive rules and renderer.
- Section instance: stable ID, section key/version, settings, visibility and ordered blocks.
- Block definition: schema, renderer, parent compatibility and supported breakpoints.
- Block instance: stable ID, block key/version and typed settings.

The existing Header/Footer editors remain the global chrome owners. Their output is adapted into the same layout contract; the new page builder must not clone their controls or create a second settings owner.

No merchant-authored arbitrary React/JavaScript is evaluated. Rich text and URLs are sanitized. Custom HTML is sandboxed or tightly restricted.

## 6. Theme and design token engine

One versioned theme contract covers:
- Color roles and semantic states
- Typography families, scale, weight and line-height
- Spacing and container widths
- Borders, radii and elevation
- Buttons, inputs and focus states
- Motion and reduced-motion behavior
- Breakpoint rules
- Component-level theme variants

Theme presets are immutable starting points; applying a preset updates a draft. Explicit section-level overrides remain stable when global tokens change. Reset operations identify whether they reset one token, one group, one component override or the complete theme.

The same resolver produces CSS variables for editor preview and public runtime. A palette-only legacy object is normalized at an adapter boundary, not handled as a second theme engine.

## 7. Draft, preview, publish and rollback

### 7.1 Draft persistence

- Each page has monotonically increasing revision numbers.
- Revision creation is serialized per page and uses optimistic concurrency.
- Autosave writes only the active store's draft document.
- A stale editor receives a conflict and must reconcile; it must not overwrite silently.
- Theme, brand, navigation, footer/header and page content each have explicit save ownership.
- A dirty marker is cleared only when the server confirms the exact state that was saved. Changes made during an in-flight save stay dirty.

### 7.2 Preview

Preview is a read-only rendering mode with a signed store/user/revision scope. It may read draft data but cannot write orders, payments, bookings, emails or inventory movements. Device viewports preserve their logical CSS width while the frame scales to available editor space.

### 7.3 Publication pipeline

1. Lock the store publication row.
2. Load all persisted current draft documents and theme/chrome/settings.
3. Validate route collisions, page/template schema, required data bindings, domain readiness, asset access and release invariants.
4. Build a deterministic immutable snapshot and content hash.
5. Insert the release row.
6. Atomically update the active release pointer and publication metadata.
7. Commit.
8. Enqueue a durable `STOREFRONT_RELEASE_PUBLISHED` event for cache invalidation and connected storefront refresh.
9. Record publish audit data and metrics.

A failed build/validation/commit leaves the prior active release unchanged. Publishing is idempotent and concurrent publishers are serialized per store.

### 7.4 Rollback

Rollback creates a new release from a prior immutable snapshot and activates that new release. Historical releases are never overwritten or deleted by a rollback.

## 8. Security model

- JWT signing secret is mandatory and strong in production; known development fallback keys are rejected.
- Token claims are validated and permission changes have a bounded revocation window.
- Tenant middleware validates membership and signed tenant context.
- Private object/media paths are tenant-scoped and use signed URLs.
- Public storefront password protection is enforced at the data API, not only in React. A short-lived token is scoped to one store and checked server-side.
- Password attempts are persisted and rate-limited across application instances.
- Custom-domain verification never simulates DNS or TLS success.
- Storefront content uses `Cache-Control: private, no-store` while access control is involved; future public caching is keyed by immutable release ID.
- Publish, rollback, domain mutation, media upload and other sensitive operations are audited.
- Webhook signatures, idempotency keys, CSRF/CORS policy and request size limits are enforced at API boundaries.
- No secret provider credential appears in public release JSON.

## 9. Events, jobs and integration boundaries

Use an outbox written in the same database transaction as the state transition. A worker delivers events to realtime consumers and external providers with retries, dead-letter visibility and idempotent handlers.

Canonical event examples:
- `store.provisioning.completed`
- `store.publication.activated`
- `store.domain.status_changed`
- `store.theme.updated`
- `catalog.product.updated`
- `inventory.balance.changed`
- `orders.order.created`
- `payments.payment.status_changed`
- `appointments.booking.created`

In-memory broadcast is a fast delivery path, not the durable event store. Browser clients re-fetch authoritative state after receiving an event.

## 10. Performance, UX and accessibility budgets

Targets to measure, not claim without evidence:
- Storefront mobile LCP: p75 under 2.5 seconds on representative production traffic.
- Layout shift: CLS p75 under 0.1.
- No ordinary-content horizontal overflow at 300px and 320px.
- Immutable release data cached by `store_id + release_id`; private customer/cart/checkout data never shared-cacheable.
- Images reserve aspect ratio and use responsive variants.
- Store Editor avoids loading every block/inspector bundle before needed.
- Keyboard-operable editing tree and drag/drop alternatives.
- WCAG 2.2 AA as the product target; test focus, labels, contrast, reduced motion and errors.

## 11. Operational architecture

- Health/readiness endpoints distinguish app process, DB readiness, queue/outbox backlog and provider health.
- Structured logs include correlation ID, store ID, release ID and module; never include passwords, tokens or payment secrets.
- Metrics include API p50/p95/p99, publish duration/failure, provisioning age, domain activation age, event backlog, storefront errors and web vitals.
- Database migrations are versioned, forward-safe and tested against an empty DB and a prior production-like DB snapshot.
- Backup/restore is tested. Rollback is not a substitute for database backup.
- Deployment changes backend code; merchant content is retained in the database and does not reset when code deploys.

## 12. Delivery plan and acceptance gates

This V2 plan supersedes V1's "stop and wait for approval" instruction because the platform owner has explicitly instructed continued autonomous implementation. Work remains on a dedicated branch and production `main` is not altered directly.

### Track A — P0 integrity and security
- Tenant resolution and auth boundary
- Domain ownership and reserved handles
- Server-enforced storefront password
- Draft persistence and optimistic concurrency
- Active-release-only public rendering
- Correct rollback and publish concurrency
- Build/test automation

Exit: security tests pass; frontend/backend compile; existing main branch remains untouched.

### Track B — Storefront foundation
- Canonical page catalog and page resolver
- Theme and brand contract
- Header/Footer snapshot adapter
- Shared responsive preview frame
- Real Catalogue/Inventory/Appointment data adapters
- No mock data in public runtime

Exit: every required route resolves for COMMERCE, SERVICES and HYBRID stores; editor preview and published output are behaviorally consistent.

### Track C — Merchant editor and operations
- Overview/launch diagnostics
- Pages, Brand, Design and Settings ownership
- Navigation, menu and asset management
- Complete save/restore/undo/redo
- Accessible editor shell and mobile preview
- Domain/SSL state UI with real provider integration

Exit: every visible control is persisted, authorized, validated and recoverable.

### Track D — Extensible composition and growth
- Versioned section/block registry
- Section compatibility matrix
- Data binding and safe component runtime
- Template marketplace/import pipeline
- Search, analytics, SEO and conversion instrumentation
- Extension/plugin permission sandbox and billing/entitlements

Exit: extension schemas are validated; tenant data cannot cross boundaries; performance remains inside measured budgets.

### Definition of done

A feature is not done because it renders once. It must be authorized, tenant-scoped, persisted, validated, recoverable, accessible, tested, observable and backed by an explicit source of truth.

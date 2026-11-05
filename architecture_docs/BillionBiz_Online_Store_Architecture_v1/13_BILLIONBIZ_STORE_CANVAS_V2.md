# 13 — BillionBiz Store Canvas Architecture v2

Status: active implementation addendum  
Supersedes conflicting v1 examples and sequencing rules where this document says so.  
Domain model: `{storeHandle}.chandraprakash.codes`  
Reserved platform hosts are never valid store handles (including `www`, `admin`, `accounts`, `staff`, `pos`, `ops`, `api`, `help`, and `support`).

## 1. Product objective

Build a commerce and services storefront system that can compete with mature hosted commerce builders. Do not claim parity through a large feature checklist. Measure quality by the reliability of merchant workflows: a page edit is previewed, saved, published, observed on the customer host, and safely reversible. The system must remain fast and usable while catalogue, orders, customers, inventory, services, and appointments continue to be owned by their existing platform modules.

BillionBiz differentiators to build deliberately:

1. One page document model for all page types, not a homepage-only editor plus unrelated static routes.
2. Reusable block definitions shared by sections, product cards, service cards, navigation items, and future content surfaces.
3. Explicit design-token inheritance with visible source, override, reset and responsive states.
4. A common preview/runtime pipeline, not separately implemented editor and public renderers.
5. Immutable releases, tenant-scoped live revalidation, rollback and release diagnostics.
6. Catalogue-aware data bindings that cannot turn price, variants, inventory or booking availability into decorative fake text.
7. Schema migrations for merchant content, not platform deployments that reset content.

## 2. Core boundaries

The admin platform remains the source of truth for catalogue, inventory, price, variants, orders, customers, payments, shipping, tax, staff, service availability and bookings. The Store Canvas owns page composition, themes, brand display, navigation, SEO, visibility, custom domains and publication.

Public storefront renderers receive read models from the server. They do not query merchant editor Zustand state, browser local storage, or private admin endpoints. The editor may use local state as an optimistic working copy, but only a server-confirmed draft version is saved.

## 3. Canonical page document

Page identity is the persisted database page ID. Human-readable editor aliases (such as `landing-page`) are navigation aliases only and must be resolved by canonical path or type before data mutation.

A Page Document is versioned and contains:

- `documentVersion`: document envelope version.
- `pageId`: persisted page ID.
- `pageType`: registered page type.
- `settings`: SEO, layout, visibility and route-level configuration.
- `sections`: ordered section instances.
- `metadata`: created/updated revision, schema migrations and validation report.

A section instance has a stable ID, registered type, schema version, enabled/hidden state, settings, ordered child blocks, explicit design overrides, and responsive overrides. Reordering changes order only; it must not change identity.

Legacy section records (`id/type/name/props/isHidden`) remain readable. A migration adapter maps legacy props to registered settings and writes a versioned shape on the next successful save. Do not destroy old content during migration. Unsupported types are preserved and surfaced as a recoverable editor warning; the renderer must not execute arbitrary stored code.

## 4. Section and block registry

The registry is allowlisted platform code. It defines metadata and schemas; merchants store instances, not executable components.

A Section Definition includes:
- stable type and schema version;
- label, category, description and icon key;
- allowed page types and store capabilities;
- settings schema with defaults, validation and editor controls;
- allowed block types and min/max counts;
- presets;
- renderer key from an allowlisted renderer registry;
- responsive capabilities, data contexts and accessibility requirements;
- explicit schema migration functions.

A Block Definition includes:
- stable type and schema version;
- allowed parent sections and data contexts;
- settings schema and default settings;
- renderer key;
- accessibility requirements;
- optional binding schema.

Validation runs at both client and API boundaries. Unknown renderer keys, invalid setting types, excessive lengths/counts, external script URLs, inline event handlers, JavaScript URLs and unapproved executable HTML are rejected. The platform never evaluates merchant-supplied JavaScript or renders arbitrary React component names from stored data.

## 5. Universal block families

The registry should grow through reusable definitions rather than one-off controls.

- Content: eyebrow, heading, rich text, text, image, video, icon, button/link, divider, spacer, badge.
- Commerce: product image, product title, vendor, price, compare-at price, variant selector, quantity selector, add-to-cart, inventory message, ratings only when connected to a real reviews source.
- Collection: collection image, title, description, product grid, filter, sort, pagination.
- Service: service image, title, duration, price, staff selector when supported, availability selector, booking CTA, booking policy.
- Navigation: menu item, nested menu, logo, search, account, cart, locale selector.
- Trust/conversion: newsletter only with a real subscription endpoint, testimonials only from a real approved source, policy snippet, payment marks derived from configured payment methods.

A protected block can be visually styled but cannot be removed when it is required for a valid purchase, booking or security workflow.

## 6. Design inheritance model

Every design field resolves through one explicit cascade:

1. platform component default;
2. active theme preset;
3. store theme token;
4. page-level token override;
5. section-level override;
6. block-level override;
7. device-specific override at the most specific scope.

The editor stores only explicit overrides. A value of `inherit` means resolve from the next parent scope; it is not a copied colour value. Every design control must show its current source (e.g. “Theme → Brand primary”), offer an explicit override, and offer “Reset to inherited”. Theme changes must never overwrite an explicit section or block override.

Tokens are semantic and typed: color roles, font families, type scale, button variants, radii, borders, surfaces, spacing scale, shadows, motion, focus rings and breakpoint rules. Components consume CSS variables generated by the common ThemeTokenProvider. Per-block controls select semantic tokens by default and can opt into a custom override.

## 7. Page template and data binding model

The same renderer hosts all supported page types. Templates declare the page type, required workflows, allowed sections, data context and protected blocks. Dynamic values use typed bindings such as `product.title`, `product.price`, `collection.products`, `store.brandName`, `service.duration` and `booking.availability`.

A binding is a reference, not a copy of live data. The server resolves allowed fields in the relevant tenant and context. Merchants can style a Product Title block but cannot replace the product title in the catalogue from the theme editor. Empty data produces a truthful empty state, never seeded fake products, fake reviews, fake prices or false stock.

## 8. Rendering and preview

One rendering contract is used for:
- editor canvas Draft mode;
- editor canvas Published mode;
- external preview links;
- customer storefront runtime.

All use the same component registry, page templates, data-binding adapters, token resolver and responsive rules. The frame/viewport may differ, not the content implementation. Draft mode reads the current authenticated draft workspace; Published mode reads the active immutable release. Public rendering never consumes draft rows or editor-local state.

Preview capabilities include Desktop, Tablet, Mobile, custom width (minimum 300 CSS pixels), page selector, Draft/Published mode, refresh, loading/error states and open-in-new-tab. Device width is the logical CSS viewport width even when the editor frame is scaled down to fit the canvas.

The current shared viewport is a pragmatic component-level isolation. If editor CSS leakage remains measurable, move the exact same renderer into a sandboxed iframe with a strict origin-checked message bridge; do not duplicate the renderer to achieve isolation.

## 9. Draft, publish and propagation

A draft save creates a monotonically increasing per-page revision. Requests include the expected revision; stale writes receive a conflict and do not silently overwrite another editor session.

Publishing is one store-level transaction:
1. lock the store publication row;
2. validate all page documents, registry versions, bindings, routes, navigation and required commerce/service workflows;
3. materialize one immutable snapshot;
4. insert the release;
5. update the active release pointer atomically;
6. record a durable outbox event;
7. revalidate public caches and notify active store sessions.

A customer host fetches only the active release. Release notifications carry identifiers and revision metadata, never draft content. Customers then re-fetch the published storefront read model. Target normal propagation is within five seconds where deployment/cache topology permits, and is measured; never promise instantaneous propagation without an observed metric. Rollback creates a new release from an old snapshot and activates it; historical releases remain immutable.

## 10. Store lifecycle and domain routing

Each registered merchant gets a validated, unique handle and the default host `{handle}.chandraprakash.codes`. Reserved platform hosts are blocked by one shared validator used by availability checks, registration, admin store creation and database constraints. Host resolution is performed against the stored domain mapping; tenant context never falls back to the first store.

The default platform host is active as soon as the starter publication is provisioned. Custom domains are a separate process: ownership/DNS verification and actual TLS activation are distinct states. A domain cannot be primary until DNS is verified and HTTPS is active. Never simulate SSL success.

## 11. Editor experience

Primary navigation is Pages, Brand, Design and Settings. The Pages workspace contains a page picker, page settings, tree/layers, Add Section, contextual inspector and preview. Existing Header and Footer editors remain the dedicated global editors and persist into the common global layout document.

The inspector is schema-driven:
- Content edits values and data bindings.
- Design selects inherited tokens or explicit overrides.
- Layout edits section-level structure and spacing.
- Responsive applies only supported device-specific overrides.
- Advanced exposes safe accessibility and anchor settings, not arbitrary executable code.

For product grids, merchants configure one shared Product Card block arrangement which is reused for each real product. Do not create one editable copy per product.

## 12. Implementation sequencing

The implementation proceeds in vertical slices. Do not batch untested sections.

1. Stabilize tenant/domain, registration provisioning, page identity, draft persistence, immutable releases, rollback, live propagation and the shared preview.
2. Implement the versioned registry and legacy adapter without breaking existing merchant content.
3. Implement Hero Banner end-to-end using reusable child blocks; test schema, inspector, preview, persistence, publish, rollback, keyboard access and 300–1920px layout.
4. Implement the next section only after the previous vertical slice has passed CI and acceptance tests. Reuse block definitions wherever the semantics match.
5. Extend the same document/renderer/data binding model to shop, product, collection, cart, checkout, account, content and booking templates, preserving their canonical business workflows.

## 13. Quality gates

A section is not done because it appears on the canvas. Verify: create, select, reorder, hide/show, edit every setting, inherited/override/reset behaviour, responsive overrides, undo/redo, save, reload, multi-session conflict, Published preview, live subdomain, rollback, tenant isolation, empty/loading/error states, keyboard navigation, labels, focus, contrast and reduced motion.

A release is not done until public reads use the new active pointer and the event is durable. A feature is not done until its API, permissions, validation, empty states and production build are verified.

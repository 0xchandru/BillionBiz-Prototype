# BILLIONBIZ — MASTER EXECUTION PROMPT: REBUILD ONLINE STORE + STORE EDITOR

> **Active architecture update (2026-11-04):** Read `13_BILLIONBIZ_STORE_CANVAS_V2.md` as the current architecture authority wherever this legacy package conflicts with it. BillionBiz store hosts use `{handle}.chandraprakash.codes`; the old `.stores.` subdomain is retired. The user has explicitly approved proceeding with the section/block builder as sequential, tested vertical slices. Preserve the non-negotiable data ownership, tenant isolation, safe migration, Header/Footer and publication requirements in this document.

You are working on BillionBiz, a multi-tenant commerce and services platform. Merchants register, receive an independent store and customer-facing website on a unique subdomain, and customize that website using the BillionBiz Store Editor. The Admin Portal is the merchant's business operating system. Online Store owns website pages, themes, navigation, public presentation, domain mapping and publishing.

Read every document in this ZIP before changing code. Treat the specification and current repository as the source of truth. Inspect the repository first; do not assume a framework, database, ORM, route layout, package manager or component API.

## A. Required outcome

Deliver a Shopify-inspired, production-grade Online Store platform with:

- Independent stores with tenant-isolated content, theme, media, menus, domains, drafts and publications.
- Unique URL such as `store-handle.chandraprakash.codes` (use the configured domain suffix found in the repo).
- A complete default storefront at registration: shared header/footer, home, commerce routes, account routes, search/cart/checkout, content/policy pages, 404/maintenance, and service/booking pages for applicable store modes.
- A polished starter experience and truthful empty states. Never seed fake products, reviews, orders, stock, bookings, prices or analytics.
- Store Editor primary tabs: **Pages**, **Brand**, **Design**, **Settings**.
- Reusable preview/runtime shared by editor and public storefront.
- Existing Header Editor and Footer Editor preserved without redesign. Integrate saved output once through common Store Layout.
- Full page management, theme management, domain status, setup warnings, responsive behavior, tests and publishing as specified here.

## B. Admin Portal vs Online Store ownership

Create an ownership map of existing modules and APIs before coding. Do not duplicate forms, records or sources of truth.

| Capability | Canonical owner | Store Editor responsibility |
|---|---|---|
| Products, variants, SKUs, prices, inventory | Admin → Catalogue | Choose real products/collections to display and style them |
| Collections/categories and membership | Admin → Catalogue | Configure display/source/query presentation |
| Orders, fulfillment, refunds | Admin → Orders | Render real order/account status pages |
| Customer identity/contact/segments | Admin → People / identity | Render customer-facing account workflows |
| Payment credentials and transaction logic | Admin → Settings / Payments + server integrations | No duplicate payment connection forms |
| Shipping rates/zones and tax rules | Admin → Settings / fulfillment and tax | Read and render authoritative totals |
| Services, availability, staff, appointments | Admin → Appointments / Catalogue / Team | Render real service and booking flows |
| Legal business identity, GST, registered address, hours | Admin → Settings / business profile | Read approved public fields; do not duplicate edit forms |
| Storefront name, display logo, favicon, tagline, social URLs | Store Editor → Brand | Own public-facing brand presentation |
| Page records/templates, menus, theme tokens, storefront domain/SEO/preferences | Online Store | Own website presentation configuration |

If the actual repository has a different owner, document it and use the existing canonical owner. Do not move working data just to match this table.

## C. Preserve

1. Preserve the BillionBiz Admin Portal shell and working business modules.
2. Preserve existing Header Editor and Footer Editor UI, routes, behavior and saved data. They are already better than the rest of the editor. Do not redesign or replace them. Adapt their saved output to the shared Store Layout only if required.
3. Reuse existing `EditorLeftSidebar` and `EditorRightSidebar` if present. Refactor their interfaces where needed; do not build parallel sidebar implementations.
4. Preserve Catalogue, checkout, account, appointment, order and customer backend records.
5. Keep the existing stack and deployment approach unless repository inspection proves a real blocker.

## D. Rebuild the Store Editor first

Replace the current landing-page-only editor architecture, active legacy page set and old Brand/Design/Settings information architecture using the package documents.

- **Pages:** page picker, page/template settings, SEO and page-level properties. In Phase 1 this is not section/block authoring.
- **Brand:** public display identity, logos/favicon, tagline, brand assets and social profiles. Legal business details remain in Admin Settings.
- **Design:** active theme, presets, tokens, typography, colors, buttons, forms, surfaces, spacing, borders, shadows, responsive rules and motion.
- **Settings:** Online Store-only settings: platform/custom domains, canonical URL, storefront visibility/password mode, SEO/indexing, redirects, page defaults, social sharing and storefront preferences. Do not duplicate Admin Settings, payments, shipping, tax, inventory, customers, appointments or integrations.

Retire the current landing-page-specific editing flow and current default editable page instances from the active editor safely:

- Export/snapshot old editor configuration first.
- Migrate user-created content where a compatible destination exists.
- Archive legacy layouts/section instances and record migration status.
- Do not drop legacy tables or permanently delete records in the first migration.
- Do not touch Header/Footer editor or saved data.
- Do not publish an empty or broken website.

## E. Reusable preview is mandatory

Create a reusable `StorefrontPreview` / `StorefrontRenderer` that renders every supported typed page, not a hard-coded homepage mockup. Editor preview and public storefront must use the same real page components, tokens, global header/footer and data-loading adapters.

Preview controls: Desktop, Tablet, Mobile, custom width down to 300px, page selector, Draft/Published mode, refresh/error state and open-in-new-tab. Use real tenant data and truthful empty states. Test fixtures must be isolated from production.

Prevent editor CSS leakage. Prefer an isolated iframe with a strict validated message bridge when compatible with the actual app, otherwise use the safest equivalent and document the trade-off. Validate message origin and payload.

## F. Page catalog

Implement the page catalog and `/pages` manager described in this ZIP:

- Show system pages and merchant-created pages in a searchable/filterable table or responsive list.
- Required/system pages have a Locked/System badge; the route and core purpose cannot be deleted.
- Merchants can create, edit, duplicate, hide, archive/delete custom content pages, set URL/SEO/visibility and add them to Navigation.
- Product, collection, cart, checkout, account and booking pages are typed pages backed by their real business workflows, not generic text pages.
- Templates are type-compatible. Product data remains in Catalogue.
- Commerce, Services and Hybrid store modes conditionally provision page families.

## G. Registration and default storefront provisioning

On merchant registration:

1. Create tenant/store and owner membership using existing tenant-safe transaction/auth flows.
2. Reserve a unique store handle and reject reserved/duplicate names.
3. Assign default platform subdomain `handle.stores.chandraprakash.codes` or the suffix configured in the repo.
4. Create default theme/version, brand defaults, navigation, page catalog, required templates, header/footer references and online-store settings.
5. Create a professional starter homepage and typed templates. Do not create fake catalogue data or reviews.
6. Create an immutable starter publication and make the default subdomain resolve to it. No blank white page, unstyled fallback or cross-tenant data.
7. Show an actionable setup checklist.

Starter publication is separate from optional custom-domain setup. The default platform subdomain must work without the merchant purchasing an additional domain. Custom-domain connection can remain pending while the platform subdomain works.

## H. Draft, preview, publish and rollback

- Autosave writes only to the tenant draft workspace.
- Public storefront reads only the active immutable publication.
- Preview uses an expiring signed token scoped to tenant, store, draft revision and authorized user.
- Publish validates routes, templates, media, data bindings, navigation, domain state, policies and required configuration applicable to the store mode.
- Publish creates an immutable version, atomically switches active pointer, triggers cache invalidation/revalidation and emits a durable tenant-scoped publish event.
- Target normal successful propagation within 5 seconds where the hosting/cache layer permits, and measure it. Do not claim zero latency without evidence.
- Keep previous publications for rollback. A failed publish must leave prior live site unchanged.
- Platform code deployment must never reset merchant website content or publication pointers.

## I. Strict phase gates — do not skip

### Phase 0 — Repository audit and safe migration

Inspect code, routes, DB schema, editor state, sidebars, Header/Footer editors, tenant resolver, domain setup, public storefront, Catalogue, checkout, account, bookings, tests and deployment. Produce a current-state and migration/rollback plan. Do not perform destructive rewrite before audit and backup.

### Phase 1 — Complete every non-section feature

Implement all of the following, but **do not implement the new editable Section/Block Builder**:

- Online Store navigation and four editor tabs.
- `/pages` manager and full system/custom page registry.
- Typed page templates/routes for all required page types.
- Brand, Design and Online Store Settings.
- Themes library/management and design-token foundation.
- Shared storefront renderer/preview with existing Header/Footer output.
- Default starter store and automatic subdomain provisioning/resolution.
- Navigation, SEO, media and page shells wired to real owning modules.
- Draft/live versioning, atomic publish, rollback, domain state and setup warnings.
- 300px storefront responsiveness, accessibility, security and performance work.
- All automated and manual tests in this package.

Phase 1 can use a polished system-managed starter composition and predefined template renderers, but must not expose add/remove/reorder section or block controls. Do not create a second landing page editor under another name.

**Do not start Phase 2 until Phase 1 is fully implemented and verified.** Then stop and present completed modules, migration outcome, actual passing/failing test evidence, known limitations, preview/screenshots and the remaining section plan. Ask whether the user approves starting the Section/Block Builder. Do not continue without explicit yes.

### Phase 2 — Section/Block framework + one section only

Only after explicit approval:

1. Implement section registry/schema/instance/block model, editor tree, inspector, drag/drop, selection, responsive settings, undo/redo, draft persistence and renderer integration.
2. Implement **one first section only** (recommended: Hero Banner) end-to-end: schema, controls, preview, persistence, responsive behavior, validation, accessibility and tests.
3. Test the first section across supported contexts and 300, 320, 360, 390, 768, 1024 and desktop widths.
4. Stop. Show results and ask whether to refine this same section or approve the next section.

### Phase 3 onward — one section per user approval

For each approved section:
- Implement exactly one new section end-to-end.
- Never batch multiple sections.
- Never move to another section automatically.
- Run unit, schema, integration, visual, responsive, accessibility, tenant-isolation and publish tests.
- Show the actual controls and preview.
- Ask whether the user wants changes to the same section or approves the next one.
- Stop and wait for explicit approval. Silence or unrelated requests do not count as approval.

## J. Definition of done

- A page is not complete just because it renders. Verify persistence, authorization, tenant isolation, validation, error/empty/loading states, responsive behavior, real API integration and production build.
- Every visible button, link, menu, toggle, form, preview action and control must work. No dead controls or fake success toasts.
- Use real data or truthful empty states; no production mock data.
- No TODO/Coming Soon control for features included in the current phase. Future-phase items must be clearly marked and not misleading.
- Accessibility: labels, keyboard operation, focus visibility, reduced motion and contrast.
- Customer storefront responsive at 300px minimum.
- Do not weaken checkout/payment/order correctness for visual flexibility.
- Merchant content and snapshots survive platform deployments.
- Document deviations with reason and impact.

Start with Phase 0. Do not skip to section implementation.

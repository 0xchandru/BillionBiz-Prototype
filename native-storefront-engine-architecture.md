# Native BillionBiz Storefront Engine and Website Builder Architecture

**Revision:** V2.2.0 · **Status:** Core platform capability

## 1. Ownership

BillionBiz must own the complete merchant website lifecycle: page data, page routes, reusable sections, theme, navigation, SEO, assets, domains, drafts, previews, published releases and runtime rendering. A legacy external SiteStore is not part of the target product, runtime or admin navigation.

This is not permission to replace the existing BillionBiz Store Editor with an unrelated generic builder. Preserve the established page tree, section canvas, inspector, section registry, theme controls, template gallery, desktop/mobile preview, apply-to-draft, snapshot, discard, undo/history and atomic Publish all behavior described in the supplied Store Templates guide.

## 2. Website creation capabilities

The editor/runtime must support:
- Template selection and preview without overwriting merchant content unexpectedly.
- Home page and independent custom pages with stable routes/slugs.
- Global header, navigation, footer and reusable section definitions.
- Reorderable sections and blocks with schema-validated settings.
- Theme tokens, colors, typography, spacing, buttons, borders and responsive breakpoints.
- Desktop, tablet and mobile preview.
- Product collection/detail pages when product commerce is enabled.
- Service/offering and booking entry pages when appointments are enabled.
- Search, cart, checkout and customer account entry where commerce is enabled.
- Navigation menus, redirects, 404 page and legal/content pages.
- Metadata, canonical URL, sitemap, robots, structured data and social sharing metadata.
- Media library with private/public asset access, alt text, responsive variants and safe uploads.
- Preview token and draft preview that cannot leak to public visitors.
- Version history, compare/restore and published release rollback.
- Custom domain and default merchant subdomain support.

Only expose a page/section type when its implementation and data contract exist. Do not render inert controls or pretend arbitrary code injection is supported.

## 3. Content model and rendering

Store page structure as versioned, validated JSON documents referencing immutable section/component types and merchant content records. Renderer components are code; merchant page data is persisted data. Do not store a complete deployed application bundle inside a merchant row or allow arbitrary executable JavaScript by default.

A page document must include `schema_version`, page identity, route, status, SEO metadata, section order, section type/version and validated configuration. Draft revisions are append-only or versioned. A publish creates an immutable `store_release` snapshot and atomically updates the store's active release pointer. A failed publish leaves the previous release active.

Dynamic product/service sections reference current public catalog/offerings by IDs and render only public, active records for that store. Order/payment/booking checkout logic stays in the backend, not in page JSON.

## 4. Published runtime

The storefront runtime resolves the hostname to a verified active store, reads the active published release, applies theme/page configuration and renders the correct site. It must support caching by store/release/content version with invalidation on publish, product availability updates where relevant, domain change and store suspension.

The storefront must never render another tenant's data or draft content. Unknown host returns a real not-found response. Suspended store behavior follows a defined public status page and owner notification flow.

## 5. Publishing lifecycle

`DRAFT → VALIDATING → READY_TO_PUBLISH → PUBLISHING → PUBLISHED` or `PUBLISH_FAILED`.

Validation checks page schema versions, referenced sections, required fields, asset existence, routes/slug collisions, capability dependencies, SEO basics, domain status and link integrity. Publish is an atomic release-pointer operation after all required artifacts are ready. Keep immutable release history and a rollback pointer.

## 6. Performance and accessibility

Use CDN caching for public immutable assets and published pages where safe; use cache tags/versions for invalidation. Optimize image sizes, fonts, critical CSS and server rendering/static generation based on page freshness. Ensure keyboard access, semantic sections, alt text, contrast, reduced motion and responsive layout. Do not sacrifice accessibility to imitate a competitor.

## 7. Storefront quality tests

For every app release, test at least one clean store and one populated store in each enabled mode (Commerce, Services, Both), custom page routing, responsive behavior, SEO metadata, product/service rendering, draft isolation, publish atomicity, rollback and two-tenant isolation.

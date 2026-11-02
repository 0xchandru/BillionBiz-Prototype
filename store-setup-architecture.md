# Store Setup, Page Editor and Storefront Architecture

## 1. Governing principle

**Reuse the existing BillionBiz Store Editor architecture.** Do not replace it with a generic third-party site builder or a separate editor model. Audit the prototype and the supplied Store Templates Guide, then preserve its concepts and improve implementation quality.

Existing documented concepts include: page rail/tree, section outline, central responsive canvas, page inspector, reusable sections, Theme hub, template gallery, desktop/mobile preview, drafts, whole-store preview, atomic Publish all, discard, version history and undo/restore.

## 2. Store capabilities and Storefront Mode

Keep two distinct concepts:

- **Backend capabilities/entitlements:** whether Product Commerce and/or Appointments modules are actually enabled and allowed for this store. These guard data operations, APIs and merchant modules.
- **Storefront Mode:** the customer-facing preset already documented by BillionBiz: `Commerce`, `Services` or `Both`. It updates navigation links, cart/wishlist affordances and supported customer route families together. It is a preset, not a separate store version; all resulting fields remain merchant-editable.

The existing BillionBiz public guide says Services mode currently hides Shop/cart entry points but leaves `/checkout` and `/order-confirmation` reachable, which is a documented gap. The native implementation must close the new-checkout bypass while retaining legitimate access to existing orders/confirmation records. The guide also says Home page (Landing vs Booking funnel) is a separate setting; preserve that separation. The public guide does not verify the current admin screen path, so inspect the actual prototype before choosing a route or screen label.

## 2.1 Backend capability composition

Store capabilities are configuration on a store:

```json
{
  "capabilities": {
    "productCommerce": true,
    "appointments": false,
    "restaurantPos": false
  }
}
```

This is not a store type enum. Product-only, appointment-only and hybrid stores use one page/runtime engine. The navigation, route families, setup checklist, template compatibility and available section types are composed from capabilities.

Rules:
- Product-only stores receive shop/catalog/product/cart/checkout routes.
- Appointment-only stores receive service listing/booking/customer booking management routes; do not force product catalogue or cart setup.
- Hybrid stores receive both customer journeys with shared account/customer foundation.
- Do not make a mixed product + time-reservation cart a launch requirement.
- Do not create a new template engine per capability.

### Storefront Mode matrix

| Mode | Customer entry points | Cart affordances | Booking funnel |
|---|---|---|---|
| Commerce | Home, Shop, About, Contact | Visible | Disabled |
| Services | Home, Book, About, Contact | Hidden | Enabled |
| Both | Home, Shop, Book, About, Contact | Visible | Enabled |

The actual route guard and command/API authorization are authoritative. Hiding navigation is not route enforcement. Mode presets must not silently enable capabilities or plan entitlements. In Services mode, direct new product cart/checkout attempts must be disabled with an explanatory state; existing historical order detail/confirmation access remains available only through its authorized customer link/session.

## 2.2 Mode switching UX and settings

Expose a preview-first mode control in Online Store settings or the current Store Editor settings surface (inspect the existing prototype and retain its established navigation conventions; do not invent a conflicting second settings hub). The three modes are exactly Commerce, Services and Both. Show a small explanation of the pages/icons/entry points that will change, allow the owner to review and apply, and keep the generated navigation and icon settings individually editable afterward. Keep `Home page: Landing | Booking` separate. On save, use optimistic concurrency and persist a configuration version; publish customer-facing changes through the existing draft/release behavior if the store editor architecture requires it.

Do not create a new business mode for doctors, salons, classes or other service verticals. Those are service categories/presets within the general appointments capability. Restaurant POS remains an optional POS vertical, not an additional Storefront Mode.

## 3. Preserve editor mental model

Recommended editor layout:

- Left rail: Pages, Sections/Outline, Theme, Templates, Assets and Settings, subject to existing UI conventions.
- Center canvas: rendered page at Desktop/Tablet/Mobile breakpoints, selection outline and add-section insertion points.
- Right inspector: selected page/section settings, content, design, responsive controls and advanced settings.
- Top bar: store/page selector, undo/redo, saved/draft status, preview, history and publish.

Retain the current editor's page tree and section workflow. Avoid creating parallel navigation trees for template pages and hand-built pages.

## 4. Component/section registry

Every section definition includes:

- Stable `sectionType` identifier and semantic version.
- JSON schema for content and settings.
- Default configuration.
- Editor field definitions and validation.
- Renderer implementation.
- Responsive behavior.
- Theme token usage.
- Capability requirements (e.g. `productCommerce`, `appointments`).
- Accessibility contract and empty-state behavior.
- Migration function for older schema versions.

The editor must not execute arbitrary code stored in section JSON. Custom code/CSS is a separately permissioned advanced feature with sanitization, CSP and safe scoping.

## 5. Page document model

A page is a versioned JSON document with page metadata and an ordered collection of section instances. Section instances refer to registry types and validated JSON props. Persist draft and published documents separately or through immutable version records.

Example: `examples/store-page-document.json`.

Do not store executable JSX/HTML/JS in page content. The server validates document schema and registry capabilities before save/publish. Rendering resolves only trusted registered components.

## 6. Theme and style precedence

Recommended precedence:

`Platform defaults < Template defaults < Store theme < Page override < Section override`

More specific overrides win. Theme changes must not overwrite explicitly customized page/section styles. Provide clear controls to reset an override to inherited value. Theme tokens should cover color, typography, spacing, radius, shadow, border, button, content widths and breakpoints.

## 7. Template lifecycle — preserve existing behavior

1. Browse gallery filtered by business use case and enabled capabilities.
2. Preview read-only at Desktop/Tablet/Mobile; preview must not write drafts, live content or history.
3. Apply requires an explicit review of what changes and what is preserved.
4. Capture a full snapshot/version reference before mutation.
5. Apply template to draft state only. Preserve merchant content, media, menus, products and orders according to explicit merge rules.
6. Replace prior template-owned sections cleanly; never stack duplicate sections each time a template is applied.
7. Preview the whole draft storefront, including capability routes.
8. Publish review lists the affected pages/theme/branding and any newly generated navigation.
9. Publish atomically as a new immutable release. Failure leaves live release unchanged.
10. Discard removes current draft changes and leaves live release unchanged.
11. Restore/undo creates a new release from a selected restorable snapshot; never delete audit/history records.

The existing guide documents the rule that nothing goes live until Publish all and the publish/undo operations are all-or-nothing. Preserve that behavior.

## 8. Capability-aware pages and sections

A template declares:
- Compatible capability combinations.
- Required page families.
- Optional page families.
- Allowed section types per page.
- Design tokens and branding defaults.
- Demo/sample data definitions, if any.

If appointments is disabled, a booking section cannot be published as a broken empty route. The UI should explain that enabling Appointments is required. Enabling a capability should create only necessary route scaffolding and setup checklist entries; it must not silently invent actual services, stock or bookings.

## 9. Merchant content and catalog preservation

Template application changes design, not live product/order data. Sample product insertion must be a separately confirmed option, clearly marked as sample records and excluded from real sales analytics unless explicitly converted. Undo must not delete sample products that have been edited, sold or referenced by orders. Do not infer sample/merchant ownership from product names; persist provenance.

## 10. Store routes and navigation

Route registry should map capability and page type to a canonical path. Examples:

- `/` home
- `/products` or `/collections/:handle` (product commerce)
- `/products/:handle`
- `/cart` and `/checkout`
- `/services` (appointments)
- `/book/:offeringHandle`
- `/account`, `/account/orders`, `/account/bookings`
- static content pages by merchant-defined handle

Validate handle uniqueness within store. Navigation is merchant-editable but routes are capability-aware. Unknown, disabled or unpublished routes must return proper not-found/disabled states, not blank screens.

## 11. Publishing, domains and delivery

- Use immutable `store_release` records with release number, content hash, creator, reviewer, timestamp and page/theme references.
- Publish transaction updates the active release pointer atomically.
- CDN cache keys include release version or purge strategy. Never serve stale/draft data under a live domain unintentionally.
- Preview uses short-lived signed tokens and must not be public-indexable.
- Domain verification must protect against domain takeover, validate ownership and handle TLS certificates safely.
- SEO: canonical URLs, sitemap, robots rules, metadata, social cards and structured data appropriate to page type.

## 12. Store setup wizard

1. Create organization/business profile.
2. Create first store and choose timezone/currency/locale.
3. Choose capability: products, appointments or both.
4. Select a compatible template; allow skip.
5. Customize brand identity/theme.
6. Add products or services according to capabilities.
7. Configure location/team/payment/shipping as relevant.
8. Preview customer journeys on mobile and desktop.
9. Connect domain.
10. Review setup checklist and publish.

A checklist item is complete only when the underlying configuration exists and passes validation.

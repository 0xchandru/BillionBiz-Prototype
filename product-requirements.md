# Product Requirements — BillionBiz

## 1. Product vision

BillionBiz is a unified operating platform for businesses that sell physical products, sell services by appointment, or do both. Merchants create and manage their storefront, catalogue, orders, fulfilment, appointments, team and customer relationships from one coherent admin experience.

The platform must be approachable for a first-time merchant while remaining capable of supporting multi-location, multi-team operations.

## 2. Product model: capabilities, not rigid store types

A store has a set of enabled capabilities. For the initial product, the supported compositions are:

- `PRODUCT_COMMERCE`: physical/digital product catalogue, cart, checkout and orders.
- `APPOINTMENTS`: service catalogue, availability, booking, deposits and appointment operations.
- `PRODUCT_COMMERCE + APPOINTMENTS`: both customer journeys on one storefront, with shared identity/customer, payment and reporting foundations.

This capability model is genuinely required because the two commerce models have different transactions and fulfillment rules but should share the same merchant account, theme, customer records, navigation, payment and reporting infrastructure. It avoids separate storefront products and allows a merchant to turn capabilities on or off without changing tenant identity.

Do **not** add subscriptions, rental bookings, online courses, marketplace/multi-vendor, table reservations, ticketing or other commerce modes to the initial scope unless repository evidence or an approved product decision demonstrates a real need. Restaurant operations already present in the POS guide may be retained as an optional POS vertical capability, not a new top-level commerce engine.

### Capability behavior

- Product-only: show shop/catalog/cart/checkout and order operations; hide booking-specific setup and navigation.
- Appointment-only: show service catalogue, booking journey, calendar and appointment operations; do not force merchants to create dummy products or a product checkout catalogue.
- Hybrid: expose both product and booking journeys. Product orders and appointment bookings remain distinct domain aggregates but share customer profiles, payments infrastructure, invoices/financial records, staff permissions, navigation, analytics shell and store theme.
- A store may enable a capability later. Enabling it must guide the merchant through required configuration and must not mutate unrelated data.
- Storefront Mode choices are limited to `Commerce`, `Services` and `Both`, gated by the corresponding enabled capabilities and plan entitlements. Mode presets update navigation and customer-facing route affordances together, while each written navigation/icon setting remains individually editable. The home-page choice (Landing or Booking) remains a distinct setting.
- Do not implement a mixed cart containing products and appointments in the first release. It introduces different fulfillment, reservation and cancellation semantics. Revisit only with validated merchant demand and explicit checkout design.

## 3. Primary user groups

| User | Main goal |
|---|---|
| Platform operator | Manage tenants, plans, feature entitlements, support and platform health |
| Business owner | Set up business/store, configure catalog and services, manage staff, view sales and performance |
| Store manager | Operate assigned locations, approve exceptions and monitor teams |
| Product/catalog manager | Create and maintain products, variants, categories, bundles and stock |
| Cashier | Sell quickly, collect payment, print/share receipt and manage register |
| Fulfillment staff | Pick, pack, ship, track, process returns |
| Appointment coordinator | Manage calendar, bookings, deposits and customer communication |
| Service provider | View assigned schedule and update own booking states |
| Customer | Shop products, book services, pay and manage orders/bookings |

## 4. Admin navigation and information architecture

Recommended primary navigation:

1. **Dashboard** — overview adapted to the store's enabled capabilities.
2. **Orders** — All orders, drafts/quotes (optional if supported), fulfillment/shipments, returns, refunds and payment exceptions.
3. **Appointments** — Calendar, bookings, services, team/resources, availability and settings; only shown when enabled.
4. **Catalogue** — Products, categories, collections, bundles, inventory and import/export.
5. **Online Store** — Pages, page editor, themes, templates, navigation, domains and storefront settings.
6. **Customers** — unified customer directory, segments and activity.
7. **Team** — staff, roles, shifts, locations and access.
8. **Extensions** — installed apps/connectors, Razorpay, Shiprocket and future integrations.
9. **Analytics** — sales, order, product, inventory, staff and appointment reporting.
10. **Settings** — business profile, locations, taxes, payments, shipping, policies, notifications, security and plan.

POS is launched as a dedicated Counter experience and may be pinned/installed on cashier devices. It should not be buried as an ordinary admin subsection.

Navigation is permission- and capability-aware. Do not show a dead link or inaccessible menu item. Users with insufficient permissions should receive a clear access explanation where appropriate.

## 5. Dashboard requirements

Dashboard widgets adapt to the enabled capabilities and user permissions:

- Sales, orders and net revenue for selected period.
- Pending fulfillment, shipments with exceptions, returns and refunds requiring action.
- Top products, low/out-of-stock items and inventory health when product commerce is enabled.
- Today's appointments, pending confirmation/payment, upcoming schedule, no-shows and utilization when appointments are enabled.
- Payments, refunds and reconciliation issues.
- Recent activity and operational alerts.
- Date range, location and channel filters.

The dashboard must not combine incompatible totals or double-count deposits, refunds or voids. Explain metric definitions in the UI.

## 6. Orders and fulfillment requirements

Orders list supports search, filters, saved views, bulk actions with preview/confirmation, clear status badges and quick actions. Separate the concepts of order/payment/fulfillment/return/refund; a single status field is not sufficient.

Required pages: All Orders, order detail, fulfillment/shipments, returns, refunds, payment exceptions/reconciliation. Add draft orders/quotes only if the current prototype or product owner confirms those workflows are in scope.

Physical orders support shipment creation, tracking, label/manifest operations and delivery exceptions through Shiprocket. Digital/service orders must not be forced into shipping.

## 7. Product creation requirements

The product editor should be competitive with leading commerce platforms in speed, clarity and error prevention. Support a simple path for ordinary merchants and an advanced path for complex products.

Required fields/capabilities:
- Title, description, media, category, collections, brand/vendor and product type.
- Product status and sales-channel availability.
- Price, compare-at price, cost, tax behavior and price validity.
- Options and variants with combination matrix, variant-level SKU/barcode/price/media/weight/dimensions/inventory.
- Inventory tracking by location with stock movements and safety against overselling.
- Shipping/delivery attributes for physical products.
- SEO title/description/URL handle and structured metadata.
- Category-driven dynamic product attributes with required/recommended/optional fields and versioned validation schemas.
- Product specifications/custom attributes/metafields.
- Related products, bundles and cross-sells.
- Product readiness checklist, category-aware preview and publish/draft lifecycle.
- Duplicate detection and SKU/barcode uniqueness.
- Bulk import/export, bulk edit, source-mapping templates, validation-only dry runs, row-level error reports and safe retries.

Do not require every field on one intimidating screen. Use progressive disclosure, clear field groups, useful defaults, inline help and validation at the point of entry.

## 8. Appointments requirements

The booking engine must handle clinics/doctors, salons, studios, tutors and other time-based services without hardcoding vertical rules. Support configurable services, resources, shifts, availability, booking holds, group capacity, cancellation policies, deposits, notifications, rescheduling and staff actions.

The initial release is a general service booking engine. It must not present medical records, clinical diagnosis or regulated health workflows as included unless separately approved and designed for compliance.

## 9. Storefront experience

The merchant uses the existing Store Editor architecture. Customers see one storefront whose navigation and routes are composed from enabled capabilities. Examples:

- Product-only: Home, Shop, Categories, About, Contact, Account, Cart.
- Appointment-only: Home, Services, Book, About, Contact, Account/Bookings.
- Hybrid: Home, Shop, Services/Book, About, Contact, Account, Cart; allow merchants to rename, reorder or hide navigation entries.

Template preview, section support and page generation must be aware of required capabilities. A template can declare required/optional page families. Applying a template must not silently enable commerce capabilities or create unwanted orders/services. It may generate demo content only with explicit merchant confirmation and clear sample labels.

## 10. Usability principles

- Progressive onboarding with a checklist tied to actual setup state.
- One obvious next action per empty state.
- Defaults that work for common small businesses.
- Advanced controls available without cluttering the default path.
- Consistent terminology across admin, POS and customer experiences.
- Responsive layouts and keyboard accessibility.
- Search, filters and saved views for operational lists.
- Clear loading, empty, error, partial success and retry states.
- Destructive actions require consequence-aware confirmation.
- Save state and publishing state are visible.
- Do not hide configuration errors that prevent selling or booking.

## 11. Non-functional requirements

Tenant isolation, security, transactional correctness, observability, accessibility, localization, timezone correctness, resilience and performance are release criteria. Initial performance targets are defined as measurable objectives in `architecture.md` and must be validated under realistic load before being claimed.

## 12. Public acquisition and identity experience

The public landing page must show visible `Start free` and `Log in` actions above the fold. `Start free` must genuinely create the first private store without a payment method; do not silently enroll users in paid billing, invent free-tier quotas, or advertise pricing until an approved commercial configuration exists. Initial authentication methods are email/password and Google OIDC; owner/admin MFA and passkey enhancement are defined in `identity-authentication-architecture.md`. Do not add phone OTP or more social providers without demonstrated need.

Signup provisions an organization, owner membership, store shell and onboarding checklist. The store is available privately as a draft workspace immediately after successful provisioning; public storefront publication remains an explicit owner action. Store creation is idempotent and sends transactional confirmation email.

## 13. Role-specific application portals

Merchant Admin, Staff Portal, POS Portal, customer storefront/account and internal Platform Operations Console are distinct shells over shared identity and domain APIs. Cashier billing runs in the dedicated POS portal, not the normal admin dashboard. Merchant Admin retains POS & Counters management for locations, counters, registers, devices, staff assignments, receipts and cash management. Staff/cashier access is invitation- and assignment-scoped. See `portal-role-and-pos-architecture.md`.

## 14. Admin navigation and complete settings

Merchant Admin uses a topbar (logo, workspace selector, Quick Find, notifications, profile) and expandable left navigation. Primary groups: Home, Orders, Appointments, Catalogue, People, Online Store, POS & Counters, Extensions, Team, Analytics and Settings. See `information-architecture.md` for complete child routes. Settings are grouped in `settings-control-plane.md`.

## 15. Real data and realtime behavior

All production dashboard metrics, lists, charts, badges and notifications originate from real tenant-scoped persisted data or documented read models. Remove mock data and fake fallbacks from production, especially Dashboard. Demo fixtures are allowed only in isolated development/test/demo tenants. Real-time changes use authenticated events and authoritative refetch. See `realtime-data-quality-architecture.md`.

## 16. Brand and domain experience

Use logo-derived tokens teal `#064652`, green `#5A9A20`, yellow `#FFBF15` and warm off-white `#F6F4EE` across all shells with contrast validation. Proposed hosts are in `domains-routing-architecture.md`; actual DNS/TLS/mail records require provider values and authorized access.

## 17. Transactional communication and extensions

Account verification, welcome, store-created, invitation, security, order, payment, shipping, booking and receipt messages use the core notification service. Razorpay and Shiprocket are initial marketplace candidates; Email marketing, WhatsApp and Delhivery are Coming soon until genuinely implemented. Core transactional email is not a marketplace placeholder.

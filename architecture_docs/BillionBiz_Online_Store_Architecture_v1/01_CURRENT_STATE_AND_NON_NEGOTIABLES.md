# 01 — Current State, Screenshots and Non-negotiable Decisions

## 1. What the supplied screenshots show

1. **Merchant Admin dashboard:** top bar, quick find, notifications, merchant identity and left navigation for Orders, Appointments, Catalogue, Team, People, POS & Counters, Online Store, Plugins and Settings.
2. **Online Store → Pages & Templates:** a featured storefront banner, page search, Trash, Open Editor and page cards such as Landing page and Maintenance.
3. **Store Editor shell:** preview canvas and left `Pages` tab with grouped default pages including Landing page, Product Detail, Product Listing, Wishlist, Cart, Checkout and Booking.
4. **Brand tab:** Store Profile, Logo & Favicon, Business Details, Social Profiles, WhatsApp Widget, Domain & URLs, SEO and Social Sharing. Some settings overlap with Admin business settings and should be re-owned.
5. **Design tab:** Theme Presets, Color Palette, Typography, Buttons & Forms, Effects & Motion, Custom CSS, Loader Animation, Scroll Behavior and Mobile Navigation.
6. **Settings tab:** Launch Checklist, Language & Region, Alerts & Notifications, Refund & Returns, Privacy Policy, Terms of Service, Shipping & Delivery, Integrations and Custom Code.
7. **Current landing-page editor:** canvas, left homepage-section list and right-side inspector. This page-specific model must be replaced by the typed page/template architecture before the future section builder is introduced.

## 2. Keep unchanged

### Existing Header Editor and Footer Editor

The user explicitly says these are already better:
- Do not redesign their UI or replace their controls.
- Do not delete their routes, saved values, components or DB dependencies.
- Do not copy header/footer markup into individual page templates.
- Read existing persisted config through one adapter/contract and render through the common Store Layout.
- If their editor has its own preview, retain it; the general preview must consume the same saved output.

The common shell renders the existing global header and footer once per compatible page, with an explicit documented exception only where a secure workflow (e.g. checkout) intentionally uses a reduced shell.

### Existing Admin Portal

Keep the overall Admin Portal and working business modules. Online Store is a module inside merchant admin; public storefront is a separately routed tenant experience.

### Existing sidebars

The code reportedly has reusable `EditorLeftSidebar` and `EditorRightSidebar`. Inspect and reuse them. Refactor only as needed; do not create duplicate sidebar implementations.

## 3. Replace or retire from active editor

- Retire the current landing-page-only editor route and page-specific state model.
- Retire current default page list as source of truth; recreate from typed page catalog.
- Retire duplicated Brand fields that are merchant legal/business profile data.
- Retire duplicated Admin settings from Store Editor Settings.
- Retire page-specific hard-coded preview markup; use shared renderer.
- Archive old landing-page section instances/config before migration. Do not permanently erase in the first migration.

“Remove all existing pages” means remove the old editor page instances and implementation from the active workflow once safely migrated/archived. It does **not** mean delete Catalogue products, Orders, Customers, Bookings, policy records, publications or Header/Footer editor/data. New typed system pages/templates replace the old default-page model.

## 4. Important interpretation: starter content vs editable sections

Two requirements must both be met:
- Every new store must immediately show a polished starter website with header, footer, homepage and relevant routes.
- The new editable Shopify-style section/block builder must not be implemented until Phase 1 is done and the user approves it.

Resolve this with a **system-managed starter theme/template composition** in Phase 1. It provides a complete website using internal page components, but does not expose section/block add/remove/reorder controls. Archive legacy home sections; do not reuse the old implementation. The editable section/block engine begins only after approval.

## 5. Product principles

- Each store has its own slug, theme, pages, menus, brand, media, draft and published snapshot.
- Stores share renderer code but not tenant content/configuration.
- Storefront data is real and tenant-scoped; no demo products or fake orders in live tenants.
- Page types use domain-specific data/workflows; product details are not generic text pages.
- Shared tokens govern universal typography, color, buttons, forms, surfaces and spacing.
- Section/block editing is schema-based and safe, not arbitrary-code page building.
- Users edit drafts, preview, publish atomically and roll back.
- Setup problems are explicit actionable warnings, not unexplained badges.

# 02 — Online Store Navigation and the Four Store Editor Tabs

## 1. Recommended Admin → Online Store submenu

Keep the main Admin navigation unchanged. Use a concise submenu; low-level settings belong inside their parent area.

| Link | Purpose | Notes |
|---|---|---|
| **Overview** | Storefront status, live URL, draft/live version, last publish, setup checklist and warnings | Main entry point |
| **Pages** | Page inventory and custom page management | System and custom pages together; required pages locked |
| **Store Editor** | Main page/template and visual editor | Four tabs: Pages, Brand, Design, Settings |
| **Themes** | Theme library and active/draft theme management | Theme catalog, not another visual editor |
| **Navigation** | Menus and menu items | Header/Footer editor consumes these menu records |
| **Header & Footer** | Existing dedicated editors | Preserve existing route and UI; do not redesign |
| **Blog Posts** | Blog/article content management | Only when Blog capability is enabled |
| **Media Library** | Tenant asset browser/upload manager | Reuse same asset picker inside editor |

Keep **Domains, SEO defaults, redirects, storefront visibility, social sharing and storefront preferences** inside the Store Editor **Settings** tab unless a dedicated existing route already exists. Do not add duplicate menu entries for every setting group.

Do not add Payments, Shipping, Taxes, Inventory, Orders, Customers, Appointments, POS or Integrations under Online Store. Those remain in their existing Admin sections.

## 2. Editor frame

One editor frame:
- **Top toolbar:** back to Online Store, store/theme name, current page/template, Draft/Saved/Unsaved status, undo/redo, viewport controls, preview, Save Draft and Publish.
- **Primary tab rail:** Pages | Brand | Design | Settings.
- **Left sidebar:** context navigation for selected tab; reuse `EditorLeftSidebar`.
- **Center canvas:** reusable website preview for selected page/template.
- **Right sidebar:** context inspector for selected item or tab setting; reuse `EditorRightSidebar`.
- **Responsive layout:** rails collapse/drawer on narrow admin screens; customer preview width is independently selectable down to 300px.

Avoid showing unrelated controls in every tab. Each setting has exactly one canonical editing location.

## 3. Pages tab — page navigation and page-level configuration

Purpose: select the page/template being previewed and configure page-level properties. In Phase 1 this is template-based configuration, not section/block authoring.

Left sidebar:
- Page search.
- Groups: Storefront, Commerce, Customer Account, Content, Policies, Services (conditional), System.
- System/required lock icon and status.
- Current page selection.

Inspector options for selected page:
- Page name and route/handle.
- Assigned template and compatible template variants.
- Visibility (published/hidden/draft; required pages remain in runtime).
- SEO title, meta description, social image and canonical path.
- Indexing option where appropriate.
- Menu placement preview/link to Navigation.
- Page-specific display preferences supported by that template.
- Data-source explanation, e.g. “Product data is managed in Catalogue,” with a link to the owning Admin module.

Rules:
- Pages tab cannot edit product price/title/stock, customer, order or booking records.
- Product/collection pages display real domain data from route context.
- Cart/checkout/account pages preserve their underlying workflows.
- System pages show Locked and may expose safe presentation/SEO properties, but cannot be deleted or stripped of mandatory behavior.
- Phase 1 has no section tree, Add Section drawer or block inspector. Those are gated for a later approved phase.

## 4. Brand tab — public-facing identity only

Purpose: manage how the store identifies itself visually and publicly.

Groups:
1. **Storefront Identity:** display name, tagline, short storefront description and optional brand statement.
2. **Logos & Icons:** primary/alternate/monochrome logo, favicon, fit/clear-space/appearance, asset selection and preview.
3. **Brand Assets:** tenant-owned brand media, alt text and focal point where supported.
4. **Social Profiles:** validated public URLs for Instagram, Facebook, YouTube, X, Pinterest and other supported networks.
5. **Public Contact Display:** select which authoritative business contact fields from Admin Settings are displayed publicly. Editing legal name, registered address, GST/tax identity, hours and ownership links to Admin Settings; no duplicate inputs.

Brand assets are not the product catalog. Product photos and variants remain in Catalogue.

## 5. Design tab — theme and universal design system

Purpose: one consistent visual system across every store page.

Groups:
- Theme Presets / Active Theme.
- Color Palette and semantic roles.
- Typography and type scale.
- Buttons and links.
- Forms and controls.
- Surfaces, cards, borders and dividers.
- Layout widths, spacing scale and grid presets.
- Image ratios, object-fit and focal position defaults.
- Shadows, radius and elevation.
- Motion and page effects with accessibility controls.
- Responsive behavior presets and visibility rules.
- Theme preview, duplicate, reset-to-theme-default (confirmed), save draft.

The Design tab edits the store-wide token system. Later section/block overrides may override allowed tokens but inherit by default. Changes must update the shared preview across all selected page types.

`/themes` manages the theme library (install/duplicate/rename/version/status). Design edits the currently selected theme. Do not create two theme-token databases.

## 6. Settings tab — Online Store-only settings

### Storefront & Access
- Public/coming-soon/password-protected/maintenance mode.
- Search engine indexing state.
- Public storefront status and last published version.
- Default homepage selection where supported.

### Domains & URLs
- Platform subdomain, copy/open/test actions.
- Custom domain connect wizard.
- Primary domain selection and redirects between domains.
- DNS verification and SSL status.
- Canonical host/HTTPS state.
- Domain change and collision warnings.

### SEO & Discovery
- Default SEO title/description templates.
- Sitemap generation/status.
- Robots directives with safe defaults.
- Canonical URL rules.
- URL redirect table (source, destination, status code, optional hit tracking).
- Structured data through supported template components, not arbitrary unvalidated JSON-LD text.

### Social Sharing
- Default Open Graph image/title/description.
- Page-level overrides in Pages tab.

### Storefront Preferences
- Search/predictive search behavior, breadcrumbs, recently viewed (only if implemented), customer account display and public content defaults.
- Cookie/consent integration status and link to policy/consent owner.
- Announcement visual design remains in existing Header Editor; Settings may control enablement/targeting only if the current model needs it.

### Advanced
- Cache/revalidation status (read-only diagnostics).
- Theme compatibility/migration report.
- Config export/restore point if implemented.
- Do not expose unsafe arbitrary custom-code execution. If unavailable, omit the control or state the limitation clearly rather than shipping an inert placeholder.

Do not duplicate payment connections, refunds, shipping zones/rates, tax rules, inventory policy, appointment availability, general notifications, team permissions or legal business profile.

## 7. `/pages` manager

Recommended columns:
- Page name/icon.
- Page type (Home, Product, Collection, Content, Policy, Cart, Account, Service, System).
- URL/handle.
- Template.
- Status (Live, Draft, Hidden, Needs setup).
- Source (System or Custom).
- Last updated.
- Actions (Edit, Preview, Duplicate, Hide/Show, Delete/Archive only when allowed).

Controls:
- Search and filters by type/status/system/custom.
- Add Page wizard: title → custom content page → URL handle → template → visibility → create.
- Duplicate custom page with unique handle.
- Safe bulk actions only; never bulk-delete required pages.
- Explain why locked pages cannot be deleted.
- Responsive table becomes cards/list rows on narrow screens.

## 8. Themes manager

A theme has a name, preview thumbnail, version, capabilities and compatibility info.
- Active theme: selected in draft workspace.
- Published theme: referenced by active live snapshot.
- Draft theme: not yet live.
- Preview without applying.
- Apply/duplicate creates or updates a draft; never silently changes live site.
- Publish uses the same atomic publication workflow.
- Reset only theme tokens/overrides after confirmation; never page records or products.

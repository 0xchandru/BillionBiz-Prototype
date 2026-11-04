# 11 — Implementation Plan, Phase Gates and Acceptance Tests

## 1. Execution rule

**Finish one phase completely before starting the next.** Complete all non-section work before the editable Section/Block Builder. When the non-section acceptance gates pass, stop and request approval. After approval, implement one section at a time and stop after each for review.

## 2. Phase 0 — Discovery and safe migration

1. Map repository, frontend/backend apps, packages, deployment and host routing.
2. Inventory editor routes/components including `EditorLeftSidebar`, `EditorRightSidebar`, Header Editor and Footer Editor.
3. Map current DB models for store, theme, page, section, domains, publication, product, collection and assets.
4. Map Catalogue, Orders, People, Payments, Shipping, Taxes and Appointments APIs.
5. Capture baseline screenshots/tests for Admin and storefront.
6. Identify duplicate Brand/Settings fields; assign one canonical owner.
7. Map legacy editor data to new page/template/brand/theme config.
8. Back up legacy layouts/section instances and test restore.
9. Verify wildcard domain and current host resolver.
10. Produce implementation sequence and risk list.

Exit: no unreviewed destructive migration; data owners/routes documented; backups and rollback tested.

## 3. Phase 1 — all non-section work

### 1A. Navigation and shell
- Update Online Store submenu: Overview, Pages, Store Editor, Themes, Navigation, preserved Header/Footer, conditional Blog Posts, optional Media Library.
- Implement Overview status and setup warnings.
- Build four-tab Store Editor shell and reuse sidebars.

### 1B. Page catalog and templates
- Provision typed system catalog.
- Implement `/pages` manager for system/custom pages.
- Implement template compatibility, route collision checks, status and metadata.
- Wire typed pages to existing domain modules.
- Support Commerce/Services/Hybrid page groups.

### 1C. Brand / Design / Settings
- Brand: public identity/assets only.
- Design: global tokens and theme presets.
- Settings: Online Store-only options.
- Remove duplicated Admin-owned forms and link to canonical Admin pages.

### 1D. Preview and runtime
- Implement shared StorefrontRenderer, StoreLayout, Header/Footer adapter and typed page renderers.
- Implement preview frame, viewport controls and recoverable error states.
- Same renderer/data contracts for preview and live.

### 1E. Provisioning and domains
- Unique slug reservation.
- Wildcard subdomain resolution and tenant mapping.
- Default theme, menus, page catalog, starter templates, chrome references and initial publication on signup.
- No fake data.

### 1F. Publishing
- Draft autosave, explicit publish, validation, immutable snapshot, atomic activation, cache refresh, history and rollback.
- Separate platform code deployment from merchant content versions.

### 1G. Responsive, security and tests
- Meet 300px storefront requirement.
- Accessibility, tenant isolation, security and performance test suites.
- Verify every visible control and all empty/loading/error states.

**Phase 1 exit gate:** no section/block builder (intentionally); existing header/footer editors unchanged; every page type renders through common renderer; registration creates a complete subdomain starter; required pages locked; draft/publish/rollback/domain statuses work; tenant isolation passes; production build and relevant tests pass; manual responsive checks pass.

Then STOP and ask whether to begin Phase 2. Do not implement sections until explicit approval.

## 4. Phase 2 — section framework + first section

After approval only:
1. Build section registry/schema validation and instance/block model.
2. Add nested section/block tree to Pages editor.
3. Implement drag/reorder/duplicate/hide/remove/collapse/selection/undo/redo/autosave.
4. Build context-aware right inspector.
5. Connect preview selection to tree and inspector.
6. Implement Hero Banner only as the first section, end-to-end.
7. Test all allowed blocks and mobile behavior.
8. Stop and ask whether to refine Hero Banner or approve the next section.

## 5. Phase 3+ — one section per approval

For each single section, run schema/renderer tests, page-context compatibility, responsive 300px–desktop, accessibility/keyboard, tenant/data-binding, draft/preview/publish/rollback. Show screenshots/preview and ask whether to edit the same section or proceed to the named next one. Stop and wait after each.

## 6. Phase 1 acceptance tests

### Navigation/tabs
- Online Store links work; no dead links.
- Store Editor shows exactly Pages, Brand, Design, Settings as primary tabs.
- Switching tabs preserves draft and store context.
- Header/Footer link opens existing editor; behaviors unchanged.
- Duplicate business settings are removed and link to Admin owner.

### Pages
- Lists all system/custom pages for current tenant only.
- Required pages show Locked and cannot be deleted or stripped of mandatory routes.
- Custom create/edit/duplicate/archive/delete works with permissions/references.
- Duplicates get unique handle and copy presentation only, not business data.
- System-route collisions are rejected.
- SEO persists and preview reflects it.
- Search/filter and responsive layout work.

### Brand/design
- Brand updates persist and update shared preview.
- Logo/favicon assets are tenant-scoped; one media library.
- Legal/business fields remain Admin-owned.
- Preset apply changes draft only.
- Typography/colors/buttons update multiple page families consistently.
- Manual overrides are preserved unless reset explicitly.

### Shared preview/chrome
- Home, listing, product, collection, cart, checkout, account, content, policy, 404 and service pages preview correctly.
- Existing header/footer appears exactly once on every compatible page.
- Viewport controls work.
- Draft preview can differ from live publication.
- Invalid preview token rejected.
- Preview does not create real payment/order/booking/email side effects.

### Registration/domains
- Two registrations produce distinct tenant handles/contexts.
- Duplicate/reserved handle rejected.
- Each host resolves only its own store.
- New store gets theme, menus, pages, chrome refs and published starter.
- No fake catalogue data.
- Custom domain pending does not break platform subdomain.
- Unknown host and host spoofing fail closed.

### Real storefront data
- Product listing uses real tenant Catalogue products.
- Product detail resolves correct route product and real variants/prices/availability.
- Search uses actual search service.
- Cart mutates through cart service and correct totals.
- Checkout uses protected existing payment flow.
- Accounts show only authenticated customer's data.
- Order status authorization checked.
- Booking uses real availability and Appointment APIs.
- Empty states are truthful.

### Publish
- Draft edits do not change live site before publish.
- Invalid routes/templates/bindings are blocked.
- Successful publish atomically switches active version.
- Previous active version remains retrievable.
- Rollback restores previous visual state without deleting later versions.
- Failed publish leaves old site live.
- Measure and report live propagation.
- App deployment does not reset tenant content/publications.

### Responsive/quality
- Test 300, 320, 360, 375, 390, 430, 768, 1024, 1280, 1440px.
- No horizontal page overflow at 300/320 for ordinary content.
- Main actions, cart and checkout usable.
- Mobile header accessible.
- No image-induced layout shift or bad crop.
- Keyboard/focus/names/contrast/reduced motion pass.

## 7. Per-section acceptance template (Phase 2+)

For every section: add from library; edit all schema settings; add/reorder/remove allowed blocks; collapse/expand tree; select canvas/tree in both directions; drag and keyboard reorder; duplicate with new IDs; hide/show; undo/redo; reload and verify draft; verify no public draft leak; publish and compare with preview; rollback; test breakpoints/touch; test accessibility and data-binding authorization; reject invalid schema with clear error.

## 8. Definition of done

A route/control is done only when it persists, validates, is authorized, uses the correct source of truth, renders well, handles failure/empty/loading states and passes tests. A visual-only page is not complete.

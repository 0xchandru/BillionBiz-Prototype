# 05 — Store Editor UX and Reusable Website Preview

## 1. Primary screen layout

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Top toolbar: Back | Store/Theme | Draft status | Undo/Redo | Device | Preview │
│                                                     Save Draft | Publish      │
├───────────────────┬────────────────────────────────────┬─────────────────────┤
│ Primary tab rail  │                                    │                     │
│ Pages             │                                    │                     │
│ Brand             │        STOREFRONT PREVIEW           │    RIGHT INSPECTOR  │
│ Design            │        (same renderer as live)       │    / SETTINGS       │
│ Settings          │                                    │                     │
│                   │                                    │                     │
│ LEFT SIDEBAR      │                                    │                     │
│ tab-specific      │                                    │                     │
│ navigation        │                                    │                     │
└───────────────────┴────────────────────────────────────┴─────────────────────┘
```

Reuse `EditorLeftSidebar` and `EditorRightSidebar`. Centralize rail widths, collapse behavior and selection state so tab/page changes do not lose edits or create duplicate state.

## 2. Reusable preview architecture

Suggested API shape; adapt names to the current codebase:

```tsx
<StorefrontPreview
  storeId={storeId}
  versionId={draftVersionId}
  mode="draft"
  route={{ pageType: "home", path: "/" }}
  viewport={{ kind: "custom", width: 375 }}
  previewToken={signedPreviewToken}
  selection={null}
/>
```

Public runtime uses the same core renderer:

```tsx
<StorefrontRenderer
  requestContext={resolvedTenantAndRoute}
  publication={activePublishedSnapshot}
/>
```

Both paths call the same `StoreLayout`, `PageResolver`, page templates, design token provider and page renderers. The difference is data/version source and editor-only selection overlay.

### Required components

- `StorefrontPreview`: editor container and toolbar state.
- `PreviewViewportFrame`: viewport size/device presets and isolation boundary.
- `StorefrontRenderer`: common rendering root.
- `StoreLayout`: global structure; resolves header/footer once.
- `StoreChromeAdapter`: adapts existing Header/Footer persisted output without redesigning those editors.
- `PageResolver`: route → typed page/resource context/template.
- `PageTemplateRenderer`: typed dispatch to home/product/collection/cart/checkout/account/content/service/system templates.
- `ThemeTokenProvider`: applies versioned theme variables.
- `StoreDataAdapters`: tenant-scoped loaders for Catalogue, People, Orders, Appointments and other canonical services.
- `PreviewSelectionLayer`: editor-only outlines/selection events; never on public site.
- `PreviewErrorBoundary`: safe error and recoverable refresh/retry state.
- `PreviewBridge`: validated messages for selection, viewport and reload if iframe used.

### Preview correctness

- Preview uses current draft and reflects edits after local update/autosave without an admin refresh.
- Public site uses active immutable published snapshot only.
- Preview uses real tenant products/collections. If none exist, show real empty states.
- Customer/cart simulation must be isolated. Rendering a preview must never create real orders, payments or bookings.
- No real email, payment, booking or order side effect from preview unless user explicitly invokes a safe test action.
- Show Draft/Published status.
- Offer open-in-new-tab using a short-lived signed preview token.
- If custom domain is pending, preview still works on internal preview route and shows the domain warning separately.

Prevent CSS leakage into the editor. Prefer an isolated iframe with strict origin and payload-validated message bridge if compatible with the actual app. Otherwise use an equally safe isolation approach and document the trade-off. Never trust arbitrary postMessage payloads.

## 3. Header and footer integration — do not redesign

```text
StorefrontRenderer
  └── StoreLayout
        ├── ExistingHeaderEditorOutput (one global instance)
        ├── RoutePageRenderer (home/product/cart/etc.)
        └── ExistingFooterEditorOutput (one global instance)
```

- Existing Header/Footer editor routes and UI remain unchanged.
- Render persisted header/footer configuration once per compatible storefront page.
- Reuse Navigation menu data; do not embed a second copy of menu records in header settings.
- Use an explicit `chromeMode` for secure routes only if checkout/account rules require a reduced shell.
- If a new store lacks chrome config, provision defaults from the existing Header/Footer editor's supported default model.
- Test every page family for duplicate headers/footers.

## 4. Phase 1 editor behavior — no section/block builder

**Pages:** select page from typed catalog, select compatible template, edit page title/route/SEO/visibility, preview it. No old homepage section list, no Add Section drawer, no blocks. Archive legacy section instances and remove them from active editor.

**Brand:** edit public brand data/assets only; preview changes across page types.

**Design:** edit global tokens and preview; applying a theme preset changes draft only and must not erase page content.

**Settings:** domain/SEO/visibility/preferences forms. Domain/publication statuses come from canonical services and should not be fake editable toggles.

## 5. Future editor behavior — only after approval

- Pages editor left sidebar becomes a tree of template regions, sections and nested blocks.
- Each section row has drag handle, icon, name, selection state, visibility toggle, more-actions and collapse/expand chevron.
- Expanded sections show indented child blocks; block entries can be selected and reordered.
- Click section on canvas → matching tree row highlights; right inspector shows section settings.
- Click block → block is selected; inspector shows that block's schema-specific settings.
- Add Section opens searchable categorized compatible library with preview and insertion position.
- Add Block lists only block types permitted by selected section.
- Selecting a tree item scrolls the canvas to that item and keeps it visible.
- Drag/drop must have keyboard alternatives.
- Collapse/expand state is a UI preference and does not modify page config.

## 6. Editing and persistence

- Debounced autosave with explicit Saved/Saving/Unsaved/Error state.
- Autosave writes draft only.
- Optimistic version checks prevent silent overwrites.
- Undo/redo uses command/revision model scoped to current draft.
- Reset controls identify scope (field, page, theme, or whole draft) and require confirmation where destructive.
- Reset theme must never delete content/products.
- Offline/disconnect preserves unsent changes and reconciles safely on reconnect.
- Publish locks duplicate requests and reports real progress/failure.

## 7. Responsive preview and accessibility

Preset widths: Desktop, Tablet, Mobile, plus custom width. Minimum preview: 300px. Test widths 300, 320, 360, 375, 390, 430, 768, 1024, 1280 and 1440.

At 300px, ordinary customer content must not require horizontal page scrolling. A table may have a controlled internal overflow only where two-dimensional data is necessary; the overall page still reflows.

All controls need accessible names, keyboard access and visible focus. Drag operations need move-up/down alternatives. Escape closes dialogs. Preserve current selection after save/refresh. Warn before navigation when unsaved edits cannot be saved.

# SiteStore Removal and Native Migration Plan

## 1. Goal

The production platform must no longer depend on SiteStore for store creation, rendering, persistence, publishing, domains or runtime operations. Preserve the merchant's existing stores, content, assets, design, templates, product catalog and live behavior through a verified migration.

## 2. Do not remove first

First identify exactly what SiteStore currently owns/provides. It may be more than a renderer. Create an inventory of:

- Runtime/hosting dependencies.
- Store/page/theme/template models.
- Section/component registry and schemas.
- Asset/media storage and URLs.
- Draft/live/publish state.
- Domains/SSL and route resolution.
- Preview tokens.
- Custom CSS/branding.
- Cache/CDN and webhook dependencies.
- Analytics/SEO metadata.
- Merchant content and per-store overrides.

## 3. Migration stages

1. **Discovery:** map each SiteStore component to native BillionBiz target entity/service.
2. **Schema mapping:** define source-to-target mapping and record all unsupported fields.
3. **Compatibility layer:** if necessary, create temporary read adapter to compare old store state while new runtime is built. Do not make this adapter a long-term dependency.
4. **Importer:** idempotent import keyed by original store/object ID; preserve stable IDs or mapping table.
5. **Asset migration:** copy files, verify checksums, preserve alt text/order and update references.
6. **Draft migration:** import editor drafts separately from live release.
7. **Live snapshot:** import currently published state as an immutable native release.
8. **Dual-read verification:** compare old and new rendered data for page trees, themes, navigation and relevant routes.
9. **Merchant acceptance:** preview each migrated store and review exceptions.
10. **Canary cutover:** migrate a limited, reversible cohort first.
11. **Full cutover:** change routing/DNS only after approval, metrics and rollback readiness.
12. **Dependency removal:** remove SiteStore SDK, code, API, DB, secrets, jobs, build/deployment config only after no traffic/data dependency remains.

## 4. Migration invariants

- No product/order/customer/payment/booking data loss.
- Product parent/variant mapping preserves SKU, options, media and stock.
- Theme and page edits preserve merchant content as source guide defines.
- Template application history and restore snapshots are retained where feasible.
- Draft content never becomes live without explicit publish.
- Existing domains and SEO routes remain functional through cutover.
- All records have tenant ownership and valid references.
- Re-running migration does not duplicate records.

## 5. Verification and rollback

Generate counts and checksums per tenant/store/entity; sample rendered screenshots/DOM route comparisons; broken-link/asset checks; page/theme JSON validation; domain/TLS checks; performance and error monitoring. Store the old release reference for rollback. Production DNS/routing cutover and destructive deletion require explicit human approval. Do not delete legacy data immediately after cutover; retain according to an approved retention/rollback plan.

## 6. Exit criteria

- All required stores imported and verified.
- Native runtime handles 100% of new storefront traffic for agreed observation window.
- No production requests to SiteStore services or assets.
- Background jobs and integrations no longer depend on SiteStore.
- Rollback plan tested.
- Business owner signs off.
- Only then remove obsolete SiteStore dependencies and mark `MIG-SITE-REMOVAL` complete.

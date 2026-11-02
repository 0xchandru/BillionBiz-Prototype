# Complete SiteStore Retirement and Native Storefront Migration

**Revision:** V2.2.0 · **Priority:** P0 · **Destructive removal is gated by verified migration and owner approval.

## 1. Non-negotiable product decision

SiteStore is not part of the BillionBiz product. Remove it completely from the final user experience, runtime, code dependencies, APIs, data dependencies, deployment configuration and merchant dashboard.

**Do not remove the new BillionBiz Online Store or existing Store Editor architecture.** The replacement is the native BillionBiz Storefront Engine documented in `native-storefront-engine-architecture.md` and `store-setup-architecture.md`, preserving the supplied Store Templates guide's template gallery, page tree, section canvas, inspector, theme controls, desktop/mobile preview, draft, snapshot, undo/history, discard and atomic Publish all behavior.

## 2. Inventory before removal

Search repository, database migrations, infrastructure, package manifests, environment templates, frontend navigation/routes, API routes, cron/background jobs, webhooks, cache, CDN, object storage, CI/CD and monitoring for SiteStore or aliases. Identify exact usage and business owner for each. Create a removal matrix: `source component → current behavior/data → native BillionBiz replacement → migration task → validation evidence`.

Inventory per tenant/store: page records and routes, section/component schemas, design/theme tokens, navigation/header/footer, custom CSS or allowed style data, assets/media and URLs, SEO/redirect metadata, domains, draft/live snapshots, templates and merchant overrides, preview tokens, analytics dependencies, cache tags, publish jobs and storefront traffic.

## 3. Native replacement before cutover

The native engine must be capable of creating, editing, previewing, validating, publishing, rendering, caching and rolling back merchant sites independently of SiteStore. Do not declare replacement complete based on a shell/page mock. Test Commerce, Services and Both stores, page editor, templates, assets, checkout/booking integration and customer-visible routes.

## 4. Data migration

1. Back up source data and record restoration procedure.
2. Create explicit source-to-target mapping with stable source IDs and idempotency keys.
3. Migrate stores, pages, route slugs, navigation, theme, section tree/config, customizations, assets, metadata, redirects, drafts and published snapshots.
4. Store binaries in durable object storage; verify file size, MIME, ownership and checksum; never depend on local laptop disk or build artifacts.
5. Preserve draft and currently live state separately. Do not make draft live during migration.
6. Convert content schemas through versioned migrations; unknown fields must be preserved or raised as migration exceptions, never silently dropped.
7. Import current live view as an immutable native release and preserve historical releases/snapshots where feasible.
8. Re-run import safely without duplicate pages, media or releases.
9. Compare source/target row counts, foreign-key integrity, checksums, page trees, route behavior, SEO metadata, assets and rendered screenshots/DOM for every migrated store.
10. Generate a per-store exception report and require merchant/business owner approval for unresolved visual/content differences.

## 5. SiteStore retirement sequence

`DISCOVER → MAP → NATIVE_BUILD → BACKUP → IMPORT → DUAL_READ/COMPARE → MERCHANT_REVIEW → CANARY → FULL_CUTOVER → OBSERVE → REMOVE_DEPENDENCIES`.

Before full removal: no live traffic, scheduled jobs, assets, callbacks or APIs may still depend on SiteStore. Native store runtime must serve all approved traffic for an agreed observation window. Preserve a tested rollback reference. Do not delete legacy tables or backups until all stores pass and the owner explicitly approves irreversible cleanup.

## 6. Version/update data-loss defect — mandatory investigation

The user reports that updating a store version clears SiteStore data. Treat this as a P0 data-loss defect. Reproduce it in an isolated copy and find the exact trigger. Do not assume it is caused by one component.

Separate these versions explicitly:
- application/code release version;
- database schema/migration version;
- store content/page-document schema version;
- section/component schema version;
- theme/template version;
- immutable published store release ID.

An application or package update must never reset, recreate, truncate or reseed merchant data. A theme/template update must not overwrite merchant-edited sections/settings. Content-schema migrations must be explicit, versioned, idempotent, backward-compatible where possible, with backup, preflight, dry-run, validation and rollback/restore strategy.

Prohibit production `db push`/ORM sync that drops data, migration reset, destructive seed scripts, table drop/recreate, broad deletes, default-template overwrite and storing merchant content only in ephemeral deployment/build output. Use expand → migrate/backfill → validate → switch reads/writes → contract only after approval. Preserve unknown JSON fields during conversion.

## 7. Store release/publish invariant

Draft revisions are persisted independently. Publish creates an immutable release artifact/snapshot; the active release pointer changes atomically only after all pages, assets and validations are ready. Failed publish leaves the previous live version unchanged. Rollback points to a previous immutable release without destroying history. Code deployment does not change merchant release pointers.

## 8. Required data-preservation tests

Before and after app update, schema migration, theme update, template apply, SiteStore migration and publish rollback, compare per-store counts/checksums for: stores, pages, sections, theme tokens, navigation, assets, routes, SEO, templates, drafts, releases, products/variants, inventory movements, customers, orders, payments, bookings, settings, integrations and audit history. A difference must be explained and approved; unexplained loss blocks release.

## 9. Completion criteria

- Native editor and runtime own all store lifecycle behavior.
- Existing store data, page customizations, assets, SEO and live site behavior are migrated and verified.
- Store version updates do not erase any merchant data.
- No production route, API, package, job, webhook, database dependency or deploy config requires SiteStore.
- SiteStore is absent from merchant navigation and dashboard.
- Rollback is tested and retention/cleanup is owner-approved.
- Migration and retirement tasks are verified with evidence; otherwise remain BLOCKED/IN_PROGRESS.

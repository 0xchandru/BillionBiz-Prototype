# Store Data Preservation, Application Versioning and Safe Migrations

**Revision:** V2.2.0 · **Status:** Production-critical invariant

## 1. Non-negotiable rule

Updating BillionBiz, the Store Editor, storefront renderer, template library or a store schema version must never clear, reset, replace or silently overwrite merchant data. Deployment version and merchant content version are separate concepts.

The observed behavior where updating a store version clears SiteStore data is a critical data-loss defect. Identify its exact cause in code, migrations, seed scripts, version upgrade hooks, API calls, storage paths and release logic. Do not work around it by hiding the reset or recreating the lost content from defaults.

## 2. Separate version concepts

Track separately:
- Platform application release/build version.
- Database schema migration version.
- Store content/page schema version.
- Template/section schema version.
- Published store release ID/version.
- Store configuration optimistic-concurrency version.

A platform deployment must not set a store's content version to a blank template or delete/recreate store content. A new template version is not permission to overwrite merchant-customized pages.

## 3. Persistence boundaries

Persist all merchant-owned data in the database or durable object storage:
- Organization, store, location and domain data.
- Store pages, draft versions, section configuration, themes and navigation.
- Template applications and snapshots.
- Product catalog, variants, prices, inventory movements and media references.
- Offerings, availability, bookings and policy snapshots.
- Customers, orders, payments, refunds, shipments and invoices.
- Team, permission assignments, POS counters/devices/registers.
- Integration connections and encrypted credentials.

Do not keep production merchant content only in browser storage, application container filesystem, build artifacts, generated source files or ephemeral local disk. Media must use durable object storage with versioning/backup policy.

## 4. Safe schema migration strategy

- Use version-controlled forward migrations; never production auto-sync schema destructively.
- Use expand → migrate/backfill → validate → contract where possible.
- Add new nullable/defaulted fields first; backfill in bounded idempotent batches; verify counts and constraints; only then retire old fields in a later release.
- Keep tenant-scoped migration state and checksums where schema/content transformations require it.
- Preserve unknown JSON fields when transforming versioned documents unless a reviewed migration explicitly maps/removes them.
- Back up database and object references before high-risk migration; test restore first.
- Use transactions for bounded changes and resumable jobs for large backfills.
- Stop cutover on checksum/count mismatch, orphan references or failed render validation.

Forbidden production behaviors include `migrate reset`, destructive seed scripts, ORM schema auto-sync, unconditional delete/recreate of merchant rows, dropping unknown page fields, using a fresh default template to overwrite customized pages, or replacing a tenant's active release pointer before the new release validates.

## 5. Versioned page/template migration

Each page, section and theme document carries an explicit schema version. Renderer supports the current and a documented compatibility window of older versions. Migrations are pure/tested transformations with fixtures captured from real existing documents (sanitized). A template update only changes the template catalog. It does not reapply itself to every existing store.

If an automatic content migration is required:
1. Snapshot current state and active release.
2. Calculate impacted tenants and page types.
3. Dry-run transformation and report changed fields.
4. Preserve merchant values and custom sections.
5. Apply idempotently in batches.
6. Validate JSON schema, page rendering, asset references and before/after counts.
7. Keep rollback snapshot and migration audit.
8. Switch runtime only after successful validation.

## 6. SiteStore exit

SiteStore is legacy only. It must not appear as an ongoing product feature or admin navigation item. The removal process must import all valuable existing data into native BillionBiz entities and object storage, verify it, then cut over the native renderer. Preserve source snapshots and rollback capability until an owner-approved retention window expires. If data cannot be exported/mapped or verified, block destructive removal and report the exact blocker.

After cutover, delete SiteStore runtime/API/SDK/config/job/secret references and obsolete dashboard links only when confirmed unused. Do not delete native Online Store, Store Editor, storefront templates, pages, media or runtime.

## 7. Required tests

- Deploy a new backend/frontend release and confirm existing store content counts and checksums remain unchanged.
- Update template catalog and confirm existing customized page JSON stays unchanged.
- Migrate an old page schema and verify visual/render output and data round-trip.
- Force a migration failure and confirm old release remains live.
- Restore a previous store release without erasing order/product/customer history.
- Re-run a migration and verify no duplicates or data drift.
- Verify media references survive deployment and restart.

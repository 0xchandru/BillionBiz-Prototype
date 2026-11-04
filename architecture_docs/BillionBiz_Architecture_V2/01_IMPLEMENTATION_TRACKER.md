# BillionBiz V2 — Implementation Tracker

This tracker is maintained with the target architecture. Status reflects code on `codex/store-editor-foundation-v2`, not production deployment.

## Branch-level completed work

| Area | Change | Status |
|---|---|---|
| Tenant context | Host mapping and signed tenant context; remove first-store fallback; reject header override for merchant JWTs | Implemented, CI verification pending |
| Domain ownership | Case-insensitive domain uniqueness; provisioning no longer reassigns a conflicting hostname | Implemented, migration verification pending |
| Reserved labels | Existing centralized reserved-name registry retained; tests cover `admin`, `staff`, `pos`, `help` | Implemented, CI verification pending |
| Draft persistence | Page API exposes latest draft revision; save endpoint serializes revisions and supports expectedVersion conflicts | Implemented, frontend build/test pending |
| Theme saves | Partial theme updates no longer overwrite omitted fields with empty JSON | Implemented, frontend build/test pending |
| Publish pointer | Public storefront reads active release pointer rather than highest release number | Implemented, integration verification pending |
| Rollback | Restore creates a new immutable release and activates it after insert | Implemented, integration verification pending |
| Provisioning | Google sign-up uses the shared storefront provisioner; retries preserve later releases | Implemented, integration verification pending |
| Custom domains | Fake DNS/SSL success removed; primary domain requires verified + active TLS | Implemented; provider integration still pending |
| Brand ownership | Public brand name is separate from legal organization/store names | Implemented, regression test pending |
| Editor Save | Manual save/autosave persist to API and retain dirty state on failures/concurrent edits | Implemented, frontend build/test pending |
| Publish flow | Flush all page drafts, theme and settings before whole-store publish | Implemented, frontend build/test pending |
| Shared preview | Shared responsive viewport for editor and standalone preview | Implemented, frontend build pending |
| Header/Footer | Snapshot adapter; public runtime no longer renders browser-local editor state | Implemented, visual regression pending |
| Password protection | Data API withholds publication/catalogue, uses store-scoped signed token and persistent attempt throttling | Implemented, integration verification pending |
| Live propagation | Store-scoped release SSE signal triggers a re-fetch of active publication | Implemented, browser smoke test pending |
| Auth hardening | Production JWT secret is required; platform-admin and organization role are refreshed from DB | Implemented, CI verification pending |
| API client | Stale local tenant headers are omitted for merchant JWT requests | Implemented, frontend build pending |
| Automation | PostgreSQL-backed backend build/tests and frontend build workflow added | Added, first run pending |

## Active P0 issues to close

1. Run the new CI workflow and fix every compiler/test failure.
2. Validate all SQL migrations against an empty Postgres 16 DB and a production-like upgraded DB.
3. Add auth regression tests for revoked platform-admin status and changed membership roles.
4. Verify public password-protected store data cannot be read without a scoped token; verify token expiry and rate-limit behavior.
5. Test rollback pointer, theme, pages and publication event end-to-end.
6. Test page Save/autosave while editing two pages and while another session writes a newer revision.
7. Test that custom-domain DNS verification never activates SSL until a real provider callback confirms it.
8. Confirm the existing root-domain host routing and wildcard certificate with the actual deployment provider; repository code cannot confirm DNS/certificate state.

## Next implementation tracks

### Storefront foundation
- Typed page catalog and resource resolver.
- Explicit public/live data adapters for Catalogue, Inventory, Appointments, Accounts and Orders.
- Snapshot theme and navigation consistency.
- Canonical menu and page route ownership.
- Cache policy by immutable release ID, never by untrusted host alone.

### Merchant Store Editor
- One canonical draft document contract.
- Page, Brand, Design and Settings source-of-truth ownership.
- Real validation, status and launch diagnostics.
- Header/Footer visual contract tests; preserve the existing editor UI.
- Unsaved-change handling, undo/redo, save conflict reconciliation and recovery.

### Platform capabilities
- Durable outbox dispatcher with retry/dead-letter behavior.
- Real domain provider integration and certificate lifecycle.
- Tenant-scoped media pipeline and signed URLs.
- Observability, backup/restore drills and performance budgets.
- Safe component registry and versioned section/block schema.

## Verification rule

No area is marked complete until the relevant build, automated test, migration test and browser workflow pass. A commit on this branch is not a production deployment.

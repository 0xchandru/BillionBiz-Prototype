# FL-STORE-001 — Template Preview, Apply, Draft, Publish and Restore

- **Version:** 1.0
- **Goal:** Allow safe whole-store visual changes using the existing Store Editor architecture.
- **Actors:** Owner/Admin; Store Editor; Storefront runtime.

## Main flow
1. Merchant opens Online Store -> Pages/Editor -> Templates.
2. Gallery returns templates compatible with enabled store capabilities and storefront runtime version.
3. Merchant previews a template at Desktop/Tablet/Mobile. Preview uses sample data and writes nothing.
4. Merchant selects Apply; review explains pages/theme/header/footer/navigation affected and what merchant data is preserved.
5. Backend snapshots the current store draft/live references and validates template schema.
6. Backend creates/updates template-owned draft page/section/theme records. Existing merchant content, media, logo, store name, navigation links and catalog are preserved by explicit merge rules.
7. Merchant edits draft using page tree, canvas and inspector; template-owned sections replace prior template-owned sections rather than stacking duplicates.
8. Merchant previews whole draft storefront using a short-lived signed preview token.
9. Publish review lists all changed page/theme/branding/navigation values and warns about capability-required routes.
10. Merchant confirms publish.
11. Backend validates and atomically creates immutable release and updates active release pointer; event is emitted after commit.
12. Storefront runtime serves new release; CDN caches by release identity.
13. History records actor, applied template, timestamps, snapshot reference and publication status.

## Alternate/failure paths
- Preview fails: retry; no store state mutation.
- Template incompatible: show required upgrade/capability and do not partially apply.
- Existing draft: explain discard/continue policy; no silent overwrite.
- Publish review fails to load: publish disabled.
- Publish fails: draft remains; live release unchanged.
- Discard draft: restore draft state from snapshot; live release unchanged.
- Restore prior release: create a new release pointing to historical content; retain all history.

## Invariants
- Preview is read-only.
- Apply modifies draft only.
- Publish is all-or-nothing.
- Active release points to a valid immutable release.
- Merchant catalog and historical orders are not modified by a design template.
- Template sample products have explicit provenance and are not silently mistaken for merchant products.

## Acceptance
- No live change before publish.
- Failed publish leaves live release untouched.
- Reapply template does not duplicate sections.
- Restore can recover prior page/theme/navigation state without deleting history.

## Traceability
- Requirements: REQ-STORE-001..012
- Tasks: T-009;T-010;T-011;T-012;T-013
- Tests: TC-STORE-001..009
- Security: SEC-010..SEC-014

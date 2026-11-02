# FL-CAT-001 — Create Product and Publish Variants

- **Version:** 1.0
- **Actors:** Catalog Manager; Inventory Service; Storefront.
- **Preconditions:** Product commerce capability enabled; permission to create products.

## Main flow
1. User selects Catalogue -> Products -> Add product.
2. User selects a product category/type; the category schema loads required, recommended and optional attributes.
3. Quick Setup opens with title, primary media, price and status; the merchant may save an incomplete draft.
4. User adds media, category/collection and sales-channel visibility.
5. User adds category-specific attributes and options such as Size and Color.
6. UI previews combination count and allows excluding invalid combinations before generation.
7. User generates variants and edits SKU, barcode, price, media, weight, dimensions and inventory policy per variant or bulk defaults.
8. User enters location stock and shipping attributes where physical delivery applies.
9. Readiness review identifies true publish blockers separately from optional recommendations.
10. Backend validates category schema version, price, tax, SKU/barcode uniqueness, media ownership, variant limits and capability.
11. User previews the product page responsively, then saves a draft or publishes.
12. Backend commits product/variants and audit records; opening stock becomes stock movements.
13. Storefront catalog/search index updates asynchronously after commit.

## Alternate paths
- Duplicate SKU/barcode: block save and identify conflicting scope without leaking another tenant's data.
- User exits with unsaved edits: warn and offer save/discard.
- Bulk defaults: show affected variant count and preview before apply.
- Import: use the dry-run/background import flow; show row-level failures and idempotent retry.
- Product is archived/unpublished: preserve historical order snapshots and stop new purchases.

## Invariants
- Product parent and variants are different entities/metrics.
- Historical order lines remain unchanged after product edits.
- Price math is exact; no floating point.
- Stock changes create movements.
- A service-only/appointment-only store does not need product creation.

## Acceptance
- Simple product can be created quickly.
- Variant combinations, SKU uniqueness, inventory and shipping metadata validate.
- Product preview corresponds to published page schema.
- Audit and stock movement records are created correctly.

## Traceability
- Requirements: REQ-CAT-001..020
- Tasks: T-014;T-015;T-016;T-017;T-042;T-043
- Tests: TC-CAT-001..012
- Security: SEC-015..SEC-019;SEC-049

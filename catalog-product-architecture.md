# Catalogue and Product Creation Architecture

## 1. Catalogue navigation

- Products
- Categories
- Collections (manual/automated grouping; add only if supported by the current data model)
- Bundles
- Inventory
- Import / Export
- Reviews (only if existing capability is in scope)

## 2. Product editor experience

Build a single coherent editor with progressive disclosure. A merchant should be able to create a simple product quickly and open advanced controls only when needed.

Suggested layout:
- Main column: title, description, media, options/variants, category/collection, specifications, related items.
- Side panel: status, sales channel, pricing summary, inventory summary, shipping summary, organization/vendor and publish actions.
- Advanced sections: SEO, custom attributes/metafields, tax details, customs fields and search metadata.

Required states: new draft, saved draft, validation error, import-generated draft, active/published, archived, out-of-stock and deleted/soft-deleted where policy permits.

## 3. Product data model

A product is a parent content entity. A variant is the sellable SKU-level entity. Inventory is tracked per variant and location; never count a product parent and every variant as if all are separately sellable products in the same metric.

Product fields:
- Name/title, description, handle, status.
- Product type, category, brand/vendor.
- Media gallery with alt text, ordering and focal point.
- Options (e.g. size, color) and generated variant combinations.
- Tax category/rate policy.
- SEO fields and custom attributes.
- Publication/channel assignments.
- Created/updated/archived actor and history.

Variant fields:
- SKU and barcode (unique within the defined merchant scope).
- Option value tuple.
- Price, compare-at price and cost in integer minor units or exact decimal.
- Weight/dimensions and shipping requirements.
- Variant media association.
- Inventory policy and tracking setting.
- Active/archived status.

## 4. Variant matrix

- Create/edit options and values.
- Preview total combinations before generation.
- Exclude impossible combinations.
- Bulk set default price, SKU prefix and inventory defaults.
- Edit individual variants in table form.
- Support per-variant image, SKU, barcode, price, weight and inventory policy.
- Detect duplicate SKU/barcode before save and enforce uniqueness in database.
- Support explicit variant deletion/archive rules. Do not delete variants referenced by orders; archive or preserve snapshots.
- Set a safe maximum generated variants per product based on measured UI/database limits and plan policy.

## 5. Pricing and tax

- Use integer minor units for currency where currency exponent permits; never use JS floating point for financial math.
- Validate price, compare-at price and cost according to business policy.
- Store currency with amount and prevent mixing currencies in one order without an explicit FX workflow.
- Tax calculation is backend-authoritative and versioned; persist applied tax/discount snapshots on order lines.
- Discounts and promotions are separate rules from catalog base price.

## 6. Inventory

- Track variant stock per location.
- Use immutable stock movements and derived balances.
- Support opening stock, receipt, adjustment, transfer, reservation, sale, return/restock, damage and count correction.
- Show available, on-hand, committed/reserved and incoming quantities with explicit definitions.
- Prevent overselling using transactional reservation/decrement policy.
- POS and online orders use the same inventory service.
- Appointment capacity is not inventory stock; do not force bookings into product quantity logic.

## 7. Bundles

Support fixed bundles as a parent sellable offer referencing component variants and quantities. Define whether stock is deducted from components or tracked as a separate bundle SKU; make policy explicit and enforce atomically. Snapshot bundle composition and prices on order line creation. Variable/custom bundles are deferred unless requested and designed.

## 8. Media

- Upload directly to object storage using short-lived signed upload URLs.
- Validate size, MIME type and actual file content; scan where available.
- Generate responsive derivatives/thumbnails asynchronously.
- Preserve original and optimized renditions.
- Store alt text and ordering.
- Never expose storage credentials to browser.

## 9. Bulk import/export and bulk edit

Import flow: upload -> inspect file -> map columns -> preview normalized rows -> dry-run validation -> show valid/invalid row counts -> commit as background job -> row-level results -> retry failed rows. Use stable external/SKU keys for idempotent replay. Do not partially commit an unknown subset without showing the result.

Bulk edit flow: select scope -> choose fields -> preview before/after summary -> permission and validation check -> confirm -> background apply -> progress and failure report. Audit actor, scope, changed fields and job result.

CSV export must neutralize formula injection in spreadsheet-oriented output and respect permissions/PII scope.

## 10. Acceptance criteria

- Product parent and sellable variant metrics are defined separately.
- Variant SKU/barcode uniqueness is enforced by the database.
- Price edits never rewrite historical order line snapshots.
- Stock changes always create stock movements.
- Product can be hidden from store without deleting its history.
- Product-only/hybrid stores can publish products; appointment-only stores are not required to create products.
- Bulk import can be safely retried without duplicate products when stable identity keys are provided.

## 11. Category-driven product authoring (competitive target)

Do not build one universal flat form with the same fields for every category. Build a versioned **category attribute schema registry**. When a merchant chooses a category, the editor loads the category's required, recommended and optional fields with validation rules. Examples include apparel size/colour/fabric, electronics model/warranty/compatibility, grocery unit/ingredients/expiry where applicable, and regulated or compliance fields only where the business category actually requires them. Do not infer legal requirements; category schemas must be reviewed and versioned.

Each attribute definition needs: stable key, label, type, requiredness, allowed values, units, validation, help text, display/search/filter flags, variant-level eligibility, storefront visibility, API mapping and schema version. Support text, number, boolean, enum, multi-select, measurement, date, URL and structured values where justified. Unknown attributes must not be silently discarded during import or edit.

### Recommended Add Product journey

1. **Choose product type/category** first so the form can load the appropriate attribute schema. Allow changing it with a clear warning if the target category has different required fields.
2. **Quick setup**: title, key media, price, primary category and publish state. Save as draft at any point.
3. **Options & variants**: define option dimensions and values; show the exact combination count before generation; allow excluding unavailable combinations; set defaults in bulk; edit each variant in a grid; map photos to option values; generate SKU suggestions while permitting explicit merchant overrides.
4. **Inventory & fulfilment**: location-level on-hand/available/committed quantities, stock opening/adjustment reason, weight/dimensions, fragile/perishable handling only where relevant, shipping-required flag and fulfilment profile.
5. **Content & conversion**: description, specifications, attributes, media alt text, category-aware SEO, related items and bundle composition.
6. **Readiness review**: a visible checklist distinguishes blockers from recommendations (missing required category attribute, invalid SKU, no price, invalid stock, missing shipping package data, missing media/alt text, no sales channel). The merchant can save incomplete drafts; publishing is blocked only by actual required policy fields.
7. **Preview & publish**: preview desktop/mobile product detail, variant selector, price/stock behavior and channel visibility; then publish to selected channels.

### Product quality differentiators to implement

- **Category-aware forms** rather than generic fields that force merchants to guess what to enter.
- **Variant matrix** with combination preview, invalid combination exclusion, inline validation, per-variant media, bulk defaults and undoable draft changes.
- **Media workspace** with drag reorder, crop/focal point, alt text, image processing status, duplicate detection and variant assignment.
- **Tax and compliance guidance** that explains why a field is needed and supports jurisdiction/category schema versions; do not hardcode tax rates into UI.
- **Shipping readiness** derived from actual variant/package data. A product may be pickup-only or digital/non-shipping without fake package dimensions.
- **Inventory ledger**: bulk edits that affect quantity must generate stock movements with actor, reason and source. Never use a bulk absolute quantity editor that silently erases movement history.
- **Import center** supporting source mapping templates, validation-only dry run, category/attribute mapping, preview of create/update decisions, row-level errors, safe retries and downloadable result reports.
- **Bulk operations** with selectable columns, keyboard navigation, filter-preserving edits, before/after preview, permission checks, audit summary and per-row result.
- **Listing score/readiness** based on required data completeness and optional discoverability quality. This is an advisory score; do not claim conversion lift without evidence.
- **Product clone** that copies content/options/media metadata but never copies stock counts, sales history, payment/order references or supplier secrets by default.

### Product vs. marketplace listing

Keep BillionBiz's canonical product and sellable variant separate from a marketplace-specific listing/offer. A future connector may need channel-specific category taxonomy, external product identifiers, listing attributes, fulfilment choices, marketplace pricing, stock by marketplace location and quality-control states. Model this through a future `channel_listings`/`channel_listing_variants` adapter layer rather than polluting core product fields with one marketplace's schema. Marketplace syndication itself is deferred until separately approved.

## 12. Competitive comparison: Shopify and Flipkart

Current public references show Shopify supports product/variant bulk editing, inventory fields and barcode-oriented workflows. Shopify's variant docs currently describe a three-option and up-to-2,048-variant limit; Shopify's bulk editor permits selecting properties/columns and changing many products/variants. Flipkart's Seller API distinguishes a marketplace listing as the sellable unit and models SKU, price/MRP, HSN/tax code, shipping, packages/dimensions/weight and location inventory. Flipkart listing APIs also support single and batch operations, with explicit errors/warnings.

BillionBiz should not claim to be categorically "better" before a measured comparison. Its defensible product target is better merchant workflow cohesion: category-aware field schemas, one guided create/edit path, excellent variant editing, traceable inventory changes, import dry-runs with actionable errors, clear product readiness, native storefront preview, and direct links from product shipping fields into Shiprocket fulfilment.


## 13. Product creation experience — target interaction model

The product editor is a high-value workflow and must be designed around the merchant's intent, not around a database schema form.

### Quick create path

1. Select product category/type.
2. Enter product name and add media.
3. Enter price and selling availability.
4. Configure variants only when the product actually has options.
5. Set inventory and shipping only when relevant to the selected product type.
6. Review blockers/recommendations and preview the selected storefront channel.
7. Save as draft or publish.

Allow save-and-resume without requiring every advanced detail. The editor must distinguish `Save draft` from `Publish`; publication blockers must be explained next to the relevant field.

### Advanced authoring

The same editor progressively reveals category-specific attributes, specifications, size charts, personalization, tax/HSN/SAC as relevant, per-location inventory, variant shipping data, bundles, SEO and channel visibility. The user must not lose entered data when changing category or opening advanced panels. If a category change makes an attribute incompatible, show a migration/retention decision rather than silently deleting it.

### Variant scalability and guardrails

Do not hardcode the core product data model to a fixed number of option dimensions. Store option definitions and combinations as normalized, versioned data. The UI may begin with a conservative limit, but the limit must be an explicit product/plan/performance policy, measured with real rendering and database tests. Before generating a matrix, show the number of combinations, estimated SKU count and any plan/operational constraints. Use virtualized variant tables and background jobs for large safe operations. A configurable cap is better than an undocumented global limit or an unbounded combinatorial explosion.

### Better-than-benchmark target (measurable)

Do not define product superiority as merely accepting more variants than another platform. Evaluate and improve measurable merchant outcomes:

- Time from empty form to a valid simple-product draft.
- Number of unexplained validation failures per product create.
- Time to create and price a 100-variant product.
- Accuracy of category-specific attributes and product completeness.
- Time to import a representative catalog with actionable row-level recovery.
- Number of clicks to update multiple selected variants.
- Accuracy of stock movement history after bulk edits and returns.
- Time to identify missing shipping data and obtain a valid Shiprocket quote.
- Product preview fidelity across mobile/desktop and enabled channels.

Benchmark the same representative scenarios on BillionBiz, Shopify and other relevant seller systems. Claim improvement only when the test protocol, sample, time and error rate are recorded.

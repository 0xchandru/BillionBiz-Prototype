# 06 — Future Shopify-style Section and Block System (Approval-Gated)

> **Sequencing update:** The user has explicitly approved implementing the section/block architecture. Architecture addendum 13 now supersedes the old approval gate. Implement one complete section vertical slice at a time, beginning with Hero Banner; do not batch untested sections. The registry is versioned, allowlisted and data-only. This is the target design after the user explicitly approves Phase 2. Finish and verify all non-section work first, then stop and ask for approval.

## 1. Hierarchy

```text
Store
 └── Theme Version
      ├── Global Design Tokens
      ├── Shared Header/Footer references (existing editors; unchanged)
      └── Template Version
           ├── Page Type + allowed data context
           ├── Ordered Section Instances
           │    ├── Section Settings
           │    ├── Ordered Block Instances
           │    │    └── Block Settings + Data Bindings
           │    └── Section-level design overrides
           └── Page/template settings
```

A section is a reusable page module (Hero Banner, Product Grid, Image with Text, FAQ). A block is a smaller unit inside a section (Heading, Text, Image, Product Title, Price, Variant Picker, Buy Button). Templates restrict which sections can be added; each section schema restricts which blocks can be added.

## 2. Schema registry — no arbitrary code

Each section/block type is registered in a versioned platform component registry.

Suggested `SectionDefinition` fields:
- `type`: stable key such as `hero-banner`.
- `schemaVersion`: positive integer.
- `label`, `description`, `category`, `icon`.
- `allowedPageTypes` / `allowedTemplateTypes`.
- `settingsSchema`: typed properties, defaults, labels, help, validation limits and editor control type.
- `allowedBlockTypes` and block-count limits.
- `presets`: approved initial content/settings.
- `responsiveSettings`: supported breakpoint overrides.
- `dataSources`: allowed context (product, collection, service, page, blog, store).
- `capabilities`: background, overlay, animation, links, app slots, etc.
- `accessibilityRequirements`.
- `rendererKey`: allowlisted renderer registry key.
- `migration`: controlled schema-version migration.

`BlockDefinition` has type, schema version, context compatibility, settings schema, optional data-binding schema, renderer key and accessibility constraints. Do not store executable merchant JavaScript, React components, `eval` strings or unrestricted HTML in these records.

## 3. Section and block instances

Template version stores an ordered list of section instances. Each instance includes stable ID, registered type/schema, order, enabled/hidden state, validated settings, ordered blocks, optional style overrides, optional data-source binding and metadata.

Block instance includes stable ID, registered type/schema, order, enabled/hidden state, validated settings, optional data binding and approved style overrides.

IDs remain stable through reorder. Reordering changes order, not identity. Settings are schema-validated on both client and server.

## 4. Universal block families

### Content blocks
- Heading, Rich Text, Plain Text, Button/Link, Image, Video (trusted asset/URL), Icon, Divider, Spacer, Badge, Countdown (only with real time source), Rating summary (only with a real review source).

### Commerce blocks
- Product Card, Product Image/Gallery, Product Title, Vendor/Brand, Price/Compare-at Price, Variant Selector, Quantity Selector, Inventory Status, Buy Buttons/Add to Cart, Description, Specifications/Metafields, Rating/Reviews (only connected real source), Related Products, Breadcrumbs, Collection Title/Description, Sort/Filter, Pagination/Load More.

### Service blocks
- Service Card, Title/Description/Duration/Price, Staff selector (if backend supports it), Availability Calendar, Booking CTA, Booking Summary, Appointment Policy.

### Protected blocks
Some controls are mandatory for a working workflow. They may be visually configurable but cannot be removed if doing so breaks purchase, booking or account security. Examples: checkout submission/payment status, required variant/quantity controls, booking confirmation, account security controls.

## 5. Product detail example

```text
Product Detail Template
 ├── Breadcrumbs section
 ├── Product Information section
 │    ├── Product Media block
 │    ├── Vendor block (optional)
 │    ├── Product Title block
 │    ├── Rating block (only with real review source)
 │    ├── Price block
 │    ├── Variant Picker block (when variants exist)
 │    ├── Quantity Selector block
 │    ├── Buy Buttons block (required for purchasable product)
 │    ├── Inventory Message block (optional, policy-safe)
 │    ├── Description block
 │    └── Share block
 ├── Product Details/Specifications section
 └── Related Products section
```

Merchant may reorder/hide optional blocks and style them. Product Title block binds to `product.title`; merchant cannot overwrite Catalogue product title there. Same for price, stock and variants.

## 6. Product grid example — common card blocks across products

```text
Product Grid Section
 Settings:
   - Source: collection | selected product IDs | safe rule-based query
   - Desktop/tablet/mobile columns
   - Card image ratio and spacing
   - Quick add enabled/disabled where supported
   - Sorting/filter controls
 Card blocks (one shared arrangement applied to every result):
   - Product image
   - Product title
   - Price
   - Compare-at price (conditional)
   - Rating (conditional real data)
   - Quick-add button
```

The block order applies to every product in that grid. Each block binds to each product's real record. Merchants do not edit each product card separately. Product data remains in Catalogue.

## 7. Future editor tree and right inspector

```text
HOME TEMPLATE
  Header [managed by existing Header Editor; shortcut only]
  Main content
    ▾ Hero Banner
        Heading
        Text
        Primary Button
        Secondary Button
        Image
    ▾ Featured Collection
        Section Heading
        Product Card Layout
            Product Image
            Product Title
            Price
            Quick Add
    ▸ Newsletter
  Footer [managed by existing Footer Editor; shortcut only]
```

- Section row: drag handle, icon, name, selected state, visibility toggle, more actions and collapse chevron.
- Expanded section: indented blocks and Add Block action if allowed.
- Selecting section/block updates canvas outline and right inspector.
- Inspector is contextual: Content, Design, Visibility/Responsive and Advanced only when supported by that schema.
- Add Section opens searchable compatible library with preview and insertion position.
- Add Block shows only valid children.
- Duplicate generates new IDs while preserving settings safely.
- Delete confirms when content is important or node is mandatory.
- Undo/redo includes reorder, add/remove, visibility and setting changes.
- Keyboard move controls are required in addition to drag.

## 8. Design inheritance

Precedence:
1. Platform baseline/accessibility defaults.
2. Theme semantic tokens.
3. Component/section defaults.
4. Section instance overrides.
5. Block instance overrides.

`inherit` uses parent token. Applying a preset must not silently overwrite manual instance overrides. Reset requires explicit scope confirmation.

## 9. Compatibility and protections

- Each page type and template defines valid sections.
- Each section defines valid block types and limits.
- Product/service sections require valid data context.
- Checkout and account routes have restricted allowlists.
- Header/Footer are not ordinary page sections; existing editors own them.
- Custom templates cannot remove required workflow behavior.

## 10. Recommended one-at-a-time library order

1. Hero Banner (framework proof with content/image/layout/CTA blocks and responsive variants).
2. Rich Text.
3. Image with Text.
4. Featured Collection / Product Grid.
5. Featured Product.
6. Collection List.
7. Product Details with protected commerce blocks.
8. Slideshow / Carousel.
9. Multicolumn / Feature Grid.
10. Image Gallery / Collage.
11. Video.
12. Testimonials (real merchant-supplied content only; no fabricated reviews).
13. FAQ / Accordion.
14. Newsletter (must connect to actual email provider/configuration).
15. Blog Posts.
16. Contact Form.
17. Promotional Banner / Countdown.
18. Service Grid and Booking CTA (Services mode only).
19. Decorative Celebration Effects (separate safe effect layer, not arbitrary script).

The user approves the first section, then every later section individually.

## 11. Limits and validation

Use configurable, tested limits rather than unbounded JSON. Example initial limits: up to 40 sections per template and up to 50 blocks per section, then tune through load tests. Enforce payload size/nesting caps, media limits, schema validation, tenant validation and migration versions. Unknown section types should block publish or use a verified safe fallback; never silently disappear.

## 12. Section done criteria

A section is done only when it has a versioned schema, full inspector settings, allowed block operations, tree selection/collapse/keyboard support, canvas sync, draft persistence, no live changes before publish, identical live rendering after publish, responsive behavior at 300px, accessibility/security/tenant tests, truthful data states, and user review. After each one, ask whether to improve the same section or approve the next.

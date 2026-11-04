# BillionBiz Online Store & Store Editor Architecture — v1

**Purpose:** An implementation-ready specification for rebuilding BillionBiz as a multi-tenant, Shopify-inspired storefront platform. This is a product and engineering blueprint, not a claim that BillionBiz is already feature-equivalent to Shopify.

## What this package decides

1. Rebuild the Store Editor around four primary tabs: **Pages, Brand, Design, Settings**.
2. Replace the landing-page-only editing model with reusable page/template architecture.
3. Preserve the existing **Header Editor and Footer Editor** exactly as they are. Do not redesign them. Integrate their saved output into every compatible storefront page.
4. Use one reusable storefront renderer/preview for editor and customer subdomain. Preview must not be a fake mockup.
5. Show system and merchant-created pages in `/pages`. Required system pages are locked against deletion.
6. Keep products, collections, inventory, orders, customers, payments, shipping, taxes, POS and appointments in existing Admin modules. Store Editor changes presentation only and reads real data.
7. Provision every registered merchant with a unique subdomain and a complete starter storefront. No fake products, inventory, orders, reviews, prices or analytics.
8. Use draft/live version separation, atomic publishing, preview, version history and rollback.
9. **Do not implement editable sections/blocks in Phase 1.** Complete everything else, test it, stop and ask the user for approval. After approval, implement the section system and sections one at a time, stopping after each for review.
10. Customer storefront must work at **300 CSS px** minimum, and be tested at 300, 320, 360, 390, tablet and desktop widths.

## Package contents

| File | Purpose |
|---|---|
| `00_MASTER_EXECUTION_PROMPT.md` | Copy/paste coding-agent prompt with strict phase gates |
| `01_CURRENT_STATE_AND_NON_NEGOTIABLES.md` | Screenshot review and what to preserve/remove |
| `02_ONLINE_STORE_NAVIGATION_AND_EDITOR_TABS.md` | Admin links and four editor tabs |
| `03_STORE_LIFECYCLE_AND_DOMAIN_ROUTING.md` | Signup provisioning, subdomains and tenant resolution |
| `04_PAGE_CATALOG_AND_TEMPLATE_MATRIX.md` | Commerce, content, account and service page types |
| `05_EDITOR_UX_AND_REUSABLE_PREVIEW.md` | Editor layout, sidebars, preview and shared header/footer |
| `06_FUTURE_SECTION_AND_BLOCK_SYSTEM.md` | Approval-gated Shopify-style section/block architecture |
| `07_THEME_DESIGN_TOKENS_AND_INTERACTIONS.md` | Typography, colors, buttons, universal tokens and visual effects |
| `08_STOREFRONT_RUNTIME_AND_PUBLISHING.md` | Draft/live, atomic publish, caching and rollback |
| `09_DATA_MODEL_AND_API_CONTRACTS.md` | Tenant model, ownership boundaries and API capabilities |
| `10_WARNINGS_SECURITY_PERFORMANCE_AND_RESPONSIVE.md` | Warnings, security and 300px design requirements |
| `11_IMPLEMENTATION_PHASES_AND_ACCEPTANCE_TESTS.md` | Ordered implementation, QA and stop gates |
| `12_REFERENCE_NOTES.md` | Official design/technical references |
| `schemas/` | Example page catalog, navigation, tokens, template and section manifests |
| `implementation_checklist.csv` | Work tracking checklist |

## Architecture principles

- One merchant store = one tenant boundary. Tenant scope every merchant-owned resource and query.
- Preview and live storefront use one renderer and the same templates, theme tokens and data bindings.
- One source of truth per business object: Catalogue owns products; Orders owns orders; Appointments owns bookings; People/identity owns customer identity.
- One shared header and footer per Store Layout. Reuse current editor output; do not duplicate markup per page.
- Saving writes a draft. Publishing is explicit and atomic.
- Failed publish leaves the previous complete site live.
- System pages are protected; allowed presentation settings may be customized.
- No arbitrary merchant code execution. Future section/block definitions use validated schemas and allowlisted renderers.
- Archive legacy editor configuration before retiring it from the active UI. Never perform destructive data migration without a rollback plan.

## Reference stance

Use Shopify's template → section → block model as a reference and Webflow-style global design variables/components as a reference. Do not clone proprietary UI or code. Aim for a reliable, scalable implementation with strong tenant isolation, clean ownership boundaries, safe publishing, accessible responsive behavior and complete tests.

## Repository rule

The coding agent must inspect the actual repository, routes, components, DB schema, auth/tenant middleware, reusable sidebars, Header Editor and Footer Editor before editing. Do not assume the tech stack, create duplicate services, or guess API names. Adapt this blueprint to existing patterns unless a technical blocker is proven.

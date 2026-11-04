# 12 — Reference Notes and External Design Basis

This architecture uses public documentation as references for concepts and behavior. It does not reproduce proprietary code or mandate identical implementation.

## Shopify — theme composition/templates

1. **Theme architecture:** layout, templates, sections, blocks and snippets; JSON templates wrap sections and theme settings hold global values. Supports the recommended typed template → section → block hierarchy.
   - https://shopify.dev/docs/storefronts/themes/architecture
2. **JSON templates:** ordered section instances and settings; merchants can add/remove/reorder sections in the theme editor.
   - https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates
3. **Sections:** reusable customizable modules containing blocks, added through JSON templates or section groups.
   - https://shopify.dev/docs/storefronts/themes/architecture/sections
4. **Section groups:** ordered JSON collections useful for layout areas such as header/footer. BillionBiz keeps the existing separate Header/Footer editors as owner, while reusing the global-rendering principle.
   - https://shopify.dev/docs/storefronts/themes/architecture/section-groups
5. **Sections and blocks:** reordering/customization and dynamic data connections.
   - https://help.shopify.com/en/manual/online-store/themes/theme-structure/sections-and-blocks
6. **Theme editor overview:** sidebar tree, auto-updating preview, viewport preview, undo/redo; interaction reference for future BillionBiz editor.
   - https://help.shopify.com/en/manual/online-store/themes/customizing-themes/theme-editor/features-overview
7. **Publishing themes:** one current published theme while unpublished themes are retained; previous theme changes are not lost. BillionBiz adopts draft/live and rollback using immutable snapshots.
   - https://help.shopify.com/en/manual/online-store/themes/managing-themes/publishing-themes

## Webflow — design systems

Webflow describes variables/tokens, components, page templates and shared libraries, including global color/font/spacing variables and reusable component behavior. This informs BillionBiz's global tokens and reusable component architecture.
- https://help.webflow.com/hc/en-us/articles/41959932025235-Using-a-design-system-in-Webflow

## Vercel — multi-tenant domains

Vercel's Platforms documentation describes one codebase/deployment serving tenants with distinct content, branding and configuration through custom domains, wildcard subdomains or URL paths. This matches the shared BillionBiz storefront model.
- https://vercel.com/docs/platforms

Vercel's domain documentation explains wildcard domains and wildcard-certificate requirements. Verify current project settings before DNS changes; do not blindly alter existing records.
- https://vercel.com/docs/domains/working-with-domains

## W3C — responsive reflow

WCAG 2.1 Success Criterion 1.4.10 uses 320 CSS px as an important reflow reference, with exceptions for content inherently requiring two-dimensional layout. BillionBiz sets a stricter 300px storefront target, so test both 300px and 320px.
- https://www.w3.org/TR/WCAG21/#reflow

## Cautions

- Hosting/provider specifics change; verify current Vercel project/domain setup before wildcard DNS/SSL changes.
- Do not copy Shopify's numerical section/block limits as a BillionBiz requirement. Choose limits through load tests.
- “Better than Shopify” is an ambition, not a verifiable engineering property. The useful objective is a reliable, scalable system with explicit trade-offs and thoroughly tested workflows.

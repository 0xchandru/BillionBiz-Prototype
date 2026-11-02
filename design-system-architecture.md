# BillionBiz Visual Design System and Brand Tokens

## 1. Logo-derived palette

The supplied logo image was sampled to establish the base palette. These dominant colors are mapped into semantic interface tokens. Verify all foreground/background combinations against WCAG contrast requirements before release.

| Token | Color | Usage |
|---|---|---|
| `brand.teal.700` | `#064652` | Primary brand, top-level navigation, dark emphasis |
| `brand.green.600` | `#5A9A20` | Logo-matched accent, selected indicators and decorative highlights; not small text on white |
| `brand.green.700` | `#447515` | Accessible darker green variant for buttons/text when green must be the foreground |
| `brand.yellow.400` | `#FFBF15` | Small highlights; not long text or default button-text background |
| `surface.warm` | `#F6F4EE` | Main application canvas |
| `surface.default` | `#FFFFFF` | Cards, forms, menus and editor panels |
| `text.primary` | `#163238` | Primary text; validate contrast |
| `text.muted` | `#5D7073` | Secondary text; validate contrast |
| `border.subtle` | `#DDE5E1` | Dividers and control borders |
| `brand.teal.hover` | `#043A44` | Hover/pressed teal |
| `brand.green.hover` | `#4E861C` | Hover/pressed green |

Semantic success/warning/error/info colors are separate from brand colors. Never use logo yellow as the only warning signal. Contrast calculation for the supplied colors: `#5A9A20` on white is approximately 3.46:1 and `#FFBF15` on white approximately 1.65:1, so neither is acceptable for normal-size text under WCAG AA. `#064652` on white is approximately 10.47:1 and `#447515` on white approximately 5.52:1. Re-test actual rendered states and focus/hover variants before release.

## 2. UI composition

- Consistent warm off-white canvas, white content surfaces, teal brand structure and restrained logo-green accents. Use teal `#064652` with white text as the default primary button; use darker green `#447515` with white text only when a green primary action is desired.
- Teal + green identity across marketing, admin, Store Editor, Staff Portal, POS, booking and customer pages.
- Yellow is a restrained accent, not a dashboard/chart palette.
- Consistent elevation, radii, shadows and spacing.
- No random gradients, per-module palettes, arbitrary status colors or unrelated page-specific design systems.

## 3. Required shared components

Create shared tokens/components for: topbar, expandable navigation groups, workspace selector, command search, notification center, profile menu, breadcrumbs, page header, tabs, cards, metric tiles, tables, filters, bulk action bar, status pills, forms, field help, drawers, modals, confirmations, inline/toast feedback, empty/loading/error states, pagination, date/time picker, calendar, editor inspector, POS keypad/cart/tender panel and mobile navigation.

## 4. Topbar and admin shell

Logo left; store/workspace selector nearby; wide Quick Find in the center; notification icon/unread count and profile/avatar at right. Stable height; responsive collapse on small screens.

## 5. Left navigation

Expandable/collapsible groups per `information-architecture.md`, active link and parent indication, accessible disclosure semantics, keyboard/focus support, collapsed icon rail with tooltips and mobile drawer. Live badges only where meaningful.

## 6. UX states and real data

Every relevant component has loading, empty, error, stale/offline and success states. Empty states show the next real action. Error states explain failure and retry. Do not show a fake zero when the source is unavailable; distinguish actual zero, delayed data and error.

## 7. Accessibility and responsive rules

Target WCAG 2.2 AA. Validate contrast, labels, focus, semantic headings, keyboard workflows, reduced motion, zoom and touch targets. Color is never the only signal. Tables can use adaptive density/cards on mobile. POS is optimized for supported tablet/desktop hardware while retaining supported smaller-screen behavior.

## 8. Design governance

All new UI uses the shared token package and component library. Visual regression covers landing, auth, dashboard, admin modules, editor, Staff Portal and POS. New primary colors require an approved design decision.

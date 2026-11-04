# 07 — Theme Design Tokens, Typography, Buttons and Visual Effects

## 1. Universal design-system goal

All page families must share a consistent visual language. Theme tokens drive Home, listing, product, cart, account, policy, service and booking pages. Do not style each page independently with hard-coded values.

Use semantic tokens such as:
- `color.brand.primary`, `color.brand.secondary`, `color.accent`.
- `color.text.primary`, `secondary`, `inverse`, `link`.
- `color.surface.canvas`, `page`, `card`, `subtle`; `color.border.default/strong`.
- `color.status.success/warning/danger/info`.
- `font.family.body/heading/accent`; `font.size.*`, `weight`, `lineHeight`, `letterSpacing`.
- `space.*`, `container.*`, `grid.gap.*`, `radius.*`, `shadow.*`, `border.width.*`.
- `button.*`, `input.*`, `card.*`, `badge.*`, `motion.*`.

Design tab edits tokens. Components consume semantic tokens. Later section/block overrides may override a limited set but inherit by default.

## 2. Typography

Controls: heading/body/accent family from approved/licensable fonts or safe system stacks; supported font weights; display/H1-H6/lead/body/small/caption/label scale; line height; letter spacing; text transform; text width; responsive sizing; language glyph preview where relevant.

Use robust fallbacks. Do not claim full language support without checking font glyph coverage.

## 3. Color and surfaces

- Palette presets and manual semantic token edits.
- Contrast warnings show exact foreground/background pair.
- Distinguish brand palette from semantic status colors.
- Background modes: inherit, solid, gradient and approved image asset.
- Preserve manual overrides when applying another theme preset unless user explicitly resets them.
- Support light/dark variants only where fully implemented.

## 4. Buttons and controls

Variants:
- Primary — main conversion action.
- Secondary — secondary emphasis.
- Outline — bordered action.
- Tertiary/Ghost — low emphasis.
- Text/Link — inline action.
- Destructive — destructive admin actions, not routine customer conversion.

Settings: size (small/medium/large), shape (square/rounded/pill), height/padding/icon position/weight/transform, states (default/hover/active/focus-visible/disabled/loading), mobile full-width option and visible high-contrast focus indicator.

Use semantic buttons/links. Do not style a non-interactive `div` as a button.

## 5. Forms and product controls

Use consistent labels, help text, required markers, validation, error messages, disabled/focus states. Product selectors respect real variant availability and purchasing policy. Cart and checkout use the existing commerce engine.

## 6. Layout and responsive rules

- Content width presets: narrow, standard, wide, full width.
- Shared spacing scale, section/container padding, grid columns/gaps.
- Image ratio/object-fit/focal point.
- Central breakpoints; do not allow per-section breakpoints to conflict.
- CSS Grid/Flex/container queries where appropriate; no overflow at 300px.
- Sticky elements never cover primary content or focus targets.

## 7. Motion and decorative effects

Offer optional, explicit **Effects & Motion**. Examples: confetti/party-paper fall, streamers/sparkles, visual fireworks/cracker animation (silent by default), snow/seasonal particles, subtle reveals and scroll-to-top motion.

Controls:
- On/off; strong celebration effects default off.
- Effect type and visual style.
- Trigger: page load, user action, campaign/date window or explicit success event.
- Target pages/devices; duration, density, speed and intensity.
- Mobile performance setting.
- Respect `prefers-reduced-motion`; never force motion on users who request reduced motion.
- No autoplay audio, flashing/strobing effects or full-screen overlay obscuring checkout/forms.
- Stop when page is hidden/offscreen and clean up canvases/timers/listeners.
- Keep animations lightweight and do not block content or harm Core Web Vitals.

Do not make visual crackers emit sound automatically or create unsafe flashing effects. Use silent, accessible visual decoration.

## 8. Media behavior

Use one tenant media library and asset picker. Store alt text, dimensions, MIME, size, focal point and upload metadata. Optimize responsive formats, lazy-load below-fold images and reserve image dimensions to avoid layout shifts. Video requires poster/captions/controls as appropriate and a performance budget. Validate remote URLs; avoid SSRF.

## 9. Theme presets and manual overrides

A preset is a versioned token bundle, not a second page-content database. Apply to draft only. Track override scope. Reset describes exactly what it resets. Existing overrides are not silently overwritten. Published theme remains unchanged until publish.

See `schemas/theme_tokens.example.json` for an illustrative shape; map it to existing BillionBiz token conventions.

# FL-MODE-001 — Switch Storefront Mode: Commerce, Services or Both

- **Version:** 1.0
- **Goal:** Let a merchant compose the customer-facing storefront for product commerce, appointments or both using the existing BillionBiz mode vocabulary.
- **Actors:** Owner/Admin; Store Editor; Storefront Runtime.
- **Source basis:** BillionBiz public guide `Storefront Mode: Commerce, Services, or Both`; verify actual admin control path against repository because the guide does not confirm its screen location.

## Preconditions
- Store has a verified set of backend capabilities and plan entitlements.
- User has permission to manage storefront settings.
- Store timezone, locale and current publication state are known.

## Mode behavior
| Mode | Navigation | Cart/wishlist affordances | Booking funnel |
|---|---|---|---|
| Commerce | Home, Shop, About, Contact | Visible | Disabled |
| Services | Home, Book, About, Contact | Hidden | Enabled |
| Both | Home, Shop, Book, About, Contact | Visible | Enabled |

## Main flow
1. Owner opens Online Store -> Storefront Settings (exact path/label must be discovered from current prototype; do not invent it).
2. UI shows only modes supported by enabled capabilities and entitlements.
3. Owner selects Commerce, Services or Both and sees a change preview.
4. System explains that mode application updates navigation links and cart/wishlist affordances together, but the resulting values remain individually editable.
5. Owner chooses whether the home page remains Landing or changes to Booking. This is a separate setting; choosing Services or Both must not silently replace the current home page.
6. Backend validates capability and entitlement, persists the mode and writes the required navigation/icon/route configuration as one consistent operation.
7. Store preview reflects the new customer journey. Publishing behavior follows the existing Store Editor draft/release model.
8. Published storefront runtime enforces route availability on the server, not only by hiding links.

## Required route enforcement improvement

The current public guide documents a gap: Services mode hides Shop/cart entry points but leaves `/checkout` and `/order-confirmation` reachable. The native implementation must fix that behavior:

- Services mode blocks creation of new product carts/checkouts and product purchase APIs.
- Existing authorized order detail/confirmation access is preserved through a scoped customer session or signed historical order link.
- Commerce mode disables new booking funnel entry points and booking routes for unauthenticated/new booking operations.
- Both mode exposes both customer journeys.
- Capability disablement must not delete existing orders, bookings, payments or historical records.
- Navigation visibility is never the sole enforcement layer.

## Alternate/failure paths
- Mode unsupported by current entitlement/capability: disable with explanation and enable-module path.
- Save conflict: surface version conflict; do not overwrite another admin's setting.
- Publish failure: previous live storefront remains unchanged.
- Merchant manually edits a generated navigation link later: that manual customization remains; re-applying mode intentionally rewrites the preset fields after clear confirmation.

## Invariants
- Storefront Mode is distinct from backend module capability and plan entitlement.
- Home page selection is distinct from Storefront Mode.
- Navigation and icon settings are individually editable after applying the mode.
- Direct route/API calls obey mode and capability server-side.
- Historical records remain accessible according to their own authorization rules.

## Acceptance
- Commerce, Services and Both create the expected visible navigation and entry points.
- Services mode cannot create a new product checkout through direct URL/API.
- Services mode does not disable access to a legitimate historical order detail/confirmation.
- Booking route is disabled in Commerce mode and enabled in Services/Both.
- Changing mode does not delete merchant pages, products, bookings or orders.

## Traceability
- Requirements: REQ-MODE-001; REQ-MODE-002
- Tasks: T-005; T-012
- Tests: TC-MODE-001; TC-MODE-002; TC-MODE-003
- Security: SEC-048

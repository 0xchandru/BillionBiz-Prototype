# 04 — Page Catalog, System Pages and Template Matrix

## 1. Typed page architecture

Do not use one generic page component for every route. Use **typed page definitions + typed templates + real domain-data adapters**. A route resolves to a `PageType`, optional resource context and selected template version. The Store Editor configures presentation; existing Admin modules own underlying domain data and workflows.

Two kinds of resources:
- **System page types:** required routes such as Cart, Checkout, Product Detail and 404. Provision automatically and lock from deletion.
- **Merchant content pages:** About, FAQ, campaign landing pages and brand stories. Can be created, duplicated, hidden, archived and deleted subject to route/link checks.

A product/collection is a domain resource, not a custom page record. Its route uses the matching typed template.

## 2. Commerce pages

| Page type | Example route | Required? | Data source / owner | Editing boundary |
|---|---|---:|---|---|
| Home | `/` | Yes | Store brand + real collection/content | Page/template presentation |
| Product Catalog | `/products` | Yes for Commerce | Catalogue query | Query/filter/sort presentation; CRUD stays in Catalogue |
| Collection Index | `/collections` | Optional | Catalogue collections | Listing layout and visibility |
| Collection Detail | `/collections/:handle` | Yes for Commerce | One collection + its products | Collection template and display behavior |
| Product Detail | `/products/:handle` | Yes for Commerce | Product, variants, price, media, stock | Product template; data stays in Catalogue |
| Search Results | `/search?q=` | Yes for Commerce | Catalogue search service | Result/card/empty-state presentation |
| Cart | `/cart` | Yes for Commerce | Cart service/session | Cart rendering; mutations/totals stay in cart engine |
| Checkout | `/checkout` | Yes for Commerce | Checkout/order/payment services | Protected workflow; supported branding only |
| Order Status | `/orders/:orderId/status` | When order flow exists | Orders service; authorized customer/token | Protected order/status view |
| Wishlist | `/wishlist` | Optional | Wishlist service/customer | Only if backend exists |
| Compare | `/compare` | Optional | Comparison state | Only if implemented |

## 3. Customer account pages

| Page type | Example route | Required? | Data source / owner | Editing boundary |
|---|---|---:|---|---|
| Account Login | `/account/login` | If accounts enabled | Central identity/customer auth | Appearance only; auth rules stay in identity |
| Account Register | `/account/register` | Conditional | Identity/customer auth | Appearance only |
| Account Overview | `/account` | Conditional | Customer account API | Real account context |
| Profile | `/account/profile` | Conditional | People/customer profile | Profile workflow stays in customer service |
| Addresses | `/account/addresses` | Conditional | Customer address service | Real CRUD flow |
| Orders | `/account/orders` | Conditional | Orders service scoped to customer | Real order data only |
| Order Detail | `/account/orders/:id` | Conditional | Orders service | Authorization required |
| Password Recovery | `/account/recover` | Conditional | Identity service | No duplicate auth logic |
| Logout/callback | Existing auth routes | System | Identity service | Controlled by auth system |

## 4. Content, policy and system pages

| Page type | Example route | Required? | Owner | Notes |
|---|---|---:|---|---|
| Contact | `/pages/contact` | Recommended | Online Store page/template + configured message service | Validation, spam and consent |
| About | `/pages/about` | Optional starter/custom | Online Store | Custom content page |
| FAQ | `/pages/faq` | Optional | Online Store | Future FAQ section can render this content |
| Custom Page | `/pages/:handle` | Merchant-created | Online Store | Tenant-unique route and SEO |
| Blog Index | `/blogs/:blogHandle` | Conditional | Blog module | Only when enabled |
| Blog Article | `/blogs/:blogHandle/:articleHandle` | Conditional | Blog module | Article content from blog module, layout from template |
| Privacy Policy | `/policies/privacy-policy` | Required policy slot | Existing Legal/policy owner | Locked route; legal text owned elsewhere |
| Terms | `/policies/terms-of-service` | Required policy slot | Existing Legal/policy owner | No definitive legal text generation |
| Refund Policy | `/policies/refund-policy` | Required for commerce if policy demands | Existing Legal/policy owner | Warning until reviewed |
| Shipping Policy | `/policies/shipping-policy` | Conditional Commerce | Existing policy owner | No duplicate shipping form |
| Cookie Policy | `/policies/cookies` | Conditional | Existing policy/consent owner | Consent runtime must be real |
| 404 | Catch-all | Yes | System | Tenant-themed recovery page |
| Maintenance/Coming Soon | System mode | Yes | System | Controlled by access state |
| Password Gate | System mode | Conditional | System/auth | Implement only with secure access control |

## 5. Service and booking pages

Provision only when mode is `SERVICES` or `HYBRID` and actual booking capability exists.

| Page type | Example route | Required? | Data source / owner |
|---|---|---:|---|
| Services Index | `/services` | Yes for Services | Admin Appointments/Services catalogue |
| Service Detail | `/services/:handle` | Yes | Service record, duration, price, media, staff/availability summary |
| Booking Flow | `/book/:serviceHandle` | Yes | Appointment availability and booking service |
| Booking Confirmation | `/booking/confirmation/:reference` | Yes | Booking service and authorized reference |
| Manage Bookings | `/account/bookings` | Conditional | Customer identity + Appointments |
| Reschedule/Cancel | Existing authorized booking route | Conditional | Appointment workflow/cancellation policy |

Never invent availability, slots, staff or service prices in the page editor.

## 6. Typed template families

- `home` — home default and alternate home variants.
- `product-listing` — listing and search result variants.
- `collection` — collection landing and detail.
- `product-detail` — default, compact or editorial detail variants.
- `cart` — cart workflow.
- `checkout` — protected checkout branding/template.
- `account` — login/profile/address/orders.
- `content-page` — custom pages/About/FAQ/Contact.
- `blog-index`, `blog-article`.
- `policy` — privacy/terms/refund/shipping.
- `service-listing`, `service-detail`, `booking-flow`, `booking-confirmation`.
- `system` — 404, maintenance, password/coming-soon.

Multiple templates may exist per supported page type. A template can be assigned only to a compatible type. Changing a template never copies product or customer data.

## 7. Editing scope by page family

| Page family | Phase 1 | Future section/block phase | Restriction |
|---|---|---|---|
| Home | Starter template selection, page metadata, preview | Full section/block composition | Real tenant data only |
| Listing/collection | Template options and query/display preferences | Sections and product-card blocks | Catalogue owns data/filter logic |
| Product detail | Safe template options and display preferences | Ordered product-information blocks | Preserve variant/price/stock/cart behavior |
| Cart | Cart presentation | Limited safe cart regions/blocks if supported | Cart logic protected |
| Checkout | Branding only | No arbitrary structural edit | Payment/security workflow protected |
| Account | Branding and metadata | Constrained surrounding sections | Auth/personal data protected |
| Contact/custom content | Template selection and safe content editor if supported | Full sections/blocks | Sanitized content/spam checks |
| Policies | Presentation | Presentation only | Legal content owned by policy module |
| Booking | Template/branding/display settings | Service/booking blocks | Availability and booking protected |
| 404/maintenance | Message/link/safe presentation | Limited sections | Core system behavior protected |

## 8. Required route rules

- Reserve `/products`, `/cart`, `/checkout`, `/account`, `/policies`, `/services`, `/book` and other system prefixes.
- Normalize slugs and enforce tenant-scoped unique constraints.
- Add redirects for renamed/removed custom page handles.
- Keep canonical URL generation consistent across host aliases.
- Define direct-route behavior for hidden pages (404, redirect or access gate).
- Exclude private account/checkout routes from public sitemaps.

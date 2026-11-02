# BillionBiz SaaS Commerce and Website Platform Architecture

**Revision:** V2.2.0 · **Status:** Target product architecture

## 1. Product identity — what BillionBiz is

BillionBiz is a multi-tenant SaaS platform that lets independent merchants create, publish, operate and grow their own business websites and online stores. It is a commerce and website operating platform in the same product category as Shopify: BillionBiz supplies the hosted website/storefront runtime, visual editor, merchant administration, catalogue, checkout, orders, payments, fulfilment, customer records, analytics, appointments (when enabled), POS and integrations.

It is **not** a generic collection of unrelated dashboards, a website for BillionBiz only, a marketplace of merchants, or a platform where every hostname renders the same default dashboard. The merchant is the customer of BillionBiz. Each merchant uses the Merchant Admin to build and operate their own store. Their end customers visit the merchant's published storefront.

The business model and runtime are multi-tenant:

- BillionBiz owns and operates the SaaS platform.
- A merchant organization owns one or more stores.
- A store owns its pages, theme, navigation, domains, catalog configuration, service offerings, locations, customers, orders, bookings, settings and provider connections according to the enabled capabilities.
- Store customers access only the relevant merchant storefront and their own store-scoped customer records.
- BillionBiz internal operators use a separate restricted operations console. They are not ordinary merchant-admin users.

## 2. Product boundaries

| Area | Owner / actor | Responsibility |
|---|---|---|
| BillionBiz public site | Prospective merchants | Explain the platform; Start free; Log in; pricing/help/legal |
| Merchant Admin | Merchant owner, admin, manager and authorized team | Build and run the merchant's store and business |
| Store Editor | Authorized merchant users | Design pages, sections, themes, navigation, SEO and publish releases |
| Merchant storefront | Store's public customers | Browse, purchase, book, contact and manage customer account |
| Staff Portal | Merchant's invited staff | Assigned bookings, tasks, shifts and permitted work |
| Counter POS | Assigned cashier | Fast counter sales, register and receipts |
| Platform Operations | BillionBiz staff only | Tenant lifecycle, platform health, security and support operations |
| API/workers | Applications and trusted services | Enforce business rules, persistence, integration and event processing |

The Merchant Admin is customer-facing **to BillionBiz merchants**. It must not expose internal platform operations or unrestricted support tools. The `ops` experience is separate, strongly protected and never offers public self-registration.

## 3. Merchant lifecycle

1. Visitor opens `chandraprakash.codes` and chooses Start free or Log in.
2. Identity flow creates/verifies a user.
3. A successful first signup provisions an organization, owner membership, first store shell, default location, default domain slug and onboarding checklist through an idempotent backend transaction/workflow.
4. Merchant enters `admin.chandraprakash.codes` and configures business details, capabilities, store design, products/services, payments, shipping, tax, staff and policies.
5. Store Editor creates and previews a draft; it is not public until the merchant explicitly publishes.
6. Native storefront runtime serves the immutable published release on `{storeSlug}.stores.chandraprakash.codes` or a verified custom domain.
7. Orders, bookings, payments, inventory, shipments and customer activity persist in the same tenant-aware backend.
8. Merchant manages operations from Admin; assigned staff use Staff Portal; cashiers use POS.

A store must not be declared published just because it exists. The platform must verify required configuration and a successful release pointer update.

## 4. Commerce capability composition

A store may enable:

- Product commerce only.
- Appointments/services only.
- Product commerce plus appointments/services.

These are combinations of shared capabilities, not separate products or independent databases. Existing Storefront Mode vocabulary remains Commerce, Services and Both. Capability/entitlement checks happen on the server. Product purchase and appointment booking remain separate checkout aggregates initially, while sharing customer, identity, payment, notification and reporting foundations.

## 5. Core merchant value

BillionBiz must provide a complete workflow, not isolated pages:

- Create and manage an online business website.
- Design pages from templates and reusable sections.
- Maintain responsive layouts, content, brand, SEO and navigation.
- Create product catalogues, variants, inventory and bundles.
- Publish a real storefront and connect domains.
- Accept provider-verified payments and create orders.
- Manage fulfilment, shipment tracking, returns and refunds.
- Publish service offerings, schedules, availability and booking journeys.
- Operate counter sales through dedicated POS.
- Manage customers, teams, permissions and integrations.
- See real analytics based on persisted business events.

## 6. Product quality bar

“Better than Shopify” is a product ambition, not a claim the agent can assert. The agent must benchmark workflows, document measurable differentiation and avoid unsupported marketing claims. A feature is not complete because a screen exists. It must have a real data model, server-side authorization, business rules, persistence, error/empty/loading states, operational observability, tests and evidence.

## 7. Explicit exclusions unless approved

Do not drift into unrelated generic SaaS modules. Multi-vendor marketplace, social network, CRM unrelated to store operations, payroll, accounting suite, course platform, ticketing, rentals and subscription billing are deferred unless approved through an ADR and requirements update.

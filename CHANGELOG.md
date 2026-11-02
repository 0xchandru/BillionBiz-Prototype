# Changelog

## 2.1.0 — 2026-11-02

### Expanded platform experience
- Public landing page with visible Start free and Log in actions.
- Genuine first-store, no-payment signup path; organization, owner membership, default location, private store shell and onboarding checklist are provisioned idempotently.
- Email/password and Google OIDC login with verification, password recovery, session controls and owner/admin MFA policy.
- Role-aware portal routing based on server-side memberships, permissions and resource/counter assignments.
- Separate Merchant Admin, Staff Portal, cashier POS, customer account and restricted platform-operations experience shells.

### Merchant Admin navigation and operations
- Premium topbar contract: logo, workspace selector, Quick Find, notifications and profile.
- Expandable left rail with Home, Orders, Appointments, Catalogue, People, Online Store, POS & Counters, Extensions, Team, Analytics and Settings groups.
- POS & Counters manages business resources; cashier billing remains on the dedicated POS portal.
- Expanded settings control plane, extensions catalogue, transactional messaging, customer account and platform support workflows.

### Data, realtime and quality
- Explicit production mock-data elimination and database-backed dashboard requirements.
- Cross-portal realtime consistency, durable event delivery, recovery cursors and freshness states.
- Core transactional email covers account/user creation, store creation, invitations, bookings, orders, payment, shipment and security events.
- Added requirement refinement gate for 125 existing generic requirement rows. These remain DRAFT until the implementation agent resolves them against the repository and supplied reference guides.
- Added new tasks, requirements, tests, security cases, workflows and traceability records.

### Branding and domain architecture
- Added the supplied logo image to `reference/` and derived common tokens: teal `#064652`, green `#5A9A20`, yellow `#FFBF15`, warm background `#F6F4EE`.
- Added accessible green `#447515` and documented contrast guidance.
- Proposed host map for marketing, admin, identity, staff, POS, API, platform operations and tenant storefronts under `chandraprakash.codes`.

### Important status
This is a specification and execution pack, not an implementation. DNS, TLS, OAuth credentials, email sender-domain verification, Razorpay/Shiprocket provider credentials and production cutover are not configured by this archive. New test definitions are not executed. The agent must audit and validate the existing repository before implementation and must not claim completion without evidence.


## V2.2.0 — 2026-11-02

- Clarified BillionBiz as a merchant commerce SaaS for building, publishing and operating actual merchant websites/stores.
- Replaced old `.social` production host references with canonical `chandraprakash.codes`.
- Required distinct application experiences and route guards for marketing, identity, merchant Admin, staff, cashier POS, internal ops, API and wildcard storefront hosts.
- Made per-merchant/per-store provider credentials encrypted database records; prohibited merchant/provider plugin credentials in `.env` and Vercel variables.
- Expanded SiteStore retirement into a staged, evidence-based migration; explicitly preserve the native Online Store/Store Editor.
- Added mandatory store data preservation and non-destructive versioning rules to address reported data wipe on version updates.
- Added app deployment, database migration, content schema, template/theme and published store release version separation.
- Strengthened real-data, real-time, tenant isolation and launch readiness gates.
- Added a recommended TypeScript/Next.js/modular backend/PostgreSQL/outbox/worker stack while requiring repository audit and no unnecessary rewrite.
- Extended task, requirement, traceability, functional and security test registers.

This remains a target specification. It does not mean the application has been implemented or launched.


## V2.2.0 — 2026-11-02

- Clarified BillionBiz as a merchant commerce SaaS for building, publishing and operating actual merchant websites/stores.
- Replaced old `.social` production host references with canonical `chandraprakash.codes`.
- Required distinct application experiences and route guards for marketing, identity, merchant Admin, staff, cashier POS, internal ops, API and wildcard storefront hosts.
- Made per-merchant/per-store provider credentials encrypted database records; prohibited merchant/provider plugin credentials in `.env` and Vercel variables.
- Expanded SiteStore retirement into a staged, evidence-based migration; explicitly preserve the native Online Store/Store Editor.
- Added mandatory store data preservation and non-destructive versioning rules to address reported data wipe on version updates.
- Added app deployment, database migration, content schema, template/theme and published store release version separation.
- Strengthened real-data, real-time, tenant isolation and launch readiness gates.
- Added a recommended TypeScript/Next.js/modular backend/PostgreSQL/outbox/worker stack while requiring repository audit and no unnecessary rewrite.
- Extended task, requirement, traceability, functional and security test registers.

This remains a target specification. It does not mean the application has been implemented or launched.


## V2.3.0 — 2026-11-02

- Replaced the execution prompt with one controlling Antigravity V3 prompt.
- Added explicit P0 work items and acceptance tests for distinct subdomain applications, merchant-owned credential storage, SiteStore migration/retirement, store-version data preservation, real tenant data, real-time synchronization and release gates.
- Expanded task, requirement, traceability, functional and security registers while preserving existing IDs.
- Clarified this release as specification-only; implementation and launch must be independently verified.

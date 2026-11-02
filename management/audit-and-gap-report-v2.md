# BillionBiz V2 — System Audit, Current-State Matrix & Architecture Gap Report

**Audit Date:** 2026-11-02  
**Auditor:** Lead Product Architect & Engineering Agent  
**Baseline Codebase:** `billionbiz-backend` (Node.js/TypeScript/PostgreSQL 18), `billionbiz-frontend` (React 19/Vite/Zustand)  
**Specification:** `billionbiz_platform_blueprint_v2` & Reference Guides  

---

## 1. System Overview & Context

BillionBiz V2 transforms the platform from an administrative store builder into an enterprise-grade, multi-tenant commerce and service operation engine. The platform operates as **one unified modular monolith** spanning **nine distinct experience shells** hosted logically under `*.chandraprakash.social`:

```
                                  chandraprakash.social (Public Landing)
                                            │
                     ┌──────────────────────┴──────────────────────┐
                     ▼                                             ▼
          admin.chandraprakash.social                   pos.chandraprakash.social
        (Merchant Admin & Store Editor)                  (Dedicated Cashier POS)
                     │                                             │
         ┌───────────┴───────────┐                                 ▼
         ▼                       ▼                     staff.chandraprakash.social
{slug}.stores...           api.chandraprakash...            (Staff Operational Queue)
(Customer Storefront)     (Unified Ingress API)
```

The system preserves the established visual Store Editor while enforcing:
- Authoritative PostgreSQL 18 transactional truth.
- Strict server-side multitenancy and RBAC.
- Dedicated Cashier POS and Staff experiences separate from Merchant Admin.
- Elimination of mock/sample data in production with honest zeros and real read models.
- Transactional outbox event publishing for notifications and cross-portal consistency.

---

## 2. Current-State Matrix

The components across all domains are evaluated and classified into:
- `EXISTING_VERIFIED`: Built, migrated to PostgreSQL, and verified with automated test suites.
- `EXISTING_UNVERIFIED`: Code exists in repository but lacks automated assertion or end-to-end verification.
- `MISSING`: Required by V2 blueprint but not yet implemented.
- `BROKEN`: Code exists but fails build, test, or security checks.
- `PROPOSED`: Fully specified in V2 architecture; scheduled for immediate implementation.
- `DEFERRED`: Formally scheduled for a future version (e.g. WhatsApp, phone OTP, non-Google social auth).

| Domain | Feature / Subsystem | Current State | Verification Evidence / Findings |
| :--- | :--- | :--- | :--- |
| **Tenancy** | Organization, store, and location hierarchy | `EXISTING_VERIFIED` | PostgreSQL 18 tables `organizations`, `stores`, `store_locations`; verified via `TC-TEN-001`, `TC-TEN-002`. |
| **Capabilities** | Entitlements and Storefront Mode (`COMMERCE`, `SERVICES`, `BOTH`) | `EXISTING_VERIFIED` | Route guard `enforceCapability` blocks physical checkout in Services mode; verified via `TC-MODE-001`, `TC-MODE-002`. |
| **Identity** | Email/password login, JWT tokens, cashier PIN login | `EXISTING_VERIFIED` | `/api/v1/auth/login`, `/register`, `/pin-login`; verified via `TC-IAM-001`, `TC-IAM-002`. |
| **Identity** | Public Marketing Landing (`chandraprakash.social`) with "Start free" / "Log in" | `PROPOSED` | Specified in `platform-experience-architecture.md`; requires dedicated landing router/view. |
| **Identity** | Google OIDC with PKCE | `PROPOSED` | Specified in `identity-authentication-architecture.md`; adapter structure ready. |
| **Identity** | Email verification, password recovery, TOTP MFA | `PROPOSED` | Single-use token tables & outbox dispatch specified in `flows/password-recovery-and-mfa.md`. |
| **Admin Shell** | Merchant Admin Topbar (Logo, Store Switcher, Quick Find `Ctrl+K`, Alerts, Profile) | `PROPOSED` | Specified in `information-architecture.md` & `design-system-architecture.md`. |
| **Admin Shell** | Expandable Left Rail (Home, Orders, Appointments, Catalogue, People, Online Store, POS & Counters, Extensions, Team, Analytics, Settings) | `PROPOSED` | Specified in `information-architecture.md`; replaces flat navigation. |
| **Design System**| Logo-derived semantic tokens (Teal `#064652`, Green `#5A9A20`, Dark Green `#447515`, Yellow `#FFBF15`, Canvas `#F6F4EE`) | `PROPOSED` | WCAG 2.2 AA contrast verified; defined in `design-system-architecture.md`. |
| **Store Editor** | Visual Page Tree, Section Canvas, Inspector, Drafts, Themes, Templates | `EXISTING_VERIFIED` | Preserved in `billionbiz-frontend`; wired to `/api/v1/storefront/pages/:id/draft` and `/publish`. |
| **Store Editor** | Atomic whole-store release publishing with SHA-256 content hash and restore | `EXISTING_VERIFIED` | Implemented in `storefront.router.ts`; verified via `TC-STORE-004`, `TC-STORE-005`. |
| **Catalog** | Product and variant matrix with unique SKUs | `EXISTING_VERIFIED` | Implemented in `catalog.router.ts`; verified via `TC-CAT-001`, `TC-CAT-002`. |
| **Inventory** | Location-based balances and immutable movement ledger | `EXISTING_VERIFIED` | Implemented in `catalog.router.ts`; verified via `TC-INV-001`. |
| **Orders** | Order aggregate with separate payment and fulfillment status | `EXISTING_VERIFIED` | Implemented in `orders.router.ts`; verified via `TC-ORD-001`. |
| **Fulfillment** | Carrier tracking and package dispatch | `EXISTING_VERIFIED` | Implemented in `orders.router.ts`; verified via `TC-SHP-001`. |
| **Appointments**| Offerings, staff shift availability engine, 10-minute hold reservation | `EXISTING_VERIFIED` | Implemented in `appointments.router.ts`; verified via `TC-BOOK-001`, `TC-BOOK-003`. |
| **Appointments**| Concurrency-safe booking confirmation with balance due | `EXISTING_VERIFIED` | Implemented in `appointments.router.ts`; verified via `TC-BOOK-004`. |
| **POS** | Dedicated POS Cashier Application (`pos.chandraprakash.social`) | `PROPOSED` | Separation from Merchant Admin; cashier billing screen moved to standalone portal. |
| **POS** | Register sessions (Opening float, mid-day X-Report, closing Z-Report with variance) | `EXISTING_VERIFIED` | Implemented in `pos.router.ts`; verified via `TC-POS-001`, `TC-POS-006`, `TC-POS-007`. |
| **POS** | Product cart checkout and appointment balance settlement | `EXISTING_VERIFIED` | Implemented in `pos.router.ts`; verified via `TC-POS-003`, `TC-POS-008`. |
| **Staff Portal**| Dedicated Staff Portal (`staff.chandraprakash.social`) for assigned schedules | `PROPOSED` | Specified in `portal-role-and-pos-architecture.md`. |
| **Extensions** | Razorpay payment order generation, HMAC verification, webhook inbox deduplication | `EXISTING_VERIFIED` | Implemented in `extensions.router.ts`; verified via `TC-EXT-001`, `TC-EXT-002`, `SEC-026`. |
| **Extensions** | Shiprocket automated parcel dispatch and AWB generation | `EXISTING_VERIFIED` | Implemented in `extensions.router.ts`; verified via `TC-EXT-003`. |
| **Extensions** | Email marketing, WhatsApp, Delhivery marketplace cards | `PROPOSED` | Rendered as "Coming Soon" (disabled); zero false claims of active connection. |
| **Notifications**| Core transactional email and in-app alert service via Outbox | `PROPOSED` | Specified in `notifications-email-architecture.md`; outbox worker and templates. |
| **Dashboard** | Real database aggregation queries, empty states, honest zeros | `EXISTING_VERIFIED` | Implemented in `dashboard.router.ts`; verified via `TC-DASH-001`. |
| **Settings** | Grouped Settings Control Plane (15 categories matching specification) | `PROPOSED` | Specified in `settings-control-plane.md`. |
| **Domains** | Target host routing under `chandraprakash.social` & custom domain lifecycle | `PROPOSED` | Ingress normalization rules specified in `domains-routing-architecture.md`. |

---

## 3. Route, Data & API Mapping Across Experience Shells

### 3.1 Logical Shells & Host Routing Table
| Experience Shell | Target Host | Primary Routes | Target Principal Roles |
| :--- | :--- | :--- | :--- |
| **Public Landing** | `chandraprakash.social` | `/`, `/solutions`, `/pricing`, `/contact` | Visitors, prospective merchants |
| **Identity & Auth**| `admin.chandraprakash.social` | `/login`, `/register`, `/verify`, `/forgot-password`, `/reset-password` | All authenticating principals |
| **Merchant Admin** | `admin.chandraprakash.social` | `/admin/home`, `/admin/orders`, `/admin/appointments`, `/admin/catalogue`, `/admin/people`, `/admin/online-store`, `/admin/pos-counters`, `/admin/extensions`, `/admin/team`, `/admin/analytics`, `/admin/settings/*` | Organization Owner, Store Admin, Store Manager |
| **Store Editor** | `admin.chandraprakash.social` | `/editor/pages/:id`, `/editor/theme`, `/editor/preview` | Owner, Admin, Catalogue/Content Editor |
| **Staff Portal** | `staff.chandraprakash.social` | `/staff/today`, `/staff/bookings`, `/staff/schedule`, `/staff/availability` | Service Providers, Coordinators |
| **POS Terminal** | `pos.chandraprakash.social` | `/pos/register`, `/pos/billing`, `/pos/held-bills`, `/pos/close-shift` | Cashiers, Counter Operators |
| **Public Store** | `{slug}.stores...` | `/`, `/products`, `/products/:handle`, `/services`, `/book`, `/cart`, `/checkout` | Customers |
| **Customer Portal**| `{slug}.stores...` | `/account`, `/account/orders`, `/account/bookings`, `/account/profile` | Authenticated Store Customers |
| **API Ingress** | `api.chandraprakash.social` | `/api/v1/*` | Authorized Client Applications |

### 3.2 Backend API Mapping Matrix
| Domain / Module | Ingress Endpoint Path | HTTP Method | Authorization Permission | Scoping Context |
| :--- | :--- | :--- | :--- | :--- |
| **Identity** | `/api/v1/auth/register` | POST | Public | Idempotent Org/Store creation |
| **Identity** | `/api/v1/auth/login` | POST | Public | Returns session token + portals |
| **Identity** | `/api/v1/auth/pin-login` | POST | Public | Cashier PIN verification |
| **Identity** | `/api/v1/auth/forgot-password`| POST | Public | Single-use reset token |
| **Identity** | `/api/v1/auth/reset-password` | POST | Public | Token redemption + session revoke |
| **Tenancy** | `/api/v1/tenancy/stores` | GET, POST | `tenant.store.manage` | Organization context |
| **Tenancy** | `/api/v1/tenancy/stores/:id/storefront-mode` | PATCH | `tenant.store.manage` | Store context |
| **Team** | `/api/v1/team/members` | GET, POST | `team.member.manage` | Store / Location context |
| **Team** | `/api/v1/team/roles` | GET | `team.role.view` | Organization context |
| **Catalog** | `/api/v1/catalog/products` | GET, POST | `catalog.product.view/create`| Store context |
| **Catalog** | `/api/v1/catalog/inventory/adjust` | POST | `catalog.inventory.adjust` | Location context |
| **Orders** | `/api/v1/orders` | GET, POST | `orders.order.view/create` | Store context |
| **Orders** | `/api/v1/orders/:id/fulfill` | POST | `orders.order.fulfill` | Store / Location context |
| **Appointments**| `/api/v1/appointments/offerings`| GET, POST | `appointments.offering.manage`| Store context |
| **Appointments**| `/api/v1/appointments/availability`| GET | Public / Storefront | Store / Resource context |
| **Appointments**| `/api/v1/appointments/holds` | POST | Public / Storefront | 10-minute slot hold |
| **Appointments**| `/api/v1/appointments/bookings`| POST | Public / Storefront | Concurrency-safe confirmation |
| **POS** | `/api/v1/pos/counters` | GET, POST | `pos.counter.manage` | Location context |
| **POS** | `/api/v1/pos/register/open` | POST | `pos.register.open` | Counter / Device context |
| **POS** | `/api/v1/pos/register/current`| GET | `pos.register.view` | Active session context |
| **POS** | `/api/v1/pos/register/close` | POST | `pos.register.close` | Active session context |
| **POS** | `/api/v1/pos/checkout` | POST | `pos.sale.create` | Cart + Appointment settlement |
| **Storefront** | `/api/v1/storefront/pages` | GET | `store.editor.view` | Store context |
| **Storefront** | `/api/v1/storefront/pages/:id/draft`| PATCH | `store.editor.edit` | Draft versioning |
| **Storefront** | `/api/v1/storefront/publish` | POST | `store.publish` | Atomic release snapshot |
| **Storefront** | `/api/v1/storefront/releases` | GET | `store.publish` | Release history |
| **Storefront** | `/api/v1/storefront/releases/:id/restore` | POST | `store.publish` | Release rollback |
| **Extensions** | `/api/v1/extensions/razorpay/create-order` | POST | `payments.create` | Order / Booking reference |
| **Extensions** | `/api/v1/extensions/razorpay/webhook` | POST | Public / HMAC Signed | Deduplicated webhook inbox |
| **Extensions** | `/api/v1/extensions/shiprocket/create-shipment` | POST | `shipping.create` | Order fulfillment context |
| **Dashboard** | `/api/v1/dashboard/metrics` | GET | `analytics.dashboard.view` | Scoped database aggregation |
| **Notifications**| `/api/v1/notifications/inbox`| GET | `notifications.view` | Principal unread alert tray |

---

## 4. Gap Analysis & Architecture Deficiencies Identified

1. **Cashier Billing Co-location**: In the prior prototype, POS checkout was accessed as a standard page within the merchant sidebar. V2 strictly mandates that **cashier billing must run in a dedicated POS portal (`pos.chandraprakash.social`)**, with Merchant Admin reserved strictly for configuring locations, counters, devices, policies, and viewing register reports.
2. **Staff Workflow Isolation**: Staff service providers require their own dedicated portal (`staff.chandraprakash.social`) providing personal schedules and assigned bookings, strictly hiding organizational metrics, customer exports, and settings.
3. **Admin Shell Hierarchy & "People" Naming**: The prior sidebar lacked Shopify-style expandable groups and used generic naming; V2 requires the canonical hierarchy: `Home`, `Orders`, `Appointments`, `Catalogue`, `People`, `Online Store`, `POS & Counters`, `Extensions`, `Team`, `Analytics`, and `Settings`.
4. **Brand Tokens & WCAG Contrast**: Logo green `#5A9A20` has a 3.46:1 contrast on white (failing WCAG AA for normal text). V2 introduces accessible green `#447515` (5.52:1) for text/buttons while reserving `#5A9A20` for decorative accents. Primary buttons use Teal `#064652` (10.47:1) with white text.
5. **Transactional Email Service**: System emails (welcome, verification, receipts, reminders) were previously unqueued. V2 establishes a dedicated transactional outbox worker and template engine independent of third-party marketplace plugins.
6. **Requirements Refinement Gate (`T-062`)**: 125 generic placeholder rows in `management/requirements.csv` must be concretely refined against the architecture specifications and reference guides to achieve release readiness.

---

## 5. Phase Execution Roadmap

- **Phase 0 — Governance & Specification Hardening**: Complete `requirements-refinement.md`, resolve all 125 generic requirements in `management/requirements.csv`, verify `TC-EXP-048`, publish ADRs.
- **Phase 1 — Public-to-Operational Journey**: Build public marketing landing, secure onboarding pipeline, Google OIDC adapter, password recovery, and role-based portal router.
- **Phase 2 — Merchant Admin & Design System**: Implement topbar, Quick Find (`Ctrl+K`), expandable left navigation with canonical hierarchy, and logo-derived tokens across all portals.
- **Phase 3 — Dedicated POS & Staff Portals**: Deploy standalone POS cashier portal and Staff personal schedule portal.
- **Phase 4 — Transactional Email & Settings Control Plane**: Implement Outbox delivery worker, templates, and the 15-category settings control plane.
- **Phase 5 — Full Test & Security Verification**: Execute comprehensive test suites (`test-cases.csv`, `security-tests.csv`) and update execution logs and checkpoints.

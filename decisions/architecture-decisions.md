# Architecture Decision Records

Use one ADR per decision. Status is `PROPOSED`, `ACCEPTED`, `REJECTED` or `SUPERSEDED`.

## ADR-001 — Modular monolith first

- **Status:** ACCEPTED
- **Decision:** Start as a modular monolith with explicit bounded contexts and application contracts. Extract services only after measured need.
- **Context:** Premature microservices increase deployment, consistency and debugging costs before boundaries are proven.
- **Consequences:** Shared transactional database initially; domain ownership and event contracts must be enforced in code review.

## ADR-002 — Capability-based store composition

- **Status:** ACCEPTED
- **Decision:** A store enables `PRODUCT_COMMERCE`, `APPOINTMENTS` or both. Store type is not a rigid single enum.
- **Context:** A salon can sell products and book services; a clinic may only book; a retailer may only sell products.
- **Consequences:** Page routes, editor sections, setup checklist, modules and navigation are capability-aware. Product order and appointment booking remain separate aggregates.

## ADR-003 — Preserve existing Store Editor architecture

- **Status:** ACCEPTED
- **Decision:** Retain page tree/section editor, inspector, themes, template gallery, responsive preview, draft and atomic publishing lifecycle.
- **Context:** An existing BillionBiz Store Templates Guide documents this architecture and user behavior.
- **Consequences:** Native implementation replaces external SiteStore dependency but not the established editor mental model.

## ADR-004 — PostgreSQL authoritative for transactional state

- **Status:** ACCEPTED
- **Decision:** PostgreSQL enforces booking reservations, capacity, order/payment/inventory transitions and store release pointer changes; Redis is auxiliary.
- **Context:** Financial and concurrency correctness cannot depend on ephemeral cache locks.
- **Consequences:** Use transaction boundaries, constraints, outbox/inbox and load-tested indexes.

## ADR-005 — No mixed product/appointment cart in MVP

- **Status:** ACCEPTED
- **Decision:** Product purchase and appointment booking are separate checkout journeys; share customer/payment infrastructure.
- **Context:** A physical shipment and a time reservation have different fulfillment, cancellation, inventory and tax semantics.
- **Consequences:** Avoid one overloaded cart until merchant demand and coherent checkout/refund design are validated.

## ADR-006 — SiteStore removal through verified migration

- **Status:** ACCEPTED
- **Decision:** Replace SiteStore runtime and data dependencies with native BillionBiz equivalents, migrate and verify before cutover/deletion.
- **Context:** Removing first risks loss of stores, pages, media and live domains.
- **Consequences:** Staged import, checksums, canary, rollback, observation period and human approval for production cutover.

## ADR-007 — Dedicated POS Portal Architecture & Counter Session Isolation

- **Status:** ACCEPTED
- **Decision:** Cashier billing runs exclusively in a dedicated POS portal (`pos.chandraprakash.social`). Merchant Admin provides a `POS & Counters` workspace strictly for configuring locations, counters, devices, staff assignments, and viewing X/Z closure reports. Cashiers authenticate via PINs scoped to assigned counters.
- **Context:** Cashier billing operations require distinct physical device ergonomics, offline cash resilience, and restricted permissions. Co-locating cashier actions inside Merchant Admin violates the principle of least privilege.
- **Consequences:** Eliminates privilege escalation risks; enables independent PWA caching for offline cash sales.

## ADR-008 — Real Data and Honest Zeros Policy

- **Status:** ACCEPTED
- **Decision:** All dashboard charts, summary metrics, notification counters, and activity feeds MUST be computed directly from tenant-scoped database records. Clean stores display honest zeros ($0.00, 0 orders, 0 bookings) accompanied by interactive onboarding checklist cards.
- **Context:** Displaying simulated dummy metrics or sample charts in production environments causes merchant confusion and accounting discrepancies.
- **Consequences:** Builds trust; requires automated test suites to seed deterministic test data in isolated test tenants.

## ADR-009 — Token-based Brand Design System and WCAG 2.2 AA Contrast Compliance

- **Status:** ACCEPTED
- **Decision:** Establish a formal design token system:
  - Text & Headings: Brand Teal `#064652` (10.47:1) or Charcoal `#1E293B`.
  - Primary Action Buttons: Accessible Dark Green `#447515` (5.52:1 contrast against white).
  - Badges & Accents: Brand Green `#5A9A20` and Accent Yellow `#FFBF15` (Yellow text permitted only over dark teal `#064652`, 6.35:1).
  - Backgrounds: Warm Off-White `#F6F4EE` and White `#FFFFFF`.
- **Context:** BillionBiz brand logo colors (Teal, Green, Yellow, Warm Off-White) include shades that fail WCAG 2.2 AA contrast minimums (4.5:1 for body text) if applied naively on light backgrounds.
- **Consequences:** Guarantees 100% WCAG 2.2 AA compliance across all 9 portal shells while maintaining brand identity.

## ADR-010 — Outbox Pattern for Transactional Email and Notifications

- **Status:** ACCEPTED
- **Decision:** Decouple core notifications from third-party marketplace plugins. Core notifications write domain events to the PostgreSQL `outbox_events` table within the same business transaction. A durable background worker claims rows, executes delivery via configured transactional adapters, and updates delivery logs with retry backoff.
- **Context:** Transactional notifications (signup verification, password reset, order confirmation, booking reminders) are mission-critical and must not fail due to external API latency or optional extension states.
- **Consequences:** Guarantees notification delivery reliability; isolates core messaging from third-party plugin downtime.

## ADR-011 — Multi-Tenant Host Routing & Subdomain Resolution

- **Status:** ACCEPTED
- **Decision:** Establish a formal host routing schema:
  - `chandraprakash.social`: Public marketing landing page.
  - `admin.chandraprakash.social`: Merchant Admin workspace.
  - `staff.chandraprakash.social`: Staff personal portal.
  - `pos.chandraprakash.social`: Dedicated Cashier POS PWA.
  - `api.chandraprakash.social`: Core backend API gateway.
  - `{slug}.stores.chandraprakash.social`: Merchant public storefronts.
- **Context:** BillionBiz operates 9 distinct logical experience shells across public marketing, administration, retail POS, staff operations, API, and tenant storefronts.
- **Consequences:** Logical separation of concerns; simplifies security cookie scoping and CORS policies.

## ADR-012 — Marketplace Extension Lifecycle and Coming-Soon Integrity

- **Status:** ACCEPTED
- **Decision:** Only integrations with genuine, tested adapters (Razorpay and Shiprocket in Phase 1) can be connected. Unintegrated services (WhatsApp, Email Marketing, Delhivery) are explicitly labeled `Coming Soon` and cannot be installed or faked.
- **Context:** The BillionBiz marketplace will eventually support various payment gateways, shipping aggregators, marketing automation, and messaging plugins. Simulating unavailable integrations harms merchant reliability.
- **Consequences:** High platform credibility; prevents merchant frustration from non-functional third-party integrations.

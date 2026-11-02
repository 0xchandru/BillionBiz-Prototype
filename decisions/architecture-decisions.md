# Architecture Decision Records

Use one ADR per decision. Status is `PROPOSED`, `ACCEPTED`, `REJECTED` or `SUPERSEDED`.

## ADR-001 — Modular monolith first

- **Status:** PROPOSED
- **Decision:** Start as a modular monolith with explicit bounded contexts and application contracts. Extract services only after measured need.
- **Context:** Premature microservices increase deployment, consistency and debugging costs before boundaries are proven.
- **Consequences:** Shared transactional database initially; domain ownership and event contracts must be enforced in code review.

## ADR-002 — Capability-based store composition

- **Status:** PROPOSED
- **Decision:** A store enables `PRODUCT_COMMERCE`, `APPOINTMENTS` or both. Store type is not a rigid single enum.
- **Context:** A salon can sell products and book services; a clinic may only book; a retailer may only sell products.
- **Consequences:** Page routes, editor sections, setup checklist, modules and navigation are capability-aware. Product order and appointment booking remain separate aggregates.

## ADR-003 — Preserve existing Store Editor architecture

- **Status:** PROPOSED
- **Decision:** Retain page tree/section editor, inspector, themes, template gallery, responsive preview, draft and atomic publishing lifecycle.
- **Context:** An existing BillionBiz Store Templates Guide documents this architecture and user behavior.
- **Consequences:** Native implementation replaces external SiteStore dependency but not the established editor mental model.

## ADR-004 — PostgreSQL authoritative for transactional state

- **Status:** PROPOSED
- **Decision:** PostgreSQL enforces booking reservations, capacity, order/payment/inventory transitions and store release pointer changes; Redis is auxiliary.
- **Context:** Financial and concurrency correctness cannot depend on ephemeral cache locks.
- **Consequences:** Use transaction boundaries, constraints, outbox/inbox and load-tested indexes.

## ADR-005 — No mixed product/appointment cart in MVP

- **Status:** PROPOSED
- **Decision:** Product purchase and appointment booking are separate checkout journeys; share customer/payment infrastructure.
- **Context:** A physical shipment and a time reservation have different fulfillment, cancellation, inventory and tax semantics.
- **Consequences:** Avoid one overloaded cart until merchant demand and coherent checkout/refund design are validated.

## ADR-006 — SiteStore removal through verified migration

- **Status:** PROPOSED
- **Decision:** Replace SiteStore runtime and data dependencies with native BillionBiz equivalents, migrate and verify before cutover/deletion.
- **Context:** Removing first risks loss of stores, pages, media and live domains.
- **Consequences:** Staged import, checksums, canary, rollback, observation period and human approval for production cutover.

## ADR template

### ADR-NNN — Title
- **Status:** PROPOSED
- **Date:** YYYY-MM-DD
- **Context:**
- **Options considered:**
- **Decision:**
- **Trade-offs/consequences:**
- **Security/privacy impact:**
- **Migration impact:**
- **Linked tasks/requirements/tests:**

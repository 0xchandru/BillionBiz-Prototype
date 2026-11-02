# BillionBiz V2 Implementation Plan

`management/tasks.csv` is the detailed backlog. Preserve all prior IDs; append new IDs for V2 work. Never silently delete or renumber tasks. Reorder only when dependencies require it and record the reason.

## Phase 0 — Repository audit and architecture approval
- **Mandatory requirement refinement gate:** complete `requirements-refinement.md` / task `T-062`. The register contains generic draft rows; resolve each against source guides and repository behavior before implementing its domain. Do not guess.
- Inspect repository, environments, routes, design tokens, identity, database, SiteStore, Store Editor, POS, Appointments, provider integrations, email and deployment.
- Read all reference guides; verify features instead of assuming they exist.
- Produce current-state matrix (`EXISTING_VERIFIED`, `EXISTING_UNVERIFIED`, `MISSING`, `BROKEN`, `PROPOSED`, `DEFERRED`), dependency map, risk register and Architecture V1 → critique → V2 → ADRs.

## Phase 1 — Platform foundations and identity
- Tenant/organization/store/location and membership model.
- Email/password + Google OIDC through audited standards-compliant identity integration.
- Email verification, recovery, session management, MFA and role-aware routing.
- Signup provisioning transaction for owner/org/store shell and setup checklist.
- Invitation-only staff onboarding and permission/assignment model.
- Audit, outbox/inbox, idempotency, events, migrations and observability.

## Phase 2 — Public acquisition and design system
- Marketing landing page with Start free and Log in.
- Logo-derived tokens, typography, common components and accessibility.
- Merchant Admin topbar, expandable navigation, workspace selector, Quick Find, notifications and profile.
- Responsive Staff/POS/customer shells.

## Phase 3 — Native Storefront and domains
- Preserve existing Store Editor and page/section/template data model.
- Capability-aware Commerce/Services/Both journeys.
- Draft, preview, publish, restore and native rendering.
- Host routing, store slug, domain verification and TLS lifecycle.
- Migrate SiteStore only after replacement, migration validation, rollback and explicit production approval.

## Phase 4 — Catalogue, People, Orders and Finance
- Products, categories, bundles, inventory, imports/exports.
- Shared People/customer directory and privacy controls.
- Orders, payments, fulfilment, returns/refunds, invoices and ledger.
- Reconciliation and transaction correctness.

## Phase 5 — Appointments and Staff Portal
- Offerings, staff/resources, availability, booking holds and capacity.
- Booking lifecycle, deposits, policies, reminders and customer account flows.
- Staff portal with assigned schedule and authorized actions.

## Phase 6 — POS and Counters
- Merchant POS & Counters configuration pages.
- Locations, counters, registers, devices, staff assignment, receipts, cash management and policies.
- Dedicated POS portal with staff login, assigned-counter access and fast checkout.
- Offline queue and controlled reconciliation.

## Phase 7 — Extensions and messaging
- Core email/in-app notification service and delivery health.
- Razorpay/Shiprocket only after real sandbox/provider validation.
- Marketplace statuses and Coming Soon entries with install disabled.

## Phase 8 — Real-data dashboards, complete settings and analytics
- Remove production mocks/hardcoded values.
- Metric dictionary and tenant-safe read models.
- Realtime invalidation/freshness indicators.
- Complete grouped settings control plane.
- Analytics by capability, role and location.

## Phase 9 — Security, performance and production readiness
- Functional, integration, regression, accessibility, performance and security testing.
- Tenant isolation, session, auth, role, CSRF, OAuth, IDOR, webhook, file and export tests.
- Backup/restore, disaster recovery, deployment, monitoring and rollback.
- Authorized DNS/domain/mail/provider production cutover.

## Phase 10 — Post-launch expansion
Only after core reliability: broader marketplace, WhatsApp/email marketing plugins, Delhivery, developer APIs, automation, loyalty/CRM and advanced analytics. No Coming Soon feature may be claimed as delivered.

## Definition of Done

See `release-readiness.md`, `testing-strategy.md`, `security-test-plan.md` and `management/README.md`. No feature is VERIFIED without runtime evidence, tests, permission checks, data integrity and updated traceability.

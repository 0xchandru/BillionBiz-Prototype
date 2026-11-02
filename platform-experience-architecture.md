# BillionBiz Platform Experience Architecture — V2

**Status:** Target specification. This document extends the original domain architecture. It does not assert that any feature already exists. Verify all implementation claims against the repository and runtime.

## 1. Product experience model

BillionBiz is one SaaS platform with multiple role-specific experiences sharing identity, tenant context, APIs, business data and domain services:

1. **Public marketing/acquisition site** — explains the product and directs visitors to **Start free** or **Log in**.
2. **Identity/account entry** — signup, login, email verification, recovery, MFA and workspace selection.
3. **Merchant Admin** — owner and permitted managers configure and operate the business/store.
4. **Store Editor** — preserves the existing BillionBiz page tree, section canvas, inspector, theme, template, draft, preview, snapshot, publish and history architecture.
5. **Public Storefront** — Commerce, Services or Both.
6. **Customer account area** — customer sees their own orders, bookings, receipts/invoices and profile within the correct store context.
7. **Staff Portal** — service providers and operational staff see only assigned work and permitted actions.
8. **Counter/POS application** — dedicated cashier interface, separate from Merchant Admin, scoped to assigned counters/locations.
9. **Platform Operations Console** — internal staff manage tenants, plans, support, platform health and security. This is not the merchant admin.

These are different application shells/routes, not duplicated business systems. One human can hold multiple memberships and roles. Role and tenant scope are resolved server-side, never trusted from a client-selected role string.

## 2. Public landing page

The root domain is the public BillionBiz marketing website, not a login-only splash screen.

### Header
- BillionBiz logo/brand at left.
- Navigation: Platform, Solutions, Integrations, Resources, Pricing (only when real plan data exists), Contact.
- Primary CTA: **Start free**.
- Secondary CTA: **Log in**.
- Responsive mobile menu with the same actions.

### Page sections
- Clear product headline for businesses selling products, services by appointment, or both.
- Product overview: Store Editor, catalogue/orders, appointments, POS, team and integrations.
- Separate examples for product sellers, appointment-led services and hybrid businesses.
- Feature/workflow details, integration availability, security information, FAQs and footer with legal/contact links.
- Use real product screenshots or visibly labelled conceptual visuals. Never fabricate customer testimonials, metrics or capabilities.
- Responsive, accessible, SEO metadata, optimized assets and privacy/cookie handling where required.

The two CTAs must be visible without scrolling. The public page must not expose private merchant/customer data in screenshots.

## 3. Signup and automatic first-store provisioning

### Initial sign-up methods
- Email + password.
- Continue with Google using OpenID Connect authorization-code flow with PKCE.
- Email verification and password reset.
- MFA enrollment for owners/admins; support passkeys/WebAuthn as an enhancement when the identity stack supports it.

Do not add many social providers just for visual parity. Email/password plus Google is a practical initial set. Phone OTP as primary login is not required initially: SMS costs, delivery dependencies, SIM-swap risk and abuse controls add complexity. Add it only when demand justifies it. Email verification is not MFA.

### Signup sequence
1. Visitor selects **Start free**. This is a genuine no-card signup path; it must not imply a free plan if account provisioning is paywalled.
2. Visitor chooses email/password or Google.
3. Validate input and apply rate limits/anti-automation controls.
4. Create identity in `PENDING_VERIFICATION` where verification is required.
5. Send a single-use, time-limited verification message.
6. Collect business/store display name and available store slug.
7. In one idempotent transaction create organization, owner membership, store shell, default location, initial capability selection and onboarding checklist.
8. Assign a draft storefront address such as `https://{slug}.stores.chandraprakash.social` only after the host-routing layer exists.
9. Enqueue account-created and store-workspace-created emails.
10. Assign the store to the configured no-payment entry tier (exact feature limits are configuration, not hardcoded UI copy); do not collect payment details or start a paid subscription without an explicit, informed choice.
11. Redirect to the new Merchant Admin workspace with a checklist computed from persisted data.

**Store availability means the private merchant workspace and draft storefront exist immediately. It does not mean the store is publicly purchasable before required setup and explicit publish.** Never automatically publish an unfinished or unverified store.

### Onboarding checklist
Derive every item from persisted domain data, not frontend booleans. Include business profile, store mode/capabilities, at least one product for Commerce or one offering plus eligible resource/schedule for Services, payment setup or explicit offline tender, shipping only when needed, design preview, domain status, policies/contact details and explicit publish. Support save-and-resume. Distinguish required from optional setup.

## 4. Login, recovery and role-aware routing

Use one central identity service for merchant, staff, POS and customer identities, with distinct policies and destinations:
- `admin.chandraprakash.social/login` — merchant admin.
- `staff.chandraprakash.social/login` — staff portal.
- `pos.chandraprakash.social/login` — cashier portal.
- Customer sign-in starts from the individual storefront and is scoped to that store/customer relationship.

After authentication:
1. Validate session and active account status.
2. Resolve memberships, tenant, store/location scopes, roles, capabilities and resource/counter assignments server-side.
3. Route directly if exactly one permitted destination exists.
4. Show a workspace selector if multiple memberships exist.
5. Staff-only users go to Staff Portal; cashier-only users see assigned counters; customers return to their originating store; merchants go to Merchant Admin.
6. If there is no eligible membership, show safe access-denied/onboarding guidance, not an empty dashboard.
7. Preserve only an allow-listed intended destination; never accept arbitrary `returnTo` URLs.

### Account security
- Password-reset tokens are cryptographically random, single-use, time-limited and invalidated after use.
- Do not reveal whether an email exists.
- Apply attempt/request rate limits, abuse detection and security notifications.
- Require re-authentication for email/password changes, owner transfer, payment credentials, domains and API secret rotation.
- Owner/admin accounts must support MFA, recovery codes and audited recovery.
- Provide active session/device list and revoke-one/revoke-all controls.
- Staff invitations are authorized, single-use and expiring; no open staff self-registration into a merchant tenant.

## 5. Tenant/store lifecycle

Canonical hierarchy: `Identity User → Organization → Membership → Store → Location → Resources/Counters`.

An organization can own multiple stores. A store can have multiple locations, domains and capabilities. Memberships can be scoped to organization/store/location and narrowed further to counters/resources. Initial signup provisions one starter organization/store. Later stores require plan entitlement. The initial `Start free` experience must provision the first store without requiring a payment method; commercial quotas, upgrade pricing and paid billing must be explicitly configured before they are advertised. Ownership transfer, closure and deletion need lifecycle states, retention controls and confirmations; financial records must not be casually hard-deleted.

## 6. Capability-aware storefront

Retain the existing presets:
- Commerce: product catalogue, cart, checkout and orders.
- Services: offerings, availability and booking.
- Both: both customer journeys on one storefront.

Entitlements, persisted capabilities and visual mode presets remain distinct. Backend APIs must block disabled actions even when a visitor manually enters a URL. Product orders and appointment bookings remain separate aggregates initially; no mixed cart is required in the first release.

## 7. Product experience quality bar

Every journey needs a clear next action, progressive disclosure, save/resume where appropriate, real loading/empty/error/retry/partial-success states, permission explanations, responsive/keyboard support and visible saved/sync state. No decorative button, dead menu, fake count, hardcoded chart or disconnected success toast may ship as a completed feature.

## 8. Internal platform operations console

Provide a separate, restricted operations console (proposed `ops.chandraprakash.social`) for BillionBiz personnel. It is not the merchant admin and must use stronger authentication, least-privilege roles, separate privileged sessions, just-in-time access where feasible, approval/audit for sensitive support actions, and explicit tenant-context banners. Internal operators must not inherit merchant permissions or silently impersonate users. Support access is time-bound, reason-coded and logged. Provide tenant lifecycle/support tools, feature/incident status, job/queue health, email delivery health, provider/webhook health, domain/certificate state, audit search and controlled data export tools.

## 9. Customer account area

The customer account area is store-scoped and reachable from the relevant storefront. It supports profile and verified contact details, order history, shipment tracking, booking history, booking reschedule/cancellation where policy allows, receipts/invoices, saved addresses and communication/privacy preferences. Show only customer-owned records for the active store. Guest orders/bookings may be linked only after verifying the original contact channel and matching a secure claim token. A customer identity never becomes a merchant membership by account linking.


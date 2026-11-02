# Domains, Separate Applications, Host Routing and Storefront Tenant Resolution

**Revision:** V2.2.0 · **Canonical domain:** `chandraprakash.codes` · **Status:** Target architecture; not proof of DNS or deployment completion.

## 1. Product identity and application boundaries

BillionBiz is a multi-tenant commerce SaaS platform for merchants to create, publish, manage and operate their own business websites/stores. It is not a general-purpose portal directory. The primary customer is the merchant who uses BillionBiz to build and run a store. Store visitors are the merchant's customers.

Each hostname is a separate user experience with its own application entrypoint, layout, navigation, authorization policy and route set. Sharing UI packages, API clients and backend domain services is encouraged; rendering the same generic dashboard/page on every hostname is prohibited.

| Hostname | Application / user | Required experience |
|---|---|---|
| `chandraprakash.codes` | Public / prospective merchant | Premium marketing landing page, product explanation, pricing/plans if approved, Start free, Log in, help/legal links |
| `www.chandraprakash.codes` | Public | Canonical redirect to apex (or one documented canonical choice) |
| `accounts.chandraprakash.codes` | All account holders | Central identity, sign-in, sign-up, email verification, password recovery, MFA/passkeys if implemented, invitation acceptance and secure redirect |
| `admin.chandraprakash.codes` | Merchant owner/admin/team | Merchant workspace, onboarding, dashboard, Online Store editor, catalogue, orders, customers, appointments, POS/counter resource management, extensions, team, analytics and settings |
| `staff.chandraprakash.codes` | Invited merchant staff | Assigned work only: schedule, appointments, customer context allowed by role, availability, task/status updates and profile |
| `pos.chandraprakash.codes` | Assigned cashier | Dedicated fast billing/POS experience, assigned store/location/counter/register, cash session, product scan/search, cart, tender/payment, receipt and safe offline queue where supported |
| `ops.chandraprakash.codes` | BillionBiz internal operators only | Restricted platform operations, tenant health, deployment/queue/integration status and auditable, time-bound support access. No public signup and no merchant operations dashboard. |
| `api.chandraprakash.codes` | Machine/API clients | Versioned API ingress only; no default platform landing page. Configure only when real backend ingress exists. |
| `*.stores.chandraprakash.codes` | Public merchant storefront visitors | Native storefront runtime that resolves the exact hostname to one verified store and its active published release |
| `assets.chandraprakash.codes` | Optional CDN | Public versioned assets only where a separately configured asset host is justified |
| `status.chandraprakash.codes` | Optional status page | Only if an actual monitored status service is operated |

## 2. Separate applications are required

DNS aliases alone do not create separate applications. If every hostname points to the same Vercel project and the application does not dispatch by trusted hostname, each host will display the same default page. That is a routing/application implementation defect, not a DNS feature.

Preferred deployment: a monorepo with separate deployable app entrypoints/projects for marketing, identity, merchant-admin, staff, POS, storefront, platform-ops and API/worker where justified. Each Vercel project must have its correct Root Directory, framework/build settings and domain assignment. Shared packages may be imported through the workspace.

Acceptable alternative: one Vercel deployment with explicit trusted hostname dispatch to distinct route trees and root layouts. It must have separate application identity, navigation, authentication guard, permissions, page bundles and route allow-lists per host. Do not use a generic catch-all that renders the same default dashboard. The agent must choose after auditing the current repository and document the decision.

## 3. Trusted host resolution

1. Normalize hostname (lowercase, remove port/trailing dot, handle IDN consistently).
2. Accept forwarded host only from a known ingress/proxy; strip user-supplied forwarding headers at the edge.
3. Resolve reserved application hosts before storefront wildcard resolution.
4. Resolve exact active custom/default domain record to one store; do not infer ownership from a slug alone where a verified domain record is required.
5. Require host state `ACTIVE`, ownership proof and valid routing/certificate state as applicable.
6. Reject unknown, unverified, suspended, conflicting or malformed hosts with correct 404/403/suspension behavior; never fall back to a generic merchant dashboard.
7. Derive tenant context server-side. Never trust a browser-supplied store ID, organization ID, `X-Store-ID`, query value or route param as authorization.
8. Enforce tenant and record-level authorization again in backend/domain services and database constraints/RLS where available.

## 4. Store and custom-domain lifecycle

Default store domain: `{store-slug}.stores.chandraprakash.codes`. Custom merchant-owned domains are a later/controlled capability requiring ownership verification and certificate lifecycle support.

Lifecycle: `REQUESTED → DNS_PENDING → OWNERSHIP_VERIFIED → CERTIFICATE_PENDING → ACTIVE → SUSPENDED/FAILED → REMOVED`.

Record normalized host, owner, store, verification evidence, DNS target/state, certificate state/expiry, canonical/redirect policy, last check, failures and audit history. Only one active store may own a hostname. Safe detach/reassignment must invalidate caches and old routing immediately.

## 5. Domain-specific routing and UX acceptance

- Root domain must load marketing landing, not merchant Admin.
- `accounts` must load auth screens, not the Admin dashboard.
- `admin` must load merchant workspace and Store Editor.
- `staff` must show staff-only navigation and assigned tasks.
- `pos` must load cashier-first billing, not Admin resource configuration.
- `ops` must enforce internal operator identity/MFA and display platform operations only.
- API host must return API/health behavior, not HTML dashboard.
- A known active store host must render that store's actual published website.
- Unknown store host must return a real not-found page; never show a demo store.

Every host must display a distinct application identifier in deployment smoke tests (and appropriate `<title>`, shell and route policy). Add Playwright tests that visit every hostname and assert correct app identity, navigation, login policy and absence of another portal's content.

## 6. DNS, TLS and Vercel

The user has already delegated Name.com nameservers to Vercel DNS and added CNAME records in Vercel. Inspect current Vercel DNS and project domain assignments; do not recreate records blindly or change nameservers. A hostname must be assigned to the intended Vercel project/deployment as well as have a valid DNS record. The wildcard storefront domain must be assigned and verified according to Vercel's current requirements.

Never invent an ingress target. Do not point `api` at the frontend project unless that deployment actually provides the backend API. The current ngrok URL is temporary development infrastructure, not a stable production origin.

No AI agent may alter live DNS, certificate configuration, MX/SPF/DKIM/DMARC, apex traffic or production routing without domain-owner approval and a change plan.

## 7. Environments and cutover

Local development, preview/staging and production require separate backend origins, databases, secrets, storage namespaces, OAuth callback URLs, webhook URLs and email senders. Preview must never use production customer data or merchant credentials. Domain cutover requires host smoke tests, TLS checks, rollback plan and owner approval.

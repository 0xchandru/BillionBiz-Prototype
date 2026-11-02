# Portal Applications and Host-Based Routing Architecture

**Revision:** V2.2.0 · **Status:** Mandatory target behavior

## 1. Core rule

Each production hostname has one explicitly defined application experience. It is a release blocker if all subdomains simply show the same default platform page, generic dashboard, static demo content or identical navigation shell. Shared design components and backend services are encouraged; shared generic entrypoints that ignore hostname purpose are not.

## 2. Canonical host-to-application map

| Host | Application entrypoint | Intended actor | Required first screen / behavior | Must never show |
|---|---|---|---|---|
| `chandraprakash.codes` | Marketing app | Visitors/prospective merchants | BillionBiz landing, product explanation, Start free, Log in, pricing/help/legal | Merchant dashboard or tenant data |
| `www.chandraprakash.codes` | Canonical redirect | Visitors | Permanent redirect to apex (one chosen canonical) | Duplicate independently indexed site |
| `accounts.chandraprakash.codes` | Identity app | All account types | Sign in, sign up (eligible roles), verify email, recovery, MFA, session and secure return routing | Merchant business dashboard or public store editor |
| `admin.chandraprakash.codes` | Merchant Admin app | Merchant owners/admins/managers/authorized team | Store/workspace selection, onboarding or real tenant-scoped merchant dashboard | BillionBiz internal operations, generic mock page or cashier billing-only layout |
| `staff.chandraprakash.codes` | Staff app | Invited staff | Assigned work, schedule, bookings, shifts and profile according to permission | Owner-only settings, cross-tenant records or full merchant admin by default |
| `pos.chandraprakash.codes` | POS PWA | Assigned cashier | Authorized counter/device selection or cashier register/sale workspace | Marketing page, Merchant Admin shell or unassigned counters |
| `ops.chandraprakash.codes` | Internal Operations app | BillionBiz platform operators only | Strong-auth restricted operator console | Public registration, ordinary merchant settings or implicit impersonation |
| `api.chandraprakash.codes` | API ingress only | Authorized applications/providers | Versioned API responses and health endpoints | Generic website HTML or dashboard |
| `{slug}.stores.chandraprakash.codes` | Native Storefront Runtime | Merchant's customers | Resolve active store domain then render its published website | BillionBiz admin shell, another merchant's site or shared demo data |
| Verified merchant custom domain | Native Storefront Runtime | Merchant's customers | Same store release as its assigned verified host | Admin application or unverified tenant mapping |
| `assets.chandraprakash.codes` (optional) | Media/CDN ingress | Browsers and applications | Approved public/private media delivery | App shell or private media without authorization |

Customer account pages are store-scoped paths such as `/{store-context}/account` on that merchant's storefront, unless a separately documented universal customer-account product is approved. They must never mix customers between stores.

## 3. Vercel deployment approach

Preferred structure: a monorepo with separate app roots and shared packages. Deploy separate Vercel projects for the experiences that need distinct hostnames and independent release boundaries:

- `apps/marketing`
- `apps/identity`
- `apps/merchant-admin`
- `apps/staff`
- `apps/pos`
- `apps/storefront`
- `apps/platform-ops`
- shared `packages/ui`, `packages/design-tokens`, `packages/api-client`, `packages/auth-contracts`, `packages/validation`, `packages/types`.

The API remains a separate backend runtime and is not made into a Vercel frontend merely by adding a domain. The dynamic storefront project receives apex wildcard hosts and resolves the exact host against the domain registry.

If repository or deployment constraints make separate Vercel projects impractical, a single application may be retained only if it implements verified, server-side host dispatch to genuinely separate route trees, layouts, guards and application manifests. A generic catch-all component that changes only a heading is not acceptable. Do not attach all custom domains to one default page and mark the portal work complete.

Before deployment, inspect the current Vercel project/domain assignments. Record the exact project, root directory, build command, output, environment and assigned host for every app. Never invent DNS targets. Preserve the existing Vercel DNS delegation and only change host assignment through an approved deployment plan.

## 4. Host resolution and tenant security

- Normalize hostname at trusted ingress; remove trailing dot, lowercase and normalize IDNA consistently.
- Trust `Host`/forwarded-host only from known ingress and strip untrusted forwarded headers.
- Resolve storefront host through an exact active `store_domains` record (wildcard slug mapping is still validated against a store record and status).
- Do not derive tenant identity from a query string, body field or arbitrary `X-Store-ID` header.
- A store slug is a locator, not authorization. Customer/admin/staff access still uses authenticated actor and membership/ownership rules.
- Reject unknown, disabled, suspended, pending-verification and conflicting domains with correct status pages.
- Reserve all platform subdomains (`www`, `admin`, `accounts`, `staff`, `pos`, `ops`, `api`, `assets`, `status`, `stores`) from merchant slug allocation.
- Cache host mappings with explicit invalidation on publish/domain change/suspension; sensitive state rechecks against the database.
- Never leak internal tenant IDs or another store's unpublished release.

## 5. Authentication and role-aware redirects

All portals use shared identity and session policy, not independent user databases. The identity flow validates membership, role, assigned store/location/counter, requested return URL and origin. Return URLs must be allow-listed and must not create open redirects.

- Merchant owner/admin → Merchant Admin store selector/onboarding.
- Staff → Staff Portal and assigned store context.
- Cashier → POS counter selection limited to approved assignments.
- Platform operator → Ops only after privileged identity policy and MFA.
- Store customer → return to the originating merchant storefront account/checkout journey.

A valid login does not grant every portal. Each application enforces its own server-side authorization on every API request and real-time subscription.

## 6. Route/build verification

Automated deployment tests must request every host and verify:
- Correct application identity, page title, logo, layout and navigation.
- Correct login behavior and access guards.
- Correct app-specific static assets/build ID.
- No default placeholder app is served accidentally.
- No host can resolve a different tenant's store.
- API hostname returns API content type, not frontend HTML.
- Storefront renders the expected published release for each test tenant.

Release gate: every configured hostname has a passing host-to-app routing test. DNS resolution alone is not proof of application routing.

# Domains, Host Routing, Tenant Storefronts and Custom Domain Lifecycle

## 1. Proposed domain map

The following is the recommended logical host map for `chandraprakash.social`. It is a target plan, not proof that DNS, certificates or deployments are configured.

| Hostname | Responsibility |
|---|---|
| `chandraprakash.social` | Public BillionBiz landing/marketing site |
| `www.chandraprakash.social` | Redirect to canonical apex or serve same marketing app |
| `admin.chandraprakash.social` | Merchant Admin and Store Editor |
| `accounts.chandraprakash.social` | Central identity/verification/recovery entry, if split-host auth is chosen |
| `staff.chandraprakash.social` | Staff Portal |
| `pos.chandraprakash.social` | Dedicated Counter/POS application |
| `api.chandraprakash.social` | Versioned API ingress |
| `ops.chandraprakash.social` | Restricted internal platform operations console |
| `stores.chandraprakash.social` | Reserved tenant storefront base host |
| `{store-slug}.stores.chandraprakash.social` | Default tenant storefront host |
| `assets.chandraprakash.social` | Versioned static assets/media if a separate asset host is needed |
| `status.chandraprakash.social` | Public status page if operated |

Example routes:
- `https://admin.chandraprakash.social/login`
- `https://admin.chandraprakash.social/register`
- `https://admin.chandraprakash.social/onboarding`
- `https://admin.chandraprakash.social/store/{storeId}/online-store/pages`
- `https://staff.chandraprakash.social/appointments`
- `https://pos.chandraprakash.social/counter/{counterId}`
- `https://{store-slug}.stores.chandraprakash.social/` and `/book` when appointments are enabled.
- `https://{store-slug}.stores.chandraprakash.social/account` for that store’s customer order/booking account area.

Customer-owned custom domains such as `shop.customer-domain.com` should be supported only after ownership verification and automated certificate lifecycle are implemented.

## 2. Host-based tenant resolution

1. Normalize incoming host using trusted ingress configuration.
2. Resolve exact active domain record to one store/tenant.
3. Require ownership verification and valid certificate state for custom hosts.
4. Reject unknown, suspended, pending-verification and conflicting hosts.
5. Never infer tenant from an arbitrary client-supplied request header.
6. Trust forwarded-host headers only when set by configured reverse proxies; strip untrusted values at the edge.
7. Cache mappings with invalidation-aware TTL; revalidate high-risk ownership changes.

A store ID in a URL or frontend state is never a substitute for authorization.

## 3. Domain lifecycle

`REQUESTED → DNS_PENDING → OWNERSHIP_VERIFIED → CERTIFICATE_PENDING → ACTIVE → SUSPENDED/FAILED → REMOVED`.

Record owner, requested/normalized host, validation method, DNS instructions, verification evidence, certificate status/expiry, last check, attached store, canonical/redirect policy and audit history. Require DNS proof before attaching a host. Re-check certificate lifecycle and alert before expiry or loss. Only one active store may own a host. Detach safely before reassignment.

## 4. DNS and TLS execution

Use the actual hosting provider's assigned ingress target; do not invent a static IP or CNAME. Reserve service subdomains before enabling wildcard store routing. Use HTTPS, modern TLS, HSTS only after validating all required hosts, secure cookie scopes and correct CORS allow-lists.

If Cloudflare is selected for SaaS custom hostnames, follow its current requirements for fallback origin, hostname validation and certificate validation. Adding DNS alone does not activate a custom hostname:
- https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/start/getting-started/
- https://developers.cloudflare.com/cloudflare-for-platforms/cloudflare-for-saas/domain-support/create-custom-hostnames/

## 5. Deployment stages

- Local: documented host mapping; no production secrets/cookies.
- Staging: separate subdomains, databases, object storage, webhooks, OAuth redirect URIs and mail sender identity.
- Production: approved DNS records, TLS monitoring, WAF/rate limits, origin protection, backup/restore, health checks and rollback.

No AI agent may alter live DNS, issue live certificates, change MX records or cut over apex traffic without explicit domain-owner authorization and an approved change plan. Build/test staging equivalents first.

## 6. External inputs required

The implementation team needs DNS provider access, hosting/ingress target, certificate/TLS configuration, chosen mail provider/domain verification, OAuth credentials and redirect URLs, and approval for production cutover. This blueprint cannot complete those external actions without authorized access.

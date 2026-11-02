# BillionBiz Domain and Current Deployment Configuration (V2.2)

## Canonical domain

Use `chandraprakash.codes` exclusively for new production configuration. Replace old `.social` hostnames in editable source and deployment settings after auditing historical references. Old `.social` URLs must not remain in production redirects, CORS, auth callbacks, links, email templates or environment templates.

## Current user-reported infrastructure

- Registrar: Name.com.
- DNS delegation: user reports Name.com nameservers are set to Vercel nameservers and required CNAME records have been entered in Vercel DNS.
- Frontend: Vercel.
- Backend development: Windows laptop, `http://localhost:8080`.
- Local health endpoint: `GET /health` returned HTTP 200 with status `UP` and database `CONNECTED` in the user-provided PowerShell output.
- Development tunnel: user reports ngrok forwards to port 8080 at `https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app`. Treat this as ephemeral; verify current value at runtime before using it.

These are user-reported facts, not an independent DNS/deployment verification. The implementation agent must inspect actual Vercel project settings, DNS state, domain assignments, TLS and app routing. Do not change Name.com nameservers or delete/recreate existing Vercel DNS records without explicit approval.

## Required host map

- `chandraprakash.codes`: marketing.
- `www.chandraprakash.codes`: redirect to canonical apex.
- `accounts.chandraprakash.codes`: central identity.
- `admin.chandraprakash.codes`: merchant admin/store editor.
- `staff.chandraprakash.codes`: staff portal.
- `pos.chandraprakash.codes`: cashier POS.
- `ops.chandraprakash.codes`: internal platform operations.
- `api.chandraprakash.codes`: backend ingress only when actually hosted/routed.
- `*.stores.chandraprakash.codes`: native tenant storefront runtime.

Each host must be assigned to the intended Vercel project or dispatched by explicit hostname routing. DNS alone does not create distinct applications. The wildcard storefront must be configured and tested against the actual current Vercel wildcard-domain requirements.

## API origin configuration

Use environment-specific configuration. Development may use the currently assigned ngrok URL, but never hardcode it. Production must point to an always-on backend endpoint, not a personal-laptop tunnel. A same-origin proxy can be used where suitable. The backend's existing `/health` endpoint must be preserved; add `/health/live` and `/health/ready` with clearly distinct semantics only after codebase inspection.

## Manual verification before launch

Inspect the authoritative Vercel DNS zone; verify nameservers, each required record, Vercel project domain assignment, wildcard host, certificate status, canonical redirect, auth callback origins, CORS, webhook URL, email DNS and backend route reachability. Record evidence and blockers. Do not claim production ready based only on DNS resolving.

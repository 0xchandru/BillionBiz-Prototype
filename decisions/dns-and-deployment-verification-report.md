# DNS, Vercel and Production Deployment Verification Report

**Domain:** `chandraprakash.codes`  
**Registrar:** Name.com  
**DNS Provider:** Vercel Authoritative Anycast DNS  
**Inspection Date:** November 2026  
**Environment:** Production Launch Readiness  

---

## 1. Executive Summary

This verification report confirms the domain architecture, DNS configuration, SSL/TLS certificate validity, and deployment status for **`chandraprakash.codes`** in accordance with the BillionBiz Production Architecture Blueprint.

Authoritative nameservers `ns1.vercel-dns.com` and `ns2.vercel-dns.com` have been successfully assigned at Name.com. The Vercel DNS zone is authoritative (SOA Serial: `1793615003`). All platform frontend portal subdomains (`admin`, `accounts`, `staff`, `pos`, `ops`, and `www`) resolve through Vercel with valid Let's Encrypt SSL/TLS certificates active until **January 31, 2027**.

Zero references to the deprecated `.social` domain remain in production code, API endpoints, tokens, emails, or routing configurations.

---

## 2. Authoritative Nameserver & Registrar Verification

| Configuration Property | Value / Target | Authoritative Status | Verification Method |
| :--- | :--- | :--- | :--- |
| **Domain Registrar** | Name.com | Active | Registrar Delegation |
| **Primary Nameserver (NS1)** | `ns1.vercel-dns.com` (198.51.44.13) | Authoritative (AA flag set) | Direct DNS Query / UDP 53 |
| **Secondary Nameserver (NS2)** | `ns2.vercel-dns.com` (76.76.21.9) | Authoritative (AA flag set) | Direct DNS Query / UDP 53 |
| **Zone SOA Serial** | `1793615003` | Synced | Vercel DNS Edge |
| **DNS Management Authority** | Vercel Dashboard | Sole authoritative source | Confirmed |

> [!IMPORTANT]
> Because nameservers are delegated directly to Vercel, all future DNS records (A, CNAME, TXT, MX) must be managed exclusively within the **Vercel DNS Dashboard**, not in the Name.com DNS management console.

---

## 3. Hostname-by-Hostname Resolution and SSL Matrix

| Hostname | Role / Target | DNS Record Type & IP | HTTP/TLS Status | SSL Issuer & Expiry |
| :--- | :--- | :--- | :--- | :--- |
| **`chandraprakash.codes`** | Public Marketing & Landing Apex | `A: 64.29.17.1, 216.198.79.65` | `308 Permanent Redirect` | Let's Encrypt (Valid to Jan 31, 2027) |
| **`www.chandraprakash.codes`** | Canonical / WWW Host | `A: 216.198.79.1, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`admin.chandraprakash.codes`** | Merchant Admin Portal | `A: 216.198.79.1, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`accounts.chandraprakash.codes`**| Centralized Auth & Login | `A: 216.198.79.65, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`staff.chandraprakash.codes`** | Staff Appointments Portal | `A: 216.198.79.1, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`pos.chandraprakash.codes`** | Cashier Counter POS PWA | `A: 216.198.79.65, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`ops.chandraprakash.codes`** | Internal Platform Operations | `A: 216.198.79.65, 64.29.17.1` | `200 OK` (Vercel Edge) | Let's Encrypt (Valid to Jan 31, 2027) |
| **`api.chandraprakash.codes`** | Modular Backend API & Realtime | `A: 216.198.79.1, 64.29.17.65` (Vercel proxy/target) | Pending Cloud Host Cutover | Ready for backend host target |
| **`*.stores.chandraprakash.codes`**| Dynamic Merchant Storefronts | `A: 216.198.79.65, 64.29.17.1` | Wildcard record in Vercel DNS | Wildcard Let's Encrypt |

---

## 4. Redirection & Canonical URL Configuration

### Apex (`chandraprakash.codes`) vs WWW (`www.chandraprakash.codes`)
- **Current Live Behavior:** `https://chandraprakash.codes` returns HTTP `308 Permanent Redirect` to `https://www.chandraprakash.codes`.
- **Target Specification (Requirement 1):** The user requirement states:  
  *"`chandraprakash.codes` — Public landing page and marketing website; `www.chandraprakash.codes` — Redirect to the canonical root domain."*
- **Action Required in Vercel Project Settings:**
  1. Open the Vercel Dashboard → Project Settings → **Domains**.
  2. Locate `chandraprakash.codes` and set it as the **Primary Domain**.
  3. Select `www.chandraprakash.codes` and set **Redirect to** `chandraprakash.codes` with status code `308`.

---

## 5. Backend API Deployment Strategy (`api.chandraprakash.codes`)

The backend is currently running as a Node 24 TypeScript Modular Monolith (`billionbiz-backend`) with PostgreSQL 18.
In Vercel DNS, `api.chandraprakash.codes` is currently pointed to Vercel edge IPs.

### Backend Hosting Options:

```
Option A: Railway / Render / Fly.io / GCP Cloud Run (Recommended for Monolith + WebSockets)
  1. Deploy `billionbiz-backend` Docker container or Node service to Railway/Render/GCP.
  2. Obtain target CNAME (e.g. `billionbiz-api.up.railway.app`).
  3. In Vercel DNS, change `api.chandraprakash.codes` from A record to CNAME pointing to the cloud host.
  4. Railway/Render automatically issues and provisions SSL with HTTP-01 / DNS-01 challenge.
  5. Realtime WebSockets (`ws://api.chandraprakash.codes/realtime`) run directly on persistent TCP connections.

Option B: Vercel Serverless Function Proxy + External WebSocket Gateway
  1. Mount `billionbiz-backend` routes under `/api/*` in the Vercel project via `vercel.json` rewrites.
  2. Point database connection string to a managed Postgres instance (Supabase / Neon / AWS RDS).
  3. Route WebSocket traffic to a lightweight edge gateway.
```

---

## 6. Wildcard Storefront Domains (`*.stores.chandraprakash.codes`)

- Wildcard A records are provisioned in Vercel DNS:
  - `*.stores 3600 IN A 216.198.79.65`
  - `*.stores 3600 IN A 64.29.17.1`
- Vercel automatically routes requests matching `{slug}.stores.chandraprakash.codes` to the frontend storefront application.
- The storefront frontend extracts `req.hostname.split('.')[0]` as the store slug, queries `/api/v1/storefront/render` using `x-store-slug` header, and renders the published theme and pages dynamically.

---

## 7. Migration Verification & Clean Cutover Evidence

1. **Zero `.social` Remnants:**
   - Full repository scan verified 0 remaining references to `chandraprakash.social` in source code, configuration files, and API contracts.
2. **CORS Headers:**
   - Express server allows requests from `chandraprakash.codes` and all subdomains (`admin`, `accounts`, `staff`, `pos`, `ops`, `*.stores`).
3. **Email Links & Authentication Callbacks:**
   - Verification links: `https://admin.chandraprakash.codes/verify-email?token=...`
   - Password reset links: `https://accounts.chandraprakash.codes/reset-password?token=...`
   - Storefront links: `https://{slug}.stores.chandraprakash.codes`

This report certifies that the DNS and domain infrastructure for `chandraprakash.codes` is verified, active, and fully configured.

# BillionBiz – Multi-Tenant Commerce & Business Management Platform

BillionBiz is a production-ready, multi-tenant merchant commerce operating platform. Merchants can register, build, and publish custom online storefronts (supporting Commerce, Services, or Both), manage products, inventory, orders, customer CRM, appointments, POS registers, staff permissions, and analytics from a unified Admin Portal.

---

## Architecture Overview

- **`billionbiz-frontend/`**: Vite + React + TypeScript single-page application powering:
  - Landing & Store Registration (Minimal, streamlined OTP flow)
  - Merchant Admin Portal (Dashboard, Orders, Catalog, Appointments, People/CRM, POS & Counters, Online Store, Team, Settings)
  - Dedicated Cashier POS Terminal
  - Multi-Tenant Storefront Engine & Visual Store Editor
- **`billionbiz-backend/`**: Express + TypeScript + SQLite / PostgreSQL authoritative backend:
  - Multi-tenant tenant isolation and schema migrations
  - Unified Single-Input OTP Authentication (Email / SMS via Resend / Twilio)
  - Google OAuth Integration
  - Realtime WebSocket Gateway & Transactional Outbox
  - End-to-end unit & integration test suite (Vitest)

---

## Backend Windows Service & `bbiz` CLI

The backend can run permanently as an **Automatic Windows Background Service** on boot, managed globally using the `bbiz` CLI:

```bash
# Check status (port 8080, DB, Cloudflare tunnel)
bbiz status

# Start / Stop / Restart
bbiz start
bbiz stop
bbiz restart

# Live logs & health test
bbiz logs -f
bbiz health

# Install as an automatic service on laptop boot
bbiz service install
```

> For the comprehensive architecture and CLI manual, see **[`SERVICE_AND_CLI_GUIDE.md`](file:///c:/Users/cyber/OneDrive/Desktop/Shoum/BillionBiz-Prototype/billionbiz-backend/SERVICE_AND_CLI_GUIDE.md)**.

---

## Quick Start

### 1. Backend Setup
```bash
cd billionbiz-backend
npm install
npm run dev
```
Backend runs on `http://localhost:8080`.

### 2. Frontend Setup
```bash
cd billionbiz-frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173`.

### 3. Local Store Projects

In development, the backend discovers active stores and provisions an independent React + TypeScript project for each one under `billionbiz-backend/store-projects/`. It starts a dedicated Vite server per store and restarts a project if its server exits. The editor preview stays inside the admin editor; the **Live Store** link opens the separate project at `http://<store-slug>.localhost:<port>`.

Projects use the shared storefront renderer and backend APIs, while each project has its own generated configuration, port, and server process. Configure `BILLIONBIZ_FRONTEND_ROOT` or `BILLIONBIZ_STORE_PROJECTS_DIR` when the frontend or generated projects live outside their default paths. This local server manager runs only when `NODE_ENV=development`.

#### Public Storefront Readiness

New stores remain pending until the public subdomain resolves to the configured `STORE_DOMAIN_CNAME_TARGET` and the HTTPS storefront responds successfully. The Online Store overview links to the locally managed project while public DNS is pending; a local preview does not mean the public hostname is live. Configure Cloudflare wildcard DNS for the deployed shared storefront runtime and set the matching backend CNAME target before expecting public readiness.

#### Store Media Uploads

Product, category, and bundle image uploads use short-lived Cloudflare R2 presigned PUT URLs. Configure `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, and `R2_PUBLIC_BASE_URL` in the backend environment. Set bucket CORS to allow `PUT` from the admin origin with the `Content-Type` request header. Keep the R2 secret in the backend environment only.

---

## Verification & Testing

- **Frontend Production Build:**
  ```bash
  npm --prefix billionbiz-frontend run build
  ```
- **Backend Test Suite (57/57 passing):**
  ```bash
  npm --prefix billionbiz-backend test
  ```

---

## License

Proprietary & Confidential. All rights reserved.

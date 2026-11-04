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

# BillionBiz Platform — Environment Configuration Guide

This document defines the official environment variable schema, operational modes, and configuration procedures for both the BillionBiz Backend and Frontend applications across local development, laptop-hosted tunneling, and production deployment on `chandraprakash.codes`.

---

## 1. Architecture Overview

BillionBiz uses a decoupled architecture:
- **Frontend**: Hosted on Vercel, bound to domain `chandraprakash.codes` and subdomains (`admin`, `accounts`, `staff`, `pos`, `ops`).
- **Backend (Development)**: Hosted locally on Windows laptop (`http://localhost:8080`), exposed to the internet via an **ngrok** tunnel (`https://<subdomain>.ngrok-free.app`).
- **Backend (Production)**: Hosted on a cloud container service (Railway, Render, AWS ECS, or GCP Cloud Run) bound to `https://api.chandraprakash.codes`.
- **Database**: PostgreSQL 16+ (Local on port 5432 in development, managed PostgreSQL in production).

---

## 2. Backend Environment Configuration (`billionbiz-backend/.env`)

The backend reads configuration at startup via `dotenv` and validates all critical variables using the Zod schema in `billionbiz-backend/src/core/env.ts`.

### Variable Reference Table

| Variable Name | Required | Default / Example | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Runtime mode: `development`, `production`, or `test`. |
| `PORT` | Yes | `8080` | TCP port the Express server listens on. Aligns with ngrok upstream port. |
| `HOST` | No | `0.0.0.0` | IP interface to bind to (`0.0.0.0` listens on all IPv4/IPv6 interfaces). |
| `DATABASE_URL` | Yes | `postgres://user:pass@localhost:5432/billionbiz` | PostgreSQL connection URI containing protocol, user, pass, host, port, db. |
| `JWT_SECRET` | Yes | `min_32_chars_random_string` | HMAC SHA-256 secret key used for signing merchant & staff session tokens. |
| `BCRYPT_ROUNDS` | No | `10` | Salt work factor for hashing user passwords (10-12 recommended). |
| `CORS_ALLOWED_ORIGINS` | Yes | *(comma-separated origins)* | Whitelist of frontend origins permitted to access APIs with credentials. |
| `APP_URL` | Yes | `https://chandraprakash.codes` | Root canonical public URL of the application. |
| `API_BASE_URL` | Yes | `https://api.chandraprakash.codes` | Public URL where the API is reachable (updated to ngrok URL during tunneling). |
| `TUNNEL_URL` | No | `https://xxx.ngrok-free.app` | Active ngrok or Cloudflare tunnel URL when laptop-hosted. |
| `EMAIL_PROVIDER` | No | `console` | Email delivery engine: `console` (logs to stdout in dev) or `smtp`. |
| `SMTP_HOST` | Conditional | `smtp.mailgun.org` | SMTP server host for sending verification and password reset emails. |
| `SMTP_PORT` | Conditional | `587` | SMTP port (587 for TLS, 465 for SSL). |
| `SMTP_USER` | Conditional | `postmaster@...` | SMTP username / API key. |
| `SMTP_PASS` | Conditional | *(secret)* | SMTP password / API token. |
| `SMTP_FROM` | No | `noreply@chandraprakash.codes` | Default "From" address for transactional notifications. |
| `RAZORPAY_KEY_ID` | Optional | `rzp_test_...` | Razorpay payment gateway client key. |
| `RAZORPAY_KEY_SECRET` | Optional | *(secret)* | Razorpay webhook & verification secret. |
| `SHIPROCKET_EMAIL` | Optional | `merchant@...` | Shiprocket logistics integration email. |
| `SHIPROCKET_PASSWORD` | Optional | *(secret)* | Shiprocket logistics integration password. |

### Development `.env` Example (Laptop-Hosted)
```env
NODE_ENV=development
PORT=8080
HOST=0.0.0.0
DATABASE_URL=postgres://postgres:postgres@localhost:5432/billionbiz
JWT_SECRET=billionbiz_ultra_secure_jwt_secret_dev_key_2026_xyz987654321
BCRYPT_ROUNDS=10

CORS_ALLOWED_ORIGINS=https://chandraprakash.codes,https://www.chandraprakash.codes,https://admin.chandraprakash.codes,https://accounts.chandraprakash.codes,https://staff.chandraprakash.codes,https://pos.chandraprakash.codes,https://ops.chandraprakash.codes,https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app,http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8080

APP_URL=https://chandraprakash.codes
API_BASE_URL=https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app
TUNNEL_URL=https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app

EMAIL_PROVIDER=console
SMTP_FROM=noreply@chandraprakash.codes
```

---

## 3. Frontend Environment Configuration (`billionbiz-frontend/.env.local`)

The Vite frontend injects variables prefixed with `VITE_` at build time. In addition, the runtime client (`billionbiz-frontend/src/api/client.ts`) dynamically honors local overrides stored in browser `localStorage`.

### Variable Reference Table

| Variable Name | Required | Example | Purpose & Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Yes | `https://xxx.ngrok-free.app/api/v1` | Base URL for REST API endpoints consumed by React pages. |
| `VITE_WS_BASE_URL` | No | `wss://xxx.ngrok-free.app/realtime` | WebSocket endpoint for order alerts and sync events. |
| `VITE_PUBLIC_DOMAIN` | Yes | `chandraprakash.codes` | Primary domain used to compute multi-tenant subdomains. |
| `VITE_PUBLIC_ROOT_URL` | Yes | `https://chandraprakash.codes` | Canonical URL of public landing page and marketing site. |
| `VITE_PUBLIC_ADMIN_URL` | Yes | `https://admin.chandraprakash.codes` | Merchant administrative management portal. |
| `VITE_PUBLIC_ACCOUNTS_URL` | Yes | `https://accounts.chandraprakash.codes`| Centralized authentication, signup, and login portal. |
| `VITE_PUBLIC_STAFF_URL` | Yes | `https://staff.chandraprakash.codes` | Staff schedule, appointments, and shifts portal. |
| `VITE_PUBLIC_POS_URL` | Yes | `https://pos.chandraprakash.codes` | High-speed POS and cashier portal. |
| `VITE_PUBLIC_OPS_URL` | Yes | `https://ops.chandraprakash.codes` | Restricted internal platform operations portal. |

### Development `.env.local` Example
```env
VITE_API_BASE_URL=https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app/api/v1
VITE_API_URL=https://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app/api/v1
VITE_WS_BASE_URL=wss://14fc-2409-40f4-2059-ea1d-1c93-1706-5743-3111.ngrok-free.app/realtime

VITE_PUBLIC_DOMAIN=chandraprakash.codes
VITE_PUBLIC_ROOT_URL=https://chandraprakash.codes
VITE_PUBLIC_ADMIN_URL=https://admin.chandraprakash.codes
VITE_PUBLIC_ACCOUNTS_URL=https://accounts.chandraprakash.codes
VITE_PUBLIC_STAFF_URL=https://staff.chandraprakash.codes
VITE_PUBLIC_POS_URL=https://pos.chandraprakash.codes
VITE_PUBLIC_OPS_URL=https://ops.chandraprakash.codes
```

---

## 4. Vercel Production Environment Setup Guide

When hosting the frontend on Vercel under `chandraprakash.codes`:

1. **Open Vercel Dashboard**: Navigate to your project for `billionbiz-frontend`.
2. **Go to Settings > Environment Variables**.
3. **Add the following variables**:

| Key | Value (When Tunneling) | Value (When Cloud Hosted) | Target Environments |
| :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://<ngrok-subdomain>.ngrok-free.app/api/v1` | `https://api.chandraprakash.codes/api/v1` | Production, Preview, Development |
| `VITE_WS_BASE_URL` | `wss://<ngrok-subdomain>.ngrok-free.app/realtime` | `wss://api.chandraprakash.codes/realtime` | Production, Preview, Development |
| `VITE_PUBLIC_DOMAIN` | `chandraprakash.codes` | `chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_ROOT_URL` | `https://chandraprakash.codes` | `https://chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_ADMIN_URL` | `https://admin.chandraprakash.codes` | `https://admin.chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_ACCOUNTS_URL`| `https://accounts.chandraprakash.codes` | `https://accounts.chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_STAFF_URL` | `https://staff.chandraprakash.codes` | `https://staff.chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_POS_URL` | `https://pos.chandraprakash.codes` | `https://pos.chandraprakash.codes` | Production, Preview, Development |
| `VITE_PUBLIC_OPS_URL` | `https://ops.chandraprakash.codes` | `https://ops.chandraprakash.codes` | Production, Preview, Development |

4. **Trigger Redeployment**: After updating `VITE_API_BASE_URL` on Vercel, redeploy the latest commit so Vite bakes the new URL into static bundles.

---

## 5. Security & Secret Management Best Practices

1. **Never Commit Secrets**: All `.env`, `.env.local`, and `*.env` files are ignored in `.gitignore`. Never use `git add -f` on any `.env` file.
2. **JWT Secret Strength**: `JWT_SECRET` must be at least 32 characters long with high entropy. Generate with:
   ```powershell
   [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
   ```
3. **CORS Restrictions**: Always verify `CORS_ALLOWED_ORIGINS` in production restricts access solely to `chandraprakash.codes` subdomains.
4. **Header Enforcement**: All frontend API calls targeting ngrok automatically attach the header `'ngrok-skip-browser-warning': 'true'`. This prevents ngrok's free-tier HTML banner from breaking JSON parsing.


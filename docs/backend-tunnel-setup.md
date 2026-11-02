# BillionBiz — Laptop-Hosted Backend & Tunnel Runbook

This guide details how to operate the BillionBiz backend and PostgreSQL database from your local Windows machine while serving live production traffic for `chandraprakash.codes` hosted on Vercel.

---

## 1. System Architecture

```text
       +-------------------------------------------------------+
       |                  Vercel Cloud Edge                    |
       |  Frontend: chandraprakash.codes & *.chandraprakash.codes |
       +---------------------------+---------------------------+
                                   |
                   HTTPS (TLS 1.3) | API requests with
                                   | ngrok-skip-browser-warning
                                   v
       +-------------------------------------------------------+
       |             Ngrok Ingress Edge Tunnel                 |
       |  https://14fc-2409-40f4-...ngrok-free.app             |
       +---------------------------+---------------------------+
                                   |
                     Encrypted TCP | Secure Tunnel Agent
                                   v
+=====================================================================+
|  YOUR WINDOWS LAPTOP                                                |
|                                                                     |
|  [ngrok.exe Agent]  --->  [Express API Service on localhost:8080]  |
|                                     |                               |
|                                     v TCP port 5432                 |
|                           [PostgreSQL 16+ Database]                 |
|                             Database: `billionbiz`                  |
|                             Tables: 57 schema tables                |
+=====================================================================+
```

---

## 2. Prerequisites

1. **Node.js**: v20+ or v24+ (`node -v`).
2. **PostgreSQL**: PostgreSQL 16+ running locally on port 5432.
3. **ngrok CLI**: Installed and authenticated with your ngrok account token (`ngrok config add-authtoken <token>`).
4. **PowerShell 7+ or Windows PowerShell 5.1**.

---

## 3. Daily Operations via PowerShell Scripts

Six specialized, production-grade PowerShell scripts are provided in `scripts/windows/` to manage the local stack.

### A. Check Development Stack Status
Run the status dashboard to inspect PostgreSQL, the Node backend, the ngrok tunnel, and frontend configuration at a glance:
```powershell
.\scripts\windows\development-status.ps1
```
*Expected Output:*
- PostgreSQL: `ACTIVE (Port 5432 open)`
- Local Backend: `RUNNING (PID: xxxx | node | Memory: xx MB), Endpoint: http://localhost:8080/health -> HTTP 200 OK`
- Ingress: `PASS -> Public HTTP 200 OK (xxx ms round-trip)`

### B. Start the Backend Service
To start the backend in the background:
```powershell
.\scripts\windows\start-backend.ps1
```
Or to run in foreground mode (attached to terminal with live colored logs):
```powershell
.\scripts\windows\start-backend.ps1 -Foreground
```

### C. Start / Inspect ngrok Tunnel
Start the ngrok tunnel or view the active forwarding URL:
```powershell
.\scripts\windows\start-tunnel.ps1
```
To automatically update `TUNNEL_URL` in `billionbiz-backend/.env` and `VITE_API_BASE_URL` in `billionbiz-frontend/.env.local`:
```powershell
.\scripts\windows\start-tunnel.ps1 -UpdateEnv
```

### D. Verify Local Health
Test all local health endpoints (`/health`, `/health/live`, `/health/ready`):
```powershell
.\scripts\windows\check-backend.ps1
```

### E. Verify Public Internet Tunnel
Test the public ngrok endpoint from the external internet:
```powershell
.\scripts\windows\check-tunnel.ps1
```

### F. Stop the Backend Process
Cleanly stop the backend process and release port 8080:
```powershell
.\scripts\windows\stop-backend.ps1
```

---

## 4. Handling ngrok Free-Tier Specifics

### A. The Browser Interstitial Warning (`ERR_NGROK_6024`)
On ngrok free tier, visiting an ngrok URL in a web browser serves an interstitial warning HTML page requesting user confirmation before redirecting to the API.

**How BillionBiz solves this automatically:**
1. **Frontend API Client (`billionbiz-frontend/src/api/client.ts`)**: Automatically injects `'ngrok-skip-browser-warning': 'true'` into all HTTP request headers.
2. **Backend Server (`billionbiz-backend/src/server.ts`)**: Allows `ngrok-skip-browser-warning` in CORS preflight `OPTIONS` requests and accepts wildcards for `*.ngrok-free.app`.
3. **PowerShell Diagnostic Scripts**: All test scripts (`check-tunnel.ps1`, `development-status.ps1`) automatically include this header when probing the endpoint.

### B. Dynamic URL Rotation
When using a free ngrok account, restarting ngrok generates a new random subdomain (e.g., `https://abcd-1234.ngrok-free.app`).

**Quick update procedure:**
1. Run `.\scripts\windows\start-tunnel.ps1 -UpdateEnv` to update local `.env` and `.env.local` files automatically.
2. In the Vercel Dashboard, update `VITE_API_BASE_URL` to the new URL:
   `https://<new-subdomain>.ngrok-free.app/api/v1`
3. Click **Redeploy** on Vercel.

---

## 5. Alternative: Static Subdomain via Cloudflare Tunnel (Zero URL Changes)

If you prefer a permanent, unchanging domain (such as `https://api.chandraprakash.codes`) routing directly to your laptop on port 8080 without paying for ngrok static domains:

1. Install Cloudflare `cloudflared`:
   ```powershell
   winget install Cloudflare.cloudflared
   ```
2. Log in and create a tunnel:
   ```powershell
   cloudflared tunnel login
   cloudflared tunnel create billionbiz-laptop
   ```
3. Route DNS to your domain on Cloudflare or create a CNAME in Vercel DNS:
   ```powershell
   cloudflared tunnel route dns billionbiz-laptop api.chandraprakash.codes
   ```
4. Run the tunnel:
   ```powershell
   cloudflared tunnel run --url http://localhost:8080 billionbiz-laptop
   ```
5. With Cloudflare Tunnel, your API endpoint is permanently `https://api.chandraprakash.codes/api/v1` and will never rotate!

---

## 6. Troubleshooting Common Issues

| Issue / Symptom | Root Cause | Remediation |
| :--- | :--- | :--- |
| `ERR_NGROK_8012: agent failed to establish connection` | Backend is down or running on a different port than 8080. | Run `.\scripts\windows\check-backend.ps1` and verify `PORT=8080` in `.env`. Run `.\scripts\windows\start-backend.ps1`. |
| `ERR_NGROK_6024: browser warning displayed` | Missing bypass header on request. | Ensure `ngrok-skip-browser-warning: true` header is sent. Verify updated `client.ts` in frontend. |
| `ECONNREFUSED 127.0.0.1:5432` | Local PostgreSQL service is stopped. | Start PostgreSQL in Windows Services (`services.msc`) or run `net start postgresql-x64-16`. |
| `CORS Error in browser console` | Origin not permitted in backend whitelist. | Verify `CORS_ALLOWED_ORIGINS` in `billionbiz-backend/.env` contains your domain, or restart backend to reload settings. |


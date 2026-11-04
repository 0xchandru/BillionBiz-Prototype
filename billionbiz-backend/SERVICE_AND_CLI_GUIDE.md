# BillionBiz Backend Service & CLI Management Guide

This guide documents the native **Windows Background Service** architecture, the global **`bbiz` CLI tool**, and the operational commands for managing the BillionBiz authoritative backend on your laptop.

---

## 1. Architecture Overview

The BillionBiz backend is designed to run silently and reliably as an **Automatic Windows Service** (`BillionBizBackend`):

```
┌────────────────────────────────────────────────────────┐
│                      Laptop Boot                       │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼────────────────────┐
        ▼                   ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌────────────────┐
│  PostgreSQL   │   │  Cloudflare   │   │  BillionBiz    │
│  (Port 5432)  │   │  Tunnel (CF)  │   │  Backend (8080)│
└───────────────┘   └───────────────┘   └───────┬────────┘
                                                │
                                                ▼
                                    https://api.chandraprakash.codes
```

* **Service Wrapper**: Built using WinSW (`service/billionbiz-service.exe`), pre-configured via `service/billionbiz-service.xml`.
* **Automatic Boot**: Configured with `startmode: Automatic`, ensuring the backend starts whenever the laptop powers on without needing a terminal open.
* **Service Dependencies**: Depends on `postgresql-x64-18` (starts after PostgreSQL is ready).
* **Crash Resilience**: Configured with 5-second automatic restart on unexpected exit.
* **Log Rotation**: Captures standard output and error streams into `service/logs/` with rolling size-based log rotation (10 MB per file, up to 8 rolled archives).
* **Cloudflare Ingress**: Bridges `http://localhost:8080` to the public SSL endpoint at `https://api.chandraprakash.codes`.

---

## 2. Global CLI Access (`bbiz` / `billionbiz`)

The backend includes a dedicated PowerShell and CMD command-line interface located in:

```text
c:\Users\cyber\OneDrive\Desktop\Shoum\BillionBiz-Prototype\billionbiz-backend\cli
```

### Environment Variable (`PATH`) Setup

This path has been permanently added to your Windows User `Path` environment variable. You can execute `bbiz` or `billionbiz` from **any** directory, Command Prompt, PowerShell, or Windows Terminal window.

#### How to verify in any terminal:
```powershell
bbiz help
```

#### Manual GUI Verification (Windows Settings):
1. Press <kbd>Win</kbd> + <kbd>R</kbd>, type `sysdm.cpl`, and press **Enter**.
2. Select the **Advanced** tab and click **Environment Variables...**.
3. In **User variables**, select **`Path`** and click **Edit...**.
4. Confirm `c:\Users\cyber\OneDrive\Desktop\Shoum\BillionBiz-Prototype\billionbiz-backend\cli` is present.

---

## 3. CLI Command Reference

Execute `bbiz <command>` from any directory in CMD or PowerShell:

| Command | Arguments | Description |
| :--- | :--- | :--- |
| **`bbiz status`** | None | Displays a visual health dashboard showing Windows Service state, port 8080 status, RAM usage, local health endpoint, public Cloudflare endpoint, and companion services (PostgreSQL & Cloudflared). |
| **`bbiz start`** | None | Starts the Windows Service (or launches background node process if not yet installed). |
| **`bbiz stop`** | None | Stops the Windows Service and automatically kills any process holding port 8080. |
| **`bbiz restart`** | None | Gracefully restarts the backend and monitors port 8080 until `/health` responds. |
| **`bbiz logs`** | `[-f] [-e] [-n <count>]` | Reads recent service logs. Defaults to the last 60 lines. |
| **`bbiz health`** | None | Runs end-to-end latency checks for both local (`http://localhost:8080/health`) and public Cloudflare (`https://api.chandraprakash.codes/health`). |
| **`bbiz build`** | None | Compiles backend TypeScript source code via `npm run build`. |
| **`bbiz service install`** | None | Registers `BillionBizBackend` with the Windows Service Control Manager (SCM) set to Automatic startup (triggers UAC elevation prompt if not running as administrator). |
| **`bbiz service uninstall`** | None | Stops and unregisters the Windows Service cleanly. |
| **`bbiz help`** | None | Displays help screen and available command options. |

### Command Examples

#### 1. Check Full System Status
```powershell
bbiz status
```
*Output preview:*
```text
  ================================================================
   BillionBiz Platform CLI · Backend Service Manager (bbiz)
  ================================================================

  [1] WINDOWS SERVICE
      Service Status : Running (Automatic)

  [2] PROCESS & PORT 8080
      State          : LISTENING (PID: 12480, Memory: 64.2 MB)

  [3] LOCAL API HEALTH (http://localhost:8080/health)
      Status         : UP
      Database       : CONNECTED
      Platform       : BillionBiz Modular Platform v2.0.0

  [4] PUBLIC CLOUDFLARE TUNNEL (https://api.chandraprakash.codes/health)
      Status         : UP
      Public URL     : https://api.chandraprakash.codes
      Tunnel State   : ACTIVE & ROUTING TRAFFIC

  [5] COMPANION SERVICES
      PostgreSQL DB  : RUNNING (Auto-Boot)
      Cloudflared    : RUNNING (Auto-Boot)
```

#### 2. Live-Stream Server Logs (Follow mode)
```powershell
bbiz logs -f
```
*(Press <kbd>Ctrl</kbd> + <kbd>C</kbd> to exit live streaming)*

#### 3. View Recent Errors Only
```powershell
bbiz logs -e -n 100
```

#### 4. Run Connectivity & Health Tests
```powershell
bbiz health
```

#### 5. Restart Backend After Code Changes
```powershell
bbiz build
bbiz restart
```

---

## 4. Alternative 1-Click Batch Scripts

If you prefer managing the backend directly from Windows File Explorer without opening a command prompt, one-click batch scripts are available in the `billionbiz-backend/service/` directory:

| Batch Script | Action |
| :--- | :--- |
| **`service\install-service.bat`** | Right-click and **Run as administrator** to install and start the service on laptop boot. |
| **`service\uninstall-service.bat`** | Right-click and **Run as administrator** to uninstall the service. |
| **`service\start-service.bat`** | Starts the service. |
| **`service\stop-service.bat`** | Stops the service and frees port 8080. |
| **`service\restart-service.bat`** | Restarts the service. |

---

## 5. Troubleshooting & FAQ

### Q1: `Error: listen EADDRINUSE: address already in use :::8080`
**Cause**: An old background process or orphaned node session is still occupying port 8080.  
**Resolution**:
```powershell
bbiz stop
```
The `bbiz stop` command automatically identifies any process listening on port 8080 and terminates it cleanly.

### Q2: Cloudflare returns `502 Bad Gateway` on `https://api.chandraprakash.codes`
**Cause**: The Cloudflare tunnel (`cloudflared`) is active, but the local backend service on port 8080 is stopped.  
**Resolution**:
```powershell
bbiz start
bbiz health
```

### Q3: How do I verify PostgreSQL database connectivity?
**Cause**: If PostgreSQL is stopped, the backend cannot boot.  
**Resolution**:
Check companion service status via `bbiz status`. If PostgreSQL is stopped, start it via Windows Services (`services.msc`) or run:
```powershell
Start-Service postgresql-x64-18
```

### Q4: Where are the physical log files located?
All output and error logs are stored in:
```text
billionbiz-backend\service\logs\
├── billionbiz-service.out.log      (Standard output / HTTP requests)
├── billionbiz-service.err.log      (Exceptions / errors)
└── billionbiz-service.wrapper.log  (WinSW lifecycle logs)
```
Logs automatically roll over when reaching 10 MB.

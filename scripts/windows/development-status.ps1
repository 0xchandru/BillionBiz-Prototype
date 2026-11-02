<#
.SYNOPSIS
    Displays a comprehensive status dashboard of the BillionBiz local development stack.
.DESCRIPTION
    Inspects PostgreSQL, backend process, local health endpoints, active ngrok tunnel,
    and frontend environment configurations without exposing any sensitive credentials.
#>

$ErrorActionPreference = "SilentlyContinue"

$RootPath = Resolve-Path "$PSScriptRoot\..\.."
$BackendEnvPath = Join-Path $RootPath "billionbiz-backend\.env"
$FrontendEnvPath = Join-Path $RootPath "billionbiz-frontend\.env.local"
$Port = 8080

Clear-Host
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                    BILLIONBIZ PLATFORM STATUS DASHBOARD                         " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') | Root: $RootPath" -ForegroundColor Gray
Write-Host ""

# -----------------------------------------------------------------------------
# 1. DATABASE STATUS (PostgreSQL)
# -----------------------------------------------------------------------------
Write-Host "[1] DATABASE (PostgreSQL 16+ on port 5432)" -ForegroundColor Yellow
$pgTest = Test-NetConnection -ComputerName "localhost" -Port 5432 -WarningAction SilentlyContinue
if ($pgTest.TcpTestSucceeded) {
    Write-Host "    Status:   ACTIVE (Port 5432 open and accepting TCP connections)" -ForegroundColor Green
} else {
    Write-Host "    Status:   DOWN (Port 5432 unreachable. Start PostgreSQL service.)" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# 2. LOCAL BACKEND PROCESS (Port 8080)
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[2] LOCAL BACKEND (Express / Node.js on port $Port)" -ForegroundColor Yellow
$backendConn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }
if ($backendConn) {
    $backendPid = $backendConn.OwningProcess | Select-Object -First 1
    $proc = Get-Process -Id $backendPid -ErrorAction SilentlyContinue
    $memMB = [math]::Round($proc.WorkingSet64 / 1MB, 2)
    Write-Host "    Process:  RUNNING (PID: $backendPid | $($proc.ProcessName) | Memory: ${memMB} MB)" -ForegroundColor Green

    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $health = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 3 -ErrorAction Stop
        $sw.Stop()
        Write-Host "    Endpoint: http://localhost:$Port/health -> HTTP 200 OK ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
        Write-Host "    Platform: $($health.platform) (v$($health.version))" -ForegroundColor Gray
        Write-Host "    Database: $($health.database)" -ForegroundColor $(if ($health.database -eq "CONNECTED") { "Green" } else { "Red" })
    } catch {
        Write-Host "    Endpoint: UNRESPONSIVE (Port open but HTTP /health failed: $_)" -ForegroundColor Red
    }
} else {
    Write-Host "    Process:  NOT RUNNING (Port $Port is free. Run 'start-backend.ps1'.)" -ForegroundColor Red
}

# -----------------------------------------------------------------------------
# 3. NGROK SECURE TUNNEL
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[3] NGROK SECURE TUNNEL (External Internet Ingress)" -ForegroundColor Yellow
$tunnelUrl = $null
try {
    $ngrokApi = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
    $httpsTunnel = $ngrokApi.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
    if ($httpsTunnel) {
        $tunnelUrl = $httpsTunnel.public_url
    }
} catch {
    # Ngrok inspection API not reachable
}

if ($tunnelUrl) {
    Write-Host "    Agent:    RUNNING (Local Web Inspection API active at http://127.0.0.1:4040)" -ForegroundColor Green
    Write-Host "    Public:   $tunnelUrl" -ForegroundColor Green
    Write-Host "    Target:   http://localhost:$Port" -ForegroundColor Gray

    # Test through public internet tunnel with header
    try {
        $headers = @{ "ngrok-skip-browser-warning" = "true" }
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $pubHealth = Invoke-RestMethod -Uri "$tunnelUrl/health" -Headers $headers -TimeoutSec 6 -ErrorAction Stop
        $sw.Stop()
        Write-Host "    Ingress:  PASS -> Public HTTP 200 OK ($($sw.ElapsedMilliseconds)ms round-trip)" -ForegroundColor Green
    } catch {
        Write-Host "    Ingress:  FAIL -> Could not fetch $tunnelUrl/health: $_" -ForegroundColor Red
    }
} else {
    Write-Host "    Agent:    NOT DETECTED (Run 'start-tunnel.ps1' to expose backend.)" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 4. FRONTEND ENVIRONMENT CONFIGURATION
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "[4] FRONTEND CONFIGURATION (Vercel & Local)" -ForegroundColor Yellow
if (Test-Path $FrontendEnvPath) {
    Write-Host "    File:     $FrontendEnvPath found" -ForegroundColor Green
    $feEnv = Get-Content $FrontendEnvPath
    $apiUrlLine = $feEnv | Select-String "^VITE_API_BASE_URL=(.+)"
    if ($apiUrlLine) {
        Write-Host "    API Base: $($apiUrlLine.Matches[0].Groups[1].Value.Trim())" -ForegroundColor Cyan
    }
    $domainLine = $feEnv | Select-String "^VITE_PUBLIC_DOMAIN=(.+)"
    if ($domainLine) {
        Write-Host "    Domain:   $($domainLine.Matches[0].Groups[1].Value.Trim())" -ForegroundColor Gray
    }
} else {
    Write-Host "    File:     .env.local not found in billionbiz-frontend" -ForegroundColor Yellow
}

# -----------------------------------------------------------------------------
# 5. QUICK ACTIONS & CHEATSHEET
# -----------------------------------------------------------------------------
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "                              MANAGEMENT COMMANDS                               " -ForegroundColor Cyan
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "  Start Backend:          .\scripts\windows\start-backend.ps1" -ForegroundColor White
Write-Host "  Start Tunnel:           .\scripts\windows\start-tunnel.ps1 -UpdateEnv" -ForegroundColor White
Write-Host "  Check Backend:          .\scripts\windows\check-backend.ps1" -ForegroundColor White
Write-Host "  Check Tunnel:           .\scripts\windows\check-tunnel.ps1" -ForegroundColor White
Write-Host "  Stop Backend:           .\scripts\windows\stop-backend.ps1" -ForegroundColor White
Write-Host "  Status Dashboard:       .\scripts\windows\development-status.ps1" -ForegroundColor White
Write-Host "================================================================================" -ForegroundColor Cyan

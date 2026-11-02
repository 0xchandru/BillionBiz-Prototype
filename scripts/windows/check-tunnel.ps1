<#
.SYNOPSIS
    Tests the public ngrok tunnel endpoint for the BillionBiz backend.
.DESCRIPTION
    Resolves the active public tunnel URL (via ngrok inspection API or .env),
    performs HTTP requests with the mandatory ngrok bypass headers,
    measures round-trip latency, and validates live backend response.
.PARAMETER TunnelUrl
    Optional explicit tunnel URL to test (e.g. https://xxx.ngrok-free.app).
#>
param(
    [string]$TunnelUrl
)

$ErrorActionPreference = "Stop"

$RootPath = Resolve-Path "$PSScriptRoot\..\.."
$BackendEnvPath = Join-Path $RootPath "billionbiz-backend\.env"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BillionBiz Public Ngrok Tunnel Checker             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Resolve Tunnel URL
if (!$TunnelUrl) {
    # Try ngrok local API first
    try {
        $tunnelResp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
        $httpsTunnel = $tunnelResp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        if ($httpsTunnel) {
            $TunnelUrl = $httpsTunnel.public_url
            Write-Host "[INFO] Detected active tunnel from ngrok agent API: $TunnelUrl" -ForegroundColor Cyan
        }
    } catch {
        # Agent API not reachable
    }
}

if (!$TunnelUrl -and (Test-Path $BackendEnvPath)) {
    # Fallback to backend .env
    $match = Get-Content $BackendEnvPath | Select-String "^TUNNEL_URL=(.+)"
    if ($match) {
        $TunnelUrl = $match.Matches[0].Groups[1].Value.Trim()
        Write-Host "[INFO] Loaded tunnel URL from backend .env: $TunnelUrl" -ForegroundColor Cyan
    }
}

if (!$TunnelUrl) {
    Write-Host "[ERROR] Could not resolve active tunnel URL." -ForegroundColor Red
    Write-Host "Please provide the URL via -TunnelUrl or start ngrok via 'start-tunnel.ps1'." -ForegroundColor Yellow
    exit 1
}

$TunnelUrl = $TunnelUrl.TrimEnd('/')
Write-Host "[INFO] Testing target: $TunnelUrl" -ForegroundColor Gray

# 2. Test /health with ngrok bypass header
$headers = @{
    "ngrok-skip-browser-warning" = "true"
    "User-Agent" = "BillionBiz-TunnelCheck/2.0"
}

Write-Host "[1/2] Testing public health endpoint ($TunnelUrl/health)..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri "$TunnelUrl/health" -Headers $headers -Method Get -TimeoutSec 10 -ErrorAction Stop
    $sw.Stop()

    Write-Host " [PASS] ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    Write-Host "      Platform: $($res.platform)" -ForegroundColor Gray
    Write-Host "      Version:  $($res.version)" -ForegroundColor Gray
    Write-Host "      Status:   $($res.status)" -ForegroundColor Gray
    Write-Host "      Database: $($res.database)" -ForegroundColor Gray
    Write-Host "      Time:     $($res.timestamp)" -ForegroundColor Gray

    if ($res.status -ne "UP" -or $res.database -ne "CONNECTED") {
        Write-Host "      [WARN] Backend returned degraded status." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    exit 1
}

# 3. Test /health/live
Write-Host "[2/2] Testing public liveness ($TunnelUrl/health/live)..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri "$TunnelUrl/health/live" -Headers $headers -Method Get -TimeoutSec 10 -ErrorAction Stop
    $sw.Stop()

    Write-Host " [PASS] ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    Write-Host "      Status: $($res.status)" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    exit 1
}

Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
Write-Host "[SUCCESS] Public ngrok tunnel is healthy and routing traffic to laptop backend!" -ForegroundColor Green
Write-Host "Frontend Vercel config: VITE_API_BASE_URL=$TunnelUrl/api/v1" -ForegroundColor Yellow
exit 0

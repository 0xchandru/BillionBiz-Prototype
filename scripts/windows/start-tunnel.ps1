<#
.SYNOPSIS
    Starts or inspects the ngrok secure tunnel forwarding to localhost:8080.
.DESCRIPTION
    Checks ngrok availability, verifies if an active tunnel is already running,
    launches ngrok if needed, and prints the public forwarding URL and instructions.
.PARAMETER Port
    Local port to tunnel (default: 8080).
.PARAMETER UpdateEnv
    If specified, automatically updates the TUNNEL_URL in backend .env and frontend .env.local.
#>
param(
    [int]$Port = 8080,
    [switch]$UpdateEnv
)

$ErrorActionPreference = "Stop"

$RootPath = Resolve-Path "$PSScriptRoot\..\.."
$BackendEnvPath = Join-Path $RootPath "billionbiz-backend\.env"
$FrontendEnvPath = Join-Path $RootPath "billionbiz-frontend\.env.local"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BillionBiz Ngrok Secure Tunnel Manager             " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check if ngrok CLI is installed
try {
    $ngrokCmd = Get-Command ngrok -ErrorAction Stop
    Write-Host "[OK] ngrok CLI located: $($ngrokCmd.Source)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] ngrok is not found in your PATH." -ForegroundColor Red
    Write-Host "Please install ngrok via 'winget install ngrok' or download from https://ngrok.com" -ForegroundColor Yellow
    exit 1
}

# 2. Check if ngrok is already running by querying its local inspection API (127.0.0.1:4040)
$existingUrl = $null
try {
    $tunnelResp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
    $httpsTunnel = $tunnelResp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
    if ($httpsTunnel) {
        $existingUrl = $httpsTunnel.public_url
    }
} catch {
    # Not running yet
}

if ($existingUrl) {
    Write-Host "[OK] Active ngrok tunnel already detected!" -ForegroundColor Green
    $publicUrl = $existingUrl
} else {
    Write-Host "[INFO] Starting new ngrok tunnel forwarding to port $Port..." -ForegroundColor Cyan
    
    # Launch ngrok in a separate window or background
    Start-Process -FilePath "ngrok" -ArgumentList "http $Port" -WindowStyle Minimized
    
    Write-Host "[INFO] Waiting for ngrok inspection API on http://127.0.0.1:4040..." -NoNewline
    $maxAttempts = 15
    $attempt = 0
    $publicUrl = $null

    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
        $attempt++

        try {
            $tunnelResp = Invoke-RestMethod -Uri "http://127.0.0.1:4040/api/tunnels" -TimeoutSec 2 -ErrorAction Stop
            $httpsTunnel = $tunnelResp.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            if ($httpsTunnel) {
                $publicUrl = $httpsTunnel.public_url
                break
            }
        } catch {
            # Warming up
        }
    }
    Write-Host ""

    if (!$publicUrl) {
        Write-Host "[ERROR] Could not retrieve public tunnel URL from ngrok API." -ForegroundColor Red
        Write-Host "Please check if another ngrok process is already bound or run 'ngrok http $Port' directly." -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Green
Write-Host "  Public Ngrok Tunnel is Active!                          " -ForegroundColor Green
Write-Host "  Public URL:       $publicUrl" -ForegroundColor Green
Write-Host "  Local Upstream:   http://localhost:$Port" -ForegroundColor Green
Write-Host "  Health Endpoint:  $publicUrl/health" -ForegroundColor Green
Write-Host "  API Base URL:     $publicUrl/api/v1" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
Write-Host ""

if ($UpdateEnv) {
    Write-Host "[INFO] Updating environment files with new tunnel URL..." -ForegroundColor Cyan

    # Update backend .env
    if (Test-Path $BackendEnvPath) {
        $content = Get-Content $BackendEnvPath -Raw
        $content = $content -replace "TUNNEL_URL=.*", "TUNNEL_URL=$publicUrl"
        $content = $content -replace "API_BASE_URL=.*", "API_BASE_URL=$publicUrl"
        Set-Content -Path $BackendEnvPath -Value $content
        Write-Host "[OK] Updated $BackendEnvPath" -ForegroundColor Green
    }

    # Update frontend .env.local
    if (Test-Path $FrontendEnvPath) {
        $content = Get-Content $FrontendEnvPath -Raw
        $content = $content -replace "VITE_API_BASE_URL=.*", "VITE_API_BASE_URL=$publicUrl/api/v1"
        $content = $content -replace "VITE_API_URL=.*", "VITE_API_URL=$publicUrl/api/v1"
        $wsUrl = $publicUrl -replace "^https:", "wss:"
        $content = $content -replace "VITE_WS_BASE_URL=.*", "VITE_WS_BASE_URL=$wsUrl/realtime"
        Set-Content -Path $FrontendEnvPath -Value $content
        Write-Host "[OK] Updated $FrontendEnvPath" -ForegroundColor Green
    }
} else {
    Write-Host "Environment variables for this tunnel session:" -ForegroundColor Yellow
    Write-Host "  Backend .env:           TUNNEL_URL=$publicUrl" -ForegroundColor Gray
    Write-Host "  Frontend .env.local:    VITE_API_BASE_URL=$publicUrl/api/v1" -ForegroundColor Gray
    Write-Host "  Vercel Environment:     VITE_API_BASE_URL=$publicUrl/api/v1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Tip: Run with -UpdateEnv to automatically update local .env files:" -ForegroundColor Cyan
    Write-Host "  .\scripts\windows\start-tunnel.ps1 -UpdateEnv" -ForegroundColor Cyan
}

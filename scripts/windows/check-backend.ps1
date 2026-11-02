<#
.SYNOPSIS
    Performs comprehensive health checks on the local BillionBiz backend.
.DESCRIPTION
    Verifies /health, /health/live, and /health/ready endpoints on localhost:8080,
    measures round-trip latency, and validates database connectivity.
.PARAMETER Port
    Local port to check (default: 8080).
#>
param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BillionBiz Local Backend Health Checker            " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:$Port"
$allPassed = $true

# 1. Main /health endpoint
Write-Host "[1/3] Testing main health endpoint ($baseUrl/health)..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
    $sw.Stop()

    Write-Host " [PASS] ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    Write-Host "      Platform: $($res.platform)" -ForegroundColor Gray
    Write-Host "      Version:  $($res.version)" -ForegroundColor Gray
    Write-Host "      Status:   $($res.status)" -ForegroundColor Gray
    Write-Host "      Database: $($res.database)" -ForegroundColor Gray
    Write-Host "      Time:     $($res.timestamp)" -ForegroundColor Gray

    if ($res.database -ne "CONNECTED") {
        Write-Host "      [WARN] Database is not connected: $($res.database)" -ForegroundColor Yellow
        $allPassed = $false
    }
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $allPassed = $false
}

# 2. Liveness check /health/live
Write-Host "[2/3] Testing liveness endpoint ($baseUrl/health/live)..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri "$baseUrl/health/live" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $sw.Stop()

    Write-Host " [PASS] ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    Write-Host "      Status: $($res.status)" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $allPassed = $false
}

# 3. Readiness check /health/ready
Write-Host "[3/3] Testing readiness endpoint ($baseUrl/health/ready)..." -NoNewline
try {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $res = Invoke-RestMethod -Uri "$baseUrl/health/ready" -Method Get -TimeoutSec 3 -ErrorAction Stop
    $sw.Stop()

    Write-Host " [PASS] ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
    Write-Host "      Status:   $($res.status)" -ForegroundColor Gray
    Write-Host "      Database: $($res.database)" -ForegroundColor Gray
} catch {
    Write-Host " [FAIL]" -ForegroundColor Red
    Write-Host "      Error: $_" -ForegroundColor Red
    $allPassed = $false
}

Write-Host "----------------------------------------------------------" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "[SUCCESS] All local backend health checks passed cleanly!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAILURE] One or more health checks failed." -ForegroundColor Red
    exit 1
}

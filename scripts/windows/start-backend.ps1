<#
.SYNOPSIS
    Starts the BillionBiz backend service on port 8080 with health verification.
.DESCRIPTION
    Validates environment files, PostgreSQL database connectivity, and port availability.
    Launches the backend in the background (or foreground with -Foreground) and verifies the health endpoint.
.PARAMETER Foreground
    If set, runs the backend directly in the foreground attached to the current terminal.
#>
param(
    [switch]$Foreground
)

$ErrorActionPreference = "Stop"

$RootPath = Resolve-Path "$PSScriptRoot\..\.."
$BackendPath = Join-Path $RootPath "billionbiz-backend"
$EnvPath = Join-Path $BackendPath ".env"
$EnvExamplePath = Join-Path $BackendPath ".env.example"
$LogPath = Join-Path $BackendPath "backend.log"
$Port = 8080

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BillionBiz Backend Service Launcher (Port $Port)    " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Node.js
try {
    $nodeVersion = node -v
    Write-Host "[OK] Node.js is available: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not found in PATH. Please install Node 20+." -ForegroundColor Red
    exit 1
}

# 2. Check .env file
if (!(Test-Path $EnvPath)) {
    if (Test-Path $EnvExamplePath) {
        Write-Host "[WARN] .env not found in $BackendPath. Creating from .env.example..." -ForegroundColor Yellow
        Copy-Item -Path $EnvExamplePath -Destination $EnvPath
        Write-Host "[OK] Created $EnvPath from template. Please review database credentials." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Missing both .env and .env.example in $BackendPath." -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[OK] Environment file found: $EnvPath" -ForegroundColor Green
}

# 3. Check Database Connection (Port 5432)
$dbCheck = Test-NetConnection -ComputerName "localhost" -Port 5432 -WarningAction SilentlyContinue
if ($dbCheck.TcpTestSucceeded) {
    Write-Host "[OK] Local PostgreSQL service detected on port 5432." -ForegroundColor Green
} else {
    Write-Host "[WARN] Could not reach PostgreSQL on localhost:5432. The backend may fail if the database service is stopped." -ForegroundColor Yellow
}

# 4. Check if Port 8080 is already occupied
$existingConn = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }
if ($existingConn) {
    $pidObj = $existingConn.OwningProcess | Select-Object -First 1
    $proc = Get-Process -Id $pidObj -ErrorAction SilentlyContinue
    Write-Host "[INFO] Port $Port is currently held by PID $pidObj ($($proc.ProcessName))." -ForegroundColor Yellow

    try {
        $health = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 3 -ErrorAction Stop
        Write-Host "[OK] Existing process is healthy: $($health.platform) v$($health.version) [DB: $($health.database)]" -ForegroundColor Green
        Write-Host "No need to restart. Backend is already active." -ForegroundColor Cyan
        exit 0
    } catch {
        Write-Host "[WARN] Port $Port is held, but /health endpoint did not respond. Run 'stop-backend.ps1' if you want to replace it." -ForegroundColor Yellow
        exit 1
    }
}

# 5. Start Backend Process
if ($Foreground) {
    Write-Host "[INFO] Starting backend in foreground mode..." -ForegroundColor Cyan
    Set-Location $BackendPath
    npm run dev
} else {
    Write-Host "[INFO] Launching backend in background. Logs will be redirected to $LogPath..." -ForegroundColor Cyan
    
    $startInfo = New-Object System.Diagnostics.ProcessStartInfo
    $startInfo.FileName = "cmd.exe"
    $startInfo.Arguments = "/c npm run dev > `"$LogPath`" 2>&1"
    $startInfo.WorkingDirectory = $BackendPath
    $startInfo.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
    $startInfo.CreateNoWindow = $true
    $startInfo.UseShellExecute = $false
    
    $process = [System.Diagnostics.Process]::Start($startInfo)
    Write-Host "[INFO] Process started with wrapper PID $($process.Id)." -ForegroundColor Cyan

    Write-Host "[INFO] Waiting for backend to initialize on port $Port..." -NoNewline
    $maxAttempts = 30
    $attempt = 0
    $isHealthy = $false

    while ($attempt -lt $maxAttempts) {
        Start-Sleep -Seconds 1
        Write-Host "." -NoNewline
        $attempt++

        try {
            $health = Invoke-RestMethod -Uri "http://localhost:$Port/health" -TimeoutSec 2 -ErrorAction Stop
            if ($health.status -eq "UP") {
                $isHealthy = $true
                break
            }
        } catch {
            # Still warming up
        }
    }
    Write-Host ""

    if ($isHealthy) {
        Write-Host "==========================================================" -ForegroundColor Green
        Write-Host "  Backend successfully started and healthy on port $Port!   " -ForegroundColor Green
        Write-Host "  Status:   $($health.status)" -ForegroundColor Green
        Write-Host "  Platform: $($health.platform)" -ForegroundColor Green
        Write-Host "  Database: $($health.database)" -ForegroundColor Green
        Write-Host "  Endpoint: http://localhost:$Port/health" -ForegroundColor Green
        Write-Host "==========================================================" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend did not respond within $maxAttempts seconds. Recent log tail:" -ForegroundColor Red
        if (Test-Path $LogPath) {
            Get-Content -Path $LogPath -Tail 25
        }
        exit 1
    }
}

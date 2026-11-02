<#
.SYNOPSIS
    Stops the BillionBiz backend process listening on port 8080.
.DESCRIPTION
    Locates any listening TCP connection on port 8080, terminates the owning process,
    and verifies that the port is completely freed.
.PARAMETER Port
    Local port to release (default: 8080).
#>
param(
    [int]$Port = 8080
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "       BillionBiz Backend Service Stopper                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }

if (!$connections) {
    Write-Host "[OK] No process is currently listening on port $Port." -ForegroundColor Green
    exit 0
}

$pids = $connections | Select-Object -ExpandProperty OwningProcess -Unique

foreach ($targetPid in $pids) {
    $proc = Get-Process -Id $targetPid -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Host "[INFO] Terminating PID $targetPid ($($proc.ProcessName))..." -ForegroundColor Yellow
        try {
            Stop-Process -Id $targetPid -Force -ErrorAction Stop
            Write-Host "[OK] Process $targetPid terminated successfully." -ForegroundColor Green
        } catch {
            Write-Host "[ERROR] Failed to terminate PID $($targetPid): $_" -ForegroundColor Red
        }
    }
}

Start-Sleep -Seconds 1
$remaining = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object { $_.OwningProcess -gt 0 }

if (!$remaining) {
    Write-Host "[SUCCESS] Port $Port is now completely free." -ForegroundColor Green
    exit 0
} else {
    Write-Host "[WARN] Port $Port is still in use by PIDs: $($remaining.OwningProcess -join ', ')" -ForegroundColor Yellow
    exit 1
}

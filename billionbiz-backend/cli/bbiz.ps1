<#
.SYNOPSIS
    BillionBiz Platform CLI (bbiz)
    Unified manager for the BillionBiz backend service, background daemons, health, and logs.

.DESCRIPTION
    Commands:
      bbiz status              Show detailed status dashboard (service, port, database, cloudflare)
      bbiz start               Start the BillionBiz backend service
      bbiz stop                Stop the BillionBiz backend service
      bbiz restart             Restart the backend and verify health
      bbiz logs [-f] [-n 50]   View or live-tail backend output and error logs
      bbiz health              Run end-to-end HTTP health checks (local & Cloudflare)
      bbiz build               Recompile backend TypeScript code (npm run build)
      bbiz service install     Install BillionBiz as an Automatic Windows Service on boot
      bbiz service uninstall   Safely remove the Windows Service registration
      bbiz help                Show help and available commands
#>

param(
    [Parameter(Position = 0)]
    [string]$Command = "status",

    [Parameter(Position = 1)]
    [string]$SubCommand = "",

    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$RemainingArgs = @()
)

$ErrorActionPreference = "Continue"

# Resolve absolute path to billionbiz-backend directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
if (Test-Path (Join-Path $ScriptDir "dist\server.js")) {
    $BackendDir = $ScriptDir
} elseif (Test-Path (Join-Path (Split-Path -Parent $ScriptDir) "dist\server.js")) {
    $BackendDir = Split-Path -Parent $ScriptDir
} else {
    $BackendDir = "C:\Users\cyber\OneDrive\Desktop\Shoum\BillionBiz-Prototype\billionbiz-backend"
}

$ServiceExe = Join-Path $BackendDir "service\billionbiz-service.exe"
$LogDir = Join-Path $BackendDir "service\logs"
$ServiceName = "BillionBizBackend"

function Write-BbizHeader {
    Write-Host ""
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host "   BillionBiz Platform CLI · Backend Service Manager (bbiz)       " -ForegroundColor Yellow
    Write-Host "  ================================================================" -ForegroundColor Cyan
    Write-Host ""
}

function Test-IsAdmin {
    $currentIdentity = [Security.Principal.WindowsIdentity]::GetCurrent()
    $principal = New-Object Security.Principal.WindowsPrincipal($currentIdentity)
    return $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

function Get-Port8080Process {
    try {
        $conn = Get-NetTCPConnection -LocalPort 8080 -State Listen -ErrorAction SilentlyContinue | Select-Object -First 1
        if ($conn -and $conn.OwningProcess -gt 0) {
            $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            return $proc
        }
    } catch {}
    return $null
}

function Show-Status {
    Write-BbizHeader

    # 1. Windows Service Status
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    Write-Host "  [1] WINDOWS SERVICE" -ForegroundColor Cyan
    if ($service) {
        $startMode = (Get-CimInstance -ClassName Win32_Service -Filter "Name='$ServiceName'").StartMode
        $statusColor = if ($service.Status -eq "Running") { "Green" } else { "Yellow" }
        Write-Host "      Service Name   : " -NoNewline; Write-Host $service.Name -ForegroundColor White
        Write-Host "      Display Name   : " -NoNewline; Write-Host $service.DisplayName -ForegroundColor White
        Write-Host "      Status         : " -NoNewline; Write-Host $service.Status -ForegroundColor $statusColor
        Write-Host "      Startup Type   : " -NoNewline; Write-Host $startMode -ForegroundColor White
        Write-Host "      Auto-Boot      : " -NoNewline
        if ($startMode -eq "Auto") {
            Write-Host "ENABLED (Starts automatically on power-on)" -ForegroundColor Green
        } else {
            Write-Host "$startMode" -ForegroundColor Yellow
        }
    } else {
        Write-Host "      Service Status : " -NoNewline; Write-Host "Not Installed" -ForegroundColor DarkGray
        Write-Host "      Note           : Run 'bbiz service install' to register auto-start on boot" -ForegroundColor Yellow
    }
    Write-Host ""

    # 2. Port & Process Status
    Write-Host "  [2] PROCESS & PORT 8080" -ForegroundColor Cyan
    $proc = Get-Port8080Process
    if ($proc) {
        $memMB = [math]::Round($proc.WorkingSet64 / 1MB, 1)
        Write-Host "      State          : " -NoNewline; Write-Host "LISTENING" -ForegroundColor Green
        Write-Host "      Process Name   : " -NoNewline; Write-Host "$($proc.ProcessName) (PID: $($proc.Id))" -ForegroundColor White
        Write-Host "      Memory (RSS)   : " -NoNewline; Write-Host "$memMB MB" -ForegroundColor White
        Write-Host "      Start Time     : " -NoNewline; Write-Host "$($proc.StartTime)" -ForegroundColor DarkGray
    } else {
        Write-Host "      State          : " -NoNewline; Write-Host "CLOSED (No process listening on port 8080)" -ForegroundColor Red
    }
    Write-Host ""

    # 3. HTTP Health Check (Local)
    Write-Host "  [3] LOCAL API HEALTH (http://localhost:8080/health)" -ForegroundColor Cyan
    try {
        $localRes = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        Write-Host "      Status         : " -NoNewline; Write-Host "$($localRes.status)" -ForegroundColor Green
        Write-Host "      Database       : " -NoNewline; Write-Host "$($localRes.database)" -ForegroundColor $(if ($localRes.database -eq "CONNECTED") { "Green" } else { "Red" })
        Write-Host "      Platform       : " -NoNewline; Write-Host "$($localRes.platform) v$($localRes.version)" -ForegroundColor White
    } catch {
        Write-Host "      Status         : " -NoNewline; Write-Host "UNAVAILABLE (Connection refused or server stopped)" -ForegroundColor Red
    }
    Write-Host ""

    # 4. Cloudflare Public Tunnel Health (https://api.chandraprakash.codes/health)
    Write-Host "  [4] PUBLIC CLOUDFLARE TUNNEL (https://api.chandraprakash.codes/health)" -ForegroundColor Cyan
    try {
        $publicRes = Invoke-RestMethod -Uri "https://api.chandraprakash.codes/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        Write-Host "      Status         : " -NoNewline; Write-Host "$($publicRes.status)" -ForegroundColor Green
        Write-Host "      Public URL     : " -NoNewline; Write-Host "https://api.chandraprakash.codes" -ForegroundColor Green
        Write-Host "      Tunnel State   : " -NoNewline; Write-Host "ACTIVE & ROUTING TRAFFIC" -ForegroundColor Green
    } catch {
        $msg = $_.Exception.Message
        Write-Host "      Status         : " -NoNewline; Write-Host "DOWN / UNREACHABLE ($msg)" -ForegroundColor Red
    }
    Write-Host ""

    # 5. Companion Services (PostgreSQL & Cloudflared)
    Write-Host "  [5] COMPANION SERVICES" -ForegroundColor Cyan
    $pgService = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
    $cfService = Get-Service -Name "Cloudflared" -ErrorAction SilentlyContinue

    Write-Host "      PostgreSQL DB  : " -NoNewline
    if ($pgService -and $pgService.Status -eq "Running") {
        Write-Host "RUNNING (Auto-Boot)" -ForegroundColor Green
    } elseif ($pgService) {
        Write-Host "$($pgService.Status)" -ForegroundColor Yellow
    } else {
        Write-Host "Not Detected" -ForegroundColor DarkGray
    }

    Write-Host "      Cloudflared    : " -NoNewline
    if ($cfService -and $cfService.Status -eq "Running") {
        Write-Host "RUNNING (Auto-Boot)" -ForegroundColor Green
    } elseif ($cfService) {
        Write-Host "$($cfService.Status)" -ForegroundColor Yellow
    } else {
        Write-Host "Not Detected" -ForegroundColor DarkGray
    }

    Write-Host ""
}

function Start-Bbiz {
    Write-BbizHeader
    Write-Host "  Starting BillionBiz Backend..." -ForegroundColor Yellow

    # Check if already listening
    $existing = Get-Port8080Process
    if ($existing) {
        Write-Host "  [!] Backend is already running on port 8080 (PID: $($existing.Id))." -ForegroundColor Green
        return
    }

    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "  Starting Windows Service '$ServiceName'..." -ForegroundColor Cyan
        try {
            if (Test-IsAdmin) {
                Start-Service -Name $ServiceName -ErrorAction Stop
            } else {
                Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -Command Start-Service -Name '$ServiceName'" -Wait
            }
        } catch {
            Write-Host "  Service start encountered: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  Windows service not installed. Launching background Node.js process..." -ForegroundColor Cyan
        $startScript = Join-Path $BackendDir "dist\server.js"
        if (-not (Test-Path $startScript)) {
            Write-Host "  [!] dist/server.js not found. Running npm run build first..." -ForegroundColor Yellow
            Push-Location $BackendDir
            npm run build
            Pop-Location
        }

        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "node.exe"
        $psi.Arguments = "dist/server.js"
        $psi.WorkingDirectory = $BackendDir
        $psi.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
        $psi.UseShellExecute = $true
        [System.Diagnostics.Process]::Start($psi) | Out-Null
    }

    # Poll health check for up to 10 seconds
    Write-Host "  Waiting for backend to become ready..." -NoNewline
    $ready = $false
    for ($i = 0; $i -lt 10; $i++) {
        Start-Sleep -Milliseconds 1000
        Write-Host "." -NoNewline
        try {
            $h = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 1 -ErrorAction Stop
            if ($h.status -eq "UP") {
                $ready = $true
                break
            }
        } catch {}
    }
    Write-Host ""

    if ($ready) {
        Write-Host "  [OK] BillionBiz Backend is UP and listening on http://localhost:8080!" -ForegroundColor Green
        Write-Host "  [OK] Public Cloudflare endpoint: https://api.chandraprakash.codes" -ForegroundColor Green
    } else {
        Write-Host "  [!] Backend started, but health check did not respond within 10s. Run 'bbiz logs' to inspect output." -ForegroundColor Yellow
    }
    Write-Host ""
}

function Stop-Bbiz {
    Write-BbizHeader
    Write-Host "  Stopping BillionBiz Backend..." -ForegroundColor Yellow

    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($service -and $service.Status -eq "Running") {
        Write-Host "  Stopping Windows Service '$ServiceName'..." -ForegroundColor Cyan
        try {
            if (Test-IsAdmin) {
                Stop-Service -Name $ServiceName -Force -ErrorAction Stop
            } else {
                Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -Command Stop-Service -Name '$ServiceName' -Force" -Wait
            }
            Write-Host "  [OK] Windows Service stopped." -ForegroundColor Green
        } catch {
            Write-Host "  Warning: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    # Ensure any process on port 8080 is also stopped
    $proc = Get-Port8080Process
    if ($proc) {
        Write-Host "  Stopping process on port 8080 (PID: $($proc.Id))..." -ForegroundColor Cyan
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Process $($proc.Id) stopped." -ForegroundColor Green
    } else {
        Write-Host "  [OK] Port 8080 is completely free." -ForegroundColor Green
    }
    Write-Host ""
}

function Restart-Bbiz {
    Write-BbizHeader
    Write-Host "  Restarting BillionBiz Backend..." -ForegroundColor Cyan
    Stop-Bbiz
    Start-Sleep -Milliseconds 1500
    Start-Bbiz
}

function Show-Logs {
    $follow = $RemainingArgs -contains "-f" -or $RemainingArgs -contains "--follow"
    $lines = 60

    for ($i = 0; $i -lt $RemainingArgs.Count; $i++) {
        if ($RemainingArgs[$i] -eq "-n" -and ($i + 1) -lt $RemainingArgs.Count) {
            $lines = [int]$RemainingArgs[$i + 1]
        }
    }

    $outLog = Join-Path $LogDir "billionbiz-service.out.log"
    $errLog = Join-Path $LogDir "billionbiz-service.err.log"
    $wrapperLog = Join-Path $LogDir "billionbiz-service.wrapper.log"

    $logFileToRead = $null
    if (Test-Path $outLog) {
        $logFileToRead = $outLog
    } elseif (Test-Path $wrapperLog) {
        $logFileToRead = $wrapperLog
    }

    if (-not $logFileToRead) {
        Write-Host ""
        Write-Host "  [!] No service log files found yet in $LogDir." -ForegroundColor Yellow
        Write-Host "      Logs are generated when the Windows Service runs." -ForegroundColor DarkGray
        Write-Host ""
        return
    }

    Write-Host ""
    Write-Host "  === Showing last $lines lines from: $logFileToRead ===" -ForegroundColor Cyan
    if ($follow) {
        Write-Host "  (Live streaming logs... Press Ctrl+C to exit)" -ForegroundColor Yellow
        Write-Host ""
        Get-Content -Path $logFileToRead -Tail $lines -Wait
    } else {
        Get-Content -Path $logFileToRead -Tail $lines
        Write-Host ""
        Write-Host "  Tip: Use 'bbiz logs -f' to live-tail backend logs in real time." -ForegroundColor DarkGray
        Write-Host ""
    }
}

function Install-Service {
    Write-BbizHeader
    Write-Host "  Installing BillionBiz Backend as a Windows Service..." -ForegroundColor Cyan
    Write-Host "  Target: Starts automatically when laptop powers on (Startup: Automatic)" -ForegroundColor Yellow
    Write-Host ""

    if (-not (Test-Path $ServiceExe)) {
        Write-Host "  [ERROR] $ServiceExe not found. Please ensure billionbiz-backend/service exists." -ForegroundColor Red
        return
    }

    $xmlPath = Join-Path $BackendDir "service\billionbiz-service.xml"
    if (-not (Test-Path $xmlPath)) {
        Write-Host "  [ERROR] $xmlPath not found." -ForegroundColor Red
        return
    }

    # Ensure project is compiled before installing
    Write-Host "  [1/3] Verifying production build..." -ForegroundColor Cyan
    Push-Location $BackendDir
    npm run build
    Pop-Location

    Write-Host "  [2/3] Registering Windows Service '$ServiceName' with SCM..." -ForegroundColor Cyan
    $installCmd = "& '$ServiceExe' install"
    if (Test-IsAdmin) {
        & $ServiceExe install
    } else {
        Write-Host "  Elevating permissions for Windows Service installation (UAC prompt)..." -ForegroundColor Yellow
        Start-Process -FilePath $ServiceExe -ArgumentList "install" -Verb RunAs -Wait
    }

    # Check if service is now registered
    Start-Sleep -Milliseconds 1500
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($svc) {
        Write-Host "  [OK] Service '$ServiceName' successfully installed!" -ForegroundColor Green
        Write-Host "  [3/3] Starting service..." -ForegroundColor Cyan
        Start-Bbiz
    } else {
        Write-Host "  [!] Installation finished. Checking service registration..." -ForegroundColor Yellow
        Show-Status
    }
}

function Uninstall-Service {
    Write-BbizHeader
    Write-Host "  Uninstalling BillionBiz Backend Windows Service..." -ForegroundColor Yellow

    # Stop first
    Stop-Bbiz

    if (Test-IsAdmin) {
        & $ServiceExe uninstall
    } else {
        Write-Host "  Elevating permissions for Windows Service removal (UAC prompt)..." -ForegroundColor Yellow
        Start-Process -FilePath $ServiceExe -ArgumentList "uninstall" -Verb RunAs -Wait
    }

    Start-Sleep -Milliseconds 1500
    $svc = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Host "  [OK] Service '$ServiceName' successfully uninstalled." -ForegroundColor Green
    } else {
        Write-Host "  [!] Service still listed. May require a reboot to finalize removal." -ForegroundColor Yellow
    }
    Write-Host ""
}

function Test-Health {
    Write-BbizHeader
    Write-Host "  Running Health & Connectivity Checks..." -ForegroundColor Cyan
    Write-Host ""

    # Local Health
    Write-Host "  Testing Local API: http://localhost:8080/health..." -NoNewline
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $res = Invoke-RestMethod -Uri "http://localhost:8080/health" -Method Get -TimeoutSec 3 -ErrorAction Stop
        $sw.Stop()
        Write-Host " OK ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
        Write-Host "    Status   : $($res.status)" -ForegroundColor White
        Write-Host "    Database : $($res.database)" -ForegroundColor $(if ($res.database -eq "CONNECTED") { "Green" } else { "Red" })
        Write-Host "    Platform : $($res.platform)" -ForegroundColor White
    } catch {
        Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
    }
    Write-Host ""

    # Cloudflare Public API
    Write-Host "  Testing Cloudflare Tunnel: https://api.chandraprakash.codes/health..." -NoNewline
    try {
        $sw = [System.Diagnostics.Stopwatch]::StartNew()
        $res = Invoke-RestMethod -Uri "https://api.chandraprakash.codes/health" -Method Get -TimeoutSec 5 -ErrorAction Stop
        $sw.Stop()
        Write-Host " OK ($($sw.ElapsedMilliseconds)ms)" -ForegroundColor Green
        Write-Host "    Status   : $($res.status)" -ForegroundColor White
        Write-Host "    Database : $($res.database)" -ForegroundColor $(if ($res.database -eq "CONNECTED") { "Green" } else { "Red" })
    } catch {
        Write-Host " FAILED ($($_.Exception.Message))" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-Help {
    Write-BbizHeader
    Write-Host "  USAGE:" -ForegroundColor Yellow
    Write-Host "    bbiz <command> [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "  AVAILABLE COMMANDS:" -ForegroundColor Yellow
    Write-Host "    status              Show visual status dashboard (service, port, DB, Cloudflare)" -ForegroundColor White
    Write-Host "    start               Start the backend service or background process" -ForegroundColor White
    Write-Host "    stop                Stop the backend service and free port 8080" -ForegroundColor White
    Write-Host "    restart             Restart the backend and verify health" -ForegroundColor White
    Write-Host "    logs [-f] [-n 50]   View recent logs or live-tail (-f) in real time" -ForegroundColor White
    Write-Host "    health              Run end-to-end local and Cloudflare connectivity test" -ForegroundColor White
    Write-Host "    build               Recompile backend TypeScript code (npm run build)" -ForegroundColor White
    Write-Host "    service install     Install as a native Windows Service (starts on laptop boot)" -ForegroundColor White
    Write-Host "    service uninstall   Safely remove the Windows Service registration" -ForegroundColor White
    Write-Host "    help                Display this help screen" -ForegroundColor White
    Write-Host ""
    Write-Host "  EXAMPLES:" -ForegroundColor Yellow
    Write-Host "    bbiz status" -ForegroundColor Cyan
    Write-Host "    bbiz restart" -ForegroundColor Cyan
    Write-Host "    bbiz logs -f" -ForegroundColor Cyan
    Write-Host "    bbiz service install" -ForegroundColor Cyan
    Write-Host ""
}

# Main Command Dispatcher
switch ($Command.ToLower()) {
    "status" {
        Show-Status
    }
    "start" {
        Start-Bbiz
    }
    "stop" {
        Stop-Bbiz
    }
    "restart" {
        Restart-Bbiz
    }
    "logs" {
        Show-Logs
    }
    "log" {
        Show-Logs
    }
    "health" {
        Test-Health
    }
    "test" {
        Test-Health
    }
    "build" {
        Write-BbizHeader
        Write-Host "  Compiling backend TypeScript..." -ForegroundColor Cyan
        Push-Location $BackendDir
        npm run build
        Pop-Location
        Write-Host "  [OK] Build complete!" -ForegroundColor Green
        Write-Host ""
    }
    "service" {
        if ($SubCommand.ToLower() -eq "install") {
            Install-Service
        } elseif ($SubCommand.ToLower() -eq "uninstall" -or $SubCommand.ToLower() -eq "remove") {
            Uninstall-Service
        } else {
            Write-Host "Unknown service command: '$SubCommand'. Use 'bbiz service install' or 'bbiz service uninstall'." -ForegroundColor Yellow
        }
    }
    "help" {
        Show-Help
    }
    "-h" {
        Show-Help
    }
    "--help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

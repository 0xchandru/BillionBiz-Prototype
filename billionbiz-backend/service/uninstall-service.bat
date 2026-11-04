@echo off
echo ================================================================
echo   Uninstalling BillionBiz Backend Windows Service
echo ================================================================
echo.

cd /d "%~dp0"
billionbiz-service.exe stop
billionbiz-service.exe uninstall
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] BillionBizBackend Windows Service successfully uninstalled.
) else (
    echo.
    echo [FAILED] Please make sure to right-click and "Run as administrator".
)

echo.
pause

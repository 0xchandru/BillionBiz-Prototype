@echo off
echo ================================================================
echo   Installing BillionBiz Backend as Automatic Windows Service
echo ================================================================
echo.

cd /d "%~dp0"
billionbiz-service.exe install
if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] BillionBizBackend Windows Service successfully installed!
    echo Starting service...
    billionbiz-service.exe start
    echo.
    echo [OK] The backend will now start automatically whenever your laptop powers on.
) else (
    echo.
    echo [FAILED] Please make sure to right-click and "Run as administrator".
)

echo.
pause

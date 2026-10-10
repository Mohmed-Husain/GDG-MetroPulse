@echo off
setlocal
cd /d "%~dp0"
title MetroPulse Stadium Surge Planner (PS-05)

echo ===========================================================
echo   MetroPulse Stadium Surge Planner (PS-05)
echo   Gujarat Metro Rail Corporation (GMRC)
echo ===========================================================
echo.
echo Launching unified simulation platform...
echo.

python run.py %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] An error occurred while running MetroPulse.
    pause
)

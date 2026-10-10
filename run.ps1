# MetroPulse PowerShell Launcher
Set-Location -Path $PSScriptRoot

Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  MetroPulse Stadium Surge Planner (PS-05)" -ForegroundColor Cyan
Write-Host "  Gujarat Metro Rail Corporation (GMRC)" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Launching unified simulation platform..." -ForegroundColor Green
Write-Host ""

python run.py @args

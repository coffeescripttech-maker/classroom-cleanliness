Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Schedule Checker Service" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Set-Location web-portal\python-api

Write-Host "Checking Python installation..." -ForegroundColor Yellow
python --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Python is not installed or not in PATH" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "Installing required packages..." -ForegroundColor Yellow
pip install mysql-connector-python requests opencv-python

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Schedule Checker Service Starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "This service will check for scheduled captures every minute" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
Write-Host ""

python schedule_checker.py

Read-Host "Press Enter to exit"

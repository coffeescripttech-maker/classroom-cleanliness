# Stop all Python and Node.js servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Stopping Servers..." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Stop Python processes
Write-Host "Stopping Python API Server..." -ForegroundColor Yellow
Get-Process python -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*app.py*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# Stop Node.js processes
Write-Host "Stopping Next.js Frontend..." -ForegroundColor Yellow
Get-Process node -ErrorAction SilentlyContinue | Where-Object {$_.CommandLine -like "*next*"} | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers stopped!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Read-Host "Press Enter to exit"

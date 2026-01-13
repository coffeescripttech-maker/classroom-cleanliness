# Classroom Cleanliness Monitoring System - PowerShell Startup Script
# This script starts both Python API and Next.js servers

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Classroom Cleanliness Monitoring System" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting servers..." -ForegroundColor Yellow
Write-Host ""

# Check if Python is installed
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Python from https://www.python.org/downloads/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

# Check if Node.js is installed
try {
    $nodeVersion = node --version 2>&1
    Write-Host "[OK] Node.js is installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""

# Start Python API in new window
Write-Host "Starting Python API Server (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web-portal\python-api'; Write-Host 'Python API Server - Port 5000' -ForegroundColor Cyan; python app.py"

# Wait for Python server to start
Start-Sleep -Seconds 3

# Start Next.js in new window
Write-Host "Starting Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web-portal'; Write-Host 'Next.js Frontend - Port 3000' -ForegroundColor Cyan; npm run dev"

# Wait for Next.js to start
Start-Sleep -Seconds 2

# Start Schedule Checker in new window
Write-Host "Starting Schedule Checker Service..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\web-portal\python-api'; Write-Host 'Schedule Checker Service' -ForegroundColor Cyan; python schedule_checker.py"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Servers are starting..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Python API:  " -NoNewline; Write-Host "http://localhost:5000" -ForegroundColor Blue
Write-Host "Next.js:     " -NoNewline; Write-Host "http://localhost:3000" -ForegroundColor Blue
Write-Host "Dashboard:   " -NoNewline; Write-Host "http://localhost:3000/dashboard" -ForegroundColor Blue
Write-Host ""
Write-Host "Three PowerShell windows will open:" -ForegroundColor Yellow
Write-Host "1. Python API Server (Port 5000)" -ForegroundColor White
Write-Host "2. Next.js Frontend (Port 3000)" -ForegroundColor White
Write-Host "3. Schedule Checker Service (runs every minute)" -ForegroundColor White
Write-Host ""
Write-Host "To stop servers: Close all three PowerShell windows" -ForegroundColor Yellow
Write-Host "                 or press Ctrl+C in each window" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Waiting 5 seconds before opening browser..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Open browser to dashboard
Write-Host "Opening dashboard in browser..." -ForegroundColor Green
Start-Process "http://localhost:3000/dashboard"

Write-Host ""
Write-Host "Setup complete! Check the two server windows." -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to close this window (servers will keep running)"

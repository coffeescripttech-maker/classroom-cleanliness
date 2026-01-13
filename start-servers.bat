@echo off
REM Classroom Cleanliness Monitoring System - Startup Script
REM This script starts both Python API and Next.js servers

echo ========================================
echo Classroom Cleanliness Monitoring System
echo ========================================
echo.
echo Starting servers...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not installed or not in PATH
    echo Please install Python from https://www.python.org/downloads/
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Python and Node.js are installed
echo.

REM Start Python API in new window
echo Starting Python API Server (Port 5000)...
start "Python API Server" cmd /k "cd web-portal\python-api && python app.py"

REM Wait a bit for Python server to start
timeout /t 3 /nobreak >nul

REM Start Next.js in new window
echo Starting Next.js Frontend (Port 3000)...
start "Next.js Frontend" cmd /k "cd web-portal && npm run dev"

REM Wait a bit for Next.js to start
timeout /t 2 /nobreak >nul

REM Start Schedule Checker in new window
echo Starting Schedule Checker Service...
start "Schedule Checker Service" cmd /k "cd web-portal\python-api && python schedule_checker.py"

echo.
echo ========================================
echo Servers are starting...
echo ========================================
echo.
echo Python API:  http://localhost:5000
echo Next.js:     http://localhost:3000
echo Dashboard:   http://localhost:3000/dashboard
echo.
echo Three command windows will open:
echo 1. Python API Server (Port 5000)
echo 2. Next.js Frontend (Port 3000)
echo 3. Schedule Checker Service (runs every minute)
echo.
echo To stop servers: Close all three command windows
echo                  or press Ctrl+C in each window
echo.
echo ========================================
echo.
pause

@echo off
REM Check if servers are running

echo ========================================
echo Server Status Check
echo ========================================
echo.

REM Check Python
echo Checking Python API (Port 5000)...
netstat -ano | findstr :5000 >nul 2>&1
if errorlevel 1 (
    echo [X] Python API is NOT running
) else (
    echo [OK] Python API is running on port 5000
)

echo.

REM Check Next.js
echo Checking Next.js Frontend (Port 3000)...
netstat -ano | findstr :3000 >nul 2>&1
if errorlevel 1 (
    echo [X] Next.js is NOT running
) else (
    echo [OK] Next.js is running on port 3000
)

echo.

REM Check MySQL
echo Checking MySQL (Port 3306)...
netstat -ano | findstr :3306 >nul 2>&1
if errorlevel 1 (
    echo [X] MySQL is NOT running
) else (
    echo [OK] MySQL is running on port 3306
)

echo.
echo ========================================
echo.
echo If servers are not running, use:
echo   start-servers.bat
echo.
echo To stop servers, use:
echo   stop-servers.bat
echo.
echo ========================================
echo.
pause

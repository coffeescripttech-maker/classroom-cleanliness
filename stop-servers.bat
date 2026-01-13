@echo off
REM Stop all Python and Node.js servers

echo ========================================
echo Stopping Servers...
echo ========================================
echo.

REM Kill Python processes running app.py
echo Stopping Python API Server...
taskkill /F /FI "WINDOWTITLE eq Python API Server*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq python.exe" /FI "COMMANDLINE eq *app.py*" >nul 2>&1

REM Kill Node.js processes
echo Stopping Next.js Frontend...
taskkill /F /FI "WINDOWTITLE eq Next.js Frontend*" >nul 2>&1
taskkill /F /FI "IMAGENAME eq node.exe" /FI "COMMANDLINE eq *next*" >nul 2>&1

echo.
echo ========================================
echo Servers stopped!
echo ========================================
echo.
pause

@echo off
echo ========================================
echo Restarting Python API
echo ========================================
echo.

echo Stopping existing Python processes...
taskkill /F /IM python.exe /FI "WINDOWTITLE eq *app.py*" 2>nul
timeout /t 2 /nobreak >nul

echo.
echo Starting Python API...
cd web-portal\python-api
start "Python AI API" python app.py

echo.
echo ========================================
echo Python API restarted!
echo ========================================
echo.
echo Check the new window for API logs
echo API should be running on http://localhost:5000
echo.
pause

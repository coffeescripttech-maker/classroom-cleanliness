@echo off
echo ========================================
echo Starting Schedule Checker Service
echo ========================================
echo.

cd web-portal\python-api

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing required packages...
pip install -r requirements_schedule.txt

echo.
echo ========================================
echo Schedule Checker Service Starting...
echo ========================================
echo This service will check for scheduled captures every minute
echo Press Ctrl+C to stop
echo.

python schedule_checker.py

pause

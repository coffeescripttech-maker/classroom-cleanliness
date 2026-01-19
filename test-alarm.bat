@echo off
echo ========================================
echo Alarm Sound Test
echo ========================================
echo.

cd web-portal\python-api

echo Installing pygame...
pip install pygame

echo.
echo ========================================
echo Testing Alarm Sound
echo ========================================
echo.

python test_alarm.py

echo.
pause

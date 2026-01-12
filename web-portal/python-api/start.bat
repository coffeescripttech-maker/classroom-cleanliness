@echo off
echo ============================================
echo Starting Python AI API Server
echo ============================================
echo.

REM Check if Flask is installed
python -c "import flask" 2>nul
if errorlevel 1 (
    echo Flask not found. Installing dependencies...
    pip install flask flask-cors
    echo.
)

echo Starting server on http://localhost:5000
echo Press Ctrl+C to stop
echo.

python app.py

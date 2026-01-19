@echo off
echo ========================================
echo Setting Up Authentication System
echo ========================================
echo.

cd web-portal

echo Step 1: Running database migration...
echo.
mysql -u root -p classroom_cleanliness < database/migrations/create_auth_tables.sql
if errorlevel 1 (
    echo ERROR: Migration failed
    pause
    exit /b 1
)
echo ✓ Migration completed
echo.

echo Step 2: Seeding authentication data...
echo.
node database/seed-auth.js
if errorlevel 1 (
    echo ERROR: Seeding failed
    pause
    exit /b 1
)
echo.

echo ========================================
echo Authentication Setup Complete!
echo ========================================
echo.
echo You can now login with:
echo   Username: admin
echo   Password: admin123
echo.
echo Visit: http://localhost:3000/login
echo.
pause

@echo off
REM ============================================
REM Laravel Backend Setup Script for Windows
REM ============================================

echo.
echo ========================================
echo Arabic Website - Backend Setup Script
echo ========================================
echo.

REM Step 1: Navigate to backend directory
echo [1/7] Navigating to backend directory...
cd backend
if errorlevel 1 (
    echo Error: Could not find backend directory
    exit /b 1
)

REM Step 2: Install composer dependencies
echo [2/7] Installing composer dependencies...
echo This may take a few minutes...
call composer install
if errorlevel 1 (
    echo Error: Composer install failed
    exit /b 1
)

REM Step 3: Generate application key
echo [3/7] Generating application key...
call php artisan key:generate
if errorlevel 1 (
    echo Error: Could not generate application key
    exit /b 1
)

REM Step 4: Create storage directory
echo [4/7] Creating storage directories...
if not exist storage mkdir storage
if not exist storage\framework mkdir storage\framework
if not exist storage\logs mkdir storage\logs

REM Step 5: Run database migrations
echo [5/7] Running database migrations...
echo Make sure MySQL is running and arabicwebsite_db database exists!
echo.
call php artisan migrate
if errorlevel 1 (
    echo.
    echo WARNING: Migration may have failed. Make sure:
    echo - MySQL server is running
    echo - Database 'arabicwebsite_db' exists
    echo - .env file has correct database credentials
    echo.
    pause
)

REM Step 6: Seed the database
echo [6/7] Seeding database with test users...
call php artisan db:seed
if errorlevel 1 (
    echo Error: Database seeding failed
    pause
    exit /b 1
)

REM Step 7: Create storage link
echo [7/7] Creating storage link for uploads...
call php artisan storage:link
if errorlevel 1 (
    echo Error: Could not create storage link
    echo Please run manually: php artisan storage:link
)

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Backend is ready to start!
echo.
echo To start the backend server, run:
echo    php artisan serve
echo.
echo The backend will be available at:
echo    http://localhost:8000
echo.
echo Test Credentials:
echo    Admin: admin@wordpress.local / admin
echo    User:  user@wordpress.local / password
echo.

pause

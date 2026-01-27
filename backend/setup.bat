@echo off
REM Quick Start Script for Laravel Backend Setup
REM This script sets up the Laravel backend for the Arabic Website project

echo.
echo ========================================
echo Arabic Website Backend - Setup Script
echo ========================================
echo.

REM Check if Composer is installed
where composer >nul 2>nul
if errorlevel 1 (
    echo ERROR: Composer is not installed or not in PATH
    echo Please install Composer from https://getcomposer.org/
    pause
    exit /b 1
)

echo [1/6] Installing Composer dependencies...
call composer install
if errorlevel 1 (
    echo ERROR: Failed to install composer dependencies
    pause
    exit /b 1
)
echo [✓] Dependencies installed successfully

echo.
echo [2/6] Creating .env file...
if not exist .env (
    copy .env.example .env
    echo [✓] .env file created
) else (
    echo [✓] .env file already exists
)

echo.
echo [3/6] Generating application key...
call php artisan key:generate
echo [✓] Application key generated

echo.
echo [4/6] Database Setup Instructions
echo ========================================
echo Before running migrations, ensure:
echo.
echo 1. MySQL is running
echo 2. Create database in phpMyAdmin or MySQL:
echo.
echo    CREATE DATABASE arabicwebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
echo.
echo 3. Update database credentials in .env if needed
echo.
pause

echo.
echo [5/6] Running migrations...
call php artisan migrate
if errorlevel 1 (
    echo ERROR: Migration failed
    echo Check your database connection in .env
    pause
    exit /b 1
)
echo [✓] Migrations completed successfully

echo.
echo [6/6] Creating storage link...
call php artisan storage:link
echo [✓] Storage link created

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo To start the server, run:
echo   php artisan serve
echo.
echo API will be available at:
echo   http://localhost:8000/api
echo.
echo Database name: arabicwebsite_db
echo.
pause

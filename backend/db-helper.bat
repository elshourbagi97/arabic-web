@echo off
REM Database Management Helper Script for Laravel Backend
REM Run common database operations

if "%1"=="" (
    echo.
    echo Database Management Helper
    echo ========================
    echo.
    echo Usage: db-helper.bat [command]
    echo.
    echo Commands:
    echo   migrate        - Run all pending migrations
    echo   reset          - Reset database (drops all tables)
    echo   refresh        - Reset and re-run all migrations
    echo   seed           - Seed database with sample data
    echo   fresh          - Reset and migrate and seed
    echo   status         - Check migration status
    echo   rollback       - Rollback last migration batch
    echo.
    pause
    exit /b 0
)

if "%1"=="migrate" (
    echo Running migrations...
    php artisan migrate
    goto :eof
)

if "%1"=="reset" (
    echo WARNING: This will delete all tables!
    set /p confirm="Are you sure? (yes/no): "
    if /i not "%confirm%"=="yes" (
        echo Cancelled.
        exit /b 0
    )
    php artisan migrate:reset
    goto :eof
)

if "%1"=="refresh" (
    echo Running migrations refresh...
    php artisan migrate:refresh
    goto :eof
)

if "%1"=="seed" (
    echo Seeding database...
    php artisan db:seed
    goto :eof
)

if "%1"=="fresh" (
    echo WARNING: This will delete all data and recreate tables!
    set /p confirm="Are you sure? (yes/no): "
    if /i not "%confirm%"=="yes" (
        echo Cancelled.
        exit /b 0
    )
    php artisan migrate:fresh --seed
    goto :eof
)

if "%1"=="status" (
    echo Checking migration status...
    php artisan migrate:status
    goto :eof
)

if "%1"=="rollback" (
    echo Rolling back last migration...
    php artisan migrate:rollback
    goto :eof
)

echo Unknown command: %1
echo Run "db-helper.bat" without arguments for help.
pause

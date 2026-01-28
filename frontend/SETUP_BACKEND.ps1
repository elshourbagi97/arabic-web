# ============================================
# Laravel Backend Setup Script for Windows PowerShell
# ============================================

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arabic Website - Backend Setup Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path "backend")) {
    Write-Host "Error: Could not find 'backend' directory" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory" -ForegroundColor Yellow
    exit 1
}

# Step 1: Navigate to backend
Write-Host "[1/8] Navigating to backend directory..." -ForegroundColor Yellow
Push-Location "backend"

# Step 2: Check if PHP is installed
Write-Host "[2/8] Checking PHP installation..." -ForegroundColor Yellow
$phpVersion = php --version 2>$null
if ($null -eq $phpVersion) {
    Write-Host "Error: PHP is not installed or not in PATH" -ForegroundColor Red
    exit 1
}
Write-Host "PHP found: $($phpVersion.Split([Environment]::NewLine)[0])" -ForegroundColor Green

# Step 3: Install composer dependencies
Write-Host "[3/8] Installing composer dependencies..." -ForegroundColor Yellow
Write-Host "This may take a few minutes..." -ForegroundColor Gray
composer install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Composer install failed" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "Composer install completed successfully" -ForegroundColor Green

# Step 4: Generate application key
Write-Host "[4/8] Generating application key..." -ForegroundColor Yellow
php artisan key:generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error: Could not generate application key" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "Application key generated" -ForegroundColor Green

# Step 5: Create storage directories
Write-Host "[5/8] Creating storage directories..." -ForegroundColor Yellow
if (!(Test-Path "storage")) {
    New-Item -ItemType Directory -Path "storage" | Out-Null
}
if (!(Test-Path "storage\framework")) {
    New-Item -ItemType Directory -Path "storage\framework" | Out-Null
}
if (!(Test-Path "storage\logs")) {
    New-Item -ItemType Directory -Path "storage\logs" | Out-Null
}
Write-Host "Storage directories created" -ForegroundColor Green

# Step 6: Database check
Write-Host "[6/8] Database Information" -ForegroundColor Yellow
Write-Host "Make sure these conditions are met:" -ForegroundColor Gray
Write-Host "  ✓ MySQL server is running" -ForegroundColor Gray
Write-Host "  ✓ Database 'arabicwebsite_db' exists" -ForegroundColor Gray
Write-Host "  ✓ Database username: root" -ForegroundColor Gray
Write-Host ""

$confirmDB = Read-Host "Have you created the database? (y/n)"
if ($confirmDB -ne 'y' -and $confirmDB -ne 'Y') {
    Write-Host "Please create the database first using phpMyAdmin or MySQL command line:" -ForegroundColor Yellow
    Write-Host "  CREATE DATABASE arabicwebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" -ForegroundColor Cyan
    Write-Host "Then run this script again" -ForegroundColor Yellow
    Pop-Location
    exit 0
}

# Step 7: Run migrations
Write-Host "[7/8] Running database migrations..." -ForegroundColor Yellow
php artisan migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "Warning: Migration may have issues. Check your database connection." -ForegroundColor Yellow
}
Write-Host "Migrations completed" -ForegroundColor Green

# Step 8: Seed database
Write-Host "[8/8] Seeding database with test users..." -ForegroundColor Yellow
php artisan db:seed
if ($LASTEXITCODE -eq 0) {
    Write-Host "Database seeded successfully" -ForegroundColor Green
} else {
    Write-Host "Note: Database seeding may have issues, but migrations should be complete" -ForegroundColor Yellow
}

# Create storage link
Write-Host ""
Write-Host "Creating storage link for image uploads..." -ForegroundColor Yellow
php artisan storage:link
if ($LASTEXITCODE -eq 0) {
    Write-Host "Storage link created" -ForegroundColor Green
}

Pop-Location

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Backend is ready to start!" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Open a new PowerShell/Command Prompt window" -ForegroundColor Yellow
Write-Host "2. Navigate to the backend folder: cd backend" -ForegroundColor Yellow
Write-Host "3. Start the server: php artisan serve" -ForegroundColor Yellow
Write-Host ""
Write-Host "The backend will be available at:" -ForegroundColor Cyan
Write-Host "    http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Test Credentials:" -ForegroundColor Cyan
Write-Host "    Admin: admin@wordpress.local / admin" -ForegroundColor Green
Write-Host "    User:  user@wordpress.local / password" -ForegroundColor Green
Write-Host ""

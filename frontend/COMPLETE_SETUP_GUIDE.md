# Complete Backend Setup & Migration Guide

## Prerequisites

- PHP 8.2 or higher
- MySQL Server running
- Composer installed globally
- Node.js & npm (for frontend)

## Step 1: Install PHP Dependencies

```bash
# Navigate to backend folder
cd backend

# Install all composer dependencies
composer install
```

## Step 2: Copy Environment File

```bash
# The .env file is already created, verify it has these settings:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=arabicwebsite_db
DB_USERNAME=root
DB_PASSWORD=
```

## Step 3: Create Database

Using phpMyAdmin or command line:

```bash
# Via MySQL command line
mysql -u root -p
> CREATE DATABASE arabicwebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
> EXIT;
```

Or via phpMyAdmin:

1. Open phpMyAdmin (http://localhost/phpmyadmin)
2. Click "New" on the left sidebar
3. Enter database name: `arabicwebsite_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click "Create"

## Step 4: Run Migrations

```bash
# Generate application key (if not already done)
php artisan key:generate

# Run all database migrations
php artisan migrate

# Seed the database with test users
php artisan db:seed
```

## Step 5: Install PDF Library (DomPDF)

```bash
# The package is already in composer.json, ensure it's installed
composer require barryvdh/laravel-dompdf
```

## Step 6: Create Storage Link

```bash
# Create symlink for public storage (for image uploads)
php artisan storage:link
```

## Step 7: Start the Laravel Development Server

```bash
# Start Laravel backend server on port 8000
php artisan serve
```

The backend will be available at: **http://localhost:8000**

## Step 8: (Separate Terminal) Start Frontend Development Server

```bash
# Navigate to project root
cd ..

# Start Vite development server
npm run dev
```

Frontend will be available at: **http://localhost:5173**

---

## Database Tables Created

After running migrations, your `arabicwebsite_db` database will have these tables:

1. **users** - User accounts with roles (admin/user)
2. **tables** - Data tables created by users
3. **table_rows** - Rows within each table
4. **images** - Uploaded images/documents
5. **notes** - Notes associated with tables

## Test Credentials

After seeding, you can login with:

**Admin Account:**

- Email: `admin@wordpress.local`
- Password: `admin`

**Regular User Account:**

- Email: `user@wordpress.local`
- Password: `password`

**Test Account:**

- Email: `test@wordpress.local`
- Password: `test123`

---

## API Endpoints Overview

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get current user profile

### Tables

- `GET /api/tables` - Get all user tables
- `POST /api/tables` - Create new table
- `GET /api/tables/{id}` - Get table details
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table

### Table Rows

- `POST /api/tables/{id}/rows` - Add row to table
- `PUT /api/rows/{id}` - Update table row
- `DELETE /api/rows/{id}` - Delete table row

### Images

- `GET /api/images` - Get all user images
- `POST /api/images` - Upload new image
- `DELETE /api/images/{id}` - Delete image

### PDF Export

- `GET /api/tables/{id}/export-pdf` - Export table as PDF (with Arabic support)

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/{id}` - Get user details (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)

---

## Troubleshooting

### Error: "Class not found" or "Cannot find Kernel"

- Run: `composer autoload-dump`

### Error: "SQLSTATE[HY000]: General error: 15 'Readonly'"

- This means you need to create the database first
- See Step 3

### Error: "No application encryption key has been specified"

- Run: `php artisan key:generate`

### Error: "CORS Origin Not Allowed"

- Frontend requests will include CORS headers
- Ensure API is running on http://localhost:8000
- Frontend should be on http://localhost:5173 or similar

### PDF Export Not Working

- Ensure DomPDF is installed: `composer require barryvdh/laravel-dompdf`
- Check font support for Arabic text
- DomPDF may need additional fonts configured

---

## Frontend Integration

To connect the React frontend to the Laravel backend:

1. Update API endpoint in `src/services/apiService.ts` to: `http://localhost:8000/api`
2. Use the provided test credentials for login
3. All authentication tokens are stored in localStorage as `auth_token`

---

## Next Steps

1. ✅ Install dependencies (`composer install`)
2. ✅ Create database
3. ✅ Run migrations (`php artisan migrate`)
4. ✅ Seed database (`php artisan db:seed`)
5. ✅ Start backend server (`php artisan serve`)
6. Start frontend server (`npm run dev`)
7. Test login with credentials above
8. Test table creation and PDF export

Good luck! 🚀

# Arabic Website Backend - Laravel

This is a Laravel backend for the Arabic Website project with complete database migrations and PDF export functionality.

## Features

- User authentication (Login/Register)
- Admin panel for user management
- Table management with CRUD operations
- Image upload functionality
- Notes management
- **PDF export with Arabic support** ✨
- Role-based access control

## Database Setup

Database name: `arabicwebsite_db`

### Tables Created

1. **users** - User accounts with roles (admin/user)
2. **tables** - Data tables for each user
3. **table_rows** - Rows within each table
4. **images** - Uploaded images
5. **notes** - Notes associated with tables

## Installation & Setup

### Prerequisites

- PHP 8.2+
- Composer
- MySQL/MariaDB
- phpMyAdmin (for database management)

### Step 1: Install Dependencies

```bash
cd backend
composer install
```

### Step 2: Configure Environment

1. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

2. Update `.env` with your database credentials:

```env
DB_DATABASE=arabicwebsite_db
DB_USERNAME=root
DB_PASSWORD=
```

3. Generate application key:

```bash
php artisan key:generate
```

### Step 3: Create Database

Using phpMyAdmin or MySQL command line:

```sql
CREATE DATABASE arabicwebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 4: Run Migrations

```bash
php artisan migrate
```

This will create all necessary tables in the database.

### Step 5: Create Admin User (Optional)

```bash
php artisan tinker
```

Then in tinker:

```php
$user = new \App\Models\User();
$user->name = 'Admin';
$user->email = 'admin@example.com';
$user->password = bcrypt('password');
$user->role = 'admin';
$user->save();
```

## Running the Server

```bash
php artisan serve
```

Server runs at: `http://localhost:8000`

## API Endpoints

### Authentication

- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `POST /api/auth/logout` - Logout
- `GET /api/auth/profile` - Get current user profile

### Tables

- `GET /api/tables` - Get all user tables
- `POST /api/tables` - Create new table
- `GET /api/tables/{id}` - Get specific table
- `PUT /api/tables/{id}` - Update table
- `DELETE /api/tables/{id}` - Delete table
- `POST /api/tables/{id}/rows` - Add row to table
- `PUT /api/rows/{id}` - Update row
- `DELETE /api/rows/{id}` - Delete row

### Images

- `GET /api/images` - Get all user images
- `POST /api/images` - Upload image
- `DELETE /api/images/{id}` - Delete image

### PDF Export

- `GET /api/tables/{id}/export-pdf` - Export table to PDF with Arabic support

### Admin

- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/users/{id}` - Get user details (admin only)
- `DELETE /api/admin/users/{id}` - Delete user (admin only)

## PDF Export Feature

The PDF export feature supports:

✅ Arabic text rendering
✅ Table data with formatting
✅ Notes and descriptions
✅ Professional styling
✅ Multi-page support
✅ Landscape orientation for wide tables

### Usage

```
GET /api/tables/{tableId}/export-pdf
```

This endpoint will download a PDF file with the table data formatted properly with Arabic support.

## Frontend Integration

Update your frontend to use these API endpoints:

```typescript
// Example: Login
const response = await fetch("http://localhost:8000/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email: "user@example.com", password: "password" }),
});

const data = await response.json();
const token = data.token;

// Use token in subsequent requests
fetch("http://localhost:8000/api/tables", {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Configuration

### Database Connection

Edit `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=arabicwebsite_db
DB_USERNAME=root
DB_PASSWORD=
```

### Application Settings

Edit `.env`:

```env
APP_NAME="Arabic Website"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000
```

## Storage

Images are stored in `storage/app/public/uploads/`

Link storage to public:

```bash
php artisan storage:link
```

## Troubleshooting

### Migration Errors

If you get migration errors, run:

```bash
php artisan migrate:refresh
```

### Database Connection Issues

Verify your database credentials in `.env` and ensure MySQL is running.

### PDF Generation Issues

Ensure all dependencies are installed:

```bash
composer require barryvdh/laravel-dompdf
```

## Support

For issues or questions, check the Laravel documentation:

- [Laravel Docs](https://laravel.com/docs)
- [Laravel API Documentation](https://laravel.com/api)

## License

MIT License - see LICENSE file for details

# Arabic Website Backend - Laravel

This is a Laravel backend for the Arabic Website project with complete database migrations and PDF export functionality.

## Features

- User authentication (Login/Register)
- **Password Reset via Email** ✨ NEW
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

### Step 5: Configure Email (Optional - for Password Reset)

For password reset functionality, you need to configure email settings.

**Quick Test (Logs to file):**
```bash
# Keep MAIL_MAILER=log in .env
php artisan email:test test@example.com
# Check storage/logs/laravel.log
```

**Production Setup (SendGrid):**

See [MAIL_SETUP.md](MAIL_SETUP.md) for complete SendGrid configuration guide.

Quick steps:
1. Get SendGrid API key from https://sendgrid.com/
2. Update `.env`:
   ```env
   MAIL_MAILER=smtp
   MAIL_HOST=smtp.sendgrid.net
   MAIL_PORT=587
   MAIL_USERNAME=apikey
   MAIL_PASSWORD=your_sendgrid_api_key
   MAIL_ENCRYPTION=tls
   MAIL_FROM_ADDRESS=noreply@yourdomain.com
   ```
3. Test: `php artisan email:test your-email@example.com`
4. Verify: `php artisan mail:verify`

### Step 6: Create Admin User (Optional)

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
- `POST /api/auth/forgot-password` - Request password reset email
- `POST /api/auth/reset-password` - Reset password with token

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

### Email Issues

For password reset email issues:

1. **Run verification**: `php artisan mail:verify`
2. **Check logs**: `tail -f storage/logs/laravel.log`
3. **Test email**: `php artisan email:test your-email@example.com`
4. **See guide**: [MAIL_SETUP.md](MAIL_SETUP.md) for complete troubleshooting

Common issues:
- Authentication failed: Check MAIL_USERNAME=apikey and MAIL_PASSWORD
- Sender rejected: Verify sender email in SendGrid
- Connection refused: Check firewall allows port 587

## Artisan Commands

### Email Testing & Verification

```bash
# Test email sending
php artisan email:test your-email@example.com

# Verify complete mail setup
php artisan mail:verify
```

### Database

```bash
# Run migrations
php artisan migrate

# Rollback migrations
php artisan migrate:rollback

# Fresh migration
php artisan migrate:fresh
```

### Cache

```bash
# Clear configuration cache
php artisan config:clear

# Clear application cache
php artisan cache:clear

# Cache configuration
php artisan config:cache
```

## Support

For issues or questions, check the Laravel documentation:

- [Laravel Docs](https://laravel.com/docs)
- [Laravel API Documentation](https://laravel.com/api)

## License

MIT License - see LICENSE file for details

# Arabic Website - Backend Setup Guide

## Project Overview

This guide covers the complete setup of the Laravel backend for the Arabic Website project with database migrations and PDF export functionality.

**Database Name:** `arabicwebsite_db`

---

## Quick Start (Windows)

### Method 1: Automated Setup (Recommended)

1. Open PowerShell or Command Prompt
2. Navigate to the backend folder:
   ```
   cd backend
   ```
3. Run the setup script:
   ```
   setup.bat
   ```

The script will automatically:

- Install all dependencies
- Create .env file
- Generate application key
- Prompt you to create the database
- Run migrations
- Create storage link

---

## Manual Setup Instructions

### Step 1: Install PHP and Composer

Ensure you have:

- **PHP 8.2+** installed
- **Composer** installed (https://getcomposer.org/)
- **MySQL/MariaDB** running
- **phpMyAdmin** access

### Step 2: Create Database

1. Open phpMyAdmin
2. Click "New" in the left panel
3. Database name: `arabicwebsite_db`
4. Charset: `utf8mb4`
5. Collation: `utf8mb4_unicode_ci`
6. Click "Create"

Or use command line:

```sql
CREATE DATABASE arabicwebsite_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 3: Install Dependencies

```bash
cd backend
composer install
```

### Step 4: Configure Environment

1. Copy example file:

   ```bash
   cp .env.example .env
   ```

2. Update database credentials in `.env`:

   ```env
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=arabicwebsite_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

3. Generate app key:
   ```bash
   php artisan key:generate
   ```

### Step 5: Run Migrations

```bash
php artisan migrate
```

This creates all tables:

- `users` - User accounts
- `tables` - Data tables
- `table_rows` - Table data
- `images` - Uploaded images
- `notes` - Table notes

### Step 6: Create Storage Link

```bash
php artisan storage:link
```

### Step 7: Seed Sample Data (Optional)

```bash
php artisan migrate:fresh --seed
```

This creates test users and sample tables.

---

## Database Schema

### Users Table

```
id (Primary Key)
name (string)
email (unique)
password (hashed)
role (admin/user) - Default: user
email_verified_at (timestamp)
remember_token
created_at
updated_at
```

### Tables

```
id (Primary Key)
user_id (Foreign Key → users)
label (string) - جدول 1, جدول 2, etc
column_headers (JSON)
notes (text)
created_at
updated_at
```

### Table Rows

```
id (Primary Key)
table_id (Foreign Key → tables)
row_number (integer)
row_data (JSON)
created_at
updated_at
```

### Images

```
id (Primary Key)
user_id (Foreign Key → users)
filename (string)
original_name (string)
mime_type (string)
size (bigInteger)
path (string)
description (text)
created_at
updated_at
```

### Notes

```
id (Primary Key)
table_id (Foreign Key → tables)
content (longText)
created_at
updated_at
```

---

## Starting the Server

### Development Server

```bash
php artisan serve
```

Server runs at: **http://localhost:8000**

### API Base URL

```
http://localhost:8000/api
```

---

## API Documentation

### Authentication Endpoints

#### Login

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@wordpress.local",
  "password": "password"
}

Response:
{
  "user": { ... },
  "token": "bearer_token_here"
}
```

#### Register

```
POST /api/auth/register
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "password",
  "password_confirmation": "password"
}
```

#### Logout

```
POST /api/auth/logout
Authorization: Bearer token
```

#### Profile

```
GET /api/auth/profile
Authorization: Bearer token
```

### Tables Endpoints

#### Get All Tables

```
GET /api/tables
Authorization: Bearer token
```

#### Create Table

```
POST /api/tables
Authorization: Bearer token
{
  "label": "جدول 1",
  "column_headers": ["عمود 1", "عمود 2", "عمود 3"]
}
```

#### Get Table

```
GET /api/tables/{id}
Authorization: Bearer token
```

#### Update Table

```
PUT /api/tables/{id}
Authorization: Bearer token
{
  "label": "جدول جديد",
  "notes": "ملاحظات"
}
```

#### Delete Table

```
DELETE /api/tables/{id}
Authorization: Bearer token
```

#### Add Row to Table

```
POST /api/tables/{id}/rows
Authorization: Bearer token
{
  "row_data": ["البيان 1", "البيان 2", "البيان 3"]
}
```

#### Update Row

```
PUT /api/rows/{rowId}
Authorization: Bearer token
{
  "row_data": ["تحديث 1", "تحديث 2"]
}
```

#### Delete Row

```
DELETE /api/rows/{rowId}
Authorization: Bearer token
```

### Images Endpoints

#### Get Images

```
GET /api/images
Authorization: Bearer token
```

#### Upload Image

```
POST /api/images
Authorization: Bearer token
Content-Type: multipart/form-data

file: <image_file>
description: "Optional description"
```

#### Delete Image

```
DELETE /api/images/{id}
Authorization: Bearer token
```

### PDF Export Endpoint

#### Export Table to PDF

```
GET /api/tables/{id}/export-pdf
Authorization: Bearer token
```

**Features:**

- ✅ Arabic text support
- ✅ Table formatting
- ✅ Notes included
- ✅ Professional styling
- ✅ Landscape orientation
- ✅ Multi-page support

**Response:** PDF file download

### Admin Endpoints

#### Get All Users

```
GET /api/admin/users
Authorization: Bearer token (admin only)
```

#### Get User Details

```
GET /api/admin/users/{userId}
Authorization: Bearer token (admin only)
```

#### Delete User

```
DELETE /api/admin/users/{userId}
Authorization: Bearer token (admin only)
```

---

## Frontend Integration

### Install API Service

The `apiService.ts` file is provided in `/src/services/apiService.ts`

### Usage Example

```typescript
import apiService from "@/services/apiService";

// Login
const login = async () => {
  const { user, token } = await apiService.login(
    "email@example.com",
    "password",
  );
};

// Get tables
const tables = await apiService.getTables();

// Export to PDF (تصدير إلى PDF)
const exportPdf = async (tableId: number) => {
  await apiService.exportTableToPdf(tableId);
};
```

### PDF Export Button

Use the `PdfExportButton` component:

```typescript
import { PdfExportButton } from '@/app/components/PdfExportButton';

<PdfExportButton tableId={tableId} tableLabel="جدول 1" />
```

---

## Troubleshooting

### Issue: "Connection refused" when connecting to database

**Solution:**

1. Ensure MySQL is running
2. Check `.env` database credentials
3. Verify database exists in phpMyAdmin

### Issue: Migrations fail

**Solution:**

```bash
php artisan migrate:refresh
```

### Issue: PDF export shows encoding issues

**Solution:**

- Ensure UTF-8 is set in `.env`
- Check HTML generation in PdfExportController

### Issue: "SQLSTATE[HY000]: General error: 1030"

**Solution:**

```bash
php artisan migrate:reset
php artisan migrate
```

### Issue: Images not uploading

**Solution:**

```bash
php artisan storage:link
chmod -R 775 storage/app/public
```

---

## Security Recommendations

1. **Change default credentials** before production
2. **Enable HTTPS** in production
3. **Set APP_DEBUG=false** in production
4. **Use strong passwords** for admin accounts
5. **Validate all file uploads**
6. **Implement rate limiting** for API endpoints

---

## Credentials for Testing

### Default Users (if seeded)

**Admin:**

- Email: `admin@wordpress.local`
- Password: `admin`
- Role: Admin

**User:**

- Email: `user@wordpress.local`
- Password: `password`
- Role: User

---

## File Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/
│   │   │       ├── AuthController.php
│   │   │       ├── TableController.php
│   │   │       ├── ImageController.php
│   │   │       ├── PdfExportController.php
│   │   │       └── AdminController.php
│   │   ├── Middleware/
│   │   │   └── IsAdmin.php
│   │   └── Kernel.php
│   └── Models/
│       ├── User.php
│       ├── Table.php
│       ├── TableRow.php
│       ├── Image.php
│       └── Note.php
├── database/
│   ├── migrations/
│   │   ├── create_users_table.php
│   │   ├── create_tables_table.php
│   │   ├── create_table_rows_table.php
│   │   ├── create_images_table.php
│   │   └── create_notes_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php
├── .env.example
├── .env
├── composer.json
├── README.md
└── setup.bat
```

---

## Support

For more information:

- [Laravel Official Documentation](https://laravel.com/docs)
- [Laravel API Documentation](https://laravel.com/api)
- [dompdf Documentation](https://github.com/barryvdh/laravel-dompdf)

---

## License

MIT License - See LICENSE file for details

---

**Last Updated:** January 23, 2026
**Version:** 1.0.0

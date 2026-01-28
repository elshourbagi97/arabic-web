# 🚀 Arabic Website Backend - Complete Setup Summary

## What Has Been Created

Your Laravel backend has been fully set up with the following features:

### ✅ Database Setup

- **Database Name:** `arabicwebsite_db`
- **Character Set:** UTF-8MB4 (Full Arabic support)
- **Tables Created:** 5 tables with proper relationships

### ✅ Complete API Structure

- Authentication (Login/Register/Logout)
- Table Management (CRUD operations)
- Row Management (Add/Update/Delete rows)
- Image Upload functionality
- **PDF Export with Arabic Support** 📄
- Admin Panel for user management

### ✅ Security Features

- Token-based authentication (Sanctum)
- Role-based access control (Admin/User)
- Authorization checks on all endpoints
- Input validation

---

## 📁 Files Created

### Backend Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/
│   │   │   ├── AuthController.php
│   │   │   ├── TableController.php
│   │   │   ├── ImageController.php
│   │   │   ├── PdfExportController.php ⭐
│   │   │   └── AdminController.php
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
│   ├── migrations/ (5 migration files)
│   │   ├── create_users_table.php
│   │   ├── create_tables_table.php
│   │   ├── create_table_rows_table.php
│   │   ├── create_images_table.php
│   │   └── create_notes_table.php
│   └── seeders/
│       └── DatabaseSeeder.php
├── routes/
│   └── api.php
├── .env (Database configuration)
├── .env.example
├── composer.json
├── README.md
├── setup.bat ⭐ (Automated setup script)
└── db-helper.bat (Database operations helper)
```

### Frontend Files

```
src/
├── services/
│   └── apiService.ts ⭐ (Complete API client)
└── app/components/
    └── PdfExportButton.tsx ⭐ (PDF export component)

Root files:
├── BACKEND_SETUP.md ⭐ (Complete setup guide)
├── API_CONFIG.ts (API configuration guide)
```

---

## 🔧 Quick Start (Choose One Method)

### Method 1: Automated Setup (Recommended for Windows)

1. Open Command Prompt or PowerShell
2. Navigate to backend folder:
   ```bash
   cd backend
   ```
3. Run setup script:
   ```bash
   setup.bat
   ```
4. Follow the prompts (you'll need to create the database manually)
5. Done! Server will be ready to start

### Method 2: Manual Setup

1. **Create Database:**
   - Open phpMyAdmin
   - Create new database: `arabicwebsite_db`
   - Charset: `utf8mb4`

2. **Install Dependencies:**

   ```bash
   cd backend
   composer install
   ```

3. **Configure Environment:**

   ```bash
   cp .env.example .env
   ```

   Update DB credentials in `.env`

4. **Generate Key & Setup:**

   ```bash
   php artisan key:generate
   php artisan migrate
   php artisan storage:link
   ```

5. **Start Server:**
   ```bash
   php artisan serve
   ```

---

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/logout`
- `GET /api/auth/profile`

### Tables

- `GET /api/tables`
- `POST /api/tables`
- `GET /api/tables/{id}`
- `PUT /api/tables/{id}`
- `DELETE /api/tables/{id}`
- `POST /api/tables/{id}/rows`
- `PUT /api/rows/{id}`
- `DELETE /api/rows/{id}`

### Images

- `GET /api/images`
- `POST /api/images`
- `DELETE /api/images/{id}`

### PDF Export ⭐

- `GET /api/tables/{id}/export-pdf`
  - Returns: PDF file with Arabic support
  - Format: Landscape A4 with professional styling

### Admin

- `GET /api/admin/users` (admin only)
- `GET /api/admin/users/{id}` (admin only)
- `DELETE /api/admin/users/{id}` (admin only)

---

## 📱 Using the Frontend Service

### API Service (apiService.ts)

The `apiService.ts` file provides a complete TypeScript client for all backend operations:

```typescript
import apiService from "@/services/apiService";

// Authentication
await apiService.login("email@example.com", "password");
await apiService.register("name", "email", "password", "password");
await apiService.logout();

// Tables
const tables = await apiService.getTables();
await apiService.createTable("جدول 1", ["عمود 1", "عمود 2"]);
await apiService.updateTable(1, { label: "جدول جديد" });
await apiService.deleteTable(1);

// Table Rows
await apiService.addTableRow(1, ["البيان 1", "البيان 2"]);
await apiService.updateTableRow(1, ["تحديث 1", "تحديث 2"]);
await apiService.deleteTableRow(1);

// Images
await apiService.uploadImage(file, "description");
const images = await apiService.getImages();

// PDF Export (تصدير إلى PDF)
await apiService.exportTableToPdf(tableId);
```

### PDF Export Button Component

```typescript
import { PdfExportButton } from '@/app/components/PdfExportButton';

<PdfExportButton tableId={tableId} tableLabel="جدول 1" />
```

---

## 📊 Database Schema

### Users

```sql
id, name, email, password, role, email_verified_at, remember_token, created_at, updated_at
```

### Tables

```sql
id, user_id, label, column_headers (JSON), notes, created_at, updated_at
```

### Table Rows

```sql
id, table_id, row_number, row_data (JSON), created_at, updated_at
```

### Images

```sql
id, user_id, filename, original_name, mime_type, size, path, description, created_at, updated_at
```

### Notes

```sql
id, table_id, content, created_at, updated_at
```

---

## 🔐 Default Test Credentials (After Seeding)

**Admin User:**

- Email: `admin@wordpress.local`
- Password: `admin`

**Regular User:**

- Email: `user@wordpress.local`
- Password: `password`

_(Only available if you ran the seeder)_

---

## 📋 Database Management Commands

Use `db-helper.bat` for common operations:

```bash
db-helper.bat migrate       # Run migrations
db-helper.bat refresh       # Reset and migrate
db-helper.bat seed          # Seed data
db-helper.bat fresh         # Reset, migrate, and seed
db-helper.bat status        # Check status
db-helper.bat rollback      # Undo last migration
```

---

## 🖥️ Server Information

**Development Server:**

```
http://localhost:8000
```

**API Base URL:**

```
http://localhost:8000/api
```

**Storage (Uploads):**

```
http://localhost:8000/storage/uploads/
```

---

## ⚙️ Configuration Files

### .env (Database & App Config)

Located in `backend/.env`

- Database connection details
- Application name and URL
- API settings

### .env.example

Template for `.env` file (keep as backup)

### composer.json

PHP dependencies:

- Laravel Framework
- Laravel Sanctum (Auth)
- DomPDF (PDF Generation) ⭐
- Intervention Image (Image processing)

---

## 🎯 PDF Export Features

✅ **Arabic Text Support**

- Full RTL (Right-to-Left) support
- UTF-8 encoding
- Proper Arabic character rendering

✅ **Professional Formatting**

- Header with table name
- Styled table columns and rows
- Notes section
- Footer with export date
- Responsive design

✅ **Advanced Features**

- Multi-page support for large tables
- Landscape orientation for wide data
- Custom fonts and colors
- Export date and metadata

---

## 🚨 Troubleshooting

### Database Connection Error

1. Check MySQL is running
2. Verify credentials in `.env`
3. Ensure database exists in phpMyAdmin

### Migration Fails

```bash
php artisan migrate:refresh
```

### Permission Issues

```bash
# On Windows: Usually not needed
# On Linux/Mac:
chmod -R 775 storage
chmod -R 775 bootstrap/cache
```

### PDF Not Generating

1. Ensure dompdf is installed: `composer require barryvdh/laravel-dompdf`
2. Check file permissions
3. Verify fonts are in correct location

---

## 📚 Documentation Files

| File                | Purpose                                 |
| ------------------- | --------------------------------------- |
| `BACKEND_SETUP.md`  | Complete setup guide with all details   |
| `backend/README.md` | Laravel backend documentation           |
| `API_CONFIG.ts`     | API configuration and environment setup |
| `apiService.ts`     | Frontend API client documentation       |

---

## ✨ Next Steps

1. **Run Setup:**
   - Execute `setup.bat` or follow manual setup

2. **Create Database:**
   - Use phpMyAdmin or MySQL CLI

3. **Start Backend:**

   ```bash
   php artisan serve
   ```

4. **Integrate Frontend:**
   - Use `apiService.ts` in your React components
   - Import `PdfExportButton` for PDF exports

5. **Test API:**
   - Use Postman or cURL to test endpoints
   - Login with test credentials
   - Create tables and export to PDF

---

## 📞 Support Resources

- **Laravel Docs:** https://laravel.com/docs
- **DomPDF Docs:** https://github.com/barryvdh/laravel-dompdf
- **Laravel Sanctum:** https://laravel.com/docs/sanctum
- **MySQL Docs:** https://dev.mysql.com/doc/

---

## 📝 Notes

- Database uses UTF-8MB4 for full Arabic support
- All timestamps are UTC (set in .env if needed)
- Storage link must be created for file uploads
- CORS may need configuration for production
- Use HTTPS in production environment

---

## 🎉 You're All Set!

Your Laravel backend is ready to use. The database `arabicwebsite_db` will be created with all necessary tables when you run the migrations.

**Happy coding! 🚀**

---

**Created:** January 23, 2026
**Version:** 1.0.0
**Project:** Arabic Website with Laravel Backend

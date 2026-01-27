# Quick Reference - Arabic Website Backend

## 🚀 Quick Start (60 seconds)

```bash
# 1. Go to backend folder
cd backend

# 2. Install dependencies
composer install

# 3. Copy environment config
cp .env.example .env

# 4. Create database in phpMyAdmin
# Database: arabicwebsite_db
# Charset: utf8mb4

# 5. Setup database
php artisan key:generate
php artisan migrate

# 6. Start server
php artisan serve
```

Server: `http://localhost:8000/api`

---

## 📋 Common Commands

```bash
# Database
php artisan migrate              # Run migrations
php artisan migrate:refresh      # Reset all tables
php artisan migrate:fresh --seed # Reset and add sample data
php artisan db:seed              # Add sample data only

# Development
php artisan serve                # Start server
php artisan tinker               # PHP shell

# Storage
php artisan storage:link         # Link storage for uploads

# Troubleshooting
php artisan migrate:reset        # Drop all tables
php artisan cache:clear          # Clear cache
```

---

## 🔑 Test Login Credentials

After running migrations with seed:

```
Email: user@wordpress.local
Password: password
```

Admin:

```
Email: admin@wordpress.local
Password: admin
```

---

## 📡 API Examples

### Login

```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@wordpress.local",
    "password": "password"
  }'
```

### Get Tables

```bash
curl -X GET http://localhost:8000/api/tables \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Export to PDF

```bash
curl -X GET http://localhost:8000/api/tables/1/export-pdf \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o table.pdf
```

---

## 💻 Frontend Integration

```typescript
import apiService from "@/services/apiService";

// Login
const { token } = await apiService.login("email", "password");

// Get tables
const tables = await apiService.getTables();

// Export PDF (تصدير إلى PDF)
await apiService.exportTableToPdf(tableId);
```

---

## 🗄️ Database Info

**Name:** `arabicwebsite_db`
**Tables:** users, tables, table_rows, images, notes
**Charset:** UTF-8MB4 (Arabic support)

---

## 📁 Important Files

| File                           | Purpose             |
| ------------------------------ | ------------------- |
| `backend/.env`                 | Database config     |
| `backend/routes/api.php`       | API routes          |
| `backend/database/migrations/` | Table definitions   |
| `src/services/apiService.ts`   | Frontend API client |
| `BACKEND_SETUP.md`             | Full documentation  |

---

## ⚠️ Troubleshooting

| Problem              | Solution                                                           |
| -------------------- | ------------------------------------------------------------------ |
| "Connection refused" | Start MySQL, check `.env` credentials                              |
| Migrations fail      | Run `php artisan migrate:refresh`                                  |
| Upload fails         | Run `php artisan storage:link`                                     |
| PDF error            | Check dompdf installed: `composer require barryvdh/laravel-dompdf` |

---

## 🎯 Feature Checklist

✅ User Authentication
✅ Table CRUD (Create, Read, Update, Delete)
✅ Row Management
✅ Image Upload
✅ **PDF Export with Arabic Support**
✅ Admin Panel
✅ Role-based Access Control

---

## 📱 API Endpoints Summary

```
Authentication:
  POST   /api/auth/login
  POST   /api/auth/register
  POST   /api/auth/logout
  GET    /api/auth/profile

Tables:
  GET    /api/tables
  POST   /api/tables
  GET    /api/tables/{id}
  PUT    /api/tables/{id}
  DELETE /api/tables/{id}

Rows:
  POST   /api/tables/{id}/rows
  PUT    /api/rows/{id}
  DELETE /api/rows/{id}

Images:
  GET    /api/images
  POST   /api/images
  DELETE /api/images/{id}

PDF:
  GET    /api/tables/{id}/export-pdf ⭐

Admin:
  GET    /api/admin/users
  DELETE /api/admin/users/{id}
```

---

## 🔧 Configuration

### .env Database Section

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=arabicwebsite_db
DB_USERNAME=root
DB_PASSWORD=
```

### CORS (if needed)

Add to `config/cors.php`:

```php
'allowed_origins' => ['http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
```

---

## 🎓 Learn More

- **Full Setup Guide:** See `BACKEND_SETUP.md`
- **Complete Summary:** See `SETUP_SUMMARY.md`
- **API Details:** See `backend/README.md`
- **Frontend Config:** See `API_CONFIG.ts`

---

**Last Updated:** January 23, 2026

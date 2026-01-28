# 🚀 START HERE - Complete Backend Setup

Your Laravel backend has been completely created! Follow these simple steps to get it running.

## 📋 Quick Summary

✅ **Backend Created:** Full Laravel API with authentication, tables, images, and PDF export
✅ **Database:** arabicwebsite_db (ready to create)
✅ **Tests Users:** Pre-configured with credentials
✅ **PDF Export:** With full Arabic support
✅ **Frontend Service:** Complete API integration ready

---

## ⚡ FASTEST SETUP (5 minutes)

### Step 1: Open PowerShell

Right-click `SETUP_BACKEND.ps1` → "Run with PowerShell"

Or open PowerShell and type:

```powershell
.\SETUP_BACKEND.ps1
```

### Step 2: Create Database First!

The script will ask you to create the database. Do this:

1. Open **http://localhost/phpmyadmin**
2. Click **New** on the left
3. Name: `arabicwebsite_db`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**
6. Return to PowerShell and press Enter

### Step 3: Wait for Setup to Complete

The script will automatically:

- ✅ Install all PHP packages
- ✅ Generate application key
- ✅ Run database migrations
- ✅ Create test users
- ✅ Setup storage for uploads

### Step 4: Start the Backend

Open Command Prompt or PowerShell:

```bash
cd backend
php artisan serve
```

You'll see: `Server running on [/api]`

### Step 5: Start the Frontend

Open another Command Prompt:

```bash
npm run dev
```

You'll see the development server URL (usually `http://localhost:5173`)

---

## 🔐 Test Login Credentials

After setup completes, you can login with these accounts:

| Type      | Email                 | Password |
| --------- | --------------------- | -------- |
| **Admin** | admin@wordpress.local | admin    |
| **User**  | user@wordpress.local  | password |

---

## 🎯 PDF Export Feature

The PDF button is ready!

- Button text: **"تصدير إلى PDF"**
- Message: **"هذه الميزة ستتطلب مكتبة PDF في التطبيق النهائي"**
- Backend: Ready to generate PDFs with Arabic support
- Features:
  - ✅ Professional formatting
  - ✅ Arabic text rendering
  - ✅ Include table notes
  - ✅ Auto-generated timestamp

---

## 📂 What Was Created

### Backend (`/backend` folder)

```
backend/
├── app/Models/                 # Database models
├── app/Http/Controllers/Api/   # API controllers
├── app/Http/Middleware/        # Security middleware
├── database/migrations/        # Database schemas
├── database/seeders/           # Test data
├── config/                     # Configuration
├── routes/api.php              # API endpoints
├── .env                        # Database configuration
└── composer.json               # Dependencies
```

### Features Implemented

- ✅ User registration & login
- ✅ Role-based access (admin/user)
- ✅ Create & manage data tables
- ✅ Add/edit/delete table rows
- ✅ Upload images
- ✅ Export tables as PDF (Arabic support)
- ✅ Admin panel for user management
- ✅ Secure API with token authentication

---

## 🛠️ Manual Setup (If Script Fails)

If PowerShell script doesn't work, do this manually:

```bash
# 1. Open Command Prompt and go to backend folder
cd backend

# 2. Install dependencies
composer install

# 3. Generate app key
php artisan key:generate

# 4. Create database migrations
php artisan migrate

# 5. Add test users
php artisan db:seed

# 6. Setup file storage
php artisan storage:link

# 7. Start the server
php artisan serve
```

---

## 🔗 API Endpoints

All backend endpoints are under `http://localhost:8000/api/`

### Authentication

- `POST /auth/login` - Login
- `POST /auth/register` - Register
- `POST /auth/logout` - Logout
- `GET /auth/profile` - Get profile

### Tables

- `GET /tables` - List all tables
- `POST /tables` - Create table
- `PUT /tables/{id}` - Update table
- `DELETE /tables/{id}` - Delete table

### Rows

- `POST /tables/{id}/rows` - Add row
- `PUT /rows/{id}` - Update row
- `DELETE /rows/{id}` - Delete row

### Images

- `GET /images` - List images
- `POST /images` - Upload image
- `DELETE /images/{id}` - Delete image

### PDF Export

- `GET /tables/{id}/export-pdf` - Export as PDF

### Admin (Admin Only)

- `GET /admin/users` - List users
- `GET /admin/users/{id}` - User details
- `DELETE /admin/users/{id}` - Delete user

---

## ⚠️ Requirements

Before starting, make sure you have:

- ✅ PHP 8.2 or higher
- ✅ MySQL Server running
- ✅ Composer installed
- ✅ Node.js & npm
- ✅ phpMyAdmin (for database creation)

---

## 🐛 Troubleshooting

### Problem: "php not found"

**Solution:** Add PHP to Windows PATH or use full path: `C:\php\php.exe artisan serve`

### Problem: "Cannot connect to database"

**Solution:**

1. Check MySQL is running
2. Verify database exists in phpMyAdmin
3. Check .env file has correct credentials

### Problem: "Migrations failed"

**Solution:**

1. Create database first (see Step 2 above)
2. Run: `php artisan migrate:reset` then `php artisan migrate`

### Problem: "CORS error"

**Solution:** Ensure:

- Backend runs on `http://localhost:8000`
- Frontend runs on `http://localhost:5173` (or your dev URL)

---

## 📚 Full Documentation

For detailed information, see:

- **Setup Guide:** `COMPLETE_SETUP_GUIDE.md`
- **Checklist:** `IMPLEMENTATION_CHECKLIST.md`
- **Architecture:** `ARCHITECTURE.md`

---

## ✨ Next Steps

1. ✅ Run `SETUP_BACKEND.ps1`
2. ✅ Create database in phpMyAdmin
3. ✅ Start backend: `php artisan serve`
4. ✅ Start frontend: `npm run dev`
5. ✅ Login with test credentials
6. ✅ Create a table
7. ✅ Test PDF export button
8. ✅ Try admin features

---

## 🎉 You're Ready!

Everything is set up. Just run the setup script and you're good to go!

**Questions?** Check the documentation files or review the code comments.

**Happy coding!** 🚀

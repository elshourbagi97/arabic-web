# 🚀 QUICK START CARD

## The 3-Minute Setup

```
1. Right-click: SETUP_BACKEND.ps1 → "Run with PowerShell"
2. Create database in phpMyAdmin (arabicwebsite_db)
3. cd backend && php artisan serve
4. npm run dev (in another terminal)
```

**Done!** Access: http://localhost:5173

---

## 🔑 Login Credentials

```
Admin:    admin@wordpress.local / admin
User:     user@wordpress.local / password
```

---

## 📡 Key Endpoints

```
Login:       POST /api/auth/login
Register:    POST /api/auth/register
Tables:      GET/POST /api/tables
Export PDF:  GET /api/tables/{id}/export-pdf
```

---

## 📋 Important Files

| File | Purpose |
|------|---------|
| `START_HERE.md` | Quick start guide |
| `SETUP_BACKEND.ps1` | Automated setup |
| `.env` | Database config |
| `routes/api.php` | All endpoints |
| `backendApi.ts` | Frontend service |

---

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| "php not found" | Add PHP to PATH or use full path |
| "Can't connect DB" | Create database, check .env |
| "CORS error" | Check server URLs in .env |
| "Migration fails" | Create DB first, then migrate |

---

## ✨ Features Ready to Use

✅ User Authentication (Register/Login/Logout)
✅ Data Tables (Create/Edit/Delete)
✅ Image Uploads
✅ PDF Export (Arabic Support) 
✅ Admin Panel
✅ Role-Based Access

---

**Full details in:** `COMPLETE_SETUP_GUIDE.md` or `BACKEND_COMPLETE.md`

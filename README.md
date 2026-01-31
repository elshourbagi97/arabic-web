# Full-Stack Project - Setup Guide

This document explains how to run the full-stack project (React frontend, Laravel backend, MySQL database accessed via phpMyAdmin). Follow the steps below to set up the environment, run development servers, import the database, and connect the frontend to the backend.

---

## Overview

- Frontend: React (Vite)
- Backend: Laravel (PHP)
- Database: MySQL (use phpMyAdmin for imports)

---

## System Requirements

- Git
- Node.js (recommended >= 16.x) and npm (or Yarn)
- PHP (recommended >= 8.0)
- Composer (latest stable)
- MySQL (recommended >= 5.7 / 8.x)
- phpMyAdmin (or any MySQL client)
- Optional: Docker/Docker Compose (if you prefer containers)

Make sure the PHP extensions required by Laravel are installed: `pdo`, `pdo_mysql`, `mbstring`, `openssl`, `json`, `tokenizer`, `xml`, `gd` (if using image processing).

---

## Backend (Laravel) — Setup and Run

1. Clone the repository and open a terminal:

```bash
git clone https://github.com/elshourbagi97/arabic-web.git
cd arabic-web/backend
```

2. Install PHP dependencies with Composer:

```bash
composer install
```

3. Create the environment file:

Windows PowerShell:

```powershell
copy .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

4. Edit `.env` to set your database credentials and other settings. Example MySQL section:

```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=laravel_app
DB_USERNAME=root
DB_PASSWORD=secret
```

5. Generate the application key:

```bash
php artisan key:generate
```

6. Run database migrations (creates tables). If you have seeders, run them too:

```bash
php artisan migrate
# optional: php artisan db:seed
```

7. Start the Laravel development server:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Your API will be available at `http://127.0.0.1:8000` (API endpoints often start with `/api`).

Notes:

- If you run into Composer memory issues on Windows, try increasing memory or use `COMPOSER_MEMORY_LIMIT=-1 composer install`.
- If you use Docker, follow the repository Docker instructions (if provided) or run a MySQL container and configure `.env` accordingly.

---

## Database Import via phpMyAdmin

If you have a SQL dump file (.sql) provided by the project, use phpMyAdmin to import it:

1. Open phpMyAdmin in your browser (example: `http://localhost:8080/phpmyadmin` or `http://localhost/phpmyadmin` depending on your setup).
2. Login with your MySQL username/password.
3. Create a new database with the name you set in `.env` (for example `laravel_app`).
4. Select the new database in phpMyAdmin, go to the `Import` tab.
5. Click `Choose file`, select the `.sql` file, leave default options, and click `Go`.

If the import is large, you may need to import via the MySQL CLI:

```bash
mysql -u root -p laravel_app < /path/to/dump.sql
```

After importing, verify tables are present and then run `php artisan migrate` only if migrations are required.

---

## Frontend (React / Vite) — Setup and Run

1. Open a new terminal and navigate to the frontend folder:

```bash
cd <repo-folder>/frontend
```

2. Install dependencies:

```bash
# npm (recommended)
npm install

# or yarn
yarn install
```

3. Configure the API base URL used by the frontend.

This project uses Vite environment variables. Edit the development value in `frontend/API_CONFIG.ts` or set `VITE_API_URL` in the frontend `.env` file.

Example in `frontend/API_CONFIG.ts` (development):

```ts
VITE_API_URL: "http://localhost:8000/api";
```

Or create `frontend/.env` with:

```
VITE_API_URL=http://localhost:8000/api
```

4. Start the development server (Vite):

```bash
npm run dev
# or
yarn dev
```

This should open the frontend at something like `http://localhost:5173`.

5. Build for production:

```bash
npm run build
# then preview or deploy the `dist` folder
npm run preview
```

---

## Connecting Frontend to Backend (API URL)

- The frontend reads `VITE_API_URL` (see `frontend/API_CONFIG.ts`). Set it to the backend URL plus `/api` if endpoints are under that prefix. Example:

```
VITE_API_URL=http://localhost:8000/api
```

- If you use the Laravel server above, point to `http://127.0.0.1:8000` or `http://localhost:8000`.
- If the frontend is served on a different origin (port), ensure CORS is enabled in Laravel (`config/cors.php`) and allowed origins include your frontend origin (e.g., `http://localhost:5173`). The repository includes CORS guidance in `frontend/API_CONFIG.ts`.

---

## Common Troubleshooting

- Laravel returns 500 or 503:
  - Check `storage/logs/laravel.log` for details.
  - Ensure required PHP extensions are installed.

- Database connection errors:
  - Verify `.env` DB credentials and that MySQL is running.
  - Ensure the database name exists (create via phpMyAdmin).

- Migrations fail with missing tables/columns:
  - Run `php artisan migrate` after setting `.env` correctly.
  - If you imported a dump, avoid re-running migrations that duplicate tables. Use `php artisan migrate:fresh --seed` only if you want to reset the DB.

- Composer install fails with memory issues (Windows):
  - Run: `php -d memory_limit=-1 composer install` or set `COMPOSER_MEMORY_LIMIT=-1`.

- npm install / build issues:
  - Delete `node_modules` and reinstall: `rm -rf node_modules package-lock.json && npm install` (on Windows use PowerShell `Remove-Item -Recurse node_modules`).

- CORS issues (blocked requests):
  - Make sure `config/cors.php` allows your frontend origin or use the proxy in `vite.config.ts` (see `frontend/API_CONFIG.ts`).

- Laravel environment changes not reflected:
  - Run `php artisan config:clear` and `php artisan cache:clear`.

- Permission issues storing files:
  - Run `php artisan storage:link` and ensure `storage` and `bootstrap/cache` are writable by the webserver user.

---

## Useful Commands Summary

Backend (from `/backend`):

```bash
composer install
cp .env.example .env    # or copy on Windows
php artisan key:generate
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

Frontend (from `/frontend`):

```bash
npm install
npm run dev
npm run build
```

Database (import via CLI):

```bash
mysql -u root -p laravel_app < dump.sql
```

---

## Questions / Next Steps

If you want, I can:

- Provide a sample `.env` file (redacting secrets) for both backend and frontend.
- Add a Docker Compose recipe to run the full stack locally.
- Verify a local run if you provide access to your development machine or CI details.

---

Thank you — follow the steps above and tell me which step you get stuck on; I can provide more screenshots or remote troubleshooting steps.

# Docker Compose for Laravel + Node PDF Service

This repo includes Docker configurations to run the Laravel backend and the Node PDF service (Puppeteer) together.

Quick start

1. Build and start services:

```bash
docker compose up --build -d
```

2. The Node PDF server will be available at `http://localhost:3001` and Laravel at `http://localhost:8000`.

3. To generate a PDF via the Node service:

```bash
curl -X POST http://localhost:3001/generate-pdf \
  -H "Content-Type: application/json" \
  -d @pdf-data.json --output output.pdf
```

Notes

- Set `PDF_API_KEY` env in a `.env` file or export it before running `docker compose` to require API key authentication.
- The `laravel` container runs `php artisan serve` for convenience — for production use you should replace with php-fpm + nginx.
- Puppeteer downloads Chromium during `npm install` inside the `pdf-server` image; this can increase build time and image size.

Integration tests

1. Run the pdf server or the whole stack:

```bash
docker compose up --build -d
# or for local only
npm run start-pdf-server
```

2. Run the included integration script (requires `jq` and `bash`):

```bash
bash scripts/integration-tests.sh
```

On Windows (PowerShell) you can run:

```powershell
pwsh scripts/integration-tests.ps1
# or
.\scripts\integration-tests.ps1
```

PM2 & log rotation

If you run the `pdf-server` under PM2, enable the `pm2-logrotate` module for rotated logs:

```bash
npx pm2 install pm2-logrotate
npx pm2 set pm2-logrotate:max_size 10M
npx pm2 set pm2-logrotate:retain 7
npx pm2 start ecosystem.config.js --only pdf-server
```

This repo's `ecosystem.config.js` configures `out_file` and `error_file` paths under `./logs`.

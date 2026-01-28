# Arabic Web App UI Design

This is a code bundle for Arabic Web App UI Design. The original project is available at https://www.figma.com/design/6ZyN0mFCx3TFHJcQUEtOvK/Arabic-Web-App-UI-Design.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Backend / Deployment Notes (Netlify + Backend)

- Do NOT hardcode transient ngrok tunnels in the frontend. Instead set the environment variable
  `VITE_API_URL` in Netlify to the stable backend URL (include `/api`). Example:

  Key: `VITE_API_URL`
  Value: `https://your-backend.example.com/api`

- For local development you can use the `.env.example` file as a starting point.

- If your backend is hosted on Laravel, add or update `backend/config/cors.php` to allow
  your Netlify origin (for example `https://statuesque-kangaroo-5f4b87.netlify.app`) or set
  `ALLOWED_ORIGINS` in the backend environment. The project includes a `backend/config/cors.php`
  file that reads from `ALLOWED_ORIGINS`.

- For the Express PDF server (`scripts/pdf-server.js`), set the environment variable
  `ALLOWED_ORIGINS` (comma-separated) to include your Netlify origin and any local origins.

- Restart servers after changing environment variables.

Example Netlify environment variables:

- `VITE_API_URL` = `https://your-backend.example.com/api`

Example backend `.env` entries:

ALLOWED_ORIGINS="https://statuesque-kangaroo-5f4b87.netlify.app,http://localhost:5175"

## Build & CI notes

- Local production build:

```bash
npm install
npm run build
npm run preview   # serve the production build locally
```

- Netlify: ensure `VITE_API_URL` is set in Site settings → Build & deploy → Environment
- CI: Use `npm run build` in your pipeline and publish the `dist` folder to your host

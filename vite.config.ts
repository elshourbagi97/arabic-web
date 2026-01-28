import { defineConfig } from "vite";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Proxy API calls to a backend target. Default to localhost for development.
      // Do NOT hardcode transient ngrok tunnels here. Set the environment
      // variable `BACKEND_PROXY_TARGET` when you need to proxy to a remote
      // address for testing.
      "/api": {
        target: process.env.BACKEND_PROXY_TARGET || "http://localhost:8000",
        changeOrigin: true,
        secure: false,
        rewrite: (path: string): string => path.replace(/^\/api/, "/api"),
      },
    },
  },
});
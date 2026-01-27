/**
 * CORS Configuration Guide for Frontend-Backend Communication
 * Add this to your Vite config for local development
 */

// File: vite.config.ts
export const viteCorsConfig = {
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path: string) => path.replace(/^\/api/, "/api"),
        secure: false,
      },
    },
  },
};

/**
 * Alternative: Update Laravel config/cors.php
 *
 * return [
 *   'paths' => ['api/*'],
 *   'allowed_methods' => ['*'],
 *   'allowed_origins' => ['http://localhost:5173', 'http://localhost:3000'],
 *   'allowed_origins_patterns' => [],
 *   'allowed_headers' => ['*'],
 *   'exposed_headers' => [],
 *   'max_age' => 0,
 *   'supports_credentials' => true,
 * ];
 */

/**
 * Environment Configuration
 *
 * Add to .env files:
 */

export const envConfig = {
  development: {
    VITE_API_URL: "http://localhost:8000/api",
    VITE_APP_NAME: "Arabic Website",
  },
  production: {
    VITE_API_URL: "https://yourdomain.com/api",
    VITE_APP_NAME: "Arabic Website",
  },
};

/**
 * Axios/Fetch Configuration for API Communication
 */

export const apiClientConfig = {
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest",
  },
  withCredentials: true,
};

/**
 * Important: Token Storage
 * Store JWT token in localStorage or sessionStorage
 *
 * localStorage.setItem('api_token', 'your_token_here');
 *
 * Include in every request:
 * Authorization: Bearer token
 */

/**
 * Common API Response Format
 */
export interface ApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

/**
 * Error Handling
 */
export const handleApiError = (error: any) => {
  if (error.response?.status === 401) {
    // Unauthorized - redirect to login
    localStorage.removeItem("api_token");
    window.location.href = "/login";
  } else if (error.response?.status === 403) {
    // Forbidden
    console.error("Access denied");
  } else if (error.response?.status === 422) {
    // Validation errors
    console.error("Validation error:", error.response.data.errors);
  } else if (error.response?.status === 500) {
    // Server error
    console.error("Server error:", error.response.data);
  }
};

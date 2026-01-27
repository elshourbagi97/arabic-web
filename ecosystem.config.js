/**
 * PM2 ecosystem file to run the PDF server
 */
module.exports = {
  apps: [
    {
      name: "pdf-server",
      script: "scripts/pdf-server.js",
      exec_mode: "fork",
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      // Log files and rotation-friendly settings
      error_file: "./logs/pdf-server-error.log",
      out_file: "./logs/pdf-server-out.log",
      log_date_format: "YYYY-MM-DD HH:mm Z",
      max_restarts: 5,
      max_memory_restart: "512M",
    },
  ],
};

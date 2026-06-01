import { defineConfig } from "vite";
import settings from "../settings.json";

// Prod grid URL. The proxy strips the `/api` prefix and rewrites the path
// to the versioned API channel. Credentials are entered manually in the UI
// — never embedded here.
const PROD_GRID_URL = "https://api.lightspark.com";

export default defineConfig({
  server: {
    port: settings.gridGlobalAccountsExampleApp.port,
    proxy: {
      "/api": {
        target: PROD_GRID_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/grid/2025-10-13"),
      },
    },
  },
});

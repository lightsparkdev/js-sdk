import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import settings from "../settings.json";

// Grid API base for the dev proxy (strips the `/api` prefix and rewrites the
// path to the versioned API channel). Defaults to production; override locally
// for a dev backend via the GRID_URL env var, e.g.
//   GRID_URL=https://api.dev.dev.sparkinfra.net yarn dev
// Credentials are entered manually in the UI — never embedded here.
const PROD_GRID_URL = process.env.GRID_URL ?? "https://api.lightspark.com";

export default defineConfig({
  plugins: [react()],
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

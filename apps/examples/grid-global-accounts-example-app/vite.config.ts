import react from "@vitejs/plugin-react";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import settings from "../settings.json";
import { DEV_GRID_URL, isProductionGridUrl } from "./src/grid-url";

// Grid API base for the dev proxy (strips the `/api` prefix and rewrites the
// path to the versioned API channel). Defaults to the dev environment so
// testing never creates real customers by accident. Production requires an
// explicit opt-in:
//   GRID_URL=https://api.lightspark.com yarn dev
// Credentials are entered manually in the UI — never embedded here.
const GRID_URL = process.env.GRID_URL ?? DEV_GRID_URL;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@solana-program/system": fileURLToPath(
        new URL("./src/stubs/solana-program-system.ts", import.meta.url),
      ),
    },
  },
  define: {
    __GRID_IS_PRODUCTION__: JSON.stringify(isProductionGridUrl(GRID_URL)),
  },
  build: {
    /* Lightning CSS mangles @font-face unicode-range values; see the pin in
       @lightsparkdev/vite buildConfig. */
    cssMinify: "esbuild",
  },
  server: {
    port: settings.gridGlobalAccountsExampleApp.port,
    proxy: {
      "/api": {
        target: GRID_URL,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, "/grid/2025-10-13"),
      },
    },
  },
});

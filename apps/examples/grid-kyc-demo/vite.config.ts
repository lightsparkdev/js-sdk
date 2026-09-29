import react from "@vitejs/plugin-react";
import { defineConfig, type ProxyOptions } from "vite";
import settings from "../settings.json";

const devApiUrl = process.env.GRID_DEV_API_URL?.trim();
const ENVS = {
  prod: "https://api.lightspark.com/grid/2025-10-13",
  dev: devApiUrl,
  local: "http://localhost:5000/grid/rc",
} as const;

export default defineConfig({
  plugins: [
    react(),
    {
      name: "require-development-api",
      configureServer(server) {
        if (devApiUrl) return;
        server.middlewares.use("/api/dev", (_req, res) => {
          res.statusCode = 503;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: "Set GRID_DEV_API_URL and restart the development server.",
            }),
          );
        });
      },
    },
  ],
  build: {
    /* Lightning CSS mangles @font-face unicode-range values; see the pin in
       @lightsparkdev/vite buildConfig. */
    cssMinify: "esbuild",
  },
  server: {
    port: settings.gridKycDemo.port,
    proxy: Object.fromEntries(
      Object.entries(ENVS).flatMap(([name, apiUrl]) => {
        if (!apiUrl) return [];
        const target = new URL(apiUrl);
        if (
          !["http:", "https:"].includes(target.protocol) ||
          target.username ||
          target.password ||
          target.search ||
          target.hash
        ) {
          throw new Error(
            "Grid API URLs must use HTTP(S) without credentials, query parameters, or fragments.",
          );
        }
        const prefix = `/api/${name}`;
        const apiPath = target.pathname.replace(/\/$/, "");
        const options: ProxyOptions = {
          target: target.origin,
          changeOrigin: true,
          secure: target.protocol === "https:",
          rewrite: (path: string) =>
            path.replace(new RegExp(`^${prefix}`), apiPath),
          // Localhost cookies from other apps can exceed the API's header limit.
          configure: (proxy) => {
            proxy.on("proxyReq", (proxyReq) => {
              proxyReq.removeHeader("cookie");
            });
          },
        };
        return [[`^${prefix}(?:/|\\?|$)`, options]];
      }),
    ),
  },
});

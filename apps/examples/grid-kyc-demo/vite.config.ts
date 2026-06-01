import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import settings from "../settings.json";

// One proxy entry per env so the UI can switch between them at runtime
// without restarting vite. Each rewrites the local prefix to the
// versioned grid API path on the upstream host.
const ENVS = {
  prod: {
    prefix: "/api/prod",
    target: "https://api.lightspark.com",
    apiPath: "/grid/2025-10-13",
    secure: true,
  },
  dev: {
    prefix: "/api/dev",
    target: "https://api.dev.dev.sparkinfra.net",
    apiPath: "/grid/rc",
    secure: true,
  },
  local: {
    prefix: "/api/local",
    target: "http://localhost:5000",
    apiPath: "/grid/rc",
    secure: false,
  },
} as const;

export default defineConfig({
  plugins: [react()],
  server: {
    port: settings.gridKycDemo.port,
    proxy: Object.fromEntries(
      Object.values(ENVS).map((env) => [
        env.prefix,
        {
          target: env.target,
          changeOrigin: true,
          secure: env.secure,
          rewrite: (path: string) =>
            path.replace(new RegExp(`^${env.prefix}`), env.apiPath),
        },
      ]),
    ),
  },
});

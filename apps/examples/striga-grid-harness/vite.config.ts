import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import settings from "../settings.json";

// The harness seed script (sparkcore/scripts/striga_harness/seed.py) writes
// .grid-creds.json next to itself. The dev server reads it to (a) serve
// /harness/creds to the UI and (b) inject HTTP Basic auth on the proxied
// /grid/* requests — the two jobs the old stdlib proxy.py used to do.
const HERE = path.dirname(fileURLToPath(import.meta.url));
const CREDS_PATH = path.resolve(
  HERE,
  "../../../../sparkcore/scripts/striga_harness/.grid-creds.json",
);

interface HarnessCreds {
  base_url?: string;
  basic_auth?: string;
  [key: string]: unknown;
}

// Read + parse fresh on each call so a re-seed is picked up without a restart.
function loadCreds(): HarnessCreds & { error?: string } {
  try {
    return JSON.parse(readFileSync(CREDS_PATH, "utf8")) as HarnessCreds;
  } catch (err) {
    return { error: `Could not read .grid-creds.json: ${(err as Error).message}` };
  }
}

function gridServerOrigin(): string {
  if (process.env.GRID_SERVER) return process.env.GRID_SERVER;
  const base = loadCreds().base_url;
  if (base) {
    try {
      return new URL(base).origin;
    } catch {
      // fall through to default
    }
  }
  return "http://localhost:5000";
}

// Credential fields the browser never needs — the proxy injects auth
// server-side, so these stay out of the /harness/creds response.
const SECRET_CREDS_FIELDS = ["basic_auth", "client_id", "client_secret"];

// Serves GET /harness/creds (secrets stripped) — the UI uses it to prefill
// display ids/accounts only.
function harnessCredsPlugin(): Plugin {
  return {
    name: "striga-harness-creds",
    configureServer(server) {
      server.middlewares.use("/harness/creds", (_req, res) => {
        const creds = loadCreds();
        for (const field of SECRET_CREDS_FIELDS) delete creds[field];
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(creds));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), harnessCredsPlugin()],
  server: {
    port: settings.strigaGridHarness.port,
    proxy: {
      // Forward /grid/* to the local Grid server, injecting Basic auth from
      // .grid-creds.json so the browser never handles credentials.
      "/grid": {
        target: gridServerOrigin(),
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            const auth = loadCreds().basic_auth;
            if (auth) proxyReq.setHeader("Authorization", `Basic ${auth}`);
          });
        },
      },
    },
  },
});

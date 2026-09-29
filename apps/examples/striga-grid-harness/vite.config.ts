import { homedir } from "node:os";
import path from "node:path";

import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import settings from "../settings.json";
import {
  applyCredsPatch,
  fileCredsStore,
  publicCreds,
  rejectForeignSave,
  type HarnessCreds,
} from "./harnessCreds";

// Keep default credentials outside the source tree to avoid accidental commits.
const CREDS_PATH =
  process.env.GRID_HARNESS_CREDS_FILE ??
  path.join(homedir(), ".config", "lightspark", "striga-grid-harness.json");

const credsStore = fileCredsStore(CREDS_PATH);

function readJsonBody(
  req: import("node:http").IncomingMessage,
): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(new Error(`Body is not valid JSON: ${(err as Error).message}`));
      }
    });
    req.on("error", reject);
  });
}

function gridServerOrigin(): string {
  if (process.env.GRID_SERVER) return process.env.GRID_SERVER;
  const base = credsStore.read().base_url;
  if (base) {
    try {
      return new URL(base).origin;
    } catch {
      // fall through to default
    }
  }
  return "http://localhost:5000";
}

// The origin the /grid proxy was built with. Captured once because Vite fixes the
// proxy target at startup; the guard below compares the live config against it.
const STARTUP_GRID_TARGET = gridServerOrigin();

// Refuse to proxy when the configured target no longer matches the one the proxy
// was started with. Without this a settings save pointing at dev or prod would be
// silently served by the previous environment — the requests would look like they
// succeeded against the new target. Registered in configureServer so it runs ahead
// of Vite's proxy middleware.
function gridTargetGuardPlugin(): Plugin {
  return {
    name: "striga-harness-grid-target-guard",
    configureServer(server) {
      server.middlewares.use("/grid", (_req, res, next) => {
        const configured = gridServerOrigin();
        if (configured === STARTUP_GRID_TARGET) {
          next();
          return;
        }
        res.statusCode = 409;
        res.setHeader("Content-Type", "application/json");
        res.end(
          JSON.stringify({
            error:
              `The harness is configured for ${configured} but this dev server is ` +
              `proxying to ${STARTUP_GRID_TARGET}. Restart the dev server to pick ` +
              `up the new target — requests are blocked until then so they cannot ` +
              `hit the wrong environment.`,
          }),
        );
      });
    },
  };
}

// Serves GET /harness/creds (secrets stripped) for display/prefill, and
// POST /harness/creds to save a connection or customer selection. The POST
// merges into the existing file so saving a customer does not clear the
// credentials, and vice versa.
function harnessCredsPlugin(): Plugin {
  return {
    name: "striga-harness-creds",
    configureServer(server) {
      server.middlewares.use("/harness/creds", (req, res) => {
        const sendJson = (status: number, payload: unknown) => {
          res.statusCode = status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(payload));
        };

        if (req.method === "POST") {
          const refusal = rejectForeignSave({
            contentType: req.headers["content-type"],
            origin: req.headers.origin,
            host: req.headers.host,
          });
          if (refusal) {
            sendJson(refusal.status, refusal.body);
            return;
          }
          void (async () => {
            try {
              const patch = (await readJsonBody(req)) as HarnessCreds;
              const { status, body } = await applyCredsPatch(patch, credsStore);
              sendJson(status, body);
            } catch (err) {
              sendJson(400, { error: (err as Error).message });
            }
          })();
          return;
        }

        sendJson(200, publicCreds(credsStore.read()));
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), gridTargetGuardPlugin(), harnessCredsPlugin()],
  build: {
    /* Lightning CSS mangles @font-face unicode-range values; see the pin in
       @lightsparkdev/vite buildConfig. */
    cssMinify: "esbuild",
  },
  server: {
    port: settings.strigaGridHarness.port,
    proxy: {
      // Inject stored credentials server-side to keep them out of the browser.
      "/grid": {
        // Vite bakes this into the proxy instance at startup, so the target cannot
        // be changed per request (mutating the options `bypass` receives has no
        // effect — verified). Changing environments therefore needs a dev-server
        // restart, and gridTargetGuardPlugin blocks requests until then rather
        // than letting them land on the previous environment.
        target: STARTUP_GRID_TARGET,
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            const auth = credsStore.read().basic_auth;
            if (auth) proxyReq.setHeader("Authorization", `Basic ${auth}`);
          });
        },
      },
    },
  },
});

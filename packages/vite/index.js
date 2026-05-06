import react from "@vitejs/plugin-react";
import childProcess from "child_process";
import fs from "fs";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import svgr from "vite-plugin-svgr";

const currentCommit = childProcess
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .substr(0, 8);

const basename = process.env.VITE_BASENAME || "/";
const packageDir = path.dirname(fileURLToPath(import.meta.url));
const jsRoot = path.resolve(packageDir, "../..");
const devProxyCookiesScript = path.join(
  jsRoot,
  "apps/private/scripts/dev-proxy-cookies.mjs",
);

export const buildConfig = ({
  port = 3000,
  base = basename,
  dirname,
  rolldownOptions,
  chunks = { "/node_modules/": "vendor" },
  proxyTarget = "http://127.0.0.1:5000",
  preview = {},
}) => {
  /* Remote proxy support: when VITE_PROXY_TARGET points to a deployed environment
     (e.g. dev.dev.sparkinfra.net), the ALB requires session cookies to pass through.
     Cookies can be provided via:
       1. VITE_PROXY_COOKIE_FILE - path to a file containing cookie key=value pairs (recommended)
       2. VITE_PROXY_COOKIES - inline cookie string (fallback)
     The cookie file is re-read on each request so you can refresh cookies without restarting. */
  const proxyCookieFile = process.env.VITE_PROXY_COOKIE_FILE || "";
  const inlineProxyCookies = process.env.VITE_PROXY_COOKIES || "";
  const shouldAutoRefreshProxyCookies =
    process.env.VITE_PROXY_AUTO_REFRESH_COOKIES !== "0";
  let refreshProxyCookiesPromise = null;

  function readProxyCookies() {
    if (proxyCookieFile) {
      try {
        const content = fs.readFileSync(proxyCookieFile, "utf-8").trim();
        /* Support both "key=value" per line and inline "key=value; key=value" formats */
        return content
          .split("\n")
          .map((line) => line.trim())
          .filter((line) => line && !line.startsWith("#"))
          .join("; ");
      } catch (e) {
        if (!readProxyCookies._warned) {
          console.warn(
            `[vite] Cannot read cookie file ${proxyCookieFile}: ${e.message}`,
          );
          readProxyCookies._warned = true;
        }
        return "";
      }
    }
    return inlineProxyCookies;
  }

  /* Remote proxy mode only activates for known deployed environments behind
     the ALB/Cognito auth wall. Add new domains here as needed. */
  const remoteProxyDomains = [
    "dev.dev.sparkinfra.net",
    "app.money.dev.dev.sparkinfra.net",
  ];
  const isRemoteProxy = remoteProxyDomains.some((domain) =>
    proxyTarget.includes(domain),
  );

  if (isRemoteProxy) {
    const cookieSource = proxyCookieFile
      ? `cookies from ${proxyCookieFile}`
      : inlineProxyCookies
      ? "cookies from VITE_PROXY_COOKIES env"
      : "no cookies configured";
    console.log(`[vite] Remote proxy to ${proxyTarget} (${cookieSource})`);
  }

  function refreshProxyCookies(reason) {
    if (!proxyCookieFile) {
      console.warn(
        `[vite] ${reason}. Cannot auto-refresh because VITE_PROXY_COOKIE_FILE is not set.`,
      );
      return false;
    }
    if (!shouldAutoRefreshProxyCookies) {
      console.warn(
        `[vite] ${reason}. Auto-refresh is disabled by VITE_PROXY_AUTO_REFRESH_COOKIES=0.`,
      );
      return false;
    }
    if (refreshProxyCookiesPromise) {
      console.log("[vite] Dev proxy cookie refresh is already in progress.");
      return true;
    }
    if (!fs.existsSync(devProxyCookiesScript)) {
      console.warn(
        `[vite] ${reason}. Cannot find cookie refresh script at ${devProxyCookiesScript}.`,
      );
      return false;
    }

    try {
      fs.rmSync(proxyCookieFile, { force: true });
    } catch (e) {
      console.warn(`[vite] Could not clear ${proxyCookieFile}: ${e.message}`);
    }

    console.log(`[vite] ${reason}. Launching Cognito auth flow...`);

    const child = childProcess.spawn(
      process.execPath,
      [devProxyCookiesScript, proxyTarget, proxyCookieFile],
      {
        cwd: jsRoot,
        env: {
          ...process.env,
          VITE_PROXY_COOKIE_FILE: proxyCookieFile,
        },
        stdio: "inherit",
      },
    );

    refreshProxyCookiesPromise = new Promise((resolve) => {
      child.on("error", (err) => {
        console.warn(
          `[vite] Failed to launch Cognito auth flow: ${err.message}`,
        );
        refreshProxyCookiesPromise = null;
        resolve(false);
      });
      child.on("close", (code) => {
        if (code === 0) {
          console.log("[vite] Dev proxy cookies refreshed.");
        } else {
          console.warn(`[vite] Cognito auth flow exited with code ${code}.`);
        }
        refreshProxyCookiesPromise = null;
        resolve(code === 0);
      });
    });

    return true;
  }

  function rewriteSetCookieHeaders(headers) {
    const setCookie = headers["set-cookie"];
    if (setCookie) {
      const cookies = Array.isArray(setCookie) ? setCookie : [setCookie];
      headers["set-cookie"] = cookies.map((cookie) =>
        cookie
          .replace(/;\s*Domain=[^;]*/gi, "")
          .replace(/;\s*Secure/gi, "")
          .replace(/;\s*SameSite=\w+/gi, "; SameSite=Lax"),
      );
    }
  }

  function sendJson(res, statusCode, body) {
    const json = JSON.stringify(body);
    res.writeHead(statusCode, {
      "content-type": "application/json",
      "content-length": Buffer.byteLength(json),
    });
    res.end(json);
  }

  function hasAlbGeneratedHtmlErrorHeaders(proxyRes) {
    const server = proxyRes.headers.server || "";
    const contentType = proxyRes.headers["content-type"] || "";
    return (
      proxyRes.statusCode === 500 &&
      server.includes("awselb") &&
      contentType.includes("text/html")
    );
  }

  function isAlbGeneratedHtmlError(body) {
    return (
      body.includes("<title>500 Internal Server Error</title>") &&
      body.includes("<center><h1>500 Internal Server Error</h1></center>") &&
      body.includes("padding to disable MSIE and Chrome friendly error page")
    );
  }

  function cookieNames(cookieHeader) {
    return new Set(
      cookieHeader
        .split(";")
        .map((cookie) => cookie.trim().split("=")[0])
        .filter(Boolean),
    );
  }

  function removeCookiesByName(cookieHeader, namesToRemove) {
    return cookieHeader
      .split(";")
      .map((cookie) => cookie.trim())
      .filter((cookie) => cookie && !namesToRemove.has(cookie.split("=")[0]))
      .join("; ");
  }

  function devProxyAuthMessage(refreshStarted) {
    return refreshStarted
      ? "Your local dev proxy session expired. Complete the Cognito login window that just opened, then return here and try again."
      : "Your local dev proxy session expired. Stop this dev server, run start:dev again, complete the Cognito login prompt, then try again.";
  }

  function configureProxy(proxy) {
    if (!isRemoteProxy) return;
    /* Merge ALB cookies with browser cookies on outgoing requests.
       Browser cookies with the same names as proxy file cookies are removed so
       refreshed ALB cookies do not depend on duplicate-cookie precedence. */
    proxy.on("proxyReq", (proxyReq, req) => {
      const proxyCookies = readProxyCookies();
      if (proxyCookies) {
        const browserCookies = req.headers.cookie || "";
        const filteredBrowserCookies = removeCookiesByName(
          browserCookies,
          cookieNames(proxyCookies),
        );
        const merged = [filteredBrowserCookies, proxyCookies]
          .filter(Boolean)
          .join("; ");
        proxyReq.setHeader("cookie", merged);
      }
    });
    proxy.on("proxyRes", (proxyRes, req, res) => {
      /* Intercept ALB 302 redirects to Cognito — return 401 instead so the
         browser doesn't try to follow a cross-origin redirect (which causes CORS errors) */
      const location = proxyRes.headers.location || "";
      if (
        proxyRes.statusCode === 302 &&
        location.includes("amazoncognito.com")
      ) {
        const refreshStarted = refreshProxyCookies(
          `ALB redirected ${req.url} to Cognito, so dev proxy cookies are stale`,
        );
        /* Consume the original response body so the socket isn't left hanging */
        proxyRes.resume();
        sendJson(res, 401, {
          errors: [
            {
              message: devProxyAuthMessage(refreshStarted),
            },
          ],
        });
        return;
      }

      if (hasAlbGeneratedHtmlErrorHeaders(proxyRes)) {
        const chunks = [];
        proxyRes.on("data", (chunk) => chunks.push(chunk));
        proxyRes.on("end", () => {
          const body = Buffer.concat(chunks);
          if (isAlbGeneratedHtmlError(body.toString("utf8"))) {
            const refreshStarted = refreshProxyCookies(
              `ALB returned an HTML 500 for ${req.url}, so dev proxy cookies may be stale`,
            );
            sendJson(res, 401, {
              errors: [
                {
                  message: devProxyAuthMessage(refreshStarted),
                },
              ],
            });
            return;
          }

          rewriteSetCookieHeaders(proxyRes.headers);
          res.writeHead(
            proxyRes.statusCode || 500,
            proxyRes.statusMessage,
            proxyRes.headers,
          );
          res.end(body);
        });
        return;
      }

      /* Rewrite Set-Cookie headers on responses so the browser stores them for localhost */
      rewriteSetCookieHeaders(proxyRes.headers);
      res.writeHead(
        proxyRes.statusCode || 500,
        proxyRes.statusMessage,
        proxyRes.headers,
      );
      proxyRes.pipe(res);
    });
  }

  function proxyOptions({ target = proxyTarget, ws = false } = {}) {
    return {
      target,
      changeOrigin: true,
      ...(ws ? { ws: true } : {}),
      ...(isRemoteProxy ? { selfHandleResponse: true } : {}),
      configure: configureProxy,
    };
  }

  function manualChunks(id) {
    for (const [path, name] of Object.entries(chunks)) {
      if (id.includes(path)) {
        return name;
      }
    }
  }

  return defineConfig({
    base,
    define: {
      __CURRENT_COMMIT__: `"${currentCommit}"`,
      __BASENAME__: `"${basename}"`,
    },
    plugins: [
      {
        name: "html-transform",
        transformIndexHtml(html) {
          return html.replace(/__CURRENT_COMMIT__/g, currentCommit);
        },
      },
      {
        /* prismjs language components are IIFEs that reference a bare `Prism`
           global (e.g. `}(Prism)`). Rolldown's lazy CJS evaluation means the
           main prismjs module hasn't set window.Prism yet when these IIFEs
           execute at the chunk top level. Adding an explicit import turns each
           component file into a proper module with a dependency edge, so
           Rolldown evaluates prismjs first and `Prism` resolves correctly. */
        name: "fix-prismjs-components",
        transform(code, id) {
          if (
            id.includes("prismjs/components/prism-") &&
            !id.includes("prism-core")
          ) {
            return {
              code: `import Prism from "prismjs";\n${code}`,
              map: null,
            };
          }
        },
      },
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      /* vite-plugin-svgr v4 changed the default include to "**\/*.svg?react".
         We use "**\/*.svg" to treat all bare SVG imports as React components
         (the v3 default). Use ?url suffix for URL-only SVG imports. */
      svgr({
        include: "**/*.svg",
      }),
      visualizer(),
    ],
    server: {
      port,
      open: false,
      host: "0.0.0.0",
      proxy: {
        "/graphql/internal": proxyOptions({ ws: true }),
        "/graphql/custody": proxyOptions({ ws: true }),
        "/graphql/frontend": proxyOptions({ ws: true }),
        "/umame/graphql": proxyOptions({ ws: true }),
        "/graphql/bridge": proxyOptions({ ws: true }),
        "^/umaauth/.*": proxyOptions(),
        "/ui/logs": proxyOptions(),
        "/ui/event": proxyOptions(),
        "/grid-dashboard-api": proxyOptions(),
        "/graphql/paycore-internal": proxyOptions({
          target:
            proxyTarget === "http://127.0.0.1:5000"
              ? "http://127.0.0.1:5001"
              : proxyTarget,
        }),
      },
    },
    /* see https://bit.ly/3EOx5ZM - workspace deps that need to be commonjs like @lightsparkdev/crypto-wasm
       are not prebundled so imports don't work without additional overrides: */
    optimizeDeps: {
      include: ["@lightsparkdev/crypto-wasm"],
    },
    build: {
      rolldownOptions: {
        ...rolldownOptions,
        output: { manualChunks, ...rolldownOptions?.output },
      },
      assetsDir: "static",
    },
    resolve: {
      alias: {
        src: path.resolve(dirname, "./src"),
      },
    },
    preview,
  });
};

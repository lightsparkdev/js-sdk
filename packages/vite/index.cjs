const react = require("@vitejs/plugin-react").default;
const childProcess = require("child_process");
const fs = require("fs");
const path = require("path");
const { defineConfig } = require("vite");
const svgr = require("vite-plugin-svgr").default;
const { visualizer } = require("rollup-plugin-visualizer");

const currentCommit = childProcess
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .substr(0, 8);

const basename = process.env.VITE_BASENAME || "/";

module.exports.buildConfig = ({
  port = 3000,
  base = basename,
  dirname,
  rollupOptions,
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
          console.warn(`[vite] Cannot read cookie file ${proxyCookieFile}: ${e.message}`);
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

  function configureProxy(proxy) {
    if (!isRemoteProxy) return;
    /* Merge ALB cookies with browser cookies on outgoing requests.
       Proxy file cookies come first so refreshed ALB cookies take
       precedence over stale browser copies of the same cookie name. */
    proxy.on("proxyReq", (proxyReq, req) => {
      const proxyCookies = readProxyCookies();
      if (proxyCookies) {
        const browserCookies = req.headers.cookie || "";
        const merged = [proxyCookies, browserCookies]
          .filter(Boolean)
          .join("; ");
        proxyReq.setHeader("cookie", merged);
      }
    });
    proxy.on("proxyRes", (proxyRes, req, res) => {
      /* Intercept ALB 302 redirects to Cognito — return 401 instead so the
         browser doesn't try to follow a cross-origin redirect (which causes CORS errors) */
      const location = proxyRes.headers.location || "";
      if (proxyRes.statusCode === 302 && location.includes("amazoncognito.com")) {
        console.log(
          `[vite] ALB redirected to Cognito (cookies expired?) — returning 401 for ${req.url}`,
        );
        /* Consume the original response body so the socket isn't left hanging */
        proxyRes.resume();
        res.writeHead(401, { "content-type": "application/json" });
        res.end(
          JSON.stringify({
            errors: [
              {
                message:
                  "ALB session expired. Refresh dev proxy cookies and restart.",
              },
            ],
          }),
        );
        return;
      }
      /* Rewrite Set-Cookie headers on responses so the browser stores them for localhost */
      const setCookie = proxyRes.headers["set-cookie"];
      if (setCookie) {
        proxyRes.headers["set-cookie"] = setCookie.map((cookie) =>
          cookie
            .replace(/;\s*Domain=[^;]*/gi, "")
            .replace(/;\s*Secure/gi, "")
            .replace(/;\s*SameSite=\w+/gi, "; SameSite=Lax"),
        );
      }
    });
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
      react({
        jsxImportSource: "@emotion/react",
        babel: {
          plugins: ["@emotion/babel-plugin"],
        },
      }),
      svgr({
        exportAsDefault: true,
      }),
      visualizer(),
    ],
    server: {
      port,
      open: false,
      host: "0.0.0.0",
      proxy: {
        "/graphql/internal": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          configure: configureProxy,
        },
        "/graphql/custody": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          configure: configureProxy,
        },
        "/graphql/frontend": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          configure: configureProxy,
        },
        "/umame/graphql": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          configure: configureProxy,
        },
        "/graphql/bridge": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
          configure: configureProxy,
        },
        "^/umaauth/.*": {
          target: proxyTarget,
          changeOrigin: true,
          configure: configureProxy,
        },
        "/ui/logs": {
          target: proxyTarget,
          changeOrigin: true,
          configure: configureProxy,
        },
        "/ui/event": {
          target: proxyTarget,
          changeOrigin: true,
          configure: configureProxy,
        },
        "/grid-dashboard-api": {
          target: proxyTarget,
          changeOrigin: true,
          configure: configureProxy,
        },
        "/graphql/paycore-internal": {
          target:
            proxyTarget === "http://127.0.0.1:5000"
              ? "http://127.0.0.1:5001"
              : proxyTarget,
          changeOrigin: true,
          configure: configureProxy,
        },
      },
    },
    /* see https://bit.ly/3EOx5ZM - workspace deps that need to be commonjs like @lightsparkdev/crypto-wasm
       are not prebundled so imports don't work without additional overrides: */
    optimizeDeps: {
      include: ["@lightsparkdev/crypto-wasm"],
    },
    build: {
      rollupOptions: { output: { manualChunks }, ...rollupOptions },
      assetsDir: "static",
      commonjsOptions: {
        include: [/@lightsparkdev\/crypto-wasm/, /node_modules/],
      },
    },
    resolve: {
      alias: {
        src: path.resolve(dirname, "./src"),
      },
    },
    preview,
  });
};

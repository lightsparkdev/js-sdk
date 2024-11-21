const react = require("@vitejs/plugin-react").default;
const childProcess = require("child_process");
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
}) => {
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
        },
        "/graphql/custody": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
        "/graphql/frontend": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
        "/umame/graphql": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
        "/graphql/bridge": {
          target: proxyTarget,
          changeOrigin: true,
          ws: true,
        },
        "/ui/logs": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/ui/event": {
          target: proxyTarget,
          changeOrigin: true,
        },
        "/graphql/paycore-internal": {
          target:
            proxyTarget === "http://127.0.0.1:5000"
              ? "http://127.0.0.1:5001"
              : proxyTarget,
          changeOrigin: true,
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
  });
};

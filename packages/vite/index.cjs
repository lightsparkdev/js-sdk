const react = require("@vitejs/plugin-react").default;
const childProcess = require("child_process");
const path = require("path");
const { defineConfig } = require("vite");
const svgr = require("vite-plugin-svgr").default;

const currentCommit = childProcess
  .execSync("git rev-parse HEAD")
  .toString()
  .trim()
  .substr(0, 8);

module.exports.buildConfig = ({
  port = 3000,
  base = "/",
  dirname,
  rollupOptions,
}) =>
  defineConfig({
    base,
    define: {
      __CURRENT_COMMIT__: `"${currentCommit}"`,
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
    ],
    server: {
      port,
      host: "0.0.0.0",
      proxy: {
        "/graphql/internal": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          ws: true,
        },
        "/graphql/frontend": {
          target: "http://127.0.0.1:5000",
          changeOrigin: true,
          ws: true,
        },
        "/clientlogs": {
          target: "http://127.0.0.1:5000",
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
      rollupOptions,
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

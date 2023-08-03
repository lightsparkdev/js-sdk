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

module.exports.buildConfig = ({ port = 3000, base = "/", dirname }) =>
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
        svgrOptions: {},
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
    build: {
      assetsDir: "static",
    },
    resolve: {
      alias: {
        src: path.resolve(dirname, "./src"),
      },
    },
  });

const { whenDev } = require("@craco/craco");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  webpack: {
    plugins: {
      add: [
        new HtmlWebpackPlugin(
          Object.assign(
            {},
            {
              inject: true,
              template: "./public/index.html",
              excludeChunks: ["content", "background"],
            },
            whenDev(() => undefined, {
              minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
              },
            })
          )
        ),
      ],
      remove: ["HtmlWebpackPlugin"],
    },
    configure: (webpackConfig, { env, paths }) => {
      return {
        ...webpackConfig,
        resolve: {
          /* we have commonjs workspace dependencies like lightspark-crypto. if the dependencies are
             not in node_modules commonjs imports don't work. our deps are symlinked in node_modules
             but by default this resolves the exact path (outside node_modules) unless we set symlinks: false
             see https://webpack.js.org/configuration/resolve/#resolvesymlinks */
          symlinks: false,
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          fallback: {
            path: false,
            fs: false,
            util: false,
          },
        },
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          content: "./src/contentscript/content.ts",
          background: "./src/background/background.ts",
        },
        output: {
          ...webpackConfig.output,
          filename: "static/js/[name].js",
        },
        optimization: {
          ...webpackConfig.optimization,
          runtimeChunk: false,
        },
      };
    },
  },
};

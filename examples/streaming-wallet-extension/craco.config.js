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
        entry: {
          main: [
            env === "development" &&
              require.resolve("react-dev-utils/webpackHotDevClient"),
            paths.appIndexJs,
          ].filter(Boolean),
          content: "./src/contentscript/content.ts",
          background: "./src/background/background.ts",
        },
        resolve: {
          ...webpackConfig.resolve,
          fallback: {
            crypto: false,
          },
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

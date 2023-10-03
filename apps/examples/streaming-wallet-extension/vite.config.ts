import { buildConfig } from "@lightsparkdev/vite";

export default buildConfig({
  port: 3003,
  dirname: __dirname,
  rollupOptions: {
    input: {
      background: "/src/background/background.ts",
      content: "/src/contentscript/content.ts",
      app: "./index.html",
    },
    output: {
      entryFileNames: "static/js/[name].js",
      chunkFileNames: "static/js/[name]-[hash].js",
      assetFileNames: "static/[name].[ext]",
    },
  },
});

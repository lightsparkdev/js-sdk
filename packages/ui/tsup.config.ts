import { copy } from "esbuild-plugin-copy";
import svgr from "esbuild-plugin-svgr";
import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/**/*.ts(x)?",
    "src/hooks/**/*.ts(x)?",
    "src/icons/**/*.ts(x)?",
    "src/styles/**/*.ts(x)?",
    "src/types/**/*.ts(x)?",
    "src/utils/**/*.ts(x)?",
    "src/router.tsx",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  external: ["react", "react-dom", "react-router-dom", "react-router"],
  esbuildPlugins: [
    svgr(),
    copy({
      assets: {
        from: ["./src/static/**/*"],
        to: ["./static"],
      },
      watch: true,
    }),
  ],
  esbuildOptions(options, context) {
    options.assetNames = "[dir]/[name]";
  },
  loader: {
    ".css": "copy",
  },
});

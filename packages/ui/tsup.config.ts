import { copy } from "esbuild-plugin-copy";
import { defineConfig } from "tsup";
import { svgr } from "./esbuild-svgr-plugin";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/components/**/!(*.test).ts(x)?",
    "src/hooks/**/!(*.test).ts(x)?",
    "src/icons/**/*.ts(x)?",
    "src/styles/**/*.ts(x)?",
    "src/types/**/*.ts(x)?",
    "src/utils/**/!(*.test).ts?(x)",
    "src/router.tsx",
  ],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  /* splitting must be manually specified for cjs splitting support, which is experimental. See
     https://tsup.egoist.dev/#code-splitting. Without it the package size is 5x as large. Revisit
     if some environments are discovered to not fully support the cjs splitting methods: */
  splitting: true,
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

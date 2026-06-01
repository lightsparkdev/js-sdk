import { defineConfig } from "tsdown";
import { svgr } from "./tsdown-svg-plugin";

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
  fixedExtension: false,
  root: "src",
  copy: [
    "src/static",
    {
      from: "src/static/fonts/LightsparkIcons/*",
      to: "dist/styles/fonts/LightsparkIcons",
    },
  ],
  plugins: [svgr()],
  css: {
    inject: true,
    splitting: true,
  },
});

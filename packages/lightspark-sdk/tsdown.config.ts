import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/env.ts", "src/objects/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  fixedExtension: false,
});

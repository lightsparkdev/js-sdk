import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/react-native/index.ts", "src/utils/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
});

import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/env.ts", "src/objects/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  clean: true,
  esbuildOptions(options) {
    options.external = ["./src/lightspark_crypto/*"];
  },
});

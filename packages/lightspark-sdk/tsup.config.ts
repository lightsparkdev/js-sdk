import { defineConfig } from 'tsup'
import * as esbuild from 'esbuild'

export default defineConfig({
  entry: ['src/index.ts', 'src/objects/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  esbuildOptions(options) {
    options.external = ['./src/lightspark_crypto/*'];
  }
})

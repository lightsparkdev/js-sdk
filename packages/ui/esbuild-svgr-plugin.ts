/* Originally from https://github.com/kazijawad/esbuild-plugin-svgr. Modified to allow ?url
   loader to resolve as dataurl instead of as JSX components */

import { transform } from "@svgr/core";
import { readFile } from "node:fs/promises";

export function svgr(options = {}) {
  return {
    name: "svgr",
    setup(build) {
      build.onResolve({ filter: /\.svg$/ }, async (args) => {
        switch (args.kind) {
          case "import-statement":
          case "require-call":
          case "dynamic-import":
          case "require-resolve":
            return;
          default:
            return {
              external: true,
            };
        }
      });

      build.onLoad({ filter: /\.svg$/ }, async (args) => {
        const svg = await readFile(args.path, { encoding: "utf8" });

        if (options.plugins && !options.plugins.includes("@svgr/plugin-jsx")) {
          options.plugins.push("@svgr/plugin-jsx");
        } else if (!options.plugins) {
          options.plugins = ["@svgr/plugin-jsx"];
        }

        const contents = await transform(
          svg,
          { ...options },
          { filePath: args.path },
        );

        if (args.suffix === "?url") {
          return {
            contents: svg,
            loader: "dataurl",
          };
        }

        return {
          contents,
          loader: options.typescript ? "tsx" : "jsx",
        };
      });
    },
  };
}

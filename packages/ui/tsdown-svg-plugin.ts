import { transform as svgrTransform } from "@svgr/core";
import { transform as esbuildTransform } from "esbuild";
import { readFile } from "node:fs/promises";

function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function svgr() {
  return {
    name: "lightspark-ui-svgr",
    async load(id: string) {
      const [filePath, query] = id.split("?", 2);
      if (!filePath.endsWith(".svg")) {
        return null;
      }

      const svg = await readFile(filePath, { encoding: "utf8" });
      if (query === "url") {
        return `export default ${JSON.stringify(svgToDataUrl(svg))};`;
      }

      const jsx = await svgrTransform(
        svg,
        {
          jsxRuntime: "automatic",
          plugins: ["@svgr/plugin-jsx"],
        },
        { filePath },
      );
      const transformed = await esbuildTransform(jsx, {
        format: "esm",
        jsx: "automatic",
        loader: "jsx",
        sourcefile: filePath,
      });

      return {
        code: transformed.code,
        map: transformed.map,
      };
    },
  };
}

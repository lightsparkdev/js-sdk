// Copyright ©, 2026, Lightspark Group, Inc. - All Rights Reserved

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { Script } from "node:vm";
import { transformWithOxc } from "vite";

export function documentBootstrapPlugin({ sourcePath }) {
  let outputPath;

  async function generate() {
    const { code } = await transformWithOxc(
      readFileSync(sourcePath, "utf8"),
      sourcePath,
      { sourcemap: false },
    );
    // This runs before the app's modules, so it must parse as a classic script.
    new Script(code, { filename: sourcePath });
    if (!existsSync(outputPath) || readFileSync(outputPath, "utf8") !== code) {
      mkdirSync(dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, code);
    }
  }

  return {
    name: "document-bootstrap",
    apply: (_config, { isPreview }) => !isPreview,
    configResolved(config) {
      outputPath = join(config.publicDir, "document-bootstrap.js");
      // Vite inventories public assets before the dev server's buildStart.
      return generate();
    },
    buildStart() {
      this.addWatchFile(sourcePath);
      return generate();
    },
    async hotUpdate({ file }) {
      if (file === sourcePath && this.environment.name === "client") {
        await generate();
        this.environment.hot.send({ type: "full-reload", path: "*" });
        return [];
      }
    },
  };
}

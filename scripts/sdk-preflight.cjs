const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

async function main() {
  const args = process.argv.slice(2);
  const rootIndex = args.indexOf("--root");
  if (rootIndex < 0 || !args[rootIndex + 1])
    throw new Error("--root is required");
  const root = path.resolve(args[rootIndex + 1]);
  const jsRoot = fs.existsSync(path.join(root, "js/package.json"))
    ? path.join(root, "js")
    : root;
  const controls = path.join(__dirname, "sdk-release.cjs");
  const run = (command, arguments_, cwd = jsRoot, capture = false) =>
    execFileSync(command, arguments_, {
      cwd,
      encoding: "utf8",
      stdio: capture ? ["ignore", "pipe", "inherit"] : "inherit",
      env: { ...process.env, CI: "true", TURBO_TELEMETRY_DISABLED: "1" },
    });
  const workspaces = JSON.parse(
    run(
      process.execPath,
      [controls, "list-workspaces", "--root", root],
      root,
      true,
    ),
  );
  const filters = workspaces.map(({ name }) => `--filter=${name}...`);
  run("yarn", ["turbo", "run", "build", "--cache=local:rw", ...filters]);
  if (args.includes("--checks")) {
    run("yarn", [
      "turbo",
      "run",
      "lint",
      "types",
      "package:checks",
      "--cache=local:rw",
      ...filters,
    ]);
    // These package tests are hermetic; backend integration suites stay in private CI.
    for (const name of ["core", "crypto-wasm", "lightspark-sdk", "origin"]) {
      run("yarn", ["workspace", `@lightsparkdev/${name}`, "test"]);
    }
  }

  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "js-sdk-consumer-"));
  try {
    const tarballs = workspaces.map(({ name, version, directory }) => {
      const packed = JSON.parse(
        run(
          "npm",
          [
            "pack",
            "--ignore-scripts",
            "--json",
            "--pack-destination",
            temporary,
          ],
          path.join(jsRoot, directory),
          true,
        ),
      )[0];
      if (packed.name !== name || packed.version !== version)
        throw new Error(`Unexpected packed package: ${name}`);
      const files = new Set(packed.files.map(({ path: file }) => file));
      const manifest = JSON.parse(
        fs.readFileSync(path.join(jsRoot, directory, "package.json")),
      );
      const required = [
        manifest.main,
        manifest.types,
        ...Object.values(manifest.bin || {}),
      ].filter(Boolean);
      if (name === "@lightsparkdev/crypto-wasm")
        required.push("crypto.cjs", "crypto_bg.wasm", "crypto.d.ts");
      if (name === "@lightsparkdev/origin") {
        required.push(
          "dist/styles.css",
          "src/index.ts",
          "src/styles/public.scss",
          "src/styles/scope.scss",
        );
        if (
          ![...files].some(
            (file) =>
              file.startsWith("public/fonts/") && /\.woff2?$/.test(file),
          )
        )
          throw new Error("Origin fonts are missing");
      }
      for (const file of required)
        if (!files.has(file.replace(/^\.\//, "")))
          throw new Error(`${name} is missing ${file}`);
      for (const file of files)
        if (
          /(^|\/)(\.env(?:\.|$)|node_modules\/|packages\/private\/|apps\/private\/)/.test(
            file,
          )
        )
          throw new Error(`Unexpected private file in ${name}: ${file}`);
      return path.join(temporary, packed.filename);
    });
    fs.writeFileSync(
      path.join(temporary, "package.json"),
      JSON.stringify({ private: true, type: "module" }),
    );
    const installedVersion = (name) =>
      JSON.parse(
        fs.readFileSync(
          require.resolve(`${name}/package.json`, {
            paths: [path.join(jsRoot, "packages/origin")],
          }),
        ),
      ).version;
    run(
      "npm",
      [
        "install",
        "--ignore-scripts",
        "--no-audit",
        "--no-fund",
        "--no-package-lock",
        "--legacy-peer-deps",
        ...tarballs,
        ...["react", "react-dom", "next"].map(
          (name) => `${name}@${installedVersion(name)}`,
        ),
      ],
      temporary,
    );
    const imports = [
      "@lightsparkdev/core",
      "@lightsparkdev/core/utils",
      "@lightsparkdev/lightspark-sdk",
      "@lightsparkdev/lightspark-sdk/objects",
      "@lightsparkdev/lightspark-sdk/env",
      "@lightsparkdev/crypto-wasm",
    ];
    fs.writeFileSync(
      path.join(temporary, "imports.mjs"),
      imports
        .map((name) => `await import(${JSON.stringify(name)});`)
        .join("\n"),
    );
    fs.writeFileSync(
      path.join(temporary, "imports.cjs"),
      imports.map((name) => `require(${JSON.stringify(name)});`).join("\n"),
    );
    run(process.execPath, ["imports.mjs"], temporary);
    run(process.execPath, ["imports.cjs"], temporary);
    run(
      process.execPath,
      ["node_modules/@lightsparkdev/lightspark-cli/dist/index.js", "--help"],
      temporary,
    );
    fs.writeFileSync(
      path.join(temporary, "consumer.mts"),
      'import * as core from "@lightsparkdev/core";\nimport * as sdk from "@lightsparkdev/lightspark-sdk";\nconsole.log(core, sdk);\n',
    );
    const typescript = require.resolve("typescript/bin/tsc", {
      paths: [path.join(jsRoot, "packages/core")],
    });
    run(
      process.execPath,
      [
        typescript,
        "--noEmit",
        "--strict",
        "--skipLibCheck",
        "--module",
        "NodeNext",
        "--target",
        "ES2022",
        "consumer.mts",
      ],
      temporary,
    );
    const esbuild = require(
      require.resolve("esbuild", {
        paths: [path.join(jsRoot, "packages/origin")],
      }),
    );
    for (const entry of [
      "ui/dist/components/index.js",
      "ui/dist/components/index.cjs",
    ]) {
      esbuild.buildSync({
        entryPoints: [
          path.join(temporary, "node_modules/@lightsparkdev", entry),
        ],
        bundle: true,
        packages: "external",
        platform: "browser",
        format: "esm",
        outfile: path.join(temporary, entry.replaceAll("/", "-") + ".js"),
        jsx: "automatic",
        loader: {
          ".woff": "file",
          ".woff2": "file",
          ".ttf": "file",
          ".eot": "file",
          ".svg": "file",
        },
      });
    }
    const { pathToFileURL } = require("node:url");
    const vite = await import(
      pathToFileURL(
        require.resolve("vite", {
          paths: [path.join(jsRoot, "packages/origin")],
        }),
      ).href
    );
    const originManifest = JSON.parse(
      fs.readFileSync(
        path.join(temporary, "node_modules/@lightsparkdev/origin/package.json"),
      ),
    );
    const external = Object.keys({
      ...originManifest.dependencies,
      ...originManifest.peerDependencies,
    });
    await vite.build({
      configFile: false,
      root: path.join(jsRoot, "packages/origin"),
      build: {
        outDir: path.join(temporary, "origin-bundle"),
        lib: {
          entry: path.join(
            temporary,
            "node_modules/@lightsparkdev/origin/src/index.ts",
          ),
          formats: ["es"],
          fileName: "origin",
        },
        rollupOptions: {
          external: (id) =>
            external.some((name) => id === name || id.startsWith(name + "/")),
        },
      },
    });
    console.log(`Verified ${tarballs.length} public package tarballs`);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

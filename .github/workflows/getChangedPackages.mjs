import assembleReleasePlan from "@changesets/assemble-release-plan";
import { parse as parseConfig } from "@changesets/config";
import * as git from "@changesets/git";
import parseChangeset from "@changesets/parse";
import types from "@changesets/types";
import * as fs from "fs";

const { PreState, NewChangeset } = types;

const changed = await git.getChangedPackagesSinceRef({
  cwd: ".",
  ref: "main",
  changedFilePatterns: ["**"],
});

const configText = fs.readFileSync(".changeset/config.json", {
  encoding: "utf8",
});
const config = JSON.parse(configText);

console.log("config", config);

const files = fs.readdirSync(".changeset");

const changesets = [];
files.forEach(function (filename) {
  if (!filename.endsWith(".md") || filename === "README.md") return;
  console.log(file);
  const changesetText = fs.readFileSync(`.changeset/${filename}`, {
    encoding: "utf8",
  });
  const changeset = parseChangeset(changesetText);
  console.log("changeset", changeset);
  changesets.push(changeset);
});

const packageJsonContent = fs.readFileSync("package.json", {
  encoding: "utf8",
});
const packageJson = JSON.parse(packageJsonContent);
const packageGlobs = packageJson.workspaces;
const packageDirPaths = fs.readdirSync("packages", { withFileTypes: true });

console.log({ packageGlobs, packageDirPaths });

const packages = packageDirPaths
  .filter((packageDirPath) => packageDirPath.isDirectory())
  .map((packageDirs) => {
    const packageJsonContent = fs.readFileSync(
      `packages/${packageDirs.name}/package.json`,
      {
        encoding: "utf8",
      }
    );
    const packageJson = JSON.parse(packageJsonContent);

    return {
      dir: `packages/${packageDirs.name}`,
      packageJson,
    };
  });

const workspace = {
  root: {
    dir: "/",
    packageJson,
  },
  tool: "yarn",
  packages,
};

console.log({ packages });

console.log(assembleReleasePlan);

const parsedConfig = parseConfig(config, workspace);

const releasePlan = assembleReleasePlan.default(
  changesets,
  workspace,
  parsedConfig,
  undefined
);

// console.log("releasePlan", releasePlan);

process.stdout.write(`\nchangedPackages=${JSON.stringify(changed)}\n`);

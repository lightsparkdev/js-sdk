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

const files = fs.readdirSync(".changeset");

const changesets = [];
files.forEach(function (filename) {
  if (!filename.endsWith(".md") || filename === "README.md") return;
  const changesetText = fs.readFileSync(`.changeset/${filename}`, {
    encoding: "utf8",
  });
  const changeset = parseChangeset(changesetText);
  changesets.push(changeset);
});

const packageJsonContent = fs.readFileSync("package.json", {
  encoding: "utf8",
});
const packageJson = JSON.parse(packageJsonContent);
const packageGlobs = packageJson.workspaces;
const packageDirPaths = fs.readdirSync("packages", { withFileTypes: true });

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

const parsedConfig = parseConfig(config, workspace);

const releasePlan = assembleReleasePlan.default(
  changesets,
  workspace,
  parsedConfig,
  undefined
);

const changedPackagesMapped = changed.map((changedPackage) => ({
  name: changedPackage.packageJson.name,
  version: changedPackage.packageJson.version,
}));

process.stdout.write(
  `\nchangedPackages='${JSON.stringify(changedPackagesMapped)}'` +
    `\nreleasePlan='${JSON.stringify(releasePlan)}'`
);

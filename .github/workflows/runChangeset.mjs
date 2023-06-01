import assembleReleasePlan from "@changesets/assemble-release-plan";
import { parse as parseConfig } from "@changesets/config";
import * as git from "@changesets/git";
import parseChangeset from "@changesets/parse";
import * as fs from "fs";
import humanId from "human-id";

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
  const changeset = parseChangeset.default(changesetText);
  changesets.push(changeset);
});

const packageJsonContent = fs.readFileSync("package.json", {
  encoding: "utf8",
});
const packageJson = JSON.parse(packageJsonContent);
const packageGlobs = packageJson.workspaces;
const packageDirPaths = fs.readdirSync("packages", { withFileTypes: true });

const publicPackages = packageDirPaths
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
  })
  .filter((pkg) => {
    return pkg.packageJson.private !== true;
  });

const workspace = {
  root: {
    dir: "/",
    packageJson,
  },
  tool: "yarn",
  packages: publicPackages,
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

const changeset = {
  changedPackages: changedPackagesMapped,
  releases: releasePlan.releases,
  changesets: releasePlan.changesets,
  suggestedChangesetId: humanId({
    separator: "-",
    capitalize: false,
  }),
};

process.stdout.write(`\nchangeset='${JSON.stringify(changeset)}'`);

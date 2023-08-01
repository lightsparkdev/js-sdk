import assembleReleasePlan from "@changesets/assemble-release-plan";
import { parse as parseConfig } from "@changesets/config";
import * as git from "@changesets/git";
import parseChangeset from "@changesets/parse";
import * as fs from "fs";
import humanId from "human-id";

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

const changedPackages = await git.getChangedPackagesSinceRef({
  cwd: ".",
  ref: "main",
  changedFilePatterns: ["**"],
});

const changedPublicPackagesMapped = changedPackages
  .filter((changedPackage) => {
    /* All public published packages must be in the packages directory */
    const isApp = changedPackage.dir.includes("apps");
    return !isApp;
  })
  .map((changedPackage) => {
    return {
      name: changedPackage.packageJson.name,
      version: changedPackage.packageJson.version,
    };
  });

const changeset = {
  changedPackages: changedPublicPackagesMapped,
  releases: releasePlan.releases,
  changesets: releasePlan.changesets,
  suggestedChangesetId: humanId({
    separator: "-",
    capitalize: false,
  }),
};

const changesetStr = JSON.stringify(changeset);
process.stdout.write(`\nchangeset='${changesetStr}'`);

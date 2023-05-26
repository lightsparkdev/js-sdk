import * as git from "@changesets/git";

const changed = await git.getChangedPackagesSinceRef({
  cwd: ".",
  ref: "main",
  changedFilePatterns: ["**"],
});

process.stdout.write(`\nchangedPackages="${JSON.stringify(changed)}"\n`);

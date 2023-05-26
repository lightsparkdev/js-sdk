import * as git from "@changesets/git";

const changed = await git.getChangedPackagesSinceRef({
  cwd: "../..",
  ref: "main",
  changedFilePatterns: ["**"],
});

console.log(changed);

export {};

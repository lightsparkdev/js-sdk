import { Octokit, App } from "octokit";
import { createActionAuth } from "@octokit/auth-action";
import { ensureReleasePR } from "./ensureReleasePR.mjs";

const auth = createActionAuth();
const authentication = await auth();

const github = new Octokit({
  authStrategy: createActionAuth,
  auth: authentication,
});

const ref = process.env.GITHUB_REF;
const owner = "lightsparkdev";
const repo = "js-sdk";
const base = "main";

const pr = await ensureReleasePR({ github, ref, base });

const { data: comments } = await github.rest.issues.listComments({
  owner,
  repo,
  issue_number: pr.number,
});

/* 41898282 is github-actions[bot] */
let comment = comments.find((comment) => comment.user.id === 41898282);

let changesetRawStr = process.env.CHANGESET.replace(/\n/g, "\\n");
console.log("changesetRawStr", changesetRawStr);

changesetRawStr = changesetRawStr.replace(/^'(.*)'$/, "$1");
const hasUndef = changesetRawStr.includes("undefined");
const changeset = JSON.parse(changesetRawStr);

const changedPackagesLines = changeset.changedPackages
  .map((x) => `| ${x.name} | ${x.version} |`)
  .join("\n");

const lastCommit = process.env.LAST_COMMIT;

const changedPackagesStr = changeset.changedPackages.length
  ? `The following public packages have changed files:\n| Changed | Current version |\n| - | - |\n${changedPackagesLines}`
  : "No public packages have changed files.";

const changesetCount = changeset.changesets.length;
const changesetSingle = changesetCount === 1;

const commitChangesetLinkBase = `https://github.com/lightsparkdev/js-sdk/new/${pr.head.ref}?filename=.changeset/${changeset.suggestedChangesetId}.md`;
const suggestedChangesets = changeset.changedPackages
  .map((x) => `"${x.name}": patch`)
  .join("\n");

const commitChangesetLink = `${commitChangesetLinkBase}&value=${encodeURIComponent(
  `---\n${suggestedChangesets}\n---\n\n${pr.title}`
)}`;

const noChangesetStr = `If the changes in this PR should result in new published versions for the packages above please [add a changeset](${commitChangesetLink})`;
const hasChangesetStr = `If additional changes have been made that require different versions for any package simply [add another changeset](${commitChangesetLink})`;
const changesetStr = `There ${changesetSingle ? "is" : "are"} ${
  changesetCount || "no"
} existing changeset${changesetSingle ? "" : "s"} for this branch. ${
  changesetCount > 0 ? hasChangesetStr : noChangesetStr
}. Any packages that depend on the planned releases will be updated and released automatically in a separate PR.`;

const packageReleasesStr = changeset.releases
  .map((x) => `| ${x.name} | ${x.type} |`)
  .join("\n");

const changelogGuidanceStr = `Each changeset corresponds to an update in the CHANGELOG for the packages listed in the changeset. Therefore, you should add a changeset for each noteable package change that this PR contains. For example, if a PR adds two features - one feature for packages A and B and one feature for package C - you should add two changesets. One changeset for packages A and B and one changeset for package C, with a description of each feature. The feature description will end up being the CHANGELOG entry for the packages in the changeset.`;
const releasesStr = `${
  changeset.releases.length
    ? `The following releases are planned based on the existing changesets:\n\n| Planned releases | Update |\n\| - | - |\n${packageReleasesStr}`
    : "No releases planned."
}`;

const commentBody = `${changedPackagesStr}\n\n${changesetStr}\n\n${changelogGuidanceStr}\n\n${releasesStr}\n\nLast updated by commit ${lastCommit}`;
if (!comment) {
  github.rest.issues.createComment({
    owner,
    repo,
    issue_number: pr.number,
    body: commentBody,
  });
} else {
  github.rest.issues.updateComment({
    owner,
    repo,
    comment_id: comment.id,
    body: commentBody,
  });
}

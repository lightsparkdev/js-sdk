import { Octokit, App } from "octokit";
import { createActionAuth } from "@octokit/auth-action";

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
let pr;

/* We already have the id if this is a PR edit event: */
const editedIdMatch = ref.match(/^refs\/pull\/(\d+)\//);
const editedId = editedIdMatch ? editedIdMatch[1] : null;

if (editedId) {
  const prRequest = await github.rest.pulls.get({
    owner,
    repo,
    pull_number: editedId,
  });
  pr = prRequest.data;
} else {
  const triggeringRefHead = ref.split("/").pop();

  const { data: prs } = await github.rest.pulls.list({
    owner,
    repo,
  });

  pr = prs.find((pr) => {
    return pr.head.ref === triggeringRefHead && pr.base.ref === base;
  });

  if (!pr) {
    const { data: latestCommit } = await github.rest.repos.getCommit({
      owner,
      repo,
      ref: triggeringRefHead,
    });

    const result = await github.rest.pulls.create({
      owner,
      repo,
      head: triggeringRefHead,
      base,
      title: latestCommit.commit.message
        .replace(/\sGitOrigin-RevId.*/, "")
        .replace(/^(.+)\s\(#[0-9]+\).*/, "$1")
        .substring(0, 80),
      body: "If this change should result in new package versions please add a changeset before merging. You can do so by clicking the maintainers link provided by changeset-bot below.\n\nPlease note that changeset-bot appears to produce inconsistent / incorrect results with the latest version of changesets when run locally. Be sure to check that it is correctly mentioning the changed packages in the referenced link, or produce the changeset locally `yarn changeset` and push it to the branch.",
    });
    pr = result.data;
  }
}

const { data: comments } = await github.rest.issues.listComments({
  owner,
  repo,
  issue_number: pr.number,
});

/* 41898282 is github-actions[bot] */
let comment = comments.find((comment) => comment.user.id === 41898282);
console.log("process.env.CHANGESET", process.env.CHANGESET);

const changesetRawStr = process.env.CHANGESET.replace(/\n/g, "\\n");
console.log("changesetRawStr", changesetRawStr);
const changeset = JSON.parse(changesetRawStr);

const changedPackagesLines = changeset.changedPackages
  .map((x) => `| ${x.name} | ${x.version} |`)
  .join("\n");

console.log("process.env.LAST_COMMIT", process.env.LAST_COMMIT);
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

export async function ensureReleasePR({ github, ref, base = "main" }) {
  const owner = "lightsparkdev";
  const repo = "js-sdk";

  /* We already have the PR number if this is a PR edit event: */
  const editingPRNumberMatch = ref.match(/^refs\/pull\/(\d+)\//);
  const editingPRNumber = editPRNumberMatch ? editPRNumberMatch[1] : null;
  if (editingPRNumber) {
    const prRequest = await github.rest.pulls.get({
      owner,
      repo,
      pull_number: editedId,
    });
    return prRequest.data;
  }

  const triggeringRefHead = ref.split("/").pop();

  const { data: prs } = await github.rest.pulls.list({
    owner,
    repo,
  });

  let pr = prs.find((pr) => {
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
      body: "If this change should result in new package versions please add a changeset before merging. You can do so by clicking the link provided by changeset bot below.",
    });
    pr = result.data;
  }

  return pr;
}

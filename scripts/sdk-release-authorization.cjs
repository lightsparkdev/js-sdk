module.exports = async function authorizeRelease({ github, context, core }) {
  const fs = require("fs");
  if (!/^\d+$/.test(process.env.PREPARATION_RUN_ID)) {
    throw new Error("preparation_run_id must be numeric");
  }
  const authorization = JSON.parse(
    fs.readFileSync(process.env.AUTHORIZATION_PATH, "utf8"),
  );
  const expected = {
    schemaVersion: 1,
    repository: process.env.GITHUB_REPOSITORY,
    runId: process.env.PREPARATION_RUN_ID,
    sourceCommit: process.env.SOURCE_COMMIT,
    releaseBranch: process.env.RELEASE_BRANCH,
    releaseCommit: process.env.RELEASE_COMMIT,
  };
  for (const [field, value] of Object.entries(expected)) {
    if (authorization[field] !== value) {
      throw new Error(
        `Release authorization ${field} does not match this dispatch`,
      );
    }
  }
  if (
    authorization.plan?.schemaVersion !== 2 ||
    authorization.plan.sourceCommit !== authorization.sourceCommit ||
    authorization.plan.commit !== authorization.releaseCommit
  ) {
    throw new Error(
      "Authorized plan does not match the exact source and release commit",
    );
  }
  if (authorization.plan.hasMajor && authorization.allowMajor !== true) {
    throw new Error("The preparation run did not authorize this major release");
  }
  if (!/^[0-9a-f]{64}$/.test(authorization.lockfileSha256)) {
    throw new Error("Release authorization has an invalid lockfile SHA-256");
  }
  core.setOutput("lockfile_sha256", authorization.lockfileSha256);
  core.setOutput("release_branch", authorization.releaseBranch);

  if (
    Number(process.env.RUN_ATTEMPT) > 1 ||
    process.env.TRIGGERING_ACTOR !== "github-actions[bot]"
  ) {
    const { data } = await github.rest.repos.getCollaboratorPermissionLevel({
      ...context.repo,
      username: process.env.TRIGGERING_ACTOR,
    });
    if (!["admin", "maintain"].includes(data.role_name || data.permission)) {
      throw new Error(
        "Publisher dispatches and reruns require maintain permission",
      );
    }
  }
  const runId = Number(process.env.PREPARATION_RUN_ID);
  const { data: run } = await github.rest.actions.getWorkflowRun({
    owner: context.repo.owner,
    repo: context.repo.repo,
    run_id: runId,
  });
  const { data: workflow } = await github.rest.actions.getWorkflow({
    owner: context.repo.owner,
    repo: context.repo.repo,
    workflow_id: run.workflow_id,
  });
  if (
    workflow.path !== ".github/workflows/js-sdk-prepare-release.yml" ||
    run.event !== "workflow_dispatch" ||
    run.head_branch !== "main" ||
    run.conclusion !== "success" ||
    run.triggering_actor?.login !== authorization.authorizedBy
  ) {
    throw new Error(
      "Release authorization is not from a successful main-branch preparation run",
    );
  }

  const { data: permission } =
    await github.rest.repos.getCollaboratorPermissionLevel({
      owner: context.repo.owner,
      repo: context.repo.repo,
      username: authorization.authorizedBy,
    });
  const role = permission.role_name || permission.permission;
  if (!["admin", "maintain"].includes(role)) {
    throw new Error(
      `Release authorization requires maintain permission; ${authorization.authorizedBy} has ${role}`,
    );
  }
};

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");
const authorizeRelease = require("../sdk-release-authorization.cjs");

function request(t) {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "sdk-authorization-"),
  );
  const authorization = {
    schemaVersion: 1,
    repository: "lightsparkdev/js-sdk",
    runId: "123",
    authorizedBy: "release-maintainer",
    sourceCommit: "1".repeat(40),
    releaseCommit: "2".repeat(40),
    releaseBranch: `sdk-release/stable/${"1".repeat(40)}-${"3".repeat(32)}`,
    lockfileSha256: "4".repeat(64),
    allowMajor: false,
    plan: {
      schemaVersion: 2,
      sourceCommit: "1".repeat(40),
      commit: "2".repeat(40),
      hasMajor: false,
    },
  };
  const env = {
    GITHUB_REPOSITORY: authorization.repository,
    AUTHORIZATION_PATH: path.join(directory, "authorization.json"),
    PREPARATION_RUN_ID: authorization.runId,
    SOURCE_COMMIT: authorization.sourceCommit,
    RELEASE_COMMIT: authorization.releaseCommit,
    RELEASE_BRANCH: authorization.releaseBranch,
    TRIGGERING_ACTOR: "github-actions[bot]",
    RUN_ATTEMPT: "1",
  };
  const previous = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );
  Object.assign(process.env, env);
  t.after(() => {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    fs.rmSync(directory, { recursive: true, force: true });
  });
  const run = {
    workflow_id: 7,
    event: "workflow_dispatch",
    head_branch: "main",
    conclusion: "success",
    triggering_actor: { login: authorization.authorizedBy },
  };
  const workflow = { path: ".github/workflows/js-sdk-prepare-release.yml" };
  const permissions = {
    "release-maintainer": "maintain",
    "other-writer": "write",
  };
  const outputs = {};
  const input = {
    context: { repo: { owner: "lightsparkdev", repo: "js-sdk" } },
    core: { setOutput: (name, value) => (outputs[name] = value) },
    github: {
      rest: {
        actions: {
          getWorkflowRun: async () => ({ data: run }),
          getWorkflow: async () => ({ data: workflow }),
        },
        repos: {
          getCollaboratorPermissionLevel: async ({ username }) => ({
            data: { role_name: permissions[username] },
          }),
        },
      },
    },
  };
  return {
    authorization,
    run,
    workflow,
    permissions,
    outputs,
    execute: () => {
      fs.writeFileSync(env.AUTHORIZATION_PATH, JSON.stringify(authorization));
      return authorizeRelease(input);
    },
  };
}

test("successful preparation authorizes only its exact commit, branch, and lockfile", async (t) => {
  const r = request(t);
  await r.execute();
  assert.equal(r.outputs.release_branch, r.authorization.releaseBranch);
  assert.equal(r.outputs.lockfile_sha256, r.authorization.lockfileSha256);
  r.authorization.releaseCommit = "5".repeat(40);
  await assert.rejects(r.execute(), /does not match this dispatch/);
});

test("major releases require explicit authorization in the successful preparation", async (t) => {
  const r = request(t);
  r.authorization.plan.hasMajor = true;
  await assert.rejects(r.execute(), /did not authorize this major/);
  r.authorization.allowMajor = true;
  await r.execute();
  r.run.conclusion = "failure";
  await assert.rejects(r.execute(), /successful main-branch preparation/);
});

test("PR workflows and arbitrary artifacts cannot authorize publication", async (t) => {
  const r = request(t);
  r.workflow.path = ".github/workflows/contributor.yml";
  await assert.rejects(r.execute(), /successful main-branch preparation/);
  r.workflow.path = ".github/workflows/js-sdk-prepare-release.yml";
  r.run.head_branch = "develop";
  await assert.rejects(r.execute(), /successful main-branch preparation/);
  r.run.head_branch = "main";
  r.authorization.plan.commit = "5".repeat(40);
  await assert.rejects(r.execute(), /does not match the exact source/);
});

test("dispatches and reruns recheck maintainer permission", async (t) => {
  const r = request(t);
  r.permissions["release-maintainer"] = "write";
  await assert.rejects(r.execute(), /requires maintain permission/);
  r.permissions["release-maintainer"] = "maintain";
  process.env.TRIGGERING_ACTOR = "other-writer";
  process.env.RUN_ATTEMPT = "2";
  await assert.rejects(r.execute(), /reruns require maintain permission/);
  process.env.TRIGGERING_ACTOR = "release-maintainer";
  await r.execute();
});

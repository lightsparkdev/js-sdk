const assert = require("node:assert/strict");
const { execFileSync, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { test } = require("node:test");

const command = path.resolve(__dirname, "../sdk-release.cjs");
const registryFixture = path.join(__dirname, "registry-fixture.cjs");

function repository(t, privateRepository = false) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "webdev-release-test-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const jsRoot = privateRepository ? path.join(root, "js") : root;
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: root,
      encoding: "utf8",
      stdio: "pipe",
    }).trim();
  const write = (file, value) => {
    const target = path.join(jsRoot, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(
      target,
      typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`,
    );
  };
  const pkg = (name, version = "0.1.0", extra = {}) => ({
    name: `@lightsparkdev/${name}`,
    version,
    repository: {
      type: "git",
      url: "git+https://github.com/lightsparkdev/js-sdk.git",
      directory: `packages/${name}`,
    },
    ...extra,
  });
  const commit = (message) => {
    git("add", ".");
    git("commit", "-m", message);
    return git("rev-parse", "HEAD");
  };
  git("init", "-b", "main");
  git("config", "user.name", "Release test");
  git("config", "user.email", "release-test@example.com");
  git("config", "commit.gpgsign", "false");
  git("config", "tag.gpgsign", "false");
  write("package.json", {
    name: "js",
    private: true,
    workspaces: [
      "packages/*",
      "packages/private/*",
      "!packages/private/AGENTS.md",
    ],
  });
  write("packages/core/package.json", pkg("core"));
  write(
    "packages/ui/package.json",
    pkg("ui", "0.1.0", { dependencies: { "@lightsparkdev/core": "0.1.0" } }),
  );
  write("packages/private/ui/package.json", {
    name: "@lightsparkdev/private-ui",
    version: "0.0.0",
    private: true,
  });
  write("yarn.lock", "baseline\n");
  commit("Initial public packages");
  const candidate = (version = "0.1.1", previousVersion = "0.1.0") => {
    write("packages/core/package.json", pkg("core", version));
    write(
      "packages/ui/package.json",
      pkg("ui", version, { dependencies: { "@lightsparkdev/core": version } }),
    );
    for (const name of ["core", "ui"])
      write(
        `packages/${name}/CHANGELOG.md`,
        `# ${name}\n\n## ${version}\n\nA public change.\n`,
      );
    write("release-candidate.json", {
      schemaVersion: 1,
      channel: "stable",
      npmTag: "latest",
      packages: ["core", "ui"].map((name) => ({
        name: `@lightsparkdev/${name}`,
        previousVersion,
        version,
        directory: `packages/${name}`,
      })),
    });
    return commit("[js] Version packages");
  };
  const registry = {};
  const published = (version, sha, names = ["core", "ui"]) => {
    for (const name of names) {
      const full = `@lightsparkdev/${name}`;
      registry[full] ||= { versions: {}, "dist-tags": {} };
      registry[full].versions[version] = {};
      registry[`${full}/${version}`] = { name: full, version, gitHead: sha };
    }
  };
  published("0.1.0", git("rev-parse", "HEAD"));
  const run = (args, env = {}) => {
    const fixture = path.join(root, "registry.json");
    fs.writeFileSync(fixture, JSON.stringify(registry));
    const result = spawnSync(
      process.execPath,
      ["--require", registryFixture, command, ...args, "--root", root],
      {
        cwd: root,
        encoding: "utf8",
        env: { ...process.env, REGISTRY_FIXTURE: fixture, ...env },
      },
    );
    fs.rmSync(fixture);
    return result;
  };
  const json = (args, env) => {
    const result = run(args, env);
    assert.equal(result.status, 0, result.stderr);
    return JSON.parse(result.stdout);
  };
  return {
    root,
    jsRoot,
    git,
    write,
    pkg,
    commit,
    candidate,
    registry,
    published,
    run,
    json,
  };
}

test("public and private checkouts share workspace-relative candidate paths", (t) => {
  for (const privateRepository of [false, true]) {
    const r = repository(t, privateRepository);
    const sha = r.candidate();
    const result = r.json(["publish-plan", "--candidate-ref", sha]);
    assert.equal(result.commit, sha);
    assert.deepEqual(
      result.publishCandidates.map((p) => p.directory),
      ["packages/core", "packages/ui"],
    );
    assert.equal(result.npmTag, "latest");
  }
});

test("private workspaces cannot become publishable by omitting the private flag", (t) => {
  const r = repository(t, true);
  r.write("packages/private/ui/package.json", {
    name: "@lightsparkdev/private-ui",
    version: "0.0.0",
  });
  const result = r.run(["validate-workspaces"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /must set private: true/);
});

test("workspace metadata cannot follow symlinks outside the package", (t) => {
  const r = repository(t);
  const manifest = path.join(r.root, "packages/core/package.json");
  fs.renameSync(manifest, path.join(r.root, "external.json"));
  fs.symlinkSync("../../external.json", manifest);
  assert.match(r.run(["validate-workspaces"]).stderr, /must not be a symlink/);
});

test("candidate manifest must describe exactly the committed version changes", (t) => {
  const r = repository(t);
  r.candidate();
  r.write("packages/core/package.json", r.pkg("core", "0.1.2"));
  const sha = r.commit("Unexpected version change");
  assert.match(
    r.run(["publish-plan", "--candidate-ref", sha]).stderr,
    /does not match|not introduced/,
  );
});

test("candidate selection survives later source merges and enforces FIFO", (t) => {
  const r = repository(t);
  const first = r.candidate();
  r.write("packages/core/source.txt", "newer code\n");
  r.commit("Normal source change");
  const second = r.candidate("0.1.2", "0.1.1");
  assert.equal(
    r.json(["select-candidate", "--ref", "main"]).sourceCommit,
    first,
  );
  assert.match(
    r.run(["publish-plan", "--candidate-ref", second]).stderr,
    /Earlier release candidate/,
  );
  r.published("0.1.1", first);
  assert.equal(
    r.json(["select-candidate", "--ref", "main"]).sourceCommit,
    second,
  );
  r.git("checkout", "--detach", first);
  assert.equal(
    r.json(["publish-plan", "--candidate-ref", first]).commit,
    first,
  );
});

test("an explicit candidate must belong to the selected main history", (t) => {
  const r = repository(t);
  r.git("checkout", "-b", "unmerged");
  const sha = r.candidate();
  assert.match(
    r.run(["select-candidate", "--ref", "main", "--exact-commit", sha]).stderr,
    /first-parent history/,
  );
});

test("release preparation permits only one lockfile and dispatcher child", (t) => {
  const r = repository(t);
  const source = r.candidate();
  r.write("yarn.lock", "prepared lock\n");
  const release = r.commit("Prepare public dependency lock");
  assert.equal(
    r.json(["publish-plan", "--candidate-ref", source]).commit,
    release,
  );
  r.write("packages/core/source.txt", "unapproved code\n");
  r.git("add", ".");
  r.git("commit", "--amend", "--no-edit");
  assert.match(
    r.run(["publish-plan", "--candidate-ref", source]).stderr,
    /may only change/,
  );
});

test("partial publication retries only missing versions from the same commit", (t) => {
  const r = repository(t, true);
  const sha = r.candidate();
  const authorized = r.json(["publish-plan", "--candidate-ref", sha]);
  r.published("0.1.1", sha, ["core"]);
  const plan = r.json(
    ["publish-plan", "--candidate-ref", sha, "--expect-env", "PLAN"],
    { PLAN: JSON.stringify(authorized) },
  );
  assert.deepEqual(
    plan.publishCandidates.map((p) => p.name),
    ["@lightsparkdev/ui"],
  );
  r.published("0.1.1", "1".repeat(40), ["core"]);
  assert.match(
    r.run(["publish-plan", "--candidate-ref", sha]).stderr,
    /not release commit/,
  );
});

test("completed fallback releases are skipped by public candidate selection", (t) => {
  const r = repository(t);
  const sha = r.candidate();
  r.published("0.1.1", "1".repeat(40));
  assert.equal(
    r.json(["select-candidate", "--ref", "main"]).sourceCommit,
    null,
  );
  assert.match(
    r.run(["publish-plan", "--candidate-ref", sha]).stderr,
    /not release commit/,
  );
});

test("major policy classifies a candidate before release preparation", (t) => {
  const r = repository(t);
  const sha = r.candidate("1.0.0");
  assert.equal(
    r.json(["candidate-policy-plan", "--candidate-ref", sha]).hasMajor,
    true,
  );
});

test("release authorization cannot be reused for another candidate", (t) => {
  const r = repository(t);
  const first = r.candidate();
  const plan = r.json(["publish-plan", "--candidate-ref", first]);
  r.published("0.1.1", first);
  const second = r.candidate("0.1.2", "0.1.1");
  assert.match(
    r.run(["publish-plan", "--candidate-ref", second, "--expect-env", "PLAN"], {
      PLAN: JSON.stringify(plan),
    }).stderr,
    /immutable field/,
  );
});

test("npm visibility retries transient failures before verifying fallback source", (t) => {
  const r = repository(t, true);
  const sha = r.candidate();
  const plan = r.json(["publish-plan", "--candidate-ref", sha]);
  r.published("0.1.1", sha);
  const key = "@lightsparkdev/core/0.1.1";
  r.registry[key] = [{ status: 404 }, { status: 503 }, r.registry[key]];
  const result = r.run(["verify-published", "--plan-env", "PLAN"], {
    PLAN: JSON.stringify(plan),
  });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Verified.*core@0.1.1/);
  assert.equal(r.git("tag", "--list"), "");
});

test("npm verification fails on wrong source, mismatched metadata, and permanent errors", (t) => {
  for (const response of [
    { name: "@lightsparkdev/core", version: "0.1.1", gitHead: "1".repeat(40) },
    { name: "@lightsparkdev/other", version: "0.1.1", gitHead: "1".repeat(40) },
    { status: 403 },
  ]) {
    const r = repository(t);
    const sha = r.candidate();
    const plan = r.json(["publish-plan", "--candidate-ref", sha]);
    r.published("0.1.1", sha);
    r.registry["@lightsparkdev/core/0.1.1"] = response;
    const result = r.run(["verify-published", "--plan-env", "PLAN"], {
      PLAN: JSON.stringify(plan),
    });
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /not release plan commit|mismatched metadata|403/,
    );
  }
});

test("older candidate can still be finalized after a newer release", (t) => {
  const r = repository(t);
  const sha = r.candidate();
  r.published("0.1.1", sha);
  r.published("0.1.2", "2".repeat(40));
  const plan = r.json(["publish-plan", "--candidate-ref", sha]);
  assert.equal(plan.publishCandidates.length, 0);
  assert.equal(plan.finalizationPackages.length, 2);
  assert.equal(
    r.run(["verify-published", "--plan-env", "PLAN"], {
      PLAN: JSON.stringify(plan),
    }).status,
    0,
  );
});

function fakePublishCommands(r) {
  const bin = path.join(r.root, ".git", "test-bin");
  const state = path.join(r.root, ".git", "command-state.json");
  fs.mkdirSync(bin);
  fs.writeFileSync(state, JSON.stringify({ releases: [], publications: [] }));
  const script = `#!${process.execPath}
const fs = require("node:fs"), path = require("node:path");
const file = process.env.COMMAND_STATE;
const state = JSON.parse(fs.readFileSync(file));
const args = process.argv.slice(2);
const command = path.basename(process.argv[1]);
if (command === "npm" && args[0] === "publish") {
  const pkg = JSON.parse(fs.readFileSync("package.json"));
  state.publications.push({ name: pkg.name, version: pkg.version, args });
} else if (command === "gh" && args[0] === "release" && args[1] === "view") {
  process.exit(state.releases.some((r) => r.tag === args[2]) ? 0 : 1);
} else if (command === "gh" && args[0] === "release" && args[1] === "create") {
  state.releases.push({ tag: args[2], notes: fs.readFileSync(args[args.indexOf("--notes-file") + 1], "utf8") });
} else throw new Error("Unexpected command: " + command + " " + args.join(" "));
fs.writeFileSync(file, JSON.stringify(state));
`;
  for (const name of ["npm", "gh"])
    fs.writeFileSync(path.join(bin, name), script, { mode: 0o755 });
  return {
    env: {
      PATH: `${bin}${path.delimiter}${process.env.PATH}`,
      COMMAND_STATE: state,
      GITHUB_REPOSITORY: "lightsparkdev/js-sdk",
    },
    state: () => JSON.parse(fs.readFileSync(state)),
  };
}

test("publisher uses the authorized missing set and duplicate dispatch is a no-op", (t) => {
  const r = repository(t, true);
  const sha = r.candidate();
  const plan = r.json(["publish-plan", "--candidate-ref", sha]);
  const commands = fakePublishCommands(r);
  r.published("0.1.1", sha, ["core"]);
  let result = r.run(["publish", "--plan-env", "PLAN"], {
    ...commands.env,
    PLAN: JSON.stringify(plan),
  });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    commands.state().publications.map(({ name }) => name),
    ["@lightsparkdev/ui"],
  );
  assert.ok(commands.state().publications[0].args.includes("--ignore-scripts"));
  r.published("0.1.1", sha);
  result = r.run(["publish", "--plan-env", "PLAN"], {
    ...commands.env,
    PLAN: JSON.stringify(plan),
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(commands.state().publications.length, 1);
  r.write("packages/core/package.json", r.pkg("core", "0.1.2"));
  result = r.run(["publish", "--plan-env", "PLAN"], {
    ...commands.env,
    PLAN: JSON.stringify(plan),
  });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Tracked release files changed/);
});

test("publisher releases dependencies before consumers and rejects cycles before publishing", (t) => {
  for (const cycle of [false, true]) {
    const r = repository(t);
    const writePackages = (version) => {
      r.write(
        "packages/core/package.json",
        r.pkg("core", version, {
          dependencies: { "@lightsparkdev/ui": version },
        }),
      );
      r.write(
        "packages/ui/package.json",
        r.pkg(
          "ui",
          version,
          cycle
            ? {
                dependencies: { "@lightsparkdev/core": version },
              }
            : {},
        ),
      );
    };
    writePackages("0.1.0");
    r.commit("Set dependency graph before versioning");
    r.candidate();
    writePackages("0.1.1");
    r.git("add", ".");
    r.git("commit", "--amend", "--no-edit");
    const sha = r.git("rev-parse", "HEAD");
    const plan = r.json(["publish-plan", "--candidate-ref", sha]);
    const commands = fakePublishCommands(r);
    const result = r.run(["publish", "--plan-env", "PLAN"], {
      ...commands.env,
      PLAN: JSON.stringify(plan),
    });
    if (cycle) {
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /Publication dependency cycle/);
      assert.deepEqual(commands.state().publications, []);
    } else {
      assert.equal(result.status, 0, result.stderr);
      assert.deepEqual(
        commands.state().publications.map(({ name }) => name),
        ["@lightsparkdev/ui", "@lightsparkdev/core"],
      );
    }
  }
});

test("finalization creates exact tags and releases once, even after a newer version", (t) => {
  const r = repository(t);
  const sha = r.candidate();
  r.published("0.1.1", sha);
  r.published("0.1.2", "2".repeat(40));
  const plan = r.json(["publish-plan", "--candidate-ref", sha]);
  const remote = fs.mkdtempSync(path.join(os.tmpdir(), "sdk-tags-"));
  t.after(() => fs.rmSync(remote, { recursive: true, force: true }));
  execFileSync("git", ["init", "--bare", remote], { stdio: "pipe" });
  r.git("remote", "add", "origin", remote);
  const commands = fakePublishCommands(r);
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = r.run(["finalize", "--plan-env", "PLAN"], {
      ...commands.env,
      PLAN: JSON.stringify(plan),
    });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.equal(commands.state().releases.length, 2);
  assert.match(commands.state().releases[0].notes, /A public change/);
  for (const name of ["core", "ui"])
    assert.equal(
      r
        .git(
          "ls-remote",
          "--tags",
          "origin",
          `refs/tags/@lightsparkdev/${name}@0.1.1`,
        )
        .split(/\s/)[0],
      sha,
    );
  r.git("tag", "-f", "@lightsparkdev/core@0.1.1", `${sha}^`);
  r.git("push", "--force", "origin", "refs/tags/@lightsparkdev/core@0.1.1");
  assert.match(
    r.run(["finalize", "--plan-env", "PLAN"], {
      ...commands.env,
      PLAN: JSON.stringify(plan),
    }).stderr,
    /different commit/,
  );
});

test("missing or timed-out npm metadata prevents finalization and has bounded retries", (t) => {
  for (const missing of [{ status: 404 }, { timeout: true }]) {
    const r = repository(t);
    const sha = r.candidate();
    const plan = r.json(["publish-plan", "--candidate-ref", sha]);
    r.published("0.1.1", sha);
    r.registry["@lightsparkdev/ui/0.1.1"] = missing;
    const commands = fakePublishCommands(r);
    const result = r.run(["finalize", "--plan-env", "PLAN"], {
      ...commands.env,
      PLAN: JSON.stringify(plan),
    });
    assert.notEqual(result.status, 0);
    assert.match(
      result.stderr,
      /Packages remain unpublished|failed after retries/,
    );
    assert.equal(commands.state().releases.length, 0);
    assert.equal(r.git("tag", "--list"), "");
    assert.ok((result.stderr.match(/retrying in/g) || []).length <= 10);
  }
});

test("a new PR needs its own nonempty public Changeset, even when main already has notes", (t) => {
  const r = repository(t, true);
  r.write(
    ".changeset/previous.md",
    '---\n"@lightsparkdev/core": patch\n---\nOlder public change.\n',
  );
  const base = r.commit("Pending release note on main");
  r.write("packages/core/source.ts", "New behavior\n");
  let head = r.commit("New change without release note");
  let result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Add a new Changeset/);
  assert.equal(
    r.run([
      "changeset-policy",
      "--base-commit",
      base,
      "--head-commit",
      head,
      "--exempt",
    ]).status,
    0,
  );
  r.write(
    ".changeset/new.md",
    '---\n"@lightsparkdev/core": patch\n---\nNew public behavior.\n',
  );
  head = r.commit("Describe the new change");
  assert.equal(
    r.run(["changeset-policy", "--base-commit", base, "--head-commit", head])
      .status,
    0,
  );
  r.write(".changeset/new.md", '---\n"@lightsparkdev/core": patch\n---\n');
  head = r.commit("Invalid empty summary");
  result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
    "--exempt",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /nonempty public description/);
});

test("major and Changeset policies do not require unrelated PRs to rebase", (t) => {
  const r = repository(t, true);
  const base = r.git("rev-parse", "HEAD");
  r.git("checkout", "-b", "unrelated");
  r.write("documentation.md", "Unrelated documentation\n");
  const head = r.commit("Unrelated work");
  r.git("checkout", "main");
  const latest = r.candidate("1.0.0");
  r.git("checkout", "unrelated");
  const plan = r.json([
    "version-policy-plan",
    "--base-root",
    r.root,
    "--head-root",
    r.root,
    "--base-commit",
    latest,
    "--head-commit",
    head,
  ]);
  assert.equal(plan.hasMajor, false);
  assert.deepEqual(plan.versionChanges, []);
  assert.equal(plan.baseCommit, base);
  assert.equal(
    r.run(["changeset-policy", "--base-commit", latest, "--head-commit", head])
      .status,
    0,
  );
  r.git("checkout", "main");
  assert.equal(
    r.json([
      "version-policy-plan",
      "--base-root",
      r.root,
      "--head-root",
      r.root,
      "--base-commit",
      base,
      "--head-commit",
      latest,
    ]).hasMajor,
    true,
  );
});

test("Changeset exemptions never permit an invalid candidate or manual version bump", (t) => {
  const r = repository(t, true);
  const base = r.git("rev-parse", "HEAD");
  r.write("packages/core/package.json", r.pkg("core", "0.1.1"));
  let head = r.commit("Manual version bump");
  let result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
    "--exempt",
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /matching release-candidate/);
  head = r.candidate();
  result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
  ]);
  assert.equal(result.status, 0, result.stderr);
});

test("version candidates cannot smuggle package scripts or unrelated dependency updates", (t) => {
  const r = repository(t, true);
  const base = r.git("rev-parse", "HEAD");
  r.candidate();
  r.write(
    "packages/core/package.json",
    r.pkg("core", "0.1.1", { scripts: { prepack: "unexpected-command" } }),
  );
  const head = r.commit("Change build behavior inside a version candidate");
  const result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
  ]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /non-version metadata changes/);
});

test("new public packages start at zero with a Changeset before their version PR", (t) => {
  const r = repository(t);
  const base = r.git("rev-parse", "HEAD");
  r.write("packages/new-package/package.json", r.pkg("new-package", "0.0.0"));
  r.write("packages/new-package/index.js", "module.exports = {};\n");
  r.write(
    ".changeset/new-package.md",
    '---\n"@lightsparkdev/new-package": patch\n---\nAdd the new package.\n',
  );
  const head = r.commit("Introduce new public package");
  const result = r.run([
    "changeset-policy",
    "--base-commit",
    base,
    "--head-commit",
    head,
  ]);
  assert.equal(result.status, 0, result.stderr);
});

test("public packages cannot depend on private runtime workspaces", (t) => {
  const r = repository(t, true);
  r.write(
    "packages/core/package.json",
    r.pkg("core", "0.1.0", {
      dependencies: { "@lightsparkdev/private-ui": "0.0.0" },
    }),
  );
  const result = r.run(["validate-workspaces"]);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /published dependency on private workspace/);
});

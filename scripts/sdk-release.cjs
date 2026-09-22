#!/usr/bin/env node

const childProcess = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { isDeepStrictEqual } = require("util");

const JS_ROOT = path.resolve(__dirname, "..");
const ROOT = gitOutput(JS_ROOT, ["rev-parse", "--show-toplevel"]);
const NPM_REGISTRY = "https://registry.npmjs.org";
const PUBLIC_REPOSITORY = "git+https://github.com/lightsparkdev/js-sdk.git";
const RELEASE_CANDIDATE_FILE = "release-candidate.json";
const PREPARED_RELEASE_PATHS = [
  ".github/workflows/js-sdk-publish.yml",
  "yarn.lock",
];
const REGISTRY_VISIBILITY_ATTEMPTS = 11;
const REGISTRY_VISIBILITY_INITIAL_DELAY_MS = 2_000;
const REGISTRY_VISIBILITY_MAX_DELAY_MS = 15_000;
const REGISTRY_VISIBILITY_TIMEOUT_MS = 120_000;
const REGISTRY_REQUEST_TIMEOUT_MS = 15_000;
const PUBLISHED_DEPENDENCY_FIELDS = [
  "dependencies",
  "optionalDependencies",
  "peerDependencies",
];

class RegistryRequestError extends Error {
  constructor(message, options = {}) {
    super(message, { cause: options.cause });
    this.name = "RegistryRequestError";
    this.retryable = options.retryable === true;
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function gitOutput(root, args, options = {}) {
  const result = childProcess.spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    if (options.allowFailure) return null;
    throw new Error(
      `git ${args.join(" ")} failed: ${
        result.stderr.trim() || `exit ${result.status}`
      }`,
    );
  }
  return result.stdout.trim();
}

function parseSemver(version) {
  const match = String(version).match(
    /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  );
  if (!match) {
    throw new Error(`Invalid semantic version: ${version}`);
  }
  const prerelease = match[4] ? match[4].split(".") : [];
  if (
    prerelease.some(
      (identifier) =>
        /^\d+$/.test(identifier) &&
        identifier.length > 1 &&
        identifier[0] === "0",
    )
  ) {
    throw new Error(`Invalid semantic version: ${version}`);
  }
  return {
    major: BigInt(match[1]),
    minor: BigInt(match[2]),
    patch: BigInt(match[3]),
    prerelease,
  };
}

function comparePrerelease(left, right) {
  if (!left.length && !right.length) return 0;
  if (!left.length) return 1;
  if (!right.length) return -1;

  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const leftPart = left[index];
    const rightPart = right[index];
    if (leftPart === undefined) return -1;
    if (rightPart === undefined) return 1;
    if (leftPart === rightPart) continue;

    const leftNumeric = /^\d+$/.test(leftPart);
    const rightNumeric = /^\d+$/.test(rightPart);
    if (leftNumeric && rightNumeric) {
      return BigInt(leftPart) < BigInt(rightPart) ? -1 : 1;
    }
    if (leftNumeric !== rightNumeric) {
      return leftNumeric ? -1 : 1;
    }
    return leftPart < rightPart ? -1 : 1;
  }
  return 0;
}

function compareSemver(leftVersion, rightVersion) {
  const left = parseSemver(leftVersion);
  const right = parseSemver(rightVersion);
  for (const field of ["major", "minor", "patch"]) {
    if (left[field] !== right[field]) {
      return left[field] < right[field] ? -1 : 1;
    }
  }
  return comparePrerelease(left.prerelease, right.prerelease);
}

function workspacePatterns(packageJson) {
  const workspaces = Array.isArray(packageJson.workspaces)
    ? packageJson.workspaces
    : packageJson.workspaces?.packages;
  if (!Array.isArray(workspaces) || !workspaces.length) {
    throw new Error("JS root package.json must declare workspaces");
  }
  return workspaces;
}

function normalizeRepositoryUrl(repository) {
  if (typeof repository === "string") return repository;
  if (repository && typeof repository.url === "string") return repository.url;
  return undefined;
}

function validatePublishedDependencies(packageJson) {
  for (const field of PUBLISHED_DEPENDENCY_FIELDS) {
    for (const [dependency, specifier] of Object.entries(
      packageJson[field] || {},
    )) {
      if (String(specifier).startsWith("workspace:")) {
        throw new Error(
          `${packageJson.name} ${field}.${dependency} uses ${specifier}; publishable dependencies must use npm-compatible version ranges`,
        );
      }
    }
  }
}

function jsDirectory(root) {
  return fs.existsSync(path.join(root, "js/package.json"))
    ? path.join(root, "js")
    : root;
}

function candidatePath(root) {
  return path.posix.join(
    path.relative(root, jsDirectory(root)).split(path.sep).join("/"),
    RELEASE_CANDIDATE_FILE,
  );
}

function workspaceDirectories(packageJson, listDirectories) {
  const patterns = workspacePatterns(packageJson);
  const excluded = patterns
    .filter((pattern) => pattern.startsWith("!"))
    .map((pattern) => pattern.slice(1));
  const directories = new Set();
  for (const pattern of patterns.filter((value) => !value.startsWith("!"))) {
    if (!/^[a-zA-Z0-9_/-]+\/\*$/.test(pattern))
      throw new Error(`Unsupported workspace pattern: ${pattern}`);
    const parent = pattern.slice(0, -2);
    for (const child of listDirectories(parent)) {
      const directory = `${parent}/${child}`;
      if (!excluded.includes(directory)) directories.add(directory);
    }
  }
  return [...directories].sort();
}

function validateWorkspace(packageJson, directory) {
  if (packageJson.private === true) return null;
  if (
    !/^packages\/[^/]+$/.test(directory) ||
    directory === "packages/private"
  ) {
    throw new Error(`Non-public workspace ${directory} must set private: true`);
  }
  if (
    !/^@lightsparkdev\/[a-z0-9-]+$/.test(packageJson.name) ||
    !packageJson.version
  ) {
    throw new Error(
      `Invalid publishable package name or version at ${directory}`,
    );
  }
  parseSemver(packageJson.version);
  validatePublishedDependencies(packageJson);
  if (
    normalizeRepositoryUrl(packageJson.repository) !== PUBLIC_REPOSITORY ||
    packageJson.repository.directory !== directory
  ) {
    throw new Error(
      `${packageJson.name} repository must be ${PUBLIC_REPOSITORY} with directory ${directory}`,
    );
  }
  return { name: packageJson.name, version: packageJson.version, directory };
}

function validateWorkspaceSet(manifests) {
  const privateNames = new Set(
    manifests
      .filter(({ packageJson }) => packageJson.private === true)
      .map(({ packageJson }) => packageJson.name),
  );
  const names = new Set();
  const workspaces = [];
  for (const { packageJson, directory } of manifests) {
    if (names.has(packageJson.name))
      throw new Error(`Duplicate workspace name: ${packageJson.name}`);
    names.add(packageJson.name);
    const workspace = validateWorkspace(packageJson, directory);
    if (!workspace) continue;
    for (const field of PUBLISHED_DEPENDENCY_FIELDS) {
      for (const dependency of Object.keys(packageJson[field] || {})) {
        if (privateNames.has(dependency))
          throw new Error(
            `${workspace.name} has a published dependency on private workspace ${dependency}`,
          );
      }
    }
    workspaces.push(workspace);
  }
  return workspaces.sort((a, b) => a.name.localeCompare(b.name));
}

function listPublishableWorkspaces(jsRoot = JS_ROOT) {
  if (fs.lstatSync(jsRoot).isSymbolicLink())
    throw new Error("JS workspace must not be a symlink");
  const directories = workspaceDirectories(
    readJson(path.join(jsRoot, "package.json")),
    (parent) => {
      const full = path.join(jsRoot, parent);
      if (!fs.existsSync(full)) return [];
      return fs
        .readdirSync(full, { withFileTypes: true })
        .filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
        .map((entry) => entry.name);
    },
  );
  const manifests = [];
  for (const directory of directories) {
    const full = path.join(jsRoot, directory);
    const manifest = path.join(full, "package.json");
    if (!fs.existsSync(manifest)) continue;
    if (
      fs.realpathSync(full) !== path.join(fs.realpathSync(jsRoot), directory) ||
      fs.lstatSync(manifest).isSymbolicLink()
    ) {
      throw new Error(`Workspace metadata must not be a symlink: ${directory}`);
    }
    manifests.push({ packageJson: readJson(manifest), directory });
  }
  return validateWorkspaceSet(manifests);
}

function readJsonAtRef(root, ref, relativePath, options = {}) {
  const content = gitOutput(root, ["show", `${ref}:${relativePath}`], {
    allowFailure: options.allowMissing === true,
  });
  if (content === null) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(
      `${relativePath} at ${ref} is invalid JSON: ${error.message}`,
    );
  }
}

function listPublishableWorkspacesAtRef(root, ref) {
  const prefix = path
    .relative(root, jsDirectory(root))
    .split(path.sep)
    .join("/");
  const rootPackageJson = readJsonAtRef(
    root,
    ref,
    path.posix.join(prefix, "package.json"),
  );
  const directories = workspaceDirectories(rootPackageJson, (parent) => {
    const entries = gitOutput(
      root,
      ["ls-tree", "--name-only", `${ref}:${path.posix.join(prefix, parent)}`],
      { allowFailure: true },
    );
    return entries ? entries.split("\n") : [];
  });
  const manifests = directories
    .map((directory) => {
      const manifest = path.posix.join(prefix, directory, "package.json");
      const entry = gitOutput(root, ["ls-tree", ref, "--", manifest]);
      if (entry.startsWith("120000"))
        throw new Error(
          `Workspace metadata must not be a symlink: ${directory}`,
        );
      const packageJson = readJsonAtRef(root, ref, manifest, {
        allowMissing: true,
      });
      return packageJson ? { packageJson, directory } : null;
    })
    .filter(Boolean);
  return validateWorkspaceSet(manifests);
}

function buildReleaseCandidate(baseWorkspaces, headWorkspaces) {
  const baseByName = new Map(
    baseWorkspaces.map((workspace) => [workspace.name, workspace]),
  );
  const headByName = new Map(
    headWorkspaces.map((workspace) => [workspace.name, workspace]),
  );
  const packages = [];

  for (const workspace of baseWorkspaces) {
    const headWorkspace = headByName.get(workspace.name);
    if (!headWorkspace) {
      throw new Error(
        `Version Packages removed publishable workspace ${workspace.name}`,
      );
    }
    if (headWorkspace.directory !== workspace.directory) {
      throw new Error(
        `Version Packages moved ${workspace.name} from ${workspace.directory} to ${headWorkspace.directory}`,
      );
    }
  }

  for (const workspace of headWorkspaces) {
    const previousVersion = baseByName.get(workspace.name)?.version || null;
    if (previousVersion === workspace.version) continue;
    if (parseSemver(workspace.version).prerelease.length) {
      throw new Error(
        `${workspace.name}@${workspace.version} cannot be recorded as a stable release candidate`,
      );
    }
    if (
      previousVersion &&
      compareSemver(workspace.version, previousVersion) <= 0
    ) {
      throw new Error(
        `${workspace.name}@${workspace.version} must be newer than candidate base ${previousVersion}`,
      );
    }
    packages.push({
      name: workspace.name,
      previousVersion,
      version: workspace.version,
      directory: workspace.directory,
    });
  }

  if (!packages.length) {
    throw new Error(
      "Version Packages did not change any publishable package versions",
    );
  }
  return {
    schemaVersion: 1,
    channel: "stable",
    npmTag: "latest",
    packages,
  };
}

function normalizeReleaseCandidate(candidate) {
  if (!candidate || candidate.schemaVersion !== 1) {
    throw new Error("Release candidate must use schemaVersion 1");
  }
  if (candidate.channel !== "stable" || candidate.npmTag !== "latest") {
    throw new Error("Release candidate must currently use stable/latest");
  }
  if (!Array.isArray(candidate.packages) || !candidate.packages.length) {
    throw new Error("Release candidate must contain at least one package");
  }

  const names = new Set();
  const packages = candidate.packages.map((packageRelease) => {
    const { name, previousVersion, version, directory } = packageRelease || {};
    if (!name || !version || !directory) {
      throw new Error(
        "Release candidate package entries require name, version, and directory",
      );
    }
    if (names.has(name)) {
      throw new Error(`Release candidate contains duplicate package ${name}`);
    }
    names.add(name);
    if (parseSemver(version).prerelease.length) {
      throw new Error(
        `${name}@${version} cannot be recorded as a stable release candidate`,
      );
    }
    if (previousVersion !== null) {
      parseSemver(previousVersion);
      if (compareSemver(version, previousVersion) <= 0) {
        throw new Error(
          `${name}@${version} must be newer than candidate base ${previousVersion}`,
        );
      }
    }
    if (
      typeof directory !== "string" ||
      !/^packages\/[^/]+$/.test(directory) ||
      directory === "packages/private" ||
      directory.includes("..") ||
      path.posix.normalize(directory) !== directory
    ) {
      throw new Error(`Release candidate has invalid directory ${directory}`);
    }
    return { name, previousVersion, version, directory };
  });
  const sorted = [...packages].sort((left, right) =>
    left.name.localeCompare(right.name),
  );
  if (!isDeepStrictEqual(packages, sorted)) {
    throw new Error("Release candidate packages must be sorted by name");
  }
  return {
    schemaVersion: 1,
    channel: "stable",
    npmTag: "latest",
    packages,
  };
}

function validateReleaseCandidateAtRef(root, ref, options = {}) {
  const commit = gitOutput(root, ["rev-parse", `${ref}^{commit}`]);
  const commitLine = gitOutput(root, [
    "rev-list",
    "--parents",
    "-n",
    "1",
    commit,
  ]);
  const parts = commitLine.split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(`Release candidate ${commit} must have exactly one parent`);
  }
  const baseCommit = parts[1];
  const candidateJson = readJsonAtRef(root, commit, candidatePath(root), {
    allowMissing: true,
  });
  if (candidateJson === null) {
    if (options.allowMissing === true) return null;
    throw new Error(`Release candidate manifest is missing at ${commit}`);
  }
  const candidate = normalizeReleaseCandidate(candidateJson);
  const expected = buildReleaseCandidate(
    listPublishableWorkspacesAtRef(root, baseCommit),
    listPublishableWorkspacesAtRef(root, commit),
  );
  if (!isDeepStrictEqual(candidate, expected)) {
    throw new Error(
      `Release candidate manifest at ${commit} does not match its package version changes`,
    );
  }
  const changedFiles = gitOutput(root, [
    "diff",
    "--name-only",
    baseCommit,
    commit,
    "--",
    candidatePath(root),
  ]);
  if (changedFiles !== candidatePath(root)) {
    throw new Error(
      `Release candidate manifest was not introduced by ${commit}`,
    );
  }
  return { commit, baseCommit, candidate };
}

async function selectReleaseCandidate(options = {}) {
  const root = options.root || ROOT;
  const ref = options.ref || "HEAD";
  const commitsOutput = gitOutput(root, [
    "rev-list",
    "--first-parent",
    "--reverse",
    ref,
    "--",
    candidatePath(root),
  ]);
  const commits = commitsOutput ? commitsOutput.split("\n") : [];
  if (options.exactCommit) {
    const exactCommit = gitOutput(root, [
      "rev-parse",
      `${options.exactCommit}^{commit}`,
    ]);
    if (!commits.includes(exactCommit)) {
      throw new Error(
        `Release candidate ${exactCommit} is not on the first-parent history of ${ref}`,
      );
    }
    return validateReleaseCandidateAtRef(root, exactCommit);
  }

  const metadataByName = new Map();

  for (const commit of commits) {
    const release = validateReleaseCandidateAtRef(root, commit, {
      allowMissing: true,
    });
    if (release === null) continue;
    let pending = false;
    for (const packageRelease of release.candidate.packages) {
      if (!metadataByName.has(packageRelease.name)) {
        metadataByName.set(
          packageRelease.name,
          await (options.fetchRegistryMetadata || fetchRegistryMetadata)(
            packageRelease.name,
          ),
        );
      }
      const metadata = metadataByName.get(packageRelease.name);
      if (!Object.hasOwn(metadata.versions || {}, packageRelease.version)) {
        pending = true;
      }
    }
    if (pending) return release;
  }
  return null;
}

function verifyPreparedRelease(root, sourceRef, releaseRef = "HEAD") {
  const source = validateReleaseCandidateAtRef(root, sourceRef);
  const releaseCommit = gitOutput(root, [
    "rev-parse",
    `${releaseRef}^{commit}`,
  ]);
  if (releaseCommit === source.commit) {
    return { ...source, releaseCommit };
  }
  const commitLine = gitOutput(root, [
    "rev-list",
    "--parents",
    "-n",
    "1",
    releaseCommit,
  ]);
  const parts = commitLine.split(/\s+/);
  if (parts.length !== 2) {
    throw new Error(
      `Prepared release ${releaseCommit} must have exactly one parent`,
    );
  }
  const parent = parts[1];
  if (parent !== source.commit) {
    throw new Error(
      `Prepared release ${releaseCommit} must directly descend from source ${source.commit}`,
    );
  }
  const changedFiles = gitOutput(root, [
    "diff",
    "--name-only",
    source.commit,
    releaseCommit,
  ])
    .split("\n")
    .filter(Boolean);
  const unexpectedFiles = changedFiles.filter(
    (file) => !PREPARED_RELEASE_PATHS.includes(file),
  );
  if (!changedFiles.length || unexpectedFiles.length) {
    throw new Error(
      `Prepared release may only change ${PREPARED_RELEASE_PATHS.join(
        " or ",
      )}; changed ${changedFiles.join(", ") || "nothing"}`,
    );
  }
  return { ...source, releaseCommit };
}

async function fetchRegistryMetadata(name, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(
    `${NPM_REGISTRY}/${encodeURIComponent(name)}`,
    {
      headers: { Accept: "application/vnd.npm.install-v1+json" },
      signal: AbortSignal.timeout(REGISTRY_REQUEST_TIMEOUT_MS),
    },
  );
  if (response.status === 404) {
    return { versions: {}, "dist-tags": {} };
  }
  if (!response.ok) {
    throw new Error(`npm registry returned ${response.status} for ${name}`);
  }
  return response.json();
}

async function fetchRegistryVersionMetadata(
  name,
  version,
  fetchImpl = globalThis.fetch,
  options = {},
) {
  const cacheBust = Date.now();
  const requestTimeoutMs =
    options.requestTimeoutMs ?? REGISTRY_REQUEST_TIMEOUT_MS;
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1) {
    throw new Error("requestTimeoutMs must be a positive integer");
  }
  let response;
  try {
    response = await fetchImpl(
      `${NPM_REGISTRY}/${encodeURIComponent(name)}/${encodeURIComponent(
        version,
      )}?sdk-release=${cacheBust}`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          "Cache-Control": "no-cache",
        },
        signal: AbortSignal.timeout(requestTimeoutMs),
      },
    );
  } catch (error) {
    throw new RegistryRequestError(
      `npm registry request failed for ${name}@${version}: ${error.message}`,
      { cause: error, retryable: true },
    );
  }
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new RegistryRequestError(
      `npm registry returned ${response.status} for ${name}@${version}`,
      {
        retryable:
          response.status === 408 ||
          response.status === 429 ||
          response.status >= 500,
      },
    );
  }
  let metadata;
  try {
    metadata = await response.json();
  } catch (error) {
    throw new RegistryRequestError(
      `npm registry returned unreadable metadata for ${name}@${version}`,
      { cause: error, retryable: true },
    );
  }
  if (metadata.name !== name || metadata.version !== version) {
    throw new Error(
      `npm registry returned mismatched metadata for ${name}@${version}`,
    );
  }
  return metadata;
}

function latestPublishedVersion(metadata) {
  return Object.keys(metadata.versions || {})
    .sort(compareSemver)
    .at(-1);
}

function latestPublishedStableVersion(metadata) {
  return Object.keys(metadata.versions || {})
    .filter((version) => parseSemver(version).prerelease.length === 0)
    .sort(compareSemver)
    .at(-1);
}

function classifyUnpublishedVersion(
  workspace,
  metadata,
  allowHistoricalPublished = false,
) {
  if (!metadata) {
    throw new Error(`Missing npm registry metadata for ${workspace.name}`);
  }
  const publishedVersions = Object.keys(metadata.versions || {});
  const previousVersion = latestPublishedVersion(metadata);
  if (
    allowHistoricalPublished &&
    publishedVersions.includes(workspace.version)
  ) {
    return null;
  }
  if (
    previousVersion &&
    compareSemver(workspace.version, previousVersion) < 0
  ) {
    throw new Error(
      `${workspace.name}@${workspace.version} is behind npm ${previousVersion}`,
    );
  }
  if (publishedVersions.includes(workspace.version)) return null;
  if (
    previousVersion &&
    compareSemver(workspace.version, previousVersion) === 0
  ) {
    throw new Error(
      `${workspace.name}@${workspace.version} is unpublished but is not newer than npm ${previousVersion}`,
    );
  }

  const previousStableVersion = latestPublishedStableVersion(metadata);
  const previousStableMajor = previousStableVersion
    ? parseSemver(previousStableVersion).major
    : 0n;
  return {
    previousVersion: previousVersion || null,
    previousStableVersion: previousStableVersion || null,
    major: parseSemver(workspace.version).major > previousStableMajor,
  };
}

function buildCandidatePolicyPlan(release, registryMetadata) {
  const packages = [];
  for (const packageRelease of release.candidate.packages) {
    const classification = classifyUnpublishedVersion(
      packageRelease,
      registryMetadata.get(packageRelease.name),
      true,
    );
    if (!classification) continue;
    packages.push({
      name: packageRelease.name,
      version: packageRelease.version,
      previousStableVersion: classification.previousStableVersion,
      major: classification.major,
    });
  }
  return {
    schemaVersion: 1,
    sourceCommit: release.commit,
    channel: release.candidate.channel,
    npmTag: release.candidate.npmTag,
    hasMajor: packages.some((packageRelease) => packageRelease.major),
    packages,
  };
}

async function createCandidatePolicyPlan(options = {}) {
  const root = options.root || ROOT;
  const release = validateReleaseCandidateAtRef(root, options.candidateRef);
  const registryMetadata = new Map(
    await Promise.all(
      release.candidate.packages.map(async (packageRelease) => [
        packageRelease.name,
        await (options.fetchRegistryMetadata || fetchRegistryMetadata)(
          packageRelease.name,
        ),
      ]),
    ),
  );
  return buildCandidatePolicyPlan(release, registryMetadata);
}

async function findPublishedCandidateCommit(options = {}) {
  const root = options.root || ROOT;
  const release = validateReleaseCandidateAtRef(root, options.candidateRef);
  const publishedPackages = [];

  for (const packageRelease of release.candidate.packages) {
    const metadata = await (
      options.fetchRegistryVersionMetadata || fetchRegistryVersionMetadata
    )(packageRelease.name, packageRelease.version);
    if (!metadata) continue;
    if (
      typeof metadata.gitHead !== "string" ||
      !/^[0-9a-fA-F]{40}$/.test(metadata.gitHead)
    ) {
      throw new Error(
        `${packageRelease.name}@${packageRelease.version} has no valid npm gitHead`,
      );
    }
    publishedPackages.push({
      name: packageRelease.name,
      version: packageRelease.version,
      gitHead: metadata.gitHead.toLowerCase(),
    });
  }

  const releaseCommits = new Set(
    publishedPackages.map((packageRelease) => packageRelease.gitHead),
  );
  if (releaseCommits.size > 1) {
    throw new Error(
      `Candidate package versions were published from multiple commits: ${[
        ...releaseCommits,
      ].join(", ")}`,
    );
  }
  return {
    sourceCommit: release.commit,
    releaseCommit: releaseCommits.values().next().value || null,
    publishedPackages,
  };
}

function buildPublishPlan(
  workspaces,
  registryMetadata,
  commit,
  reconcile = false,
  allowHistoricalPublished = false,
) {
  const publishCandidates = [];

  for (const workspace of workspaces) {
    const classification = classifyUnpublishedVersion(
      workspace,
      registryMetadata.get(workspace.name),
      allowHistoricalPublished,
    );
    if (!classification) continue;
    publishCandidates.push({
      ...workspace,
      previousVersion: classification.previousVersion,
      major: classification.major,
      tag: `${workspace.name}@${workspace.version}`,
    });
  }

  const finalizationPackages = reconcile
    ? workspaces.map((workspace) => ({
        ...workspace,
        tag: `${workspace.name}@${workspace.version}`,
      }))
    : publishCandidates.map(
        ({ previousVersion, major, ...workspace }) => workspace,
      );

  return {
    schemaVersion: 1,
    commit,
    reconcile,
    hasMajor: publishCandidates.some((candidate) => candidate.major),
    publishCandidates,
    finalizationPackages,
  };
}

async function createPublishPlan(options = {}) {
  const root = options.root || ROOT;
  const jsRoot = options.jsRoot || jsDirectory(root);
  const workspaces = listPublishableWorkspaces(jsRoot, root);
  const metadataByName = new Map();
  const getRegistryMetadata = async (name) => {
    if (!metadataByName.has(name)) {
      metadataByName.set(
        name,
        await (options.fetchRegistryMetadata || fetchRegistryMetadata)(name),
      );
    }
    return metadataByName.get(name);
  };
  const registryMetadata = new Map(
    await Promise.all(
      workspaces.map(async (workspace) => [
        workspace.name,
        await getRegistryMetadata(workspace.name),
      ]),
    ),
  );
  const commit =
    options.commit ||
    childProcess
      .execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: root,
        encoding: "utf8",
      })
      .trim();
  const plan = buildPublishPlan(
    workspaces,
    registryMetadata,
    commit,
    options.reconcile === true,
    Boolean(options.candidateRef),
  );
  if (!options.candidateRef) return plan;
  if (options.reconcile === true) {
    throw new Error(
      "Exact release candidates are retried directly and do not use --reconcile",
    );
  }

  const release = verifyPreparedRelease(root, options.candidateRef, commit);
  const candidateCommitsOutput = gitOutput(root, [
    "rev-list",
    "--first-parent",
    "--reverse",
    release.commit,
    "--",
    candidatePath(root),
  ]);
  const candidateCommits = candidateCommitsOutput
    ? candidateCommitsOutput.split("\n")
    : [];
  for (const candidateCommit of candidateCommits) {
    if (candidateCommit === release.commit) break;
    const predecessor = validateReleaseCandidateAtRef(root, candidateCommit, {
      allowMissing: true,
    });
    if (predecessor === null) continue;
    const unpublished = [];
    for (const packageRelease of predecessor.candidate.packages) {
      const metadata = await getRegistryMetadata(packageRelease.name);
      if (!Object.hasOwn(metadata.versions || {}, packageRelease.version)) {
        unpublished.push(`${packageRelease.name}@${packageRelease.version}`);
      }
    }
    if (unpublished.length) {
      throw new Error(
        `Earlier release candidate ${candidateCommit} remains unpublished: ${unpublished.join(
          ", ",
        )}`,
      );
    }
  }

  const candidatePackages = new Map(
    release.candidate.packages.map((packageRelease) => [
      `${packageRelease.name}@${packageRelease.version}`,
      packageRelease,
    ]),
  );
  const workspacesByName = new Map(
    workspaces.map((workspace) => [workspace.name, workspace]),
  );
  for (const packageRelease of release.candidate.packages) {
    const workspace = workspacesByName.get(packageRelease.name);
    if (
      !workspace ||
      workspace.version !== packageRelease.version ||
      workspace.directory !== packageRelease.directory
    ) {
      throw new Error(
        `Prepared release does not match ${packageRelease.name}@${packageRelease.version}`,
      );
    }
    const registryPackage = await getRegistryMetadata(packageRelease.name);
    if (Object.hasOwn(registryPackage.versions || {}, packageRelease.version)) {
      const published = await (
        options.fetchRegistryVersionMetadata || fetchRegistryVersionMetadata
      )(packageRelease.name, packageRelease.version);
      if (!published?.gitHead) {
        throw new Error(
          `${packageRelease.name}@${packageRelease.version} has no npm gitHead`,
        );
      }
      if (published.gitHead !== release.releaseCommit) {
        throw new Error(
          `${packageRelease.name}@${packageRelease.version} was published from ${published.gitHead}, not release commit ${release.releaseCommit}`,
        );
      }
    }
  }
  const unplanned = plan.publishCandidates.filter(
    (packageRelease) =>
      !candidatePackages.has(
        `${packageRelease.name}@${packageRelease.version}`,
      ),
  );
  if (unplanned.length) {
    throw new Error(
      `Unplanned unpublished package versions: ${unplanned
        .map(({ name, version }) => `${name}@${version}`)
        .join(", ")}`,
    );
  }

  const publishCandidates = plan.publishCandidates.filter((packageRelease) =>
    candidatePackages.has(`${packageRelease.name}@${packageRelease.version}`),
  );
  const finalizationPackages = release.candidate.packages.map(
    ({ previousVersion, ...packageRelease }) => ({
      ...packageRelease,
      tag: `${packageRelease.name}@${packageRelease.version}`,
    }),
  );
  return {
    ...plan,
    schemaVersion: 2,
    sourceCommit: release.commit,
    channel: release.candidate.channel,
    npmTag: release.candidate.npmTag,
    hasMajor: publishCandidates.some((candidate) => candidate.major),
    publishCandidates,
    finalizationPackages,
  };
}

function assertPublishPlanProgress(authorizedPlan, currentPlan) {
  if (authorizedPlan?.schemaVersion !== 2 || currentPlan?.schemaVersion !== 2) {
    if (!isDeepStrictEqual(authorizedPlan, currentPlan)) {
      throw new Error(
        "The npm release plan changed after preflight; rerun the workflow",
      );
    }
    return;
  }

  const immutableFields = [
    "schemaVersion",
    "commit",
    "reconcile",
    "sourceCommit",
    "channel",
    "npmTag",
    "finalizationPackages",
  ];
  for (const field of immutableFields) {
    if (!isDeepStrictEqual(authorizedPlan[field], currentPlan[field])) {
      throw new Error(
        `The npm release plan changed immutable field ${field}; rerun preparation`,
      );
    }
  }

  const authorizedCandidates = authorizedPlan.publishCandidates || [];
  const unauthorizedCandidates = (currentPlan.publishCandidates || []).filter(
    (candidate) =>
      !authorizedCandidates.some((authorizedCandidate) =>
        isDeepStrictEqual(authorizedCandidate, candidate),
      ),
  );
  if (unauthorizedCandidates.length) {
    throw new Error(
      `The npm release plan added unauthorized candidates: ${unauthorizedCandidates
        .map(({ name, version }) => `${name}@${version}`)
        .join(", ")}`,
    );
  }
  if (currentPlan.hasMajor === true && authorizedPlan.hasMajor !== true) {
    throw new Error("The npm release plan added an unauthorized major release");
  }
}

function buildVersionPolicyPlan(
  baseWorkspaces,
  headWorkspaces,
  registryMetadata,
  baseCommit,
  headCommit,
) {
  const baseByName = new Map(
    baseWorkspaces.map((workspace) => [workspace.name, workspace]),
  );
  const changedWorkspaces = [];
  const versionChanges = [];

  for (const workspace of headWorkspaces) {
    const baseWorkspace = baseByName.get(workspace.name);
    if (baseWorkspace?.version === workspace.version) continue;
    if (
      baseWorkspace &&
      compareSemver(workspace.version, baseWorkspace.version) < 0
    ) {
      throw new Error(
        `${workspace.name}@${workspace.version} is behind base ${baseWorkspace.version}`,
      );
    }
    changedWorkspaces.push(workspace);
    versionChanges.push({
      name: workspace.name,
      oldVersion: baseWorkspace?.version || null,
      newVersion: workspace.version,
    });
  }

  const publishPlan = buildPublishPlan(
    changedWorkspaces,
    registryMetadata,
    headCommit,
  );
  return {
    schemaVersion: 1,
    baseCommit,
    headCommit,
    hasMajor: publishPlan.hasMajor,
    versionChanges,
    publishCandidates: publishPlan.publishCandidates,
  };
}

async function createVersionPolicyPlan(options = {}) {
  if (!options.baseRoot || !options.headRoot) {
    throw new Error("Version policy planning requires base and head roots");
  }
  const headRoot = path.resolve(options.headRoot);
  const comparisonBase = gitOutput(headRoot, [
    "merge-base",
    options.baseCommit,
    options.headCommit,
  ]);
  const baseWorkspaces = listPublishableWorkspacesAtRef(
    headRoot,
    comparisonBase,
  );
  const headWorkspaces = listPublishableWorkspacesAtRef(
    headRoot,
    options.headCommit,
  );
  const baseVersions = new Map(
    baseWorkspaces.map(({ name, version }) => [name, version]),
  );
  const changedWorkspaces = headWorkspaces.filter(
    ({ name, version }) => baseVersions.get(name) !== version,
  );
  const registryMetadata = new Map(
    await Promise.all(
      changedWorkspaces.map(async (workspace) => [
        workspace.name,
        await (options.fetchRegistryMetadata || fetchRegistryMetadata)(
          workspace.name,
        ),
      ]),
    ),
  );
  return buildVersionPolicyPlan(
    baseWorkspaces,
    headWorkspaces,
    registryMetadata,
    comparisonBase,
    options.headCommit,
  );
}

function buildChangesetPlan(status) {
  const majorChangesets = [];
  for (const changeset of status.changesets || []) {
    for (const release of changeset.releases || []) {
      if (release.type === "major") {
        majorChangesets.push({ id: changeset.id, name: release.name });
      }
    }
  }
  const majorReleases = (status.releases || [])
    .filter((release) => release.type === "major")
    .map((release) => ({
      name: release.name,
      oldVersion: release.oldVersion,
      newVersion: release.newVersion,
    }));
  return {
    hasMajor: majorChangesets.length > 0 || majorReleases.length > 0,
    majorChangesets,
    majorReleases,
    releases: (status.releases || []).filter(
      (release) => release.type !== "none",
    ),
  };
}

function versionPackages(options = {}) {
  const root = options.root || ROOT;
  const jsRoot = jsDirectory(root);
  const baseWorkspaces = listPublishableWorkspaces(jsRoot, root);
  childProcess.execFileSync("yarn", ["changeset", "version"], {
    cwd: jsRoot,
    stdio: "inherit",
  });
  childProcess.execFileSync("yarn", ["install", "--mode=update-lockfile"], {
    cwd: jsRoot,
    stdio: "inherit",
  });
  const candidate = buildReleaseCandidate(
    baseWorkspaces,
    listPublishableWorkspaces(jsRoot, root),
  );
  fs.writeFileSync(
    path.join(root, candidatePath(root)),
    `${JSON.stringify(candidate, null, 2)}\n`,
  );
}

function orderPublications(packages, jsRoot) {
  const pending = new Map(
    packages.map((pkg) => {
      const manifest = readJson(
        path.join(jsRoot, pkg.directory, "package.json"),
      );
      return [
        pkg.name,
        {
          pkg,
          dependencies: PUBLISHED_DEPENDENCY_FIELDS.flatMap((field) =>
            Object.keys(manifest[field] || {}),
          ),
        },
      ];
    }),
  );
  const ordered = [];
  while (pending.size) {
    const ready = [...pending.values()].filter(
      ({ dependencies }) => !dependencies.some((name) => pending.has(name)),
    );
    if (!ready.length)
      throw new Error(
        `Publication dependency cycle: ${[...pending.keys()].join(", ")}`,
      );
    for (const { pkg } of ready) {
      ordered.push(pkg);
      pending.delete(pkg.name);
    }
  }
  return ordered;
}

function appendGitHubOutputs(filePath, outputs) {
  if (!filePath) return;
  const content = Object.entries(outputs)
    .map(([key, value]) => `${key}=${String(value).replaceAll("\n", "\\n")}`)
    .join("\n");
  fs.appendFileSync(filePath, `${content}\n`);
}

function extractChangelogEntry(content, version) {
  const escapedVersion = version.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const heading = new RegExp(`^## ${escapedVersion}\\s*$`, "m").exec(content);
  if (!heading) {
    throw new Error(`CHANGELOG.md has no entry for ${version}`);
  }
  const following = content.slice(heading.index + heading[0].length);
  const nextHeading = following.search(/^## /m);
  const entry = (
    nextHeading === -1 ? following : following.slice(0, nextHeading)
  ).trim();
  if (!entry) {
    throw new Error(`CHANGELOG.md has no entry for ${version}`);
  }
  return entry;
}

function commandSucceeded(command, args, options = {}) {
  const result = childProcess.spawnSync(command, args, {
    cwd: options.cwd,
    encoding: "utf8",
    stdio: options.capture ? "pipe" : "ignore",
  });
  return {
    success: result.status === 0,
    stdout: result.stdout || "",
    stderr: result.stderr || "",
  };
}

function ensureTag(packageRelease, commit, root = ROOT, options = {}) {
  const preserveExisting = options.preserveExisting === true;
  const remote = commandSucceeded(
    "git",
    [
      "ls-remote",
      "--tags",
      "origin",
      `refs/tags/${packageRelease.tag}`,
      `refs/tags/${packageRelease.tag}^{}`,
    ],
    { cwd: root, capture: true },
  );
  if (!remote.success) {
    throw new Error(
      `Unable to inspect remote tag ${
        packageRelease.tag
      }: ${remote.stderr.trim()}`,
    );
  }
  if (remote.stdout.trim()) {
    const lines = remote.stdout.trim().split("\n");
    const peeled = lines.find((line) => line.endsWith("^{}")) || lines[0];
    if (!preserveExisting && peeled.split(/\s+/)[0] !== commit) {
      throw new Error(
        `Remote tag ${packageRelease.tag} points to a different commit`,
      );
    }
    return;
  }

  const target = commandSucceeded(
    "git",
    ["cat-file", "-e", `${commit}^{commit}`],
    { cwd: root, capture: true },
  );
  if (!target.success) {
    throw new Error(
      `Published npm commit ${commit || "(missing)"} for ${
        packageRelease.tag
      } is not available in the public checkout`,
    );
  }

  const local = commandSucceeded(
    "git",
    ["rev-list", "-n", "1", packageRelease.tag],
    { cwd: root, capture: true },
  );
  if (local.success) {
    if (local.stdout.trim() !== commit) {
      throw new Error(`${packageRelease.tag} points to a different commit`);
    }
  } else {
    childProcess.execFileSync(
      "git",
      ["-c", "tag.gpgsign=false", "tag", packageRelease.tag, commit],
      {
        cwd: root,
        stdio: "inherit",
      },
    );
  }
  childProcess.execFileSync(
    "git",
    ["push", "origin", `refs/tags/${packageRelease.tag}`],
    { cwd: root, stdio: "inherit" },
  );
}

function ensureGitHubRelease(packageRelease, root = ROOT) {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) {
    throw new Error("GITHUB_REPOSITORY is required to create GitHub releases");
  }
  if (
    commandSucceeded(
      "gh",
      ["release", "view", packageRelease.tag, "--repo", repository],
      { cwd: root },
    ).success
  ) {
    return;
  }

  const changelogPath = path.join(
    jsDirectory(root),
    packageRelease.directory,
    "CHANGELOG.md",
  );
  const notes = extractChangelogEntry(
    fs.readFileSync(changelogPath, "utf8"),
    packageRelease.version,
  );
  const notesDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "sdk-release-"));
  const notesPath = path.join(notesDirectory, "notes.md");
  try {
    fs.writeFileSync(notesPath, `${notes}\n`);
    childProcess.execFileSync(
      "gh",
      [
        "release",
        "create",
        packageRelease.tag,
        "--repo",
        repository,
        "--verify-tag",
        "--title",
        `${packageRelease.name} ${packageRelease.version}`,
        "--notes-file",
        notesPath,
      ],
      { cwd: root, stdio: "inherit" },
    );
  } finally {
    fs.rmSync(notesDirectory, { recursive: true, force: true });
  }
}

function verifyReleasePlanCommit(plan, options = {}) {
  const root = options.root || ROOT;
  const currentCommit = (
    options.commit ||
    childProcess.execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: root,
      encoding: "utf8",
    })
  ).trim();
  if (currentCommit !== plan.commit) {
    throw new Error(
      `Release plan commit ${plan.commit} does not match checkout ${currentCommit}`,
    );
  }
}

async function waitForPublishedPackageMetadata(packageReleases, options = {}) {
  const attempts =
    options.registryVisibilityAttempts ?? REGISTRY_VISIBILITY_ATTEMPTS;
  const initialDelayMs =
    options.registryVisibilityInitialDelayMs ??
    REGISTRY_VISIBILITY_INITIAL_DELAY_MS;
  const maxDelayMs =
    options.registryVisibilityMaxDelayMs ?? REGISTRY_VISIBILITY_MAX_DELAY_MS;
  const visibilityTimeoutMs =
    options.registryVisibilityTimeoutMs ?? REGISTRY_VISIBILITY_TIMEOUT_MS;
  const requestTimeoutMs =
    options.registryRequestTimeoutMs ?? REGISTRY_REQUEST_TIMEOUT_MS;
  if (!Number.isInteger(attempts) || attempts < 1) {
    throw new Error("registryVisibilityAttempts must be a positive integer");
  }
  if (
    !Number.isInteger(initialDelayMs) ||
    !Number.isInteger(maxDelayMs) ||
    initialDelayMs < 0 ||
    maxDelayMs < initialDelayMs
  ) {
    throw new Error(
      "registry visibility retry delays must be non-negative and ordered",
    );
  }
  if (!Number.isInteger(visibilityTimeoutMs) || visibilityTimeoutMs < 1) {
    throw new Error("registryVisibilityTimeoutMs must be a positive integer");
  }
  if (!Number.isInteger(requestTimeoutMs) || requestTimeoutMs < 1) {
    throw new Error("registryRequestTimeoutMs must be a positive integer");
  }

  const fetchVersionMetadata = options.fetchRegistryVersionMetadata
    ? options.fetchRegistryVersionMetadata
    : (name, version, fetchOptions) =>
        fetchRegistryVersionMetadata(
          name,
          version,
          globalThis.fetch,
          fetchOptions,
        );
  const sleep =
    options.sleep ||
    ((delayMs) => new Promise((resolve) => setTimeout(resolve, delayMs)));
  const now = options.now || Date.now;
  const logRetry =
    options.logRegistryRetry ||
    ((message) => process.stderr.write(`${message}\n`));
  const validateMetadata =
    options.validateRegistryVersionMetadata || (() => {});
  const metadataByIndex = new Array(packageReleases.length).fill(null);
  let pending = packageReleases.map((packageRelease, index) => ({
    index,
    lastError: null,
    packageRelease,
  }));
  const deadline = now() + visibilityTimeoutMs;

  for (let attempt = 1; pending.length && attempt <= attempts; attempt += 1) {
    const remainingMs = deadline - now();
    if (remainingMs <= 0) break;
    const currentRequestTimeoutMs = Math.max(
      1,
      Math.min(requestTimeoutMs, remainingMs),
    );
    const results = await Promise.all(
      pending.map(async (entry) => {
        try {
          return {
            ...entry,
            error: null,
            metadata: await fetchVersionMetadata(
              entry.packageRelease.name,
              entry.packageRelease.version,
              { requestTimeoutMs: currentRequestTimeoutMs },
            ),
          };
        } catch (error) {
          return { ...entry, error, metadata: null };
        }
      }),
    );
    const stillPending = [];
    for (const result of results) {
      if (result.error) {
        if (
          !(result.error instanceof RegistryRequestError) ||
          !result.error.retryable
        ) {
          throw result.error;
        }
        stillPending.push({
          index: result.index,
          lastError: result.error,
          packageRelease: result.packageRelease,
        });
        continue;
      }
      if (!result.metadata) {
        stillPending.push({
          index: result.index,
          lastError: null,
          packageRelease: result.packageRelease,
        });
        continue;
      }
      validateMetadata(result.packageRelease, result.metadata);
      metadataByIndex[result.index] = result.metadata;
    }
    pending = stillPending;
    if (!pending.length || attempt === attempts) break;

    const timeUntilDeadlineMs = deadline - now();
    if (timeUntilDeadlineMs <= 0) break;
    const delayMs = Math.min(
      initialDelayMs * 2 ** (attempt - 1),
      maxDelayMs,
      timeUntilDeadlineMs,
    );
    const packageVersions = pending
      .map(
        ({ packageRelease }) =>
          `${packageRelease.name}@${packageRelease.version}`,
      )
      .join(", ");
    logRetry(
      `npm metadata is not yet available for ${packageVersions} (attempt ${attempt}/${attempts}); retrying in ${delayMs}ms`,
    );
    await sleep(delayMs);
  }

  const requestFailures = pending.filter(({ lastError }) => lastError);
  if (requestFailures.length) {
    const details = requestFailures
      .map(
        ({ packageRelease, lastError }) =>
          `${packageRelease.name}@${packageRelease.version}: ${lastError.message}`,
      )
      .join("; ");
    throw new Error(`npm registry requests failed after retries: ${details}`, {
      cause: requestFailures[0].lastError,
    });
  }

  return packageReleases.map((packageRelease, index) => ({
    packageRelease,
    metadata: metadataByIndex[index],
  }));
}

async function verifyPublishedPackages(plan, options = {}) {
  verifyReleasePlanCommit(plan, options);

  const packagesToVerify =
    plan.schemaVersion === 2
      ? plan.finalizationPackages || []
      : plan.publishCandidates || [];
  const publishedPackages = await waitForPublishedPackageMetadata(
    packagesToVerify,
    {
      ...options,
      validateRegistryVersionMetadata: (packageRelease, metadata) => {
        const packageVersion = `${packageRelease.name}@${packageRelease.version}`;
        if (!metadata.gitHead) {
          throw new Error(
            `${packageVersion} has no npm gitHead; unable to verify the fallback source commit`,
          );
        }
        if (metadata.gitHead !== plan.commit) {
          throw new Error(
            `${packageVersion} was published from ${metadata.gitHead}, not release plan commit ${plan.commit}`,
          );
        }
      },
    },
  );

  const verified = [];
  const unpublished = [];
  for (const { packageRelease, metadata } of publishedPackages) {
    const packageVersion = `${packageRelease.name}@${packageRelease.version}`;
    if (!metadata) {
      unpublished.push(packageVersion);
      continue;
    }
    verified.push(packageVersion);
  }
  if (unpublished.length) {
    throw new Error(`Packages remain unpublished: ${unpublished.join(", ")}`);
  }
  return verified;
}

async function finalizePublishedPackages(plan, options = {}) {
  const root = options.root || ROOT;
  verifyReleasePlanCommit(plan, options);

  const finalized = [];
  const unpublished = [];
  const publishCandidates = new Set(
    (plan.publishCandidates || []).map(
      ({ name, version }) => `${name}@${version}`,
    ),
  );
  const publishedPackages = await waitForPublishedPackageMetadata(
    plan.finalizationPackages,
    {
      ...options,
      validateRegistryVersionMetadata: (packageRelease, metadata) => {
        const packageVersion = `${packageRelease.name}@${packageRelease.version}`;
        const preserveExisting =
          plan.reconcile === true && !publishCandidates.has(packageVersion);
        if (!metadata.gitHead) {
          throw new Error(
            `${packageVersion} has no npm gitHead; refusing to create a tag without published-source provenance`,
          );
        }
        if (!preserveExisting && metadata.gitHead !== plan.commit) {
          throw new Error(
            `${packageVersion} was published from ${metadata.gitHead}, not release plan commit ${plan.commit}`,
          );
        }
      },
    },
  );
  const missing = publishedPackages.filter(({ metadata }) => !metadata);
  if (missing.length) {
    throw new Error(
      `Packages remain unpublished: ${missing
        .map(
          ({ packageRelease }) =>
            `${packageRelease.name}@${packageRelease.version}`,
        )
        .join(", ")}`,
    );
  }
  for (const { packageRelease, metadata } of publishedPackages) {
    const packageVersion = `${packageRelease.name}@${packageRelease.version}`;
    const preserveExisting =
      plan.reconcile === true && !publishCandidates.has(packageVersion);
    if (!metadata) {
      unpublished.push(packageVersion);
      continue;
    }
    (options.ensureTag || ensureTag)(packageRelease, metadata.gitHead, root, {
      preserveExisting,
    });
    (options.ensureGitHubRelease || ensureGitHubRelease)(packageRelease, root);
    finalized.push(`${packageRelease.name}@${packageRelease.version}`);
  }
  if (unpublished.length) {
    throw new Error(`Packages remain unpublished: ${unpublished.join(", ")}`);
  }
  return finalized;
}

function validateChangesetPolicy({ root, baseCommit, headCommit, exempt }) {
  if (!baseCommit || !headCommit)
    throw new Error("Changeset policy requires exact base and head commits");
  baseCommit = gitOutput(root, ["merge-base", baseCommit, headCommit]);
  const prefix = path
    .relative(root, jsDirectory(root))
    .split(path.sep)
    .join("/");
  const workspaces = listPublishableWorkspacesAtRef(root, headCommit);
  const names = new Set(workspaces.map(({ name }) => name));
  const changed = gitOutput(root, [
    "diff",
    "--name-only",
    baseCommit,
    headCommit,
    "--",
  ])
    .split("\n")
    .filter(Boolean);
  const notes = changed.filter(
    (file) =>
      file.startsWith(path.posix.join(prefix, ".changeset/")) &&
      file.endsWith(".md") &&
      !file.endsWith("/README.md") &&
      gitOutput(root, ["cat-file", "-e", `${headCommit}:${file}`], {
        allowFailure: true,
      }) !== null,
  );
  const covered = new Set();
  for (const file of notes) {
    const content = gitOutput(root, ["show", `${headCommit}:${file}`]);
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(content);
    if (!match || !match[2].trim())
      throw new Error(
        `${file} needs release metadata and a nonempty public description`,
      );
    const lines = match[1].split(/\r?\n/).filter((line) => line.trim());
    if (!lines.length) throw new Error(`${file} must name a public package`);
    const seen = new Set();
    for (const line of lines) {
      const entry =
        /^\s*["']?(@lightsparkdev\/[a-z0-9-]+)["']?:\s*(patch|minor|major)\s*$/.exec(
          line,
        );
      if (!entry || !names.has(entry[1]) || seen.has(entry[1]))
        throw new Error(
          `Invalid or duplicate public package in ${file}: ${line}`,
        );
      seen.add(entry[1]);
      covered.add(entry[1]);
    }
  }
  const base = listPublishableWorkspacesAtRef(root, baseCommit);
  const baseByName = new Map(base.map((pkg) => [pkg.name, pkg]));
  const added = workspaces.filter((pkg) => !baseByName.has(pkg.name));
  const changedVersions = workspaces.some(
    (pkg) =>
      baseByName.has(pkg.name) &&
      baseByName.get(pkg.name).version !== pkg.version,
  );
  const candidateChanged = changed.includes(candidatePath(root));
  if (changedVersions || candidateChanged) {
    const transitions = buildReleaseCandidate(base, workspaces);
    const manifest = readJsonAtRef(root, headCommit, candidatePath(root), {
      allowMissing: true,
    });
    if (
      !candidateChanged ||
      !manifest ||
      !isDeepStrictEqual(normalizeReleaseCandidate(manifest), transitions)
    ) {
      throw new Error(
        "Version changes require a matching release-candidate.json",
      );
    }
    const manifestFiles = changed.filter((file) =>
      /^(?:js\/)?(?:packages|apps)\/.*\/package.json$/.test(file),
    );
    const manifests = manifestFiles.map((file) => ({
      file,
      before: readJsonAtRef(root, baseCommit, file, { allowMissing: true }),
      after: readJsonAtRef(root, headCommit, file, { allowMissing: true }),
    }));
    const versioned = new Map();
    for (const { file, before, after } of manifests) {
      if (!before || !after)
        throw new Error(`Version Packages cannot add or remove ${file}`);
      if (before.version !== after.version) {
        if (compareSemver(before.version, after.version) >= 0)
          throw new Error(`Version Packages must increase ${file}`);
        versioned.set(before.name, {
          previousVersion: before.version,
          version: after.version,
        });
      }
    }
    for (const { file, before, after } of manifests) {
      delete before.version;
      delete after.version;
      for (const field of [...PUBLISHED_DEPENDENCY_FIELDS, "devDependencies"]) {
        for (const [name, value] of Object.entries(after[field] || {})) {
          if (value === before[field]?.[name]) continue;
          const transition = versioned.get(name);
          const previous = before[field]?.[name];
          const range =
            typeof previous === "string" &&
            /^(?<prefix>(?:workspace:|npm:)?[~^]?)(?<version>\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?)$/.exec(
              previous,
            );
          if (!transition || !range) continue;
          const prefix = range.groups.prefix;
          if (
            compareSemver(range.groups.version, transition.previousVersion) <=
              0 &&
            value === `${prefix}${transition.version}`
          ) {
            after[field][name] = previous;
          }
        }
      }
      if (!isDeepStrictEqual(before, after))
        throw new Error(
          `Version Packages contains non-version metadata changes in ${file}`,
        );
    }
    const allowed = changed.every(
      (file) =>
        file === candidatePath(root) ||
        file === path.posix.join(prefix, "yarn.lock") ||
        manifestFiles.includes(file) ||
        /^(?:js\/)?(?:packages|apps)\/.*\/CHANGELOG.md$/.test(file) ||
        (file.startsWith(path.posix.join(prefix, ".changeset/")) &&
          file.endsWith(".md") &&
          gitOutput(root, ["cat-file", "-e", `${headCommit}:${file}`], {
            allowFailure: true,
          }) === null),
    );
    if (!allowed)
      throw new Error(
        "Version Packages PRs must contain only release metadata changes",
      );
    process.stdout.write("Validated Version Packages candidate\n");
    return;
  }
  if (added.some((pkg) => pkg.version !== "0.0.0"))
    throw new Error(
      "New public workspaces must start at 0.0.0 and include a Changeset",
    );
  if (
    !exempt &&
    base.some(
      (pkg) =>
        !workspaces.some(
          (head) => head.name === pkg.name && head.directory === pkg.directory,
        ),
    )
  ) {
    throw new Error(
      "Removing or moving a public workspace requires a reviewed exemption",
    );
  }
  const missing = workspaces.filter(
    ({ name, directory }) =>
      !covered.has(name) &&
      changed.some((file) => {
        const start = path.posix.join(prefix, directory) + "/";
        if (!file.startsWith(start)) return false;
        const relative = file.slice(start.length);
        return !/(^|\/)(tests?|__tests__|stories)(\/|$)|\.(md|test\.[cm]?[jt]sx?|stories\.[jt]sx?)$/.test(
          relative,
        );
      }),
  );
  if (missing.length && !exempt)
    throw new Error(
      `Add a new Changeset for ${missing
        .map(({ name }) => name)
        .join(", ")}, or obtain an exact-head maintainer exemption`,
    );
  process.stdout.write(
    `Validated ${notes.length} new or modified Changesets${
      exempt ? " with reviewed exemption" : ""
    }\n`,
  );
}

function optionValue(tokens, index, option) {
  const value = tokens[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} requires a value`);
  }
  return value;
}

function parseArgs(argv) {
  const tokens = [...argv];
  const command = tokens.shift();
  if (
    ![
      "changeset-plan",
      "validate-workspaces",
      "list-workspaces",
      "changeset-policy",
      "publish",
      "version-packages",
      "version-policy-plan",
      "select-candidate",
      "candidate-policy-plan",
      "published-candidate-commit",
      "publish-plan",
      "verify-published",
      "finalize",
    ].includes(command)
  ) {
    throw new Error(`Unknown or missing command: ${command || "(none)"}`);
  }
  const args = { command, reconcile: false };
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (
      [
        "--status",
        "--github-output",
        "--expect-env",
        "--plan-env",
        "--base-root",
        "--head-root",
        "--base-commit",
        "--head-commit",
        "--ref",
        "--root",
        "--expect-commit",
        "--exact-commit",
        "--candidate-ref",
      ].includes(token)
    ) {
      const key = {
        "--status": "status",
        "--github-output": "githubOutput",
        "--expect-env": "expectEnv",
        "--plan-env": "planEnv",
        "--base-root": "baseRoot",
        "--head-root": "headRoot",
        "--base-commit": "baseCommit",
        "--head-commit": "headCommit",
        "--ref": "ref",
        "--root": "root",
        "--expect-commit": "expectCommit",
        "--exact-commit": "exactCommit",
        "--candidate-ref": "candidateRef",
      }[token];
      args[key] = optionValue(tokens, index, token);
      index += 1;
    } else if (token === "--exempt") {
      args.exempt = true;
    } else if (token === "--reconcile") {
      args.reconcile = true;
    } else {
      throw new Error(`Unknown argument: ${token}`);
    }
  }
  if (command === "changeset-plan" && !args.status) {
    throw new Error("changeset-plan requires --status");
  }
  if (
    command === "version-policy-plan" &&
    (!args.baseRoot || !args.headRoot || !args.baseCommit || !args.headCommit)
  ) {
    throw new Error(
      "version-policy-plan requires --base-root, --head-root, --base-commit, and --head-commit",
    );
  }
  if (
    ["candidate-policy-plan", "published-candidate-commit"].includes(command) &&
    !args.candidateRef
  ) {
    throw new Error(`${command} requires --candidate-ref`);
  }
  if (
    ["publish", "finalize", "verify-published"].includes(command) &&
    !args.planEnv
  ) {
    throw new Error(`${command} requires --plan-env`);
  }
  return args;
}

async function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const root = args.root
    ? gitOutput(path.resolve(args.root), ["rev-parse", "--show-toplevel"])
    : ROOT;
  if (args.command === "list-workspaces") {
    process.stdout.write(
      `${JSON.stringify(listPublishableWorkspaces(jsDirectory(root)))}\n`,
    );
    return;
  }
  if (args.command === "changeset-policy") {
    validateChangesetPolicy({ ...args, root });
    return;
  }
  if (args.command === "validate-workspaces") {
    const workspaces = listPublishableWorkspaces(jsDirectory(root), root);
    process.stdout.write(
      `Validated ${workspaces.length} publishable workspaces\n`,
    );
    return;
  }

  if (args.command === "changeset-plan") {
    const plan = buildChangesetPlan(readJson(args.status));
    appendGitHubOutputs(args.githubOutput, {
      has_major: plan.hasMajor,
      has_releases: plan.releases.length > 0,
      plan: JSON.stringify(plan),
    });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  if (args.command === "version-packages") {
    versionPackages({ root });
    return;
  }

  if (args.command === "version-policy-plan") {
    const plan = await createVersionPolicyPlan(args);
    appendGitHubOutputs(args.githubOutput, {
      has_major: plan.hasMajor,
      has_version_changes: plan.versionChanges.length > 0,
      head_commit: plan.headCommit,
      plan: JSON.stringify(plan),
    });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  if (args.command === "candidate-policy-plan") {
    const plan = await createCandidatePolicyPlan({
      root,
      candidateRef: args.candidateRef,
    });
    appendGitHubOutputs(args.githubOutput, {
      has_major: plan.hasMajor,
      plan: JSON.stringify(plan),
    });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  if (args.command === "published-candidate-commit") {
    const result = await findPublishedCandidateCommit({
      root,
      candidateRef: args.candidateRef,
    });
    appendGitHubOutputs(args.githubOutput, {
      has_published_packages: result.publishedPackages.length > 0,
      release_commit: result.releaseCommit || "",
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    return;
  }

  if (args.command === "select-candidate") {
    const release = await selectReleaseCandidate({
      root,
      ref: args.ref,
      exactCommit: args.exactCommit,
    });
    if (args.expectCommit) {
      const expected = gitOutput(root, [
        "rev-parse",
        `${args.expectCommit}^{commit}`,
      ]);
      if (!release) {
        throw new Error(
          `Expected release candidate ${expected}, but none is pending`,
        );
      }
      if (release.commit !== expected) {
        throw new Error(
          `Oldest pending release candidate is ${release.commit}, not ${expected}`,
        );
      }
    }
    appendGitHubOutputs(args.githubOutput, {
      has_candidate: release !== null,
      source_commit: release?.commit || "",
      channel: release?.candidate.channel || "",
      npm_tag: release?.candidate.npmTag || "",
      candidate: release ? JSON.stringify(release.candidate) : "",
    });
    process.stdout.write(
      `${JSON.stringify(
        release
          ? { sourceCommit: release.commit, ...release.candidate }
          : { sourceCommit: null },
        null,
        2,
      )}\n`,
    );
    return;
  }

  if (args.command === "publish-plan") {
    const plan = await createPublishPlan({
      root,
      jsRoot: jsDirectory(root),
      reconcile: args.reconcile,
      candidateRef: args.candidateRef,
    });
    if (args.expectEnv) {
      const expected = process.env[args.expectEnv];
      if (!expected) throw new Error(`${args.expectEnv} is empty`);
      assertPublishPlanProgress(JSON.parse(expected), plan);
    }
    appendGitHubOutputs(args.githubOutput, {
      has_candidates: plan.publishCandidates.length > 0,
      has_work:
        plan.publishCandidates.length > 0 ||
        plan.reconcile ||
        (plan.schemaVersion === 2 && plan.finalizationPackages.length > 0),
      has_major: plan.hasMajor,
      commit: plan.commit,
      plan: JSON.stringify(plan),
    });
    process.stdout.write(`${JSON.stringify(plan, null, 2)}\n`);
    return;
  }

  const planJson = process.env[args.planEnv];
  if (!planJson) throw new Error(`${args.planEnv} is empty`);
  if (args.command === "publish") {
    const authorized = JSON.parse(planJson);
    if (authorized.schemaVersion !== 2)
      throw new Error("Publishing requires an exact candidate plan");
    verifyReleasePlanCommit(authorized, { root });
    if (gitOutput(root, ["status", "--porcelain", "--untracked-files=no"])) {
      throw new Error("Tracked release files changed after checkout");
    }
    const current = await createPublishPlan({
      root,
      candidateRef: authorized.sourceCommit,
    });
    assertPublishPlanProgress(authorized, current);
    for (const pkg of orderPublications(
      current.publishCandidates,
      jsDirectory(root),
    )) {
      childProcess.execFileSync(
        "npm",
        [
          "publish",
          "--ignore-scripts",
          "--access",
          "public",
          "--tag",
          current.npmTag,
          "--registry",
          NPM_REGISTRY,
        ],
        {
          cwd: path.join(jsDirectory(root), pkg.directory),
          stdio: "inherit",
        },
      );
    }
    return;
  }
  if (args.command === "verify-published") {
    const verified = await verifyPublishedPackages(JSON.parse(planJson), {
      root,
    });
    process.stdout.write(`Verified ${verified.join(", ") || "no packages"}\n`);
    return;
  }
  const finalized = await finalizePublishedPackages(JSON.parse(planJson), {
    root,
  });
  process.stdout.write(`Finalized ${finalized.join(", ") || "no packages"}\n`);
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`error: ${error.message}`);
    process.exitCode = 1;
  });
}

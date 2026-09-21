# JavaScript SDK releases

Webdev owns release intent. Public contributions merge into `lightsparkdev/js-sdk`
`develop`, enter a private Webdev PR, and export back to public `main` after private
review and testing. Only private Changesets version packages. Public `main` is the
release source; preparation freezes a selected candidate and its independent
public lockfile on a protected release branch.

The migration ships disabled. Completing the activation checklist below is
required before the first release. Experimental publishing and unattended
publication are separate follow-ups.

## Package changes and versioning

Add a new, nonempty Changeset to each PR that changes a public package. Existing
notes already on main do not satisfy another PR. Prefer patch bumps unless a
maintainer chooses minor or major. Keep exact internal dependency pins so
Changesets propagates version changes to public and private consumers.

The private `JS SDK Version Packages` workflow creates or updates one draft
`[js] Version packages` PR using the Copybara App identity. It updates versions,
changelogs, private consumers, and `js/yarn.lock`, consumes notes, and writes
`js/release-candidate.json`. Review and **squash merge** this PR. Candidates must
have one parent and describe exactly that commit's public version changes.

`JS SDK Major Version Policy` reads PR metadata using trusted base code. Its
protected `js-sdk-major-release` approval is bound to the exact PR head. For a
change that does not need release notes, apply `js:no-changeset`, obtain a
maintain/admin approval of that exact head, then rerun the policy workflow.
Malformed new notes still fail. Unrelated PRs do not need to rebase to approve
someone else's major release.

Public packages are discovered from workspaces and restricted to `packages/*`,
with `@lightsparkdev/*` names and public repository metadata. Internal workspaces
must set `private: true`; `oauth` and `packages/private/ui` are not published.
The current publishable set is core, crypto-wasm, eslint-config, lightspark-cli,
lightspark-sdk, origin, tsconfig, and ui.

## Prepare and publish

1. In the public repository, dispatch `JS SDK Prepare Release` from `main`.
   Leave `candidate_commit` blank to select the oldest unpublished candidate;
   provide its full source SHA to retry or repair finalization.
2. For a major version, select `allow_major` and obtain the protected environment
   approval. The workflow checks maintain/admin permission, including reruns.
3. Preparation generates the candidate's public `yarn.lock` without write or
   publishing credentials. It creates an unpredictable
   `sdk-release/stable/<source-sha>-<nonce>` branch and authorizes its exact commit
   and lockfile hash. The commit is the candidate or one direct child changing
   only the lockfile and thin publisher dispatcher.
4. The dispatcher calls the trusted publisher on protected public `main`.
   Preflight installs immutable dependencies, builds the public package closure,
   runs hermetic checks, packs all public packages, and checks Node imports,
   types, CLI help, browser bundles, styles, fonts, and committed WASM assets.
5. The publisher revalidates the authorization, ref, lockfile, registry, and
   candidate, then publishes planned missing versions in dependency order using npm OIDC.
   npm `gitHead`, package tags, and GitHub releases identify the prepared commit.

Dependency cycles among planned publications fail before any version is uploaded.

New source can continue reaching main during preflight. It cannot change a
prepared release. Preparation and publication share one public concurrency
group and never cancel an active release. GitHub can replace a pending run when
another arrives; rerun preparation if a queued dispatch was superseded.

Registry visibility checks retry transient errors and missing metadata with
bounded request and overall timeouts. A publish command may fail after npm has
accepted a package; verification decides whether the publication succeeded.
Retry the same candidate. Existing versions must identify the same `gitHead`.
For a partial public publication, preparation recovers the original prepared
commit from npm metadata instead of generating a different publication source.

A completed candidate can be explicitly selected again to repair missing tags
or releases, including after newer versions publish. Existing matching records
are left in place. A wrong tag or npm `gitHead` fails closed. Do not move tags,
replace prepared refs, or bump versions to disguise a partial publication.

## Private fallback

Fallback is part of the initial rollout and uses the same candidate planning,
package preflight, exact-commit checks, FIFO policy, and registry verification.

1. Pause public publishing by setting public `JS_SDK_RELEASE_ENABLED=false`.
   Drain or cancel **all** public preparation and publication runs, including
   jobs waiting for environment approval. Concurrency groups do not lock across
   repositories. Never use the two publication paths concurrently.
2. Check npm for the candidate's versions. Once any package publishes through
   one path, finish that candidate through that path. A public partial release
   cannot be completed with a different private `gitHead`, or vice versa.
3. Dispatch private `JS SDK Private Fallback Publish` from `main`, supplying the
   merged Version Packages PR number. Acknowledge both the public release gap
   and that public publication is paused and drained. The caller needs
   maintain/admin permission. A major release also needs `allow_major` and
   protected major approval.
4. Approve `npm-private-fallback`. Its granular `NPM_TOKEN` must cover the planned
   packages. The workflow publishes the exact private PR merge SHA, which must
   remain an ancestor of private main. It does not create public tags, GitHub
   releases, or provenance. Retry with the same PR number after any failure.
5. Verify the summary and npm metadata before resuming the public publisher.
   Completed private candidates are skipped by public automatic selection.
   Public finalization must not invent a public commit for a private publication.

Private development and export can continue during fallback. The fallback
does not depend on a working public export. It uses the private candidate's
lockfile; private service integrations remain the responsibility of normal CI.

## Public contribution intake

The private hourly/manual `JS SDK Public Contribution Intake` workflow captures
public `develop` and opens a draft PR. It applies contribution commits as
three-way patches relative to their recorded public parents, preserving
intervening private edits. Conflicts fail visibly without acknowledging the
revision; resolve them in a reviewed private import PR with the matching ledger.
The workflow never executes public contributor code with its App token.
While an import PR is open, subsequent intake runs leave its reviewed changes
alone. Merge or close that PR before importing later public contributions.

`.github/js-sdk-intake.json` records the exact imported public revision and
contributing commits. When the private merge exports, the acknowledgement
artifact records that revision, its exported private origin, and public main.
Refreshing develop merges public main normally. It does not force-reset develop,
and later public contributions remain pending. An automatic refresh that
conflicts stops without changing develop. Import the conflicting contribution
through a reviewed private PR, then retry the export and refresh.

Public changes to versions, generated changelogs, release controls, or package
onboarding must originate in Webdev. Public `yarn.lock` maintenance remains
independent and is excluded from intake. Dependency changes imported privately
still require the existing lockfile maintainer policy; the sync bot only has a
version-update exemption. The private lockfile updater is excluded from Version
Packages branches so it cannot append an unrelated rebase/version commit.

The export guard compares mirrored public blobs to their recorded private
`GitOrigin-RevId`. Unexplained public source edits stop export. Public-only
workflow files and the independent lockfile are preserved. The exporter owns
only the explicitly listed public workflow/action templates in `js/copy.bara.sky`.
Private packages, apps, PR bodies, and agent context are excluded.

## Activation checklist

Prepare the following settings while publication remains disabled:

| Repository | Setting                       | Value at activation                                                              |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------- |
| private    | `JS_SDK_VERSIONING_ENABLED`   | `true` after authority cutover                                                   |
| private    | `JS_SDK_FALLBACK_ENABLED`     | `true` after fallback setup                                                      |
| private    | `JS_SDK_SYNC_MODE`            | `public-main`; absent uses legacy, `paused` stops export                         |
| private    | `JS_SDK_INTAKE_ENABLED`       | `true` after reconciling develop and its ledger; enables imports and refreshes   |
| private    | `JS_SDK_EXPORT_BOOTSTRAP_SHA` | Exact reviewed public main SHA for the first export; clear immediately afterward |
| public     | `JS_SDK_RELEASE_ENABLED`      | `true` only after the release protections are verified                           |

- Install/authorize the existing Copybara App on both repositories with contents
  and pull-request permissions sufficient for export and private PR creation.
  The version bot must remain `lightspark-copybara[bot]` so its version-only
  lockfile updates pass the existing attribution gate.
- Require the trusted private `js-sdk-major-version-policy.yml` workflow by
  workflow identity after it is on main; do not rely on a spoofable job name.
  Require normal private CI and public package checks. Restrict public main
  writes to the private exporter and reviewed repository administration.
  Protect public `develop` with contributor review requirements before intake
  can create private CI runs from its commits.
- Configure protected `js-sdk-major-release` environments in both repositories,
  public `npm`, and private `npm-private-fallback` with appropriate maintainer
  reviewers and no self-approval. Restrict fallback to `main` and public npm to
  `sdk-release/stable/*`.
- Protect release refs against updates, force pushes, and deletion. Permit
  their creation only through the reviewed release workflow. Protect `main` and
  disallow creating a **tag** called `main`, since it can shadow the reusable
  workflow's branch reference.
- Configure npm trusted publishers for **all eight packages**, with repository
  `lightsparkdev/js-sdk`, workflow `js-sdk-publish.yml` (the caller), and environment
  `npm`. Permit direct publication for this workflow. Preserve granular token
  publication for the private fallback; a package policy disabling all token
  publishing would disable that path. See [npm trusted publishing](https://docs.npmjs.com/trusted-publishers/).
- Store a granular publishing token as `NPM_TOKEN` **only** in the protected
  private fallback environment. Check package scope, expiration, and required
  automation/2FA bypass policy before use. No npm token belongs in the public
  release workflow.

For the one-time authority cutover:

1. Set private sync mode to `paused`; pause/drain the old public
   `test-release-sync.yaml` and `create-release-pr.yaml` workflows. Keep both new
   publishers and `JS_SDK_INTAKE_ENABLED` disabled. Source development can continue.
2. Refresh the public/npm baseline audit. The September 18 baseline reconciles
   public main `46c731cfaf9b1eeb9584d2176bc006076de3b2d1` and develop
   `0b6713f8742b44a54f0cee5807f7a0b1c8d10255`. Non-Copybara commits in that develop
   backlog were lockfile maintenance and public PR #524; its UMA example fix is
   included in this migration. Reconcile any subsequent public-only changes,
   then update the intake ledger through review if necessary. The existing 41
   pending Changesets are retained; published release metadata is already
   reconciled into the private version baseline.
3. Review/retire the old develop-to-main release PR and the paired reverse-sync
   proposals [public #520](https://github.com/lightsparkdev/js-sdk/pull/520) and
   [private #26882](https://github.com/lightsparkdev/webdev/pull/26882).
   Do not merge their old automation during cutover. Set the
   bootstrap variable to the exact reviewed public main tip, enable
   `public-main` sync, and run the private JS workflow. Inspect the exported
   tree/history. Clear the bootstrap variable. The new
   exporter installs inert replacements for both old public release writers.
4. Reconcile the reviewed develop backlog with the new public main using a
   normal merge commit. The September 18 dry run found conflicts in old
   `CLAUDE.md`, `copy.bara.sky`, and three package manifests. A plain merge also
   silently retained stale versions in other manifests. After accounting for
   **every** contribution through the captured develop SHA, make all mirrored
   files match the exported private tree, preserving develop's independent
   `yarn.lock` and unrelated public workflows. Verify the complete tree diff,
   including versions and dependency pins; resolving only conflict markers is
   insufficient. If develop advances during review, capture and reconcile the
   additional contributions before merging. Record this reviewed merge SHA as
   `publicRevision` in the private intake ledger through a PR. This makes the
   initial reconciliation an acknowledged baseline instead of a new contribution.
5. Set the public default contribution branch to `develop` and verify PR checks.
   Enable private versioning, intake, and the configured fallback. Manually run
   the version workflow and review its first candidate PR, including private
   dependency pins. Squash merge it after required review and checks. Inspect the
   export acknowledgement and subsequent develop refresh.
6. Enable public publishing, manually prepare that candidate, approve its npm
   deployment, and verify package contents, npm provenance, gitHead, dist-tags,
   package tags, and GitHub releases. Dispatch the same source again to confirm
   a no-op or metadata-only repair. Record the successful run before considering
   automatic candidate-triggered publication.

If cutover fails, pause the new publishers and repair the selected candidate or
sync conflict. Do not restore two version authorities. Reverting a candidate is
not cancellation: candidate history remains append-only. Define and validate an
explicit cancellation record before enabling unattended publishing.

## New packages and local validation

Add public repository metadata using `git+https://github.com/lightsparkdev/js-sdk.git`
and directory `packages/<name>`. Start its version at `0.0.0`; the first Version
Packages PR assigns its release version. Add a public Changeset, build/package checks,
and any package-specific smoke coverage. npm requires initial package creation
before configuring its trusted publisher; coordinate that one-time bootstrap
with an npm administrator, then configure both public OIDC and fallback token
scope before selecting the package's first automated candidate.

From the private repository:

```sh
node --test js/scripts/tests/*.test.cjs
python3 -m unittest discover -s scripts/gha -p 'test_js_sdk_sync.py'
node js/scripts/sdk-release.cjs validate-workspaces
```

To verify the actual public layout, project it to a fresh temporary directory
with `python3 scripts/gha/js_sdk_sync.py project --private . --output <directory>`.
Seed its independent lockfile from public main, run the pinned Yarn lockfile
update, then `yarn install --immutable`. Initialize a temporary Git repository
and run `node scripts/sdk-preflight.cjs --root . --checks`. This never publishes.
Private candidates use `node js/scripts/sdk-preflight.cjs --root . --checks`.

# Release Paths

## Release Map (step 0)

```bash
<workspace>/bootstrap.sh                              # clone missing repos
<workspace>/git-pull-all.sh                           # fetch and fast-forward all
bash <skill-dir>/scripts/release-map.sh <workspace>             # fetches tags
bash <skill-dir>/scripts/release-map.sh <workspace> --no-fetch  # local refs
```

Components table, one row per `repos.yaml` entry plus pinned repos missing from it:

| Column | Meaning |
|---|---|
| `base` | last release branch, else last `vX.Y.Z` tag |
| `real` | default-branch commits not on the base; excludes version-bump, release-notes, changelog and cherry-picked commits |
| `snapshot` | default-branch chart version |
| `minor` / `patch` | version for a cut / next patch on the release branch |
| `next-dev` | default-branch version after a cut |
| `path` | `release pipeline`, `tag push`, `no release`, `unknown` (not classified, no chart: ask) |
| `default` | proposed action from `real` (rule below) |
| `note` | `STALE`: snapshot not above the last release; `FIRST`: no tag; `not in repos.yaml`; `NOT_CLONED` |

Pins table: every pin in edp-install (default branch, newest `release/X.Y`), edp-tekton
pipelines-library and its tekton-cache `image.tag`, and every `@epamedp` dependency in
`clusters/*/addons/*/Chart.yaml`. Status `ok`, `behind` (newer release exists), `ahead` (unreleased).
For tekton-cache and common-library, `latest` is the source chart version, not proof of publication.

The map reads `sources/<dir>`. For another clone, run the same `git log` commands there and say so.

## Dependency Graph

Release order; the Pins table lists every consumer pin. Other components release independently, in
any order.

```text
krci-cache image → tekton-cache chart → edp-tekton → edp-install → edp-cluster-add-ons
```

## Approval

Show both tables with one action per component and per `behind` pin, then stop (AskUserQuestion).
User named components and versions: show those rows and their pins; list the other `real > 0` and
`behind` rows in one line.

| Action | Meaning |
|---|---|
| `cut X.Y.0` | new `release/X.Y`, release run, dev-version bump |
| `patch X.Y.Z` | cherry-picks on `release/X.Y`, release run |
| `tag vX.Y.Z` | tag-push component |
| `skip` | no release; state the reason |
| `fix bump` | `STALE`: dev-version bump only |
| `pin` | `behind` pin: consumer change |

Read the subjects of every `real > 0` row first:
`git log --format=%s --cherry-pick --right-only <base>...<default>`.

| `real` | Action | Ask |
|---|---|---|
| 0 | `skip` | no |
| 1-3 | `cut` or `patch` | yes: list the commits, recommend `cut` |
| >3 | `cut` | no |

- The count decides whether to ask; the commit type does not override it.
- edp-install: the rule in `edp-install-release.md` (Release Kinds) replaces the count.
- 1-3 rows: features or fixes → recommend `cut`; dependency or toolchain bumps only → offer `cut`,
  `patch`, `skip`. Give the last release date; an old one is a reason to `cut`.
- `patch`: list the commits to cherry-pick onto `release/X.Y`; mark conflicts.
- `not in repos.yaml`: audit it; propose adding it to the workspace `repos.yaml`.
- No `cut`, `patch` or `tag`: report nothing to release, list the default-branch changes, ask.

## Release-Pipeline Components

codebase-operator, cd-pipeline-operator, edp-tekton, gitfusion, krci-portal, gerrit-operator,
keycloak-operator, sonar-operator, nexus-operator, krci-audit, krci-env-daemon, tekton-custom-task,
tekton-pipeline-queue, edp-install; chart-only: tekton-cache, tekton-common-library. Released by a
release pipeline in the KubeRocketCI installation that builds the platform; ask the release owner for
the pipeline when not stated.

### Release branch (cut)

1. Read `app.edp.epam.com/edit-protection` on the Codebase and its default-branch CodebaseBranch. The
   webhook splits the value at `-`: `update` blocks spec changes, `delete` blocks deletion. The cut
   changes the default-branch spec (version), so only a value that contains `update` blocks it.
2. Value contains `update`: note it, remove the label from both. Else: no change.
3. Create CodebaseBranch `release/X.Y`, **Release** on, from the audited commit
   (`git -C sources/<repo> rev-parse origin/<default>`; another commit only when the user names it).
   Set the default branch to `X.(Y+1).0-SNAPSHOT`. The codebase-operator creates the git branch.
4. Label removed in step 2: restore the noted value on both.
5. Confirm `release/X.Y` in git at that commit.

The CodebaseBranch version drives CI build tags; the `Chart.yaml` bump is still the dev-version bump
(`component-bump.md`).

### Release run

Inputs: release branch `release/X.Y`, version `X.Y.Z` (no `v`). The run refuses another branch and an
existing `vX.Y.Z`. It:

1. Sets `Chart.yaml` `version`, `appVersion` and image tag, runs `make helm-docs`, updates
   `package.json` (krci-portal), runs `NEXT_RELEASE_TAG=X.Y.Z make changelog`, commits `Bump version to X.Y.Z`,
   tags `vX.Y.Z`.
2. Builds and pushes the image to Docker Hub; signs it with cosign; `.att` and `.sig` go to Rekor.
3. Publishes the chart to `@epamedp`.
4. Pushes the commit and tag to `release/X.Y`.

The tag starts the GitHub `release` workflow: it looks up the `.att` and `.sig` Rekor UUIDs and writes
them into the release notes. Missing signature: the GitHub release fails.

Done when: run succeeded; `vX.Y.Z` on `release/X.Y`; image on Docker Hub; chart in `@epamedp`; GitHub
release lists both UUIDs.

Chart-only releases (tekton-cache, tekton-common-library): chart publish only; run from master after
the chart change merges.

The tag's `CHANGELOG.md` has one `## vX.Y.Z` section (clone without older tags). Never copy it.

### Failed release

```bash
crane digest <image>:X.Y.Z
crane manifest <image>:sha256-<digest>.sig | jq -r '.layers[].digest'
crane manifest <image>:sha256-<digest>.att | jq -r '.layers[].digest'
rekor-cli search --sha <layer-digest>
```

| Finding | Action |
|---|---|
| No `.sig` or `.att` | Clean up (below), rerun the release run |
| Signature present, Rekor empty | Wait, search again; UUIDs present → rerun only the GitHub workflow |
| `null` UUIDs in the release notes | Treat as missing Rekor entries |

Cleanup, each item after user confirmation:

| Resource | Check | Action |
|---|---|---|
| Tag `vX.Y.Z` | `git ls-remote --tags origin vX.Y.Z` | user deletes the remote tag |
| GitHub release or draft | Releases page | user deletes it |
| `Bump version to X.Y.Z` | `git log -3 origin/release/X.Y` | keep; a rerun may add a second one; the new tag must sit on the rerun commit |
| Unsigned image | `.sig`/`.att` for the digest | rerun pushes again; user removes an orphan digest |
| Chart `X.Y.Z` | `@epamedp` index | rerun publishes again; rejected → user removes the entry |
| Failed PipelineRuns | PipelineRun list | user deletes them |

Rerun with the same inputs; repeat the done checks.

## Tag-Push Components

cli (goreleaser), krci-cache (image to ghcr), claude-code-telemetry (GitHub release only). Own cadence;
in the train only when approved. No release branch, no dev-version bump.

- The user pushes a signed `vX.Y.Z` on the default branch; GitHub workflows build and release.
- Before: `git ls-remote --tags origin vX.Y.Z` is empty.
- After, where the repo has a `changelog` make target: `make changelog`, commit
  `docs: Update Changelog`, `make changelog`, amend.
- `FIRST`: the version comes from the default-branch chart or changelog.
- `build/X.Y.Z-SNAPSHOT.N` tags are CI build tags, not releases.

## No Release

edp-cluster-add-ons, krci-docs, skills, claude-plugins, krci-autotests follow `main`. Add-on pins
(`add-ons.md`) and docs (`krci-docs:release-docs`) carry a release into them.

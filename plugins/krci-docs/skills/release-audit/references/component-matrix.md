# KRCI Component Matrix

Every component to consider in a platform release audit, with the facts needed to locate its
release branch and target version.

**This table is the authoritative component set for release work.** Reconcile against it, not against
whatever happens to be cloned.

## Umbrella dependencies (`edp-install/deploy-templates/Chart.yaml`)

These are pinned by the platform chart. A change in any of them ships with the platform release.

| Chart dependency | Git repo | Org | Default branch | Chart path |
|---|---|---|---|---|
| `codebase-operator` | `edp-codebase-operator` | `epam` | `master` | `deploy-templates/Chart.yaml` |
| `cd-pipeline-operator` | `edp-cd-pipeline-operator` | `epam` | `master` | `deploy-templates/Chart.yaml` |
| `edp-tekton` | `edp-tekton` | `epam` | `master` | `charts/pipelines-library/Chart.yaml` |
| `gitfusion` | `gitfusion` | `KubeRocketCI` | `main` | `deploy-templates/Chart.yaml` |
| `krci-portal` | `krci-portal` | `KubeRocketCI` | `main` | `deploy-templates/Chart.yaml` |

Treat any dependency present at the previous platform tag but missing from the newer `Chart.yaml`
as a removal.

A `Chart.yaml` dependency that is not in the table above is not a release target — some pins exist
for supporting infrastructure that the platform never re-releases. Audit only what this table lists.

## Sub-charts inside `edp-tekton`

`edp-tekton` ships more than one chart. Check each independently:

| Chart | Path | Notes |
|---|---|---|
| `edp-tekton` (pipelines-library) | `charts/pipelines-library/Chart.yaml` | Carries the `-SNAPSHOT`; this is the released version |
| `tekton-cache` | `charts/tekton-cache/Chart.yaml` | Versioned separately; pins the `krci-cache` image tag |
| `edp-tekton-common-library` | `charts/common-library/Chart.yaml` | Auto-bumped per commit; not release-branch driven |

## Non-umbrella components

Part of the platform but released on their own cadence and installed via `edp-cluster-add-ons` or
standalone. Always check whether the add-on pin matches the latest release — these drift.

| Component | Org | Default branch | Installed via |
|---|---|---|---|
| `edp-keycloak-operator` | `epam` | `master` | cluster add-on |
| `edp-sonar-operator` | `epam` | `master` | cluster add-on |
| `edp-nexus-operator` | `epam` | `master` | cluster add-on |
| `krci-audit` | `KubeRocketCI` | `main` | cluster add-on |
| `tekton-custom-task` | `KubeRocketCI` | `main` | standalone chart |
| `tekton-pipeline-queue` | `KubeRocketCI` | `main` | standalone chart (opt-in) |
| `krci-cache` | `KubeRocketCI` | `main` | image consumed by `tekton-cache` |
| `cli` | `KubeRocketCI` | `main` | tag-driven, released independently |
| `edp-cluster-add-ons` | `epam` | `main` | rolling `main`, no release branches |
| `krci-docs` (`docs`) | `KubeRocketCI` | `main` | rolling `main` + versioned snapshots |

Add-on pins live at:

```
edp-cluster-add-ons/clusters/core/addons/<addon>/Chart.yaml
```

## Branch and tag conventions

- Release branches: `release/X.Y` (no patch component). Sort with `sort -V`, not lexically —
  `release/3.9` sorts above `release/3.10` otherwise.
- Tags: `vX.Y.Z` on every component, `vX.Y.Z` on the platform.
- Snapshot build tags (`build/X.Y.Z-SNAPSHOT.N`) are CI artifacts — ignore them when finding the
  last release.
- Some older repos use `release-X.Y` (hyphen). Match both forms when listing.

## Useful commands

Resolve default branch:

```bash
git -C <repo> symbolic-ref refs/remotes/origin/HEAD | sed 's|.*origin/||'
```

Latest release branch, version-sorted:

```bash
git -C <repo> branch -r | grep -oE 'release[/-][0-9.]+' | sort -t/ -k2 -V | tail -1
```

Real commit count since the release branch:

```bash
git -C <repo> log --format='%s' origin/<release>..origin/<default> \
  | grep -civE 'current development version|Update development version|Bump version to'
```

Target version from the snapshot:

```bash
git -C <repo> show origin/<default>:<chart-path> | grep -E '^version:|^appVersion:'
```

For a repo not cloned locally, the same facts come from the GitHub API:

```bash
gh api repos/<org>/<repo>/branches --paginate -q '.[].name' | grep release
gh api "repos/<org>/<repo>/compare/release/<prev>...<default>" -q '.ahead_by'
gh api repos/<org>/<repo>/contents/deploy-templates/Chart.yaml -q '.content' | base64 -d
```

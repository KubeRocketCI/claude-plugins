# krci-release

KubeRocketCI release engineering: release map, release branches and runs, version bumps and pins,
release notes and release docs, executed from a krci-workspace.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| **release-train** | Skill | Plan and execute a platform release train |
| **write-release-notes** | Skill | Write the platform entry in `edp-install/RELEASES.md` |
| **release-docs** | Skill | Upgrade guide, affected pages, install-guide pins, docs version snapshot |

## Release Cycle

| Phase | Skill |
|-------|-------|
| Release map, version changes, release runs | `krci-release:release-train` |
| `edp-install/RELEASES.md` | `krci-release:write-release-notes` |
| Upgrade guide, docs versioning | `krci-release:release-docs` |

## release-train

| Step | Where |
|------|-------|
| Release map (commits since the last release, proposed versions, pins), user approval | `repos.yaml` repos |
| tekton-cache / common-library alignment | edp-tekton |
| `release/X.Y` (edit-protection off, branch, on) | KubeRocketCI |
| Release run (version commit, signed image, Rekor, chart, tag) or tag push | KubeRocketCI / git |
| `X.(Y+1).0-SNAPSHOT` bump | each cut component |
| Component pins, then master | edp-install |
| Add-on pins | edp-cluster-add-ons |

| Script | Purpose |
|--------|---------|
| `scripts/release-map.sh` | Components and Pins tables |
| `scripts/chart-lock-digest.py` | `Chart.lock` check or write without network |

## Installation

```bash
claude plugin marketplace add KubeRocketCI/claude-plugins
claude plugin install krci-release krci-general
```

Commit messages come from `/krci-general:commit`.

## License

Apache-2.0

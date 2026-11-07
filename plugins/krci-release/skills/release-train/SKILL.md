---
name: KRCI Release Train
description: This skill should be used when the user releases KubeRocketCI components or the platform. For RELEASES.md, defer to krci-docs:write-release-notes; for the docs site and upgrade guide, defer to krci-docs:release-docs.
argument-hint: "[component[=version] ...]"
allowed-tools: [Read, Grep, Glob, Bash, Edit, Write, AskUserQuestion, TodoWrite, Skill]
authors:
    - KubeRocketCI Team
---

# KRCI Release Train

Plan and execute the version changes of a KubeRocketCI release. Step 0 is a release map the user
approves; later steps follow it. Repository steps: one signed-off commit on a branch, PR pushed and
merged by the user. Cluster steps: done by the user in KubeRocketCI; give exact values, verify results.

## Baseline

- A krci-workspace is required: `repos.yaml`, `bootstrap.sh`, `git-pull-all.sh`, `sources/<dir>`.
  Without it, stop. `release-map.sh` refuses other directories.
- Before step 0: `bootstrap.sh`, then `git-pull-all.sh`. User states the local refs are current: skip
  both, pass `--no-fetch`. No workspace: `/krci-triage:bootstrap-workspace`.
- Work in `sources/<dir>`.

## Train Order

| # | Step | Where | Reference |
|---|---|---|---|
| 0 | Release map, approval | all repos | `references/release-paths.md` |
| 1 | Dependency alignment | edp-tekton master | `references/edp-tekton-dependencies.md` |
| 2 | Release branch `release/X.Y` (cut) | KubeRocketCI | `references/release-paths.md` |
| 3 | Release run, or tag push | KubeRocketCI / git | `references/release-paths.md` |
| 4 | Dev-version bump (cut) | default branch | `references/component-bump.md` |
| 5 | Pin components | edp-install `release/X.Y` | `references/edp-install-release.md` |
| 6 | edp-install release run, master pins | KubeRocketCI, edp-install master | `references/edp-install-release.md` |
| 7 | Add-on pins | edp-cluster-add-ons main | `references/add-ons.md` |
| 8 | RELEASES.md, upgrade guide | edp-install, krci-docs | `krci-docs:write-release-notes`, `krci-docs:release-docs` |

- Step 0 is a hard stop. One action per component (`cut`, `patch`, `tag`, `skip`, `fix bump`) and per
  `behind` pin (`pin`). Nothing outside the approved table changes.
- Cut or cherry-pick: >3 real commits → `cut`, no question; 1-3 → ask, recommend `cut`; 0 → `skip`.
  edp-install: pin changes decide, not this count (`references/edp-install-release.md`).
- A pinned component releases and publishes before its consumer pins it. Each release makes its
  consumer pins `behind`: plan a `pin` row or state why it waits.
- Step 1 merges and publishes before edp-tekton's step 2. Step 5 needs every pin published.
- The release run writes `Bump version to X.Y.Z` and tag `vX.Y.Z`. Never write that commit or tag by
  hand for a release-pipeline component: a hand-pushed tag starts the GitHub release without a signed
  image, and the Rekor lookup fails.
- After each step, state the next one. Steps 6 and 7 follow every edp-install release.

## Questions for the User

Ask after the release map is approved:

| Question | Ask when |
|---|---|
| Jira ID of the release | Not given by the user or the current branch name; one ID for all commits of the train |
| Release pipeline name | The component does not use its usual release pipeline |
| Who does the cluster steps (release branch, release run) | Always |
| Current `edit-protection` label value | No cluster access to read it; a value that contains `update` is removed for the cut and put back |

Ask before each commit:

| Question | Ask when |
|---|---|
| Which commits to cherry-pick onto `release/X.Y` | `patch` release |
| Change `values.yaml` for a drift finding? | The drift check found a changed key that edp-install sets |
| Cherry-pick or leave out each master commit not on `release/X.Y` | `patch` release |
| One commit per add-on, or one for all? | More than one add-on pin |

## Required Checks

Mark each item done or N/A with the reason.

Release map (0):

- [ ] Workspace refreshed; every `repos.yaml` row present; `NOT_CLONED` resolved.
- [ ] `STALE` → `fix bump`; every `behind` pin → `pin` or a reason.
- [ ] Commit subjects read for every row with `real > 0`; cut-or-cherry-pick asked only for 1-3.

Release branch (2):

- [ ] Branch from the audited default-branch commit; a removed `edit-protection` label restored to its
      noted value.

Release run (3, 6):

- [ ] Run succeeded; `vX.Y.Z` on `release/X.Y`; image on Docker Hub; chart in `@epamedp`; GitHub
      release lists both Rekor UUIDs (not `null`).
- [ ] Failure: cause diagnosed, stale resources cleaned up with the user, then rerun.

Dev-version bump (4):

- [ ] File set from the last 2-3 `Update current development version` commits.
- [ ] Root `README.md`: every `X.Y.Z` of the component, however old, set to `X.Y.0`.
- [ ] `make changelog`, commit, `make changelog`, amend; a third run leaves no diff.

edp-install pins (5-6):

- [ ] Every pin in the `@epamedp` index; package digests match.
- [ ] `Chart.lock` from `helm dependency update` or `chart-lock-digest.py write`; `check` exits 0.
- [ ] Values drift reported in the PR body; no values change without the user.
- [ ] Patch: master commits not on `release/X.Y` listed with their effect; user chose cherry-pick or
      leave out; PR body lists "Not in this release".

## Pitfalls

| Symptom | Cause | Action |
|---|---|---|
| `make changelog` rewrites older sections | edp-tekton `v0.26.0`/`v0.27.0` tag history-less commits | Keep the new section and links; older sections from `HEAD`; `[Unreleased]` entry by hand |
| Release-tag changelog has one `## vX.Y.Z` section | Release run clone lacks older tags | Never copy it to the default branch |
| Commit missing from changelog | Jira prefix, but `.chglog/config.yml` `pattern` has no `[A-Z]+-\d+` group | Subject without the prefix; Jira ID in the PR title |
| Old entry moves between old sections | Earlier generation before that tag existed | `git tag --contains <commit>`; keep when correct |
| Cut rejected by the webhook | `app.edp.epam.com/edit-protection` contains `update`; the cut changes the default-branch spec | Remove, cut, restore the noted value |
| GitHub release fails on Rekor | Unsigned image, Rekor lag, or hand-pushed tag | Diagnose (`release-paths.md`); unsigned → clean up, rerun; lag → rerun the GitHub workflow |
| Rerun stops at version validation | Remote tag `vX.Y.Z` from the failed run | User deletes the tag |
| `make helm-docs` exits 126 | krci-portal downloads a Linux helm-docs | Local helm-docs on `deploy-templates/` |
| Tool download fails | Pinned tool missing from `bin/`, no network | Copy the same version from another repo's `bin/` |
| `helm dependency update` fails | No network or TLS to the chart host | `chart-lock-digest.py write`, then `check` |

## Commit and PR

- Commit messages: `/krci-general:commit` (Skill tool) on the staged changes. It reads the repo
  convention from `git log`. The subjects in this skill are the subject text; the convention sets the
  prefix. Command not installed: same rule from `git log --oneline -15`. Amends keep the message
  (`--amend --no-edit`).
- One release Jira ID for every commit and PR of the train. Convention with a ticket prefix: the ID
  in the subject. Convention without one: no ID in the subject.
- `.chglog/config.yml` `pattern` overrides the detected convention: no `[A-Z]+-\d+` group → no prefix
  in the subject, Jira ID in the PR title.
- Branch `<JIRA>-<topic>` off `origin/<base>` (local branch without a remote); the commit command
  reads the ID from it. Sign off (`-s`).
- Subjects: `chore: Update current development version` (dev bump, minor pins);
  `chore: Update component versions for the X.Y.Z release` (patch pins);
  `chore: Upgrade KubeRocketCI add-on to X.Y.Z`.
- PR body: version diff sketch, verification results, behavior changes. `-B release/X.Y` for
  release-branch PRs.

## Resources

Paths are relative to this skill's directory; call scripts by absolute path.

- `references/release-paths.md` — map, approval, graph, release branch, release run, recovery, tag push.
- `references/component-bump.md` — dev-version bump.
- `references/edp-tekton-dependencies.md` — tekton-cache, common-library.
- `references/edp-install-release.md` — pins, drift check, left-out commits, master mirror.
- `references/add-ons.md` — add-on pins.
- `scripts/release-map.sh <workspace> [--no-fetch]` — Components and Pins tables.
- `scripts/chart-lock-digest.py check|write <chart-dir>` — offline `Chart.lock`.

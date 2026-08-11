---
name: KRCI Release Audit
description: This skill should be used when the user asks "which components need a new release branch", "prepare release X.Y", "what needs releasing for the next version", or "audit the components for the release". Determines which KubeRocketCI components require a new release branch, at which version, by comparing each component's default branch against its last release branch. For writing the RELEASES.md entry afterwards, defer to write-release-notes; for the docs site and upgrade guide, defer to release-docs.
argument-hint: <target-version> [previous-version]
allowed-tools: [Read, Grep, Glob, Bash, AskUserQuestion, TodoWrite]
authors:
    - KubeRocketCI Team
---

# KRCI Release Audit

Determine which components need a new release branch for an upcoming platform release, and at which
version. This runs **first** in a release cycle — before release notes exist and before any branch is
cut. The output is a decision table the release owner acts on.

## Core Rule

A component needs a new release branch **if and only if its default branch has real commits since its
last release branch**. "Real" excludes the mechanical version-bump commit. Zero real commits means no
branch, no tag, no version bump — cutting releases for unchanged components creates churn and
confuses the compatibility matrix.

A dependency-only or CVE-only delta still counts as real. Decide separately whether it ships as a
**minor** (new release branch) or a **patch** on the existing release branch — a single security bump
usually warrants a patch.

## Inputs

1. **Target platform version** and the **previous** one, from `$ARGUMENTS` or AskUserQuestion. Do
   not guess.
2. **A provisioned `krci-workspace`.** Clone the component set with `./bootstrap.sh` and refresh it
   with `./git-pull-all.sh`.

   Reconcile the cloned set against the component table in `references/component-matrix.md` before
   starting. An absent repo drops out of the audit silently, with no error and no gap in the output,
   which reads as "nothing changed" rather than "not checked".

## Workflow

### Phase 1 — Collect the raw data

Run the bundled script; it fetches every repo and emits one row per component:

```bash
scripts/audit-components.sh <workspace-dir> [component ...]
```

Output is TSV: `component, default, release_branch, target_version, total, real`.

It handles the three per-repo variations documented in `references/component-matrix.md`: differing
default branches, version-sorted release branches, and charts that are not at
`deploy-templates/Chart.yaml`.

Interpret the columns:

- `target_version` is authoritative — `2.36.0-SNAPSHOT` means the next release is `2.36.0`. Never
  compute the next number by incrementing.
- `real` drives the decision. Every repo carries a `chore: Update current development version` commit
  immediately after its branch is cut; counting it makes a dormant component look active.
- `NOT_CLONED`, `NO_CHART` or `NONE` in a row means that component was **not audited** — resolve it
  before reporting rather than treating it as "no changes".

To audit a component that is not cloned locally, use the GitHub API equivalents in
`references/component-matrix.md` → Useful commands.

### Phase 2 — Classify each component

Read the surviving commit subjects for any component with `real > 0` to decide minor versus patch:

```bash
git -C <repo> log --format='%s' origin/<release_branch>..origin/<default>
```

Features or fixes → minor (new release branch). Only `chore(deps)`/`build(deps)` → candidate for a
patch on the existing branch.

`edp-tekton-common-library` is auto-bumped per commit rather than release-branch driven — report it
under "not cut" and do not attempt to branch it.

### Phase 3 — Produce the decision table

Report three groupings — never collapse them. See `examples/decision-table.md` for the expected
shape:

1. **Release branches required** — components with real commits.
2. **Not cut — no changes** — zero real commits, plus removed components. State why for each.
3. **Judgement calls** — components with changes that sit outside the platform train (not umbrella
   dependencies, or deliberately deferred). Give last-released date, pending count, proposed version.

Also produce the resulting `edp-install/deploy-templates/Chart.yaml` dependency block, old → new, so
the umbrella bump is unambiguous.

### Phase 4 — Verify against the umbrella

Compare the pinned versions in `edp-install` at both platform refs (commands in
`references/component-matrix.md`). A dependency present at the previous tag but absent on the default
branch was **removed** from the platform — report it as a removal, not an omission.

Cut the umbrella release branch **last**, after every sub-chart version is pinned.

Check the cluster add-on pins too. Add-ons pin operators independently and drift for releases at a
time; an add-on pinning an older version than the operator's latest release is a real finding. Paths
are in `references/component-matrix.md` → Non-umbrella components.

## Non-Obvious Facts

- **The umbrella's own SNAPSHOT is the target.** The `-SNAPSHOT` on `edp-install`'s default branch
  is the platform version being audited toward.
- **Not every component follows the platform train.** Some go a year between releases. Report them
  as judgement calls with their real last-release date rather than forcing them into the cycle.
- **Chart version drift is a release blocker.** A repo whose `Chart.yaml` says `0.1.0` while its
  latest tag is `v0.2.0` must be reconciled before cutting anything.

## Success Criteria

- Every component in the matrix appears in exactly one of the three groupings.
- No row left as `NOT_CLONED` / `NO_CHART` / `NONE` without resolution.
- Each "needs a branch" row cites a real commit count with the version-bump commit excluded.
- Every target version comes from a real `-SNAPSHOT`, not arithmetic.
- Removed components are called out explicitly.
- The umbrella `Chart.yaml` old → new block is included.

## Resources

- **`scripts/audit-components.sh`** — fetches and reports every component in one pass.
- **`references/component-matrix.md`** — component table, orgs, default branches, chart paths,
  branch/tag conventions, non-umbrella components and add-on pin paths, and every git/GitHub command
  this skill needs.
- **`examples/decision-table.md`** — worked example of the Phase 3 output.

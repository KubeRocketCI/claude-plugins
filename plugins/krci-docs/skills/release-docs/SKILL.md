---
name: KRCI Release Documentation
description: This skill should be used when the user asks to "write the upgrade guide", "create upgrade-krci-X.Y.md", "update the docs site for the release", "cut the docs version", "version the docs for the new release", "release the docs", "align the install guide with the new release", or "update krci-docs for the latest release". Produces the docs.kuberocketci.io changes for a KubeRocketCI platform release - the upgrade guide, affected pages, install-guide version pins, and the versioned snapshot. For the RELEASES.md changelog entry, defer to write-release-notes; for deciding which components need a release branch, defer to release-audit.
argument-hint: <new-version> [previous-version]
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, Task, AskUserQuestion, TodoWrite]
authors:
    - KubeRocketCI Team
---

# KRCI Release Documentation

Produce every `krci-docs` change a platform release requires: a new upgrade guide, edits to pages the
release invalidated, install-guide version pins, and the frozen version snapshot. The audience is an
operator upgrading an existing cluster.

## The Rule That Governs Everything

**Never state a values key, annotation, path, version, command or CRD field that is not visible in
real code at a real git ref.** "Not found" is a valid, valuable answer; a confident guess is a defect
that ships to operators. Derive content by reading diffs, not commit subjects — subjects both
overstate and understate.

## Inputs

1. **New and previous platform versions** from `$ARGUMENTS` or AskUserQuestion.
2. **Component release ranges** — from `release-audit`, or by comparing `edp-install`
   `Chart.yaml` at both platform tags. Use **release-branch ranges**
   (`origin/release/0.26..origin/release/0.27`), never the default branch: after a release is cut,
   the default branch already contains the *next* version's work, which must not leak into these docs.
3. **A provisioned `krci-workspace`** (`./bootstrap.sh`, then `./git-pull-all.sh`). Local clones are
   the expected starting point: every commit in the release ranges is read in full, often across
   dozens of tickets in parallel, which the GitHub API serves too slowly and rate-limits under
   concurrency.

   Reconcile the cloned set against the components in the release ranges before starting. Working
   without a component's source does not produce an error — it produces confident, wrong
   documentation, or silent deletion of correct content on the grounds that it cannot be verified.

## Workflow

### Phase 1 — Build the ticket → commit map

Group every commit in the release ranges by Jira ID (`EPMDEDP-#####`). Commits without one (some
repos) group by repository. Exclude `Update current development version` and version bumps.

This map is the work list. Every entry must reach a verdict — documented, or explicitly recorded as
no-doc-impact with a reason. Track it with TodoWrite.

### Phase 2 — Analyse each ticket

For a small release, work through the map directly. For a large one (20+ tickets), parallelise with
the Task tool using **one agent per Jira ticket**, because each ticket is independently analysable
and the reading is the slow part.

Each analysis, however it runs, must:

1. Read the **full diff and commit body** of every commit for the ticket.
2. Read the resulting `values.yaml` / `README.md` / CRD types at the release ref, and diff them
   against the previous ref to capture every added, changed or removed key **with its real default**.
3. Look for an explicit `BREAKING CHANGE:` trailer. If present, an upgrade step is mandatory.
4. Classify the change as user-facing if the answer to **any** of these is yes:
   - Does it add, rename, remove or change the default of a values key, CRD field, annotation,
     environment variable or CLI flag?
   - Does it change what an operator must do to install, upgrade or operate the platform?
   - Does it change default behaviour, output, or an integration's success/failure state — even
     silently, with no key changed?
   - Does it make any existing sentence in the docs false?

   If none apply — pure refactor, CI plumbing, test-only change — record no-doc-impact with the
   **specific** reason, not a generic "internal change". When genuinely unsure, classify as
   user-facing and let the adversarial pass downgrade it: a false positive costs one verification
   pass, a false negative ships a release with missing docs.
5. Search `krci-docs` for pages already covering the area, and quote existing text the change makes
   **wrong** — stale docs harm as much as missing docs.

Then verify adversarially: for each user-facing result, run a second pass prompted to **refute**,
checking that every cited key, annotation and page path actually exists. Treat verifier output as
advisory — verifiers are wrong often enough that findings need confirming before acting.

Before moving on, re-check every no-doc-impact verdict whose reason is empty or generic, and
reconcile the finished set against the Phase 1 map by count — tickets drop silently otherwise.

### Phase 3 — Write the upgrade guide

Create `docs/operator-guide/upgrade/upgrade-krci-<X.Y>.md`. Read the previous release's guide first
and match it exactly. Format and ordering rules: `references/upgrade-guide-format.md`.

Order steps by what an operator must do first, breaking changes early. End with the `helm upgrade`
step and a post-upgrade verification step.

### Phase 4 — Update affected pages

Apply the per-ticket doc targets. When parallelising, partition edits so each agent owns a
**disjoint set of files** — concurrent writers on one file clobber each other. Give the upgrade guide
a single owner.

Prefer surgical edits to existing pages over new pages. Fix stale content as well as adding new.

### Phase 5 — Align the install guides

Independent of any ticket: the install guides pin the platform version and go stale every release.
Locations and the line-anchor trap are in `references/versioning.md`. Fresh installs normally need no
new configuration — new hardened defaults apply automatically — so this is usually version bumps only.

### Phase 6 — Cut the version snapshot

Run **after** all content is final, following `references/versioning.md` exactly — it is five
sub-steps, not one command.

One of them, retiring the oldest doc version, is **destructive**: it requires explicit user approval,
never inference from what a previous release did.

### Phase 7 — Validate

```bash
scripts/validate-docs-release.sh <docs-repo> <X.Y> [<PREV>]
```

Runs snapshot sync, stale-pin detection, spell-check, typecheck and build in one pass. A clean run of
all five is the release's definition of done.

## Reporting

State plainly what was documented, what was recorded as no-doc-impact and why, anything that could
not be grounded in code, and any placeholder left behind (for example a release-schedule date that is
not yet decided). Do not describe partial work as complete.

## Success Criteria

- Every ticket from the Phase 1 map has a verdict, each no-doc-impact one with a specific reason.
- Every values key, annotation and version in the docs matches real code at the release refs.
- `scripts/validate-docs-release.sh` passes every check — snapshot sync, stale pins, spell-check,
  typecheck and build.
- Install guides reference the new version.
- Breaking changes appear early in the upgrade guide and in its breaking-changes summary.

## Resources

- **`scripts/validate-docs-release.sh`** — the full validation sequence; single source of truth for
  what "done" means.
- **`references/versioning.md`** — docs versioning procedure, `versions.json` semantics, the
  snapshot sync rule, install-guide pin locations, values.yaml line-anchor drift.
- **`references/upgrade-guide-format.md`** — step heading format, classifications, ordering,
  required first and last steps, admonition style.

---
name: KRCI Release Notes Writer
description: This skill should be used when the user asks to "write release notes", "update RELEASES.md", "prepare notes for the X.Y.Z release", "generate KubeRocketCI release notes", or "document what changed in this platform release". Builds the full platform release entry in edp-install/RELEASES.md from component changelogs, git history, cluster add-on changes, docs changes, and YouTube videos. This covers the changelog only. For deciding which components need a release branch and at which version, defer to release-audit; for the docs site, upgrade guide and install-guide pins, defer to release-docs; for reviewing an existing docs page, defer to doc-review.
argument-hint: <new-version> [previous-version]
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch, AskUserQuestion, TodoWrite]
authors:
    - KubeRocketCI Team
---

# KubeRocketCI Release Notes Writer

Produce a complete platform release entry for `edp-install/RELEASES.md` (What's New, Upgrades, New Functionality, Enhancements, Fixed Issues, Documentation, and related YouTube videos). The audience is platform users and operators — not the engineering team.

This skill encodes the production workflow used for KubeRocketCI platform releases (for example 3.14.0). Follow it end-to-end even with no prior conversation context.

## Language

Reply to the user in the language they wrote to you in. Keep the RELEASES.md content itself in **English** (that file is the public product changelog).

## Before You Start

1. **Confirm versions.** Identify the new platform version (for example `3.14.0`) and the previous one (for example `3.13.5`) from `$ARGUMENTS` or AskUserQuestion. Do not guess. Take the release date for the heading from the date of the `v<NEW>` tag of `edp-install` (`git log -1 --format=%ad --date=short v<NEW>`) and confirm it.
2. **Confirm the RELEASES.md path.** Default: `edp-install/RELEASES.md` in the current workspace (or a sibling clone). If missing, AskUserQuestion for the path or clone `epam/edp-install` (see "Workspace and repositories").
3. **Read the format baseline.** Open `references/releases-format.md` and the most recent major/minor entry in RELEASES.md (for example Version 3.13.0) before writing. Match that structure and tone.
4. **Track work.** Use TodoWrite for the phases below so long runs stay reviewable.

## Workspace and Repositories

You need git history across several repos. **Prefer cloning yourself** over asking the user to pre-clone. If usable clones already exist in the workspace, reuse them (fetch tags / pull as needed).

Repositories needed: `edp-install`, `edp-tekton`, `edp-codebase-operator`, `edp-cd-pipeline-operator`, `krci-portal`, the docs repo (the local folder may be called `krci-docs`) and `edp-cluster-add-ons`. External components such as `gitfusion` are needed only for their version. Orgs, clone URLs and tag conventions: `references/component-repos.md`.

**Clone rules:**

- Work directory: AskUserQuestion once, or default to `./.krci-release-workspace` under the current project (do not commit it). Clone with a normal or blobless clone, then `git fetch --tags --force`, so `git log` and `git show <tag>:path` work across the range.
- Do **not** require the user to hand-prepare clones. If a clone fails (auth/network), report the repo URL and error, then AskUserQuestion whether to continue with partial sources.

## Workflow

**Write only what a source in the workspace confirms** (Chart.yaml, git history, the docs repo). If a source does not exist yet — for example the upgrade guide, a docs page or a published release — omit that detail instead of guessing it.

### Phase 1 — Resolve component versions

1. From `edp-install`, compare Helm chart dependencies at the two platform tags:

   ```bash
   git show v<PREV>:deploy-templates/Chart.yaml
   git show v<NEW>:deploy-templates/Chart.yaml
   ```

2. Build a table: component → previous chart version → new chart version. That table is the source of truth for which git ranges to inspect (for example `krci-portal` `0.5.0` → `0.6.0`).
3. Confirm the platform chart/app version matches the release you are documenting.
4. Classify every bumped dependency as a **platform** or an **external** component (the lists are in `references/component-repos.md`). Platform components are described from their PRs (Phase 2); their versions and the platform version are never written in Upgrades. External components get no `feat:` / `fix:` collection, only one line in Upgrades (format in `references/releases-format.md`).

### Phase 2 — Collect changes per component

For each bumped **platform** component (external components only need their new version, see Phase 1):

1. Prefer `CHANGELOG.md` (or `git show v<new>:CHANGELOG.md`) for the version range. If CHANGELOG for that tag is polluted with older history (regen artifacts), **trust `git log` between tags** instead.
2. Collect commits:

   ```bash
   git log v<PREV_COMPONENT>..v<NEW_COMPONENT> --oneline
   ```

   **Range discipline:** always compare release tags or release branches — never the default branch.
   Once a release is cut, `master`/`main` already carries the *next* version's work, which must not
   leak into these notes. Where a component shipped a patch on an existing branch (for example
   `0.6.0` → `0.6.1`), use `v<PREV>..origin/release/<X.Y>`. Exclude PRs and commits merged after the date of the new tag: they belong to the next release.

3. Keep `feat:` / `fix:` (and clearly user-facing `refactor:` only when behavior changes). Drop Dependabot-only bumps, CLAUDE.md and CI/changelog-format tooling. Never drop a `chore:` (including "Update current development version") by its subject alone: defaults and permissions sometimes change inside such commits. Check the chart paths with the command in `references/component-repos.md` and keep a change when its diff alters a default value, a template or a permission that users observe, or ships a user-visible dependency (for example tekton-cache chart bump).
4. For each kept change, capture: short user-facing summary, Jira id (`EPMDEDP-#####`) from the commit subject/body, and GitHub PR number when available.

**Map Jira → PR.** Find the PR in the **same repository as the commit**; search commands, the `gh pr list` listing and the fallback without `gh` (with its rate limits) are in `references/component-repos.md`. Match by Jira ID and title. When one Jira ID has several PRs and a commit cannot be tied to one of them, list them all. If a PR cannot be found or the rate limit is reached, keep the Jira ID only and report the gap.

**Verify every PR link before publishing.** A wrong number in RELEASES.md is permanent. Extract every `pull/NNN` from the new entry and confirm it is merged (`gh pr view <N> --repo <org>/<repo> --json state`, or the list of merged PRs of its repository when `gh` is missing), and say in the summary how the check was done.

### Phase 2b — Cluster add-ons

`edp-cluster-add-ons` is not in `Chart.yaml`, so it is easy to miss. Review its history for the release window (command in `references/component-repos.md`):

- a new add-on and a notable behavior change of an existing one go to New Functionality or Enhancements, one bullet each, with the Jira ID and the `epam/edp-cluster-add-ons` PR; say whether the add-on is enabled by default (`clusters/core/apps/values.yaml`);
- a version bump of an external tool (Argo CD, Capsule, KEDA, …) goes to Upgrades;
- skip routine chart bumps without a visible effect and the "Upgrade KubeRocketCI add-on to X.Y.Z" commit;
- a new add-on needs no documentation page: do not look for one, link one, or list it under Documentation.

### Phase 3 — Draft platform sections (product content)

Write into `RELEASES.md` under a new heading (insert after Overview TOC links, before the previous version):

```markdown
## Version X.Y.Z <a name="X.Y.Z"></a> (Month DD, YYYY)
```

Also add `* [Version X.Y.Z](#X.Y.Z)` at the top of the Overview list.

Populate sections using `references/releases-format.md`. Typical order for a major/minor:

1. **What's New** — short narrative, one short paragraph per theme users care about. There is no fixed number of themes: a large release gets as many as it needs. If a YouTube block applies, leave a placeholder here (`<!-- YouTube block: filled in Phase 5 -->`) — the video list is only gathered in Phase 5, so do not write video links or guess them now.
2. **Breaking Changes** — only what meets the criterion below; omit the heading if empty.
3. **Upgrades** — upgraded external components, in the format below.
4. **New Functionality**
5. **Enhancements**
6. **Fixed Issues**
7. **Documentation** — Phase 4.

**Editorial rules (non-negotiable):**

- One user-facing outcome per bullet. Do **not** describe internal plumbing (RBAC aggregation, Helm value propagation, leader election) as separate bullets when the feature is already covered.
- Merge multi-repo work for the same feature into one bullet (Jira + PRs from each repo as needed).
- "Follow-up" fix PRs may share a Jira with the feature; do not invent a second feature bullet for them unless the fix is independently user-visible and not already implied.
- Link style: `([EPMDEDP-#####](https://jiraeu.epam.com/browse/EPMDEDP-#####), [#NNN](https://github.com/<org>/<repo>/pull/NNN))`. Jira is preferred; PR when known. Upgrades use their own format (below).
- **Breaking Changes, Upgrades and What's New follow the criteria and formats in `references/releases-format.md`.** For every Breaking Changes candidate ask "What must the operator do before or during the upgrade?"; if the answer is "nothing", it is not breaking.

### Phase 4 — Documentation subsection

From the `docs` repo (git log between the previous docs release commit/tag and HEAD / the docs PR for this platform release):

1. List commits that change `docs/`, `faq/`, `src/` (landing). Ignore `CLAUDE.md` and Dependabot-only noise.
2. Structure Documentation exactly like prior releases:

   - **General** (no subheading): landing page, site-wide features, removals that are not a single guide page.
   - Then section blocks with this phrasing:

     `The [Getting Started](https://docs.kuberocketci.io/docs/about-platform) section is updated with the following:`

     (Same pattern for Operator Guide, User Guide, Developer Guide, FAQ, Use Cases when applicable — keep this order, matching `references/releases-format.md`.)

   - **Getting Started** includes Supported Versions and Compatibility (it is part of that sidebar group — do **not** put Supported Versions under General).
3. Each bullet: "The [Page Title](canonical-url) page has been added/updated." + docs PR link (`KubeRocketCI/docs`).

   **Never construct a docs URL from a commit message.** A plausible-looking path that does not exist
   is a broken public link. Confirm each page exists first, and map `docs/a/b.md` →
   `https://docs.kuberocketci.io/docs/a/b`:

   ```bash
   git -C docs ls-tree -r --name-only origin/main -- docs/ | grep -E '<slug>'
   ```

   When a page does not exist yet — for example a Supported Versions update that has not landed —
   write the bullet **without a link** rather than inventing one, or omit it until the docs ship.
4. Map docs commits to PRs the same way as component PRs (`repo:KubeRocketCI/docs EPMDEDP-##### is:pr is:merged`).

### Phase 5 — YouTube videos

1. Fetch the channel feed:

   ```bash
   curl -sL "https://www.youtube.com/feeds/videos.xml?channel_id=UCPi_wht-YbhQInGrQjR5Rkw"
   ```

2. Include videos published **after the previous platform release date** and not already listed in that previous RELEASES.md entry.
3. Skip Shorts unless the user asks to include them.
4. Place under What's New with the established intro line (see `references/releases-format.md`).

### Phase 6 — Review with the user

1. Present a short summary: component version table, section counts, known gaps (missing PRs, rate limits).
2. Invite sequential review (users often walk line-by-line). Apply edits they request: drop plumbing bullets, fix PR/repo mismatches, typo fixes.
3. Do not commit, push or open a pull request, and do not offer or ask about it: the user handles git.

## Success Criteria

- Overview TOC includes the new version anchor.
- Entry matches `references/releases-format.md` and recent RELEASES.md tone.
- Component ranges come from Chart.yaml tag comparison, not guesswork.
- Bullets are user-facing; developer-only and duplicate plumbing items are excluded.
- Breaking Changes and Upgrades follow the criterion and format in `references/releases-format.md`; the `edp-cluster-add-ons` history of the release window has been reviewed.
- Documentation uses Getting Started / Operator Guide / User Guide / … section headers correctly.
- YouTube list (when any new videos exist) is present and dated after the previous release.
- Links use Jira and/or GitHub PR forms consistent with prior entries.

## Reference Files

- **`references/releases-format.md`** — section order, wording patterns, Documentation layout, include/exclude rules, link examples.
- **`references/component-repos.md`** — clone URLs, orgs, tag naming, Chart.yaml dependency names, helper commands.

## Related Skills

The release cycle runs in this order:

1. **`release-audit`** — which components need a release branch and at which version (before any branch is cut).
2. **`write-release-notes`** — this skill; the RELEASES.md entry.
3. **`release-docs`** — the docs site: upgrade guide, affected pages, install-guide pins, versioned snapshot.

---
name: KRCI Release Notes Writer
description: This skill should be used when the user asks to "write release notes", "update RELEASES.md", "prepare notes for the X.Y.Z release", "generate KubeRocketCI release notes", or "document what changed in this platform release". Builds the full platform release entry in edp-install/RELEASES.md from component changelogs, git history, docs changes, and YouTube videos. For reviewing existing docs pages, defer to doc-review.
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

1. **Confirm versions.** Identify the new platform version (for example `3.14.0`) and the previous one (for example `3.13.5`) from `$ARGUMENTS` or AskUserQuestion. Do not guess. Also confirm the release date for the heading.
2. **Confirm the RELEASES.md path.** Default: `edp-install/RELEASES.md` in the current workspace (or a sibling clone). If missing, AskUserQuestion for the path or clone `epam/edp-install` (see "Workspace and repositories").
3. **Read the format baseline.** Open `references/releases-format.md` and the most recent major/minor entry in RELEASES.md (for example Version 3.13.0) before writing. Match that structure and tone.
4. **Track work.** Use TodoWrite for the phases below so long runs stay reviewable.

## Workspace and Repositories

You need git history across several repos. **Prefer cloning yourself** over asking the user to pre-clone. If usable clones already exist in the workspace, reuse them (fetch tags / pull as needed).

| Repo | Org | Why needed |
|------|-----|------------|
| `edp-install` | `epam` | RELEASES.md target; Chart.yaml dependency versions |
| `edp-tekton` | `epam` | Pipelines / interceptor / cache changes |
| `edp-codebase-operator` | `epam` | Codebase / GitServer / scaffolding |
| `edp-cd-pipeline-operator` | `epam` | CDPipeline / Stage / CBIS |
| `krci-portal` | `KubeRocketCI` | Portal UI / API |
| `docs` | `KubeRocketCI` | Documentation section (no CHANGELOG — use git log) |
| `gitfusion` (optional) | `KubeRocketCI` | Only if Chart.yaml bumped it with user-facing changes |

Exact clone URLs and tag conventions: `references/component-repos.md`.

**Clone rules:**

- Work directory: AskUserQuestion once, or default to `./.krci-release-workspace` under the current project (create if missing; do not commit it).
- Clone with network access. Prefer a normal clone (or blobless filter) so `git log` / `git show <tag>:path` work across the version range. After clone: `git fetch --tags --force`.
- Do **not** require the user to hand-prepare clones. If clone fails (auth/network), report the exact repo URL and error, then AskUserQuestion whether to continue with partial sources.

## Workflow

### Phase 1 — Resolve component versions

1. From `edp-install`, compare Helm chart dependencies at the two platform tags:

   ```bash
   git show v<PREV>:deploy-templates/Chart.yaml
   git show v<NEW>:deploy-templates/Chart.yaml
   ```

2. Build a table: component → previous chart version → new chart version. That table is the source of truth for which git ranges to inspect (for example `krci-portal` `0.5.0` → `0.6.0`).
3. Confirm the platform chart/app version matches the release you are documenting (`helm search repo epamedp/edp-install` is optional sanity check if the Helm repo is configured).

### Phase 2 — Collect changes per component

For each bumped component:

1. Prefer `CHANGELOG.md` (or `git show v<new>:CHANGELOG.md`) for the version range. If CHANGELOG for that tag is polluted with older history (regen artifacts), **trust `git log` between tags** instead.
2. Collect commits:

   ```bash
   git log v<PREV_COMPONENT>..v<NEW_COMPONENT> --oneline
   ```

3. Keep `feat:` / `fix:` (and clearly user-facing `refactor:` only when behavior changes). Drop pure `chore:`, Dependabot-only bumps, CLAUDE.md, CI/changelog-format tooling, and "Update current development version" unless they ship a user-visible dependency (for example tekton-cache chart bump).
4. For each kept change, capture: short user-facing summary, Jira id (`EPMDEDP-#####`) from the commit subject/body, and GitHub PR number when available.

**Map Jira → PR** (when the commit has no `#NNN`):

```bash
# Example search (adjust org/repo) — use -G + --data-urlencode so spaces/qualifiers are encoded safely
curl -sG "https://api.github.com/search/issues" --data-urlencode "q=repo:epam/edp-tekton EPMDEDP-17181 is:pr is:merged"
```

Respect GitHub API rate limits (pause between searches). If rate-limited, leave Jira-only and note gaps for the user. Prefer the PR in the **same repository as the commit**, not a coincidental match in another repo.

### Phase 3 — Draft platform sections (product content)

Write into `RELEASES.md` under a new heading (insert after Overview TOC links, before the previous version):

```markdown
## Version X.Y.Z <a name="X.Y.Z"></a> (Month DD, YYYY)
```

Also add `* [Version X.Y.Z](#X.Y.Z)` at the top of the Overview list.

Populate sections using `references/releases-format.md`. Typical order for a major/minor:

1. **What's New** — short narrative (2–4 paragraphs) of the themes users care about. If a YouTube block applies, leave a placeholder here (`<!-- YouTube block: filled in Phase 5 -->`) — the video list is only gathered in Phase 5, so do not write video links or guess them now.
2. **Breaking Changes** — only when there are real breaking changes; omit the heading if empty.
3. **Upgrades** — dependency/chart bumps that operators should notice.
4. **New Functionality**
5. **Enhancements**
6. **Fixed Issues**
7. **Documentation** — Phase 4.

**Editorial rules (non-negotiable):**

- One user-facing outcome per bullet. Do **not** describe internal plumbing (RBAC aggregation, Helm value propagation, leader election) as separate bullets when the feature is already covered.
- Merge multi-repo work for the same feature into one bullet (Jira + PRs from each repo as needed).
- "Follow-up" fix PRs may share a Jira with the feature; do not invent a second feature bullet for them unless the fix is independently user-visible and not already implied.
- Link style: `([EPMDEDP-#####](https://jiraeu.epam.com/browse/EPMDEDP-#####), [#NNN](https://github.com/<org>/<repo>/pull/NNN))`. Jira is preferred; PR when known. Artifact Hub / upstream release links for Upgrades as in prior entries.

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
3. Do not push or open a PR unless the user explicitly asks.

## Success Criteria

- Overview TOC includes the new version anchor.
- Entry matches `references/releases-format.md` and recent RELEASES.md tone.
- Component ranges come from Chart.yaml tag comparison, not guesswork.
- Bullets are user-facing; developer-only and duplicate plumbing items are excluded.
- Documentation uses Getting Started / Operator Guide / User Guide / … section headers correctly.
- YouTube list (when any new videos exist) is present and dated after the previous release.
- Links use Jira and/or GitHub PR forms consistent with prior entries.

## Reference Files

- **`references/releases-format.md`** — section order, wording patterns, Documentation layout, include/exclude rules, link examples.
- **`references/component-repos.md`** — clone URLs, orgs, tag naming, Chart.yaml dependency names, helper commands.

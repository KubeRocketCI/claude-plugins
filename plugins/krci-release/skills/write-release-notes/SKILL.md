---
name: KRCI Release Notes Writer
description: This skill should be used when the user writes the edp-install/RELEASES.md entry for a KubeRocketCI platform release. For the release itself, defer to release-train; for the docs site and upgrade guide, defer to release-docs.
argument-hint: <new-version> [previous-version]
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch, AskUserQuestion, TodoWrite]
authors:
    - KubeRocketCI Team
---

# KubeRocketCI Release Notes Writer

Write the platform entry in `sources/edp-install/RELEASES.md`. Audience: platform users and
operators, not the engineering team. The entry is in English.

## Before You Start

- Workspace, component ranges, docs links, noise: `../../references/release-sources.md`.
- New and previous platform versions, and the release date for the heading: from `$ARGUMENTS` or
  AskUserQuestion. Do not guess.
- Read `references/releases-format.md` and the latest minor entry in `RELEASES.md`. Match them.

## Workflow

### 1. Collect changes per bumped component

1. Commits in the component range. `CHANGELOG.md` at the new tag is a faster source; when it holds
   older sections (regenerated history), use `git log` instead.
2. Keep user-visible changes (`feat:`, `fix:`, a `refactor:` that changes behavior). Drop noise. A
   dependency bump stays when it changes runtime (for example the tekton-cache chart).
3. Per change: a user-facing summary, the Jira ID, the PR number.

Jira → PR: a `(#NNN)` at the end of the commit subject is the PR; use it. Else list the merged PRs
of the release window and match the Jira ID in the title. Per-commit search mis-maps across
repositories.

```bash
gh pr list --repo <org>/<repo> --state merged --limit 60 \
  --json number,title,mergedAt -q '.[] | select(.mergedAt > "<PREV_RELEASE_DATE>") | "\(.number)|\(.title)"'
```

Use the PR in the repository of the commit. No PR found: Jira only, and list the gap for the user.

### 2. Draft the entry

Insert the version heading after the Overview list, before the previous version, and add the
Overview link. Sections, bullet style, include and exclude rules: `references/releases-format.md`.
Leave a placeholder in What's New for the videos (step 4).

### 3. Documentation

`git -C sources/krci-docs log` from the previous platform release date: commits that change `docs/`,
`faq/`, `src/`. Section layout: `references/releases-format.md`. Every page link checked
(`release-sources.md`, Docs Links). Docs PRs: same Jira → PR match in `KubeRocketCI/docs`.

### 4. YouTube videos

```bash
curl -sL "https://www.youtube.com/feeds/videos.xml?channel_id=UCPi_wht-YbhQInGrQjR5Rkw"
```

Videos published after the previous platform release date and not in the previous entry. Skip Shorts
unless the user asks.

### 5. Verify and review

1. Every `pull/NNN` in the new entry: `gh pr view <N> --repo <org>/<repo> --json state` reports
   `MERGED`. A wrong PR number in `RELEASES.md` is permanent.
2. Show the user the component table, section counts and known gaps. Walk the review checklist in
   `references/releases-format.md`; apply the requested edits.
3. No push or PR unless the user asks.

## Reference Files

- `references/releases-format.md` — headings, section order, bullet style, include and exclude
  rules, Documentation layout, review checklist.
- `../../references/release-sources.md` — workspace, component ranges, docs links, noise (shared).

# RELEASES.md Format Reference

Use this file as the structure and editorial contract for KubeRocketCI platform release notes in `epam/edp-install` → `RELEASES.md`.

## Overview TOC

At the top of the file, prepend:

```markdown
* [Version X.Y.Z](#X.Y.Z)
```

Keep the list newest-first.

## Version heading

```markdown
## Version X.Y.Z <a name="X.Y.Z"></a> (Month DD, YYYY)
```

Example: `## Version 3.14.0 <a name="3.14.0"></a> (July 14, 2026)`

## Section order (major / minor releases)

Omit a heading entirely when that section has nothing worth publishing (do not leave empty stubs).

1. `### What's New`
2. `### Breaking Changes` (only if needed)
3. `### Upgrades`
4. `### New Functionality`
5. `### Enhancements`
6. `### Fixed Issues`
7. `### Documentation`

Patch releases (for example `3.13.5`) may contain only `### Upgrades` or a short Fixed Issues list — match the size of the change.

## What's New

2–4 short paragraphs summarizing themes for operators and developers using the platform. Lead with outcomes (cancel-in-progress, Envoy Gateway, Kubernetes mode, etc.), not internal ticket IDs.

Then, when there are new YouTube videos since the previous platform release:

```markdown
We continue to publish helpful video content on our [YouTube channel](https://www.youtube.com/@theplatformteam). Here's the latest content:

* [Video Title](https://www.youtube.com/watch?v=VIDEO_ID)
```

Channel RSS: `https://www.youtube.com/feeds/videos.xml?channel_id=UCPi_wht-YbhQInGrQjR5Rkw`

## Bullet style

```markdown
* Added <user-visible capability>. ([EPMDEDP-#####](https://jiraeu.epam.com/browse/EPMDEDP-#####), [#NNN](https://github.com/<org>/<repo>/pull/NNN))
* Fixed <user-visible problem>. ([EPMDEDP-#####](https://jiraeu.epam.com/browse/EPMDEDP-#####), [#NNN](https://github.com/<org>/<repo>/pull/NNN))
```

Rules:

- Start with a past-tense action verb — **Added** / **Fixed** / **Improved** / **Updated** / **Replaced** are the common ones, but this list is illustrative, not exhaustive (prior releases also use **Enabled**, **Upgraded**, **Reduced**, **Remediated**, etc.). Match the verb to the change.
- Prefer product language (`pipelines.cancelInProgress`, portal Networking tab) over implementation language (`ClusterRole aggregation`).
- Multiple PRs for one outcome: one bullet, multiple links.
- Same feature across repos: one bullet with both Jira/PR pairs, for example  
  `([EPMDEDP-17140](...), [#651](https://github.com/epam/edp-tekton/pull/651)) ([EPMDEDP-17177](...), [#294](https://github.com/epam/edp-codebase-operator/pull/294))`
- Upgrades may link Artifact Hub or upstream release notes instead of (or in addition to) Jira/PR.

## What to include

- User- or operator-visible features, UI changes, pipeline behavior, config flags they set, fixes they can observe.
- Dependency bumps that change runtime (tekton-cache chart, Node.js image in pipelines, etc.).
- Docs page adds/updates and landing-page changes.
- YouTube tutorials published after the previous platform release date.

## What to exclude

- Developer convenience only: CLAUDE.md, eslint/prettier, Dependabot noise, changelog/commit-lint format changes, "Update current development version".
- Implementation-only follow-ups when the feature bullet already exists (example: adding Envoy resources to view RBAC so the Networking tab works for developers — do not list separately from "Envoy Gateway support in the portal").
- Duplicate bullets for the same Jira across New Functionality and Enhancements unless they are genuinely different outcomes.
- Speculative future work.

## Documentation subsection layout

```markdown
### Documentation

* The [landing page](https://kuberocketci.io/) has been updated. ([#NNN](https://github.com/KubeRocketCI/docs/pull/NNN))

The [Getting Started](https://docs.kuberocketci.io/docs/about-platform) section is updated with the following:

* The [Install KubeRocketCI](https://docs.kuberocketci.io/docs/quick-start/platform-installation) page has been updated. ([#NNN](https://github.com/KubeRocketCI/docs/pull/NNN))
* The [Supported Versions and Compatibility](https://docs.kuberocketci.io/docs/supported-versions) page has been updated for the X.Y release. ([#NNN](https://github.com/KubeRocketCI/docs/pull/NNN))

The [Operator Guide](https://docs.kuberocketci.io/docs/operator-guide) section is updated with the following:

* The [Page Title](https://docs.kuberocketci.io/docs/operator-guide/...) page has been added. ([#NNN](...))
* The [Page Title](https://docs.kuberocketci.io/docs/operator-guide/...) page has been updated. ([#NNN](...))

The [User Guide](https://docs.kuberocketci.io/docs/user-guide) section is updated with the following:

* ...

The [Developer Guide](https://docs.kuberocketci.io/docs/developer-guide) section is updated with the following:

* ...

The [FAQ](https://docs.kuberocketci.io/faq/general-questions) section is updated with the following:

* ...

The [Use Cases](https://docs.kuberocketci.io/docs/use-cases) section is updated with the following:

* ...
```

Notes:

- **Getting Started** is the correct name (not "Quick Start") in RELEASES.md, matching prior releases.
- **Supported Versions and Compatibility** belongs under Getting Started, not under the unlabelled General bullets.
- Use page `title:` from the Markdown front matter for link text.
- Prefer canonical URLs from each page's `<link rel="canonical" ...>` when present.
- Docs PRs live under `https://github.com/KubeRocketCI/docs/pull/NNN`.
- Skip Developer Guide / FAQ / Use Cases blocks when there were no changes in that area.

## Collaborative review checklist

When walking the draft with a human reviewer:

1. Confirm Chart.yaml version table.
2. Drop or merge any remaining plumbing bullets.
3. Verify each `#PR` points at the repo that owns the change.
4. Confirm Documentation section names and Supported Versions placement.
5. Confirm YouTube list has no videos already listed in the previous release entry.

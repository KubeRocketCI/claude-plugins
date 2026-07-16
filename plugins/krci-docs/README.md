# krci-docs

KubeRocketCI Technical Writer agent for documentation and presentation review.

## Overview

This Claude Code plugin provides a Technical Writer agent that reviews and improves media artifacts — documentation pages, PowerPoint presentations, narrated overview videos (scenario + React presentation app), and platform release notes — applying the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/) and the project's own documentation standards.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| **technical-writer** | Agent | Technical writing consultation; routes to the review, video-production, and release-notes skills |
| **doc-review** | Skill | Review and refine documentation pages against style and project standards |
| **ppt-review** | Skill | Review and improve PowerPoint presentations, producing an edited copy |
| **create-video-scenario** | Skill | Write or revise the narration script for a KubeRocketCI overview video |
| **create-video-presentation-app** | Skill | Scaffold or extend the React slide-deck app used to record a video's theory segment |
| **write-release-notes** | Skill | Draft the full platform entry in `edp-install/RELEASES.md` from component history, docs, and YouTube |

## Features

### Documentation Review

- Applies the Microsoft Writing Style Guide and project documentation conventions
- Checks tone and voice, heading hierarchy, link validity, and image standards
- Edits the page in place and reports what changed and why

### Presentation Review

- Reviews and improves `.pptx` slide content
- Works on a copy (`<name>-edited.pptx`) so the original is preserved
- Supports either `python-pptx` scripting or the Office-PowerPoint-MCP-Server

### Video Production

- Writes/revises narration scenarios (theory + hands-on structure, reveal-step map) via `create-video-scenario`
- Scaffolds or extends the matching React slide-deck app via `create-video-presentation-app`, in an established dark, animated visual style
- Logs build/revision events to `~/.claude/krci-video-metrics.csv` and can render a progress chart on request

### Platform Release Notes

- Drafts a complete `edp-install/RELEASES.md` entry for a new platform version via `write-release-notes`
- Resolves component version ranges from Chart.yaml tags, then gathers changelogs / git history across operators, tekton, portal, and docs
- Clones missing repositories into a local workspace (or reuses existing clones); does not require a pre-cloned multi-repo tree
- Applies editorial rules: user-facing outcomes only, Documentation section layout (Getting Started / Operator Guide / …), YouTube videos since the previous release

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin marketplace add KubeRocketCI/claude-plugins
claude plugin install krci-docs
```

Or from a local checkout of this repository (useful when developing/testing plugin changes):

```bash
claude plugin marketplace add /path/to/claude-plugins
claude plugin install krci-docs@kuberocketci-plugins
```

A full restart of Claude Code (not just a new chat) is required after installing or updating a plugin.

## Usage

Review a documentation page:

```
/krci-docs:doc-review docs/getting-started.md
```

Review a presentation:

```
/krci-docs:ppt-review slides/roadmap.pptx
```

Write a video scenario, then build its presentation app:

```
/krci-docs:create-video-scenario "Git Servers overview"
/krci-docs:create-video-presentation-app "Git Servers overview - scenario (final).txt"
```

Write platform release notes:

```
/krci-docs:write-release-notes 3.15.0 3.14.0
```

Or ask the agent directly: "review this README for writing style", "improve my PowerPoint deck",
"help me script and build my next KubeRocketCI overview video", or
"prepare RELEASES.md for KubeRocketCI 3.15.0".

## Requirements

- Claude Code CLI
- For presentation review: Python 3 with `python-pptx`, or the Office-PowerPoint-MCP-Server

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0

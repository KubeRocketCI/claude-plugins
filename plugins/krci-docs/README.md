# krci-docs

KubeRocketCI Technical Writer agent for documentation and presentation review.

## Overview

This Claude Code plugin provides a Technical Writer agent that reviews and improves media artifacts — documentation pages and PowerPoint presentations — applying the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/) and the project's own documentation standards.

## Components

| Component | Type | Purpose |
|-----------|------|---------|
| **technical-writer** | Agent | Technical writing consultation; routes to the review skills |
| **doc-review** | Skill | Review and refine documentation pages against style and project standards |
| **ppt-review** | Skill | Review and improve PowerPoint presentations, producing an edited copy |

## Features

### Documentation Review

- Applies the Microsoft Writing Style Guide and project documentation conventions
- Checks tone and voice, heading hierarchy, link validity, and image standards
- Edits the page in place and reports what changed and why

### Presentation Review

- Reviews and improves `.pptx` slide content
- Works on a copy (`<name>-edited.pptx`) so the original is preserved
- Supports either `python-pptx` scripting or the Office-PowerPoint-MCP-Server

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-docs
```

Or install locally:

```bash
claude plugin install --local /path/to/krci-docs
```

## Usage

Review a documentation page:

```
/krci-docs:doc-review docs/getting-started.md
```

Review a presentation:

```
/krci-docs:ppt-review slides/roadmap.pptx
```

Or ask the agent directly: "review this README for writing style" or "improve my PowerPoint deck".

## Requirements

- Claude Code CLI
- For presentation review: Python 3 with `python-pptx`, or the Office-PowerPoint-MCP-Server

## Contributing

Part of the KubeRocketCI plugin marketplace. For issues and contributions, see the [repository](https://github.com/KubeRocketCI/claude-plugins).

## License

Apache-2.0

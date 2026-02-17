# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace (`kuberocketci-plugins`) containing AI agents for KubeRocketCI platform development. All content is markdown-based with YAML frontmatter - there is no compiled code, build system, or test suite.

## Linting

```bash
# Markdown linting (uses .markdownlint.yaml config)
markdownlint '**/*.md'
```

Several rules are intentionally disabled (MD013, MD024, MD033, MD036, MD040, MD041, MD060) - do not re-enable them.

## Architecture

The repo is a **marketplace** (`.claude-plugin/marketplace.json`) containing 5 independent plugins under `plugins/`:

| Plugin | Components | Domain |
|--------|-----------|--------|
| **krci-architect** | agent + 3 commands + 2 skills + scripts | Cross-repo architecture planning, workspace provisioning |
| **krci-fullstack** | agent + 2 commands + 8 skills | React/TypeScript/Radix UI portal development |
| **krci-devops** | agent + 4 commands + 3 skills | Tekton pipeline/task/trigger automation, GitLab CI components |
| **krci-godev** | agent + 2 commands + 2 skills | Go operator and CRD development |
| **krci-general** | 1 agent + 2 commands | General-purpose utilities (code review, commit message generation) |

## Plugin Component Conventions

Each plugin lives at `plugins/<name>/` and must have `.claude-plugin/plugin.json`.

**Agents** (`agents/*.md`): Frontmatter defines `name`, `description` (with `<example>` blocks for routing), `tools`, `model`, `color`. Body is the system prompt.

**Commands** (`commands/*.md`): Frontmatter defines `description`, `argument-hint`, `allowed-tools`. Body contains workflow instructions written FOR Claude (not for the user). Use `$ARGUMENTS` to reference user input. Keep `allowed-tools` minimal.

**Skills** (`skills/<name>/SKILL.md`): Frontmatter defines `name`, `description` (with trigger phrases). Body contains lean knowledge (1500-2000 words). Use `references/` subdirectory for detailed content and `examples/` for code samples.

**Scripts** (`scripts/*.sh`): Standalone bash utilities. Reference from commands via `${CLAUDE_PLUGIN_ROOT}/scripts/`.

## Key Patterns

- Commands use multi-phase workflows with explicit user checkpoints via `AskUserQuestion`
- krci-architect follows a **consultative pattern**: present options, never auto-decide, stop at checkpoints
- Agent descriptions must include `<example>` blocks with `<commentary>` for accurate routing
- Skills use progressive disclosure: lean SKILL.md pointing to detailed `references/` files
- All plugins use Apache-2.0 license, author "KubeRocketCI Team"

## Plugin Cache

Plugins are installed from this local directory into `~/.claude/plugins/cache/kuberocketci-plugins/`. After changes, plugins must be reinstalled (`/plugins update` or restart Claude Code) to refresh the cache.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a Claude Code plugin marketplace (`kuberocketci-plugins`) containing AI agents for KubeRocketCI platform development. All content is markdown-based with YAML frontmatter - there is no compiled code, build system, or test suite.

## Linting

```bash
# Markdown linting (uses .markdownlint.yaml config)
markdownlint '**/*.md'
```

Several rules are intentionally disabled in `.markdownlint.yaml` - do not re-enable them.

## Architecture

The repo is a **marketplace** (`.claude-plugin/marketplace.json`) containing independent plugins under `plugins/`. They split into **dev** plugins (write/review code or config, assume a real codebase), **agnostic** plugins (planning, analysis, testing, writing artifacts — any project), and a **meta** plugin (ecosystem guide).

| Plugin | Components | Kind | Domain |
|--------|-----------|------|--------|
| **krci-help** | agent + commands + skill | meta | Ecosystem guide + SDLC framework knowledge |
| **krci-triage** | commands + skill | dev | Jira-driven bug triage: testbed setup, workspace bootstrap, reproduce-fix-verify on a real cluster |
| **krci-architect** | agent + commands + skills | dev | Cross-repo architecture planning |
| **krci-fullstack** | agent + commands + skills | dev | React/TypeScript/Radix UI portal development |
| **krci-devops** | agent + commands + skills | dev | Tekton pipeline/task/trigger automation, GitLab CI components |
| **krci-godev** | agent + command + skill + references | dev | Go operator and CRD development |
| **krci-general** | agent + commands | dev (utility) | General utilities (code review, commit message generation) |
| **krci-ba** | agent + skills | agnostic | Business analysis: requirements, processes, journeys, business rules |
| **krci-docs** | agent + skills | agnostic | Documentation and presentation review |
| **krci-product** | agents + skills | agnostic | Product/project lifecycle + go-to-market |
| **krci-qa** | agents + skills | agnostic | Manual and automated quality assurance |

## Plugin Component Conventions

Each plugin lives at `plugins/<name>/` and must have `.claude-plugin/plugin.json`.

**Agents** (`agents/*.md`): Frontmatter defines `name`, `description` (with `<example>` blocks for routing), `tools`, `model`, `color`. Body is the system prompt.

**Commands** (`commands/*.md`): Frontmatter defines `description`, `argument-hint`, `allowed-tools`. Body contains workflow instructions written FOR Claude (not for the user). Use `$ARGUMENTS` to reference user input. Keep `allowed-tools` minimal.

**Skills** (`skills/<name>/SKILL.md`): Frontmatter defines `name`, `description` (with trigger phrases). Body contains lean knowledge (1500-2000 words). Use `references/` subdirectory for detailed content and `examples/` for code samples.

**Scripts** (`scripts/*.sh`): Standalone bash utilities. Reference from commands via `${CLAUDE_PLUGIN_ROOT}/scripts/`.

**References** (`references/*.md`): Shared knowledge files that are not auto-discovered components. Used either inside a skill (`skills/<name>/references/`) or at the plugin root when both a command and an agent consume them (e.g. `krci-godev/references/` is read by the `/krci-godev:review-code` command and the `go-dev` agent). Reference from commands/agents via `${CLAUDE_PLUGIN_ROOT}/references/`.

Small, purely procedural skills may be self-contained (no `references/` subdirectory); larger skills should keep a lean SKILL.md and push depth into `references/`.

## Hand-maintained inventories (keep in sync)

Several surfaces describe the marketplace contents by hand and **must be updated together** whenever a plugin's agents/commands/skills change, or a plugin is added/removed:

1. `.claude-plugin/marketplace.json` — registered plugins (name, source, description, keywords)
2. `plugins/krci-help/commands/help.md` — the terse `/krci-help:help` map (human-facing)
3. `plugins/krci-help/skills/krci-sdlc-framework/references/plugin-mapping.md` — the detailed inventory (agent/command/skill handles)
4. this file (`CLAUDE.md`) — the architecture table above (coarse-grained: update only when a plugin is added/removed or gains/loses a whole component type — not on every individual skill or command)

## Key Patterns

- Commands use multi-phase workflows with explicit user checkpoints via `AskUserQuestion`
- krci-architect follows a **consultative pattern**: present options, never auto-decide, stop at checkpoints
- Agent descriptions must include `<example>` blocks with `<commentary>` for accurate routing
- Skills use progressive disclosure: lean SKILL.md pointing to detailed `references/` files
- Agents use `model: inherit` — except `krci-general`'s `code-reviewer`, which deliberately pins `model: sonnet` so reviews run on a consistent, cost-appropriate model. Don't switch it to `inherit` without reason.
- Skill descriptions follow the house pattern: third person, opening with "This skill should be used when…", quoted trigger phrases, and a closing "for X, defer to Y" negative scope
- Keep `CLAUDE.md` free of dynamic data (plugin versions, exact component counts) — that lives in `plugin.json` and the filesystem; mirroring it here only invites drift
- Changing any of a plugin's files requires a `version` bump in that plugin's `.claude-plugin/plugin.json` — CI (`check-plugin-version.yml`) enforces that the version *increases* per changed plugin (it does not mandate a specific level). Pick the level per semver: PATCH = fixes/typos, MINOR = new commands/skills/agents or behavior changes, MAJOR = breaking interface/structure changes
- All plugins use Apache-2.0 license, author "KubeRocketCI Team"

## Plugin Cache

Plugins are installed from this local directory into `~/.claude/plugins/cache/kuberocketci-plugins/`. After changes, plugins must be reinstalled (`/plugins update` or restart Claude Code) to refresh the cache.

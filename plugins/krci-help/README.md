# krci-help

The map of the KubeRocketCI (KRCI) Claude Code plugin ecosystem. `krci-help` is a **meta** plugin: it does not build software — it tells you which KRCI plugin, agent, or skill to use, and how the SDLC AI framework flows from idea to shipped product.

## Why this plugin exists

The KRCI marketplace spreads many plugins, agents, and skills across the whole SDLC. `krci-help` is the single place that explains what each one is for and how they chain together from idea to shipped product — so you always know which tool to reach for.

## Features

### `/krci-help:help` — the dry ecosystem map

A terse, caveman-style, `/init`-flavored printout of the whole marketplace: every plugin grouped into **development** vs **agnostic**, each plugin's agents and skills, and the SDLC pipeline showing who owns each stage. Hardcoded for speed; pass a plugin name to zoom into one.

```
/krci-help:help
/krci-help:help krci-godev
```

### `advisor` agent — the ecosystem & SDLC guide

Ask it "which plugin should I use for X?" or "how do I take this from idea to shipped?" and it routes you to the right agent/command/skill and sequences end-to-end pipelines. It guides and routes — it does not write product code. Trigger it by asking ecosystem-orientation or workflow questions.

### `krci-sdlc-framework` skill — the stored knowledge

Reference knowledge consumed by the advisor (and available to any session): the artifact pipeline with dependencies and quality gates, the full plugin/agent/skill inventory, and ready-made runnable pipelines (idea-to-shipped-feature, onboard-a-tekton-pipeline, ship-a-go-operator, build-a-portal-feature, plan-a-project, go-to-market).

## The SDLC pipeline at a glance

```
Project Brief → PRD → Epic → Story → Architecture → Code → Test → MVP → Marketing
```

| Stage | Plugin (agent) |
|-------|----------------|
| Brief, PRD | krci-product (product-manager) |
| Refine requirements | krci-ba (business-analyst) |
| Epic, Story | krci-product (product-owner) |
| Plan, risk | krci-product (project-manager) |
| Architecture | krci-architect |
| Code (Go) | krci-godev |
| Code (portal) | krci-fullstack |
| CI/CD | krci-devops |
| Test | krci-qa |
| Docs | krci-docs |
| Go-to-market | krci-product (product-marketing-manager) |
| Commit, review (any time) | krci-general |
| Lost? | krci-help (advisor) |

## Installation

Install from the KubeRocketCI marketplace:

```bash
claude plugin install krci-help
```

## License

Apache-2.0

---
name: krci-sdlc-framework
description: This skill should be used when the user asks which KRCI plugin/agent/skill to use for a goal, how the SDLC artifact pipeline flows (project brief → PRD → epic → story → architecture → code → test → MVP → marketing), who produces or owns which artifact or handoff, or how to chain plugins into an end-to-end pipeline (idea-to-shipped-feature, onboard-a-tekton-pipeline, ship-a-go-operator, build-a-portal-feature, plan-a-project, go-to-market). It is the authoritative map of the KubeRocketCI (KRCI) SDLC AI framework onto the plugin marketplace. Use it for any KRCI ecosystem-routing or workflow-sequencing question even when the framework is not named explicitly; to actually execute a single stage, defer to that stage's own plugin/skill.
---

# KRCI SDLC Framework

This skill is the home of the KubeRocketCI SDLC AI framework: what artifacts exist, who produces them, in what order, and which Claude Code plugin does the work.

Use this skill to answer two kinds of question:

1. **Routing** — "which plugin/agent/skill do I use to do X?"
2. **Sequencing** — "what is the order of operations to take Y from idea to done, and where are the handoffs?"

## The pipeline in one line

```
Project Brief → PRD → Epic → Story → Architecture → Code → Test → MVP → Marketing
```

Each artifact depends on the one(s) before it. Skipping a dependency is the most common failure mode: an Epic written before the PRD is approved, or a Story written before its Architecture exists, will be unstable. Treat the arrows as hard dependencies, not suggestions.

## Roles → plugins (quick map)

| SDLC role / stage | Plugin (agent) | Kind |
|-------------------|----------------|------|
| Project Brief, PRD, requirement validation | krci-product (product-manager) | agnostic |
| Requirement refinement, BR/NFR, journeys, process | krci-ba (business-analyst) | agnostic |
| Epic, Story | krci-product (product-owner) | agnostic |
| Project Charter, SOW, Plan, Risk, Status | krci-product (project-manager) | agnostic |
| Architecture, design validation, cross-repo plan | krci-architect (architect) | dev |
| Code — Go, operators, CRDs | krci-godev (go-dev) | dev |
| Code — portal UI (React/TS/tRPC) | krci-fullstack (fullstack-dev) | dev |
| CI/CD — Tekton, GitLab CI | krci-devops (devops) | dev |
| Test plans, cases, execution, defects, BDD | krci-qa (qa-engineer, automation-qa-engineer) | agnostic |
| Documentation, presentations | krci-docs (technical-writer) | agnostic |
| Go-to-market, pitch, launch, sales | krci-product (product-marketing-manager) | agnostic |
| Commit messages, code review (cross-cutting) | krci-general (code-reviewer) | dev (utility) |
| Ecosystem orientation, "which plugin?" | krci-help (advisor) | meta |

**Dev vs agnostic** matters when advising: dev plugins write or review code/config and assume a real codebase; agnostic plugins produce planning, analysis, testing, and writing artifacts and apply to any project. Lead with the agnostic plugins early in the pipeline (brief→story) and the dev plugins once implementation starts.

## When to read the reference files

Keep this SKILL.md as the index. Pull in a reference file only when the question needs that depth:

- **`references/pipeline.md`** — full artifact definitions, dependencies, quality gates, handoff points, directory/file conventions (`/docs/prd/project-brief.md`, `/docs/epics/...`, etc.), and common blockers. Read it when the user asks what an artifact contains, where it lives, or why a stage is blocked.
- **`references/plugin-mapping.md`** — the complete per-plugin breakdown: every agent, command, and skill, with the use-cases each one serves. Read it when you need the exact handle (agent name, `/plugin:command`, or skill) to give the user, or a full inventory of a plugin.
- **`references/use-cases.md`** — ready-made pipelines: the ordered chain of plugins/agents for common end-to-end goals. Read it when the user states an outcome ("ship this feature", "onboard a pipeline") rather than a single step.

## Routing principles

- Name the **single best** plugin + agent first; offer alternatives only when genuinely ambiguous, with a one-line trade-off each.
- Always hand back an actionable handle: the agent to invoke, the `/plugin:command` to run, or the skill that applies.
- Check upstream dependencies before sending a user downstream. If they want Stories but have no Epic or Architecture, say what to produce first.
- Code review and commit messages (krci-general) are cross-cutting — applicable at any implementation stage, in any language.

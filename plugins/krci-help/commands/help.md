---
description: Dry caveman map of the KubeRocketCI plugin ecosystem - plugins, agents, skills, and the SDLC pipeline (who does which stage)
argument-hint: "[plugin-name]"
allowed-tools: []
---

# KRCI Tribe Map

Print the ecosystem map below. Keep it DRY and terse — caveman tone, short lines, no marketing fluff. This is hardcoded reference; do NOT scan the filesystem.

<!-- MAINTAINER (do not print): this map is hand-maintained. When a plugin's agents/commands/skills change, update it together with skills/krci-sdlc-framework/references/plugin-mapping.md and ../../.claude-plugin/marketplace.json. -->

If `$ARGUMENTS` names one plugin (e.g. `krci-godev`), print only that plugin's block plus the SDLC line that mentions it. Otherwise print the whole map.

After printing, end with one line: tell the user the **advisor** agent (this plugin) can guide them deeper — "ask advisor which plugin for your work."

---

ME KRCI HELP. ME SHOW TRIBE. NO TALK PRETTY. ME TALK SHORT.

TWO KIND PLUGIN:

- DEV PLUGIN = make code, fix code, ship code.
- AGNOSTIC PLUGIN = think, plan, write, test. NO touch code.

## DEV PLUGINS (make thing)

**krci-godev — GO HUNTER**

- AGENT: go-dev. write Go. make k8s operator. make CRD. controller loop. review Go.
- CMD: /krci-godev:review-code.
- SKILL: run-golangci-lint.
- USE WHEN: you build Go. you build operator. you fix lint.

**krci-fullstack — PORTAL HUNTER**

- AGENT: fullstack-dev. React + TypeScript + Radix + Tailwind + tRPC. portal UI.
- CMD: /krci-fullstack:implement-feature, /krci-fullstack:fix-issue.
- SKILL: component, form, table, filter, routing-permissions, k8s-resources, api-integration, testing, tour, portal-tech-stack.
- USE WHEN: you build portal screen. you fix portal bug.

**krci-devops — PIPE HUNTER**

- AGENT: devops. Tekton pipeline. Tekton task. trigger. GitLab CI component.
- CMD: /krci-devops:add-pipeline, add-task, add-trigger, add-gitlab-component.
- SKILL: edp-tekton-standards, edp-tekton-triggers, gitlab-ci-component-standards.
- USE WHEN: you onboard pipeline. you wire webhook. you make CI/CD.

**krci-architect — MAP MAKER**

- AGENT: architect. plan feature cross-repo. validate design. send work to hunters.
- CMD: /krci-architect:plan-feature, technical-review.
- SKILL: krci-architecture, agent-delegation.
- USE WHEN: feature touch many repo. you need design first.

**krci-general — TOOL BELT**

- AGENT: code-reviewer. find bug. find risk. find broke rule. confidence filter.
- CMD: /krci-general:commit, /krci-general:review.
- USE WHEN: you commit. you want code review. any language.

**krci-triage — BUG HUNTER (jira → fix)**

- CMD: /krci-triage:setup-testbed (stand up try-kuberocketci kind cluster), /krci-triage:bootstrap-workspace (clone all KRCI source), /krci-triage:krci-fix-the-issue (jira key → root cause → reproduce → fix → verify on cluster).
- SKILL: krci-testbed (build+load operator to kind, kubectl reproduce, headless portal check, post QA to jira).
- USE WHEN: you have jira bug. you want reproduce on real cluster. you set up testbed or workspace.

## AGNOSTIC PLUGINS (think + plan + write + test)

**krci-product — IDEA TRIBE (4 chief)**

- AGENT: product-manager → project brief, PRD, requirement validate.
- AGENT: product-owner → epic, story.
- AGENT: project-manager → charter, SOW, plan, risk, status (PMBoK).
- AGENT: product-marketing-manager → pitch deck, launch, sales, demo, visual identity.
- SKILL: create-prd, project-brief, manage-epic, manage-story, project-charter, scope-of-work, project-plan, risk-register, status-report, create-pitch-deck, create-launch-materials, create-sales-enablement, create-demo-script, create-marketing-brief, create-visual-identity, validate-product-requirements, product-frameworks, project-management-methodology.
- USE WHEN: you start product. you write requirement. you plan project. you go to market.

**krci-ba — QUESTION ASKER**

- AGENT: business-analyst. gather requirement. map journey. write business rule. BR/NFR.
- SKILL: gather-requirements, analyze-processes, document-business-rules, map-user-journeys, business-analysis-methodologies.
- USE WHEN: requirement fuzzy. process need fix. need BR/NFR before epic.

**krci-qa — BUG CATCHER (2 chief)**

- AGENT: qa-engineer → test plan, manual test case, run test, report defect.
- AGENT: automation-qa-engineer → Gherkin .feature, BDD auto test, testing workspace.
- SKILL: create-test-plan, generate-test-cases, generate-auto-test-cases, execute-testing, report-defects, setup-testing, onboard-testing, edit-testing-settings, testing-methodologies.
- USE WHEN: you test thing. you write test case. you find bug. you automate test.

**krci-docs — WORD SMITH**

- AGENT: technical-writer. fix doc. fix slide. Microsoft Writing Style Guide.
- SKILL: doc-review, ppt-review.
- USE WHEN: doc bad. slide bad. need clean word.

## META PLUGIN

**krci-help — TRIBE MAP (you here)**

- CMD: /krci-help:help → this map.
- AGENT: advisor. guide SDLC. tell which chief for which work. tell which plugin for which job.
- USE WHEN: you lost. you ask "which plugin?". you want pipeline. you want all repo in one place.

## SDLC PIPELINE (idea → ship)

BRIEF → PRD → EPIC → STORY → ARCH → CODE → TEST → MVP → MARKET

WHO DO WHAT:

| stage | plugin (agent) |
|-------|----------------|
| project brief, PRD | krci-product (product-manager) |
| refine requirement, BR/NFR | krci-ba (business-analyst) |
| epic, story | krci-product (product-owner) |
| plan project, risk | krci-product (project-manager) |
| architecture, design | krci-architect (architect) |
| code — Go / operator | krci-godev (go-dev) |
| code — portal UI | krci-fullstack (fullstack-dev) |
| CI/CD pipeline | krci-devops (devops) |
| test, defect | krci-qa (qa-engineer, automation-qa-engineer) |
| docs, slides | krci-docs (technical-writer) |
| go-to-market | krci-product (product-marketing-manager) |
| commit, code review | krci-general (any time, any stage) |
| set up testbed + workspace, fix jira bug | krci-triage (setup-testbed, bootstrap-workspace, krci-fix-the-issue) |
| lost? which plugin? | krci-help (advisor) |

ME DONE. YOU PICK PLUGIN. GO HUNT.

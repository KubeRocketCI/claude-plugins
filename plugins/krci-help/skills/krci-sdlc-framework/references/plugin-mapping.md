# KRCI Plugin Inventory — Agents, Commands, Skills

Complete map of the KubeRocketCI Claude Code marketplace. Use this to give the user the exact handle to invoke. Counts and contents reflect the marketplace at the time of writing; if a plugin has changed, prefer what is actually installed.

> **Maintenance:** this inventory is hardcoded. When a plugin is added, removed, or its agents/commands/skills change, update the **three** hand-maintained surfaces together: this file, the `/krci-help:help` command (`commands/help.md`), and the marketplace manifest (`.claude-plugin/marketplace.json`).

Legend: **DEV** = writes/reviews code or config (assumes a codebase). **AGNOSTIC** = planning/analysis/testing/writing artifacts (any project). **META** = describes the ecosystem.

---

## DEV plugins

### krci-godev — DEV

Go and Kubernetes operator development.

- **Agent** `go-dev`: implements Go, Kubernetes operators, CRDs, controller reconciliation loops; reviews Go.
- **Command** `/krci-godev:review-code`: structured Go/operator review (Effective Go + Google style + operator patterns).
- **Skills**: `run-golangci-lint` (`golangci-lint` / `make lint` / `lint-fix`).
- **Use when**: writing Go, building an operator/CRD, fixing lint.

### krci-fullstack — DEV

Portal (React/TypeScript) development.

- **Agent** `fullstack-dev`: React, TypeScript, Radix UI, Tailwind, tRPC; components, forms, tables, routing, permissions, Kubernetes resource UIs.
- **Commands**: `/krci-fullstack:implement-feature`, `/krci-fullstack:fix-issue`.
- **Skills**: `component-development`, `form-patterns`, `table-patterns`, `filter-patterns`, `routing-permissions`, `k8s-resources`, `api-integration`, `testing-standards`, `tour-patterns`, `portal-tech-stack`.
- **Use when**: building or fixing a portal screen, form, table, route, or Kubernetes resource UI.

### krci-devops — DEV

CI/CD pipeline and component development.

- **Agent** `devops`: Tekton pipeline/task onboarding, trigger configuration, GitLab CI components (EDP-Tekton repo).
- **Commands**: `/krci-devops:add-pipeline`, `add-task`, `add-trigger`, `add-gitlab-component`.
- **Skills**: `edp-tekton-standards`, `edp-tekton-triggers`, `gitlab-ci-component-standards`.
- **Use when**: onboarding a Tekton pipeline/task, wiring a VCS webhook trigger, building a GitLab CI component.

### krci-architect — DEV

Cross-repo architecture and planning.

- **Agent** `architect`: plans features/epics, makes architectural decisions, coordinates across repos (portal, operators, tekton) by delegating to specialized agents.
- **Commands**: `/krci-architect:plan-feature`, `technical-review`.
- **Skills**: `krci-architecture` (reference architecture, DevSecOps, deployment patterns), `agent-delegation` (multi-repo coordination via the Task tool).
- **Use when**: a feature spans multiple repos, or you need a design before coding.

### krci-general — DEV (utility, cross-cutting)

General code utilities, any language, any stage.

- **Agent** `code-reviewer`: finds bugs, security risks, and convention violations with confidence-based filtering (reports only confidence ≥ 80).
- **Commands**: `/krci-general:commit` (conventional commit from staged changes), `/krci-general:review` (3 parallel review agents: simplicity, bugs, conventions).
- **Use when**: writing a commit message or reviewing code at any point in the pipeline.

### krci-triage — DEV (Jira-driven bug fixing on a testbed)

Set up the prerequisites and fix a Jira-tracked issue end to end on a real cluster.

- **Commands**: `/krci-triage:setup-testbed` (clone/stand up a `try-kuberocketci` kind cluster), `/krci-triage:bootstrap-workspace` (clone the multi-repo KRCI source workspace via `KubeRocketCI/krci-workspace`), `/krci-triage:krci-fix-the-issue` (Jira key → root cause across the workspace → reproduce on the testbed → fix at the right layer → verify on the cluster → optional QA comment back to Jira).
- **Skills**: `krci-testbed` (discovering a testbed's specifics; operator rebuild loop build→`kind load`→roll out; reproducing via the Kubernetes API; headless Portal verification with Playwright, not the MCP; posting to Jira without mangling code).
- **Use when**: you have a Jira bug to reproduce/fix on a real cluster, or you need to provision the source workspace or a local testbed.

---

## AGNOSTIC plugins

### krci-product — AGNOSTIC (4 agents)

The product/project lifecycle. Owns most of the early pipeline plus go-to-market.

- **Agent** `product-manager`: project brief, PRD, requirement validation (Lean Startup, JTBD, OKR).
- **Agent** `product-owner`: Epics and Stories.
- **Agent** `project-manager`: Project Charter, SOW, Project Plan, Risk Register, Status Report (PMBoK 7th ed.).
- **Agent** `product-marketing-manager`: marketing brief, pitch deck, launch materials, sales enablement, visual identity, demo script.
- **Skills**: `create-prd`, `project-brief`, `validate-product-requirements`, `product-frameworks`, `manage-epic`, `manage-story`, `project-charter`, `scope-of-work`, `project-plan`, `risk-register`, `status-report`, `project-management-methodology`, `create-marketing-brief`, `create-pitch-deck`, `create-launch-materials`, `create-sales-enablement`, `create-visual-identity`, `create-demo-script`.
- **Use when**: starting a product, writing/validating requirements, managing the backlog (epics/stories), planning/governing the project, or going to market.

### krci-ba — AGNOSTIC

Business analysis between PRD and backlog.

- **Agent** `business-analyst`: gathers/documents requirements, analyzes processes, maps user journeys, documents business rules in BR/NFR with traceability.
- **Skills**: `gather-requirements`, `analyze-processes`, `document-business-rules`, `map-user-journeys`, `business-analysis-methodologies`.
- **Use when**: requirements are fuzzy, a process needs analysis, or you need BR/NFR with acceptance criteria before Epics/Stories.

### krci-qa — AGNOSTIC (2 agents)

Quality assurance, manual and automated.

- **Agent** `qa-engineer`: test plans, manual Markdown test cases, test execution reports, defect reports against Story acceptance criteria.
- **Agent** `automation-qa-engineer`: executable Gherkin `.feature` BDD scenarios from acceptance criteria; manages the automation workspace/README.
- **Skills**: `create-test-plan`, `generate-test-cases`, `generate-auto-test-cases`, `execute-testing`, `report-defects`, `setup-testing`, `onboard-testing`, `edit-testing-settings`, `testing-methodologies`.
- **Use when**: planning tests, writing manual or automated test cases, running tests, or reporting defects.

### krci-docs — AGNOSTIC

Documentation and presentations.

- **Agent** `technical-writer`: reviews/improves Markdown docs and PowerPoint presentations using the Microsoft Writing Style Guide and KRCI documentation standards.
- **Skills**: `doc-review`, `ppt-review`.
- **Use when**: a document or slide deck needs review/cleanup.

---

## META plugin

### krci-help — META (this plugin)

Describes the ecosystem and the SDLC framework.

- **Command** `/krci-help:help`: dry, caveman-style map of all plugins, agents, skills, and the SDLC pipeline.
- **Agent** `advisor`: routes the user to the right plugin/agent/skill and sequences end-to-end pipelines; consumes the `krci-sdlc-framework` skill (this one).
- **Use when**: the user is unsure which plugin fits, wants the big-picture workflow, or wants a runnable end-to-end pipeline.

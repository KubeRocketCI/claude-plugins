# KRCI Runnable Pipelines & Use-Cases

Each use-case is an ordered chain of plugins/agents to invoke for a common end-to-end goal. Give the user the chain, note the handoffs, and remind them of upstream dependencies (see `pipeline.md`). They do not have to run every step — point them to the stage that matches where they actually are.

---

## 1. Idea → shipped feature (full SDLC)

The canonical end-to-end pipeline.

1. **krci-product / product-manager** — write the Project Brief, then the PRD (`create-prd`, `project-brief`). Gate: brief approved before PRD; PRD approved before epics.
2. **krci-ba / business-analyst** — refine requirements into BR/NFR, map journeys, document business rules (`gather-requirements`, `map-user-journeys`).
3. **krci-product / product-owner** — break the PRD into Epics, then Stories (`manage-epic`, `manage-story`).
4. **krci-architect / architect** — design the solution and validate it (`/krci-architect:plan-feature`, `technical-review`). Gate: architecture reviewed before code.
5. **Implement** — choose by surface:
   - Go / operator / CRD → **krci-godev / go-dev**
   - Portal UI → **krci-fullstack / fullstack-dev** (`/krci-fullstack:implement-feature`)
   - CI/CD → **krci-devops / devops**
6. **krci-general** — review and commit along the way (`/krci-general:review`, `/krci-general:commit`).
7. **krci-qa** — test plan + cases + execution + defects (`create-test-plan`, `generate-test-cases`, `execute-testing`, `report-defects`); BDD automation via `automation-qa-engineer`.
8. **krci-docs / technical-writer** — document the feature (`doc-review`).
9. **krci-product / product-marketing-manager** — go-to-market once there is an MVP (`create-pitch-deck`, `create-launch-materials`).

Running in parallel: **krci-product / project-manager** maintains charter, plan, risk, and status from step 1 onward.

---

## 2. Onboard a Tekton pipeline (CI/CD)

Implementation-only; assumes the EDP-Tekton repo.

1. **krci-devops / devops** — `/krci-devops:add-task` for new Tekton tasks.
2. **krci-devops / devops** — `/krci-devops:add-pipeline` to assemble Build and Review pipelines.
3. **krci-devops / devops** — `/krci-devops:add-trigger` to wire VCS webhooks (GitHub/GitLab/Gerrit/BitBucket).
4. **krci-general** — `/krci-general:review` then `/krci-general:commit`.

Reference skills: `edp-tekton-standards`, `edp-tekton-triggers`.

---

## 3. Ship a Go operator / CRD

1. **krci-architect / architect** — design the operator and reconciliation model if it is non-trivial or cross-repo.
2. **krci-godev / go-dev** — implement the operator, CRDs, and controller loop.
3. **krci-godev** — `run-golangci-lint` to clean up, `/krci-godev:review-code` for operator-pattern review.
4. **krci-general** — `/krci-general:review` and `/krci-general:commit`.
5. **krci-qa** — validate behavior; **krci-docs** — document the API/CRD.

---

## 4. Build a portal feature

1. **krci-architect / architect** — `/krci-architect:plan-feature` if the feature crosses repos or needs design.
2. **krci-fullstack / fullstack-dev** — `/krci-fullstack:implement-feature` (components, forms, tables, routes, permissions, API).
3. For bugs instead of features: `/krci-fullstack:fix-issue`.
4. **krci-fullstack** — apply `testing-standards` (Vitest + Storybook).
5. **krci-general** — `/krci-general:review` and `/krci-general:commit`.

---

## 5. Plan a project (governance)

Agnostic; no code involved.

1. **krci-product / product-manager** — Project Brief and PRD as the basis.
2. **krci-product / project-manager** — Project Charter (`project-charter`), Scope of Work (`scope-of-work`), Project Plan (`project-plan`), Risk Register (`risk-register`).
3. Ongoing — Status Reports (`status-report`).

---

## 6. Go-to-market

Requires an approved PRD and an MVP.

1. **krci-product / product-marketing-manager** — marketing brief / GTM strategy (`create-marketing-brief`).
2. Assets — `create-pitch-deck`, `create-launch-materials`, `create-sales-enablement`, `create-visual-identity`, `create-demo-script`.
3. **krci-docs / technical-writer** — review the slides (`ppt-review`) and copy (`doc-review`).

---

## 7. Requirements clean-up (mid-pipeline)

When the PRD exists but requirements are weak or the backlog is unclear.

1. **krci-ba / business-analyst** — `gather-requirements` (BR/NFR with acceptance criteria), `analyze-processes`, `document-business-rules`, `map-user-journeys`.
2. **krci-product / product-manager** — `validate-product-requirements` to pressure-test problem statements and metrics.
3. **krci-product / product-owner** — re-cut Epics/Stories from the refined requirements.

---

## Picking the entry point

Most users join mid-pipeline. Match their words to a stage:

- "idea", "should we build" → product-manager (brief)
- "requirements", "what exactly" → business-analyst, then PRD
- "backlog", "epic", "story" → product-owner
- "design", "architecture", "which repos" → architect
- "implement", "code it" → go-dev / fullstack-dev / devops by surface
- "test", "QA", "defects" → krci-qa
- "docs", "slides" → technical-writer
- "launch", "pitch", "sales" → product-marketing-manager
- "review my code", "commit" → krci-general
- "which plugin?", "how does this all fit" → advisor (you)

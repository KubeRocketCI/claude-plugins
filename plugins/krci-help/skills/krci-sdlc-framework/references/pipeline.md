# KRCI SDLC Pipeline — Artifacts, Dependencies, Gates

The KRCI SDLC framework is a filesystem-first chain of artifacts. Each artifact is a Markdown file under `/docs/`, and each builds on the artifacts before it. Agents discover prior work by reading these files, so the directory layout and the dependency order are part of the framework, not incidental.

## Artifact flow

```text
Project Brief → PRD → Epics → Stories → Code → Tests → MVP → Marketing
                  ↓             ↓
              Architecture ← → Code
```

Flow in words: **PM** (Brief + PRD) → **BA** (refine requirements) → **PO** (Epics + Stories) → **Architect** (design) → **Dev** (code) → **QA** (test) → **PMM** (marketing). Project Manager runs alongside from the brief/PRD onward (charter, plan, risk). Technical Writer is cross-cutting (documents any artifact). DevOps is cross-cutting on the implementation side (CI/CD for the code).

## Dependencies (hard)

- **Project Brief**: no dependencies — the root artifact.
- **PRD**: requires the Project Brief.
- **Epic**: requires the PRD (approved).
- **Story**: requires its Epic **and** the relevant Architecture.
- **Code**: requires Stories and Architecture.
- **Tests**: requires Stories and Code.
- **Marketing**: requires the PRD and an MVP.

## Artifact definitions

| Artifact | Owner role | Purpose | Contains | Conventional location |
|----------|-----------|---------|----------|-----------------------|
| Project Brief | Product Manager | Vision & strategy | Problem statement, target users, success metrics, constraints, risks | `/docs/prd/project-brief.md` |
| PRD | Product Manager | Product requirements | Numbered business requirements (BR1, BR2…) and system/non-functional requirements (NFR1…), priorities, epic-level features, success metrics | `/docs/prd/prd.md` |
| Project Charter | Project Manager | Scope & authorization | Objectives, scope, stakeholders, success criteria | `/docs/prd/project-charter.md` |
| Epic | Product Owner | High-level feature | Feature description, acceptance criteria, story breakdown | `/docs/epics/epic-{number}-{slug}.md` |
| Story | Product Owner | User requirement + implementation detail | User story, acceptance criteria, tasks, deployment info | `/docs/stories/{epic}.{story}.story.md` |
| Architecture | Architect | System design | Technical specs, patterns, decisions (ADRs) | `/docs/architecture/*.md` |
| Code | Developer / Go Developer | Implementation | Source, configs, deployment manifests | repository root & subdirs |
| Test Results | QA | Quality validation | Execution results, defect reports, metrics | `/docs/tests/test-results-*.md` |
| Marketing Materials | Product Marketing Manager | Go-to-market | Pitch decks, sales enablement, campaigns | `/docs/marketing/*.md` |

## Quality gates

1. **Project Brief approved** → enables PRD creation.
2. **PRD approved** → enables Epic and Architecture creation.
3. **Architecture reviewed** → enables implementation.
4. **Code reviewed** → enables testing.
5. **Tests validated** → enables MVP delivery.

A gate is passed when the upstream artifact is complete (all required sections filled, dependencies referenced) and approved.

## Handoff points

1. Idea → PM (market research, brief)
2. PM → BA (PRD refinement, BR/NFR elicitation)
3. BA → PO (requirements to backlog)
4. PO → Architect (technical feasibility)
5. Architect → Dev (implementation guidance)
6. Dev → QA (quality validation)
7. QA → MVP (deployment readiness)
8. PM → PMM (go-to-market strategy)
9. MVP → PMM (marketing materials)

## Common blockers and resolutions

| Symptom | Root cause | Action |
|---------|-----------|--------|
| Epic creation blocked | PRD incomplete | Return to Product Manager to complete the PRD |
| Story blocked | Architecture not defined | Complete the Architecture document first |
| Implementation blocked | Story acceptance criteria unclear | Return to Product Owner to refine the Story |
| Testing blocked | Code incomplete | Ensure the Developer finished all Story requirements |
| Marketing blocked | No MVP / PRD | Deliver MVP and confirm PRD before GTM work |

## Directory structure

```text
{project_root}/
├── docs/
│   ├── prd/              # project-brief.md, prd.md, project-charter.md
│   ├── epics/            # epic-{number}-{slug}.md
│   ├── stories/          # {epic}.{story}.story.md
│   ├── architecture/     # adr/, numbered design sections
│   ├── tests/            # test-results-*.md
│   └── marketing/        # {campaign}-{type}.md
```

Agents, their procedural knowledge, and their output templates live inside the Claude Code plugins themselves — as `agents/`, `skills/`, and `commands/`. The `/docs/` tree above holds only the SDLC artifacts the agents produce.

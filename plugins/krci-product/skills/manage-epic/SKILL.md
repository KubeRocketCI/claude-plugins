---
name: Manage Epic
description: This skill should be used when the user asks to "create an epic", "write an epic", "update an epic", "refine an epic", "add a story to an epic", "expand epic scope", or "review epic for story readiness". Creates new epics from PRD requirements and updates existing epics with new requirements or scope refinements while preserving story traceability.
argument-hint: <epic-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Manage Epic

Create new epics that break PRD requirements into high-level feature groups, or update existing epics with scope additions, clarifications, and dependency changes — all while maintaining story traceability and PRD alignment.

## Workflow

1. **Confirm target and inputs.** Determine from `$ARGUMENTS` whether this is a create or update operation. For create: confirm the PRD exists (conventionally `/docs/prd/prd.md`) and identify the next sequential epic number by scanning `/docs/epics/`. For update: confirm the target epic file exists at `/docs/epics/{epic_number}-epic-{slug}.md`. If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.

2. **For update operations — consult the user first.** Before touching any content, use AskUserQuestion to ask what specific changes are needed, understand the trigger (new PRD requirements, scope clarification, story feedback), clarify which sections to update and why, explain the potential impact on existing stories, and obtain explicit approval. Do not proceed until the user confirms.

3. **Analyze PRD requirements.** Review the PRD's BR/NFR requirements to identify the problem this epic addresses. Extract target users, quantifiable impact, scope boundaries, and relevant system dependencies. For updates, review the current epic status and all dependent stories before proposing changes.

4. **Classify update changes (update mode only).** Categorize every proposed change:
   - **Allowed**: adding new stories, expanding acceptance criteria, adding non-conflicting dependencies, clarifying the problem statement, extending timeline with approval, adding target users
   - **Restricted** (requires validation): modifying goal metrics, changing scope boundaries, updating dependencies, altering timeline, modifying acceptance criteria
   - **Forbidden**: removing completed scope, deleting stories, changing the epic number, reducing problem scope, removing target users

5. **Author or update the epic.** Use `references/epic-template.md` as the structure. Populate all template variables. Strip all `<instructions>` and other XML-style tags from the final output — they must never appear in the saved file.

6. **Validate template compliance.** Confirm the epic contains all sections in order: Status, Overview (Problem Statement, Goal, Target Users), Scope (Included, Not Included, Dependencies), Solution Approach, Risks & Assumptions, Acceptance Criteria, User Stories. For updates, add a version timestamp and document the change rationale.

7. **Save.** Write the file to `/docs/epics/{epic_number}-epic-{slug}.md` (create) or update in place (update). Report the saved path and summarize story impact.

## Epic Naming Convention

```text
Create: /docs/epics/{epic_number}-epic-{slug}.md
  epic_number: next sequential integer (e.g., 03)
  slug: lowercase hyphenated description (e.g., ide-integration)

Update: update existing file in place; never change the epic number
```

## Quality Standards

Each epic must be PRD-traceable, user-centric, measurable, story-enabling, and change-controlled. Avoid these pitfalls:

- Writing solution-prescriptive problem statements instead of user pain points
- Setting vague or unmeasurable goals that cannot be verified post-implementation
- Omitting scope boundaries, or not deferring cross-cutting concerns (audit, observability, security hardening) to their own stories under "Not Included" — both cause story scope creep
- Skipping dependency categorization (epic vs. system vs. external)
- Including command-level verification in acceptance criteria (save those for stories)
- For updates: making changes without user consultation and explicit approval
- For updates: removing completed scope or modifying the epic number
- Leaving `<instructions>` tags in the saved output file

## Success Criteria

- File saved at the correct path with the correct naming convention
- PRD traceability: clear connection to specific BR/NFR requirements
- Problem clarity: epic solves a specific user problem with defined scope
- Goal measurability: epic completion criteria are specific and testable
- Story readiness: epic provides sufficient context for immediate story breakdown
- Template compliance: all template variables populated; no `<instructions>` tags in output
- Dependencies structured: epic, system, and external dependencies clearly separated
- Acceptance criteria complete: each criterion includes scenario, expected behavior, measurement method, preconditions, and guardrails
- For updates: story compatibility preserved; change rationale documented; version timestamp added
- For updates: all changes classified as allowed, restricted, or forbidden before application

## Reference Files

- **`references/epic-template.md`** — Full epic structure with all sections and placeholder variables. Use it as the output skeleton; populate every section and strip all XML-style guidance tags from the final saved file.

---
name: Manage Story
description: This skill should be used when the user asks to "create a story", "write a user story", "update a story", "refine a story", "review a story", "review story for business value", "validate story acceptance criteria", or "check story epic alignment". Creates new stories from epic scope, updates existing stories with requirement changes, and reviews stories from a Product Owner perspective.
argument-hint: <story-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Manage Story

Create comprehensive user stories from epic scope, update existing stories with new requirements or scope refinements, or review stories for business value and epic alignment — all while preserving task traceability and epic goals.

## Workflow

1. **Confirm target, mode, and inputs.** Determine from `$ARGUMENTS` whether this is a create, update, or review operation. For create: confirm the parent epic exists at `/docs/epics/{epic_number}-epic-{slug}.md` and identify the next sequential story number within the epic by scanning `/docs/stories/`. For update or review: confirm the target story file exists at `/docs/stories/{epic_number}.{story_number}.story.md`. If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.

2. **For update operations — consult the user first.** Before modifying any content, use AskUserQuestion to ask what specific changes are needed, understand the trigger (new requirements, scope clarification, task feedback), clarify which sections to update and why, explain the potential impact on existing tasks/subtasks, and obtain explicit approval. Do not proceed until the user confirms.

3. **For create — analyze the epic.** Read the parent epic to extract the problem statement, goal, target users, scope boundaries, and acceptance criteria. Identify the specific epic deliverable this story addresses. Extract the user persona and define the focused user value this story provides.

4. **For update — classify changes (update mode only).** Categorize every proposed change:
   - **Allowed**: adding tasks/subtasks, expanding acceptance criteria, adding non-conflicting dependencies, clarifying story description, extending story points with team validation, enhancing QA checklist
   - **Restricted** (requires validation): modifying the story goal, changing acceptance criteria, updating dependencies, altering story points, modifying task structure
   - **Forbidden**: removing completed tasks/subtasks, deleting completed acceptance criteria, changing the story number, reducing story scope, removing the epic reference

5. **Author, update, or review the story.** Use `references/story-template.md` as the structure. Follow the exact section order: Status → Dependencies → Story → Acceptance Criteria → Description → Technical Context → Tasks/Subtasks → Implementation Results → QA Checklist. Strip all `<instructions>` and other XML-style tags from the final output — they must never appear in the saved file.

6. **For create — write comprehensive content.** Stories must be self-contained and enable autonomous implementation without external research. Include:
   - "As a [persona], I want [goal], so that [value]" aligned with epic personas
   - Specific, testable acceptance criteria with verification commands and expected outputs. Scope each criterion to THIS story's own capability; cross-cutting concerns (audit/logging, observability, security hardening, the broader approval or lifecycle workflow) belong to their own stories or are platform NFRs — note them under Out of Scope or Dependencies rather than asserting them as ACs, so the story stays independently deliverable
   - Detailed description with strategic purpose, technical background, and architectural alignment
   - Rich technical context covering integration points, design patterns, constraints
   - Actionable tasks/subtasks with clear deliverables and AC mappings
   - QA checklist grouped by category (functional, integration, security, accessibility)

7. **For review — validate from a business perspective.**
   - **Story format**: verify "As a [user], I want [goal], so that [value]" with specific persona and tangible business benefit
   - **Business value**: confirm the "so that" clause is explicit, measurable, and user-centered
   - **Acceptance criteria**: validate each criterion is testable by business stakeholders and measures actual user value delivery
   - **Epic alignment**: confirm story goal supports parent epic objectives, user matches epic personas, and scope fits within epic boundaries
   - **Implementation readiness**: verify requirements are complete and the story is ready for development

8. **Save or report.** For create/update: write to `/docs/stories/{epic_number}.{story_number}.story.md`; for updates, add version timestamp and change rationale. For review: document validation findings in the story's Implementation Results section with business approval noted. Report the saved path and any downstream impacts.

## Story Naming Convention

```text
Create: /docs/stories/{epic_number}.{story_number}.story.md
  epic_number: matches parent epic number (e.g., 03)
  story_number: zero-padded sequential within epic (e.g., 01, 02)
  Full example: /docs/stories/03.02.story.md

Update/Review: update existing file in place; never change the story number
```

## Quality Standards

Each story must be user-centered, epic-aligned, implementation-ready, change-controlled, and business-validated. Avoid these pitfalls:

- Using generic personas ("user", "developer") instead of PRD/epic-defined roles
- Writing vague "so that" clauses without measurable user benefit
- Creating acceptance criteria that require technical expertise to validate rather than business stakeholders
- Pulling cross-cutting concerns (audit/logging, observability, the approval workflow, downstream lifecycle steps) into this story's acceptance criteria instead of scoping each AC to the story's own capability
- Omitting technical context, leaving dev agents to research architecture externally
- Writing tasks that lack specific deliverables or AC mappings
- For updates: making changes without user consultation and explicit approval
- For updates: removing completed tasks/subtasks or changing the story number
- For review: accepting vague business value statements without specific user benefit
- Leaving `<instructions>` tags in the saved output file

## Success Criteria

- File saved at the correct path with the correct naming convention (create/update)
- Epic traceability: clear reference to parent epic and its goals
- Story format correct: "As a [user], I want [goal], so that [value]" properly structured with specific persona
- Business value clear: user benefit and business rationale are explicit and measurable
- Acceptance criteria: specific, testable conditions covering all business validation requirements
- Technical depth: description and technical context provide sufficient detail for autonomous implementation
- Tasks/subtasks: actionable, checkbox-formatted implementation plan mapped to acceptance criteria
- QA checklist: grouped verification steps with expected outputs and non-interactive commands where possible
- Template compliance: all template variables populated; no `<instructions>` tags in output; section order preserved
- For updates: task compatibility preserved; change rationale documented; version timestamp added
- For updates: all changes classified as allowed, restricted, or forbidden before application
- For review: business value confirmed; epic alignment verified; PO approval documented

## Reference Files

- **`references/story-template.md`** — Full story structure with all nine sections and placeholder variables. Use it as the output skeleton; follow the exact section order, populate every section, and strip all XML-style guidance tags from the final saved file.

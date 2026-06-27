---
name: Create PRD
description: This skill should be used when the user asks to "create a PRD", "write a product requirements document", "create product requirements", "update the PRD", "add requirements to the PRD", "revise the PRD", or "update product requirements". Creates and updates Product Requirements Documents with BR/NFR requirements, priority indicators, epic-level feature definitions, and measurable success metrics traceable to the project brief.
argument-hint: <product-or-feature>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create PRD

Create or update a Product Requirements Document that aligns the team on what to build and why. The PRD is a 6-8 page artifact structured with numbered BR/NFR requirements, P0/P1/P2 priorities, epic-level feature groupings, and success metrics traceable to the project brief.

## Workflow

1. **Confirm scope and references.** Identify the product or feature from `$ARGUMENTS`. For new PRDs, verify the project brief exists at `/docs/prd/project-brief.md` (or use AskUserQuestion to confirm an alternate path). For updates, verify `/docs/prd/prd.md` exists and use AskUserQuestion to confirm what specific changes are needed and why — get explicit approval before making any edits. If any required input file is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Consult the template.** Open `references/prd-template.md` and use it as the output skeleton. Apply the `product-frameworks` skill for methodology guidance (business and prioritization frameworks).
3. **Discovery and requirements phase.** Extract the core problem and opportunity from the project brief. Conduct or synthesize user research, competitive analysis, and stakeholder requirements. Define Business Requirements (BR1, BR2…) and Non-Functional Requirements (NFR1, NFR2…), each with a P0/P1/P2 priority indicator.
4. **Design and scope phase.** Define the solution direction (no implementation details), MVP scope, out-of-scope items, and external dependencies or constraints.
5. **Epic groupings.** Organize requirements into logical epic-level feature themes within the PRD. Each grouping maps to a future Epic following the naming convention `{epic_number}-epic-{slug}.md`.
6. **Write and validate.** Populate all template sections, verify the document is 6-8 pages maximum and user-centered, and confirm every success metric is specific, testable, and time-bound.
7. **Save.** Write the final document to `/docs/prd/prd.md` (exact path and filename). Strip all `<instructions>` tags from the output — produce clean Markdown only.

## BR/NFR Format

```text
Business Requirements (BR):
- BR-001 [P0]: [Primary capability — what users must be able to do]
- BR-002 [P1]: [Secondary capability with priority indicator]

Non-Functional Requirements (NFR):
- NFR-001 [P0]: [Performance/scalability requirement]
- NFR-002 [P1]: [Security/compliance requirement]
- NFR-003 [P2]: [Usability/reliability requirement]
```

## Update-Specific Rules

When updating an existing PRD:

- Never start editing before explicit user consultation and approval
- Identify which BR/NFR numbers and epic groupings are affected before any changes
- Maintain existing BR/NFR numbering; add new entries sequentially
- Document what changed and why in a brief change note within the PRD
- Assess downstream feature impact and note which epic areas require updates
- Keep the document within the 6-8 page limit after updates

## Quality Standards

Each PRD must be user-centered, evidence-based, and traceable from the project brief. Avoid these pitfalls:

- Writing solution-oriented problem statements (describe user pain, not missing features)
- Including technical implementation details (save those for architecture documents)
- Writing vague requirements that cannot be grouped into epic-level features
- Skipping stakeholder consultation before implementing PRD changes
- Exceeding the 6-8 page limit by including exhaustive feature lists rather than MVP scope
- Breaking existing BR/NFR numbering when updating

## Success Criteria

- File saved to `/docs/prd/prd.md` (exact path)
- Document length is 6-8 pages maximum
- Requirements numbered BR/NFR with P0/P1/P2 indicators and epic-level feature groupings
- Problem/opportunity clearly traceable to project brief
- All success metrics are specific, measurable, and time-bound
- User needs prioritized over technical implementation details
- Stakeholder requirements captured and validated
- For updates: change rationale documented and downstream feature impact identified

## Reference Files

- **`references/prd-template.md`** — Full PRD structure with all required sections, `{{variables}}`, and `<instructions>` guidance. Use it as the output skeleton; omit all internal guidance tags from the final document.

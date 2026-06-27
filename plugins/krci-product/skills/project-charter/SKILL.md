---
name: Project Charter
description: This skill should be used when the user asks to "create a project charter", "write a charter", "authorize a project", "update the project charter", "revise the charter", or "document project authority". Produces or updates the formal document that authorizes a project and grants the Project Manager authority to apply organizational resources.
argument-hint: <project-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Project Charter

Create or update a project charter that formally authorizes the project and establishes the Project Manager's authority to apply organizational resources. As defined in PMBoK, the charter is the document that formally brings a project into existence.

## Workflow

1. **Confirm scope and target.** Identify the project from `$ARGUMENTS`. For a new charter, confirm that initiating inputs (business case, stakeholder data, budget/timeline context) are available or explicitly provided; use AskUserQuestion if inputs are missing or ambiguous. For an update, confirm the existing charter path and the approved change request or update rationale. If any required input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Apply methodology.** Reference the `project-management-methodology` skill for PMBoK standards and charter best practices throughout development.
3. **Gather and analyze inputs.** Review business case, stakeholder information, strategic alignment, preliminary scope, high-level risks, and project sponsor commitment. For updates, assess change impact on scope, timeline, budget, resources, stakeholder roles, and success criteria.
4. **Structure with the template.** Use `references/project-charter-template.md` for consistent formatting. For updates, apply tracked changes to affected sections and maintain version history.
5. **Populate all sections.** Complete the executive summary, project overview and business justification, scope boundaries with inclusions and exclusions, measurable success criteria and KPIs, stakeholder matrix with roles and responsibilities, resource and budget parameters, PM authority framework, high-level risk assessment with assumptions and constraints, and approval sign-off block.
6. **Validate and finalize.** Review with the project sponsor and key stakeholders, confirm resource commitments, and obtain formal approval signatures before distributing.

## Content Requirements

- Executive summary (1–2 paragraphs, executive-level clarity)
- Comprehensive business justification linked to strategic objectives
- Clearly defined scope with explicit inclusions and exclusions
- Measurable, time-bound success criteria and KPIs
- Stakeholder matrix covering interest level and influence
- Resource requirements and PM decision-making authority
- Initial risk assessment with mitigation strategies
- Assumptions and constraints documentation
- Version control, revision history, and approval signatures

## Quality Standards

Use clear, unambiguous language appropriate for an executive audience. Base all content on verified information and stakeholder input. Avoid these pitfalls:

- Vague or unmeasurable success criteria
- Incomplete scope boundaries that leave room for scope creep
- Missing PM authority section, which undermines governance
- Skipping stakeholder analysis, which causes downstream conflicts
- Updating the charter without following integrated change control
- Distributing without formal sponsor approval

## Success Criteria

**Charter Completeness:**

- All template sections completed with appropriate detail
- Business justification clearly articulated and compelling
- Scope boundaries defined with measurable deliverables
- Success criteria are specific, measurable, and time-bound
- Stakeholder roles and responsibilities clearly documented
- Resource requirements and PM authority defined
- Key risks, assumptions, and constraints identified

**Stakeholder Acceptance:**

- Charter reviewed and approved by the project sponsor
- PM authority acknowledged by the organization
- Team members understand their roles and expectations
- Charter serves as the unambiguous project authorization document

**Process Compliance (updates):**

- Change control procedures followed appropriately
- Version control and change tracking maintained
- Authorization signatures and dates documented
- Updated charter distributed to all relevant stakeholders

## Reference Files

- **`references/project-charter-template.md`** — Full charter structure covering all PMBoK-required sections. Use it as the output skeleton; populate the sections relevant to scope and omit internal guidance tags from the final output.

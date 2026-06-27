---
name: Scope of Work
description: This skill should be used when the user asks to "create a scope of work", "write a SOW", "define project deliverables", "create a work breakdown structure", "update the SOW", or "revise the scope of work". Produces or updates the SOW that defines deliverables, acceptance criteria, timeline, and governance for a project.
argument-hint: <project-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Scope of Work

Create or update a Scope of Work (SOW) that clearly defines project deliverables, activities, timelines, and acceptance criteria. The SOW serves as the definitive scope baseline — a detailed agreement between project stakeholders regarding what will be delivered, how it will be delivered, and the criteria for acceptance.

## Workflow

1. **Confirm scope and target.** Identify the project from `$ARGUMENTS`. For a new SOW, confirm access to the project charter and any requirements documentation; use AskUserQuestion if inputs are missing or stakeholder expectations are unclear. For an update, confirm the existing SOW path plus the approved change request or scope modification. If any required input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Apply methodology.** Reference the `project-management-methodology` skill for PMBoK scope management best practices throughout development.
3. **Analyze inputs.** Review the project charter, stakeholder expectations, and requirements documentation. For updates, conduct a comprehensive change impact assessment covering deliverables, timeline, resources, WBS, and task dependencies.
4. **Structure with the template.** Use `references/sow-template.md` for consistent formatting. For updates, apply tracked changes and update the revision history.
5. **Populate all sections.** Complete the executive summary, scope definition with a detailed work breakdown structure, deliverable table with format and acceptance criteria for each item, timeline and milestone plan, roles and responsibilities matrix, resource requirements, change management procedures, and assumptions/constraints/exclusions.
6. **Validate and finalize.** Review with all stakeholders, confirm resource commitments, obtain formal sign-off, and establish the document as the project scope baseline.

## Content Requirements

- Executive summary and project overview
- Detailed scope definition with explicit exclusions
- Deliverable table: description, format, acceptance criteria, due date
- Work breakdown structure decomposed to manageable work packages
- Timeline with critical path activities and milestone schedule
- Roles and responsibilities matrix with decision authority
- Resource requirements (human, technical, facilities)
- Acceptance criteria that are specific and measurable
- Change management and version control procedures

## Quality Standards

Define deliverables and criteria with precise detail. Ensure all acceptance criteria are quantifiable and achievable. Avoid these pitfalls:

- Defining deliverables without acceptance criteria — leads to disputes at sign-off
- Omitting scope exclusions — leaves room for scope creep assumptions
- Unrealistic timelines that ignore task dependencies and constraints
- Updating the SOW without formal change control authorization
- Missing the change management section — results in uncontrolled scope expansion
- Distributing without stakeholder sign-off, leaving the baseline unapproved

## Success Criteria

**SOW Completeness:**

- All deliverables clearly defined with measurable acceptance criteria
- Comprehensive work breakdown structure completed
- Realistic timeline with appropriate milestones established
- Clear roles, responsibilities, and governance documented
- Quality standards and testing procedures defined
- Assumptions, constraints, and exclusions explicitly stated

**Stakeholder Alignment:**

- All stakeholders understand and agree to the scope baseline
- Acceptance criteria are clear and verifiable by all parties
- Resource commitments confirmed and documented
- Change management procedures established and accepted

**Process Compliance (updates):**

- Change control procedures followed appropriately
- All approved changes accurately reflected in the SOW
- SOW maintains internal consistency and updated baseline
- Revised timeline and resources validated as realistic
- Updated SOW distributed to all relevant stakeholders

## Reference Files

- **`references/sow-template.md`** — Full SOW structure covering scope definition, WBS, milestones, roles, and sign-off. Use it as the output skeleton; populate the sections relevant to scope and omit internal guidance tags from the final output.

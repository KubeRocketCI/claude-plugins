---
name: Gather Requirements
description: This skill should be used when the user asks to "gather requirements", "elicit requirements", "document business requirements", "capture requirements", "write a BRD", "define BR/NFR", or "requirements gathering". Systematically elicits and documents business and non-functional requirements with testable acceptance criteria and traceability that enable Epic and Story creation.
argument-hint: <feature-or-prd-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Gather Requirements

Systematically gather and analyze business requirements from stakeholders, documenting them as structured BR/NFR requirements with acceptance criteria and traceability. The output enhances the PRD and enables Epic/Story breakdown.

## Workflow

1. **Confirm scope and target.** Identify the capability from `$ARGUMENTS` and confirm the PRD location (conventionally `/docs/prd/prd.md`). Confirm the supporting outputs to create or update. If a referenced input is missing, report the exact path and HALT. Use TodoWrite to track the 6 workflow steps. Use AskUserQuestion if the capability scope or stakeholder list is unclear.
2. **Apply methodologies.** Use elicitation techniques from the `business-analysis-methodologies` skill appropriate to the scope (interviews, workshops, process observation, documentation review).
3. **Structure with the template.** Use `references/requirements-doc-template.md` for the document structure; populate all sections relevant to the scope.
4. **Document BR/NFR.** Categorize requirements as Business Requirements (BR-001, BR-002…) and Non-Functional Requirements (NFR-001, NFR-002…). Give each a clear statement, business justification, and specific, testable acceptance criteria.
5. **Integrate and trace.** Integrate the BR/NFR requirements and acceptance criteria into the PRD with clear traceability from business needs to solution requirements. If no PRD exists, produce a standalone BRD per BR (conventionally `/docs/br-001.md`, `/docs/br-002.md`, …) structured to slot into a future PRD.
6. **Validate.** Present documented requirements for stakeholder review and capture validation/sign-off. Structure requirements to enable immediate Epic creation and Story breakdown.

## BR/NFR Format

```text
Business Requirements (BR):
- BR-001: [Primary business capability requirement]
- BR-002: [Secondary business process requirement]

Non-Functional Requirements (NFR):
- NFR-001: [Performance/scalability requirement]
- NFR-002: [Security/compliance requirement]
- NFR-003: [Usability/accessibility requirement]
```

## Quality Checklist

Deliverable is ready when:

- All requirements are in BR/NFR format and integrated into the PRD (or standalone BRD)
- Every requirement has a clear statement, business justification, and testable acceptance criteria
- Both functional (BR) and non-functional (NFR) requirements are represented
- Key stakeholders have engaged, requirements are validated, and sign-off is captured
- Requirements are structured to enable immediate Epic creation and Story breakdown
- Traceability from business needs to solution requirements is explicit
- Requirements describe what the business needs, not how to implement it
- Acceptance criteria are specific enough to pass or fail without interpretation

## Reference Files

- **`references/requirements-doc-template.md`** — Full Business Requirements Document structure. Use it as the output skeleton; populate the sections relevant to the scope and omit the internal guidance tags from the final output.

---
name: Document Business Rules
description: This skill should be used when the user asks to "document business rules", "capture business logic", "define business constraints", "write the rules catalog", "business rule governance", or "decision rules". Documents business rules and constraints that govern system behavior with conditions, actions, exceptions, and business rationale.
argument-hint: <domain-or-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Document Business Rules

Systematically document business rules and constraints that govern system behavior, supporting PRD requirements and Epic implementation with clear, non-conflicting business logic.

## Workflow

1. **Confirm scope and target.** Identify the business domain from `$ARGUMENTS` and confirm the output path (conventionally `/docs/business-rules.md`). Verify the PRD is accessible, decision points are identified, subject matter experts are available, and compliance/policy requirements are understood. If a referenced input file is missing, report the exact path and HALT. If an SME is unavailable or a compliance requirement is undefined, document the gap as an open question, flag the associated risk, and proceed with the available information. If a process map exists (from the analyze-processes skill), consult it to locate decision points. Use TodoWrite to track the 7 workflow steps. Use AskUserQuestion if the domain scope or SME contacts are unclear.
2. **Apply methodologies.** Use techniques from the `business-analysis-methodologies` skill to elicit and validate rules.
3. **Discover rules.** Analyze decision points in business processes, review policies and regulatory requirements, interview SMEs, and identify system constraints.
4. **Structure with the template.** Use `references/business-rules-template.md`. Document each rule with a standard structure: ID, name, type, conditions, actions, exceptions, and business rationale.
5. **Categorize and validate.** Organize rules by domain and type (constraint, derivation, action enabler). Test rule logic against business scenarios and edge cases; identify and resolve conflicts.
6. **Integrate with PRD.** Link rules to specific PRD BR/NFR requirements for traceability and structure them to guide Epic feature implementation.
7. **Establish governance.** Assign rule ownership, define approval/change-management workflows, and obtain stakeholder sign-off.

## Rule Documentation Format

```text
Rule ID: BR-[NUMBER] (e.g., BR-001)
Rule Name: [Descriptive business rule name]
Rule Type: [Constraint/Derivation/Action Enabler]
Business Domain: [Functional area this rule applies to]

Rule Statement: [Clear, unambiguous rule logic]
Business Rationale: [Why this rule exists and its business value]
Conditions: [Specific circumstances when rule applies]
Actions: [What happens when conditions are met]
Exceptions: [Circumstances that override the rule]
```

## Quality Checklist

Deliverable is ready when:

- Every rule has its full standard structure (ID, name, type, conditions, actions, exceptions, rationale)
- Rules support and clarify PRD BR/NFR requirements with traceable links
- Rules are structured to guide Epic feature implementation
- Governance framework is defined: ownership, approval, and change-management processes
- All regulatory and policy requirements are addressed
- Stakeholders have reviewed and approved; conflicts are resolved (not left open)
- Rules describe business logic, not implementation solutions
- Rule statements are unambiguous and testable against scenarios and edge cases

## Reference Files

- **`references/business-rules-template.md`** — Full business rules documentation structure (summary, categories, detailed rule format, relationships, governance, compliance, metrics). Populate the relevant sections; do not emit unpopulated placeholders into the final document.

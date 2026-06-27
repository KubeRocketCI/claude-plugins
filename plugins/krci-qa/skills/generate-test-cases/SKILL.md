---
name: Generate Test Cases
description: This skill should be used when the user asks to "write manual test cases", "create a test cases document", "document test steps and expected results", or "turn acceptance criteria into manual test steps" — and it is the default for a bare "write test cases" / "generate test cases" when no automation format is specified. Produces detailed, executable manual test cases as structured Markdown (functional, negative, edge, and non-functional) with traceability to Story acceptance criteria. For executable Gherkin/`.feature` automation use generate-auto-test-cases; for the overarching plan use create-test-plan.
argument-hint: <feature-or-story>
allowed-tools: [Read, Write, Edit, Grep, Glob]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Generate Test Cases

Translate an approved test plan and Story acceptance criteria into detailed, executable test cases with clear steps, expected results, and complete traceability. Every test case must be independently executable by any team member without additional context.

## Workflow

1. **Confirm scope and inputs.** Identify the target Story or feature from `$ARGUMENTS`. Confirm the approved test plan location (e.g. `/docs/qa/test-plan.md`) and the Story file. If the test plan or Story is missing, report the exact path and HALT.
2. **Apply test design techniques.** Use techniques from the `testing-methodologies` skill: equivalence partitioning and boundary value analysis for input validation, decision table testing for complex conditions, and state transition testing for workflow-driven features.
3. **Map acceptance criteria.** For each Story acceptance criterion, identify at least one positive test case. Add negative cases for error conditions and edge cases for boundary values.
4. **Structure with the template.** Use `references/test-cases-template.md` as the document skeleton; populate all sections relevant to the scope.
5. **Define test data.** Specify required test data sets, user accounts, environment configurations, and data privacy considerations for each test case.
6. **Build traceability matrix.** Map every test case ID to the specific Story acceptance criterion it validates.
7. **Peer review and approve.** Present test cases to the development team for review. Obtain approval before execution begins.

## Test Case Coverage Model

```text
For each Story acceptance criterion:
  - Positive (happy path): validates the expected behavior
  - Negative: validates error handling for invalid inputs or conditions
  - Edge case: validates behavior at boundaries or exceptional states

Additional coverage layers:
  - Non-functional: performance, security, usability, compatibility
  - End-to-end: cross-story workflows validating Epic-level behavior
```

## Test Case Format

```text
Test Case ID: TC-<module>-<NNN>
Title:        <concise description of what is being validated>
Prerequisites: <system state, user role, data required before execution>
Test Data:    <specific values, accounts, and configurations needed>
Steps:        1. <action> → <observation point>
              2. ...
Expected Result: <measurable, observable outcome>
Traceability: <Story ID> / <Acceptance Criterion ID>
Priority:     Critical | High | Medium | Low
Automation:   Yes | No | Deferred
```

## Success Criteria

<success_criteria>

- Test cases completed: All test scenarios from the test plan converted to detailed, executable test cases
- Coverage achieved: Every Story acceptance criterion covered by at least one test case
- Quality validated: Test cases follow testing standards and include clear validation criteria
- Traceability established: Clear mapping from test cases to Story acceptance criteria and test plan scenarios
- Execution ready: Test cases include sufficient detail for independent execution by team members
- Review approved: Test cases reviewed and approved by development team and QA stakeholders
</success_criteria>

## Quality Standards and Pitfalls

Each test case must be requirements-traceable, independently executable, standards-compliant, and peer-reviewed. Avoid these common pitfalls:

- Writing test cases without referencing specific Story acceptance criteria
- Creating overly complex test cases that are difficult to execute and maintain
- Missing negative test cases and edge condition scenarios
- Inadequate test data specification and environment requirements
- Poor traceability between test cases and requirements
- Test cases that cannot be executed independently without additional context

## Reference Files

- **`references/test-cases-template.md`** — Full test cases document structure. Use as the output skeleton; populate the sections relevant to the scope and omit internal guidance tags from the final output.

---
name: Create Test Plan
description: This skill should be used when the user asks to "create a test plan", "write a test plan", "plan testing for a story or epic", "define test scope", "set entry/exit criteria", or "define quality gates". Produces one test-plan document — scope, risk-based strategy, resource plan, and measurable quality gates — at the planning stage, before individual cases exist. For the cases themselves use generate-test-cases; for technique and standards reference use testing-methodologies.
argument-hint: <feature-or-release>
allowed-tools: [Read, Write, Edit, Grep, Glob]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Test Plan

Create a comprehensive test plan and testing strategy for Stories and Epic features, translating acceptance criteria and business requirements into a systematic approach that validates functionality, performance, and compliance while establishing clear quality gates for release readiness.

## Workflow

1. **Confirm scope and target.** Identify the feature or release from `$ARGUMENTS` and confirm the Stories/Epics to be covered (conventionally `/docs/stories/` or `/docs/epics/`). Confirm the output document path (e.g. `/docs/qa/test-plan.md`). If any referenced Story, Epic, or PRD is missing, report the exact path and HALT.
2. **Apply testing methodologies.** Use techniques from the `testing-methodologies` skill appropriate to the scope — risk-based prioritization, agile testing, test levels (unit/integration/system/acceptance), and test types (functional, performance, security, usability).
3. **Structure with the template.** Use `references/test-plan-template.md` as the document skeleton; populate all sections relevant to the scope, omitting internal guidance tags from the final output.
4. **Analyze requirements and risks.** Map each Story acceptance criterion to a test scenario. Identify high-risk areas that require deeper testing focus. Define the automation vs manual testing split.
5. **Define quality gates.** Establish measurable entry criteria (code complete, environment ready, test data available) and exit criteria (coverage percentage, defect severity thresholds) for each testing phase.
6. **Plan resources and schedule.** Estimate testing effort, timeline, team structure, and environment requirements. Identify dependencies and risks with mitigation strategies.
7. **Validate and obtain approval.** Present the test plan for development team and stakeholder review. Obtain formal approval before moving to test case generation.

## Risk-Based Priority Matrix

```text
Critical: Core business workflows, authentication/authorization, data integrity
High:     Primary user journeys, API integrations, payment/financial flows
Medium:   Secondary features, UI consistency, error message accuracy
Low:      Edge cases, cosmetic issues, rarely-used configuration paths
```

## Quality Gate Format

```text
Entry Criteria:
- Implementation complete and deployed to test environment
- Test data seeded and environment verified
- Test cases reviewed and approved

Exit Criteria:
- 100% of planned test cases executed
- Zero open Critical or High defects
- Acceptance criteria coverage ≥ 95%
- Performance benchmarks met
```

## Success Criteria

<success_criteria>

- Test plan completed: Comprehensive test plan document with all required sections
- Coverage validated: All Story acceptance criteria and Epic requirements addressed in the testing strategy
- Risk assessed: Testing approach prioritizes high-risk and critical functionality areas
- Resource planned: Testing timeline, effort estimation, and resource requirements defined
- Quality gates established: Clear entry/exit criteria and success metrics for each testing phase
- Stakeholder approved: Test plan reviewed and approved by development team and product stakeholders
</success_criteria>

## Quality Standards and Pitfalls

Each test plan must be requirements-driven, risk-prioritized, resource-realistic, and stakeholder-approved. Avoid these common pitfalls:

- Creating test plans without analyzing actual Story acceptance criteria
- Over-engineering test strategy beyond the Epic and Story scope
- Missing risk assessment and priority-based testing focus
- Inadequate resource planning and timeline estimation
- Poor traceability between requirements and test scenarios
- Creating test plans that do not align with the development workflow

## Reference Files

- **`references/test-plan-template.md`** — Full test plan document structure. Use as the output skeleton; populate the sections relevant to the scope and omit internal guidance tags from the final output.

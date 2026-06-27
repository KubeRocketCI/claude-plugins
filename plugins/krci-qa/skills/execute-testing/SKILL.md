---
name: Execute Testing
description: This skill should be used when the user asks to "execute test cases", "run the test cases", "record pass/fail results", "perform a test run", or "produce a test execution report". Executes approved test cases, records results with evidence, and produces a test execution report with a quality assessment and release-readiness recommendation. To document the individual bugs found, use report-defects.
argument-hint: <test-plan-or-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Execute Testing

Systematically execute approved test cases to validate Story acceptance criteria and Epic functionality. Document results with supporting evidence, identify defects, and deliver a comprehensive test execution report with a quality assessment and release readiness recommendation.

## Workflow

1. **Confirm readiness and inputs.** Identify the test scope from `$ARGUMENTS`. Confirm that approved test cases exist (e.g. `/docs/qa/test-cases.md`) and that the Story implementation is deployed to the test environment. Verify the environment is configured with required test data and dependencies. If any prerequisite is missing, report the exact gap and HALT.
2. **Apply execution practices.** Use practices from the `testing-methodologies` skill — systematic execution order, evidence collection (screenshots, logs, data outputs), and continuous coverage tracking against acceptance criteria.
3. **Execute functional tests.** Run each test case following documented steps. Record pass/fail status with detailed observations and evidence for each case.
4. **Execute non-functional tests.** Run performance, security, usability, and compatibility test cases as defined in the test plan. Record measurements and findings.
5. **Identify and flag defects.** For any test case failure or deviation, capture a defect reference with severity classification. Full defect documentation is handled by the `report-defects` skill.
6. **Compile results using the template.** Use `references/test-report-template.md` to produce the test execution report. Populate all executed sections and omit internal guidance tags from the final output.
7. **Deliver quality assessment.** Evaluate overall quality posture: coverage percentage, open defect severity distribution, and a clear release readiness recommendation.
8. **Communicate results.** Present findings to the development team and product stakeholders.

## Execution Phases

### Preparation

- Verify test environment configuration and test data availability
- Review test cases and understand validation criteria before starting
- Set up testing tools, browsers, and evidence capture capabilities
- Document the initial system state and environment configuration

### Functional Testing

- Execute each test case in logical order following documented steps
- Record pass/fail status with observations and captured evidence
- Track execution progress against Story acceptance criteria
- Flag deviations immediately for defect logging

### Non-Functional Testing

- Execute performance test cases: measure response times and load handling
- Validate authentication, authorization, and data protection measures
- Assess user experience, accessibility, and interface design
- Test across browsers, devices, and platform configurations as planned

### Results Analysis and Reporting

- Compile all results into the test execution report using `references/test-report-template.md`
- Reference defect reports for documented failures
- Provide overall quality evaluation and release readiness recommendation
- Communicate results to development team and product stakeholders

## Success Criteria

<success_criteria>

- Test execution completed: All planned test cases executed with documented results
- Coverage verified: All Story acceptance criteria validated through test execution
- Results documented: Clear pass/fail status recorded for each test case with supporting evidence
- Defects reported: All identified issues documented with detailed reproduction steps
- Quality assessed: Overall quality evaluation completed with release readiness recommendation
- Stakeholder informed: Test results communicated to development team and product stakeholders
</success_criteria>

## Quality Standards and Pitfalls

Each test execution cycle must be systematic, fully documented, defect-complete, and stakeholder-communicated. Avoid these common pitfalls:

- Executing tests without proper environment verification and setup
- Recording test results without sufficient detail or supporting evidence
- Missing defect documentation or inadequate reproduction steps
- Rushing through test execution without thorough validation of each step
- Poor communication of test results and quality assessment to stakeholders
- Executing tests without understanding acceptance criteria and validation requirements

## Reference Files

- **`references/test-report-template.md`** — Full test execution report structure. Use as the output skeleton; populate the sections relevant to the scope and omit internal guidance tags from the final output.

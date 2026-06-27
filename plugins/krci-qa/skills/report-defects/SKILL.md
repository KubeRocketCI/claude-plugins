---
name: Report Defects
description: This skill should be used when the user asks to "report a defect", "log a bug", "write a bug report", "classify defect severity and priority", or "assess defect impact". Produces structured defect reports — reproduction steps, severity/priority, impact analysis, and release-readiness recommendation — one per defect. For the overall pass/fail run summary use execute-testing.
argument-hint: <defect-or-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Report Defects

Create comprehensive defect reports and quality assessments from testing execution results. Translate testing findings into actionable defect documentation with clear reproduction steps, business impact analysis, and resolution recommendations that enable development teams to address issues and stakeholders to make informed release decisions.

## Workflow

1. **Confirm inputs and readiness.** Identify the defect or testing scope from `$ARGUMENTS`. Confirm that test execution results are available (e.g. `/docs/qa/test-report.md`) and that screenshots, logs, and supporting evidence are collected. If required inputs are missing, report the exact gap and HALT.
2. **Analyze and classify defects.** Review test execution results, identify all defects and quality issues, assess business impact, and assign severity/priority using the classification standards below.
3. **Compile evidence.** Organize screenshots, logs, and supporting documentation for each defect before writing the report.
4. **Document each defect.** Use `references/defect-report-template.md` for structured defect documentation. Provide exact reproduction steps, expected vs actual behavior, and environment details.
5. **Assess Story/Epic impact.** Evaluate how each defect affects Story acceptance criteria and Epic functionality. Determine whether defects block release or can be deferred.
6. **Deliver quality assessment.** Compile an overall quality evaluation covering risk analysis, release readiness recommendation, and priority guidance for defect resolution.
7. **Communicate and plan follow-up.** Notify development and product teams. Recommend resolution timeline and plan re-testing activities once defects are resolved.

## Defect Severity Classification

```text
Critical: System crash, data loss, security breach, complete feature failure
          — blocks release; must be resolved before any further testing
High:     Major functionality broken, significant user impact, no workaround
          — blocks Story acceptance; resolve before release
Medium:   Feature partially broken, workaround available, moderate user impact
          — should be resolved before release; may be deferred with PM approval
Low:      Minor UI issue, cosmetic defect, negligible user impact
          — may be deferred to a future sprint with documented acceptance
```

## Defect Report Format

```text
Defect ID:          DEF-<NNN>
Title:              <concise description of the failure>
Severity/Priority:  Critical|High|Medium|Low / P1|P2|P3|P4
Environment:        <OS, browser/version, build/deployment>
Preconditions:      <system state and data required to reproduce>
Steps to Reproduce: 1. <action>
                    2. ...
Expected Behavior:  <what should happen per acceptance criteria>
Actual Behavior:    <what actually happens>
Evidence:           <screenshot/log file references>
Acceptance Criteria Affected: <Story ID> / <AC ID>
```

## Success Criteria

<success_criteria>

- Defects documented: All identified issues reported with comprehensive reproduction steps and evidence
- Quality assessed: Overall Story/Epic quality evaluated with clear release readiness recommendation
- Priority assigned: Defects classified by severity and priority with resolution recommendations
- Traceability established: Clear links between defects and affected Story acceptance criteria
- Stakeholder informed: Quality assessment and defect reports communicated to development and product teams
- Action items defined: Clear next steps and resolution timeline recommendations provided
</success_criteria>

## Quality Standards and Pitfalls

Each defect report must be reproducible, impact-assessed, evidence-supported, priority-classified, and stakeholder-communicated. Avoid these common pitfalls:

- Reporting defects without sufficient reproduction steps or supporting evidence
- Missing impact assessment and business context for identified issues
- Poor defect classification and priority assignment leading to resolution confusion
- Inadequate communication of quality findings to development and product teams
- Reporting defects without linking to specific Story acceptance criteria or test cases
- Missing follow-up planning for defect resolution verification and re-testing

## Reference Files

- **`references/defect-report-template.md`** — Full defect report document structure. Use as the output skeleton; populate the sections relevant to each defect and omit internal guidance tags from the final output.

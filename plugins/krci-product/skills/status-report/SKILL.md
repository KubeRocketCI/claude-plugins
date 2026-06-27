---
name: Status Report
description: This skill should be used when the user asks to "create a status report", "generate a project report", "write a progress report", "update the status report", "report project performance", or "produce a stakeholder update". Creates or updates a comprehensive project status report communicating schedule, cost, scope, risk, and forecast information to stakeholders.
argument-hint: <project-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Status Report

Create or update a project status report that provides stakeholders with clear visibility into project progress, performance, risks, and upcoming activities. The status report is the primary communication vehicle for project performance and supports informed decision-making throughout the project lifecycle.

## Workflow

1. **Confirm scope and target.** Identify the project from `$ARGUMENTS`. For a new report, confirm access to the project plan, schedule, budget documents, risk register, and quality metrics; use AskUserQuestion if performance data sources are unclear. For an update, confirm the previous report and current performance data are available. If any required input is missing, report the exact path and HALT. Use TodoWrite to track each report section.
2. **Apply methodology.** Reference the `project-management-methodology` skill for PMBoK performance reporting principles, earned value management (EVM) metrics, and dashboard standards.
3. **Collect performance data.** Gather current schedule, cost, and scope performance data with clear source references. For updates, compare current performance with the previous reporting period and identify significant changes or trends. Data required includes SPI/CPI metrics, milestone completion status, budget actuals vs. planned, risk register updates, quality metrics, and team performance and resource utilization.
4. **Analyze performance.** Calculate performance indices and variance analysis. Assess root causes for significant variances. Analyze trends across reporting periods and evaluate effectiveness of previous corrective actions. Update risk and issue status, document new risks, and identify items requiring stakeholder decisions.
5. **Structure with the template.** Use `references/status-report-template.md` for consistent formatting. For updates, maintain consistency with previous report structure and preserve historical data for trend analysis.
6. **Populate all sections.** Complete the project health dashboard, schedule performance with milestone table, budget performance with EVM metrics, scope and deliverable status, accomplishments, issues and risk status with escalations, resource utilization, upcoming activities, and forecast with recommendations.
7. **Review and distribute.** Validate all data and calculations. Obtain required approvals. Distribute to the stakeholder distribution list and schedule follow-up meetings as needed.

## EVM Reference Thresholds

- Green: SPI and CPI > 0.95
- Yellow: SPI or CPI between 0.90–0.95
- Red: SPI or CPI < 0.90

## Quality Standards

Present information objectively based on data. Include specific recommendations and clear next steps. Avoid these pitfalls:

- Omitting executive summary — senior stakeholders need the headline first
- Reporting raw data without analysis — variance numbers require root cause and corrective action
- Excluding risk and issue updates — stakeholders need the full picture
- Biased or optimistic framing that obscures real project problems
- Missing forecast section — stakeholders need to know where the project is heading
- Distributing without validating data accuracy, which undermines credibility

## Success Criteria

**Report Completeness:**

- All required performance areas covered thoroughly
- Current status accurately represented with supporting data and data sources
- Variance analysis provides clear insights and root cause explanations
- Risk and issue status comprehensively updated
- Future outlook and forecasts properly supported with assumptions stated

**Communication Effectiveness:**

- Executive summary highlights key information clearly in 2–3 paragraphs
- Report format appropriate for the intended stakeholder audience
- Information presented objectively and professionally without bias
- Action items and decisions clearly identified with owners and dates
- Stakeholder information needs addressed completely

**Data Quality:**

- Performance data accurate and current from verified sources
- EVM metrics calculations correct and validated
- Trend analysis supported by sufficient historical data
- Forecasts based on realistic assumptions with stated confidence levels
- Supporting documentation available and properly referenced

**Report Currency (updates):**

- All performance data current and updated for the reporting period
- Status reflects latest project developments and decisions
- Changes clearly highlighted relative to the previous report
- Recommendations are actionable and timely

## Reference Files

- **`references/status-report-template.md`** — Full status report structure with health dashboard, EVM tables, milestone status, risk/issue log, and forecast sections. Use it as the output skeleton; populate all sections with current data and omit internal guidance tags from the final output.

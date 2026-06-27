---
name: Validate Product Requirements
description: This skill should be used when the user asks to "validate the problem statement", "validate target users", "validate success metrics", "validate business value", "validate the project brief", "check requirements quality", "apply lean startup validation", "apply jobs-to-be-done", "run SMART validation", or "validate the value proposition". Applies Lean Startup Problem-Solution Fit, Jobs-to-be-Done, SMART/OKR, and Value Proposition Canvas frameworks to validate problem statements, user segments, success metrics, and business value in a project brief or PRD.
argument-hint: <brief-or-prd-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Validate Product Requirements

Apply established business validation frameworks to confirm that product requirements are evidence-based, specific, and defensible before development begins. Validation covers four dimensions: problem statement, target users, success metrics, and business value. Output structured validation reports that feed directly into the project-brief refine and finalize operations.

## Workflow

1. **Confirm scope and inputs.** Identify the target artifact from `$ARGUMENTS` (typically `/docs/prd/project-brief.md` or `/docs/prd/prd.md`). Verify the file is accessible and the sections to validate are present. Confirm access to the validation frameworks at `references/validation-frameworks.md`. If any required input is missing, report the exact path and HALT. Use TodoWrite to track each validation dimension as a step.
2. **Select validation dimensions.** Determine which of the four dimensions apply based on user request — or run all four for a comprehensive validation. Use AskUserQuestion if the scope is ambiguous. Each dimension uses a distinct framework and outputs a separate report.
3. **Execute validation by dimension** (see framework details below). For each dimension: extract the hypothesis from the artifact, collect or assess supporting evidence, apply the scoring framework, and document findings.
4. **Write validation reports.** Use `references/validation-report-template.md` for each report. Save to: `/docs/prd/brief-validation-problem.md`, `/docs/prd/brief-validation-users.md`, `/docs/prd/brief-validation-metrics.md`, and `/docs/prd/brief-validation-value.md` as applicable. Strip all `<instructions>` tags — produce clean Markdown only.
5. **Update the project brief and assumption tracker.** Integrate high-confidence findings: update confidence levels per section, add validated evidence citations, revise assumption status (validated / challenged / new), and flag gaps requiring further research.
6. **Report findings.** Present a summary of fit scores, key findings, evidence gaps, and recommendations for next steps (proceed, refine, or revisit fundamentals).

## Validation Frameworks

### 1. Problem Statement — Lean Startup Problem-Solution Fit

Extract the problem hypothesis: `[user_segment] experiences [problem] when [situation], resulting in [negative_impact]`.

Collect evidence: minimum 10 target user interviews, quantified problem metrics (support tickets, time lost, cost of workarounds), competitive analysis showing solution gaps.

Score on four dimensions (1-10 each): Problem Intensity, Frequency, Reach, Urgency. Average to get the Problem Score.

Score Solution fit: Root Cause Fit, Feasibility, Differentiation, Deliverability. Average to get the Solution Score.

Overall Fit = (Problem Score + Solution Score) / 2. Thresholds: Strong (8-10), Moderate (6-7.9), Weak (4-5.9), Poor (<4).

### 2. Target Users — Jobs-to-be-Done Framework

Extract user segment hypothesis: `[demographic] who [behavior] because they need to [goal]`.

For each segment, construct job statements: "When I [situation], I want to [motivation], so I can [expected outcome]." Analyze functional, emotional, and social job dimensions.

Validate segment existence (data, interviews, analytics), job accuracy (observed behavior vs stated), pain intensity (frequency and workaround evidence), and adoption likelihood (willingness to switch, willingness to pay).

Score: Segment Validation, Job Accuracy, Pain Intensity, Adoption Likelihood (each 1-10). Threshold: >7 to proceed with confidence.

### 3. Success Metrics — SMART Criteria and OKR Alignment

Extract all success metrics (business, user, performance, operational).

Apply SMART validation for each metric (1-5 scale per criterion):

- **Specific**: clearly defined, unambiguous, bounded scope
- **Measurable**: quantified target, defined measurement method, available baseline
- **Achievable**: realistic based on benchmarks and team capacity
- **Relevant**: aligned to business OKRs, user needs, and project goals
- **Time-bound**: clear deadline, milestone-linked, tracking cadence defined

Also assess OKR alignment: does the metric link to an organizational Objective? Does it serve as a Key Result with measurable outcomes? Is the target ambitious yet achievable?

Minimum standard: all primary success metrics score ≥4/5 on Specific and Measurable; all metrics have documented baselines or a plan to establish them.

### 4. Business Value — Value Proposition Canvas and ROI

Extract the value hypothesis: `[project] creates value by delivering [customer_benefit] to [target_customers], resulting in [business_outcome] through [value_mechanism]`.

Apply Value Proposition Canvas: map Customer Jobs (functional, emotional, social), Customer Pains (problem, obstacle, risk), and Customer Gains (required, expected, desired, unexpected) against the solution's Pain Relievers and Gain Creators. Score fit: Pain Relief Effectiveness and Gain Creation Effectiveness (1-10 each).

Calculate ROI: estimate investment costs (development, operations, change management), quantify benefits (revenue impact, cost savings, risk reduction, strategic value), compute ROI percentage and payback period. Apply sensitivity analysis for optimistic and conservative scenarios.

Market validation: total addressable market sizing, competitive differentiation rating, strategic alignment score.

Threshold for advancement: Value Proposition Fit >7/10, positive ROI in base scenario, at least one primary competitive differentiator validated with evidence.

## Evidence Quality Levels

| Level | Confidence | Description |
|-------|-----------|-------------|
| High | 80-100% | Multiple primary sources, quantified data, recent research |
| Medium | 60-79% | Mix of primary/secondary, some quantification, reasonably recent |
| Low | 40-59% | Primarily secondary sources, limited quantification, dated research |
| Very Low | <40% | Assumptions without validation, anecdotal evidence only |

## Quality Standards

All conclusions must be supported by documented evidence with source attribution. Avoid these pitfalls:

- Accepting confirmation bias — actively seek disconfirming evidence and diverse perspectives
- Relying solely on secondary sources for primary validation claims
- Leaving baseline metrics undefined — every metric must have a starting measurement or a plan to create one
- Skipping scoring calculations — apply framework scores consistently, even with imperfect data
- Making vague recommendations — every gap identified must have a specific recommended action
- Failing to update the assumption tracker after validation — status changes are inputs to the refine operation

## Success Criteria

### Problem Statement Validation

- Problem hypothesis extracted with specific claims to validate
- Minimum 10 customer interviews conducted with structured approach
- Quantified problem metrics collected (frequency, cost, time impact)
- Competitive analysis completed validating solution gaps
- Problem-Solution Fit score calculated with evidence rationale
- Evidence confidence levels assigned across all sources

### Target User Validation

- User segment hypothesis extracted with behavioral and demographic claims
- Job statements constructed for each segment (functional, emotional, social)
- Segment size and behavior validated with data or research
- Pain intensity validated with observed workaround evidence
- Adoption likelihood assessed with willingness-to-pay indicators

### Success Metrics Validation

- All metrics assessed against all five SMART criteria (1-5 scale)
- OKR alignment documented for each primary metric
- Baseline data identified or measurement plan created
- Unrealistic targets revised with evidence-based benchmarks
- Leading and lagging indicators balanced across the metric set

### Business Value Validation

- Value Proposition Canvas completed: customer profile + value map
- Pain-Solution fit scored with customer evidence
- ROI calculation completed with base, optimistic, conservative scenarios
- Market opportunity quantified with TAM/SAM analysis
- Key competitive differentiators identified and evidence-validated

### All Dimensions

- Validation reports saved using standardized template
- Project brief updated with validated evidence and confidence levels
- Assumption tracker updated: validated, challenged, and new assumptions documented
- Recommendations provided for next steps (proceed / refine / revisit)

## Reference Files

- **`references/validation-report-template.md`** — Standardized report structure for all four validation dimensions. Use it for every validation output; omit internal guidance tags from the final document.
- **`references/validation-frameworks.md`** — Detailed descriptions of Lean Startup Problem-Solution Fit, Jobs-to-be-Done, SMART/OKR, and Value Proposition Canvas methodologies with scoring rubrics and evidence standards.

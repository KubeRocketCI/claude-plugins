---
name: Analyze Processes
description: This skill should be used when the user asks to "analyze a process", "map the current process", "find process bottlenecks", "process improvement", "current state vs future state", "value stream mapping", or "gap analysis". Analyzes current business processes, identifies improvement opportunities, and designs optimized future-state flows.
argument-hint: <process-name-or-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Analyze Processes

Analyze current business processes and workflows to identify improvement opportunities and document process requirements that support PRD enhancement and Epic definition.

## Workflow

1. **Confirm scope and target.** Identify the process and analysis scope from `$ARGUMENTS`, and confirm the output location and (if integrating) the PRD at `/docs/prd/prd.md`. If a referenced input is missing, report the exact path and HALT. Use TodoWrite to track the 7 workflow steps. Use AskUserQuestion if the scope or process boundaries are unclear.
2. **Apply methodologies.** Select techniques from the `business-analysis-methodologies` skill appropriate to the scope (value stream mapping, root cause analysis, performance measurement).
3. **Structure with the template.** Use `references/process-map-template.md` as the documentation structure; populate all template variables and follow the structure exactly.
4. **Map current state.** Document the end-to-end process flow, participants, touchpoints, and quantifiable performance metrics (cycle time, throughput, error rates, resource utilization).
5. **Analyze.** Perform performance gap analysis, classify value-add vs non-value-add activities, run root cause analysis on inefficiencies, and identify automation/streamlining opportunities.
6. **Design future state.** Define optimized workflows that eliminate waste, integrate technology, redefine roles, and produce an implementation roadmap.
7. **Integrate with PRD.** Connect improvements to specific PRD BR/NFR requirements and Epic features, quantifying measurable business benefits.

## Quality Checklist

Deliverable is ready when:

- Current state is documented with quantitative performance metrics (cycle time, throughput, error rates)
- Gaps and inefficiencies are identified and classified (value-add vs. non-value-add)
- Future state is designed with measurable improvement targets
- Improvements are linked to specific PRD BR/NFR requirements
- Business benefits are quantified and implementation roadmap is actionable
- Template variables are fully populated; no internal guidance tags in final output
- Process participants have validated the analysis (avoid mapping assumptions instead of real state)
- Recommendations are not limited to technology — process optimization is addressed first

## Reference Files

- **`references/process-map-template.md`** — Full business process analysis structure with section-level guidance (current state, flow mapping, metrics, pain points, future state, gap analysis, benefits). The `<instructions>` tags inside it are internal guidance and must never appear in the final output.

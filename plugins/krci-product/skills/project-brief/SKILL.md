---
name: Project Brief
description: This skill should be used when the user asks to "create a project brief", "write a project brief", "update the project brief", "enhance the project brief", "refine the project brief", "finalize the project brief", "gather project context", "upgrade the brief to advanced", or "create an evidence-based project brief". Supports standard rapid creation, advanced evidence-based creation with validation and assumption tracking, context gathering, refinement, and finalization of project briefs.
argument-hint: <project-name>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Project Brief

Create, update, enhance, refine, or finalize a project brief — the root SDLC artifact that defines the strategic foundation for a product initiative. The project brief answers why, who, what success looks like, and what constraints shape the solution before development begins. It enables PRD creation at `/docs/prd/prd.md`.

## Workflow

1. **Confirm mode and references.** Identify the project from `$ARGUMENTS` and determine which operation applies: **create** (new brief), **update** (modify existing), **gather context** (evidence collection before authoring), **refine** (integrate validation findings), **finalize** (quality gate and stakeholder approval), or **enhance** (upgrade standard → advanced). For any operation that touches an existing file, confirm the file exists at `/docs/prd/project-brief.md` (or discover the path). For updates, enhancements, refinements, and finalizations — use AskUserQuestion to ask what specific changes are needed and why, and wait for explicit confirmation before making any edits. If any required input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Choose standard or advanced flow.** Use the **standard flow** (`references/project-brief-template.md`) for low-to-medium risk projects, tight timelines, or internal initiatives. Use the **advanced flow** (`references/project-brief-template-advanced.md`) when the project is high-stakes (>$100K budget, >6 months), requires executive approval, involves market uncertainty, or demands stakeholder validation over 2-4 weeks. Standard briefs can be upgraded to advanced using the enhance operation.
3. **Gather context (advanced flow or when evidence is thin).** Use `references/context-gathering-guide-template.md` and the four input methods (document analysis, stakeholder interviews, assumption inventory, evidence library) to systematically collect project context. Apply business frameworks: 5 Whys and SIPOC for problem context; Jobs-to-be-Done and empathy mapping for user context; Porter's Five Forces and TAM/SAM/SOM for market context; SWOT and OKR alignment for business context. Output context to `/docs/prd/project-context.md`. Track all assumptions using `references/assumption-tracker-template.md`, output to `/docs/prd/brief-assumptions.md`.
4. **Author the brief.** Populate all template sections: executive summary, problem statement (with evidence, not solution orientation), target users (with demographics and usage patterns), success metrics (specific, testable, time-bound), constraints (realistic limitations), and risks (with HIGH/MEDIUM/LOW impact). Advanced briefs include validation checkpoints, confidence levels, and evidence source attribution throughout.
5. **Refine with validation results (advanced flow).** After validation tasks complete (see validate-product-requirements skill), integrate findings into the brief: update confidence levels, enhance evidence citations, revise assumption tracker, and confirm each section's validation status. Output a refinement summary to `/docs/prd/brief-refinement-summary.md`.
6. **Finalize and obtain approval.** Verify all quality gates: validation confidence >70% for problem and users, SMART metrics validated, business value quantified, <3 high-risk unvalidated assumptions, document length 2-3 pages, all key stakeholders signed off. Mark status "APPROVED — Ready for PRD" and prepare the documentation package for PRD handoff.
7. **Save.** Write the primary output to `/docs/prd/project-brief.md` (exact path). Strip all `<instructions>` tags — produce clean Markdown only.

## Flow Selection Guide

| Criterion | Standard Flow | Advanced Flow |
|-----------|--------------|---------------|
| Budget | <$100K | >$100K |
| Timeline | <6 months | >6 months |
| Validation timeline | Days | 2-4 weeks |
| Stakeholder approval | Internal | Executive / board |
| Market certainty | Known | Uncertain |
| Risk level | Low-medium | High / strategic |

## Context Gathering Input Methods

Select methods based on available resources:

- **Document analysis**: inventory existing research, competitive analysis, user studies, PRDs; extract structured insights; identify evidence gaps.
- **Stakeholder interviews**: apply BABOK elicitation and empathy mapping; document across business, user, technical, and market stakeholder categories.
- **Assumption inventory**: brainstorm across problem, user, solution, market, and business dimensions; prioritize by impact and uncertainty.
- **Evidence library**: collect quantified data (analytics, support tickets, market sizing, financial data); rate quality and confidence levels.

## Quality Standards

Every brief must be evidence-based and stakeholder-validated. Avoid these pitfalls:

- Writing solution-oriented problem statements (focus on user pain and business impact, not missing features)
- Defining target users without usage patterns, demographics, or validated segments
- Writing unmeasurable success metrics or aspirational statements without evidence
- Proceeding with updates without explicit user consultation and approval
- Expanding beyond the 2-3 page limit with tactical detail that belongs in the PRD
- Leaving high-risk assumptions unvalidated before advancing to PRD creation

## Success Criteria

### Standard Flow

- File saved to `/docs/prd/project-brief.md` (2-3 pages maximum)
- Problem statement is specific and evidence-based (not solution-oriented)
- Target users defined with demographics and usage patterns
- Success metrics are specific and testable
- Constraints reflect actual limitations
- Risks identified with HIGH/MEDIUM/LOW impact levels
- Downstream PRD creation enabled

### Advanced Flow (additional criteria)

- Context gathered using business framework methodologies
- Stakeholder interviews completed with structured approach
- Evidence library created with quality and confidence assessments
- Assumption inventory with impact and risk prioritization
- Problem validated using Lean Startup Problem-Solution Fit
- Users validated using Jobs-to-be-Done framework
- Metrics validated using SMART criteria and OKR alignment
- Business value validated using Value Proposition Canvas and ROI analysis
- Stakeholder approval obtained from all key decision makers
- Validation documentation complete with source attribution

### Update / Refine / Finalize Operations

- User consultation completed and changes explicitly approved before edits
- Change rationale documented with downstream PRD impact identified
- Document remains within 2-3 page limit after changes
- Strategic alignment maintained across all sections
- Assumption tracker synchronized with current brief content

## Reference Files

- **`references/project-brief-template.md`** — Standard 2-3 page brief structure for low-to-medium risk projects.
- **`references/project-brief-template-advanced.md`** — Advanced brief template with validation checkpoints, confidence levels, and assumption tracking for high-stakes initiatives.
- **`references/context-gathering-guide-template.md`** — Structured guide for systematic context collection using business frameworks and multiple input methods.
- **`references/assumption-tracker-template.md`** — Template for tracking assumptions by type, impact, confidence, and validation status throughout the brief lifecycle.

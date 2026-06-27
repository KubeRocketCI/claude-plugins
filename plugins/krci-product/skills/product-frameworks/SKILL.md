---
name: Product Frameworks
description: This skill should be used when the user asks about "product frameworks", "which framework to use", "prioritization framework", "business framework", "MoSCoW vs RICE", "backlog prioritization", "value vs effort matrix", "roadmap frameworks", "business analysis models", "OKR frameworks", "Kano model", "Jobs-to-be-Done framework overview", or "which PM methodology applies here". Provides the shared business and prioritization frameworks reference invoked by the other product skills and directly when the user needs framework guidance.
allowed-tools: [Read]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Product Frameworks

Core product management frameworks and methodologies that underpin every product deliverable — requirements definition, prioritization, business analysis, and strategic planning. This skill is the shared knowledge base invoked explicitly by the create-prd, project-brief, and validate-product-requirements skills, and directly when the user needs framework selection guidance.

## How to Use

Read the reference files below and apply the principles throughout product management work:

- Select the framework appropriate to the decision, deliverable, and stakeholder context — do not apply all frameworks mechanically.
- Lead with user needs and business value; stay solution-agnostic until the problem is well understood.
- Use prioritization frameworks to facilitate stakeholder alignment rather than to impose decisions.
- Support framework-based recommendations with evidence and explicit trade-offs.

## Business Frameworks Summary

Full detail in `references/business-frameworks.md`. Key frameworks by use case:

**Requirements Analysis**

- **BABOK**: Structured requirements gathering — interviews, workshops, document analysis, observation, surveys.
- **MoSCoW Prioritization**: Classify requirements as Must Have, Should Have, Could Have, or Won't Have. Use when aligning stakeholders on MVP scope.
- **Kano Model**: Distinguish basic expectations (must-be quality) from performance features (linear satisfaction) and delighters. Use when deciding which features to invest in for competitive differentiation.

**Problem and Opportunity Analysis**

- **Jobs-to-be-Done (JTBD)**: Understand why users "hire" a product — functional, emotional, and social jobs. Use when defining target user segments and validating the value proposition.
- **Business Model Canvas**: Map value proposition, customer segments, channels, and revenue streams on a single page. Use when assessing product-market fit or strategic positioning.
- **Porter's Five Forces**: Assess competitive dynamics — threat of substitutes, buyer power, supplier power, new entrants, rivalry. Use for market context in project briefs.
- **SWOT Analysis**: Structured internal (Strengths, Weaknesses) and external (Opportunities, Threats) assessment. Use when evaluating strategic options.

**Measurement and Alignment**

- **OKR Framework**: Align product goals to organizational Objectives with measurable Key Results. Use when defining success metrics in the project brief and PRD.
- **SMART Criteria**: Validate that metrics are Specific, Measurable, Achievable, Relevant, and Time-bound. Apply to every success metric in the PRD.
- **TAM/SAM/SOM Analysis**: Quantify total addressable, serviceable addressable, and serviceable obtainable market. Use for opportunity sizing in project briefs.

## Prioritization Frameworks Summary

Full detail in `references/prioritization-frameworks.md`. Key frameworks by use case:

**Scoring and Ranking**

- **RICE Scoring**: Reach × Impact × Confidence / Effort. Produces a numeric score that removes subjective debate. Use for backlog grooming when teams disagree on feature importance.
- **Weighted Scoring Model**: Assign weights to multiple criteria (user value, strategic fit, revenue, feasibility) and score each feature. Use when executive stakeholders have different priorities that need explicit weighting.
- **Value vs. Effort Matrix**: Two-dimensional plot of value (y-axis) vs. effort (x-axis). Quick wins (high value, low effort) go first. Use for rapid prioritization sessions.

**Constraint-Based Prioritization**

- **MoSCoW** (also in business frameworks): Define MVP by distinguishing Must Have from the rest. Use as the primary gate for scoping the PRD's MVP/Functional Requirements section.
- **Story Mapping**: Arrange user activities horizontally (journey steps) and prioritize features vertically (releases). Use when the team needs a shared visual release plan.

**Strategic Alignment**

- **Opportunity Scoring (JTBD-based)**: Rate the importance and satisfaction of each user job to find underserved opportunities. High importance + low satisfaction = strongest opportunity. Use during market research and brief creation.
- **Impact Mapping**: Connect business goals → actor behaviors → deliverables → features. Use to ensure every feature traces back to a measurable business outcome.

## Framework Selection Quick Reference

| Situation | Recommended Framework |
|-----------|----------------------|
| Defining MVP scope | MoSCoW |
| Backlog grooming with stakeholders | RICE or Weighted Scoring |
| Rapid team prioritization | Value vs. Effort Matrix |
| Validating user segments | Jobs-to-be-Done |
| Assessing competitive position | Porter's Five Forces |
| Defining success metrics | SMART + OKR |
| Market opportunity sizing | TAM/SAM/SOM |
| Feature investment decisions | Kano Model |
| Strategic option evaluation | SWOT |
| Ensuring feature-to-goal traceability | Impact Mapping |

## Reference Files

- **`references/business-frameworks.md`** — Full descriptions of requirements analysis, problem analysis, business modeling, and measurement frameworks with application guidance. Read this when selecting a methodology for project brief creation, PRD authorship, or requirements validation.
- **`references/prioritization-frameworks.md`** — Detailed scoring models, decision matrices, and strategic alignment frameworks with examples. Read this when facilitating backlog grooming, roadmap planning, or MVP scope decisions.

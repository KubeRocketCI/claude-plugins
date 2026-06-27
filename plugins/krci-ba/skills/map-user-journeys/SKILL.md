---
name: Map User Journeys
description: This skill should be used when the user asks to "map a user journey", "create a journey map", "map the customer experience", "identify touchpoints and pain points", "experience map", or "service blueprint". Creates comprehensive user journey maps with touchpoints, emotions, pain points, and improvement opportunities that inform Epic features.
argument-hint: <journey-or-persona-scope>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Map User Journeys

Create comprehensive user journey maps that visualize user experiences and identify touchpoints, emotions, and pain points, supporting PRD requirements and Epic feature definition with user-centric insights.

## Workflow

1. **Confirm scope and inputs.** Identify the journey/persona from `$ARGUMENTS`. Confirm the PRD is accessible, customer segments/user types are identified, current workflows are known, and user feedback/analytics are available. If a referenced input is missing, report the exact path and HALT. Use TodoWrite to track the 6 workflow steps. Use AskUserQuestion if the persona or journey scope is ambiguous.
2. **Apply methodologies.** Use techniques from the `business-analysis-methodologies` skill, grounding the map in real user research rather than assumptions.
3. **Structure with the template.** Use `references/user-journey-template.md` for journey documentation; populate the relevant sections.
4. **Research.** Conduct user interviews, review usage analytics and feedback, and identify all touchpoints across digital, physical, and human channels.
5. **Analyze.** Rate touchpoint experience and satisfaction, prioritize pain points by frequency and impact, map the emotional journey and moments of truth, and define improvement opportunities with business impact.
6. **Integrate with PRD.** Connect journey insights to specific PRD BR/NFR requirements, structure findings to inform Epic features, and provide context for Story creation and acceptance criteria.

When the user requests a **service blueprint**, also populate the Service Blueprint section of the template (frontstage actions, backstage actions, support processes, technology enablers).

## Quality Checklist

Deliverable is ready when:

- End-to-end journey is documented with all touchpoints (digital, physical, and human channels)
- Pain points are prioritized by frequency and business impact
- Emotional journey is captured with motivations and satisfaction ratings at each touchpoint
- Improvement opportunities are actionable with defined business impact
- Journey insights are linked to specific PRD BR/NFR requirements
- Findings are structured to inform Epic features and Story acceptance criteria
- Map is grounded in real user research and data — not assumptions
- If service blueprint was requested, frontstage/backstage/support/technology sections are populated

## Reference Files

- **`references/user-journey-template.md`** — Full user journey map structure (persona, phases, touchpoints, emotion mapping, future state, service blueprint, roadmap). Populate the relevant sections; do not emit unpopulated placeholders into the final document.

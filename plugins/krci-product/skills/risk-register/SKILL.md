---
name: Risk Register
description: This skill should be used when the user asks to "create a risk register", "build a risk log", "identify project risks", "document risk responses", "update the risk register", or "review project risks". Produces or updates the central repository for risk management, covering identification, analysis, response strategies, and ownership assignments.
argument-hint: <project-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Risk Register

Create or update a risk register that identifies, analyzes, and documents project risks along with their response strategies and ownership assignments. The risk register is the central repository for proactive risk management throughout the project lifecycle, following PMBoK risk management principles.

## Workflow

1. **Confirm scope and target.** Identify the project from `$ARGUMENTS`. For a new register, confirm access to the project charter, scope documentation, and WBS. For an update, confirm the existing register path, recent risk review activities, and project performance data. If any required input is missing, report the exact path and HALT. Use TodoWrite to track identification, analysis, response, and monitoring steps.
2. **Apply methodology.** Reference the `project-management-methodology` skill for PMBoK risk management principles, probability-impact scales, and response strategy guidance.
3. **Identify risks.** For a new register: conduct brainstorming across technical, schedule, cost, organizational, external, and quality dimensions; review project documentation and the WBS for risk sources; and consult lessons learned from similar projects. For an update: review the status of all existing risks, assess effectiveness of implemented responses, identify newly materialized or resolved risks, and analyze project changes for new risk implications.
4. **Analyze risks.** Assess probability (Very Low 0.1 to Very High 0.9) and impact (Very Low to Very High) for each risk. Calculate risk scores and priority rankings. Analyze risk interdependencies and cumulative effects. Validate assessments with stakeholders and subject matter experts.
5. **Structure with the template.** Use `references/risk-register-template.md` for consistent formatting. Complete all risk entry fields: ID, title, description, category, probability, impact, risk score, priority, response strategy, response actions, trigger conditions, owner, status, and target date.
6. **Develop response strategies.** For negative risks: avoid, mitigate, transfer, or accept. For positive risks (opportunities): exploit, enhance, share, or accept. Assign clear risk owners, define trigger conditions, establish resource requirements, and set monitoring procedures.
7. **Establish monitoring and control.** Define risk review schedule, escalation criteria, and stakeholder reporting protocols. For updates, communicate significant risk changes and obtain approval for major response modifications.

## Risk Assessment Framework

Probability scale: Very Low (0.1) | Low (0.3) | Medium (0.5) | High (0.7) | Very High (0.9)

Impact scale: Very Low | Low | Medium | High | Very High

Risk priority matrix: High probability × High impact = Critical; calibrate accordingly.

## Quality Standards

Base all risk assessments on factual analysis and expert input. Assign single, named owners to every risk. Avoid these pitfalls:

- Generic risk descriptions that cannot be acted upon — make each risk specific and concrete
- Assigning group ownership ("the team") without a named individual accountable
- Skipping positive risk (opportunity) identification and response planning
- Failing to define trigger conditions, which delays response activation
- Not reassessing risks after major project changes
- Maintaining the register as a static document rather than a living artifact reviewed regularly

## Success Criteria

**Risk Register Completeness:**

- Comprehensive risk identification across all project knowledge areas
- Thorough risk analysis with probability and impact assessments
- Appropriate response strategies for all significant risks
- Clear ownership assignments and accountability for every risk
- Monitoring and control procedures established

**Risk Management Effectiveness:**

- Risk register supports proactive rather than reactive risk management
- Response strategies are realistic and properly resourced
- Resource requirements for risk responses identified and allocated
- Risk monitoring procedures enable early detection via trigger conditions
- Stakeholder understanding and buy-in confirmed

**Quality Standards:**

- Risk descriptions are clear, specific, and actionable
- Risk assessments are based on factual analysis and expert judgment
- Response plans are detailed with measurable implementation milestones
- Document follows template structure and organizational standards
- Regular review and update procedures established

**Register Currency (updates):**

- All existing risks reviewed and status updated accurately
- New risks identified, fully assessed, and integrated
- Risk response effectiveness evaluated and documented
- Register reflects current project risk exposure
- Stakeholders informed of significant risk changes

## Reference Files

- **`references/risk-register-template.md`** — Full risk register structure including assessment matrix, individual risk entry tables, summary views, and monitoring procedures. Use it as the output skeleton; populate all risk entry fields and omit internal guidance tags from the final output.

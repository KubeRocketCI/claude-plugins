---
name: Project Plan
description: This skill should be used when the user asks to "create a project plan", "write a project management plan", "build an integrated plan", "update the project plan", "revise the management plan", or "plan project execution". Produces or updates the comprehensive project management plan integrating all subsidiary plans for project execution, monitoring, and control.
argument-hint: <project-name-or-path>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Project Plan

Create or update an integrated project management plan that consolidates scope, schedule, cost, quality, resource, communication, risk, and procurement subsidiary plans into a cohesive management framework. The project plan is the primary document guiding project execution, monitoring, and control throughout the lifecycle.

## Workflow

1. **Confirm scope and target.** Identify the project from `$ARGUMENTS`. For a new plan, confirm access to the project charter, WBS, and stakeholder analysis; use AskUserQuestion if inputs are missing or ambiguous. For an update, confirm the existing plan path, approved change requests, and impact assessment documentation. If any required input is missing, report the exact path and HALT. Use TodoWrite to track each subsidiary plan as a step.
2. **Apply methodology.** Reference the `project-management-methodology` skill for PMBoK standards and integrated planning best practices across all knowledge areas.
3. **Analyze inputs and scope.** For a new plan, gather prerequisite artifacts and assemble required planning expertise. For an update, analyze approved changes across all subsidiary plans, assess impact on baselines (scope, schedule, cost), and identify cascading effects on governance and control procedures.
4. **Structure with the template.** Use `references/project-plan-template.md` for consistent formatting. For updates, apply tracked changes and update the revision history, ensuring consistency across all plan components.
5. **Develop subsidiary plans.** Integrate all knowledge area plans into the document:
   - **Scope**: planning process, change control, and WBS
   - **Schedule**: development approach, critical path, and control process
   - **Cost**: estimation, budget development, cost control, and earned value management
   - **Quality**: standards, assurance activities, and control measures
   - **Resource**: organizational structure, allocation, and team development
   - **Communications**: stakeholder requirements, reporting frequency, and methods
   - **Risk**: identification, analysis, response strategies, and monitoring procedures
   - **Procurement**: approach and contract management (if applicable)
   - **Change management**: change control board, process, and configuration management
6. **Validate and finalize.** Conduct a comprehensive stakeholder review, validate resource commitments and schedule feasibility, confirm budget approval, and obtain formal sign-off to establish the plan as the execution baseline.

## Content Requirements

- Executive summary and project overview
- All subsidiary plans integrated coherently
- Detailed schedule with critical path and milestone plan
- Comprehensive budget with baselines and earned value approach
- Clear quality standards, acceptance criteria, and assurance procedures
- Defined roles, responsibilities, and organizational structure
- Communications plan with stakeholder matrix and reporting schedule
- Risk management plan integrated with the risk register
- Change management and configuration control procedures
- Performance measurement framework and monitoring process

## Quality Standards

Ensure all subsidiary plans are internally consistent and mutually supportive. Build in appropriate contingencies. Avoid these pitfalls:

- Creating plans in isolation without cross-referencing subsidiary plan dependencies
- Producing schedules without critical path analysis or resource leveling
- Setting budgets without earned value management baseline definitions
- Omitting the risk management plan from the integrated document
- Updating one subsidiary plan without assessing cascading effects on others
- Finalizing the plan without formal stakeholder approval and sign-off

## Success Criteria

**Plan Completeness:**

- All subsidiary plans integrated coherently into the management framework
- Detailed schedules with realistic, dependency-aware timelines
- Comprehensive budget with appropriate contingency reserves
- Clear quality standards and measurable acceptance criteria
- Well-defined roles, responsibilities, and governance structure

**Plan Viability:**

- Resource requirements validated and commitments confirmed
- Schedule achievable given identified constraints and dependencies
- Budget realistic and approved by appropriate stakeholders
- Risk responses adequate for identified threats and opportunities
- Communications plan addresses all stakeholder information needs

**Stakeholder Acceptance:**

- All stakeholders understand and approve the integrated plan
- Resource commitments confirmed and documented in writing
- Schedule milestones aligned with business needs
- Quality expectations clearly established and accepted
- Change management procedures agreed upon by all parties

**Process Compliance (updates):**

- Integrated change control procedures followed across all plans
- All approved changes accurately reflected in affected subsidiary plans
- Updated baselines are realistic and achievable
- Updated plan distributed to all stakeholders with change summary

## Reference Files

- **`references/project-plan-template.md`** — Full integrated plan structure covering all PMBoK knowledge area subsidiary plans. Use it as the output skeleton; populate the sections relevant to scope and omit internal guidance tags from the final output.

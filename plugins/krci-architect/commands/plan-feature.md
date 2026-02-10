---
description: Guided workflow for planning KubeRocketCI feature implementation across multiple repositories
argument-hint: [feature-description]
allowed-tools: [Read, Grep, Glob, Bash, WebSearch, WebFetch, Task, AskUserQuestion, Skill, TaskCreate, TaskUpdate, TaskList]
---

Plan a comprehensive feature implementation for the KubeRocketCI platform using a structured 6-phase workflow.

## Core Principles

- **Consultative approach**: Present options and trade-offs, let the user make key decisions
- **Checkpoint before proceeding**: At key phases, STOP and get user confirmation before moving forward
- **No auto-delegation**: NEVER spawn agents to implement until user explicitly approves the plan
- **Read files identified by agents**: When launching agents, ask them to return lists of key files. After agents complete, read those files to build deep context before proceeding.

## Feature to Plan

Feature: $ARGUMENTS

---

## Phase 1: Discovery

**Goal**: Understand what needs to be built

1. Load the krci-architecture and agent-delegation skills using the Skill tool
2. Create task list with all 6 phases
3. If feature unclear, ask user for: what problem they're solving, who will use it, key requirements, any constraints
4. Summarize understanding of the feature
5. **CHECKPOINT**: Use AskUserQuestion to confirm understanding is correct before proceeding
6. **WAIT for user confirmation**

---

## Phase 2: Research & Codebase Exploration

**Goal**: Understand relevant existing code, patterns, and best practices across KRCI repositories

1. **CHECKPOINT**: Use AskUserQuestion to confirm which repositories are relevant and get paths from user
2. **WAIT for user to provide repository paths**
3. Launch 2-3 agents **in parallel** using the Task tool. Each agent should explore a different aspect of the codebase relevant to the feature. Ask each agent to include a list of 5-10 key files to read.

   **Example agent prompts** (adapt based on which repos are affected):
   - "Explore the portal codebase at [path]. Find features similar to [feature], trace their implementation comprehensively. Map component architecture, tRPC API patterns, and UI patterns. Return a list of 5-10 key files."
   - "Explore the edp-tekton repository at [path]. Analyze existing pipeline/task patterns relevant to [feature], trace the Helm chart structure and naming conventions. Return a list of 5-10 key files."
   - "Explore the operator codebase at [path]. Map CRD definitions, controller reconciliation patterns, and API types relevant to [feature]. Return a list of 5-10 key files."
   - "Research Kubernetes/Tekton/React patterns for [feature area] using WebSearch. Document recommended approaches, best practices, and potential pitfalls."

4. Once agents return, read all key files identified by agents to build deep understanding
5. Reference KRCI architecture from loaded skills (reference-architecture, components, deployment-patterns)
6. Present comprehensive summary of findings: similar features (with file:line references), existing patterns, integration points, research findings
7. **CHECKPOINT**: Present analysis findings and ask if anything needs further investigation
8. **WAIT for user confirmation**

---

## Phase 3: Component Identification

**Goal**: Identify all affected repositories and components

1. Based on exploration findings, determine which repositories need changes and what kind (new components vs modifications)
2. For each affected repository, identify specific components, integration points, and dependencies
3. Map data flow between components: API contracts, state management, event flows

---

## Phase 4: Architecture Design

**Goal**: Design implementation approaches and get user decision

**CRITICAL**: This phase requires user decision-making. Present options, don't just pick one.

1. Identify 2-3 viable implementation approaches, each with: description, pros/cons, complexity (low/medium/high), risks, KRCI architecture alignment
2. Review all approaches and form your opinion on which fits best for this specific task (consider: scope, urgency, complexity, KRCI alignment)
3. **CHECKPOINT**: Use AskUserQuestion to present: brief summary of each approach, trade-offs comparison, **your recommendation with reasoning**, concrete implementation differences
4. **WAIT for user to select an approach**
5. Based on selected approach, create detailed phased implementation plan
6. Identify critical considerations: security (DevSecOps), performance, backward compatibility, testing
7. **CHECKPOINT**: Present the complete plan for user approval
8. **WAIT for user approval before proceeding to Phase 5**

---

## Phase 5: Agent Delegation (Optional)

**Goal**: Delegate detailed implementation work to specialized agents IF user approves

**CRITICAL**: Do NOT auto-delegate. User must explicitly request implementation.

1. **CHECKPOINT**: Ask user whether to delegate to agents and start implementation, save the plan for later, or revise the plan
2. **WAIT for user decision**
3. **If implement now**: Launch appropriate agents **in parallel** via Task tool. Provide each agent with clear context from the architecture design: what to implement, which files to modify/create, integration points with other components.
   - **krci-fullstack**: Portal UI, React components, tRPC APIs, forms, tables
   - **krci-devops**: Tekton pipelines, tasks, triggers, Helm charts
   - **krci-godev**: Kubernetes operators, CRDs, controllers, Go code

   **Example delegation prompts**:
   - "Implement the portal UI for [feature] in [repo-path]. Create [components], add tRPC procedure for [API], integrate with [existing component]. Follow patterns found in [similar-feature-file:line]."
   - "Create Tekton task for [feature] in [repo-path]. Follow naming convention from [existing-task]. Add to Helm chart at [chart-path]. Parameters: [list]."
   - "Add [CRD field/controller logic] to [operator] at [repo-path]. Follow the pattern in [similar-controller:line]. Update RBAC and add unit tests."

4. Once agents return, consolidate results and verify integration points between components
5. **If save plan**: Present the complete plan in a shareable format
6. **If revise**: Return to the appropriate phase based on feedback

---

## Phase 6: Summary

**Goal**: Document what was accomplished

1. Mark all tasks complete
2. Summarize: what was planned/built, key decisions made, files modified, suggested next steps

---

## Key Decision Points (MUST Use AskUserQuestion)

1. After Phase 1: Confirm understanding of the feature
2. Start of Phase 2: Get repository paths from user
3. End of Phase 2: Confirm exploration findings are complete
4. Phase 4: Present 2-3 options, get user decision
5. End of Phase 4: Get approval of the complete plan
6. Phase 5: Ask if user wants to implement now or stop

## Critical Reminders

- **STOP at checkpoints**: Never auto-proceed past a CHECKPOINT without user response
- **Launch agents in parallel**: When exploring or delegating, use multiple Task calls in a single message for parallel execution
- **Read files after agents return**: Build deep context from agent-identified key files before proceeding
- **Present options**: In Phase 4, always present multiple approaches with trade-offs
- **No auto-delegation**: Never spawn agents without explicit user approval
- Validate against KRCI reference architecture principles
- Consider DevSecOps: security as mandatory quality gate
- Provide specific file references (file:line) not generic suggestions

---
description: Guided workflow for planning KubeRocketCI feature implementation across multiple repositories
argument-hint: [feature-description]
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch, Task, TodoWrite, AskUserQuestion, Skill
---

Plan a comprehensive feature implementation for the KubeRocketCI platform using a structured 6-phase workflow.

## Core Principles

- **Consultative approach**: Present options and trade-offs, let the user make key decisions
- **Checkpoint before proceeding**: At key phases, STOP and get user confirmation before moving forward
- **No auto-delegation**: NEVER spawn agents to implement until user explicitly approves the plan

## Feature to Plan

Feature: $ARGUMENTS

## Workflow Instructions

Execute this structured 6-phase planning process, tracking progress with TodoWrite:

### Phase 1: Discovery

**Goal**: Understand what needs to be built

1. Load the krci-architecture and agent-delegation skills using the Skill tool
2. Create todo list with all 6 phases using TodoWrite
3. Mark Phase 1 as in_progress
4. Analyze the feature description and use AskUserQuestion to clarify:
   - What problem does this feature solve?
   - Who will use it?
   - What are the key requirements?
   - Are there any constraints (performance, compatibility, security)?
5. Summarize understanding of the feature
6. **CHECKPOINT**: Use AskUserQuestion to confirm understanding:

   ```
   Based on your request, I understand the feature as:
   - Problem: [what problem it solves]
   - Users: [who will use it]
   - Requirements: [key requirements]
   - Constraints: [any constraints]

   Is this correct? Should I proceed with research?
   ```

7. **WAIT for user confirmation before proceeding**
8. Mark Phase 1 as completed, Phase 2 as in_progress

### Phase 2: Research

**Goal**: Research relevant patterns and best practices

1. Use WebSearch to research:
   - Similar features in Kubernetes platforms
   - Relevant Tekton patterns (if pipeline-related)
   - React/TypeScript patterns (if portal-related)
   - Go operator patterns (if operator-related)
2. Reference KRCI architecture from loaded skills:
   - krci-architecture skill contains reference architecture principles
   - Review `references/reference-architecture.md` for architecture flow
   - Check `references/components.md` for platform component details
   - See `references/deployment-patterns.md` for deployment strategies
3. Document key findings:
   - Recommended patterns
   - Best practices to follow
   - Potential pitfalls to avoid
4. Mark Phase 2 as completed, Phase 3 as in_progress

### Phase 3: Codebase Analysis

**Goal**: Understand existing code and patterns in KRCI repositories

1. Identify which repositories need to be analyzed based on the feature:
   - **Tekton-related**: edp-tekton repository
   - **Portal-related**: krci-portal repository
   - **Operator-related**: edp-codebase-operator or edp-cd-pipeline-operator
2. **CHECKPOINT**: Use AskUserQuestion to confirm repository access:

   ```
   To analyze the codebase, I need access to:
   - [Repository 1]: [reason needed]
   - [Repository 2]: [reason needed]

   Please provide paths to these repositories, or confirm they are in the current workspace.
   ```

3. **WAIT for user to provide repository paths before proceeding**
4. Use Grep/Glob to find similar implementations in the provided repository paths
5. Document findings:
   - Similar features found (with file:line references)
   - Existing patterns to follow
   - Components that will need changes
6. **CHECKPOINT**: Present analysis findings:

   ```
   Codebase Analysis Results:
   - Similar features: [list with file:line references]
   - Patterns to follow: [key patterns identified]
   - Components affected: [list of components]

   Does this analysis look complete? Any areas I should investigate further?
   ```

7. **WAIT for user confirmation before proceeding**
8. Mark Phase 3 as completed, Phase 4 as in_progress

### Phase 4: Component Identification

**Goal**: Identify all affected repositories and components

1. Determine which repositories need changes:
   - edp-tekton: New pipelines, tasks, or triggers?
   - krci-portal: UI changes, new pages, API integration?
   - edp-codebase-operator: New CRDs, controller changes?
   - edp-cd-pipeline-operator: CD pipeline changes, promotion logic?
2. For each affected repository, identify:
   - Specific components to modify
   - New components to create
   - Integration points between components
3. Map data flow:
   - How data flows between components
   - API contracts needed
   - State management requirements
4. Document component breakdown with specific files/packages
5. Mark Phase 4 as completed, Phase 5 as in_progress

### Phase 5: Architecture Design

**Goal**: Present implementation options and get user decision on approach

**CRITICAL**: This phase requires user decision-making. Present options, don't just pick one.

1. Identify 2-3 viable implementation approaches:
   - For each approach, document:
     - High-level architecture description
     - Pros and cons
     - Complexity and effort estimate (low/medium/high)
     - Risk factors
     - KRCI architecture alignment

2. **CHECKPOINT**: Use AskUserQuestion to present options:

   ```
   I've identified the following implementation approaches:

   **Option A: [Name]**
   - Approach: [description]
   - Pros: [benefits]
   - Cons: [drawbacks]
   - Complexity: [low/medium/high]
   - KRCI alignment: [how it fits]

   **Option B: [Name]**
   - Approach: [description]
   - Pros: [benefits]
   - Cons: [drawbacks]
   - Complexity: [low/medium/high]
   - KRCI alignment: [how it fits]

   **Recommendation**: I suggest Option [X] because [reason].

   Which approach would you like to proceed with? Or would you like me to explore other options?
   ```

3. **WAIT for user to select an approach before proceeding**

4. Based on selected approach, create detailed implementation plan:
   - Phase 1: Foundation (e.g., CRDs, data models)
   - Phase 2: Core logic (e.g., controllers, business logic)
   - Phase 3: Integration (e.g., portal UI, pipelines)
   - Phase 4: Testing and validation

5. Identify critical considerations:
   - Security requirements (KRCI follows DevSecOps - security as quality gate)
   - Performance implications
   - Backward compatibility
   - Testing strategy

6. **CHECKPOINT**: Present the complete plan for approval:

   ```
   Implementation Plan for [Selected Approach]:

   **Architecture:**
   - [Component responsibilities]
   - [Integration approach]
   - [Data flow]

   **Implementation Phases:**
   1. [Phase 1 details]
   2. [Phase 2 details]
   3. [Phase 3 details]
   4. [Phase 4 details]

   **Critical Considerations:**
   - Security: [requirements]
   - Performance: [implications]
   - Compatibility: [notes]

   Do you approve this plan? Any changes needed before I proceed to agent delegation?
   ```

7. **WAIT for user approval before proceeding to Phase 6**
8. Mark Phase 5 as completed, Phase 6 as in_progress

### Phase 6: Agent Delegation (Optional)

**Goal**: Delegate detailed implementation work to specialized agents IF user approves

**CRITICAL**: Do NOT auto-delegate. User must explicitly request implementation.

1. **CHECKPOINT**: Ask user if they want to proceed with implementation:

   ```
   The planning phase is complete. Here's a summary:

   **Plan Summary:**
   - Feature: [feature name]
   - Approach: [selected approach]
   - Repositories affected: [list]
   - Implementation phases: [count]

   **Agent Delegation Plan:**
   - krci-fullstack: [portal work needed, if any]
   - krci-devops: [tekton work needed, if any]
   - krci-godev: [operator work needed, if any]

   Would you like me to:
   A) Delegate to agents and start implementation now
   B) Save this plan and stop here (you can implement later)
   C) Revise the plan (specify what to change)
   ```

2. **WAIT for user decision**

3. **If user chooses A (implement now)**:
   - For each repository/component, determine which agent handles it:
     - **krci-fullstack**: Portal UI, React components, tRPC APIs, forms, tables
     - **krci-devops**: Tekton pipelines, tasks, triggers, Helm charts
     - **krci-godev**: Kubernetes operators, CRDs, controllers, Go code
   - Use Task tool to spawn the appropriate agent
   - Provide clear context and requirements from the architecture design
   - Coordinate results from agents
   - Create final implementation summary

4. **If user chooses B (stop here)**:
   - Present the complete plan in a format that can be saved/shared
   - Mark Phase 6 as completed
   - End workflow

5. **If user chooses C (revise)**:
   - Return to the appropriate phase based on user feedback
   - Continue from there

6. Mark Phase 6 as completed
7. Mark all phases complete in todo list

## Output Format

Provide a comprehensive feature implementation plan that includes:

1. **Feature Summary**: Clear description of what's being built
2. **Research Findings**: Key patterns and best practices discovered
3. **Codebase Analysis**: Similar features found, patterns to follow
4. **Component Breakdown**:
   - Affected repositories
   - Specific components to modify/create
   - Data flow diagram (text-based)
5. **Architecture Design**:
   - Implementation approach
   - Phased implementation plan
   - Critical considerations (security, performance, compatibility)
6. **Agent Delegation Results**:
   - What each specialist agent will implement
   - Integration points between agent work
   - Overall coordination plan

## Key Decision Points (MUST Use AskUserQuestion)

1. **After Phase 1 (Discovery)**: Confirm understanding of the feature
2. **Start of Phase 3 (Codebase Analysis)**: Get repository paths from user
3. **End of Phase 3**: Confirm analysis findings are complete
4. **Phase 5 (Architecture Design)**: Present 2-3 options, get user decision
5. **End of Phase 5**: Get approval of the complete plan
6. **Phase 6 (Agent Delegation)**: Ask if user wants to implement now or stop

## Critical Reminders

- **STOP at checkpoints**: Never auto-proceed past a CHECKPOINT without user response
- **Present options**: In Phase 5, always present multiple approaches with trade-offs
- **No auto-delegation**: Never spawn agents without explicit user approval
- Always validate against KRCI reference architecture principles
- Consider DevSecOps: security as mandatory quality gate
- Ensure backward compatibility unless breaking change is justified
- Provide specific file references (file:line) not generic suggestions

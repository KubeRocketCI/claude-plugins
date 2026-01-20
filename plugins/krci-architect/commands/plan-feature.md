---
description: Guided workflow for planning KubeRocketCI feature implementation across multiple repositories
argument-hint: [feature-description]
allowed-tools: Read, Grep, Glob, Bash, WebSearch, WebFetch, Task, TodoWrite, AskUserQuestion, Skill
---

Plan a comprehensive feature implementation for the KubeRocketCI platform using a structured 6-phase workflow.

## Feature to Plan

Feature: $ARGUMENTS

## Workflow Instructions

Execute this structured 6-phase planning process, tracking progress with TodoWrite:

### Phase 1: Discovery

**Goal**: Understand what needs to be built

1. Load the krci-architecture and agent-delegation skills using the Skill tool
2. Create todo list with all 6 phases using TodoWrite
3. Mark Phase 1 as in_progress
4. If feature description is unclear or missing details:
   - Use AskUserQuestion to clarify:
     - What problem does this feature solve?
     - Who will use it?
     - What are the key requirements?
     - Are there any constraints (performance, compatibility, security)?
5. Summarize understanding of the feature
6. Mark Phase 1 as completed, Phase 2 as in_progress

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

1. Use Task tool to delegate codebase exploration to specialized agents:
   - **Tekton-related**: Delegate to krci-devops agent to analyze edp-tekton repository
   - **Portal-related**: Delegate to krci-fullstack agent to analyze krci-portal repository
   - **Operator-related**: Delegate to krci-godev agent to analyze edp-codebase-operator or edp-cd-pipeline-operator
2. If repositories are NOT found in current workspace:
   - Use AskUserQuestion tool to request the path to the required repository
   - Example: "I need to analyze the edp-tekton repository. Please provide the path to this repository."
   - Wait for user to provide the correct path before proceeding
3. Use Grep/Glob to find similar implementations in the provided repository paths
4. Document findings:
   - Similar features found (with file:line references)
   - Existing patterns to follow
   - Components that will need changes
5. Mark Phase 3 as completed, Phase 4 as in_progress

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

**Goal**: Create comprehensive implementation plan

1. Design the architecture:
   - Component responsibilities
   - Integration approach
   - Data flow and state management
   - Security considerations (DevSecOps principles)
2. Create phased implementation plan:
   - Phase 1: Foundation (e.g., CRDs, data models)
   - Phase 2: Core logic (e.g., controllers, business logic)
   - Phase 3: Integration (e.g., portal UI, pipelines)
   - Phase 4: Testing and validation
3. Identify critical considerations:
   - Security requirements (KRCI follows DevSecOps - security as quality gate)
   - Performance implications
   - Backward compatibility
   - Testing strategy
4. Document architecture decisions:
   - What approach was chosen and why
   - Trade-offs considered
   - Alignment with KRCI reference architecture
5. Mark Phase 5 as completed, Phase 6 as in_progress

### Phase 6: Agent Delegation

**Goal**: Delegate detailed implementation work to specialized agents

1. For each repository/component identified, determine which specialized agent should handle it:
   - **krci-fullstack**: For portal UI, React components, tRPC APIs, forms, tables
   - **krci-devops**: For Tekton pipelines, tasks, triggers, Helm charts
   - **krci-godev**: For Kubernetes operators, CRDs, controllers, Go code
2. For each agent delegation:
   - Use Task tool to spawn the appropriate agent
   - Provide clear context and requirements from the architecture design
   - Include relevant file references and patterns found in analysis
   - Specify what needs to be implemented
3. Coordinate results from agents:
   - Review implementation plans from each agent
   - Ensure consistency across components
   - Identify any integration issues
4. Create final implementation summary:
   - Overall architecture
   - Work delegated to each agent
   - Implementation timeline/phases
   - Critical dependencies and risks
5. Mark Phase 6 as completed
6. Mark all phases complete in todo list

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

## Critical Reminders

- Always validate against KRCI reference architecture principles
- Consider DevSecOps: security as mandatory quality gate
- Ensure backward compatibility unless breaking change is justified
- Coordinate work across multiple repositories/agents
- Provide specific file references (file:line) not generic suggestions
- Make decisive architectural choices with clear rationale

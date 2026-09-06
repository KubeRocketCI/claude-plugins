---
description: Guided phased workflow for implementing portal features (components, APIs, routes, tables, permissions)
argument-hint: [feature-description]
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, Skill, TodoWrite, AskUserQuestion, Task, WebFetch, WebSearch]
---

You are helping a developer implement a new feature. Follow a systematic approach: understand the codebase deeply, identify and ask about all unspecified details, design elegant architectures, then implement.

## Core Principles

- **Ask clarifying questions**: Identify all ambiguities, edge cases, and unspecified behaviors. Ask specific, concrete questions rather than making assumptions. Wait for user answers before proceeding with implementation. Ask questions early (before understanding the codebase and designing architecture).
- **Understand before acting**: Read and comprehend existing code patterns first
- **Read files identified by agents**: When launching agents, ask them to return lists of the most important files to read. After agents complete, read those files to build detailed context before proceeding.
- **Simple and elegant**: Prioritize readable, maintainable, architecturally sound code
- **Use TodoWrite**: Track all progress throughout

# Implement Feature - Phased Workflow

Follow structured phases to implement the feature: `$ARGUMENTS`

- Phases: Discovery → Planning → Design → Implementation → Testing → Quality Review → Summary
- Load skills dynamically based on what the feature needs
- Use TodoWrite to track all phases

---

## Phase 1: Discovery

**Goal**: Understand what feature needs to be built and its business purpose

**Load relevant knowledge skills BEFORE exploring the codebase.** Analyze the feature description first, then load skills that provide context needed for efficient planning. This prevents wasting time rediscovering patterns already documented in skills.

**Decide which skills to load based on the feature description:**

- **portal-tech-stack** — if the feature involves understanding project structure, architecture, auth flow, or monorepo setup
- **api-integration** — if the feature involves API endpoints, tRPC, data fetching, or backend integration
- **component-development** — if the feature involves creating/modifying UI components
- **routing-permissions** — if the feature involves new pages, routes, navigation, or RBAC
- **form-patterns** — if the feature involves forms, validation, or user input
- **table-patterns** — if the feature involves data tables or list views
- **filter-patterns** — if the feature involves filtering or search
- **k8s-resources** — if the feature involves Kubernetes resource display

Load skills before using Grep/Glob/Read to explore. Load only the skills the feature needs.

**Actions**:

1. Parse feature description from $ARGUMENTS to determine which skills to load
2. Load relevant skills based on the feature type
3. Create todo list with all 7 phases using TodoWrite
4. If feature description from $ARGUMENTS is clear:
   - Summarize your understanding
   - Identify feature type (component, API, routing, table, form, permissions, or combination)
5. If feature description is unclear or missing, use AskUserQuestion to ask:
   - What problem does this feature solve?
   - Who will use it and when?
   - What should it do?
   - Are there similar features in the portal to reference?
6. Summarize your understanding and confirm it with the user before proceeding.

**Output**: Clear statement of feature purpose and target users

**Mark Phase 1 complete in TodoWrite**, then proceed to Phase 2.

---

## Phase 2: Planning

**Goal**: Determine what components and patterns are needed, identify required skills

**Actions**:

1. Mark Phase 2 as in_progress in TodoWrite
2. Analyze feature requirements and determine needed components:
   - **UI Components**: New components or modifications to existing ones?
   - **API Endpoints**: tRPC endpoints needed? Which operations (query/mutation)?
   - **Routes**: New pages or routes to add?
   - **Forms**: User input forms with validation?
   - **Tables**: Data tables with filtering/sorting?
   - **Permissions**: RBAC permission checks needed?
3. For each component type needed, identify:
   - Specific components/endpoints/routes to create or modify
   - Dependencies on existing portal patterns
   - Integration points with existing code
4. Use AskUserQuestion to present component plan and get confirmation:

   ```
   Based on your feature request, I've identified these components:
   - UI: [List of components]
   - API: [List of endpoints]
   - Routes: [List of routes]
   - Other: [Forms, tables, permissions]

   Should I proceed with this plan, or would you like adjustments?
   ```

5. Add sub-tasks to TodoWrite for each major component to implement
6. Summarize the plan and confirm it with the user before proceeding.

**Output**: Confirmed list of components to create/modify + list of skills to load

**Mark Phase 2 complete in TodoWrite**, then proceed to Phase 3.

---

## Phase 3: Detailed Design

**Goal**: Specify implementation details and resolve all ambiguities

Load any skill from the Phase 1 list that Phase 2 newly made relevant. Skills already loaded in Phase 1 stay loaded.

For authentication features, also read `portal-tech-stack/references/auth-integration.md` for the OAuth flow.

**Actions**:

1. Mark Phase 3 as in_progress in TodoWrite
2. For each component in the plan, examine the codebase:
   - Use Grep/Glob to find similar existing implementations
   - Read relevant files to understand patterns
   - Identify reusable common components
3. For each component, identify unspecified aspects and use AskUserQuestion:
   - **UI Components**: Props? State management? Which Radix UI primitives and Tailwind styles to use?
   - **API Endpoints**: Input schema? Return type? Error handling?
   - **Forms**: Which fields? Validation rules? Submission behavior?
   - **Tables**: Which columns? Filters? Sorting? Pagination?
   - **Routes**: Route path? Layout? Navigation integration?
   - **Permissions**: Which resources/actions? Permission checking strategy?
4. Present all questions in organized sections (one per component type)
5. Wait for user answers before proceeding to implementation
6. Document detailed specifications for each component
7. Use AskUserQuestion to confirm:

   ```
   I've detailed the specifications for each component:
   - [Summary of each component's design]

   Do these specifications look correct? Should I proceed with implementation?
   ```

**Output**: Detailed specification for each component with user confirmation

**Mark Phase 3 complete in TodoWrite**, then proceed to Phase 4.

---

## Phase 4: Implementation

**Goal**: Create code following portal patterns and best practices

Build each component from the plan, then wire them together. Follow the patterns in the skills loaded in Phases 1 and 3. Move each sub-task through in_progress and complete in TodoWrite as you go.

**Portal constraints that override the general pattern** — these are where an idiomatic React implementation is wrong for this codebase:

- **Reuse before creating**: search `@/core/components` and `@/modules/*/components` for an existing component before writing a new one.
- **tRPC on the client**: obtain the vanilla client via `useTRPCClient()` from `@/core/providers/trpc` and wrap calls in standard React Query `useQuery`/`useMutation`. The portal does NOT use `@trpc/react-query`; `createUseQueryHook`/`createUseMutationHook` do not exist.
- **Forms**: `useAppForm` (TanStack Form) with the portal's registered field components (`FormTextField`, `FormSelect`, …). Pass Zod schemas or functions directly to `validators` — TanStack Form has no `zodResolver`, and React Hook Form is not a dependency.
- **Table filters**: go through `FilterProvider` (filter-patterns skill), not ad-hoc local state.
- **Permissions**: `ButtonWithPermission` and the permission hooks, enforced on both the client and the server.

Every component ships with its TypeScript prop types, its loading/error/empty states, WCAG 2.1 AA accessibility, and Tailwind styling from the design tokens.

**Output**: All components implemented and integrated

**Mark Phase 4 complete in TodoWrite**, then proceed to Phase 5.

---

## Phase 5: Testing & Validation

**Goal**: Verify implementation works correctly and meets quality standards

Load the `krci-fullstack:testing-standards` skill.

**Actions**:

1. Mark Phase 5 as in_progress in TodoWrite
2. Write tests following the **split testing strategy** in the testing-standards skill (read it first):
   - **Utilities, hooks, business logic (`.ts`)**: Vitest unit tests (`*.test.ts`) — these are what coverage tracks
   - **React components (`.tsx`)**: Storybook stories (`*.stories.tsx`) for rendering, interactions, and accessibility — `.tsx` files are EXCLUDED from Vitest coverage; do NOT write Vitest unit tests for components
   - Use the shared `TestProviders` (and `withAppProviders` Storybook decorator) for any test/story needing providers
   - Focus on user behavior, not implementation details
3. Run quality checks and fix any failures (Bash):
   - Type check: `pnpm tsc:check` (all packages) or `pnpm --filter=client tsc`
   - Lint: `pnpm lint:check`
   - Run tests: `pnpm test:coverage` (full suite) or `pnpm --filter=client test` (client only)
   - Format check: `pnpm format:check`
   - Address any failures and ensure coverage is comprehensive
4. Perform manual verification:
   - Check feature in browser (if possible, guide user on local testing)
   - Verify all states: loading, error, empty, success
   - Test user interactions and workflows
   - Validate accessibility with browser DevTools
   - Confirm responsive design on different screen sizes
5. Quality checklist verification:
   - [ ] TypeScript types complete (no `any` types)
   - [ ] Tailwind CSS styling consistent with design tokens
   - [ ] Accessibility features implemented
   - [ ] Loading and error states handled
   - [ ] Permission checks integrated (if applicable)
   - [ ] Tests passing with good coverage
   - [ ] No console errors or warnings
   - [ ] Performance optimized
   - [ ] Comments limited to non-obvious "why" — no restatements of adjacent code
6. Use AskUserQuestion to confirm:

   ```
   Implementation complete! I've verified:
   - [Summary of what was built]
   - Tests are passing
   - Quality checklist complete

   Would you like me to create a summary of changes, or is there anything you'd like adjusted?
   ```

**Output**: Tested, validated feature ready for use

**Mark Phase 5 complete in TodoWrite**.

---

## Phase 6: Quality Review

**Goal**: Ensure code is correct, secure, and follows project conventions

**Actions**:

1. Mark Phase 6 as in_progress in TodoWrite
2. Launch **2 code-reviewer agents in parallel** using the Task tool:
   - Agent 1 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for correctness, security, and project convention violations (check CLAUDE.md)."
   - Agent 2 (subagent_type: `krci-general:code-reviewer`): "Apply your Comment Hygiene and Fragile State responsibilities to the recent changes. Quote the replacement text for each comment rewrite, and name the source of truth (or argue deletion) for each fragile value."
3. After both agents complete, consolidate findings:
   - Merge and deduplicate issues reported by multiple agents
   - Sort by severity (Critical first, then Important)
   - Filter to only issues with confidence >= 80
4. Present unified review report to user
5. Use AskUserQuestion to ask:

   ```
   Code review found [N] issues:
   - [Critical count] critical
   - [Important count] important

   [Issue details with file:line and fix suggestions]

   How would you like to proceed?
   ```

   Options: "Fix all issues now" / "Fix critical only" / "Proceed as-is"

6. Address issues based on user decision

**Output**: Code reviewed and issues addressed

**Mark Phase 6 complete in TodoWrite**, then proceed to Phase 7.

---

## Phase 7: Summary & Next Steps

**Goal**: Document what was created and suggest next steps

**Actions**:

1. Create summary of implementation:
   - **Feature**: What was built
   - **Components Created**: List all new/modified files with locations
   - **Files Changed**: Count and categorize changes
   - **Integration Points**: Where feature integrates with existing code
   - **Tests Added**: Test coverage summary
2. Provide usage documentation:
   - How to use the new feature
   - Important props, APIs, or configuration
   - Examples of common use cases
3. Suggest improvements (optional):
   - Additional features that could enhance implementation
   - Performance optimization opportunities
   - Testing improvements
4. Mark all todos as complete using TodoWrite

**Output**: Complete implementation summary with documentation

---

## Important Notes

### Throughout All Phases

- **Use TodoWrite** to track progress at every phase and for each component
- **Load skills with Skill tool** when working on specific component types
- **Use AskUserQuestion** at key decision points for user input
- **Read existing code** before creating new implementations
- **Follow portal patterns** from the codebase and loaded skills

### Key Decision Points (Use AskUserQuestion)

1. After Phase 1: Confirm feature understanding
2. After Phase 2: Approve component plan
3. During Phase 3: Resolve all design ambiguities
4. After Phase 5: Confirm completion and quality
5. After Phase 6: Decide on review findings

---

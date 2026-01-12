---
description: Guided phased workflow for implementing portal features (components, APIs, routes, tables, permissions)
argument-hint: [feature-description]
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, Skill, Task, AskUserQuestion, TodoWrite, WebFetch, WebSearch, BashOutput]
---

# Implement Feature - Phased Workflow

**CRITICAL: Follow this workflow to implement the portal feature:**

1. **Use fullstack-dev agent to implement the feature:**
   - The fullstack-dev agent will implement `$ARGUMENTS`
   - Agent will follow structured phases: Discovery → Planning → Design → Implementation → Testing
   - Agent will load skills dynamically based on what the feature needs
   - Agent will use TodoWrite to track all phases

---

## Phase 1: Discovery

**Goal**: Understand what feature needs to be built and its business purpose

**Actions**:

1. Create todo list with all 5 phases using TodoWrite
2. If feature description from $ARGUMENTS is clear:
   - Summarize your understanding
   - Identify feature type (component, API, routing, table, form, permissions, or combination)
3. If feature description is unclear or missing, use AskUserQuestion to ask:
   - What problem does this feature solve?
   - Who will use it and when?
   - What should it do?
   - Are there similar features in the portal to reference?
4. Summarize understanding and confirm with user before proceeding

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
6. **Identify which skills to load** based on components:
   - If ANY components need context: frontend-tech-stack (monorepo, tech stack)
   - If UI components: component-development
   - If forms: form-patterns
   - If tables: table-patterns
   - If tables with filtering: filter-patterns
   - If APIs: api-integration
   - If routes/RBAC: routing-permissions
   - If K8s UIs: k8s-resources
   - Testing will need: testing-standards

**Output**: Confirmed list of components to create/modify + list of skills to load

**Mark Phase 2 complete in TodoWrite**, then proceed to Phase 3.

---

## Phase 3: Detailed Design

**Goal**: Specify implementation details and resolve all ambiguities

**MUST load skills** using Skill tool based on Phase 2 analysis:

1. **Load krci-fullstack:frontend-tech-stack skill** (if any components - provides monorepo/tech stack context)

2. **Load krci-fullstack:component-development skill** (if UI components - provides project structure)

3. **Load additional pattern-specific skills** based on Phase 2 components:
   - Load krci-fullstack:form-patterns (if forms)
   - Load krci-fullstack:table-patterns (if tables)
   - Load krci-fullstack:filter-patterns (if tables with filtering)
   - Load krci-fullstack:api-integration (if APIs)
   - Load krci-fullstack:routing-permissions (if routes/RBAC)
   - Load krci-fullstack:k8s-resources (if K8s UIs)

4. **For authentication features only:** Read frontend-tech-stack/references/auth-integration.md for OAuth flow

**CRITICAL**: Load ONLY skills needed for this specific feature. This is one of the most important phases. DO NOT SKIP.

**Actions**:

1. Mark Phase 3 as in_progress in TodoWrite
2. For each component in the plan, examine the codebase:
   - Use Grep/Glob to find similar existing implementations
   - Read relevant files to understand patterns
   - Identify reusable common components
3. For each component, identify underspecified aspects and use AskUserQuestion:
   - **UI Components**: Props? State management? Which Radix UI primitives and Tailwind styles to use?
   - **API Endpoints**: Input schema? Return type? Error handling?
   - **Forms**: Which fields? Validation rules? Submission behavior?
   - **Tables**: Which columns? Filters? Sorting? Pagination?
   - **Routes**: Route path? Layout? Navigation integration?
   - **Permissions**: Which resources/actions? Permission checking strategy?
4. Present all questions in organized sections (one per component type)
5. Wait for user answers before proceeding to implementation
6. Document detailed specifications for each component

**Output**: Detailed specification for each component with user confirmation

**Mark Phase 3 complete in TodoWrite**, then proceed to Phase 4.

---

## Phase 4: Implementation

**Goal**: Create code following portal patterns and best practices

**Actions**:

1. Mark Phase 4 as in_progress in TodoWrite
2. For each component from the plan (marking each sub-task as in_progress):

   **For UI Components**:
   - Check `@/core/components` and `@/modules/*/components` for similar components
   - Review common-components patterns (reference from component-development skill)
   - Create component file with TypeScript interface for props
   - Implement using Radix UI components with Tailwind CSS utility classes
   - Add accessibility features (ARIA labels, keyboard navigation)
   - Integrate permissions if needed (ButtonWithPermission, permission hooks)
   - Add loading and error states
   - Mark sub-task complete in TodoWrite

   **For API Endpoints**:
   - Define tRPC router with Zod schema for input validation
   - Implement business logic following backend patterns
   - Create React Query hooks using `createUseQueryHook`/`createUseMutationHook`
   - Handle errors with user-friendly messages
   - Mark sub-task complete in TodoWrite

   **For Forms**:
   - Use form-implementation patterns from form-patterns skill
   - Create form component with controlled inputs
   - Add validation using React Hook Form or similar
   - Implement error handling and user feedback
   - Integrate with API mutation hooks
   - Mark sub-task complete in TodoWrite

   **For Tables**:
   - Use table patterns from table-patterns skill
   - Define column configurations
   - Implement filters using filter-patterns skill (FilterProvider with TanStack Form)
   - Add sorting and pagination
   - Add loading skeletons and empty states
   - Integrate with API query hooks
   - Mark sub-task complete in TodoWrite

   **For Routes**:
   - Add route to routing configuration
   - Create page component following layout patterns
   - Integrate with navigation (breadcrumbs, menu)
   - Handle route parameters and query strings
   - Mark sub-task complete in TodoWrite

   **For Permissions**:
   - Use permission patterns from routing-permissions skill
   - Add RBAC checks to components
   - Implement client-side and server-side validation
   - Handle permission-denied states gracefully
   - Mark sub-task complete in TodoWrite

3. After implementing each component:
   - Verify TypeScript types are complete
   - Ensure Tailwind CSS styling is consistent with design tokens
   - Check accessibility features are present
   - Review error handling
   - Mark component sub-task as complete in TodoWrite

4. Integrate all components together:
   - Connect UI components to API hooks
   - Wire up routing and navigation
   - Test integration points
   - Verify data flows correctly

**Output**: All components implemented and integrated

**Mark Phase 4 complete in TodoWrite**, then proceed to Phase 5.

---

## Phase 5: Testing & Validation

**Goal**: Verify implementation works correctly and meets quality standards

**MUST load testing-standards skill** using Skill tool:

- Load krci-fullstack:testing-standards skill

**Actions**:

1. Mark Phase 5 as in_progress in TodoWrite
2. Write tests following testing-standards skill patterns:
   - **Component Tests**: Test rendering, user interactions, prop variations, edge cases
   - **Integration Tests**: Test component integration with APIs and routing
   - **Accessibility Tests**: Verify ARIA attributes, keyboard navigation, screen reader support
   - Use Vitest and React Testing Library
   - Focus on user behavior, not implementation details
3. Run tests and fix any failures:
   - Execute tests with Bash tool: `npm test` or `vitest`
   - Address failing tests
   - Ensure coverage is comprehensive
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
   - [ ] Code documented
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

## Phase 6: Summary & Next Steps

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
- **Apply best practices**:
  - TypeScript with full type coverage
  - Tailwind CSS styling with design tokens and CVA for variants
  - Accessibility compliance (WCAG 2.1 Level AA)
  - Comprehensive testing
  - Error handling and loading states
  - Permission integration where needed

### Key Decision Points (Use AskUserQuestion)

1. After Phase 1: Confirm feature understanding
2. After Phase 2: Approve component plan
3. During Phase 3: Resolve all design ambiguities
4. After Phase 5: Confirm completion and quality

### Skills to Load by Phase

Skills are loaded **dynamically based on feature needs** identified in Phase 2:

- **Phase 2**: Identify which skills will be needed (no loading yet)
- **Phase 3**: Load skills identified in Phase 2:
  - frontend-tech-stack (if any components - tech stack and monorepo)
  - component-development (if UI components - project structure)
  - form-patterns (if forms)
  - table-patterns (if tables)
  - filter-patterns (if tables with filtering)
  - api-integration (if APIs)
  - routing-permissions (if routes/RBAC)
  - k8s-resources (if K8s UIs)
  - auth-integration.md reference (if auth features only)
- **Phase 5**: testing-standards (for writing tests)

### Quality Standards

Every component must meet:

- TypeScript types complete
- Follows portal patterns
- Tailwind CSS styling consistent
- Accessibility features present
- Loading and error states handled
- Permission checks integrated (where applicable)
- Tests written and passing
- Code documented
- No console errors
- Performance optimized

---

**Begin with Phase 1: Discovery**

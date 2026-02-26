---
description: Guided phased workflow for diagnosing and fixing frontend/backend portal issues
argument-hint: <issue-description>
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, Skill, Task, AskUserQuestion, TodoWrite]
---

# Fix Issue - Phased Workflow

**CRITICAL: Follow this workflow to diagnose and fix the portal issue:**

1. **Follow structured phases to fix the issue:** `$ARGUMENTS`
   - Phases: Issue Discovery → Impact Analysis → Fix Planning → Implementation → Verification → Quality Review
   - Load skills dynamically based on what components are affected
   - Use TodoWrite to track all phases
   - Focus on ONE issue at a time for clarity and testability

---

## Phase 1: Issue Discovery & Diagnosis

**Goal**: Thoroughly understand the issue, reproduce it, and identify root cause

**Load relevant knowledge skills BEFORE exploring the codebase.** Analyze the issue description first, then load skills that provide context needed for efficient diagnosis. This prevents wasting time rediscovering patterns already documented in skills.

**Decide which skills to load based on the issue description:**
- **frontend-tech-stack** — if the issue involves project structure, architecture, auth flow, monorepo setup, or you need to understand how the portal is organized
- **api-integration** — if the issue involves API calls, tRPC, data fetching, error handling, or backend integration
- **component-development** — if the issue involves UI components, layouts, or component patterns
- **routing-permissions** — if the issue involves navigation, routes, redirects, or RBAC
- **form-patterns** — if the issue involves forms, validation, or form state
- **table-patterns** — if the issue involves data tables, columns, or table rendering
- **filter-patterns** — if the issue involves filtering, search, or filter state
- **k8s-resources** — if the issue involves Kubernetes resource display or K8s API integration

**CRITICAL**: Load skills BEFORE using Grep/Glob/Read to explore. Only load skills relevant to the issue — not all of them.

**Actions**:

1. Read the issue description from $ARGUMENTS to understand the problem area and determine which skills to load
2. Load relevant skills based on the issue type
3. Create todo list with all 7 phases using TodoWrite
4. Analyze the issue in detail:
   - What is the observable problem?
   - Is it frontend (layout, styles, rendering) or backend (API, data, logic)?
   - When does it occur? (user action, page load, specific data)
   - Expected vs actual behavior
5. If issue description is unclear or missing critical details, use AskUserQuestion to ask:
   - Can you describe what you're seeing vs what you expect?
   - Which page/component is affected?
   - Are there any console errors or network failures?
   - Can you provide steps to reproduce?
   - When did this issue start appearing?
6. **Reproduce the issue** (if possible):
   - Use knowledge from loaded skills to locate relevant files quickly
   - Read component/API code to understand current behavior
   - Trace data flow through the application
   - Look for obvious bugs, typos, logic errors
   - Check console for errors, warnings, or failed requests
7. **Identify root cause**:
   - Is it a logic bug, typo, missing validation, styling issue, or data problem?
   - Which specific files/functions are causing the issue?
   - Are there related issues that might have same root cause?
8. Summarize diagnosis using AskUserQuestion to confirm:

   ```
   I've diagnosed the issue:
   - Root Cause: [specific problem identified]
   - Affected Files: [list of files]
   - Issue Type: [frontend/backend/both]

   Should I proceed with the fix, or would you like me to investigate further?
   ```

**Output**: Clear understanding of root cause and affected components

**Mark Phase 1 complete in TodoWrite**, then proceed to Phase 2.

---

## Phase 2: Impact Analysis

**Goal**: Identify all components affected by this issue and potential side effects of fixing it

**Actions**:

1. Mark Phase 2 as in_progress in TodoWrite
2. Analyze impact scope:
   - **Frontend Impact**: Which components, pages, routes use the affected code?
   - **Backend Impact**: Which API endpoints, queries, mutations are involved?
   - **Data Flow**: How does data flow through affected components?
   - **Dependencies**: What other code depends on the buggy behavior?
   - **Side Effects**: Could fixing this break other features?
3. Use Grep to search for:
   - Imports of affected components
   - Calls to affected API endpoints
   - References to affected functions/variables
   - Similar patterns that might have same bug
4. Create list of affected components:

   ```
   Directly Affected:
   - [Component/API that has the bug]

   Indirectly Affected (consumers):
   - [Components that use the buggy component]
   - [Pages that call the buggy API]

   Potential Side Effects:
   - [Features that might be affected by the fix]
   ```

5. Add sub-tasks to TodoWrite for each component to fix/verify
6. Use AskUserQuestion to present impact analysis:

   ```
   Impact Analysis:
   - Direct: [files to modify]
   - Indirect: [consumers to verify]
   - Risk: [low/medium/high based on usage]

   Should I proceed with the fix, or do you want to review affected areas first?
   ```

**Output**: Complete understanding of impact scope and risk level

**Mark Phase 2 complete in TodoWrite**, then proceed to Phase 3.

---

## Phase 3: Fix Planning & Design

**Goal**: Determine fix strategy and load relevant skills for proper implementation

**Load any additional skills** not yet loaded that are needed for the fix, based on Phase 2 impact analysis.

Some skills may already be loaded from Phase 1. Only load skills that are newly relevant based on deeper understanding of the issue:

- Load krci-fullstack:frontend-tech-stack (if not loaded in Phase 1 and now needed)
- Load krci-fullstack:api-integration (if not loaded in Phase 1 and now needed)
- Load krci-fullstack:component-development (if UI components affected - provides project structure)
- Load krci-fullstack:form-patterns (if forms affected)
- Load krci-fullstack:table-patterns (if tables affected)
- Load krci-fullstack:filter-patterns (if filters affected)
- Load krci-fullstack:routing-permissions (if routes/RBAC affected)
- Load krci-fullstack:k8s-resources (if K8s UIs affected)

**CRITICAL**: Do NOT re-load skills already loaded in Phase 1. Only load what's newly needed. DO NOT SKIP this phase.

**Actions**:

1. Mark Phase 3 as in_progress in TodoWrite
2. For each affected component, examine existing implementation:
   - Read the buggy code carefully
   - Understand the intended behavior
   - Review similar working implementations for reference
   - Identify portal patterns being violated or misused
3. Design the fix strategy:
   - **Minimal Change Principle**: Fix only what's broken, don't refactor unrelated code
   - **Pattern Compliance**: Ensure fix follows portal patterns from loaded skills
   - **Backward Compatibility**: Don't break existing consumers
   - **Testing Strategy**: Determine if tests needed (logic bugs → yes, simple typos → maybe not)
4. For each fix, specify:
   - **Frontend Fixes**: Which props/state/styles to change? Accessibility impact?
   - **Backend Fixes**: Which validation/logic/queries to fix? Schema changes?
   - **Integration Fixes**: Data flow corrections, prop passing, API calls
5. Use AskUserQuestion to present fix strategy:

   ```
   Fix Strategy:
   - Change: [specific changes to make]
   - Pattern: [portal pattern being applied]
   - Risk: [potential issues with this approach]
   - Testing: [whether tests needed]

   Does this approach look good, or would you prefer a different strategy?
   ```

**Output**: Detailed fix specification with user confirmation

**Mark Phase 3 complete in TodoWrite**, then proceed to Phase 4.

---

## Phase 4: Implementation

**Goal**: Apply fixes following portal patterns and best practices

**Actions**:

1. Mark Phase 4 as in_progress in TodoWrite
2. For each component fix from the plan (marking each sub-task as in_progress):

   **For Frontend Issues**:
   - **Layout/Styling Fixes**:
     - Fix CSS issues using Tailwind CSS utility classes
     - Ensure responsive design is maintained
     - Check accessibility (ARIA, keyboard navigation)
     - Test on different screen sizes (if possible)
   - **Component Logic Fixes**:
     - Fix React hooks (useState, useEffect, custom hooks)
     - Correct prop passing and TypeScript types
     - Fix conditional rendering logic
     - Handle edge cases and loading/error states
   - **Form/Table Fixes**:
     - Apply patterns from form-patterns or table-patterns skills
     - Fix validation logic
     - Correct filter/sort/pagination behavior
   - Mark sub-task complete in TodoWrite

   **For Backend Issues**:
   - **API Endpoint Fixes**:
     - Fix tRPC router logic
     - Correct Zod schema validation
     - Fix query/mutation implementation
     - Improve error handling and messages
   - **Data Flow Fixes**:
     - Fix React Query hooks
     - Correct data transformations
     - Fix caching behavior
     - Ensure type safety with TypeScript
   - Mark sub-task complete in TodoWrite

   **For Integration Issues**:
   - **API Integration Fixes**:
     - Fix API calls from components
     - Correct query/mutation hook usage
     - Fix error handling in UI
     - Update loading/success/error states
   - **Route/Navigation Fixes**:
     - Fix routing configuration
     - Correct navigation logic
     - Fix route parameters and query strings
     - Update breadcrumbs/menu integration
   - Mark sub-task complete in TodoWrite

3. After fixing each component:
   - Verify TypeScript types are correct (no new errors)
   - Ensure coding style is consistent
   - Check that fix doesn't introduce new issues
   - Verify accessibility is maintained
   - Mark component sub-task as complete in TodoWrite

4. Verify fix doesn't break consumers:
   - Read code of components that depend on fixed code
   - Check if any changes needed in consumers
   - Ensure backward compatibility
   - Test integration points

**Output**: All fixes implemented following portal patterns

**Mark Phase 4 complete in TodoWrite**, then proceed to Phase 5.

---

## Phase 5: Verification & Testing

**Goal**: Verify fix works correctly and doesn't introduce regressions

**Conditionally load testing-standards skill** (if tests are needed):

- Load krci-fullstack:testing-standards skill (for logic bugs, not simple styling fixes)

**Actions**:

1. Mark Phase 5 as in_progress in TodoWrite
2. **Verify the fix**:
   - Re-check the issue description from Phase 1
   - Confirm the fix addresses the root cause
   - Verify expected behavior is now achieved
   - Check no new console errors or warnings
3. **Check TypeScript compilation**:
   - Run Bash: `npm run type-check` or `tsc --noEmit`
   - Fix any type errors introduced by changes
4. **Manual verification checklist**:
   - [ ] Original issue is fixed
   - [ ] No new bugs introduced
   - [ ] No console errors/warnings
   - [ ] TypeScript types are correct
   - [ ] Styling is consistent
   - [ ] Accessibility maintained (if frontend)
   - [ ] Data flows correctly (if backend)
   - [ ] Error handling works
5. **Testing decision** (based on issue severity):
   - **Write tests if**: Logic bug, data flow issue, API bug, state management bug
   - **Skip tests if**: Simple typo, minor styling fix, documentation update
   - If writing tests, follow testing-standards skill patterns:
     - Component tests for UI fixes
     - Integration tests for API fixes
     - Accessibility tests if applicable
6. If tests are written:
   - Run tests: `npm test` or `vitest`
   - Ensure new tests pass
   - Ensure existing tests still pass
   - Fix any test failures
7. **Verify no regressions**:
   - Run full test suite if available
   - Check related features still work
   - Review consumers identified in Phase 2
8. Use AskUserQuestion to confirm completion:

   ```
   Fix Complete! I've verified:
   - [Summary of what was fixed]
   - Root cause addressed: [specific fix]
   - TypeScript compilation: ✓
   - Tests: [written/not needed]
   - No regressions in: [affected areas]

   Would you like me to create a summary, or is there anything to adjust?
   ```

**Output**: Verified, tested fix ready for commit

**Mark Phase 5 complete in TodoWrite**.

---

## Phase 6: Quality Review

**Goal**: Ensure fix is correct, secure, and doesn't introduce new issues

**Actions**:

1. Mark Phase 6 as in_progress in TodoWrite
2. Launch **3 code-reviewer agents in parallel** using the Task tool, each with a different review focus:
   - Agent 1 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for simplicity, DRY violations, and code elegance. Focus on readability and maintainability."
   - Agent 2 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for bugs, logic errors, security vulnerabilities, race conditions, and functional correctness."
   - Agent 3 (subagent_type: `krci-general:code-reviewer`): "Review the recent changes for project convention violations (check CLAUDE.md), architectural consistency, naming patterns, and import organization."
3. After all 3 agents complete, consolidate findings:
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

## Phase 7: Summary & Documentation

**Goal**: Document what was fixed and provide commit message

**Actions**:

1. Create fix summary:
   - **Issue**: What was broken (from Phase 1)
   - **Root Cause**: Why it was broken
   - **Fix Applied**: What was changed
   - **Files Modified**: List of changed files with brief description
   - **Impact**: What users will notice
   - **Testing**: Whether tests were added/updated
2. Suggest commit message following conventional commits:

   ```
   fix(component-name): brief description of fix

   - Root cause: [explanation]
   - Changes: [list of changes]
   - Impact: [what's fixed from user perspective]

   Fixes: [issue number if available]
   ```

3. Provide usage notes (if behavior changed):
   - How to use the fixed feature
   - Any breaking changes (should be none)
   - Migration steps if needed (rare)
4. Suggest follow-up improvements (optional):
   - Related issues discovered during diagnosis
   - Technical debt identified
   - Performance optimization opportunities
5. Mark all todos as complete using TodoWrite

**Output**: Complete fix summary with commit message

---

## Important Notes

### Throughout All Phases

- **Use TodoWrite** to track progress at every phase and for each fix
- **Load skills with Skill tool** when working on specific component types
- **Use AskUserQuestion** at key decision points for user confirmation
- **Read existing code** before applying fixes (understand context)
- **Follow portal patterns** from the codebase and loaded skills
- **Apply best practices**:
  - Minimal changes principle
  - TypeScript type safety
  - Tailwind CSS styling with design tokens
  - Accessibility compliance (WCAG 2.1 Level AA)
  - Comprehensive testing for logic bugs
  - Error handling and loading states
  - Pattern compliance from loaded skills

### Key Decision Points (Use AskUserQuestion)

1. After Phase 1: Confirm diagnosis and root cause
2. After Phase 2: Review impact analysis and risk
3. After Phase 3: Approve fix strategy
4. After Phase 5: Confirm fix is complete
5. After Phase 6: Decide on review findings

### Skills to Load by Phase

Skills are loaded **as early as possible** to provide context before exploration. Analyze the issue first, then load what's relevant:

- **Phase 1** (before exploration): Analyze issue description and load relevant skills:
  - frontend-tech-stack — if issue involves architecture, project structure, auth flow
  - api-integration — if issue involves APIs, tRPC, data fetching, error handling
  - component-development — if issue involves UI components, layouts
  - routing-permissions — if issue involves routes, redirects, RBAC
  - form-patterns — if issue involves forms, validation
  - table-patterns — if issue involves tables
  - filter-patterns — if issue involves filtering
  - k8s-resources — if issue involves K8s resources
- **Phase 2**: Identify affected components (no loading unless new areas discovered)
- **Phase 3**: Load any additional skills newly identified as relevant from Phase 2 analysis (do NOT re-load skills from Phase 1)
- **Phase 5**: testing-standards (if writing tests for logic bugs)
- **Phase 6**: code-reviewer agents launched via Task tool (krci-general:code-reviewer)

### Quality Standards for Fixes

Every fix must meet:

- Addresses root cause (not just symptoms)
- Minimal changes (don't refactor unrelated code)
- Follows portal patterns
- TypeScript types correct
- No new console errors
- Backward compatible
- Accessibility maintained (frontend)
- Tests added (for logic bugs)
- No regressions in related features
- Code style consistent

### Common Issue Types & Patterns

**Frontend Issues**:

- Layout/styling bugs → Check Tailwind classes, responsive design
- Component rendering → Check props, state, conditional logic
- Forms not working → Check validation, submission, error handling
- Tables not filtering → Check filter logic, query integration
- Accessibility issues → Check ARIA attributes, keyboard navigation

**Backend Issues**:

- API errors → Check tRPC router, Zod schema, error handling
- Data not loading → Check query hooks, API calls, caching
- Mutations failing → Check input validation, permissions, DB operations
- Type errors → Check TypeScript definitions, schema alignment

**Integration Issues**:

- Props not passing → Check prop types, component hierarchy
- API calls failing → Check endpoint path, request format, auth
- State not updating → Check mutation hooks, query invalidation
- Navigation broken → Check route config, link paths, params

---

**Begin with Phase 1: Issue Discovery & Diagnosis**

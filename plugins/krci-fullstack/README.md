# KubeRocketCI Fullstack Developer Plugin

Expert fullstack development assistance for KubeRocketCI portal applications, specializing in React, TypeScript, Radix UI, Tailwind CSS, and tRPC.

## Overview

The **krci-fullstack** plugin provides comprehensive guidance and automation for implementing frontend features in the KubeRocketCI portal ecosystem. It includes specialized knowledge of the portal's tech stack, architectural patterns, and best practices.

## Features

### Agent

- **fullstack-dev**: Expert fullstack developer specializing in React/TypeScript/Radix UI/Tailwind CSS/tRPC development
  - Auto-invokes for portal feature implementation
  - Deep knowledge of KubeRocketCI portal architecture
  - Comprehensive understanding of component patterns, API integration, and testing standards

### Commands

- `/krci-fullstack:implement-feature`: Guided phased workflow for implementing new features
  - Phase 1: Discovery - Understand feature requirements
  - Phase 2: Planning - Identify needed components (UI, API, routing, permissions)
  - Phase 3: Design - Detailed specifications with user input
  - Phase 4: Implementation - Create code following established patterns
  - Phase 5: Testing - Verify and validate implementation

- `/krci-fullstack:fix-issue <issue-description>`: Guided phased workflow for diagnosing and fixing issues
  - Phase 1: Issue Discovery & Diagnosis - Root cause analysis with code inspection
  - Phase 2: Impact Analysis - Identify all affected components and side effects
  - Phase 3: Fix Planning & Design - Determine fix strategy with skill consultation
  - Phase 4: Implementation - Apply minimal fixes following portal patterns
  - Phase 5: Verification & Testing - Verify fix and conditionally add tests
  - Handles both frontend (layout, styles, components) and backend (tRPC, queries) issues

### Skills

The plugin provides 8 comprehensive skills covering frontend development patterns:

1. **frontend-tech-stack**: Overview of React, Radix UI, Tailwind CSS, tRPC, monorepo structure, and authentication
2. **component-development**: Component architecture, common components, and project structure
3. **form-patterns**: Form implementation with validation and error handling
4. **table-patterns**: Data table implementation with filters, sorting, and pagination
5. **api-integration**: tRPC hooks, React Query patterns, and API integration
6. **routing-permissions**: Routing, navigation, and RBAC permission patterns
7. **k8s-resources**: Kubernetes resource UI patterns for portal
8. **testing-standards**: Vitest and Testing Library patterns with error handling

## Tech Stack

The plugin is designed for projects using:

- **Frontend**: React 18+ with TypeScript
- **UI Components**: Radix UI primitives
- **Styling**: Tailwind CSS 4.0+ with CVA (class-variance-authority)
- **API Layer**: tRPC with React Query (TanStack Query)
- **State Management**: Zustand for client state
- **Forms**: React Hook Form with Zod validation
- **Testing**: Vitest + React Testing Library
- **Permissions**: RBAC with custom hooks
- **Monorepo**: pnpm workspace structure
- **Build Tools**: Vite 6+ with esbuild

## Installation

### From Marketplace

```bash
claude plugin install krci-fullstack
```

### Local Development

```bash
claude --plugin-dir /path/to/plugins/krci-fullstack
```

## Usage

### Implementing a New Feature

Use the guided workflow command:

```
/krci-fullstack:implement-feature
```

The command will guide you through:

1. Understanding what feature you want to build
2. Planning which components are needed (UI components, API endpoints, routes, etc.)
3. Designing detailed specifications
4. Implementing the code
5. Testing and validation

### Fixing an Issue

Use the issue diagnosis and fixing command:

```
/krci-fullstack:fix-issue "Login button is not centered on mobile screens"
```

The command will guide you through:

1. Diagnosing the issue with thorough root cause analysis
2. Analyzing impact on related components
3. Planning the fix strategy with relevant skill consultation
4. Implementing minimal changes following portal patterns
5. Verifying the fix and conditionally adding tests

Supports both frontend issues (layout, styling, components, forms, tables) and backend issues (tRPC endpoints, queries, mutations, data flow).

### Leveraging Skills

Skills auto-activate based on context. For example:

- Working on forms → `form-patterns` skill activates
- Creating tables → `table-patterns` skill activates
- Adding API endpoints → `api-integration` skill activates

You can also explicitly reference skills in your requests:

- "Following the form-patterns skill, create a user registration form"
- "Using component-development patterns, build a status badge component"

### Using the Agent

The `fullstack-dev` agent activates when you're working on portal features. It has comprehensive knowledge of all skills and can guide implementation decisions.

## Examples

### Example 1: Implementing a Component

```
/krci-fullstack:implement-feature

> I need to create a deployment status component
```

### Example 2: Adding an API Endpoint

```
/krci-fullstack:implement-feature

> Add a new tRPC endpoint for fetching pipeline runs
```

### Example 3: Creating a Data Table

```
/krci-fullstack:implement-feature

> Implement a table showing all applications with filters
```

### Example 4: Fixing a Frontend Issue

```
/krci-fullstack:fix-issue "User table pagination is broken - clicking next page doesn't update the data"
```

### Example 5: Fixing a Backend Issue

```
/krci-fullstack:fix-issue "API endpoint /pipelines/list returns 500 error when user has no permissions"
```

### Example 6: Fixing a Styling Issue

```
/krci-fullstack:fix-issue "Login button overlaps with footer on mobile devices"
```

## Best Practices

- Use the phased `implement-feature` command for implementing new features
- Use the phased `fix-issue` command for diagnosing and fixing bugs
- Review relevant skills before implementation or fixes
- Follow established patterns from the portal codebase
- Apply minimal changes when fixing issues (avoid unnecessary refactoring)
- Ensure WCAG 2.1 Level AA accessibility compliance
- Write comprehensive tests using Vitest and Testing Library
- Add regression tests for logic bugs, skip for simple styling fixes
- Integrate RBAC permissions for protected actions

## Contributing

This plugin is part of the KubeRocketCI ecosystem. For issues or contributions:

- Repository: <https://github.com/KubeRocketCI/claude-plugins>
- Documentation: <https://github.com/KubeRocketCI/kuberocketai>

## License

Apache-2.0

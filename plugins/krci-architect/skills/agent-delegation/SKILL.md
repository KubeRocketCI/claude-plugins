---
name: Agent Delegation
description: This skill should be used when coordinating work across multiple KRCI repositories, delegating implementation tasks to specialized agents, or when the user asks about "krci-fullstack agent", "krci-devops agent", "krci-godev agent", "delegate to agent", "multi-repository coordination", or mentions using Task tool with KRCI agents.
---

# KRCI Agent Delegation

## Overview

KubeRocketCI has three specialized agents for different domains. Understanding when and how to delegate work to these agents enables efficient multi-repository coordination and leverages domain expertise.

## Available Specialized Agents

### krci-fullstack Agent

**Domain**: Portal and frontend development
**Color**: Cyan
**Repository**: krci-portal (React/TypeScript application)

**Expertise**:

- React components with Radix UI and Tailwind CSS
- tRPC API integration for type-safe communication
- Form implementation with Tanstack Form
- Data tables with filtering and sorting
- Routing and navigation with React Router
- Permission management and RBAC
- Frontend testing with Vitest and Testing Library

**When to Delegate**:

- Portal UI changes (new pages, components, layouts)
- React component implementation
- tRPC API routes (frontend-backend communication)
- Form creation with validation
- Table implementation with filters
- Navigation and routing updates
- Permission checks in UI

**Example Scenarios**:

- "Add new page to portal for managing X"
- "Create form for configuring Y in the UI"
- "Implement table showing Z with filtering"
- "Add API endpoint for retrieving W"

### krci-devops Agent

**Domain**: Tekton pipelines and DevOps automation
**Color**: Blue
**Repository**: edp-tekton (Tekton pipelines, tasks, Helm charts)

**Expertise**:

- Tekton Pipeline and Task creation
- Tekton Triggers for Git webhooks
- Pipeline onboarding using scripts
- Helm chart templating for Tekton resources
- Workspace and parameter patterns
- VCS integration (GitHub, GitLab, Gerrit, Bitbucket)

**When to Delegate**:

- New Tekton pipelines (build, review, deploy)
- Custom Tekton tasks
- Git webhook triggers and event handling
- Pipeline modifications for new languages/frameworks
- Helm chart updates for pipeline library
- VCS-specific integration

**Example Scenarios**:

- "Add build pipeline for new Python framework"
- "Create Tekton task for security scanning"
- "Add GitHub webhook trigger for PR reviews"
- "Onboard new application type to Tekton"

### krci-godev Agent

**Domain**: Kubernetes operator development
**Color**: Blue
**Repositories**: edp-codebase-operator, edp-cd-pipeline-operator

**Expertise**:

- Go programming and idioms
- Kubernetes Custom Resource Definitions (CRDs)
- Controller and reconciliation loop patterns
- Operator SDK usage
- Kubernetes client-go library
- Go testing and code quality

**When to Delegate**:

- Kubernetes operator modifications
- CRD schema updates
- Controller reconciliation logic
- Operator integration with K8s API
- Go code review and refactoring
- Custom Resource implementation

**Example Scenarios**:

- "Add new field to Codebase CRD"
- "Implement controller for new custom resource"
- "Update CD Pipeline operator promotion logic"
- "Add validation webhook for CRD"

## Delegation Patterns

### Single-Agent Delegation

**Use When**: Work is confined to one repository/domain.

**Pattern**:

```
1. Analyze requirement
2. Identify which agent handles the domain
3. Use Task tool to spawn agent with clear context
4. Wait for agent results
5. Integrate findings into overall plan
```

**Example**:

```
Feature: Add user profile page to portal

Analysis: Portal-only change
Agent: krci-fullstack
Delegation: "Create user profile page showing user info, recent activity, and preferences. Use existing patterns from settings page."
```

### Multi-Agent Coordination

**Use When**: Work spans multiple repositories (e.g., operator + portal).

**Pattern**:

```
1. Analyze requirement and identify all affected components
2. Design data contracts between components (CRDs, APIs)
3. Sequence delegation (operator first, then portal)
4. Delegate to first agent with full context
5. Use first agent's results to inform second delegation
6. Ensure integration between agent work
```

**Example**:

```
Feature: Add deployment approval workflow

Analysis:
- CD Pipeline Operator needs approval state in CRD
- Portal needs UI for approval actions
- Integration point: CRD status field

Sequence:
1. Delegate to krci-godev: "Add approval state to Stage CRD and implement approval controller logic"
2. Wait for CRD schema design
3. Delegate to krci-fullstack: "Create approval UI using Stage CRD status.approval field, show pending approvals, implement approve/reject actions"

Coordination: Ensure UI uses exact CRD fields designed by operator agent
```

### Parallel Agent Delegation

**Use When**: Components are independent and can be developed in parallel.

**Pattern**:

```
1. Analyze requirement and identify independent components
2. Design clear interfaces/contracts
3. Spawn multiple agents in parallel using Task tool
4. Wait for all agents to complete
5. Verify integration points align
```

**Example**:

```
Feature: Add metrics dashboard

Analysis:
- Tekton task exposes metrics (edp-tekton)
- Portal displays metrics (krci-portal)
- Components independent (metrics API is contract)

Parallel Delegation:
1. Spawn krci-devops: "Add Tekton task to expose build metrics via Prometheus format"
2. Spawn krci-fullstack (in parallel): "Create metrics dashboard page consuming Prometheus metrics from /metrics endpoint"

Contract: Prometheus metrics format (standard interface)
```

## Delegation Best Practices

### Provide Clear Context

**Good Delegation**:

```
Delegate to krci-fullstack:

"Create a user management page with the following requirements:
- List all users from Keycloak via tRPC API
- Display username, email, roles in a sortable table
- Add filter by role using existing FilterProvider pattern
- Include 'Edit' action button opening user edit dialog
- Follow existing patterns from src/pages/Users/
- Use Radix UI components and Tailwind styling

Integration points:
- tRPC route: api.keycloak.listUsers
- Permissions: Require 'user.manage' permission
- Navigation: Add to Settings menu"
```

**Poor Delegation**:

```
Delegate to krci-fullstack:

"Add user management to the portal"
```

### Specify Integration Points

When delegating to multiple agents, explicitly state how components integrate:

```
Feature: Webhook notifications for pipeline completion

Delegation to krci-devops:
"Add post-pipeline task sending webhook to URL from Pipeline.spec.webhookURL field when pipeline completes (success or failure). Include status, duration, artifact URL in payload."

Delegation to krci-fullstack:
"Add webhook configuration field to CD Pipeline creation form. Field: webhookURL (optional string), validated as URL format. Store in Pipeline.spec.webhookURL."

Integration: Pipeline.spec.webhookURL consumed by Tekton post-pipeline task
```

### Leverage Agent Skills

Each agent loads relevant skills automatically. Reference these in delegation:

**krci-fullstack loads**:

- component-development
- api-integration
- form-patterns
- table-patterns
- routing-permissions

**krci-devops loads**:

- edp-tekton-standards
- edp-tekton-triggers

**krci-godev loads**:

- go-coding-standards
- operator-best-practices

**Reference in delegation**:

```
Delegate to krci-fullstack:
"Implement form following form-patterns skill guidance, using Tanstack Form with validation."
```

### Handle Agent Results

After agent completes:

1. **Review output**: Understand what agent implemented
2. **Verify alignment**: Check against original requirements
3. **Identify gaps**: Note any missing pieces
4. **Coordinate integration**: Ensure cross-agent work integrates
5. **Document decisions**: Capture key architectural choices

## Common Multi-Repository Scenarios

### New CRD + Portal UI

**Repositories**: Operator + Portal
**Agents**: krci-godev + krci-fullstack

**Sequence**:

1. krci-godev: Design and implement CRD
2. krci-fullstack: Create UI consuming CRD

**Integration**: Portal uses exact CRD schema (group, version, kind, fields)

### New Pipeline + Portal Integration

**Repositories**: edp-tekton + Portal
**Agents**: krci-devops + krci-fullstack

**Sequence**:

1. krci-devops: Create Tekton pipeline
2. krci-fullstack: Add UI to trigger/monitor pipeline

**Integration**: Portal triggers pipeline via Tekton API, monitors PipelineRun status

### Operator Logic + Pipeline Task

**Repositories**: Operator + edp-tekton
**Agents**: krci-godev + krci-devops

**Sequence**:

1. krci-godev: Implement operator controller logic
2. krci-devops: Create Tekton task calling operator functionality

**Integration**: Task uses kubectl to create Custom Resources managed by operator

## Delegation Checklist

Before delegating to an agent:

- Clearly understand which repository/domain the work belongs to
- Identify all integration points with other components
- Design data contracts (CRDs, APIs, data formats)
- Determine delegation sequence (serial or parallel)
- Prepare comprehensive context for agent
- Specify expected deliverables
- Reference relevant patterns or examples

After agent completes:

- Review agent output thoroughly
- Verify integration points are compatible
- Check alignment with KRCI architecture
- Identify any follow-up work needed
- Document architectural decisions made

## When NOT to Delegate

**Handle Directly** (don't delegate) when:

- **Cross-cutting design**: Architectural decisions spanning all components
- **Research**: Investigating patterns or best practices
- **Planning**: High-level implementation strategy
- **Validation**: Reviewing designs against KRCI architecture
- **Simple changes**: Trivial updates not requiring specialized knowledge

**Delegate** when:

- **Implementation details**: Writing actual code for a component
- **Domain-specific work**: Requires specialized knowledge (React patterns, Tekton syntax, Go idioms)
- **Complex features**: Multi-step implementation within one repository
- **Testing**: Component-specific testing strategies

## Additional Resources

### Reference Files

For detailed agent capabilities and patterns:

- **`references/agent-capabilities.md`** - Consolidated reference for all KRCI specialized agent capabilities including:
  - krci-fullstack agent capabilities (portal, React, tRPC)
  - krci-devops agent capabilities (Tekton, pipelines, triggers)
  - krci-godev agent capabilities (Go, operators, CRDs)
  - Cross-agent integration patterns
  - Delegation decision tree
  - Common delegation patterns

## When to Use This Skill

Load this skill when:

- Planning features spanning multiple repositories
- Coordinating implementation across portal, operators, and pipelines
- Deciding which agent should handle specific work
- Designing multi-agent workflows
- Ensuring integration between agent deliverables

Combine with krci-architecture skill for complete feature planning that delegates implementation to specialized agents.

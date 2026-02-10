# KRCI Architect Plugin

KubeRocketCI Technical Architect agent for planning, designing, and validating features across the KRCI ecosystem.

## Overview

The KRCI Architect plugin provides expert technical architecture guidance for implementing features in the KubeRocketCI platform. It orchestrates planning across multiple repositories (edp-tekton, krci-portal, operators), delegates work to specialized agents, and validates designs against KRCI reference architecture.

## Features

- **Architecture Planning**: Multi-repository feature planning with comprehensive technical design
- **Agent Coordination**: Delegates implementation to specialized agents (krci-fullstack, krci-devops, krci-godev)
- **Design Validation**: Validates technical designs against KRCI reference architecture and DevSecOps principles
- **Research Integration**: Leverages web search to research latest Kubernetes patterns and best practices
- **KRCI Expertise**: Deep knowledge of all 14+ platform components, deployment patterns, and integration points

## Components

### Agent: architect

Technical architect that orchestrates feature planning and validates designs.

**When to use:**

- Planning new features or epics
- Making architectural decisions for KRCI components
- Coordinating work across multiple repositories
- Validating designs against reference architecture

**Capabilities:**

- Analyzes requirements and translates to technical implementations
- Researches KRCI patterns and Kubernetes best practices
- Creates comprehensive implementation plans with 2-3 approach options
- Delegates to specialized agents for detailed implementation
- Validates architectural alignment and quality

### Commands

#### `/krci-architect:plan-feature`

Guided 6-phase workflow for planning feature implementations.

**Usage:**

```bash
/krci-architect:plan-feature Add multi-tenant support to the platform
```

**Phases:**

1. **Discovery** - Understand feature requirements
2. **Research & Codebase Exploration** - Parallel agents explore relevant repositories
3. **Component Identification** - Identify affected repositories and components
4. **Architecture Design** - Present 2-3 approaches, get user decision
5. **Agent Delegation** - Delegate work to specialized agents (with user approval)
6. **Summary** - Document decisions and next steps

#### `/krci-architect:bootstrap-workspace`

Create a workspace with KubeRocketCI repositories for feature development.

**Usage:**

```bash
/krci-architect:bootstrap-workspace feature-github
```

Interactively selects from 13 available repositories (core operators, CI/CD, portal, supporting services), creates a workspace directory, and clones the selected repos.

#### `/krci-architect:technical-review`

Validates architectural designs against KRCI reference architecture.

**Usage:**

```bash
/krci-architect:technical-review path/to/design-document.md
```

**Validates:**

- Alignment with KRCI reference architecture
- DevSecOps principles and security considerations
- Component interaction patterns
- Scalability and performance
- Best practices compliance

### Skills

#### krci-architecture

Deep knowledge of KubeRocketCI reference architecture, all platform components, deployment patterns, and design validation criteria.

#### agent-delegation

Expertise in coordinating with specialized KRCI agents for multi-component implementations. Covers delegation patterns, agent capabilities, and cross-repository scenarios.

## Platform Coverage

The architect has knowledge of the complete KRCI platform:

| Component Group | Repositories | Agent |
|----------------|-------------|-------|
| Core Operators | edp-codebase-operator, edp-cd-pipeline-operator | krci-godev |
| Auth/Quality Operators | edp-keycloak-operator, edp-sonar-operator, edp-nexus-operator | krci-godev |
| CI/CD | edp-tekton (pipelines/Helm), edp-cluster-add-ons, edp-install | krci-devops |
| CI/CD (Go) | edp-tekton (Go interceptors) | krci-godev |
| Portal | krci-portal | krci-fullstack |
| Supporting Services | gitfusion, krci-cache, tekton-custom-task | krci-godev |
| Documentation | krci-docs | (manual) |

## Installation

This plugin is part of the KubeRocketCI plugin collection. Install via:

```bash
cc --plugin-dir /path/to/claude-plugins/plugins/krci-architect
```

Or copy to your project's `.claude-plugin/` directory.

## Dependencies

This plugin works best alongside:

- **krci-fullstack**: Portal and React/TypeScript implementation
- **krci-devops**: Tekton pipelines and DevOps automation
- **krci-godev**: Kubernetes operator development
- **krci-commit**: Conventional commit message generation

## Example Workflow

1. **Plan a feature:**

   ```text
   User: /krci-architect:plan-feature Add RBAC to the portal
   Architect: [Runs 6-phase planning workflow]
   - Researches KRCI RBAC patterns
   - Analyzes existing auth implementation
   - Identifies portal + operator changes needed
   - Creates implementation plan with options
   - Delegates to krci-fullstack and krci-godev agents
   ```

2. **Validate a design:**

   ```text
   User: /krci-architect:technical-review docs/adr/multi-tenancy-design.md
   Architect: [Validates design]
   - Checks alignment with KRCI architecture
   - Validates security and DevSecOps principles
   - Provides structured recommendations
   ```

## Architecture

The architect agent serves as a **technical coordinator** that:

- Translates product requirements into technical implementations
- Coordinates work across all KRCI repositories
- Ensures architectural consistency with KRCI reference architecture
- Delegates detailed implementation to domain-specific agents

## License

Apache-2.0

## Contributing

Contributions welcome! Please follow the KubeRocketCI contribution guidelines.

## Support

For issues or questions:

- GitHub: <https://github.com/KubeRocketCI/claude-plugins>
- Email: <support@kuberocketci.io>

# KRCI Architect Plugin

KubeRocketCI Technical Architect agent for planning, designing, and validating features across the KRCI ecosystem.

## Overview

The KRCI Architect plugin provides expert technical architecture guidance for implementing features in the KubeRocketCI platform. It orchestrates planning across multiple repositories (edp-tekton, krci-portal, operators), delegates work to specialized agents, and validates designs against KRCI reference architecture.

## Features

- **Architecture Planning**: Multi-repository feature planning with comprehensive technical design
- **Agent Coordination**: Delegates implementation to specialized agents (krci-fullstack, krci-devops, krci-godev)
- **Design Validation**: Validates technical designs against KRCI reference architecture and DevSecOps principles
- **Research Integration**: Leverages web search to research latest Kubernetes patterns and best practices
- **KRCI Expertise**: Deep knowledge of platform components, deployment patterns, and integration points

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
- Creates comprehensive implementation plans
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
2. **Research** - Research KRCI patterns and best practices
3. **Codebase Analysis** - Understand existing code and patterns
4. **Component Identification** - Identify affected repositories and components
5. **Architecture Design** - Create implementation plan
6. **Agent Delegation** - Delegate work to specialized agents

#### `/krci-architect:bootstrap-workspace`
Create a workspace with KubeRocketCI repositories for feature development.

**Usage:**
```bash
/krci-architect:bootstrap-workspace feature-github
```

Interactively selects repositories to clone, creates a workspace directory, and clones the selected repos. Also available as a standalone bash script at `scripts/bootstrap-workspace.sh`.

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
Deep knowledge of KubeRocketCI reference architecture, principles, and component ecosystem.

#### agent-delegation
Expertise in coordinating with specialized KRCI agents for multi-component implementations.

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

## Example Workflow

1. **Plan a feature:**
   ```
   User: /krci-architect:plan-feature Add RBAC to the portal
   Architect: [Runs 6-phase planning workflow]
   - Researches KRCI RBAC patterns
   - Analyzes existing auth implementation
   - Identifies portal + operator changes needed
   - Creates implementation plan
   - Delegates to krci-fullstack and krci-godev agents
   ```

2. **Validate a design:**
   ```
   User: /krci-architect:technical-review docs/adr/multi-tenancy-design.md
   Architect: [Validates design]
   - Checks alignment with KRCI architecture
   - Validates security and DevSecOps principles
   - Provides recommendations
   ```

## Architecture

The architect agent serves as a **technical coordinator** that:
- Translates product requirements into technical implementations
- Coordinates work across KRCI repositories (edp-tekton, krci-portal, operators)
- Ensures architectural consistency with KRCI reference architecture
- Delegates detailed implementation to domain-specific agents

## License

Apache-2.0

## Contributing

Contributions welcome! Please follow the KubeRocketCI contribution guidelines.

## Support

For issues or questions:
- GitHub: https://github.com/KubeRocketCI/claude-plugins
- Email: support@kuberocketci.io

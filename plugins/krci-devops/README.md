# KRCI DevOps Plugin

Expert DevOps automation agent for KubeRocketCI's CI/CD pipeline automation — Tekton and GitLab CI.

## Overview

The KRCI DevOps plugin provides specialized automation for two CI/CD domains:

- **EDP-Tekton** (<https://github.com/epam/edp-tekton>) — Tekton Pipelines, Tasks, and Triggers management
- **GitLab CI Components** (<https://gitlab.com/kuberocketci>) — CI/CD Catalog component library scaffolding

It follows KubeRocketCI standards for Helm chart structure, naming conventions, repository organization, and GitLab CI component architecture.

## Features

- **Automated Pipeline Onboarding**: Generate build and review Tekton pipelines following KRCI naming conventions
- **Task Creation**: Onboard new Tekton Tasks with proper Helm templating
- **Trigger Configuration**: Create Tekton Triggers for VCS webhook integration (GitHub, GitLab, Gerrit, BitBucket)
- **GitLab CI Component Scaffolding**: Scaffold complete component libraries following the ci-template golden reference with 7-stage pipeline architecture
- **Standards Compliance**: Enforce EDP-Tekton and GitLab CI best practices and conventions
- **Repository Validation**: Ensure proper directory structure and script availability

## Components

### Agent

- **devops**: Expert DevOps Engineer specializing in EDP-Tekton automation and GitLab CI component development

### Commands

- `/krci-devops:add-task` - Onboard a new Tekton Task to the repository
- `/krci-devops:add-pipeline` - Onboard new Tekton Pipelines (Build and Review)
- `/krci-devops:add-trigger` - Create Tekton Triggers for VCS webhook integration
- `/krci-devops:add-gitlab-component` - Scaffold a new GitLab CI/CD component library

### Skills

- **edp-tekton-standards**: Comprehensive standards for Tekton pipelines, tasks, Helm charts, and repository structure
- **edp-tekton-triggers**: Complete guide to Tekton Triggers, EventListeners, interceptor chains, and VCS webhook integration
- **gitlab-ci-component-standards**: Standards for GitLab CI component libraries, 7-stage pipeline architecture, and CI/CD Catalog publishing

## Prerequisites

### EDP-Tekton Commands (add-task, add-pipeline, add-trigger)

These commands require the **EDP-Tekton repository**:

- **Repository**: <https://github.com/epam/edp-tekton>
- **Clone**: `git clone https://github.com/epam/edp-tekton.git`
- **Navigate**: `cd edp-tekton`

### GitLab CI Commands (add-gitlab-component)

This command scaffolds a new component library in any target directory. It follows the **ci-template** golden reference at <https://gitlab.com/kuberocketci/ci-template>.

## Installation

### From Marketplace

```bash
cc plugin add krci-devops
```

## Usage

**IMPORTANT**: Navigate to the EDP-Tekton repository before running commands:

```bash
cd /path/to/edp-tekton
```

### Onboard a New Task

```bash
/krci-devops:add-task ansible-run
```

The agent will:

1. Verify you're in the EDP-Tekton repository
2. Load EDP-Tekton standards
3. Validate repository structure
4. Run onboarding script
5. Verify task creation

### Onboard New Pipelines

```bash
/krci-devops:add-pipeline gitlab python fastapi
```

The agent will:

1. Verify you're in the EDP-Tekton repository
2. Load EDP-Tekton standards
3. Generate build pipeline: `gitlab-python-fastapi-app-build-default`
4. Generate review pipeline: `gitlab-python-fastapi-app-review`
5. Validate naming conventions
6. Verify file creation

### Create Triggers for VCS Webhooks

```bash
/krci-devops:add-trigger github build
```

The agent will:

1. Verify you're in the EDP-Tekton repository
2. Load EDP-Tekton standards and triggers skills
3. Create EventListener for GitHub (if needed)
4. Create Trigger with interceptor chain (VCS validation → CEL filter → EDP enrichment)
5. Create TriggerBinding for parameter extraction
6. Create TriggerTemplate for PipelineRun scaffolding
7. Provide webhook configuration instructions

### Scaffold a GitLab CI Component

```bash
/krci-devops:add-gitlab-component golang
```

The agent will:

1. Load GitLab CI component standards
2. Ask about technology stack and configuration
3. Scaffold the complete component library (templates, Dockerfile, CI config)
4. Validate 7-stage pipeline architecture and CI/CD Catalog publishing

## Naming Conventions

### Pipelines

- **Build**: `<vcs>-<language>-<framework>-app-build-default`
- **Review**: `<vcs>-<language>-<framework>-app-review`

Examples:

- `github-java-springboot-app-build-default`
- `gitlab-python-fastapi-app-review`

### Tasks

- **Format**: `kebab-case`
- Examples: `ansible-run`, `maven-build`, `terraform-apply`

## Standards

The plugin enforces:

- Tekton best practices (pipelines, tasks, triggers)
- Helm chart structure and organization
- Repository file organization
- Onboarding script conventions
- Metadata and labeling standards
- Feature flag patterns

## Documentation

For detailed standards and patterns, see:

- `skills/edp-tekton-standards/SKILL.md` - Tekton pipeline/task standards
- `skills/edp-tekton-triggers/SKILL.md` - Tekton trigger architecture and patterns
- `skills/gitlab-ci-component-standards/SKILL.md` - GitLab CI component standards

## License

Apache-2.0

## Support

- Repository: <https://github.com/KubeRocketCI/claude-plugins>
- Issues: <https://github.com/KubeRocketCI/claude-plugins/issues>
- Homepage: <https://github.com/KubeRocketCI/claude-plugins>

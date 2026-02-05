# KRCI DevOps Plugin

Expert DevOps automation agent for KubeRocketCI's EDP-Tekton pipeline and task management.

## Overview

The KRCI DevOps plugin provides specialized automation for onboarding and managing Tekton Pipelines and Tasks in the **EDP-Tekton repository** (<https://github.com/epam/edp-tekton>).

**IMPORTANT**: This plugin is specifically designed for the EDP-Tekton repository. All commands must be executed from within a clone of this repository. It follows KubeRocketCI standards for Helm chart structure, naming conventions, and repository organization.

## Features

- **Automated Pipeline Onboarding**: Generate build and review pipelines following KRCI naming conventions
- **Task Creation**: Onboard new Tekton Tasks with proper Helm templating
- **Trigger Configuration**: Create Tekton Triggers for VCS webhook integration (GitHub, GitLab, Gerrit, BitBucket)
- **Standards Compliance**: Enforce EDP-Tekton best practices and conventions
- **Repository Validation**: Ensure proper directory structure and script availability

## Components

### Agent

- **devops**: Expert DevOps Engineer specializing in EDP-Tekton automation

### Commands

- `/krci-devops:add-task` - Onboard a new Tekton Task to the repository
- `/krci-devops:add-pipeline` - Onboard new Tekton Pipelines (Build and Review)
- `/krci-devops:add-trigger` - Create Tekton Triggers for VCS webhook integration

### Skills

- **edp-tekton-standards**: Comprehensive standards for Tekton pipelines, tasks, Helm charts, and repository structure
- **edp-tekton-triggers**: Complete guide to Tekton Triggers, EventListeners, interceptor chains, and VCS webhook integration

## Prerequisites

### Required Repository

This plugin works exclusively with the **EDP-Tekton repository**:

- **Repository**: <https://github.com/epam/edp-tekton>
- **Clone**: `git clone https://github.com/epam/edp-tekton.git`
- **Navigate**: `cd edp-tekton`

All commands must be run from within this repository.

### Expected Directory Structure

```text
edp-tekton/
├── charts/
│   └── pipelines-library/
│       ├── scripts/
│       │   └── onboarding-component.sh
│       └── templates/
│           ├── pipelines/
│           └── tasks/
```

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

- `skills/edp-tekton-standards/SKILL.md` - Core standards
- `skills/edp-tekton-standards/references/standards.md` - Complete reference

## License

Apache-2.0

## Support

- Repository: <https://github.com/KubeRocketCI/claude-plugins>
- Issues: <https://github.com/KubeRocketCI/claude-plugins/issues>
- Homepage: <https://github.com/KubeRocketCI/claude-plugins>

---
name: KRCI EDP-Tekton Standards
description: This skill should be used when the user asks to "onboard Tekton pipeline", "create new task", "add pipeline to EDP-Tekton", "follow pipeline naming conventions", "configure Helm chart for Tekton", "use onboarding script", "configure Tekton workspaces", "check supported languages", "add language support", "pipeline naming", "task naming", "what languages are supported", "helm chart for tekton", "pipeline structure", or mentions Tekton pipeline naming conventions, EDP-Tekton repository structure, pipeline/task organization, Helm chart templating for Tekton, KRCI onboarding standards, or onboarding script automation. Make sure to use this skill whenever working within the EDP-Tekton repository on pipelines or tasks, even if the user doesn't explicitly mention "standards". For trigger/webhook/EventListener configuration, defer to edp-tekton-triggers. For GitLab CI components, defer to gitlab-ci-component-standards.
---

# EDP-Tekton Standards and Best Practices

Comprehensive standards for developing, organizing, and maintaining Tekton Pipelines and Tasks within KubeRocketCI's EDP-Tekton repository using Helm charts and automation scripts.

## Target Repository

**Repository**: <https://github.com/epam/edp-tekton>

**CRITICAL**: All standards, conventions, and automation scripts in this skill are specific to the EDP-Tekton repository. Ensure you are working within a clone of this repository before applying these standards.

## Purpose

Guide implementation of Tekton resources following KRCI's established patterns for repository structure, naming conventions, Helm chart organization, and onboarding automation within the EDP-Tekton repository.

## Repository Structure

### EDP-Tekton Repository Layout

**Repository Scale**: 394 pipeline files across 10+ languages, 88 tasks in 6 categories, 41 trigger files for 4 VCS providers, 2 Helm charts (pipelines-library and common-library).

```text
edp-tekton/
├── hack/
│   └── onboarding-component.sh      # Primary automation tool
├── charts/
│   ├── common-library/              # Shared Helm template fragments
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── pipelines-library/           # Main Tekton resources
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── scripts/
│       │   └── tekton-prune.sh      # Maintenance helper
│       ├── tests/                   # pytest-based tests
│       └── templates/
│           ├── pipelines/           # Pipeline manifests
│           ├── tasks/               # Task manifests
│           ├── triggers/            # TriggerTemplates, EventListeners
│           └── resources/           # ConfigMaps, roles, settings
```

### Directory Organization

**Pipelines Directory** (`charts/pipelines-library/templates/pipelines/`):

- One file per pipeline
- Filename matches `metadata.name` field
- Helm-templated YAML manifests
- Feature flags for conditional deployment

**Tasks Directory** (`charts/pipelines-library/templates/tasks/`):

- One file per task
- Filename matches `metadata.name` field
- Helm-templated YAML manifests
- Feature flags for optional steps

**Scripts Directory** (`charts/pipelines-library/scripts/`):

- Helper scripts for maintenance (e.g., `tekton-prune.sh`)
- Primary automation tool is at `hack/onboarding-component.sh`

## Naming Conventions

### Pipeline Naming

**Build Pipelines**:

- Pattern: `<vcs>-<language>-<framework>-app-build-default`
- Versioning suffixes:
  - `default` - Currently active (standard)
  - `edp` - Reserved for extended patterns
- Examples:
  - `github-java-springboot-app-build-default`
  - `gitlab-python-fastapi-app-build-default`
  - `bitbucket-javascript-npm-app-build-default`

**Review Pipelines**:

- Pattern: `<vcs>-<language>-<framework>-app-review`
- No versioning suffix for review pipelines
- Examples:
  - `github-java-springboot-app-review`
  - `gitlab-python-fastapi-app-review`
  - `bitbucket-javascript-npm-app-review`

**Naming Rules**:

- VCS: `github`, `gitlab`, `bitbucket`
- Language: `java`, `python`, `javascript`, `go`, etc.
- Framework: `springboot`, `fastapi`, `npm`, `gradle`, etc.
- All lowercase, hyphen-separated
- Filename must match `metadata.name` exactly (without `.yaml`)

### Task Naming

**Format**: kebab-case (lowercase with hyphens)

**Examples**:

- `ansible-run`
- `maven-build`
- `terraform-apply`
- `docker-build-push`
- `helm-lint`
- `sonarqube-scan`

**Rules**:

- Descriptive and concise
- Indicates primary action
- Filename matches `metadata.name`
- No version suffixes on tasks

### Task Categories

The repository contains **88 tasks** organized into **6 functional categories**:

1. **Language-Specific Tasks** - Compile, build, test for specific languages
   - Maven, Gradle, npm, pnpm, Python, Go, C, Ansible, Dotnet, Groovy

2. **Quality & Analysis Tasks** - Code quality, linting, scanning
   - Sonar, CodeNarc, helm-lint, docker-lint, docker-scan

3. **VCS & Commit Tasks** - Git operations and status reporting
   - git-clone, git-cli, github-set-status, gitlab-set-status, bitbucket-set-status, gerrit-notify

4. **Build & Deployment Tasks** - Container builds and application deployment
   - container-build (Kaniko), helm-push, helm-docs, deploy-helm, deploy-kustomize, update-cbis

5. **Infrastructure & Utility Tasks** - Infrastructure management and versioning
   - terraform, ansible-run, get-version, get-cache, save-cache, ecr-to-docker

6. **Specialized Tasks** - Init, validation, autotests
   - init-values, check-helm-chart-name, run-autotests, getversion variants

For guidance on finding task details, see **`references/tasks.md`** (read when you need to explore task files — it explains the directory structure and how to extract params/workspaces from actual task YAML files).

## Onboarding Script Usage

### Script Location

Repository: <https://github.com/epam/edp-tekton>

Location within repository:

```bash
./hack/onboarding-component.sh
```

**IMPORTANT**: This script is part of the EDP-Tekton repository and must be executed from within a clone of that repository.

### Task Onboarding

**Command**:

```bash
./hack/onboarding-component.sh \
  --type task \
  -n <task-name>
```

**Examples**:

```bash
# Create ansible-run task
./hack/onboarding-component.sh --type task -n ansible-run

# Create maven-build task
./hack/onboarding-component.sh --type task -n maven-build
```

**Generated Output**:

- File: `./charts/pipelines-library/templates/tasks/<task-name>.yaml`
- Helm-templated Tekton Task manifest
- Includes `apiVersion: tekton.dev/v1`, `kind: Task`
- Pre-configured metadata, labels, and basic structure

### Pipeline Onboarding

**Build Pipeline Command**:

```bash
./hack/onboarding-component.sh \
  --type build-pipeline \
  -n <vcs>-<language>-<framework>-app-build-default \
  --vcs <vcs>
```

**Review Pipeline Command**:

```bash
./hack/onboarding-component.sh \
  --type review-pipeline \
  -n <vcs>-<language>-<framework>-app-review \
  --vcs <vcs>
```

**Complete Example** (GitLab Python FastAPI):

```bash
# Create build pipeline
./hack/onboarding-component.sh \
  --type build-pipeline \
  -n gitlab-python-fastapi-app-build-default \
  --vcs gitlab

# Create review pipeline
./hack/onboarding-component.sh \
  --type review-pipeline \
  -n gitlab-python-fastapi-app-review \
  --vcs gitlab
```

**Generated Output**:

- Build file: `./charts/pipelines-library/templates/pipelines/<name>-build-default.yaml`
- Review file: `./charts/pipelines-library/templates/pipelines/<name>-review.yaml`
- Both include `apiVersion: tekton.dev/v1`, `kind: Pipeline`
- Pre-configured with VCS-specific parameters

## Helm Chart Structure

### Configuration Pattern

**Values Organization** (`values.yaml`):

- Configuration uses dependency chart name as top-level key
- Custom pipeline/task logic in respective values sections
- Feature flags for conditional deployment

**Helper Templates** (`charts/common-library/`):

- Shared template fragments
- Common metadata patterns
- Reusable label definitions

### Manifest Requirements

**All Tekton Resources**:

- Use stable API versions (`tekton.dev/v1`)
- Include proper labels and annotations
- Define workspaces where needed
- Use `runAfter` for task dependencies
- Apply feature flags for toggle-able functionality

**Metadata Standards**:

```yaml
metadata:
  name: resource-name
  labels:
    app.kubernetes.io/name: {{ .Chart.Name }}
    app.kubernetes.io/instance: {{ .Release.Name }}
    # Additional resource-specific labels
  annotations:
    description: "Resource description"
    # Additional annotations
```

For chart validation, testing, and version management, see **`references/standards.md`**.

## Workspace Patterns

All pipelines in the repository use a consistent workspace organization pattern.

### Primary Workspaces

```yaml
workspaces:
  - name: shared-workspace    # Shared across all tasks
  - name: ssh-creds          # Git credentials
```

### Workspace Subdirectories

The `shared-workspace` is organized with subdirectories:

- **`source/`** - Git repository source code (git-clone output)
- **`cache/`** - Artifact cache (Maven .m2, npm cache, Go modules, etc.)

### Usage in Tasks

```yaml
workspaces:
  - name: source
    workspace: shared-workspace
    subPath: source           # References the source/ subdirectory
```

This pattern ensures:

- Clean separation between source code and cache
- Efficient cache reuse across pipeline runs
- Consistent directory structure across all pipelines

### Ephemeral Workspace Management

- Each PipelineRun creates its own PVC (Persistent Volume Claim)
- Size configured via `.Values.tekton.workspaceSize` (default: `5Gi`)
- PVC automatically cleaned up after pipeline completion
- Workspace is NOT shared between different PipelineRuns

## VCS Provider Support

The repository supports **4 VCS providers**: GitHub, GitLab, Gerrit, and BitBucket. Each provider has its own trigger files, interceptor chain, and status reporting task.

For VCS-specific trigger architecture, interceptor chains, webhook configuration, parameter enrichment, and per-provider patterns, see the **edp-tekton-triggers** skill.

## Supported Languages & Frameworks

The repository supports 10+ languages with pipelines for multiple VCS providers. To see the current list of supported languages, frameworks, and their enabled/disabled status, explore `charts/pipelines-library/values.yaml` — look for the `deployableResources` section which has a clear hierarchical structure (e.g., `java: {java17: true, java21: true}`, `go: {beego: true, gin: true}`).

For adding new language support, see **`references/languages.md`** (read when onboarding a new language — it explains the process step by step).

For pipeline composition patterns (build vs review flow) and validation commands, see **`references/standards.md`** (read when creating new pipelines — for YAML structure, read existing pipeline files in the repo as authoritative reference).

## Validation Requirements

### Pre-Onboarding Validation

**For Tasks**:

1. Verify `./charts/pipelines-library/templates/tasks/` directory exists
2. Confirm onboarding script exists and is executable
3. Validate task name follows kebab-case convention
4. Check for naming conflicts with existing tasks

**For Pipelines**:

1. Verify `./charts/pipelines-library/templates/pipelines/` directory exists
2. Confirm onboarding script exists
3. Validate input parameters (vcs, language, framework)
4. Verify naming pattern compliance
5. Check for conflicts with existing pipelines

### Post-Onboarding Validation

**File Existence**:

- Confirm generated files exist at expected paths
- Verify correct directory placement

**Manifest Validation**:

```bash
# Validate Helm template syntax
helm template charts/pipelines-library | yq

# Lint YAML files
yamllint .
```

**Content Validation**:

- File contains `apiVersion: tekton.dev/v1`
- File contains `kind: Task` or `kind: Pipeline`
- `metadata.name` matches filename (without `.yaml`)
- Proper Helm template wrapping present
- Labels and annotations included

## Modification Guidelines

### Non-Destructive Updates

**Allowed Changes** (after onboarding script generation):

- Update parameter descriptions
- Update default values
- Update metadata (labels, annotations, descriptions)
- Add new parameters
- Add new steps or tasks
- Add new workspaces

**Forbidden Changes**:

- Removing parameters created by script
- Removing steps or tasks created by script
- Removing or restructuring core sections
- Changing fundamental resource structure

### Incremental Development

- Make changes based on existing pipeline/task patterns
- Study similar resources before creating new ones
- Preserve onboarding script-generated structure
- Document custom additions clearly

For testing, maintenance, chart validation, and common task composition patterns, see **`references/standards.md`**.

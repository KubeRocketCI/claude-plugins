---
name: KRCI EDP-Tekton Standards
description: This skill should be used when the user asks to "onboard Tekton pipeline", "create new task", "add pipeline to EDP-Tekton", "follow pipeline naming conventions", "configure Helm chart for Tekton", "use onboarding script", or mentions Tekton best practices, EDP-Tekton repository structure, pipeline/task organization, Helm templating, KRCI standards, or automation workflows.
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

Repository: <https://github.com/epam/edp-tekton>

```text
edp-tekton/
├── charts/
│   ├── common-library/              # Shared Helm template fragments
│   │   ├── Chart.yaml
│   │   ├── values.yaml
│   │   └── templates/
│   └── pipelines-library/           # Main Tekton resources
│       ├── Chart.yaml
│       ├── values.yaml
│       ├── scripts/
│       │   ├── onboarding-component.sh    # Primary automation tool
│       │   └── tekton-prune.sh
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

- `onboarding-component.sh` - Primary automation tool
- Helper scripts for maintenance

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

## Onboarding Script Usage

### Script Location

Repository: <https://github.com/epam/edp-tekton>

Location within repository:

```bash
./charts/pipelines-library/scripts/onboarding-component.sh
```

**IMPORTANT**: This script is part of the EDP-Tekton repository and must be executed from within a clone of that repository.

### Task Onboarding

**Command**:

```bash
./charts/pipelines-library/scripts/onboarding-component.sh \
  --type task \
  -n <task-name>
```

**Examples**:

```bash
# Create ansible-run task
./charts/pipelines-library/scripts/onboarding-component.sh --type task -n ansible-run

# Create maven-build task
./charts/pipelines-library/scripts/onboarding-component.sh --type task -n maven-build
```

**Generated Output**:

- File: `./charts/pipelines-library/templates/tasks/<task-name>.yaml`
- Helm-templated Tekton Task manifest
- Includes `apiVersion: tekton.dev/v1`, `kind: Task`
- Pre-configured metadata, labels, and basic structure

### Pipeline Onboarding

**Build Pipeline Command**:

```bash
./charts/pipelines-library/scripts/onboarding-component.sh \
  --type build-pipeline \
  -n <vcs>-<language>-<framework>-app-build-default \
  --vcs <vcs>
```

**Review Pipeline Command**:

```bash
./charts/pipelines-library/scripts/onboarding-component.sh \
  --type review-pipeline \
  -n <vcs>-<language>-<framework>-app-review \
  --vcs <vcs>
```

**Complete Example** (GitLab Python FastAPI):

```bash
# Create build pipeline
./charts/pipelines-library/scripts/onboarding-component.sh \
  --type build-pipeline \
  -n gitlab-python-fastapi-app-build-default \
  --vcs gitlab

# Create review pipeline
./charts/pipelines-library/scripts/onboarding-component.sh \
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

## Tekton Pipelines Best Practices

### General Principles

- Declarative configuration aligned with GitOps
- Resource limits and requests defined
- RBAC with least privilege principle
- Namespace isolation for pipelines
- Labels and annotations for discovery
- Secret management best practices

### Pipeline Structure

**Components**:

- Task definitions with proper ordering
- Workspace declarations for data sharing
- Parameter definitions with defaults
- `runAfter` policies for dependencies
- Conditional execution with `when` clauses

**Example Pattern**:

```yaml
apiVersion: tekton.dev/v1
kind: Pipeline
metadata:
  name: github-java-springboot-app-build-default
spec:
  params:
    - name: git-source-url
      type: string
    - name: git-source-revision
      type: string
      default: "main"
  workspaces:
    - name: shared-workspace
  tasks:
    - name: fetch-repository
      taskRef:
        name: git-clone
      workspaces:
        - name: output
          workspace: shared-workspace
      params:
        - name: url
          value: $(params.git-source-url)
    - name: build
      taskRef:
        name: maven-build
      runAfter:
        - fetch-repository
      workspaces:
        - name: source
          workspace: shared-workspace
```

### Task Structure

**Components**:

- Step definitions with container images
- Resource requests and limits
- Workspace declarations
- Parameter inputs
- Result outputs

**Example Pattern**:

```yaml
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: maven-build
spec:
  params:
    - name: goals
      type: array
      default: ["clean", "package"]
  workspaces:
    - name: source
      description: The workspace consisting of maven project
  steps:
    - name: mvn-build
      image: maven:3.8-openjdk-11
      workingDir: $(workspaces.source.path)
      command:
        - mvn
      args:
        - "$(params.goals[*])"
      resources:
        requests:
          memory: "1Gi"
          cpu: "500m"
        limits:
          memory: "2Gi"
          cpu: "1000m"
```

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

## Testing and Maintenance

### Chart Validation

**Linting**:

```bash
# Helm chart lint
helm lint charts/pipelines-library

# YAML lint
yamllint charts/pipelines-library/templates/
```

**Template Rendering**:

```bash
# Render templates to verify output
helm template charts/pipelines-library

# Render and validate with yq
helm template charts/pipelines-library | yq
```

**Pytest Tests**:

```bash
# Run tests (if pytest framework configured)
pytest charts/pipelines-library/tests
```

### Version Management

- Follow semantic versioning for chart versions
- Update `Chart.yaml` version with changes
- Document breaking changes in CHANGELOG
- Define dependencies clearly in `Chart.yaml`

### Update Process

1. Review upstream changes via changelogs
2. Validate using linting and tests
3. Increment chart version following semver
4. Conduct diff analysis for breaking changes
5. Plan rollback strategies

## Additional Resources

For complete standards reference including detailed Helm chart patterns, security practices, and operational guidelines, see **`references/standards.md`**.

## Quick Reference

**Task Creation**:

```bash
./charts/pipelines-library/scripts/onboarding-component.sh --type task -n <name>
```

**Pipeline Creation** (both build and review):

```bash
./charts/pipelines-library/scripts/onboarding-component.sh \
  --type build-pipeline -n <vcs>-<lang>-<framework>-app-build-default --vcs <vcs>

./charts/pipelines-library/scripts/onboarding-component.sh \
  --type review-pipeline -n <vcs>-<lang>-<framework>-app-review --vcs <vcs>
```

**Validation**:

```bash
helm template charts/pipelines-library | yq
yamllint .
```

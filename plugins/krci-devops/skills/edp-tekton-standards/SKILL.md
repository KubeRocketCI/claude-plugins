---
name: KRCI EDP-Tekton Standards
description: This skill should be used when the user asks to "onboard Tekton pipeline", "create new task", "add pipeline to EDP-Tekton", "follow pipeline naming conventions", "configure Helm chart for Tekton", "use onboarding script", "configure Tekton workspaces", "check supported languages", or mentions Tekton best practices, EDP-Tekton repository structure, pipeline/task organization, Helm templating, KRCI standards, or automation workflows.
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

For a complete task catalog with descriptions, see **`references/tasks.md`**.

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

For chart validation, testing, and version management, see `references/standards.md`.

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

## VCS Provider Differences

The repository supports **4 VCS providers**, each with specific characteristics:

| Aspect | GitHub | GitLab | Gerrit | BitBucket |
|--------|--------|--------|--------|-----------|
| **Build Event Filter** | `merged == true` | `action: merge` | `status: NEW` | `pullrequest:fulfilled` |
| **Interceptor Type** | ClusterInterceptor | ClusterInterceptor | CEL only | Custom ClusterInterceptor |
| **Secret Name** | `ci-github` | `ci-gitlab` | `ci-gerrit` | `ci-bitbucket` |
| **Status Reporting** | `github-set-status` | `gitlab-set-status` | `gerrit-notify` | `bitbucket-set-status` |
| **Comment Triggering** | `/recheck`, `/ok-to-test` | `/recheck`, `/ok-to-test` | `recheck` comment | Not supported |

### Parameter Enrichment

The EDP Interceptor enriches webhook payloads with Codebase metadata:

```
VCS Webhook → EDP Interceptor → Enriched Extensions
    ↓
TriggerBinding extracts parameters:
  - body.* (VCS-specific webhook data)
  - extensions.* (EDP-enriched metadata)
    ↓
TriggerTemplate creates PipelineRun with:
  - Dynamic pipeline name from extensions.pipelines.{type}
  - Labels: codebase, pipelinetype, codebasebranch
  - Parameters: git-source-url, CODEBASE_NAME, etc.
```

**Critical Extensions Parameters**:

- `extensions.codebase` - Codebase resource name
- `extensions.codebasebranch` - CodebaseBranch resource name
- `extensions.pipelines.build` - Build pipeline name (dynamic)
- `extensions.pipelines.review` - Review pipeline name (dynamic)
- `extensions.pullRequest.*` - Normalized PR/MR metadata

For VCS-specific trigger patterns, load the **edp-tekton-triggers** skill which contains per-VCS reference files.

## Supported Languages & Frameworks

The repository contains **394 pipeline files** supporting **10+ languages**:

- **Java**: java17, java21, java25 (Maven & Gradle)
- **JavaScript/TypeScript**: npm, pnpm (angular, antora, express, next, react, vue)
- **Python**: python3.8, flask, fastapi, ansible
- **Go**: beego, gin, operatorsdk
- **C/C++**: cmake, make
- **C#/.NET**: dotnet3.1, dotnet6.0
- **Others**: Groovy, OPA, Terraform, Docker, Helm, RPM, Autotests, CD, Security, GitOps

For complete language and framework details, see **`references/languages.md`**.

For detailed pipeline and task YAML structure examples, composition patterns, and best practices, see **`references/standards.md`**.

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

For testing, maintenance, chart validation, quick reference commands, and common task composition patterns, see **`references/standards.md`**.

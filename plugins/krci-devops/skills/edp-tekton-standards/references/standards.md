# Tekton Pipelines & Tasks Standards

Complete reference for EDP-Tekton repository standards, patterns, and operational practices.

## General Principles

- The repository follows Tekton Pipelines and Tasks best practices aimed at reliability and maintainability.
- Configurations are maintained in a declarative manner aligned with GitOps principles.
- Pipeline and task configurations are organized separately from deployment configurations.
- Changes to pipelines and tasks are validated through testing before deployment to ensure stability.

---

## Tekton Pipelines Overview

- Resource compatibility is considered to maintain smooth operation.
- Resource limits and requests are defined for Tekton workloads to optimize performance and resource usage.
- Security practices include the application of RBAC with least privilege and regular auditing of roles.
- Namespaces are used to isolate pipelines and tasks.
- Labels and annotations assist in resource organization and discovery.
- Secret management follows best practices to avoid exposing sensitive information directly.

---

## Helm Chart Structure for Tekton Components

The repository contains Helm charts organized to support Tekton components effectively:

- Configuration values are structured with the dependency chart name as a top-level key in `values.yaml`.
- Custom logic and configuration related to pipelines and tasks reside within their respective `values.yaml` files.
- Shared helper templates are located in `charts/common-library/`.
- Pipelines, tasks, triggers, and supporting resources are organized under `charts/pipelines-library/templates/` with subdirectories for each resource type: `pipelines`, `tasks`, `triggers`, and `resources`.
- Scripts for onboarding new pipelines and tasks, as well as maintenance tasks, are stored in `charts/pipelines-library/scripts/`.
- Documentation including `README.md` and `Chart.yaml` files are maintained and updated with each chart version.
- Semantic versioning is followed for chart versions, with dependencies clearly defined in `Chart.yaml`.

---

## Maintaining and Updating Tekton Charts

- Updates involve reviewing upstream changes through changelogs.
- Charts are validated using linting and pytest-based tests located under `charts/pipelines-library/tests`.
- Chart versions are incremented following semantic versioning principles.
- Diff analysis is conducted prior to applying updates to identify potential breaking changes.
- Rollback strategies are considered to manage deployment issues effectively.

---

## Repository Structure & Files

See the repository layout in the core EDP-Tekton Standards skill for the complete directory tree.

- The onboarding script located at `hack/onboarding-component.sh` is used to add new pipelines and tasks in line with the repository's structure.

### Pipelines

The `pipelines/` directory contains Tekton Pipeline manifests. Pipeline manifests are named to correspond with their `metadata.name` fields. The pipelines include definitions for tasks, workspaces if applicable, and use `runAfter` policies to establish task execution order. Feature flags may be used within pipeline definitions to enable or disable pipelines.

- Two versioning strategies are used for build pipelines:
  - *default*: currently in use
  - *edp*: reserved for extended patterns

### Tasks

The `tasks/` directory holds Tekton Task manifests. Task filenames align with their `metadata.name` fields. Task manifests define steps, resource requests and limits, and workspace declarations. Feature flags can be incorporated to adjust task behavior or toggle optional steps.

### Triggers

The `triggers/` directory includes Tekton TriggerTemplates, TriggerBindings, and EventListeners. These resources follow consistent naming and structuring conventions and include annotations and labels to support resource discovery and management.

### Resources

The `resources/` directory contains supporting resource definitions (e.g., ConfigMaps, roles, settings). Naming conventions and metadata are organized to support clarity and maintainability.

---

## General Standards for All Manifests

- Manifests throughout the repository use stable API versions.
- Labels and annotations are applied to aid resource management and tracking.
- Workspaces and `runAfter` policies are consistently used to manage dependencies and data sharing between tasks.
- Naming conventions and generation flows align with the Tekton standards documentation.
- Validation and testing are part of the workflow to improve reliability.
- Feature flags provide dynamic control over functionality without requiring manifest changes.

---

## Pipeline Structure Example

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

## Task Structure Example

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

---

## Common Task Composition Patterns

Understanding how tasks are composed into pipelines helps in creating effective automation workflows.

**Build Pipeline Pattern** (for merged commits):

```text
init-values → get-version → get-cache
    ↓
[Language Tasks: compile → test → sonar]
    ↓
push-artifact (Maven/npm/PyPI)
    ↓
container-build (Kaniko) → save-cache → git-tag → update-cbis
    ↓
finally: report-status (JIRA, VCS)
```

**Review Pipeline Pattern** (for PRs/MRs):

```text
init → get-cache
    ↓
[Language Tasks: compile → test → sonar]
    ↓
docker-lint → helm-lint → save-cache
    ↓
finally: set-review-status (success/failure to VCS)
```

**Key Differences**:

| Aspect | Build Pipeline | Review Pipeline |
|--------|---------------|-----------------|
| Trigger | Merge to branch | PR/MR creation or update |
| Versioning | `get-version` sets release version | No versioning |
| Artifact Push | Pushes to registry | No push (validation only) |
| Container Build | Builds and pushes image | Skipped |
| Git Operations | Creates tag, updates CodebaseBranch | No git modifications |
| Status Reporting | JIRA ticket update | VCS status update |

**Task Ordering with runAfter**:

```yaml
tasks:
  - name: init-values
  - name: get-version
    runAfter: [init-values]
  - name: compile
    runAfter: [get-version]
  - name: test
    runAfter: [compile]
```

---

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

---

## Quick Reference

**Task Creation**:

```bash
./hack/onboarding-component.sh --type task -n <name>
```

**Pipeline Creation** (both build and review):

```bash
./hack/onboarding-component.sh \
  --type build-pipeline -n <vcs>-<lang>-<framework>-app-build-default --vcs <vcs>

./hack/onboarding-component.sh \
  --type review-pipeline -n <vcs>-<lang>-<framework>-app-review --vcs <vcs>
```

**Validation**:

```bash
helm template charts/pipelines-library | yq
yamllint .
```

This structure and approach support maintainability, scalability, and consistency across all Tekton pipelines and tasks within the repository.

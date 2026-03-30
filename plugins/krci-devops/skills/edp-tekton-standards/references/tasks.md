# Task Discovery Guide

Instead of maintaining a static task catalog, explore the actual repository to find current task definitions.

## Where to Find Tasks

```text
charts/pipelines-library/templates/tasks/
├── *.yaml                    # Top-level tasks (maven.yaml, go.yaml, npm.yaml, etc.)
└── <category>/               # Organized subdirectories
    ├── cd/                   # Deployment tasks
    ├── sonar/                # SonarQube scanning variants
    ├── getversion/           # Version strategies (default, edp, semver)
    ├── helm-libraries/       # Helm library tasks
    ├── autotests/            # Test runner tasks
    └── gitops/               # GitOps tasks
```

## How to Extract Task Details

Each `.yaml` file contains a Helm-wrapped Tekton Task. The structure is consistent:

```yaml
{{ if .Values.pipelines.deployableResources.tasks }}
apiVersion: tekton.dev/v1
kind: Task
metadata:
  name: <task-name>            # Always matches filename
spec:
  params:                      # Input parameters with defaults
    - name: PARAM_NAME
      type: string
      default: "value"
  workspaces:                  # Required workspaces
    - name: source
  steps:                       # Execution steps
    - name: step-name
      image: <container-image>
      script: |
        ...
{{ end }}
```

Ignore the outer `{{ if ... }}` Helm conditional — it's a feature flag wrapper. The core Tekton structure inside is standard.

## Common Exploration Commands

```bash
# List all task files
find charts/pipelines-library/templates/tasks/ -name "*.yaml" | sort

# Find a specific task by name
grep -rl "name: maven" charts/pipelines-library/templates/tasks/

# Extract params from a task
grep -A2 "name:" charts/pipelines-library/templates/tasks/maven.yaml | head -20

# See which tasks a pipeline references
grep "taskRef" charts/pipelines-library/templates/pipelines/java/maven/*.yaml
```

## Task Categories

Tasks are organized into 6 functional areas. Rather than listing them all, explore each area:

1. **Language-Specific** — Top-level files: `maven.yaml`, `gradle.yaml`, `npm.yaml`, `go.yaml`, `python.yaml`, `dotnet.yaml`, `c.yaml`, `groovy.yaml`
2. **Quality & Analysis** — `sonar/` subdirectory + `helm-lint.yaml`, `docker-lint.yaml`
3. **VCS & Status** — `git-clone.yaml`, `github-set-status.yaml`, `gitlab-set-status.yaml`, etc.
4. **Build & Deploy** — `kaniko.yaml`/`buildkit.yaml`, `helm-push.yaml`, `deploy-helm.yaml`
5. **Infrastructure** — `terraform.yaml`, `get-cache.yaml`, `save-cache.yaml`, `getversion/`
6. **Specialized** — `init-values.yaml`, `run-autotests.yaml`, `cd/` subdirectory

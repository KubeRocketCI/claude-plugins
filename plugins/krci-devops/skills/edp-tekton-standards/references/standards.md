# Pipeline Composition Patterns

Reference for how tasks compose into pipelines and validation commands. For YAML structure, read existing pipeline/task files in the repository — they are the authoritative source.

## Build Pipeline Flow (Merged Commits)

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

## Review Pipeline Flow (PRs/MRs)

```text
init → get-cache
    ↓
[Language Tasks: compile → test → sonar]
    ↓
docker-lint → helm-lint → save-cache
    ↓
finally: set-review-status (success/failure to VCS)
```

## Key Differences

| Aspect | Build Pipeline | Review Pipeline |
|--------|---------------|-----------------|
| Trigger | Merge to branch | PR/MR creation or update |
| Versioning | `get-version` sets release version | No versioning |
| Artifact Push | Pushes to registry | No push (validation only) |
| Container Build | Builds and pushes image | Skipped |
| Git Operations | Creates tag, updates CodebaseBranch | No git modifications |
| Status Reporting | JIRA ticket update | VCS status update |

## Validation Commands

```bash
# Helm chart lint
helm lint charts/pipelines-library

# Render templates to verify output
helm template charts/pipelines-library | yq

# YAML lint
yamllint charts/pipelines-library/templates/

# Run pytest tests
pytest charts/pipelines-library/tests
```

## Exploring Patterns in the Repo

To learn the current YAML patterns, read existing files rather than relying on static examples:

```bash
# See a complete build pipeline
cat charts/pipelines-library/templates/pipelines/java/maven/github-build-default.yaml

# See a complete review pipeline
cat charts/pipelines-library/templates/pipelines/java/maven/github-review.yaml

# See a complete task
cat charts/pipelines-library/templates/tasks/maven.yaml

# See task ordering in a pipeline
grep -E "runAfter|taskRef" charts/pipelines-library/templates/pipelines/go/gin/github-build-default.yaml
```

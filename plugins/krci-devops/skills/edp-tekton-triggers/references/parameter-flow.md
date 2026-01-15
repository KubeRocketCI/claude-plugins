# Parameter Flow: Webhook to PipelineRun

Complete mapping of how parameters flow from VCS webhook through interceptors, bindings, and templates to PipelineRun.

## Flow Diagram

```
VCS Webhook (POST)
    ↓
EventListener receives
    ↓
Trigger matches event
    ↓
Interceptor Chain:
  1. VCS Validation → body.* (parsed webhook)
  2. CEL Filter → event filtering
  3. EDP Enrichment → extensions.* (Codebase metadata)
    ↓
TriggerBinding extracts parameters
  - From body.*
  - From extensions.*
    ↓
TriggerTemplate creates PipelineRun
  - Uses $(tt.params.*)
    ↓
PipelineRun executes
  - Uses $(params.*)
```

## Parameter Sources

### Source 1: Webhook Body (`body.*`)

VCS-specific fields from webhook payload.

| Parameter Use | GitHub | GitLab | Gerrit | BitBucket |
|---------------|--------|--------|--------|-----------|
| **Repository URL** | `body.repository.clone_url` | `body.project.git_http_url` | `body.change.project` | `body.repository.links.clone[0].href` |
| **Branch** | `body.pull_request.base.ref` | `body.object_attributes.target_branch` | `body.change.branch` | `body.pullrequest.destination.branch.name` |
| **Commit SHA** | `body.pull_request.merge_commit_sha` | `body.object_attributes.merge_commit_sha` | `body.patchSet.revision` | `body.pullrequest.source.commit.hash` |
| **PR/MR Number** | `body.pull_request.number` | `body.object_attributes.iid` | `body.change.number` | `body.pullrequest.id` |
| **Source Branch** | `body.pull_request.head.ref` | `body.object_attributes.source_branch` | `body.patchSet.ref` | `body.pullrequest.source.branch.name` |

### Source 2: EDP Extensions (`extensions.*`)

EDP Interceptor-enriched Codebase metadata.

| Parameter | Value | Description |
|-----------|-------|-------------|
| `extensions.codebase` | `my-app` | Codebase CR name |
| `extensions.codebasebranch` | `my-app-main` | CodebaseBranch CR name |
| `extensions.pipelines.build` | `github-java-springboot-app-build-default` | Build pipeline name (DYNAMIC) |
| `extensions.pipelines.review` | `github-java-springboot-app-review` | Review pipeline name (DYNAMIC) |
| `extensions.pullRequest.number` | `"123"` | Normalized PR/MR number |
| `extensions.pullRequest.headRef` | `feature-branch` | PR/MR source branch |
| `extensions.pullRequest.headSha` | `abc123...` | PR/MR source commit |

## Build Pipeline Parameters

### TriggerBinding → TriggerTemplate

| TriggerBinding Param | Extracted From | TriggerTemplate Usage |
|---------------------|----------------|----------------------|
| `git-source-url` | `body.repository.clone_url` | `$(tt.params.git-source-url)` |
| `git-source-revision` | `body.pull_request.base.ref` | `$(tt.params.git-source-revision)` |
| `gitsha` | `body.pull_request.merge_commit_sha` | `$(tt.params.gitsha)` |
| `changeNumber` | `body.pull_request.number` | `$(tt.params.changeNumber)` |
| `CODEBASE_NAME` | `extensions.codebase` | `$(tt.params.CODEBASE_NAME)` |
| `CODEBASEBRANCH_NAME` | `extensions.codebasebranch` | `$(tt.params.CODEBASEBRANCH_NAME)` |
| `PIPELINE_NAME` | `extensions.pipelines.build` | `$(tt.params.PIPELINE_NAME)` → **DYNAMIC pipeline ref** |

### TriggerTemplate → PipelineRun

```yaml
# In TriggerTemplate
spec:
  pipelineRef:
    name: $(tt.params.PIPELINE_NAME)    # From extensions.pipelines.build
  params:
    - name: git-source-url
      value: $(tt.params.git-source-url)
    - name: CODEBASE_NAME
      value: $(tt.params.CODEBASE_NAME)
    # ...
```

### PipelineRun → Pipeline Tasks

```yaml
# PipelineRun created with:
spec:
  params:
    - name: git-source-url
      value: "https://github.com/org/repo.git"
    - name: CODEBASE_NAME
      value: "my-app"
```

Tasks reference: `$(params.git-source-url)`, `$(params.CODEBASE_NAME)`

## Review Pipeline Parameters

### TriggerBinding → TriggerTemplate

| Trigger Binding Param | Extracted From | TriggerTemplate Usage |
|----------------------|----------------|----------------------|
| `git-source-url` | `body.pull_request.head.repo.clone_url` | `$(tt.params.git-source-url)` |
| `git-source-revision` | `body.pull_request.head.ref` | `$(tt.params.git-source-revision)` |
| `git-refspec` | `body.pull_request.head.ref:...` | `$(tt.params.git-refspec)` |
| `targetBranch` | `body.pull_request.base.ref` | `$(tt.params.targetBranch)` |
| `changeNumber` | `body.pull_request.number` | `$(tt.params.changeNumber)` |
| `gitsha` | `body.pull_request.head.sha` | `$(tt.params.gitsha)` |
| `PIPELINE_NAME` | `extensions.pipelines.review` | `$(tt.params.PIPELINE_NAME)` → **DYNAMIC pipeline ref** |

## Critical Parameter: PIPELINE_NAME

### Why Dynamic?

Different codebases may use different pipeline implementations:

- Java 17 app: `github-maven-java17-app-build-default`
- Python app: `github-python-fastapi-app-build-default`
- Go app: `github-go-gin-app-build-default`

Pipeline name is stored in `CodebaseBranch.Spec.Pipelines.{type}` and can be customized per codebase.

### Flow

```
1. VCS Webhook arrives
2. EDP Interceptor:
   - Finds Codebase CR (matches GitUrlPath)
   - Finds CodebaseBranch CR (matches branch)
   - Reads CodebaseBranch.Spec.Pipelines.Build
   - Returns: extensions.pipelines.build = "github-maven-java17-app-build-default"
3. TriggerBinding extracts:
   - name: PIPELINE_NAME
     value: $(extensions.pipelines.build)
4. TriggerTemplate creates PipelineRun:
   spec:
     pipelineRef:
       name: $(tt.params.PIPELINE_NAME)
5. PipelineRun references correct pipeline for that codebase
```

### Anti-Pattern (DO NOT DO)

```yaml
# WRONG - Hardcoded pipeline name
spec:
  pipelineRef:
    name: github-java-springboot-app-build-default    # ❌ Hardcoded

# RIGHT - Dynamic pipeline name
spec:
  pipelineRef:
    name: $(tt.params.PIPELINE_NAME)    # From CodebaseBranch
```

## Complete Example: GitHub PR Merged

### 1. Webhook Payload (Simplified)

```json
{
  "action": "closed",
  "pull_request": {
    "merged": true,
    "number": 42,
    "base": {"ref": "main"},
    "merge_commit_sha": "abc123"
  },
  "repository": {
    "clone_url": "https://github.com/myorg/myapp.git"
  }
}
```

### 2. After EDP Interceptor

Extensions added:

```json
{
  "extensions": {
    "codebase": "myapp",
    "codebasebranch": "myapp-main",
    "pipelines": {
      "build": "github-python-fastapi-app-build-default"
    }
  }
}
```

### 3. TriggerBinding Extracts

```yaml
params:
  - name: git-source-url
    value: "https://github.com/myorg/myapp.git"
  - name: git-source-revision
    value: "main"
  - name: gitsha
    value: "abc123"
  - name: changeNumber
    value: "42"
  - name: CODEBASE_NAME
    value: "myapp"
  - name: CODEBASEBRANCH_NAME
    value: "myapp-main"
  - name: PIPELINE_NAME
    value: "github-python-fastapi-app-build-default"
```

### 4. TriggerTemplate Creates PipelineRun

```yaml
apiVersion: tekton.dev/v1
kind: PipelineRun
metadata:
  generateName: myapp-github-python-fastapi-app-build-default-
  labels:
    app.edp.epam.com/codebase: myapp
    app.edp.epam.com/codebasebranch: myapp-main
    app.edp.epam.com/pipelinetype: build
spec:
  pipelineRef:
    name: github-python-fastapi-app-build-default    # From PIPELINE_NAME
  params:
    - name: git-source-url
      value: "https://github.com/myorg/myapp.git"
    - name: git-source-revision
      value: "main"
    - name: gitsha
      value: "abc123"
    - name: CODEBASE_NAME
      value: "myapp"
```

### 5. Pipeline Executes

Pipeline `github-python-fastapi-app-build-default` runs with parameters, executing tasks like:

- init-values
- get-version
- python (compile, test)
- container-build
- etc.

## Debugging Parameter Flow

### Check EventListener Logs

```bash
kubectl logs -l eventlistener=el-github -n edp
```

Look for:

- Webhook received
- Interceptor execution (VCS validation, CEL filter, EDP enrichment)
- Parameter extraction errors

### Check PipelineRun Parameters

```bash
kubectl get pipelinerun <name> -o yaml | yq '.spec.params'
```

Verify:

- All expected parameters present
- Values are correct (not empty or "")
- PIPELINE_NAME matches expected pipeline

### Check PipelineRef

```bash
kubectl get pipelinerun <name> -o yaml | yq '.spec.pipelineRef.name'
```

Should show dynamic pipeline name from CodebaseBranch, not hardcoded.

## Common Issues

### Issue: Empty Parameters

**Symptom**: Parameter value is `""` or missing

**Cause**: Wrong path in TriggerBinding (VCS payload structure differs)

**Fix**: Check webhook payload structure for your VCS, update binding paths

### Issue: Pipeline Not Found

**Symptom**: `PipelineRun references Pipeline "XYZ" which doesn't exist`

**Cause**:

- PIPELINE_NAME hardcoded incorrectly
- CodebaseBranch.Spec.Pipelines.{type} references non-existent pipeline

**Fix**:

- Ensure TriggerTemplate uses `$(tt.params.PIPELINE_NAME)`
- Check CodebaseBranch CR has correct pipeline name
- Verify pipeline exists: `kubectl get pipeline <name>`

### Issue: Wrong Pipeline Executed

**Symptom**: Build pipeline runs instead of review (or vice versa)

**Cause**: Using wrong extensions parameter

**Fix**:

- Build bindings: Use `$(extensions.pipelines.build)`
- Review bindings: Use `$(extensions.pipelines.review)`

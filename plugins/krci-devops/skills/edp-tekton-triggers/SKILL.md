---
name: KRCI EDP-Tekton Triggers
description: This skill should be used when working with Tekton Triggers, EventListeners, TriggerBindings, TriggerTemplates, webhook integration, VCS event handling, interceptor configuration, or trigger setup for GitHub, GitLab, Gerrit, or BitBucket.
---

# EDP-Tekton Triggers: Webhook-Driven CI/CD

Comprehensive guide to implementing Tekton Triggers for webhook-driven pipeline execution in the EDP-Tekton repository.

## Purpose

Guide implementation of Tekton Triggers that respond to VCS webhooks (GitHub, GitLab, Gerrit, BitBucket) and automatically create PipelineRuns. Covers trigger architecture, interceptor chains, parameter extraction, and VCS-specific patterns.

## Target Repository

**Repository**: <https://github.com/epam/edp-tekton>

**CRITICAL**: All trigger components must be created within the EDP-Tekton repository's trigger structure.

## Trigger Architecture Overview

### The Trigger Flow

```
VCS Webhook → EventListener → Trigger (3 interceptors) → TriggerBinding → TriggerTemplate → PipelineRun
                                    ↓
                         [VCS Validation] → [CEL Filter] → [EDP Enrichment]
```

### Component Responsibilities

**1. EventListener**

- HTTP endpoint that receives VCS webhook POST requests
- Routes events to appropriate Triggers
- Creates a Service (must be exposed via Route/Ingress)
- Runs with `tekton` ServiceAccount

**2. Trigger**

- Matches webhook events using interceptors
- Applies interceptor chain for validation, filtering, enrichment
- References TriggerBinding and TriggerTemplate
- Can have multiple Triggers per EventListener

**3. Interceptor Chain** (3 stages):

**Stage 1 - VCS Validation**:

- **GitHub**: ClusterInterceptor `github` (validates signature, parses payload)
- **GitLab**: ClusterInterceptor `gitlab` (validates token, parses payload)
- **Gerrit**: CEL only (no dedicated interceptor)
- **BitBucket**: Custom ClusterInterceptor (validates webhook)

**Stage 2 - CEL Filter** (Event Filtering):

- Filters events based on conditions
- Build triggers: Check for merged commits
- Review triggers: Check for PR/MR open/update events
- Comment triggers: Check for `/recheck`, `/ok-to-test` comments

**Stage 3 - EDP Enrichment**:

- Queries Kubernetes API for Codebase and CodebaseBranch resources
- Matches webhook repository → Codebase (by `GitUrlPath`)
- Matches git branch → CodebaseBranch (by `BranchName`)
- Adds `extensions.*` parameters with metadata
- **Timeout**: 3 seconds

**4. TriggerBinding**

- Extracts parameters from webhook payload (`body.*`)
- Extracts parameters from EDP enrichment (`extensions.*`)
- Passes parameters to TriggerTemplate

**5. TriggerTemplate**

- Scaffolds PipelineRun resource
- Uses parameters from TriggerBinding
- **Critical**: Uses DYNAMIC pipeline name from `extensions.pipelines.{type}`
- Creates ephemeral workspace PVC
- References VCS secret for git credentials

## Repository Organization

Triggers are organized by VCS provider:

```
charts/pipelines-library/templates/triggers/
├── github/
│   ├── eventlistener.yaml       # EventListener for GitHub
│   ├── trigger-build.yaml       # Trigger for merged commits
│   ├── trigger-review.yaml      # Trigger for PRs
│   ├── triggerbinding-build.yaml
│   ├── triggerbinding-review.yaml
│   ├── tt-build.yaml            # TriggerTemplate for build
│   └── tt-review.yaml           # TriggerTemplate for review
├── gitlab/                       # Same structure for GitLab
├── gerrit/                       # Same structure for Gerrit
├── bitbucket/                    # Same structure for BitBucket
├── cd/                           # Deployment triggers
└── security/                     # Security scanning triggers
```

### Naming Conventions

**EventListener**: `el-{provider}` (e.g., `el-github`, `el-gitlab`)

**Trigger**: `{provider}-{type}` (e.g., `github-build`, `gitlab-review`)

**TriggerBinding**: `{provider}-binding-{type}` (e.g., `github-binding-build`)

**TriggerTemplate**: `{provider}-{type}-template` or `tt-{type}` (e.g., `github-build-template`, `tt-build`)

## Interceptor Chain Details

### Stage 1: VCS Validation Interceptor

Validates webhook authenticity and parses VCS-specific payload.

| Provider | Interceptor Type | Validation Method |
|----------|-----------------|-------------------|
| GitHub | ClusterInterceptor `github` | Signature validation (X-Hub-Signature) |
| GitLab | ClusterInterceptor `gitlab` | Token validation (X-Gitlab-Token) |
| Gerrit | CEL only | No validation (trusted network) |
| BitBucket | Custom ClusterInterceptor | Basic auth or token |

**Configuration Example (GitHub)**:

```yaml
interceptors:
  - ref:
      name: github
    params:
      - name: secretRef
        value:
          secretName: ci-github
          secretKey: token
      - name: eventTypes
        value: ["push", "pull_request"]
```

### Stage 2: CEL Filter Interceptor

Filters webhook events based on conditions.

**Build Pipeline Filters** (merged commits only):

| Provider | CEL Expression |
|----------|----------------|
| GitHub | `body.pull_request.merged == true` |
| GitLab | `body.object_attributes.action == 'merge'` |
| Gerrit | `body.type == 'change-merged'` |
| BitBucket | `body.pullrequest.state == 'FULFILLED'` |

**Review Pipeline Filters** (PR/MR created/updated):

| Provider | CEL Expression |
|----------|----------------|
| GitHub | `body.action in ['opened', 'synchronize', 'reopened']` |
| GitLab | `body.object_attributes.action in ['open', 'update', 'reopen']` |
| Gerrit | `body.type == 'patchset-created'` |
| BitBucket | `body.pullrequest.state in ['OPEN', 'MERGED']` |

**Comment Retriggering** (optional):

Some triggers support re-triggering via PR/MR comments:

| Provider | Comment Pattern | Supported |
|----------|----------------|-----------|
| GitHub | `/recheck`, `/ok-to-test` | Yes |
| GitLab | `/recheck`, `/ok-to-test` | Yes |
| Gerrit | `recheck` | Yes |
| BitBucket | N/A | ❌ No |

**Example (GitHub review with comment)**:

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        (body.action in ['opened', 'synchronize', 'reopened']) ||
        (body.action == 'created' && body.comment.body.matches('/(recheck|ok-to-test)'))
```

### Stage 3: EDP Enrichment Interceptor

Enriches webhook payload with Codebase and CodebaseBranch metadata.

**Interceptor Configuration**:

```yaml
- ref:
    name: edp
  params:
    - name: secretRef
      value:
        secretName: edp-interceptor
        secretKey: token
```

**Enrichment Process**:

1. Extract repository URL from webhook payload
2. Normalize to lowercase (e.g., `github.com/org/repo`)
3. Query Kubernetes for Codebase CR matching `spec.gitUrlPath`
4. Extract branch name from webhook
5. Query Kubernetes for CodebaseBranch CR matching branch
6. Return enriched `extensions.*` parameters

**Extensions Parameters Added**:

| Parameter | Source | Description |
|-----------|--------|-------------|
| `extensions.codebase` | Codebase CR | Codebase resource name |
| `extensions.codebasebranch` | CodebaseBranch CR | CodebaseBranch resource name |
| `extensions.pipelines.build` | CodebaseBranch.Spec | Build pipeline name (DYNAMIC) |
| `extensions.pipelines.review` | CodebaseBranch.Spec | Review pipeline name (DYNAMIC) |
| `extensions.pullRequest.number` | Normalized | PR/MR number (VCS-agnostic) |
| `extensions.pullRequest.headRef` | Normalized | PR/MR source branch |
| `extensions.pullRequest.headSha` | Normalized | PR/MR source commit SHA |

**Critical**: Pipeline names are **DYNAMIC** and come from the CodebaseBranch CR, NOT hardcoded in TriggerTemplate.

## TriggerBinding Patterns

TriggerBinding extracts parameters from two sources:

### Source 1: Webhook Body (`body.*`)

VCS-specific webhook payload fields.

**Common Parameters Extracted**:

- Repository URL: `body.repository.clone_url` (GitHub), `body.project.git_http_url` (GitLab)
- Branch/Ref: `body.ref`, `body.pull_request.base.ref`
- Commit SHA: `body.after`, `body.pull_request.head.sha`
- PR/MR Number: `body.pull_request.number`, `body.object_attributes.iid`

See `references/vcs-{provider}.md` for complete VCS-specific field mappings.

### Source 2: EDP Extensions (`extensions.*`)

EDP Interceptor-enriched parameters.

**Parameters Available**:

```yaml
params:
  - name: CODEBASE_NAME
    value: $(extensions.codebase)
  - name: CODEBASEBRANCH_NAME
    value: $(extensions.codebasebranch)
  - name: PIPELINE_NAME
    value: $(extensions.pipelines.build)    # or .review
  - name: changeNumber
    value: $(extensions.pullRequest.number)
  - name: gitsha
    value: $(extensions.pullRequest.headSha)
```

### Example: GitHub Build Binding

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: github-binding-build
spec:
  params:
    # From webhook body
    - name: git-source-url
      value: $(body.repository.clone_url)
    - name: git-source-revision
      value: $(body.pull_request.base.ref)
    - name: gitsha
      value: $(body.pull_request.merge_commit_sha)

    # From EDP extensions
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: CODEBASEBRANCH_NAME
      value: $(extensions.codebasebranch)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.build)    # DYNAMIC!
```

For complete VCS-specific binding examples, see:

- **GitHub**: `references/vcs-github.md`
- **GitLab**: `references/vcs-gitlab.md`
- **Gerrit**: `references/vcs-gerrit.md`
- **BitBucket**: `references/vcs-bitbucket.md`

## TriggerTemplate Patterns

TriggerTemplate scaffolds PipelineRun resources using parameters from TriggerBinding.

### Template Structure

**1. Metadata with Labels**:

```yaml
metadata:
  generateName: $(tt.params.CODEBASE_NAME)-$(tt.params.PIPELINE_NAME)-
  labels:
    app.edp.epam.com/codebase: $(tt.params.CODEBASE_NAME)
    app.edp.epam.com/codebasebranch: $(tt.params.CODEBASEBRANCH_NAME)
    app.edp.epam.com/pipelinetype: build   # or review
```

Labels are critical for:

- UI filtering and discovery
- Resource organization
- Metrics and monitoring

**2. Dynamic Pipeline Reference**:

```yaml
spec:
  pipelineRef:
    name: $(tt.params.PIPELINE_NAME)    # From extensions.pipelines.{type}
```

**NEVER hardcode pipeline names**. Pipeline names come from CodebaseBranch.Spec.Pipelines.{type} and vary per codebase.

**3. Workspace Configuration**:

```yaml
workspaces:
  - name: shared-workspace
    volumeClaimTemplate:
      spec:
        accessModes: [ReadWriteOnce]
        resources:
          requests:
            storage: {{ .Values.tekton.workspaceSize }}
  - name: ssh-creds
    secret:
      secretName: ci-{{ .Values.vcs.provider }}
```

Each PipelineRun gets ephemeral PVC (auto-cleaned after completion).

**4. Parameters**:

```yaml
params:
  - name: git-source-url
    value: $(tt.params.git-source-url)
  - name: git-source-revision
    value: $(tt.params.git-source-revision)
  - name: CODEBASE_NAME
    value: $(tt.params.CODEBASE_NAME)
  - name: CODEBASEBRANCH_NAME
    value: $(tt.params.CODEBASEBRANCH_NAME)
  # ... all parameters from TriggerBinding
```

### Build vs Review Templates

**Build Template** (`tt-build.yaml`):

- Uses `extensions.pipelines.build` for pipeline name
- Label: `app.edp.epam.com/pipelinetype: build`
- Triggered by merged commits

**Review Template** (`tt-review.yaml`):

- Uses `extensions.pipelines.review` for pipeline name
- Label: `app.edp.epam.com/pipelinetype: review`
- Triggered by PR/MR creation/update

## EventListener Configuration

### Basic Structure

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: EventListener
metadata:
  name: el-github
spec:
  serviceAccountName: tekton
  triggers:
    - name: github-build
      interceptors: [...]
      bindings:
        - ref: github-binding-build
      template:
        ref: github-build-template

    - name: github-review
      interceptors: [...]
      bindings:
        - ref: github-binding-review
      template:
        ref: github-review-template
```

### Service Exposure

EventListener creates a Kubernetes Service that must be exposed:

**OpenShift (Route - automatic)**:

```bash
oc get route el-github
# Returns: https://el-github-{namespace}.{cluster-domain}
```

**Kubernetes (Ingress - manual)**:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: el-github
spec:
  rules:
    - host: el-github.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: el-github
                port:
                  number: 8080
```

**Alternative**: LoadBalancer service

```yaml
spec:
  serviceType: LoadBalancer
```

## VCS Webhook Configuration

After deploying EventListener, configure VCS to send webhooks.

### GitHub

**Steps**:

1. Get EventListener URL: `https://el-github-{namespace}.{cluster}`
2. Go to: Repository → Settings → Webhooks → Add webhook
3. Configure:
   - Payload URL: EventListener URL
   - Content type: `application/json`
   - Secret: Token from `ci-github` secret
   - Events: `push`, `pull_request`
4. Save

### GitLab

**Steps**:

1. Get EventListener URL
2. Go to: Project → Settings → Webhooks
3. Configure:
   - URL: EventListener URL
   - Secret token: Token from `ci-gitlab` secret
   - Trigger: `Push events`, `Merge request events`
4. Add webhook

### Gerrit

**Steps**:

1. Install stream-events plugin (if not installed)
2. Configure gerrit.config:

   ```ini
   [event]
     stream-events = group-name
   ```

3. EventListener receives events via SSH stream
4. See `references/vcs-gerrit.md` for SSH configuration

### BitBucket

**Steps**:

1. Get EventListener URL
2. Go to: Repository → Repository settings → Webhooks
3. Configure:
   - Title: EDP Tekton
   - URL: EventListener URL
   - Events: `Repository push`, `Pull request created/updated`
4. Save

For detailed VCS-specific configuration, see respective reference files.

## Critical Facts & Best Practices

### Critical Facts

1. **Pipeline Names are Dynamic**: NEVER hardcode pipeline names. Always use `$(tt.params.PIPELINE_NAME)` from `extensions.pipelines.{type}`.

2. **Repository Must Match**: Webhook repository URL must match `Codebase.Spec.GitUrlPath` (normalized to lowercase).

3. **Branch Must Exist**: Git branch must have a corresponding `CodebaseBranch` resource in the cluster.

4. **Secret Required**: Each VCS provider needs a secret:
   - `ci-github` - GitHub token
   - `ci-gitlab` - GitLab token
   - `ci-gerrit` - Gerrit credentials
   - `ci-bitbucket` - BitBucket credentials

5. **Timeout**: EDP Interceptor has a 3-second timeout for Codebase/CodebaseBranch lookup.

6. **Workspace Isolation**: Each PipelineRun gets its own ephemeral PVC (not shared between runs).

### Best Practices

**1. Use Helm Templating**:

```yaml
{{ if has "github" .Values.global.gitProviders }}
# Trigger resources
{{ end }}
```

**2. Parameterize VCS Provider**:

```yaml
secretName: ci-{{ .Values.vcs.provider }}
```

**3. Add Feature Flags**:

```yaml
{{ if .Values.triggers.enabled }}
# Trigger resources
{{ end }}
```

**4. Include Logging**:

- EventListener logs: `kubectl logs -l eventlistener=el-{vcs}`
- Check interceptor errors in logs

**5. Test Incrementally**:

- Test webhook delivery (check EventListener logs)
- Test interceptor chain (check for errors)
- Test parameter extraction (check PipelineRun params)
- Test pipeline execution (check PipelineRun status)

## Troubleshooting

### Issue: PipelineRun Not Created

**Check**:

1. EventListener logs: `kubectl logs -l eventlistener=el-{vcs}`
2. Webhook delivery in VCS (recent deliveries section)
3. Interceptor chain errors in logs
4. Codebase resource exists and GitUrlPath matches
5. CodebaseBranch resource exists for the branch

### Issue: Wrong Pipeline Executed

**Check**:

1. TriggerTemplate uses `$(tt.params.PIPELINE_NAME)` (not hardcoded)
2. CodebaseBranch.Spec.Pipelines.{type} has correct pipeline name
3. TriggerBinding extracts `PIPELINE_NAME` from `extensions.pipelines.{type}`

### Issue: Webhook Returns 401/403

**Check**:

1. VCS secret exists: `ci-{provider}`
2. Secret has correct token/credentials
3. Interceptor references correct secret
4. Token has required permissions in VCS

### Issue: EDP Enrichment Fails

**Check**:

1. Codebase CR exists in cluster
2. Codebase.Spec.GitUrlPath matches webhook repository (lowercase)
3. CodebaseBranch CR exists for branch
4. EDP Interceptor pod is running
5. Timeout (<3 seconds) not exceeded

## Parameter Flow Summary

Complete flow from webhook to PipelineRun:

```
1. VCS Webhook
   └─> body.* (repository, pull_request, commit, etc.)

2. VCS Validation Interceptor
   └─> Validates signature/token, parses payload

3. CEL Filter Interceptor
   └─> Filters events (merged commits, PR updates, etc.)

4. EDP Enrichment Interceptor
   └─> Adds extensions.* (codebase, codebasebranch, pipelines.build, pipelines.review)

5. TriggerBinding
   └─> Extracts parameters from body.* and extensions.*
   └─> Outputs: git-source-url, CODEBASE_NAME, PIPELINE_NAME, etc.

6. TriggerTemplate
   └─> Creates PipelineRun with:
       - pipelineRef.name: $(tt.params.PIPELINE_NAME)  # DYNAMIC!
       - workspaces: shared-workspace (ephemeral PVC), ssh-creds (secret)
       - params: All parameters from TriggerBinding

7. PipelineRun
   └─> Executes pipeline with tasks
```

For detailed parameter mappings per VCS, see `references/parameter-flow.md`.

## Additional Resources

**VCS-Specific Patterns**:

- GitHub patterns and examples: `references/vcs-github.md`
- GitLab patterns and examples: `references/vcs-gitlab.md`
- Gerrit patterns and examples: `references/vcs-gerrit.md`
- BitBucket patterns and examples: `references/vcs-bitbucket.md`

**Parameter Flow Details**:

- Complete parameter mapping: `references/parameter-flow.md`

**Tekton Triggers Documentation**:

- Official docs: <https://tekton.dev/docs/triggers/>
- Interceptors: <https://tekton.dev/docs/triggers/interceptors/>
- CEL expressions: <https://github.com/google/cel-spec>

## Quick Reference

**Create EventListener**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/eventlistener.yaml
# Name: el-{vcs}
# ServiceAccount: tekton
```

**Create Trigger**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/trigger-{type}.yaml
# Name: {vcs}-{type}
# Interceptors: [VCS validation, CEL filter, EDP enrichment]
```

**Create TriggerBinding**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/triggerbinding-{type}.yaml
# Name: {vcs}-binding-{type}
# Params: Extract from body.* and extensions.*
```

**Create TriggerTemplate**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/tt-{type}.yaml
# Name: {vcs}-{type}-template or tt-{type}
# Creates: PipelineRun with DYNAMIC pipeline name
```

**Deploy & Test**:

```bash
# Deploy chart
helm upgrade --install edp-tekton charts/pipelines-library

# Get EventListener URL
kubectl get route el-{vcs}  # OpenShift
kubectl get svc el-{vcs}    # Kubernetes

# Check logs
kubectl logs -l eventlistener=el-{vcs}

# Test webhook
# Create PR/MR in VCS and check PipelineRun creation
kubectl get pipelineruns
```

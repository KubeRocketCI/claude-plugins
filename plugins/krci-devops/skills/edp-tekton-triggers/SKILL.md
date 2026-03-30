---
name: KRCI EDP-Tekton Triggers
description: This skill should be used when the user asks to "create trigger for GitHub", "configure webhook", "set up EventListener", "debug webhook not triggering", "PipelineRun not created", "webhook not working", "pipeline not starting from webhook", "interceptor chain", "pipeline name wrong", "wrong pipeline executed", "webhook returns 401", "parameter flow", "CEL filter", or mentions Tekton Triggers, EventListeners, TriggerBindings, TriggerTemplates, webhook integration, VCS event handling, interceptor configuration, or trigger setup for GitHub, GitLab, Gerrit, or BitBucket. Make sure to use this skill whenever dealing with webhook-to-pipeline automation or troubleshooting pipeline triggering issues. For pipeline/task naming, onboarding, or Helm chart structure, defer to edp-tekton-standards. For GitLab CI components, defer to gitlab-ci-component-standards.
---

# EDP-Tekton Triggers: Webhook-Driven CI/CD

Comprehensive guide to implementing Tekton Triggers for webhook-driven pipeline execution in the EDP-Tekton repository.

## Purpose

Guide implementation of Tekton Triggers that respond to VCS webhooks (GitHub, GitLab, Gerrit, BitBucket) and automatically create PipelineRuns. Covers trigger architecture, interceptor chains, parameter extraction, and VCS-specific patterns.

## Target Repository

**Repository**: <https://github.com/epam/edp-tekton>

**CRITICAL**: All trigger components must be created within the EDP-Tekton repository's trigger structure.

**Repository Scale**: 41 trigger-related files organized by VCS provider (GitHub, GitLab, Gerrit, BitBucket) across build and review trigger types.

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

**Comment Retriggering**: GitHub, GitLab, and Gerrit support re-triggering via `/recheck` or `/ok-to-test` comments (BitBucket does not). See VCS reference files for CEL filter examples including comment patterns.

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

TriggerBindings extract parameters from two sources:

1. **Webhook Body (`body.*`)** — VCS-specific payload fields (repository URL, branch, commit SHA, PR number). Each VCS has different paths for these fields.
2. **EDP Extensions (`extensions.*`)** — EDP Interceptor-enriched Codebase metadata (codebase name, codebasebranch name, dynamic pipeline name, normalized PR data).

The most critical parameter is `PIPELINE_NAME` from `extensions.pipelines.{build|review}` — this is what makes pipeline references dynamic rather than hardcoded.

For complete parameter mappings and end-to-end flow examples, see **`references/parameter-flow.md`** (read when implementing or debugging bindings).

For VCS-specific `body.*` field paths, see the provider reference file matching the user's VCS:

- **`references/vcs-github.md`** — GitHub webhook paths, CEL filters, file layout
- **`references/vcs-gitlab.md`** — GitLab MR webhook paths, CEL filters, file layout
- **`references/vcs-gerrit.md`** — Gerrit SSH stream events, unique 2-stage chain
- **`references/vcs-bitbucket.md`** — BitBucket webhook paths, ClusterInterceptor differences

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

Each PipelineRun gets an ephemeral PVC (`shared-workspace` via `volumeClaimTemplate`, size from `.Values.tekton.workspaceSize`) and git credentials from `ci-{{ .Values.vcs.provider }}` secret.

**Build vs Review**: Build templates use `extensions.pipelines.build` with label `pipelinetype: build` (merged commits). Review templates use `extensions.pipelines.review` with label `pipelinetype: review` (PR/MR events). See VCS reference files for full YAML examples.

## EventListener Configuration

Each VCS provider has one EventListener named `el-{provider}` (e.g., `el-github`), running with the `tekton` ServiceAccount. The EventListener creates a Kubernetes Service that must be exposed externally (via Ingress, Route, or LoadBalancer). For webhook setup and deployment, see **`references/operations.md`**.

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

For troubleshooting common issues (PipelineRun not created, wrong pipeline, 401/403 errors, enrichment failures) and complete parameter flow summary, see **`references/operations.md`**.

## Reference Files

Read the reference file matching the user's VCS provider when implementing or debugging triggers for that provider:

- **`references/vcs-github.md`** — GitHub webhook body paths, CEL filters, file layout
- **`references/vcs-gitlab.md`** — GitLab MR webhook paths, CEL filters, file layout
- **`references/vcs-gerrit.md`** — Gerrit SSH events, 2-stage chain, gerrit-notify
- **`references/vcs-bitbucket.md`** — BitBucket ClusterInterceptor, body paths, file layout

Read when implementing or debugging parameter extraction:

- **`references/parameter-flow.md`** — End-to-end parameter mapping from webhook to PipelineRun

Read when setting up webhooks, troubleshooting failures, or deploying EventListeners:

- **`references/operations.md`** — Webhook setup, troubleshooting, deployment commands

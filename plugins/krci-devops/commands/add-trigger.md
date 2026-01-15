---
description: Create Tekton Triggers for VCS webhook integration
argument-hint: <vcs> <trigger-type>
allowed-tools: [Read, Grep, Glob, Bash, Skill, Task, AskUserQuestion]
---

# Task: Create Tekton Trigger for VCS Webhook Integration

**CRITICAL: Follow this workflow to create Tekton Triggers:**

1. **Load required skills using Skill tool:**
   - Load krci-devops:edp-tekton-standards (for pipeline and repository context)
   - Load krci-devops:edp-tekton-triggers (for trigger architecture and patterns)

2. **Ask user questions using AskUserQuestion:**
   - Question 1: "Which VCS provider?"
     - Options: "GitHub" / "GitLab" / "Gerrit" / "BitBucket"

   - Question 2: "Which trigger type to create?"
     - Options: "Build (merged commits)" / "Review (PRs/MRs)" / "Both"

   - Question 3: "EventListener configuration?"
     - Options: "Create new EventListener" / "Use existing el-{vcs}"

   - Question 4: "Pipeline naming strategy?"
     - Options: "Dynamic from CodebaseBranch (Recommended)" / "Specify pipeline name"

3. **Use devops agent to create trigger components:**

   Use the devops agent to create Tekton Trigger components for VCS webhook integration. Both edp-tekton-standards and edp-tekton-triggers skills have been loaded and contain all required patterns.

   **Repository Context**:
   - Working in EDP-Tekton repository (<https://github.com/epam/edp-tekton>)
   - 41 existing trigger files across 4 VCS providers
   - User preferences from step 2: VCS provider, trigger type, EventListener strategy, pipeline naming

   **Component Creation Workflow**:
   1. Determine file paths in `./charts/pipelines-library/templates/triggers/{vcs}/`
   2. Create EventListener (if user selected "Create new"):
      - File: `eventlistener.yaml`
      - Configure with `serviceAccountName: tekton`
      - Wrap with Helm condition: `{{ if has "{vcs}" .Values.global.gitProviders }}`
   3. Create Trigger with 3-stage interceptor chain:
      - File: `trigger-{type}.yaml` (build or review)
      - Stage 1: VCS Validation (ClusterInterceptor for GitHub/GitLab/BitBucket, CEL for Gerrit)
      - Stage 2: CEL Filter (VCS-specific event filtering for merged commits or PR/MR events)
      - Stage 3: EDP Enrichment (ClusterInterceptor `edp` for Codebase metadata)
   4. Create TriggerBinding for parameter extraction:
      - File: `triggerbinding-{type}.yaml`
      - Extract from `body.*`: VCS-specific webhook payload fields
      - Extract from `extensions.*`: EDP-enriched metadata (codebase, codebasebranch, pipelines)
   5. Create TriggerTemplate for PipelineRun scaffolding:
      - File: `tt-{type}.yaml`
      - **CRITICAL**: Use DYNAMIC pipeline naming: `pipelineRef.name: $(tt.params.PIPELINE_NAME)`
      - Pipeline name comes from: `$(extensions.pipelines.{type})` (NOT hardcoded!)
      - Configure workspaces: shared-workspace (ephemeral PVC) and ssh-creds (VCS secret)
      - Add labels: codebase, codebasebranch, pipelinetype
   6. Validate all components:
      - VCS-specific CEL filters match provider patterns
      - Parameter flow is correct: `body.*` → `extensions.*` → `tt.params.*`
      - Pipeline naming is DYNAMIC (no hardcoded names)
   7. Provide webhook configuration instructions for the VCS provider

   The agent should deliver complete, working trigger components following VCS-specific patterns from the triggers skill, with DYNAMIC pipeline naming as the critical requirement.

## Task Overview

Create Tekton Trigger components that respond to VCS webhooks and automatically create PipelineRuns. Supports GitHub, GitLab, Gerrit, BitBucket with VCS-specific event handling and parameter extraction.

The trigger architecture follows:

```
VCS Webhook → EventListener → Trigger (3 interceptors) → TriggerBinding → TriggerTemplate → PipelineRun
                                    ↓
                         [VCS Validation] → [CEL Filter] → [EDP Enrichment]
```

## Reference Assets (Prerequisites)

**CRITICAL**: Must be in EDP-Tekton repository.

**Required Resources**:

- Pipelines must exist (created via /krci-devops:add-pipeline)
- Codebase resource must exist in cluster when deployed
- CodebaseBranch resource must exist when deployed
- VCS secret must exist: `ci-{provider}` (ci-github, ci-gitlab, ci-gerrit, ci-bitbucket)

**Expected Structure**:

```
charts/pipelines-library/templates/triggers/
├── github/
│   ├── eventlistener.yaml
│   ├── trigger-build.yaml
│   ├── trigger-review.yaml
│   ├── triggerbinding-build.yaml
│   ├── triggerbinding-review.yaml
│   ├── tt-build.yaml
│   └── tt-review.yaml
```

## Instructions

1. **Verify Prerequisites**:
   - Pipeline exists for the trigger type
   - VCS secret exists: `kubectl get secret ci-{provider}`
   - Repository context confirmed

2. **Collect Parameters** from user ($ARGUMENTS or questions)

3. **Create Trigger Components**:

### A. EventListener (if new)

```yaml
{{ if has "{vcs}" .Values.global.gitProviders }}
apiVersion: triggers.tekton.dev/v1beta1
kind: EventListener
metadata:
  name: el-{vcs}
spec:
  serviceAccountName: tekton
  triggers: []
{{ end }}
```

### B. Trigger with Interceptor Chain

```yaml
triggers:
  - name: {vcs}-{type}
    interceptors:
      # Stage 1: VCS Validation
      - ref:
          name: {vcs}    # github, gitlab, bitbucket (NOT gerrit)
        params:
          - name: secretRef
            value:
              secretName: ci-{vcs}
              secretKey: token
          - name: eventTypes
            value: ["pull_request"]    # VCS-specific

      # Stage 2: CEL Filter
      - ref:
          name: cel
        params:
          - name: filter
            value: >
              {cel-expression}    # VCS and type specific

      # Stage 3: EDP Enrichment
      - ref:
          name: edp
        params:
          - name: secretRef
            value:
              secretName: edp-interceptor
              secretKey: token

    bindings:
      - ref: {vcs}-binding-{type}
    template:
      ref: {vcs}-{type}-template
```

### C. TriggerBinding

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: {vcs}-binding-{type}
spec:
  params:
    # From webhook body (VCS-specific paths)
    - name: git-source-url
      value: $(body.{vcs-specific-path})
    - name: gitsha
      value: $(body.{vcs-specific-commit-path})
    - name: changeNumber
      value: $(body.{vcs-specific-pr-number})

    # From EDP extensions (ALWAYS THE SAME)
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: CODEBASEBRANCH_NAME
      value: $(extensions.codebasebranch)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.{type})    # build or review
```

### D. TriggerTemplate

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerTemplate
metadata:
  name: {vcs}-{type}-template
spec:
  params: [...]    # All params from binding

  resourcetemplates:
    - apiVersion: tekton.dev/v1
      kind: PipelineRun
      metadata:
        generateName: $(tt.params.CODEBASE_NAME)-$(tt.params.PIPELINE_NAME)-
        labels:
          app.edp.epam.com/codebase: $(tt.params.CODEBASE_NAME)
          app.edp.epam.com/codebasebranch: $(tt.params.CODEBASEBRANCH_NAME)
          app.edp.epam.com/pipelinetype: {type}
      spec:
        pipelineRef:
          name: $(tt.params.PIPELINE_NAME)    # DYNAMIC! From extensions

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
              secretName: ci-{vcs}

        params:
          - name: git-source-url
            value: $(tt.params.git-source-url)
          - name: CODEBASE_NAME
            value: $(tt.params.CODEBASE_NAME)
          # ... all parameters from TriggerBinding
```

1. **Validate Created Components**:
   - Helm template renders: `helm template charts/pipelines-library | yq`
   - YAML is valid
   - Parameters match between Binding and Template
   - Pipeline name is DYNAMIC (uses extensions.pipelines.{type})
   - VCS-specific paths are correct

2. **Provide Webhook Configuration Instructions**

## VCS-Specific CEL Filters

### GitHub

**Build** (merged PRs):

```yaml
value: body.pull_request.merged == true && body.action == 'closed'
```

**Review** (PR opened/updated):

```yaml
value: >
  (body.action in ['opened', 'synchronize', 'reopened']) ||
  (body.action == 'created' &&
   body.issue.pull_request != null &&
   body.comment.body.matches('/(recheck|ok-to-test)'))
```

### GitLab

**Build**:

```yaml
value: body.object_attributes.action == 'merge' && body.object_attributes.state == 'merged'
```

**Review**:

```yaml
value: >
  body.object_attributes.action in ['open', 'update', 'reopen'] ||
  (body.object_kind == 'note' &&
   body.merge_request != null &&
   body.object_attributes.note.matches('/(recheck|ok-to-test)'))
```

### Gerrit

**Build**:

```yaml
value: body.type == 'change-merged'
```

**Review**:

```yaml
value: >
  body.type == 'patchset-created' ||
  (body.type == 'comment-added' && body.comment.matches('recheck'))
```

### BitBucket

**Build**:

```yaml
value: body.eventKey == 'pullrequest:fulfilled' && body.pullrequest.state == 'MERGED'
```

**Review**:

```yaml
value: >
  body.eventKey in ['pullrequest:created', 'pullrequest:updated'] &&
  body.pullrequest.state == 'OPEN'
```

## Output Format

```
created_files:
  - "./charts/pipelines-library/templates/triggers/{vcs}/eventlistener.yaml" (if new)
  - "./charts/pipelines-library/templates/triggers/{vcs}/trigger-{type}.yaml"
  - "./charts/pipelines-library/templates/triggers/{vcs}/triggerbinding-{type}.yaml"
  - "./charts/pipelines-library/templates/triggers/{vcs}/tt-{type}.yaml"
validation:
  helm_template: success
  yaml_valid: true
  parameters_match: true
  pipeline_dynamic: true (CRITICAL)
webhook_setup:
  url: "https://el-{vcs}-{namespace}.{cluster}"
  secret: "ci-{vcs}"
  events: [VCS-specific event types]
```

## Webhook Configuration Instructions

After creating triggers, user must configure VCS webhook:

### GitHub

1. Get URL: `kubectl get route el-github`
2. Go to: Repository → Settings → Webhooks → Add webhook
3. Configure: Payload URL, Secret (from ci-github), Events (Pull requests, Issue comments)

### GitLab

1. Get URL: `kubectl get route el-gitlab`
2. Go to: Project → Settings → Webhooks
3. Configure: URL, Secret token, Trigger (Push, Merge requests, Comments)

### Gerrit

1. Configure SSH stream-events
2. EventListener receives events via SSH
3. See references/vcs-gerrit.md for details

### BitBucket

1. Get URL: `kubectl get svc el-bitbucket`
2. Go to: Repository settings → Webhooks
3. Configure: URL, Events (Push, Pull request created/updated)

## Acceptance Criteria

- [ ] EventListener exists (new or existing)
- [ ] Trigger created with proper interceptor chain (VCS validation → CEL filter → EDP enrichment)
- [ ] TriggerBinding extracts all required parameters
- [ ] TriggerTemplate uses DYNAMIC pipeline name: `$(tt.params.PIPELINE_NAME)` from `$(extensions.pipelines.{type})`
- [ ] Proper VCS secret referenced: `ci-{vcs}`
- [ ] Labels include: codebase, pipelinetype, codebasebranch
- [ ] Workspace configuration matches pipeline requirements
- [ ] Helm template validates successfully
- [ ] User receives webhook configuration instructions

## Post-Implementation Steps

- **Validate triggers**:

  ```bash
  helm template charts/pipelines-library | yq '.kind == "EventListener"'
  helm template charts/pipelines-library | yq '.kind == "Trigger"'
  ```

- **Deploy to cluster**:

  ```bash
  helm upgrade --install edp-tekton charts/pipelines-library
  ```

- **Configure VCS webhook** (see instructions above)

- **Test trigger**:
  1. Create test PR/MR in VCS
  2. Check EventListener logs: `kubectl logs -l eventlistener=el-{vcs}`
  3. Verify PipelineRun created: `kubectl get pipelineruns`
  4. Verify PipelineRun uses correct DYNAMIC pipeline name

## Troubleshooting

### No PipelineRun Created

- Check EventListener logs for interceptor errors
- Verify webhook delivery in VCS
- Check Codebase and CodebaseBranch resources exist
- Verify repository URL matches Codebase.Spec.GitUrlPath

### Wrong Pipeline Executed

- Ensure TriggerTemplate uses: `pipelineRef.name: $(tt.params.PIPELINE_NAME)`
- Check CodebaseBranch.Spec.Pipelines.{type} has correct pipeline name
- Verify TriggerBinding extracts from `extensions.pipelines.{type}` (not hardcoded)

### Webhook Returns 401/403

- Verify secret `ci-{vcs}` exists with valid token
- Check interceptor references correct secret
- Ensure token has required permissions

## Critical Reminders

1. **NEVER hardcode pipeline names** - Always use `$(tt.params.PIPELINE_NAME)` from `extensions.pipelines.{type}`
2. **Repository must match** - Webhook repository must match `Codebase.Spec.GitUrlPath` (normalized lowercase)
3. **Branch must exist** - CodebaseBranch resource must exist for the git branch
4. **Secret required** - Each VCS needs `ci-{provider}` secret
5. **3-second timeout** - EDP Interceptor has 3-second timeout for Codebase lookup

For VCS-specific patterns and complete examples, reference the trigger skill's VCS-specific files.

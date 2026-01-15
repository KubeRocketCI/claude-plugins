# GitHub Trigger Patterns

Complete reference for implementing Tekton Triggers with GitHub webhooks in the EDP-Tekton repository.

## GitHub Webhook Events

GitHub sends webhooks for various repository events. EDP-Tekton uses:

| Event | When Triggered | Used For |
|-------|---------------|----------|
| `push` | Commits pushed to repository | Build pipeline (after merge) |
| `pull_request` | PR opened, updated, merged, closed | Build (when merged) + Review (when opened/updated) |
| `issue_comment` | Comment on PR | Re-trigger review with `/recheck`, `/ok-to-test` |

## Interceptor Configuration

### GitHub Validation Interceptor

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
        value: ["pull_request", "issue_comment"]
```

**Purpose**: Validates `X-Hub-Signature-256` header using shared secret, parses webhook payload.

**Secret Format** (`ci-github`):

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ci-github
type: Opaque
stringData:
  token: ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx  # GitHub Personal Access Token
  username: github-bot                               # Optional
```

**Token Permissions Required**:

- `repo` (full control of private repositories)
- `admin:repo_hook` (write:repo_hook, read:repo_hook)

## CEL Filter Patterns

### Build Pipeline (Merged PRs Only)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.pull_request.merged == true &&
        body.action == 'closed'
```

**Explanation**:

- `body.pull_request.merged == true` - PR was merged (not just closed)
- `body.action == 'closed'` - Event is PR closure

### Review Pipeline (PR Opened/Updated)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        (body.action in ['opened', 'synchronize', 'reopened']) ||
        (body.action == 'created' &&
         body.issue.pull_request != null &&
         body.comment.body.matches('/(recheck|ok-to-test)'))
```

**Explanation**:

- `opened` - New PR created
- `synchronize` - New commits pushed to PR
- `reopened` - Closed PR reopened
- Comment trigger - `/recheck` or `/ok-to-test` comment on PR

## Webhook Payload Structure

### Pull Request Event

**Headers**:

```
X-GitHub-Event: pull_request
X-Hub-Signature-256: sha256=...
Content-Type: application/json
```

**Payload** (relevant fields):

```json
{
  "action": "opened|synchronize|closed|reopened",
  "number": 123,
  "pull_request": {
    "id": 1234567890,
    "number": 123,
    "state": "open",
    "merged": false,
    "title": "Add new feature",
    "user": {
      "login": "developer"
    },
    "head": {
      "ref": "feature-branch",
      "sha": "abc123...",
      "repo": {
        "clone_url": "https://github.com/org/repo.git"
      }
    },
    "base": {
      "ref": "main",
      "sha": "def456...",
      "repo": {
        "clone_url": "https://github.com/org/repo.git"
      }
    },
    "merge_commit_sha": "ghi789..."
  },
  "repository": {
    "name": "repo",
    "full_name": "org/repo",
    "clone_url": "https://github.com/org/repo.git",
    "ssh_url": "git@github.com:org/repo.git"
  }
}
```

### Issue Comment Event

**Headers**:

```
X-GitHub-Event: issue_comment
X-Hub-Signature-256: sha256=...
```

**Payload**:

```json
{
  "action": "created",
  "issue": {
    "number": 123,
    "pull_request": {
      "url": "https://api.github.com/repos/org/repo/pulls/123"
    }
  },
  "comment": {
    "id": 987654321,
    "body": "/recheck",
    "user": {
      "login": "developer"
    }
  },
  "repository": {
    "clone_url": "https://github.com/org/repo.git"
  }
}
```

## TriggerBinding Examples

### Build Pipeline Binding

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: github-binding-build
spec:
  params:
    # Repository and branch information
    - name: git-source-url
      value: $(body.repository.clone_url)
    - name: git-source-revision
      value: $(body.pull_request.base.ref)

    # Commit information
    - name: gitsha
      value: $(body.pull_request.merge_commit_sha)
    - name: changeNumber
      value: $(body.pull_request.number)
    - name: patchsetNumber
      value: "1"

    # EDP Codebase information (from EDP interceptor)
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: CODEBASEBRANCH_NAME
      value: $(extensions.codebasebranch)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.build)

    # Additional metadata
    - name: COMMIT_MESSAGE
      value: $(body.pull_request.title)
    - name: COMMIT_MESSAGE_PATTERN
      value: ""
    - name: TICKET_NAME_PATTERN
      value: ""
```

### Review Pipeline Binding

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: github-binding-review
spec:
  params:
    # Repository information
    - name: git-source-url
      value: $(body.pull_request.head.repo.clone_url)
    - name: git-source-revision
      value: $(body.pull_request.head.ref)
    - name: git-refspec
      value: $(body.pull_request.head.ref):$(body.pull_request.head.ref)

    # Pull request information
    - name: changeNumber
      value: $(body.pull_request.number)
    - name: patchsetNumber
      value: "1"
    - name: gitsha
      value: $(body.pull_request.head.sha)
    - name: targetBranch
      value: $(body.pull_request.base.ref)

    # EDP Codebase information
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: CODEBASEBRANCH_NAME
      value: $(extensions.codebasebranch)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.review)

    # Additional metadata
    - name: COMMIT_MESSAGE
      value: $(body.pull_request.title)
```

## TriggerTemplate Examples

### Build Pipeline Template

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerTemplate
metadata:
  name: github-build-template
spec:
  params:
    - name: git-source-url
    - name: git-source-revision
    - name: gitsha
    - name: changeNumber
    - name: CODEBASE_NAME
    - name: CODEBASEBRANCH_NAME
    - name: PIPELINE_NAME
    - name: COMMIT_MESSAGE
    - name: COMMIT_MESSAGE_PATTERN
      default: ""
    - name: TICKET_NAME_PATTERN
      default: ""
    - name: patchsetNumber
      default: "1"

  resourcetemplates:
    - apiVersion: tekton.dev/v1
      kind: PipelineRun
      metadata:
        generateName: $(tt.params.CODEBASE_NAME)-$(tt.params.PIPELINE_NAME)-
        labels:
          app.edp.epam.com/codebase: $(tt.params.CODEBASE_NAME)
          app.edp.epam.com/codebasebranch: $(tt.params.CODEBASEBRANCH_NAME)
          app.edp.epam.com/pipelinetype: build
      spec:
        pipelineRef:
          name: $(tt.params.PIPELINE_NAME)

        workspaces:
          - name: shared-workspace
            volumeClaimTemplate:
              spec:
                accessModes:
                  - ReadWriteOnce
                resources:
                  requests:
                    storage: {{ .Values.tekton.workspaceSize }}
          - name: ssh-creds
            secret:
              secretName: ci-github

        params:
          - name: git-source-url
            value: $(tt.params.git-source-url)
          - name: git-source-revision
            value: $(tt.params.git-source-revision)
          - name: gitsha
            value: $(tt.params.gitsha)
          - name: changeNumber
            value: $(tt.params.changeNumber)
          - name: patchsetNumber
            value: $(tt.params.patchsetNumber)
          - name: CODEBASE_NAME
            value: $(tt.params.CODEBASE_NAME)
          - name: CODEBASEBRANCH_NAME
            value: $(tt.params.CODEBASEBRANCH_NAME)
          - name: COMMIT_MESSAGE
            value: $(tt.params.COMMIT_MESSAGE)
          - name: COMMIT_MESSAGE_PATTERN
            value: $(tt.params.COMMIT_MESSAGE_PATTERN)
          - name: TICKET_NAME_PATTERN
            value: $(tt.params.TICKET_NAME_PATTERN)
```

### Review Pipeline Template

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerTemplate
metadata:
  name: github-review-template
spec:
  params:
    - name: git-source-url
    - name: git-source-revision
    - name: git-refspec
    - name: gitsha
    - name: changeNumber
    - name: patchsetNumber
    - name: targetBranch
    - name: CODEBASE_NAME
    - name: CODEBASEBRANCH_NAME
    - name: PIPELINE_NAME
    - name: COMMIT_MESSAGE

  resourcetemplates:
    - apiVersion: tekton.dev/v1
      kind: PipelineRun
      metadata:
        generateName: $(tt.params.CODEBASE_NAME)-$(tt.params.PIPELINE_NAME)-
        labels:
          app.edp.epam.com/codebase: $(tt.params.CODEBASE_NAME)
          app.edp.epam.com/codebasebranch: $(tt.params.CODEBASEBRANCH_NAME)
          app.edp.epam.com/pipelinetype: review
      spec:
        pipelineRef:
          name: $(tt.params.PIPELINE_NAME)

        workspaces:
          - name: shared-workspace
            volumeClaimTemplate:
              spec:
                accessModes:
                  - ReadWriteOnce
                resources:
                  requests:
                    storage: {{ .Values.tekton.workspaceSize }}
          - name: ssh-creds
            secret:
              secretName: ci-github

        params:
          - name: git-source-url
            value: $(tt.params.git-source-url)
          - name: git-source-revision
            value: $(tt.params.git-source-revision)
          - name: git-refspec
            value: $(tt.params.git-refspec)
          - name: targetBranch
            value: $(tt.params.targetBranch)
          - name: changeNumber
            value: $(tt.params.changeNumber)
          - name: patchsetNumber
            value: $(tt.params.patchsetNumber)
          - name: gitsha
            value: $(tt.params.gitsha)
          - name: CODEBASE_NAME
            value: $(tt.params.CODEBASE_NAME)
          - name: CODEBASEBRANCH_NAME
            value: $(tt.params.CODEBASEBRANCH_NAME)
          - name: COMMIT_MESSAGE
            value: $(tt.params.COMMIT_MESSAGE)
```

## Complete Trigger Configuration

### EventListener

```yaml
{{ if has "github" .Values.global.gitProviders }}
apiVersion: triggers.tekton.dev/v1beta1
kind: EventListener
metadata:
  name: el-github
spec:
  serviceAccountName: tekton
  triggers:
    # Build trigger (merged PRs)
    - name: github-build
      interceptors:
        - ref:
            name: github
          params:
            - name: secretRef
              value:
                secretName: ci-github
                secretKey: token
            - name: eventTypes
              value: ["pull_request"]
        - ref:
            name: cel
          params:
            - name: filter
              value: >
                body.pull_request.merged == true &&
                body.action == 'closed'
        - ref:
            name: edp
          params:
            - name: secretRef
              value:
                secretName: edp-interceptor
                secretKey: token
      bindings:
        - ref: github-binding-build
      template:
        ref: github-build-template

    # Review trigger (PR opened/updated)
    - name: github-review
      interceptors:
        - ref:
            name: github
          params:
            - name: secretRef
              value:
                secretName: ci-github
                secretKey: token
            - name: eventTypes
              value: ["pull_request", "issue_comment"]
        - ref:
            name: cel
          params:
            - name: filter
              value: >
                (body.action in ['opened', 'synchronize', 'reopened']) ||
                (body.action == 'created' &&
                 body.issue.pull_request != null &&
                 body.comment.body.matches('/(recheck|ok-to-test)'))
        - ref:
            name: edp
          params:
            - name: secretRef
              value:
                secretName: edp-interceptor
                secretKey: token
      bindings:
        - ref: github-binding-review
      template:
        ref: github-review-template
{{ end }}
```

## Webhook Configuration

### Step 1: Get EventListener URL

**OpenShift**:

```bash
oc get route el-github -n edp
# Output: el-github-edp.apps.cluster.example.com
```

**Kubernetes**:

```bash
kubectl get svc el-github -n edp
# Create Ingress or use LoadBalancer
```

### Step 2: Configure GitHub Webhook

1. Go to repository: **Settings** → **Webhooks** → **Add webhook**

2. Configure webhook:
   - **Payload URL**: `https://el-github-edp.apps.cluster.example.com`
   - **Content type**: `application/json`
   - **Secret**: Token from `ci-github` secret (same token)
   - **Which events**:
     - Pull requests
     - Issue comments
     - ❌ Everything else (unchecked)
   - **Active**: Checked

3. Click **Add webhook**

4. Test webhook:
   - GitHub will send a ping event
   - Check "Recent Deliveries" tab
   - Should see green checkmark ✅

### Step 3: Verify Setup

```bash
# Watch EventListener logs
kubectl logs -f -l eventlistener=el-github -n edp

# Create a test PR
# Check logs for webhook receipt

# Verify PipelineRun created
kubectl get pipelineruns -n edp
```

## Troubleshooting

### Issue: Webhook Returns 401 Unauthorized

**Cause**: Secret mismatch or missing

**Fix**:

```bash
# Verify secret exists
kubectl get secret ci-github -n edp

# Check secret content
kubectl get secret ci-github -n edp -o jsonpath='{.data.token}' | base64 -d

# Recreate if needed
kubectl create secret generic ci-github \
  --from-literal=token=ghp_your_token_here \
  -n edp
```

### Issue: Webhook Returns 200 but No PipelineRun

**Cause**: CEL filter not matching or EDP enrichment failed

**Fix**:

```bash
# Check EventListener logs for interceptor errors
kubectl logs -l eventlistener=el-github -n edp | grep -i error

# Common issues:
# - CEL filter doesn't match event (check body.action)
# - Codebase resource not found (check GitUrlPath matches)
# - CodebaseBranch resource not found (check branch exists)
```

### Issue: Wrong Pipeline Executed

**Cause**: Pipeline name hardcoded instead of dynamic

**Fix**:

- Ensure TriggerTemplate uses: `pipelineRef.name: $(tt.params.PIPELINE_NAME)`
- Ensure TriggerBinding extracts: `value: $(extensions.pipelines.build)`
- Verify CodebaseBranch.Spec.Pipelines.Build has correct pipeline name

### Issue: PR Comment Trigger Not Working

**Cause**: `issue_comment` event not configured or CEL filter incorrect

**Fix**:

- Ensure webhook listens to "Issue comments" event
- Verify CEL filter checks for `body.comment.body.matches('/(recheck|ok-to-test)')`
- Check that comment is on a PR (not regular issue)

## Testing Checklist

- [ ] Webhook configured in GitHub with correct URL and secret
- [ ] Events selected: Pull requests, Issue comments
- [ ] Secret `ci-github` exists with valid token
- [ ] EventListener pod running: `kubectl get pod -l eventlistener=el-github`
- [ ] Create test PR - verify build pipeline triggered after merge
- [ ] Create test PR - verify review pipeline triggered on open
- [ ] Add comment `/recheck` - verify review pipeline re-triggered
- [ ] Check EventListener logs for errors
- [ ] Verify PipelineRun uses dynamic pipeline name from CodebaseBranch
- [ ] Verify PipelineRun has correct labels (codebase, pipelinetype)

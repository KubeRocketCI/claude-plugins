# GitLab Trigger Patterns

Reference for implementing Tekton Triggers with GitLab webhooks in EDP-Tekton.

## GitLab Webhook Events

| Event | Trigger | Used For |
|-------|---------|----------|
| `Push Hook` | Commits pushed | Build pipeline (after merge) |
| `Merge Request Hook` | MR opened/merged/updated | Build (merged) + Review (opened/updated) |
| `Note Hook` | Comment on MR | Re-trigger with `/recheck`, `/ok-to-test` |

## Key Differences from GitHub

- Uses **token** validation (X-Gitlab-Token header), not signature
- MR = Merge Request (GitLab's equivalent of GitHub PR)
- Field: `object_attributes` instead of `pull_request`
- Field: `project` instead of `repository`

## Webhook Payload Structure

### Merge Request Event

```json
{
  "object_kind": "merge_request",
  "object_attributes": {
    "id": 99,
    "iid": 1,
    "title": "Add feature",
    "state": "opened",
    "action": "open|update|merge|close|reopen",
    "merge_status": "can_be_merged",
    "source_branch": "feature",
    "target_branch": "main",
    "last_commit": {
      "id": "abc123..."
    }
  },
  "project": {
    "git_http_url": "https://gitlab.com/org/repo.git",
    "git_ssh_url": "git@gitlab.com:org/repo.git"
  }
}
```

## CEL Filters

### Build (Merged MRs)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.object_attributes.action == 'merge' &&
        body.object_attributes.state == 'merged'
```

### Review (MR Opened/Updated)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.object_attributes.action in ['open', 'update', 'reopen'] ||
        (body.object_kind == 'note' &&
         body.merge_request != null &&
         body.object_attributes.note.matches('/(recheck|ok-to-test)'))
```

## TriggerBinding Example

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: gitlab-binding-build
spec:
  params:
    - name: git-source-url
      value: $(body.project.git_http_url)
    - name: git-source-revision
      value: $(body.object_attributes.target_branch)
    - name: gitsha
      value: $(body.object_attributes.merge_commit_sha)
    - name: changeNumber
      value: $(body.object_attributes.iid)
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.build)
```

## Webhook Configuration

1. Go to: **Project** → **Settings** → **Webhooks**
2. Configure:
   - URL: EventListener URL
   - Secret token: From `ci-gitlab` secret
   - Trigger: Push events, Merge request events, Comments
3. Add webhook
4. Test: Click "Test" → "Merge requests events"

## Secret Format

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ci-gitlab
stringData:
  token: glpat-xxxxxxxxxxxxxxxxxxxx    # GitLab Personal Access Token
  username: gitlab-bot
```

**Token Scopes**: `api`, `read_repository`, `write_repository`

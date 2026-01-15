# Gerrit Trigger Patterns

Reference for implementing Tekton Triggers with Gerrit events in EDP-Tekton.

## Gerrit Events

| Event | Trigger | Used For |
|-------|---------|----------|
| `change-merged` | Change merged to branch | Build pipeline |
| `patchset-created` | New patchset uploaded | Review pipeline |
| `comment-added` | Comment on change | Re-trigger with `recheck` |

## Key Differences

- **NO dedicated ClusterInterceptor** - Uses CEL only
- Events delivered via **SSH stream-events**, not HTTP webhooks
- Uses `change` instead of `pull_request`
- Uses `patchSet` for commits
- Trusted network (no signature validation)

## Event Payload Structure

### Change Merged

```json
{
  "type": "change-merged",
  "change": {
    "project": "myproject",
    "branch": "main",
    "id": "I1234567890abcdef",
    "number": 12345,
    "subject": "Add new feature",
    "owner": {"name": "developer"},
    "url": "https://gerrit.example.com/12345"
  },
  "patchSet": {
    "number": 3,
    "revision": "abc123...",
    "ref": "refs/changes/45/12345/3"
  },
  "newRev": "abc123..."
}
```

### Patchset Created

```json
{
  "type": "patchset-created",
  "change": {
    "project": "myproject",
    "branch": "main",
    "number": 12345
  },
  "patchSet": {
    "number": 1,
    "revision": "def456...",
    "ref": "refs/changes/45/12345/1"
  }
}
```

## CEL Filters

### Build (Change Merged)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: body.type == 'change-merged'
```

### Review (Patchset Created)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.type == 'patchset-created' ||
        (body.type == 'comment-added' &&
         body.comment.matches('recheck'))
```

## TriggerBinding Example

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: gerrit-binding-build
spec:
  params:
    - name: git-source-url
      value: ssh://gerrit.example.com:29418/$(body.change.project)
    - name: git-source-revision
      value: $(body.change.branch)
    - name: gitsha
      value: $(body.patchSet.revision)
    - name: changeNumber
      value: $(body.change.number)
    - name: patchsetNumber
      value: $(body.patchSet.number)
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.build)
```

## Gerrit Configuration

### 1. Enable stream-events

Edit `gerrit.config`:

```ini
[event]
  stream-events = Administrators
```

### 2. Configure SSH

EventListener connects via SSH to receive events:

```yaml
# In EventListener configuration
env:
  - name: GERRIT_SSH_KEY
    valueFrom:
      secretKeyFrom:
        name: ci-gerrit
        key: ssh-privatekey
```

### 3. Status Reporting

Gerrit uses `gerrit-notify` task to post review comments:

```yaml
- name: gerrit-notify
  taskRef:
    name: gerrit-notify
  params:
    - name: GERRIT_HOST
      value: gerrit.example.com
    - name: CHANGE_NUMBER
      value: $(params.changeNumber)
    - name: PATCHSET_NUMBER
      value: $(params.patchsetNumber)
    - name: MESSAGE
      value: "Build successful"
```

## Secret Format

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ci-gerrit
stringData:
  username: tekton-bot
  ssh-privatekey: |
    -----BEGIN OPENSSH PRIVATE KEY-----
    ...
    -----END OPENSSH PRIVATE KEY-----
```

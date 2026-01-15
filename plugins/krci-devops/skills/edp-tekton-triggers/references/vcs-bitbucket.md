# BitBucket Trigger Patterns

Reference for implementing Tekton Triggers with BitBucket webhooks in EDP-Tekton.

## BitBucket Webhook Events

| Event | Trigger | Used For |
|-------|---------|----------|
| `repo:push` | Commits pushed | Build pipeline |
| `pullrequest:created` | PR created | Review pipeline |
| `pullrequest:updated` | PR updated | Review pipeline |
| `pullrequest:fulfilled` | PR merged | Build pipeline |

## Key Differences

- Uses **Custom ClusterInterceptor**
- PR state: `OPEN`, `MERGED`, `DECLINED`
- Field: `pullrequest` (lowercase, one word)
- No native comment retriggering support

## Webhook Payload Structure

### Pull Request Event

```json
{
  "eventKey": "pullrequest:created",
  "pullrequest": {
    "id": 1,
    "title": "Add feature",
    "state": "OPEN",
    "source": {
      "branch": {
        "name": "feature"
      },
      "commit": {
        "hash": "abc123..."
      },
      "repository": {
        "links": {
          "clone": [
            {"href": "https://bitbucket.org/org/repo.git", "name": "https"}
          ]
        }
      }
    },
    "destination": {
      "branch": {
        "name": "main"
      }
    }
  },
  "repository": {
    "links": {
      "clone": [
        {"href": "https://bitbucket.org/org/repo.git"}
      ]
    }
  }
}
```

## CEL Filters

### Build (PR Merged)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.eventKey == 'pullrequest:fulfilled' &&
        body.pullrequest.state == 'MERGED'
```

### Review (PR Created/Updated)

```yaml
- ref:
    name: cel
  params:
    - name: filter
      value: >
        body.eventKey in ['pullrequest:created', 'pullrequest:updated'] &&
        body.pullrequest.state == 'OPEN'
```

## TriggerBinding Example

```yaml
apiVersion: triggers.tekton.dev/v1beta1
kind: TriggerBinding
metadata:
  name: bitbucket-binding-build
spec:
  params:
    - name: git-source-url
      value: $(body.repository.links.clone[0].href)
    - name: git-source-revision
      value: $(body.pullrequest.destination.branch.name)
    - name: gitsha
      value: $(body.pullrequest.source.commit.hash)
    - name: changeNumber
      value: $(body.pullrequest.id)
    - name: CODEBASE_NAME
      value: $(extensions.codebase)
    - name: PIPELINE_NAME
      value: $(extensions.pipelines.build)
```

## Webhook Configuration

1. Go to: **Repository** → **Repository settings** → **Webhooks**
2. Configure:
   - Title: EDP Tekton
   - URL: EventListener URL
   - Status: Active
   - Triggers: Repository push, Pull request created/updated/merged
3. Save

## Secret Format

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ci-bitbucket
stringData:
  username: bitbucket-bot
  password: app-password-here    # BitBucket App Password
```

**App Password Permissions**: Repositories (Read, Write), Pull requests (Read, Write)

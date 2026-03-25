# BitBucket Trigger Reference

VCS-specific details for BitBucket triggers. For architecture and common patterns, see the main SKILL.md.

## Key Characteristics

- **Interceptor**: `bitbucket` as **ClusterInterceptor** (unique — other providers use default kind)
- **Secret**: `ci-bitbucket` (key: `secretString`)
- **Events**: `pullrequest:fulfilled`, `pullrequest:created`, `pullrequest:updated`, `pullrequest:comment_created`
- **Comment retrigger**: No (not supported)
- **No CEL filter**: Event filtering done by ClusterInterceptor via `eventTypes` param

## Architectural Difference

BitBucket uses a **2-stage interceptor chain** instead of the standard 3-stage:

```
Webhook → ClusterInterceptor (bitbucket) → NamespacedInterceptor (edp)
```

The `bitbucket` ClusterInterceptor handles both webhook validation AND event filtering (via `eventTypes` param), replacing both the VCS interceptor and CEL filter stages used by other providers.

## Webhook Payload Body Paths

### Build TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `extensions.targetBranch` |
| gitbranch | `extensions.pullRequest.headRef` |
| targetBranch | `extensions.targetBranch` |
| gitrepositoryurl | `git@bitbucket.org:$(body.repository.full_name).git` |
| gitrepositoryname | `body.repository.name` |
| gitfullrepositoryname | `body.repository.full_name` |
| gitsha | `extensions.pullRequest.headSha` |
| commitMessage | `extensions.pullRequest.lastCommitMessage` |

### Review TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `extensions.pullRequest.headSha` |
| targetBranch | `extensions.targetBranch` |
| gitrepositoryurl | `git@bitbucket.org:$(body.repository.full_name).git` |
| gitrepositoryname | `body.repository.name` |
| gitfullrepositoryname | `body.repository.full_name` |
| commitMessage | `extensions.pullRequest.lastCommitMessage` |
| git-refspec | `extensions.pullRequest.headRef` |

**Note**: BitBucket constructs the SSH URL from `body.repository.full_name` — there is no direct SSH URL field in the webhook payload.

## Repo File Paths

```
charts/pipelines-library/templates/triggers/bitbucket/
├── trigger-build.yaml
├── trigger-review.yaml
├── triggerbinding-build.yaml
├── triggerbinding-review.yaml
├── tt-build.yaml
├── tt-review.yaml
├── tt-autotests.yaml
└── tt-security.yaml
```

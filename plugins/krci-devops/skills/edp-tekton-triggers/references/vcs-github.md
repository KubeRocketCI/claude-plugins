# GitHub Trigger Reference

VCS-specific details for GitHub triggers. For architecture and common patterns, see the main SKILL.md.

## Key Characteristics

- **Interceptor**: `github` (validates `X-Hub-Signature-256` header)
- **Secret**: `ci-github` (key: `secretString`)
- **Events**: `pull_request`, `issue_comment`
- **Comment retrigger**: Yes (`/recheck`, `/ok-to-test`)

## Webhook Payload Body Paths

### Build TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `body.pull_request.base.ref` |
| gitbranch | `body.pull_request.head.ref` |
| targetBranch | `body.pull_request.base.ref` |
| gitrepositoryurl | `body.repository.ssh_url` |
| gitrepositoryname | `body.repository.name` |
| gitfullrepositoryname | `body.repository.full_name` |
| gitsha | `extensions.pullRequest.headSha` |
| commitMessage | `body.pull_request.title` |

### Review TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `extensions.pullRequest.headRef` |
| targetBranch | `extensions.targetBranch` |
| gitrepositoryurl | `body.repository.ssh_url` |
| gitrepositoryname | `body.repository.name` |
| gitfullrepositoryname | `body.repository.full_name` |
| gitsha | `extensions.pullRequest.headSha` |
| commitMessage | `extensions.pullRequest.lastCommitMessage` |

## CEL Filters

**Build** (merged PRs):

```
body.action in ['closed'] && body.pull_request.merged == true
```

**Review** (PR opened/updated + comment retrigger):

```
(body.action in ['opened', 'synchronize', 'created'])
```

Comment retrigger is handled via `issue_comment` event type with CEL checking `body.issue.pull_request != null && body.comment.body.matches('/(recheck|ok-to-test)')`.

## Repo File Paths

```
charts/pipelines-library/templates/triggers/github/
├── trigger-build.yaml
├── trigger-review.yaml
├── triggerbinding-build.yaml
├── triggerbinding-review.yaml
├── tt-build.yaml
├── tt-review.yaml
├── tt-autotests.yaml
└── tt-security.yaml
```

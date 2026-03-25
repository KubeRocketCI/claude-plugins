# GitLab Trigger Reference

VCS-specific details for GitLab triggers. For architecture and common patterns, see the main SKILL.md.

## Key Characteristics

- **Interceptor**: `gitlab` (validates `X-Gitlab-Token` header — token-based, not signature)
- **Secret**: `ci-gitlab` (key: `secretString`)
- **Events**: `Merge Request Hook`, `Note Hook`
- **Comment retrigger**: Yes (`/recheck`, `/ok-to-test` via Note Hook)
- **Terminology**: Merge Request (MR) instead of Pull Request (PR)

## Webhook Payload Body Paths

### Build TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `extensions.pullRequest.headSha` |
| gitbranch | `extensions.pullRequest.headRef` |
| targetBranch | `extensions.targetBranch` |
| gitrepositoryurl | `body.project.git_ssh_url` |
| gitrepositoryname | `body.project.name` |
| gitfullrepositoryname | `body.object_attributes.target.path_with_namespace` |
| commitMessage | `body.object_attributes.title` |

### Review TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `extensions.pullRequest.headSha` |
| gitbranch | `extensions.pullRequest.headRef` |
| targetBranch | `extensions.targetBranch` |
| gitrepositoryurl | `body.project.git_ssh_url` |
| gitrepositoryname | `body.project.name` |
| gitfullrepositoryname | `body.project.path_with_namespace` |
| commitMessage | `extensions.pullRequest.lastCommitMessage` |

## CEL Filters

**Build** (merged MRs):

```
body.object_attributes.action in ['merge']
```

**Review** (MR opened/updated + comment retrigger):

```
body.object_attributes.action in ['open', 'reopen', 'update']
  && !(has(body.changes.assignees) || has(body.changes.reviewers))
  || (body.object_kind == 'note' && has(body.merge_request))
```

The review filter excludes MR events that only change assignees/reviewers (no code change). Comment retrigger uses `Note Hook` — CEL checks `body.object_kind == 'note'` with `body.merge_request` present.

## Repo File Paths

```
charts/pipelines-library/templates/triggers/gitlab/
├── trigger-build.yaml
├── trigger-review.yaml
├── triggerbinding-build.yaml
├── triggerbinding-review.yaml
├── tt-build.yaml
├── tt-review.yaml
├── tt-autotests.yaml
└── tt-security.yaml
```

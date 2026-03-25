# Gerrit Trigger Reference

VCS-specific details for Gerrit triggers. For architecture and common patterns, see the main SKILL.md.

## Key Characteristics

- **Interceptor**: None — CEL only + EDP (no dedicated VCS interceptor)
- **Secret**: `ci-gerrit` (SSH key, not token)
- **Transport**: SSH stream-events (not HTTP webhooks)
- **Events**: `change-merged`, `patchset-created`, `comment-added`
- **Comment retrigger**: Yes (`recheck` in comment)
- **Status reporting**: Posts review comments back to Gerrit via `gerrit-notify` task

## Architectural Differences

Gerrit is the most different provider:

1. **No VCS interceptor** — uses CEL filter directly (trusted network, no webhook signature validation)
2. **SSH transport** — events arrive via `stream-events` SSH connection, not HTTP POST
3. **2-stage chain**: `CEL filter → NamespacedInterceptor (edp)`
4. **Status reporting** — pipeline results posted back as Gerrit review comments

## Webhook Payload Body Paths

### Build TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `body.change.branch` |
| targetBranch | `body.change.branch` |
| gerritproject | `body.change.project` |
| changeNumber | `body.change.number` |
| patchsetNumber | `body.patchSet.number` |
| commitMessage | `body.change.commitMessage` |
| gitauthor | `body.change.owner.username` |

### Review TriggerBinding (`body.*` paths)

| Parameter | Path |
|-----------|------|
| gitrevision | `FETCH_HEAD` (literal — fetched via gerritrefspec) |
| targetBranch | `body.change.branch` |
| gerritproject | `body.change.project` |
| gerritrefspec | `body.patchSet.ref` |
| changeNumber | `body.change.number` |
| patchsetNumber | `body.patchSet.number` |
| commitMessage | `body.change.commitMessage` |
| gitauthor | `body.patchSet.uploader.username` |

**Note**: Gerrit review uses `gerritrefspec` (`refs/changes/XX/XXXXX/N`) to fetch the specific patchset, with `FETCH_HEAD` as the revision after fetch.

## CEL Filters

**Build** (change merged):

```
body.change.status in ['MERGED']
```

**Review** (new patchset + comment retrigger):

```
body.change.status in ['NEW']
```

Comment retrigger uses `comment-added` event type with CEL checking for `recheck` in the comment body.

## Gerrit-Specific Configuration

### SSH Stream-Events

Gerrit delivers events via SSH. The EventListener connects using an SSH key from `ci-gerrit` secret.

### Status Reporting

Gerrit pipelines use a `gerrit-notify` task to post build results as review comments. This is unique to Gerrit — other providers use VCS API status checks.

## Repo File Paths

```
charts/pipelines-library/templates/triggers/gerrit/
├── trigger-build.yaml
├── trigger-review.yaml
├── triggerbinding-build.yaml
├── triggerbinding-review.yaml
├── tt-build.yaml
├── tt-review.yaml
├── tt-autotests.yaml
└── tt-security.yaml
```

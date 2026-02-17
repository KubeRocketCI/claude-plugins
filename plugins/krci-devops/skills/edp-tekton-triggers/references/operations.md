# Tekton Triggers Operations Guide

Operational reference for VCS webhook configuration, troubleshooting, parameter flow, and quick reference commands.

## VCS Webhook Configuration

After deploying EventListener, configure VCS to send webhooks.

### GitHub

**Steps**:

1. Get EventListener URL: `https://el-github-{namespace}.{cluster}`
2. Go to: Repository → Settings → Webhooks → Add webhook
3. Configure:
   - Payload URL: EventListener URL
   - Content type: `application/json`
   - Secret: Token from `ci-github` secret
   - Events: `push`, `pull_request`
4. Save

### GitLab

**Steps**:

1. Get EventListener URL
2. Go to: Project → Settings → Webhooks
3. Configure:
   - URL: EventListener URL
   - Secret token: Token from `ci-gitlab` secret
   - Trigger: `Push events`, `Merge request events`
4. Add webhook

### Gerrit

**Steps**:

1. Install stream-events plugin (if not installed)
2. Configure gerrit.config:

   ```ini
   [event]
     stream-events = group-name
   ```

3. EventListener receives events via SSH stream
4. See `vcs-gerrit.md` for SSH configuration

### BitBucket

**Steps**:

1. Get EventListener URL
2. Go to: Repository → Repository settings → Webhooks
3. Configure:
   - Title: EDP Tekton
   - URL: EventListener URL
   - Events: `Repository push`, `Pull request created/updated`
4. Save

For detailed VCS-specific configuration, see respective `vcs-{provider}.md` reference files.

---

## Troubleshooting

### Issue: PipelineRun Not Created

**Check**:

1. EventListener logs: `kubectl logs -l eventlistener=el-{vcs}`
2. Webhook delivery in VCS (recent deliveries section)
3. Interceptor chain errors in logs
4. Codebase resource exists and GitUrlPath matches
5. CodebaseBranch resource exists for the branch

### Issue: Wrong Pipeline Executed

**Check**:

1. TriggerTemplate uses `$(tt.params.PIPELINE_NAME)` (not hardcoded)
2. CodebaseBranch.Spec.Pipelines.{type} has correct pipeline name
3. TriggerBinding extracts `PIPELINE_NAME` from `extensions.pipelines.{type}`

### Issue: Webhook Returns 401/403

**Check**:

1. VCS secret exists: `ci-{provider}`
2. Secret has correct token/credentials
3. Interceptor references correct secret
4. Token has required permissions in VCS

### Issue: EDP Enrichment Fails

**Check**:

1. Codebase CR exists in cluster
2. Codebase.Spec.GitUrlPath matches webhook repository (lowercase)
3. CodebaseBranch CR exists for branch
4. EDP Interceptor pod is running
5. Timeout (<3 seconds) not exceeded

---

## Parameter Flow Summary

Complete flow from webhook to PipelineRun:

```text
1. VCS Webhook
   └─> body.* (repository, pull_request, commit, etc.)

2. VCS Validation Interceptor
   └─> Validates signature/token, parses payload

3. CEL Filter Interceptor
   └─> Filters events (merged commits, PR updates, etc.)

4. EDP Enrichment Interceptor
   └─> Adds extensions.* (codebase, codebasebranch, pipelines.build, pipelines.review)

5. TriggerBinding
   └─> Extracts parameters from body.* and extensions.*
   └─> Outputs: git-source-url, CODEBASE_NAME, PIPELINE_NAME, etc.

6. TriggerTemplate
   └─> Creates PipelineRun with:
       - pipelineRef.name: $(tt.params.PIPELINE_NAME)  # DYNAMIC!
       - workspaces: shared-workspace (ephemeral PVC), ssh-creds (secret)
       - params: All parameters from TriggerBinding

7. PipelineRun
   └─> Executes pipeline with tasks
```

For detailed parameter mappings per VCS, see `parameter-flow.md`.

---

## Quick Reference

**Create EventListener**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/eventlistener.yaml
# Name: el-{vcs}
# ServiceAccount: tekton
```

**Create Trigger**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/trigger-{type}.yaml
# Name: {vcs}-{type}
# Interceptors: [VCS validation, CEL filter, EDP enrichment]
```

**Create TriggerBinding**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/triggerbinding-{type}.yaml
# Name: {vcs}-binding-{type}
# Params: Extract from body.* and extensions.*
```

**Create TriggerTemplate**:

```bash
# Location: charts/pipelines-library/templates/triggers/{vcs}/tt-{type}.yaml
# Name: {vcs}-{type}-template or tt-{type}
# Creates: PipelineRun with DYNAMIC pipeline name
```

**Deploy & Test**:

```bash
# Deploy chart
helm upgrade --install edp-tekton charts/pipelines-library

# Get EventListener URL
kubectl get route el-{vcs}  # OpenShift
kubectl get svc el-{vcs}    # Kubernetes

# Check logs
kubectl logs -l eventlistener=el-{vcs}

# Test webhook
# Create PR/MR in VCS and check PipelineRun creation
kubectl get pipelineruns
```

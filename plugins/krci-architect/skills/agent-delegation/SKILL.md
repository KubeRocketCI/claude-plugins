---
name: Agent Delegation
description: This skill should be used when coordinating work across multiple KRCI repositories, delegating implementation tasks to specialized agents, or when the user asks about "delegate to agent", "multi-repository coordination", "spawn agent", "parallel agent delegation", "which agent handles", or mentions using Task tool with KRCI agents. For architectural decisions about what to build, defer to krci-architecture.
---

# KRCI Agent Delegation

Load this skill when you need to delegate implementation work to specialized agents. The architect agent prompt already contains the complete agent-to-repository mapping — this skill adds delegation workflow patterns and cross-agent integration knowledge.

## Delegation Patterns

### Single-Agent Delegation

Use when work is confined to one domain. Identify the responsible agent from the component mapping in your system prompt, then delegate with full context.

**Example — new Tekton task:**

Delegate to krci-devops: "Add OWASP dependency-check Tekton Task following edp-tekton onboarding conventions. Include Helm chart template. Task will be referenced by existing build pipelines via finally block."

### Multi-Agent Sequential Delegation

Use when components have data dependencies — one agent's output defines the contract for the next. Design the data contract first, then delegate in dependency order.

**Example — new CRD field exposed in Portal:**

1. Design contract: `CDPipeline.spec.approvalPolicy` (enum: manual|auto)
2. Delegate to krci-godev: "Add approvalPolicy field to CDPipeline CRD spec. Add validation webhook. Update controller to read field during promotion."
3. Wait for CRD schema confirmation
4. Delegate to krci-fullstack: "Add Approval Policy dropdown to CD Pipeline form. Maps to spec.approvalPolicy. Follow existing form patterns."

The key rule: the agent creating the API surface (CRD, tRPC route) goes first. The agent consuming it goes second with the exact schema.

### Parallel Agent Delegation

Use when components are independent and share only a stable, pre-existing contract (Kubernetes API, Prometheus metrics). Spawn multiple Task calls simultaneously.

**Example — metrics + dashboard:**

- krci-devops: "Add Prometheus metrics labels to PipelineRun finally-task."
- krci-fullstack: "Create pipeline metrics dashboard reading PipelineRun resources."

Both use Tekton's PipelineRun status fields (standard K8s API). No sequencing needed.

## Cross-Agent Integration Points

These are the three surfaces where agent outputs must align. Design the shared contract before delegating.

### Portal + Operator (CRD as contract)

Operator defines CRD schema (krci-godev). Portal reads/writes instances (krci-fullstack). Delegate operator first, then Portal with exact spec/status fields.

Specify in both delegations: API group/version/kind, spec fields Portal writes, status fields Portal reads, labels for filtering.

### Pipeline + Portal (Tekton API as contract)

Tekton pipelines run in-cluster (krci-devops). Portal triggers and monitors PipelineRuns (krci-fullstack). Usually parallel — both use Tekton's standard API. Sequential only if adding custom parameters or results.

Specify in both delegations: pipeline name, parameter names/types, custom results, filtering labels.

### Pipeline + Operator (CR lifecycle as contract)

Operators manage CRs (krci-godev). Tekton Triggers react to CR changes (krci-devops). Delegate operator first to define which fields change, then pipeline to react.

Specify in both delegations: CR kind, triggering status/spec change, fields pipeline needs as parameters, how pipeline reports results back.

## Delegation Essentials

Provide in every delegation:

1. **Context**: The overall feature and why this piece matters
2. **Scope**: Exactly what to implement (files, functions, CRDs)
3. **Contract**: Data interface with other components (field names, types)
4. **Patterns**: Point to an existing similar implementation
5. **Output**: What you expect back (files, tests, Helm templates)

After delegation completes: read key changed files to verify contract alignment. If multiple agents were involved, confirm shared fields/types match exactly.

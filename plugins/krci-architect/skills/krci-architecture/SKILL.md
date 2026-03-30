---
name: KRCI Architecture
description: This skill should be used when planning KubeRocketCI features, validating technical designs, making architectural decisions for the KRCI platform, or when the user asks about "KRCI reference architecture", "platform architecture", "DevSecOps principles", "deployment patterns", "validate design against KRCI", "check KRCI architecture alignment", "plan KRCI feature implementation", "multi-cluster architecture", or mentions KRCI platform design decisions. For delegating implementation to specialized agents, defer to agent-delegation.
---

# KubeRocketCI Reference Architecture

## Core Principles

Non-negotiable architectural constraints. Every design must satisfy them.

**Cloud-agnostic on Kubernetes**: Runs on any Kubernetes or OpenShift cluster. Never introduce platform-specific dependencies. Use standard Kubernetes primitives and Helm for packaging.

**OIDC everywhere via Keycloak**: All platform tools and Kubernetes clusters authenticate through OIDC. Keycloak serves as the identity broker. No tool should have its own user database.

**DevSecOps as mandatory gates**: Every CI pipeline includes SAST scanning and SonarQube analysis as blocking gates. These are not advisory.

**GitOps with Argo CD**: Non-production uses push model (platform Argo CD deploys to targets). Production uses pull model (dedicated Argo CD pulls from Git). See `references/deployment-patterns.md` for cluster topologies.

**Build once, deploy everywhere**: Artifacts are built once in CI and promoted through environments unchanged.

## Component Interaction Patterns

The architect agent prompt has the complete component-to-repository mapping. These workflows describe how components interact at runtime.

### Developer Workflow

Developer authenticates via OIDC -> accesses Portal -> creates codebases (Codebase Operator scaffolds Git repos) -> pushes code -> Git webhook triggers Tekton pipeline -> pipeline runs build/test/scan/quality gates -> artifacts stored in registry -> CD Pipeline Operator promotes to next environment -> Argo CD deploys.

### CI Pipeline Flow

Git event -> Tekton Trigger interceptor chain (CEL filter -> VCS validation -> pipeline selection) -> pipeline tasks (clone -> build -> test -> scan -> quality gate -> image push) -> quality gates are blocking -> on success: artifact tagged, image pushed -> Codebase Operator updates CodebaseBranch status.

### CD Pipeline Flow

CD Pipeline Operator receives promotion trigger -> updates Argo CD Application manifests -> for non-prod: Argo CD pushes to target cluster -> for prod: Operator commits to Git, production Argo CD pulls -> environment progression: dev -> test -> UAT -> staging -> production.

## Security Architecture

**OIDC flow**: Keycloak brokers to corporate IdPs. Portal uses OIDC login with tokens passed to tRPC backend for K8s API calls. Kubernetes API validates OIDC tokens, Keycloak groups map to RBAC roles. All tools (SonarQube, Nexus, Argo CD) configured as OIDC clients. The Keycloak Operator manages realm/client/group CRDs declaratively.

**Security gates**: SAST scanning (blocking), SonarQube analysis (blocking), artifact verification (signing), secret management via External Secrets Operator (never commit secrets to Git).

## Integration Points

**Adding a new pipeline**: Tekton Pipeline/Task in edp-tekton following onboarding conventions. Helm chart templates. Connect to VCS via existing trigger patterns.

**Extending the Portal**: React/TypeScript with tRPC. Portal reads/writes Kubernetes CRDs directly.

**Creating/modifying operators**: Go-based with CRDs and controller-runtime. Integrate with Codebase or CD Pipeline Operator as needed.

**Adding platform tools**: Deploy via Helm through edp-cluster-add-ons (ArgoCD app-of-apps). Must integrate with Keycloak for OIDC.

## Design Validation Checklist

### Must Have (blocking)

- Works on any Kubernetes distribution (no cloud-specific deps)
- Integrates with Keycloak for OIDC
- Includes SAST and quality gates in any new pipeline
- Uses Argo CD for deployment (push non-prod, pull prod)
- Production in dedicated, isolated cluster

### Should Have (justify if missing)

- Proper integration with existing components
- Prometheus metrics and OpenSearch logging
- Artifact storage with verification
- Migration path for breaking changes
- Tests covering integration surfaces

### Consider (note if deferred)

- OpenTelemetry tracing
- Multi-cluster topology implications
- Environment-specific configuration
- Feature flags for gradual rollout

## Common Patterns

**New application type**: Template (Git skeleton + Dockerfile) -> Tekton pipelines -> quality gates -> artifact config -> CD pipeline config -> Portal UI if needed.

**Multi-repo features**: Design data contracts first -> implement API surface (CRDs, tRPC routes) -> implement consumers (Portal, pipeline tasks) -> coordinate integration testing.

**Breaking changes**: Add new alongside old -> update consumers -> deprecation period -> remove old in next release.

## Additional Resources

For cluster allocation strategies and GitOps configuration, see **`references/deployment-patterns.md`** (read when designing deployment topology or configuring GitOps repos).

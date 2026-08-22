---
name: KRCI Architecture
description: This skill should be used when planning KubeRocketCI features, validating technical designs, making architectural decisions for the KRCI platform, or when the user asks about "KRCI reference architecture", "platform architecture", "DevSecOps principles", "deployment patterns", "validate design against KRCI", "check KRCI architecture alignment", "plan KRCI feature implementation", "multi-cluster architecture", "validate this design on the testbed before planning the implementation", or mentions KRCI platform design decisions. For general ecosystem questions ("which plugin should I use"), defer to krci-help's krci-sdlc-framework; for reproducing a bug or verifying a specific code change on the cluster, defer to krci-triage's krci-testbed skill.
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# KubeRocketCI Reference Architecture

## Mandatory Prerequisites: Workspace and Testbed

Two artifacts are **required** before any architecture work. Resolve both paths and confirm them with the user before proceeding — no exceptions:

- **krci-workspace** — the source checkout: a directory containing `repos.yaml` and `sources/`
- **try-kuberocketci** — the local testbed: a directory containing `kind/`, `Makefile`, and `CLAUDE.md`

Resolution rules:

1. For each artifact, check **the cwd itself first** (it may be the artifact), then its subdirectories down to two levels below the cwd. All markers must be co-located in the same directory. Never search parent directories or siblings — do not go up the filesystem.
2. If either artifact is not found — or more than one candidate matches it — **HALT**. Use AskUserQuestion: for a missing artifact, ask for the exact path to an existing checkout or approval to provision it (workspace: `git clone git@github.com:KubeRocketCI/krci-workspace.git` then `./bootstrap.sh`, or `/krci-triage:bootstrap-workspace`; testbed: `/krci-triage:setup-testbed`); for multiple candidates, ask the user to pick one.
3. Restate both resolved absolute paths via AskUserQuestion and continue only after the user confirms them. Never guess a path and never proceed with only one of the two artifacts.

The workspace is the single source of truth for the repo set:

- `repos.yaml` — the full component manifest (dir, clone URL, group, description)
- `sources/<name>/` — each component checked out as its own git repo
- `sources/CLAUDE.md` — the maintained component map and cross-repo data flow. Read it instead of relying on any static component list; static lists drift.
- `./bootstrap.sh --list` shows components; `./bootstrap.sh <name>` clones missing ones

**Search caveat**: `sources/` is git-ignored, so ripgrep (Grep/Glob) from the workspace root silently skips it. Always scope searches to a path — `rg "<pattern>" sources/` or `rg "<pattern>" sources/<repo>/` — or pass `--no-ignore`. `Read`, `Bash`, and per-repo `git` are unaffected.

## Core Principles

Non-negotiable architectural constraints. Every design must satisfy them.

**Cloud-agnostic on Kubernetes**: Runs on any Kubernetes or OpenShift cluster. Never introduce platform-specific dependencies. Use standard Kubernetes primitives and Helm for packaging.

**OIDC everywhere via Keycloak**: All platform tools and Kubernetes clusters authenticate through OIDC. Keycloak serves as the identity broker. No tool should have its own user database.

**DevSecOps as mandatory gates**: Every CI pipeline includes SAST scanning and SonarQube analysis as blocking gates. These are not advisory.

**GitOps with Argo CD**: Non-production uses push model (platform Argo CD deploys to targets). Production uses pull model (dedicated Argo CD pulls from Git). See `references/deployment-patterns.md` for cluster topologies.

**Build once, deploy everywhere**: Artifacts are built once in CI and promoted through environments unchanged.

## Component Interaction Patterns

The maintained component-to-repository mapping lives in the workspace's `sources/CLAUDE.md` (see "Mandatory Prerequisites"). These workflows describe how components interact at runtime.

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

**Adding a new pipeline**: Tekton Pipeline/Task in the pipelines-library repo (find it in the workspace map) following onboarding conventions. Helm chart templates. Connect to VCS via existing trigger patterns.

**Extending the Portal**: React/TypeScript with tRPC. Portal reads/writes Kubernetes CRDs directly.

**Creating/modifying operators**: Go-based with CRDs and controller-runtime. Integrate with Codebase or CD Pipeline Operator as needed.

**Adding platform tools**: Deploy via Helm through the cluster add-ons repo (Argo CD app-of-apps). Must integrate with Keycloak for OIDC.

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

## Empirical Validation on the Testbed

Paper validation (the checklist above) is not always enough. When a design or hypothesis can be proven by running it — a pipeline change, an operator behavior, a CR interaction — prefer validating it on the **try-kuberocketci** testbed: a local kind cluster running the full platform (Git, Tekton, Argo CD, SonarQube, Portal).

- Before reaching for the cluster, check whether the component's own test suite (unit or e2e) already exercises the hypothesis — it may confirm or refute it without a testbed.
- The testbed path is already resolved and user-confirmed as a mandatory prerequisite (see "Mandatory Prerequisites") — use that path; never re-discover it.
- The testbed repo's own `CLAUDE.md` and `Makefile` are authoritative for stand-up, targets, and validation entry points (`make status`, `make e2e*`). Do not duplicate that knowledge here.
- For deploying modified components and cluster-verification tactics, defer to the `krci-triage` plugin's **krci-testbed** skill. For root-causing a suspected bug in an existing component (as opposed to validating a new design), the end-to-end workflow is `/krci-triage:krci-fix-the-issue`.

Use the testbed to answer "does this actually work?" before committing to a cross-repo implementation plan. State in the design output whether the approach was validated empirically or only on paper.

## Additional Resources

For cluster allocation strategies and GitOps configuration, see **`references/deployment-patterns.md`** (read when designing deployment topology or configuring GitOps repos).

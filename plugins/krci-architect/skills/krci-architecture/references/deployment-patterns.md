# KRCI Deployment Patterns

KRCI-specific deployment topology and GitOps configuration. For generic Kubernetes strategies (blue-green, canary, HA, DR), use your existing knowledge. Read this when designing deployment topology or configuring GitOps repos.

## Cluster Allocation Strategies

Three supported topologies. Choice depends on security requirements and budget.

**Single cluster (cost-effective):**

- Cluster 1: Platform (operators, portal, Tekton) + dev + test
- Cluster 2: Staging
- Cluster 3: Production (isolated, dedicated Argo CD)

**Dev + Platform separation (recommended):**

- Cluster 1: Platform components (operators, portal, Tekton)
- Cluster 2: Development workloads (dev/QA/UAT)
- Cluster 3: Staging (dedicated Argo CD)
- Cluster 4: Production (isolated, dedicated Argo CD)

**Full separation (high security):**

- Cluster 1: Platform components
- Clusters 2-5: One per environment (dev, test, UAT, staging)
- Cluster 6: Production (isolated, dedicated Argo CD)

In all topologies, production requires its own cluster with a dedicated Argo CD instance.

## GitOps: Push vs Pull Model

This is a hard architectural requirement.

**Non-production (push):** A single Argo CD in the platform cluster pushes to dev/test/staging clusters. The CD Pipeline Operator creates Argo CD Application resources directly.

**Production (pull):** A dedicated Argo CD runs inside the production cluster. It pulls manifests from Git. The CD Pipeline Operator only commits manifests to Git — never touches production directly. This ensures production isolation: no inbound connections from platform.

**Network implication:** Platform cluster needs access to non-prod clusters (push). Production cluster only needs outbound HTTPS to Git and artifact registry.

## GitOps Repositories

**Platform install chart repo**: The umbrella Helm chart that installs all KRCI operators, CRDs, RBAC. Values file controls which components are enabled. Explore its `charts/` directory for installation structure.

**Cluster add-ons repo**: Argo CD app-of-apps for cluster tooling (SonarQube, Nexus, Keycloak). Each add-on has its own directory with Helm values. Toggled via feature flags in the root Application. All tools integrate with Keycloak SSO. Both repos are identified in the workspace map (`repos.yaml`, `sources/CLAUDE.md`).

## Environment Progression

```text
dev --> test --> UAT --> staging --> production
```

Artifacts built once, promoted unchanged. CD Pipeline Operator manages promotion logic. Automatic for dev-to-test; manual approval for staging-to-production.

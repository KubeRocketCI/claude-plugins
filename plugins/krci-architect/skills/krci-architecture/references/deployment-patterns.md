# KRCI Deployment Patterns

Comprehensive deployment strategies and multi-cluster architecture patterns for KubeRocketCI.

## Environment Strategy

### Environment Tiers

**Development**: Rapid iteration, minimal controls, shared resources acceptable.

**Testing/QA**: Automated and manual testing, quality gates, may share cluster with development for cost efficiency.

**UAT**: User acceptance testing, production-like configuration, isolated from development.

**Staging**: Pre-production validation, identical configuration to production, separate cluster recommended.

**Production**: **Mandatory isolation**, dedicated cluster, highest security and reliability standards.

### Environment Progression

**Standard Flow**:

```
dev → test → UAT → staging → production
```

**Quality Gates Between Environments**:

- Code quality (SonarQube thresholds)
- Security scanning (SAST clean or approved exceptions)
- Test coverage (minimum coverage requirements)
- Manual approval (for production promotion)

### Cluster Allocation Strategies

**Option 1: Shared Non-Production (Cost-Effective)**

```
- Cluster 1: Platform + dev + test environments
- Cluster 2: Staging environment
- Cluster 3: Production environment (isolated)
```

**Option 2: Separated Environments (Recommended)**

```
- Cluster 1: Platform components (operators, portal, Tekton)
- Cluster 2: Development workloads (DEV/QA/UAT)
- Cluster 3: Staging environment (isolated, dedicated Prod Argo CD)
- Cluster 4: Production environment (isolated, dedicated Prod Argo CD)
```

**Option 3: Fully Isolated (High Security)**

```
- Cluster 1: Platform components
- Cluster 2: Development
- Cluster 3: Testing
- Cluster 4: UAT
- Cluster 5: Staging (isolated, dedicated Prod Argo CD)
- Cluster 6: Production (isolated, dedicated Prod Argo CD)
```

## GitOps Deployment Models

### Push Model (Non-Production)

**Usage**: Development, testing, staging environments

**Pattern**:

1. CD Pipeline Operator in platform cluster
2. Operator creates/updates Argo CD Application
3. Argo CD in platform cluster syncs to target cluster
4. Manifests from Git repository applied to target

**Advantages**:

- Centralized management
- Single Argo CD instance
- Simpler configuration

**Disadvantages**:

- Platform cluster has access to all environments
- Not suitable for production isolation

### Pull Model (Production)

**Usage**: **Required for production environments**

**Pattern**:

1. CD Pipeline Operator pushes manifests to Git
2. Dedicated Argo CD instance runs in production cluster
3. Argo CD pulls manifests from Git repository
4. Synchronizes production cluster state with Git
5. No external cluster access to production

**Advantages**:

- Production completely isolated
- No inbound connections from platform
- Production Argo CD only accesses Git (read-only)
- Meets high security requirements

## Multi-Cluster Architecture

### Hub-and-Spoke Pattern

**Platform Cluster (Hub)**:

- Runs KRCI operators (Codebase, CD Pipeline, Keycloak)
- Hosts KubeRocketCI Portal
- Executes Tekton pipelines
- Stores artifacts
- Manages non-production Argo CD

**Environment Clusters (Spokes)**:

- Run application workloads
- Receive deployments via Argo CD
- Production cluster has dedicated Argo CD (pull model)

**Network Requirements**:

- Platform cluster can reach development/staging clusters (push model)
- Production cluster only requires Git access (pull model)
- All clusters reach artifact registry for image pulls
- All clusters reach Keycloak for authentication

### Network Segmentation

**Production Isolation**:

- Dedicated network segment for production cluster
- No inbound connections from platform cluster
- Only outbound to Git repository (HTTPS)
- Only outbound to artifact registry (HTTPS)
- No cross-environment communication

**Non-Production Networks**:

- May share network space
- Platform cluster can access for deployment
- Proper firewall rules between environments

## Artifact Promotion

### Build Once, Deploy Everywhere

**Pattern**:

1. Build artifact in development pipeline
2. Tag artifact with version (semantic versioning)
3. Store in artifact registry
4. Promote same artifact through environments
5. Never rebuild between environments

**Advantages**:

- Consistency across environments
- Faster deployments
- Immutable artifacts
- Clear provenance

### Promotion Workflow

**Automatic Promotion (Dev → Test)**:

```
Build successful → Tests pass → Auto-deploy to test
```

**Manual Promotion (Test → UAT → Staging)**:

```
Tests complete → QA approval → Manual trigger → Deploy to UAT
UAT validated → PM approval → Manual trigger → Deploy to staging
```

**Controlled Promotion (Staging → Production)**:

```
Staging validated → Change management approval → Manual trigger → Update Git manifest → Production Argo CD pulls changes
```

### Versioning Strategy

**Semantic Versioning**: `MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]`

**Examples**:

- `1.2.3-dev.20230315.abc123` - Development build
- `1.2.3-rc.1` - Release candidate
- `1.2.3` - Production release

**Tagging**:

- Docker images tagged with version
- Git tags on release branches
- Helm charts versioned independently

## Configuration Management

TODO: krci-giops

### Secret Management

**Development/Testing**:

- Kubernetes Secrets acceptable
- Sealed Secrets for Git storage

**Production**:

- External secret store (AWS Parameter Store, Vault, Azure Key Vault)
- External Secrets Operator integration
- Never commit secrets to Git
- Rotate secrets regularly

## High Availability Patterns

### Platform Cluster HA

**Operators**:

- Multiple replicas with leader election
- Distributed across availability zones
- Health checks and automatic restart

**Tekton**:

- Tekton controllers highly available
- Pipeline runs on ephemeral pods (failures retried)

**Portal**:

- Multiple replicas behind load balancer
- Session affinity if needed
- StatefulSets for persistent sessions

### Production Application HA

**Deployment Strategy**:

- Minimum 3 replicas across availability zones
- Pod Disruption Budgets configured
- Resource requests/limits defined
- Liveness and readiness probes

**Rolling Updates**:

```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1
    maxUnavailable: 0
```

## Disaster Recovery

### Backup Strategy

**Critical Data**:

- Git repositories (source of truth)
- Artifact registry (backup images)
- Keycloak data (user accounts, permissions)
- Persistent volumes (if used)

**Not Backed Up** (Recreatable from Git):

- Kubernetes resources (deployed via GitOps)
- Tekton pipeline runs (history retained, not critical)
- Temporary build artifacts

### Recovery Procedures

**Platform Cluster Failure**:

1. Provision new Kubernetes cluster
2. Restore Keycloak data
3. Install KRCI operators from Helm charts
4. Configure operators pointing to Git repositories
5. Operators reconcile desired state from CRDs in Git

**Production Cluster Failure**:

1. Provision new production cluster
2. Install Argo CD
3. Configure Argo CD to pull from Git
4. Argo CD restores all applications from Git
5. Restore any persistent data from backups

## Cloud-Specific Patterns

### AWS

**EKS Clusters**: Use for all Kubernetes clusters

**Artifact Storage**: ECR for container images

**Secret Management**: AWS Parameter Store or Secrets Manager

**Networking**: VPC per environment with peering for non-production

### Azure

**AKS Clusters**: Use for all Kubernetes clusters

**Artifact Storage**: Azure Container Registry

**Secret Management**: Azure Key Vault

**Networking**: VNet per environment with peering for non-production

### On-Premises

**Kubernetes Distribution**: OpenShift or vanilla Kubernetes

**Artifact Storage**: Nexus or Harbor

**Secret Management**: HashiCorp Vault

**Networking**: Isolated VLANs per environment

## Scaling Patterns

### Horizontal Scaling

**Applications**:

- Horizontal Pod Autoscaler based on CPU/memory
- Custom metrics (queue length, request rate)
- Manual scaling for predictable load

**Tekton**:

- Pipeline runs scale automatically (Kubernetes pods)
- Task pods sized per task requirements
- Parallel execution where possible

### Cluster Scaling

**Node Autoscaling**:

- Cluster Autoscaler for dynamic node pools
- Different node pools for different workloads (CI vs. apps)
- Spot/preemptible instances for CI workloads

## Migration Patterns

### Blue-Green Deployment

1. Deploy new version to "green" environment
2. Validate green environment
3. Switch traffic to green
4. Keep blue for rollback
5. Decommission blue after validation period

### Canary Deployment

1. Deploy new version to canary subset (10%)
2. Monitor metrics and errors
3. Gradually increase canary percentage (25%, 50%, 100%)
4. Rollback if issues detected
5. Complete rollout when validated

### Database Migrations

**Pattern**:

1. Schema changes backward compatible
2. Deploy new application version
3. Migrate data
4. Remove backward compatibility code in next version

**Never**:

- Breaking schema changes without migration path
- Simultaneous app and schema updates
- Irreversible migrations without backups

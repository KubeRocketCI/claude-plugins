# KubeRocketCI Platform Components

Detailed descriptions of all platform components, their responsibilities, and interactions.

## Operators

### CD Pipeline Operator

Repository: edp-cd-pipeline-operator
GitHub: <https://github.com/epam/edp-cd-pipeline-operator>
Language: Go
Purpose: Manages CD pipelines and deployment workflows

Key Responsibilities:

- Define and manage CD Pipeline custom resources
- Integrate with Argo CD for GitOps deployment
- Implement artifact promotion logic
- Trigger CD pipelines based on events
- Manage environment-specific configurations

CRDs:

- `CDPipeline`: Defines continuous delivery pipeline
- `Stage`: Represents deployment environment (dev, qa, prod)

Integration Points:

- Argo CD: Creates/updates Applications for deployment
- Tekton: Receives build artifacts from CI pipelines
- Codebase Operator: Links to source codebases
- Portal: Provides UI for pipeline management

### Codebase Operator

Repository: edp-codebase-operator
GitHub: <https://github.com/epam/edp-codebase-operator>
Language: Go
Purpose: Manages application codebases and Git integration

Key Responsibilities:

- Scaffold new applications from templates
- Manage Git repository integration
- Handle versioning and branching strategies
- Coordinate with Git servers (GitHub, GitLab, Bitbucket)

CRDs:

- `Codebase`: Represents application or library codebase
- `CodebaseBranch`: Manages Git branches
- `GitServer`: Defines Git server configuration

Integration Points:

- Git Servers: Creates/manages repositories
- Tekton: Triggers pipelines on codebase changes
- Portal: Provides codebase management UI

## CI/CD Components

### Tekton

Repository: edp-tekton
GitHub: <https://github.com/epam/edp-tekton>
Type: Helm chart with custom tasks and pipelines
Purpose: Kubernetes-native CI/CD framework

Structure:

- Tasks: Reusable units of work (build, test, scan, push)
- Pipelines: Workflows composing multiple tasks
- Triggers: Event-driven pipeline activation
- Interceptors: Go-based request processing and filtering (webhook validation, event transformation, pipeline routing)

Note: edp-tekton is a mixed-language repository. Pipeline/task YAML and Helm charts are handled by the krci-devops agent. Go-based interceptors and custom logic are handled by the krci-godev agent.

Key Pipelines:

- build: Build application artifacts
- review: Validate pull/merge requests
- deploy: Deploy applications to environments

Common Tasks:

- `git-clone`: Clone source repository
- `build-image`: Build container image
- `sonar-scanner`: Run SonarQube analysis
- `push-to-registry`: Push image to registry

Trigger Types:

- GitHub webhooks
- GitLab webhooks
- Gerrit webhooks
- Bitbucket webhooks

Interceptor Chain:

1. CEL Interceptor: Filter and transform events
2. GitHub/GitLab/Gerrit Interceptor: Extract metadata
3. CEL Interceptor: Route to correct pipeline

### Argo CD

Type: Deployment tool (installed separately)
Purpose: GitOps continuous delivery

Usage in KRCI:

- Operational Workloads: Cluster add-ons
- Business Workloads: Applications deployed by ArgoCD managed by CD Pipeline Operator

Integration:

- CD Pipeline Operator creates `ApplicationSet` resources
- Git repository contains deployment manifests
- Argo CD synchronizes cluster state with Git

## Portal

### KubeRocketCI Portal

Repository: krci-portal
GitHub: <https://github.com/KubeRocketCI/krci-portal>
Technology: React, TypeScript, Radix UI, Tailwind CSS, tRPC
Purpose: Central UI for platform interaction

Key Features:

- Codebase management (create, view, configure)
- CD pipeline visualization
- Stage management and promotion
- Tekton pipeline monitoring
- User and permission management
- Configuration management

Architecture:

- Frontend: React with Radix UI components, Tailwind CSS styling
- Backend: tRPC API for type-safe communication
- State Management: React Query for server state
- Routing: React Router with role-based access
- Authentication: Keycloak OIDC integration

## Authentication and Security

### Keycloak Operator

Repository: edp-keycloak-operator
GitHub: <https://github.com/epam/edp-keycloak-operator>
Language: Go
Purpose: Manages Keycloak realms, clients, and users

Key Responsibilities:

- Configure Keycloak realms
- Create OAuth clients for platform tools
- Manage groups and role mappings
- Synchronize platform resources with Keycloak

CRDs:

- `KeycloakRealm`: Keycloak realm configuration
- `KeycloakClient`: OAuth client for platform tools
- `KeycloakRealmGroup`: Group definitions
- `KeycloakRealmRole`: Role definitions

Integration:

- Authenticates all platform tools (Portal, SonarQube, Nexus, etc.)
- Provides OIDC for Kubernetes API access
- Brokers with corporate IdPs (Active Directory, LDAP)

## Quality and Artifact Management

### SonarQube Operator

Repository: edp-sonar-operator
GitHub: <https://github.com/epam/edp-sonar-operator>
Language: Go
Purpose: Manages SonarQube instances and projects

Key Responsibilities:

- Deploy SonarQube instances
- Create and configure projects
- Manage quality gates
- Integrate with Keycloak

CRDs:

- `Sonar`: SonarQube instance
- `SonarQualityGate`: Quality gate configuration
- `SonarQualityProfile`: Code quality profile

### Nexus Operator

Repository: edp-nexus-operator
GitHub: <https://github.com/epam/edp-nexus-operator>
Language: Go
Purpose: Manages Nexus Repository instances

Key Responsibilities:

- Deploy Nexus instances
- Configure repositories (Maven, npm, Docker, etc.)
- Manage cleanup policies
- Integrate with Keycloak

CRDs:

- `Nexus`: Nexus instance
- `NexusRepository`: Repository configuration

## Supporting Components

### GitFusion

Repository: gitfusion
GitHub: <https://github.com/KubeRocketCI/gitfusion>
Language: Go
Purpose: Unified Git interface for multiple VCS providers

Capabilities:

- Abstracts Git operations across GitHub, GitLab, Gerrit, Bitbucket
- Provides consistent API for Git interactions
- Simplifies multi-VCS support

### KRCI Cache

Repository: krci-cache
GitHub: <https://github.com/KubeRocketCI/krci-cache>
Language: Go
Purpose: Caching layer for CI/CD pipelines artifacts and dependencies

Features:

- Dependency caching for builds
- Shared cache across pipeline runs

### Tekton Custom Tasks

Repository: tekton-custom-task
GitHub: <https://github.com/KubeRocketCI/tekton-custom-task>
Language: Go
Purpose: Custom Tekton task implementations

Examples:

- Advanced security scanning
- Custom deployment strategies
- Integration with external systems

## Component Communication

### Operator to Operator

Operators communicate via Kubernetes resources:

- Codebase Operator creates codebases
- CD Pipeline Operator references codebases and creates cdpipelines with stages and Argo CD Applications

### Operator to Portal

Portal uses Kubernetes API and tRPC:

- Read K8s resources (codebases, pipelines, stages)
- Create/update resources via API
- WebSocket for real-time updates

### Pipeline to Operator

Tekton pipelines interact with operators:

- Codebase Operator provides source information
- CD Pipeline Operator receives build artifacts
- Status updates via K8s events

### Tool Integration

Tools integrate via:

- Keycloak: OIDC authentication
- Webhooks: Event notifications
- APIs: Programmatic access
- Kubernetes: Shared infrastructure

## Platform Installation

### edp-install

Repository: edp-install
GitHub: <https://github.com/epam/edp-install>
Type: Helm chart
Purpose: Core platform installation chart

Key Responsibilities:

- Install and configure all KRCI platform operators
- Manage CRD lifecycle (install, upgrade)
- Configure inter-component dependencies
- Provide values-based customization for all platform components
- Support upgrade paths between platform versions

Structure:

- Main Helm chart with sub-charts for each operator
- Values file configures component features, replicas, resources
- CRD templates for all custom resources
- RBAC and ServiceAccount templates

### edp-cluster-add-ons

Repository: edp-cluster-add-ons
GitHub: <https://github.com/epam/edp-cluster-add-ons>
Type: Helm charts / ArgoCD Applications
Purpose: Cluster add-ons management using ArgoCD app-of-apps pattern

Key Responsibilities:

- Deploy supporting tools (SonarQube, Nexus, Keycloak, etc.)
- Manage ArgoCD Application definitions for each add-on
- Provide standardized configuration for cluster tooling
- Support optional add-on installation via feature flags

Structure:

- ArgoCD app-of-apps pattern: root Application references child Applications
- Each add-on has its own directory with Helm values
- Supports customization per environment/cluster
- Integrates with Keycloak for SSO across all tools

### KubeRocketCI Documentation

Repository: docs (krci-docs)
GitHub: <https://github.com/KubeRocketCI/docs>
Type: Documentation
Purpose: Official KubeRocketCI platform documentation

Key Responsibilities:

- User guides and getting started documentation
- API references for CRDs and operators
- Architecture decision records (ADRs)
- Deployment and configuration guides
- Troubleshooting and FAQ

## Component Lifecycle

### Installation

Components installed via:

1. Core Platform: edp-install Helm chart. GitHub: <https://github.com/epam/edp-install>
2. Optional Operators: Individual Helm charts
3. Cluster Add-ons: edp-cluster-add-ons repository. GitHub: <https://github.com/epam/edp-cluster-add-ons>

### Upgrade

Upgrades follow:

1. Review release notes for breaking changes
2. Update CRDs if schema changes
3. Upgrade operator deployments
4. Validate functionality

### Configuration

Configuration managed through:

- CRDs: Declarative component configuration
- ConfigMaps: Application settings
- Secrets: Sensitive data
- Portal UI: User-friendly configuration interface

## Monitoring Components

Components emit:

- Metrics: Prometheus-format metrics
- Logs: Structured JSON logs to OpenSearch
- Traces: OpenTelemetry traces
- Events: Kubernetes events for state changes

Monitor via:

- Prometheus for metrics and alerting
- OpenSearch for log analysis
- Grafana for visualization
- Jaeger for distributed tracing

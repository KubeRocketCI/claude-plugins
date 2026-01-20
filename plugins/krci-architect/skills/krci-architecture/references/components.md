# KubeRocketCI Platform Components

Detailed descriptions of all platform components, their responsibilities, and interactions.

## Operators

### CD Pipeline Operator

**Repository**: edp-cd-pipeline-operator
**GitHub**: <https://github.com/epam/edp-cd-pipeline-operator>
**Language**: Go
**Purpose**: Manages CD pipelines and deployment workflows

**Key Responsibilities:**

- Define and manage CD Pipeline custom resources
- Integrate with Argo CD for GitOps deployment
- Implement artifact promotion logic
- Trigger CD pipelines based on events
- Manage environment-specific configurations

**CRDs:**

- `CDPipeline`: Defines continuous delivery pipeline
- `Stage`: Represents deployment environment (dev, qa, prod)
- `PipelineRun`: Execution instance of CD pipeline

**Integration Points:**

- Argo CD: Creates/updates Applications for deployment
- Tekton: Receives build artifacts from CI pipelines
- Codebase Operator: Links to source codebases
- Portal: Provides UI for pipeline management

### Codebase Operator

**Repository**: edp-codebase-operator
**GitHub**: <https://github.com/epam/edp-codebase-operator>
**Language**: Go
**Purpose**: Manages application codebases and Git integration

**Key Responsibilities:**

- Scaffold new applications from templates
- Manage Git repository integration
- Handle versioning and branching strategies
- Manage Jira integration for issue tracking
- Coordinate with Git servers (GitHub, GitLab, Gerrit, Bitbucket)

**CRDs:**

- `Codebase`: Represents application or library codebase
- `CodebaseBranch`: Manages Git branches
- `GitServer`: Defines Git server configuration
- `JiraServer`: Configures Jira integration

**Integration Points:**

- Git Servers: Creates/manages repositories
- Tekton: Triggers pipelines on codebase changes
- Jira: Links commits to issues
- Portal: Provides codebase management UI

## CI/CD Components

### Tekton

**Repository**: edp-tekton
**GitHub**: <https://github.com/epam/edp-tekton>
**Type**: Helm chart with custom tasks and pipelines
**Purpose**: Kubernetes-native CI/CD framework

**Structure:**

- **Tasks**: Reusable units of work (build, test, scan, push)
- **Pipelines**: Workflows composing multiple tasks
- **Triggers**: Event-driven pipeline activation
- **Interceptors**: Request processing and filtering

**Key Pipelines:**

- **build**: Build application artifacts
- **review**: Validate pull/merge requests
- **deploy**: Deploy applications to environments

**Common Tasks:**

- `git-clone`: Clone source repository
- `build-image`: Build container image
- `sonar-scanner`: Run SonarQube analysis
- `push-to-registry`: Push image to registry
- `helm-deploy`: Deploy via Helm

**Trigger Types:**

- GitHub webhooks
- GitLab webhooks
- Gerrit webhooks
- Bitbucket webhooks

**Interceptor Chain**:

1. CEL Interceptor: Filter and transform events
2. GitHub/GitLab/Gerrit Interceptor: Extract metadata
3. CEL Interceptor: Route to correct pipeline

### Argo CD

**Type**: Deployment tool (installed separately)
**Purpose**: GitOps continuous delivery

**Usage in KRCI:**

- **Operational Workloads**: Cluster add-ons, infrastructure (recommended: dedicated instance)
- **Business Workloads**: Applications deployed by CD Pipeline Operator
- **Production**: Dedicated Argo CD instance in production cluster (pull model)

**Integration:**

- CD Pipeline Operator creates `Application` resources
- Git repository contains deployment manifests
- Argo CD synchronizes cluster state with Git

## Portal

### KubeRocketCI Portal

**Repository**: krci-portal (edp-headlamp)
**GitHub**: <https://github.com/epam/edp-headlamp>
**Technology**: React, TypeScript, Radix UI, Tailwind CSS, tRPC
**Purpose**: Central UI for platform interaction

**Key Features:**

- Codebase management (create, view, configure)
- CD pipeline visualization
- Stage management and promotion
- Tekton pipeline monitoring
- User and permission management
- Configuration management

**Architecture:**

- **Frontend**: React with Radix UI components, Tailwind CSS styling
- **Backend**: tRPC API for type-safe communication
- **State Management**: React Query for server state
- **Routing**: React Router with role-based access
- **Authentication**: Keycloak OIDC integration

**Component Structure:**

```
src/
├── components/     - Reusable UI components
├── pages/          - Page-level components
├── routes/         - Routing configuration
├── api/            - tRPC API routes
├── hooks/          - Custom React hooks
└── utils/          - Utility functions
```

## Authentication and Security

### Keycloak Operator

**Repository**: edp-keycloak-operator
**GitHub**: <https://github.com/epam/edp-keycloak-operator>
**Language**: Go
**Purpose**: Manages Keycloak realms, clients, and users

**Key Responsibilities:**

- Configure Keycloak realms
- Create OAuth clients for platform tools
- Manage groups and role mappings
- Synchronize platform resources with Keycloak

**CRDs:**

- `KeycloakRealm`: Keycloak realm configuration
- `KeycloakClient`: OAuth client for platform tools
- `KeycloakRealmGroup`: Group definitions
- `KeycloakRealmRole`: Role definitions

**Integration:**

- Authenticates all platform tools (Portal, SonarQube, Nexus, etc.)
- Provides OIDC for Kubernetes API access
- Brokers with corporate IdPs (Active Directory, LDAP)

## Quality and Artifact Management

### SonarQube Operator

**Repository**: edp-sonar-operator
**GitHub**: <https://github.com/epam/edp-sonar-operator>
**Language**: Go
**Purpose**: Manages SonarQube instances and projects

**Key Responsibilities:**

- Deploy SonarQube instances
- Create and configure projects
- Manage quality gates
- Integrate with Keycloak

**CRDs:**

- `Sonar`: SonarQube instance
- `SonarQualityGate`: Quality gate configuration
- `SonarQualityProfile`: Code quality profile

### Nexus Operator

**Repository**: edp-nexus-operator
**GitHub**: <https://github.com/epam/edp-nexus-operator>
**Language**: Go
**Purpose**: Manages Nexus Repository instances

**Key Responsibilities:**

- Deploy Nexus instances
- Configure repositories (Maven, npm, Docker, etc.)
- Manage cleanup policies
- Integrate with Keycloak

**CRDs:**

- `Nexus`: Nexus instance
- `NexusRepository`: Repository configuration

## Supporting Components

### GitFusion

**Repository**: gitfusion
**Purpose**: Unified Git interface for multiple VCS providers

**Capabilities:**

- Abstracts Git operations across GitHub, GitLab, Gerrit, Bitbucket
- Provides consistent API for Git interactions
- Simplifies multi-VCS support

### KRCI Cache

**Repository**: krci-cache
**Purpose**: Caching layer for improved performance

**Features:**

- Dependency caching for builds
- Layer caching for container images
- Shared cache across pipeline runs

### Tekton Custom Tasks

**Repository**: tekton-custom-task
**Purpose**: Custom Tekton task implementations

**Examples:**

- Advanced security scanning
- Custom deployment strategies
- Integration with external systems

## Component Communication

### Operator to Operator

Operators communicate via Kubernetes resources:

- Codebase Operator creates codebases
- CD Pipeline Operator references codebases
- Gerrit Operator creates projects based on codebases

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

- **Keycloak**: OIDC authentication
- **Webhooks**: Event notifications
- **APIs**: Programmatic access
- **Kubernetes**: Shared infrastructure

## Component Lifecycle

### Installation

Components installed via:

1. **Core Platform**: edp-install Helm chart
2. **Optional Operators**: Individual Helm charts
3. **Cluster Add-ons**: edp-cluster-add-ons repository

### Upgrade

Upgrades follow:

1. Review release notes for breaking changes
2. Update CRDs if schema changes
3. Upgrade operator deployments
4. Validate functionality

### Configuration

Configuration managed through:

- **CRDs**: Declarative component configuration
- **ConfigMaps**: Application settings
- **Secrets**: Sensitive data
- **Portal UI**: User-friendly configuration interface

## Monitoring Components

Components emit:

- **Metrics**: Prometheus-format metrics
- **Logs**: Structured JSON logs to OpenSearch
- **Traces**: OpenTelemetry traces
- **Events**: Kubernetes events for state changes

Monitor via:

- Prometheus for metrics and alerting
- OpenSearch for log analysis
- Grafana for visualization
- Jaeger for distributed tracing

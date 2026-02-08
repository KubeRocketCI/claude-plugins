# KubeRocketCI Reference Architecture

Official reference architecture documentation for KubeRocketCI platform.

## Overview

The KubeRocketCI Reference Architecture serves as a blueprint for software delivery, outlining the best practices, tools, and technologies leveraged by the platform to ensure efficient and high-quality software development. It provides a comprehensive guide to navigate the complexities of software delivery, from code to deployment.

KubeRocketCI operates on Kubernetes, a leading open-source system for automating deployment, scaling, and management of containerized applications. It consolidates a variety of open-source tools, ensuring a flexible and adaptable system that can seamlessly run on any public cloud or on-premises infrastructure.

## Key Principles

The KubeRocketCI is built on these foundational principles:

### Managed Infrastructure and Container Orchestration

KubeRocketCI is based on a platform that leverages managed infrastructure and container orchestration, primarily through Kubernetes or OpenShift. Design solutions that work across Kubernetes distributions without vendor lock-in.

### Security

KubeRocketCI places high emphasis on security, covering aspects such as authentication, authorization, and Single Sign-On (SSO) for platform services. OIDC-based authentication ensures unified and secure access control.

### Development and Testing Toolset

KubeRocketCI provides a comprehensive set of tools for development and testing, ensuring a robust and reliable software delivery process. This includes Git integration, templating, automated analysis, and quality gates.

### Well-Established Engineering Process

KubeRocketCI reflects EPAM's well-established engineering practices (EngX) in its CI/CD pipelines and delivery analytics. Follow established patterns for build, test, deploy workflows.

### Open-Source and Cloud-Agnostic

As an open-source, cloud-agnostic solution, KubeRocketCI can be run on any preferred Kubernetes or OpenShift clusters. Avoid platform-specific dependencies.

### DevSecOps Excellence

KubeRocketCI empowers DevSecOps by making security a mandatory quality gate. Every pipeline includes SAST, code quality checks, and artifact verification.

### Automated Testing

KubeRocketCI ensures seamless and predictable regression testing through automated test analysis. Testing is integral to delivery, not an afterthought.

## Architecture Flow

### 1. Authentication and Access

Developers access the platform by authenticating with their corporate credentials. The platform utilizes OpenID Connect (OIDC) for authentication and authorization across all tools and Kubernetes clusters.

**Key Components:**

- Keycloak serves as identity broker integrating with existing IdPs
- OIDC establishes unified authentication across all platform tools
- Strict security protocols ensure consistency in auth policies

### 2. Developer Experience

Developers engage with the platform via the KubeRocketCI Portal, an intuitive interface offering a comprehensive overview of the platform's capabilities.

**Key Capabilities:**

- Generate new components (codebases)
- Integrate with version control systems
- Use Application Templates for standardized development
- Support for Java, Node.js, .NET, Python, and more
- Custom templates via KubeRocketCI Marketplace

### 3. CI/CD with Tekton

Tekton is a potent, adaptable, and cloud-native framework designed for crafting CI/CD systems.

**Features:**

- Shared, reusable components for build, test, deploy
- Cross-platform support (cloud providers, on-premises)
- Tekton Pipelines for efficient build, test, deploy workflows
- Tekton Triggers initiate pipelines based on specific events

### 4. Codebase Management

The Codebase Operator is a crucial part of the platform ecosystem.

**Responsibilities:**

- Manage codebases: creation, deletion, scaffolding
- Provide versioning, branching, and release capabilities
- Enable seamless integration with Git servers
- Jira integration for issue tracking

### 5. Quality and Security Tools

Cloud-agnostic tools provide various functionalities:

**Built-in Tooling:**

- Artifact storage (Nexus, AWS ECR, Azure Artifacts)
- Static security analysis (SAST tools)
- Code quality assessment (SonarQube, SonarCloud)

**Cloud Integration:**

- AWS Parameter Store for secrets
- AWS ECR for container images
- Azure DevOps Artifacts
- SonarCloud for cloud-based analysis

### 6. CD Pipeline Management

The CD Pipeline Operator oversees CD pipelines and their related resources.

**Capabilities:**

- Shared, reusable components for CD pipelines
- Integration with Tekton and Argo CD
- Kubernetes API interface for pipeline management
- Artifact promotion logic
- Event-driven CD pipeline triggering

### 7. GitOps Deployment

Argo CD is the pivotal deployment tool, embracing the GitOps delivery approach.

**Usage:**

- Deploy both operational and business workloads
- Recommended: dedicated Argo CD instance for operational workloads
- Kubernetes add-ons approach for streamlined management

### 8. Production Isolation

Production workloads operate in isolation within dedicated Kubernetes clusters.

**Requirements:**

- Highest isolation and operational integrity levels
- Dedicated clusters for production systems
- Pull model for production deployment (strongly recommended)
- Argo CD instance explicitly deployed for production environment

## Technology Stack

### Environment Distribution

KubeRocketCI upholds best practices in workload distribution:

**Environment Tiers:**

- Development
- Testing (manual/automation)
- User Acceptance (UAT)
- Staging
- Production

**Cluster Strategy:**

- Lower environments (dev, testing) may share clusters for efficiency
- **Production workloads MUST be in dedicated clusters**
- Ensures highest isolation, security, and resource allocation

### Observability Stack

**Prometheus:** Metrics collection, storage, and querying for comprehensive monitoring of system performance and health.

**OpenSearch:** Centralized logging enabling efficient log aggregation, analysis, and management across the platform.

**OpenTelemetry:** Standardized observability data collection, facilitating deep insights into platform behavior and performance. Supports OTLP protocol for external aggregators.

### Version Control Integration

KubeRocketCI integrates with:

- GitLab
- GitHub
- Bitbucket
- Gerrit

These systems enable efficient source code management, collaboration, and code review processes.

### Security Architecture

OIDC for authentication and authorization across:

- All platform tools
- Kubernetes clusters
- Unified authentication mechanism
- Seamless access control
- Consistent authentication and authorization policies

## Design Validation Against Architecture

When validating technical designs against KRCI reference architecture:

### Must Have

- Works on any Kubernetes distribution (cloud-agnostic)
- Integrates with Keycloak for unified auth (OIDC)
- Includes SAST and code quality checks (security quality gates)
- Uses Argo CD deployment patterns (GitOps)
- Production workloads in dedicated cluster (production isolation)

### Should Have

- Properly integrates with Tekton, Argo CD, operators, portal
- Includes Prometheus metrics, OpenSearch logging
- Proper artifact storage and verification
- Migration path for breaking changes

### Consider

- OpenTelemetry tracing support
- Multi-cluster deployment patterns
- Environment-specific configuration management

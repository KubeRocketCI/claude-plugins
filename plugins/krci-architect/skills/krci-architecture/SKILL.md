---
name: KRCI Architecture
description: This skill should be used when planning KubeRocketCI features, validating technical designs, making architectural decisions for the KRCI platform, or when the user asks about "KRCI reference architecture", "KRCI components", "platform architecture", "DevSecOps principles", "deployment patterns", "validate design against KRCI", "check KRCI architecture alignment", "plan KRCI feature implementation", "multi-cluster architecture", or mentions KRCI platform design decisions.
---

# KubeRocketCI Reference Architecture

## Overview

KubeRocketCI is a comprehensive CI/CD platform built on Kubernetes, integrating Tekton for CI, Argo CD for deployment, and a suite of tools for security, quality, and observability. Understanding the reference architecture ensures implementations align with platform principles and integrate seamlessly with existing components.

## Core Principles

KubeRocketCI is built on these foundational principles:

Managed Infrastructure and Container Orchestration: Platform leverages Kubernetes or OpenShift for all deployments. Design solutions that work across Kubernetes distributions without vendor lock-in.

Security as Priority: Authentication, authorization, and SSO integration across all services using OIDC. Keycloak serves as identity broker integrating with existing IdPs.

Development and Testing Toolset: Comprehensive tools for development (Git integration, templating), testing (automated analysis), and deployment (Tekton + Argo CD).

Well-Established Engineering Process: CI/CD pipelines reflect best practices. Follow established patterns for build, test, deploy workflows.

Open-Source and Cloud-Agnostic: Runs on any Kubernetes or OpenShift cluster. Avoid platform-specific dependencies.

DevSecOps Excellence: Security is a mandatory quality gate, not optional. Every pipeline includes SAST, code quality checks, and artifact verification.

Automated Testing: Seamless regression testing through automated test analysis. Testing is integral to delivery, not afterthought.

## Platform Components

### Core CI/CD Components

Tekton: Kubernetes-native CI/CD framework providing pipelines and tasks for build, test, and deploy workflows. All CI automation runs through Tekton.

Argo CD: GitOps deployment tool managing both operational and business workloads. Production uses dedicated Argo CD instance with pull-based deployment.

Codebase Operator: Manages codebases, Git integration, versioning, branching, and release capabilities. Provides scaffolding using application templates.

CD Pipeline Operator: Manages CD pipelines, artifact promotion logic, and Argo CD integration. Triggers CD pipelines based on events.

### Quality and Security Tools

SonarQube: Continuous code quality assessment. Every pipeline includes quality analysis.

SAST Tools: Static Application Security Testing integrated into pipelines as mandatory quality gates.

Artifact Storage: Dedicated storage (Nexus, AWS ECR, Azure Artifacts) for versioned application artifacts.

Artifact Verification: Cryptographic verification ensuring artifact integrity and authenticity.

### Platform Services

KubeRocketCI Portal: React/TypeScript UI using Radix UI, Tailwind CSS, and tRPC. Provides central hub for platform interaction.

Git Server Integration: Supports GitLab, GitHub, Bitbucket, Gerrit for source code management and collaboration.

Authentication: OIDC-based authentication and authorization across tools and Kubernetes clusters. Keycloak integrates with corporate IdPs.

### Observability Stack

Prometheus: Metrics collection, storage, and querying for monitoring system health.

OpenSearch: Centralized logging for log aggregation and analysis.

OpenTelemetry: Standardized observability data collection enabling deep platform insights.

## Component Interaction Patterns

### Developer Workflow

1. Developers authenticate via OIDC (Keycloak broker)
2. Access platform through KubeRocketCI Portal
3. Create/manage codebases using application templates
4. Git server integration manages source code
5. Tekton pipelines execute on code changes
6. Quality gates (SonarQube, SAST) validate code
7. Artifacts stored in artifact repository
8. CD Pipeline Operator creates Argo CD applications for deployment
9. Argo CD deploys to target environments

### CI Pipeline Flow

1. Tekton Triggers activate on Git events
2. Tekton Pipeline executes build/test tasks
3. Code quality analysis (SonarQube)
4. Security scanning (SAST tools)
5. Artifact creation and storage
6. Artifact verification
7. Promotion to CD pipeline

### CD Pipeline Flow

1. CD Pipeline Operator receives artifact
2. Promotion logic validates artifact readiness
3. Argo CD synchronizes deployment manifests
4. GitOps-based deployment to target cluster
5. Production uses dedicated Argo CD instance (pull model)

## Deployment Patterns

### Environment Separation

Development and Testing: May share Kubernetes clusters for efficiency.

Production Isolation: Critical requirement - Production workloads MUST run in dedicated clusters with highest isolation and security standards.

Environment Progression: dev → test/UAT → staging → production with quality gates between each.

### GitOps Deployment

Push Model: Suitable for non-production environments. Argo CD instance in platform cluster pushes to target environments.

Pull Model: Recommended for production. Dedicated Argo CD instance in production cluster pulls manifests, ensuring production isolation.

### Multi-Cluster Architecture

- Platform cluster: Runs KRCI platform components (operators, portal, Tekton)
- Development cluster: Development and test workloads
- Staging cluster: Pre-production validation
- Production cluster: Isolated production workloads with dedicated Argo CD

## Security Architecture

### Authentication and Authorization

All platform tools and Kubernetes clusters use OIDC for unified authentication. Keycloak brokers identity with existing corporate IdPs (Active Directory, LDAP, etc.).

Portal Access: OIDC authentication required
Git Access: SSH keys or OIDC tokens
Kubernetes Access: OIDC integration via Keycloak
Tool Access: Unified SSO across SonarQube, Nexus, etc.

### Security Quality Gates

Every pipeline includes mandatory security checks:

SAST Integration: Static security analysis identifies vulnerabilities before deployment.

Code Quality: SonarQube enforces quality thresholds (coverage, complexity, duplication).

Artifact Verification: Cryptographic signing and verification ensures artifact integrity.

Secret Management: Integration with secret stores (AWS Parameter Store, Vault) for secure credential handling.

### Network Security

Design for network isolation between environments, proper egress/ingress controls, and service mesh integration where applicable.

## Integration Points

### Adding New Pipelines

Integrate with Tekton by creating Pipeline and Task definitions following KRCI naming conventions. Use onboarding scripts where available (edp-tekton repository).

### Extending Portal

Portal extensions use React/TypeScript with Radix UI components and Tailwind CSS. tRPC provides type-safe API integration. Follow existing component patterns.

### Creating Operators

New operators follow Kubernetes operator patterns with CRDs, controllers, and reconciliation loops. Integrate with Codebase Operator or CD Pipeline Operator as needed.

### Adding Tools

New tools integrate via Helm charts with OIDC authentication, deployed through cluster add-ons approach.

## Design Validation Checklist

When validating technical designs:

- Cloud-Agnostic: Works on any Kubernetes distribution
- OIDC Authentication: Integrates with Keycloak for unified auth
- Security Quality Gates: Includes SAST and code quality checks
- GitOps Alignment: Uses Argo CD deployment patterns
- Production Isolation: Production workloads in dedicated cluster
- Component Integration: Properly integrates with Tekton, Argo CD, operators, portal
- Observability: Includes Prometheus metrics, OpenSearch logging, OpenTelemetry tracing
- Artifact Management: Proper artifact storage and verification
- Backward Compatibility: Migration path for breaking changes

## Common Patterns

### Adding New Application Type

1. Create application template (Git repo skeleton)
2. Add Tekton pipeline for build/test
3. Configure quality gates (SonarQube, SAST)
4. Set up artifact storage
5. Create CD pipeline configuration
6. Add portal UI if needed

### Multi-Repository Features

Features spanning multiple repositories (e.g., portal + operator):

1. Design data contracts between components (CRDs, APIs)
2. Implement operator changes first (API, CRD, controller)
3. Implement portal integration (tRPC API, React components)
4. Update pipelines in edp-tekton
5. Coordinate testing across components

### Migration Strategies

For breaking changes:

1. Maintain backward compatibility initially
2. Provide migration tooling/documentation
3. Deprecation warnings in advance
4. Phased rollout with feature flags
5. Complete removal after migration period

## Additional Resources

### Reference Files

For detailed component information and patterns:

- `references/reference-architecture.md` - Official KRCI reference architecture documentation
- `references/components.md` - Detailed descriptions of all platform components
- `references/deployment-patterns.md` - Comprehensive deployment strategies and multi-cluster architecture

Combine with agent-delegation skill when coordinating work across specialized agents for implementation.

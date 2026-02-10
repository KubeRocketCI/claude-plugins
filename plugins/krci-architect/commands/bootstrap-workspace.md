---
description: Create a workspace with KubeRocketCI repositories for feature development
argument-hint: <workspace-name>
allowed-tools: [Bash, AskUserQuestion]
---

Bootstrap a new workspace directory for KubeRocketCI feature development by cloning selected repositories.

## Workspace Name

Workspace: $ARGUMENTS

If no workspace name was provided (empty $ARGUMENTS), use AskUserQuestion to ask the user for a workspace name. Do NOT proceed without a workspace name.

## Step 1: Repository Selection

Use AskUserQuestion with multiSelect: true to ask the user which repositories to clone:

```
question: "Which core KubeRocketCI repositories do you need?"
header: "Core repos"
multiSelect: true
options:
  - label: "edp-tekton"
    description: "Tekton Pipelines, Tasks & Triggers (CI/CD)"
  - label: "krci-portal"
    description: "KubeRocketCI Portal (React/TypeScript/tRPC)"
  - label: "edp-codebase-operator"
    description: "Codebase Operator (Go, CRDs, controllers)"
  - label: "edp-cd-pipeline-operator"
    description: "CD Pipeline Operator (Go, promotion logic)"
```

Include a second question in the same AskUserQuestion call for additional repos:

```
question: "Any additional repositories?"
header: "More repos"
multiSelect: true
options:
  - label: "edp-keycloak-operator"
    description: "Keycloak Operator (Go, OIDC, realms)"
  - label: "edp-sonar-operator"
    description: "SonarQube Operator (Go, quality gates)"
  - label: "edp-nexus-operator"
    description: "Nexus Operator (Go, artifact storage)"
  - label: "None"
    description: "No additional operators needed"
```

Include a third question for supporting repositories:

```
question: "Any supporting repositories?"
header: "Supporting"
multiSelect: true
options:
  - label: "edp-cluster-add-ons"
    description: "Cluster Add-ons (Helm charts, ArgoCD apps)"
  - label: "edp-install"
    description: "Platform Installation Chart (Helm)"
  - label: "gitfusion"
    description: "GitFusion service (Go, multi-VCS)"
  - label: "None"
    description: "No supporting repositories needed"
```

## Step 2: Clone Repositories

After the user selects repositories, run the bootstrap script using Bash:

```bash
${CLAUDE_PLUGIN_ROOT}/scripts/bootstrap-workspace.sh "<workspace-name>" <repo1> <repo2> ...
```

Pass the workspace name as the first argument and all selected repository names as subsequent arguments. Exclude "None" from the argument list if selected.

## Step 3: Confirm

After the script completes, report what was cloned and the workspace path. Example:

```
Workspace 'feature-github' created with 3 repositories:
  - edp-tekton
  - krci-portal
  - edp-codebase-operator

Path: /current/working/dir/feature-github
```

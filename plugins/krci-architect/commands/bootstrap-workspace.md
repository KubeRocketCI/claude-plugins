---
description: Create a workspace with KubeRocketCI repositories for feature development
allowed-tools: [Bash]
---

Bootstrap the current directory as a KubeRocketCI workspace by cloning selected repositories into it.

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
${CLAUDE_PLUGIN_ROOT}/scripts/bootstrap-workspace.sh <repo1> <repo2> ...
```

Pass all selected repository names as arguments. Exclude "None" from the argument list if selected. The script clones into the current working directory and skips repos that already exist.

## Step 3: Confirm

After the script completes, report what was cloned and the workspace path. Example:

```
Workspace ready at /Users/me/my-feature with 3 repositories:
  - edp-tekton
  - krci-portal
  - edp-codebase-operator
```

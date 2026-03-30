#!/usr/bin/env bash
#
# bootstrap-workspace.sh - Clone KubeRocketCI repositories into the current directory
#
# Usage:
#   cd my-workspace
#   ./bootstrap-workspace.sh <repo1> [repo2] ...
#
# Clones selected repositories into the current working directory.
# Skips repos that already exist.
#
# Available repositories:
#   edp-cd-pipeline-operator  - CD Pipeline Operator (Go)
#   edp-cluster-add-ons       - Cluster Add-ons (Helm)
#   edp-codebase-operator     - Codebase Operator (Go)
#   edp-install               - Platform Installation Chart (Helm)
#   edp-keycloak-operator     - Keycloak Operator (Go)
#   edp-nexus-operator        - Nexus Operator (Go)
#   edp-sonar-operator        - SonarQube Operator (Go)
#   edp-tekton                - Tekton Pipelines & Tasks
#   gitfusion                 - GitFusion service (Go)
#   krci-cache                - Pipeline Cache service (Go)
#   krci-docs                 - KubeRocketCI Documentation
#   krci-portal               - KubeRocketCI Portal (React/TypeScript)
#   tekton-custom-task        - Custom Tekton Tasks (Go)

set -euo pipefail

repo_url() {
  case "$1" in
    edp-cd-pipeline-operator) echo "git@github.com:epam/edp-cd-pipeline-operator.git" ;;
    edp-cluster-add-ons)      echo "git@github.com:epam/edp-cluster-add-ons.git" ;;
    edp-codebase-operator)    echo "git@github.com:epam/edp-codebase-operator.git" ;;
    edp-install)              echo "git@github.com:epam/edp-install.git" ;;
    edp-keycloak-operator)    echo "git@github.com:epam/edp-keycloak-operator.git" ;;
    edp-nexus-operator)       echo "git@github.com:epam/edp-nexus-operator.git" ;;
    edp-sonar-operator)       echo "git@github.com:epam/edp-sonar-operator.git" ;;
    edp-tekton)               echo "git@github.com:epam/edp-tekton.git" ;;
    gitfusion)                echo "git@github.com:KubeRocketCI/gitfusion.git" ;;
    krci-cache)               echo "git@github.com:KubeRocketCI/krci-cache.git" ;;
    krci-docs)                echo "git@github.com:KubeRocketCI/docs.git" ;;
    krci-portal)              echo "git@github.com:KubeRocketCI/krci-portal.git" ;;
    tekton-custom-task)       echo "git@github.com:KubeRocketCI/tekton-custom-task.git" ;;
    *) return 1 ;;
  esac
}

usage() {
  echo "Usage: $0 <repo1> [repo2] ..."
  echo ""
  echo "Clones repositories into the current directory."
  echo ""
  echo "Available repositories:"
  echo "  edp-cd-pipeline-operator  edp-cluster-add-ons"
  echo "  edp-codebase-operator     edp-install"
  echo "  edp-keycloak-operator     edp-nexus-operator"
  echo "  edp-sonar-operator        edp-tekton"
  echo "  gitfusion                 krci-cache"
  echo "  krci-docs                 krci-portal"
  echo "  tekton-custom-task"
  exit 1
}

if [[ $# -lt 1 ]]; then
  usage
fi

for repo in "$@"; do
  if ! repo_url "$repo" > /dev/null 2>&1; then
    echo "Error: Unknown repository '$repo'"
    echo ""
    usage
  fi
done

echo "Workspace: $(pwd)"
echo ""

FAILED=""
FAIL_COUNT=0
for repo in "$@"; do
  if [[ -d "$repo" ]]; then
    echo "Skipping $repo (already exists)"
  else
    url=$(repo_url "$repo")
    echo "Cloning $repo..."
    if git clone "$url" "$repo" 2>&1; then
      echo "  Done."
    else
      echo "  Failed to clone $repo"
      FAILED="$FAILED $repo"
      FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
  fi
  echo ""
done

SUCCESS_COUNT=$(( $# - FAIL_COUNT ))
echo "=== Workspace ready: $(pwd) ==="
echo "Cloned ${SUCCESS_COUNT}/$# repositories."
if [[ $FAIL_COUNT -gt 0 ]]; then
  echo "Failed:$FAILED"
  exit 1
fi

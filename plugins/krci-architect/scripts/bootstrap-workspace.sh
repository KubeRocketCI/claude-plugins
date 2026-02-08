#!/usr/bin/env bash
#
# bootstrap-workspace.sh - Clone KubeRocketCI repositories into a workspace directory
#
# Usage:
#   ./bootstrap-workspace.sh <workspace-name> <repo1> [repo2] ...
#
# Available repositories:
#   edp-cd-pipeline-operator  - CD Pipeline Operator (Go)
#   edp-cluster-add-ons       - Cluster Add-ons (Helm)
#   edp-codebase-operator     - Codebase Operator (Go)
#   edp-tekton                - Tekton Pipelines & Tasks
#   krci-docs                 - KubeRocketCI Documentation
#   krci-portal               - KubeRocketCI Portal (React/TypeScript)
#   gitfusion                 - GitFusion service
#
# Example:
#   ./bootstrap-workspace.sh feature-github edp-tekton krci-portal edp-codebase-operator

set -euo pipefail

# Map repository name to clone URL
repo_url() {
  case "$1" in
    edp-cd-pipeline-operator) echo "git@github.com:epam/edp-cd-pipeline-operator.git" ;;
    edp-cluster-add-ons)      echo "git@github.com:epam/edp-cluster-add-ons.git" ;;
    edp-codebase-operator)    echo "git@github.com:epam/edp-codebase-operator.git" ;;
    edp-tekton)               echo "git@github.com:epam/edp-tekton.git" ;;
    krci-docs)                echo "git@github.com:KubeRocketCI/docs.git" ;;
    krci-portal)              echo "git@github.com:KubeRocketCI/krci-portal.git" ;;
    gitfusion)                echo "git@github.com:KubeRocketCI/gitfusion.git" ;;
    *) return 1 ;;
  esac
}

usage() {
  echo "Usage: $0 <workspace-name> <repo1> [repo2] ..."
  echo ""
  echo "Available repositories:"
  echo "  edp-cd-pipeline-operator"
  echo "  edp-cluster-add-ons"
  echo "  edp-codebase-operator"
  echo "  edp-tekton"
  echo "  gitfusion"
  echo "  krci-docs"
  echo "  krci-portal"
  exit 1
}

if [[ $# -lt 2 ]]; then
  usage
fi

WORKSPACE_NAME="$1"
shift

if [[ -d "$WORKSPACE_NAME" ]]; then
  echo "Error: Directory '$WORKSPACE_NAME' already exists."
  exit 1
fi

# Validate all repo names before cloning
for repo in "$@"; do
  if ! repo_url "$repo" > /dev/null 2>&1; then
    echo "Error: Unknown repository '$repo'"
    echo ""
    usage
  fi
done

mkdir -p "$WORKSPACE_NAME"
echo "Created workspace: $WORKSPACE_NAME"
echo ""

FAILED=""
FAIL_COUNT=0
for repo in "$@"; do
  url=$(repo_url "$repo")
  echo "Cloning $repo..."
  if git clone "$url" "$WORKSPACE_NAME/$repo" 2>&1; then
    echo "  Done."
  else
    echo "  Failed to clone $repo"
    FAILED="$FAILED $repo"
    FAIL_COUNT=$((FAIL_COUNT + 1))
  fi
  echo ""
done

SUCCESS_COUNT=$(( $# - FAIL_COUNT ))
echo "=== Workspace '$WORKSPACE_NAME' ready ==="
echo "Cloned ${SUCCESS_COUNT}/$# repositories."
if [[ $FAIL_COUNT -gt 0 ]]; then
  echo "Failed:$FAILED"
  exit 1
fi

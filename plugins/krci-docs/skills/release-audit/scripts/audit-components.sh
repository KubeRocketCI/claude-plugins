#!/usr/bin/env bash
# Audit KubeRocketCI components for a release cycle.
#
# For every component repo found under the workspace, reports:
#   default branch | latest release branch | target version (-SNAPSHOT) | total vs real commits
#
# "Real" commits exclude the mechanical version-bump commits every repo carries right after its
# release branch is cut. Counting those makes a dormant component look active, which is the single
# most common way this audit goes wrong.
#
# Usage:
#   audit-components.sh <workspace-dir> [component ...]
#
#   workspace-dir   directory containing component clones (e.g. krci-workspace/sources)
#   component       optional subset; defaults to every git repo in the workspace
#
# Output: TSV on stdout (component, default, release_branch, target_version, total, real).
# Exit codes: 0 ok, 1 usage error, 2 workspace not found.

set -uo pipefail

NOISE='current development version|Update development version|Bump version to'

usage() { sed -n '2,20p' "$0" | sed 's/^# \{0,1\}//'; }

[ $# -ge 1 ] || { usage; exit 1; }
WS=$1; shift
[ -d "$WS" ] || { echo "workspace not found: $WS" >&2; exit 2; }

if [ $# -gt 0 ]; then
  components=("$@")
else
  components=()
  for d in "$WS"/*/; do
    [ -d "$d/.git" ] && components+=("$(basename "$d")")
  done
fi

printf 'component\tdefault\trelease_branch\ttarget_version\ttotal\treal\n'

for c in "${components[@]}"; do
  repo="$WS/$c"
  if [ ! -d "$repo/.git" ]; then
    printf '%s\t-\t-\tNOT_CLONED\t-\t-\n' "$c"
    continue
  fi

  git -C "$repo" fetch --all --tags -q 2>/dev/null

  # Default branch varies: epam/* operators use master, KubeRocketCI/* use main. Never assume.
  def=$(git -C "$repo" symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|.*origin/||')
  [ -n "$def" ] || def=$(git -C "$repo" branch -r | grep -oE 'origin/(main|master)$' | head -1 | sed 's|origin/||')
  [ -n "$def" ] || { printf '%s\t?\t-\tNO_DEFAULT\t-\t-\n' "$c"; continue; }

  # Version-sort, so release/3.9 does not outrank release/3.10.
  rel=$(git -C "$repo" branch -r \
        | grep -oE 'release[/-][0-9]+\.[0-9]+' \
        | sort -t/ -k2 -V | tail -1)

  # The chart carrying the -SNAPSHOT is not always at deploy-templates/ (edp-tekton nests charts).
  ver=""
  for p in deploy-templates/Chart.yaml charts/pipelines-library/Chart.yaml; do
    v=$(git -C "$repo" show "origin/$def:$p" 2>/dev/null | awk '/^version:/{print $2; exit}')
    [ -n "$v" ] && { ver=$v; break; }
  done
  [ -n "$ver" ] || ver="NO_CHART"

  if [ -z "$rel" ]; then
    printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$c" "$def" "NONE" "$ver" "-" "-"
    continue
  fi

  total=$(git -C "$repo" rev-list --count "origin/$rel..origin/$def" 2>/dev/null || echo "?")
  # grep -c always prints a count but exits 1 when it is zero; swallow the status, keep the number.
  real=$(git -C "$repo" log --format='%s' "origin/$rel..origin/$def" 2>/dev/null \
         | { grep -civE "$NOISE" || true; })

  printf '%s\t%s\t%s\t%s\t%s\t%s\n' "$c" "$def" "$rel" "$ver" "$total" "$real"
done

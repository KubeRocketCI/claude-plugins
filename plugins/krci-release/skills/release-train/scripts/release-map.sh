#!/usr/bin/env bash
# Release map for a krci-workspace: every repo from repos.yaml, compared with its last release, and
# every chart/image pin between components, compared with the latest release of the pinned component.
#
# Usage: bash release-map.sh <krci-workspace-dir> [--no-fetch]
#
# Components table:
#   base      last release branch, else last vX.Y.Z tag
#   real      commits on the default branch not on the base; version-bump, release-notes, changelog and
#             README version commits, and commits already on the base under another hash
#             (git log --cherry-pick) excluded
#   snapshot  default-branch chart version
#   minor     release version for a cut; patch: next patch on the release branch
#   next-dev  default-branch version after a cut
#   path      release pipeline | tag push | no release | unknown (unlisted repo without a chart)
#   default   proposed action: skip (0 real), ask (1-3 real: cut or cherry-pick), cut (>3 real),
#             tag (tag-push component with real commits), ask: classify (unknown path);
#             STALE adds fix-bump
#   note      STALE: snapshot not above the last release (dev-version bump missing); FIRST: no tag yet
# Pins table:
#   status    ok | behind (a newer release exists) | ahead (pinned version not released yet)
set -euo pipefail

WS=${1:?usage: release-map.sh <krci-workspace-dir> [--no-fetch]}
SRC=$WS/sources
FETCH=1
[ "${2:-}" = "--no-fetch" ] && FETCH=0
for f in repos.yaml bootstrap.sh git-pull-all.sh sources; do
  [ -e "$WS/$f" ] || { echo "$WS is not a krci-workspace (missing $f); run from a krci-workspace" >&2; exit 1; }
done

NOISE='current development version|Update development version|Bump version to|docs: Add .* release to RELEASES.md|docs: Update Changelog|docs: Update chart version in the README'

path_of() {
  case $1 in
    krci-cache|cli|claude-code-telemetry) echo "tag push" ;;
    edp-cluster-add-ons|krci-docs|skills|claude-plugins|krci-autotests) echo "no release" ;;
    *) echo "release pipeline" ;;
  esac
}

# chart name -> "repo[:chart-dir]"; chart-dir set means the latest version is the chart source version
repo_of_chart() {
  case $1 in
    codebase-operator|cd-pipeline-operator|gerrit-operator|keycloak-operator|sonar-operator|nexus-operator) echo "edp-$1" ;;
    tekton-cache) echo "edp-tekton:charts/tekton-cache" ;;
    edp-tekton-common-library) echo "edp-tekton:charts/common-library" ;;
    *) echo "$1" ;;
  esac
}

manifest_repos() { awk '/^  - dir:/{print $3}' "$WS/repos.yaml"; }

pinned_repos() { # repo dirs of every chart pinned by edp-install or an add-on
  local r ref f
  r=$SRC/edp-install
  [ -d "$r/.git" ] && deps_of "$r" "$(default_ref "$r")" deploy-templates/Chart.yaml
  r=$SRC/edp-cluster-add-ons
  if [ -d "$r/.git" ]; then
    ref=$(default_ref "$r")
    for f in $(git -C "$r" ls-tree -r --name-only "$ref" -- clusters | grep -E '^clusters/[^/]+/addons/[^/]+/Chart.yaml$'); do
      git -C "$r" show "$ref:$f" | grep -q 'edp-helm-charts' && deps_of "$r" "$ref" "$f"
    done
  fi
}

repos() { # manifest order, then pinned components missing from repos.yaml
  local m n spec
  m=$(manifest_repos)
  echo "$m"
  pinned_repos | while read -r n _; do
    spec=$(repo_of_chart "$n"); spec=${spec%%:*}
    grep -qx "$spec" <<<"$m" || echo "$spec"
  done | sort -u
}

default_ref() { # prints origin/<default> or <default>
  local repo=$1 def
  def=$(git -C "$repo" symbolic-ref -q refs/remotes/origin/HEAD 2>/dev/null | sed 's|.*origin/||') || true
  [ -n "$def" ] || def=$(git -C "$repo" rev-parse --abbrev-ref HEAD)
  git -C "$repo" rev-parse -q --verify "origin/$def" >/dev/null && echo "origin/$def" || echo "$def"
}

last_release_branch() { # newest origin/release/X.Y or origin/release-X.Y
  git -C "$1" branch -r 2>/dev/null | grep -oE 'origin/release[/-][0-9]+\.[0-9]+$' \
    | awk '{v=$0; sub(/^origin\/release[\/-]/, "", v); print v "\t" $0}' | sort -V | tail -1 | cut -f2 || true
}

last_tag() { git -C "$1" tag --sort=-v:refname | grep -E '^v[0-9]+\.[0-9]+\.[0-9]+$' | head -1 || true; }

chart_version() { # repo ref [path]
  local repo=$1 ref=$2 p v
  for p in ${3:-deploy-templates/Chart.yaml charts/pipelines-library/Chart.yaml}; do
    v=$(git -C "$repo" show "$ref:$p" 2>/dev/null | awk '/^version:/{print $2; exit}') || true
    [ -n "$v" ] && { echo "$v"; return; }
  done
  echo "-"
}

bump() { local IFS=. a b c; read -r a b c <<<"${1%%-*}"; [ "$2" = minor ] && echo "$a.$((b + 1)).0" || echo "$a.$b.$((c + 1))"; }
version_le() { [ "$(printf '%s\n%s\n' "$1" "$2" | sort -V | head -1)" = "$1" ]; }

latest_of_chart() { # chart -> latest released version
  local spec repo dir t
  spec=$(repo_of_chart "$1"); repo=$SRC/${spec%%:*}; dir=${spec#*:}
  [ -d "$repo/.git" ] || { echo "?"; return; }
  if [ "$dir" != "$spec" ]; then chart_version "$repo" "$(default_ref "$repo")" "$dir/Chart.yaml"; return; fi
  t=$(last_tag "$repo"); echo "${t#v}"
}

status_of() { # pinned latest
  local p=${1#v} l=${2#v}
  if [ "$l" = "?" ] || [ -z "$l" ] || [ "$l" = "-" ]; then echo "?"
  elif [ "$p" = "$l" ]; then echo "ok"
  elif version_le "$p" "$l"; then echo "behind"
  else echo "ahead"; fi
}

deps_of() { # repo ref path -> "name version" lines
  git -C "$1" show "$2:$3" 2>/dev/null | awk '
    /^dependencies:/{f=1;next} f&&/^[^ -]/{f=0}
    f&&/^[ -]*name:/{sub(/^[ -]*name:[ \t]*/,""); gsub(/["'\'']/,""); n=$0}
    f&&/^[ -]*version:/{sub(/^[ -]*version:[ \t]*/,""); gsub(/["'\'' ]/,""); if(n!=""){print n, $0; n=""}}'
}

echo "### Components"
echo
echo "| component | branch | base | last release (date) | real | snapshot | minor | patch | next-dev | path | default | note |"
echo "|---|---|---|---|---|---|---|---|---|---|---|---|"
MANIFEST=$(manifest_repos)
for c in $(repos); do
  repo=$SRC/$c
  path=$(path_of "$c")
  extra=""; grep -qx "$c" <<<"$MANIFEST" || extra="not in repos.yaml"
  if [ ! -d "$repo/.git" ]; then echo "| $c | NOT_CLONED | | | | | | | | $path | | not audited ${extra} |"; continue; fi
  [ $FETCH = 1 ] && { git -C "$repo" fetch -q --tags --prune origin 2>/dev/null || echo "fetch failed: $c" >&2; }
  ref=$(default_ref "$repo"); def=${ref#origin/}
  if [ "$path" = "no release" ]; then echo "| $c | $def | | | | | | | | $path | | |"; continue; fi
  rel=$(last_release_branch "$repo")
  tag=$(last_tag "$repo")
  base=${rel:-$tag}
  tdate=$([ -n "$tag" ] && git -C "$repo" for-each-ref --format='%(creatordate:short)' "refs/tags/$tag" || echo "-")
  if [ -n "$base" ]; then
    real=$(git -C "$repo" log --format=%s --cherry-pick --right-only --no-merges "$base...$ref" | { grep -cviE "$NOISE" || true; })
  else
    real=$(git -C "$repo" log --format=%s --no-merges "$ref" | { grep -cviE "$NOISE" || true; })
  fi
  snap=$(chart_version "$repo" "$ref"); note=""
  [ "$path" = "release pipeline" ] && [ "$snap" = "-" ] && path=unknown
  if [ -z "$tag" ]; then minor=${snap%-SNAPSHOT}; next="-"; note=FIRST
  elif [[ $snap == *-SNAPSHOT ]]; then
    minor=${snap%-SNAPSHOT}; next=$(bump "$minor" minor)-SNAPSHOT
    if version_le "$minor" "${tag#v}"; then note=STALE; minor=$(bump "${tag#v}" minor); next=$(bump "$minor" minor)-SNAPSHOT; fi
  else minor=$(bump "${tag#v}" minor); next="-"; fi
  patch=$([ -n "$tag" ] && bump "${tag#v}" patch || echo "-")
  if [ "$path" = "unknown" ]; then act="ask: classify"
  elif [ "$path" = "tag push" ]; then [ "$real" -gt 0 ] && act=tag || act=skip
  elif [ "$real" -eq 0 ]; then act=skip
  elif [ "$real" -le 3 ]; then act="ask: cut or cherry-pick"
  else act=cut; fi
  [ "$note" = STALE ] && act="$act + fix-bump"
  echo "| $c | $def | ${base#origin/} | ${tag:--} ($tdate) | $real | $snap | $minor | $patch | $next | $path | $act | ${note}${note:+${extra:+, }}${extra} |"
done

echo
echo "### Pins"
echo
echo "latest = last vX.Y.Z tag; for tekton-cache and edp-tekton-common-library, the chart version on the"
echo "edp-tekton default branch (not proof of publication: check the @epamedp index)."
echo
echo "| consumer | ref | pinned | version | latest | status |"
echo "|---|---|---|---|---|---|"
pin_rows() { # repo-dir ref path label
  local repo=$SRC/$1 n v l
  while read -r n v; do
    [ -n "$n" ] || continue
    l=$(latest_of_chart "$n")
    echo "| $4 | ${2#origin/} | $n | $v | $l | $(status_of "$v" "$l") |"
  done < <(deps_of "$repo" "$2" "$3")
}
if [ -d "$SRC/edp-install/.git" ]; then
  r=$SRC/edp-install; ref=$(default_ref "$r")
  pin_rows edp-install "$ref" deploy-templates/Chart.yaml edp-install
  rel=$(last_release_branch "$r")
  [ -n "$rel" ] && pin_rows edp-install "$rel" deploy-templates/Chart.yaml edp-install
fi
if [ -d "$SRC/edp-tekton/.git" ]; then
  r=$SRC/edp-tekton; ref=$(default_ref "$r")
  pin_rows edp-tekton "$ref" charts/pipelines-library/Chart.yaml "edp-tekton pipelines-library"
  img=$(git -C "$r" show "$ref:charts/tekton-cache/values.yaml" 2>/dev/null | awk '/^  tag:/{gsub(/"/,"",$2); print $2; exit}') || true
  l=$( [ -d "$SRC/krci-cache/.git" ] && t=$(last_tag "$SRC/krci-cache") && echo "${t#v}" || echo "?")
  [ -n "$img" ] && echo "| edp-tekton tekton-cache image | ${ref#origin/} | krci-cache | $img | $l | $(status_of "$img" "$l") |"
fi
if [ -d "$SRC/edp-cluster-add-ons/.git" ]; then
  r=$SRC/edp-cluster-add-ons; ref=$(default_ref "$r")
  for f in $(git -C "$r" ls-tree -r --name-only "$ref" -- clusters | grep -E '^clusters/[^/]+/addons/[^/]+/Chart.yaml$'); do
    git -C "$r" show "$ref:$f" | grep -q 'edp-helm-charts' || continue
    pin_rows edp-cluster-add-ons "$ref" "$f" "add-on $(echo "$f" | cut -d/ -f2,4)"
  done
fi

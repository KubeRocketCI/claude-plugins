# Component Repositories Reference

Sources for a KubeRocketCI platform release entry in `edp-install/RELEASES.md`.

## Clone URLs

| Local folder | Clone URL | Notes |
|--------------|-----------|-------|
| `edp-install` | `https://github.com/epam/edp-install.git` | Platform chart + RELEASES.md |
| `edp-tekton` | `https://github.com/epam/edp-tekton.git` | Pipelines library, interceptor, tekton-cache |
| `edp-codebase-operator` | `https://github.com/epam/edp-codebase-operator.git` | Codebases, GitServers, scaffolding |
| `edp-cd-pipeline-operator` | `https://github.com/epam/edp-cd-pipeline-operator.git` | CDPipelines, Stages, CBIS labels |
| `krci-portal` | `https://github.com/KubeRocketCI/krci-portal.git` | Portal UI / tRPC |
| `docs` | `https://github.com/KubeRocketCI/docs.git` | Public docs site (no CHANGELOG) |
| `gitfusion` | `https://github.com/KubeRocketCI/gitfusion.git` | Optional; only if Chart.yaml bumped it |

## Chart.yaml dependency names

In `edp-install/deploy-templates/Chart.yaml`, dependencies are typically named:

| Chart dependency name | Git repository |
|-----------------------|----------------|
| `codebase-operator` | `edp-codebase-operator` |
| `edp-tekton` | `edp-tekton` |
| `cd-pipeline-operator` | `edp-cd-pipeline-operator` |
| `krci-portal` | `krci-portal` |
| `gitfusion` | `gitfusion` |

Compare with:

```bash
git show "v${PREV}:deploy-templates/Chart.yaml"
git show "v${NEW}:deploy-templates/Chart.yaml"
```

## Tag conventions

- Platform (`edp-install`): `v3.14.0`, `v3.13.5`, …
- Operators / tekton / portal / gitfusion: `v2.34.0`, `v0.25.0`, `v0.6.0`, … (always leading `v`)

Verify tags exist after fetch:

```bash
git fetch --tags --force
git tag --list 'v3.14*' 'v0.6*' | sort -V
```

## Useful git commands

```bash
# Commits in the release window for a component
git log "v${PREV}".."v${NEW}" --oneline

# Prefer features/fixes for triage
git log "v${PREV}".."v${NEW}" --oneline --grep='feat:\|fix:'

# File at a tag (when working tree is on another branch)
git show "v${NEW}:CHANGELOG.md" | head -120

# edp-install commits in the platform window
git -C edp-install log "v${PREV}".."v${NEW}" --oneline
```

## GitHub PR search

Unauthenticated search is rate-limited. Space requests out.

```bash
# epam repo example
curl -sG "https://api.github.com/search/issues" \
  --data-urlencode "q=repo:epam/edp-tekton EPMDEDP-17181 is:pr is:merged"

# KubeRocketCI repo example
curl -sG "https://api.github.com/search/issues" \
  --data-urlencode "q=repo:KubeRocketCI/krci-portal EPMDEDP-17118 is:pr is:merged"

# docs
curl -sG "https://api.github.com/search/issues" \
  --data-urlencode "q=repo:KubeRocketCI/docs EPMDEDP-17104 is:pr is:merged"
```

Pick the PR whose title/repo matches the commit you are documenting. A Jira id can appear in multiple repos; linking the wrong repo's PR is a common review failure.

## Helm sanity check (optional)

```bash
helm repo add epamedp https://epam.github.io/edp-helm-charts/stable
helm repo update
helm search repo epamedp/edp-install
helm search repo epamedp/edp-install --versions | head -20
```

Use this to confirm the published chart version string for install docs and notes, not as a substitute for Chart.yaml / git history.

## Docs-only history

`KubeRocketCI/docs` usually has no useful CHANGELOG for release notes. Use:

```bash
git log --since="<previous-release-date>" --oneline -- docs/ faq/ src/ blog/
git log --name-status --pretty=format:'COMMIT %h %s' "<since-ref>..HEAD" -- docs/ faq/ src/
```

Blog posts are generally **not** listed in RELEASES.md Documentation (match prior releases). Landing (`src/features/home`) counts as General. Page updates under `docs/docs/...` go into Getting Started / Operator Guide / User Guide / Developer Guide / Use Cases / FAQ as appropriate.

## YouTube

```bash
curl -sL "https://www.youtube.com/feeds/videos.xml?channel_id=UCPi_wht-YbhQInGrQjR5Rkw"
```

Filter entries with `published` after the previous platform release date. Skip `#shorts` unless requested. Do not re-list videos already linked in the previous RELEASES.md version entry.

## Workspace layout suggestion

```text
.krci-release-workspace/
  edp-install/
  edp-tekton/
  edp-codebase-operator/
  edp-cd-pipeline-operator/
  krci-portal/
  docs/
```

Reuse siblings if the user already has them next to each other (as in a multi-repo checkout). Never commit `.krci-release-workspace` unless the user asks.

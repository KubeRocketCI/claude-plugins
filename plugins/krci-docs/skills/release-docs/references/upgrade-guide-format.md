# Upgrade Guide Format

Structure for `docs/operator-guide/upgrade/upgrade-krci-<X.Y>.md`. Always read the previous
release's guide before writing and match it — these notes describe the conventions, not a substitute
for that file.

## Heading format

```markdown
# Upgrade KubeRocketCI v<PREV> to <NEW>

## Step N. (Classification) Title
```

Steps are numbered contiguously from 1, with no gaps or duplicates.

## Classifications

| Classification | Use when |
|---|---|
| `(Required)` | Every operator must act, or the upgrade breaks |
| `(Required if applicable)` | Mandatory only for platforms using a specific feature |
| `(Recommended)` | Strongly advised, not breaking |
| `(Optional)` | New opt-in capability |
| `(Informational)` | Behaviour changed; no action needed |

Honest classification matters. Marking an optional feature `Required` trains operators to skip steps.

## Required structure

**First step** — `## Step 1. (Required) Verify Prerequisites`. Cluster and dependency versions
(cert-manager, Tekton Pipelines, Tekton Results, GitFusion), each verified against the release's real
requirements.

**Middle steps** — ordered by urgency, not by component or ticket number. Breaking changes first: an
operator who stops reading after three steps must have covered everything that can break them. Merge
related tickets into one coherent step rather than one step per ticket.

**Breaking Changes and Deprecations** — an `(Informational)` summary step near the end, one bullet
per breaking change, each linking to its own step by anchor. Only genuine breaking changes belong
here; a removal that leaves the CRD field in place for backward compatibility is a no-op, not a
breaking change, and listing it dilutes the section.

**Second-to-last** — `## Step N. Upgrade`. The real `helm upgrade` command with the correct chart
version read from `edp-install`'s `Chart.yaml`, typically with a `--dry-run` first.

**Last** — `## Step N. Post-Upgrade Verification`. Concrete checks: all pods `Running`, components on
their new image tags, plus a checklist item per required step above.

## Content rules

- Every values key, annotation, command and version must exist in real code at the release ref.
- Show real YAML snippets with real defaults, labelled with the chart they belong to:

  ````markdown
  ```yaml title="edp-tekton chart values (new, opt-in)"
  pipelines:
    queue:
      enabled: false
      pendingPipelineRun: false
  ```
  ````

- Explain the *consequence* of skipping a step, not just the mechanics. An operator needs to know
  that missing the ServiceAccount step means pipelines fail on Kubernetes API calls.
- Use Docusaurus admonitions (`:::note`, `:::important`, `:::warning`) as the previous guide does.
- Internal anchors must match generated heading slugs — lowercased, punctuation stripped, spaces to
  hyphens. A passing build proves them.

## Registration

A new guide is unreachable until registered. Add it to `sidebars.ts` as the **first** item in the
KubeRocketCI upgrade category, matching the file's newest-first ordering:

```ts
'operator-guide/upgrade/upgrade-krci-3.15',
'operator-guide/upgrade/upgrade-krci-3.14',
```

Verify nothing else is orphaned:

```bash
grep -rn 'upgrade-krci-<X.Y>' docs/ sidebars.ts
```

## Sourcing content

Maintainers sometimes stage documentation on a local branch while building a feature, targeted at a
version that never shipped. Check for such work before writing:

```bash
git -C krci-docs branch -vv
git -C krci-docs log --oneline main..<branch>
```

That content is written by the engineer who built the feature and is high quality — reuse it,
retargeted to the correct version and file. Confirm the version it claims actually exists before
trusting its framing:

```bash
git -C edp-install tag -l 'v<CLAIMED>'
```

Staged content often names the patch release it was written for. If no such tag exists, the work
shipped in a later version — retarget it rather than trusting the version it claims.

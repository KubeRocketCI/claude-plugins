# Decision Table — Worked Example

Real output shape, from the 3.14.1 → 3.15.0 audit. Reproduce this structure; the three groupings are
the point, and collapsing them hides exactly the decisions a release owner needs to make.

## 1. Release branches required for 3.15.0

| Component | prev release | real commits since | new branch | version |
|---|---|---|---|---|
| edp-tekton | release/0.26 | 41 | `release/0.27` | **0.27.0** |
| krci-portal | release/0.7 | 16 | `release/0.8` | **0.8.0** |
| edp-codebase-operator | release/2.34 | 14 | `release/2.35` | **2.35.0** |
| edp-cd-pipeline-operator | release/2.31 | 4 (go-git, cel-go, grpc, oras) | `release/2.32` | **2.32.0** |
| gitfusion | release/0.6 | 1 (`golang.org/x/net` CVE) | `release/0.6` (patch) | **0.6.1** |
| edp-install (umbrella) | release/3.14 | 6 | `release/3.15` | **3.15.0** |

Make two things visible:

- **gitfusion shipped as a patch on the existing branch**, not a new minor, because the only real
  change was a single CVE bump. Show the reasoning inline — the count alone does not justify the
  choice.
- **The umbrella is cut last.** Note it explicitly; cutting it before the sub-chart pins land
  produces a release that references versions which do not exist yet.

## 2. Not cut — no changes since last release

- **edp-headlamp** — removed from the umbrella chart entirely (EPMDEDP-17210). No 3.15 artifact.
- **krci-cache** — 0.3.0 unchanged; `tekton-cache` 0.4.5 still pins image 0.3.0, so neither moves.
- **cli** — 0.14.0, tag-driven, released independently of the platform train.
- **edp-cluster-add-ons / krci-docs** — rolling `main`, no release branches.

State *why* for each. "No changes" and "removed from the platform" look identical in a bare list but
mean opposite things to whoever reads the release notes.

## 3. Judgement calls

Components with real changes that sit outside the platform train. Give the last-released date — it is
what makes the staleness legible.

| Component | last released | real commits pending | proposed version |
|---|---|---|---|
| tekton-pipeline-queue | never (`build/0.1.0-SNAPSHOT.*`) | new repo, under testing | none — pre-alpha |
| tekton-custom-task | 0.2.0 (Apr 2025) | 27 | 0.3.0 |
| edp-sonar-operator | 3.3.0 (Apr 2025) | 18, incl. SonarProject CRD | 3.4.0 |
| edp-nexus-operator | 3.5.0 (Apr 2025) | 19, Go 1.25 + SDK 1.42 | 3.6.0 |
| edp-keycloak-operator | 1.35.0 (Jul 2026) | 2 (cel-go, grpc) | 1.36.0 |

Also surface add-on pin drift here — for example, `keycloak-operator` released `1.35.0` while the
cluster add-on still pinned `1.34.0`, stale across two releases. That is a finding even when the
component itself needs no new branch.

## 4. Resulting umbrella Chart.yaml

```yaml
- codebase-operator:     2.34.0 → 2.35.0
- edp-tekton:            0.26.0 → 0.27.0
- cd-pipeline-operator:  2.31.0 → 2.32.0
- gitfusion:             0.6.0  → 0.6.1
- krci-portal:           0.7.0  → 0.8.0
- edp-headlamp:          0.25.0 → REMOVED
version/appVersion:      3.14.1 → 3.15.0
```

Close with any caveat about the audit itself — for example, a component whose figures came from the
GitHub API because it was not cloned locally. Stating the limit is part of the deliverable.

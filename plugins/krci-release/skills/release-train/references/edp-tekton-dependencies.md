# edp-tekton Dependency Alignment

edp-tekton master, before `release/X.Y` is cut. pipelines-library embeds common-library
(`file://`, no publish needed) and pins tekton-cache from `@epamedp` (publish first). tekton-cache
pins the krci-cache image in `charts/tekton-cache/values.yaml` (`image.tag`).

N/A when: Pins table `ok` for the tekton-cache image and both pipelines-library pins; tekton-cache chart
in the `@epamedp` index; common-library `version` equals `appVersion`.

## New krci-cache Image → tekton-cache

Two PRs: PR CI `ct lint` downloads `@epamedp` dependencies; an unpublished pin fails. Do not change
the tekton-cache source to `file://`.

1. Next free tekton-cache version (a published version is never reused):

   ```bash
   curl -sSL https://epam.github.io/edp-helm-charts/stable/index.yaml \
     | awk '/^  tekton-cache:/{f=1;next} f&&/^  [a-z]/{f=0} f&&/^    version:/{print $2}' | sort -V | tail -3
   ```

2. PR 1 `chore: Align tekton-cache with krci-cache X.Y.Z`: `image.tag`, chart `version` and
   `appVersion` (patch bump), `make helm-docs`. A common-library drift goes in this PR too.
3. Merge; user runs the tekton-cache chart-only release from master; wait for the index entry and a
   200 on the package URL.
4. PR 2 `chore: Align tekton-cache chart version`: pipelines-library `Chart.yaml` pin,
   `Chart.lock`, `make helm-docs`. Verify with only the current packages in the ignored
   `charts/pipelines-library/charts/` (stale `.tgz` moved aside): `helm dependency list` `ok`,
   `helm lint`, `helm template ... --set tekton-cache.enabled=true` shows the new image.
5. Cut `release/X.Y` after PR 2 merges.

## common-library

`version` and `appVersion` move together. Drift: set `appVersion` to `version`, `make helm-docs`, ship
with the next dependency PR. Pin and `Chart.lock` unchanged.

# edp-tekton Dependency Alignment

edp-tekton master, before `release/X.Y` is cut. pipelines-library embeds common-library
(`file://`, no publish needed) and pins krci-cache from `@epamedp` (publish first). The krci-cache
chart lives in krci-cache `deploy-templates/`; its image tag follows the chart `appVersion`.

N/A when: Pins table `ok` for both pipelines-library pins; common-library `version` equals
`appVersion`.

## New krci-cache Release → pipelines-library

PR CI `ct lint` downloads `@epamedp` dependencies; an unpublished pin fails. Do not change the
krci-cache source to `file://`.

1. krci-cache release run `X.Y.Z` (release pipeline) is done: chart `krci-cache` `X.Y.Z` in the
   `@epamedp` index and a 200 on the package URL.
2. PR `chore: Align krci-cache chart version`: pipelines-library `Chart.yaml` pin, `Chart.lock`,
   `make helm-docs`. A common-library drift goes in this PR too. Verify with only the current
   packages in the ignored `charts/pipelines-library/charts/` (stale `.tgz` moved aside):
   `helm dependency list` `ok`, `helm lint`, `helm template ... --set krci-cache.enabled=true` shows
   image `epamedp/krci-cache:X.Y.Z`.
3. Cut `release/X.Y` after the PR merges.

## common-library

`version` and `appVersion` move together. Drift: set `appVersion` to `version`, `make helm-docs`, ship
with the next dependency PR. Pin and `Chart.lock` unchanged.

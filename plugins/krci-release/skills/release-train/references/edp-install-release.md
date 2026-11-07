# edp-install Release

The edp-install release run sets the chart version, writes the release changelog, publishes the chart,
and pushes `Bump version to X.Y.Z` and `vX.Y.Z` to `release/X.Y`. No image, no signing.

## Release Kinds

| Kind | Pin commit on | Subject | Release run |
|---|---|---|---|
| Patch `X.Y.Z` | `release/X.Y` | `chore: Update component versions for the X.Y.Z release` | `release/X.Y`, `X.Y.Z` |
| Minor `X.Y.0` | `release/X.Y` cut from master | `chore: Update current development version` | `release/X.Y`, `X.Y.0` |

Minor with no pin change: no pin commit. Propose the release only when edp-install's own commits
change the installer (values, templates, RBAC); otherwise `skip`.

## Pin Commit

Files: `deploy-templates/Chart.yaml` (dependency versions), `Chart.lock`, `README.md` (via
`make helm-docs`). `version`, `appVersion`, `CHANGELOG.md`: left to the release run.

1. Versions in `Chart.yaml`; `helm dependency update deploy-templates`. It fails (no network or TLS):
   check each new version in the `@epamedp` index and its package digest, then
   `python3 <skill-dir>/scripts/chart-lock-digest.py write deploy-templates`.

   ```bash
   curl -sSL https://epam.github.io/edp-helm-charts/stable/index.yaml -o index.yaml
   awk -v n="  <chart>:" -v v="    version: <version>" \
     '$0==n{f=1;next} f&&/^  [a-z]/{f=0} f&&/^    digest:/{d=$2} f&&$0==v{print d; exit}' index.yaml
   curl -sSfL --retry 5 https://epam.github.io/edp-helm-charts/stable/packages/<chart>-<version>.tgz -o <chart>-<version>.tgz
   shasum -a 256 <chart>-<version>.tgz   # equals the awk output
   ```

2. `chart-lock-digest.py check deploy-templates` exits 0.
3. `make helm-docs`.
4. Published packages in the ignored `deploy-templates/charts/` (stale `.tgz` moved aside):
   `helm dependency list` all `ok`, `helm lint deploy-templates`, `helm template` shows each image tag.
5. Values drift check; findings in the PR body under "Values drift".
6. Patch: master changes left out; show the list before the commit.
7. Commit. PR `-B release/X.Y`.

## Master Changes Left Out (patch)

```bash
git -C sources/edp-install log --format='%h %s' --cherry-pick --right-only --no-merges \
  origin/release/X.Y...origin/master \
  | grep -viE 'current development version|Update development version|Bump version to|docs: Add .* release to RELEASES.md'
```

Per commit: state what the installer will lack; ask cherry-pick onto `release/X.Y` before the pin
commit, or leave for the next minor. PR body: "Not in this release". Not a blocker. Same check for a
component `patch`.

## Values Drift Check

Per bumped sub-chart of the Pins table: upstream changes between the old pin and the new pin, against
the umbrella `deploy-templates/values.yaml` block of that sub-chart. Chart dir: `deploy-templates`;
edp-tekton: `charts/pipelines-library`.

```bash
git -C sources/<repo> diff v<old> v<new> -- <chart dir>/values.yaml
git -C sources/<repo> diff --stat v<old> v<new> -- <chart dir>/templates
git -C sources/<repo> log --format=%B v<old>..v<new> | grep -A8 'BREAKING CHANGE'
awk '/^<sub-chart>:/{f=1;print;next} f&&/^[^ #]/{exit} f' sources/edp-install/deploy-templates/values.yaml
```

Report:

- Umbrella-set key removed or renamed upstream.
- Umbrella-set key whose default, use or scope changed (placeholder URL now receiving credentials).
- Default-on feature with a wider scope (policy covering more resources).
- `BREAKING CHANGE` affecting an installed platform.
- Patch that pins a minor component release: its behavior changes.

No values change without the user.

## After the Merge

1. User starts the edp-install release run: branch `release/X.Y`, version `X.Y.Z`.
2. `git fetch --tags`: `Bump version to X.Y.Z` and `vX.Y.Z` on `release/X.Y`; `edp-install X.Y.Z` in
   the `@epamedp` index.
3. Master mirror, one commit `chore: Update current development version` off master: the
   `release/X.Y` pins, `Chart.lock`, `make helm-docs`, changelog per `component-bump.md`. Minor: also
   `X.(Y+1).0-SNAPSHOT`; patch: version unchanged. `check` passes; the dependency block equals
   `git show vX.Y.Z:deploy-templates/Chart.yaml`.
4. Add-on pins: kuberocketci and every `behind` add-on (`add-ons.md`).
5. `krci-docs:write-release-notes`, `krci-docs:release-docs`.

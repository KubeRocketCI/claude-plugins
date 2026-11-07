# Release Sources

## Workspace

- A krci-workspace is required: `repos.yaml`, `bootstrap.sh`, `git-pull-all.sh`, `sources/<dir>`.
  Without it, stop; `/krci-triage:bootstrap-workspace` creates one.
- Refresh before reading history: `bootstrap.sh`, then `git-pull-all.sh`. User states the local refs
  are current: skip both.
- Work in `sources/<dir>`. The docs site is `sources/krci-docs` (GitHub `KubeRocketCI/docs`);
  `RELEASES.md` is `sources/edp-install/RELEASES.md`.
- Read the repo's own `CLAUDE.md` before editing it.

## Component Ranges

- Source: `git -C sources/edp-install show v<PREV>:deploy-templates/Chart.yaml` and the same for
  `v<NEW>`: the versions that shipped. The release map dependency block (`release-train` step 0) is
  the plan; a difference from the tags goes to the user. Chart → repo: operator charts take the `edp-` prefix (`codebase-operator` →
  `edp-codebase-operator`); others keep the name.
- A dependency at `v<PREV>` but absent at `v<NEW>` was removed from the platform: a Breaking Changes
  item, not an omission.
- Range per component: `v<OLD>..v<NEW>`; patch on an existing branch: `v<OLD>..origin/release/X.Y`.
  Never the default branch: after a cut it carries the next version's work.

## Docs Links

A docs page exists only if its file is on `origin/main`. Never build a docs URL from a commit
message; a plausible path that does not exist is a broken public link.

```bash
git -C sources/krci-docs ls-tree -r --name-only origin/main -- docs/ | grep -E '<slug>'
```

`docs/a/b.md` → `https://docs.kuberocketci.io/docs/a/b`. Page not there yet: write the sentence
without a link.

## Noise

Mechanical release commits, never content: `Update current development version`,
`Bump version to`, `docs: Add .* release to RELEASES.md`, `docs: Update Changelog`, chart-version
README updates. Dependency bumps are not noise: each skill decides if they change behavior.

# Component Dev-Version Bump

Default branch → `X.(Y+1).0-SNAPSHOT` after `release/X.Y` exists and `vX.Y.0` is tagged. Same for
`STALE` rows. Work in `sources/<repo>`.

Before: the release map row shows base `release/X.Y` and last release `vX.Y.0`;
`git rev-parse <default> origin/<default>` gives two equal hashes. Else stop.

## Procedure

1. File set: the last 2-3 bump commits. No bump commit in the history: `Chart.yaml`, the chart
   README, `CHANGELOG.md`.

   ```bash
   git -C <repo> log --format=%h --grep='current development version' -3 origin/<default> \
     | xargs -n1 git -C <repo> show --stat --format='== %h %s'
   ```

2. `Chart.yaml`: `version`, `appVersion` → `X.(Y+1).0-SNAPSHOT`; own `artifacthub.io/images` entry,
   where present → `X.Y.0`; other entries unchanged. Other version files of the file set (for example
   `package.json`) → `X.(Y+1).0-SNAPSHOT`.
3. Root `README.md`: `grep -nE '[0-9]+\.[0-9]+\.[0-9]+' README.md`; the component's own versions
   (`helm search` rows, badges) → `X.Y.0`, however old. Third-party versions unchanged.
4. `make helm-docs`. Never edit the chart README by hand. A different helm-docs version is acceptable
   when only the badge line changes.
5. `make changelog`; read the diff:
   - Expected: new `[vX.Y.0]` section, moved `[Unreleased]` link, one new link line.
   - Older sections rewritten: keep the new section and link lines; older sections from `HEAD`.
   - Hand-written `[Unreleased]` text dropped: keep it on the matching line of the new section.
6. Commit. Subject prefix: `pattern` in `.chglog/config.yml`; no `[A-Z]+-\d+` group → no Jira prefix.
   Then `make changelog` and amend, so `[Unreleased]` lists the bump. After a manual merge in step 5:
   no second run; add `### Routine` / `- Update current development version` under `[Unreleased]` by
   hand; amend.
7. `helm lint <chart-dir>`; a second `make helm-docs` and `make changelog` give no diff.

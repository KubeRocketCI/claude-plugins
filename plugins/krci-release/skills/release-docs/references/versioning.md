# krci-docs Versioning and Install-Guide Alignment

Release mechanics of `sources/krci-docs`. Tree layout, `docs:version` and the `versions.json` order:
the repo's `CLAUDE.md`. `onBrokenLinks` and `onBrokenMarkdownLinks` are `throw`: a broken link fails
the build.

After the cut, visitors read `versioned_docs/version-<X.Y>/`; `docs/` is only at `/docs/next/`.
Content only in `docs/` is invisible to users of the release.

**The sync rule:** every edit made *after* running `docs:version` must be copied into the
snapshot. Verify with:

```bash
diff -rq docs versioned_docs/version-<X.Y>   # must output nothing
```

## Cutting a version

Run only when `docs/` content is final: `npm run docusaurus docs:version <X.Y>`. Then, by hand:

1. **Bump the dev label** in `docusaurus.config.ts` — `label: '<X.Y>-dev'` becomes the *next*
   version's label:

   ```ts
   versions: {
     current: { label: '<NEXT-X.Y>-dev', path: 'next' },
   }
   ```

2. **Update `docs/supported-versions.md`** — add the release row to the compatibility table, move the
   new version from "Under Development" to "Supported" in the Mermaid gantt, and drop the version
   falling out of support to "Unsupported" with an end date matching the new release date. Then copy
   the file into the snapshot (it was cut before this edit).

3. **Retire the oldest version** if the three-supported-versions policy applies. This is
   **destructive and requires explicit user approval** — never infer it from precedent:

   ```bash
   git rm -r versioned_docs/version-<OLD> versioned_sidebars/version-<OLD>-sidebars.json
   # then remove "<OLD>" from versions.json
   ```

   Retiring a doc version does **not** remove that version's *upgrade guide* from `docs/` — the guide
   describing how to upgrade *to* the retired version stays, and `sidebars.ts` keeps pointing at it.
   References to `version-<OLD>` remaining in other versioned sidebars are correct and expected.

4. **Update `CLAUDE.md`** in the docs repo — it hard-codes the version list and dev label in several
   places and goes stale otherwise.

Git may display the retirement as *renames* into the new snapshot rather than deletions, since the
trees are similar. Confirm the real scope with an explicit pathspec:

```bash
git diff --cached --name-only --diff-filter=D -- versioned_docs/version-<OLD> | wc -l
```

## Install-guide version pins

The platform version is pinned in several places and goes stale every release. Bump all of them:

| File | What |
|---|---|
| `docs/operator-guide/install-kuberocketci.md` | `helm search repo` sample output (chart + app version) |
| `docs/operator-guide/install-kuberocketci.md` | `--version <X.Y.Z>` in the `helm install` command |
| `docs/operator-guide/install-kuberocketci.md` | `values.yaml` link — `blob/v<X.Y.Z>/deploy-templates/values.yaml` |
| `docs/quick-start/platform-installation.md` | `--version <X.Y.Z>` in the one-liner |

Find any others with:

```bash
grep -rnE '--version[ =]+[0-9]+\.[0-9]+|blob/v?[0-9]+\.[0-9]+' docs/ \
  | grep -vE 'upgrade-krci-|upgrade-edp-'
```

Exclude the upgrade guides — their version references are historical and correct.

### The line-anchor trap

Deep links into `edp-install`'s `values.yaml` carry line anchors that **drift between releases**:

```
https://github.com/epam/edp-install/blob/v<X.Y.Z>/deploy-templates/values.yaml#L<line>
```

Bumping the tag without re-checking the anchor silently points operators at the wrong key. Resolve
the real line number at the new tag before writing:

```bash
git -C sources/edp-install show v<X.Y.Z>:deploy-templates/values.yaml | grep -n '<key>'
```

Verify the tag exists and contains the file before linking to it:

```bash
git -C sources/edp-install ls-tree --name-only v<X.Y.Z> -- deploy-templates/values.yaml
```

Docs page links: `release-sources.md`, Docs Links.

## Validation

Run `scripts/validate-docs-release.sh <docs-repo> <X.Y> [<PREV>]` rather than invoking the checks by
hand — it is the single source of truth for the sequence. It covers snapshot sync, stale version
pins, spell-check, typecheck and build.

CI runs `npm ci` then build → spell-check → typecheck, so a green build alone does not mean CI will
pass. Add new technical terms to `cspell.config.yaml` rather than suppressing the check.

Docusaurus emits `<page>.html` files, not `<page>/index.html` — account for that when inspecting
build output directly.

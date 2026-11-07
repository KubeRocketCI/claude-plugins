# Add-On Pins

edp-cluster-add-ons `main`, for each `behind` add-on row of the Pins table, after the version is in
`@epamedp`.

## Procedure

1. `<add-on>/Chart.yaml`: `version`, `appVersion` and the dependency `version` → `X.Y.Z`.
   `<add-on>/values.yaml`: the `blob/vX.Y.Z/` link in the header comment, where present.
2. `git -C sources/<component> diff v<old> vX.Y.Z -- <chart dir>/values.yaml`: every key that the add-on
   sets still exists. A removed or renamed key goes to the user.
3. `make helm-docs`. It rewrites the README of every add-on: restore all READMEs outside the changed
   add-ons.
4. Root `README.md` row: `make update-readme` (venv with `hack/requirements.txt`). No venv: edit the
   fixed-width row by hand.
5. Verify on a copy of the add-on, with `<chart>-X.Y.Z.tgz` in its `charts/`: `helm dependency list`
   shows `ok`, `helm lint` passes, `helm template` shows the new image tags. `make lint-chart` needs `ct`
   and network access.
6. Commit, PR to `main`.

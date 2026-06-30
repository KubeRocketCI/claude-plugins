---
description: Provision a multi-repo KubeRocketCI source workspace (all components or a chosen group) via the krci-workspace repo
argument-hint: "[target-parent-directory]"
allowed-tools: [Bash, AskUserQuestion]
---

Provision a KubeRocketCI development workspace by cloning the **krci-workspace** meta-repo — the single source of truth for the KRCI component set — and running its bootstrap script, which clones component repositories into `sources/`. This command is **independently callable** — it does not require a testbed or any other command.

Do NOT hardcode the repository list, the group names, or the number of components anywhere in this flow: the manifest lives in `krci-workspace/repos.yaml` and groups can be added or renamed there at any time. Always **discover** the current options at runtime (Step 3) and build the selection prompt from what you find. Your job is to orchestrate clone + bootstrap, then orient the user.

## Step 1: Choose the target location

If `$ARGUMENTS` is provided, treat it as the parent directory where the workspace will be created; otherwise use the current working directory. The components land under `<target>/krci-workspace/sources/`. The clone creates its own `krci-workspace/` subdirectory, so an otherwise-populated parent is fine — only ask the user (via AskUserQuestion) if `<target>` doesn't exist or the location is genuinely ambiguous.

## Step 2: Clone the krci-workspace meta-repo

```bash
cd <target-parent>
git clone git@github.com:KubeRocketCI/krci-workspace.git
```

If `krci-workspace/` already exists, skip the clone and refresh it instead with `git -C krci-workspace pull --ff-only`. If SSH is unavailable, fall back to HTTPS: `https://github.com/KubeRocketCI/krci-workspace.git`.

## Step 3: Discover the available scope

List the manifest without cloning anything, so you can see which components and groups currently exist:

```bash
cd krci-workspace
./bootstrap.sh --list
```

The output has `DIR`, `GROUP`, and `DESCRIPTION` columns. Derive the **distinct group names** (and roughly how many repos each holds) from the `GROUP` column — these drive the next step. Don't assume any particular set of groups; use exactly what `--list` reports.

## Step 4: Propose a scope (default: everything)

Use AskUserQuestion to let the user pick what to clone. Cloning everything is the right default for most feature work — a cross-repo workspace is the whole point — so make "All components" the recommended first option and lean toward it. Build the option list dynamically from Step 3:

- **Question** (multiSelect: true): "Which components should I clone into the workspace?"
- **Option 1 (recommended):** "All components" — clone the entire manifest.
- **Then one option per discovered group**, labeled with the group name and its repo count (e.g. "platform (10 repos)"), described using what those repos are.

AskUserQuestion allows up to four options; if `--list` ever reports more groups than fit, keep "All components" plus the most relevant groups and mention that any individual repo can also be cloned by name. Treat "All components" as exclusive — if the user selects it (alone or alongside groups), clone everything.

## Step 5: Clone the selected scope

Map the choice to a bootstrap invocation. The script is idempotent (existing repos are skipped), so re-running or chaining calls is safe:

```bash
./bootstrap.sh                      # "All components"
./bootstrap.sh --group <group>      # run once per selected group
./bootstrap.sh <repo1> <repo2> ...  # specific repos by name (manual escape hatch)
```

For a multi-group selection, run `./bootstrap.sh --group <group>` once for each chosen group.

## Step 6: Keep components current (optional)

To fast-forward every cloned repo to its latest remote:

```bash
./git-pull-all.sh
```

## Step 7: Orient the user

Report the workspace path and how many components were cloned (and into which groups, if a subset). Point the user at `krci-workspace/CLAUDE.md` (workspace usage and commands) and `krci-workspace/sources/CLAUDE.md` (per-component architecture reference, including which specialized KRCI agent owns each repo). Both auto-load when working inside the workspace. This path is the `PATH_TO_KRCI_WORKSPACE` input for `/krci-triage:krci-fix-the-issue`.

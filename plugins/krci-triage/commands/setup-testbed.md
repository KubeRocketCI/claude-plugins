---
description: Clone or refresh the try-kuberocketci testbed and stand up a local KubeRocketCI kind cluster
argument-hint: "[target-parent-directory]"
allowed-tools: [Bash, Read, AskUserQuestion]
---

Provision a local **try-kuberocketci** testbed (a `kind`-based cluster running the full
KubeRocketCI platform). This command only **orchestrates** the clone and then runs the
testbed's *own* documented flow — the repo is the source of truth for how it stands up, so
do not re-specify or hardcode its targets, timings, context, or namespaces. Independently
callable.

## Step 1: Locate or clone the repo

If `$ARGUMENTS` is given, treat it as the parent directory; otherwise use the current
directory. Clone into `<target>/try-kuberocketci/`:

```bash
git clone git@github.com:KubeRocketCI/try-kuberocketci.git
```

If it already exists, refresh with `git -C try-kuberocketci pull --ff-only`. SSH unavailable?
Use `https://github.com/KubeRocketCI/try-kuberocketci.git`. Only ask the user (AskUserQuestion)
if the location is genuinely ambiguous.

## Step 2: Read its docs and run its flow

Read `try-kuberocketci/CLAUDE.md` and `README.md`, and run `make help`. Follow the repo's
documented sequence exactly (typically: a preflight/requirements check, then a stand-up
target, then a token target) — these are long-running, so give them generous timeouts and
prefer the status target over rebuilding if a cluster is already up. Honor every rule the
repo states (especially its host/architecture guidance).

## Step 3: Report the handoff

Report the testbed path plus the values the repo exposes (kube context, platform namespace,
portal URL, token command). These are the `PATH_TO_TRY_KUBEROCKETCI` and capabilities that
`/krci-triage:krci-fix-the-issue` will use.

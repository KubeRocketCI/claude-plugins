# krci-triage

Jira-driven issue triage for KubeRocketCI. One plugin to set up the two prerequisites — a
multi-repo **source workspace** and a local **try-kuberocketci testbed** — and then quickly
**diagnose, reproduce, fix, and verify** a Jira-tracked issue across operators, the portal,
and charts. Each command is independently callable.

## Commands

### `/krci-triage:setup-testbed` — stand up the testbed

Clones (or refreshes) [`KubeRocketCI/try-kuberocketci`](https://github.com/KubeRocketCI/try-kuberocketci)
and provisions a local `kind` cluster running the full platform, discovering its make
targets from `make help` / its docs rather than hardcoding them.

```
/krci-triage:setup-testbed
/krci-triage:setup-testbed ~/dev
```

### `/krci-triage:bootstrap-workspace` — provision the source workspace

Clones [`KubeRocketCI/krci-workspace`](https://github.com/KubeRocketCI/krci-workspace) (the
single source of truth for the KRCI component set) and assembles the platform repositories
under `sources/`. The repository list lives in `krci-workspace/repos.yaml`, not here.

```
/krci-triage:bootstrap-workspace
/krci-triage:bootstrap-workspace ~/dev
```

### `/krci-triage:krci-fix-the-issue` — fix an issue end to end

Given a Jira key (and, optionally, the workspace and testbed paths — otherwise discovered),
runs the phased workflow: fetch the ticket → find the root cause across the workspace →
reproduce on the testbed → fix at the right layer → verify on the cluster → optional review →
branch + conventional commit → optional QA comment back to Jira.

```
/krci-triage:krci-fix-the-issue EPMDEDP-1234
/krci-triage:krci-fix-the-issue EPMDEDP-1234 ~/dev/krci-workspace ~/dev/try-kuberocketci
```

## Skill

- **krci-testbed** — how to discover a testbed's specifics from its own docs, plus the
  transferable techniques and gotchas: operator rebuild loop (build → `kind load` → roll
  out), reproducing through the Kubernetes API, headless Portal verification with Playwright
  (not the MCP), shell/safety notes, and posting results to Jira without mangling code blocks.

## Typical flow

```
/krci-triage:setup-testbed            # once: stand up the cluster (long-running)
/krci-triage:bootstrap-workspace      # once: clone the component repos
/krci-triage:krci-fix-the-issue EPMDEDP-1234   # repeat: per ticket
```

## Installation

```bash
claude plugin install krci-triage
```

## License

Apache-2.0

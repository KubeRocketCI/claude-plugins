# krci-triage

KubeRocketCI testbed and workspace toolkit. Provision the two prerequisites — a multi-repo
**source workspace** and a local **try-kuberocketci testbed** — then **diagnose, reproduce,
fix, and verify** code changes across operators, the portal, and charts, including
end-to-end Jira-tracked issue triage. Each command is independently callable.

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

- **krci-testbed** — locates the workspace and testbed (or points to the setup commands if
  missing) and reads their `CLAUDE.md` files for cluster capabilities, then covers the
  transferable techniques and gotchas: operator rebuild loop (build → `kind load` → roll
  out), reproducing through the Kubernetes API, headless Portal verification with Playwright
  (not the MCP), shell/safety notes, and posting results to Jira without mangling code blocks.

## krci-kubelock — recommended: turn it on

A mod that locks Claude to one kube context: the testbed's. It locks the context, not the
cluster — inside that context Claude can still change anything. **Off by default — turn it
on:** `/config` → **krci-kubelock** → on. The change applies at once and holds for every session.

While on:

- `KUBECONFIG` points at `~/.kube/krci-kubelock/<context>.yaml`, your kubeconfig minified to
  the locked context (default `kind-krci`). Every `kubectl`, `helm`, `make` target, and script
  Claude runs sees only that context. Your `~/.kube/config` and your own terminals are untouched.
- Bash commands that escape the pin are denied before they run: `--context` / `--kube-context`
  naming another context, `kubectl config use-context`, `kubectx`, `kind create cluster` or
  `kind export kubeconfig` for another cluster, `--kubeconfig`, `KUBECONFIG=` overrides, cloud
  credential fetchers (`aws eks update-kubeconfig`, `gcloud … get-credentials`,
  `az aks get-credentials`), and reading your real kubeconfig. Claude gets the reason.
- `~/.kube/` is off limits to Bash and the file tools — every kubeconfig there, and listing the
  folder itself — except the lock's own `~/.kube/krci-kubelock/` and kubectl's `cache` and
  `http-cache`. Nothing in `~/.kube/` is moved or deleted.
- Contexts a command adds to the pinned file are stripped after it runs.
- The status line shows `⎈ kind-krci 🔒`. Without the context, kube access is blocked
  (`⎈ kind-krci missing · kube access blocked`) and the pin is retried every 30 seconds.
- Edits to the krci-kubelock settings are denied; only you change them, in `/config`.
- `/krci-kubelock` shows the state and rebuilds the pin.

While off, the first kube command in a session raises a toast recommending krci-kubelock.

| `/config` row | Key | Default | Purpose |
|---------------|-----|---------|---------|
| krci-kubelock | `kubelock` | `false` | Turns the lock on |
| krci-kubelock context | `kubelockContext` | `kind-krci` | The only context Claude may use |

Stored in `~/.claude/settings.json` under
`pluginConfigs["krci-triage@kuberocketci-plugins"].options`.

Limits:

- Requires Claude Code v2.1.287 or later, macOS or Linux, and `kubectl` on `PATH`.
- A testbed cluster created while the lock is on lands in the pinned file only. Run
  `kind export kubeconfig --name <cluster>` in your own terminal to add it to `~/.kube/config`.
- Stops mistakes, not a deliberate bypass. `--safe-mode`, `disableAllHooks`, and an
  organization's `allowManagedModsOnly` turn it off; the missing status line shows it.

## Typical flow

```
/krci-triage:setup-testbed            # once: stand up the cluster (long-running)
/krci-triage:bootstrap-workspace      # once: clone the component repos
/krci-triage:krci-fix-the-issue EPMDEDP-1234   # repeat: per Jira ticket
```

To validate any code change on the testbed directly, ask Claude to verify it on the cluster
(e.g. "verify my change on the cluster") — the `krci-testbed` skill triggers on its own,
locates the workspace/testbed, and applies the same rebuild/reproduce/verify techniques.

## Installation

```bash
claude plugin install krci-triage
```

## License

Apache-2.0

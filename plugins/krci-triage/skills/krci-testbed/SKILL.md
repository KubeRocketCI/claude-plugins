---
name: krci-testbed
description: This skill should be used when the user wants to reproduce, deploy, or verify a code change against a running KubeRocketCI (KRCI) test cluster — running an operator or portal change on the kind testbed, driving the portal headlessly, running end-to-end tests against the cluster, or writing the test outcome back to the Jira ticket. It encodes only the non-obvious, hard-won facts that the testbed and workspace repos do not document. For standing the cluster up, acquiring tokens, or switching contexts, defer to the testbed repo's own CLAUDE.md and Makefile targets directly.
---

The testbed repo's `CLAUDE.md`, `README`, and `Makefile` are the authoritative source for the cluster architecture, QEMU rule, make targets (`preflight`, `stand-up`, `token`, `status`, `teardown`), the kube context name, the namespaces, the "use a self-contained Playwright script, not the MCP" rule with its setup recipe, and the zsh `$VAR` word-splitting caveat. The workspace's `sources/CLAUDE.md` documents the component map. This skill records only what those files do not.

## 0. Locate the workspace and testbed

Do this once per session, for any KRCI task (bug fix or feature work) that touches source
and/or the cluster:

- **Workspace**: use a given path if one was provided; else look for a `krci-workspace` dir
  (contains `sources/CLAUDE.md` or `repos.yaml`) at/near the cwd. If absent, run
  `/krci-triage:bootstrap-workspace` (or tell the user to).
- **Testbed**: use a given path if one was provided; else look for a `try-kuberocketci` dir
  (kind config + Makefile + CLAUDE.md) at/near the cwd. If absent or the cluster isn't
  reachable, run `/krci-triage:setup-testbed` (or tell the user to).
- Read `<workspace>/sources/CLAUDE.md` (component map) and `<testbed>/CLAUDE.md` (cluster
  capabilities). From the latter, record the kube context, platform namespace, portal token
  command, and portal URL — never hardcode these.
- **krci-kubelock**: run `echo $KUBECONFIG`. Not under `~/.kube/krci-kubelock/` → the lock is
  off; recommend the user turn it on (`/config` → **krci-kubelock**) before touching the cluster.
  Under it → only the locked context exists for every command you run. A command the lock
  denies states the reason; fix the command, never route around the pin.

## 1. Testing a *local operator change* on the cluster

The testbed runs released operator images and the Makefile only orchestrates the platform —
neither tells you how to try a local code change. Replace the image in place (no scaling
down, no second copy):

```bash
CGO_ENABLED=0 GOOS=linux GOARCH=<node-arch> go build -o dist/manager-<node-arch> ./cmd
docker build --build-arg TARGETARCH=<node-arch> -t <image>:<fresh-tag> .
kind load docker-image <image>:<fresh-tag> --name <kind-cluster>
kubectl --context <ctx> -n <ns> set image deploy/<operator> '*=<image>:<fresh-tag>'
kubectl --context <ctx> -n <ns> rollout status deploy/<operator>
```

Gotchas the repos don't mention:

- There is usually **no `docker-build` make target** — assemble the image by hand. The
  operator Dockerfile may expect prebuilt assets (the binary under `dist/`, plus `build/`
  asset dirs); build those first if the image build complains.
- Use a **fresh, unique tag every build** — reusing a tag won't make the Deployment pull
  your new bits (kind caches by tag).
- **Portal (client) changes hot-reload** in the running dev server — no rebuild/redeploy.
  Only Go/operator (and chart) changes need this loop.

## 2. Reproducing a "resource already exists" / conflict via the API

The Portal creates Kubernetes resources with a POST (create), so to reproduce the exact
user-facing conflict from the CLI use **`kubectl create`**, not `kubectl apply` — `apply` is
an upsert and silently hides the `AlreadyExists` the user actually hits. Inspect relationships
with `-o yaml` rather than `jsonpath` to avoid bracketed-index mangling in Jira comments.

## 3. Driving the running Portal headlessly

Set up `$W` with the testbed `CLAUDE.md` browser recipe, then copy the helper next to
`node_modules`: `cp <this skill's base directory>/scripts/portal.mjs "$W/"`.

In the Claude Code Bash sandbox:

- Keep the recipe's `$TMPDIR` template; a bare `mktemp -d` ignores `$TMPDIR` and lands in a
  directory the sandbox denies.
- `playwright install` needs `cdn.playwright.dev` and `playwright.download.prss.microsoft.com`
  allowed.
- Chromium does not launch inside the sandbox. Run `node` with the sandbox disabled and pass
  `$W` as an absolute path; `$TMPDIR` differs outside the sandbox.

`scripts/portal.mjs` — `import { PORTAL_URL, launch, login } from "./portal.mjs"`:

- `launch()` returns `{ browser, context, page }` with the onboarding tours, whose overlay
  intercepts clicks, marked complete and self-signed TLS accepted.
- `login(page, token)` signs in with a ServiceAccount token and returns the cluster name of the
  `/c/<cluster>/` routes. The name differs per deployment; never hardcode it.
- `PORTAL_URL` reads the `PORTAL_URL` environment variable; default is the dev server
  `http://localhost:5173`. Set it to the Portal URL from section 0 for the in-cluster Portal.

Portal specifics:

- **No stable input names.** Form fields use generated ids (`React.useId`) and no `name`
  attribute — select by **placeholder / label / role**, not `[name=...]`.
- **Kebab/action menus.** The Radix trigger exposes `aria-haspopup="menu"`. The icon is lucide
  `EllipsisVertical`, class `lucide-ellipsis-vertical`.
- **Dependent fields.** A provider/kind `<select>` auto-fills dependent fields **only on
  change** — when you keep the default, fill the dependent field (e.g. User) yourself or the
  form fails a silent "Required" validation and the submit no-ops.
- Interleave `kubectl` assertions between UI steps to confirm cluster state objectively, and
  build fresh fixtures per case (never share a mutable object across parallel runs).

## 4. Posting QA results to Jira

The Atlassian MCP's Markdown→Jira converter mangles fenced code blocks: it turns leading `#`
comment lines into headings and breaks `<<` heredocs, `->` arrows, and `[N]` array indices.
Keep fenced blocks **comment-free**, avoid heredocs and `->`, and prefer
`kubectl ... -o yaml` + "look at field X" over `jsonpath` with bracketed indices.

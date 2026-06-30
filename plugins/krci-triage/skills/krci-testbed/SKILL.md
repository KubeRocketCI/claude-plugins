---
name: krci-testbed
description: This skill should be used when the user asks to reproduce, deploy, or verify a code change against a running KubeRocketCI (KRCI) test cluster — phrasings like "reproduce on the testbed", "verify the fix on the cluster", "test my operator change on kind", "deploy the operator to the testbed", "drive the portal headlessly", "run end-to-end tests against the cluster", "write test results to Jira", or "add a QA comment to the ticket". It encodes only the non-obvious, hard-won facts that the testbed and workspace repos do not document. For standing the cluster up, acquiring tokens, or switching contexts, defer to the testbed repo's own CLAUDE.md and Makefile targets directly.
---

The testbed repo's `CLAUDE.md`, `README`, and `Makefile` are the authoritative source for the cluster architecture, QEMU rule, make targets (`preflight`, `stand-up`, `token`, `status`, `teardown`), the kube context name, the namespaces, the "use a self-contained Playwright script, not the MCP" rule, and the zsh `$VAR` word-splitting caveat. The workspace's `sources/CLAUDE.md` documents the component map. This skill records only what those files do not.

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

Beyond "use a temp-dir Playwright script, not the MCP" (in the testbed docs), these portal
specifics are only discoverable by reading the portal source — pin them here:

- **Onboarding tours block clicks.** react-joyride renders an overlay that intercepts
  pointer events. Disable it before navigating by seeding `localStorage` via
  `context.addInitScript`: key `portal_tours`, value a JSON object with
  `schemaVersion: 1`, `firstVisit: <iso>`, and a `tours` map where each of
  `welcome_tour`, `pinned_items_intro`, `form_guide_intro`, `page_guide_intro` is
  `{ completedAt: <ms>, version: "<app-ver>", completed: true }`.
- **No stable input names.** Form fields use generated ids (`React.useId`) and no `name`
  attribute — select by **placeholder / label / role**, not `[name=...]`.
- **Kebab/action menus.** The Radix trigger exposes `aria-haspopup="menu"` (stable);
  note the lucide `MoreVertical` icon renders class `lucide-ellipsis-vertical` in recent
  versions, so don't match the old class.
- **Dependent fields.** A provider/kind `<select>` auto-fills dependent fields **only on
  change** — when you keep the default, fill the dependent field (e.g. User) yourself or the
  form fails a silent "Required" validation and the submit no-ops.
- **Login & cluster path.** Log in via the Service-Account-token flow (button
  "Use Service Account Token", textarea `#sa-token`, submit "Sign In"). The `/c/<clusterName>/...`
  segment comes from a server config value (e.g. `DEFAULT_CLUSTER_NAME`), not a fixed string
  — read it from the env/`.env` or after login; don't hardcode it.
- Interleave `kubectl` assertions between UI steps to confirm cluster state objectively, and
  build fresh fixtures per case (never share a mutable object across parallel runs).

## 4. Posting QA results to Jira

The Atlassian MCP's Markdown→Jira converter mangles fenced code blocks: it turns leading `#`
comment lines into headings and breaks `<<` heredocs, `->` arrows, and `[N]` array indices.
Keep fenced blocks **comment-free**, avoid heredocs and `->`, and prefer
`kubectl ... -o yaml` + "look at field X" over `jsonpath` with bracketed indices.

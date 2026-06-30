---
description: End-to-end Jira-driven bug fix on a KRCI testbed - fetch the ticket, find the root cause across the source workspace, reproduce, fix at the right layer, and verify on the cluster
argument-hint: "<jira-key> [path-to-krci-workspace] [path-to-try-kuberocketci]"
allowed-tools: [Read, Write, Edit, Bash, Grep, Glob, TodoWrite, AskUserQuestion, Task, mcp__mcp-atlassian__jira_get_issue, mcp__mcp-atlassian__jira_add_comment]
---

# Fix a KubeRocketCI issue from Jira — phased workflow

Diagnose, reproduce, fix, and verify a Jira-tracked KRCI issue using two prerequisites: a
**source workspace** and a running **try-kuberocketci testbed**. Use TodoWrite to track the
phases. Stay on ONE issue.

**Arguments** (`$ARGUMENTS`): `$1` = Jira issue key (required), `$2` = path to the krci
source workspace (optional), `$3` = path to the try-kuberocketci testbed (optional). When a
path is omitted, discover it (Phase 0); never hardcode cluster specifics.

**Load the `krci-testbed` skill now** — it defines how to discover testbed capabilities and
the techniques/gotchas for operator rebuilds, kubectl reproduction, headless Portal checks,
and posting to Jira. Load component skills (e.g. from krci-godev / krci-fullstack) later,
once Phase 2 reveals which repos/layers are involved.

---

## Phase 0: Intake & prerequisites

1. If `$1` (Jira key) is missing, ask for it via AskUserQuestion. Stop until you have it.
2. Resolve the **workspace** (`$2`): use the arg if given; else look for a `krci-workspace`
   (a dir containing `sources/CLAUDE.md` or `repos.yaml`) at/near the cwd. If absent, tell
   the user to run `/krci-triage:bootstrap-workspace` first (or offer to run it), then continue.
3. Resolve the **testbed** (`$3`): use the arg if given; else look for a `try-kuberocketci`
   dir (kind config + Makefile + a KRCI-testbed CLAUDE.md). If absent or the cluster isn't
   reachable, tell the user to run `/krci-triage:setup-testbed` first (or offer to run it).
4. Read `<workspace>/sources/CLAUDE.md` (component map) and `<testbed>/CLAUDE.md` (cluster
   capabilities). Discover and record: kube context, platform namespace, portal token
   command, portal URL. Create the TodoWrite phase list.

## Phase 1: Understand the ticket

Fetch the issue with `mcp__mcp-atlassian__jira_get_issue` (`$1`). Extract the summary,
steps to reproduce, actual vs expected, affected component, and acceptance criteria. Restate
the bug in one or two sentences before proceeding.

## Phase 2: Locate the root cause (source workspace)

Map the affected component(s) to repos via `sources/CLAUDE.md`. Use the **Explore/Task**
agents to fan out across the relevant repos rather than reading everything yourself. Trace
the actual mechanism; distinguish symptom from cause. Decide the correct **fix layer**
(operator/controller vs portal vs chart vs CI) — prefer a deep, declarative fix over a
surface bandaid. **Report the root cause and the intended layer before writing code.**

## Phase 3: Reproduce on the testbed

Reproduce the failure before fixing, so the fix is provably effective:

- Prefer the **Kubernetes API** (`kubectl --context <ctx> -n <ns>`). Use `kubectl create`
  (POST) when mirroring how the Portal creates resources, so conflicts surface like they do
  for users (see the krci-testbed skill).
- For user-facing behavior, optionally reproduce through the Portal with a self-contained
  headless Playwright script (NOT the Playwright MCP) — see the skill for login, tour, and
  selector gotchas.
- Capture the before-state objectively (e.g. `kubectl get ... -o yaml`).

## Phase 4: Implement the fix

Edit at the layer chosen in Phase 2. Match each repo's existing conventions (controller
patterns, owner references, RBAC markers, portal hooks/forms, test style). Add or extend
**tests** for the new behavior and its error paths. Honor the user's global rules: fix the
root cause, include necessary validation/error handling, no obvious comments.

## Phase 5: Verify

1. **Unit/integration tests** in the changed repo(s) (build, vet/lint, tests; run with the
   race detector where the language supports it).
2. **On the cluster**: if an operator changed, rebuild and roll it out (build → `kind load`
   → `kubectl set image` → `rollout status`, per the skill); if the portal changed, the dev
   server hot-reloads. Then re-run the Phase 3 reproduction and confirm the failure is gone
   and the acceptance criteria are met.
3. **Clean up** every test resource you created; don't disturb pre-existing integrations.

## Phase 6: Quality review

Run `/krci-general:review` (bugs/conventions) and/or `/simplify` on the diff, and
apply agreed fixes. Consider coverage of the new code's error paths.

## Phase 7: Commit & hand off

- Branch first (never commit to `main`/`master`); one conventional commit per repo prefixed
  with the Jira key (e.g. `$1: fix: ...`). Do **not** push or open PRs unless asked.
- Offer to post a **QA validation guide** as a Jira comment via
  `mcp__mcp-atlassian__jira_add_comment` (ask first; include the fix versions, manual UI
  steps, and the kubectl reproduction). Mind the Markdown→Jira code-fence pitfalls noted in
  the krci-testbed skill.
- Summarize: root cause, fix + layer, repos/branches touched, and verification evidence.

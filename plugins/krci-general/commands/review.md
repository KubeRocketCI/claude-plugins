---
description: Review code, then purge comment noise and fragile values
argument-hint: <file-path-or-scope>
allowed-tools: [Bash, Read, Edit, Grep, Glob, Task]
---

# Code Review

Launch the **code-reviewer** agent to review code changes.

## Determine Review Scope

If `$ARGUMENTS` is provided, use it as the review scope (file path, directory, or git ref range).

If `$ARGUMENTS` is empty, review unstaged changes from `git diff`.

## Launch Review

Use the Task tool to launch **4 code-reviewer agents in parallel**, each with a different review focus:

1. **Simplicity & DRY**: "Review the following scope for simplicity, DRY violations, code elegance, and readability. Scope: [determined scope]"
2. **Bugs & Correctness**: "Review the following scope for bugs, logic errors, security vulnerabilities, race conditions, and functional correctness issues. Scope: [determined scope]"
3. **Conventions & Architecture**: "Review the following scope for project convention violations (check CLAUDE.md), architectural consistency, naming patterns, and import organization. Scope: [determined scope]"
4. **Comment Hygiene & Fragile State**: "Apply your Comment Hygiene and Fragile State responsibilities. Quote the replacement text for each comment rewrite, and name the source of truth (or argue deletion) for each fragile value. Scope: [determined scope]"

Each agent should use `subagent_type: "krci-general:code-reviewer"`.

## Verify Findings

After all 4 agents complete:

1. Merge findings, deduplicate issues reported by multiple agents
2. Sort by severity (Critical first, then Important)
3. Sanity-check every finding before acting on it. Agents assert mechanisms confidently and sometimes wrongly. When a finding rests on a claim you can check cheaply — an exception chain's depth, what a library actually raises, whether a value is really unused — check it and drop the finding if it does not hold. Report which findings you dropped and why.

## Purge and Apply

Apply comment-hygiene and fragile-state findings without asking — they are mechanical, reversible, and visible in the diff:

- Comment rewrites and deletions. Preserve every domain fact the old comment carried; you are removing the argument, not the knowledge.
- Fragile-state fixes: derive the value from its real source, or delete a dead allowlist or a pinned count that proves nothing.

Report but do **not** auto-apply:

- Bugs, security findings, and anything that changes behaviour. These need the user's judgement.
- Any fix that spans many files or signatures — say what it would take, and let the user decide whether it is its own job.

After applying, run the project's lint gate and test suite (check the Makefile or CLAUDE.md for the right targets) and report the actual result. If either fails, revert the edits responsible before reporting — never leave the tree red. Revert by applying the inverse Edit of each change you made; never revert via git (`checkout`/`restore`/`stash`) — the tree also holds the user's own uncommitted work, and git would destroy it. If a fragile-state fix replaced a constant with a derived value, state that the computed value matches the old one; if it does not, revert and report.

## Present Results

Give the user a unified report:

```
### Review Summary

**Scope**: [what was reviewed]
**Applied**: [count] comment rewrites, [count] fragile-state fixes
**Reported**: [count critical] critical, [count important] important

### Applied
- [file:line — what changed and why, one line each]

### Critical Issues
- [issue with file:line, confidence score, and fix suggestion]

### Important Issues
- [issue with file:line, confidence score, and fix suggestion]

### Dropped on verification
- [finding, and the check that disproved it]

### Checks
- [lint target: result]
- [test target: result]

### Verdict
[Overall assessment - clean / needs fixes / significant concerns]
```

Omit any section that is empty rather than printing a heading with nothing under it.

If issues remain that you did not auto-apply, ask: "Want me to fix the remaining issues, or will you take them?"

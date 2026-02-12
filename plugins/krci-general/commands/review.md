---
description: Review code for bugs, security issues, and project convention violations
argument-hint: <file-path-or-scope>
allowed-tools: [Read, Grep, Glob, Bash, Task]
---

# Code Review

Launch the **code-reviewer** agent to review code changes.

## Determine Review Scope

If `$ARGUMENTS` is provided, use it as the review scope (file path, directory, or git ref range).

If `$ARGUMENTS` is empty, review unstaged changes from `git diff`.

## Launch Review

Use the Task tool to launch **3 code-reviewer agents in parallel**, each with a different review focus:

1. **Simplicity & DRY**: "Review the following scope for simplicity, DRY violations, code elegance, and readability issues. Scope: [determined scope]"
2. **Bugs & Correctness**: "Review the following scope for bugs, logic errors, security vulnerabilities, race conditions, and functional correctness issues. Scope: [determined scope]"
3. **Conventions & Architecture**: "Review the following scope for project convention violations (check CLAUDE.md), architectural consistency, naming patterns, and import organization. Scope: [determined scope]"

Each agent should use `subagent_type: "krci-general:code-reviewer"`.

## Consolidate Results

After all 3 agents complete:

1. Merge findings, deduplicate issues reported by multiple agents
2. Sort by severity (Critical first, then Important)
3. Present a unified report to the user:

```
### Review Summary

**Scope**: [what was reviewed]
**Issues found**: [count critical] critical, [count important] important

### Critical Issues
- [issue with file:line, confidence score, and fix suggestion]

### Important Issues
- [issue with file:line, confidence score, and fix suggestion]

### Verdict
[Overall assessment - clean / needs fixes / significant concerns]
```

4. If issues were found, ask the user: "Would you like me to fix these issues now, or would you prefer to address them yourself?"

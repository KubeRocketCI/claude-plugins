---
name: run-golangci-lint
description: This skill should be used when the user asks to "run golangci-lint", "fix lint errors", "run linter", "fix linting warnings", "make lint", "run make lint-fix", or mentions golangci-lint, linting, or golangci-lint tool execution. This skill runs tools — for conceptual Go coding guidance, defer to go-coding-standards.
---

## Your task

Run `make lint-fix` and fix errors. After fixing, run `make test` to verify nothing broke.

## KRCI Fix Conventions

- Move every function parameter to its own line when fixing line length (`lll`) issues.
- Use `//nolint:dupl` with a description comment to suppress duplicate code warnings in test files where duplication aids readability.
- For complex issues requiring subjective choices, ask the user before changing.

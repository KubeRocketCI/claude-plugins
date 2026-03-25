---
name: run-golangci-lint
description: This skill should be used when the user asks to "run golangci-lint", "fix lint errors", "run linter", "fix linting warnings", "make lint", "run make lint-fix", or mentions golangci-lint, linting, or golangci-lint tool execution. This skill runs tools — for conceptual Go coding guidance, defer to go-coding-standards.
allowed-tools: Bash(make:*), Read, Grep, Glob
---

## Your task

Run `make lint-fix` and fix errors

## Specific Fix Guidelines

- Move every function parameter in the new line if you're fixing line length issues.
- Use //nolint:dupl with description to suppress the duplicate code warnings in test files where the duplication aids readability.

## Validation

After fixing errors, run `make test` (or equivalent) to ensure the changes don't break existing functionality. If tests fail, investigate and fix the root cause before proceeding.

## Scope and Manual Review

Focus on auto-fixable linting errors. For complex issues requiring manual review:

- Explain the trade-offs of each potential fix
- Ask for user approval before making subjective changes
- Document any linting rules that were intentionally violated

## Iteration Process

If fixes introduce new linting errors or test failures:

- Address them iteratively, prioritizing critical issues first
- Run `make lint-fix` again after manual fixes to catch any cascading issues
- Continue until no new errors are introduced and all tests pass

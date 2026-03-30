---
name: KRCI Go Coding Standards
description: This skill should be used when the user asks to "review Go code", "check Go best practices", "follow idiomatic Go", "implement error handling", "write Go tests", "fix naming conventions", "improve Go code quality", "run linter", or mentions Go coding standards, testing patterns, or code quality in KRCI Go projects. Covers error handling conventions, testing idioms, mock generation, linting, and build workflow. For Kubernetes operator patterns (CRDs, controllers, reconciliation, chain of responsibility), defer to operator-best-practices skill.
---

# KRCI Go Coding Standards

Always read existing source code in the target repository first — most conventions are directly visible. This skill covers non-obvious patterns and idioms that are easy to miss or get wrong.

## Error Handling

### Message Format

Format all error messages as lowercase, verb-prefixed, wrapping the cause:

```
"failed to {verb} {noun}: %w"
```

Never capitalize, never add trailing punctuation, always wrap with `%w`. The verb should be specific: `"failed to get group"`, `"failed to update status"`, not `"error getting group"`.

### Custom Error Types

Three error type patterns appear across KRCI projects. Identify which one the current project uses by reading the existing error types:

- **HTTP Error wrapper** — A struct wrapping HTTP status codes with helper functions like `IsErrNotFound()` and `IsHTTPErrorCode()`. Used when the project integrates with external HTTP APIs.
- **Domain error types** — Custom types (e.g., `type MyError string`) that controllers check with `errors.As()` to decide requeue strategy.
- **Sentinel errors** — Package-level `var ErrNotFound = errors.New(...)` checked with `errors.Is()`. Common in projects with well-defined error conditions.

### Error Handling Rule

Controllers log errors at the top level; handlers only return errors. Never both log and return the same error — it produces duplicate log entries.

## Testing

### Framework Selection

Identify which testing approach the project uses by checking existing `*_test.go` files:

- **Unit tests**: `testify/assert` + `testify/require` + `testify/mock` with standard `testing.T`
- **Integration tests**: Ginkgo v2 + Gomega + envtest (look for `*_suite_test.go` or `*_integration_test.go`)
- **E2E tests**: KUTTL or Chainsaw (look for `tests/e2e/` directory)

### Non-Obvious Unit Test Idioms

KRCI Go projects use specific testing idioms that differ from standard Go table-driven tests. When writing new tests, match these patterns:

**Mock factory as struct field** — Instead of creating mocks inline, test table structs define a factory function. This creates a fresh mock per subtest and takes `*testing.T` for automatic assertion cleanup:

```go
tests := []struct {
    name       string
    mockClient func(t *testing.T) ClientInterface
    wantErr    require.ErrorAssertionFunc
}{...}
```

**`require.ErrorAssertionFunc` for wantErr** — Instead of `wantErr bool`, use `require.ErrorAssertionFunc` as the field type. This enables `require.NoError` for success cases and custom assertion functions for specific error checks.

**`t.Parallel()` at both levels** — Add `t.Parallel()` at the test function level AND inside each `t.Run()` subtest.

**Logger in tests** — Use `ctrl.LoggerInto(context.Background(), logr.Discard())` to create a context with a no-op logger for testing code that calls `ctrl.LoggerFrom(ctx)`.

### Mock Generation

Check for a `.mockery.yaml` file in the project root. If present, run `make mocks` after changing any interface. Generated mocks follow the pattern `mocks.NewMock{InterfaceName}(t)` — the `(t)` parameter enables automatic assertion cleanup.

Some projects use hand-written stubs instead of mockery. Check existing test files to determine which approach the project uses.

## Import Ordering

Organize imports into 3 groups separated by blank lines:

1. Standard library
2. External dependencies (k8s, controller-runtime, third-party)
3. Project-internal imports

The linter enforces this automatically. Check `.golangci.yaml` for the specific formatter configuration (`goimports` or `gci`).

### Common Aliases

Look for established aliases in existing files and follow them consistently:

| Common Alias | Package |
|-------------|---------|
| `k8sErrors` | `k8s.io/apimachinery/pkg/api/errors` |
| `ctrl` | `sigs.k8s.io/controller-runtime` |
| `{resource}Api` | Project API types (e.g., `api/v1alpha1`) |

## Linting

All projects use `golangci-lint` v2 configured via `.golangci.yaml`. Run linting with:

```bash
make lint       # Check for issues
make lint-fix   # Auto-fix where possible
```

Read the `.golangci.yaml` to understand which linters and formatters are enabled for the specific project.

## Logging

Use `ctrl.LoggerFrom(ctx)` for structured logging. Follow these message patterns found in existing code:

- Start of operation: `"Reconciling {Resource}"`, `"Start creating {resource}"`
- Completion: `"{Resource} has been created"`, `"Handling of {Resource} has been finished"`
- Errors: `"An error has occurred while handling {Resource}"`

Add context with `.WithValues("name", resource.Spec.Name)`.

## Build and Development Workflow

Check the `Makefile` for available targets. Common targets across KRCI Go projects:

```bash
make build       # Compile binary
make test        # Run unit + integration tests
make lint        # Run golangci-lint
make lint-fix    # Auto-fix lint issues
make mocks       # Generate testify mocks via mockery
```

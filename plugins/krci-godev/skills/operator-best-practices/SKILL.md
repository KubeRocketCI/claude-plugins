---
name: KRCI Operator Best Practices
description: This skill should be used when the user asks to "implement Kubernetes operator", "create Custom Resource", "design CRD", "implement controller", "setup reconciliation loop", "handle finalizers", "configure operator RBAC", or mentions operator development, CRD patterns, controller architecture, chain of responsibility, or Kubernetes operator best practices. Teaches the Chain of Responsibility pattern, controller reconciliation lifecycle, and CRD design conventions used in KRCI operators. For general Go coding style (error handling, testing, linting), defer to go-coding-standards skill.
---

# KRCI Operator Development Patterns

KRCI operators follow specific architectural patterns that differ from a standard kubebuilder scaffold. Always read existing controllers in the target repository first — this skill explains the patterns to look for and the reasoning behind them.

## Project Structure

Expect this layout in a KRCI operator repository:

```
operator-name/
├── api/
│   ├── v1/ or v1alpha1/       # CRD type definitions
│   └── common/                # Shared types, status constants, ref interfaces
├── cmd/main.go                # Manager setup, controller registration
├── internal/controller/
│   └── {resource}/
│       ├── {resource}_controller.go
│       └── chain/             # Chain of responsibility handlers
├── pkg/
│   ├── client/{service}/      # External API client wrappers
│   └── helper/                # Cross-cutting utilities
├── deploy-templates/          # Helm chart
├── config/crd/bases/          # Generated CRDs
├── .golangci.yaml
├── .mockery.yaml
└── Makefile
```

The presence of a `chain/` directory inside a controller package is the signature of the Chain of Responsibility pattern described below.

## Chain of Responsibility — The Core Pattern

KRCI operators do NOT put business logic directly in the `Reconcile()` method. Instead, every controller delegates to a **chain of handlers** — small, single-responsibility structs that execute sequentially. The controller stays thin: get resource, manage finalizers, invoke chain, update status.

### Why This Pattern

- Each handler is independently testable with focused mocks
- New behavior is added by creating a new handler and wiring it into the factory
- Deletion logic is cleanly separated from creation/update logic
- Dependencies are injected at the factory level, not scattered across reconciliation

### Two Variants

Inspect the existing `chain/` directory to identify which variant the project uses:

**List-based chain** — A struct holds a `[]Handler` slice. A `Use()` method appends handlers. A factory function (`MakeChain` or `CreateChain`) composes them in execution order. The chain iterates the slice and stops on first error. This is the more common variant.

**Linked-list chain** — Each handler struct holds a `next` field pointing to the next handler. The factory nests handlers inside each other. Each handler calls `next.ServeRequest()` at the end.

### Key Conventions

- All handlers implement a `ServeRequest(ctx, *Resource) error` method (the exact interface is per-resource type)
- Each handler is a small struct with its own dependencies and a `NewXxx()` constructor
- Factory functions compose handlers in execution order with injected dependencies
- Deletion uses a separate one-off handler or a separate delete chain — never the main chain
- When handlers need to pass data forward, look for a context struct (e.g., `RoleContext`) passed through the chain

### Adding a New Handler

1. Create a new file in the `chain/` directory
2. Define a struct with the required dependencies
3. Implement the `ServeRequest` interface matching other handlers in the same package
4. Write the constructor `NewXxx(deps) *Xxx`
5. Wire it into the factory function in the correct execution order
6. Write unit tests following the project's test patterns (see go-coding-standards skill)

## Controller Reconciliation Lifecycle

Every KRCI controller follows this sequence. Read an existing controller to see the exact implementation, but expect these steps:

1. **Get resource** — Return empty `Result{}` if NotFound
2. **Get API client** — Obtain the external service client from a provider (if the operator integrates with an external service)
3. **Handle deletion** — Check `DeletionTimestamp` → run deletion handler → remove finalizer → return
4. **Add finalizer** — If missing, add it and update the resource
5. **Save old status** — Store a copy of the current status for later comparison
6. **Execute chain** — `chain.MakeChain(deps).ServeRequest(ctx, resource)`
7. **Handle error** — Set error status, update status subresource, return with `RequeueAfter`
8. **Handle success** — Set success status, update status subresource, return

### Non-Obvious Patterns

**Status equality check** — Before calling `Status().Update()`, compare the new status with the saved `oldStatus`. Skip the API call if nothing changed. This avoids unnecessary writes and reconciliation loops.

**`namespace=placeholder` in RBAC markers** — Kubebuilder RBAC markers use `namespace=placeholder` which gets replaced during manifest generation. Do not use actual namespace names.

**Predicates** — Controllers use custom `predicate.Funcs` on `SetupWithManager` to skip reconciliation for status-only updates. The update predicate compares `Spec` fields and checks `DeletionTimestamp`.

**Requeue strategy** — Return `ctrl.Result{RequeueAfter: errorRequeueTime}, nil` for retriable errors (controls timing). Return `ctrl.Result{}, err` only for fatal errors needing controller-runtime default backoff.

**API client provider** — Operators that integrate with external services use a provider that bridges K8s Secrets to API clients: get parent CR from typed reference → get Secret → create client with credentials.

## CRD Design

### Status Patterns

Inspect the existing API types in `api/` to determine which status pattern the project uses:

- **Simple** — `Value` + `Error` string fields. Value is a constant like `"created"` or `"error"`.
- **Rich** — Includes `Status`, `Available`, `Result`, `DetailedMessage`, `LastTimeUpdated`. Used for resources with complex lifecycle tracking.
- **With FailureCount** — Adds a failure counter for exponential backoff on requeue.

Status constants are typically defined in `api/common/`.

### Cross-Resource References

Dependent resources reference their parent via typed ref interfaces defined in `api/common/`. Look for patterns like `Has{Service}Ref` with `GetRef()` methods.

### Helper Methods on API Types

Convenience methods are defined directly on CRD types (e.g., `IsFirst()`, `InCluster()`, `GetStatus()`, `SetStatus()`). Follow this pattern when adding new helpers.

## Finalizer Conventions

Check existing controllers for the finalizer naming convention. Two patterns exist:

- **Shared constant** — All controllers in the project use the same finalizer string
- **Per-resource** — Each resource type has its own finalizer name

All use `controllerutil.AddFinalizer()` / `RemoveFinalizer()` / `ContainsFinalizer()` from controller-runtime.

## Build and Code Generation

Standard Makefile targets for KRCI operators:

```bash
make generate    # DeepCopy methods from kubebuilder markers
make manifests   # CRDs, RBAC, webhooks → config/ and deploy-templates/
make test        # Unit + integration tests (requires envtest binaries)
make lint        # golangci-lint
make lint-fix    # golangci-lint with auto-fix
make mocks       # Generate testify mocks via mockery
make build       # Compile operator binary
```

After adding or changing a CRD field, always run `make generate && make manifests`. After changing an interface, run `make mocks`.

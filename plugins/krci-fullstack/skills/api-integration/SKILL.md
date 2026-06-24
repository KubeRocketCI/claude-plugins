---
name: API Integration
description: This skill should be used whenever the user is adding or consuming a tRPC API endpoint in the KubeRocketCI portal — phrasings like "add an API endpoint", "create a tRPC procedure or router", "protectedProcedure", "call a query or mutation", "implement a React Query hook", "data fetching with useQuery/useMutation", or integrating an external service such as SonarQube, DependencyTrack, Tekton Results, or Prometheus. The portal uses a vanilla tRPC client plus standard React Query (no @trpc/react-query). Use it even when the user just says "fetch X from the backend". For Kubernetes resource data prefer k8s-resources (watch hooks and CRUD go through the generic k8s router); for the form UI that submits a mutation prefer form-patterns; for high-level monorepo or architecture questions prefer portal-tech-stack.
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

Guide tRPC API endpoint creation and React Query integration following the portal's type-safe patterns for client-server communication.

## Architecture Overview

The portal uses a **monorepo with three packages** that participate in the API layer:

| Package | Role |
|---------|------|
| `packages/trpc/` | tRPC router definitions, procedures, middleware, K8s/external clients |
| `packages/shared/` | Zod schemas, TypeScript types, resource configs (shared by both client and server) |
| `apps/client/` | React frontend that consumes tRPC via a vanilla client + React Query |
| `apps/server/` | Fastify server that mounts the tRPC handler |

The frontend does **not** use the `@trpc/react-query` adapter in source code (the package is a dependency but is never imported). Instead, the frontend uses a **vanilla tRPC client** (`createTRPCClient`) obtained through React context, and wraps calls in standard `@tanstack/react-query` hooks (`useQuery`, `useMutation`).

## tRPC Server Architecture

### Router and Procedure Primitives

The tRPC instance is initialized in `packages/trpc/src/trpc.ts`:

- `t.router()` creates routers (not `createTRPCRouter`)
- `t.procedure` is the base procedure
- `protectedProcedure` (in `procedures/protected/`) adds session authentication middleware
- `publicProcedure` (in `procedures/public/`) is just `t.procedure` re-exported

To discover the exact initialization and middleware chain, read `packages/trpc/src/trpc.ts` and `packages/trpc/src/procedures/protected/index.ts`.

### Router Composition

All routers are composed in `packages/trpc/src/routers/index.ts` into a single `appRouter` — **read that file for the current, authoritative namespace list** (it grows over time). It includes `auth`, `config`, and `k8s`, plus roughly one namespace per external service (SonarQube, DependencyTrack, Tekton Results, Prometheus, GitFusion) and pipeline runs.

The `k8s` router is the largest, containing generic CRUD procedures (`get`, `list`, `create`, `update`, `applyYaml`, `delete`, `watchItem`, `watchList`) plus many workload/pod procedures (scale, restart, logs, exec) and composite procedures for integration management. Note the mutation is named `update` — there is **no** `patch` procedure.

### Context and Authentication

The tRPC context (`TRPCContext`) carries Fastify request/response, session, and OIDC config. To understand the context shape, read `packages/trpc/src/context/types.ts`.

The `protectedProcedure` middleware checks the session for a valid user. If no cookie session exists, it falls back to Bearer token authentication. K8s API calls use the session's `idToken` through the `K8sClient` class (in `packages/trpc/src/clients/k8s/`), which constructs a `KubeConfig` with the user's OIDC token.

### Client Classes for External Services

Each external service integration has a client class under `packages/trpc/src/clients/` — `k8s/` (K8sClient wrapping `@kubernetes/client-node` KubeConfig + fetch), `oidc/` (auth), and one per external tool. `ls` that directory for the current set, then read a specific client class plus its router to see how that service is called.

## Frontend tRPC Integration

### The tRPC Client

The frontend creates a vanilla `TRPCClient<AppRouter>` and provides it via React context. Two clients exist:

1. **Full client** (in `TRPCProvider`) - uses `splitLink`: `httpBatchStreamLink` for queries/mutations, WebSocket for subscriptions. Created after authentication.
2. **HTTP-only client** (`trpcHttpClient`) - uses the simpler `httpBatchLink`; available before auth for login/logout operations.

To access the client in components, use `useTRPCClient()` from `@/core/providers/trpc`.

### Consuming tRPC in Components

Since the portal uses a vanilla tRPC client (not `@trpc/react-query`), all data fetching uses standard React Query:

**Queries**: Use `useQuery` with `trpc.namespace.procedure.query()` as the `queryFn`.

**Mutations**: Use `useMutation` with `trpc.namespace.procedure.mutate()` as the `mutationFn`.

**Subscriptions**: Use `trpc.namespace.procedure.subscribe()` for WebSocket-based real-time data.

### K8s-Specific Hooks (Most Common Pattern)

Most portal data fetching goes through the K8s watch hook system rather than direct tRPC calls. These hooks (`useWatchList`, `useWatchItem`) internally call `trpc.k8s.list.query()` / `trpc.k8s.get.query()` and set up WebSocket subscriptions for live updates. See the **k8s-resources** skill for details.

For non-K8s data (SonarQube metrics, DependencyTrack scores, Tekton Results), components call tRPC procedures directly via `useQuery`/`useMutation`.

## How to Add a New Router

Follow this process when adding a new tRPC router for a new external service or feature:

1. **Create client class** in `packages/trpc/src/clients/{service}/` if the service needs HTTP calls
2. **Create router** in `packages/trpc/src/routers/{service}/index.ts` using `t.router()`
3. **Define procedures** using `protectedProcedure` (most cases) or `publicProcedure`
4. **Register router** by importing into `packages/trpc/src/routers/index.ts` and adding to the `appRouter`
5. **Consume on frontend** using `useTRPCClient()` + React Query hooks

For Zod input schemas shared between client validation and server input validation, define them in `packages/shared/`.

## Discovery Instructions

| To learn about... | Read this file |
|-------------------|----------------|
| tRPC initialization, `t.router`, `t.procedure` | `packages/trpc/src/trpc.ts` |
| Protected procedure middleware (auth chain) | `packages/trpc/src/procedures/protected/index.ts` |
| Full router tree and AppRouter type | `packages/trpc/src/routers/index.ts` |
| TRPCContext shape (session, req, res) | `packages/trpc/src/context/types.ts` |
| K8sClient (how K8s API calls are made server-side) | `packages/trpc/src/clients/k8s/index.ts` |
| Frontend tRPC client setup (split link, WS) | `apps/client/src/core/providers/trpc/provider.tsx` |
| `useTRPCClient` hook | `apps/client/src/core/providers/trpc/hooks.ts` |
| How a specific router works | `packages/trpc/src/routers/{name}/index.ts` |
| K8s router procedures (list, get, watch, etc.) | `packages/trpc/src/routers/k8s/index.ts` |
| Any router's procedure details | `packages/trpc/src/routers/{name}/procedures/` |

## Key Conventions

- **No `@trpc/react-query` in source**: Even though the package is installed, it is never imported. The project uses a vanilla tRPC client + standard React Query. Do not use `trpc.procedure.useQuery()` syntax.
- **No `createTRPCRouter`**: Routers are created with `t.router()`.
- **Session-based auth**: The `protectedProcedure` reads tokens from `ctx.session.user.secret`. The K8sClient uses `session.user.secret.idToken` for cluster authentication.
- **Error formatting**: tRPC errors include a `source` field extracted from the cause (see `formatError` in `trpc.ts`).
- **Zod for inputs**: All procedure inputs use Zod schemas. Output schemas are optional but recommended for external API responses.
- **K8sResourceConfig**: The universal config object passed through tRPC to the K8sClient for building API URLs. Defined in `packages/shared/`.

## Error Handling

- **Server side**: Throw `TRPCError` with appropriate codes (`UNAUTHORIZED`, `NOT_FOUND`, `BAD_REQUEST`, etc.). For K8s errors, the `K8sApiError` class (from `@my-project/shared`) wraps HTTP status, statusText, and body.
- **Client side**: React Query's `error` state captures tRPC errors. The error object includes `data.source` for identifying the error origin. Use `error.message` for user-facing messages.

## Best Practices

1. Use `protectedProcedure` for any endpoint that accesses K8s or user data
2. Define Zod schemas in `packages/shared/` when they are needed by both client and server
3. Keep router files focused; extract complex logic into client classes or utility functions
4. For K8s resources, prefer the generic `k8s` router procedures over creating resource-specific routers
5. Always handle loading and error states in frontend components
6. Use React Query's `queryKey` arrays that reflect the procedure path for cache consistency

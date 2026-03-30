---
name: Kubernetes Resource UI Patterns
description: This skill should be used when the user asks to "implement K8s resource UI", "Kubernetes resource component", "CRD UI", "custom resource display", "K8s watch hooks", "useWatchList", "useWatchItem", "useBasicCRUD", "usePermissions", or mentions Kubernetes resource presentation, watch hooks, resource configs, draft creators, or portal-specific K8s patterns.
---

Guide implementation of UI components that interact with Kubernetes resources using the portal's watch hooks, resource configurations, CRUD operations, and permissions system.

## Architecture Overview

K8s resource code is split across two packages:

### `packages/shared/` - Resource Definitions (No UI)

Contains everything needed to describe a K8s resource without React:

- **Resource configs** (`K8sResourceConfig`) - API group, version, kind, plural name
- **TypeScript types** - typed interfaces for each resource's spec/status
- **Zod schemas** - validation schemas for resource creation
- **Label constants** - label key strings in a `labels.ts` file
- **Draft creators** - utility functions that build K8s resource manifests
- **Enum constants** - status values, types, strategies

Resource files are organized by API group: `packages/shared/src/models/k8s/groups/{Group}/{Resource}/`

Each resource directory typically contains: `constants.ts`, `labels.ts`, `types.ts`, `schema.ts`, and `utils/`.

### `apps/client/src/k8s/` - Client-Side K8s Logic

Contains React hooks and UI utilities:

- **Watch hooks** - `useWatchList`, `useWatchItem` for real-time data
- **CRUD hooks** - `useBasicCRUD`, `useResourceCRUDMutation` for create/patch/delete
- **Permission hooks** - `usePermissions` for K8s RBAC checks
- **Hook creators** - factory functions to bind hooks to specific resource configs
- **Resource group hooks** - pre-bound hooks per resource (e.g., `useCodebaseWatchList`)
- **Status utilities** - icon mapping, color mapping for resource status display

**Rule of thumb**: If it uses React, hooks, or renders UI --> `apps/client/src/k8s/`. If it defines resource structure or business logic --> `packages/shared/`.

## K8sResourceConfig

The central config object that describes how to interact with a K8s resource. Every resource has one defined in `packages/shared/`. To see the schema, read `packages/shared/src/models/k8s/common/schema.ts` (look for `k8sResourceConfigSchema`).

Key fields: `apiVersion`, `group`, `version`, `kind`, `singularName`, `pluralName`, `labels` (optional label key constants), `clusterScoped` (optional boolean for non-namespaced resources).

Example: To see how a config is defined, read `packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts` and look for `k8sCodebaseConfig`.

## Watch Hooks (Real-Time Data)

### useWatchList

Fetches a list of K8s resources and subscribes to WebSocket updates for real-time changes (add, modify, delete).

**Returns** a `UseWatchListResult<T>` with:

- `data.array` - flat array of items (use this for DataTable)
- `data.map` - Map keyed by resource name
- `isLoading` - true during initial fetch
- `isReady` - true when data is loaded
- `isEmpty` - true when zero items
- `error` - any fetch error
- `query` - underlying React Query result

**Parameters**: `resourceConfig`, optional `labels` (for label filtering), optional `namespace`, optional `queryOptions`, optional `transform`.

The `labels` parameter accepts a `Record<string, string>` for label-based filtering (sent as `labelSelector` to the K8s API). Always use label constants from the shared package for the keys.

### useWatchItem

Fetches a single resource by name with WebSocket updates.

**Returns** a `UseWatchItemResult<T>` with: `data` (the resource or undefined), `isLoading`, `isReady`, `resourceVersion`, `query`.

**Parameters**: `resourceConfig`, `name` (string or undefined to disable), optional `namespace`, optional `queryOptions`, optional `transform`.

The item hook automatically reads initial data from the list cache when available, avoiding a redundant API call.

### Hook Creators (Factory Pattern)

Rather than passing `resourceConfig` every time, the portal uses factory functions to create pre-bound hooks per resource:

- `createUseWatchListHook<T>(config)` returns a hook that only needs optional params
- `createUseWatchItemHook<T>(config)` returns a hook that only needs `{ name }`
- `createUsePermissionsHook(config)` returns a hook with no params
- `createUseWatchListMultipleHook<T>(config)` returns a hook for multi-namespace watching

These factories are in `apps/client/src/k8s/api/hooks/hook-creators/index.ts`.

### Pre-Bound Resource Hooks

Each resource group directory exports pre-bound hooks. For example, the Codebase resource (in `apps/client/src/k8s/api/groups/KRCI/Codebase/hooks/index.ts`) exports:

- `useCodebaseWatchList` - bound to `k8sCodebaseConfig`
- `useCodebaseWatchItem` - bound to `k8sCodebaseConfig`
- `useCodebasePermissions` - bound to `k8sCodebaseConfig`
- `useCodebaseCRUD` - custom CRUD with toast messages

To discover which hooks exist for a resource, read the `hooks/index.ts` file in its group directory.

## CRUD Operations

### useBasicCRUD (Generic)

A generic hook for simple create/patch/delete operations. Takes a `K8sResourceConfig` and returns `{ triggerCreate, triggerEdit, triggerDelete, mutations }`.

Each trigger function accepts `{ data: { resource: T }, callbacks?: { onSuccess?, onError?, onSettled? } }`.

To see the exact API, read `apps/client/src/k8s/api/hooks/useBasicCRUD/index.tsx`.

### useResourceCRUDMutation (Low-Level)

The building block under `useBasicCRUD`. Wraps a React Query `useMutation` that calls `trpc.k8s.create.mutate()`, `trpc.k8s.patch.mutate()`, or `trpc.k8s.delete.mutate()` depending on the operation.

Provides automatic toast notifications (loading, success, error) with customizable messages. Custom CRUD hooks (like `useCodebaseCRUD`) use this directly for richer behavior (e.g., creating related secrets before the main resource).

To understand the full mutation chain, read `apps/client/src/k8s/api/hooks/useResourceCRUDMutation/index.tsx`.

### Custom CRUD Hooks

For resources with complex creation flows (e.g., Codebase needs a secret created alongside it), a custom `useCRUD` hook is defined in the resource's `hooks/useCRUD/` directory. These compose multiple `useResourceCRUDMutation` calls with custom logic.

## Permissions

### usePermissions Hook

Checks K8s RBAC permissions for a resource type. Returns a `DefaultPermissionListCheckResult` with entries like `create.allowed`, `delete.allowed`, `patch.allowed`, etc.

The hook calls `trpc.k8s.itemPermissions.mutate()` with the resource's group, version, and plural name. Results are cached with `staleTime: Infinity`.

Parameters: `{ group, version, resourcePlural }`. Typically consumed via a pre-bound hook like `useCodebasePermissions()`.

To see the hook implementation, read `apps/client/src/k8s/api/hooks/usePermissions/index.ts`.

### Using Permissions in UI

Permissions data is always defined (never undefined) because the hook falls back to `defaultPermissions` on error. Access permissions like `permissions.data.create.allowed` and `permissions.data.create.reason`.

Use `ButtonWithPermission` component for permission-gated action buttons; it handles disabled state and tooltip with reason.

## Adding a New K8s Resource to the Portal

1. **Define resource in shared package**: Create directory under `packages/shared/src/models/k8s/groups/{Group}/{Resource}/` with `constants.ts` (config), `labels.ts`, `types.ts`, `schema.ts`
2. **Export from shared**: Add to the shared package's index exports
3. **Create client hooks**: In `apps/client/src/k8s/api/groups/{Group}/{Resource}/`, create `hooks/index.ts` using the hook creator factories
4. **Create custom CRUD** (if needed): Add `hooks/useCRUD/index.tsx` for complex creation flows
5. **Build UI components**: Create list page with DataTable, detail page, filter, etc.

To see a complete example of this pattern, explore the Codebase resource:

- Shared: `packages/shared/src/models/k8s/groups/KRCI/Codebase/`
- Client hooks: `apps/client/src/k8s/api/groups/KRCI/Codebase/`

## Discovery Instructions

| To learn about... | Read this file |
|-------------------|----------------|
| K8sResourceConfig schema | `packages/shared/src/models/k8s/common/schema.ts` |
| K8sResourceConfig TypeScript type | `packages/shared/src/models/k8s/common/types.ts` |
| Watch hook types (UseWatchListResult, etc.) | `apps/client/src/k8s/api/hooks/useWatch/types.ts` |
| useWatchList implementation | `apps/client/src/k8s/api/hooks/useWatch/useWatchList/index.ts` |
| useWatchItem implementation | `apps/client/src/k8s/api/hooks/useWatch/useWatchItem/index.ts` |
| Hook creator factories | `apps/client/src/k8s/api/hooks/hook-creators/index.ts` |
| useBasicCRUD hook | `apps/client/src/k8s/api/hooks/useBasicCRUD/index.tsx` |
| useResourceCRUDMutation | `apps/client/src/k8s/api/hooks/useResourceCRUDMutation/index.tsx` |
| usePermissions hook | `apps/client/src/k8s/api/hooks/usePermissions/index.ts` |
| Default permissions shape | Search for `defaultPermissions` in `packages/shared/` |
| A resource's config + types | `packages/shared/src/models/k8s/groups/{Group}/{Resource}/` |
| A resource's pre-bound hooks | `apps/client/src/k8s/api/groups/{Group}/{Resource}/hooks/index.ts` |
| All resource groups | `ls apps/client/src/k8s/api/groups/` |
| K8s server-side client | `packages/trpc/src/clients/k8s/index.ts` |
| K8s router (all procedures) | `packages/trpc/src/routers/k8s/index.ts` |
| Cluster store (namespace, clusterName) | `apps/client/src/k8s/store/` |

## Key Conventions

- Always import resource configs and types from `@my-project/shared`, not from relative paths to the shared package
- Use label constants from `labels.ts` for label selectors; never hardcode label strings
- Use pre-bound hooks (e.g., `useCodebaseWatchList`) instead of raw `useWatchList` with inline config
- Pass `data.array` (not `data` or `data.map`) to DataTable's `data` prop
- Draft creators in shared handle K8s manifest structure; components should not construct raw manifests
- The watch system uses WebSocket subscriptions that are managed automatically; you do not need to set up subscriptions manually
- Resource configs use `as const satisfies K8sResourceConfig<typeof labels>` for full type inference
- Permissions are always available (fallback to `defaultPermissions`); no need to handle undefined

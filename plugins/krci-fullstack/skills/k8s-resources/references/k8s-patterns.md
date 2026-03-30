# Advanced K8s Resource Patterns

> **When to read this**: When you need to implement cross-resource relationships, multi-namespace watching, data transformations, or other patterns beyond basic watch/CRUD.

## Label-Based Resource Relationships

Parent-child relationships between K8s resources are established through label selectors. The `labels` parameter on `useWatchList` filters resources server-side.

Always use label constants from the shared package. Each resource defines its label keys in `packages/shared/src/models/k8s/groups/{Group}/{Resource}/labels.ts`. Import them from `@my-project/shared`.

Label filtering uses AND logic: all specified labels must match.

To discover which labels a resource defines, read its `labels.ts` file.

## Multi-Namespace Watching

The `useWatchListMultiple` hook watches a resource across multiple namespaces simultaneously. It returns combined data with per-namespace breakdown.

To see its interface: read `apps/client/src/k8s/api/hooks/useWatch/useWatchListMultiple/`.

Its result includes `data.array` (merged), `data.byNamespace` (per-namespace Map), `isLoading` (ANY pending), `isReady` (ALL successful).

Factory: `createUseWatchListMultipleHook<T>(config)` in the hook-creators.

## Data Transformations

Both `useWatchList` and `useWatchItem` accept an optional `transform` parameter:

- For lists: `transform: (items: Map<string, T>) => Map<string, T>` - applied during initial fetch and after each WebSocket update
- For items: `transform: (item: T) => T` - applied during fetch and after updates

Use transformations for: normalizing data shapes, sorting by a default order, enriching items with computed fields. The transform runs inside the query/subscription pipeline, so the cache already stores transformed data.

## Owner References

K8s owner references link child to parent resources. To find children of a resource, filter by `metadata.ownerReferences`. Kubernetes garbage collection automatically deletes children when the parent is deleted.

## Status Conditions

Many K8s resources express status through `status.conditions` (an array of `{ type, status, reason, message, lastTransitionTime }`). The portal's status icon utilities typically map the `status.phase` or conditions to visual indicators. Read the resource's status type in its shared types file to understand available conditions.

## Resource Generation Tracking

`metadata.generation` increments on spec changes. `status.observedGeneration` tracks what the controller last reconciled. When `generation !== observedGeneration`, the resource is being reconciled (show an updating indicator).

## Cluster-Scoped Resources

Resources with `clusterScoped: true` in their config bypass namespace. The watch hooks detect this and omit the namespace from API URLs automatically. No special handling is needed in component code.

## Performance Considerations

1. Use server-side label selectors (`labels` param) instead of client-side filtering when possible
2. The `transform` function runs on every WebSocket event; keep it lightweight
3. Watch hooks use `staleTime` and `gcTime` for cache efficiency; avoid overriding unless necessary
4. `useWatchItem` reads initial data from the list cache (if available), avoiding duplicate API calls
5. Permissions queries use `staleTime: Infinity` since RBAC rarely changes mid-session

## Discovering Resources in the Codebase

To find all defined K8s resource configs:

```
ls packages/shared/src/models/k8s/groups/
```

To find all client-side resource hook registrations:

```
ls apps/client/src/k8s/api/groups/
```

To find how a specific resource is used in the UI:

```
grep -r "use{Resource}WatchList" apps/client/src/modules/
```

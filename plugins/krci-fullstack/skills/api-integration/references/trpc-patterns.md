# tRPC Advanced Patterns

Advanced tRPC patterns for the KubeRocketCI portal beyond basic CRUD operations.

## Context Manipulation

Access authentication context in procedures:

```typescript
const myProcedure = protectedProcedure
  .query(async ({ ctx }) => {
    const idToken = ctx.session.user.secret.idToken;
    const user = ctx.session.user;
    // Use authenticated context
  });
```

**Context Available**:

- `ctx.session.user.secret.idToken` - Kubernetes API token
- `ctx.session.user` - User information
- `ctx.session` - Full session data

**Location**: `packages/trpc/src/procedures/protected/index.ts`

## WebSocket Subscriptions

Use `subscription` for real-time updates:

```typescript
mySubscription: protectedProcedure
  .subscription(async function* ({ ctx }) {
    // Yield updates as they occur
    for await (const event of eventStream) {
      yield event;
    }
  })
```

**Pattern**: Kubernetes watch streams → tRPC subscriptions → React components

**Check**: `packages/trpc/src/routers/k8s/procedures/basic/watchList/` for watch implementation

## Error Handling Patterns

### Custom Error Responses

```typescript
import { TRPCError } from '@trpc/server';

throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Resource not found',
  cause: originalError,
});
```

**Error Codes**: `BAD_REQUEST`, `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `INTERNAL_SERVER_ERROR`

### Client-Side Error Handling

```typescript
const { error } = useQuery({
  queryKey: ["resource"],
  queryFn: () => trpc.resource.get.query({ id }),
  retry: (failureCount, error) => {
    if (error.data?.code === 'NOT_FOUND') return false;
    return failureCount < 3;
  },
});
```

## Input Validation with Zod

```typescript
import { z } from 'zod';

const inputSchema = z.object({
  name: z.string().min(3).max(50),
  namespace: z.string().regex(/^[a-z0-9-]+$/),
  spec: z.object({
    replicas: z.number().int().min(1).max(10),
  }),
});

export const myProcedure = protectedProcedure
  .input(inputSchema)
  .mutation(async ({ input }) => {
    // input is fully typed and validated
  });
```

**Pattern**: Define schemas in shared package, reuse across routers.

**Location**: `packages/shared/src/models/k8s/groups/*/schema.ts`

## Batch Requests

Multiple queries in one request:

```typescript
const [resource1, resource2, resource3] = await Promise.all([
  trpc.resources.get.query({ id: 1 }),
  trpc.resources.get.query({ id: 2 }),
  trpc.resources.get.query({ id: 3 }),
]);
```

**tRPC batching**: Automatically batches simultaneous requests.

## Middleware Patterns

Add custom logic to procedures:

```typescript
const loggedProcedure = protectedProcedure.use(async ({ ctx, next, path }) => {
  const start = Date.now();
  const result = await next();
  const duration = Date.now() - start;
  console.log(`${path} took ${duration}ms`);
  return result;
});
```

**Use cases**: Logging, metrics, rate limiting, caching

## React Query Integration Patterns

### Dependent Queries

```typescript
const { data: namespace } = useQuery({
  queryKey: ["namespace"],
  queryFn: () => trpc.namespace.get.query(),
});

const { data: resources } = useQuery({
  queryKey: ["resources", namespace],
  queryFn: () => trpc.resources.list.query({ namespace }),
  enabled: Boolean(namespace), // Only run when namespace exists
});
```

### Prefetching

```typescript
const queryClient = useQueryClient();

await queryClient.prefetchQuery({
  queryKey: ["resource", id],
  queryFn: () => trpc.resource.get.query({ id }),
});
```

## Kubernetes-Specific Patterns

### Watch Streams

The portal uses custom watch hooks that wrap tRPC procedures:

**Check**: `apps/client/src/k8s/api/hooks/useWatch/` for complete patterns

```typescript
// tRPC procedure provides data
trpc.k8s.watchList.query({ resourceConfig, namespace })

// React hook provides updates
useWatchList({ resourceConfig, namespace })
```

### Resource Permissions

Check permissions before mutations:

```typescript
const permissions = useResourcePermissions({ resourceConfig });

const { mutate } = useMutation({
  mutationFn: (data) => trpc.k8s.create.mutate({ resourceConfig, data }),
  onMutate: () => {
    if (!permissions.data?.create.allowed) {
      throw new Error(permissions.data?.create.reason);
    }
  },
});
```

## Performance Optimization

**Stale time**: Set appropriate stale times for different data types:

- Static config: `staleTime: Infinity`
- Kubernetes resources: `staleTime: 0` (use watch hooks)
- User preferences: `staleTime: 5 * 60 * 1000` (5 minutes)

**Cache invalidation**: Invalidate after mutations:

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ["resources"] });
}
```

## Real-World Examples

**K8s Router**: `packages/trpc/src/routers/k8s/index.ts`
**Auth Router**: `packages/trpc/src/routers/auth/index.ts`
**Config Router**: `packages/trpc/src/routers/config/index.ts`

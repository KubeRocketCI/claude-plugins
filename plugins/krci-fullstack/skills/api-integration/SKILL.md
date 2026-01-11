---
name: API Integration
description: This skill should be used when the user asks to "add API endpoint", "create tRPC procedure", "implement React Query hook", "API integration", "tRPC router", "data fetching", "mutations", or mentions backend API, tRPC patterns, or React Query integration.
version: 0.1.0
---

Implement type-safe API endpoints using tRPC with React Query integration for data fetching and mutations in the KubeRocketCI portal.

## Purpose

Guide tRPC API endpoint creation and React Query hook integration following portal's type-safe patterns for client-server communication.

## Tech Stack

- **tRPC**: Type-safe API framework
- **React Query**: Data fetching and caching (via tRPC client)
- **Zod**: Input validation schemas
- **Fastify**: Backend server framework

## tRPC Router Creation

### Define Router

```typescript
// packages/trpc/src/routers/codebases/index.ts
import { t } from "../../trpc.js";
import { publicProcedure } from "../../trpc.js";
import { protectedProcedure } from "../../procedures/protected/index.js";
import { z } from "zod";

export const codebaseRouter = t.router({
  // Query - fetch data
  list: protectedProcedure
    .query(async ({ ctx }) => {
      const codebases = await k8sService.listCodebases(ctx.session.user.secret.idToken);
      return codebases;
    }),

  // Query with input
  getByName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .query(async ({ ctx, input }) => {
      const codebase = await k8sService.getCodebase(
        input.name,
        ctx.session.user.secret.idToken
      );
      return codebase;
    }),

  // Mutation - create/update/delete
  create: protectedProcedure
    .input(codebaseSchema)
    .mutation(async ({ ctx, input }) => {
      const codebase = await k8sService.createCodebase(
        input,
        ctx.session.user.secret.idToken
      );
      return codebase;
    }),

  delete: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await k8sService.deleteCodebase(input.name, ctx.session.user.secret.idToken);
      return { success: true };
    }),
});
```

### Register Router

```typescript
// packages/trpc/src/routers/index.ts
import { t } from "../trpc.js";
import { codebaseRouter } from "./codebases/index.js";
import { pipelineRouter } from "./pipelines/index.js";

export const appRouter = t.router({
  codebases: codebaseRouter,
  pipelines: pipelineRouter,
});

export type AppRouter = typeof appRouter;
```

## Frontend Integration

### tRPC Client Hook

```typescript
// apps/client/src/core/providers/trpc/hooks.ts
import { useContext } from "react";
import { TRPCContext } from "./context";

export const useTRPCClient = () => {
  const client = useContext(TRPCContext);
  if (!client) {
    throw new Error("useTRPCClient must be used within TRPCProvider");
  }
  return client;
};
```

### Use in Components

#### Query (Fetch Data)

```typescript
import { useTRPCClient } from "@/core/providers/trpc";
import { useQuery } from "@tanstack/react-query";

const CodebaseList = () => {
  const trpc = useTRPCClient();

  const { data: codebases, isLoading, error } = useQuery({
    queryKey: ["codebases.list"],
    queryFn: () => trpc.codebases.list.query(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <ul className="space-y-2">
      {codebases.map(codebase => (
        <li key={codebase.metadata.name} className="p-2 border rounded">
          {codebase.metadata.name}
        </li>
      ))}
    </ul>
  );
};
```

#### Query with Parameters

```typescript
const CodebaseDetails = ({ name }: { name: string }) => {
  const trpc = useTRPCClient();

  const { data: codebase } = useQuery({
    queryKey: ["codebases.get", name],
    queryFn: () => trpc.codebases.getByName.query({ name }),
    enabled: Boolean(name),
  });

  return <CodebaseView codebase={codebase} />;
};
```

#### Mutation (Create/Update/Delete)

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTRPCClient } from "@/core/providers/trpc";

const CreateCodebaseButton = () => {
  const trpc = useTRPCClient();
  const queryClient = useQueryClient();

  const { mutate: createCodebase, isPending } = useMutation({
    mutationFn: (data: CodebaseFormData) => trpc.codebases.create.mutate(data),
    onSuccess: () => {
      // Invalidate list query to refetch
      queryClient.invalidateQueries({ queryKey: ["codebases.list"] });
      toast.success('Codebase created');
    },
    onError: (error) => {
      toast.error(`Failed: ${error.message}`);
    },
  });

  const handleCreate = (data: CodebaseFormData) => {
    createCodebase(data);
  };

  return (
    <Button onClick={() => handleCreate(formData)} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Codebase'}
    </Button>
  );
};
```

## React Query Patterns

### Automatic Refetching

```typescript
const trpc = useTRPCClient();

const { data } = useQuery({
  queryKey: ["codebases.list"],
  queryFn: () => trpc.codebases.list.query(),
  refetchOnWindowFocus: true,
  refetchInterval: 30000,  // Every 30s
});
```

### Optimistic Updates

```typescript
const { mutate: updateCodebase } = trpc.codebases.update.useMutation({
  onMutate: async (newData) => {
    // Cancel outgoing refetches
    await utils.codebases.getByName.cancel({ name: newData.name });

    // Snapshot current value
    const previous = utils.codebases.getByName.getData({ name: newData.name });

    // Optimistically update
    utils.codebases.getByName.setData({ name: newData.name }, newData);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      utils.codebases.getByName.setData(
        { name: variables.name },
        context.previous
      );
    }
  },
  onSettled: (data, error, variables) => {
    // Refetch to ensure consistency
    utils.codebases.getByName.invalidate({ name: variables.name });
  },
});
```

### Dependent Queries

```typescript
const CodebaseWithBranches = ({ name }: { name: string }) => {
  const { data: codebase } = trpc.codebases.getByName.useQuery({ name });

  const { data: branches } = trpc.branches.listForCodebase.useQuery(
    { codebaseName: name },
    { enabled: !!codebase }  // Only fetch if codebase exists
  );

  return <View codebase={codebase} branches={branches} />;
};
```

## Input Validation

### Zod Schema

```typescript
const codebaseSchema = z.object({
  name: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/),
  gitUrl: z.string().url(),
  branch: z.string().optional(),
  type: z.enum(['application', 'library', 'autotests']),
});
```

### Shared Schemas

Import from shared package for consistency:

```typescript
import { codebaseSchema } from "@my-project/shared";

export const codebaseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(codebaseSchema)  // Use shared schema
    .mutation(async ({ input }) => {
      // input is fully typed
    }),
});
```

## Error Handling

### Backend Errors

```typescript
import { TRPCError } from '@trpc/server';

export const codebaseRouter = createTRPCRouter({
  delete: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const exists = await k8sService.codebaseExists(input.name);

      if (!exists) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: `Codebase ${input.name} not found`,
        });
      }

      await k8sService.deleteCodebase(input.name, ctx.tokens.idToken);
      return { success: true };
    }),
});
```

### Frontend Error Handling

```typescript
const { error } = trpc.codebases.list.useQuery();

if (error) {
  if (error.data?.code === 'UNAUTHORIZED') {
    return <Navigate to="/login" />;
  }
  return <ErrorMessage message={error.message} />;
}
```

## Authentication

### Protected Procedures

```typescript
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,     // Guaranteed to exist
      tokens: ctx.tokens, // Access and ID tokens
    },
  });
});
```

### Using in Routers

```typescript
export const codebaseRouter = createTRPCRouter({
  // Public - no auth required
  getPublicInfo: publicProcedure.query(() => ({ version: '1.0.0' })),

  // Protected - auth required
  list: protectedProcedure.query(({ ctx }) => {
    // ctx.user and ctx.tokens guaranteed
    return k8sService.listCodebases(ctx.tokens.idToken);
  }),
});
```

## Best Practices

1. **Type Safety**: Let tRPC infer types, don't use `any`
2. **Input Validation**: Always use Zod schemas for inputs
3. **Error Handling**: Use TRPCError with proper codes
4. **Authentication**: Use protectedProcedure for authenticated endpoints
5. **Shared Schemas**: Import schemas from shared package
6. **Query Invalidation**: Invalidate queries after mutations
7. **Loading States**: Always handle loading and error states
8. **Optimistic Updates**: For better UX on mutations

## Integration with K8s

```typescript
// Use ID token for K8s API calls
export const codebaseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(codebaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Use ID token from auth context
      const codebase = await k8sService.createCodebase(
        input,
        ctx.tokens.idToken  // K8s API requires ID token
      );
      return codebase;
    }),
});
```

## Additional Resources

See **`references/trpc-patterns.md`** for advanced patterns including WebSocket subscriptions, batch requests, and custom middleware.

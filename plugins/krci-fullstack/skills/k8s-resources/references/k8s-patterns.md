# Kubernetes Resource Patterns

Advanced patterns for working with Kubernetes Custom Resources in the KubeRocketCI portal.

## Label Selectors

Filter resources by labels:

```typescript
const codebaseWatch = useWatchList({
  resourceConfig: k8sCodebaseConfig,
  labels: {
    'app.kubernetes.io/component': 'frontend',
    'environment': 'production',
  },
});
```

**Label matching**: All specified labels must match (AND logic).

**Location**: `apps/client/src/k8s/api/hooks/useWatch/useWatchList/index.ts`

## Resource Transformations

Transform resources before display:

```typescript
const codebaseWatch = useWatchList({
  resourceConfig: k8sCodebaseConfig,
  transform: (items) => {
    // Sort by creation time
    const sorted = new Map(
      [...items.entries()].sort((a, b) => {
        const timeA = new Date(a[1].metadata.creationTimestamp || 0);
        const timeB = new Date(b[1].metadata.creationTimestamp || 0);
        return timeB.getTime() - timeA.getTime();
      })
    );
    return sorted;
  },
});
```

**Use cases**: Sorting, filtering, enriching data, normalizing structures

## Multi-Resource Watching

Watch multiple resource types simultaneously:

```typescript
const codebaseWatch = useWatchList({ resourceConfig: k8sCodebaseConfig });
const branchWatch = useWatchList({ resourceConfig: k8sCodebaseBranchConfig });
const pipelineWatch = useWatchList({ resourceConfig: k8sCDPipelineConfig });

// Combine data
const resources = useMemo(() => ({
  codebases: codebaseWatch.dataArray,
  branches: branchWatch.dataArray,
  pipelines: pipelineWatch.dataArray,
}), [codebaseWatch.dataArray, branchWatch.dataArray, pipelineWatch.dataArray]);
```

## Cross-Namespace Resources

Watch resources across multiple namespaces:

```typescript
import { useWatchListMultiple } from "@/k8s/api/hooks/useWatch/useWatchListMultiple";

const allCodebases = useWatchListMultiple({
  resourceConfig: k8sCodebaseConfig,
  namespaces: ['dev', 'staging', 'prod'],
});
```

**Location**: `apps/client/src/k8s/api/hooks/useWatch/useWatchListMultiple/`

## Owner References

Link resources via owner references:

```typescript
// Find resources owned by a parent
const branches = branchWatch.dataArray.filter(branch =>
  branch.metadata.ownerReferences?.some(ref =>
    ref.kind === 'Codebase' && ref.name === codebase.metadata.name
  )
);
```

**Pattern**: Kubernetes garbage collection automatically deletes child resources when parent is deleted.

## Status Conditions

Check resource status conditions:

```typescript
const getCondition = (resource: KubeObjectBase, type: string) => {
  return resource.status?.conditions?.find(c => c.type === type);
};

const isReady = (resource: KubeObjectBase) => {
  const readyCondition = getCondition(resource, 'Ready');
  return readyCondition?.status === 'True';
};

const getStatusMessage = (resource: KubeObjectBase) => {
  const readyCondition = getCondition(resource, 'Ready');
  return readyCondition?.message || 'Unknown status';
};
```

## Resource Creation with Defaults

Create resources with default values:

```typescript
import { createCodebaseDraft } from "@my-project/shared";

const handleCreate = async (values: CodebaseFormValues) => {
  const draft = createCodebaseDraft({
    name: values.name,
    namespace: defaultNamespace,
    spec: {
      type: values.type,
      // ... other fields
    },
  });

  await createMutation.mutateAsync({
    resourceConfig: k8sCodebaseConfig,
    namespace: defaultNamespace,
    data: draft,
  });
};
```

**Draft creators**: Located in `packages/shared/src/models/k8s/groups/*/utils/`

## Patch Operations

Update specific fields without replacing entire resource:

```typescript
const patchMutation = useResourceCRUDMutation({
  resourceConfig: k8sCodebaseConfig,
  operation: 'patch',
});

await patchMutation.mutateAsync({
  name: codebase.metadata.name,
  namespace: codebase.metadata.namespace,
  data: {
    spec: {
      description: newDescription, // Only update description
    },
  },
});
```

**Patch types**: Strategic merge patch (default), JSON merge patch, JSON patch

## Permission-Based UI

Show/hide UI based on resource permissions:

```typescript
const permissions = useResourcePermissions({
  resourceConfig: k8sCodebaseConfig,
  namespace: defaultNamespace,
});

// In component
{permissions.data?.create.allowed && (
  <Button onClick={handleCreate}>
    Create Codebase
  </Button>
)}

{!permissions.data?.create.allowed && (
  <Tooltip content={permissions.data?.create.reason}>
    <Button disabled>Create Codebase</Button>
  </Tooltip>
)}
```

**Location**: `apps/client/src/k8s/api/hooks/usePermissions/`

## Resource Events

Watch Kubernetes events for a resource:

```typescript
// Events are included in resource watch
const events = resource.status?.events || [];

// Display events
events.map(event => (
  <div key={event.timestamp}>
    <span>{event.type}</span>
    <span>{event.reason}</span>
    <span>{event.message}</span>
  </div>
));
```

## Finalizers

Resources with finalizers require cleanup before deletion:

```typescript
const hasFinalizers = (resource: KubeObjectBase) => {
  return (resource.metadata.finalizers?.length || 0) > 0;
};

// Warning before delete
{hasFinalizers(resource) && (
  <Alert>
    This resource has finalizers and may take time to delete.
  </Alert>
)}
```

## Resource Quotas and Limits

Check namespace quotas:

```typescript
const quotaWatch = useWatchItem({
  resourceConfig: k8sResourceQuotaConfig,
  name: 'default-quota',
  namespace: currentNamespace,
});

const canCreate = () => {
  const used = quotaWatch.data?.status?.used?.['count/pods'] || 0;
  const hard = quotaWatch.data?.status?.hard?.['count/pods'] || 0;
  return used < hard;
};
```

## Custom Resource Schemas

Validate against CRD schema:

```typescript
import { codebaseSchema } from "@my-project/shared";

const validateResource = (data: unknown) => {
  try {
    codebaseSchema.parse(data);
    return { valid: true };
  } catch (error) {
    return { valid: false, errors: error.errors };
  }
};
```

**Schemas**: Located in `packages/shared/src/models/k8s/groups/*/schema.ts`

## Resource Generation

Track resource updates via generation:

```typescript
const hasUpdates = (resource: KubeObjectBase) => {
  // Generation increments on spec changes
  // ObservedGeneration tracks last reconciled generation
  return resource.metadata.generation !==
         resource.status?.observedGeneration;
};

{hasUpdates(resource) && (
  <Badge>Updating...</Badge>
)}
```

## Real-World Examples

**Check these implementations**:

- Codebase management: `apps/client/src/modules/platform/codebases/`
- Pipeline management: `apps/client/src/modules/platform/cdpipelines/`
- Tekton resources: `apps/client/src/modules/platform/tekton/`
- K8s API groups: `apps/client/src/k8s/api/groups/`

## Performance Optimization

1. **Use watch hooks** - Avoid polling, use WebSocket watches
2. **Transform data once** - Apply transformations in watch hook, not component
3. **Memoize derived data** - Cache computed values with useMemo
4. **Filter early** - Use label selectors instead of client-side filtering
5. **Limit watched resources** - Only watch what you need

## Best Practices

1. **Handle loading states** - Check `query.isFetched` before rendering
2. **Handle errors gracefully** - Show user-friendly error messages
3. **Use permission checks** - Validate permissions before mutations
4. **Validate input** - Use Zod schemas from shared package
5. **Track resource status** - Display conditions and generation info
6. **Clean up on unmount** - WebSocket connections auto-close

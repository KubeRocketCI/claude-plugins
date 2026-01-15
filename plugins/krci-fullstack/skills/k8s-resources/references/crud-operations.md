# Kubernetes Resource CRUD Operations

Detailed guide for performing Create, Read, Update, and Delete operations on Kubernetes Custom Resources using the portal's hooks.

## useBasicCRUD Hook

The portal provides a unified hook for CRUD operations:

```typescript
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";
import { k8sCodebaseConfig } from "@my-project/shared";

const { create, update, delete: deleteResource, isPending } = useBasicCRUD({
  config: k8sCodebaseConfig,
});
```

## Create Resource

### Basic Creation

```typescript
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";
import { createCodebaseDraft } from "@my-project/shared";

function CreateCodebaseDialog() {
  const { create, isPending } = useBasicCRUD({
    config: k8sCodebaseConfig,
  });

  const handleSubmit = async (data: CodebaseFormData) => {
    const draft = createCodebaseDraft(data);
    await create(draft);
  };

  return (
    <Dialog>
      <CodebaseForm onSubmit={handleSubmit} isPending={isPending} />
    </Dialog>
  );
}
```

### Creation with Draft Utilities

Always use draft creator functions from shared package:

```typescript
import { createCodebaseDraft } from "@my-project/shared";

const draft = createCodebaseDraft({
  name: "my-codebase",
  gitUrl: "https://github.com/org/repo",
  branch: "main",
  type: "application",
});

await create(draft);
```

**Why use draft creators:**

- Handles Kubernetes resource structure (apiVersion, kind, metadata)
- Applies default values
- Ensures type safety
- Located in `packages/shared/src/models/k8s/groups/*/utils/`

### Creation with Validation

```typescript
const handleCreate = async (formData: CodebaseFormData) => {
  try {
    // Validate with Zod schema
    const validated = codebaseSchema.parse(formData);

    const draft = createCodebaseDraft(validated);
    await create(draft);

    toast.success("Codebase created successfully");
    onClose();
  } catch (error) {
    if (error instanceof ZodError) {
      toast.error("Validation failed: " + error.message);
    } else {
      toast.error("Failed to create codebase");
    }
  }
};
```

## Read Resources

### Watch Single Resource

Use `useWatchItem` for real-time updates of a single resource:

```typescript
import { useWatchItem } from "@/k8s/api/hooks/useWatchItem";

function CodebaseDetails({ name }: { name: string }) {
  const codebaseWatch = useWatchItem({
    resourceConfig: k8sCodebaseConfig,
    name,
    namespace: 'default',
  });

  if (!codebaseWatch.query.isFetched) return <LoadingSpinner />;
  if (!codebaseWatch.data) return <NotFound />;

  return <CodebaseView codebase={codebaseWatch.data} />;
}
```

**Watch features:**

- Real-time WebSocket updates
- Automatic re-rendering on changes
- Built-in loading and error states

### Watch List of Resources

Use `useWatchList` for lists:

```typescript
import { useWatchList } from "@/k8s/api/hooks/useWatchList";

function CodebaseList() {
  const codebaseWatch = useWatchList({
    resourceConfig: k8sCodebaseConfig,
    namespace: 'default',
  });

  if (!codebaseWatch.query.isFetched) return <LoadingSpinner />;

  return (
    <Table
      data={codebaseWatch.dataArray}
      columns={columns}
    />
  );
}
```

### Watch with Label Selectors

Filter resources using label selectors (always use label constants):

```typescript
import { codebaseBranchLabels } from "@my-project/shared";

const { data: branches } = useWatchList({
  resourceConfig: k8sCodebaseBranchConfig,
  namespace: 'default',
  labelSelector: {
    [codebaseBranchLabels.codebase]: codebaseName, // Using constant
  },
});
```

See **`k8s-patterns.md`** for advanced label selector patterns.

## Update Resource

### Basic Update

```typescript
const { update } = useBasicCRUD({ config: k8sCodebaseConfig });

const handleUpdate = async (codebase: Codebase, changes: Partial<CodebaseSpec>) => {
  const updated = {
    ...codebase,
    spec: {
      ...codebase.spec,
      ...changes,
    },
  };
  await update(updated);
};
```

### Patch Operations

For updating specific fields without replacing the entire resource:

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

**Patch types:**

- Strategic merge patch (default)
- JSON merge patch
- JSON patch

### Update with Optimistic Updates

```typescript
const { update } = useBasicCRUD({
  config: k8sCodebaseConfig,
  onMutate: async (updatedResource) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['codebases', updatedResource.metadata.name]);

    // Snapshot previous value
    const previous = queryClient.getQueryData(['codebases', updatedResource.metadata.name]);

    // Optimistically update
    queryClient.setQueryData(['codebases', updatedResource.metadata.name], updatedResource);

    return { previous };
  },
  onError: (err, variables, context) => {
    // Rollback on error
    if (context?.previous) {
      queryClient.setQueryData(
        ['codebases', variables.metadata.name],
        context.previous
      );
    }
  },
});
```

## Delete Resource

### Basic Deletion

```typescript
const { delete: deleteResource } = useBasicCRUD({ config: k8sCodebaseConfig });

const handleDelete = async (name: string, namespace: string) => {
  await deleteResource({ name, namespace });
};
```

### Deletion with Confirmation

```typescript
function DeleteCodebaseButton({ codebase }: { codebase: Codebase }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { delete: deleteResource, isPending } = useBasicCRUD({
    config: k8sCodebaseConfig,
  });

  const handleDelete = async () => {
    try {
      await deleteResource({
        name: codebase.metadata.name,
        namespace: codebase.metadata.namespace,
      });
      toast.success("Codebase deleted");
      setIsOpen(false);
    } catch (error) {
      toast.error(`Failed to delete: ${error.message}`);
    }
  };

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Delete
      </Button>

      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {codebase.metadata.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

### Deletion with Finalizer Check

Warn users if resource has finalizers:

```typescript
const hasFinalizers = (resource: KubeObjectBase) => {
  return (resource.metadata.finalizers?.length || 0) > 0;
};

// In component
{hasFinalizers(codebase) && (
  <Alert variant="warning">
    This resource has finalizers and may take time to delete.
  </Alert>
)}
```

## Permission Integration

Always check permissions before showing CRUD actions:

```typescript
import { ButtonWithPermission } from "@/core/components/ButtonWithPermission";

function CodebaseActions({ codebase }: { codebase: Codebase }) {
  const permissions = useCodebasePermissions(codebase);
  const { delete: deleteResource } = useBasicCRUD({ config: k8sCodebaseConfig });

  return (
    <div className="flex gap-2">
      <ButtonWithPermission
        allowed={permissions.data?.update.allowed}
        reason={permissions.data?.update.reason}
        ButtonProps={{ onClick: handleEdit }}
      >
        Edit
      </ButtonWithPermission>

      <ButtonWithPermission
        allowed={permissions.data?.delete.allowed}
        reason={permissions.data?.delete.reason}
        ButtonProps={{
          onClick: () => deleteResource({
            name: codebase.metadata.name,
            namespace: codebase.metadata.namespace,
          }),
          variant: "destructive"
        }}
      >
        Delete
      </ButtonWithPermission>
    </div>
  );
}
```

## Error Handling

### Handle K8s API Errors

```typescript
const { create, isPending } = useBasicCRUD({ config: k8sCodebaseConfig });

const handleCreate = async (data: CodebaseFormData) => {
  try {
    const draft = createCodebaseDraft(data);
    await create(draft);
    toast.success("Created successfully");
  } catch (error) {
    if (error.code === 409) {
      toast.error("Resource already exists");
    } else if (error.code === 403) {
      toast.error("Permission denied");
    } else {
      toast.error(`Failed to create: ${error.message}`);
    }
  }
};
```

### Handle Validation Errors

```typescript
try {
  await create(draft);
} catch (error) {
  if (error.message?.includes("validation")) {
    // Show field-specific errors
    const fieldErrors = parseK8sValidationErrors(error);
    Object.entries(fieldErrors).forEach(([field, message]) => {
      form.setFieldError(field, message);
    });
  }
}
```

## Best Practices

1. **Use Watch Hooks** - Prefer `useWatchItem`/`useWatchList` over direct API calls for real-time updates
2. **Draft Creators** - Always use draft creator functions from shared package
3. **Permission Checks** - Validate permissions before mutations
4. **Error Handling** - Provide user-friendly error messages
5. **Loading States** - Show loading indicators during operations
6. **Optimistic Updates** - For better UX, update UI before server response
7. **Confirmation Dialogs** - Always confirm destructive actions
8. **Finalizer Awareness** - Warn users about resources with finalizers
9. **Label Constants** - Use label constants from shared package, never hardcode
10. **Type Safety** - Leverage TypeScript types from resource configs

---
name: Kubernetes Resource UI Patterns
description: This skill should be used when the user asks to "implement K8s resource UI", "Kubernetes resource component", "CRD UI", "custom resource display", "K8s API integration", or mentions Kubernetes resource presentation, watch hooks, or portal-specific K8s patterns.
version: 0.1.0
---

Implement UI components for Kubernetes Custom Resources following the KubeRocketCI portal's patterns for resource display, watching, and management.

## Purpose

Guide implementation of UI components that interact with Kubernetes Custom Resources using portal's watch hooks, resource configurations, and presentation patterns.

## K8s Integration Stack

- **K8s API**: Direct integration with cluster API
- **Watch Hooks**: Real-time resource monitoring
- **Resource Configs**: Typed K8s resource definitions
- **Draft Creators**: Resource creation utilities

## Resource Configuration

### Define Resource Config

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts
import { K8sResourceConfig } from "../../../common/types.js";

export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  group: "v2.edp.epam.com",
  version: "v1",
  kind: "Codebase",
  singularName: "codebase",
  pluralName: "codebases",
  labels: codebaseLabels,
} as const satisfies K8sResourceConfig<typeof codebaseLabels>;
```

## Watch Hooks

### List Resources

```typescript
import { useWatchList } from "@/k8s/api/hooks/useWatchList";
import { k8sCodebaseConfig } from "@my-project/shared";

const CodebaseList = () => {
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
};
```

### Watch Single Resource

```typescript
import { useWatchItem } from "@/k8s/api/hooks/useWatchItem";
import { k8sCodebaseConfig } from "@my-project/shared";

const CodebaseDetails = ({ name }: { name: string }) => {
  const codebaseWatch = useWatchItem({
    resourceConfig: k8sCodebaseConfig,
    name,
    namespace: 'default',
  });

  if (!codebaseWatch.query.isFetched) return <LoadingSpinner />;
  if (!codebaseWatch.data) return <NotFound />;

  return <CodebaseView codebase={codebaseWatch.data} />;
};
```

## CRUD Operations

### Create Resource

```typescript
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";
import { createCodebaseDraft } from "@my-project/shared";

const CreateCodebaseDialog = () => {
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
};
```

### Update Resource

```typescript
const { update } = useBasicCRUD({ config: k8sCodebaseConfig });

const handleUpdate = async (codebase: Codebase, changes: Partial<Codebase>) => {
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

### Delete Resource

```typescript
const { delete: deleteResource } = useBasicCRUD({ config: k8sCodebaseConfig });

const handleDelete = async (name: string, namespace: string) => {
  await deleteResource({ name, namespace });
};
```

## Resource Status Display

### Status Icon Pattern

```typescript
const getCodebaseStatusIcon = (codebase: Codebase) => {
  const phase = codebase.status?.phase;

  switch (phase) {
    case 'Running':
      return { component: CheckCircleIcon, color: 'success', isSpinning: false };
    case 'Failed':
      return { component: ErrorIcon, color: 'error', isSpinning: false };
    case 'Pending':
      return { component: SyncIcon, color: 'warning', isSpinning: true };
    default:
      return { component: HelpIcon, color: 'default', isSpinning: false };
  }
};

// Usage in component
const CodebaseStatus = ({ codebase }: { codebase: Codebase }) => {
  const statusIcon = getCodebaseStatusIcon(codebase);

  return (
    <StatusIcon
      Icon={statusIcon.component}
      color={statusIcon.color}
      isSpinning={statusIcon.isSpinning}
      Title={<Typography>Status: {codebase.status?.phase}</Typography>}
    />
  );
};
```

## Draft Creators

### Use Shared Draft Creators

```typescript
import { createCodebaseDraft } from "@my-project/shared";

const CodebaseForm = () => {
  const handleSubmit = (formData: CodebaseFormData) => {
    // Draft creator handles K8s resource structure
    const draft = createCodebaseDraft({
      name: formData.name,
      gitUrl: formData.gitUrl,
      branch: formData.branch,
      type: formData.type,
    });

    // draft is properly formatted K8s resource
    await create(draft);
  };

  return <Form onSubmit={handleSubmit} />;
};
```

## Resource Permissions

### Permission Hook for K8s Resources

```typescript
import { createUsePermissionsHook } from "@/core/permissions/createUsePermissionsHook";

export const useCodebasePermissions = createUsePermissionsHook({
  resource: 'codebases',
  apiVersion: 'v2.edp.epam.com/v1',
  kind: 'Codebase',
});

// Use in component
const CodebaseActions = ({ codebase }: { codebase: Codebase }) => {
  const permissions = useCodebasePermissions(codebase);

  return (
    <ButtonWithPermission
      allowed={permissions.data?.delete.allowed}
      reason={permissions.data?.delete.reason}
      ButtonProps={{ onClick: () => handleDelete(codebase) }}
    >
      Delete
    </ButtonWithPermission>
  );
};
```

## Real-Time Updates

### WebSocket Integration

Portal uses WebSocket for real-time K8s resource updates:

```typescript
// Watch hooks automatically subscribe to WebSocket updates
const { data: codebases } = useWatchList({
  config: k8sCodebaseConfig,
  namespace: 'default',
});

// Component re-renders when resources change in cluster
```

## Resource Relationships

### Parent-Child Resources

```typescript
// Fetch parent resource
const { data: codebase } = useWatchItem({
  config: k8sCodebaseConfig,
  name: codebaseName,
});

// Fetch child resources (branches)
const { data: branches } = useWatchList({
  config: k8sCodebaseBranchConfig,
  namespace: 'default',
  labelSelector: {
    'app.edp.epam.com/codebaseName': codebaseName,
  },
});
```

## Error Handling

### Handle K8s API Errors

```typescript
const CodebaseList = () => {
  const { data, error, isLoading } = useWatchList({
    config: k8sCodebaseConfig,
  });

  if (error) {
    if (error.code === 403) {
      return <PermissionDenied message="Cannot list codebases" />;
    }
    return <ErrorMessage message={error.message} />;
  }

  if (isLoading) return <LoadingSpinner />;

  return <Table data={data} />;
};
```

## Resource Display Patterns

### Resource Table

```typescript
const CodebaseTable = () => {
  const { data: codebases } = useWatchList({ config: k8sCodebaseConfig });

  const columns: TableColumn<Codebase>[] = [
    {
      id: 'status',
      label: 'Status',
      render: (row) => <CodebaseStatus codebase={row} />,
    },
    {
      id: 'name',
      label: 'Name',
      render: (row) => row.metadata.name,
      columnSortableValuePath: 'metadata.name',
    },
    {
      id: 'gitUrl',
      label: 'Git URL',
      render: (row) => (
        <Link href={row.spec.gitUrlPath} target="_blank">
          {row.spec.gitUrlPath}
        </Link>
      ),
    },
    {
      id: 'actions',
      label: '',
      render: (row) => <CodebaseActionsMenu codebase={row} />,
    },
  ];

  return <Table data={codebases || []} columns={columns} />;
};
```

### Resource Details

```typescript
const CodebaseDetails = ({ name }: { name: string }) => {
  const { data: codebase } = useWatchItem({
    config: k8sCodebaseConfig,
    name,
  });

  if (!codebase) return <NotFound />;

  return (
    <Box>
      <Typography variant="h4">{codebase.metadata.name}</Typography>
      <CodebaseStatus codebase={codebase} />
      <Card>
        <CardContent>
          <Typography>Git URL: {codebase.spec.gitUrlPath}</Typography>
          <Typography>Branch: {codebase.spec.defaultBranch}</Typography>
          <Typography>Type: {codebase.spec.type}</Typography>
        </CardContent>
      </Card>
      <CodebaseBranches codebaseName={name} />
    </Box>
  );
};
```

## Best Practices

1. **Use Watch Hooks**: Real-time updates via WebSocket
2. **Resource Configs**: Define in shared package
3. **Draft Creators**: Use shared utilities for creation
4. **Permission Integration**: Check K8s RBAC
5. **Status Display**: Consistent status icon patterns
6. **Error Handling**: Handle API errors gracefully
7. **Type Safety**: Use TypeScript types from configs
8. **Label Selectors**: Filter resources by labels

## Additional Resources

See **`references/k8s-patterns.md`** for advanced patterns including custom resource definitions, resource controllers, and complex label selector queries.

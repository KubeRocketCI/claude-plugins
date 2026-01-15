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
- **Watch Hooks**: Real-time resource monitoring via WebSocket
- **Resource Configs**: Typed K8s resource definitions
- **Draft Creators**: Resource creation utilities

## K8s Code Organization

**IMPORTANT**: K8s code is split between two locations:

### Client K8s Module (`apps/client/src/k8s/`)

**API integration & UI logic**:
- Watch hooks (`useWatchList`, `useWatchItem`)
- Permission hooks (`useCodebasePermissions`)
- CRUD hooks (`useBasicCRUD`)
- Status icon utilities (icons, colors, spinning state)
- UI formatters and display helpers
- Table configurations

### Shared Package (`packages/shared/src/models/k8s/`)

**Resource definitions & business logic**:
- Resource configs (`k8sCodebaseConfig`)
- TypeScript types and interfaces (`Codebase`, `CodebaseSpec`)
- Zod schemas (`codebaseSchema`)
- Draft creators (`createCodebaseDraft`)
- **Label key constants** in separate `labels.ts` file (`codebaseLabels`)
- Business logic utilities (no UI dependencies)

**Resource File Structure in Shared:**
```
packages/shared/src/models/k8s/groups/{Group}/{Resource}/
├── constants.ts    # Resource config, enums
├── labels.ts       # Label key constants
├── types.ts        # TypeScript interfaces
├── schema.ts       # Zod schemas
└── utils/          # Draft creators, utilities
```

**Rule of thumb**: If it involves React, hooks, icons, or colors → Client. If it defines resource structure or business logic → Shared.

## Resource Configuration

### Define Resource Labels

**IMPORTANT**: All resource-specific label keys must be defined in a separate `labels.ts` file in the shared package:

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/labels.ts
export const codebaseLabels = {
  codebaseType: 'app.edp.epam.com/codebaseType',
  gitServer: 'app.edp.epam.com/gitserver',
  integration: 'app.edp.epam.com/integration',
} as const;
```

### Define Resource Config

```typescript
// packages/shared/src/models/k8s/groups/KRCI/Codebase/constants.ts
import { K8sResourceConfig } from "../../../common/types.js";
import { codebaseLabels } from "./labels.js";

export const k8sCodebaseConfig = {
  apiVersion: "v2.edp.epam.com/v1",
  group: "v2.edp.epam.com",
  version: "v1",
  kind: "Codebase",
  singularName: "codebase",
  pluralName: "codebases",
  labels: codebaseLabels, // Reference imported labels
} as const satisfies K8sResourceConfig<typeof codebaseLabels>;
```

## Watch Hooks

### Watch List of Resources

```typescript
import { useWatchList } from "@/k8s/api/hooks/useWatchList";

function CodebaseList() {
  const codebaseWatch = useWatchList({
    resourceConfig: k8sCodebaseConfig,
    namespace: 'default',
  });

  if (!codebaseWatch.query.isFetched) return <LoadingSpinner />;

  return <Table data={codebaseWatch.dataArray} columns={columns} />;
}
```

### Watch Single Resource

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
- Automatic re-rendering on resource changes
- Built-in loading and error states

## CRUD Operations

### useBasicCRUD Hook

```typescript
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";

const { create, update, delete: deleteResource, isPending } = useBasicCRUD({
  config: k8sCodebaseConfig,
});
```

### Create Resource

```typescript
import { createCodebaseDraft } from "@my-project/shared";

const handleCreate = async (formData: CodebaseFormData) => {
  const draft = createCodebaseDraft(formData);
  await create(draft);
};
```

### Update Resource

```typescript
const handleUpdate = async (codebase: Codebase, changes: Partial<CodebaseSpec>) => {
  const updated = { ...codebase, spec: { ...codebase.spec, ...changes } };
  await update(updated);
};
```

### Delete Resource

```typescript
const handleDelete = async (name: string, namespace: string) => {
  await deleteResource({ name, namespace });
};
```

See **`references/crud-operations.md`** for detailed CRUD patterns, error handling, and permission integration.

## Resource Display Patterns

### Status Icon Pattern

Display resource status with consistent icons and colors:

```typescript
const getCodebaseStatusIcon = (codebase: Codebase) => {
  switch (codebase.status?.phase) {
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

function CodebaseStatus({ codebase }: { codebase: Codebase }) {
  const statusIcon = getCodebaseStatusIcon(codebase);
  return <StatusIcon {...statusIcon} />;
}
```

### Resource Table

```typescript
function CodebaseTable() {
  const { data: codebases } = useWatchList({ config: k8sCodebaseConfig });
  const columns = useColumns(); // Use useColumns hook pattern

  return <Table data={codebases || []} columns={columns} />;
}
```

### Resource Details View

```typescript
function CodebaseDetails({ name }: { name: string }) {
  const { data: codebase } = useWatchItem({
    config: k8sCodebaseConfig,
    name,
  });

  if (!codebase) return <NotFound />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Typography variant="h4">{codebase.metadata.name}</Typography>
        <CodebaseStatus codebase={codebase} />
      </div>
      <Card>
        <CardContent>
          {/* Resource details */}
        </CardContent>
      </Card>
      <CodebaseBranches codebaseName={name} />
    </div>
  );
}
```

See **`references/resource-display-patterns.md`** for complete patterns including tables, details views, status conditions, and empty states.

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
function CodebaseActions({ codebase }: { codebase: Codebase }) {
  const permissions = useCodebasePermissions(codebase);

  return (
    <ButtonWithPermission
      allowed={permissions.data?.delete.allowed}
      reason={permissions.data?.delete.reason}
      ButtonProps={{ onClick: handleDelete }}
    >
      Delete
    </ButtonWithPermission>
  );
}
```

## Resource Relationships

### Parent-Child Resources with Label Selectors

**IMPORTANT**: Always use label constants from shared package, never hardcode label strings:

```typescript
import { codebaseBranchLabels } from "@my-project/shared";

// Fetch parent resource
const { data: codebase } = useWatchItem({
  config: k8sCodebaseConfig,
  name: codebaseName,
});

// Fetch child resources (branches) - USE LABEL CONSTANTS
const { data: branches } = useWatchList({
  config: k8sCodebaseBranchConfig,
  namespace: 'default',
  labelSelector: {
    [codebaseBranchLabels.codebase]: codebaseName, // Using constant
  },
});
```

**Why use label constants?**
- Type safety - typos caught at compile time
- Single source of truth - change label key in one place
- Refactoring - find all usages easily
- Consistency - same labels across client and trpc packages

## Draft Creators

Always use draft creator functions from shared package for resource creation:

```typescript
import { createCodebaseDraft } from "@my-project/shared";

function CodebaseForm() {
  const handleSubmit = (formData: CodebaseFormData) => {
    // Draft creator handles K8s resource structure
    const draft = createCodebaseDraft({
      name: formData.name,
      gitUrl: formData.gitUrl,
      branch: formData.branch,
      type: formData.type,
    });

    await create(draft);
  };

  return <Form onSubmit={handleSubmit} />;
}
```

**Draft creators handle:**
- Kubernetes resource structure (apiVersion, kind, metadata)
- Default values application
- Type safety
- Located in `packages/shared/src/models/k8s/groups/*/utils/`

## Best Practices

1. **Use Watch Hooks** - Real-time updates via WebSocket
2. **Resource Configs** - Define in shared package with separate `labels.ts` file
3. **Label Constants** - **Always** use label constants from shared, never hardcode label strings
4. **Draft Creators** - Use shared utilities for resource creation
5. **Permission Integration** - Check K8s RBAC before mutations
6. **Status Display** - Consistent status icon patterns (in client, not shared)
7. **Error Handling** - Handle API errors gracefully with user feedback
8. **Type Safety** - Use TypeScript types from shared configs
9. **Code Organization** - UI logic in client k8s module, definitions in shared package
10. **Real-Time Updates** - Leverage watch hooks for live data synchronization

## Additional Resources

- **`references/crud-operations.md`** - Detailed CRUD patterns with error handling and permission integration
- **`references/resource-display-patterns.md`** - Complete UI patterns for tables, details views, and status displays
- **`references/k8s-patterns.md`** - Advanced patterns including label selectors, transformations, and multi-resource watching

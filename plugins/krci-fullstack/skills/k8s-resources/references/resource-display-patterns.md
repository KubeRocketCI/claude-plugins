# Resource Display Patterns

UI patterns for displaying Kubernetes Custom Resources in tables, detail views, and status indicators.

## Status Icon Pattern

Display resource status with consistent icon, color, and spinning animations.

### Status Icon Implementation

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
```

### Usage in Component

```typescript
import { StatusIcon } from "@/core/components/StatusIcon";

function CodebaseStatus({ codebase }: { codebase: Codebase }) {
  const statusIcon = getCodebaseStatusIcon(codebase);

  return (
    <StatusIcon
      Icon={statusIcon.component}
      color={statusIcon.color}
      isSpinning={statusIcon.isSpinning}
      Title={<Typography>Status: {codebase.status?.phase}</Typography>}
    />
  );
}
```

### Status Colors

Standard color meanings:
- **success** (green) - Resource is healthy/running
- **error** (red) - Resource has failed
- **warning** (yellow/orange) - Resource is pending or degraded
- **default** (gray) - Unknown or initializing state

### Spinning Icons

Use spinning animation for transitional states:
- Pending
- Creating
- Updating
- Deleting
- Reconciling

## Resource Table Pattern

Display resources in sortable, filterable tables.

### Basic Table Structure

```typescript
import { Table } from "@/core/components/Table";
import { TableColumn } from "@/core/components/Table/types";

function CodebaseTable() {
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
}
```

### Table with useColumns Hook

**Recommended:** Use `useColumns` hook for table settings integration:

```typescript
import { useColumns } from "./hooks/useColumns";

function CodebaseTable() {
  const { data: codebases } = useWatchList({ config: k8sCodebaseConfig });
  const columns = useColumns();

  return (
    <Table
      id="codebase-list"
      data={codebases || []}
      columns={columns}
    />
  );
}
```

See **table-patterns** skill for complete useColumns pattern.

### Column Types

**Status Column:**
```typescript
{
  id: 'status',
  label: 'Status',
  data: {
    columnSortableValuePath: 'status.phase',
    render: ({ data }) => <StatusIcon {...getStatusIcon(data.status)} />,
  },
  cell: {
    isFixed: true,  // Cannot be hidden
    baseWidth: 10,
  },
}
```

**Name Column with Link:**
```typescript
{
  id: 'name',
  label: 'Name',
  data: {
    columnSortableValuePath: 'metadata.name',
    render: ({ data }) => (
      <Link to={`/codebases/${data.metadata.name}`}>
        {data.metadata.name}
      </Link>
    ),
  },
  cell: {
    baseWidth: 25,
  },
}
```

**Resource Field Column:**
```typescript
{
  id: 'type',
  label: 'Type',
  data: {
    columnSortableValuePath: 'spec.type',
    render: ({ data }) => (
      <Badge variant="secondary">{data.spec.type}</Badge>
    ),
  },
  cell: {
    baseWidth: 15,
  },
}
```

**Actions Column:**
```typescript
{
  id: 'actions',
  label: '',
  data: {
    render: ({ data }) => <ResourceActionsMenu resource={data} />,
  },
  cell: {
    baseWidth: 10,
    isFixed: true,
  },
}
```

### Actions Menu Pattern

```typescript
import { DropdownMenu } from "@/core/components/ui/dropdown-menu";

function CodebaseActionsMenu({ codebase }: { codebase: Codebase }) {
  const permissions = useCodebasePermissions(codebase);
  const { delete: deleteResource } = useBasicCRUD({ config: k8sCodebaseConfig });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVerticalIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {permissions.data?.update.allowed && (
          <DropdownMenuItem onClick={handleEdit}>
            Edit
          </DropdownMenuItem>
        )}
        {permissions.data?.delete.allowed && (
          <DropdownMenuItem onClick={handleDelete} className="text-destructive">
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

## Resource Details View

Display comprehensive resource information.

### Details Page Structure

```typescript
function CodebaseDetails({ name }: { name: string }) {
  const { data: codebase } = useWatchItem({
    config: k8sCodebaseConfig,
    name,
  });

  if (!codebase) return <NotFound />;

  return (
    <div className="space-y-6">
      {/* Header with name and status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Typography variant="h4">{codebase.metadata.name}</Typography>
          <CodebaseStatus codebase={codebase} />
        </div>
        <CodebaseActions codebase={codebase} />
      </div>

      {/* Metadata section */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Git URL</dt>
              <dd className="text-sm">{codebase.spec.gitUrlPath}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Branch</dt>
              <dd className="text-sm">{codebase.spec.defaultBranch}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Type</dt>
              <dd className="text-sm">{codebase.spec.type}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Created</dt>
              <dd className="text-sm">
                {formatDate(codebase.metadata.creationTimestamp)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Related resources */}
      <CodebaseBranches codebaseName={name} />
    </div>
  );
}
```

### Metadata Display Pattern

```typescript
function ResourceMetadata({ resource }: { resource: KubeObjectBase }) {
  return (
    <dl className="grid grid-cols-2 gap-4">
      <MetadataField
        label="Name"
        value={resource.metadata.name}
      />
      <MetadataField
        label="Namespace"
        value={resource.metadata.namespace}
      />
      <MetadataField
        label="Created"
        value={formatDate(resource.metadata.creationTimestamp)}
      />
      <MetadataField
        label="UID"
        value={resource.metadata.uid}
        className="col-span-2 font-mono text-xs"
      />
    </dl>
  );
}

function MetadataField({ label, value, className }: MetadataFieldProps) {
  return (
    <div className={className}>
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm mt-1">{value || "—"}</dd>
    </div>
  );
}
```

### Labels Display

```typescript
function ResourceLabels({ resource }: { resource: KubeObjectBase }) {
  const labels = resource.metadata.labels || {};

  if (Object.keys(labels).length === 0) {
    return <p className="text-sm text-muted-foreground">No labels</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {Object.entries(labels).map(([key, value]) => (
        <Badge key={key} variant="secondary">
          {key}: {value}
        </Badge>
      ))}
    </div>
  );
}
```

### Annotations Display

```typescript
function ResourceAnnotations({ resource }: { resource: KubeObjectBase }) {
  const annotations = resource.metadata.annotations || {};

  if (Object.keys(annotations).length === 0) {
    return <p className="text-sm text-muted-foreground">No annotations</p>;
  }

  return (
    <dl className="space-y-2">
      {Object.entries(annotations).map(([key, value]) => (
        <div key={key}>
          <dt className="text-xs font-medium text-muted-foreground">{key}</dt>
          <dd className="text-xs font-mono mt-1">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
```

## Status Conditions Display

Show resource status conditions:

```typescript
function StatusConditions({ resource }: { resource: KubeObjectBase }) {
  const conditions = resource.status?.conditions || [];

  if (conditions.length === 0) {
    return <p className="text-sm text-muted-foreground">No conditions</p>;
  }

  return (
    <div className="space-y-2">
      {conditions.map((condition, index) => (
        <div key={index} className="flex items-start gap-2 p-3 border rounded-lg">
          <StatusIcon
            Icon={condition.status === "True" ? CheckIcon : condition.status === "False" ? XIcon : HelpIcon}
            color={condition.status === "True" ? "success" : condition.status === "False" ? "error" : "default"}
          />
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{condition.type}</span>
              <span className="text-xs text-muted-foreground">
                {formatDate(condition.lastTransitionTime)}
              </span>
            </div>
            {condition.message && (
              <p className="text-sm text-muted-foreground mt-1">{condition.message}</p>
            )}
            {condition.reason && (
              <p className="text-xs text-muted-foreground mt-1">Reason: {condition.reason}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

## Empty State Pattern

Show helpful message when no resources exist:

```typescript
import { EmptyList } from "@/core/components/EmptyList";

function CodebaseList() {
  const { data: codebases } = useWatchList({ config: k8sCodebaseConfig });

  if (codebases.length === 0) {
    return (
      <EmptyList
        missingItemName="codebases"
        linkText="Create your first codebase"
        handleClick={() => setDialog(CREATE_CODEBASE_DIALOG)}
      />
    );
  }

  return <Table data={codebases} columns={columns} />;
}
```

## Loading and Error States

Handle loading and error states consistently:

```typescript
function CodebaseList() {
  const { data, error, isLoading, isFetched } = useWatchList({
    config: k8sCodebaseConfig,
  });

  if (!isFetched || isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Failed to load codebases</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return <Table data={data} columns={columns} />;
}
```

## Related Resources Pattern

Display child or related resources:

```typescript
import { codebaseBranchLabels } from "@my-project/shared";

function CodebaseBranches({ codebaseName }: { codebaseName: string }) {
  const { data: branches } = useWatchList({
    config: k8sCodebaseBranchConfig,
    namespace: 'default',
    labelSelector: {
      [codebaseBranchLabels.codebase]: codebaseName, // ✅ Using constant
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Branches</CardTitle>
      </CardHeader>
      <CardContent>
        {branches.length === 0 ? (
          <p className="text-sm text-muted-foreground">No branches</p>
        ) : (
          <Table data={branches} columns={branchColumns} />
        )}
      </CardContent>
    </Card>
  );
}
```

## Best Practices

1. **Consistent Status Icons** - Use standard colors and spinning animations
2. **Loading States** - Always show loading indicators during data fetching
3. **Error Handling** - Display user-friendly error messages
4. **Empty States** - Provide helpful guidance when no resources exist
5. **Permission Integration** - Hide/disable actions based on permissions
6. **Label Constants** - Use label constants for label selectors
7. **Typography Hierarchy** - Use consistent heading and text sizes
8. **Responsive Design** - Ensure tables and details adapt to screen size
9. **Real-Time Updates** - Use watch hooks for live data
10. **Actions Menu** - Use dropdown for multiple actions per resource

# Table Implementation Guide

Advanced patterns for implementing data tables in the KubeRocketCI portal.

## Custom Column Renderers

Create custom cell renderers for complex data:

```typescript
const columns: TableColumn<Resource>[] = [
  {
    id: 'status',
    label: 'Status',
    columnSortableValuePath: 'status.phase',
    render: (resource) => (
      <div className="flex items-center gap-2">
        <StatusIcon status={resource.status?.phase} />
        <span>{resource.status?.phase}</span>
      </div>
    ),
  },
];
```

**When to use custom renderers**:

- Status indicators with icons
- Links to detail pages
- Action buttons/menus
- Formatted dates/numbers
- Nested data display

## Bulk Operations

Enable row selection and bulk actions:

```typescript
const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

const columns: TableColumn<Resource>[] = [
  {
    id: 'select',
    label: (
      <Checkbox
        checked={selectedRows.size === data.length}
        onCheckedChange={(checked) => {
          if (checked) {
            setSelectedRows(new Set(data.map(r => r.metadata.name)));
          } else {
            setSelectedRows(new Set());
          }
        }}
      />
    ),
    render: (resource) => (
      <Checkbox
        checked={selectedRows.has(resource.metadata.name)}
        onCheckedChange={(checked) => {
          const newSelection = new Set(selectedRows);
          if (checked) {
            newSelection.add(resource.metadata.name);
          } else {
            newSelection.delete(resource.metadata.name);
          }
          setSelectedRows(newSelection);
        }}
      />
    ),
  },
  // ... other columns
];

// Bulk actions toolbar
{selectedRows.size > 0 && (
  <div className="flex gap-2 p-4 bg-blue-50">
    <span>{selectedRows.size} selected</span>
    <Button onClick={handleBulkDelete}>Delete Selected</Button>
  </div>
)}
```

## Actions Column Pattern

Common pattern for row actions:

```typescript
{
  id: 'actions',
  label: '',
  render: (resource) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleEdit(resource)}>
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleView(resource)}>
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <ButtonWithPermission
          allowed={permissions.data?.delete.allowed}
          reason={permissions.data?.delete.reason}
          ButtonProps={{
            onClick: () => handleDelete(resource),
            variant: "ghost",
            className: "text-red-600",
          }}
        >
          Delete
        </ButtonWithPermission>
      </DropdownMenuContent>
    </DropdownMenu>
  ),
}
```

## Custom Sorting Logic

Complex sorting beyond simple field comparison:

```typescript
const sortByStatus = (a: Resource, b: Resource) => {
  const statusOrder = {
    'Running': 0,
    'Succeeded': 1,
    'Failed': 2,
    'Unknown': 3,
  };

  const aOrder = statusOrder[a.status?.phase] ?? 999;
  const bOrder = statusOrder[b.status?.phase] ?? 999;

  return aOrder - bOrder;
};

const columns: TableColumn<Resource>[] = [
  {
    id: 'status',
    label: 'Status',
    columnSortableValuePath: 'status.phase',
    customSort: sortByStatus,
  },
];
```

## Nested Data Display

Show hierarchical data in table:

```typescript
{
  id: 'config',
  label: 'Configuration',
  render: (resource) => (
    <div className="space-y-1">
      <div className="font-medium">{resource.spec.type}</div>
      <div className="text-sm text-gray-500">
        {resource.spec.config?.framework}
      </div>
    </div>
  ),
}
```

## Loading States

Handle loading and streaming data:

```typescript
<Table
  isLoading={!resourceWatch.query.isFetched}
  data={resourceWatch.dataArray}
  columns={columns}
  emptyMessage={
    resourceWatch.query.isFetched && resourceWatch.dataArray.length === 0
      ? "No resources found"
      : undefined
  }
/>
```

## Column Visibility Control

Let users toggle columns:

```typescript
const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
  new Set(['name', 'status', 'created'])
);

const filteredColumns = columns.filter(col =>
  visibleColumns.has(col.id)
);

<DropdownMenu>
  <DropdownMenuTrigger>Columns</DropdownMenuTrigger>
  <DropdownMenuContent>
    {columns.map(col => (
      <DropdownMenuCheckboxItem
        key={col.id}
        checked={visibleColumns.has(col.id)}
        onCheckedChange={(checked) => {
          const newVisible = new Set(visibleColumns);
          if (checked) {
            newVisible.add(col.id);
          } else {
            newVisible.delete(col.id);
          }
          setVisibleColumns(newVisible);
        }}
      >
        {col.label}
      </DropdownMenuCheckboxItem>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

## Export Functionality

Export table data to CSV:

```typescript
const exportToCSV = () => {
  const headers = columns.map(col => col.label).join(',');
  const rows = data.map(item =>
    columns.map(col => {
      const value = col.columnSortableValuePath
        ? _.get(item, col.columnSortableValuePath)
        : '';
      return `"${value}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = 'export.csv';
  link.click();
};
```

## Virtualization for Large Datasets

For tables with 1000+ rows, consider virtualization:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: data.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 50, // Row height
  overscan: 5,
});

// Render only visible rows
{virtualizer.getVirtualItems().map(virtualRow => {
  const item = data[virtualRow.index];
  return <TableRow key={item.id} data={item} />;
})}
```

**When to use**: Tables with > 1000 rows or slow rendering

## Real-World Examples

**Check these implementations**:

- `apps/client/src/modules/platform/codebases/pages/list/components/CodebaseList/`
- `apps/client/src/modules/platform/cdpipelines/pages/list/components/CDPipelineList/`
- `apps/client/src/modules/platform/tekton/pages/list/components/PipelineRunList/`

## Performance Optimization

1. **Memoize columns**: `useMemo(() => columns, [dependencies])`
2. **Memoize table slots**: `useMemo(() => ({ header }), [])`
3. **Debounce filter updates**: Use FilterProvider's built-in debouncing
4. **Limit initial render**: Use pagination for large datasets
5. **Optimize renderers**: Keep custom renderers simple and fast

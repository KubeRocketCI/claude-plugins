---
name: Table Patterns
description: This skill should be used when the user asks to "create table", "implement data table", "add table columns", "table sorting", "table filtering", "table pagination", "data grid", or mentions table implementation, column configuration, or data presentation.
version: 0.1.0
---

Implement data tables with sorting, filtering, pagination, and column management following portal's standardized Table component patterns.

## Purpose

Guide table implementation using the portal's unified Table component for consistent data presentation across all resource views.

## Table Component Features

- **Data Display**: Structured resource presentation
- **Sorting**: Column-based with custom sort functions
- **Pagination**: Configurable page size
- **Selection**: Multi-row with bulk operations
- **Filtering**: Custom filter functions
- **Settings**: Persistent column visibility/width
- **Loading States**: Built-in loading and error handling
- **Responsive**: Adaptive layouts

## Standard Table Structure

### Core Elements

- **Status Icon**: Visual status (if applicable)
- **Name Field**: Primary identifier column
- **Resource Fields**: Domain-specific columns
- **Actions Column**: Permission-protected buttons
- **Column Management**: User-customizable settings

## Column Configuration

### Column Object

```typescript
interface TableColumn<T> {
  id: string;
  label: string | ReactElement;
  render: (row: T) => ReactNode;
  columnSortableValuePath?: string;    // For simple sorting
  customSortFn?: (a: T, b: T) => number; // For complex sorting
  cell: {
    baseWidth?: number;   // Default width %
    width?: number;       // Current width %
    show?: boolean;       // Visibility
    isFixed?: boolean;    // Prevent hiding
    colSpan?: number;
    props?: TableCellProps;
  };
}
```

### Example Columns

```typescript
const columns: TableColumn<Codebase>[] = [
  {
    id: 'status',
    label: 'Status',
    render: (row) => (
      <StatusIcon
        Icon={getStatusIcon(row.status).component}
        color={getStatusIcon(row.status).color}
      />
    ),
    columnSortableValuePath: 'status.phase',
    cell: { baseWidth: 10, isFixed: true },
  },
  {
    id: 'name',
    label: 'Name',
    render: (row) => (
      <span className="text-sm">{row.metadata.name}</span>
    ),
    columnSortableValuePath: 'metadata.name',
    cell: { baseWidth: 25, isFixed: true },
  },
  {
    id: 'gitUrl',
    label: 'Git URL',
    render: (row) => (
      <a
        href={row.spec.gitUrlPath}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline"
      >
        {row.spec.gitUrlPath}
      </a>
    ),
    columnSortableValuePath: 'spec.gitUrlPath',
    cell: { baseWidth: 30 },
  },
  {
    id: 'actions',
    label: '',
    render: (row) => (
      <CodebaseActionsMenu codebase={row} />
    ),
    cell: { baseWidth: 10, isFixed: true },
  },
];
```

## Table Implementation

### Basic Table

```typescript
import { Table } from '@/core/components/Table';

const CodebaseList = () => {
  const { data: codebases, isLoading } = useCodebaseList();
  const columns = useColumns();  // Column configuration

  return (
    <Table
      data={codebases || []}
      columns={columns}
      isLoading={isLoading}
      tableId="codebase-list"
    />
  );
};
```

### With Filtering

```typescript
const CodebaseList = () => {
  const { data: codebases, isLoading } = useCodebaseList();
  const { filter } = useFilterContext();
  const columns = useColumns();

  const filteredData = codebases?.filter(codebase => {
    if (filter.search) {
      return codebase.metadata.name.includes(filter.search);
    }
    return true;
  });

  return (
    <Table
      data={filteredData || []}
      columns={columns}
      isLoading={isLoading}
      tableId="codebase-list"
    />
  );
};
```

### With Selection

```typescript
const CodebaseList = () => {
  const [selected, setSelected] = useState<string[]>([]);

  const handleSelect = (ids: string[]) => {
    setSelected(ids);
  };

  return (
    <>
      {selected.length > 0 && (
        <BulkActions selected={selected} onAction={handleBulkAction} />
      )}
      <Table
        data={codebases || []}
        columns={columns}
        onSelect={handleSelect}
        selected={selected}
        tableId="codebase-list"
      />
    </>
  );
};
```

## Sorting Patterns

### Simple Sorting

Use `columnSortableValuePath` for direct property access:

```typescript
{
  id: 'name',
  columnSortableValuePath: 'metadata.name',  // Dot notation
  // ...
}
```

### Custom Sorting

Use `customSortFn` for complex logic:

```typescript
{
  id: 'status',
  customSortFn: (a, b) => {
    const statusOrder = ['Running', 'Pending', 'Failed'];
    return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
  },
  // ...
}
```

## Column Management

### Persistent Settings

```typescript
import { useTableSettings } from '@/core/hooks/useTableSettings';

const { loadSettings, saveSettings } = useTableSettings('codebase-list');

// Load on mount
const settings = loadSettings();

// Apply to columns
const columnsWithSettings = columns.map(col => ({
  ...col,
  cell: {
    ...col.cell,
    width: settings[col.id]?.width || col.cell.baseWidth,
    show: settings[col.id]?.show ?? true,
  },
}));
```

## Actions Column

### Permission-Protected Actions

```typescript
const ActionsMenu = ({ resource }: { resource: Resource }) => {
  const permissions = useResourcePermissions(resource);

  return (
    <Menu>
      <ButtonWithPermission
        allowed={permissions.data?.update.allowed}
        reason={permissions.data?.update.reason}
        ButtonProps={{ onClick: () => handleEdit(resource) }}
      >
        Edit
      </ButtonWithPermission>
      <ButtonWithPermission
        allowed={permissions.data?.delete.allowed}
        reason={permissions.data?.delete.reason}
        ButtonProps={{ onClick: () => handleDelete(resource), color: 'error' }}
      >
        Delete
      </ButtonWithPermission>
    </Menu>
  );
};
```

## Empty States

```typescript
<Table
  data={filteredData || []}
  columns={columns}
  emptyState={
    <EmptyList
      missingItemName="codebases"
      linkText="Create your first codebase"
      handleClick={() => setDialog(CREATE_CODEBASE_DIALOG)}
      isSearch={!!filter.search}
    />
  }
/>
```

## Best Practices

1. **Consistent Columns**: Use standard column structure
2. **Fixed Columns**: Mark critical columns as isFixed
3. **Responsive Widths**: Use baseWidth percentages
4. **Loading States**: Always handle loading/error states
5. **Empty States**: Provide helpful empty state messaging
6. **Permission Integration**: Protect actions with ButtonWithPermission
7. **Persistent Settings**: Use tableId for settings storage
8. **Accessibility**: Proper ARIA labels on interactive elements

## Additional Resources

See **`references/table-implementation-guide.md`** for advanced table patterns including custom filters, bulk operations, and complex column configurations.

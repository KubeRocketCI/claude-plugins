---
name: Table Patterns
description: This skill should be used when the user asks to "create table", "implement data table", "add table columns", "table sorting", "table filtering", "table pagination", "data grid", or mentions table implementation, column configuration, or data presentation.
version: 0.1.0
---

Implement data tables with sorting, filtering, pagination, and column management following portal's standardized Table component patterns.

## Purpose

Guide table implementation using the portal's unified Table component for consistent data presentation across all resource views.

## Table Components

Portal provides two table components:

- **Table** - Standard table for most use cases
- **DataGrid** - Advanced table with virtualization for large datasets

Both share the same column configuration API and patterns.

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

- **Status Icon**: Visual status indicator (if applicable)
- **Name Field**: Primary identifier column with link
- **Resource Fields**: Domain-specific data columns
- **Actions Column**: Permission-protected action buttons
- **Column Management**: User-customizable settings

### Column Order

1. Status (if applicable)
2. Name/Primary identifier
3. Resource-specific fields
4. Timestamps (created, updated)
5. Actions (always last)

## Basic Table Implementation

### 1. Define Columns with useColumns Hook

**IMPORTANT**: Always use `useColumns` hook pattern:

```typescript
import { useColumns } from "./hooks/useColumns";

function CodebaseList() {
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

### 2. Create useColumns Hook

```typescript
// hooks/useColumns.tsx
import React from "react";
import { TableColumn } from "@/core/components/Table/types";
import { useTableSettings } from "@/core/components/Table/components/TableSettings/hooks/useTableSettings";
import { getSyncedColumnData } from "@/core/components/Table/components/TableSettings/utils";
import { TABLE } from "@/k8s/constants/tables";

export const useColumns = (): TableColumn<Codebase>[] => {
  const { loadSettings } = useTableSettings(TABLE.CODEBASE_LIST.id);
  const tableSettings = loadSettings();

  return React.useMemo(
    () => [
      {
        id: "status",
        label: "Status",
        data: {
          columnSortableValuePath: "status.phase",
          render: ({ data }) => <StatusIcon {...getStatusIcon(data.status)} />,
        },
        cell: {
          isFixed: true,
          baseWidth: 10,
          ...getSyncedColumnData(tableSettings, "status"),
        },
      },
      {
        id: "name",
        label: "Name",
        data: {
          columnSortableValuePath: "metadata.name",
          render: ({ data }) => <span>{data.metadata.name}</span>,
        },
        cell: {
          baseWidth: 25,
          ...getSyncedColumnData(tableSettings, "name"),
        },
      },
      // More columns...
    ],
    [tableSettings]
  );
};
```

See **`references/column-patterns.md`** for complete column configuration patterns and examples.

## Column Configuration

### TableColumn Type

```typescript
interface TableColumn<T> {
  id: string;
  label: string | ReactElement;
  data: {
    render: ({ data }: { data: T }) => ReactNode;
    columnSortableValuePath?: string;    // For simple sorting
    customSortFn?: (a: T, b: T) => number; // For complex sorting
  };
  cell: {
    baseWidth?: number;   // Default width %
    isFixed?: boolean;    // Prevent hiding
    ...getSyncedColumnData(tableSettings, columnId);
  };
}
```

### Essential Column Properties

**id**: Unique column identifier
**label**: Column header text or element
**data.render**: Cell rendering function
**data.columnSortableValuePath**: Path to sortable value (e.g., `"metadata.name"`)
**cell.baseWidth**: Default column width as percentage
**cell.isFixed**: Prevent user from hiding column
**getSyncedColumnData**: Sync with user's table settings

## Sorting

### Simple Sorting

Use `columnSortableValuePath` for direct property access:

```typescript
{
  id: "name",
  label: "Name",
  data: {
    columnSortableValuePath: "metadata.name",  // Sorts by this path
    render: ({ data }) => data.metadata.name,
  },
}
```

### Custom Sorting

Use `customSortFn` for complex logic:

```typescript
{
  id: "status",
  label: "Status",
  data: {
    customSortFn: (a, b) => {
      const order = { Running: 1, Pending: 2, Failed: 3 };
      return (order[a.status?.phase] || 999) - (order[b.status?.phase] || 999);
    },
    render: ({ data }) => <StatusIcon {...getStatusIcon(data.status)} />,
  },
}
```

## Filtering

### Table-Level Filtering

Use with FilterProvider pattern:

```typescript
import { FilterProvider } from "@/core/providers/Filter";

function CodebasesPage() {
  return (
    <FilterProvider defaultValues={filterDefaults} matchFunctions={matchFns}>
      <CodebaseList />
    </FilterProvider>
  );
}

function CodebaseList() {
  const { filterFunction } = useCodebaseFilter();

  return (
    <Table
      id="codebase-list"
      data={codebases}
      columns={columns}
      filterFunction={filterFunction}  // Apply filtering
    />
  );
}
```

See **filter-patterns** skill for complete filtering implementation.

## Table with DataGrid

For large datasets with virtualization:

```typescript
import { DataGrid } from "@/core/components/DataGrid";

function LargeResourceList() {
  const columns = useColumns();

  return (
    <DataGrid
      id="resource-list"
      data={resources}
      columns={columns}
      rowHeight={48}  // Fixed row height for virtualization
    />
  );
}
```

## Table Slots

Customize table sections with slots:

```typescript
const tableSlots = React.useMemo(
  () => ({
    header: <EntityFilter />,  // Above table
    footer: <CustomPagination />,  // Below table
  }),
  []
);

<Table
  data={data}
  columns={columns}
  slots={tableSlots}
/>
```

## Loading and Empty States

Tables handle these automatically:

```typescript
function CodebaseList() {
  const { data, isLoading, error } = useWatchList({ config: k8sCodebaseConfig });

  // Table shows loading spinner when isLoading=true
  // Table shows error message when error exists
  // Table shows empty state when data.length=0

  return <Table data={data || []} columns={columns} isLoading={isLoading} />;
}
```

## useColumns Hook Benefits

1. **Table Settings Integration** - Syncs column visibility/width with user preferences
2. **Memoization** - Prevents unnecessary re-renders
3. **Code Organization** - Separates column logic from component
4. **Reusability** - Can be shared across multiple components
5. **Standard Pattern** - Consistent with portal conventions

## File Structure

```
components/EntityList/
├── hooks/
│   └── useColumns.tsx    # Column definitions
├── components/
│   └── EntityActions.tsx # Action menu components
└── index.tsx             # Main list component
```

## Best Practices

1. **useColumns Hook** - Always define columns in a hook
2. **Memoize Columns** - Wrap in `React.useMemo` with proper dependencies
3. **Table Settings** - Use `getSyncedColumnData` for user preferences
4. **Fixed Columns** - Mark status, name, and actions as `isFixed`
5. **Appropriate Widths** - Set `baseWidth` based on content type
6. **Status First** - Always show status as first column (when applicable)
7. **Actions Last** - Place actions column at the end
8. **Simple Sorting** - Use `columnSortableValuePath` when possible
9. **Filter Integration** - Use FilterProvider for complex filtering
10. **DataGrid for Large Data** - Use DataGrid component for 1000+ rows

## Additional Resources

- **`references/column-patterns.md`** - Complete guide to column configuration, sorting, and useColumns hook patterns
- **`references/table-implementation-guide.md`** - Advanced patterns including bulk operations, custom renderers, and pagination

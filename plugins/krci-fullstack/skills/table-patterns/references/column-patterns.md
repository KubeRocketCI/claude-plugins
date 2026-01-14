# Table Column Patterns

Detailed guide for defining table columns using the useColumns hook pattern and TableColumn configuration.

## useColumns Hook Pattern

**IMPORTANT**: Always define columns using a `useColumns` hook that returns `TableColumn<T>[]`. This pattern integrates with table settings persistence and follows the portal's standard approach.

### Basic useColumns Implementation

```typescript
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
          render: ({ data }) => (
            <StatusIcon
              Icon={getStatusIcon(data.status).component}
              color={getStatusIcon(data.status).color}
            />
          ),
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
          render: ({ data }) => (
            <span className="text-sm">{data.metadata.name}</span>
          ),
        },
        cell: {
          baseWidth: 25,
          ...getSyncedColumnData(tableSettings, "name"),
        },
      },
      // ... more columns
    ],
    [tableSettings]
  );
};
```

### Hook File Structure

Place useColumns hook in dedicated hooks directory:

```
components/EntityList/
├── hooks/
│   └── useColumns.tsx    # Column definitions
├── components/
│   └── EntityActions.tsx # Action components
└── index.tsx             # Main list component
```

### Why Use useColumns Hook?

1. **Table Settings Integration** - Syncs with user's column visibility/width preferences
2. **Memoization** - Prevents unnecessary re-renders
3. **Code Organization** - Separates column logic from component
4. **Reusability** - Can be shared across components
5. **Standard Pattern** - Consistent with portal conventions

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
    width?: number;       // Current width %
    show?: boolean;       // Visibility
    isFixed?: boolean;    // Prevent hiding
    colSpan?: number;
    props?: TableCellProps;
  };
}
```

## Column Types and Patterns

### Status Column

Always include status column for resources:

```typescript
{
  id: "status",
  label: "Status",
  data: {
    columnSortableValuePath: "status.phase",
    render: ({ data }) => {
      const statusIcon = getStatusIcon(data.status);
      return (
        <StatusIcon
          Icon={statusIcon.component}
          color={statusIcon.color}
          isSpinning={statusIcon.isSpinning}
        />
      );
    },
  },
  cell: {
    isFixed: true,  // Cannot be hidden by user
    baseWidth: 10,
    ...getSyncedColumnData(tableSettings, "status"),
  },
}
```

### Name Column with Link

Primary identifier column with navigation:

```typescript
{
  id: "name",
  label: "Name",
  data: {
    columnSortableValuePath: "metadata.name",
    render: ({ data }) => (
      <Link
        to={`/codebases/${data.metadata.name}`}
        className="text-sm hover:underline"
      >
        {data.metadata.name}
      </Link>
    ),
  },
  cell: {
    baseWidth: 25,
    ...getSyncedColumnData(tableSettings, "name"),
  },
}
```

### Resource Field Column

Display resource specifications:

```typescript
{
  id: "type",
  label: "Type",
  data: {
    columnSortableValuePath: "spec.type",
    render: ({ data }) => (
      <Badge variant="secondary">{data.spec.type}</Badge>
    ),
  },
  cell: {
    baseWidth: 15,
    ...getSyncedColumnData(tableSettings, "type"),
  },
}
```

### Timestamp Column

Format dates consistently:

```typescript
{
  id: "created",
  label: "Created",
  data: {
    columnSortableValuePath: "metadata.creationTimestamp",
    render: ({ data }) => (
      <span className="text-sm text-muted-foreground">
        {formatDate(data.metadata.creationTimestamp)}
      </span>
    ),
  },
  cell: {
    baseWidth: 15,
    ...getSyncedColumnData(tableSettings, "created"),
  },
}
```

### Link Column with External URL

```typescript
{
  id: "gitUrl",
  label: "Git URL",
  data: {
    render: ({ data }) => (
      <a
        href={data.spec.gitUrlPath}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-primary hover:underline flex items-center gap-1"
      >
        <span className="truncate max-w-xs">{data.spec.gitUrlPath}</span>
        <ExternalLinkIcon className="h-3 w-3 flex-shrink-0" />
      </a>
    ),
  },
  cell: {
    baseWidth: 30,
    ...getSyncedColumnData(tableSettings, "gitUrl"),
  },
}
```

### Badge/Tag Column

Display labels or categories:

```typescript
{
  id: "labels",
  label: "Labels",
  data: {
    render: ({ data }) => {
      const labels = Object.entries(data.metadata.labels || {});
      return (
        <div className="flex flex-wrap gap-1">
          {labels.slice(0, 3).map(([key, value]) => (
            <Badge key={key} variant="outline" className="text-xs">
              {key}: {value}
            </Badge>
          ))}
          {labels.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{labels.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  cell: {
    baseWidth: 20,
    ...getSyncedColumnData(tableSettings, "labels"),
  },
}
```

### Actions Column

Permission-protected actions menu:

```typescript
{
  id: "actions",
  label: "",
  data: {
    render: ({ data }) => <CodebaseActionsMenu codebase={data} />,
  },
  cell: {
    isFixed: true,  // Always visible
    baseWidth: 10,
    ...getSyncedColumnData(tableSettings, "actions"),
  },
}
```

### Complex Cell Rendering

Multiple elements in a single cell:

```typescript
{
  id: "pipeline",
  label: "Pipeline Status",
  data: {
    render: ({ data }) => (
      <div className="flex items-center gap-2">
        <StatusIcon status={data.pipeline.status} />
        <div className="flex flex-col">
          <span className="text-sm font-medium">{data.pipeline.name}</span>
          <span className="text-xs text-muted-foreground">
            Run #{data.pipeline.runNumber}
          </span>
        </div>
      </div>
    ),
  },
  cell: {
    baseWidth: 20,
    ...getSyncedColumnData(tableSettings, "pipeline"),
  },
}
```

## Column Sorting

### Simple Sorting (columnSortableValuePath)

For direct property sorting:

```typescript
{
  id: "name",
  label: "Name",
  data: {
    columnSortableValuePath: "metadata.name",  // Direct path to value
    render: ({ data }) => data.metadata.name,
  },
  cell: {
    baseWidth: 25,
  },
}
```

**Supports:**
- Nested paths: `"status.phase"`
- Deep nesting: `"spec.container.image"`
- Array access: `"spec.ports[0].number"`

### Custom Sorting (customSortFn)

For complex sorting logic:

```typescript
{
  id: "status",
  label: "Status",
  data: {
    customSortFn: (a, b) => {
      const statusOrder = { Running: 1, Pending: 2, Failed: 3 };
      const aStatus = statusOrder[a.status?.phase] || 999;
      const bStatus = statusOrder[b.status?.phase] || 999;
      return aStatus - bStatus;
    },
    render: ({ data }) => <StatusIcon status={data.status} />,
  },
  cell: {
    baseWidth: 10,
  },
}
```

**Use cases:**
- Custom sort order (e.g., status priority)
- Computed values
- Multi-field sorting
- Case-insensitive string sorting

## Column Width Management

### Base Width

Default column width as percentage:

```typescript
cell: {
  baseWidth: 25,  // 25% of table width
}
```

**Recommended widths:**
- Status icons: 10%
- Actions: 10%
- Names: 20-30%
- Descriptions: 30-40%
- Timestamps: 15-20%

### Fixed Columns

Prevent users from hiding columns:

```typescript
cell: {
  isFixed: true,  // Cannot be hidden
  baseWidth: 10,
}
```

**Fixed columns:**
- Status (always show health)
- Name (primary identifier)
- Actions (always accessible)

### Table Settings Integration

Sync with user preferences:

```typescript
cell: {
  baseWidth: 20,
  ...getSyncedColumnData(tableSettings, "columnId"),
}
```

This syncs:
- Column visibility (`show`)
- Column width (`width`)

## Column Labels

### Simple String Label

```typescript
{
  label: "Name",
}
```

### ReactElement Label

For icons or complex labels:

```typescript
{
  label: (
    <div className="flex items-center gap-2">
      <GitBranchIcon className="h-4 w-4" />
      <span>Branch</span>
    </div>
  ),
}
```

### Sortable Column Label

Table component automatically adds sort indicators to sortable columns.

## Best Practices

1. **Use useColumns Hook** - Always define columns in a hook
2. **Memoize Columns** - Wrap in `React.useMemo` with proper dependencies
3. **Sync Settings** - Use `getSyncedColumnData` for user preferences
4. **Fixed Columns** - Mark essential columns as `isFixed`
5. **Appropriate Widths** - Set `baseWidth` based on content
6. **Consistent Styling** - Use portal's styling conventions
7. **Simple Sorting** - Use `columnSortableValuePath` when possible
8. **Status First** - Always show status as first column (when applicable)
9. **Actions Last** - Place actions column at the end
10. **Accessible Labels** - Provide clear, descriptive column labels

## Table Constants

Define table IDs in constants file:

```typescript
// apps/client/src/k8s/constants/tables.ts
export const TABLE = {
  CODEBASE_LIST: {
    id: 'codebase-list',
    name: 'Codebase List',
  },
  PIPELINE_LIST: {
    id: 'pipeline-list',
    name: 'Pipeline List',
  },
} as const;
```

Use in useColumns hook:

```typescript
const { loadSettings } = useTableSettings(TABLE.CODEBASE_LIST.id);
```

## Complete Example

```typescript
import React from "react";
import { TableColumn } from "@/core/components/Table/types";
import { useTableSettings } from "@/core/components/Table/components/TableSettings/hooks/useTableSettings";
import { getSyncedColumnData } from "@/core/components/Table/components/TableSettings/utils";
import { TABLE } from "@/k8s/constants/tables";
import { StatusIcon } from "@/core/components/StatusIcon";
import { CodebaseActionsMenu } from "../CodebaseActionsMenu";
import { getStatusIcon } from "./utils";

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
          render: ({ data }) => {
            const statusIcon = getStatusIcon(data.status);
            return (
              <StatusIcon
                Icon={statusIcon.component}
                color={statusIcon.color}
                isSpinning={statusIcon.isSpinning}
              />
            );
          },
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
          render: ({ data }) => (
            <Link to={`/codebases/${data.metadata.name}`}>
              {data.metadata.name}
            </Link>
          ),
        },
        cell: {
          baseWidth: 25,
          ...getSyncedColumnData(tableSettings, "name"),
        },
      },
      {
        id: "type",
        label: "Type",
        data: {
          columnSortableValuePath: "spec.type",
          render: ({ data }) => (
            <Badge variant="secondary">{data.spec.type}</Badge>
          ),
        },
        cell: {
          baseWidth: 15,
          ...getSyncedColumnData(tableSettings, "type"),
        },
      },
      {
        id: "gitUrl",
        label: "Git URL",
        data: {
          render: ({ data }) => (
            <a href={data.spec.gitUrlPath} target="_blank" rel="noopener noreferrer">
              {data.spec.gitUrlPath}
            </a>
          ),
        },
        cell: {
          baseWidth: 30,
          ...getSyncedColumnData(tableSettings, "gitUrl"),
        },
      },
      {
        id: "created",
        label: "Created",
        data: {
          columnSortableValuePath: "metadata.creationTimestamp",
          render: ({ data }) => formatDate(data.metadata.creationTimestamp),
        },
        cell: {
          baseWidth: 15,
          ...getSyncedColumnData(tableSettings, "created"),
        },
      },
      {
        id: "actions",
        label: "",
        data: {
          render: ({ data }) => <CodebaseActionsMenu codebase={data} />,
        },
        cell: {
          isFixed: true,
          baseWidth: 10,
          ...getSyncedColumnData(tableSettings, "actions"),
        },
      },
    ],
    [tableSettings]
  );
};
```

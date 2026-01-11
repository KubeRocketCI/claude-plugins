# Filter Implementation Guide

Complete step-by-step guide for implementing filters in the KubeRocketCI portal.

## Overview

Filters use the FilterProvider pattern with TanStack Form for state management. Each filter follows a consistent structure with separate files for constants, types, hooks, and UI components.

## Step-by-Step Implementation

### Step 1: Create Filter Directory Structure

```bash
mkdir -p components/EntityFilter/hooks
touch components/EntityFilter/constants.ts
touch components/EntityFilter/types.ts
touch components/EntityFilter/hooks/useFilter.tsx
touch components/EntityFilter/index.tsx
```

### Step 2: Define Constants

Create `constants.ts` with filter field names, default values, and match functions:

```typescript
import { MatchFunctions, createSearchMatchFunction } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "./types";

// Define filter field names as constants
export const ENTITY_FILTER_NAMES = {
  SEARCH: "search",
  STATUS: "status",
  TYPE: "type",
} as const;

// Define default values for all filter fields
export const entityFilterDefaultValues: EntityFilterValues = {
  [ENTITY_FILTER_NAMES.SEARCH]: "",
  [ENTITY_FILTER_NAMES.STATUS]: "all",
  [ENTITY_FILTER_NAMES.TYPE]: "all",
};

// Define match functions for filtering logic
export const matchFunctions: MatchFunctions<EntityType, EntityFilterValues> = {
  // Use built-in search function
  [ENTITY_FILTER_NAMES.SEARCH]: createSearchMatchFunction<EntityType>(),

  // Custom exact match for status
  [ENTITY_FILTER_NAMES.STATUS]: (item, value) => {
    if (value === "all") return true;
    return item.status?.phase === value;
  },

  // Custom exact match for type
  [ENTITY_FILTER_NAMES.TYPE]: (item, value) => {
    if (value === "all") return true;
    return item.spec.type === value;
  },
};
```

### Step 3: Define Types

Create `types.ts` with TypeScript type definitions:

```typescript
import { ENTITY_FILTER_NAMES } from "./constants";

export type EntityFilterValues = {
  [ENTITY_FILTER_NAMES.SEARCH]: string;
  [ENTITY_FILTER_NAMES.STATUS]: string;
  [ENTITY_FILTER_NAMES.TYPE]: string;
};
```

### Step 4: Create Custom Hook

Create `hooks/useFilter.tsx` with typed wrapper:

```typescript
import { useFilterContext } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "../types";

export const useEntityFilter = () =>
  useFilterContext<EntityType, EntityFilterValues>();
```

### Step 5: Build Filter UI Component

Create `index.tsx` with filter form fields:

```typescript
import React from "react";
import { TextField, Select, SelectOption } from "@/core/components/form";
import { Button } from "@/core/components/ui/button";
import { ENTITY_FILTER_NAMES } from "./constants";
import { useEntityFilter } from "./hooks/useFilter";

const statusOptions: SelectOption[] = [
  { label: "All Statuses", value: "all" },
  { label: "Running", value: "Running" },
  { label: "Failed", value: "Failed" },
  { label: "Succeeded", value: "Succeeded" },
];

const typeOptions: SelectOption[] = [
  { label: "All Types", value: "all" },
  { label: "Type A", value: "typeA" },
  { label: "Type B", value: "typeB" },
];

export const EntityFilter = () => {
  const { form, reset } = useEntityFilter();

  return (
    <div className="flex items-start gap-4">
      {/* Search Field */}
      <div className="w-64">
        <form.Field name={ENTITY_FILTER_NAMES.SEARCH}>
          {(field) => (
            <TextField
              field={field}
              label="Search"
              placeholder="Search by name or label:value"
            />
          )}
        </form.Field>
      </div>

      {/* Status Select */}
      <div className="w-48">
        <form.Field name={ENTITY_FILTER_NAMES.STATUS}>
          {(field) => (
            <Select
              field={field}
              label="Status"
              options={statusOptions}
              placeholder="Select status"
            />
          )}
        </form.Field>
      </div>

      {/* Type Select */}
      <div className="w-48">
        <form.Field name={ENTITY_FILTER_NAMES.TYPE}>
          {(field) => (
            <Select
              field={field}
              label="Type"
              options={typeOptions}
              placeholder="Select type"
            />
          )}
        </form.Field>
      </div>

      {/* Clear Button - Show only when form is dirty */}
      {form.state.isDirty && (
        <div className="mt-4">
          <Button variant="outline" onClick={reset} size="sm">
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
```

### Step 6: Wrap Page with FilterProvider

Update `pages/list/page.tsx` to wrap with FilterProvider:

```typescript
import { FilterProvider } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "./components/EntityFilter/types";
import { entityFilterDefaultValues, matchFunctions } from "./components/EntityFilter/constants";
import PageView from "./view";

export default function EntityListPage() {
  return (
    <FilterProvider<EntityType, EntityFilterValues>
      defaultValues={entityFilterDefaultValues}
      matchFunctions={matchFunctions}
      syncWithUrl // Enable URL synchronization
    >
      <PageView />
    </FilterProvider>
  );
}
```

### Step 7: Update Route Configuration

Ensure route loads from `page.tsx` (not `view.tsx`):

```typescript
// pages/list/route.lazy.ts
import { createLazyRoute } from "@tanstack/react-router";
import EntityListPage from "./page";

const EntityListRoute = createLazyRoute("/entities")({
  component: EntityListPage,
});

export default EntityListRoute;
```

### Step 8: Integrate with Table

Update list component to use filter:

```typescript
import React from "react";
import { Table } from "@/core/components/Table";
import { EntityFilter } from "../EntityFilter";
import { useEntityFilter } from "../EntityFilter/hooks/useFilter";
import { useEntityWatchList } from "@/k8s/api/groups/.../Entity";

export const EntityList = () => {
  const { filterFunction } = useEntityFilter();
  const entityWatch = useEntityWatchList();

  // Memoize table slots to prevent re-renders
  const tableSlots = React.useMemo(
    () => ({
      header: <EntityFilter />,
    }),
    []
  );

  return (
    <Table
      id="entity-list"
      name="Entities"
      isLoading={!entityWatch.query.isFetched}
      data={entityWatch.dataArray}
      columns={columns}
      filterFunction={filterFunction} // Pass filter function
      slots={tableSlots} // Pass filter UI
    />
  );
};
```

## Form Components Reference

### TextField (Text Input)

```typescript
<form.Field name={FILTER_NAMES.SEARCH}>
  {(field) => (
    <TextField
      field={field}
      label="Search"
      placeholder="Type to search..."
    />
  )}
</form.Field>
```

### Select (Dropdown)

```typescript
import { Select, SelectOption } from "@/core/components/form";

const options: SelectOption[] = [
  { label: "All", value: "all" },
  { label: "Option 1", value: "option1" },
];

<form.Field name={FILTER_NAMES.TYPE}>
  {(field) => (
    <Select
      field={field}
      label="Type"
      options={options}
      placeholder="Select type"
    />
  )}
</form.Field>
```

### Autocomplete (Searchable Dropdown)

```typescript
import { Autocomplete } from "@/core/components/form";

<form.Field name={FILTER_NAMES.NAME}>
  {(field) => (
    <Autocomplete
      field={field}
      label="Name"
      options={nameOptions}
      placeholder="Select or type"
      multiple={false}
    />
  )}
</form.Field>
```

## FilterProvider API

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `defaultValues` | `Values` | Yes | Initial filter values for all fields |
| `matchFunctions` | `MatchFunctions<Item, Values>` | Yes | Filtering logic for each field |
| `syncWithUrl` | `boolean` | No | Enable URL parameter synchronization (default: false) |
| `children` | `React.ReactNode` | Yes | Components to wrap with filter context |

### Context Value (useFilterContext)

| Property | Type | Description |
|----------|------|-------------|
| `form` | `FormApi<Values>` | TanStack Form instance with all methods and state |
| `filterFunction` | `(item: Item) => boolean` | Computed filter function for data filtering |
| `reset` | `() => void` | Reset all filters to default values |

## URL Synchronization

When `syncWithUrl` is enabled:

- Filter values are synced to URL query parameters
- URL changes update filter state (browser back/forward)
- Only non-default values are included in URL
- Uses `replace: true` to avoid cluttering browser history
- Supports deep linking with filter state

Example URL with filters:

```
/entities?search=my-app&status=Running&type=typeA
```

## Performance Considerations

**Debouncing**: Filter updates are debounced by 300ms to reduce re-filtering during user input.

**Memoization**: Always wrap table slots in `React.useMemo` to prevent unnecessary re-renders:

```typescript
const tableSlots = React.useMemo(
  () => ({
    header: <EntityFilter />,
  }),
  [] // Empty dependencies since EntityFilter doesn't need props
);
```

**Match Function Optimization**:

- Return `true` early when no filtering is needed
- Keep match functions pure and fast
- Use built-in match functions for optimal performance

## Common Patterns

### Search-Only Filter

Simplest filter with just search field:

```typescript
export const ENTITY_FILTER_NAMES = {
  SEARCH: "search",
} as const;

export const entityFilterDefaultValues: EntityFilterValues = {
  [ENTITY_FILTER_NAMES.SEARCH]: "",
};

export const matchFunctions: MatchFunctions<EntityType, EntityFilterValues> = {
  [ENTITY_FILTER_NAMES.SEARCH]: createSearchMatchFunction<EntityType>(),
};
```

### Multi-Field Filter

Complex filter with multiple fields:

```typescript
export const ENTITY_FILTER_NAMES = {
  SEARCH: "search",
  STATUS: "status",
  TYPE: "type",
  NAMESPACES: "namespaces",
} as const;
```

## Troubleshooting

**Issue**: Filter not applying

- Check `filterFunction` is passed to Table component
- Verify match functions return boolean values
- Ensure FilterProvider wraps the component tree

**Issue**: URL not syncing

- Verify `syncWithUrl` prop is set to `true`
- Check route configuration loads from `page.tsx`
- Ensure FilterProvider is at page level, not view level

**Issue**: Clear button not showing

- Check `form.state.isDirty` condition
- Verify button is inside filter component

**Issue**: Performance issues

- Memoize table slots with `React.useMemo`
- Use built-in match functions instead of custom ones
- Avoid heavy computations in match functions

---
name: Filter Patterns
description: This skill should be used when the user asks to "add filter", "implement filter", "create filtering", "FilterProvider", "search filter", "filter table", "match functions", "URL sync filter", or mentions filter state, filter UI components, or data filtering patterns.
version: 0.2.0
---

Implement data filtering using the FilterProvider pattern with TanStack Form for state management, URL synchronization, and declarative match functions.

## Purpose

Guide filter implementation using the portal's FilterProvider pattern, enabling list views to support search, multi-field filtering, and URL-based filter state.

## Core Architecture

**FilterProvider Pattern**: Centralized filter state management using TanStack Form with debounced updates (300ms), URL synchronization, and type-safe match functions.

**Key Components**:

- `@/core/providers/Filter` - FilterProvider, useFilterContext hook
- Match functions - Declarative filtering logic per field
- Form integration - TanStack Form fields for filter inputs

## Standard Filter Structure

```
components/EntityFilter/
├── constants.ts      # Filter names, defaults, match functions
├── types.ts          # TypeScript filter value types
├── hooks/
│   └── useFilter.tsx # Typed useFilterContext wrapper
└── index.tsx         # Filter UI component
```

## Implementation Steps

### 1. Define Filter Constants

Create filter field names, default values, and match functions:

```typescript
// constants.ts
import { MatchFunctions, createSearchMatchFunction } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "./types";

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

### 2. Define Filter Types

```typescript
// types.ts
export type EntityFilterValues = {
  [ENTITY_FILTER_NAMES.SEARCH]: string;
};
```

### 3. Create Custom Hook

```typescript
// hooks/useFilter.tsx
import { useFilterContext } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "../types";

export const useEntityFilter = () =>
  useFilterContext<EntityType, EntityFilterValues>();
```

### 4. Build Filter UI

```typescript
// index.tsx
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { X } from "lucide-react";
import { ENTITY_FILTER_NAMES } from "./constants";
import { useEntityFilter } from "./hooks/useFilter";

export const EntityFilter = () => {
  const { form, reset } = useEntityFilter();

  return (
    <>
      <div className="col-span-3">
        <form.AppField name={ENTITY_FILTER_NAMES.SEARCH}>
          {(field) => <field.FormTextField label="Search" placeholder="Search..." />}
        </form.AppField>
      </div>

      {form.state.isDirty && (
        <div className="col-span-1 flex flex-col gap-2">
          <Label> </Label>
          <Button variant="secondary" onClick={reset} size="sm" className="mt-0.5">
            <X size={16} />
            Clear
          </Button>
        </div>
      )}
    </>
  );
};
```

### 5. Wrap Page with FilterProvider

```typescript
// pages/list/page.tsx
import { FilterProvider } from "@/core/providers/Filter";
import { EntityType } from "@my-project/shared";
import { EntityFilterValues } from "./components/EntityFilter/types";
import { entityFilterDefaultValues, matchFunctions } from "./components/EntityFilter/constants";
import PageView from "./view";

export default function EntityPage() {
  return (
    <FilterProvider<EntityType, EntityFilterValues>
      defaultValues={entityFilterDefaultValues}
      matchFunctions={matchFunctions}
      syncWithUrl
    >
      <PageView />
    </FilterProvider>
  );
}
```

### 6. Integrate with Table

```typescript
import { Table } from "@/core/components/Table";
import { EntityFilter } from "../EntityFilter";
import { useEntityFilter } from "../EntityFilter/hooks/useFilter";

export const EntityList = () => {
  const { filterFunction } = useEntityFilter();

  const tableSlots = React.useMemo(
    () => ({
      header: <EntityFilter />,
    }),
    []
  );

  return (
    <Table
      id="entity-list"
      data={entities}
      columns={columns}
      filterFunction={filterFunction}
      slots={tableSlots}
    />
  );
};
```

## Built-in Match Functions

Predefined match functions from `@/core/providers/Filter`:

**createSearchMatchFunction** - Search by name or labels, supports `label:value` syntax
**createNamespaceMatchFunction** - Filter by namespace array
**createExactMatchFunction** - Exact value match with "all" support
**createArrayIncludesMatchFunction** - Multi-select array filtering
**createLabelMatchFunction** - Specific Kubernetes label match
**createBooleanMatchFunction** - Boolean condition filtering

See **`references/match-functions.md`** for detailed usage and custom implementations.

## Key Features

**URL Synchronization**: Enable `syncWithUrl` prop to persist filter state in URL parameters for shareable links and browser navigation support.

**Debounced Updates**: 300ms debounce prevents excessive filtering during user input.

**Type Safety**: Fully typed filter values and match functions with TypeScript generics.

**Form State**: Access `form.state.isDirty` to show/hide clear button based on filter changes.

**Performance**: Memoize table slots to prevent unnecessary re-renders.

## Reference Examples

Real implementations in codebase:

- `apps/client/src/modules/platform/configuration/modules/quicklinks/components/QuickLinkFilter/`
- `apps/client/src/modules/platform/cdpipelines/pages/list/components/CDPipelineFilter/`

## Additional Resources

- **`references/implementation-guide.md`** - Step-by-step implementation details
- **`references/match-functions.md`** - Built-in and custom match function patterns
- **`examples/simple-search-filter.md`** - Basic search-only filter
- **`examples/multi-field-filter.md`** - Complex multi-field filter

## Best Practices

1. **Consistent Naming**: Use `ENTITY_FILTER_NAMES` constant pattern
2. **URL Sync**: Enable for shareable filter states on list pages
3. **Type Safety**: Define explicit filter value types
4. **Performance**: Use built-in match functions when possible
5. **UX**: Show clear button only when `form.state.isDirty` is true
6. **Memoization**: Wrap table slots in `React.useMemo`
7. **Reusability**: Extract common match functions for reuse

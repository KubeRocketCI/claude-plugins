---
name: Filter Patterns
description: This skill should be used when the user asks to "add filter", "implement filter", "create filtering", "FilterProvider", "search filter", "filter provider setup", "filter match function", "match functions", "URL sync filter", or mentions filter state, filter UI components, or data filtering patterns.
---

Guide filter implementation using the portal's FilterProvider pattern with TanStack Form for state management, URL synchronization, and declarative match functions.

## Architecture Overview

The portal uses a **FilterProvider** component that wraps a page and provides:

1. **Form state** via TanStack Form (`useAppForm`) for filter inputs
2. **A `filterFunction`** derived from form values + match functions, passed to `DataTable`
3. **URL synchronization** (optional) so filter state persists in query params
4. **A `reset` function** to clear all filters back to defaults

All filtering code lives in `apps/client/src/core/providers/Filter/`. The provider, context, hooks, types, and built-in match functions are all in that directory.

## How FilterProvider Works

FilterProvider is a generic component: `FilterProvider<Item, Values>` where:

- `Item` is the type of data being filtered (e.g., `Pipeline`, `Codebase`)
- `Values` is a record type mapping filter field names to their value types

It accepts three props:

- **`defaultValues`** - initial filter state (all fields at "show everything" values)
- **`matchFunctions`** - an object mapping each filter field name to a function `(item, value) => boolean`
- **`syncWithUrl`** (optional) - enables bidirectional URL query param synchronization

Internally, FilterProvider creates a TanStack Form with the default values, subscribes to form changes, and recomputes the `filterFunction` on every change. The `filterFunction` tests each item against ALL match functions (AND logic): an item passes only if every match function returns true.

When `syncWithUrl` is enabled, non-default filter values are written to URL search params, and on mount the provider reads URL params to restore filter state.

## Implementation Steps

### 1. Define types, constants, and match functions

Create a filter component directory with:

```text
components/EntityFilter/
  constants.ts    # Filter names, defaults, match functions
  types.ts        # Filter value type
  hooks/
    useFilter.tsx # Typed context hook
  index.tsx       # Filter UI component
```

**constants.ts** defines three things:

- `ENTITY_FILTER_NAMES` - a const object mapping semantic names to string keys
- `entityFilterDefaultValues` - the default values object (empty strings, empty arrays, `"all"`)
- `matchFunctions` - the match function map

**types.ts** defines the filter value type using the filter name constants as keys.

To see a real example of this pattern, read:
`apps/client/src/modules/platform/tekton/pages/pipeline-list/components/PipelineFilter/constants.ts` and its sibling `types.ts`.

### 2. Create a typed context hook

```text
// hooks/useFilter.tsx
import { useFilterContext } from "@/core/providers/Filter";

export const useEntityFilter = () =>
  useFilterContext<EntityType, EntityFilterValues>();
```

This thin wrapper provides type safety so consumers get typed `form` and `filterFunction`.

### 3. Build the filter UI component

The filter UI component uses the form from the typed context hook. It renders form fields (typically `form.AppField` with `field.FormTextField`, `field.FormSelectField`, etc.) and a clear button shown when `form.state.isDirty`.

Filter UI components are rendered inside the table's header slot, which uses a `grid-cols-12` layout. Each filter field should use `col-span-*` to size itself within that grid.

### 4. Wrap the page with FilterProvider

The page component (`page.tsx`) wraps the view with `FilterProvider`, passing the generic type parameters, default values, match functions, and optionally `syncWithUrl`:

```text
<FilterProvider<EntityType, EntityFilterValues>
  defaultValues={entityFilterDefaultValues}
  matchFunctions={matchFunctions}
  syncWithUrl
>
  <PageView />
</FilterProvider>
```

### 5. Connect to DataTable

In the list component, consume the filter context and pass `filterFunction` to `DataTable`, and render the filter UI in the header slot:

```text
const { filterFunction } = useEntityFilter();

<DataTable
  id="entity-list"
  data={data.array}
  columns={columns}
  filterFunction={filterFunction}
  slots={{
    header: { component: <EntityFilter /> }
  }}
/>
```

## Match Functions

Match functions are the core filtering logic. Each one receives an item and the current filter value, returning `true` if the item should be shown.

### Built-in Match Functions

The portal provides factory functions in `@/core/providers/Filter/matchFunctions.ts`:

| Factory | Purpose | Empty value behavior |
|---------|---------|---------------------|
| `createSearchMatchFunction<T>()` | Search by name or labels; supports `label:value` syntax | Returns true for empty/falsy search |
| `createNamespaceMatchFunction<T>()` | Filter by namespace from a string array | Returns true for empty array |
| `createExactMatchFunction<T, V>(getValue)` | Exact value match; treats `"all"` as no filter | Returns true for empty or `"all"` |
| `createArrayIncludesMatchFunction<T>(getValue)` | Multi-select: checks if item value is in the selected array | Returns true for empty array |
| `createLabelMatchFunction<T>(labelKey)` | Match a specific K8s label value; treats `"all"` as no filter | Returns true for empty or `"all"` |
| `createBooleanMatchFunction<T>(getValue)` | Show items where a boolean condition is true | Returns true when filter is false |

To see the exact implementation of each, read `apps/client/src/core/providers/Filter/matchFunctions.ts`.

### Custom Match Functions

When built-in factories do not fit, write a custom match function inline in the `matchFunctions` object:

```text
matchFunctions: {
  search: createSearchMatchFunction<Pipeline>(),
  pipelineType: (item, value) => {
    if (value === "all") return true;
    return item.metadata?.labels?.[pipelineLabels.pipelineType] === value;
  },
}
```

A match function must always return `true` when the filter value represents "no filter" (empty string, empty array, `"all"`). This prevents items from being hidden when no filter is active.

## URL Synchronization Details

When `syncWithUrl` is enabled:

- On mount, the provider reads URL search params and merges them with defaults
- On form change, non-default values are written to URL params (`replace: true`)
- On reset, filter-related URL params are removed while preserving unrelated params (e.g., `tab`)
- Array values appear as URL arrays; empty/default values are omitted from URL

This means filter state survives page refreshes and can be shared via URL.

## Discovery Instructions

| To learn about... | Read this file |
|-------------------|----------------|
| FilterProvider implementation | `apps/client/src/core/providers/Filter/provider.tsx` |
| Types (FilterValueMap, MatchFunction, etc.) | `apps/client/src/core/providers/Filter/types.ts` |
| Built-in match function factories | `apps/client/src/core/providers/Filter/matchFunctions.ts` |
| useFilterContext hook | `apps/client/src/core/providers/Filter/hooks.ts` |
| Real filter: Pipeline list | `apps/client/src/modules/platform/tekton/pages/pipeline-list/components/PipelineFilter/` |
| All filter implementations | Search for `FilterProvider` across `apps/client/src/modules/` |

## Key Conventions

- Always define filter names as a `const` object (e.g., `ENTITY_FILTER_NAMES`)
- Default values must make all match functions return `true` (show everything)
- Use built-in factory functions from `matchFunctions.ts` when possible
- Enable `syncWithUrl` on all top-level list pages for shareable filter state
- Memoize table slots (`useMemo`) to avoid unnecessary re-renders
- Show the clear button only when `form.state.isDirty` is true
- Filter UI components render inside the table header slot's `grid-cols-12` layout
- Create a typed `useEntityFilter` hook wrapper for each filter rather than using `useFilterContext` directly

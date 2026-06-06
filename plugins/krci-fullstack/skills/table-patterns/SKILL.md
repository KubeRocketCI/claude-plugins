---
name: Table Patterns
description: This skill should be used whenever the user is building or modifying a data table or list view in the KubeRocketCI portal — phrasings like "create a table", "implement a data table", "DataTable", "add or define table columns", "useColumns", "table sorting", "custom sort comparator", "table pagination", "row selection", "expandable rows", "column visibility settings", or column configuration and tabular data presentation. Use it even if the user only says "list view" or "grid". For the filter UI, FilterProvider, search, and match functions that sit above the table defer to filter-patterns; for the watch hook that supplies the table data (useWatchList) defer to k8s-resources; for a generic non-table presentational component defer to component-development.
---

Guide table implementation using the portal's `DataTable` component and `useColumns` hook convention for consistent data presentation across resource views.

## Architecture Overview

The portal has one primary table component: **`DataTable`**, exported from `@/core/components/Table`. There is no separate `Table` vs `DataGrid` distinction; `DataTable` is the standard component for all tabular data.

The core architectural pattern is:

1. **`DataTable`** - generic component that handles rendering, sorting, pagination, selection, slots
2. **`useColumns` hook** - per-page hook that defines column configuration
3. **`FilterProvider`** - optional wrapper that provides `filterFunction` to `DataTable` (see filter-patterns skill)
4. **Table Settings** - persistent user preferences for column visibility/width via localStorage

## DataTable Component

### Key Props

To see the full props interface, read `apps/client/src/core/components/Table/types.ts` (the `TableProps` interface).

The essential props are:

- **`id`** (string) - unique table identifier, used for settings persistence
- **`data`** (array) - the data array to display
- **`columns`** (TableColumn array) - column definitions from `useColumns`
- **`isLoading`** (boolean) - shows skeleton rows when true
- **`filterFunction`** (function) - client-side filter from FilterProvider
- **`sort`** (object) - initial sort configuration (`{ order, sortBy }`)
- **`pagination`** (object) - pagination settings (`{ show, rowsPerPage, initialPage, reflectInURL }`)
- **`selection`** (object) - row selection callbacks and state
- **`slots`** (object) - header and footer slot injection
- **`emptyListComponent`** - custom empty state
- **`blockerError`** / **`blockerComponent`** - error/blocker display
- **`expandable`** - row expansion configuration
- **`settings`** - column visibility settings toggle (`{ show: true }`)

### Slots API

Slots allow injecting components into the table layout. The `slots` prop has this shape:

```text
slots: {
  header?: {
    component: ReactElement,      // The filter/toolbar UI
    slotProps?: { className?, data-tour?, ... }  // HTML attrs for the wrapper div
  },
  footer?: {
    component: ReactElement,
    slotProps?: { ... }
  }
}
```

The header slot renders above the table in a CSS grid (`grid-cols-[1fr_auto]`). The slot component itself is wrapped in a `grid-cols-12` container, so filter fields should use `col-span-*` classes to lay out within that grid.

Note: the `header` slot's `slotProps` are applied to its wrapper div, but the `footer` slot's `slotProps` are currently **not** spread onto a wrapper in the implementation — don't rely on `footer.slotProps` (e.g. `data-tour`) taking effect.

## useColumns Hook Convention

Every table page defines a `useColumns` hook in `hooks/useColumns.tsx` that returns a memoized array of `TableColumn<T>` objects.

### TableColumn Interface

A `TableColumn<T>` has two halves: `data` (how the cell behaves — `render`, plus `columnSortableValuePath` or `customSortFn` for sorting) and `cell` (how it lays out — `baseWidth`, `isFixed`, `show`, `colSpan`). Read `apps/client/src/core/components/Table/types.ts` for the exact, current fields, and any `useColumns.tsx` for a worked example.

**The one non-obvious gotcha**: the `render` function receives `{ data }` (the row item destructured), not `(row)` — write `render: ({ data }) => ...`. This is the most common mistake; everything else you can read straight off the type.

### useColumns Pattern

Every `useColumns` hook follows this structure:

1. Load table settings with `useTableSettings(TABLE.TABLE_ID.id)`
2. Call `loadSettings()` to get persisted column state
3. Return `useMemo(() => [...columns], [tableSettings, ...])`
4. Each column's `cell` spreads `getSyncedColumnData(tableSettings, columnId)` to merge user preferences

To see a real example, read any `hooks/useColumns.tsx` file. Good starting points:

- `apps/client/src/modules/platform/security/pages/trivy-config-audits/hooks/useColumns.tsx`
- Search for other `useColumns.tsx` files with: `find apps/client/src -name "useColumns.tsx"`

### Table Settings Integration

The `useTableSettings` hook and `getSyncedColumnData` utility enable persistent column show/hide and width preferences:

- `useTableSettings(tableId)` - loads/saves settings keyed by table ID
- `getSyncedColumnData(settings, columnId)` - returns only `{ show: boolean }` (the persisted visibility override). It does **not** return `baseWidth`, so always set each column's `baseWidth` explicitly in `cell` alongside the spread
- Table IDs are registered in `apps/client/src/k8s/constants/tables.ts`

When adding a new table, register its ID in the tables constants file.

## Sorting

**Simple sorting**: Set `columnSortableValuePath` to a dot-notation path string (e.g., `"metadata.name"`, `"report.summary.criticalCount"`). The table resolves the path and sorts alphabetically/numerically.

**Array of paths**: `columnSortableValuePath` also accepts `string[]` for fallback sorting paths.

**Custom sorting**: Use `customSortFn: (a, b) => number` for complex logic like status ordering or computed values.

Only one of `columnSortableValuePath` or `customSortFn` should be set per column.

## Pagination

Pagination is built into `DataTable`. Configure with the `pagination` prop:

```text
pagination: {
  show: true,           // Show pagination controls
  rowsPerPage: 10,      // Items per page (default)
  initialPage: 0,       // Zero-indexed starting page
  reflectInURL: true    // Sync page number with URL params
}
```

The `usePagination` hook (in `core/hooks/`) manages page state internally. Pagination is applied after filtering and sorting.

## Selection

Row selection is opt-in via the `selection` prop — an object of callbacks/predicates (select-row, select-all, is-selected, is-selectable, and a render for the "N selected" bar). Read the `TableSelection<T>` interface in the types file for the exact callback names and signatures, and grep an existing table that sets `selection` for a worked example.

## Loading, Empty, and Error States

`DataTable` handles these natively:

- **Loading**: Pass `isLoading={true}` and the table renders skeleton rows
- **Empty**: Pass `emptyListComponent` for a custom empty state (typically the `EmptyList` component)
- **Error**: Pass `blockerError` for API errors or `blockerComponent` for custom error UI
- **Empty filter result**: The table shows a "no results match filters" state automatically when data exists but all items are filtered out

## File Structure Convention

```text
modules/{feature}/pages/{page-name}/
  components/
    EntityList/
      hooks/
        useColumns.tsx      # Column definitions
      index.tsx             # List component with DataTable
    EntityFilter/
      constants.ts          # Filter defaults + match functions
      types.ts              # Filter value types
      hooks/
        useFilter.tsx       # Typed useFilterContext wrapper
      index.tsx             # Filter UI (rendered in table header slot)
  page.tsx                  # Wraps with FilterProvider
  view.tsx                  # Page layout
```

## Integration with K8s Watch Hooks

The most common table data source is a watch hook (`useWatchList` / `useCodebaseWatchList`), which returns `{ data: { array, map }, ... }`. **Gotcha**: pass `data.array` (the flat array) to `DataTable`'s `data` prop — not `data` (an object) or `data.map`. See the k8s-resources skill for the watch hooks themselves.

## Discovery Instructions

| To learn about... | Read this file |
|-------------------|----------------|
| DataTable component and full props | `apps/client/src/core/components/Table/index.tsx` |
| TableProps, TableColumn, slots interface | `apps/client/src/core/components/Table/types.ts` |
| Table constants and defaults | `apps/client/src/core/components/Table/constants.ts` |
| Sort utility | `apps/client/src/core/components/Table/utils.ts` |
| Table settings hook | `apps/client/src/core/components/Table/components/TableSettings/` |
| Table ID registry | `apps/client/src/k8s/constants/tables.ts` |
| Real useColumns example | Any `hooks/useColumns.tsx` under `apps/client/src/modules/` |
| Pagination hook | `apps/client/src/core/hooks/usePagination.ts` |

## Key Conventions

- Always define columns in a `useColumns` hook, never inline in the component
- Wrap column array in `useMemo` with `[tableSettings]` in dependencies
- Mark status, name, and actions columns as `isFixed: true`
- Use `baseWidth` as a percentage; all column widths should sum to roughly 100
- Place status column first (when applicable) and actions column last
- Use `columnSortableValuePath` for simple sorting; reserve `customSortFn` for computed values
- Always spread `getSyncedColumnData(tableSettings, columnId)` into each column's `cell`
- Use the `DataTable` export name (not `Table`) when importing from `@/core/components/Table`

# DataTable Reference

Full mechanics for the portal's `DataTable` component and the `useColumns` hook convention. The SKILL.md covers orientation and the two critical gotchas; read this file for the complete API.

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

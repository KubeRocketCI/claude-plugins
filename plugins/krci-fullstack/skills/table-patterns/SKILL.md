---
name: Table Patterns
description: This skill should be used whenever the user is building or modifying a data table or list view in the KubeRocketCI portal — phrasings like "create a table", "implement a data table", "DataTable", "add or define table columns", "useColumns", "table sorting", "custom sort comparator", "table pagination", "row selection", "expandable rows", "column visibility settings", or column configuration and tabular data presentation. Use it even if the user only says "list view" or "grid". For the filter UI, FilterProvider, search, and match functions that sit above the table defer to filter-patterns; for the watch hook that supplies the table data (useWatchList) defer to k8s-resources; for a generic non-table presentational component defer to component-development.
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

Guide table implementation using the portal's `DataTable` component and `useColumns` hook convention for consistent data presentation across resource views.

## Architecture Overview

The portal has one primary table component: **`DataTable`**, exported from `@/core/components/Table`. There is no separate `Table` vs `DataGrid` distinction; `DataTable` is the standard component for all tabular data.

The core architectural pattern is:

1. **`DataTable`** - generic component that handles rendering, sorting, pagination, selection, slots
2. **`useColumns` hook** - per-page hook that defines column configuration
3. **`FilterProvider`** - optional wrapper that provides `filterFunction` to `DataTable` (see filter-patterns skill)
4. **Table Settings** - persistent user preferences for column visibility/width via localStorage

For the full API — `DataTable` props, the slots API, the `TableColumn` interface, sorting, pagination, selection, state handling, and the per-page file structure — read **`references/table-reference.md`**.

## Two gotchas that cause most bugs

1. **Column `render` receives `{ data }`, not `(row)`** — write `render: ({ data }) => ...` (the row item is destructured). This is the single most common mistake.
2. **Pass `data.array` to `DataTable`** — watch hooks (`useWatchList` / `useCodebaseWatchList`) return `{ data: { array, map }, ... }`. Pass `data.array` (the flat array), not `data` (an object) or `data.map`. See the k8s-resources skill for the watch hooks.

## useColumns Hook Convention

Every table page defines a `useColumns` hook in `hooks/useColumns.tsx` that returns a memoized array of `TableColumn<T>` objects. The hook loads persisted settings via `useTableSettings(tableId)` and spreads `getSyncedColumnData(tableSettings, columnId)` into each column's `cell`. For the `TableColumn` interface, the settings integration, and the per-page file structure, read **`references/table-reference.md`**.

To see a real example, read any `hooks/useColumns.tsx` (e.g. `apps/client/src/modules/platform/security/pages/trivy-config-audits/hooks/useColumns.tsx`).

## Discovery Instructions

| To learn about... | Read this file |
|-------------------|----------------|
| Full table mechanics (props, slots, sorting, pagination, selection, states, file structure) | `references/table-reference.md` |
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
- Register each new table's ID in `apps/client/src/k8s/constants/tables.ts`

# Simple Search Filter Example

Complete implementation of a basic search-only filter based on QuickLinkFilter from the codebase.

## Use Case

Single search field for filtering resources by name or labels. Ideal for simple list views where advanced filtering isn't needed.

## File Structure

```
components/QuickLinkFilter/
├── constants.ts
├── types.ts
├── hooks/
│   └── useFilter.tsx
└── index.tsx
```

## Implementation

### constants.ts

```typescript
import { MatchFunctions, createSearchMatchFunction } from "@/core/providers/Filter";
import { QuickLink } from "@my-project/shared";
import { QuickLinkListFilterValues } from "./types";

export const QUICKLINK_LIST_FILTER_NAMES = {
  SEARCH: "search",
} as const;

export const quickLinkFilterDefaultValues: QuickLinkListFilterValues = {
  [QUICKLINK_LIST_FILTER_NAMES.SEARCH]: "",
};

export const matchFunctions: MatchFunctions<QuickLink, QuickLinkListFilterValues> = {
  [QUICKLINK_LIST_FILTER_NAMES.SEARCH]: createSearchMatchFunction<QuickLink>(),
};
```

### types.ts

```typescript
import { QUICKLINK_LIST_FILTER_NAMES } from "./constants";

export type QuickLinkListFilterValues = {
  [QUICKLINK_LIST_FILTER_NAMES.SEARCH]: string;
};
```

### hooks/useFilter.tsx

```typescript
import { useFilterContext } from "@/core/providers/Filter";
import { QuickLink } from "@my-project/shared";
import { QuickLinkListFilterValues } from "../types";

export const useQuickLinkFilter = () =>
  useFilterContext<QuickLink, QuickLinkListFilterValues>();
```

### index.tsx

```typescript
import React from "react";
import { TextField } from "@/core/components/form";
import { Button } from "@/core/components/ui/button";
import { QUICKLINK_LIST_FILTER_NAMES } from "./constants";
import { useQuickLinkFilter } from "./hooks/useFilter";

export const QuickLinkFilter = () => {
  const { form, reset } = useQuickLinkFilter();

  return (
    <div className="flex items-start gap-4">
      <div className="w-64">
        <form.Field name={QUICKLINK_LIST_FILTER_NAMES.SEARCH}>
          {(field) => (
            <TextField
              field={field}
              label="Search"
              placeholder="Search quick links"
            />
          )}
        </form.Field>
      </div>

      {form.state.isDirty && (
        <Button variant="outline" onClick={reset} size="sm">
          Clear
        </Button>
      )}
    </div>
  );
};
```

## Page Integration

### pages/list/page.tsx

```typescript
import { FilterProvider } from "@/core/providers/Filter";
import { QuickLink } from "@my-project/shared";
import { QuickLinkListFilterValues } from "./components/QuickLinkFilter/types";
import {
  quickLinkFilterDefaultValues,
  matchFunctions,
} from "./components/QuickLinkFilter/constants";
import PageView from "./view";

export default function QuickLinksListPage() {
  return (
    <FilterProvider<QuickLink, QuickLinkListFilterValues>
      defaultValues={quickLinkFilterDefaultValues}
      matchFunctions={matchFunctions}
      syncWithUrl
    >
      <PageView />
    </FilterProvider>
  );
}
```

## List Component Integration

### components/QuickLinkList/index.tsx

```typescript
import React from "react";
import { Table } from "@/core/components/Table";
import { useQuickLinkWatchList } from "@/k8s/api/groups/.../QuickLink";
import { QuickLinkFilter } from "../QuickLinkFilter";
import { useQuickLinkFilter } from "../QuickLinkFilter/hooks/useFilter";

export const QuickLinkList = () => {
  const { filterFunction } = useQuickLinkFilter();
  const quickLinkWatch = useQuickLinkWatchList();

  const tableSlots = React.useMemo(
    () => ({
      header: <QuickLinkFilter />,
    }),
    []
  );

  return (
    <Table
      id="quicklink-list"
      name="Quick Links"
      isLoading={!quickLinkWatch.query.isFetched}
      data={quickLinkWatch.dataArray}
      columns={columns}
      filterFunction={filterFunction}
      slots={tableSlots}
    />
  );
};
```

## Search Functionality

The `createSearchMatchFunction` provides:

1. **Name Search**: Matches `metadata.name` (case-insensitive)
   - Example: `"my-link"` matches "my-link-dev", "prod-my-link"

2. **Label Key Search**: Searches all label keys
   - Example: `"env"` matches items with label `environment`, `env-type`

3. **Specific Label Search**: Use `label:value` syntax
   - Example: `"app:portal"` matches items with label `app=portal`
   - Example: `"environment:prod"` matches items with `environment=production`

## Characteristics

- **Minimal Setup**: Only 4 files needed
- **Standard Pattern**: Follows portal conventions
- **Type Safe**: Full TypeScript support
- **URL Sync**: Filter state preserved in URL
- **Performance**: Debounced input (300ms)
- **UX**: Clear button appears when filter is active

## When to Use

✅ **Use simple search filter when:**

- List has < 100 items
- Users primarily search by name
- Advanced filtering not required
- Quick implementation needed

❌ **Use multi-field filter when:**

- List has > 100 items
- Multiple filter criteria needed
- Users need to filter by status, type, etc.
- Complex filtering requirements

## Real Implementation

Source: `apps/client/src/modules/platform/configuration/modules/quicklinks/components/QuickLinkFilter/`

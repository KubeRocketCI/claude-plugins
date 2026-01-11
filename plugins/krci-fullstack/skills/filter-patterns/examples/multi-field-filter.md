# Multi-Field Filter Example

Complete implementation of a multi-field filter with search, multi-select arrays, based on CDPipelineFilter from the codebase.

## Use Case

Complex filtering with search plus multiple filter criteria (arrays, selects, etc.). Ideal for large lists requiring fine-grained filtering.

## File Structure

```
components/CDPipelineFilter/
├── constants.ts
├── types.ts
├── hooks/
│   └── useFilter.tsx
└── index.tsx
```

## Implementation

### constants.ts

```typescript
import { createSearchMatchFunction, MatchFunctions } from "@/core/providers/Filter";
import { CDPipeline } from "@my-project/shared";
import { CDPipelineFilterValues } from "./types";

export const CDPIPELINE_LIST_FILTER_NAMES = {
  SEARCH: "search",
  CODEBASES: "codebases",
  NAMESPACES: "namespaces",
} as const;

export const cdPipelineFilterDefaultValues: CDPipelineFilterValues = {
  [CDPIPELINE_LIST_FILTER_NAMES.SEARCH]: "",
  [CDPIPELINE_LIST_FILTER_NAMES.CODEBASES]: [],
  [CDPIPELINE_LIST_FILTER_NAMES.NAMESPACES]: [],
};

export const matchFunctions: MatchFunctions<CDPipeline, CDPipelineFilterValues> = {
  // Built-in search function
  [CDPIPELINE_LIST_FILTER_NAMES.SEARCH]: createSearchMatchFunction<CDPipeline>(),

  // Custom array match - filter by codebases
  [CDPIPELINE_LIST_FILTER_NAMES.CODEBASES]: (item, value) => {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    if (arrayValue.length === 0) return true;

    return Array.isArray(item.spec.applications)
      ? item.spec.applications.some((app) => arrayValue.includes(app))
      : false;
  },

  // Custom array match - filter by namespaces
  [CDPIPELINE_LIST_FILTER_NAMES.NAMESPACES]: (item, value) => {
    const arrayValue = Array.isArray(value) ? value : value ? [value] : [];
    if (arrayValue.length === 0) return true;

    return arrayValue.includes(item.metadata.namespace!);
  },
};
```

### types.ts

```typescript
import { CDPIPELINE_LIST_FILTER_NAMES } from "./constants";

export type CDPipelineFilterValues = {
  [CDPIPELINE_LIST_FILTER_NAMES.SEARCH]: string;
  [CDPIPELINE_LIST_FILTER_NAMES.CODEBASES]: string[];
  [CDPIPELINE_LIST_FILTER_NAMES.NAMESPACES]: string[];
};
```

### hooks/useFilter.tsx

```typescript
import { useFilterContext } from "@/core/providers/Filter";
import { CDPipeline } from "@my-project/shared";
import { CDPipelineFilterValues } from "../types";

export const useCDPipelineFilter = () =>
  useFilterContext<CDPipeline, CDPipelineFilterValues>();
```

### index.tsx

```typescript
import React from "react";
import { TextField, Autocomplete } from "@/core/components/form";
import { Button } from "@/core/components/ui/button";
import { CDPIPELINE_LIST_FILTER_NAMES } from "./constants";
import { useCDPipelineFilter } from "./hooks/useFilter";
import { useCodebaseWatchList } from "@/k8s/api/groups/.../Codebase";
import { useNamespaces } from "@/core/hooks/useNamespaces";

export const CDPipelineFilter = () => {
  const { form, reset } = useCDPipelineFilter();

  // Fetch options for multi-select fields
  const codebaseWatch = useCodebaseWatchList();
  const { namespaces } = useNamespaces();

  // Prepare options for autocomplete
  const codebaseOptions = React.useMemo(() => {
    return codebaseWatch.dataArray.map((codebase) => ({
      label: codebase.metadata.name,
      value: codebase.metadata.name,
    }));
  }, [codebaseWatch.dataArray]);

  const namespaceOptions = React.useMemo(() => {
    return namespaces.map((ns) => ({
      label: ns,
      value: ns,
    }));
  }, [namespaces]);

  return (
    <div className="flex items-start gap-4">
      {/* Search Field */}
      <div className="w-64">
        <form.Field name={CDPIPELINE_LIST_FILTER_NAMES.SEARCH}>
          {(field) => (
            <TextField
              field={field}
              label="Search"
              placeholder="Search CD pipelines"
            />
          )}
        </form.Field>
      </div>

      {/* Codebases Multi-Select */}
      <div className="w-64">
        <form.Field name={CDPIPELINE_LIST_FILTER_NAMES.CODEBASES}>
          {(field) => (
            <Autocomplete
              field={field}
              label="Codebases"
              options={codebaseOptions}
              placeholder="Select codebases"
              multiple={true}
            />
          )}
        </form.Field>
      </div>

      {/* Namespaces Multi-Select */}
      <div className="w-64">
        <form.Field name={CDPIPELINE_LIST_FILTER_NAMES.NAMESPACES}>
          {(field) => (
            <Autocomplete
              field={field}
              label="Namespaces"
              options={namespaceOptions}
              placeholder="Select namespaces"
              multiple={true}
            />
          )}
        </form.Field>
      </div>

      {/* Clear Button */}
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

## Page Integration

### pages/list/page.tsx

```typescript
import { FilterProvider } from "@/core/providers/Filter";
import { CDPipeline } from "@my-project/shared";
import { CDPipelineFilterValues } from "./components/CDPipelineFilter/types";
import {
  cdPipelineFilterDefaultValues,
  matchFunctions,
} from "./components/CDPipelineFilter/constants";
import PageView from "./view";

export default function CDPipelinesListPage() {
  return (
    <FilterProvider<CDPipeline, CDPipelineFilterValues>
      defaultValues={cdPipelineFilterDefaultValues}
      matchFunctions={matchFunctions}
      syncWithUrl
    >
      <PageView />
    </FilterProvider>
  );
}
```

## List Component Integration

### components/CDPipelineList/index.tsx

```typescript
import React from "react";
import { Table } from "@/core/components/Table";
import { useCDPipelineWatchList } from "@/k8s/api/groups/.../CDPipeline";
import { CDPipelineFilter } from "../CDPipelineFilter";
import { useCDPipelineFilter } from "../CDPipelineFilter/hooks/useFilter";

export const CDPipelineList = () => {
  const { filterFunction } = useCDPipelineFilter();
  const cdPipelineWatch = useCDPipelineWatchList();

  const tableSlots = React.useMemo(
    () => ({
      header: <CDPipelineFilter />,
    }),
    []
  );

  return (
    <Table
      id="cdpipeline-list"
      name="CD Pipelines"
      isLoading={!cdPipelineWatch.query.isFetched}
      data={cdPipelineWatch.dataArray}
      columns={columns}
      filterFunction={filterFunction}
      slots={tableSlots}
    />
  );
};
```

## Filter Logic Explained

### Search Filter

Uses built-in `createSearchMatchFunction`:

- Searches by `metadata.name`
- Searches by label keys
- Supports `label:value` syntax

### Codebases Filter (Array Match)

Custom logic that checks if ANY of the selected codebases are in the pipeline's applications:

```typescript
// If user selects ["app-1", "app-2"]
// Pipeline with applications: ["app-1", "app-3"]
// Result: MATCH (because "app-1" is in both)
```

### Namespaces Filter (Array Match)

Custom logic that checks if the pipeline's namespace is in the selected namespaces:

```typescript
// If user selects ["default", "kube-system"]
// Pipeline with namespace: "default"
// Result: MATCH (because "default" is in selection)
```

## URL State Example

With all filters active:

```
/cd-pipelines?search=my-pipeline&codebases=app-1,app-2&namespaces=default,prod
```

## Characteristics

- **Multiple Criteria**: 3 filter fields (search + 2 multi-selects)
- **Dynamic Options**: Codebase and namespace options loaded from API
- **Array Filtering**: Multi-select with array match logic
- **URL Sync**: All filter state preserved in URL
- **Type Safe**: Full TypeScript support
- **Performance**: Debounced updates, memoized options

## Advanced Patterns

### Loading States for Options

```typescript
const codebaseOptions = React.useMemo(() => {
  if (!codebaseWatch.query.isFetched) {
    return [{ label: "Loading...", value: "", disabled: true }];
  }

  return codebaseWatch.dataArray.map((codebase) => ({
    label: codebase.metadata.name,
    value: codebase.metadata.name,
  }));
}, [codebaseWatch]);
```

### Conditional Field Display

```typescript
// Show namespace filter only if user has multi-namespace access
{hasMultiNamespaceAccess && (
  <div className="w-64">
    <form.Field name={FILTER_NAMES.NAMESPACES}>
      {(field) => (
        <Autocomplete
          field={field}
          label="Namespaces"
          options={namespaceOptions}
          multiple={true}
        />
      )}
    </form.Field>
  </div>
)}
```

### Grouped Options

```typescript
const groupedOptions = React.useMemo(() => {
  return [
    {
      label: "Production",
      options: prodCodebases.map((cb) => ({ label: cb.name, value: cb.name })),
    },
    {
      label: "Development",
      options: devCodebases.map((cb) => ({ label: cb.name, value: cb.name })),
    },
  ];
}, [prodCodebases, devCodebases]);
```

## When to Use

✅ **Use multi-field filter when:**

- List has > 100 items
- Multiple filter criteria needed
- Users need precise filtering
- Complex data relationships exist

❌ **Use simple filter when:**

- List has < 100 items
- Search-only is sufficient
- Quick filtering needed
- Minimal complexity preferred

## Real Implementation

Source: `apps/client/src/modules/platform/cdpipelines/pages/list/components/CDPipelineFilter/`

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
import { Button } from "@/core/components/ui/button";
import { Label } from "@/core/components/ui/label";
import { X } from "lucide-react";
import { CDPIPELINE_LIST_FILTER_NAMES } from "./constants";
import { useCDPipelineFilter } from "./hooks/useFilter";
import { useCDPipelineWatchList } from "@/k8s/api/groups/.../CDPipeline";
import { useClusterStore } from "@/k8s/store";
import { useShallow } from "zustand/react/shallow";

export const CDPipelineFilter = () => {
  const { form, reset } = useCDPipelineFilter();

  const cdPipelineListWatch = useCDPipelineWatchList();
  const allowedNamespaces = useClusterStore(useShallow((state) => state.allowedNamespaces));
  const showNamespaceFilter = allowedNamespaces.length > 1;

  // Extract unique codebases from all pipelines
  const cdPipelineCodebases = React.useMemo(() => {
    const list = cdPipelineListWatch.data.array ?? [];
    return Array.from(
      list.reduce((acc, cur) => {
        cur?.spec?.applications?.forEach((codebase) => acc.add(codebase));
        return acc;
      }, new Set<string>())
    );
  }, [cdPipelineListWatch.data.array]);

  const codebaseOptions = React.useMemo(
    () => cdPipelineCodebases.map((value) => ({ label: value, value })),
    [cdPipelineCodebases]
  );

  const namespaceOptions = React.useMemo(
    () => allowedNamespaces.map((value) => ({ label: value, value })),
    [allowedNamespaces]
  );

  return (
    <>
      <div className="col-span-3">
        <form.AppField name={CDPIPELINE_LIST_FILTER_NAMES.SEARCH}>
          {(field) => <field.FormTextField label="Search" placeholder="Search CD Pipelines" />}
        </form.AppField>
      </div>

      <div className="col-span-4">
        <form.AppField name={CDPIPELINE_LIST_FILTER_NAMES.CODEBASES}>
          {(field) => (
            <field.FormCombobox
              multiple
              options={codebaseOptions}
              label="Codebases"
              placeholder="Select codebases"
            />
          )}
        </form.AppField>
      </div>

      {showNamespaceFilter && (
        <div className="col-span-4">
          <form.AppField name={CDPIPELINE_LIST_FILTER_NAMES.NAMESPACES}>
            {(field) => (
              <field.FormCombobox
                options={namespaceOptions}
                label="Namespaces"
                placeholder="Select namespaces"
                multiple
              />
            )}
          </form.AppField>
        </div>
      )}

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
  <div className="col-span-4">
    <form.AppField name={FILTER_NAMES.NAMESPACES}>
      {(field) => (
        <field.FormCombobox
          label="Namespaces"
          options={namespaceOptions}
          placeholder="Select namespaces"
          multiple
        />
      )}
    </form.AppField>
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

**Use multi-field filter when:**

- List has > 100 items
- Multiple filter criteria needed
- Users need precise filtering
- Complex data relationships exist

**Use simple filter when:**

- List has < 100 items
- Search-only is sufficient
- Quick filtering needed
- Minimal complexity preferred

## Real Implementation

Source: `apps/client/src/modules/platform/cdpipelines/pages/list/components/CDPipelineFilter/`

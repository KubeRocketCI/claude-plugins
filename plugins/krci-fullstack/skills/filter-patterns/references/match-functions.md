# Match Functions Reference

Complete guide to built-in and custom match functions for FilterProvider.

## Overview

Match functions are the core filtering logic that determines whether an item should be included in filtered results. Each filter field has its own match function that receives the item and filter value, returning `true` to include or `false` to exclude the item.

## Function Signature

```typescript
type MatchFunction<Item, Value> = (item: Item, filterValue: Value) => boolean;
```

## Built-in Match Functions

Located in `apps/client/src/core/providers/Filter/matchFunctions.ts`

### 1. createSearchMatchFunction

Search by `metadata.name` or labels with support for label-specific search.

**Usage**:

```typescript
import { createSearchMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.SEARCH]: createSearchMatchFunction<EntityType>()
```

**Features**:

- Searches `metadata.name` (case-insensitive)
- Searches all label keys
- Supports `label:value` syntax for specific label search
- Returns `true` if value is empty

**Examples**:

- `"my-app"` → matches resources with "my-app" in name or any label key
- `"environment:production"` → matches resources with label `environment=production`
- `"env:prod"` → matches resources with label starting with `env` and value containing "prod"

### 2. createNamespaceMatchFunction

Filter by namespace(s) for multi-namespace resources.

**Usage**:

```typescript
import { createNamespaceMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.NAMESPACES]: createNamespaceMatchFunction<EntityType>()
```

**Filter Value Type**: `string[]`

**Features**:

- Matches if `metadata.namespace` is in the provided array
- Returns `true` if array is empty
- Supports multi-namespace selection

**Example**:

```typescript
// Filter values
namespaces: ["default", "kube-system"]

// Matches items with namespace "default" or "kube-system"
```

### 3. createExactMatchFunction

Exact value match with support for "all" option.

**Usage**:

```typescript
import { createExactMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.TYPE]: createExactMatchFunction<EntityType, string>(
  (item) => item.spec.type
)
```

**Features**:

- Accepts getter function to extract value from item
- Returns `true` if filter value is empty or "all"
- Performs exact string comparison

**Example**:

```typescript
// Match by status phase
[FILTER_NAMES.STATUS]: createExactMatchFunction<EntityType, string>(
  (item) => item.status?.phase
)
```

### 4. createArrayIncludesMatchFunction

Array inclusion check for multi-select filtering.

**Usage**:

```typescript
import { createArrayIncludesMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.STATUSES]: createArrayIncludesMatchFunction<EntityType>(
  (item) => item.status?.phase
)
```

**Filter Value Type**: `string[]`

**Features**:

- Accepts getter function to extract value from item
- Returns `true` if filter array is empty
- Checks if item's value is included in filter array

**Example**:

```typescript
// Filter values
statuses: ["Running", "Succeeded"]

// Matches items with status "Running" OR "Succeeded"
```

### 5. createLabelMatchFunction

Filter by specific Kubernetes label value.

**Usage**:

```typescript
import { createLabelMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.ENVIRONMENT]: createLabelMatchFunction<EntityType>("environment")
```

**Features**:

- Matches exact label value for specified label key
- Returns `true` if filter value is empty or "all"
- Directly accesses `metadata.labels[labelKey]`

**Example**:

```typescript
// Match by "app.kubernetes.io/component" label
[FILTER_NAMES.COMPONENT]: createLabelMatchFunction<EntityType>(
  "app.kubernetes.io/component"
)
```

### 6. createBooleanMatchFunction

Boolean condition filtering.

**Usage**:

```typescript
import { createBooleanMatchFunction } from "@/core/providers/Filter";

[FILTER_NAMES.IS_ACTIVE]: createBooleanMatchFunction<EntityType>(
  (item) => item.spec.enabled
)
```

**Filter Value Type**: `boolean`

**Features**:

- Accepts getter function to extract boolean from item
- Only filters when value is `true` (returns `true` if falsy)
- Useful for "show only X" type filters

**Example**:

```typescript
// Show only enabled items
[FILTER_NAMES.SHOW_ENABLED_ONLY]: createBooleanMatchFunction<EntityType>(
  (item) => item.spec.enabled === true
)
```

## Custom Match Function Patterns

### Pattern 1: Exact Match with "All" Option

```typescript
[FILTER_NAMES.STATUS]: (item, value) => {
  if (value === "all") return true;
  return item.status?.phase === value;
}
```

### Pattern 2: Array/Multi-Select Filtering

```typescript
[FILTER_NAMES.TYPES]: (item, value) => {
  if (!value || value.length === 0) return true;
  return value.includes(item.spec.type);
}
```

### Pattern 3: Case-Insensitive String Match

```typescript
[FILTER_NAMES.NAME]: (item, value) => {
  if (!value) return true;
  return item.metadata.name.toLowerCase().includes(value.toLowerCase());
}
```

### Pattern 4: Nested Property Match

```typescript
[FILTER_NAMES.REPOSITORY]: (item, value) => {
  if (!value) return true;
  const repoUrl = item.spec?.source?.git?.url?.toLowerCase();
  return repoUrl?.includes(value.toLowerCase()) ?? false;
}
```

### Pattern 5: Complex Status Grouping

```typescript
[FILTER_NAMES.STATUS]: (item, value) => {
  if (value === "all") return true;

  const phase = item.status?.phase?.toLowerCase();

  // Group multiple statuses
  if (value === "active") {
    return ["running", "succeeded"].includes(phase);
  }

  if (value === "inactive") {
    return ["failed", "unknown"].includes(phase);
  }

  return phase === value;
}
```

### Pattern 6: Date Range Match

```typescript
[FILTER_NAMES.DATE_RANGE]: (item, value: { start?: Date; end?: Date }) => {
  if (!value.start && !value.end) return true;

  const itemDate = new Date(item.metadata.creationTimestamp);

  if (value.start && itemDate < value.start) return false;
  if (value.end && itemDate > value.end) return false;

  return true;
}
```

### Pattern 7: Multiple Label Match

```typescript
[FILTER_NAMES.LABELS]: (item, value: Record<string, string>) => {
  if (!value || Object.keys(value).length === 0) return true;

  return Object.entries(value).every(([key, val]) => {
    return item.metadata?.labels?.[key] === val;
  });
}
```

### Pattern 8: Regex Pattern Match

```typescript
[FILTER_NAMES.PATTERN]: (item, value) => {
  if (!value) return true;

  try {
    const regex = new RegExp(value, 'i');
    return regex.test(item.metadata.name);
  } catch {
    // If invalid regex, fall back to simple includes
    return item.metadata.name.includes(value);
  }
}
```

### Pattern 9: Numeric Range Match

```typescript
[FILTER_NAMES.REPLICA_COUNT]: (item, value: { min?: number; max?: number }) => {
  if (!value.min && !value.max) return true;

  const replicas = item.spec.replicas ?? 0;

  if (value.min !== undefined && replicas < value.min) return false;
  if (value.max !== undefined && replicas > value.max) return false;

  return true;
}
```

### Pattern 10: Contains Any (OR logic)

```typescript
[FILTER_NAMES.TAGS]: (item, value: string[]) => {
  if (!value || value.length === 0) return true;

  const itemTags = item.metadata?.labels?.tags?.split(',') || [];

  // Return true if any tag matches
  return value.some(tag => itemTags.includes(tag));
}
```

## Best Practices

### 1. Always Handle Empty Values

```typescript
// Good - Returns true for empty/default values
[FILTER_NAMES.STATUS]: (item, value) => {
  if (!value || value === "all") return true;
  return item.status?.phase === value;
}

// Bad - Doesn't handle empty case
[FILTER_NAMES.STATUS]: (item, value) => {
  return item.status?.phase === value;
}
```

### 2. Use Null-Safe Access

```typescript
// Good - Safe optional chaining
const phase = item.status?.phase?.toLowerCase();
return phase?.includes(value) ?? false;

// Bad - Can throw errors
const phase = item.status.phase.toLowerCase();
return phase.includes(value);
```

### 3. Keep Functions Pure

```typescript
// Good - Pure function, no side effects
[FILTER_NAMES.STATUS]: (item, value) => {
  return item.status?.phase === value;
}

// Bad - Side effects
[FILTER_NAMES.STATUS]: (item, value) => {
  console.log('Filtering:', item.metadata.name); // Side effect!
  return item.status?.phase === value;
}
```

### 4. Optimize for Early Returns

```typescript
// Good - Early returns reduce computation
[FILTER_NAMES.COMPLEX]: (item, value) => {
  if (!value) return true; // Fast path
  if (value === "all") return true; // Fast path

  // Only do expensive work if needed
  const computed = expensiveComputation(item);
  return computed === value;
}
```

### 5. Type Safety

```typescript
// Good - Explicit type for complex values
type DateRangeFilter = { start?: Date; end?: Date };

[FILTER_NAMES.DATE_RANGE]: (item, value: DateRangeFilter) => {
  // TypeScript knows value structure
}

// Better - Define in types.ts
export type EntityFilterValues = {
  [ENTITY_FILTER_NAMES.DATE_RANGE]: DateRangeFilter;
};
```

## Common Use Cases

### Combining Multiple Conditions (AND)

```typescript
[FILTER_NAMES.ADVANCED]: (item, value: { status?: string; type?: string }) => {
  if (!value.status && !value.type) return true;

  const statusMatch = value.status ? item.status?.phase === value.status : true;
  const typeMatch = value.type ? item.spec.type === value.type : true;

  return statusMatch && typeMatch; // Both must match
}
```

### Text Search Across Multiple Fields

```typescript
[FILTER_NAMES.SEARCH]: (item, value) => {
  if (!value) return true;

  const searchLower = value.toLowerCase();

  return (
    item.metadata.name.toLowerCase().includes(searchLower) ||
    item.spec.description?.toLowerCase().includes(searchLower) ||
    item.spec.url?.toLowerCase().includes(searchLower)
  );
}
```

### Status-Based Filtering with Aliases

```typescript
const STATUS_GROUPS = {
  healthy: ['Running', 'Succeeded', 'Active'],
  unhealthy: ['Failed', 'Error', 'CrashLoopBackOff'],
  pending: ['Pending', 'ContainerCreating', 'Initializing'],
};

[FILTER_NAMES.HEALTH]: (item, value) => {
  if (value === "all") return true;

  const phase = item.status?.phase;
  const group = STATUS_GROUPS[value as keyof typeof STATUS_GROUPS];

  return group ? group.includes(phase) : phase === value;
}
```

## Performance Tips

1. **Use Built-in Functions**: They're optimized and tested
2. **Early Returns**: Return `true` immediately when no filtering needed
3. **Avoid Regex**: Use string methods when possible
4. **Cache Expensive Computations**: If computing derived values, consider caching at data level
5. **Simple Comparisons**: Prefer `===` over complex logic when possible

## Testing Match Functions

```typescript
import { matchFunctions } from "./constants";

describe("EntityFilter match functions", () => {
  const mockItem = {
    metadata: { name: "test-entity", namespace: "default" },
    status: { phase: "Running" },
    spec: { type: "typeA" },
  };

  it("should match by search", () => {
    const searchMatch = matchFunctions.search;

    expect(searchMatch(mockItem, "test")).toBe(true);
    expect(searchMatch(mockItem, "other")).toBe(false);
    expect(searchMatch(mockItem, "")).toBe(true);
  });

  it("should match by status", () => {
    const statusMatch = matchFunctions.status;

    expect(statusMatch(mockItem, "Running")).toBe(true);
    expect(statusMatch(mockItem, "Failed")).toBe(false);
    expect(statusMatch(mockItem, "all")).toBe(true);
  });
});
```

## Real-World Examples

See these implementations in the codebase:

- **QuickLinkFilter**: `apps/client/src/modules/platform/configuration/modules/quicklinks/components/QuickLinkFilter/constants.ts`
- **CDPipelineFilter**: `apps/client/src/modules/platform/cdpipelines/pages/list/components/CDPipelineFilter/constants.ts`
- **ProjectsFilter**: `apps/client/src/modules/platform/security/pages/sca-projects/components/ProjectsFilter/constants.ts`

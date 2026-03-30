# Match Functions Exploration Guide

> **When to read this**: When you need to write a custom match function and want to understand the built-in factories before deciding whether to use one or write your own.

## Source File

All built-in match functions live in one file:
`apps/client/src/core/providers/Filter/matchFunctions.ts`

Read that file directly to see the exact implementation. It is short (under 80 lines).

## Decision Framework

**Use a built-in factory when**:

- Your filter is a text search on `metadata.name` / labels --> `createSearchMatchFunction`
- Your filter is a namespace multi-select --> `createNamespaceMatchFunction`
- Your filter is a single-select dropdown with an "all" option --> `createExactMatchFunction`
- Your filter is a multi-select checkbox/tag list --> `createArrayIncludesMatchFunction`
- Your filter matches a specific K8s label key --> `createLabelMatchFunction`
- Your filter is a boolean toggle ("show only X") --> `createBooleanMatchFunction`

**Write a custom match function when**:

- You need to combine multiple conditions
- The value extraction is complex (nested paths, computed values)
- You need OR logic across multiple item fields
- The "empty means no filter" convention differs from the built-in defaults

## Contract

Every match function must follow this contract:

1. Return `true` when the filter value is empty/default (no filtering)
2. Return `true` when the item matches the filter value
3. Return `false` when the item does not match
4. Be a pure function with no side effects
5. Handle null/undefined gracefully (use optional chaining)

## Finding Real Examples

To find all match function implementations in the codebase:

```
grep -r "matchFunctions" apps/client/src/modules/ --include="constants.ts" -l
```

Each `constants.ts` file that defines `matchFunctions` shows a real-world combination of built-in factories and custom functions tailored to a specific resource type.

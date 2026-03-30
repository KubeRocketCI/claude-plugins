# Testing Patterns Reference

Read this when writing tests that need to mock tRPC, Zustand stores, K8s hooks, or permissions. These patterns are hard to derive from the code alone.

## Mocking tRPC Client

The portal does not use MSW. Instead, create a mock tRPC client object and mock the `useTRPCClient` hook:

```typescript
const mockTrpcClient = {
  k8s: {
    itemPermissions: { mutate: vi.fn() },
    apiVersions: { query: vi.fn() },
  },
};

vi.mock("@/core/providers/trpc", () => ({
  useTRPCClient: vi.fn(),
}));

// In beforeEach:
vi.mocked(useTRPCClient).mockReturnValue(mockTrpcClient as never);
```

The `as never` cast is necessary because the mock only implements the subset of methods the test needs.

## Mocking Zustand Stores

Zustand stores (like `useClusterStore`) require special handling because they are used both as hooks and as static objects (`.getState()`, `.setState()`):

```typescript
const { mockClusterStoreState, mockSetState } = vi.hoisted(() => {
  const mockClusterStoreState = {
    clusterName: "test-cluster",
    defaultNamespace: "default",
  };
  const mockSetState = vi.fn();
  return { mockClusterStoreState, mockSetState };
});

vi.mock("@/k8s/store", () => ({
  useClusterStore: Object.assign(
    vi.fn((selector) => {
      if (selector) return selector(mockClusterStoreState);
      return mockClusterStoreState;
    }),
    {
      setState: mockSetState,
      getState: vi.fn(() => mockClusterStoreState),
    }
  ),
}));
```

`vi.hoisted()` is required so the mock state is available inside the `vi.mock()` factory, which is hoisted to the top of the file by Vitest.

## Mocking Permissions

For components using `usePermissions`, mock the hook:

```typescript
vi.mock("@/k8s/api/hooks/usePermissions", () => ({
  usePermissions: vi.fn(() => ({
    data: {
      create: { allowed: true, reason: "" },
      patch: { allowed: true, reason: "" },
      delete: { allowed: true, reason: "" },
    },
    isLoading: false,
    isSuccess: true,
  })),
}));
```

Or use `mockPermissions` from test utils for the data shape:

```typescript
import { mockPermissions } from "@/test/utils";
```

## Testing Hooks with renderHook

Use `renderHook` from `@testing-library/react` (not the deprecated `@testing-library/react-hooks`). Wrap with a provider component:

```typescript
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createTestQueryClient } from "@/test/utils";

const { result } = renderHook(
  () => useMyHook({ someParam: "value" }),
  {
    wrapper: ({ children }) => (
      <QueryClientProvider client={createTestQueryClient()}>
        {children}
      </QueryClientProvider>
    ),
  }
);

await waitFor(() => {
  expect(result.current.data).toEqual(expectedData);
});
```

For hooks that need the full provider stack, use `TestProviders` as the wrapper.

## Testing Components with TestProviders

```typescript
import { render, screen } from "@testing-library/react";
import { TestProviders } from "@/test/utils";

render(
  <TestProviders
    seedQueryCache={(client) => {
      client.setQueryData(["myKey"], mockData);
    }}
  >
    <MyComponent />
  </TestProviders>
);
```

## Common Assertions

```typescript
// Element presence
expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();

// Element absence
expect(screen.queryByText(/error/i)).not.toBeInTheDocument();

// Async appearance
await waitFor(() => {
  expect(result.current.data).toEqual(expected);
}, { timeout: 5000 });

// Function calls
expect(mockFn).toHaveBeenCalledWith(
  expect.objectContaining({ key: "value" })
);
```

## Discovery Instructions

For real examples of these patterns in action:

- Hook test with tRPC + store mocking: `apps/client/src/k8s/api/hooks/usePermissions/index.test.tsx`
- Auth provider test: `apps/client/src/core/auth/provider/provider.test.tsx`
- Component test with vi.mock: `apps/client/src/core/components/Table/Table.test.tsx`
- Server-side procedure tests: `packages/trpc/src/routers/auth/procedures/`
- Server-side mocks: `packages/trpc/src/__mocks__/`

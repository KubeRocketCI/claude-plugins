# Testing Patterns

Advanced testing patterns for the KubeRocketCI portal using Vitest and React Testing Library.

## Testing Hooks

Test custom hooks with `@testing-library/react-hooks`:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

it('should fetch data', async () => {
  const { result } = renderHook(() => useMyHook(), {
    wrapper: createWrapper(),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toBeDefined();
});
```

## Mocking tRPC Calls

Mock tRPC client for component tests:

```typescript
import { vi } from 'vitest';

const mockTRPCClient = {
  resources: {
    list: {
      query: vi.fn().mockResolvedValue([
        { metadata: { name: 'test-resource' } },
      ]),
    },
    create: {
      mutate: vi.fn(),
    },
  },
};

vi.mock('@/core/providers/trpc', () => ({
  useTRPCClient: () => mockTRPCClient,
}));
```

## Testing Forms

Test TanStack Form components:

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('should submit form with valid data', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();

  render(<MyForm onSubmit={onSubmit} />);

  await user.type(screen.getByLabelText('Name'), 'Test Name');
  await user.click(screen.getByRole('button', { name: 'Submit' }));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Test Name',
    });
  });
});

it('should show validation errors', async () => {
  const user = userEvent.setup();

  render(<MyForm />);

  await user.click(screen.getByRole('button', { name: 'Submit' }));

  expect(screen.getByText('Name is required')).toBeInTheDocument();
});
```

## Testing Kubernetes Resources

Mock watch hooks for K8s resources:

```typescript
vi.mock('@/k8s/api/hooks/useWatch/useWatchList', () => ({
  useWatchList: () => ({
    dataArray: [
      {
        metadata: { name: 'test-codebase', namespace: 'default' },
        spec: { type: 'application' },
      },
    ],
    query: { isFetched: true, isLoading: false },
  }),
}));
```

## Testing Filters

Test FilterProvider with components:

```typescript
import { FilterProvider } from '@/core/providers/Filter';

const renderWithFilter = (ui: React.ReactElement) => {
  return render(
    <FilterProvider
      defaultValues={{ search: '' }}
      matchFunctions={{ search: () => true }}
    >
      {ui}
    </FilterProvider>
  );
};

it('should filter results', async () => {
  const user = userEvent.setup();

  renderWithFilter(<ResourceList />);

  await user.type(screen.getByPlaceholderText('Search'), 'test');

  await waitFor(() => {
    expect(screen.queryByText('other-resource')).not.toBeInTheDocument();
    expect(screen.getByText('test-resource')).toBeInTheDocument();
  });
});
```

## Testing Permissions

Mock permission hooks:

```typescript
vi.mock('@/k8s/api/hooks/usePermissions', () => ({
  useResourcePermissions: () => ({
    data: {
      create: { allowed: true, reason: '' },
      delete: { allowed: false, reason: 'Insufficient permissions' },
    },
    isLoading: false,
  }),
}));

it('should show delete button as disabled', () => {
  render(<ResourceActions />);

  const deleteButton = screen.getByRole('button', { name: 'Delete' });
  expect(deleteButton).toBeDisabled();
});
```

## Testing Dialogs

Test dialog interactions:

```typescript
import { DialogProvider } from '@/core/providers/Dialog';

it('should open and close dialog', async () => {
  const user = userEvent.setup();

  render(
    <DialogProvider>
      <MyComponent />
    </DialogProvider>
  );

  await user.click(screen.getByRole('button', { name: 'Open Dialog' }));

  expect(screen.getByRole('dialog')).toBeInTheDocument();

  await user.click(screen.getByRole('button', { name: 'Close' }));

  await waitFor(() => {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
```

## Testing Navigation

Mock TanStack Router:

```typescript
import { useNavigate } from '@tanstack/react-router';

vi.mock('@tanstack/react-router', () => ({
  useNavigate: vi.fn(),
  useParams: () => ({ namespace: 'default', name: 'test' }),
}));

it('should navigate on click', async () => {
  const navigate = vi.fn();
  vi.mocked(useNavigate).mockReturnValue(navigate);

  const user = userEvent.setup();

  render(<ResourceLink />);

  await user.click(screen.getByRole('link'));

  expect(navigate).toHaveBeenCalledWith({
    to: '/resources/$namespace/$name',
    params: { namespace: 'default', name: 'test' },
  });
});
```

## Testing Tables

Test table rendering and interactions:

```typescript
it('should render table with data', () => {
  render(<ResourceTable data={mockData} columns={columns} />);

  expect(screen.getByRole('table')).toBeInTheDocument();
  expect(screen.getAllByRole('row')).toHaveLength(mockData.length + 1); // +1 for header
});

it('should sort table', async () => {
  const user = userEvent.setup();

  render(<ResourceTable data={mockData} columns={columns} />);

  await user.click(screen.getByText('Name'));

  const rows = screen.getAllByRole('row').slice(1); // Skip header
  expect(rows[0]).toHaveTextContent('app-a');
  expect(rows[1]).toHaveTextContent('app-b');
});
```

## Testing WebSocket Connections

Mock WebSocket watch streams:

```typescript
import { WS } from 'vitest-websocket-mock';

let ws: WS;

beforeEach(() => {
  ws = new WS('ws://localhost:3000/watch');
});

afterEach(() => {
  WS.clean();
});

it('should receive watch updates', async () => {
  render(<ResourceWatcher />);

  // Simulate WebSocket message
  ws.send(JSON.stringify({
    type: 'ADDED',
    object: { metadata: { name: 'new-resource' } },
  }));

  await waitFor(() => {
    expect(screen.getByText('new-resource')).toBeInTheDocument();
  });
});
```

## Testing Error Boundaries

Test error handling:

```typescript
it('should catch and display errors', () => {
  const ThrowError = () => {
    throw new Error('Test error');
  };

  render(
    <ErrorBoundary fallback={<div>Error occurred</div>}>
      <ThrowError />
    </ErrorBoundary>
  );

  expect(screen.getByText('Error occurred')).toBeInTheDocument();
});
```

## Snapshot Testing

Use sparingly for complex components:

```typescript
it('should match snapshot', () => {
  const { container } = render(<ComplexComponent />);
  expect(container).toMatchSnapshot();
});
```

**Warning**: Snapshots are brittle. Use only for truly complex UI that rarely changes.

## Coverage Best Practices

Focus coverage on critical paths:

- ✅ Business logic (100%)
- ✅ User interactions (critical flows)
- ✅ Error handling
- ❌ Simple presentational components
- ❌ Generated code
- ❌ Third-party library wrappers

## Test Organization

```
ComponentName/
├── index.tsx
├── index.test.tsx
├── components/
│   ├── SubComponent/
│   │   ├── index.tsx
│   │   └── index.test.tsx
└── hooks/
    ├── useComponentHook.tsx
    └── useComponentHook.test.tsx
```

**Pattern**: Test files adjacent to source files.

## Mock Data Factories

Create reusable mock factories:

```typescript
// test/factories/resource.ts
export const createMockCodebase = (overrides = {}) => ({
  apiVersion: 'v2.edp.epam.com/v1',
  kind: 'Codebase',
  metadata: {
    name: 'test-codebase',
    namespace: 'default',
  },
  spec: {
    type: 'application',
  },
  ...overrides,
});
```

## Real-World Examples

**Check these test files**:

- Component tests: `apps/client/src/core/components/*/index.test.tsx`
- Hook tests: `apps/client/src/k8s/api/hooks/*/*.test.ts`
- Form tests: Look for `*.test.tsx` in feature modules

## Best Practices

1. **Test user behavior, not implementation** - Use accessible queries (getByRole, getByLabelText)
2. **Avoid testing internal state** - Test outputs and side effects
3. **Use userEvent over fireEvent** - More realistic user interactions
4. **Wait for async updates** - Always use waitFor for async operations
5. **Mock external dependencies** - Mock tRPC, K8s API, WebSockets
6. **Keep tests isolated** - Each test should be independent
7. **Name tests clearly** - "should [expected behavior] when [condition]"
8. **Don't test third-party code** - Trust library functionality

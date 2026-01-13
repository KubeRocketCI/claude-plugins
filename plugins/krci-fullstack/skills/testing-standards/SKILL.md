---
name: Testing Standards
description: This skill should be used when the user asks to "write tests", "test component", "add unit tests", "Vitest", "Testing Library", "test coverage", "testing patterns", or mentions testing, test implementation, or quality assurance for frontend code.
version: 0.1.0
---

Implement comprehensive tests using Vitest and React Testing Library following the KubeRocketCI portal's testing patterns and best practices.

## Purpose

Guide test implementation focusing on user behavior, accessibility, and comprehensive coverage for React components and hooks.

## Testing Stack

- **Vitest**: Test runner and assertions
- **React Testing Library**: Component testing
- **User Event**: User interaction simulation
- **MSW**: API mocking (Mock Service Worker)

## Testing Philosophy

**Test Behavior, Not Implementation**:

- Focus on what users see and interact with
- Avoid testing internal component details
- Test from user perspective

**Accessibility First**:

- Query by accessible roles and labels
- Validate ARIA attributes
- Ensure keyboard navigation

## Component Testing

### Basic Component Test

```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CodebaseStatus } from './CodebaseStatus';

describe('CodebaseStatus', () => {
  it('displays running status with success icon', () => {
    const codebase = {
      status: { phase: 'Running' },
      metadata: { name: 'test-codebase' },
    };

    render(<CodebaseStatus codebase={codebase} />);

    expect(screen.getByText(/Status: Running/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /success/i })).toBeInTheDocument();
  });

  it('displays failed status with error icon', () => {
    const codebase = {
      status: { phase: 'Failed' },
      metadata: { name: 'test-codebase' },
    };

    render(<CodebaseStatus codebase={codebase} />);

    expect(screen.getByText(/Status: Failed/i)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /error/i })).toBeInTheDocument();
  });
});
```

### User Interaction Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { CreateCodebaseButton } from './CreateCodebaseButton';

describe('CreateCodebaseButton', () => {
  it('calls onCreate when button clicked', async () => {
    const user = userEvent.setup();
    const onCreateMock = vi.fn();

    render(<CreateCodebaseButton onCreate={onCreateMock} />);

    const button = screen.getByRole('button', { name: /create codebase/i });
    await user.click(button);

    expect(onCreateMock).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during creation', async () => {
    const user = userEvent.setup();
    const onCreateMock = vi.fn(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<CreateCodebaseButton onCreate={onCreateMock} />);

    const button = screen.getByRole('button', { name: /create codebase/i });
    await user.click(button);

    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(button).toBeDisabled();
  });
});
```

### Form Testing

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import { CodebaseForm } from './CodebaseForm';

describe('CodebaseForm', () => {
  it('validates required fields', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(<CodebaseForm onSubmit={onSubmitMock} />);

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    expect(screen.getByText(/git url is required/i)).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    const onSubmitMock = vi.fn();

    render(<CodebaseForm onSubmit={onSubmitMock} />);

    await user.type(screen.getByLabelText(/name/i), 'my-codebase');
    await user.type(screen.getByLabelText(/git url/i), 'https://github.com/user/repo');

    const submitButton = screen.getByRole('button', { name: /create/i });
    await user.click(submitButton);

    expect(onSubmitMock).toHaveBeenCalledWith({
      name: 'my-codebase',
      gitUrl: 'https://github.com/user/repo',
    });
  });
});
```

## Query Patterns

### Accessibility-First Queries

**Preferred Queries** (in order):

1. `getByRole`: Most accessible
2. `getByLabelText`: For form fields
3. `getByPlaceholderText`: For inputs
4. `getByText`: For content
5. `getByTestId`: Last resort

```typescript
// Good - accessible queries
screen.getByRole('button', { name: /create/i });
screen.getByLabelText(/email address/i);
screen.getByPlaceholderText(/enter email/i);
screen.getByText(/welcome/i);

// Avoid - implementation details
screen.getByClassName('submit-button');
container.querySelector('.error-message');
```

### Async Queries

```typescript
// Wait for element to appear
const successMessage = await screen.findByText(/created successfully/i);
expect(successMessage).toBeInTheDocument();

// Wait for element to disappear
await waitForElementToBeRemoved(() => screen.queryByText(/loading/i));
```

## Mocking

### Mock tRPC Calls

```typescript
import { vi } from 'vitest';

const mockTRPC = {
  codebases: {
    list: {
      useQuery: vi.fn(() => ({
        data: [
          { metadata: { name: 'codebase-1' }, spec: { gitUrlPath: 'https://...' } },
          { metadata: { name: 'codebase-2' }, spec: { gitUrlPath: 'https://...' } },
        ],
        isLoading: false,
        error: null,
      })),
    },
    create: {
      useMutation: vi.fn(() => ({
        mutate: vi.fn(),
        isPending: false,
      })),
    },
  },
};

// Use in test
vi.mock('@/core/clients/trpc', () => ({
  trpc: mockTRPC,
}));
```

### Mock React Router

```typescript
vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  useParams: () => ({ name: 'test-codebase' }),
  Link: ({ children, to }: any) => <a href={to}>{children}</a>,
}));
```

## Testing Hooks

### Custom Hook Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useCodebaseList } from './useCodebaseList';

describe('useCodebaseList', () => {
  it('fetches and returns codebases', async () => {
    const { result } = renderHook(() => useCodebaseList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0].metadata.name).toBe('codebase-1');
  });

  it('handles errors gracefully', async () => {
    // Mock error response
    mockTRPC.codebases.list.useQuery.mockReturnValueOnce({
      data: null,
      isLoading: false,
      error: { message: 'Failed to fetch' },
    });

    const { result } = renderHook(() => useCodebaseList());

    expect(result.current.error).toBeTruthy();
    expect(result.current.error.message).toBe('Failed to fetch');
  });
});
```

## Accessibility Testing

### Test ARIA Attributes

```typescript
it('has proper ARIA labels', () => {
  render(<CodebaseList />);

  const table = screen.getByRole('table', { name: /codebases/i });
  expect(table).toBeInTheDocument();

  const rows = screen.getAllByRole('row');
  expect(rows.length).toBeGreaterThan(0);
});
```

### Test Keyboard Navigation

```typescript
it('supports keyboard navigation', async () => {
  const user = userEvent.setup();
  render(<CodebaseForm />);

  const nameInput = screen.getByLabelText(/name/i);
  const urlInput = screen.getByLabelText(/git url/i);

  await user.tab();
  expect(nameInput).toHaveFocus();

  await user.tab();
  expect(urlInput).toHaveFocus();
});
```

## Test Organization

### File Structure

```
ComponentName/
├── index.tsx
└── index.test.tsx

or

page-name/
├── view.tsx
└── view.test.tsx
```

### Describe Blocks

```typescript
describe('CodebaseList', () => {
  describe('rendering', () => {
    it('displays list of codebases', () => {});
    it('shows empty state when no codebases', () => {});
  });

  describe('user interactions', () => {
    it('navigates to details on click', () => {});
    it('opens create dialog on button click', () => {});
  });

  describe('error states', () => {
    it('displays error message on fetch failure', () => {});
  });
});
```

## Coverage Goals

- **Components**: 80%+ coverage
- **Hooks**: 90%+ coverage
- **Utilities**: 95%+ coverage

Focus on meaningful tests, not just coverage numbers.

## Best Practices

1. **User Perspective**: Test what users see and do
2. **Accessibility**: Use semantic queries
3. **Async Handling**: Use `findBy*` and `waitFor`
4. **Mocking**: Mock external dependencies (API, router)
5. **Isolation**: Each test is independent
6. **Descriptive Names**: Clear test descriptions
7. **Arrange-Act-Assert**: Structure tests clearly
8. **Edge Cases**: Test loading, error, empty states

## Common Patterns

### Loading State

```typescript
it('shows loading spinner while fetching', () => {
  mockTRPC.codebases.list.useQuery.mockReturnValueOnce({
    data: null,
    isLoading: true,
    error: null,
  });

  render(<CodebaseList />);

  expect(screen.getByRole('progressbar')).toBeInTheDocument();
});
```

### Error State

```typescript
it('displays error message on failure', () => {
  mockTRPC.codebases.list.useQuery.mockReturnValueOnce({
    data: null,
    isLoading: false,
    error: { message: 'Network error' },
  });

  render(<CodebaseList />);

  expect(screen.getByText(/network error/i)).toBeInTheDocument();
});
```

### Empty State

```typescript
it('shows empty state when no data', () => {
  mockTRPC.codebases.list.useQuery.mockReturnValueOnce({
    data: [],
    isLoading: false,
    error: null,
  });

  render(<CodebaseList />);

  expect(screen.getByText(/no codebases found/i)).toBeInTheDocument();
});
```

## Running Tests

```bash
# Run all tests
pnpm test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage

# Specific file
pnpm test CodebaseList.test.tsx
```

## Additional Resources

See **`references/testing-patterns.md`** for advanced testing scenarios including integration tests, E2E patterns, and performance testing.

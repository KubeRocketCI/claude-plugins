---
name: Testing Standards
description: This skill should be used when the user asks to "write tests", "test component", "add unit tests", "Vitest", "Testing Library", "test coverage", "testing patterns", "mock", "mocking", or mentions testing, test implementation, or quality assurance for frontend code.
---

Orientation guide for testing in the KubeRocketCI portal -- toolchain, conventions, test providers, and what gets tested where.

## Testing Philosophy

**Test behavior from the user's perspective**, not implementation details. Focus on what the user sees and interacts with. Avoid testing internal state, private methods, or component internals.

**Accessibility-first queries**: prefer `getByRole`, `getByLabelText`, `getByText` over `getByTestId` or DOM selectors.

## Toolchain

| Tool | Purpose | Package |
|------|---------|---------|
| Vitest | Test runner, assertions, mocking | root + all packages |
| React Testing Library | Component rendering and queries | `@testing-library/react` |
| User Event | User interaction simulation | `@testing-library/user-event` |
| jest-dom matchers | DOM assertion extensions | `@testing-library/jest-dom/vitest` |
| Storybook 10 | Visual component testing and development | `storybook`, `@storybook/react-vite` |

**Not in the stack**: MSW (Mock Service Worker) is not installed. API mocking is done via `vi.mock()` on tRPC client objects. There is no `@testing-library/react-hooks` -- `renderHook` is exported directly from `@testing-library/react`.

## Test Strategy: What Gets Tested Where

The portal uses a **split testing strategy** defined in the root `vitest.config.ts`:

| What | Tool | Coverage tracked? |
|------|------|------------------|
| Utility functions, pure logic | Vitest unit tests | Yes |
| Custom hooks (data fetching, business logic) | Vitest with `renderHook` | Yes |
| React components (rendering, interactions) | **Storybook** stories | No (excluded: `**/*.tsx`) |
| Server routes, procedures | Vitest unit tests | Yes |

**Key insight**: All `.tsx` files are **excluded from Vitest coverage**. Components are tested through Storybook stories, not Vitest unit tests. Vitest coverage tracks `.ts` files only: utilities, hooks, services, and server code.

Other coverage exclusions include: route files, type definitions, constants, config files, schemas, context files, barrel exports, and certain UI-only hooks (useTabs, useFilter, useColumns). Read `vitest.config.ts` at the repo root for the full exclusion list.

## Workspace Configuration

Tests run as a **Vitest workspace** with separate configs per package:

- Root: `vitest.workspace.ts` -- includes `apps/*` and `packages/*`
- Client: `apps/client/vitest.config.ts` -- jsdom environment, setup file
- Server: `apps/server/vitest.config.ts` -- jsdom environment
- Coverage: root `vitest.config.ts` -- Istanbul provider, exclusions

The client setup file (`apps/client/src/test/setup.ts`) provides:

- `@testing-library/jest-dom/vitest` matchers
- Automatic `cleanup()` after each test
- Global `localStorage` mock with Map-backed storage
- Global `ResizeObserver` mock

## TestProviders Wrapper

The portal has a reusable `TestProviders` component for wrapping components under test with all necessary providers. It is located at `apps/client/src/test/utils/providers.tsx`.

`TestProviders` wraps children with:

- `TRPCContext.Provider` (with the HTTP tRPC client)
- `QueryClientProvider` (with a test-configured QueryClient)
- `RouterProvider` (TanStack Router with memory history)
- Cluster store setup (via Zustand `setState`)

### Configuration Options

| Option | Default | Purpose |
|--------|---------|---------|
| `contentWrapper` | none | Wrap content with additional providers (e.g., FilterProvider) |
| `seedQueryCache` | none | Pre-populate React Query cache with mock data |
| `enableMultiNamespace` | `true` | Set up multiple namespaces in cluster store |
| `clusterName` | `"in-cluster"` | Cluster name for tests |
| `defaultNamespace` | `"default"` | Default namespace |
| `allowedNamespaces` | `["default", "development", "staging", "production"]` | Namespace list |
| `queryClient` | auto-created | Custom QueryClient instance |

Import from `@/test/utils`:

```typescript
import { TestProviders, createTestQueryClient, mockPermissions } from "@/test/utils";
```

### Storybook Sharing

Storybook uses the same `TestProviders` under the hood. The `withAppProviders` decorator in `.storybook/decorators.tsx` wraps stories with `TestProviders`, ensuring stories and tests share identical provider setup.

## Test File Conventions

- Test files are colocated with source: `index.test.ts` next to `index.ts`, or `view.test.tsx` next to `view.tsx`
- Use `describe` blocks to group by behavior category (rendering, interactions, error states)
- Use `vi.mock()` at module level, `vi.fn()` for individual function mocks
- Use `vi.hoisted()` when mock state needs to be accessible in `vi.mock()` factory functions
- Call `vi.clearAllMocks()` in `beforeEach` to reset between tests

## Running Tests

```bash
# All tests with coverage
pnpm test:coverage

# Watch mode for a specific package
pnpm --filter=client test -- --watch

# Single file
pnpm --filter=client test -- src/path/to/file.test.ts
```

## Mocking Patterns

The most common mocking scenarios involve tRPC clients, Zustand stores, and K8s hooks. These patterns are genuinely hard to derive from code alone.

See **`references/testing-patterns.md`** for detailed mocking patterns covering:

- tRPC client mocking (creating mock client objects)
- Zustand store mocking (using `vi.hoisted` + `vi.mock`)
- Permission hook mocking
- Real test examples from the codebase

## Discovery Instructions

| What | Where to find it |
|------|-----------------|
| TestProviders implementation | `apps/client/src/test/utils/providers.tsx` |
| Test utilities barrel export | `apps/client/src/test/utils/index.ts` |
| Test QueryClient factory | `apps/client/src/test/utils/query-client.ts` |
| Test constants (cluster, namespace, permissions) | `apps/client/src/test/utils/constants.ts` |
| Setup file (mocks, matchers) | `apps/client/src/test/setup.ts` |
| Client vitest config | `apps/client/vitest.config.ts` |
| Root coverage config | `vitest.config.ts` |
| Root workspace config | `vitest.workspace.ts` |
| Storybook config | `apps/client/.storybook/` |
| Storybook decorators (uses TestProviders) | `apps/client/.storybook/decorators.tsx` |
| Example hook test | `apps/client/src/k8s/api/hooks/usePermissions/index.test.tsx` |
| Example component test | `apps/client/src/core/components/Table/Table.test.tsx` |
| Server test examples | `apps/server/src/config/` (env-utils, development, production) |
| tRPC test examples | `packages/trpc/src/routers/auth/procedures/` |
| tRPC mocks for server tests | `packages/trpc/src/__mocks__/` |

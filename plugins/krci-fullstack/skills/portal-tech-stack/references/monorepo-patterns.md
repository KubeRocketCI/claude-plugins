# Monorepo Patterns Reference

Read this when you need specific guidance on code placement, barrel exports, or cross-package imports.

## Shared Package Export Convention

The shared package (`packages/shared/`) uses a single barrel export at `src/index.ts`. All public API must be re-exported through this file. The package builds to `dist/` via `tsc`.

Consumers import from the package name, not from internal paths:

```typescript
// Correct
import { SomeType, someUtil } from "@my-project/shared";

// Incorrect - bypasses barrel, breaks when internal structure changes
import { SomeType } from "@my-project/shared/models/k8s/SomeType";
```

The tRPC package follows the same pattern -- single barrel at `packages/trpc/src/index.ts`.

To see what the shared package currently exports, read `packages/shared/src/index.ts` and follow its re-exports.

## Cross-Package Import Rules

| From | To shared | To trpc | To client | To server |
|------|-----------|---------|-----------|-----------|
| **client** | `@my-project/shared` | Type-only via `@my-project/trpc` | `@/*` alias | Never |
| **server** | `@my-project/shared` | `@my-project/trpc` | Never | Internal |
| **trpc** | `@my-project/shared` | Internal | Never | Never |
| **shared** | Internal | Never | Never | Never |

The client never imports from server. The server never imports from client. These boundaries are enforced by the TypeScript project references.

## Common Anti-Patterns

| Anti-Pattern | Why It Breaks | Correct Approach |
|-------------|---------------|------------------|
| Importing from `@my-project/shared/models/foo` | Internal path; not part of public API | Import from `@my-project/shared` |
| Putting React components in `packages/shared/` | Shared has no React dependency | Keep React code in `apps/client/` |
| Importing server code from client | Server is not bundled for browser | Use tRPC for all client-server communication |
| Using relative paths across package boundaries | Breaks when directory structure changes | Use package name imports |
| Adding client-only types to shared | Bloats shared package for server | Keep in `apps/client/src/types/` |

## When to Add to Shared vs Keep Local

Add to `packages/shared/` when:

- A Zod schema can be validated on both server and client
- A TypeScript interface describes K8s resource shape that can be used in tRPC input/output
- A utility function can be called by both server-side and client-side code
- Constants or enums are referenced in both packages

Keep in the consuming package when:

- Only one side (client or server) uses it
- It depends on React, DOM APIs, or Node.js-specific APIs
- It is a UI helper, formatting function, or component utility

## Build and Development

The dev script runs all four builds concurrently with watch mode:

```bash
pnpm dev
```

Build order for production: `shared` -> `trpc` -> `server` + `client`. This is encoded in the root `package.json` build script.

When adding new exports to shared or trpc, the consuming packages pick them up automatically in dev mode (watch mode rebuilds). For type changes, the client/server TypeScript compiler needs the `dist/` output to be up to date.

## Discovery Instructions

- Workspace configuration: `pnpm-workspace.yaml`
- Root tsconfig with path aliases: `tsconfig.json`
- Client tsconfig (overrides paths for dist): `apps/client/tsconfig.json`
- Build scripts: root `package.json` scripts section
- Shared package public API: `packages/shared/src/index.ts`
- tRPC package public API: `packages/trpc/src/index.ts`

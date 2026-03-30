---
name: Portal Tech Stack
description: This skill should be used when the user asks about "tech stack", "what framework", "what libraries", "monorepo structure", "project architecture", "authentication system", "how packages connect", "import paths", "shared package", or needs context about the KubeRocketCI portal's technology choices, monorepo organization, package roles, or architectural decisions. Covers the entire portal monorepo (client, server, shared, tRPC packages), not just the frontend.
---

Orientation guide for the KubeRocketCI portal's technology stack, monorepo architecture, and authentication system.

## Monorepo Architecture

The portal is a **pnpm workspace** monorepo with four packages. The build order matters because packages depend on each other.

**Build order**: `shared` -> `trpc` -> `server` + `client` (parallel)

| Package | npm name | Role |
|---------|----------|------|
| `packages/shared/` | `@my-project/shared` | Types, Zod schemas, K8s resource models, shared utilities |
| `packages/trpc/` | `@my-project/trpc` | tRPC router definitions, procedures, K8s/OIDC clients |
| `apps/server/` | `@my-project/server` | Fastify BFF server, session management, WebSocket proxy |
| `apps/client/` | `@my-project/client` | React SPA, all UI code |

### Dependency Graph

- `shared` depends on nothing internal (only `zod`, `uuid`)
- `trpc` depends on `shared` (for types/schemas) plus `@trpc/server`, `@kubernetes/client-node`, `openid-client`
- `server` depends on `shared` + `trpc` (mounts the tRPC router on Fastify)
- `client` depends on `shared` only at runtime (imports types/models); uses `trpc` types at build time for type inference

### Import Aliases

Each package has its own `tsconfig.json` that extends the root. The **client** uses:

- `@/*` maps to `apps/client/src/*` (project-internal imports)
- `@my-project/shared` maps to `packages/shared/dist` (shared package)
- `@my-project/trpc` maps to `packages/trpc/dist` (type inference only)

To verify current alias configuration, read `apps/client/tsconfig.json` and the root `tsconfig.json`.

### Package Manager

Always use **pnpm**. The workspace is defined in `pnpm-workspace.yaml`. Filtering example: `pnpm --filter=client dev`.

## Tech Stack by Package

### Client (`apps/client/`)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | React + TypeScript + Vite | |
| Routing | TanStack Router | Type-safe, code-split via `route.ts` + `route.lazy.tsx` |
| Server state | TanStack React Query + tRPC Client | React Query v5, tRPC v11 |
| Client state | Zustand | Lightweight stores (cluster, UI state) |
| Forms | TanStack Form + Zod adapter | New forms only; legacy wizards may still use React Hook Form |
| UI primitives | Radix UI | Accordion, Dialog, Select, Tabs, Tooltip, etc. |
| Styling | Tailwind CSS v4 | Utility-first; custom design tokens |
| Component variants | class-variance-authority (CVA) | Used with `cn()` utility |
| Icons | Lucide React | |
| Component dev | Storybook 10 | Stories in `*.stories.tsx`; uses shared `TestProviders` |
| Testing | Vitest + React Testing Library | See testing-standards skill |

### Server (`apps/server/`)

| Layer | Technology | Notes |
|-------|------------|-------|
| Framework | Fastify + TypeScript | |
| API | tRPC Server | Mounted on Fastify |
| Auth | OIDC via `openid-client` + `jose` | Keycloak integration |
| Sessions | `better-sqlite3` + `@fastify/session` | HTTP-only cookies |
| Build | esbuild | Fast server compilation |
| Real-time | `@fastify/websocket` | K8s resource watch proxying |

### Shared (`packages/shared/`)

Contains only code needed by **both** client and server. Explore `packages/shared/src/` for current structure. Key areas:

- `models/` -- K8s resource type definitions, draft creators, schemas
- `interfaces/` -- Client configuration interfaces
- `utils/` -- Shared utility functions (versioning, encoding, sorting)

### tRPC Package (`packages/trpc/`)

Defines the full tRPC router used by both server (execution) and client (type inference). Key areas:

- `routers/` -- auth, config, k8s, sonarqube, dependencyTrack, tektonResults, gitfusion
- `procedures/` -- public and protected procedure builders
- `clients/` -- K8s client, OIDC client wrappers
- `context/` -- Request context creation (session, user)

## Code Placement Decision Framework

| Question | Place in |
|----------|----------|
| Is it a React component, hook, or UI utility? | `apps/client/src/` |
| Is it a server endpoint, middleware, or server config? | `apps/server/src/` |
| Is it a tRPC router, procedure, or server-side client? | `packages/trpc/src/` |
| Is it a TypeScript type, Zod schema, or utility used by both client and server? | `packages/shared/src/` |
| Not sure? | Check if the server imports it. If only client uses it, keep it in client. |

### Client Source Layout

The client uses a module-based organization:

- `core/` -- Shared components, hooks, providers, router, auth, utilities
- `modules/` -- Feature modules (home, platform, tours)
- `k8s/` -- Kubernetes API integration (watch hooks, CRUD hooks, resource groups)
- `test/` -- Test utilities (`TestProviders`, `createTestQueryClient`, constants)
- `types/` -- Global type declarations

To discover the full layout, run `ls apps/client/src/` and explore subdirectories.

## Authentication System

### Architecture

Authentication uses server-side OIDC with Keycloak. Tokens never reach the browser -- the server stores them in a SQLite session database and issues HTTP-only session cookies.

### Flow

1. **Login**: Client calls `trpc.auth.login.mutate()` -> server returns Keycloak authorization URL
2. **Redirect**: Browser navigates to Keycloak, user authenticates
3. **Callback**: Keycloak redirects to `/auth/callback` with authorization code
4. **Token exchange**: Client calls `trpc.auth.loginCallback.mutate()` -> server exchanges code for tokens, creates session, returns user info
5. **Session**: All subsequent tRPC calls carry the session cookie automatically
6. **Token login**: Alternative flow via `trpc.auth.loginWithToken.mutate()` for direct token authentication

### Security Conventions

- Tokens stored **server-side only** (SQLite via `better-sqlite3`)
- Sessions use **HTTP-only cookies** (prevents XSS token theft)
- `auth.me` query runs on app load + refetches every 60s + on window focus
- Auth state is managed via React Query cache (key: `["auth.me"]`)
- Root route `beforeLoad` guard redirects unauthenticated users to `/auth/login`

### Discovery Instructions

- Auth provider and context: `apps/client/src/core/auth/provider/`
- `useAuth` hook: `apps/client/src/core/auth/provider/hooks.ts`
- Auth pages (login, callback): `apps/client/src/core/auth/pages/`
- Server auth router: `packages/trpc/src/routers/auth/`
- OIDC client wrapper: `packages/trpc/src/clients/`
- Shared auth models: `packages/shared/src/models/auth/`
- Root route auth guard: `apps/client/src/core/router/_root.ts`
- Cluster store (initialized from server config): `apps/client/src/k8s/store/`

## Version Management

Never assume dependency versions. Check `package.json` files in the relevant package before generating code. Key version-sensitive libraries: TanStack Router, TanStack React Query, tRPC, Radix UI, Tailwind CSS.

## Additional Reference

See **`references/monorepo-patterns.md`** when you need guidance on barrel export conventions, common anti-patterns, or the shared package's export structure.

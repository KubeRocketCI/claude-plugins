# Authentication Integration Reference

Read this when implementing auth-related features or debugging authentication flow.

## Auth Flow Architecture

The portal uses **server-side OIDC** with Keycloak. The browser never sees tokens -- all token handling happens on the server. The client only deals with session cookies.

### Flow Diagram

```
User -> /auth/login -> trpc.auth.login.mutate() -> Server returns Keycloak URL
     -> Browser redirects to Keycloak -> User authenticates
     -> Keycloak redirects to /auth/callback?code=...&state=...
     -> trpc.auth.loginCallback.mutate(searchParams) -> Server exchanges code for tokens
     -> Server creates session in SQLite, sets HTTP-only cookie
     -> Client receives user info, stores in React Query cache ["auth.me"]
     -> Client navigates to original destination (or /home)
```

### Alternative: Token Login

For scenarios where a token is already available (e.g., service account access):

```
trpc.auth.loginWithToken.mutate({ token, redirectSearchParam })
  -> Server validates token, creates session
  -> Client receives user info, navigates
```

## Security Conventions

- **Session storage**: SQLite database via `better-sqlite3` (server-side only)
- **Cookie**: HTTP-only, set by `@fastify/session` -- not accessible to JavaScript
- **Token refresh**: Server handles automatically; client just uses session cookie
- **Session validation**: `auth.me` query refetches every 60 seconds + on window focus
- **Auth guard**: Root route `beforeLoad` checks auth state and redirects to `/auth/login` if unauthenticated

## Client-Side Auth State

Auth state lives in React Query cache, not in a Zustand store:

- Query key: `["auth.me"]` -- holds user info when authenticated
- `AuthProvider` wraps the app and manages login/logout mutations
- `useAuth()` hook provides: `user`, `isAuthenticated`, `isLoading`, `loginMutation`, `logoutMutation`
- Auth in-progress state uses query cache keys `["authInProgress"]` and `["authLogoutInProgress"]`

## Server Config Integration

On startup, `AuthProvider` also fetches server configuration (`trpc.config.get.query()`), which provides:

- Cluster name
- Default namespace
- Security tool URLs (SonarQube, DependencyTrack)

This data is stored in the Zustand `clusterStore`, not in React Query.

## Discovery Instructions

| What | Where to find it |
|------|-----------------|
| AuthProvider implementation | `apps/client/src/core/auth/provider/provider.tsx` |
| AuthContext type definition | `apps/client/src/core/auth/provider/context.ts` |
| useAuth hook | `apps/client/src/core/auth/provider/hooks.ts` |
| Login page | `apps/client/src/core/auth/pages/login/` |
| Callback page (route + view) | `apps/client/src/core/auth/pages/callback/` |
| Root route auth guard | `apps/client/src/core/router/_root.ts` |
| Server auth tRPC router | `packages/trpc/src/routers/auth/` |
| OIDC client wrapper | `packages/trpc/src/clients/` |
| Session/token mocks for testing | `packages/trpc/src/__mocks__/` |
| Shared auth models | `packages/shared/src/models/auth/` |
| Cluster store (server config) | `apps/client/src/k8s/store/` |

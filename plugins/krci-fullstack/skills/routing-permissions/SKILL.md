---
name: Routing and Permissions
description: This skill should be used when the user asks to "add route", "create page", "implement navigation", "add permissions", "RBAC", "permission check", "protect route", or mentions routing, navigation, breadcrumbs, or role-based access control.
---

Orientation guide for the KubeRocketCI portal's routing architecture (TanStack Router), permission system (K8s RBAC), and page layout conventions.

## Routing Architecture

The portal uses **TanStack Router** with a manually assembled route tree (not file-based generation). Routes are defined in colocated `route.ts` files and registered centrally.

### Route Hierarchy

All portal URLs follow a cluster-scoped pattern:

```
/                        -> redirects to /home
/home                    -> home page (outside cluster scope)
/auth/login              -> login page
/auth/callback           -> OIDC callback
/c/$clusterName/...      -> all cluster-scoped pages
```

The cluster segment `/c/$clusterName` is a route parameter. Under it, sub-routes are grouped by domain:

- `/c/$clusterName/projects` -- codebases
- `/c/$clusterName/cicd/...` -- pipelines, tasks, pipeline runs
- `/c/$clusterName/configuration/...` -- ArgoCD, GitServers, etc.
- `/c/$clusterName/security/...` -- Trivy, SAST, SCA
- `/c/$clusterName/observability/...` -- pipeline metrics

### Route Definition Pattern

Each page has two files: `route.ts` (route config, always loaded) and `route.lazy.tsx` (component, lazy-loaded).

**`route.ts`** -- defines the route, its parent, path, and metadata:

```typescript
import { createRoute } from "@tanstack/react-router";
import { routeConfiguration } from "@/core/router/routes";

export const PATH_CONFIG_ARGOCD = "argocd" as const;
export const PATH_CONFIG_ARGOCD_FULL = "/c/$clusterName/configuration/argocd" as const;
export const ROUTE_ID_CONFIG_ARGOCD = "/_layout/c/$clusterName/configuration/argocd" as const;

export const routeArgocdConfiguration = createRoute({
  getParentRoute: () => routeConfiguration,
  path: PATH_CONFIG_ARGOCD,
  head: () => ({
    meta: [{ title: "ArgoCD Configuration | KRCI" }],
  }),
}).lazy(() => import("./route.lazy").then((res) => res.default));
```

**`route.lazy.tsx`** -- defines the component (code-split):

```typescript
import { createLazyRoute } from "@tanstack/react-router";
import { ROUTE_ID_CONFIG_ARGOCD } from "./route";
import ArgocdConfigurationPage from "./view";

const ArgocdConfigurationRoute = createLazyRoute(ROUTE_ID_CONFIG_ARGOCD)({
  component: ArgocdConfigurationPage,
});

export default ArgocdConfigurationRoute;
```

Key conventions:

- Export three constants: `PATH_*` (relative segment), `PATH_*_FULL` (full path pattern), `ROUTE_ID_*` (internal route ID including layout prefix)
- The route ID includes the `/_layout` prefix because routes sit under `contentLayoutRoute` which has `id: "_layout"`
- Use `createRoute().lazy()` chaining -- the route definition calls `.lazy()` and the lazy file uses `createLazyRoute(ROUTE_ID)()`
- The actual page component lives in `view.tsx` next to the route files

### Route Tree Registration

All routes must be registered in `apps/client/src/core/router/index.ts`. This file imports every route and builds the tree using `.addChildren()`. To add a new route:

1. Create `route.ts` and `route.lazy.tsx` in the page directory
2. Create `view.tsx` with the page component
3. Import the route in `core/router/index.ts`
4. Add it to the correct position in the `routeTree`

### Parent Route Objects

Parent routes are defined in `apps/client/src/core/router/routes.ts`:

- `rootRoute` -- root of the tree (in `_root.ts`)
- `authRoute` -- parent for `/auth/*`
- `contentLayoutRoute` -- layout wrapper for authenticated pages
- `routeCluster` -- parent for `/c/$clusterName/*`
- `routeCICD`, `routeConfiguration`, `routeSecurity`, `routeObservability` -- domain grouping routes

### Authentication Guard

The root route (`_root.ts`) has a `beforeLoad` hook that:

- Checks if auth data exists in React Query cache
- If not authenticated and not on auth pages, redirects to `/auth/login` with `redirect` search param
- If authenticated and on login page, redirects to `/`

## PageWrapper and Breadcrumbs

Pages use the `PageWrapper` component for consistent layout with breadcrumb navigation. Breadcrumbs are **not** automatic -- each page explicitly passes them.

```typescript
<PageWrapper
  breadcrumbs={[
    {
      label: "Projects",
      route: { to: routeProjectList.fullPath },
    },
    {
      label: params.name,
    },
  ]}
  headerSlot={<PageGuideButton tourId="projectDetailsTour" />}
>
  {/* page content */}
</PageWrapper>
```

Each breadcrumb has a `label` (string or ReactElement) and an optional `route` (with `to`, `params`, `search` matching TanStack Router's `LinkProps`). The last breadcrumb typically has no route (current page).

`PageWrapper` also accepts `headerSlot` (rendered in the breadcrumb bar, right side) and `breadcrumbsExtraContent`.

Discovery: read `apps/client/src/core/components/PageWrapper/types.ts` for the full `Breadcrumb` and `PageWrapperProps` interfaces.

## Permission System

Permissions are checked against **Kubernetes RBAC** at runtime via the server. The portal does not use Keycloak roles for resource-level authorization.

### usePermissions Hook

The core hook is `usePermissions` at `apps/client/src/k8s/api/hooks/usePermissions/`. It takes a K8s resource descriptor and returns permission results:

```typescript
const permissions = usePermissions({
  group: "v2.edp.epam.com",
  version: "v1",
  resourcePlural: "codebases",
});

// permissions.data has shape:
// { create: { allowed: boolean, reason: string },
//   patch:  { allowed: boolean, reason: string },
//   delete: { allowed: boolean, reason: string } }
```

The hook calls `trpc.k8s.itemPermissions.mutate()` server-side, which performs a `SelfSubjectAccessReview` against the K8s API. Results are cached with `staleTime: Infinity`.

### ButtonWithPermission

For permission-gated actions, use the `ButtonWithPermission` component:

```typescript
<ButtonWithPermission
  allowed={permissions.data.create.allowed}
  reason={permissions.data.create.reason}
  ButtonProps={{ variant: "default", onClick: handleCreate }}
>
  Create Project
</ButtonWithPermission>
```

When `allowed` is false, the button is disabled and wrapped in a tooltip showing the `reason`.

Discovery: read `apps/client/src/core/components/ButtonWithPermission/index.tsx` for the full component API.

### Permission Conventions

- Always check permissions before rendering action buttons (create, edit, delete)
- Use `ButtonWithPermission` rather than hiding buttons -- show disabled state with reason
- Permission data comes with `placeholderData: defaultPermissions` so UI renders immediately (all denied by default until resolved)
- The hook uses cluster name and namespace from the Zustand `clusterStore`

## Discovery Instructions

| What | Where to find it |
|------|-----------------|
| Route tree assembly | `apps/client/src/core/router/index.ts` |
| Parent routes (routeCluster, etc.) | `apps/client/src/core/router/routes.ts` |
| Root route with auth guard | `apps/client/src/core/router/_root.ts` |
| Route type definitions (RoutePath, etc.) | `apps/client/src/core/router/types.ts` |
| PageWrapper component | `apps/client/src/core/components/PageWrapper/` |
| Breadcrumb types | `apps/client/src/core/components/PageWrapper/types.ts` |
| usePermissions hook | `apps/client/src/k8s/api/hooks/usePermissions/` |
| ButtonWithPermission | `apps/client/src/core/components/ButtonWithPermission/` |
| Default permissions shape | `@my-project/shared` -- `defaultPermissions` export |
| Example page with breadcrumbs | `apps/client/src/modules/platform/codebases/pages/details/view.tsx` |
| Example route pair | `apps/client/src/modules/platform/configuration/modules/argocd/route.ts` + `route.lazy.ts` |

## Additional Reference

See **`references/navigation-patterns.md`** for portal-specific navigation conventions.

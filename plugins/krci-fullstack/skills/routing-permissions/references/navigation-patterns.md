# Navigation Patterns Reference

Read this when implementing navigation, link components, or programmatic routing within the portal.

## Programmatic Navigation

Use TanStack Router's typed navigation. Import the router instance or use hooks:

```typescript
import { useNavigate } from "@tanstack/react-router";

const navigate = useNavigate();

// Navigate to a typed route
navigate({ to: "/c/$clusterName/projects", params: { clusterName } });

// Navigate with search params
navigate({ to: "/c/$clusterName/projects", params: { clusterName }, search: { page: 1 } });
```

For navigation outside React components (e.g., in mutation callbacks), the `router` instance is exported from `apps/client/src/core/router/index.ts`:

```typescript
import { router } from "@/core/router";
router.navigate({ to: "/home", replace: true });
```

## Link Component

Use TanStack Router's `Link` for declarative navigation. It provides type-safe `to` and `params`:

```typescript
import { Link } from "@tanstack/react-router";

<Link to="/c/$clusterName/projects" params={{ clusterName }}>
  Projects
</Link>
```

The portal wraps `Link` inside Radix UI's `Button` with `asChild` for styled navigation buttons. See the `PageWrapper` breadcrumb implementation for this pattern.

## Route Parameters and Search Params

Access route params via the route instance's `useParams()`:

```typescript
const params = routeProjectDetails.useParams();
// params.clusterName, params.name - typed from route definition
```

For search params, define `validateSearch` in the route definition. See the auth callback route for an example (`apps/client/src/core/auth/pages/callback/route.ts`).

## Sidebar Navigation

The sidebar navigation configuration is separate from the route tree. To find how sidebar items are defined and linked to routes, explore:

- `apps/client/src/core/components/` -- look for sidebar or navigation menu components
- The sidebar uses Radix UI's NavigationMenu primitives

## Route Type Safety

The portal exports `RoutePath` and `RouteParams` types from `apps/client/src/core/router/types.ts`:

- `RoutePath` -- union of all valid route paths (derived from the router instance)
- `RouteParams` -- typed link props matching all registered routes

These types ensure navigation targets are validated at compile time.

## Content Layout

Authenticated pages are wrapped by `contentLayoutRoute`, which renders the `PageLayout` component (sidebar + main content area). The `PageLayout` component is assigned in `core/router/index.ts` to avoid circular imports.

Pages within the content layout use `PageWrapper` for breadcrumbs (see SKILL.md) and `PageContentWrapper` for consistent content padding.

## Discovery Instructions

- Router instance and route tree: `apps/client/src/core/router/index.ts`
- PageLayout (sidebar + content shell): `apps/client/src/core/components/PageLayout/`
- PageContentWrapper: `apps/client/src/core/components/PageContentWrapper/`
- Sidebar/navigation config: explore `apps/client/src/core/components/` for navigation-related components

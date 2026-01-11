---
name: Routing and Permissions
description: This skill should be used when the user asks to "add route", "create page", "implement navigation", "add permissions", "RBAC", "permission check", "protect route", or mentions routing, navigation, breadcrumbs, or role-based access control.
version: 0.1.0
---

Implement routing, navigation, and RBAC permission patterns for the KubeRocketCI portal using TanStack Router and custom permission hooks.

## Purpose

Guide route creation, navigation integration, and permission-based access control following portal's patterns.

## Routing Stack

- **TanStack Router**: File-based, type-safe routing with built-in navigation
- **Permission Hooks**: RBAC integration for route and action protection

## Route Creation

### Define Route

```typescript
// apps/client/src/modules/platform/codebases/pages/codebase-list/route.ts
import { createRoute } from '@tanstack/react-router';
import { rootRoute } from '@/core/router';

export const codebaseListRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codebases',
  component: () => import('./page').then(m => m.CodebaseListPage),
});
```

### Lazy Loading

```typescript
// route.lazy.ts
import { createLazyRoute } from '@tanstack/react-router';

export const Route = createLazyRoute('/codebases')({
  component: CodebaseListPage,
});
```

### Route with Parameters

```typescript
export const codebaseDetailsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/codebases/$name',
  component: () => import('./page').then(m => m.CodebaseDetailsPage),
});

// Access parameter in component
const CodebaseDetailsPage = () => {
  const { name } = useParams({ from: '/codebases/$name' });
  const { data: codebase } = trpc.codebases.getByName.useQuery({ name });

  return <CodebaseView codebase={codebase} />;
};
```

## Navigation

### Programmatic Navigation

```typescript
import { useNavigate } from '@tanstack/react-router';

const Component = () => {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate({ to: '/codebases/create' });
  };

  const handleViewDetails = (name: string) => {
    navigate({ to: '/codebases/$name', params: { name } });
  };

  return <Button onClick={handleCreate}>Create</Button>;
};
```

### Link Navigation

```typescript
import { Link } from '@tanstack/react-router';

const CodebaseList = ({ codebases }: { codebases: Codebase[] }) => {
  return (
    <List>
      {codebases.map(codebase => (
        <Link
          to="/codebases/$name"
          params={{ name: codebase.metadata.name }}
          key={codebase.metadata.name}
        >
          {codebase.metadata.name}
        </Link>
      ))}
    </List>
  );
};
```

## Breadcrumbs

### Implement Breadcrumbs

```typescript
const CodebaseDetailsPage = () => {
  const { name } = useParams();

  return (
    <>
      <nav className="flex items-center space-x-2 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground">
          Home
        </Link>
        <span className="text-muted-foreground">/</span>
        <Link to="/codebases" className="text-muted-foreground hover:text-foreground">
          Codebases
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-foreground">{name}</span>
      </nav>
      <CodebaseDetails name={name} />
    </>
  );
};
```

## Permission System

### Permission Hook Pattern

```typescript
// Create permission hook for resource
import { createUsePermissionsHook } from '@/core/permissions/createUsePermissionsHook';

export const useCodebasePermissions = createUsePermissionsHook({
  resource: 'codebases',
  apiVersion: 'v2.edp.epam.com/v1',
  kind: 'Codebase',
});
```

### Use Permissions in Components

```typescript
const CodebaseList = () => {
  const permissions = useCodebasePermissions();

  return (
    <>
      <ButtonWithPermission
        allowed={permissions.data?.create.allowed}
        reason={permissions.data?.create.reason}
        ButtonProps={{
          variant: 'default',
          onClick: () => navigate({ to: '/codebases/create' }),
        }}
      >
        Create Codebase
      </ButtonWithPermission>
      <CodebaseTable />
    </>
  );
};
```

### Resource-Level Permissions

```typescript
const CodebaseActionsMenu = ({ codebase }: { codebase: Codebase }) => {
  const permissions = useCodebasePermissions(codebase);

  return (
    <Menu>
      <ButtonWithPermission
        allowed={permissions.data?.update.allowed}
        reason={permissions.data?.update.reason}
        ButtonProps={{ onClick: () => handleEdit(codebase) }}
      >
        Edit
      </ButtonWithPermission>
      <ButtonWithPermission
        allowed={permissions.data?.delete.allowed}
        reason={permissions.data?.delete.reason}
        ButtonProps={{
          onClick: () => handleDelete(codebase),
          variant: 'destructive',
        }}
      >
        Delete
      </ButtonWithPermission>
    </Menu>
  );
};
```

## Protected Routes

### Auth Guard

```typescript
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <>{children}</>;
};
```

### Permission-Based Route Access

```typescript
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();

  if (!user?.roles.includes('admin')) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};
```

## Navigation Integration

### Sidebar Navigation

```typescript
const AppSidebar = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Overview', path: '/', icon: DashboardIcon },
    { label: 'Codebases', path: '/codebases', icon: CodeIcon },
    { label: 'Pipelines', path: '/pipelines', icon: PipelineIcon },
  ];

  return (
    <Sidebar>
      {navItems.map(item => (
        <SidebarItem
          key={item.path}
          onClick={() => navigate({ to: item.path })}
          icon={<item.icon />}
        >
          {item.label}
        </SidebarItem>
      ))}
    </Sidebar>
  );
};
```

## Query Parameters

### Read Query Params

```typescript
const CodebaseList = () => {
  const { search } = useSearch({ from: '/codebases' });

  return (
    <FilterInput
      value={search || ''}
      onChange={(value) => {
        navigate({
          to: '/codebases',
          search: { search: value },
        });
      }}
    />
  );
};
```

### Update Query Params

```typescript
const updateFilter = (filter: Filter) => {
  navigate({
    search: (prev) => ({ ...prev, ...filter }),
  });
};
```

## Permission Patterns

### ButtonWithPermission

```typescript
<ButtonWithPermission
  allowed={permissions.data?.create.allowed}
  reason={permissions.data?.create.reason}  // Tooltip when not allowed
  ButtonProps={{
    variant: 'default',
    onClick: handleAction,
  }}
>
  Action Label
</ButtonWithPermission>
```

### Conditional Rendering

```typescript
const Component = () => {
  const permissions = useResourcePermissions();

  return (
    <>
      {permissions.data?.update.allowed && (
        <EditButton onClick={handleEdit} />
      )}
      {permissions.data?.delete.allowed && (
        <DeleteButton onClick={handleDelete} />
      )}
    </>
  );
};
```

## Best Practices

1. **Type-Safe Routes**: Use TanStack Router for type safety
2. **Lazy Loading**: Use lazy routes for code splitting
3. **Permission Checks**: Always validate permissions for actions
4. **Loading States**: Handle loading state for permission checks
5. **Error Boundaries**: Wrap routes in error boundaries
6. **Breadcrumbs**: Provide clear navigation context
7. **Query Params**: Use for filters and search
8. **Protected Routes**: Guard routes requiring authentication

## RBAC Integration

### Keycloak Roles

Portal integrates with Keycloak for role-based access:

```typescript
// User roles from Keycloak
const { user } = useAuth();
const isAdmin = user?.roles.includes('admin');
const isDeveloper = user?.roles.includes('developer');
```

### Resource Permissions

K8s RBAC determines resource-level permissions:

```typescript
// Check via permission hook
const permissions = useCodebasePermissions(codebase);

// Allowed actions based on K8s RBAC
const canCreate = permissions.data?.create.allowed;
const canUpdate = permissions.data?.update.allowed;
const canDelete = permissions.data?.delete.allowed;
```

## Additional Resources

See **`references/navigation-patterns.md`** for complex navigation scenarios including nested routes, route guards, and dynamic breadcrumbs.

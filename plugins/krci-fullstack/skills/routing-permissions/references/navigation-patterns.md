# Navigation Patterns

Advanced navigation and routing patterns for TanStack Router in the KubeRocketCI portal.

## Nested Routes

Create hierarchical route structures:

```typescript
// Parent route: /settings
export const SettingsRoute = createLazyRoute('/settings')({
  component: SettingsLayout,
});

// Child routes: /settings/profile, /settings/security
export const ProfileRoute = createLazyRoute('/settings/profile')({
  component: ProfilePage,
});

export const SecurityRoute = createLazyRoute('/settings/security')({
  component: SecurityPage,
});
```

**Layout Component**:

```typescript
const SettingsLayout = () => (
  <div className="flex">
    <SettingsSidebar />
    <Outlet /> {/* Child routes render here */}
  </div>
);
```

**Location**: Check `apps/client/src/modules/platform/configuration/` for nested route examples

## Dynamic Routes

Routes with parameters:

```typescript
// Route: /resources/:namespace/:name
export const ResourceDetailRoute = createLazyRoute(
  '/resources/$namespace/$name'
)({
  component: ResourceDetail,
});

// Access params in component
const ResourceDetail = () => {
  const { namespace, name } = useParams({
    from: '/resources/$namespace/$name',
  });

  return <div>Resource: {namespace}/{name}</div>;
};
```

## Route Guards

Protect routes based on authentication or permissions:

```typescript
// Auth guard
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/login' });
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return children;
};

// Permission guard
const PermissionGuard = ({
  permission,
  children,
}: {
  permission: string;
  children: React.ReactNode;
}) => {
  const { hasPermission } = usePermissions();

  if (!hasPermission(permission)) {
    return <AccessDenied />;
  }

  return children;
};
```

## Programmatic Navigation

Navigate from code:

```typescript
const navigate = useNavigate();

// Simple navigation
navigate({ to: '/resources' });

// With params
navigate({
  to: '/resources/$namespace/$name',
  params: { namespace: 'default', name: 'my-resource' },
});

// With search params
navigate({
  to: '/resources',
  search: { filter: 'active', sort: 'name' },
});

// Replace history (don't add to browser history)
navigate({ to: '/login', replace: true });
```

## Search Params Management

Type-safe search parameters:

```typescript
const searchParams = z.object({
  filter: z.string().optional(),
  sort: z.enum(['name', 'created', 'status']).optional(),
  page: z.number().int().optional(),
});

export const ListRoute = createLazyRoute('/resources')({
  validateSearch: (search) => searchParams.parse(search),
  component: ResourceList,
});

// Access in component
const ResourceList = () => {
  const { filter, sort, page } = useSearch({
    from: '/resources',
  });

  return <div>Filtered: {filter}</div>;
};
```

## Breadcrumb Generation

Automatic breadcrumbs from route hierarchy:

```typescript
const Breadcrumbs = () => {
  const matches = useMatches();

  return (
    <nav className="flex items-center gap-2">
      {matches
        .filter((match) => match.pathname !== '/')
        .map((match, index) => (
          <React.Fragment key={match.pathname}>
            {index > 0 && <ChevronRight className="h-4 w-4" />}
            <Link
              to={match.pathname}
              className="text-sm hover:underline"
            >
              {match.route.getBreadcrumb?.(match) || match.pathname}
            </Link>
          </React.Fragment>
        ))}
    </nav>
  );
};
```

**Define breadcrumbs in routes**:

```typescript
export const ResourceRoute = createLazyRoute('/resources/$name')({
  component: ResourceDetail,
  getBreadcrumb: (match) => match.params.name,
});
```

## Active Route Highlighting

Highlight active navigation items:

```typescript
const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const isActive = pathname === to;

  return (
    <Link
      to={to}
      className={cn(
        "px-4 py-2 rounded",
        isActive ? "bg-blue-600 text-white" : "hover:bg-gray-100"
      )}
    >
      {children}
    </Link>
  );
};
```

## Route Prefetching

Improve navigation performance:

```typescript
const { preloadRoute } = useRouter();

// Prefetch on hover
<Link
  to="/resources"
  onMouseEnter={() => preloadRoute({ to: '/resources' })}
>
  Resources
</Link>

// Prefetch on mount
useEffect(() => {
  preloadRoute({ to: '/resources' });
}, []);
```

## Multi-Tab Navigation

Manage multiple open tabs:

```typescript
const [tabs, setTabs] = useState([
  { id: '1', path: '/resources/default/app1', label: 'App 1' },
]);

const openTab = (path: string, label: string) => {
  setTabs([...tabs, { id: Date.now().toString(), path, label }]);
  navigate({ to: path });
};

const closeTab = (id: string) => {
  setTabs(tabs.filter(tab => tab.id !== id));
};
```

## Conditional Navigation

Show/hide routes based on permissions:

```typescript
const navItems = [
  { to: '/resources', label: 'Resources', permission: 'resources.view' },
  { to: '/settings', label: 'Settings', permission: 'settings.manage' },
];

const Navigation = () => {
  const { hasPermission } = usePermissions();

  return (
    <nav>
      {navItems
        .filter(item => hasPermission(item.permission))
        .map(item => (
          <NavLink key={item.to} to={item.to}>
            {item.label}
          </NavLink>
        ))}
    </nav>
  );
};
```

## Scroll Restoration

Preserve scroll position on navigation:

```typescript
export const MyRoute = createLazyRoute('/my-route')({
  component: MyComponent,
  scrollRestoration: 'auto', // or 'top', 'smooth'
});
```

## Route Loading States

Show loading UI during navigation:

```typescript
const { isLoading } = useNavigation();

{isLoading && (
  <div className="fixed top-0 left-0 right-0 h-1 bg-blue-600 animate-pulse" />
)}
```

## Real-World Examples

**Check these implementations**:

- Main sidebar: `apps/client/src/core/components/sidebar/`
- Platform routes: `apps/client/src/modules/platform/` (nested routes with guards)
- Configuration routes: `apps/client/src/modules/platform/configuration/` (multi-level nesting)

## Best Practices

1. **Lazy load routes** - Use `createLazyRoute` for code splitting
2. **Type-safe params** - Validate search params with Zod
3. **Guard routes** - Protect routes with auth and permission checks
4. **Prefetch strategically** - Prefetch likely next routes
5. **Restore scroll** - Enable scroll restoration for better UX
6. **Generate breadcrumbs** - Use route hierarchy for automatic breadcrumbs
7. **Conditional nav** - Show/hide based on permissions

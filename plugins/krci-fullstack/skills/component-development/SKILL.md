---
name: Component Development
description: This skill should be used when the user asks to "create reusable component", "implement UI primitive", "build React component", "add Radix UI component", "common components", "component file structure", "component patterns", or mentions component architecture, reusable UI primitives, or design system components. Not for forms, tables, filters, K8s resources, or tours -- use their dedicated skills.
---

Implement React components following the KubeRocketCI portal's architecture patterns, component organization, and Radix UI + TailwindCSS design system.

## Purpose

Guide component creation using established portal patterns. The portal has a three-layer architecture with clear boundaries. Understanding where a component belongs and what already exists is more important than any specific implementation detail.

## Three-Layer Architecture

### Core Layer (`apps/client/src/core/`)

Domain-agnostic infrastructure shared across the entire app:

- **`core/components/ui/`** -- Low-level UI primitives built with Radix UI + TailwindCSS + CVA. These are the design system building blocks (button, input, dialog, tabs, etc.).
- **`core/components/form/`** -- TanStack Form-integrated field components (FormTextField, FormCombobox, etc.). See the form-patterns skill for usage.
- **`core/components/`** -- Specialized reusable components that combine UI primitives with business logic (ButtonWithPermission, EmptyList, DataGrid, CodeEditor, PageWrapper, etc.).
- **`core/providers/`** -- App-wide providers (FormGuide, Stepper, etc.).
- **`core/auth/`** -- Authentication and authorization.

### K8s Layer (`apps/client/src/k8s/`)

Kubernetes API infrastructure:

- **`k8s/api/`** -- K8s API group definitions and CRUD hooks for resources
- **`k8s/components/`** -- K8s-specific UI (currently minimal: ResourceStatusBadge)
- **`k8s/services/`** -- K8s service integrations
- **`k8s/store/`** -- Cluster state (selected cluster, namespace)

### Modules Layer (`apps/client/src/modules/`)

User-facing features organized by domain:

```
modules/
  home/                     # Home/dashboard pages
  platform/
    codebases/              # Codebase + CodebaseBranch management
    cdpipelines/            # CDPipeline + Stage management
    tekton/                 # Pipeline + PipelineRun views
    observability/          # Metrics and monitoring
    overview/               # Project overview dashboards
    configuration/          # Config submodules (gitservers, registry, sonar, etc.)
  tours/                    # Tour system (provider, config, services)
```

**Related entities pattern**: Combine related entities in a single module (e.g., Pipeline + PipelineRun in `tekton/`, CDPipeline + Stage in `cdpipelines/`).

### Import Direction Rule

Modules import from core and k8s, never the reverse. Core never imports from modules. K8s never imports from modules. This is a strict architectural boundary.

## Component Placement Decision Framework

When creating a new component, determine its location:

1. **Is it a generic UI primitive** (no business logic, pure presentation)? Place in `core/components/ui/`. Follow the existing pattern of Radix UI + TailwindCSS + CVA.
2. **Is it a reusable component used across multiple modules** (has some logic but not domain-specific)? Place in `core/components/`. Examples: EmptyList, ButtonWithPermission, DataGrid.
3. **Is it specific to one feature domain**? Place in `modules/platform/{feature}/components/`. This is the most common case.
4. **Is it specific to one page within a feature**? Place in `modules/platform/{feature}/pages/{page}/components/`. Keep it close to where it is used.

## Discovering Existing Components

Before creating a new component, check what already exists.

**UI primitives**: List `core/components/ui/` to see all available low-level components. Each is a directory (or file) with its own index. As of now there are 40+ primitives covering inputs, overlays, navigation, display, and layout.

**Specialized components**: List `core/components/` to see higher-level reusable components. Key ones to know about:

- **ButtonWithPermission** -- Button with RBAC check, disables with reason tooltip. Used everywhere actions need permission gating.
- **EmptyList** -- Empty state for lists/tables with optional create action.
- **DataGrid** -- Card-based grid layout with pagination. Used for card views of resources.
- **CodeEditor** -- Monaco-based editor for YAML/JSON. Used in editor views.
- **PageWrapper** -- Standard page layout with breadcrumbs.
- **FormGuide** -- Sidebar help panel for form wizards (FormGuideSidebar, FormGuideToggleButton, etc.).
- **PageGuide** -- Button to trigger interactive page tours.
- **ActionsInlineList / ActionsMenuList** -- Action buttons in rows or dropdown menus.
- **InfoColumns** -- Key-value display in grid layout for detail pages.
- **StatusIcon / StatusBadge** -- Resource status visualization.

For the full component list, see `references/exploration-guide.md`.

**Form components**: See the form-patterns skill. All form-integrated components are in `core/components/form/`.

**Table components**: See the table-patterns skill for DataTable/ServerSideTable patterns.

## Standard Component Structure

```
ComponentName/
  index.tsx            # Main component (default export or named export)
  index.test.tsx       # Tests (Vitest + Testing Library)
  index.stories.tsx    # Storybook stories
  types.ts             # Props interface and related types
  constants.ts         # Component-specific constants
  hooks/               # Component-specific hooks
  components/          # Private child components
```

### Page Structure

```
page-name/
  route.ts             # Route definition (TanStack Router)
  route.lazy.ts        # Lazy-loaded route component
  page.tsx             # Entry point (wraps view with providers)
  view.tsx             # Main content (the actual page UI)
  view.test.tsx        # View tests
  view.stories.tsx     # Storybook stories for the view
  components/          # Page-specific components
  hooks/               # Page-specific hooks
```

The page/view split separates provider setup and data loading (page.tsx) from presentation (view.tsx).

## Key Conventions

### Function Declarations

Always use function declarations for components, not const arrow functions. This is required for Vite HMR compatibility:

```typescript
// Correct
export function MyComponent({ data }: MyComponentProps) {
  return <div>{data.name}</div>;
}

// Wrong - breaks Vite HMR
export const MyComponent = ({ data }: MyComponentProps) => {
  return <div>{data.name}</div>;
};
```

### TypeScript Props

Define explicit prop interfaces. Use JSDoc for non-obvious props:

```typescript
interface ResourceCardProps {
  /** The K8s resource to display */
  resource: CodebaseKubeObject;
  /** Called when the user clicks the edit action */
  onEdit?: () => void;
  className?: string;
}
```

### Styling with Tailwind

Use the `cn()` utility from `core/utils/classname` for conditional classes:

```typescript
import { cn } from "@/core/utils/classname";

function Component({ className, isActive }: Props) {
  return (
    <div className={cn(
      "rounded-lg border border-border bg-card p-4",
      isActive && "ring-2 ring-primary",
      className
    )}>
      {/* content */}
    </div>
  );
}
```

Use design tokens (CSS custom properties) via Tailwind classes: `bg-card`, `text-muted-foreground`, `border-border`, etc. Do not use raw color values.

### Permission Integration

Wrap action buttons with ButtonWithPermission when the action requires RBAC:

```typescript
const permissions = useCodebasePermissions();

<ButtonWithPermission
  allowed={permissions.data?.create.allowed}
  reason={permissions.data?.create.reason}
  ButtonProps={{ variant: "default", onClick: handleCreate }}
>
  Create Resource
</ButtonWithPermission>
```

### Import Aliases

```typescript
// Internal app imports use @ alias
import { Button } from "@/core/components/ui/button";
import { useAuth } from "@/core/auth/provider";

// Shared package imports
import { createCodebaseDraftObject } from "@my-project/shared";

// Cross-module imports (allowed: module -> core, module -> k8s)
import { useCodebaseCRUD } from "@/k8s/api/groups/KRCI/Codebase";
```

### File Naming

- Components: PascalCase directories (`UserProfile/index.tsx`)
- Pages: kebab-case directories (`user-profile/view.tsx`)
- Utilities: camelCase files (`formatDate.ts`)
- Type files: `types.ts` (always lowercase)

## Component Creation Workflow

1. **Search existing components**: List `core/components/ui/`, `core/components/`, and relevant module components
2. **Determine placement**: Use the decision framework above
3. **Create the directory structure**: Follow standard component structure
4. **Implement**: Use Radix UI primitives + Tailwind. Use `cn()` for class merging. Use CVA for variant-driven styling.
5. **Add TypeScript**: Explicit props interface, no `any` types
6. **Handle states**: Loading (Skeleton), error (ErrorContent), empty (EmptyList)
7. **Add accessibility**: ARIA labels where needed (Radix handles most of this)
8. **Integrate permissions**: Use ButtonWithPermission for gated actions
9. **Write tests**: Vitest + React Testing Library (see testing-standards skill)
10. **Add Storybook stories**: Create `index.stories.tsx` (or `view.stories.tsx` for pages) to document component states and variants

## References

See `references/exploration-guide.md` for how to discover and evaluate existing components when building something new.

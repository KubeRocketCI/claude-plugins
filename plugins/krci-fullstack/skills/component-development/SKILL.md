---
name: Component Development
description: This skill should be used when the user asks to "create component", "implement UI component", "build React component", "add Radix UI component", "common components", "component patterns", "project structure", or mentions component architecture, reusable components, or frontend file organization.
version: 0.1.0
---

Implement React components following the KubeRocketCI portal's architecture patterns, component organization, and Radix UI + TailwindCSS design system.

## Purpose

Guide component creation using established portal patterns, reusable common components, and proper file organization within the domain-driven architecture.

## Project Structure

### Three-Layer Architecture

**Core Module (`./core/`)**: Domain-agnostic infrastructure

- Authentication and authorization
- Generic UI components (buttons, inputs, tables)
- Application-wide providers
- Generic utilities

**K8s Module (`./k8s/`)**: Kubernetes API infrastructure

- K8s API group definitions
- CRUD hooks for resources
- Permission hooks
- Resource type definitions

**Feature Modules (`./modules/`)**: User-facing features by domain

- Pages and views
- Feature-specific components
- Domain business logic
- Feature-scoped hooks

### Module Organization

```
modules/platform/
├── codebases/           # Codebase + CodebaseBranch
├── cdpipelines/         # CDPipeline + Stage
├── tekton/              # Pipeline + PipelineRun
├── observability/       # Metrics and monitoring
└── configuration/       # Config submodules
```

**Related Entities Pattern**: Combine related entities in single module (e.g., Pipeline + PipelineRun in `tekton/`)

## Component Structure

### Standard Component

```
ComponentName/
├── components/          # Nested private components
├── hooks/               # Component-specific hooks
├── constants.ts         # Component constants
├── types.ts             # Component types
├── index.tsx            # Main component
└── index.test.tsx       # Tests
```

### Page Structure

```
page-name/
├── components/          # Page-specific components
├── hooks/               # Page hooks
├── page.tsx             # Entry point with providers
├── view.tsx             # Main content
├── view.test.tsx        # Tests
└── route.ts             # Route definition
```

## Common Components

Check `@/core/components` for reusable components before creating new ones:

**UI Primitives** (`@/core/components/ui/`):

- Button, Input, Textarea, Select, Checkbox, Radio Group
- Dialog, Sheet, Popover, Tooltip, Command
- Accordion, Tabs, Card, Badge, Alert
- Table, Stepper, Sidebar
- All built with Radix UI + TailwindCSS + CVA

**Navigation**: Sidebar components in `@/core/components/sidebar/`

**Permission & Access**: ButtonWithPermission - Button with permission validation

```typescript
<ButtonWithPermission
  allowed={permissions.data?.create.allowed}
  reason={permissions.data?.create.reason}
  ButtonProps={{ variant: "default", onClick: handleCreate }}
>
  Create Resource
</ButtonWithPermission>
```

**Status & Feedback**: StatusIcon, EmptyList

```typescript
<EmptyList
  missingItemName="codebases"
  linkText="Create your first codebase"
  handleClick={() => setDialog(CREATE_CODEBASE_DIALOG)}
/>
```

**Utility**: ConditionalWrapper, CopyButton

## Component Creation Workflow

1. **Check Existing**: Search `@/core/components` and feature modules for similar components
2. **Determine Location**:
   - Generic/reusable → `@/core/components`
   - Feature-specific → `@/modules/platform/{feature}/components`
3. **Create Structure**: Use standard component structure pattern
4. **Implement with Radix UI + TailwindCSS**: Use UI primitives from `@/core/components/ui/` and Tailwind utility classes
5. **Add TypeScript**: Define prop interfaces explicitly
6. **Add Accessibility**: ARIA labels, keyboard navigation (built into Radix)
7. **Integrate Permissions**: Use ButtonWithPermission where needed
8. **Add States**: Loading, error, empty states
9. **Write Tests**: Vitest + React Testing Library
10. **Document**: JSDoc comments for complex props

## Key Patterns

### TypeScript Props

**IMPORTANT**: Always use function declarations, not const arrow functions (Vite HMR compatibility).

```typescript
interface ComponentProps {
  /** Primary resource data */
  resource: Resource;
  /** Click handler */
  onAction?: () => void;
  /** Optional styling */
  className?: string;
}

export function Component({
  resource,
  onAction,
  className,
}: ComponentProps) {
  // Implementation
}
```

### TailwindCSS Styling

```typescript
import { cn } from '@/core/utils/classname';

function Component({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg",
        "bg-card text-card-foreground",
        "border border-border",
        "shadow-sm",
        className
      )}
    >
      Content
    </div>
  );
}
```

### Permission Integration

```typescript
// Use permission hook
const permissions = useCodebasePermissions();

// Wrap action button
<ButtonWithPermission
  allowed={permissions.data?.delete.allowed}
  reason={permissions.data?.delete.reason}
  ButtonProps={{ onClick: handleDelete, color: "error" }}
>
  Delete
</ButtonWithPermission>
```

## Import Patterns

```typescript
// Internal imports (within app)
import { Button } from "@/core/components/ui/Button";
import { useAuth } from "@/core/auth/hooks/useAuth";

// Cross-module imports
import { usePipelineMetrics } from "@/modules/platform/tekton/hooks/usePipelineMetrics";

// Shared package
import { K8sResourceConfig } from "@my-project/shared";
```

## File Naming

- Components: PascalCase directories (`UserProfile/`)
- Pages: kebab-case (`user-profile/`)
- Utilities: camelCase (`formatDate.ts`)
- Types: camelCase (`types.ts`)

## Guidelines

1. **Function Declarations**: **Always** use `function ComponentName()` instead of `const ComponentName = () =>` for Vite HMR compatibility
2. **Layer Boundaries**: Respect three-layer architecture (core/k8s/modules)
3. **Domain Boundaries**: Domain-specific code in modules, not core
4. **Component Isolation**: Self-contained with own types/constants
5. **Page/View Separation**: Separate page setup from content
6. **Import Direction**: Modules import from core/k8s, never reverse
7. **Reuse Before Create**: Check existing components first

## Additional Resources

See **`references/common-components-registry.md`** for complete list of available reusable components with usage examples.

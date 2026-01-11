# Common Components Registry

Quick reference for reusable components in the KubeRocketCI portal. Always check these before creating new components.

## UI Primitives (`@/core/components/ui/`)

Built with Radix UI + TailwindCSS + CVA (Class Variance Authority).

### Form Controls

- **Button** - Primary action component with variants (default, destructive, outline, secondary, ghost, link)
- **Input, Textarea** - Text input components
- **Select** - Dropdown selection
- **Checkbox, Radio Group** - Boolean and single-selection inputs
- **Switch** - Toggle component

### Overlays

- **Dialog** - Modal dialogs with DialogHeader, DialogContent, DialogFooter
- **Sheet** - Side panel overlay
- **Popover** - Floating content container
- **Tooltip** - Hover information
- **Command** - Command palette/search interface

### Navigation

- **Tabs** - Tabbed interface
- **Accordion** - Collapsible sections
- **Sidebar** - Navigation sidebar components

### Display

- **Card** - Content container
- **Badge** - Status indicator
- **Alert** - Notification/message display
- **Table** - Data table with sorting/filtering
- **Stepper** - Multi-step progress indicator

## Permission Components (`@/core/components/`)

### ButtonWithPermission

Button with integrated RBAC permission checking.

```typescript
<ButtonWithPermission
  allowed={permissions.data?.create.allowed}
  reason={permissions.data?.create.reason}
  ButtonProps={{ variant: "default", onClick: handleCreate }}
>
  Create Resource
</ButtonWithPermission>
```

**Location**: `apps/client/src/core/components/ButtonWithPermission/`

## Status & Feedback Components

### StatusIcon

Display resource status with appropriate icon and color.

**Location**: `apps/client/src/core/components/StatusIcon/`

### EmptyList

Empty state component for lists/tables.

```typescript
<EmptyList
  missingItemName="codebases"
  linkText="Create your first codebase"
  handleClick={() => setDialog(CREATE_DIALOG)}
/>
```

**Location**: `apps/client/src/core/components/EmptyList/`

## Utility Components

### ConditionalWrapper

Conditionally wrap children with a component.

**Location**: `apps/client/src/core/components/ConditionalWrapper/`

### CopyButton

Copy text to clipboard with feedback.

**Location**: `apps/client/src/core/components/CopyButton/`

## Sidebar Navigation

Sidebar components for app navigation.

**Location**: `apps/client/src/core/components/sidebar/`

## Finding Components

**Check locations in order**:

1. `apps/client/src/core/components/ui/` - UI primitives
2. `apps/client/src/core/components/` - Specialized components
3. `apps/client/src/modules/platform/{feature}/components/` - Feature-specific

**Naming Convention**:

- UI primitives: lowercase (button, dialog, input)
- Specialized: PascalCase (ButtonWithPermission, EmptyList)

## When to Create New Components

Create new components only if:

- ✅ No existing component fits the use case
- ✅ Pattern will be reused across multiple features
- ✅ Component is feature-specific (place in feature module)

**Avoid creating**:

- ❌ Variants of existing components (extend props instead)
- ❌ One-off components that won't be reused
- ❌ Components that duplicate existing functionality

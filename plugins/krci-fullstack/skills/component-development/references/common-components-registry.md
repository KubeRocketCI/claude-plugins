# Common Components Registry

Quick reference for reusable components in the KubeRocketCI portal. Always check these before creating new components.

## UI Primitives (`@/core/components/ui/`)

Built with Radix UI + TailwindCSS + CVA (Class Variance Authority). These are standalone UI components without form integration.

### Form Input Primitives

- **input** - Basic text input
- **input-password** - Password input with visibility toggle
- **input-editable** - Inline editable input
- **textarea** - Multi-line text input
- **textarea-password** - Multi-line password input
- **combobox** - Searchable select dropdown
- **combobox-with-input** - Combobox with text input
- **combobox-multiple-with-input** - Multi-select combobox with input
- **select** - Dropdown selection (use with `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`)
- **checkbox** - Checkbox input
- **checkbox-group-with-buttons** - Checkbox group with button styling
- **radio-group** - Radio button group
- **radio-group-with-buttons** - Radio group with button styling
- **tile-radio-group** - Radio group with tile/card styling
- **toggle-button-group** - Toggle button group
- **switch** - Toggle switch

### Action Components

- **button** - Primary action component with variants (default, destructive, outline, secondary, ghost, link)

Note: For TanStack Form-integrated components (FormTextField, FormCombobox, etc.), see TanStack Form Components below.

### Overlay & Modal Components

- **dialog** - Modal dialogs with DialogHeader, DialogContent, DialogFooter
- **sheet** - Side panel overlay
- **popover** - Floating content container
- **tooltip** - Hover information
- **command** - Command palette/search interface
- **dropdown-menu** - Dropdown menu with items

### Navigation & Layout

- **tabs** - Tabbed interface
- **accordion** - Collapsible sections
- **sidebar** - Navigation sidebar components
- **breadcrumb** - Breadcrumb navigation
- **separator** - Visual divider line

### Display & Feedback

- **card** - Content container
- **badge** - Status indicator
- **chip** - Compact label/tag component
- **alert** - Notification/message display
- **avatar** - User avatar component
- **title-status** - Title with status indicator
- **LoadingSpinner** - Loading spinner indicator
- **LoadingProgressBar** - Linear progress bar
- **progress** - Progress bar component
- **skeleton** - Loading placeholder skeleton

### Data Display

- **table** - Data table with sorting/filtering
- **table-pagination** - Table pagination controls
- **stepper** - Multi-step progress indicator

### Form Layout

- **form-field** - Form field wrapper with label and error
- **form-field-group** - Group multiple form fields
- **label** - Form label component

### Utility Components

- **collapsible** - Collapsible content container

## TanStack Form Components (`@/core/components/form/`)

Form-integrated components with built-in validation and error handling via TanStack Form. Used with `form.AppField` render prop pattern.

### Form Field Components

All components accessed via `field.Component` inside `form.AppField`:

- **FormTextField** - Text input with label and error handling
- **FormTextFieldPassword** - Password input with toggle visibility
- **FormTextarea** - Multi-line text input
- **FormTextareaPassword** - Multi-line password input
- **FormSelect** - Single-select dropdown (takes `SelectOption[]`)
- **FormCombobox** - Searchable multi/single select (takes `SelectOption[]`, supports `multiple` prop)
- **FormCheckbox** - Single checkbox with label
- **FormCheckboxGroup** - Group of checkboxes (takes `FormCheckboxOption[]`)
- **FormSwitch** - Toggle switch
- **FormSwitchRich** - Enhanced switch with description
- **FormRadioGroup** - Radio button group (takes `FormRadioOption[]`)

### Form Action Components

Accessed via `form.AppForm`:

- **FormSubmitButton** - Submit button with loading state
- **FormResetButton** - Reset form to default values

### Usage Pattern

```typescript
import { useAppForm } from "@/core/components/form";

const form = useAppForm({ defaultValues: { name: "" } });

<form.AppField name="name">
  {(field) => <field.FormTextField label="Name" placeholder="Enter name" />}
</form.AppField>
```

For detailed patterns, see the **form-patterns** and **filter-patterns** skills.

## Permission Components (`@/core/components/`)

### ButtonWithPermission

Button with RBAC integration:

```tsx
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

## Data Display & Layout Components

### DataGrid

Card-based grid layout with pagination:

```tsx
<DataGrid
  data={items}
  isLoading={isLoading}
  renderItem={(item) => <ItemCard {...item} />}
  filterFunction={(item) => item.status === 'active'}
  showPagination={true}
  rowsPerPage={9}
  emptyListComponent={<EmptyList missingItemName="items" />}
/>
```

### DataTable

Advanced data table with sorting, filtering, column management. **Always use with `useColumns` hook** (see table-patterns skill):

```tsx
import { useColumns } from "./hooks/useColumns";

export function ItemList() {
  const columns = useColumns();
  const itemsWatch = useItemsWatchList();

  return (
    <DataTable
      id={TABLE.ITEMS.id}
      name="Items"
      columns={columns}
      data={itemsWatch.data.array}
      isLoading={!itemsWatch.query.isFetched}
      emptyListComponent={<EmptyList missingItemName="items" />}
    />
  );
}
```

### InfoColumns

Display information in labeled columns:

```tsx
<InfoColumns
  gridItems={[
    { label: "Name", content: <span>{name}</span>, colSpan: 2 },
    { label: "Status", content: <StatusIcon status={status} />, colSpan: 2 },
  ]}
  gridCols={4}
/>
```

### CodeEditor

Monaco-based code editor:

```tsx
<CodeEditor
  content={yamlObject}
  onChange={(text, json, error) => handleChange(json)}
  language="yaml"
  height={500}
  readOnly={false}
/>
```

### ActionsInlineList

Horizontal row of action buttons:

```tsx
<ActionsInlineList
  actions={[
    { name: "Edit", Icon: <PencilIcon />, action: handleEdit },
    { name: "Delete", Icon: <TrashIcon />, action: handleDelete,
      disabled: { status: true, reason: "No permission" } },
  ]}
/>
```

### Layout Components

- **PageLayout** - Main application layout with Header and Sidebar
- **DetailsPageWrapper** - Wrapper for detail pages with error boundary
- **Section** / **SubSection** - Semantic content sections
- **TabPanel** / **TabSection** - Content panel for tab views
- **BorderedSection** - Content section with border styling

## Finding Components

**Check locations in order**:

1. `apps/client/src/core/components/ui/` - UI primitives (shadcn/ui-style)
2. `apps/client/src/core/components/form/` - TanStack Form-integrated components
3. `apps/client/src/core/components/` - Specialized components (ButtonWithPermission, EmptyList, etc.)
4. `apps/client/src/modules/platform/{feature}/components/` - Feature-specific

**Naming Convention**:

- UI primitives: lowercase (button, dialog, input)
- Specialized: PascalCase (ButtonWithPermission, EmptyList)

## When to Create New Components

Create new components only if:

- No existing component fits the use case
- Pattern will be reused across multiple features
- Component is feature-specific (place in feature module)

**Avoid creating**:

- Variants of existing components (extend props instead)
- One-off components that won't be reused
- Components that duplicate existing functionality

## Component Categories Summary

| Category | Location | Count | Examples |
|----------|----------|-------|----------|
| UI Primitives | `ui/` | 35+ | button, input, dialog, select, card |
| Form Presets | `form/` | 6 | TextField, Select, Autocomplete |
| Layout | `/` | 10+ | PageLayout, Section, TabSection |
| Data Display | `/` | 10+ | DataGrid, DataTable, InfoColumns |
| Actions | `/` | 5+ | ActionsInlineList, DeleteKubeObject |
| Editors | `/` | 4 | CodeEditor, Terminal, EditorYAML |
| Status | `/` | 7 | StatusIcon, EmptyList, ErrorContent |
| Kubernetes | `/` | 5+ | KubernetesDetails, ResourceQuotas |
| Utility | `/` | 12+ | CopyButton, LoadingWrapper, ConditionalWrapper |
| Navigation | `/sidebar/` | 8+ | Header, SidebarMenuItem, ThemeSwitcher |

**Total**: 100+ reusable components available

## Important Patterns

### Table/DataTable Pattern

**Always** use the `useColumns` hook pattern when implementing tables:

1. Create `hooks/useColumns.tsx` with column definitions
2. Use `useTableSettings` for persistent settings
3. Use `getSyncedColumnData` to merge settings
4. Return `TableColumn<T>[]` from the hook
5. Call `useColumns()` in your table component

See **`table-patterns` skill** for detailed implementation guide.

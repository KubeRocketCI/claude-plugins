# Common Components Registry

Quick reference for reusable components in the KubeRocketCI portal. Always check these before creating new components.

## UI Primitives (`@/core/components/ui/`)

Built with Radix UI + TailwindCSS + CVA (Class Variance Authority).

### Form Controls

- **button** - Primary action component with variants (default, destructive, outline, secondary, ghost, link)
- **input** - Text input field with validation states
- **input-editable** - Inline editable text input
- **input-password** - Password input with show/hide toggle
- **textarea** - Multi-line text input
- **textarea-password** - Password textarea with show/hide toggle
- **select** - Dropdown selection component
- **checkbox** - Boolean checkbox input
- **radio-group** - Single selection from options
- **radio-group-with-buttons** - Radio group styled as buttons
- **tile-radio-group** - Radio group as tile cards
- **switch** - Toggle switch component
- **combobox-with-input** - Searchable single select dropdown
- **combobox-multiple-with-input** - Searchable multi-select dropdown
- **form-field** - Form field wrapper with label, tooltip, and error display
- **form-field-group** - Groups multiple form fields together
- **label** - Form field label component

### Overlays

- **dialog** - Modal dialogs with DialogHeader, DialogContent, DialogFooter, DialogBody
- **sheet** - Side panel overlay
- **popover** - Floating content container
- **tooltip** - Hover information display
- **command** - Command palette/search interface

### Navigation

- **tabs** - Tabbed interface component
- **accordion** - Collapsible sections
- **sidebar** - Navigation sidebar with SidebarInset, SidebarMenu components
- **breadcrumb** - Navigation breadcrumb trail
- **collapsible** - Collapsible content section

### Display

- **card** - Content container with CardHeader, CardContent, CardFooter
- **badge** - Status indicator or tag
- **chip** - Small tag/label component
- **alert** - Notification/message display
- **table-pagination** - Pagination controls for tables
- **stepper** - Multi-step progress indicator
- **skeleton** - Loading placeholder skeleton
- **progress** - Progress bar indicator
- **avatar** - User avatar display
- **separator** - Visual divider line
- **title-status** - Title with status indicator
- **toggle-button-group** - Group of toggle buttons

### Loading States

- **LoadingSpinner** - Circular loading spinner
- **LoadingProgressBar** - Linear progress bar for loading

## Layout Components (`@/core/components/`)

- **PageLayout** - Main application layout with Header and Sidebar
- **DetailsPageWrapper** - Wrapper for detail pages with error boundary
- **BasicLayout** - Basic page layout structure
- **BorderedSection** - Content section with border styling
- **Section** - Semantic content section
- **SubSection** - Nested content section
- **TabPanel** - Content panel for tab views
- **TabSection** - Section with tab header
- **HorizontalScrollContainer** - Container with horizontal scrolling

## Data Display Components

- **DataGrid** - Grid layout for displaying data items with pagination and filtering (card-based layout)
- **Table / DataTable** - Advanced data table with sorting, filtering, column management (see table-patterns skill for `useColumns` hook pattern)
- **InfoColumns** - Display information in labeled columns with grid layout
- **NameValueTable** - Key-value pair table display
- **KubernetesDetails** - Display Kubernetes resource details
- **ResourceQuotas** - Display resource quota information with CircleProgress and RQItem
- **PipelinePreview** - Preview pipeline configuration
- **ResponsiveChips** - Responsive chip/tag container

## Actions & Interactions

- **ActionsInlineList** - Horizontal list of action buttons with icons
- **ActionsMenuList** - Dropdown menu of actions
- **Confirm** - Confirmation dialog component
- **DeleteKubeObject** - Dialog for deleting Kubernetes objects with name confirmation
- **ConfirmResourcesUpdates** - Dialog for confirming resource updates (in dialogs/)

## Form Components (`@/core/components/form/`)

Tanstack Form preset components that integrate with `FieldApi`:

- **TextField** - Text input field for forms
- **Select** - Dropdown select for forms with options
- **SelectField** - Alternative select implementation for forms
- **Autocomplete** - Searchable combobox with single/multiple selection
- **NamespaceAutocomplete** - Specialized autocomplete for namespace selection
- **SwitchField** - Toggle switch for boolean form fields

See `form-patterns` skill for usage patterns.

## Editors & Code Components

- **CodeEditor** - Monaco-based code editor with YAML/JSON support and syntax highlighting
- **EditorYAML** - Specialized YAML editor
- **Terminal** - xterm.js terminal with search, download, copy features
- **KubeConfigPreview** - Preview Kubernetes config files

## Status & Feedback Components

- **StatusIcon** - Display resource status with icon and color
- **EmptyList** - Empty state for lists/tables with call-to-action
- **ErrorBoundary** - Error boundary wrapper component
- **ErrorContent** - Error message display with details
- **CriticalError** - Critical error page component
- **Snackbar** - Toast notification component
- **NoDataWidgetWrapper** - Wrapper for widgets with no data state

## Kubernetes-Specific Components

- **DeleteKubeObject** - Kubernetes object deletion dialog
- **KubernetesDetails** - Kubernetes resource details display
- **ResourceQuotas** - Resource quota visualization
- **Namespaces** - Namespace selector/display
- **ResourceIconLink** - Link with Kubernetes resource icon

## Utility Components

- **ButtonWithPermission** - Button with integrated RBAC permission checking
- **ConditionalWrapper** - Conditionally wrap children with a component
- **CopyButton** - Copy text to clipboard with feedback
- **LoadingWrapper** - Show loading state or children based on condition
- **TooltipWithLinkList** - Tooltip containing list of links
- **TextWithTooltip** - Text with tooltip on hover
- **ScrollCopyText** - Scrollable text with copy functionality
- **QuickLink** - Quick action link component
- **LearnMoreLink** - "Learn more" link with consistent styling
- **RefPortal** - Portal component using ref for positioning
- **SvgBase64Icon** - Display SVG icons from base64 strings

## Navigation Components

### Sidebar (`@/core/components/sidebar/`)

- **SidebarMenuContent** - Sidebar menu container
- **SidebarMenuItem** - Individual sidebar menu item
- **SidebarMenuItemWithHover** - Menu item with hover state
- **SidebarSubGroupMenuItem** - Nested submenu item

### Other Navigation

- **Header** - Application header bar
- **nav-main** - Main navigation component
- **cluster-switcher** - Switch between Kubernetes clusters
- **ThemeSwitcher** - Toggle light/dark theme

## Sprites & Icons

- **K8sRelatedIconsSVGSprite** - SVG sprite sheet for Kubernetes-related icons

## Finding Components

**Check locations in order**:

1. `apps/client/src/core/components/ui/` - UI primitives (Radix UI based)
2. `apps/client/src/core/components/form/` - Tanstack Form preset components
3. `apps/client/src/core/components/` - Specialized components
4. `apps/client/src/modules/platform/{feature}/components/` - Feature-specific

**Naming Convention**:

- UI primitives: lowercase kebab-case (button, dialog, input)
- Form presets: PascalCase (TextField, SelectField, Autocomplete)
- Specialized: PascalCase (ButtonWithPermission, EmptyList, DataGrid)

## Component Usage Examples

### ActionsInlineList
Display action buttons in a horizontal row:
```tsx
<ActionsInlineList
  actions={[
    { name: "Edit", Icon: <PencilIcon />, action: handleEdit },
    { name: "Delete", Icon: <TrashIcon />, action: handleDelete, disabled: { status: true, reason: "No permission" } },
  ]}
/>
```

### DataGrid
Display items in a card-based grid with pagination:
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
Display items in a table with sorting and filtering. **Always use with `useColumns` hook**:
```tsx
// hooks/useColumns.tsx
export function useColumns(): TableColumn<Item>[] {
  const { loadSettings } = useTableSettings(TABLE.ITEMS.id);
  const tableSettings = loadSettings();

  return React.useMemo(() => [
    {
      id: "name",
      label: "Name",
      data: {
        columnSortableValuePath: "metadata.name",
        render: ({ data }) => <span>{data.metadata.name}</span>,
      },
      cell: {
        isFixed: true,
        baseWidth: 30,
        ...getSyncedColumnData(tableSettings, "name"),
      },
    },
    // more columns...
  ], [tableSettings]);
}

// index.tsx
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

See `table-patterns` skill for complete implementation guide.

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

### Terminal
Interactive terminal display:
```tsx
<Terminal
  content={logContent}
  height={600}
  enableSearch={true}
  enableDownload={true}
  enableCopy={true}
  showToolbar={true}
/>
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

### LoadingWrapper
Conditional loading state:
```tsx
<LoadingWrapper isLoading={isLoading} variant="spinner">
  <YourContent />
</LoadingWrapper>
```

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

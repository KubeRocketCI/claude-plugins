# Component Exploration Guide

Read this when you need to find existing components before building something new, or when you want to understand the component landscape.

## Discovery Strategy

### 1. UI Primitives (`core/components/ui/`)

List this directory first. It contains 40+ low-level components built with Radix UI + TailwindCSS + CVA. Each component is a directory with an `index.tsx`.

**Key categories**:

- **Inputs**: input, input-password, input-editable, textarea, textarea-password, select, combobox, combobox-with-input, combobox-multiple-with-input, checkbox, checkbox-group-with-buttons, radio-group, radio-group-with-buttons, tile-radio-group, toggle-button-group, switch
- **Overlays**: dialog, sheet, popover, tooltip, command, dropdown-menu
- **Layout**: card, accordion, tabs, sidebar, breadcrumb, separator, collapsible, stepper
- **Display**: badge, chip, alert, avatar, title-status, skeleton, progress, LoadingSpinner, LoadingProgressBar
- **Data**: table, table-pagination
- **Form layout**: form-field, form-field-group, label, secret-label

To understand a component's API, read its `index.tsx` file. CVA-based components export a `variants` function you can use.

### 2. Specialized Components (`core/components/`)

These combine UI primitives with application logic. List the directory and read the `index.tsx` of anything relevant.

**Components worth knowing about**:

| Component | When to use |
|-----------|-------------|
| ButtonWithPermission | Any action button that requires RBAC permission check |
| EmptyList | Empty state for lists, tables, or grid views |
| DataGrid | Card-based grid with pagination (alternative to DataTable) |
| CodeEditor | Monaco editor for YAML/JSON editing |
| EditorYAML | YAML-specific editor variant |
| PageWrapper | Standard page layout with breadcrumbs |
| PageContentWrapper | Content area wrapper within pages |
| DetailsPageWrapper | Detail page layout with error boundary |
| InfoColumns | Key-value grid for detail pages |
| ActionsInlineList | Row of action icon buttons |
| ActionsMenuList | Dropdown menu of actions |
| StatusIcon | Status visualization with icon |
| StatusBadge | Status with badge styling |
| FormGuide (sidebar/toggle/panel) | Help sidebar for form wizards |
| PageGuide | Button to trigger interactive tours |
| DeleteKubeObject | Standard K8s resource deletion dialog |
| Confirm | Generic confirmation dialog |
| ConditionalWrapper | Conditionally wrap children |
| CopyButton | Copy-to-clipboard with feedback |
| LogViewer | Log output display |
| Terminal / PodExecTerminal / PodLogsTerminal | Terminal UIs |
| ServerSideTable | Table with server-side data fetching |

### 3. Module Components

Feature-specific components live in `modules/platform/{feature}/components/`. These are potentially reusable across other modules — if you find yourself needing a similar component elsewhere, consider promoting it to `core/components/`.

### 4. Form Components

For form-integrated field components, see `core/components/form/components/`. These are covered by the form-patterns skill.

## When to Create vs. Reuse

**Create a new component when**:

- No existing component covers the use case
- The pattern will be reused across multiple features (put in `core/components/`)
- It is feature-specific but complex enough to warrant isolation (put in module)

**Extend an existing component when**:

- The component nearly fits but needs a new variant or prop
- The change is backward-compatible

**Do not create**:

- Thin wrappers that just pass props through
- One-off components that will not be reused (inline the JSX instead)
- Duplicates of existing functionality under a different name

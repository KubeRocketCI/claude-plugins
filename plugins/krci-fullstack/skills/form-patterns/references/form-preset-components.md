# Form Components Reference

Reference for the built-in form field components provided by the `useAppForm` framework. These components are accessed through the field context render prop — you do not need to create or import them manually.

## How Components Are Accessed

The portal's `useAppForm` hook provides field components through the `form.AppField` render prop. When you render a field, TanStack Form injects a `field` object into the render function. That `field` object carries pre-bound form components for every supported input type.

Integration pattern:

```typescript
<form.AppField name="fieldName">
  {(field) => <field.FormTextField label="Label" placeholder="..." />}
</form.AppField>
```

No imports of individual components are needed. The framework wires everything up through the field context.

## Available Field Components

Located in `/core/components/form/`.

### field.FormTextField

General-purpose text input. Supports all standard HTML text-like input types.

```typescript
<form.AppField name="username">
  {(field) => (
    <field.FormTextField
      label="Username"
      placeholder="Enter username"
      tooltipText="Must be unique across the platform"
    />
  )}
</form.AppField>
```

The `type` prop accepts: `text`, `email`, `number`, `tel`, `url`, `password`. Defaults to `text`.

### field.FormTextFieldPassword

Dedicated password input with a built-in show/hide toggle button. Prefer this over `FormTextField` with `type="password"` when the password is user-entered (login forms, new password fields).

```typescript
<form.AppField name="password">
  {(field) => (
    <field.FormTextFieldPassword
      label="Password"
      placeholder="Enter password"
    />
  )}
</form.AppField>
```

### field.FormTextarea

Multi-line text input for longer content such as descriptions or notes.

```typescript
<form.AppField name="description">
  {(field) => (
    <field.FormTextarea
      label="Description"
      placeholder="Describe the resource..."
      helperText="Markdown is supported"
    />
  )}
</form.AppField>
```

### field.FormTextareaPassword

Multi-line password field. Used for secrets or tokens that may be multi-line (for example, PEM certificates or SSH private keys).

```typescript
<form.AppField name="privateKey">
  {(field) => (
    <field.FormTextareaPassword
      label="Private Key"
      placeholder="Paste PEM-encoded key..."
    />
  )}
</form.AppField>
```

### field.FormSelect

Dropdown select for a fixed list of options. Each option has a `label` and `value`; an optional `icon` is also supported.

```typescript
<form.AppField name="region">
  {(field) => (
    <field.FormSelect
      label="Region"
      placeholder="Select a region"
      options={[
        { label: "US East", value: "us-east-1" },
        { label: "EU West", value: "eu-west-1" },
      ]}
    />
  )}
</form.AppField>
```

### field.FormCombobox

Searchable select with typeahead filtering. Supports single or multiple selection via the `multiple` prop.

```typescript
// Single selection
<form.AppField name="namespace">
  {(field) => (
    <field.FormCombobox
      label="Namespace"
      placeholder="Search namespaces..."
      options={namespaceOptions}
    />
  )}
</form.AppField>

// Multiple selection
<form.AppField name="tags">
  {(field) => (
    <field.FormCombobox
      label="Tags"
      placeholder="Select tags..."
      options={tagOptions}
      multiple
    />
  )}
</form.AppField>
```

### field.FormRadioGroup

Mutually exclusive options rendered as radio buttons. Pass options as an array of `{ label, value }` objects.

```typescript
<form.AppField name="deploymentStrategy">
  {(field) => (
    <field.FormRadioGroup
      label="Deployment Strategy"
      options={[
        { label: "Rolling Update", value: "rolling" },
        { label: "Recreate", value: "recreate" },
        { label: "Blue/Green", value: "bluegreen" },
      ]}
    />
  )}
</form.AppField>
```

### field.FormCheckbox

Single boolean checkbox. Use for standalone opt-in toggles.

```typescript
<form.AppField name="enableNotifications">
  {(field) => (
    <field.FormCheckbox
      label="Enable email notifications"
      tooltipText="Sends alerts when pipeline status changes"
    />
  )}
</form.AppField>
```

### field.FormCheckboxGroup

Multiple independent checkboxes from a list of options. The field value is an array of the selected values.

```typescript
<form.AppField name="permissions">
  {(field) => (
    <field.FormCheckboxGroup
      label="Permissions"
      options={[
        { label: "Read", value: "read" },
        { label: "Write", value: "write" },
        { label: "Admin", value: "admin" },
      ]}
    />
  )}
</form.AppField>
```

### field.FormSwitch

Toggle switch for boolean values. Visually distinct from a checkbox; preferred for enabling/disabling features.

```typescript
<form.AppField name="autoScaling">
  {(field) => (
    <field.FormSwitch
      label="Enable Auto Scaling"
      disabled={!hasPermission}
    />
  )}
</form.AppField>
```

### field.FormSwitchRich

Switch variant that also renders a description and an optional icon. Use when the toggle needs additional context.

```typescript
<form.AppField name="advancedMode">
  {(field) => (
    <field.FormSwitchRich
      label="Advanced Mode"
      helperText="Exposes low-level configuration options"
      tooltipText="Not recommended for most users"
    />
  )}
</form.AppField>
```

## Common Props

All field components accept the following props in addition to their component-specific ones.

| Prop | Type | Description |
|------|------|-------------|
| `label` | `string` | Visible field label rendered above the input |
| `placeholder` | `string` | Hint text shown inside the input when empty |
| `tooltipText` | `React.ReactNode` | Info icon tooltip rendered next to the label |
| `helperText` | `string` | Descriptive text rendered below the input |
| `disabled` | `boolean` | Disables the input; defaults to `false` |

Error messages are handled automatically by the framework. When a field has a validation error, the component reads it from `field.state.meta.errors` and displays it without any extra configuration.

## Form Actions with form.AppForm

Submit buttons and other form-level actions are accessed through `form.AppForm`, which provides its own set of components via a `formApi` render prop.

```typescript
<form.AppForm>
  {(formApi) => (
    <formApi.FormSubmitButton>
      Save Changes
    </formApi.FormSubmitButton>
  )}
</form.AppForm>
```

`FormSubmitButton` is automatically disabled and shows a loading indicator while the form is submitting.

## Complete Form Example

```typescript
function ResourceForm() {
  const form = useAppForm({
    defaultValues: {
      name: "",
      region: "",
      description: "",
      enableMonitoring: false,
    },
    onSubmit: async ({ value }) => {
      await createResource(value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppField name="name">
        {(field) => (
          <field.FormTextField
            label="Resource Name"
            placeholder="my-resource"
            tooltipText="Lowercase letters and hyphens only"
          />
        )}
      </form.AppField>

      <form.AppField name="region">
        {(field) => (
          <field.FormSelect
            label="Region"
            placeholder="Select region"
            options={regionOptions}
          />
        )}
      </form.AppField>

      <form.AppField name="description">
        {(field) => (
          <field.FormTextarea
            label="Description"
            placeholder="Optional description..."
          />
        )}
      </form.AppField>

      <form.AppField name="enableMonitoring">
        {(field) => (
          <field.FormSwitch label="Enable Monitoring" />
        )}
      </form.AppField>

      <form.AppForm>
        {(formApi) => (
          <formApi.FormSubmitButton>
            Create Resource
          </formApi.FormSubmitButton>
        )}
      </form.AppForm>
    </form>
  );
}
```

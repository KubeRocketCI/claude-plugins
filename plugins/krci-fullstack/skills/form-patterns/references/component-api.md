# Form Component API Reference

Quick reference for all form components in `/core/form-temp/components/`.

## Common Props (All Components)

```typescript
{
  label?: string;
  placeholder?: string;
  tooltipText?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
}
```

---

## Text Input Components

### FormTextField

**Types**: `text` | `email` | `number` | `tel` | `url` | `password`

```typescript
<form.AppField name="email">
  {(field) => (
    <field.FormTextField
      type="email"
      label="Email"
      placeholder="user@example.com"
      prefix={<Icon />}
      suffix={<Icon />}
    />
  )}
</form.AppField>
```

**Unique Props:**
- `type` - Input type
- `editable` - Show edit button
- `initiallyEditable` - Start in edit mode
- `prefix/suffix` - React nodes
- `inputProps` - Pass-through to `<Input>`

### FormTextFieldPassword

Dedicated password field with show/hide toggle.

```typescript
<form.AppField name="password">
  {(field) => <field.FormTextFieldPassword label="Password" />}
</form.AppField>
```

### FormTextarea

```typescript
<form.AppField name="description">
  {(field) => (
    <field.FormTextarea
      label="Description"
      placeholder="Enter details..."
    />
  )}
</form.AppField>
```

### FormTextareaPassword

Multi-line password input with show/hide.

---

## Selection Components

### FormSelect

```typescript
<form.AppField name="status">
  {(field) => (
    <field.FormSelect
      label="Status"
      options={[
        { value: "active", label: "Active", icon: <Icon /> },
        { value: "inactive", label: "Inactive", disabled: true },
      ]}
      suffix={<Icon />}
    />
  )}
</form.AppField>
```

**Option Type:**
```typescript
{
  value: string;
  label: string | ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}
```

### FormCombobox

Searchable/filterable select.

```typescript
<form.AppField name="language">
  {(field) => (
    <field.FormCombobox
      label="Language"
      options={[
        {
          value: "js",
          label: "JavaScript",
          description: <span>Popular web language</span>,
          icon: <Icon />,
        },
      ]}
    />
  )}
</form.AppField>
```

**Option Type:** Same as FormSelect + `description?: ReactNode`

### FormRadioGroup

```typescript
<form.AppField name="template">
  {(field) => (
    <field.FormRadioGroup
      label="Select Template"
      variant="horizontal" // or "vertical"
      options={options}
      classNames={{
        container: "grid-cols-3",
        item: "p-4",
        itemIcon: "h-6 w-6",
        itemIconContainer: "h-8 w-8",
      }}
    />
  )}
</form.AppField>
```

**Unique Props:**
- `variant` - Layout direction
- `classNames` - Custom styling per element

---

## Toggle Components

### FormCheckbox

```typescript
<form.AppField name="agree">
  {(field) => (
    <field.FormCheckbox label="I agree to terms" />
  )}
</form.AppField>
```

### FormCheckboxGroup

Multiple checkbox options.

```typescript
<form.AppField name="features">
  {(field) => (
    <field.FormCheckboxGroup
      label="Select Features"
      options={[
        { value: "auth", label: "Authentication" },
        { value: "api", label: "API Access", disabled: true },
      ]}
    />
  )}
</form.AppField>
```

### FormSwitch

```typescript
<form.AppField name="enabled">
  {(field) => <field.FormSwitch label="Enable feature" />}
</form.AppField>
```

### FormSwitchRich

Switch with description and icon.

```typescript
<form.AppField name="notifications">
  {(field) => (
    <field.FormSwitchRich
      label="Email Notifications"
      description="Receive updates via email"
      icon={<MailIcon />}
    />
  )}
</form.AppField>
```

---

## Action Components

### FormSubmitButton

Handles submission state automatically.

```typescript
<form.AppForm>
  {(formApi) => (
    <formApi.FormSubmitButton>
      Create Resource
    </formApi.FormSubmitButton>
  )}
</form.AppForm>
```

Shows loading state during `isSubmitting`.

### FormResetButton

```typescript
<form.AppForm>
  {(formApi) => (
    <formApi.FormResetButton variant="outline">
      Reset Form
    </formApi.FormResetButton>
  )}
</form.AppForm>
```

---

## Utility Components

### FormControlLabelWithTooltip

Label with tooltip icon.

```typescript
<FormControlLabelWithTooltip
  label="Advanced Settings"
  tooltipText="Configure advanced options"
/>
```

### SwitchGroup

**NOT a field component** - container for multiple switches.

```typescript
<SwitchGroup
  items={[
    { label: "Feature 1", value: true, onChange: (v) => {} },
    { label: "Feature 2", value: false, onChange: (v) => {} },
  ]}
/>
```

---

## Field State Access

Inside custom components using `useFieldContext`:

```typescript
const field = useFieldContext<string>();

field.state.value              // Current value
field.state.meta.errors        // Error array
field.state.meta.isTouched     // Touched state
field.handleChange(newValue)   // Update value
field.handleBlur()             // Mark touched
```

---

## Validation Quick Reference

```typescript
// Inline Zod
validators={{ onChange: z.string().min(1, "Required") }}

// Inline function
validators={{
  onChange: ({ value }) => value ? undefined : "Required"
}}

// Conditional
validators={{
  onChange: ({ value }) => {
    const otherField = form.store.state.values.otherField;
    return otherField === "x" && !value ? "Required when X" : undefined;
  }
}}

// Multiple timings
validators={{
  onChange: z.string().min(1),
  onBlur: z.string().min(1),
}}
```

---

## Field Listeners

```typescript
listeners={{
  onChange: ({ value }) => {
    // Reset dependent fields
    form.setFieldValue("framework", "");
  }
}}
```

---

## Component Locations

All components: `/core/form-temp/components/`

```
FormTextField/index.tsx
FormTextFieldPassword/index.tsx
FormTextarea/index.tsx
FormTextareaPassword/index.tsx
FormSelect/index.tsx
FormCombobox/index.tsx
FormCheckbox/index.tsx
FormCheckboxGroup/index.tsx
FormSwitch/index.tsx
FormSwitchRich/index.tsx
FormRadioGroup/index.tsx
FormSubmitButton/index.tsx
FormResetButton/index.tsx
FormControlLabelWithTooltip/index.tsx
SwitchGroup/index.tsx
```

Main export: `/core/form-temp/index.ts`

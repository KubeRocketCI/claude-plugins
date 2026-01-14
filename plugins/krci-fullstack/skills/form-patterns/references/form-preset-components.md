# Form Preset Components

Detailed guide for creating and using form preset components that integrate with Tanstack Form's FieldApi.

## What are Form Preset Components?

Form preset components are reusable field components that:
- Accept a `field` prop of type `FieldApi` from Tanstack Form
- Handle error display automatically
- Provide consistent label and tooltip rendering
- Include accessibility attributes
- Apply consistent styling via FormField wrapper

## Available Preset Components

Located in `@/core/components/form/`:

- **TextField** - Text input fields
- **Select** - Dropdown select with options
- **SelectField** - Alternative select implementation
- **Autocomplete** - Searchable select with combobox
- **SwitchField** - Toggle switch for boolean values

## Creating a Form Preset Component

### Full TextField Implementation Example

```typescript
import type {
  DeepKeys,
  DeepValue,
  FieldApi,
  FieldAsyncValidateOrFn,
  FieldValidateOrFn,
  FormAsyncValidateOrFn,
  FormValidateOrFn,
  Updater,
} from "@tanstack/react-form";
import React from "react";
import { Input } from "@/core/components/ui/input";
import { FormField } from "@/core/components/ui/form-field";

export interface TextFieldProps<
  Values extends Record<string, unknown> = Record<string, unknown>,
  TName extends DeepKeys<Values> = DeepKeys<Values>,
> {
  field: FieldApi<
    Values,
    TName,
    DeepValue<Values, TName>,
    FieldValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldAsyncValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldAsyncValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldAsyncValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FieldAsyncValidateOrFn<Values, TName, DeepValue<Values, TName>> | undefined,
    FormValidateOrFn<Values> | undefined,
    FormValidateOrFn<Values> | undefined,
    FormAsyncValidateOrFn<Values> | undefined,
    FormValidateOrFn<Values> | undefined,
    FormAsyncValidateOrFn<Values> | undefined,
    FormValidateOrFn<Values> | undefined,
    FormAsyncValidateOrFn<Values> | undefined,
    FormValidateOrFn<Values> | undefined,
    FormAsyncValidateOrFn<Values> | undefined,
    FormAsyncValidateOrFn<Values> | undefined,
    never
  >;
  label?: string;
  placeholder?: string;
  tooltipText?: React.ReactNode;
  disabled?: boolean;
}

export const TextField = <
  Values extends Record<string, unknown> = Record<string, unknown>,
  TName extends DeepKeys<Values> = DeepKeys<Values>,
>({
  field,
  label,
  placeholder,
  tooltipText,
  disabled = false,
}: TextFieldProps<Values, TName>) => {
  const error = field.state.meta.errors?.[0];
  const hasError = !!error;
  const errorMessage = hasError ? (error as string) : undefined;
  const fieldId = React.useId();

  return (
    <FormField
      label={label}
      tooltipText={tooltipText}
      error={hasError ? errorMessage : undefined}
      helperText={errorMessage}
      id={fieldId}
    >
      <Input
        value={(field.state.value ?? "") as string}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          field.handleChange(e.target.value as Updater<DeepValue<Values, TName>>)
        }
        onBlur={field.handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        invalid={hasError}
        id={fieldId}
        aria-describedby={hasError ? `${fieldId}-helper` : undefined}
      />
    </FormField>
  );
};
```

### Key Implementation Requirements

1. **Generic Types**: Use `Values` and `TName` generics to support any form structure
2. **FieldApi Type**: Accept `field: FieldApi` with full type parameters for type safety
3. **Error Extraction**: Get errors from `field.state.meta.errors?.[0]`
4. **Event Handlers**: Use `field.handleChange` for value updates, `field.handleBlur` for blur events
5. **FormField Wrapper**: Wrap with `FormField` component for consistent layout
6. **Unique IDs**: Generate unique `fieldId` with `React.useId()` for accessibility
7. **Aria Attributes**: Include `aria-describedby` pointing to error message when error exists

## Usage Examples

### TextField

```typescript
<TextField
  field={field}
  label="Name"
  placeholder="Enter name"
  tooltipText="Helpful info"
  disabled={false}
/>
```

### Select / SelectField

```typescript
<Select
  field={field}
  label="Category"
  placeholder="Choose one"
  options={[
    { label: "Option 1", value: "opt1" },
    { label: "Option 2", value: "opt2", icon: <Icon /> },
  ]}
/>
```

### Autocomplete

```typescript
<Autocomplete
  field={field}
  label="Tags"
  placeholder="Select tags"
  options={["tag1", "tag2", "tag3"]}
  multiple={true}
  getOptionLabel={(opt) => String(opt)}
/>
```

### SwitchField

```typescript
<SwitchField
  field={field}
  disabled={false}
/>
```

## Creating Custom Preset Components

When creating new preset components:

1. **Follow the TextField Pattern**: Use same generic structure and FieldApi typing
2. **Consistent Props**: Include `label`, `placeholder`, `tooltipText`, `disabled`
3. **Error Handling**: Extract and display errors consistently
4. **Accessibility**: Generate unique IDs and include aria attributes
5. **FormField Wrapper**: Wrap with FormField unless you have a specific reason not to
6. **Type Safety**: Ensure full type inference through generics

## Integration with Forms

Preset components are used with `form.Field`:

```typescript
<form.Field name="username">
  {(field) => (
    <TextField
      field={field}
      label="Username"
      placeholder="Enter username"
    />
  )}
</form.Field>
```

The `field` parameter from the render function is passed directly to the preset component.

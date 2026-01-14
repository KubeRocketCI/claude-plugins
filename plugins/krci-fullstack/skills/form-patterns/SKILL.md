---
name: Form Patterns
description: This skill should be used when the user asks to "create form", "implement form", "add validation", "Tanstack Form", "form validation", "multi-step form", "form wizard", "stepper form", or mentions form implementation, field validation, or form state management.
version: 0.2.0
---

Implement forms using Tanstack Form with type-safe field components and validation patterns.

> **Migration in Progress**: The project is migrating from React Hook Form to TanStack Form. **All new forms must use TanStack Form**. Some existing complex wizards still use React Hook Form and will be migrated over time.

## Purpose

Guide form implementation following portal's standardized patterns using Tanstack Form for state management, validation, and user experience.

## Core Stack

- **Tanstack Form** (`@tanstack/react-form`): Form state management and validation
- **Form Preset Components**: Reusable field components in `@/core/components/form/`
  - `TextField`, `Select`, `SelectField`, `Autocomplete`, `SwitchField`
- **FormField**: Wrapper component for consistent field layout with labels, tooltips, and error display
- **Radix UI + TailwindCSS**: UI primitives for form controls

## Architecture Overview

### Form Creation Pattern

Forms are created using `useForm` from Tanstack Form:

```typescript
import { useForm } from "@tanstack/react-form";

interface MyFormValues {
  name: string;
  email: string;
}

export function MyFormComponent() {
  const form = useForm<MyFormValues>({
    defaultValues: {
      name: "",
      email: "",
    },
    onSubmit: async ({ value }) => {
      await createResource(value);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Form fields using form.Field */}
    </form>
  );
}
```

### Form Preset Components

The portal provides preset field components that integrate with Tanstack Form's `FieldApi`:

- **TextField** - Text input fields
- **Select** / **SelectField** - Dropdown select with options
- **Autocomplete** - Searchable select with combobox
- **SwitchField** - Toggle switch for boolean values

**Usage:**
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

See **`references/form-preset-components.md`** for detailed implementation patterns and creating custom presets.

## Form Implementation Steps

1. **Define Form Values Type** - Create TypeScript interface
2. **Create Form Instance** - Use `useForm` hook
3. **Implement Fields** - Use preset components with `form.Field`
4. **Add Validation** - Field-level or form-level validators
5. **Handle Submission** - Integrate with API (tRPC, K8s CRUD)

See **`references/implementation-guide.md`** for complete step-by-step implementation with code examples.

## Validation

Tanstack Form supports three validation levels:

**Field-Level Validation:**
```typescript
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return "Email is required";
      return undefined;
    },
  }}
>
  {(field) => <TextField field={field} label="Email" />}
</form.Field>
```

**Async Validation:**
```typescript
<form.Field
  name="username"
  validators={{
    onChangeAsync: async ({ value }) => {
      const exists = await checkUsernameExists(value);
      return exists ? "Username already taken" : undefined;
    },
  }}
  validatorOptions={{
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => <TextField field={field} label="Username" />}
</form.Field>
```

**Form-Level Validation** (cross-field):
```typescript
const form = useForm({
  validators: {
    onChange: ({ value }) => {
      if (value.password !== value.confirmPassword) {
        return {
          fields: {
            confirmPassword: "Passwords must match",
          },
        };
      }
      return undefined;
    },
  },
});
```

See **`references/validation-patterns.md`** for comprehensive validation examples and patterns.

## Multi-Step Forms

For wizards and multi-step forms, manage step state separately and validate specific fields per step:

```typescript
const [activeStep, setActiveStep] = React.useState(0);

const handleNext = async () => {
  const isValid = await validateStep(activeStep);
  if (isValid) {
    setActiveStep((prev) => prev + 1);
  }
};
```

See **`references/multi-step-forms.md`** for complete multi-step form patterns with stepper UI integration.

## Context Pattern

For complex forms spanning multiple components, share form instance via Context:

```typescript
import { type ReactFormExtendedApi } from "@tanstack/react-form";

export type FormApi = ReactFormExtendedApi<FormValues>;
export const FormContext = React.createContext<FormApi | null>(null);

export function MyForm() {
  const form = useForm<FormValues>({ /* ... */ });

  return (
    <FormContext.Provider value={form}>
      <FormFields />
      <FormActions />
    </FormContext.Provider>
  );
}
```

## Integration with API

### tRPC Integration

```typescript
const createMutation = trpc.codebases.create.useMutation();

const form = useForm({
  onSubmit: async ({ value }) => {
    await createMutation.mutateAsync(value);
  },
});
```

### K8s CRUD Integration

```typescript
const { create, isPending } = useBasicCRUD({ config: k8sCodebaseConfig });

const form = useForm({
  onSubmit: async ({ value }) => {
    const draft = createCodebaseDraft(value);
    await create(draft);
  },
});
```

## Best Practices

1. **Use Preset Components** - Leverage existing form presets from `@/core/components/form/` for consistency
2. **Type Safety** - Always define explicit form values interfaces
3. **Context for Complex Forms** - Share form instance via Context when spanning multiple components
4. **Validation Strategy** - Field-level for simple validation, form-level for cross-field validation
5. **Async Debouncing** - Always debounce async validation (300-500ms)
6. **Loading States** - Use `form.state.isSubmitting` to show progress during submission
7. **Error Handling** - Handle API errors gracefully with user feedback
8. **Accessibility** - Preset components handle accessibility automatically
9. **Function Declarations** - Use regular function declarations (not const arrow functions) for Vite HMR compatibility
10. **Form State** - Leverage `form.state.isDirty`, `form.state.isValid` for UI decisions

## Additional Resources

- **`references/implementation-guide.md`** - Complete step-by-step form implementation with common patterns
- **`references/validation-patterns.md`** - Comprehensive validation examples and Zod integration
- **`references/form-preset-components.md`** - Detailed preset component usage and creating custom presets
- **`references/multi-step-forms.md`** - Multi-step forms, wizards, and stepper patterns

# Form Implementation Guide

Step-by-step guide for implementing forms using TanStack Form with the portal's patterns.

## Complete Implementation Steps

### Step 1: Define Form Values Type

Create a TypeScript interface for your form values:

```typescript
interface CodebaseFormValues {
  name: string;
  gitUrl: string;
  branch?: string;
  type: string;
}
```

**Best Practices:**

- Use explicit types, avoid `any`
- Mark optional fields with `?`
- Use specific types over generic strings (e.g., enums or union types)

### Step 2: Create Form with Context

Set up the form instance and optionally share via Context. Use `useAppForm()` from `@/core/components/form` instead of `useForm()` directly:

```typescript
import { useAppForm } from "@/core/components/form";
import React from "react";

// Optional: Create form context for sharing across components
export const CodebaseFormContext = React.createContext<ReturnType<typeof useAppForm<CodebaseFormValues>> | null>(null);

export function CodebaseForm() {
  const form = useAppForm<CodebaseFormValues>({
    defaultValues: {
      name: "",
      gitUrl: "",
      branch: "main",
      type: "application",
    },
    onSubmit: async (values) => {
      await createCodebase(values);
    },
  });

  return (
    <CodebaseFormContext.Provider value={form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <CodebaseFormFields />
        <CodebaseFormActions />
      </form>
    </CodebaseFormContext.Provider>
  );
}
```

**When to use Context:**

- Form spans multiple components
- Need to access form state in nested components
- Building reusable form sections

**When not to use Context:**

- Simple single-component forms
- Form fields are all in one place

**Custom hook pattern for Context consumers:**

Define a typed hook in a separate `hooks.ts` file to safely consume the context:

```typescript
// hooks.ts
import { useContext } from "react";
import { CodebaseFormContext } from "./CodebaseForm";

export function useCodebaseForm() {
  const form = useContext(CodebaseFormContext);
  if (!form) throw new Error("useCodebaseForm must be used within CodebaseForm");
  return form;
}
```

### Step 3: Implement Fields Using Preset Components

Use `form.AppField` with field-attached preset components. Field components are accessed directly on the `field` context object — no separate imports needed:

```typescript
import { useCodebaseForm } from "./hooks";

function CodebaseFormFields() {
  const form = useCodebaseForm();

  return (
    <div className="space-y-4">
      <form.AppField name="name">
        {(field) => (
          <field.FormTextField
            label="Name"
            placeholder="Enter codebase name"
            tooltipText="Unique identifier for the codebase"
          />
        )}
      </form.AppField>

      <form.AppField name="gitUrl">
        {(field) => (
          <field.FormTextField
            label="Git URL"
            placeholder="https://github.com/..."
          />
        )}
      </form.AppField>

      <form.AppField name="type">
        {(field) => (
          <field.FormSelect
            label="Type"
            placeholder="Select type"
            options={[
              { label: "Application", value: "application" },
              { label: "Library", value: "library" },
            ]}
          />
        )}
      </form.AppField>
    </div>
  );
}
```

### Step 4: Implement Fields Inline (Without Preset Components)

For custom or one-off fields, use `form.AppField` with direct Radix UI primitives:

```typescript
<form.AppField name="enabled">
  {(field) => {
    const handleChange = (checked: boolean) => {
      field.handleChange(checked);
      // Additional logic if needed
    };

    return (
      <Switch
        checked={!!field.state.value}
        onCheckedChange={handleChange}
        id={fieldId}
      />
    );
  }}
</form.AppField>
```

**When to use inline fields:**

- Unique field behavior not covered by presets
- Custom UI components
- Complex field interactions

### Step 5: Add Form Actions

Use `form.AppForm` with `formApi.FormSubmitButton` for built-in submit handling, or access `form.store.state` for manual control:

```typescript
import { Button } from "@/core/components/ui/button";

function CodebaseFormActions() {
  const form = useCodebaseForm();

  return (
    <form.AppForm>
      {(formApi) => (
        <div className="flex gap-2">
          <formApi.FormSubmitButton>Create</formApi.FormSubmitButton>
          <Button variant="outline" onClick={() => form.reset()}>
            Cancel
          </Button>
        </div>
      )}
    </form.AppForm>
  );
}
```

For manual control of the submit button state, read from `form.store.state`:

```typescript
function CodebaseFormActions() {
  const form = useCodebaseForm();
  const isSubmitting = form.store.state.isSubmitting;

  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create"}
      </Button>
      <Button variant="outline" onClick={() => form.reset()}>
        Cancel
      </Button>
    </div>
  );
}
```

**Available form states (via `form.store.state`):**

- `form.store.state.isSubmitting` - Form is being submitted
- `form.store.state.isDirty` - Form has been modified
- `form.store.state.isValid` - Form passes all validations
- `form.store.state.values` - Current form values

## Common Patterns

### Dynamic Fields Based on State

Show/hide fields based on other field values:

```typescript
<form.AppField name="type">
  {(typeField) => (
    <>
      <typeField.FormSelect label="Type" options={typeOptions} />

      {typeField.state.value === "custom" && (
        <form.AppField name="customValue">
          {(field) => <field.FormTextField label="Custom Value" />}
        </form.AppField>
      )}
    </>
  )}
</form.AppField>
```

### Conditional Field Updates

Update related fields when one field changes:

```typescript
<form.AppField name="enableFeature">
  {(field) => {
    const handleChange = (checked: boolean) => {
      field.handleChange(checked);

      // Update related fields
      if (!checked) {
        form.setFieldValue("featureOption", "");
      }
    };

    return <field.FormSwitch onChange={handleChange} />;
  }}
</form.AppField>
```

### Bulk Field Updates

Update multiple fields at once:

```typescript
const handleSelectAll = (checked: boolean) => {
  // Update multiple fields at once
  items.forEach((item) => {
    form.setFieldValue(`item_${item.id}`, checked);
  });
};
```

### Dependent Field Values

React to changes in other fields:

```typescript
<form.AppField name="country">
  {(countryField) => (
    <>
      <countryField.FormSelect label="Country" options={countries} />

      <form.AppField name="state">
        {(stateField) => (
          <stateField.FormSelect
            label="State"
            options={getStatesForCountry(countryField.state.value)}
            disabled={!countryField.state.value}
          />
        )}
      </form.AppField>
    </>
  )}
</form.AppField>
```

### Field Arrays (Dynamic Lists)

Handle arrays of fields:

```typescript
const [items, setItems] = React.useState([{ id: 1 }]);

<div className="space-y-2">
  {items.map((item, index) => (
    <div key={item.id} className="flex gap-2">
      <form.AppField name={`items.${index}.name`}>
        {(field) => <field.FormTextField label={`Item ${index + 1}`} />}
      </form.AppField>

      <Button
        variant="ghost"
        onClick={() => setItems(items.filter((_, i) => i !== index))}
      >
        Remove
      </Button>
    </div>
  ))}

  <Button onClick={() => setItems([...items, { id: Date.now() }])}>
    Add Item
  </Button>
</div>
```

## Integration with API

### Using tRPC Mutation

Pass `onSubmit` directly to `useAppForm()`. Values are passed directly without destructuring:

```typescript
import { useAppForm } from "@/core/components/form";
import { trpc } from "@/core/utils/trpc";

function CodebaseForm() {
  const createMutation = trpc.codebases.create.useMutation();

  const form = useAppForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async (values) => {
      try {
        await createMutation.mutateAsync(values);
        toast.success("Codebase created successfully");
        // Handle success (redirect, close dialog, etc.)
      } catch (error) {
        toast.error(`Failed to create: ${error.message}`);
      }
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Fields */}
      <form.AppForm>
        {(formApi) => (
          <formApi.FormSubmitButton>
            {createMutation.isPending ? "Creating..." : "Create"}
          </formApi.FormSubmitButton>
        )}
      </form.AppForm>
    </form>
  );
}
```

### Using K8s CRUD Hook

```typescript
import { useAppForm } from "@/core/components/form";
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";

function CodebaseForm() {
  const { create, isPending } = useBasicCRUD({
    config: k8sCodebaseConfig,
  });

  const form = useAppForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async (values) => {
      const draft = createCodebaseDraft(values);
      await create(draft);
    },
  });

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit();
    }}>
      {/* Fields */}
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
```

### Error Handling

```typescript
const form = useAppForm<FormValues>({
  defaultValues: { /* ... */ },
  onSubmit: async (values) => {
    try {
      await submitData(values);
      toast.success("Success!");
    } catch (error) {
      if (error.code === "VALIDATION_ERROR") {
        // Set field-specific errors
        form.setFieldMeta("email", (meta) => ({
          ...meta,
          errors: [error.message],
        }));
      } else {
        // Show general error
        toast.error(error.message);
      }
    }
  },
});
```

## Form Dialog Pattern

Wrap form in a dialog for modal forms. The `onSubmit` handler is passed directly to `useAppForm()`:

```typescript
import { useAppForm } from "@/core/components/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";

export function CreateCodebaseDialog({ open, onOpenChange }: DialogProps) {
  const form = useAppForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async (values) => {
      await createCodebase(values);
      onOpenChange(false); // Close dialog on success
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Codebase</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CodebaseFormFields />
          <CodebaseFormActions />
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

## Form Reset and Default Values

### Reset to Default Values

```typescript
<Button onClick={() => form.reset()}>
  Reset Form
</Button>
```

### Reset to Specific Values

```typescript
<Button onClick={() => form.reset({
  values: {
    name: "",
    type: "application",
  },
})}>
  Reset to Defaults
</Button>
```

### Set Initial Values from Props

```typescript
function EditCodebaseForm({ codebase }: { codebase: Codebase }) {
  const form = useAppForm<CodebaseFormValues>({
    defaultValues: {
      name: codebase.metadata.name,
      gitUrl: codebase.spec.gitUrlPath,
      branch: codebase.spec.defaultBranch,
      type: codebase.spec.type,
    },
    onSubmit: async (values) => {
      await updateCodebase(values);
    },
  });

  // ...
}
```

## Best Practices

1. **Type Safety**: Always define explicit form value types
2. **Context for Complex Forms**: Use Context with a typed custom hook when form spans multiple components
3. **Preset Components**: Use `field.FormTextField`, `field.FormSelect`, `field.FormCombobox`, `field.FormSwitch` for consistency
4. **No Direct Imports**: Never import `TextField`, `Select`, etc. from `@/core/components/form/` — access them via the field context
5. **Loading States**: Show loading state during submission using `form.store.state.isSubmitting` or `formApi.FormSubmitButton`
6. **Error Handling**: Handle API errors gracefully with user feedback
7. **Reset on Success**: Clear or close form after successful submission
8. **Validation**: Add validation before submission
9. **Accessibility**: Use preset components that handle accessibility
10. **Function Declarations**: Use regular function declarations for Vite HMR compatibility
11. **Form State**: Read from `form.store.state` (not `form.state`) for UI decisions (dirty, valid, submitting)
12. **onSubmit Location**: Always pass `onSubmit` to `useAppForm()`, never as a separate handler

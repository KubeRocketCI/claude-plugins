# Form Implementation Guide

Step-by-step guide for implementing forms using Tanstack Form with the portal's patterns.

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

Set up the form instance and optionally share via Context:

```typescript
import { useForm, type ReactFormExtendedApi } from "@tanstack/react-form";
import React from "react";

// Optional: Create typed form context for sharing across components
export type CodebaseFormApi = ReactFormExtendedApi<CodebaseFormValues>;
export const CodebaseFormContext = React.createContext<CodebaseFormApi | null>(null);

export function CodebaseForm() {
  const form = useForm<CodebaseFormValues>({
    defaultValues: {
      name: "",
      gitUrl: "",
      branch: "main",
      type: "application",
    },
  });

  const onSubmit = async (values: CodebaseFormValues) => {
    await createCodebase(values);
  };

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

### Step 3: Implement Fields Using Preset Components

Use preset components from `@/core/components/form/`:

```typescript
import { TextField } from "@/core/components/form/TextField";
import { Select } from "@/core/components/form/Select";
import { useContext } from "react";
import { CodebaseFormContext } from "./CodebaseForm";

function CodebaseFormFields() {
  const form = useContext(CodebaseFormContext);
  if (!form) throw new Error("Form context not found");

  return (
    <div className="space-y-4">
      <form.Field name="name">
        {(field) => (
          <TextField
            field={field}
            label="Name"
            placeholder="Enter codebase name"
            tooltipText="Unique identifier for the codebase"
          />
        )}
      </form.Field>

      <form.Field name="gitUrl">
        {(field) => (
          <TextField
            field={field}
            label="Git URL"
            placeholder="https://github.com/..."
          />
        )}
      </form.Field>

      <form.Field name="type">
        {(field) => (
          <Select
            field={field}
            label="Type"
            placeholder="Select type"
            options={[
              { label: "Application", value: "application" },
              { label: "Library", value: "library" },
            ]}
          />
        )}
      </form.Field>
    </div>
  );
}
```

### Step 4: Implement Fields Inline (Without Preset Components)

For custom or one-off fields, use `form.Field` directly:

```typescript
<form.Field name="enabled">
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
</form.Field>
```

**When to use inline fields:**
- Unique field behavior not covered by presets
- Custom UI components
- Complex field interactions

### Step 5: Add Form Actions

Implement submit, cancel, and other form actions:

```typescript
import { Button } from "@/core/components/ui/button";

function CodebaseFormActions() {
  const form = useContext(CodebaseFormContext);
  if (!form) throw new Error("Form context not found");

  return (
    <div className="flex gap-2">
      <Button
        type="submit"
        disabled={form.state.isSubmitting}
      >
        {form.state.isSubmitting ? "Creating..." : "Create"}
      </Button>
      <Button variant="outline" onClick={() => form.reset()}>
        Cancel
      </Button>
    </div>
  );
}
```

**Available form states:**
- `form.state.isSubmitting` - Form is being submitted
- `form.state.isDirty` - Form has been modified
- `form.state.isValid` - Form passes all validations
- `form.state.values` - Current form values

## Common Patterns

### Dynamic Fields Based on State

Show/hide fields based on other field values:

```typescript
<form.Field name="type">
  {(typeField) => (
    <>
      <Select field={typeField} label="Type" options={typeOptions} />

      {typeField.state.value === "custom" && (
        <form.Field name="customValue">
          {(field) => <TextField field={field} label="Custom Value" />}
        </form.Field>
      )}
    </>
  )}
</form.Field>
```

### Conditional Field Updates

Update related fields when one field changes:

```typescript
<form.Field name="enableFeature">
  {(field) => {
    const handleChange = (checked: boolean) => {
      field.handleChange(checked);

      // Update related fields
      if (!checked) {
        form.setFieldValue("featureOption", "");
      }
    };

    return <SwitchField field={field} onChange={handleChange} />;
  }}
</form.Field>
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
<form.Field name="country">
  {(countryField) => (
    <>
      <Select field={countryField} label="Country" options={countries} />

      <form.Field name="state">
        {(stateField) => (
          <Select
            field={stateField}
            label="State"
            options={getStatesForCountry(countryField.state.value)}
            disabled={!countryField.state.value}
          />
        )}
      </form.Field>
    </>
  )}
</form.Field>
```

### Field Arrays (Dynamic Lists)

Handle arrays of fields:

```typescript
const [items, setItems] = React.useState([{ id: 1 }]);

<div className="space-y-2">
  {items.map((item, index) => (
    <div key={item.id} className="flex gap-2">
      <form.Field name={`items.${index}.name`}>
        {(field) => <TextField field={field} label={`Item ${index + 1}`} />}
      </form.Field>

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

```typescript
import { trpc } from "@/core/utils/trpc";

function CodebaseForm() {
  const createMutation = trpc.codebases.create.useMutation();

  const form = useForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async ({ value }) => {
      try {
        await createMutation.mutateAsync(value);
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
      <Button type="submit" disabled={createMutation.isPending}>
        {createMutation.isPending ? "Creating..." : "Create"}
      </Button>
    </form>
  );
}
```

### Using K8s CRUD Hook

```typescript
import { useBasicCRUD } from "@/k8s/api/hooks/useBasicCRUD";

function CodebaseForm() {
  const { create, isPending } = useBasicCRUD({
    config: k8sCodebaseConfig,
  });

  const form = useForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async ({ value }) => {
      const draft = createCodebaseDraft(value);
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
const form = useForm<FormValues>({
  defaultValues: { /* ... */ },
  onSubmit: async ({ value }) => {
    try {
      await submitData(value);
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

Wrap form in a dialog for modal forms:

```typescript
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";

export function CreateCodebaseDialog({ open, onOpenChange }: DialogProps) {
  const form = useForm<CodebaseFormValues>({
    defaultValues: { /* ... */ },
    onSubmit: async ({ value }) => {
      await createCodebase(value);
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
          <CodebaseFormFields form={form} />
          <CodebaseFormActions form={form} />
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
  const form = useForm<CodebaseFormValues>({
    defaultValues: {
      name: codebase.metadata.name,
      gitUrl: codebase.spec.gitUrlPath,
      branch: codebase.spec.defaultBranch,
      type: codebase.spec.type,
    },
  });

  // ...
}
```

## Best Practices

1. **Type Safety**: Always define explicit form value types
2. **Context for Complex Forms**: Use Context when form spans multiple components
3. **Preset Components**: Use existing presets for consistency
4. **Loading States**: Show loading state during submission
5. **Error Handling**: Handle API errors gracefully with user feedback
6. **Reset on Success**: Clear or close form after successful submission
7. **Validation**: Add validation before submission
8. **Accessibility**: Use preset components that handle accessibility
9. **Function Declarations**: Use regular function declarations for Vite HMR compatibility
10. **Form State**: Leverage `form.state` for UI decisions (dirty, valid, submitting)

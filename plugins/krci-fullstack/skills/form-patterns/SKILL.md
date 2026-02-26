---
name: Form Patterns
description: This skill should be used when the user asks to "create form", "implement form", "add validation", "TanStack Form", "form fields", "multi-step form", "form wizard", "stepper form", or mentions form implementation, field validation, or form state management.
version: 0.2.0
---

Implement forms using TanStack Form with custom hooks, Zod validation, and pre-built form components.

## Purpose

Guide form implementation following the portal's standardized TanStack Form patterns with custom `useAppForm` hook, type-safe field components, and provider-based multi-step wizards.

## Core Stack

- **TanStack Form**: Form state management with custom `useAppForm` hook
- **Zod**: Schema validation (inline validators + full schema validation)
- **Custom Form Components**: Pre-built, accessible form fields from `@/core/components/form`
- **Multi-Step**: Provider pattern (Stepper + FormGuide) for complex wizards
- **Type Safety**: Full TypeScript inference from field context

## Architecture

### Form Components Location

All form components are in `/core/components/form/`:

- **Components**: `/core/components/form/components/` - 15+ pre-built form fields
- **Context**: `form-context.ts` - field/form context setup
- **Main Export**: `index.ts` - exports `useAppForm` hook and all form components

### Key Concepts

1. **Single Form Hook**: `useAppForm()` creates form instance with `form.AppField` for rendering fields
2. **Field Context**: Components access field state via `useFieldContext<T>()`
3. **Render Props**: `form.AppField` provides `field` object with component methods
4. **Inline Validation**: Validators defined directly in `form.AppField`
5. **Schema Validation**: Zod schemas for complex, cross-field validation

## Available Form Components

### Text Input Components

- `FormTextField` - text, email, number, tel, url, password variants
- `FormTextFieldPassword` - dedicated password field with show/hide
- `FormTextarea` - multi-line text input
- `FormTextareaPassword` - multi-line password input

### Selection Components

- `FormSelect` - dropdown select with options
- `FormCombobox` - searchable/filterable select
- `FormRadioGroup` - radio button group (supports horizontal/vertical/grid layouts)

### Toggle Components

- `FormCheckbox` - single checkbox
- `FormCheckboxGroup` - multiple checkbox options
- `FormSwitch` - toggle switch
- `FormSwitchRich` - switch with label, description, icon

### Form Action Components

- `FormSubmitButton` - handles form submission state
- `FormResetButton` - resets form to default values

### Utility Components

- `FormControlLabelWithTooltip` - label with tooltip icon
- `SwitchGroup` - container for multiple switches (NOT a field component)

## Implementation Pattern

### 1. Import Hook and Types

```typescript
import { useAppForm } from "@/core/components/form";
import { z } from "zod";

type CodebaseFormData = {
  name: string;
  gitUrl: string;
  branch?: string;
};
```

### 2. Create Form Instance

```typescript
const form = useAppForm<CodebaseFormData>({
  defaultValues: {
    name: "",
    gitUrl: "",
    branch: "main",
  },
  onSubmit: async (values) => {
    // values is fully typed as CodebaseFormData
    await createCodebase(values);
  },
});
```

### 3. Render Form Fields

```typescript
<form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
  <div className="space-y-4">
    <form.AppField
      name="name"
      validators={{
        onChange: z.string().min(1, "Name is required"),
      }}
    >
      {(field) => (
        <field.FormTextField
          label="Name"
          placeholder="Enter codebase name"
          helperText="Unique identifier for your codebase"
        />
      )}
    </form.AppField>

    <form.AppField
      name="gitUrl"
      validators={{
        onChange: z.string().url("Must be valid URL"),
      }}
    >
      {(field) => (
        <field.FormTextField
          label="Git URL"
          placeholder="https://github.com/..."
        />
      )}
    </form.AppField>

    <form.AppField name="branch">
      {(field) => (
        <field.FormTextField
          label="Branch"
          placeholder="main"
        />
      )}
    </form.AppField>
  </div>

  <div className="flex gap-2 mt-4">
    <form.AppForm>
      {(formApi) => (
        <>
          <formApi.FormSubmitButton>Create</formApi.FormSubmitButton>
          <formApi.FormResetButton variant="outline">Reset</formApi.FormResetButton>
        </>
      )}
    </form.AppForm>
  </div>
</form>
```

## Validation Patterns

Validators are defined inline via `form.AppField`'s `validators` prop:

- **Inline Zod**: `validators={{ onChange: z.string().email("Invalid") }}`
- **Inline function**: `validators={{ onChange: ({ value }) => !value ? "Required" : undefined }}`
- **Conditional**: Access `form.store.state.values.otherField` inside validator function
- **Schema-based**: Use `z.object().superRefine()` for cross-field validation
- **Timing**: `onChange` (every keystroke), `onBlur` (on blur), or both

**Note**: TanStack Form does NOT use `zodResolver`. Use inline validators or manual schema validation on submit.

**Details**: See `references/advanced-patterns.md`

## Field Listeners (Side Effects)

Use `listeners.onChange` to execute side effects (e.g., reset dependent fields):

```typescript
<form.AppField
  name="language"
  listeners={{
    onChange: ({ value }) => {
      form.setFieldValue("framework", "");
      form.setFieldValue("buildTool", "");
    },
  }}
>
  {(field) => <field.FormCombobox label="Language" options={languages} />}
</form.AppField>
```

## Form Component Props Reference

### Common Props (All Components)

```typescript
{
  label?: string;              // Field label
  placeholder?: string;        // Placeholder text
  tooltipText?: React.ReactNode; // Tooltip icon next to label
  helperText?: string;         // Helper text below field
  disabled?: boolean;          // Disable field
}
```

### FormTextField Specific

```typescript
{
  type?: "text" | "email" | "number" | "tel" | "url" | "password";
  editable?: boolean;          // Show edit button
  initiallyEditable?: boolean; // Start in edit mode
  prefix?: React.ReactNode;    // Prefix element
  suffix?: React.ReactNode;    // Suffix element
  inputProps?: React.ComponentProps<typeof Input>; // Pass-through props
}
```

### FormSelect / FormCombobox

```typescript
{
  options: Array<{
    value: string;
    label: string | React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    description?: React.ReactNode; // FormCombobox only
  }>;
  suffix?: React.ReactNode;
}
```

### FormRadioGroup

```typescript
{
  options: Array<{
    value: string;
    label: string | React.ReactNode;
    disabled?: boolean;
    icon?: React.ReactNode;
    description?: React.ReactNode;
  }>;
  variant?: "vertical" | "horizontal"; // Layout direction
  classNames?: {
    container?: string;     // Grid container classes
    item?: string;         // Individual item classes
    itemIcon?: string;     // Icon size classes
    itemIconContainer?: string; // Icon wrapper classes
  };
}
```

### FormSwitch / FormCheckbox

```typescript
{
  label?: string;         // Rendered next to switch/checkbox
  helperText?: string;
  disabled?: boolean;
}
```

### FormSwitchRich

```typescript
{
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}
```

## Multi-Step Form Pattern

### Provider-Based Approach

The portal uses a **provider pattern** for multi-step wizards:

**Key Components:**

1. **StepperProvider** - manages step navigation, validation
2. **FormGuideProvider** - optional help sidebar with contextual guidance
3. **Single Form Instance** - one `useAppForm` instance for all steps

**File Structure:**

```
CreateCodebaseWizard/
├── index.tsx                    # Main wizard wrapper
├── providers/
│   ├── form/
│   │   ├── provider.tsx        # Form provider setup
│   │   ├── hooks.ts            # useCreateCodebaseForm()
│   │   └── context.ts          # Form context
│   └── stepper/                # Step navigation logic
├── components/
│   ├── steps/                  # Step components
│   │   ├── MethodStep.tsx
│   │   ├── ConfigStep.tsx
│   │   └── ReviewStep.tsx
│   └── fields/                 # Reusable field components
│       ├── Lang/
│       ├── Framework/
│       └── ...
├── constants.ts                # NAMES, FORM_PARTS, etc.
├── schema.ts                   # Zod validation schema
└── names.ts                    # Field name constants
```

### Wizard Constants Pattern

Each wizard maintains standardized constants:

```typescript
// names.ts
export const NAMES = {
  // Form fields
  name: "name",
  gitUrl: "gitUrl",
  // UI-only fields (prefixed with ui_)
  ui_creationMethod: "ui_creationMethod",
  ui_creationTemplate: "ui_creationTemplate",
} as const;

// Step groupings
export const FORM_PARTS = {
  METHOD: ["ui_creationMethod", "ui_creationTemplate", "type"],
  GIT_SETUP: ["name", "gitServer", "repositoryUrl", "defaultBranch"],
  BUILD_CONFIG: ["lang", "framework", "buildTool", "ciTool"],
  REVIEW: [], // Review step has no editable fields
} as const;

// Guide steps for FormGuide integration
export const WIZARD_GUIDE_STEPS = [
  { title: "Choose Method", target: ".method-step" },
  { title: "Configure Git", target: ".git-step" },
  { title: "Build Config", target: ".build-step" },
  { title: "Review", target: ".review-step" },
];
```

### Step Validation

Validate specific fields before allowing navigation:

```typescript
const handleNext = async () => {
  const currentStepFields = FORM_PARTS[currentStep];

  // Validate all fields for current step
  const validationResults = await Promise.all(
    currentStepFields.map((field) => form.validateField(field)),
  );

  const hasErrors = validationResults.some((result) => result.length > 0);

  if (!hasErrors) {
    setStep((prev) => prev + 1);
  }
};
```

### Stepper Navigation

```typescript
<div className="flex justify-between mt-6">
  <Button
    variant="outline"
    onClick={() => setStep(prev => prev - 1)}
    disabled={step === 0}
  >
    Back
  </Button>

  {step < steps.length - 1 ? (
    <Button onClick={handleNext}>Next</Button>
  ) : (
    <Button onClick={() => form.handleSubmit()}>Submit</Button>
  )}
</div>
```

### FormGuide Integration

Add contextual help sidebar to wizards:

```typescript
import { FormGuideProvider, useFormGuide } from "@/core/providers/FormGuide";

<FormGuideProvider steps={WIZARD_GUIDE_STEPS} helpConfig={HELP_CONFIG}>
  <StepperProvider>
    <CreateCodebaseWizard />
  </StepperProvider>
</FormGuideProvider>
```

**Pattern Details:** See `/core/providers/FormGuide/` in the codebase

## Accessing Form State

### Get Current Values

```typescript
// Get all values
const allValues = form.store.state.values;

// Get specific field value
const nameValue = form.store.state.values.name;

// Using useStore hook (reactive)
import { useStore } from "@tanstack/react-form";

const MyComponent = () => {
  const typeValue = useStore(form.store, (s) => s.values.type);

  // Component re-renders when type changes
  return <div>Current type: {typeValue}</div>;
};
```

### Update Field Values

```typescript
// Set single field value
form.setFieldValue("name", "new-value");

// Set multiple values
form.setValues({
  name: "new-name",
  email: "new@email.com",
});

// Reset form to default values
form.reset();
```

### Trigger Validation

```typescript
// Validate single field
const errors = await form.validateField("email");

// Validate all fields
const allErrors = await form.validateAllFields();
```

### Check Form State

```typescript
// Check if form is submitting
const isSubmitting = form.store.state.isSubmitting;

// Check if form is valid
const isValid = form.store.state.isValid;

// Check if form has been touched
const isTouched = form.store.state.isTouched;

// Check for field errors
const fieldErrors = form.store.state.fieldMeta.email?.errors;
```

## Best Practices

### 1. Field Names as Constants

Always define field names in a constants file:

```typescript
// constants/names.ts
export const NAMES = {
  name: "name",
  email: "email",
  // ...
} as const;

// Usage
<form.AppField name={NAMES.name}>
  {(field) => <field.FormTextField label="Name" />}
</form.AppField>
```

### 2. UI-Only Fields

Prefix fields that aren't submitted with `ui_`:

```typescript
export const NAMES = {
  // Submitted fields
  name: "name",
  type: "type",

  // UI-only fields (for wizard flow, filters, etc.)
  ui_creationMethod: "ui_creationMethod",
  ui_searchQuery: "ui_searchQuery",
} as const;
```

### 3. Reusable Field Components

Extract complex fields into reusable components:

```typescript
// components/fields/Lang/index.tsx
export const Lang: React.FC<{ disabled?: boolean }> = ({ disabled }) => {
  const form = useCreateCodebaseForm();

  return (
    <form.AppField
      name={NAMES.lang}
      validators={{ onChange: z.string().min(1, "Select language") }}
      listeners={{
        onChange: () => {
          form.setFieldValue(NAMES.framework, "");
        },
      }}
    >
      {(field) => (
        <field.FormCombobox
          label="Code language"
          options={languageOptions}
          disabled={disabled}
        />
      )}
    </form.AppField>
  );
};

// Usage in step
<Lang disabled={isLoading} />
```

### 4. Type Safety

Use TypeScript inference for full type safety:

```typescript
// Define schema and infer type
const mySchema = z.object({
  name: z.string(),
  age: z.number(),
});

type MyFormData = z.infer<typeof mySchema>;

// Form is fully typed
const form = useAppForm<MyFormData>({
  defaultValues: { name: "", age: 0 },
  onSubmit: async (values) => {
    // values is typed as MyFormData
    console.log(values.name, values.age);
  },
});
```

### 5. Error Handling

Provide clear error messages:

```typescript
validators={{
  onChange: ({ value }) => {
    if (!value) return "Name is required";
    if (value.length < 2) return "Name must be at least 2 characters";
    if (value.length > 30) return "Name must be less than 30 characters";
    if (!/^[a-z0-9-]+$/.test(value)) {
      return "Name can only contain lowercase letters, numbers, and dashes";
    }
    return undefined;
  },
}}
```

### 6. Accessibility

All form components handle accessibility automatically:

- `aria-invalid` on error
- `aria-describedby` linking to helper/error text
- Proper `id` and `htmlFor` associations
- Keyboard navigation support

### 7. Loading States

Disable fields during async operations:

```typescript
const form = useAppForm({
  defaultValues: {},
  onSubmit: async (values) => {
    // Form automatically sets isSubmitting: true
    await submitData(values);
    // Automatically resets isSubmitting: false
  },
});

// Access submitting state
<form.AppField name="name">
  {(field) => (
    <field.FormTextField
      disabled={form.store.state.isSubmitting}
      label="Name"
    />
  )}
</form.AppField>
```

### 8. Unsaved Changes Warning

Track dirty state to warn users:

```typescript
const isDirty = form.store.state.isDirty;

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);
  return () => window.removeEventListener("beforeunload", handleBeforeUnload);
}, [isDirty]);
```

## Integration with Shared Package

Use shared schemas and draft creators:

```typescript
import {
  codebaseSchema,
  createCodebaseDraft,
  type CreateCodebaseDraftInput,
} from "@my-project/shared";

const form = useAppForm<CreateCodebaseDraftInput>({
  defaultValues: {},
  onSubmit: async (values) => {
    // Transform UI values to API format
    const draft = createCodebaseDraft(values);

    // Submit via tRPC
    await trpc.codebases.create.mutate(draft);
  },
});
```

## Real-World Examples

Check these implementations for reference:

### Complete Wizards

- **Codebase Creation**: `/modules/platform/codebases/pages/create/components/CreateCodebaseWizard/`
  - Complex validation with `superRefine`
  - Multi-step with conditional steps
  - FormGuide integration
  - Template selection flow

- **CD Pipeline Setup**: `/modules/platform/cdpipelines/pages/stages/create/components/CreateStageWizard/`
  - Dynamic form fields based on selections
  - Step-specific validation
  - Review step with summary

### Field Components

- **Language Selection**: `/modules/.../components/fields/Lang/`
  - Combobox with dynamic options
  - Side effects on change (reset framework/buildTool)
  - Icons and descriptions

- **Template Selection**: `/modules/.../components/fields/TemplateSelection/`
  - RadioGroup with rich content
  - Nested form for filtering
  - Conditional validation

### Form Providers

- **Stepper Provider**: `/core/providers/Stepper/`
- **FormGuide Provider**: `/core/providers/FormGuide/`

## Common Patterns

- **Filter forms**: No submit button, subscribe to `filterForm.store` for real-time filtering
- **Dynamic field lists**: Use `form.AppField` with `name={`items.${index}.name`}` for add/remove fields
- **Dependent selects**: Use `listeners.onChange` to cascade resets through country/state/city chains

**Details and code examples**: See `references/advanced-patterns.md`

## Troubleshooting

- **Field not updating**: Always use `form.AppField` render prop, not raw `useFieldContext`
- **Validation not running**: Check `onChange` vs `onBlur` timing in `validators`
- **Type errors**: Ensure form type parameter matches all field `name` props

**Details**: See `references/advanced-patterns.md`

## Migration from React Hook Form

Key mappings: `useForm()` -> `useAppForm()`, `<Controller>` -> `<form.AppField>`, `useFormContext()` -> custom hook, `zodResolver` -> inline validators.

**Full migration table and examples**: See `references/advanced-patterns.md`

## Additional Resources

- **Advanced Patterns**: See `references/advanced-patterns.md` (validation, listeners, troubleshooting, RHF migration)
- **Multi-Step Forms**: See `references/multi-step-forms.md`
- **Component API**: See `references/component-api.md`
- **Real Examples**: See `references/real-examples.md`
- **Implementation Guide**: See `references/implementation-guide.md` (step-by-step form setup, API integration)
- **Validation Patterns**: See `references/validation-patterns.md` (async validation, Zod schemas, error display)
- **Form Components**: See `references/form-preset-components.md` (complete component catalog with examples)
- **TanStack Form Docs**: [tanstack.com/form](https://tanstack.com/form/latest)
- **Zod Docs**: [zod.dev](https://zod.dev)

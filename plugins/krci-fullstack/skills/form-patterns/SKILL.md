---
name: Form Patterns
description: This skill should be used when the user asks to "create form", "implement form", "add validation", "TanStack Form", "useAppForm", "Zod validation", "form fields", "multi-step form", "form wizard", "stepper form", or mentions form implementation, field validation, or form state management.
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

15+ pre-built components: text fields, password, textarea, select, combobox, radio group, checkbox, checkbox group, switch, rich switch, submit/reset buttons, and utility components.

See `references/component-api.md` for the full catalog with props, and `references/form-preset-components.md` for integration patterns and examples.

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

**Details**: See `references/validation-patterns.md` for async validation, Zod schemas, error display, and programmatic validation.

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

## Multi-Step Form Pattern

The portal uses a **provider pattern** for multi-step wizards with three key components:

1. **StepperProvider** - manages step navigation and per-step validation
2. **FormGuideProvider** - optional contextual help sidebar
3. **Single Form Instance** - one `useAppForm` instance shared across all steps

Each wizard follows a standard file structure with `providers/`, `components/steps/`, `components/fields/`, `constants.ts`, `schema.ts`, and `names.ts`.

**Full implementation guide**: See `references/multi-step-forms.md` for provider setup, step validation, navigation, constants pattern, and FormGuide integration.

## Accessing Form State

Access values via `form.store.state.values`, update via `form.setFieldValue()` / `form.setValues()`, check state via `form.store.state.isSubmitting` / `isValid` / `isDirty`. Use `useStore(form.store, selector)` for reactive subscriptions in components.

See `references/implementation-guide.md` for the full form state API with examples.

## Best Practices

1. **Field Names as Constants** — define all field names in a `NAMES` constant object (`as const`) in a dedicated `names.ts` or `constants.ts` file
2. **UI-Only Field Prefix** — prefix fields not submitted to the API with `ui_` (e.g., `ui_creationMethod`, `ui_searchQuery`)
3. **Reusable Field Components** — extract complex fields (with listeners, validation, options) into standalone components under `components/fields/`
4. **Type Safety** — define Zod schema and infer form type via `z.infer<typeof schema>`
5. **Accessibility** — all form components handle `aria-invalid`, `aria-describedby`, and keyboard navigation automatically
6. **Loading States** — form automatically tracks `isSubmitting`; use it to disable fields during async operations

See `references/real-examples.md` for code examples of each pattern, and `references/advanced-patterns.md` for error handling, unsaved changes warning, and troubleshooting.

## Real-World Examples

- **CreateCodebaseWizard** — multi-step, conditional steps, FormGuide, shared package integration with `createCodebaseDraft`
- **CreateStageWizard** — dynamic fields, step-specific validation, review step
- **Reusable field components** — `Lang/`, `Framework/`, `TemplateSelection/` under `components/fields/`

See `references/real-examples.md` for production patterns and `references/implementation-guide.md` for shared package integration and tRPC form submission.

## Additional Resources

- **Component API**: See `references/component-api.md` (full component catalog with props)
- **Form Preset Components**: See `references/form-preset-components.md` (integration patterns)
- **Validation Patterns**: See `references/validation-patterns.md` (async validation, Zod schemas, error display)
- **Multi-Step Forms**: See `references/multi-step-forms.md` (provider setup, step validation, navigation)
- **Advanced Patterns**: See `references/advanced-patterns.md` (common patterns, troubleshooting, RHF migration)
- **Implementation Guide**: See `references/implementation-guide.md` (step-by-step setup, API integration, form dialogs)
- **Real Examples**: See `references/real-examples.md` (production wizard patterns)
- **TanStack Form Docs**: [tanstack.com/form](https://tanstack.com/form/latest)
- **Zod Docs**: [zod.dev](https://zod.dev)

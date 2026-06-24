---
name: Form Patterns
description: This skill should be used whenever the user is building or modifying a data-entry form in the KubeRocketCI portal — phrasings like "create a form", "add a form field", "form validation", "TanStack Form", "useAppForm", "Zod validation", "cross-field or async validation", "cascading/dependent fields", "multi-step form", "wizard", "stepper", or form state and submission. All portal forms use TanStack Form via useAppForm (not React Hook Form, no zodResolver). Use it even when the user just says "let the user enter or submit X". Note that a filter or search UI over a list also uses useAppForm but belongs to filter-patterns, not here; the submit endpoint belongs to api-integration; turning form values into a K8s manifest (draft creator plus CRUD) belongs to k8s-resources; a generic input primitive belongs to component-development.
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

Implement forms using TanStack Form with the portal's `useAppForm` hook, Zod validation, and pre-built field components.

## Purpose

Guide form implementation following the portal's TanStack Form patterns. The portal uses a custom `createFormHook` setup that provides type-safe field components via render props, form-level context, and Zod-based validation.

## Architecture Overview

### How useAppForm Works

The portal wraps TanStack Form's `createFormHook` to bind a set of field components and form-level components into a single hook. This is the central abstraction:

1. **`useAppForm(options)`** returns a form instance with two key render-prop methods:
   - **`form.AppField`** renders a named field, providing registered field components (FormTextField, FormCombobox, etc.) as children of the render prop
   - **`form.AppForm`** renders form-level components (FormSubmitButton, FormResetButton)
2. **Field components** internally call `useFieldContext()` to access field state, so they never need explicit value/onChange wiring
3. **Form components** internally call `useFormContext()` to access form state (isSubmitting, canSubmit, etc.)

This means you never pass `value`/`onChange` to field components. The context handles it.

### Key Files

- **`core/components/form/index.ts`** -- exports `useAppForm`, `withForm`, all field components, and types. Read this file to see the full list of registered field and form components.
- **`core/components/form/form-context.ts`** -- creates `fieldContext`/`formContext` via `createFormHookContexts()`
- **`core/components/form/types.ts`** -- shared types like `SelectOption`
- **`core/components/form/components/`** -- each field component in its own directory. Read individual component files to see their props interface.

### Available Field Components

Read the `fieldComponents` map in `core/components/form/index.ts` for the authoritative, current list of registered field components, plus the form-level components (FormSubmitButton, FormResetButton) — it drifts as components are added, so don't trust a hardcoded copy. They cover the usual inputs: text, password, select, combobox, checkbox (+ group), switch, radio group, textarea. To learn a component's props, read its `index.tsx` under `core/components/form/components/{ComponentName}/`.

Gotchas worth knowing before you read it:

- The select field is named `FormSelect` (not `FormSelectField`) — a common wrong guess.
- `SwitchGroup` is exported for direct import but is intentionally **not** a `form.AppField` field component — use it standalone, not via the `field.` render prop.

## Form Patterns

### Simple Form (Dialog or Inline)

Simple forms use the provider pattern: a FormProvider creates the `useAppForm` instance and exposes it via React context. Child components access it via a custom hook.

**Structure**:

```
SomeForm/
  providers/form/
    provider.tsx    # Creates useAppForm, wraps children in context
    context.ts      # createContext for the form instance
    hooks.ts        # useMyForm() hook
    types.ts        # Provider props
  components/
    Form/index.tsx  # Renders fields using form.AppField
    FormActions/    # Submit/cancel buttons
  schema.ts         # Zod validation schema (if needed)
  index.tsx          # Composes provider + form + actions
```

**Discovery**: To see this pattern in practice, look at any form under `modules/platform/configuration/`. For example, read the ManageQuickLink dialog at `modules/platform/configuration/modules/quicklinks/dialogs/ManageQuickLink/`.

### Multi-Step Wizard

Wizards use a **single form instance** shared across all steps, with a **Zustand store** for step navigation and a **Zod schema** for validation.

**Key architectural decisions**:

- One `useAppForm` instance covers all steps (no per-step forms)
- Step state is managed by a Zustand store (`useWizardStore`) with `currentStepIdx`, `goToNextStep`, `goToPreviousStep`, and step validation tracking
- Fields are grouped by step via `CREATE_FORM_PARTS` constants that map step names to field name arrays
- The wizard page wraps everything in `FormGuideProvider` for contextual help sidebar
- Steps render conditionally based on `currentStepIdx`

**Structure**:

```
CreateResourceWizard/
  index.tsx           # Mounts FormProvider, renders WizardContent
  store.ts            # Zustand store: steps, navigation, validation tracking
  schema.ts           # Zod schema (location varies — see note below)
  constants.ts        # NAMES, FORM_PARTS, HELP_CONFIG, WIZARD_GUIDE_STEPS
  names.ts            # Re-exports from constants (some wizards define the schema here instead)
  types.ts            # Form value types
  providers/form/
    provider.tsx      # useAppForm with validators + onSubmit
    context.ts        # Form context
    hooks.ts          # useWizardForm() hook
  components/
    fields/           # Reusable field components (one dir per field)
    <SemanticStep>/   # Step content components, named by purpose (e.g. InitialSelection, GitAndProjectInfo, BuildConfig)
    Review/           # Read-only review before submit
    Success/          # Post-submission success view
    WizardStepper/    # Step indicator UI
    WizardNavigation/ # Back / Continue / Submit buttons
```

**Discovery**: Read the CreateCodebaseWizard at `modules/platform/codebases/pages/create/components/CreateCodebaseWizard/` as the canonical example. Also see CreateStageWizard and CreateCDPipelineWizard under `modules/platform/cdpipelines/`.

For detailed wizard architecture (step validation, navigation logic, FormGuide integration), see `references/multi-step-forms.md`.

## Validation

### Inline Validators on AppField

Validators go on the `validators` prop of `form.AppField`. TanStack Form does NOT use `zodResolver`. Instead, pass Zod schemas or functions directly:

- **Zod inline**: `validators={{ onChange: z.string().min(1, "Required") }}`
- **Function**: `validators={{ onChange: ({ value }) => !value ? "Required" : undefined }}`
- **Timing**: `onChange` (every keystroke), `onBlur` (on blur), `onChangeAsync` (debounced async)

### Form-Level Validation (Zod Schema)

For cross-field validation, pass a Zod schema to the `validators` option of `useAppForm`:

```typescript
const form = useAppForm({
  defaultValues,
  validators: {
    onChange: myZodSchema as FormValidateOrFn<MyFormValues>,
  },
  onSubmit: async ({ value }) => { /* ... */ },
});
```

Wizard schemas use `.superRefine()` for cross-field validation. The `CreateCodebaseWizard` additionally wraps it in a `z.discriminatedUnion("strategy", [...])` to validate different field combinations per strategy; the `CreateCDPipelineWizard` and `CreateStageWizard` use a plain `z.object(...).superRefine(...)` instead. The schema also lives in different files per wizard — `schema.ts` in `CreateCodebaseWizard`, but inside `names.ts` for the CDPipeline and Stage wizards. Read the specific wizard to confirm.

### Async Validation

Use `onChangeAsync` with `validatorOptions.onChangeAsyncDebounceMs` for server-side checks. Check `field.state.meta.isValidating` for loading state.

### Error Display

All form field components automatically extract and display errors from `field.state.meta.errors`. The `extractErrorMessage` utility handles TanStack Form's error format. You do not need to manually wire error display when using the built-in field components.

For more on validation patterns (async, conditional, programmatic), see `references/validation-patterns.md`.

## Field Listeners (Side Effects)

Use `listeners.onChange` on `form.AppField` to execute side effects when a field changes:

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

This is the standard pattern for cascading dropdowns and dependent field resets.

## Accessing Form State

- **Read values**: `form.store.state.values` or `form.store.state.values.fieldName`
- **Set values**: `form.setFieldValue("name", "value")` or `form.setValues(partialObject)`
- **Check state**: `form.store.state.isSubmitting`, `form.store.state.canSubmit`, `form.store.state.isDirty`
- **Reactive subscription**: `useStore(form.store, (s) => s.values.someField)` — import `useStore` from `@tanstack/react-form` (it is re-exported there; `@tanstack/react-store` is not a direct dependency)
- **Validate**: `form.validateField("name", "change")` or `form.validateAllFields("change")`
- **Touch fields**: `form.setFieldMeta("name", (prev) => ({ ...prev, isTouched: true }))`

## Conventions

1. **Field names as constants**: Define all field names in a `constants.ts` (or `names.ts`) file using a NAMES object derived from the Zod schema shape
2. **UI-only field prefix**: Prefix fields not submitted to the API with `ui_` (e.g., `ui_creationMethod`, `ui_searchQuery`)
3. **Reusable field components**: Extract complex fields (with listeners, conditional logic, data fetching) into standalone components under `components/fields/`
4. **Provider pattern**: Always wrap the form in a provider component, expose via custom hook
5. **Zod schema as source of truth**: Define the schema (in `schema.ts` or, for some wizards, `names.ts`), infer types with `z.infer<typeof schema>`, and derive NAMES from schema shape
6. **Function declarations**: Use `function Component()` not `const Component = () =>` for Vite HMR
7. **FormGuide integration**: Wizard pages wrap in `FormGuideProvider` with `HELP_CONFIG` and `WIZARD_GUIDE_STEPS` from constants

## References

- **Multi-step wizard details**: See `references/multi-step-forms.md` (when building a wizard -- covers step validation, Zustand store pattern, FormGuide)
- **Validation details**: See `references/validation-patterns.md` (when implementing complex validation -- async, cross-field, conditional)
- **TanStack Form docs**: [tanstack.com/form](https://tanstack.com/form/latest)
- **Zod docs**: [zod.dev](https://zod.dev)

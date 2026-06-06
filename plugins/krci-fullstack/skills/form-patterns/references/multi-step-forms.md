# Multi-Step Wizard Architecture

Read this when building a new multi-step form wizard or modifying wizard navigation/validation logic.

## Wizard State: Zustand Store

Wizards use a Zustand store (not React context) for step navigation. This keeps step state outside React's render cycle and allows access from callbacks.

The store manages:

- `currentStepIdx` -- which step is visible
- `validatedSteps` -- Set of step names that passed validation
- Navigation methods: `goToNextStep()`, `goToPreviousStep()`, `setCurrentStepIdx()`
- `reset()` -- called on mount to clear previous wizard state

To understand the store shape, read any wizard's `store.ts` file (e.g., `CreateCodebaseWizard/store.ts`). The `WIZARD_STEPS` array defines step metadata (id, label, sublabel, icon, formPart).

## Constants Pattern

Each wizard defines its field groupings in `constants.ts`:

- **`NAMES`** -- derived from the Zod schema shape using a helper function. Maps each field name to itself as a typed constant.
- **`FORM_PARTS`** -- maps step names to arrays of field names belonging to that step. Used for per-step validation.
- **`CREATE_FORM_PARTS`** -- the actual field-to-step mapping (e.g., `{ method: ["ui_creationMethod", "type", ...], gitSetup: ["name", "gitServer", ...] }`)
- **`WIZARD_GUIDE_STEPS`** -- step metadata for the FormGuide sidebar (id, label, sublabel)
- **`HELP_CONFIG`** -- per-step field descriptions for the FormGuide panel

Read `CreateCodebaseWizard/constants.ts` to see the canonical example.

## Schema Pattern

All wizard schemas use `.superRefine()` for cross-field validation. Whether they wrap it in a discriminated union depends on the wizard:

- **`CreateCodebaseWizard`** uses `z.discriminatedUnion("strategy", [...]).superRefine(...)` — strategy-specific schemas with shared base fields, composed into a discriminated union, then refined. Schema lives in `schema.ts`.
- **`CreateCDPipelineWizard`** and **`CreateStageWizard`** use a plain `z.object(...).superRefine(...)` with no discriminated union. Their schema lives in `names.ts` (e.g. `createCDPipelineFormSchema`, `createStageFormSchema`), not a separate `schema.ts`.

Steps:

1. (Codebase only) Define strategy-specific schemas with shared base fields and compose into a discriminated union on the strategy field
2. Add cross-field validation via `.superRefine()` with helper functions per step
3. Export the schema type with `z.infer<typeof schema>`

The schema also separates UI-only fields (prefixed `ui_`) from core fields that map to the API model. Core fields often extend schemas from `@my-project/shared`.

## FormProvider Pattern

The form provider creates the `useAppForm` instance and passes a Zod schema as the form-level validator:

```typescript
const form = useAppForm({
  defaultValues: baseDefaultValues as FormValues,
  validators: {
    onChange: formSchema as FormValidateOrFn<FormValues>,
  },
  onSubmit: async ({ value, formApi }) => {
    // Validate with Zod before submission
    const result = formSchema.safeParse(value);
    if (!result.success) {
      // Mark errored fields as touched so errors display
      result.error.errors.forEach((error) => {
        formApi.setFieldMeta(error.path.join(".") as never, (prev) => ({
          ...prev,
          isTouched: true,
        }));
      });
      return;
    }
    await onSubmit(value);
  },
});
```

This dual validation (onChange for live feedback + safeParse on submit for final check) is the standard wizard pattern.

## FormGuide Integration

The page view (not the wizard component) wraps everything in `FormGuideProvider`:

```typescript
<FormGuideProvider
  config={HELP_CONFIG}
  steps={WIZARD_GUIDE_STEPS}
  currentStepIdx={currentStepIdx}
  docUrl={DOCS_URL}
>
  <PageWrapper breadcrumbsExtraContent={<FormGuideToggleButton />}>
    <div className="flex gap-4">
      <CreateResourceWizard />
      <FormGuideSidebar />
    </div>
  </PageWrapper>
</FormGuideProvider>
```

The `FormGuideProvider` and components are in `core/providers/FormGuide/` and `core/components/FormGuide/`. Read those files for the provider interface.

## Step Rendering

Steps render conditionally in the wizard content based on `currentStepIdx`:

Steps are named semantically by purpose, not `StepOne`/`StepTwo`. For example `CreateCodebaseWizard` renders `InitialSelection`, `GitAndProjectInfo`, `BuildConfig`, `Review`, `Success`:

```typescript
{currentStepIdx === 1 && <InitialSelection />}
{currentStepIdx === 2 && <GitAndProjectInfo />}
{currentStepIdx === 3 && <BuildConfig />}
{currentStepIdx === 4 && <Review />}
{currentStepIdx === 5 && <Success />}
```

Each step component accesses the form via the custom hook (e.g., `useCreateCodebaseForm()`) and renders fields using `form.AppField`.

## Navigation Component

The WizardNavigation component handles Back / Continue / submit with a back route for the first step. Note the actual button labels are **Continue** (advance a step) and a domain-specific submit label (e.g. **Create Project** with a rocket icon), not literally "Next"/"Submit":

- First step: Back navigates to the list page (via router link)
- Middle steps: Back calls `goToPreviousStep()`
- Last data step: the submit button triggers `form.handleSubmit()`
- Success step: Navigation is hidden

Read any wizard's `WizardNavigation/index.tsx` for the implementation.

## Reference Implementations

- **CreateCodebaseWizard**: `modules/platform/codebases/pages/create/components/CreateCodebaseWizard/`
- **CreateStageWizard**: `modules/platform/cdpipelines/pages/stages/create/components/CreateStageWizard/`
- **CreateCDPipelineWizard**: `modules/platform/cdpipelines/pages/create/components/CreateCDPipelineWizard/`

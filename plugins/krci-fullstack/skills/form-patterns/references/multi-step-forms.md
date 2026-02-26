# Multi-Step Form Patterns

Provider-based multi-step wizards with TanStack Form.

## Architecture

**Three Providers:**

1. **FormProvider** - Wraps `useAppForm`, provides form instance
2. **StepperProvider** - Manages step navigation and validation
3. **FormGuideProvider** - (Optional) Help sidebar with contextual guidance

**Pattern**: Single form instance across all steps, partial validation per step.

---

## File Structure

```
CreateResourceWizard/
├── index.tsx                    # Providers wrapper
├── constants.ts                 # FORM_PARTS, WIZARD_GUIDE_STEPS
├── names.ts                     # Field name constants (NAMES)
├── schema.ts                    # Zod schema with superRefine
├── providers/
│   ├── form/
│   │   ├── provider.tsx        # FormProvider with useAppForm
│   │   ├── hooks.ts            # useWizardForm() custom hook
│   │   └── context.ts          # Form context
│   └── stepper/                # Step navigation provider
└── components/
    ├── steps/                  # Step components
    │   ├── MethodStep.tsx
    │   ├── ConfigStep.tsx
    │   └── ReviewStep.tsx
    └── fields/                 # Reusable field components
        ├── FieldA/
        └── FieldB/
```

---

## Constants Pattern

### Field Names

```typescript
// names.ts
export const NAMES = {
  name: "name",
  type: "type",
  // UI-only fields
  ui_creationMethod: "ui_creationMethod",
  ui_creationTemplate: "ui_creationTemplate",
} as const;
```

### Step Groupings

```typescript
// constants.ts
export const FORM_PARTS = {
  METHOD: ["ui_creationMethod", "ui_creationTemplate", "type"],
  CONFIG: ["name", "gitServer", "repositoryUrl"],
  REVIEW: [], // No editable fields
} as const;

export const WIZARD_GUIDE_STEPS = [
  { title: "Choose Method", target: ".method-step" },
  { title: "Configure", target: ".config-step" },
  { title: "Review", target: ".review-step" },
];
```

---

## Provider Setup

### Form Provider

```typescript
// providers/form/provider.tsx
export const FormProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const form = useAppForm<FormValues>({
    defaultValues: getDefaults(),
    onSubmit: async (values) => {
      await submitResource(values);
    },
  });

  return <FormContext.Provider value={form}>{children}</FormContext.Provider>;
};

// providers/form/hooks.ts
export const useWizardForm = () => {
  const form = useContext(FormContext);
  if (!form) throw new Error("Must be used within FormProvider");
  return form;
};
```

### Main Wrapper

```typescript
// index.tsx
export const CreateResourceWizard = () => (
  <FormGuideProvider steps={WIZARD_GUIDE_STEPS}>
    <FormProvider>
      <StepperProvider>
        <WizardContent />
      </StepperProvider>
    </FormProvider>
  </FormGuideProvider>
);
```

---

## Step Validation

Validate specific fields before allowing navigation:

```typescript
const handleNext = async () => {
  const fieldsToValidate = FORM_PARTS[currentStep];

  const results = await Promise.all(
    fieldsToValidate.map(field => form.validateField(field))
  );

  const hasErrors = results.some(r => r.length > 0);

  if (!hasErrors) {
    setStep(prev => prev + 1);
  }
};
```

---

## Step Components

```typescript
// components/steps/MethodStep.tsx
export const MethodStep: React.FC = () => {
  const form = useWizardForm();

  return (
    <div className="space-y-4">
      <form.AppField name={NAMES.ui_creationMethod}>
        {(field) => (
          <field.FormRadioGroup
            label="Creation Method"
            options={methodOptions}
          />
        )}
      </form.AppField>

      {/* Conditional fields based on method */}
      {form.store.state.values.ui_creationMethod === "template" && (
        <form.AppField name={NAMES.ui_creationTemplate}>
          {(field) => (
            <field.FormRadioGroup
              label="Select Template"
              options={templates}
            />
          )}
        </form.AppField>
      )}
    </div>
  );
};
```

---

## Navigation Controls

```typescript
const Navigation: React.FC = () => {
  const { step, setStep, steps } = useStepper();
  const form = useWizardForm();

  const isLastStep = step === steps.length - 1;

  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={() => setStep(prev => prev - 1)}
        disabled={step === 0}
      >
        Back
      </Button>

      {isLastStep ? (
        <Button onClick={() => form.handleSubmit()}>
          Submit
        </Button>
      ) : (
        <Button onClick={handleNext}>
          Next
        </Button>
      )}
    </div>
  );
};
```

---

## Review Step

Display all values before submission:

```typescript
export const ReviewStep: React.FC = () => {
  const form = useWizardForm();
  const values = form.store.state.values;

  return (
    <div className="space-y-4">
      <h3>Review Your Configuration</h3>
      <Card>
        <CardContent>
          <dl className="space-y-2">
            <dt className="font-semibold">Name</dt>
            <dd>{values.name}</dd>

            <dt className="font-semibold">Type</dt>
            <dd>{values.type}</dd>
          </dl>
        </CardContent>
      </Card>
      <Button variant="outline" onClick={() => setStep(0)}>
        Edit
      </Button>
    </div>
  );
};
```

---

## Conditional Steps

Skip steps based on previous selections:

```typescript
const getNextStep = (currentStep: number): number => {
  const values = form.store.state.values;

  if (currentStep === 0 && values.type === "simple") {
    return 2; // Skip advanced config step
  }

  return currentStep + 1;
};

const handleNext = async () => {
  const isValid = await validateCurrentStep();
  if (isValid) {
    const nextStep = getNextStep(step);
    setStep(nextStep);
  }
};
```

---

## FormGuide Integration

Add help sidebar to wizard:

```typescript
import { FormGuideProvider } from "@/core/providers/FormGuide";

const HELP_CONFIG = {
  steps: [
    {
      title: "Choose Method",
      content: "Select how you want to create your resource...",
    },
    // ...
  ],
};

<FormGuideProvider steps={WIZARD_GUIDE_STEPS} helpConfig={HELP_CONFIG}>
  <YourWizard />
</FormGuideProvider>
```

**Details**: See `/core/providers/FormGuide/` in the codebase

---

## Best Practices

1. **Single form instance** - Don't create separate forms per step
2. **Field name constants** - Use `NAMES` object, prefix UI fields with `ui_`
3. **Step groupings** - Define `FORM_PARTS` for partial validation
4. **Custom hook** - Wrap form in provider, access via `useWizardForm()`
5. **Reusable fields** - Extract complex fields to components
6. **Review step** - Always show summary before submission
7. **Conditional validation** - Fields validate based on other field values

---

## Real Examples

- **CreateCodebaseWizard**: `/modules/platform/codebases/pages/create/components/CreateCodebaseWizard/`
- **CreateStageWizard**: `/modules/platform/cdpipelines/pages/stages/create/components/CreateStageWizard/`

See `references/real-examples.md` for specific patterns.

---

## Provider References

- **Stepper**: `/core/providers/Stepper/`
- **FormGuide**: `/core/providers/FormGuide/`
- **Pattern docs**: `/core/providers/FormGuide/` in the codebase

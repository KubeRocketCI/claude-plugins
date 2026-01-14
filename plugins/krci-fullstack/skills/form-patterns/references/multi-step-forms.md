# Multi-Step Form Patterns

Advanced patterns for implementing multi-step wizards with TanStack Form and Radix UI components.

> **Migration in Progress**: Project is migrating from React Hook Form to TanStack Form. **All new forms must use TanStack Form**. Existing wizards (like CreateCodebaseWizard) use React Hook Form + Zustand and will be migrated over time.

## Basic Multi-Step Pattern

```typescript
const [step, setStep] = useState(0);
const steps = ['Basic Info', 'Configuration', 'Review'];

// Single form instance, multiple views
const form = useForm({
  defaultValues: { /* all steps */ },
  onSubmit: async ({ value }) => {
    // Submit all data at once
  },
});

// Render current step
{step === 0 && <StepOne form={form} />}
{step === 1 && <StepTwo form={form} />}
{step === 2 && <StepThree form={form} />}
```

**Key Principle**: Single form instance, render different field groups per step.

## Step Validation

Validate current step before proceeding:

```typescript
const handleNext = async () => {
  // Validate current step fields
  const fields = getCurrentStepFields(step);
  const hasErrors = fields.some(field =>
    form.getFieldMeta(field)?.errors.length > 0
  );

  if (!hasErrors) {
    setStep(step + 1);
  } else {
    // Trigger validation display
    fields.forEach(field => form.validateField(field));
  }
};
```

## Stepper Component Integration

Use portal's Stepper UI component:

```typescript
import { Stepper } from "@/core/components/ui/stepper";

<Stepper
  steps={steps.map((label, index) => ({
    label,
    status: index < step ? 'completed' : index === step ? 'current' : 'upcoming',
  }))}
  currentStep={step}
/>
```

**Location**: `apps/client/src/core/components/ui/stepper/`

## Step Navigation

```typescript
const canGoNext = () => {
  const currentStepFields = getCurrentStepFields(step);
  return currentStepFields.every(field =>
    !form.getFieldMeta(field)?.errors.length
  );
};

const canGoBack = () => step > 0;
const isLastStep = () => step === steps.length - 1;

<div className="flex justify-between mt-6">
  <Button
    variant="outline"
    onClick={() => setStep(step - 1)}
    disabled={!canGoBack()}
  >
    Back
  </Button>

  {!isLastStep() ? (
    <Button onClick={handleNext} disabled={!canGoNext()}>
      Next
    </Button>
  ) : (
    <Button onClick={form.handleSubmit}>
      Submit
    </Button>
  )}
</div>
```

## Conditional Steps

Skip steps based on previous answers:

```typescript
const getNextStep = (currentStep: number) => {
  const values = form.getValues();

  if (currentStep === 0 && values.type === 'simple') {
    return 2; // Skip step 1 for simple type
  }

  return currentStep + 1;
};
```

## State Persistence

Save draft to localStorage:

```typescript
useEffect(() => {
  const values = form.getValues();
  localStorage.setItem('form-draft', JSON.stringify(values));
}, [form.state.values]);

// Restore on mount
useEffect(() => {
  const draft = localStorage.getItem('form-draft');
  if (draft) {
    form.setValues(JSON.parse(draft));
  }
}, []);
```

## Review Step Pattern

Display all entered data before submission:

```typescript
const ReviewStep = ({ form }: { form: FormApi<T> }) => {
  const values = form.getValues();

  return (
    <div className="space-y-4">
      <h3>Review Your Submission</h3>

      <Card>
        <CardContent>
          <dl className="space-y-2">
            <dt className="font-semibold">Name</dt>
            <dd>{values.name}</dd>

            <dt className="font-semibold">Configuration</dt>
            <dd>{values.config}</dd>
          </dl>
        </CardContent>
      </Card>

      <Button onClick={() => setStep(0)}>Edit</Button>
    </div>
  );
};
```

## Progress Indicator

Show completion percentage:

```typescript
const progress = ((step + 1) / steps.length) * 100;

<div className="w-full bg-gray-200 rounded-full h-2 mb-4">
  <div
    className="bg-blue-600 h-2 rounded-full transition-all"
    style={{ width: `${progress}%` }}
  />
</div>
```

## Error Recovery

Handle submission errors:

```typescript
const [submitError, setSubmitError] = useState<string | null>(null);

const handleSubmit = async (values: T) => {
  try {
    await submitForm(values);
  } catch (error) {
    setSubmitError(error.message);
    // Go back to relevant step based on error
    const errorStep = getStepForError(error);
    setStep(errorStep);
  }
};
```

## Step-Specific Validation

Different validation per step:

```typescript
const step1Schema = z.object({
  name: z.string().min(3),
  description: z.string(),
});

const step2Schema = z.object({
  config: z.object({ /* ... */ }),
});

// In step component
<form.Field
  name="name"
  validators={{
    onChange: step1Schema.shape.name,
  }}
>
  {(field) => <Input field={field} />}
</form.Field>
```

## Real-World Examples

**Existing wizard implementations** (React Hook Form + Zustand):

- Codebase creation wizard: `apps/client/src/modules/platform/codebases/pages/create/components/CreateCodebaseWizard/`
- Stage creation wizard: `apps/client/src/modules/platform/cdpipelines/pages/stages/create/components/CreateStageWizard/`
- Pipeline creation wizard: `apps/client/src/modules/platform/cdpipelines/pages/create/components/CreateCDPipelineWizard/`

These serve as reference for wizard structure and UI patterns. When migrating, follow TanStack Form patterns documented above.

## Best Practices

1. **Single form instance** - Don't create separate forms per step
2. **Validate on step change** - Check fields before allowing next
3. **Save drafts** - Persist state to prevent data loss
4. **Clear navigation** - Always show which step user is on
5. **Review before submit** - Let users verify all data
6. **Handle errors gracefully** - Return to relevant step on error
7. **Conditional logic** - Skip irrelevant steps based on input

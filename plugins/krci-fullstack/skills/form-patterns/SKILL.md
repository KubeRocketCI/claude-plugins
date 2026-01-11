---
name: Form Patterns
description: This skill should be used when the user asks to "create form", "implement form", "add validation", "React Hook Form", "Zod validation", "multi-step form", "form wizard", "stepper form", or mentions form implementation, field validation, or form state management.
version: 0.1.0
---

Implement forms using React Hook Form with Zod validation, including multi-step wizards for complex resource creation workflows.

## Purpose

Guide form implementation following portal's standardized patterns for validation, state management, and user experience.

## Core Stack

- **React Hook Form**: Form state management
- **Zod**: Schema validation with TypeScript inference
- **Radix UI + TailwindCSS**: Form field components from `@/core/components/ui/`
- **Multi-Step**: Custom stepper components for complex forms

## Architecture

### Multi-Step Forms

**Components**:

- `FormProvider`: React Hook Form context wrapper
- `StepperProvider`: Step navigation context
- `FormTextField`: Standardized form field
- `FormActions`: Navigation and validation logic

**Principles**:

- Centralized step navigation and validation
- Partial validation per step
- Automatic navigation to first error
- Persistent state across steps

## Implementation Pattern

### 1. Define Schema

```typescript
import { z } from 'zod';

const codebaseSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  gitUrl: z.string().url('Must be valid URL'),
  branch: z.string().optional(),
});

type CodebaseFormData = z.infer<typeof codebaseSchema>;
```

### 2. Create Form Provider

```typescript
const CodebaseForm = () => {
  const methods = useForm<CodebaseFormData>({
    resolver: zodResolver(codebaseSchema),
    mode: 'onChange',
  });

  const onSubmit = async (data: CodebaseFormData) => {
    await createCodebase(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        <FormFields />
        <FormActions />
      </form>
    </FormProvider>
  );
};
```

### 3. Implement Fields

```typescript
import { Input } from "@/core/components/ui/input";
import { Label } from "@/core/components/ui/label";

const FormFields = () => {
  const { control } = useFormContext<CodebaseFormData>();

  return (
    <div className="space-y-4">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              {...field}
              invalid={!!error}
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )}
      />
      <Controller
        name="gitUrl"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div className="space-y-2">
            <Label htmlFor="gitUrl">Git URL</Label>
            <Input
              id="gitUrl"
              {...field}
              invalid={!!error}
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error.message}</p>}
          </div>
        )}
      />
    </div>
  );
};
```

### 4. Add Actions

```typescript
import { Button } from "@/core/components/ui/button";

const FormActions = () => {
  const { formState: { isSubmitting, isValid } } = useFormContext();

  return (
    <div className="flex gap-2">
      <Button type="submit" disabled={!isValid || isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create'}
      </Button>
      <Button variant="outline" onClick={handleCancel}>
        Cancel
      </Button>
    </div>
  );
};
```

## Multi-Step Form Pattern

### Stepper Setup

```typescript
import { Stepper } from "@/core/components/ui/stepper";
import { Button } from "@/core/components/ui/button";

const steps = [
  { label: 'Basic Info', fields: ['name', 'gitUrl'] },
  { label: 'Configuration', fields: ['branch', 'type'] },
  { label: 'Review', fields: [] },
];

const MultiStepForm = () => {
  const [activeStep, setActiveStep] = useState(0);
  const methods = useForm({ /* ... */ });

  const validateStep = async (step: number) => {
    const fieldsToValidate = steps[step].fields;
    const result = await methods.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep(activeStep);
    if (isValid) {
      setActiveStep(prev => prev + 1);
    }
  };

  return (
    <FormProvider {...methods}>
      <Stepper steps={steps} currentStep={activeStep} />
      {activeStep === 0 && <BasicInfoStep />}
      {activeStep === 1 && <ConfigurationStep />}
      {activeStep === 2 && <ReviewStep />}
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={activeStep === 0}
          onClick={() => setActiveStep(prev => prev - 1)}
        >
          Back
        </Button>
        <Button
          onClick={activeStep === steps.length - 1 ? methods.handleSubmit(onSubmit) : handleNext}
        >
          {activeStep === steps.length - 1 ? 'Submit' : 'Next'}
        </Button>
      </div>
    </FormProvider>
  );
};
```

## Validation Patterns

### Field-Level Validation

```typescript
const schema = z.object({
  email: z.string().email('Invalid email'),
  age: z.number().min(18, 'Must be 18 or older'),
  password: z.string().min(8, 'Min 8 characters'),
});
```

### Custom Validation

```typescript
const schema = z.object({
  password: z.string(),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
```

### Async Validation

```typescript
const validateUnique = async (value: string) => {
  const exists = await checkExists(value);
  return !exists || 'Already exists';
};
```

## Common Patterns

### Resource Creation Forms

- Use draft creators from shared package
- Validate permissions before submission
- Handle success/error feedback
- Reset form on completion

### Filter Forms

- Real-time filtering (no submit button)
- Integration with FilterProvider
- Debounced input for performance

### Configuration Forms

- Single-step for simple configs
- Real-time validation
- Persist to settings/localStorage

## Best Practices

1. **Schema-First**: Define Zod schema for type safety
2. **Step Validation**: Validate only current step fields
3. **Error Feedback**: Clear messages and navigation to errors
4. **Loading States**: Show progress during submission
5. **Accessibility**: ARIA labels, keyboard navigation
6. **Mobile Support**: Responsive layouts
7. **Dirty State**: Track unsaved changes
8. **Reset Handling**: Clean up on close/cancel

## Integration with Shared Package

```typescript
import { codebaseSchema, createCodebaseDraft } from "@my-project/shared";

const onSubmit = async (data: CodebaseFormData) => {
  // Use draft creator
  const draft = createCodebaseDraft(data);

  // Submit via tRPC
  await trpc.codebases.create.mutate(draft);
};
```

## Additional Resources

See **`references/multi-step-forms.md`** for detailed implementation of complex wizards with stepper context.

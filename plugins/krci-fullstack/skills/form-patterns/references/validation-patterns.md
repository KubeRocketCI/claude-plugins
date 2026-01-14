# Form Validation Patterns

Comprehensive guide for implementing form validation using Tanstack Form's validation system.

## Validation Levels

Tanstack Form supports three levels of validation:
1. **Field-Level Validation** - Validates individual fields
2. **Async Validation** - Server-side or async field validation
3. **Form-Level Validation** - Cross-field validation

## Field-Level Validation

Add validators to individual fields using the `validators` prop on `form.Field`:

```typescript
<form.Field
  name="email"
  validators={{
    onChange: ({ value }) => {
      if (!value) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "Invalid email format";
      }
      return undefined;
    },
  }}
>
  {(field) => <TextField field={field} label="Email" />}
</form.Field>
```

### Validation Triggers

- `onChange` - Validates on every change
- `onBlur` - Validates when field loses focus
- `onMount` - Validates when field mounts
- `onSubmit` - Validates only on form submission

### Multiple Validators

```typescript
<form.Field
  name="password"
  validators={{
    onChange: ({ value }) => {
      if (!value) return "Password is required";
      if (value.length < 8) return "Password must be at least 8 characters";
      return undefined;
    },
    onBlur: ({ value }) => {
      // Additional check on blur
      if (!/[A-Z]/.test(value)) return "Password must contain uppercase letter";
      return undefined;
    },
  }}
>
  {(field) => <TextField field={field} label="Password" type="password" />}
</form.Field>
```

## Async Validation

For server-side validation or async checks:

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
    onChangeAsyncDebounceMs: 500, // Debounce to avoid excessive API calls
  }}
>
  {(field) => <TextField field={field} label="Username" />}
</form.Field>
```

### Async Validation Best Practices

1. **Debounce**: Always set `onChangeAsyncDebounceMs` (300-500ms) to avoid excessive API calls
2. **Loading State**: Check `field.state.meta.isValidating` to show loading indicator
3. **Error Handling**: Catch and handle API errors gracefully
4. **Cancel Requests**: Tanstack Form automatically cancels previous async validations

### Async with Loading Indicator

```typescript
<form.Field
  name="email"
  validators={{
    onChangeAsync: async ({ value }) => {
      const response = await checkEmailAvailable(value);
      return response.available ? undefined : "Email already registered";
    },
  }}
  validatorOptions={{
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => (
    <div>
      <TextField field={field} label="Email" />
      {field.state.meta.isValidating && (
        <span className="text-sm text-muted-foreground">Checking...</span>
      )}
    </div>
  )}
</form.Field>
```

## Form-Level Validation

Validate across multiple fields using form-level validators:

```typescript
const form = useForm<FormValues>({
  defaultValues: {
    password: "",
    confirmPassword: "",
  },
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

### Complex Cross-Field Validation

```typescript
const form = useForm<FormValues>({
  defaultValues: {
    startDate: null,
    endDate: null,
    type: "",
  },
  validators: {
    onChange: ({ value }) => {
      const errors: Record<string, string> = {};

      // Date range validation
      if (value.startDate && value.endDate) {
        if (new Date(value.endDate) < new Date(value.startDate)) {
          errors.endDate = "End date must be after start date";
        }
      }

      // Conditional required field
      if (value.type === "custom" && !value.customValue) {
        errors.customValue = "Custom value is required for custom type";
      }

      return Object.keys(errors).length > 0 ? { fields: errors } : undefined;
    },
  },
});
```

## Using Zod Schemas

For complex validation, use Zod schemas:

```typescript
import { z } from "zod";

const codebaseSchema = z.object({
  name: z.string()
    .min(1, "Name is required")
    .max(63, "Name too long")
    .regex(/^[a-z0-9-]+$/, "Only lowercase alphanumeric and hyphens"),
  gitUrl: z.string().url("Invalid URL format"),
  branch: z.string().optional(),
  type: z.enum(["application", "library", "autotests"]),
});

// Use in field validator
<form.Field
  name="name"
  validators={{
    onChange: ({ value }) => {
      try {
        codebaseSchema.shape.name.parse(value);
        return undefined;
      } catch (error) {
        return error.errors[0]?.message || "Invalid value";
      }
    },
  }}
>
  {(field) => <TextField field={field} label="Name" />}
</form.Field>
```

## Validation Patterns

### Required Field

```typescript
validators={{
  onChange: ({ value }) => !value ? "This field is required" : undefined,
}}
```

### Email Validation

```typescript
validators={{
  onChange: ({ value }) => {
    if (!value) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      return "Invalid email format";
    }
    return undefined;
  },
}}
```

### URL Validation

```typescript
validators={{
  onChange: ({ value }) => {
    if (!value) return undefined; // Optional
    try {
      new URL(value);
      return undefined;
    } catch {
      return "Invalid URL format";
    }
  },
}}
```

### Number Range

```typescript
validators={{
  onChange: ({ value }) => {
    const num = Number(value);
    if (isNaN(num)) return "Must be a number";
    if (num < 1 || num > 100) return "Must be between 1 and 100";
    return undefined;
  },
}}
```

### Pattern Matching

```typescript
validators={{
  onChange: ({ value }) => {
    if (!/^[a-z0-9-]+$/.test(value)) {
      return "Only lowercase letters, numbers, and hyphens allowed";
    }
    return undefined;
  },
}}
```

### Conditional Validation

```typescript
<form.Field
  name="customValue"
  validators={{
    onChange: ({ value, fieldApi }) => {
      const formValues = fieldApi.form.state.values;
      // Only validate if type is "custom"
      if (formValues.type === "custom" && !value) {
        return "Custom value is required";
      }
      return undefined;
    },
  }}
>
  {(field) => <TextField field={field} label="Custom Value" />}
</form.Field>
```

## Error Display

Errors are automatically extracted and displayed by preset components:

```typescript
// In preset component
const error = field.state.meta.errors?.[0];
const hasError = !!error;
const errorMessage = hasError ? (error as string) : undefined;
```

### Manual Error Display

```typescript
<form.Field name="username">
  {(field) => (
    <div>
      <Input
        value={field.state.value}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      {field.state.meta.errors.length > 0 && (
        <span className="text-red-500 text-sm">
          {field.state.meta.errors[0]}
        </span>
      )}
    </div>
  )}
</form.Field>
```

## Programmatic Validation

Trigger validation manually:

```typescript
// Validate single field
await form.validateField("email", "change");

// Validate all fields
await form.validateAllFields("change");

// Check if form is valid
const isValid = form.state.isValid;
```

## Best Practices

1. **Return undefined for valid**: Always return `undefined` (not null or empty string) for valid fields
2. **Single error message**: Return one clear error message per validation
3. **User-friendly messages**: Write clear, actionable error messages
4. **Debounce async**: Always debounce async validation (300-500ms)
5. **Validate on blur**: For heavy validation, use `onBlur` instead of `onChange`
6. **Form-level for cross-field**: Use form-level validators when fields depend on each other
7. **Zod for complex rules**: Use Zod schemas for complex validation logic
8. **Show loading state**: Display loading indicator during async validation

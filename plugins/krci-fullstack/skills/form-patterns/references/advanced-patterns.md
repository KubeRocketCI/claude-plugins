# Advanced Form Patterns

## Validation Patterns

### Inline Zod Validation

Most common pattern - define validation directly in field:

```typescript
<form.AppField
  name="email"
  validators={{
    onChange: z.string().email("Invalid email address"),
  }}
>
  {(field) => <field.FormTextField label="Email" />}
</form.AppField>
```

### Inline Function Validation

For simple or dynamic validation:

```typescript
<form.AppField
  name="age"
  validators={{
    onChange: ({ value }) => {
      if (!value) return "Age is required";
      if (value < 18) return "Must be 18 or older";
      return undefined;
    },
  }}
>
  {(field) => <field.FormTextField type="number" label="Age" />}
</form.AppField>
```

### Conditional Validation

Access other field values for conditional validation:

```typescript
<form.AppField
  name="template"
  validators={{
    onChange: ({ value }) => {
      const creationMethod = form.store.state.values.creationMethod;
      return creationMethod === "template" && !value
        ? "Select a template"
        : undefined;
    },
  }}
>
  {(field) => <field.FormRadioGroup options={templates} />}
</form.AppField>
```

### Schema-Based Validation

For complex forms with cross-field validation:

```typescript
// schema.ts
import { z } from "zod";

const baseSchema = z.object({
  name: z.string().min(2, "Name too short").max(30, "Name too long"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
});

export const registrationSchema = baseSchema.superRefine((data, ctx) => {
  // Cross-field validation
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["confirmPassword"],
      message: "Passwords don't match",
    });
  }
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;
```

**Note**: TanStack Form doesn't use `zodResolver` like React Hook Form. Instead, use inline validators or validate the entire form on submit.

### Validation Timing

```typescript
<form.AppField
  name="username"
  validators={{
    onChange: z.string().min(3, "Too short"),     // Validates on every change
    onBlur: z.string().min(3, "Too short"),       // Validates on blur
  }}
>
  {(field) => <field.FormTextField label="Username" />}
</form.AppField>
```

## Field Listeners (Side Effects)

Execute side effects when field values change:

```typescript
<form.AppField
  name="language"
  validators={{ onChange: z.string().min(1, "Select language") }}
  listeners={{
    onChange: ({ value }) => {
      // Reset dependent fields when language changes
      form.setFieldValue("framework", "");
      form.setFieldValue("buildTool", "");
    },
  }}
>
  {(field) => <field.FormCombobox label="Language" options={languages} />}
</form.AppField>
```

## Common Patterns

### Filter Forms

No submit button, real-time filtering:

```typescript
const filterForm = useAppForm({
  defaultValues: { search: "", category: "all" },
  // No onSubmit needed
});

// Subscribe to changes
useEffect(() => {
  const unsubscribe = filterForm.store.subscribe(() => {
    const values = filterForm.store.state.values;
    applyFilters(values);
  });
  return unsubscribe;
}, [filterForm]);
```

### Dynamic Field Lists

Add/remove fields dynamically:

```typescript
const [fields, setFields] = useState([{ id: 1, name: "" }]);

const addField = () => {
  setFields([...fields, { id: Date.now(), name: "" }]);
};

const removeField = (id: number) => {
  setFields(fields.filter(f => f.id !== id));
};

return (
  <>
    {fields.map((field, index) => (
      <form.AppField key={field.id} name={`items.${index}.name`}>
        {(field) => (
          <div className="flex gap-2">
            <field.FormTextField label={`Item ${index + 1}`} />
            <Button onClick={() => removeField(field.id)}>Remove</Button>
          </div>
        )}
      </form.AppField>
    ))}
    <Button onClick={addField}>Add Item</Button>
  </>
);
```

### Dependent Selects

Cascade updates through multiple fields:

```typescript
<form.AppField
  name="country"
  listeners={{
    onChange: ({ value }) => {
      form.setFieldValue("state", "");
      form.setFieldValue("city", "");
      loadStates(value);
    },
  }}
>
  {(field) => <field.FormSelect options={countries} />}
</form.AppField>

<form.AppField
  name="state"
  listeners={{
    onChange: ({ value }) => {
      form.setFieldValue("city", "");
      loadCities(value);
    },
  }}
>
  {(field) => <field.FormSelect options={states} />}
</form.AppField>

<form.AppField name="city">
  {(field) => <field.FormSelect options={cities} />}
</form.AppField>
```

## Troubleshooting

### Field Not Updating

Ensure you're using controlled components correctly:

```typescript
// Wrong - accessing field.state.value directly without render prop
const field = useFieldContext<string>();
return <Input value={field.state.value} />; // Won't update

// Correct - use form.AppField render prop
<form.AppField name="name">
  {(field) => <field.FormTextField />}
</form.AppField>
```

### Validation Not Running

Check validator timing:

```typescript
// Runs only on change
validators={{ onChange: z.string().min(1) }}

// Runs only on blur
validators={{ onBlur: z.string().min(1) }}

// Runs on both
validators={{
  onChange: z.string().min(1),
  onBlur: z.string().min(1),
}}
```

### Type Errors

Ensure form type matches field names:

```typescript
type FormData = {
  name: string;
  age: number;
};

const form = useAppForm<FormData>({ /* ... */ });

// Correct - 'name' exists in FormData
<form.AppField name="name">

// Error - 'email' doesn't exist in FormData
<form.AppField name="email">
```

## Migration from React Hook Form

If you see old code using React Hook Form, update as follows:

| React Hook Form | TanStack Form (Current) |
|----------------|-------------------------|
| `useForm()` | `useAppForm()` |
| `<FormProvider>` | Not needed - form instance passed directly |
| `<Controller name="x">` | `<form.AppField name="x">` |
| `useFormContext()` | `form` instance from parent or custom hook |
| `zodResolver(schema)` | Inline validators or manual schema validation |
| `methods.handleSubmit(onSubmit)` | `form.handleSubmit()` with onSubmit in `useAppForm` |
| `register("name")` | Not used - `form.AppField` handles registration |

**Example Migration:**

```typescript
// Old (React Hook Form)
const methods = useForm({
  resolver: zodResolver(schema),
});

<FormProvider {...methods}>
  <Controller
    name="name"
    control={methods.control}
    render={({ field }) => <Input {...field} />}
  />
</FormProvider>

// New (TanStack Form)
const form = useAppForm({
  defaultValues: { name: "" },
});

<form.AppField
  name="name"
  validators={{ onChange: z.string().min(1) }}
>
  {(field) => <field.FormTextField label="Name" />}
</form.AppField>
```

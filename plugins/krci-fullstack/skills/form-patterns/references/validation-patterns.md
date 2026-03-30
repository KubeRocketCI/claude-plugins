# Validation Patterns

Read this when implementing complex validation logic: async checks, cross-field dependencies, conditional rules, or programmatic validation.

## Validation Timing

TanStack Form supports multiple validation triggers on `form.AppField`:

- **`onChange`** -- validates on every value change (most common)
- **`onBlur`** -- validates when field loses focus (use for expensive checks)
- **`onChangeAsync`** -- debounced async validation (server-side checks)
- **`onSubmit`** -- validates only on form submission

You can combine multiple triggers on the same field. Each trigger runs independently.

## Async Validation

For server-side uniqueness checks or API validation:

```typescript
<form.AppField
  name="username"
  validators={{
    onChangeAsync: async ({ value }) => {
      const exists = await checkUsernameExists(value);
      return exists ? "Username already taken" : undefined;
    },
  }}
  validatorOptions={{
    onChangeAsyncDebounceMs: 500,
  }}
>
  {(field) => (
    <div>
      <field.FormTextField label="Username" />
      {field.state.meta.isValidating && (
        <span className="text-muted-foreground text-sm">Checking...</span>
      )}
    </div>
  )}
</form.AppField>
```

Always set `onChangeAsyncDebounceMs` (300-500ms) to avoid excessive API calls. TanStack Form automatically cancels previous async validations when a new one starts.

## Cross-Field Validation

Use form-level validators when fields depend on each other. Pass a Zod schema or function to `useAppForm`'s `validators` option:

```typescript
const form = useAppForm({
  defaultValues,
  validators: {
    onChange: ({ value }) => {
      if (value.password !== value.confirmPassword) {
        return { fields: { confirmPassword: "Passwords must match" } };
      }
      return undefined;
    },
  },
});
```

For complex cross-field rules, the portal uses `z.discriminatedUnion().superRefine()` with per-step validation helpers. Read the wizard `schema.ts` files for examples.

## Conditional Validation

Validate a field only when another field has a specific value:

```typescript
<form.AppField
  name="customValue"
  validators={{
    onChange: ({ value }) => {
      const type = form.store.state.values.type;
      if (type === "custom" && !value) {
        return "Custom value is required when type is custom";
      }
      return undefined;
    },
  }}
>
  {(field) => <field.FormTextField label="Custom Value" />}
</form.AppField>
```

Access other field values via `form.store.state.values` inside the validator function.

## Programmatic Validation

Trigger validation outside of user interaction:

```typescript
// Validate a single field
await form.validateField("email", "change");

// Validate all fields
await form.validateAllFields("change");

// Check form validity
const isValid = form.store.state.isValid;
```

## Error Display

Built-in form components (`FormTextField`, `FormCombobox`, etc.) handle error display automatically. They read `field.state.meta.errors` and show the first error when the field is touched.

The `extractErrorMessage` utility in `core/components/form/utils/` handles TanStack Form's error format (which can be strings, objects, or arrays).

## Key Rules

1. **Return undefined for valid** -- not null, not empty string
2. **One clear message per validation** -- avoid combining multiple issues into one string
3. **Zod inline for simple rules** -- `validators={{ onChange: z.string().min(1, "Required") }}`
4. **Functions for conditional rules** -- when you need to read other field values
5. **Form-level for cross-field** -- when validation involves multiple fields together
6. **Global schemas in form root** -- declare shared/reusable Zod schemas in the form's root folder so they can be imported by multiple steps or components
7. **Debounce async** -- always set 300-500ms debounce for async validators

# Real-World Form Examples

Extracted patterns from production wizards.

## Simple Filter Form (No Submit)

**Location**: `CreateCodebaseWizard/components/fields/TemplateSelection/`

```typescript
const filterForm = useAppForm({
  defaultValues: { search: "", category: "all" },
});

// Subscribe to changes
useEffect(() => {
  const unsubscribe = filterForm.store.subscribe(() => {
    setSearchValue(filterForm.state.values.search);
    setCategoryValue(filterForm.state.values.category);
  });
  return unsubscribe;
}, [filterForm]);

// Render
<filterForm.AppField name="search">
  {(field) => <field.FormTextField placeholder="Search..." />}
</filterForm.AppField>
```

**Pattern**: Real-time filtering without submit button.

---

## Conditional Validation

**Location**: `CreateCodebaseWizard/components/fields/TemplateSelection/`

```typescript
<wizardForm.AppField
  name="ui_creationTemplate"
  validators={{
    onChange: ({ value }) => {
      const method = wizardForm.store.state.values.ui_creationMethod;
      return method === "template" && !value
        ? "Select a template"
        : undefined;
    },
  }}
>
  {(field) => <field.FormRadioGroup options={templates} />}
</wizardForm.AppField>
```

**Pattern**: Validation depends on another field's value.

---

## Field with Side Effects

**Location**: `CreateCodebaseWizard/components/fields/Lang/`

```typescript
<form.AppField
  name="lang"
  validators={{ onChange: z.string().min(1, "Select language") }}
  listeners={{
    onChange: () => {
      // Reset dependent fields when language changes
      form.setFieldValue("framework", "");
      form.setFieldValue("buildTool", "");
    },
  }}
>
  {(field) => (
    <field.FormCombobox
      label="Code language"
      options={languageOptions}
    />
  )}
</form.AppField>
```

**Pattern**: Cascade field resets on parent field change.

---

## Reusable Field Component

**Location**: `CreateCodebaseWizard/components/fields/GitlabCiTemplate/`

```typescript
// Extract field logic to reusable component
export const GitlabCiTemplate: React.FC = () => {
  const form = useCreateCodebaseForm(); // Custom hook for wizard form

  const options = useMemo(() => {
    return configMaps.map(cm => ({
      value: cm.metadata.name,
      label: (
        <span className="flex items-center gap-2">
          <span>{cm.metadata.name}</span>
          {cm.isDefault && <span className="text-xs">(Default)</span>}
        </span>
      ),
    }));
  }, [configMaps]);

  return (
    <form.AppField name={NAMES.ui_gitlabCiTemplate}>
      {(field) => (
        <field.FormCombobox
          label="GitLab CI Template"
          tooltipText="CI/CD pipeline template"
          options={options}
        />
      )}
    </form.AppField>
  );
};

// Usage in wizard step
<GitlabCiTemplate />
```

**Pattern**: Encapsulate field logic in component, use custom hook to access form.

---

## Rich RadioGroup Options

**Location**: `CreateCodebaseWizard/components/fields/TemplateSelection/`

```typescript
const options = templates.map(t => ({
  value: t.metadata.name,
  label: t.spec.displayName,
  description: (
    <div className="space-y-2">
      <p className="text-xs">{t.spec.description}</p>
      <div className="grid grid-cols-3 gap-2">
        <div className="flex items-center gap-1">
          <Icon name={t.language} />
          <span className="text-xs">{t.language}</span>
        </div>
        {/* More metadata */}
      </div>
    </div>
  ),
  icon: t.icon ? <img src={t.iconUrl} width={20} height={20} /> : undefined,
}));

<field.FormRadioGroup
  options={options}
  variant="horizontal"
  classNames={{
    container: "grid-cols-4",
    item: "p-3",
  }}
/>
```

**Pattern**: Rich content in radio options with icons and descriptions.

---

## Reactive Field Value

**Location**: `CreateCodebaseWizard/components/fields/Lang/`

```typescript
import { useStore } from "@tanstack/react-form";

const Lang: React.FC = () => {
  const form = useCreateCodebaseForm();

  // Reactively watch other fields
  const typeValue = useStore(form.store, (s) => s.values.type);
  const strategyValue = useStore(form.store, (s) => s.values.strategy);

  // Compute options based on watched values
  const options = useMemo(() => {
    const mapping = getCodebaseMappingByType(typeValue);
    return Object.values(mapping).map(m => ({
      value: m.language.value,
      label: m.language.name,
      disabled: m.language.value === "other" && strategyValue === "create",
    }));
  }, [typeValue, strategyValue]);

  return <form.AppField name="lang">{/* ... */}</form.AppField>;
};
```

**Pattern**: Use `useStore` to reactively watch other field values.

---

## Schema with Cross-Field Validation

**Location**: `CreateCodebaseWizard/schema.ts`

```typescript
const baseSchema = z.object({
  gitServer: z.string(),
  gitUrlPath: z.string().optional(),
  ui_repositoryOwner: z.string().optional(),
  ui_repositoryName: z.string().optional(),
});

export const schema = baseSchema.superRefine((data, ctx) => {
  const isGerrit = data.gitServer === "gerrit";

  if (isGerrit) {
    if (!data.gitUrlPath || data.gitUrlPath.length < 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gitUrlPath"],
        message: "Git URL path must be at least 3 characters",
      });
    }
  } else {
    if (!data.ui_repositoryOwner) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ui_repositoryOwner"],
        message: "Select owner",
      });
    }
    if (!data.ui_repositoryName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ui_repositoryName"],
        message: "Enter repository name",
      });
    }
  }
});
```

**Pattern**: Use `superRefine` for conditional validation based on field values.

---

## Field Name Constants

**Location**: `CreateCodebaseWizard/names.ts`

```typescript
export const NAMES = {
  // Submitted fields
  name: "name",
  gitServer: "gitServer",
  type: "type",

  // UI-only fields (prefixed)
  ui_creationMethod: "ui_creationMethod",
  ui_creationTemplate: "ui_creationTemplate",
  ui_repositoryOwner: "ui_repositoryOwner",
} as const;

// Usage
<form.AppField name={NAMES.name}>
```

**Pattern**: Centralize field names, prefix UI-only fields with `ui_`.

---

## Step Groupings

**Location**: `CreateCodebaseWizard/constants.ts`

```typescript
export const FORM_PARTS = {
  METHOD: ["ui_creationMethod", "ui_creationTemplate", "type"],
  GIT_SETUP: ["name", "gitServer", "repositoryUrl", "defaultBranch"],
  BUILD_CONFIG: ["lang", "framework", "buildTool"],
  REVIEW: [],
} as const;

// Validate current step before proceeding
const handleNext = async () => {
  const fieldsToValidate = FORM_PARTS[currentStep];
  const results = await Promise.all(
    fieldsToValidate.map(field => form.validateField(field))
  );
  const hasErrors = results.some(r => r.length > 0);
  if (!hasErrors) setStep(prev => prev + 1);
};
```

**Pattern**: Group fields by wizard step for partial validation.

---

## Complete Wizard Structure

**Minimal example** based on CreateCodebaseWizard:

```
CreateResourceWizard/
├── index.tsx                 # Main wrapper
├── constants.ts              # FORM_PARTS, WIZARD_GUIDE_STEPS
├── names.ts                  # NAMES constant
├── schema.ts                 # Zod schema with superRefine
├── providers/
│   ├── form/
│   │   ├── provider.tsx     # Wraps useAppForm
│   │   ├── hooks.ts         # useCreateResourceForm()
│   │   └── context.ts       # Form context
│   └── stepper/             # Step navigation
├── components/
│   ├── steps/
│   │   ├── Step1.tsx
│   │   ├── Step2.tsx
│   │   └── ReviewStep.tsx
│   └── fields/              # Reusable field components
│       ├── FieldA/
│       └── FieldB/
└── hooks/
    └── useSubmit.ts         # Submission logic
```

---

## Form Custom Hook Pattern

**Location**: `CreateCodebaseWizard/providers/form/hooks.ts`

```typescript
import { useContext } from "react";
import { FormContext } from "./context";

export const useCreateCodebaseForm = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useCreateCodebaseForm must be used within FormProvider");
  }
  return context;
};
```

**Location**: `CreateCodebaseWizard/providers/form/provider.tsx`

```typescript
export const FormProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const form = useAppForm<CreateCodebaseFormValues>({
    defaultValues: getDefaultValues(),
    onSubmit: async (values) => {
      // Submit logic
    },
  });

  return (
    <FormContext.Provider value={form}>
      {children}
    </FormContext.Provider>
  );
};
```

**Pattern**: Wrap `useAppForm` in provider, access via custom hook.

---

## Key Takeaways

1. **Field name constants** - Always use `NAMES` object
2. **UI-only fields** - Prefix with `ui_` (not submitted)
3. **Reusable fields** - Extract to components, access form via custom hook
4. **Step validation** - Group fields by step in `FORM_PARTS`
5. **Cross-field validation** - Use `superRefine` in schema
6. **Reactive values** - Use `useStore` to watch other fields
7. **Side effects** - Use `listeners.onChange` to update dependent fields

---

## Reference Locations

- **CreateCodebaseWizard**: `/modules/platform/codebases/pages/create/components/CreateCodebaseWizard/`
- **CreateStageWizard**: `/modules/platform/cdpipelines/pages/stages/create/components/CreateStageWizard/`
- **Form Components**: `/core/form-temp/components/`
- **Providers**: `/core/providers/Stepper/`, `/core/providers/FormGuide/`

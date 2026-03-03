---
name: Tour Patterns
description: This skill should be used when the user asks to "add tour", "create guide", "implement walkthrough", "Joyride", "tour steps", "page guide", "help popup", "feature intro", or mentions interactive tours, user onboarding, or guided experiences.
version: 0.1.0
---

Implement interactive tours and help popups using react-joyride with modular configuration, step navigation, and visual feedback.

## Purpose

Guide tour implementation using the portal's modular tour system with automatic triggers, navigation prerequisites, tab highlighting, and informative popups.

## Core Architecture

**Tours Module**: Centralized tour management with react-joyride, supporting manual triggers, auto-activation, nested navigation, and visual state feedback.

**Key Components**:

- `@/modules/tours` - ToursProvider, hooks, config, utilities
- `@/core/components/PageGuide` - PageGuideButton for manual tour activation
- Module-specific tour configs - Each module exports its tours

## Tour Types

- **Manual tours** (`trigger: "manual"`) - Started via PageGuideButton
- **Auto tours** (`trigger: "onMount"`) - Auto-start when eligible
- **Route tours** (`trigger: "route"`) - Auto-start on route navigation
- **Popups** (`type: "popup"`) - Single-step informative hints

## Tour Configuration Structure

Tours are modular - each feature module exports its own:

```
modules/platform/codebases/
├── tours.tsx              # Export CODEBASES_TOURS
└── ...

modules/tours/
├── config.tsx             # GLOBAL_TOURS + imports all module tours
├── types.ts               # TourMetadata, prerequisites, step config
├── providers/
│   └── provider.tsx       # ToursProvider with navigation logic
└── utils/
    ├── waitForElement.ts  # MutationObserver-based element detection
    └── utils.ts           # isTourEligible, route matching
```

## Implementation Steps

### 1. Define Module Tours

Create `tours.tsx` in your module:

```typescript
// modules/platform/codebases/tours.tsx
import { TourMetadata } from "@/modules/tours/types";
import { PATH_PROJECT_DETAILS_FULL } from "@/core/router/paths";
import { OverviewHelp, PipelinesHelp } from "./components/help";

export const CODEBASES_TOURS: Record<string, TourMetadata> = {
  projectDetailsTour: {
    id: "project_details_tour",
    title: "Project Details Tour",
    description: "Learn about tabs and features",
    type: "tour",
    trigger: "manual",
    showOnce: false,

    // Tour-level prerequisite (where it can be activated)
    prerequisite: {
      routePattern: "/c/:clusterName/projects/:namespace/:name",
      requiredSearch: (search) => !search.tab || search.tab === "overview",
    },

    steps: [
      {
        target: "[data-tour='project-tabs']",
        content: <OverviewHelp />,
        placement: "bottom",
        disableBeacon: true,
        // Step prerequisite (navigate before showing step)
        prerequisite: {
          to: PATH_PROJECT_DETAILS_FULL,
          search: (prev) => ({ ...prev, tab: "overview" }),
          waitFor: "[data-tour='project-tabs']",
        },
      },
      {
        target: "[data-tour='pipeline-history']",
        content: <PipelinesHelp />,
        placement: "top",
        prerequisite: {
          to: PATH_PROJECT_DETAILS_FULL,
          search: (prev) => ({
            ...prev,
            tab: "pipelines",
            pipelinesTab: "tekton-results"  // Nested tab navigation
          }),
          waitFor: "[data-tour='pipeline-history']",
          stabilizationDelay: 300,  // Wait for tab animation
        },
      },
    ],
  },
};
```

### 2. Register in Central Config

```typescript
// modules/tours/config.tsx
import { CODEBASES_TOURS } from "@/modules/platform/codebases/tours";

const GLOBAL_TOURS: Record<string, TourMetadata> = {
  welcome: {
    type: "tour",
    trigger: "onMount",
    prerequisite: { routePattern: "/home" },
    // ...
  },
  pinnedItems: { type: "popup", trigger: "manual", /* ... */ },
};

export const TOURS_CONFIG = {
  ...GLOBAL_TOURS,
  ...CODEBASES_TOURS,
};
```

### 3. Add Data-Tour Attributes

Target tour steps using `data-tour` attributes:

```typescript
// In your component
<TabsList data-tour="project-tabs">
  {/* ... */}
</TabsList>

<div data-tour="pipeline-history">
  <TektonResultsTable />
</div>

// For DataTable slots
const tableSlots = React.useMemo(
  () => ({
    header: {
      component: <CodebaseFilter />,
      slotProps: { "data-tour": "projects-filter" },
    },
  }),
  []
);
```

### 4. Add Manual Trigger (Optional)

```typescript
import { PageGuideButton } from "@/core/components/PageGuide";

<PageGuideButton tourId="projectDetailsTour" />
```

## Tour Types Detail

### TourMetadata Fields

```typescript
interface TourMetadata {
  id: string;                    // Unique identifier
  title: string;                 // Display name
  description: string;           // Short description
  type: "tour" | "popup";        // Multi-step vs single informative
  trigger: "manual" | "onMount" | "route";
  showOnce?: boolean;            // Only show once (default: false)
  prerequisite?: TourPrerequisite;  // Where it can activate
  steps: Step[];                 // Joyride steps
}
```

### Tour Prerequisites

Control where tours can activate:

```typescript
interface TourPrerequisite {
  // Route pattern with params (/c/:clusterName/projects/:namespace/:name)
  routePattern?: string;

  // Required search params (exact match or validator function)
  requiredSearch?: Record<string, unknown> | ((search: Record<string, unknown>) => boolean);

  // Custom validation
  validator?: (context: TourActivationContext) => boolean;
}

interface TourActivationContext {
  path: string;                  // Current pathname
  params: Record<string, string>;  // Route params
  search: Record<string, unknown>; // Search params
}
```

**Example**: Only activate on project details overview tab:

```typescript
prerequisite: {
  routePattern: "/c/:clusterName/projects/:namespace/:name",
  requiredSearch: { tab: "overview" },
}
```

### Step Prerequisites (Navigation)

Navigate before showing a step:

```typescript
interface StepPrerequisite {
  to: string;                    // Route path constant
  params?: Record<string, string> | ((current: Record<string, string>) => Record<string, string>);
  search?: Record<string, unknown> | ((prev: Record<string, unknown>) => Record<string, unknown>);
  waitFor?: string | string[];   // Selectors to wait for
  stabilizationDelay?: number;   // Delay after elements appear
}
```

**Example**: Navigate to pipelines tab, then inner tekton-results tab:

```typescript
prerequisite: {
  to: PATH_PROJECT_DETAILS_FULL,
  search: (prev) => ({
    ...prev,
    tab: "pipelines",
    pipelinesTab: "tekton-results"
  }),
  waitFor: "[data-tour='pipeline-history']",
  stabilizationDelay: 300,  // Allow transition animation
}
```

## Auto-Activation

### onMount Tours

Auto-start when user navigates to matching page:

```typescript
{
  id: "welcome",
  trigger: "onMount",
  prerequisite: { routePattern: "/home" },
  showOnce: true,  // Only show on first visit
  steps: [/* ... */],
}
```

### Route Tours

Auto-start on route change (if eligible):

```typescript
{
  id: "feature_intro",
  trigger: "route",
  prerequisite: {
    routePattern: "/features/:featureName",
    requiredSearch: { tab: "overview" },
  },
  showOnce: true,
  steps: [/* ... */],
}
```

**Note**: Tours respect `showOnce` and completion tracking. Set `showOnce: false` for repeatable tours.

## Tab Highlighting

Active tabs automatically highlight when tours navigate to them.

**How it works**:
- ToursProvider tracks `currentTourTab` from step prerequisites
- Tabs component uses `useTours()` to check if it's the focused tab
- Outline pulses initially (1.5s), then stays solid while on that step

**No additional code needed** - tabs automatically highlight if they have an `id` matching the tab search param.

**Tab Setup**:

```typescript
// Tabs must have id field matching search param value
const tabs = [
  {
    id: "overview",  // matches search.tab = "overview"
    label: "Overview",
    component: <Overview />
  },
  {
    id: "pipelines",  // matches search.tab = "pipelines"
    label: "Pipelines",
    component: <Pipelines />
  },
];
```

## Element Waiting

The `waitForElement` utility uses MutationObserver for efficient DOM detection:

```typescript
// Automatically used by ToursProvider, but can be used directly:
import { waitForElement } from "@/modules/tours/utils/waitForElement";

await waitForElement({
  selector: "[data-tour='my-element']",
  timeout: 5000,
  stabilizationDelay: 300,
});
```

**Best Practice**: Always specify `waitFor` in step prerequisites to ensure elements exist before showing step.

## Help Content Components

Create React components for tour content:

```typescript
// modules/platform/codebases/components/help/OverviewHelp.tsx
export const OverviewHelp = () => (
  <div>
    <p className="mb-2">
      The <strong>Overview</strong> tab shows project summary and recent activity.
    </p>
    <ul className="list-disc list-inside space-y-1">
      <li>View project metadata</li>
      <li>Check deployment status</li>
      <li>Monitor recent changes</li>
    </ul>
  </div>
);
```

**Keep content concise** - users want quick guidance, not documentation.

## Completion Tracking

Tours are tracked in localStorage:

```typescript
// Auto-tracked by ToursProvider
interface TourCompletion {
  tourId: string;
  completed: boolean;
  completedAt: string;
  trigger?: TourTriggerInfo;
}

// Check if completed
const { isTourCompleted } = useTours();
const hasSeenTour = isTourCompleted("project_details_tour");
```

## Best Practices

### 1. Modular Configuration

- Keep module tours in module directory (`modules/platform/codebases/tours.tsx`)
- Only global tours (welcome, general features) in central config
- Export as `ENTITY_TOURS` constant for clarity

### 2. Data-Tour Attributes

- Use descriptive names: `data-tour="project-tabs"` not `data-tour="tabs"`
- Add to wrapper elements, not deeply nested nodes
- For DataTable headers, use `slots.header.slotProps`

### 3. Prerequisites

- Always define tour-level prerequisites (where it can activate)
- Use step prerequisites for navigation (tabs, pages)
- Specify `waitFor` to prevent empty states

### 4. Content

- Keep help text concise (2-3 sentences or bullet list)
- Use React components for complex content
- Avoid redundant explanations of UI visible on screen

### 5. Placement

- `placement: "bottom"` for top elements (tabs, headers)
- `placement: "right"` for left sidebars
- `placement: "top"` for bottom elements
- Never center horizontally (overlaps navigation bar)

### 6. Timing

- Use `stabilizationDelay: 300` for animated transitions
- Default `waitFor` timeout is 5000ms (5s)
- Allow DOM to settle before showing step

### 7. Types

- Use `type: "popup"` for single-step informative hints
- Use `type: "tour"` for multi-step walkthroughs
- Set `showOnce: true` for onboarding, `false` for feature help

### 8. Accessibility

- All tours work with keyboard navigation (built-in)
- Tooltips auto-positioned to avoid overflow
- Overlay dimming helps focus attention

## Common Patterns

### Simple Feature Popup

```typescript
featurePopup: {
  id: "feature_popup",
  type: "popup",
  trigger: "manual",
  showOnce: false,
  steps: [{
    target: "[data-tour='feature']",
    content: <FeatureHelp />,
    placement: "right",
  }],
}
```

### Multi-Tab Tour

```typescript
multiTabTour: {
  id: "multi_tab_tour",
  type: "tour",
  trigger: "manual",
  showOnce: false,
  steps: [
    {
      target: "[data-tour='tab1-content']",
      content: <Tab1Help />,
      prerequisite: {
        to: PATH_DETAILS,
        search: { tab: "tab1" },
        waitFor: "[data-tour='tab1-content']",
      },
    },
    {
      target: "[data-tour='tab2-content']",
      content: <Tab2Help />,
      prerequisite: {
        to: PATH_DETAILS,
        search: { tab: "tab2" },
        waitFor: "[data-tour='tab2-content']",
        stabilizationDelay: 300,
      },
    },
  ],
}
```

### Route-Based Auto Tour

```typescript
autoTour: {
  id: "auto_tour",
  type: "tour",
  trigger: "route",
  showOnce: true,
  prerequisite: {
    routePattern: "/features/:featureId",
  },
  steps: [/* ... */],
}
```

## Reference Examples

Real implementations:

- **Project Details Tour**: `modules/platform/codebases/tours.tsx`
- **Projects List Tour**: `modules/platform/codebases/tours.tsx`
- **Welcome Tour**: `modules/tours/config.tsx` (global)
- **Form Guide Integration**: `core/providers/FormGuide/` (different pattern for form wizards)

## Integration with PageGuide

The PageGuideButton component validates prerequisites before starting:

```typescript
import { PageGuideButton } from "@/core/components/PageGuide";

// Automatically validates tour prerequisites
<PageGuideButton tourId="projectDetailsTour" />
```

**Validation**: If prerequisites aren't met, tour won't start and warning is logged. User can navigate to correct page first.

## Troubleshooting

**Tour doesn't start**: Check tour-level prerequisites match current route/search params

**Step shows empty state**: Add `waitFor` to step prerequisite and increase `stabilizationDelay`

**Tab doesn't highlight**: Ensure tab has `id` field matching the search param value (e.g., `tab: "overview"` → `id: "overview"`)

**Element not found**: Use `waitFor: [selector1, selector2]` array to wait for multiple elements

**Tooltip overlaps nav**: Change `placement` - avoid "top" for upper elements, avoid "bottom" for lower elements

## Key Files

- `/modules/tours/config.tsx` - Central tour registry
- `/modules/tours/types.ts` - TypeScript definitions
- `/modules/tours/providers/provider.tsx` - Tour orchestration logic
- `/modules/tours/utils/waitForElement.ts` - Element detection
- `/modules/tours/utils.ts` - Tour eligibility validation
- `/core/components/PageGuide/PageGuideButton.tsx` - Manual trigger
- `/core/providers/Tabs/components/Tabs/index.tsx` - Tab highlighting

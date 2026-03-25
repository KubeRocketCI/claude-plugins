---
name: Tour Patterns
description: This skill should be used when the user asks to "add tour", "create guide", "implement walkthrough", "Joyride", "tour steps", "page guide", "help popup", "feature intro", or mentions interactive tours, user onboarding, or guided experiences.
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

## Best Practices

### Modular Configuration

- Keep module tours in module directory (`modules/platform/codebases/tours.tsx`)
- Only global tours (welcome, general features) in central config
- Export as `ENTITY_TOURS` constant for clarity

### Data-Tour Attributes

- Use descriptive names: `data-tour="project-tabs"` not `data-tour="tabs"`
- Add to wrapper elements, not deeply nested nodes
- For DataTable headers, use `slots.header.slotProps`

### Prerequisites

- Always define tour-level prerequisites (where it can activate)
- Use step prerequisites for navigation (tabs, pages)
- Specify `waitFor` to prevent empty states

### Content

- Keep help text concise (2-3 sentences or bullet list)
- Use React components for complex content
- Avoid redundant explanations of UI visible on screen

### Placement

- `placement: "bottom"` for top elements (tabs, headers)
- `placement: "right"` for left sidebars
- `placement: "top"` for bottom elements
- Never center horizontally (overlaps navigation bar)

### Timing

- Use `stabilizationDelay: 300` for animated transitions
- Default `waitFor` timeout is 5000ms (5s)
- Allow DOM to settle before showing step

### Types

- Use `type: "popup"` for single-step informative hints
- Use `type: "tour"` for multi-step walkthroughs
- Set `showOnce: true` for onboarding, `false` for feature help

## Key Files

- `/modules/tours/config.tsx` - Central tour registry
- `/modules/tours/types.ts` - TypeScript definitions
- `/modules/tours/providers/provider.tsx` - Tour orchestration logic
- `/modules/tours/utils/waitForElement.ts` - Element detection
- `/modules/tours/utils.ts` - Tour eligibility validation
- `/core/components/PageGuide/PageGuideButton.tsx` - Manual trigger
- `/core/providers/Tabs/components/Tabs/index.tsx` - Tab highlighting

## References

For advanced patterns including auto-activation, tab highlighting, element waiting, help content components, completion tracking, common tour patterns, PageGuide integration, and troubleshooting, see `references/advanced-patterns.md`.

Real implementations:

- **Project Details Tour**: `modules/platform/codebases/tours.tsx`
- **Projects List Tour**: `modules/platform/codebases/tours.tsx`
- **Welcome Tour**: `modules/tours/config.tsx` (global)
- **Form Guide Integration**: `core/providers/FormGuide/` (different pattern for form wizards)

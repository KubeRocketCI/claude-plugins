---
name: Tour Patterns
description: This skill should be used whenever the user is building an interactive tour, walkthrough, onboarding flow, or guided help in the KubeRocketCI portal — phrasings like "add a tour", "create a guide or walkthrough", "react-joyride", "tour steps", "page guide", "PageGuideButton", "help popup / feature intro", "onboarding", "highlight this element on first visit", or cross-page tours with step prerequisites. Tours live in modules/tours and use react-joyride. Use it even when the user just says "walk new users through X". Note these near-misses — a static Radix tooltip or popover component is component-development, not a tour; the form wizard help sidebar (FormGuide) is form-patterns, not the tour PageGuide; plain navigation between pages is routing-permissions.
---

Implement interactive tours and help popups using react-joyride with modular configuration, step navigation, and visual feedback.

## Purpose

Guide tour implementation using the portal's modular tour system with automatic triggers, navigation prerequisites, tab highlighting, and informative popups.

## Core Architecture

The tour system is centralized in `modules/tours/` and uses react-joyride under the hood. Tours are configured declaratively and orchestrated by a single `ToursProvider` that handles activation, navigation between steps (including cross-page navigation), element waiting, and completion tracking.

**Key files to read**:

- `modules/tours/types.ts` -- All TypeScript types (TourMetadata, TourTrigger, StepPrerequisite, etc.)
- `modules/tours/config.tsx` -- Central tour registry. Global tours are defined here; module tours are imported.
- `modules/tours/providers/provider.tsx` -- ToursProvider with joyride orchestration, step navigation, and auto-trigger logic.
- `modules/tours/services/index.ts` -- localStorage-based completion tracking.
- `modules/tours/utils.ts` -- Tour eligibility checking and route matching.
- `core/components/PageGuide/PageGuideButton.tsx` -- Manual tour trigger button.

## Tour Types and Triggers

### Tour Types

- **`type: "tour"`** -- Multi-step walkthrough with navigation bar (Back/Next/Skip)
- **`type: "popup"`** -- Single-step informative hint (shows "Got it" button)

### Trigger Types

There are four trigger types:

- **`trigger: "manual"`** -- Started by user via PageGuideButton or programmatic call
- **`trigger: "onMount"`** -- Auto-starts when the app loads and prerequisites match (e.g., welcome tour)
- **`trigger: "route"`** -- Auto-starts when navigating to a matching route
- **`trigger: "feature"`** -- Triggered when a specific feature is encountered. Uses `featureId` to identify the feature (e.g., `featureId: "form-guide"` for the form guide toggle button)

### TourMetadata Interface

A tour is described by a `TourMetadata` object. The fields you set most are `id`, `title`, `description`, `type` (`"tour"` | `"popup"`, default `"tour"`), `trigger` (`"manual"` | `"onMount"` | `"route"` | `"feature"`), `showOnce`, and `steps`; plus, depending on the trigger, `routePattern` / `featureId` / `prerequisite`, and optional `minVersion`/`maxVersion` version gates. Read `modules/tours/types.ts` for the authoritative, current interface — it is the source of truth and it drifts.

## Implementation Steps

### 1. Define Module Tours

Create `tours.tsx` in your module directory:

```typescript
// modules/platform/myfeature/tours.tsx
import type { TourMetadata } from "@/modules/tours/types";
import { TourStepContent } from "@/modules/tours/components/TourStepContent";

export const MY_FEATURE_TOURS: Record<string, TourMetadata> = {
  myFeatureTour: {
    id: "my_feature_tour",
    title: "My Feature Tour",
    description: "Learn about this feature",
    type: "tour",
    trigger: "manual",
    showOnce: false,
    prerequisite: {
      routePattern: "/c/:clusterName/my-feature",
    },
    steps: [
      {
        target: "[data-tour='feature-header']",
        content: (
          <TourStepContent title="Feature Overview">
            <p>This is the main area where you manage your feature.</p>
          </TourStepContent>
        ),
        placement: "bottom",
        disableBeacon: true,
      },
    ],
  },
};
```

### 2. Register in Central Config

Add import to `modules/tours/config.tsx`:

```typescript
import { MY_FEATURE_TOURS } from "@/modules/platform/myfeature/tours";

export const TOURS_CONFIG: Record<string, TourMetadata> = {
  ...GLOBAL_TOURS,
  ...CDPIPELINE_TOURS,
  ...CODEBASES_TOURS,
  ...MY_FEATURE_TOURS,
};
```

### 3. Add Data-Tour Attributes

Target tour steps using `data-tour` attributes on your components:

```typescript
<div data-tour="feature-header">
  <h2>My Feature</h2>
</div>
```

Use descriptive names: `data-tour="project-tabs"` not `data-tour="tabs"`. Add to wrapper elements, not deeply nested nodes.

### 4. Add Manual Trigger (Optional)

```typescript
import { PageGuideButton } from "@/core/components/PageGuide";

<PageGuideButton tourId="myFeatureTour" />
```

## Step Prerequisites (Cross-Page Navigation)

Steps can navigate to a different route before showing. This is how tours span multiple pages or tabs:

```typescript
{
  target: "[data-tour='pipeline-history']",
  content: <PipelinesHelp />,
  placement: "top",
  prerequisite: {
    to: PATH_PROJECT_DETAILS_FULL,
    params: (current) => current,           // Preserve current route params
    search: (prev) => ({ ...prev, tab: "pipelines" }),  // Switch to pipelines tab
    waitFor: "[data-tour='pipeline-history']",          // Wait for element
    stabilizationDelay: 300,                            // Wait for animation
  },
}
```

The `StepPrerequisite` interface is defined in `modules/tours/types.ts`. Key fields: `to` (route path), `params`, `search`, `waitFor` (CSS selector or array), `stabilizationDelay` (ms).

## Tour-Level Prerequisites

Control where a tour can be activated:

```typescript
prerequisite: {
  routePattern: "/c/:clusterName/projects/:namespace/:name",
  requiredSearch: (search) => !search.tab || search.tab === "overview",
  validator: (context) => someCustomCheck(context),
}
```

Route patterns use `:param` syntax for dynamic segments. The `isTourEligible` function in `modules/tours/utils.ts` handles matching.

## Best Practices

### Configuration

- Keep module tours in the module directory (`modules/platform/codebases/tours.tsx`)
- Only global tours (welcome, general features) go in the central config
- Export as `ENTITY_TOURS` constant for clarity
- Use `showOnce: true` for onboarding, `false` for repeatable help

### Content

- Use `TourStepContent` component for consistent step formatting
- Keep help text concise (2-3 sentences or a short bullet list)
- Create React components for complex content
- Avoid explaining what is already visible on screen

### Placement

- `placement: "bottom"` for top elements (tabs, headers)
- `placement: "right"` for left sidebar items
- `placement: "top"` for bottom elements
- Avoid `placement: "center"` horizontally (overlaps navigation bar)

### Timing

- Use `stabilizationDelay: 300` for animated transitions (tabs, accordions)
- Default element wait timeout is 5000ms
- Always specify `waitFor` in step prerequisites to avoid showing steps before elements render

### Types

- Use `type: "popup"` for single-step informative hints
- Use `type: "tour"` for multi-step walkthroughs
- Use `trigger: "feature"` with `featureId` to introduce new UI features on first encounter

## Completion Tracking

Tours are tracked in localStorage via the services in `modules/tours/services/index.ts`. Completion records include timestamp, app version, and trigger type. Records are automatically cleaned up after 180 days.

The `useTours()` hook (from `modules/tours/providers/hooks.ts`) provides `startTour`, `skipTour`, `isTourCompleted`, `isRunning`, `isTourNavigating`, `currentTourTab` (used by the tab-highlighting feature), `setOnTourEnd`, `setStepCallback`, and other context values. Read `modules/tours/providers/types.ts` for the full `ToursContextValue`.

## Key Files Summary

| File | Purpose |
|------|---------|
| `modules/tours/types.ts` | All TypeScript interfaces |
| `modules/tours/config.tsx` | Central tour registry |
| `modules/tours/providers/provider.tsx` | Tour orchestration (joyride, navigation, auto-triggers) |
| `modules/tours/providers/hooks.ts` | `useTours()` and `useAutoTour()` hooks |
| `modules/tours/providers/types.ts` | Provider context type |
| `modules/tours/services/index.ts` | localStorage completion tracking |
| `modules/tours/utils.ts` | Tour eligibility, route matching |
| `modules/tours/utils/waitForElement.ts` | MutationObserver-based element detection |
| `core/components/PageGuide/PageGuideButton.tsx` | Manual trigger button |
| `modules/tours/components/TourStepContent/` | Standard step content wrapper |

## References

For advanced patterns including tab highlighting, element waiting details, auto-activation flow, common tour patterns (popup, multi-tab, route-based), PageGuide integration, and troubleshooting, see `references/advanced-patterns.md`. Read it when building complex tours with cross-page navigation or tab interaction.

Real implementations to study:

- `modules/platform/codebases/tours.tsx` -- Project details and list tours
- `modules/platform/cdpipelines/tours.tsx` -- CDPipeline tours
- `modules/tours/config.tsx` -- Global tours (welcome, pinned items, form guide, page guide)

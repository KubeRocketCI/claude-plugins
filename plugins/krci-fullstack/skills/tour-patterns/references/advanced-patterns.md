# Advanced Tour Patterns

Read this when building complex tours that involve auto-activation, cross-page tab navigation, element waiting, or when troubleshooting tour behavior.

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

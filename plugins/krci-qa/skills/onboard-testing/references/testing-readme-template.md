# Tests Directory Structure

<instructions>
This template is the single source of truth for the testing README.
KEEP IN SYNC: an identical copy lives in the sibling skill (setup-testing and onboard-testing each have one); edit both together.
Replace all {{placeholder}} tokens with values collected during setup, or inferred during onboarding.
Remove every <instructions>...</instructions> block from the final output.
All paths are relative to the features directory, which is auto-detected (e.g. `src/main/resources/features/`, `features/`, or `tests/features/`). This README lives at the root of that directory.
</instructions>

This directory contains all project tests written in Gherkin (BDD).

## Directory structure

<instructions>
During onboarding, replace this block with the actual on-disk tree under the features directory
(limit depth for very large trees). The example below shows a common multi-dimensional layout; a
flat `features/{Topic}.feature` layout is equally valid for smaller suites.
</instructions>

```
features/                                  # Gherkin feature files (.feature)
├── README.md                              # This file — testing conventions, single source of truth
├── ui_tests/                              # UI/functional features (optional split)
│   └── {{group_dim_1}}/                   # optional grouping dimension (e.g. CI tool)
│       └── {{group_dim_2}}/               # optional grouping dimension (e.g. provider/module)
│           └── {Topic}.feature
└── api_tests/                             # API features (optional split)
    ├── {{group_dim_1}}/{{group_dim_2}}/{Topic}.feature
    └── utility/cleanup/                   # optional maintenance/cleanup flows
```

Maintenance: when adding, removing, or renaming feature files, update the Directory structure above
in the same pull request so this document remains the single source of truth.

## How the QA agent works with tests

1. Locate the features directory and analyze existing coverage by searching it (Glob for `**/*.feature`, Grep across scenario titles, steps, and tags).
2. Decide on a testing strategy using the coverage decision matrix below.
3. Generate or extend Gherkin tests, reusing the suite's existing step phrasing, tag vocabulary, and placement.

### Coverage decision matrix

| Status | Meaning | Action |
|--------|---------|--------|
| Covered | An existing scenario already validates the acceptance criterion | No new scenario; optionally strengthen assertions |
| Partial | A related scenario exists but does not fully cover the criterion | Extend the existing scenario, or add a focused one alongside it |
| Not covered | No matching scenario exists | Create a new scenario in the directory matching the story's grouping dimensions |

### Discovery and search workflow

- Build normalized keyword variants from story terms (hyphen/underscore/space/camelCase; include relevant action/result modifiers).
- Detect grouping hints (e.g., UI vs API, CI tool, provider, module) and prioritize the likely directories observed in the tree.
- Search scenario titles, step lines, tags, and Examples with Grep; read the top candidate files in full before deciding.
- Present top candidates (path + snippet) for extension before proposing new files.

### Tagging system

Core tag families (generic; use only those that apply):

- Type: `@UI`, `@API`, `@E2E`, `@Integration`, `@Unit`
- Scope/suite: `@Smoke`, `@Regression`, `@ShortRegression`, `@Critical`, `@Negative`
- Non-functional: `@Performance`, `@Security`, `@Accessibility`, `@Compatibility`
- Lifecycle/maintenance: `@Cleanup`, `@DataSetup`, `@Migration`, `@Flaky`

<instructions>
Many suites use composite tags that concatenate grouping dimensions with a suite scope, e.g.
`@{{Dim1Pascal}}{{Dim2Pascal}}{{Suite}}` (such as `@TektonGerritUI`, `@TektonBitbucketShortRegression`).
During onboarding, detect the dominant composite pattern from existing tags and document it here as the
PRIMARY taxonomy; do not demote it to generic families. List the real top tags with counts.
</instructions>

Composite/suite tags (project-specific): {{composite_tag_pattern}}

Tag scoping rules:

- Tags above Feature apply to all scenarios
- Tags above a Scenario/Scenario Outline apply to that scenario
- Tags directly above an Examples block apply only to that Examples table

Recommended usage:

- Always include at least one type/grouping tag for filterability
- Add suite/run-scope tags to control selection windows in CI (`@Smoke`, `@ShortRegression`)
- Reuse the project's existing tag vocabulary; do not invent new conventions ad hoc

## How to add your existing tests

1. Placement: mirror the existing tree under the features directory and match the grouping dimensions already in use.
2. Naming convention: {{naming_convention}}
3. Structure guidelines:
   - Prefer Scenario Outline with one or more Examples tables when variants exist
   - Place tags directly above each Examples block when variants differ
   - Reuse existing step phrasing so scenarios bind to the current step definitions
4. UI/API alignment: keep core flows covered consistently across UI and API where both exist.

## Integration with the QA agent

Inputs:

- Stories with acceptance criteria (or pasted task context)
- Optional scope: grouping dimensions (provider/CI/module), test type (UI/API), priority/tags

Outputs:

- Coverage report with paths and tags
- Missing coverage and UI/API alignment hints
- Proposed next steps (extend scenarios vs create new file)

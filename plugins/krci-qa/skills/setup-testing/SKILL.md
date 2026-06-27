---
name: Setup Testing
description: This skill should be used only when no `.feature` files exist yet (a greenfield BDD setup) — "set up testing from scratch", "initialize BDD testing for a project with no feature files", "create the feature directory structure", or "first-time BDD setup". Runs a wizard to choose a features directory, create the structure, and generate the testing README. If `.feature` files already exist, use onboard-testing; if a testing README already exists, use edit-testing-settings.
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Setup Testing

Run an interactive first-run wizard to initialize a Gherkin testing workspace: locate or choose the features directory, collect configuration choices, create the directory structure, and generate the testing README from the template using confirmed selections.

Throughout this skill, "features directory" means the auto-detected or user-chosen root that holds `.feature` files. The testing README (single source of truth) lives at the root of that directory as `<features-dir>/README.md`.

## When to Use

- Fresh project with no `.feature` files and no testing README.
- Reconfiguring testing strategy, structure, or tagging conventions from scratch.

If `.feature` files already exist but no README, prefer `onboard-testing` (non-interactive analysis). If both exist, prefer `edit-testing-settings`.

## Workflow

1. **Locate or choose the features directory.** Run `Glob` for `**/*.feature` to detect any existing suite. If matches are found, report them and propose running `onboard-testing` instead; HALT for the user's decision. If none are found, propose a features directory path and HALT for confirmation. Suggest a default by project type:
   - Maven/Gradle/JVM project (a `pom.xml`, `build.gradle`, or `src/main` exists): `src/main/resources/features/`
   - Otherwise: `features/`

2. **Introduce the wizard.** Explain the wizard flow and expected outputs (features directory, structure, README, optional starter file). HALT for the user to confirm readiness.

3. **Gather configuration — one question at a time.** For each question: ask, HALT for the answer, echo back the interpreted value, and HALT for confirmation before the next question.

   Questions in sequence:
   - Test types to include — multi-select; default: `UI, API`. If both, use a `ui_tests/` and `api_tests/` split; if one, keep it flat.
   - Grouping dimensions under each test type — ordered list; default: none. Examples: CI tool (`tekton`, `jenkins`), provider (`gerrit`, `github`, `gitlab`, `bitbucket`), or module/domain. These become nested subdirectories.
   - Include a utilities/cleanup area? — default: `yes` (creates `api_tests/utility/cleanup/` or `features/utility/cleanup/`).
   - Tagging approach — default: generic families (see below). If composite suite tags are desired, capture the pattern (e.g. `@{Dim1}{Dim2}{Suite}`).
   - Naming convention for feature files — default: `PascalCase` (e.g., `PromoteApplication.feature`).
   - Create a starter example feature file? — default: `no`.

4. **Handle existing feature files.** If `.feature` files are found anywhere outside the chosen features directory, offer to move them in and HALT for confirmation. Never move files without approval.

5. **Present the plan.** Show a concise summary of the chosen features directory, directories to create, README sections to populate, and any files to import or move. HALT for user approval before writing anything.

6. **Show diff and final confirmation.** Preview the first 20–30 lines of the new README plus all file and folder actions. HALT for final confirmation. If the user declines at any point, allow revision or cancellation without writing any files.

7. **Create directory structure.** Based on selections, under the chosen features directory `<features-dir>/`:
   - If UI selected: `<features-dir>/ui_tests/<dim1>/<dim2>/...` (only the dimensions chosen)
   - If API selected: `<features-dir>/api_tests/<dim1>/<dim2>/...`
   - If only one test type: keep it flat at `<features-dir>/<dim1>/...`
   - If utilities enabled: `<features-dir>/api_tests/utility/cleanup/` (or `<features-dir>/utility/cleanup/` when there is no API split)

8. **Generate README block-by-block.** Use `references/testing-readme-template.md`; replace all `{{placeholder}}` tokens with confirmed values. Write the README to `<features-dir>/README.md`. Prompt for confirmation after rendering each section before writing:
   - Tests Directory Structure (reflect the structure just created)
   - How the QA agent works with tests
   - Discovery and search workflow
   - Tagging system (incorporate chosen families and any composite pattern; if none, set the composite line to "Not used — see core families above")
   - How to add your existing tests (include chosen naming convention)
   - Integration with the QA agent

9. **Optional starter file.** Create a starter example `.feature` file only if requested, placed in the correct directory and using the chosen naming convention.

## Recommended Default Tags

Generic families (use only those that apply):

- Type: `@UI`, `@API`, `@E2E`, `@Integration`, `@Unit`
- Scope/Suite: `@Smoke`, `@Regression`, `@ShortRegression`, `@Critical`, `@Negative`
- Non-functional: `@Performance`, `@Security`, `@Accessibility`, `@Compatibility`
- Lifecycle/Utilities: `@Cleanup`, `@DataSetup`, `@Migration`, `@Flaky`

Composite suite tags (optional): concatenate grouping dimensions with a suite scope, e.g. `@TektonGerritUI`, `@TektonBitbucketShortRegression`. Capture the pattern as `@{Dim1}{Dim2}{Suite}` so future scenarios stay consistent.

## Success Criteria

<success_criteria>

- Features directory located or chosen and confirmed by the user
- README created at `<features-dir>/README.md` with confirmed structure, tags, and conventions
- Feature directories created and match the selected test types and grouping dimensions
- All template placeholders replaced; no unpopulated `{{...}}` tokens remain in the output
- Agent can operate in BDD-only mode using the created README and features directory
- No files written or moved before final user confirmation
</success_criteria>

## Quality Standards and Pitfalls

The wizard must honor every HALT checkpoint and never auto-write on ambiguous confirmation. Avoid these common pitfalls:

- Skipping confirmation steps or collapsing multiple questions into one
- Writing or moving files before the final confirmation HALT
- Leaving `{{placeholder}}` tokens in the generated README
- Emitting `<instructions>` tags from the template into the final README

## Reference Files

- **`references/testing-readme-template.md`** — Testing README template with section structure and internal `<instructions>` guidance. Strip all `<instructions>` blocks from the final output; they are for agent guidance only.

---
name: Onboard Testing
description: This skill should be used when `.feature` files already exist but there is no testing README — "onboard existing tests", "set up testing for an existing Gherkin suite", "generate a README from our existing suite", "analyze our existing BDD suite", or "import or migrate a Gherkin suite". Scans the suite, infers structure, tags, and conventions, and writes a populated testing README without prompting. If no `.feature` files exist yet, use setup-testing; if a testing README already exists, use edit-testing-settings.
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Onboard Testing

Analyze an existing directory of Gherkin `.feature` files and generate a testing README aligned with the inferred repository conventions. Onboarding is non-interactive: it analyzes the suite (Glob/Grep), writes the README, then reports how to adjust settings via the `edit-testing-settings` skill.

Throughout this skill, "features directory" is auto-detected from where `.feature` files live. The testing README (single source of truth) is written at the root of that directory as `<features-dir>/README.md`.

## When to Use

- Existing `.feature` files are present but there is no testing README.
- Migrating an external Gherkin test suite into this project.

## Workflow

1. **Locate the features directory.** Run `Glob` for `**/*.feature`. The common parent of the matches is the features directory (e.g. `src/main/resources/features/`, `features/`, or `tests/features/`). If no `.feature` files are found, HALT and propose `setup-testing`. If `<features-dir>/README.md` already exists, HALT and propose `edit-testing-settings`.

2. **Scan and infer.** Analyze the feature tree (Glob for files, Grep for tags/titles/steps) to infer structure and conventions:
   - **Test types**: detect UI presence (e.g. a `ui_tests/` segment or top-level functional features) and API presence (an `api_tests/` segment).
   - **Grouping dimensions**: infer the nested path dimensions in use (e.g., CI tool such as `tekton`/`jenkins`; provider such as `gerrit`/`github`/`gitlab`/`bitbucket`; module/domain). Report them in tree order.
   - **Naming convention**: sample filenames to detect `PascalCase`, `kebab-case`, or `snake_case`.
   - **Tags**: aggregate all `@tag` tokens across Feature, Scenario/Scenario Outline, and Examples blocks; record frequency and scope.
   - **Step vocabulary**: sample the most frequent step phrasings (Given/When/Then/And) so generation can reuse the existing step definitions.
   - **Topics/keywords**: extract top tokens from filenames and scenario titles after normalization and stopword removal.
   - **Characteristic artifacts**: detect frequently recurring UPPER_CASE constants, URLs, and step markers.
   - **Directory priority**: rank subdirectories by scenario density and tag richness to suggest search order.

3. **Classify tags — composite pattern first.** Before mapping to generic families, detect whether the suite uses **composite tags** that concatenate grouping dimensions with a suite scope (e.g. `@TektonGerritUI`, `@TektonBitbucketShortRegression`, `@JenkinsCriticalPath`). If a dominant composite pattern exists, document it as the **primary taxonomy** — derive the `@{Dim1}{Dim2}{Suite}` shape, list the real top tags with counts, and explain the dimension order. Only then map any remaining standalone tags to generic families:
   - Type: `@UI`, `@API`, `@E2E`, `@Integration`, `@Unit`
   - Scope/Suite: `@Smoke`, `@Regression`, `@ShortRegression`, `@Critical`, `@Negative`
   - Non-functional: `@Performance`, `@Security`, `@Accessibility`, `@Compatibility`
   - Lifecycle/Utilities: `@Cleanup`, `@DataSetup`, `@Migration`, `@Flaky`
   - Truly unmapped tags: collect in an "Additional tags" list; document without enforcing new conventions.

   Do not demote a dominant composite taxonomy into "Additional tags" — that is the project's real convention.

4. **Write the README.** Generate `<features-dir>/README.md` from `references/testing-readme-template.md` using inferred values, then enrich it:
   - Replace the template "Directory structure" block with the actual on-disk tree under the features directory (limit depth to preserve readability for very large trees).
   - Set the naming convention to the detected style.
   - Insert a concise UI vs API coverage summary and the grouping dimensions in use.
   - Populate the composite-tag line with the detected pattern; add a "Current tags in this repository" subsection listing top tags with counts, grouped by family.
   - Append a "Discovery hints for this repository" subsection with preferred directory order, common topics/keywords, characteristic step artifacts, and the most frequent step phrasings.

5. **Safety constraints.** Do not move, rename, or modify existing `.feature` files. Onboarding is read-only analysis plus a single README write.

6. **Report and hand off.** Print a short summary with the README path and instruct the user to run `edit-testing-settings` to adjust any section interactively.

## Analysis Heuristics

### Tag Inference and Mapping

Extraction:

- Collect all tokens starting with `@` across Feature, Scenario, and Examples blocks.
- Track per-tag frequency and scope (Feature | Scenario | Examples).

Composite detection:

- Look for repeated capitalized prefixes that correspond to path dimensions (CI tool, provider, module) followed by a suite scope (UI, API, Smoke, ShortRegression, Regression, DeployRegression, etc.).
- Derive the dimension order from both the tags and the directory tree; they usually agree.

### Discovery Hints (repo-specific)

Populate the README with:

- **Preferred directories (ordered)**: ranked by feature density and tag concentration
- **Common topics/keywords**: top N normalized tokens from filenames and scenario titles
- **Characteristic artifacts/steps**: frequently recurring constants and step phrases worth using as search anchors
- **Step vocabulary**: most frequent step phrasings, so new scenarios bind to existing step definitions
- **Parity patterns** (optional): note parity expectations if parallel provider/module trees exist

## Success Criteria

<success_criteria>

- Features directory auto-detected; README written at `<features-dir>/README.md` without prompting
- README reflects the actual on-disk feature layout and grouping dimensions
- A dominant composite tag taxonomy, if present, is documented as the primary convention (not buried in "Additional tags")
- Discovery hints and step vocabulary help the agent prioritize relevant areas and reuse existing steps
- No `.feature` files were moved, renamed, or modified during onboarding
- Further refinements are handled by `edit-testing-settings`
</success_criteria>

## Quality Standards and Pitfalls

The onboarding analysis must be accurate, non-destructive, and immediately actionable. Avoid these common pitfalls:

- Moving or renaming `.feature` files during analysis
- Demoting a dominant composite tag taxonomy to "Additional tags"
- Emitting `<instructions>` tags from the template into the final README
- Leaving `{{placeholder}}` tokens in the generated README

## Reference Files

- **`references/testing-readme-template.md`** — Testing README template; use as the structural skeleton and strip all `<instructions>` blocks from the final output.

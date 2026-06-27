---
name: Edit Testing Settings
description: This skill should be used when a testing README already exists and needs changes — "update the testing README", "change the test tags", "adjust testing conventions", "modify the tagging strategy", or "add a section to the testing README". Interactively edits README sections with a backup and per-section confirmation. If there is no testing README yet, use onboard-testing (when `.feature` files exist) or setup-testing (when starting fresh).
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Edit Testing Settings

Interactively edit testing settings stored in the testing README at the root of the features directory (`<features-dir>/README.md`). The wizard shows current content for each section and asks whether to change it, add new data, or skip. Changes are applied in-place with an automatic backup.

Throughout this skill, "features directory" is auto-detected from where `.feature` files live (e.g. `src/main/resources/features/`, `features/`, or `tests/features/`).

## When to Use

- A testing README exists and adjustment to structure, tags, or process guidance is needed.
- After onboarding or initial setup, to refine details without regenerating from scratch.

## Workflow

1. **Locate the README.** Run `Glob` for `**/*.feature` to find the features directory, then check for `<features-dir>/README.md`. HALT if the README is missing: if `.feature` files exist, propose running `onboard-testing`; if none exist, propose `setup-testing`.

2. **Create a backup.** Before any edit, copy `<features-dir>/README.md` to `<features-dir>/README.md.bak` (overwrite if it exists).

3. **Select editing mode.** Ask the user to choose one of:
   - **Add new data** — append sections or notes without altering existing content
   - **Edit specific section** — pick one section by name and update only it
   - **Guided edit** — iterate all known sections in document order; preview each and ask to edit or skip

4. **Build Quick Section Index.** Detect headings by `##` and `###` markers; present a numbered list (e.g., `1) ## Tests Directory Structure`, `2) ### Tagging system`). Only list sections that actually exist; offer to create unknown sections on demand.

5. **Execute the selected mode.**

   **Edit specific section:**
   - Show numbered section list.
   - Display current content of the chosen section.
   - Ask: "Edit this section? [yes/no]". If yes, accept new markdown text (multiline). HALT for confirmation before applying.

   **Guided edit:**
   - For each section in Quick Section Index order:
     - Show current content (trim to a reasonable length if very long).
     - Ask: "Edit this section? [yes/no]". If yes, accept new markdown text. HALT for confirmation.
     - Ask: "Continue to next section? [yes/no]". HALT.

   **Add new data:**
   - Ask for a new section title and markdown body.
   - Ask where to insert: after a chosen anchor section or at the end.
   - HALT for confirmation before writing.

6. **Validate and report.** After all edits, verify the resulting README is non-empty and contains the edited headings. Print a summary of edited section titles for the user.

## Known Sections (detected and editable)

- Tests Directory Structure
- How the QA agent works with tests
- Discovery and search workflow
- Tagging system
- How to add your existing tests
- Integration with the QA agent

The wizard detects these headings by `##`/`###`. Repositories onboarded from an existing suite may also have "Current tags in this repository" and "Discovery hints for this repository" subsections. If a section is not found, offer to create it.

## Tag Recommendations (helper)

When editing the tagging section, preserve the project's real taxonomy first. If the suite uses composite suite tags (e.g. `@TektonGerritUI`, `@TektonBitbucketShortRegression`), keep that `@{Dim1}{Dim2}{Suite}` pattern as primary. Offer generic families only to fill genuine gaps:

- Type: `@UI`, `@API`, `@E2E`, `@Integration`, `@Unit`
- Scope/Suite: `@Smoke`, `@Regression`, `@ShortRegression`, `@Critical`, `@Negative`
- Non-functional: `@Performance`, `@Security`, `@Accessibility`, `@Compatibility`
- Lifecycle/Utilities: `@Cleanup`, `@DataSetup`, `@Migration`, `@Flaky`

Present suggested lists and ask whether to insert or update the Tagging system section.

## Success Criteria

<success_criteria>

- Features directory and README auto-detected
- Backup created at `<features-dir>/README.md.bak` before any edit is applied
- Requested sections updated exactly as confirmed by the user
- README structure and headings preserved or improved after edits
- Tagging guidance stays consistent with the project's existing taxonomy
- No edits applied without explicit user confirmation at each HALT checkpoint
- Resulting README is non-empty and all edited headings are present
</success_criteria>

## Quality Standards and Pitfalls

The interactive editor must be safe, reversible, and precise. Avoid these common pitfalls:

- Applying edits before the user confirms at the HALT checkpoint
- Skipping backup creation
- Overwriting sections not selected by the user
- Replacing a project's composite tag taxonomy with generic families
- Losing existing section content during a partial edit
- Presenting a flat dump of the whole README without section-level navigation
- Leaving `README.md.bak` committed to version control — ensure `*.md.bak` is gitignored or removed after a successful edit

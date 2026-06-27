---
name: Generate Auto Test Cases
description: This skill should be used when the user asks to "generate Gherkin scenarios", "write feature files", "extend Gherkin coverage", "add BDD scenarios for a story", "write automated test cases", or "automate test cases as Gherkin". Discovers existing coverage in the `.feature` suite (Glob/Grep), then writes or extends `.feature` files that reuse the suite's structure, tags, and step phrasing, traceable to story acceptance criteria. For manual Markdown test cases use generate-test-cases; if the suite has no testing README yet, run onboard-testing or setup-testing first.
argument-hint: <story-or-intent>
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Generate Auto Test Cases

Translate story acceptance criteria into executable Gherkin scenarios by first discovering existing coverage in the suite, then generating or extending `.feature` files with structure, tags, and step phrasing that match it.

Throughout this skill, "features directory" is auto-detected (e.g. `src/main/resources/features/`, `features/`, or `tests/features/`). The testing README (single source of truth for conventions) lives at its root as `<features-dir>/README.md`.

## Workflow

1. **Confirm target and locate the suite.** Identify the story or intent from `$ARGUMENTS`. Run `Glob` for `**/*.feature` to locate the features directory. If `.feature` files exist but `<features-dir>/README.md` is missing, propose running `onboard-testing` and HALT. If no `.feature` files exist at all, propose running `setup-testing` and HALT. If a referenced story file is inaccessible, report the exact path and HALT.

2. **Obtain story context.** If `$ARGUMENTS` already supplies a usable story file path or acceptance criteria, proceed with it. Otherwise, ask the user for the input source and HALT until confirmed and acceptance criteria are in hand. Accept any of:
   - A specific story/spec file path (e.g. `docs/stories/NN.MM.story.md` or any Markdown/issue export).
   - A scan of a stories directory if one exists (offer to list candidates).
   - Acceptance criteria pasted directly in chat (e.g. from Jira).

3. **Summarize planned actions.** Before searching, present a concise *preliminary* plan: keywords and themes to search, directories and grouping dimensions to target (UI/API, CI tool, provider, module), and any open assumptions. The extend-vs-create decision is provisional at this point and is finalized after discovery (Step 5). HALT for confirmation or refinement.

4. **Run discovery.** Build normalized keyword variants from the story terms (hyphen/underscore/space/camelCase; include relevant action/result modifiers and domain synonyms). Then:
   - `Grep` across scenario titles, step lines, tags, and `Examples` blocks under the features directory for each variant.
   - Prioritize directories by the grouping hints detected in the story (e.g. a specific provider or UI vs API) and the directory priority noted in the README.
   - Read the most promising candidate files in full — do not judge on snippets alone.

5. **Rank and present candidates.** Re-rank matches by title/step/tag relevance and proximity to the story's domain. Present the top 3–5 candidates with file path and a short snippet, then HALT for the user's choice — extend an existing scenario/file, create a new file, or reject.

6. **Review README for process rules.** Consult `<features-dir>/README.md` for the directory structure, tagging taxonomy (including any composite `@{Dim1}{Dim2}{Suite}` pattern), naming convention, step vocabulary, and the Covered / Partial / Not Covered decision matrix. Confirm coverage status, then request confirmation before creating or updating any files.

7. **Generate or extend Gherkin.** Create or update `.feature` files under the features directory following the README conventions:
   - **Reuse existing step phrasing** from the candidates read in discovery so scenarios bind to the current step definitions; do not invent new step wording when an equivalent step already exists.
   - **Match the tag taxonomy** exactly — apply the suite's composite/suite tags and placement (Feature vs Scenario vs Examples), not generic tags the suite does not use.
   - **Extend**: confirm the target scenario by exact title or nearest match, insert after the specified step anchor, prefer in-place edits, avoid duplicating scenario headers or existing flows; show a minimal diff preview and HALT for confirmation.
   - **New file**: create only if no suitable host file exists or the user explicitly requests it; place it in the directory that matches the story's grouping dimensions.
   - Apply test design techniques (equivalence partitioning, boundary value analysis, pairwise) and ensure every acceptance criterion maps to at least one scenario; include positive, negative, boundary, and non-functional scenarios as appropriate.

8. **Produce traceability output.** Report the created or updated `.feature` files with paths, new or updated scenario titles, UI/API alignment notes, and a mapping of each acceptance criterion to its covering scenario(s).

## Test Case Generation Focus

### Story Acceptance Criteria (Primary)

- Each acceptance criterion must have at least one corresponding scenario.
- Positive scenarios validate expected functionality and business rules.
- Negative scenarios cover error conditions, invalid inputs, and edge cases.
- Boundary scenarios target limit values and exceptional inputs.

### Execution Phases

| Phase | Activities |
|-------|-----------|
| Planning | Analyze acceptance criteria; prioritize by risk; select design techniques |
| Functional | Positive, negative, boundary, and end-to-end user workflow scenarios |
| Non-functional | Performance, security, usability, and compatibility scenarios |
| Documentation | Traceability matrix; peer review; feature file sign-off |

## Success Criteria

<success_criteria>

- Coverage complete: every acceptance criterion covered by at least one executable scenario
- Traceability established: each scenario maps back to a specific acceptance criterion
- Suite compliance: tags, naming, directory placement, and step phrasing match the existing suite and README
- Execution ready: scenarios reuse existing step definitions and contain sufficient detail to run
- Peer reviewed: generated Gherkin validated by the team before merge
- Maintainability: `Scenario Outline` + `Examples` used for variants; no duplicated flows
</success_criteria>

## Quality Standards and Pitfalls

Generated tests must be requirement-traceable, execution-ready, suite-consistent, and maintainable. Avoid these common pitfalls:

- Inventing new step wording when an equivalent step already exists in the suite
- Applying generic tags the suite does not use instead of its real (often composite) taxonomy
- Writing scenarios without referencing specific acceptance criteria
- Judging candidates on snippets without reading the full feature file
- Omitting negative and edge-case scenarios
- Poor traceability between scenarios and acceptance criteria
- Scenarios that cannot be run independently without shared hidden state

## Reference Files

- **`<features-dir>/README.md`** — The single source of truth for tagging rules, directory structure, naming convention, step vocabulary, and the discovery decision matrix. Generated by `onboard-testing` or `setup-testing`; if missing, run one of those first.

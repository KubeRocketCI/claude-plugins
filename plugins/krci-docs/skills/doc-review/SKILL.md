---
name: KRCI Documentation Review
description: This skill should be used when the user asks to "review documentation", "review docs", "review this markdown page", "check writing style", "improve documentation style", "apply the Microsoft Writing Style Guide", "proofread this doc", or "lint my docs". Reviews and refines Markdown documentation pages against the Microsoft Writing Style Guide and project documentation standards.
argument-hint: <file-path-or-content>
allowed-tools: [Read, Write, Edit, Grep, Glob, WebFetch, AskUserQuestion]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Documentation Review

Review a documentation page against the Microsoft Writing Style Guide and align it with the project's documentation style. Produce a refined, ready-to-read file and a professional summary of what changed and why.

## Review Workflow

1. **Confirm the target.** Identify the exact file to review from `$ARGUMENTS` (a path) or inline content. If the path is missing or ambiguous, use **AskUserQuestion** to confirm the file and whether to review-in-place or produce a separate edited copy. Do not proceed until the content is accessible. If the file is unreadable, report the exact path and HALT.
2. **Establish the project style baseline.** Inspect existing documentation in the repository (for example `README.md`, `CONTRIBUTING.md`, `docs/`) to learn project-specific conventions — terminology, heading patterns, admonition styles, and link formats. Do not assume a style the project does not already use.
3. **Read the target fully** before editing, to understand audience, purpose, and structure.
4. **Apply the standards** in `references/documentation-standards.md` — tone and voice, heading hierarchy, link validity, and image formatting.
5. **Verify technical accuracy.** Assess that statements, commands, and API references are correct and current; flag anything that needs author or maintainer confirmation.
6. **Validate links.** Check that references and links resolve and are current. Use WebFetch to verify external links when reachability is in doubt.
7. **Edit the file in place** to deliver a refined, ready-to-read result.
8. **Report.** Produce a professional review summary describing what was changed and why. Deliver this summary as a chat message — do not write it into the reviewed file.

## Review Output Format

### Summary

Brief overall assessment of the page's quality and adherence to standards.

### Changes Made

For each change, state the location, what changed, and the rationale (which guideline it satisfies).

### Remaining Recommendations

Optional improvements that need author or product input (for example, missing prerequisite sections or unclear ownership).

## Success Criteria

- Review completion: the page is reviewed comprehensively
- Style consistency: the page follows the Microsoft Writing Style Guide
- Link verification: all references and links are valid and current
- Clarity: information is presented clearly and understandably
- Organization: logical structure that supports user goals
- Project alignment: documentation style is consistent with project standards
- Professional quality: the review meets Senior Technical Writer standards

## Reference Files

- **`references/documentation-standards.md`** — Microsoft Writing Style Guide essentials and project documentation standards: tone and voice, pronoun usage, heading hierarchy, link validation, and image formatting. Read this before reviewing any page.

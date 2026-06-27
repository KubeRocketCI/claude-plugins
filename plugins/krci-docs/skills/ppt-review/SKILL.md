---
name: KRCI PowerPoint Review
description: This skill should be used when the user asks to "review a PowerPoint", "review this presentation", "improve my slides", "review the pptx", "check my deck", "clean up my slides", or "fix the writing on my slides". Reviews and improves a PowerPoint (.pptx) presentation, producing an edited copy without modifying the original.
argument-hint: <pptx-file-path>
allowed-tools: [Read, Glob, Bash, Write, AskUserQuestion]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# PowerPoint Review

Review and improve a PowerPoint presentation, applying writing-style and formatting standards to slide content. Always work on a copy so the original file is preserved.

## Review Workflow

1. **Confirm the target.** Identify the `.pptx` file from `$ARGUMENTS`, a path, or a chat attachment, and confirm it has read permissions. If nothing is specified or the path is ambiguous, use **AskUserQuestion** to ask the user for the file. Do not proceed until the file is accessible.
2. **Confirm the tooling dependency.** The supported default path is the `python-pptx` library. If the user has the Office-PowerPoint-MCP-Server configured separately, that MCP may be used instead. See `references/powerpoint-review.md` for both. If `python-pptx` is not available, notify the user and install it (inside the virtual environment) only after explicit consent.
3. **Set up an isolated environment.** For the `python-pptx` path, create a Python virtual environment named `venv` in the project root if one does not already exist, and notify the user. Place all generated scripts in a `presentation-processing/` folder at the project root.
4. **Work on a copy.** Copy the presentation into `presentation-processing/` as `<presentation-name>-edited.pptx`. Apply all edits to the copy only.
5. **Apply all review criteria** in `references/powerpoint-review.md` (pronoun usage, no empty gaps between headings, image borders, terminology consistency, and clarity).
6. **Clean up.** If a Python virtual environment was created, remove it after completion to keep the project clean.
7. **Report.** Notify the user that the edited version is located at `presentation-processing/<presentation-name>-edited.pptx`, summarizing what was changed.

## Success Criteria

- Review completion: the presentation is reviewed
- Style consistency: slide content follows the Microsoft Writing Style Guide
- Original preserved: edits are written only to the `-edited.pptx` copy
- Cleanup: the Python virtual environment is removed after completion

## Reference Files

- **`references/powerpoint-review.md`** — Environment setup (`python-pptx` and the Office-PowerPoint-MCP-Server alternative), the edit-on-a-copy workflow, and detailed slide review criteria. Read this before processing a presentation.

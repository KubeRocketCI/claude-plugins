# PowerPoint Review Reference

Detailed guidance for reviewing and editing PowerPoint (`.pptx`) presentations.

## Tooling Options

Two mechanisms can read and edit `.pptx` files. Choose one based on what is available.

### Option A: `python-pptx` (default)

A scripted approach using the `python-pptx` library inside an isolated virtual environment.

```bash
# From the project root
python3 -m venv venv
source venv/bin/activate
pip install python-pptx
```

Create edit scripts in a `presentation-processing/` folder at the project root, then run them against the copied file.

### Option B: Office-PowerPoint-MCP-Server (optional alternative)

The original KubeRocketCI task referenced the `office-powerpoint` MCP server, which exposes PowerPoint operations as MCP tools. Reference: <https://github.com/GongRzhe/Office-PowerPoint-MCP-Server>. This plugin does not bundle or configure the server. Use this option only when the user has already configured the MCP server in their own environment and prefers MCP-driven editing over local scripts; otherwise use Option A.

## Edit-on-a-Copy Workflow

1. Confirm the source `.pptx` path and read permissions.
2. Create the `presentation-processing/` folder at the project root if it does not exist.
3. Copy the source file to `presentation-processing/<presentation-name>-edited.pptx`.
4. Apply all modifications to the copy only — never mutate the original.
5. Remove the `venv` virtual environment after completion.
6. Report the location of the edited file to the user.

### Minimal `python-pptx` example

```python
import re
from pptx import Presentation

# Reduce reader-directed pronouns in slide text (apply judiciously, preserving meaning).
PRONOUN_PATTERN = re.compile(r"\b(you|your|we|us|our)\b", flags=re.IGNORECASE)

prs = Presentation("presentation-processing/deck-edited.pptx")
for slide in prs.slides:
    for shape in slide.shapes:
        if not shape.has_text_frame:
            continue
        for paragraph in shape.text_frame.paragraphs:
            for run in paragraph.runs:
                if PRONOUN_PATTERN.search(run.text):
                    # Flag for rewrite rather than blind deletion; adjust wording to keep the sentence natural.
                    print(f"Review pronoun usage: {run.text!r}")
prs.save("presentation-processing/deck-edited.pptx")
```

## Slide Review Criteria

- **Pronoun usage**: minimize "you", "your", "we", "us" in slide text; prefer direct, descriptive phrasing.
- **No empty gaps between headings**: ensure there is always content between a heading and its sub-heading — avoid a title slide section header immediately followed by another header with nothing in between.
- **Image borders**: remind the user to set image borders to 1px width in color `#DCDCDC`, consistent with the documentation image standard.
- **Consistency**: align terminology and capitalization with the project's documentation and product names.
- **Clarity**: keep slide text concise; prefer short phrases over full paragraphs.

## Validation

- [ ] The `<presentation-name>-edited.pptx` file is created in `presentation-processing/` and contains the refinements
- [ ] Slide content adheres to the Microsoft Writing Style Guide
- [ ] The original presentation is unmodified
- [ ] The Python virtual environment is cleaned up

# Documentation Standards

Standards for reviewing and refining documentation pages. Combines the Microsoft Writing Style Guide essentials with project-specific documentation conventions. The authoritative external reference is the [Microsoft Writing Style Guide](https://learn.microsoft.com/en-us/style-guide/welcome/).

## Tone and Voice

- Write in a warm, clear, and professional tone. Be direct and concise.
- Prefer active voice and present tense ("the operator reconciles the resource", not "the resource will be reconciled by the operator").
- Address the reader sparingly. Minimize second-person ("you", "your") and first-person plural ("we", "us", "our"); rewrite toward imperative or descriptive phrasing where it reads naturally.
- Define technical terms and acronyms on first use. Avoid jargon unless it is well-defined and necessary for the audience.
- Keep sentences short. Split long sentences; prefer one idea per sentence.

## Structure and Headings

- Use a single H1 (`#`) as the page title. Build a logical hierarchy with `##` and `###` below it.
- Never stack headings with no content between them. There must always be explanatory text between a heading and its first sub-heading (for example, between `## Section` and `### Subsection`).
- Do not skip heading levels (no `##` directly to `####`).
- Front-load the most important information. Lead with what the reader needs, then add detail.
- Use lists for sequential steps (ordered) or unordered sets of related items. Keep list items parallel in grammatical structure.
- Use fenced code blocks with a language identifier for commands and code samples.

## Links

- Verify every link resolves and points to current content. Replace or remove dead links.
- Use descriptive link text that makes sense out of context. Avoid "click here" and bare URLs in prose.
- Prefer relative links for in-repository references so they survive moves and forks.

## Images and Media

- Provide meaningful alt text for every image.
- Apply the project image border standard: a 1px border in color `#DCDCDC`.
- Keep screenshots current with the described UI. Crop to the relevant area and avoid sensitive or personal data.

## Project Alignment

- Match the project's existing terminology and capitalization (for example product and component names).
- Follow the conventions already established in the repository's `README.md`, `CONTRIBUTING.md`, and existing `docs/` pages rather than introducing a new style.
- When the project documents a glossary or style note, treat it as authoritative over generic guidance.

## Review Checklist

- [ ] Content analysis: structure, flow, and organization support the reader's goals
- [ ] Language review: tone, voice, and pronoun usage follow the guidance above
- [ ] Technical accuracy: all technical information is correct and current
- [ ] Link validation: all references and links are valid and current
- [ ] Heading structure: proper hierarchy with explanatory text between heading levels
- [ ] Image standards: alt text present, 1px `#DCDCDC` borders applied, screenshots current
- [ ] Project alignment: terminology and style consistent with existing documentation
- [ ] Completeness: the requested file is updated and contains the refinements

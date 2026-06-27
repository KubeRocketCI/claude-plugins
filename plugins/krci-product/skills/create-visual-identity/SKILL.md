---
name: Create Visual Identity
description: This skill should be used when the user asks to "create visual identity", "define brand guidelines", "build a brand guide", "create a style guide", "establish brand standards", "define logo usage rules", or "create a design system". Produces comprehensive visual identity guidelines covering logo system, color palette, typography, imagery style, layout and grid system, brand applications, and brand voice that create consistent professional credibility across all marketing materials.
argument-hint: <product-or-brand>
allowed-tools: [Read, Write, Edit, Grep, Glob, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Visual Identity

Produce comprehensive visual identity and brand guidelines that establish a consistent, professional, and emotionally engaging visual language across all marketing materials. The output is a complete design system that creates immediate market impact, builds credibility, and supports the WOW factor needed for modern marketing success.

## Workflow

1. **Confirm scope and target.** Identify the product or brand from `$ARGUMENTS`. Confirm the marketing brief at `/docs/marketing/marketing-brief.md` for brand positioning and audience research. Confirm the output path (`/docs/marketing/visual-identity.md`). If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Brand analysis phase.** Extract brand personality and values from the Marketing Brief. Study target audience visual preferences and current design trends. Identify visual differentiation opportunities in the competitive landscape. Define the desired emotional responses to the visual identity.
3. **Visual system design phase.** Develop a scalable logo system with versatile applications. Select color palettes that support brand positioning and audience appeal, including psychological rationale. Choose font families that enhance readability and brand personality. Define photography, illustration, and graphic treatment approaches.
4. **Application design phase.** Create flexible grid systems for various material formats. Develop presentation, document, and digital asset template specifications. Design supporting iconography guidelines. Establish decorative elements and visual motifs for brand consistency.
5. **Guidelines documentation phase.** Document logo sizing, spacing, clear space, and placement requirements. Provide complete color specifications (hex, RGB, CMYK, Pantone). Establish typography hierarchy, sizing, and formatting rules. Show correct and incorrect visual identity implementation examples.
6. **Structure with the template.** Use `references/visual-identity-template.md` for all sections; populate every template variable. Target length is 6-10 pages covering the complete visual system. Include quality control and brand approval process guidance.
7. **Save output.** Write to the exact path `/docs/marketing/visual-identity.md`.

## Quality Standards

Visual identity guidelines must be technically specific (hex codes, font sizes, grid measurements), consistently enforceable, scalable across formats, and accessible (WCAG AA minimum contrast 4.5:1). Avoid these pitfalls:

- Generic design choices that do not differentiate from competitors or support brand positioning
- Complex visual systems that are difficult for marketing teams to implement consistently
- Trend-focused design without consideration for brand longevity and recognition
- Missing technical specifications that force subjective interpretation
- Color combinations that fail accessibility standards
- Logo usage rules without clear examples of what NOT to do

## Success Criteria

- File saved to `/docs/marketing/visual-identity.md`
- Document is 6-10 pages covering the complete visual system
- Brand overview defines personality, values, target audience, and brand promise
- Logo system includes primary logo, all variations, and usage guidelines with technical specifications
- Color palette defines primary, secondary, and accent colors with hex, RGB, CMYK, and Pantone values plus psychological rationale
- Typography hierarchy establishes font choices for headers, body text, captions, and emphasis with specific sizing
- Imagery style guides photo selection, illustration approach, and visual treatment with do/don't examples
- Layout and grid system provides responsive specifications for desktop, tablet, and mobile
- Brand applications cover digital, print, and merchandise touchpoints
- Brand voice and tone complement the visual identity
- Quality control checklist and approval process defined

## Reference Files

- **`references/visual-identity-template.md`** — Full Visual Identity structure covering brand overview, logo system, color palette, typography, imagery style, layout and grid system, brand applications, brand voice and tone, and quality control. Use it as the output skeleton; omit all internal guidance tags from the final output.

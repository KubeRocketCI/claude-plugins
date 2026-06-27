---
name: Create Demo Script
description: This skill should be used when the user asks to "create a demo script", "write a product demonstration", "build a demo flow", "create a product walkthrough script", "write a sales demo", or "design demo scenarios". Produces a compelling product demonstration script that showcases product value through engaging storytelling, interactive scenarios, and WOW moments that convert prospects into customers. This produces a standalone demo script, distinct from the demo section within a create-sales-enablement package.
argument-hint: <product-or-feature>
allowed-tools: [Read, Write, Edit, Grep, Glob, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Demo Script

Produce a compelling product demonstration script that showcases product value through engaging storytelling, interactive scenarios, and memorable WOW moments. The script converts prospects into customers by connecting product capabilities to real audience pain points with emotional impact.

## Workflow

1. **Confirm scope and target.** Identify the product or feature from `$ARGUMENTS`. Confirm the PRD at `/docs/prd/prd.md` and marketing brief at `/docs/marketing/marketing-brief.md` as source inputs. Confirm the output path (`/docs/marketing/demo-script.md`) and that the demo environment is ready before proceeding. If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Audience analysis phase.** Identify the most compelling customer scenarios for the target audience. Document specific problems the demo will address and solve. Define what the audience needs to see to make a positive decision. Structure the demo flow for optimal engagement and attention span.
3. **Story development phase.** Create a compelling narrative arc with beginning, middle, and end. Establish relatable personas that the audience connects with. Build tension around challenges that the product will solve. Design a satisfying resolution that showcases product value.
4. **Demo flow design phase.** Create an attention-grabbing opening hook that immediately engages the audience. Sequence capabilities in logical flow from basic to advanced. Plan specific moments for audience questions and participation. Prepare all demo steps with backup plans for technical issues.
5. **WOW moment planning.** Identify specific features or outcomes that create excitement. Include metrics and ROI demonstrations throughout the script. Incorporate customer testimonials and success stories. Create compelling reasons for immediate next steps.
6. **Structure with the template.** Use `references/demo-script-template.md` for all sections; populate all template variables precisely. Follow the structure: opening hook, problem amplification, solution reveal, core demo sequence, impact demonstration, enterprise features, call to action, demo variations, technical requirements, and presentation tips. Target length is 4-8 pages.
7. **Save output.** Write to the exact path `/docs/marketing/demo-script.md`.

## Quality Standards

Demo scripts must be story-driven (compelling narrative arc, not a feature tour), value-focused (every element shows customer benefit), interactively engaging (participation points at defined moments), and technically reliable (backup plans for live failures). Avoid these pitfalls:

- Feature tours without clear customer value and business impact context
- One-way presentations without audience participation or comprehension checks
- Technical demonstrations that lose audience attention with excessive complexity
- Missing backup plans for live demo technical failures
- Ending with "any questions?" instead of a specific call to action
- Demo steps that are untimed or impractical to execute within the stated duration

## Success Criteria

- File saved to `/docs/marketing/demo-script.md`
- Document is 4-8 pages covering complete demonstration flow and variations
- Opening hook immediately engages audience with compelling scenario or challenge
- Use case flow tells a coherent story that audience can relate to their own situations
- Feature demonstrations show product value with before/after comparisons
- Interaction points engage audience with questions, polls, or hands-on activities
- WOW moments create memorable highlights that audience will discuss and remember
- Closing action provides clear next steps and maintains engagement momentum
- Demo variations cover at least three time formats (5-minute, standard, 15-minute deep dive)
- Technical requirements documented with backup plans for common failure scenarios
- All demo-script-template.md variables populated; template structure followed

## Reference Files

- **`references/demo-script-template.md`** — Full Demo Script structure with opening hook, problem amplification, solution reveal, core demo sequence, impact demonstration, enterprise features, call to action, demo variations, technical requirements, presentation tips, and success metrics. Use it as the output skeleton; omit all internal guidance tags from the final output.

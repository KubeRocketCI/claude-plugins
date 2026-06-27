---
name: Create Marketing Brief
description: This skill should be used when the user asks to "create a marketing brief", "write a go-to-market strategy", "build a GTM plan", "define market positioning", "create a marketing strategy document", or "develop a marketing foundation". Builds a comprehensive go-to-market strategy and marketing brief that transforms product features into compelling market positioning, target audience segmentation, and a channel strategy that enables all downstream promotional materials.
argument-hint: <product-or-launch>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Marketing Brief

Build a comprehensive go-to-market strategy document that transforms PRD features into differentiated market positioning, identifies target audiences, and establishes the strategic foundation for all promotional materials including pitch decks, sales tools, and launch campaigns.

## Workflow

1. **Confirm scope and target.** Identify the product or launch from `$ARGUMENTS` and confirm the PRD location (conventionally `/docs/prd/prd.md`). Confirm the output path (`/docs/marketing/marketing-brief.md`). If any referenced input is missing, report the exact path and HALT. Use AskUserQuestion to fill gaps around audience specifics, competitive context, or positioning preferences not covered in the PRD. Use TodoWrite to track the remaining steps.
2. **Discovery phase.** Extract key features and benefits from the PRD. Research competitive positioning, define target segments with specific demographics and behaviors, and quantify the addressable market opportunity.
3. **Strategy phase.** Define the unique value proposition and market differentiation. Create a compelling messaging framework for each audience segment. Identify optimal marketing channels and outline the launch timeline and campaign structure.
4. **Structure with the template.** Use `references/marketing-brief-template.md` for all sections; populate every template variable precisely while emphasizing differentiated positioning and measurable outcomes.
5. **Validate quality.** Ensure the document is 4-6 pages maximum, all positioning claims are evidence-based, and audience descriptions are specific enough to act on.
6. **Save output.** Write to the exact path `/docs/marketing/marketing-brief.md`.

## Quality Standards

Every claim must be evidence-based, audience-specific, and actionable. Avoid these pitfalls:

- Feature-focused messaging without clear customer benefits
- Generic positioning that does not differentiate from competitors
- Vague audience descriptions without specific targeting criteria
- Missing budget and channel strategy
- Unquantified success metrics
- Document exceeding the 4-6 page target length

## Success Criteria

- File saved to `/docs/marketing/marketing-brief.md`
- Document is 4-6 pages maximum
- Market positioning is clear and differentiated from competitors
- Target audiences are specific with demographics and pain points
- Value propositions are compelling and evidence-based
- Go-to-market strategy includes channels, timing, and budget considerations
- Success metrics are specific and measurable for marketing campaigns
- Ready to enable pitch deck, launch materials, and sales enablement creation

## Reference Files

- **`references/marketing-brief-template.md`** — Full Marketing Brief structure. Use it as the output skeleton; populate the sections relevant to the scope and omit the internal guidance tags from the final output.

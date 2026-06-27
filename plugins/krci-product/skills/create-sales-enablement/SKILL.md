---
name: Create Sales Enablement
description: This skill should be used when the user asks to "create sales enablement materials", "write a sales script", "build objection handling guide", "create battle cards", "build an ROI calculator", "write case studies", or "create sales tools". Develops a comprehensive sales enablement package including discovery and demo scripts, objection handling, competitive battle cards, ROI calculators, and customer case studies that empower sales teams to communicate value and close deals. For a standalone product demonstration script, use the create-demo-script skill instead.
argument-hint: <product>
allowed-tools: [Read, Write, Edit, Grep, Glob, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Sales Enablement

Develop a comprehensive sales enablement package that transforms marketing positioning into practical sales tools. The output equips sales teams with everything needed to communicate value propositions effectively and drive revenue — from first discovery call to signed contract.

## Workflow

1. **Confirm scope and target.** Identify the product from `$ARGUMENTS`. Confirm the marketing brief at `/docs/marketing/marketing-brief.md` and pitch deck at `/docs/marketing/pitch-deck.md` as source inputs. Confirm the output path (`/docs/marketing/sales-enablement.md`). If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Sales process analysis phase.** Review the existing sales methodology and identify gaps. Gather the most common customer objections. Document competitor positioning and counter-strategies. Compile customer success stories with specific, quantified results.
3. **Content development phase.** Create discovery call question frameworks that surface customer pain points. Structure demo frameworks for maximum impact. Develop conversation guides for moving prospects to decisions. Design follow-up communication templates.
4. **Competitive intelligence phase.** Build quick-reference battle cards for competitive situations. Create feature comparison matrices highlighting advantages. Develop value-based pricing conversation frameworks.
5. **Value demonstration phase.** Build an ROI calculator showing financial impact of product adoption. Create business case templates for internal justification. Compile proof points and validation resources.
6. **Structure with the template.** Use `references/sales-enablement-template.md` for all sections; populate every template variable. Target length is 10-15 pages covering all sales scenarios.
7. **Save output.** Write to the exact path `/docs/marketing/sales-enablement.md`.

## Quality Standards

Sales enablement materials must be conversion-focused (every tool moves prospects through the funnel), immediately usable (specific scripts, not generic advice), objection-anticipating (evidence-based responses), and value-quantified. Avoid these pitfalls:

- Generic sales advice without specific product context and customer scenarios
- Unsubstantiated claims that cannot be backed up with customer evidence
- Complex tools that sales teams cannot quickly learn and implement
- Battle cards that badmouth competitors without honest acknowledgment of their strengths
- ROI calculations with inflated or unrealistic savings numbers
- Case studies without specific before/after metrics or verifiable attribution

## Success Criteria

- File saved to `/docs/marketing/sales-enablement.md`
- Document is 10-15 pages covering all sales scenarios and tools
- Sales scripts cover discovery, demo, and closing phases with specific talk tracks
- Objection handling addresses the top 10 common objections with proven responses
- Competitive battle cards provide clear differentiation against key competitors
- ROI calculator demonstrates quantifiable business value with conservative assumptions
- Case studies showcase specific customer success stories with measurable outcomes (STAR method)
- Sales process defined with clear stages, activities, and exit criteria
- Sales process aligns with marketing messages and value propositions

## Reference Files

- **`references/sales-enablement-template.md`** — Full Sales Enablement structure covering sales scripts, objection handling, competitive battle cards, ROI calculator, case studies, sales process stages, and sales tools. Use it as the output skeleton; omit all internal guidance tags from the final output.

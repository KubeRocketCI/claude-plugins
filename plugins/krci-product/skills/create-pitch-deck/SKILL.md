---
name: Create Pitch Deck
description: This skill should be used when the user asks to "create a pitch deck", "build a presentation", "write investor slides", "make a sales presentation", "design a pitch", or "create a deck for stakeholders". Crafts a concise, high-impact 3-5 slide pitch deck using proven persuasion frameworks (Pain-Gains-Reveals, PAS, BAB, SCRAP) that transforms product features into an emotional story driving immediate audience action.
argument-hint: <product-or-audience>
allowed-tools: [Read, Write, Edit, Grep, Glob, AskUserQuestion, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Pitch Deck

Craft a concise, high-impact pitch deck that transforms product features into an emotional story driving immediate action. Focus on maximum "WOW factor" through powerful visuals, a compelling problem-solution narrative, and professional design — audiences should want the product within minutes, not hours.

## Workflow

1. **Confirm scope and target.** Identify the product and audience from `$ARGUMENTS`. Confirm the PRD location at `/docs/prd/prd.md` as the primary source. Confirm the output path (`/docs/marketing/pitch-deck.md`). If any referenced input is missing, report the exact path and HALT.
2. **Extract PRD information.** Pull product name, problem statement, solution overview, target users, key features (select 3-5), business model, and competitive advantage directly from the PRD.
3. **Ask interactive questions for gaps.** For information not covered in the PRD, use AskUserQuestion: Who is the specific presentation audience? What tone is preferred (professional, innovative, empathetic)? Who are the main competitors and what is the differentiation? What is the primary presentation objective (funding, partnerships, sales, alignment)?
4. **Select the optimal framework.** Choose based on audience and objective: **Pain-Gains-Reveals** (default for problem-aware audiences), **PAS** (urgency creation), **BAB** (transformation stories), **SCRAP** (structured executive narratives). Use `references/pitch-deck-template.md` Framework Adaptation Guide for structure.
5. **Structure content.** Apply the chosen framework across 3-5 slides. Integrate persuasion psychology: Social Proof in problem validation, Authority in solution presentation, Scarcity in competitive differentiation. Apply STAR method for all proof points.
6. **Generate the pitch deck.** Select the 3-5 slides from the template's slide menu that fit the chosen framework, and populate their variables from `references/pitch-deck-template.md`. Include visual design descriptions for each slide. Keep slides to 3-5 maximum.
7. **Save output.** Write to `/docs/marketing/pitch-deck.md`.

## Framework Application

```text
Pain-Gains-Reveals (default):
  Slide 1: Pain — problem with emotional context
  Slide 2-3: Gains — value proposition with quantifiable benefits
  Slide 4-5: Reveals — differentiators and competitive advantages

PAS:
  Slide 1: Problem — identify specific pain point
  Slide 2: Agitation — amplify emotional impact and consequences
  Slide 3-5: Solution — present product with proof, demo, and action

BAB:
  Slide 1: Before — current undesirable state
  Slide 2: After — desired future state with benefits
  Slide 3-5: Bridge — solution connecting before to after, with proof

SCRAP:
  Slide 1: Situation — market context and opportunity
  Slide 2: Complication — problem preventing success
  Slide 3: Resolution — solution approach
  Slide 4: Action — specific next steps required
  Slide 5: Payoff — expected ROI and benefits
```

## Quality Standards

Maintain framework adherence, persuasion integration, emotional impact, visual storytelling, and evidence structure. Avoid these pitfalls:

- Feature lists without clear customer benefit and emotional connection
- Generic slide content that lacks specific visual design guidance
- Overwhelming information density that dilutes core message impact
- Mixing frameworks — commit to one chosen framework throughout
- Opening with company history or generic introductions instead of a hook
- Slides that cannot stand alone without context from previous slides

## Success Criteria

- File saved to `/docs/marketing/pitch-deck.md`
- Slide count is 3-5 maximum
- Opening hook creates immediate engagement within the first 30 seconds
- Problem statement resonates emotionally with target audience pain points
- Solution reveal has a clear AHA moment that demonstrates product value
- Visual design descriptions enable compelling slide creation
- At least two persuasion principles integrated (Social Proof, Authority, Scarcity)
- All proof points follow the STAR method (Situation-Task-Action-Result)
- Call to action is specific and drives desired next steps
- Framework applied consistently across all slides

## Reference Files

- **`references/pitch-deck-template.md`** — Full Pitch Deck structure with framework adaptation guide, variable source guide, PRD integration instructions, and visual design format examples. Use it as the output skeleton; omit all internal guidance tags from the final output.

---
name: Create Launch Materials
description: This skill should be used when the user asks to "create launch materials", "write a press release", "build a launch campaign", "create social media content for launch", "write website copy", "create email campaign", or "produce launch assets". Produces comprehensive multi-channel product launch campaign materials including press releases, website copy, social media content, email sequences, promotional assets, and a media kit that generate buzz and drive user adoption.
argument-hint: <product-or-launch>
allowed-tools: [Read, Write, Edit, Grep, Glob, TodoWrite]
authors:
    - Sergiy Kulanov <sergiy_kulanov@epam.com>
---

# Create Launch Materials

Produce comprehensive product launch campaign materials that generate buzz, drive awareness, and maximize market impact. The output is a cohesive, multi-channel launch package that builds excitement and drives user adoption — ready for immediate execution by the marketing team.

## Workflow

1. **Confirm scope and target.** Identify the product and launch scope from `$ARGUMENTS`. Confirm the marketing brief at `/docs/marketing/marketing-brief.md` as the strategy source and the PRD at `/docs/prd/prd.md` as context. Confirm the output path (`/docs/marketing/launch-materials.md`). If any referenced input is missing, report the exact path and HALT. Use TodoWrite to track the remaining steps.
2. **Campaign planning phase.** Define launch phases and milestone dates. Identify optimal distribution channels for each material type. Segment audiences for tailored messaging. Plan launch timing to maximize market advantage.
3. **Content creation phase.** Draft the press release with a newsworthy angle and compelling headline. Write conversion-focused website copy. Create platform-specific social media content calendars. Design email nurture sequences for each customer journey stage.
4. **Visual asset phase.** Specify digital asset requirements (banners, social graphics, web assets). Define print material content (flyers, brochures, conference materials). Establish brand consistency standards across all materials. Include mobile optimization requirements.
5. **Distribution planning phase.** Compile target media and publication list. Identify influencer outreach opportunities. Create co-marketing asset guidance for strategic partners. Prepare internal sales and customer success enablement materials.
6. **Structure with the template.** Use `references/launch-materials-template.md` for all sections; populate every template variable precisely. Ensure cohesive messaging across all channels.
7. **Save output.** Write to the exact path `/docs/marketing/launch-materials.md`. Target length is 8-12 pages.

## Quality Standards

Launch materials must be newsworthy (clear "news" value media will cover), channel-optimized (each platform's specific format), conversion-focused (drive signups, demos, trials), and measurement-enabled. Avoid these pitfalls:

- Generic announcements without compelling news angle or unique value
- Inconsistent messaging across different launch materials and channels
- Platform-agnostic content that does not optimize for specific channel requirements
- Missing media kit or insufficient assets for press and analyst outreach
- Launch timeline without specific dates, owners, or milestone tracking
- Social media content that is identical across platforms

## Success Criteria

- File saved to `/docs/marketing/launch-materials.md`
- Document is 8-12 pages covering all launch components
- Press release follows industry standards with compelling headline and newsworthy angle
- Website copy converts visitors with clear value proposition and strong calls-to-action
- Social media content includes platform-specific posts optimized for engagement
- Email campaigns include clear sequences for different audience segments
- Promotional materials include digital and print asset specifications with consistent branding
- Media kit provides comprehensive assets for journalists and analysts
- Launch timeline coordinates all materials release for maximum impact
- Success metrics defined with measurement plan

## Reference Files

- **`references/launch-materials-template.md`** — Full Launch Materials structure covering press release, website copy, social media campaign, email sequences, promotional materials, media kit, launch timeline, and success metrics. Use it as the output skeleton; omit all internal guidance tags from the final output.

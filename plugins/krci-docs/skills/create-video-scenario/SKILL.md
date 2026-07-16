---
name: KRCI Video Scenario Writer
description: This skill should be used when the user asks to "write a video scenario", "write a script for a video", "plan a video about X", "update the scenario for my video", or "help me script a KubeRocketCI overview video". Writes or revises a narration script for a short KubeRocketCI overview/tutorial video, structured for a slide-deck + hands-on recording workflow. For building the React presentation app itself, defer to create-video-presentation-app.
argument-hint: <topic> [existing-scenario-file]
allowed-tools: [Read, Write, Edit, Grep, Glob, WebFetch, Bash, AskUserQuestion]
authors:
    - KubeRocketCI Team
---

# Video Scenario Writer

Write or revise the narration script for a short KubeRocketCI overview video. The scenario is a plain-text file that drives two things at once: the voiceover, and the React slide app the presenter advances with the arrow keys while recording (see `create-video-presentation-app`).

## Language

Reply to the user in the language they wrote to you in, even though this skill's own instructions and
reference files are written in English. Keep code, class names, file paths, and the scenario/VO text
itself in English regardless (the video's audience and the codebase are English) — only your
conversational replies to the user should switch.

## Before Writing

1. **Confirm the topic and scope.** If unclear, ask what the video covers and who the audience is (e.g. "new users learning KubeRocketCI 3.13 terminology").
2. **Check for an existing draft.** If the user has a rough draft (bullet notes, half-English/half-native-language, `(slide)` markers), treat it as the source of truth for content — do not discard it. Write the polished version to a **new file** (e.g. `<topic>-scenario-final.txt`) alongside the original, never overwrite the draft. If there is **no** draft, create the scenario at `<topic-slug>-scenario.txt` in the working directory (same `<topic-slug>` the follow-on `create-video-presentation-app` skill expects — it derives the app folder `<topic-slug>-overview-app` and the shared metrics `video` key from this name), so the scenario is discoverable by that skill.
3. **Get the facts right before writing prose.** For any factual claim about KubeRocketCI behavior (exact form fields, exact config keys, supported providers, etc.), verify against the official docs (`docs.kuberocketci.io`) or the relevant source repo (`epam/edp-install`, `epam/edp-tekton`, etc.) — see "Sourcing facts" below. Do not guess at UI field names or YAML keys.
4. **Decide the slide breakdown before writing the voiceover.** List the slides as one-idea-per-slide bullets and confirm the breakdown with the user (via AskUserQuestion if there's a real tradeoff, e.g. "compact 3 slides" vs "expanded 6 slides") before writing full prose — restructuring after the prose is written wastes more of the user's time than agreeing on structure first.

## Sourcing Facts

- Prefer targeted fetches over bulk cloning: `WebFetch` a specific doc page, or `curl` a specific raw file URL (e.g. `raw.githubusercontent.com/epam/edp-install/master/deploy-templates/values.yaml`) and `grep`/`sed` the relevant section.
- Only clone a full repository locally if the task genuinely requires searching across many files or running code.
- If a doc page and your prior knowledge disagree, trust the fetched page and flag the discrepancy to the user.

## Format

Follow this exact structure (see `references/scenario-format.md` for the full template and a worked example):

1. **Recording markers legend** at the top of the file: `>>>>>>>>>>>>>>>>>>>>>>>>>STOP` (pause point between audio segments) and `→` (press Right Arrow — next step or next reveal element on the same slide).
2. **React app step map**: a numbered list mapping each app step (`0, 1, 2, ...`) to its slide name and how many times `→` reveals elements within it. Write this *after* the slide breakdown is agreed, and keep it in sync if slides change later.
3. **Intro**: greeting, series framing ("part of the updated KubeRocketCI 3.13 series..."), one-sentence agenda.
4. **Theory**, one `STOP`-delimited segment per slide. Each segment's prose must match the reveal steps declared in the step map — don't reveal 3 things on a slide the voiceover only explains in one breath.
5. **Hands-on transition slide**, then a **hands-on segment map** (numbered list of what happens in the recording — portal/terminal/browser — with no React arrows involved).
6. **Hands-on walkthrough**: narration interleaved with bracketed stage directions, e.g. `[Navigate to Configuration → Git Servers → Add Git Server]`.
7. **Outro**: brief recap, thanks, teaser for the next video in the series.

**Line wrapping**: keep every narration line under roughly 140 characters — the presenter reads this
in an IDE at a large, fixed font size while recording voice, and can't resize or scroll mid-take. When
a sentence would run longer, break it at a natural clause boundary (a comma, dash, or before a
conjunction like "and"/"since"/"so") onto a continuation line, indented with a single leading space so
it reads as "same thought continues" rather than a new paragraph. Do not insert a blank line between a
line and its continuation — blank lines are reserved for actual topic/paragraph breaks (the same
places a `STOP` segment or a new beat would go). See `references/scenario-format.md` for a worked
example. Stage directions in brackets and step-map lines follow the same length guideline where
practical, but it matters most for the actual spoken narration.

## Key Principles (learned from production experience)

- **"Prepare, then use."** When hands-on steps involve gathering credentials/prerequisites (SSH keys, tokens, secrets) before filling out a form, gather everything first, then fill the form in one uninterrupted pass. Don't leave a half-filled form open on screen while switching apps — it reads as sloppy and wastes recording time.
- **One idea per slide.** If a single `STOP` segment is doing the work of two ideas, split it into two slides instead of cramming reveals.
- **Never suggest showing real secrets on screen** (private keys, tokens) even if the plan is to delete/rotate them afterward — recommend redacted/mock values instead. Flag this proactively if the user's hands-on plan involves live credentials.
- **Catchy, concrete titles over generic ones.** Don't default to `<Topic> Overview` (e.g. "GitOps Overview") — it's accurate but forgettable. Lead with a short, concrete hook that names the specific payoff or a striking reframe of the topic, then the topic and series tag: `<Hook> — <Topic> (KRCI <version>)`. Real examples from this series: `The Invisible Foundation of CI/CD — Git Servers (KRCI 3.13)`, `The Repo That Runs Your Cluster — GitOps (KRCI 3.13)`. Keep the hook to 3–6 words — a full sentence stops being a hook. Prefer a concrete, almost literal image over an abstract claim (e.g. "the repo that runs your cluster" over "your source of truth") — concrete hooks are easier to picture and less generic. Always propose 3–5 options and let the user pick rather than committing to one.

## Metrics Logging

Append one row to `~/.claude/krci-video-metrics.csv` (create the file with a header row if it doesn't exist: `timestamp,video,skill,event,note`) at these points only:

- Once, when the first full draft of the scenario is delivered: `event=build`.
- Each time the user asks for a substantive content/structure revision after that: `event=revision`, with a short `note` (e.g. `"reordered hands-on steps"`).

Column values (keep these consistent so per-video counts aggregate correctly across both video skills): `timestamp` = UTC ISO-8601 (`date -u +%Y-%m-%dT%H:%M:%SZ`); `video` = the topic slug, **derived from the scenario filename** (e.g. `git-servers-overview`) so this skill and `create-video-presentation-app` write the same key for the same video; `skill` = `create-video-scenario`. Quote any field that may contain a comma (wrap `note` in double quotes and double any inner `"`).

Do not log unrelated conversation (e.g. brainstorming titles is fine to skip, or log it with `note="title brainstorm"` at your discretion — use judgment, the goal is tracking iteration count toward a finished scenario, not every message). Never interrupt the conversation to announce a log write. If the user asks for their stats ("show my video scenario stats", "how many revisions did this take"), read the CSV, summarize counts per video, and offer to render a bar chart via the Artifact tool (one bar per video, height = revision count).

## Reference Files

- **`references/scenario-format.md`** — full annotated template, a worked example (Git Servers overview), and the reveal-step/voiceover-alignment convention in detail.

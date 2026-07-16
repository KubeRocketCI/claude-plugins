---
name: KRCI Video Presentation App Builder
description: This skill should be used when the user asks to "build a presentation app for my video", "make a React slide deck for this video", "replace my PowerPoint with a React app", "update my video's app to the new steps", or "add a slide to my video app". Scaffolds or extends a single-purpose, keyboard-driven React slide deck used to record the theory segment of a KubeRocketCI overview video, in an established dark, animated visual style. For writing the narration script/slide breakdown itself, defer to create-video-scenario.
argument-hint: <scenario-file-or-topic>
allowed-tools: [Read, Write, Edit, Grep, Glob, Bash, WebFetch, AskUserQuestion]
authors:
    - KubeRocketCI Team
---

# Video Presentation App Builder

Build or extend a small Vite + React app that the presenter runs locally and advances with the arrow
keys while recording narration — replacing hand-built PowerPoint slides. One app per video, one step
per slide, reveal-by-reveal within a slide.

## Language

Reply to the user in the language they wrote to you in, even though this skill's own instructions and
reference files are written in English. Keep JSX/CSS, class names, file paths, and on-screen slide text
itself in English regardless (the video's audience and the codebase are English) — only your
conversational replies to the user should switch.

## Workflow

1. **Get the scenario first.** The app's step map and reveal counts come directly from the video
   scenario (see `create-video-scenario`). If no scenario exists yet, ask for one or offer to invoke
   that skill first — don't invent a slide breakdown from scratch.
2. **Reuse the established visual system.** Read `references/design-system.md` before writing any
   component or CSS. Do not invent new colors, fonts, or animation idioms — this app must look like it
   belongs to the same series as every other video's app.
3. **Scaffold from the boilerplate.** Read `references/app-scaffold.md` for the exact
   `package.json`/`vite.config.js`/`index.html`/`main.jsx`/`index.css` to copy verbatim, the
   step/reveal state machine, and folder layout (`public/` for screenshots, `src/App.jsx` + `App.css`).
4. **One React component per slide**, driven by a `step` index and, where a slide reveals multiple
   elements, a `reveal` counter — see the state machine in `references/app-scaffold.md`.
5. **Screenshots**: when the user says they'll provide a screenshot, wire up a real `<img src="/name.png">`
   pointed at a `public/name.png` path immediately — do not build a placeholder component "to swap
   later." Tell the user the exact filename to save their screenshot as.
6. **Sanity-check, don't run the dev server.** After scaffolding or editing, run `npm install` (once)
   and `npm run build` to catch errors, then `rm -rf dist` to clean up the build artifact. Never run
   `npm run dev` yourself and never leave a background process running — the presenter runs their own
   dev server so they control exactly what's on screen while recording.

## Sourcing Facts for Diagrams

When a slide diagrams a real KubeRocketCI mechanism (e.g. "how does values.yaml wire up a Git
Server"), verify it against the actual source before drawing it — prefer a targeted `curl`/`WebFetch`
of the specific doc page or raw source file over bulk-cloning a repository. Getting a diagram
confidently wrong is worse than not having the diagram.

## Key Principles (learned from production experience)

- **Motion must mean something.** Reserve animated "flowing" elements (moving dots along a line) for
  things that actually represent an ongoing process over time, like a pipeline executing stage by
  stage. A static relationship (`A provides B`, `A is a kind of B`) gets a static arrow, optionally
  with a label — animating it anyway reads as "animation for animation's sake" once you actually watch
  the recording back.
- **Follow the design system's established patterns rather than inventing new idioms.** Some are
  shipped as copy-paste code in `references/design-system.md` (`Reveal`, `FlowArrow`, `container-box`,
  `media-swap`) — copy those directly. The rest (`WelcomeSlide`, card patterns like `strategy-card` /
  `pt-card` / `vcs-card`, and the core layout/reveal/flow CSS classes) are described by shape and
  behavior, not shipped as literal code — build them to match the description so every app in the
  series stays visually consistent, and reuse the same class names. Either way, do not write parallel
  one-off colors, fonts, or animation idioms.
- **Crossfade, don't hard-swap, when a slide's image needs to change mid-slide** (e.g. "show config A,
  then on the next reveal show config B in the same spot"). Stack both images absolutely in the same
  container and cross-fade `opacity` — an instant DOM swap has no transition no matter how the
  className is computed.
- **Don't over-animate.** Default to motion only on: the title slide (slow ambient glow), the
  signature flow-arrow (pipeline/process slides), and reveal transitions (fade/slide-in). Everything
  else stays static so it doesn't compete with the voiceover or look busy after video compression.
- **Ask before guessing on visually ambiguous feedback.** Directional feedback like "move it further"
  or "make it further left/right" can be genuinely ambiguous relative to a prior fix — confirm the
  direction before editing if there's real room for misreading it.
- **Draw containment, don't imply it.** "X contains Y" (a cluster containing environments, a repo
  containing files) needs an actual bounding box around Y that belongs to X (`container-box` pattern in
  `design-system.md`) — a label floating near a group of items, or a handful of short connector lines
  pointing at each item, reads as broken once you actually look at the result.
- **Check for sparse-in-a-big-frame.** If a slide's content ends up as a small cluster surrounded by a
  lot of empty black space, that's a sizing defect to fix (bigger icons/text/gaps), not something to
  leave for the presenter to compensate for by zooming their browser every time.

## Metrics Logging

Append one row to `~/.claude/krci-video-metrics.csv` (create the file with a header row if it doesn't
exist: `timestamp,video,skill,event,note`) at these points only:

- Once, when the app first builds successfully end-to-end for this video: `event=build`.
- Each time the user requests a change after that first working version: `event=revision`, with a
  short `note` (e.g. `"gerrit card too dim"`, `"crossfade instead of hard swap"`).

Column values (keep these consistent so per-video counts aggregate correctly across both video skills):
`timestamp` = UTC ISO-8601 (`date -u +%Y-%m-%dT%H:%M:%SZ`); `video` = the topic slug, **derived from the
scenario filename** (e.g. `git-servers-overview`) so this skill and `create-video-scenario` write the
same key for the same video; `skill` = `create-video-presentation-app`. Quote any field that may
contain a comma (wrap `note` in double quotes and double any inner `"`), so a natural-language note
never breaks the row.

Never interrupt the recording/iteration flow to announce a log write — log silently. If the user asks
for their stats ("show my app-building stats"), read the CSV, summarize revision counts per video, and
offer to render a bar chart via the Artifact tool (one bar per video, height = revision count) so
progress across videos is visible at a glance.

## Reference Files

- **`references/design-system.md`** — colors, fonts, the `Reveal`/`FlowArrow` primitives, when to
  animate vs. keep static, screenshot handling.
- **`references/app-scaffold.md`** — exact boilerplate files, project structure, and the step/reveal
  state machine to implement `App.jsx` around.

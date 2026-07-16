# Scenario Format Reference

A KubeRocketCI overview-video scenario is a plain `.txt` file. It is read aloud while the presenter
advances a React slide app (see the `create-video-presentation-app` skill) with the arrow keys, then
switches to a live portal/terminal/browser recording for the hands-on part.

## Full Template

```
Recording markers (for voice + React screen recording):
  >>>>>>>>>>>>>>>>>>>>>>>>>STOP  — end of this audio segment; pause before the next part
  →                            — press Right Arrow (next main step, or next element on the same slide)

On the "<Slide Name>" slide (step N), press → K× to reveal <what each press reveals>.
[... one line per slide that has reveal steps ...]

React app step map (<app-folder-name>, steps 0–M):
  0   black screen (open app here; → fades to title slide in edit)
  1   Welcome title slide
  2   <Slide 2 name>                   ← → K×: <element 1>, <element 2>, ...
  3   <Slide 3 name>                   ← <one-line description if no reveal steps>
  ...
  M   Hands-On transition → portal demo

---

Greetings! In this video, we will discuss <Topic> in KubeRocketCI.

This video is part of the updated KubeRocketCI <version> series that reflects the new UI, current
terminology, and updated platform workflows.

We will get familiar with <one-sentence agenda>.

>>>>>>>>>>>>>>>>>>>>>>>>>STOP

          [Open React app — step 0, black screen; → to title slide; fade in edit or live]

          [Hold on step 1 title slide during intro if needed]

→

<Theory segment 1 narration, aligned with the slide's reveal count>

>>>>>>>>>>>>>>>>>>>>>>>>>STOP

[... repeat one STOP-delimited segment per theory slide ...]

          [Step M — switch to KubeRocketCI portal]

Hands-on segment map (portal + terminal + browser recording; no React arrows):
  1  <first hands-on action>
  2  <second hands-on action>
  ...

>>>>>>>>>>>>>>>>>>>>>>>>>STOP

<Hands-on narration interleaved with bracketed stage directions like:>

          [Navigate to Configuration → Git Servers → Add Git Server]

>>>>>>>>>>>>>>>>>>>>>>>>>STOP

[... repeat per hands-on beat ...]

That wraps up our look at <Topic>. We covered <brief recap>.

Thank you for watching. If you have questions, visit our documentation or reach out to the team.

In the next videos, we'll go deeper into <teaser>.

Have a great day.
```

## Reveal-Step / Voiceover Alignment

The step map's `→ K×` count for a slide must match how many distinct beats the voiceover narrates on
that slide. If the voiceover says three things but the step map only reveals one, either add reveal
steps to the app or add more `→` markers with matching narration. Example (three-beat slide):

```
→

Once that access exists, everything else follows. Review and Build pipelines pull the source code to
analyze and compile it.

→

Code scanners like SonarQube and Dependency-Track need the same access before they can scan anything.

→

And when it's time to deploy — whether it's a main or release branch going to production, or a feature
branch tested in dev — the pipelines still start from that same repository access.
```

Each `→` corresponds to one press of the Right Arrow key during recording, which triggers one reveal
in the React app (see that skill's step/reveal state machine).

## Line Wrapping for Recording

The presenter reads this file in an IDE, at a large fixed font size, while simultaneously recording
voice — they can't shrink the font (eye strain) or comfortably scroll/resize mid-take. So no narration
line should run past roughly **140 characters**. A sentence that would be longer gets manually
soft-wrapped at a natural clause boundary, with the continuation line indented by a single leading
space (marking "this continues the same thought") and *no* blank line inserted (blank lines are
reserved for real paragraph/topic breaks). Example, from a real scenario:

```
In the previous video, we covered Deployments and Environments in detail.
 If you haven't watched it yet, it's worth checking out first, since we'll be building directly on
 those concepts here.
```

Not this (one long unbroken line the presenter would have to scroll or squint to read):

```
In the previous video, we covered Deployments and Environments in detail. If you haven't watched it yet, it's worth checking out first, since we'll be building directly on those concepts here.
```

And not this either (blank line makes it read as a new, disconnected thought instead of a continuation):

```
In the previous video, we covered Deployments and Environments in detail.

If you haven't watched it yet, it's worth checking out first, since we'll be building directly on
those concepts here.
```

## Worked Example: Git Servers Overview (excerpt)

```
On the "Why you need a Git Server" slide (step 2), press → 3× to reveal each link in the chain
(branching/versioning, pipelines, deployment).
On the "Supported VCS types" slide (step 4), press → 4× to reveal each card (GitHub, GitLab,
Bitbucket, Gerrit).

React app step map (git-servers-overview-app, steps 0–7):
  0   black screen (open app here; → fades to title slide in edit)
  1   Welcome title slide
  2   Why you need a Git Server        ← → 3×: branching/versioning, pipelines, deployment
  3   What is a Git Server             ← structure: status, type, host, user, ports, SSH keys
  4   Supported VCS types              ← → 4×: GitHub, GitLab, Bitbucket, Gerrit
  5   What you need to integrate       ← → 2×: SSH key, access token
  6   Two ways to add a Git Server     ← → 2×: values.yaml at deploy time, KubeRocketCI portal
  7   Hands-On transition → portal demo
```

## "Prepare, Then Use" Ordering for Hands-On Steps

When a hands-on flow requires gathering credentials or prerequisites before filling in a UI form,
order the steps so everything is prepared *first*, and the form is filled in *one uninterrupted pass*:

- **Avoid**: open the form → switch away to generate a key → come back and paste it → switch away
  again to generate a token → come back and paste that too.
- **Prefer**: generate the key → add it to the provider → generate the token → copy it → *then* open
  the form and fill in every field in one pass.

This reads better on screen (no half-filled forms sitting idle) and mirrors how a real user would
actually do it.

## Security Note

Never write a hands-on step that shows a real private key or access token on screen — even if the
plan is to delete or rotate it afterward, treat anything captured on screen as compromised. Recommend
redacted/mock values (`ssh-ed25519 AAAA...`, `ghp_****`) for any slide or screenshot that would
otherwise expose one.

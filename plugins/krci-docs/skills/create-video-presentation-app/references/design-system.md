# Video Presentation App — Design System

Every video's app is a standalone Vite project, but they must all look like they belong to the same
series. This file is the single source of truth for the visual language — copy it forward into every
new app rather than re-deriving colors/animations from scratch.

## Palette & Typography

- Background: pure black (`#000000`) for the whole app shell.
- Font: `DM Sans` (Google Fonts, weights 400/600/700), loaded via `<link>` in `index.html`; fallback
  `-apple-system, sans-serif`.
- Accent colors, used consistently for meaning, not decoration:
  - **Cyan** `#18e5f1` — the primary accent: active/current state, the "main" path, arrows, glows.
  - **White** (`rgba(255,255,255,*)` at varying opacity) — neutral/default state.
  - **Amber** `#f59e0b` / `#f6ad55` — a second distinguishing state (e.g. "the other option", a warning-adjacent state).
  - Additional hues (e.g. violet `rgba(167,139,250,*)`, green `#68d391`, red `#f87171`) are fine for a
    4th+ distinct category, but pick one and use it consistently for that category across the slide.
- Text: headings `#ffffff` bold; body text `rgba(255,255,255,0.7–0.9)`; de-emphasized notes
  `rgba(255,255,255,0.35–0.5)`.

## Layout Shell

- `.app`: centered column, `max-width: 1280px`, black background, `padding-top: 22vh` (content sits in
  the upper-middle of the frame — this is a recording, not a scrollable page).
- `.app--welcome` modifier removes the max-width/padding for the full-bleed title slide.
- `.content-wrap[data-visible='true']` fades the active slide's container in/out (`opacity`
  transition) — used so slide switches aren't an abrupt cut. Match on the exact value `='true'`,
  never a bare `[data-visible]`: React stringifies a boolean prop, so `data-visible="false"` is still
  present in the DOM and a bare attribute-presence selector would match both states (same convention as
  `[data-empty-screen='true']`).
- Two slide layout patterns cover almost everything:
  - `.slide` (single column, centered) — for diagrams, card rows, single-topic slides.
  - `.slide-split` (`grid-template-columns: 1fr 1fr`) — text on the left, image/diagram on the right.
    Collapses to a single column under 900px (not usually relevant for recording, but keep the media
    query for safety).

## The `Reveal` Primitive

Every slide that discloses information progressively (rather than showing everything at once) wraps
each revealable element in a `Reveal` component:

```jsx
function Reveal({ show, children, className = '', style }) {
  return (
    <div className={`reveal ${className}`.trim()} data-visible={show} style={style}>
      {children}
    </div>
  )
}
```

There are three CSS variants, pick per element:

- **Default `.reveal`** — collapses to zero width/height when hidden (`max-width: 0`), good for cards
  that sit in a horizontal row so hidden siblings don't leave a gap.
- **`.reveal-fade`** — no collapse, just opacity + a small `translateY`; good for stacked text blocks
  where a layout jump would look worse than a static reserved space.
- **`.reveal-diagram`** — opacity + `visibility` only, no transform; good for a right-column
  image/diagram that should not shift position as it appears.

**Centering trap:** `.reveal-fade` and `.reveal-diagram` both force `display: block; width: 100%` on
the wrapper (by design, so their content doesn't collapse). That means any child you put inside with
its own `max-width` (to cap a diagram's width) needs its own explicit `margin: 0 auto` to actually
center — a `display: flex; align-items: center` on that child only centers *its own* children, not
itself within the block-level `Reveal` wrapper. If a capped-width block sits stubbornly at the left
edge instead of centering, this is almost always why. Don't try to fix it by adjusting `align-items` on
some ancestor flex container — check for the missing `margin: 0 auto` on the capped-width element
first.

## The `FlowArrow` Primitive

A connector between two nodes, with an optional label:

```jsx
function FlowArrow({ show, label, static: isStatic = false }) {
  return (
    <Reveal show={show} className="flow-arrow-wrap">
      <div className="flow-arrow">
        <div className="arrow-line" />
        {!isStatic && (
          <>
            <div className="flow-dot" style={{ animationDelay: '0s' }} />
            <div className="flow-dot" style={{ animationDelay: '1.2s' }} />
            <div className="flow-dot" style={{ animationDelay: '2.4s' }} />
          </>
        )}
        <div className="arrow-head" />
        {label && <span className="arrow-label">{label}</span>}
      </div>
    </Reveal>
  )
}
```

**When to animate vs. not (read this before adding any arrow):**

- Use the **animated** flow (default, `static` unset) when the arrow represents an actual process
  happening over time — pipeline stages executing in sequence, data moving from one stage to the next.
  This is the "signature" motion of the series; keep it for that meaning only.
- Use `static` (no moving dots, optionally with a `label`) when the arrow represents a static logical
  relationship — "A provides B", "A is a kind of B", "A configures B". Animating a static relationship
  reads as "animation for animation's sake" once you watch the recording back — it implies a process
  that isn't actually happening.
- If in doubt: ask "does this thing happen once, continuously, in the background — or does it *occur*
  over time, stage by stage?" The former is static; the latter is animated.

## The `container-box` Pattern (Visual Containment)

When a slide's content says "X contains Y" or "Y lives inside X" (a repo containing files, a cluster
containing environments, a namespace containing pods), **draw an actual bounding box around Y that
belongs to X** — do not represent containment with a label sitting near a group of otherwise-unrelated
elements, and do not try to fake it with a handful of short connector lines pointing at each item. A
label next to a group is not the same as a box drawn around it, and it reads as broken/disconnected
once you actually look at the recording.

```jsx
<div className="container-box">
  <div className="container-box-label">Cluster</div>
  {/* contained content goes here, e.g. a row of env cards */}
</div>
```

```css
.container-box {
  position: relative;
  border: 1px solid #18e5f1;
  border-radius: 16px;
  padding: 1.75rem 2rem 1.5rem;
  background: rgba(24,229,241,0.03);
  box-shadow: 0 0 32px rgba(24,229,241,0.08);
}

.container-box-label {
  position: absolute;
  top: -0.7rem;
  left: 1.5rem;
  background: #000; /* must match the page background so the border reads as "cut" by the tab */
  padding: 0 0.6rem;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #18e5f1;
  text-transform: uppercase;
}
```

Reserve `FlowArrow`/connectors for things *outside* a container pointing *into* or *out of* it (e.g. a
"define parameters" arrow from a Developer node into a repo, or a repo's file feeding into the cluster
below it) — not for connecting multiple sibling items that are already inside the same logical group.
If you find yourself drawing three or more short parallel connector lines to prove "these things belong
together", that's the signal to use a `container-box` instead.

## Idle/Ambient Motion — Use Sparingly

- The **title slide only** gets slow ambient motion: two radial-gradient "glow" blobs behind the title,
  breathing via `scale`/`opacity` on a 7–9s ease-in-out infinite loop, staggered with a negative
  `animation-delay` so they don't pulse in sync. This is the one place where motion for its own sake is
  appropriate — it signals production quality without competing with any content (there is no content
  yet, just the title).
- Do **not** add idle motion to data-dense slides (card grids, pipeline stages, comparisons) — a
  reviewer or viewer reading text needs it to hold still. If a slide feels "flat", prefer a one-time
  reveal transition over a looping idle animation.

## Screenshots

- Once the user says they'll provide a screenshot, wire up the real `<img>` immediately:

  ```jsx
  <img src="/exact-filename.png" alt="Descriptive alt text" className="slide-screenshot" />
  ```

  Tell the user the exact filename to drop into `public/`. Do **not** build a placeholder component
  "to swap in later" — it's an extra edit that's easy to forget and has caused real confusion (a user
  dropped screenshots into `public/` and they didn't show up because a placeholder was still wired in).
- `.slide-screenshot` base style: `max-height: 55vh; width: auto; max-width: 100%; align-self: center;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);` — **no `border-radius`**: real product screenshots already
  have their own UI chrome/corners; rounding the screenshot's own bounding box looks wrong against it.
- **Crossfading between two images in the same slot** (e.g. "config A" then "config B" on the next
  reveal, same position on the slide): stack both `<img>` absolutely in a positioned container and
  toggle an `is-visible` class that transitions `opacity`. A ternary that swaps which `<img>` is
  rendered has no transition — React just replaces the DOM node instantly.

  ```jsx
  <div className="media-swap">
    <img src="/a.png" className={`slide-screenshot media-swap-img${step === 1 ? ' is-visible' : ''}`} />
    <img src="/b.png" className={`slide-screenshot media-swap-img${step >= 2 ? ' is-visible' : ''}`} />
  </div>
  ```

  ```css
  .media-swap { position: relative; width: 100%; min-height: 380px; }
  .media-swap-img { position: absolute; inset: 0; margin: auto; opacity: 0; transition: opacity 0.6s ease; }
  .media-swap-img.is-visible { opacity: 1; }
  ```

- Never put a real secret (private key, access token, password) in a screenshot, even redacted-after
  the fact — treat anything ever captured as compromised. Ask the user to provide a screenshot with
  sensitive fields already blanked/mocked, or build a mock UI with placeholder values instead.

## Sensible Defaults

- Card-row patterns (`strategy-card`, `pt-card`, `vcs-card`, etc.) are not shipped as literal code —
  they all follow the same shape: a rounded box, a colored top border or full border for category, a
  title, optional badge, optional description. Build any new "N options/categories side by side" slide
  to match this shape (and reuse these class names) rather than inventing a new card style.
- Give every "different from the others" category (like a card representing an exception/edge case) a
  fully opaque, distinctly colored border+background rather than dimming it with a flat `opacity`
  reduction — a dimmed-opacity card can become nearly invisible after video compression.

## Sizing for the Actual Recording Canvas

The `.app` shell's `max-width: 1280px` and per-element `rem`/`px` sizes assume the presenter's browser
window is roughly that width (or zoomed in to fill it) when recording — not a fullscreen 4K capture. If
a slide, once actually opened in a browser, shows a small cluster of content swimming in a large area
of black, that is a real defect to fix, not something the presenter is expected to compensate for by
zooming every time:

- Increase icon sizes and font sizes on the affected slide until the content reads clearly as the
  focal point of the frame, not a small detail within it. As a reference point, decorative icons in a
  benefits/definition-style row read well around 96–110px, not 32–68px.
- Prefer generous `gap`/`padding` over shrinking things to "make room" — empty space between clearly
  legible elements looks intentional; empty space *around* tiny elements looks like a bug.
- After any layout change, mentally check it against the frame size the video will actually be
  recorded at (the user will tell you if unsure) — a layout that looks fine in a narrow preview can
  still look sparse full-screen.

# Video Presentation App — Scaffold

Exact boilerplate for a new video's app. Copy these files verbatim (only renaming the project and
title), then build slide components per `design-system.md` and the video's scenario file.

## Project Structure

```
<video-slug>-app/
  package.json
  vite.config.js
  index.html
  public/
    <screenshot-1>.png       ← dropped in by the user later
    <screenshot-2>.png
  src/
    main.jsx
    index.css
    App.jsx                  ← one function component per slide + the step/reveal state machine
    App.css                  ← design-system.md patterns, extended per-slide
```

## `package.json`

```json
{
  "name": "<video-slug>-app",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.2.0"
  }
}
```

## `vite.config.js`

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

## `index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><Video Title></title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap"
      rel="stylesheet"
    />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

## `src/main.jsx`

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## `src/index.css`

```css
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'DM Sans', -apple-system, sans-serif;
  background: #000000;
  min-height: 100vh;
  color: #ffffff;
}

#root {
  min-height: 100vh;
  padding: 1.5rem 2rem;
}

#root:has(.app--welcome) {
  padding: 0;
}

#root:has(.app[data-empty-screen='true']) {
  padding: 0;
}
```

## Step/Reveal State Machine (`src/App.jsx`)

This is the core interaction model — every app in the series uses it unchanged:

```jsx
import { useState, useEffect } from 'react'

const TOTAL_STEPS = <N>  // total number of steps, including step 0 (black) and the last (transition)

const REVEAL_MAX = {
  // stepIndex: number of extra reveals on that step (omit steps with no reveal — default 0)
  2: 3,
  4: 4,
}

export default function App() {
  const [step, setStep] = useState(0)
  const [reveal, setReveal] = useState(0)

  const revealMax = REVEAL_MAX[step] ?? 0

  // Reveal is reset/restored explicitly by each navigation branch below — do NOT add a
  // `useEffect(..., [step])` that blanket-resets reveal to 0, or it will clobber the
  // back-navigation branch that restores the previous step's last reveal.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        if (reveal < revealMax) {
          setReveal((r) => r + 1)
        } else if (step < TOTAL_STEPS - 1) {
          setStep((s) => s + 1)
          setReveal(0)
        } else {
          setStep(0)
          setReveal(0)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        if (reveal > 0) {
          setReveal((r) => r - 1)
        } else if (step > 0) {
          const prev = step - 1
          setStep(prev)
          setReveal(REVEAL_MAX[prev] ?? 0)
        } else {
          setStep(TOTAL_STEPS - 1)
          setReveal(REVEAL_MAX[TOTAL_STEPS - 1] ?? 0)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step, reveal, revealMax])

  const showWelcome = step === 1
  const showContent = step >= 2 && step <= TOTAL_STEPS - 2 // adjust bounds to your slide range

  return (
    <div
      className={`app${showWelcome ? ' app--welcome' : ''}${step === TOTAL_STEPS - 1 ? ' app--transition' : ''}`}
      data-empty-screen={!showWelcome && !showContent && step !== TOTAL_STEPS - 1}
    >
      {showWelcome && <WelcomeSlide />}

      <div className="content-wrap" data-visible={showContent}>
        {step === 2 && <SomeSlide reveal={reveal} />}
        {/* ... one line per slide ... */}
      </div>

      {step === TOTAL_STEPS - 1 && (
        <div className="transition-hint">Hands-On: <what comes next in the portal></div>
      )}
    </div>
  )
}
```

## Step Numbering Convention

- **Step 0**: black screen. The presenter opens the app here before recording starts; the cut to the
  title slide happens live (arrow press) or is added in editing.
- **Step 1**: welcome/title slide (`WelcomeSlide`), full-bleed, two glow blobs, title + date.
- **Steps 2..N-2**: one slide per theory beat, matching the scenario's step map exactly.
- **Step N-1** (last): hands-on transition — a single centered line of text, no slide chrome.

## Verification Loop

After scaffolding, and after every subsequent edit:

```bash
npm install   # once, when the project is first scaffolded
npm run build # after every edit, to catch JSX/CSS errors
rm -rf dist   # clean up the build artifact — it's not meant to be committed or kept around
```

Never run `npm run dev` yourself and never leave a background process running. The presenter runs
their own dev server (they explicitly want to control what's running while they record) and will
refresh the page themselves after each change.

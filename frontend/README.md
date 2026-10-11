# NiyamSathi Frontend

React + Vite SPA for NiyamSathi — the Bhopal Building Rules Assistant.

Two experiences share one engine: a **landing page** that explains the product,
and a **plot-check dashboard** built for a municipal clerk.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
```

Routes are hash-based, so these are linkable:

| URL | Opens |
| --- | --- |
| `#/` | Landing page |
| `#/check` | Dashboard, empty |
| `#/check?demo=standard` | Dashboard, pre-loaded with a clean match |
| `#/check?demo=amendment` | Pre-loaded with the Aug-2026 amendment case |
| `#/check?demo=violation` | Pre-loaded with a detected setback violation |
| `#/check?demo=missing` | Pre-loaded with a deliberately incomplete query |

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck + production build
- `npm run preview` — serve the production build
- `npm run typecheck` — TypeScript over `src/` and `scripts/`
- `npm test` — both suites below
  - `npm run test:rules` — engine, geometry, compliance, reference codes
  - `npm run test:render` — every component server-rendered in both languages

## Design system

Dark, cinematic civic-tech. Defined once in `src/index.css` as Tailwind v4
`@theme` tokens, then used through a small set of component classes.

**Colour discipline.** Deep charcoal/navy surfaces; **chrome** for structure;
**teal** for interaction; **saffron** as a sparing civic accent. Emerald /
amber / red are reserved strictly for compliance outcomes — if something is
green on this screen it means a rule matched, never "this looks nice here".

| Token group | Used for |
| --- | --- |
| `void` `carbon` `panel` `raised` `line` | surfaces and hairlines |
| `paper` `muted` `faint` `ghost` | text hierarchy |
| `chrome*` | wordmark, metallic edges |
| `teal*` | primary actions, active states, citations |
| `saffron*` | mandatory open space, civic accent |
| `ok` `warn` `bad` `review` | the four compliance states only |

**Typography.** Sora for display, Manrope for body, Noto Sans Devanagari for
Hindi. Measurements use `.numeric` (tabular figures) and are deliberately the
largest type on a result card.

**Component classes** (`.panel`, `.btn`, `.field`, `.chip`, `.tint-*`) live
inside `@layer components` so ordinary Tailwind utilities still override them.
Unlayered CSS would outrank every utility and make `panel border-teal/30`
silently keep the default border.

**Motion** is restrained and every animation is disabled under
`prefers-reduced-motion: reduce`.

## Components

| Component | Responsibility |
| --- | --- |
| `LandingPage` | Hero, before/after, features, how-it-works, CTA, footer |
| `Dashboard` | Owns all query state; composes the three-column workspace |
| `IsometricPlotScene` | 30° isometric massing view of a `PlotGeometry` |
| `PlotComplianceMap` | Plan view with clickable setback zones + map controls |
| `PlotInputPanel` | Question box, voice, structured fields, topics, as-of date |
| `VoiceAssistantControl` | Mic + speaker affordances |
| `ComplianceStatusCard` | The four-state verdict |
| `RuleResultCard` | One topic: the value, then the proof |
| `CitationDrawer` | Verbatim source excerpt + placeholder warning |
| `WhyThisRule` | The reasoning chain behind one answer |
| `RuleVersionTimeline` | Amendment Time Machine + shared as-of date |
| `ComplianceSlip` | Printable citizen hand-out |
| `DemoScenarioSelector` | Four one-click presets |
| `RuleExplorer` | The raw dataset, searchable |

### Rendering is separate from rule matching

`engine.ts` (matching), `geometry.ts` (SVG math), and `compliance.ts`
(verdict) are pure and import no components. Components never re-derive a rule
value — they read the `Answer[]` the engine already produced. Two consequences
worth knowing:

- The **plan view and the 3D view** are both projections of the *same*
  `PlotGeometry`. `IsometricPlotScene` converts pixels back to metres via
  `geometry.scale` rather than recomputing anything, so the two views cannot
  drift apart.
- The engine is called **twice** per check: once with the clerk's chosen topics
  (for the result cards) and once with the four core topics (for the map and
  the verdict). Same pure function, different topic list — the visual layer
  never guesses at a value it wasn't given.

### One date, two controls

`asOf` is a single piece of state rendered both in the input panel ("Answer as
on") and in the timeline ("Check rules applicable on"). A second independent
date would let the timeline and the result cards disagree about which rules are
in force — the exact confusion the timeline exists to remove.

## Voice

Native Web Speech API — no dependency, no external service.

- Recognised speech is placed in the question box as **editable text** and is
  never auto-submitted. The clerk confirms what was heard.
- The spoken reply carries only the headline figure and rule number
  (*"इस प्लॉट के लिए फ्रंट सेटबैक 3 मीटर है। स्रोत: नियम 25, तालिका 8।"*). Full
  citations stay on screen where they can be read and checked.
- Unsupported browsers show a short note and keep every typed path working.

All browser-capability detection lives in `src/lib/hooks.ts` and runs inside
`useEffect`, never during render — `scripts/rendertest.tsx` server-renders the
whole app, so anything touching `window` during render fails the test suite
rather than a user's browser.

## Accessibility

WCAG-minded contrast on dark surfaces, visible `:focus-visible` rings on every
control, `aria-label` on all icon-only buttons, `aria-pressed` on toggles,
keyboard-operable setback zones (`Enter`/`Space`), `aria-live` on the verdict,
`Escape` closes the expanded map, and `lang` attributes so Devanagari renders
with the right font.

## Dataset

Demo data in `src/data/` — `versions.json`, `sources.json`, `rules.json`.
**Every value is seeded placeholder data; no excerpt is reproduced from the
gazette.** The UI says so on every answer card, in the slip, and on the landing
page. Flip `excerptStatus` to `"verified"` on a source to switch its badge.

The map, the verdict and the printable slip all read these same three files —
there is no second dataset to keep in sync.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS v4 · lucide-react.
No backend required for the dashboard; no router, charting, 3D or PDF library.

# NiyamSathi — Bhopal Building Rules Assistant

A rule-backed answering tool for building-permission clerks at Bhopal Municipal
Corporation, built over the MP Bhumi Vikas Rules, 2012.

A clerk types a question in Hindi or English — or fills a five-field form — and
gets each answer with its rule number, table number, page number, the source
wording, and the version the value comes from. On top of that, a visual plot
diagram shows the setback zones and buildable footprint to scale, checks a
citizen's proposed construction against the matched rule, and a one-page
printable Citizen Compliance Slip summarises the whole result.

## Project Structure

```
niyamsathi/
├── frontend/          # React + Vite SPA (main UI)
│   ├── src/
│   ├── scripts/
│   ├── package.json
│   └── vite.config.ts
├── backend/           # Node.js + Express API server
│   ├── server.js
│   ├── package.json
│   └── .env.example
├── package.json       # Root workspace config
└── README.md
```

## Run it

```bash
npm install
npm run dev     # http://localhost:5173
```

The app opens on a landing page; **Check Your Plot** opens the dashboard.
Routes are hash-based and linkable — `#/check?demo=violation` opens the
dashboard pre-loaded with a detected setback violation.

**Frontend + backend together:**
```bash
npm run dev:full    # frontend on :5173, backend API on :5000
```

Other scripts: `npm run build`, `npm run typecheck`, `npm test`.

See [`frontend/README.md`](frontend/README.md) for the design system, the
component map, and the voice implementation.

## Two experiences

**Landing page** — hero with a live isometric plot visual (the real geometry
engine, not a mockup), a before/after framing of the problem, four feature
cards, and a three-step explanation.

**Plot-check dashboard** — a three-column workspace: inputs and voice on the
left, the compliance map in the centre, the verdict and cited results on the
right, with the amendment timeline and the printable slip underneath.

## The dataset is demo data

**Every value shipped here is seeded placeholder data, and every source excerpt
is written for the demo — none of it is reproduced from the gazette.** The app
says so on screen, on every answer card, and inside every source excerpt. Replace
the three JSON files with verified values before any real use.

| File | What it holds |
| --- | --- |
| `frontend/src/data/versions.json` | The two rulebook versions and their effective dates |
| `frontend/src/data/sources.json` | 12 rule/table citations with page numbers and bilingual excerpts |
| `frontend/src/data/rules.json` | 59 condition→value rows citing those sources |

A row carries only conditions and a value; the citation lives on the source it
points at. Flip `excerptStatus` to `"verified"` on a source and its answers show
a green "Verified rule match" badge instead of the amber demo badge.

The visual map, the compliance status card and the printable slip all read
from these same three files — there is no second dataset to keep in sync.
Replacing a value in `rules.json`/`sources.json` updates the map's setback
zones, the status check, and the slip's citations simultaneously.

## How an answer is produced

1. **Extract** — `frontend/src/lib/parse.ts` reads plot area, road width, use, locality,
   proposed floors and the requested topics from the question. It handles both
   scripts, including Devanagari digits (`२००`) and units (`वर्ग मीटर`, `मीटर सड़क`).
2. **Match** — `frontend/src/lib/engine.ts` filters rows whose conditions hold for those
   inputs and whose version was in force on the as-of date.
3. **Resolve versions** — matches are grouped by version and the latest one wins.
   Older matches are kept and shown as "previous position", so an amendment is
   visible rather than silent.
4. **Derive** — FAR, ground coverage and fee rows also produce a calculated
   figure (built-up area, footprint, fee payable) with the arithmetic shown.

### It does not guess

- An input the matched table actually discriminates on, but which the clerk did
  not supply, returns **"More information needed"** naming the missing fields.
- A combination no row covers returns **"No rule found in the dataset"** and
  tells the clerk not to quote a value.
- More than one row of equal specificity returns **"ambiguous"** rather than
  picking one.
- A non-positive area or road width is treated as absent, not as a boundary value.

## Amendment awareness

Two versions ship: the consolidated rulebook (through 31 March 2025) and the
amendment of 28 August 2026, which applies **only to plots up to 500 sq m**.

The **"Answer as on"** date control re-runs the same question against an earlier
date, so a clerk can see the position before the amendment. For a 200 sq m
residential plot on a 9 m road the FAR moves 1.50 → 1.75 and the fee ₹12 → ₹15
per sq m, while the front setback stays 3.0 m and is labelled *re-notified, value
unchanged*. A 800 sq m plot falls outside the amendment and keeps citing the base
tables.

## Visual Plot Compliance Map

The dashboard's left panel takes an optional plot geometry block:
plot width, plot depth, road-facing direction (N/S/E/W), and a
citizen's *proposed* front/rear/left/right setbacks. Running a check draws an SVG
plot diagram (plan or 3D) beside a traffic-light verdict and an amendment timeline.

**How it's built, and why it's split the way it is:**

- `frontend/src/lib/geometry.ts` turns plot width/depth/road width/required setbacks
  into SVG rectangles — pure number-in, rectangles-out, no dependency on the
  rule data types at all. The layout is fixed (road always along the bottom
  edge, front/rear/left/right zones always in the same screen position); a
  small compass badge shows the true road-facing direction instead of
  rotating the drawing, which keeps the geometry and the citation hit-areas
  simple regardless of orientation.
- `frontend/src/lib/compliance.ts` turns the already-computed front/side/rear/floors
  `Answer`s plus the proposed values into one of four states — **Green**
  "Preliminary rule match", **Amber** "More information required", **Red**
  "Potential rule violation", **Grey** "Officer review required" — in that
  priority order. A confirmed violation always shows even if some unrelated
  field is still missing; a clerk simply not having entered a proposed value
  is never itself a reason for Amber, since those fields are optional.
- Neither file calls into `engine.ts`'s matcher or recomputes a rule value —
  both only ever consume the `Answer[]` the existing matcher already produced,
  so the rule-matching logic and the visual/compliance logic stay fully
  separate.
- If plot width/depth aren't given, the map falls back to an illustrative
  square (`width = depth = √area`) and says so on the diagram — it is never
  presented as a surveyed footprint.
- Click or hover a setback zone for its exact rule number, table, page,
  source wording and version — pulled from the same `Answer` the result cards
  panel beside it is already showing.
- If a proposed setback is smaller than required, the shortfall is drawn as a
  red strip touching the buildable interior (not the outer edge) — it's the
  portion of the mandatory open space the proposal would actually build over.
- "Check rules applicable on" in the timeline panel is the *same* date as the
  "Answer as on" control above the map — deliberately one piece of state, so
  the map, the timeline and the result cards can never disagree about which
  date is in force.
- The "Download Compliance Slip" button renders a printable one-pager
  (`frontend/src/components/ComplianceSlip.tsx`) with a reference code — a deterministic
  text code, not a scannable QR, since a demo running with no backend and no
  external APIs has no way to make a QR actually verifiable, and the code is
  labelled as such. `window.print()` with a CSS state (`.slip-open`) that hides
  the rest of the app is used instead of a PDF library.

## Demo scenarios

Four buttons at the top of the dashboard load a preset and run it
immediately. Each is also directly linkable, so a demo can be opened on a
finished check rather than an empty form:

1. **200 sq m Residential Plot, 9 m Road** (`#/check?demo=standard`) — a clean rule lookup with real
   (non-illustrative) plot dimensions, so the map shows an accurate footprint.
2. **450 sq m Plot, 9 m Road — Aug 2026 Amendment** (`#/check?demo=amendment`) — the amendment governs
   (plot ≤ 500 sq m); the timeline highlights it and shows the superseded
   March 2025 figures underneath.
3. **Potential Violation** (`#/check?demo=violation`) — a proposed front setback below the required
   value; the map draws the red encroachment strip and the status card turns
   Red.
4. **Missing Details** (`#/check?demo=missing`) — only plot area is given; front setback and max
   floors come back "More information needed" instead of a guessed value, and
   the status card turns Amber.

## Boundary conventions

The slabs are read the way the rulebook words them, so a boundary value lands in
exactly one row:

- Plot area is `(min, max]` — *"above 100 and up to 250 sq m"*. A 500 sq m plot is
  inside the amendment's "up to 500" scope.
- Road width is `[min, max)` — *"9 m and above but less than 12 m"*. A 9 m road is
  in the 9–12 band.

## Tests

`npm test` runs two suites, ~200 assertions, no browser needed:

- `frontend/scripts/selftest.ts` — parsing, matching, version resolution,
  derived figures, missing-input handling, slab boundaries, the geometry
  violation-strip math, the null-buildable clamp, the compliance-status
  priority order (one case per state), and reference-code determinism.
- `frontend/scripts/rendertest.tsx` — server-renders the landing page, the
  dashboard (empty *and* pre-loaded with each of the four demo scenarios), and
  every component, in both languages. It asserts that citations, demo-data
  labelling and the "not an approval" disclaimers are present in all of them.
  Running through `renderToStaticMarkup` also pins the SSR-safety contract in
  `lib/hooks.ts`: anything touching `window` during render fails here rather
  than in a user's browser.

## Stack

React 18 · TypeScript · Vite 5 · Tailwind CSS v4 · lucide-react. The dataset is
local JSON, so answers are instant and the dashboard runs offline.

No router, charting, 3D or PDF library: routing is a hash-synced view flag, the
isometric view is hand-rolled SVG over the existing geometry math, and the
compliance slip prints through a CSS print state rather than a PDF renderer.
Voice uses the browser's native Web Speech API.

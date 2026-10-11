# NiyamSathi Frontend

React + Vite SPA for NiyamSathi - Bhopal Building Rules Assistant with Visual Compliance Map.

## Setup

```bash
npm install
npm run dev     # http://localhost:5173
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Production build
- `npm run preview` — Preview production build
- `npm run typecheck` — TypeScript type checking
- `npm test` — Run test suites
  - `npm run test:rules` — Rule matching tests
  - `npm run test:render` — Component render tests

## Features

- ✅ Bilingual Q&A (English/Hindi)
- ✅ Visual SVG plot compliance map
- ✅ Amendment-aware rule matching (2025 vs 2026)
- ✅ Compliance status (Green/Amber/Red/Grey)
- ✅ Printable citizen compliance slip
- ✅ Demo scenario selector
- ✅ Full test coverage (30+ assertions + render tests)

## Dataset

Demo data in `src/data/`:
- `versions.json` — Rulebook versions and dates
- `sources.json` — Rule citations with excerpts
- `rules.json` — 59 condition→value rows

Replace with verified values before production use.

## Stack

React 18 • TypeScript • Vite 5 • Tailwind CSS v4 • lucide-react

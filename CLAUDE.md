# Nudgy Marketing Website — Session Handoff

## Project

Astro 6.0.8 + Tailwind CSS v4.2.2 marketing site for Nudgy (screenshot annotation tool for AI-assisted builders).
Branch: `redesign/ai-forward-homepage`
Dev server: `npm run dev` (runs on localhost:4321 or next available port)
Site: https://get-nudged.online

## Design System

- **Theme:** Pure black background (`--bg: #000`), dark surfaces (`--surface: #0d0d0d`)
- **Accent:** Orange `#FF6B2B`, hover `#FF8A4C`
- **Font:** Inter (400–800), loaded from Google Fonts
- **Animations:** fadeUp, pulseGlow, pulseDot, bounceCue — preserve these
- **Brand:** Kiwi bird mascot (sidekick not hero), indie feel, "vibe coder" positioning

## Repositioning

From "generic screenshot annotation tool" → "the screenshot tool for vibe coders and AI-assisted builders."
Core message: Stop describing pixels. Point at them. Show AI what you mean.

## Homepage Section Order

Nav → Hero → Workflow → Features → UseCases → Privacy → Pricing → Download → FAQ → Footer

## What Was Done This Session

### Workflow section (`src/components/Workflow.astro`) — Redesigned
- **3-column step cards** with left-aligned text, inline headers (number badge + icon + title in a row)
- **Dashed orange connector track** behind cards using `::before` pseudo-element (not a DOM element — that broke the grid)
- **Comparison section** redesigned: "Without Nudgy" uses chat bubble styling, "With Nudgy" has a richer mock screenshot with fake UI chrome (title bar, sidebar, content area) plus annotation overlays (circle, arrow, text label)
- **"vs" divider** between comparison cards
- **IntersectionObserver** scroll-reveal animations (`fade-target` / `is-visible` classes)
- Step 3 renamed from "Paste into AI" → "Drop into AI" with "drag or paste" language
- Hover states with subtle orange border glow and box-shadow

### Features section — Reviewed, no changes needed
The 6-card grid ("Your screenshot is the prompt.") was approved as-is.

## What Still Needs Doing

### Immediate — Section-by-section polish (top to bottom)
The process: screenshot each section → refine layout/spacing/typography/hover/animations → reload and review → iterate → move to next.

Sections remaining to review:
1. **Hero** — Not yet reviewed for polish (content/layout exists)
2. **Workflow** — Redesigned but needs visual QA (grid fix was applied but not yet confirmed in browser)
3. ~~Features~~ — Approved
4. **UseCases** — Not yet reviewed
5. **Privacy** — Not yet reviewed
6. **Pricing** — Not yet reviewed
7. **Download** — Not yet reviewed
8. **FAQ** — Not yet reviewed
9. **Footer** — Not yet reviewed

### New Section to Add: "Who Nudgy Is For"

Add a new section somewhere on the page (likely after Features or UseCases). Guidance:

**Core positioning:** Nudgy helps people move faster by turning screenshots into clear visual communication.

**Target audiences:**
- Product managers
- Designers
- Developers
- Support teams
- Founders
- Vibe coders / AI-assisted builders
- Anyone giving visual feedback

**Emotional benefit:** Less explaining. Less rewriting. Less busywork. More momentum.

**Practical benefit:** Capture the thing, mark what matters, and share it clearly.

**Brand thread:** "Nudgy has legs. Tiny ones." — Use tastefully. Clever and memorable, not overly cute. Should communicate that Nudgy keeps work moving.

## Key Constraints

- Preserve: dark theme, orange accent (#FF6B2B), bird mascot as sidekick, indie feel, existing animation system
- Evolve: messaging toward AI/vibe-coding, visual prompting, "show AI what you mean"
- Do NOT push to remote without explicit approval (this session had approval)
- macOS only for now (Apple Silicon & Intel, macOS 13.0+)

## File Map

```
src/
├── components/
│   ├── Nav.astro          — Fixed header, scroll detection
│   ├── Hero.astro         — Two-column: text left, mascot right
│   ├── Workflow.astro     — 3 steps + before/after comparison (REDESIGNED)
│   ├── Features.astro     — 6-card grid (APPROVED)
│   ├── UseCases.astro     — 6 use case cards
│   ├── Privacy.astro      — Privacy-first messaging
│   ├── Pricing.astro      — 3 tiers with annual/monthly toggle
│   ├── Download.astro     — CTA card
│   ├── FAQ.astro          — Accordion with smooth animations
│   ├── Footer.astro       — Multi-column footer
│   └── Screenshots.astro  — Placeholder (not used on homepage)
├── layouts/
│   └── Base.astro         — HTML shell, meta, fonts
├── pages/
│   ├── index.astro        — Homepage composition
│   ├── privacy.astro      — Privacy policy
│   └── terms.astro        — Terms of use
└── styles/
    └── global.css         — CSS variables, base styles, Tailwind
```

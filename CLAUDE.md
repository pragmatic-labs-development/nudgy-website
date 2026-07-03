# Nudgy Marketing Website — Session Handoff

## Project

Astro 6.0.8 + Tailwind CSS v4.2.2 marketing site for Nudgy (screenshot annotation tool for AI-assisted builders).
Branch: `redesign/ai-forward-homepage`
Dev server: `npm run dev` (runs on localhost:4321 or next available port)
Site: https://get-nudged.online
Repo: `pragmatic-labs-development/nudgy-website` on GitHub

## Design System

- **Theme:** Pure black background (`--bg: #000`), dark surfaces (`--surface: #0d0d0d`)
- **Accent:** Orange `#FF6B2B`, hover `#FF8A4C`
- **Font:** Inter (400–800), loaded from Google Fonts
- **Animations:** fadeUp, pulseGlow, pulseDot, bounceCue — preserve these
- **Brand:** Kiwi bird mascot (sidekick not hero), indie feel, "vibe coder" positioning

## Positioning & Messaging

From "generic screenshot annotation tool" → "the screenshot tool for vibe coders and AI-assisted builders."
Core message: Show the thing. Skip the essay. Turn screenshots into useful context for AI and fast tech work.

**Brand thread:** "Nudgy has legs. Tiny ones." — Clever and memorable, not overly cute. Communicates that Nudgy keeps work moving.

## Homepage Section Order (Current)

Nav → Hero → Workflow → UseCases → PasteIntoAI → Privacy → Features → ShareMechanics → Pricing → Download → FAQ → Footer

## What Was Done (Sessions 1–3)

### Session 1 — Workflow redesign
- 3-column step cards with dashed orange connector track
- Before/after comparison (chat bubble vs annotated screenshot mock)
- IntersectionObserver scroll-reveal animations
- Features section reviewed and approved (6-card grid)

### Session 2 — Copy overhaul + new sections + visual polish
- **Hero** (`Hero.astro`): Rewrote headline to "Show the thing. Skip the essay." Added hero image (`public/assets/nudgy-hero.png`). Repositioned as visual-first layout.
- **Workflow** (`Workflow.astro`): Simplified dramatically — stripped out the heavy comparison section and mock screenshot chrome. Now a clean 3-step flow with concise copy.
- **UseCases** (`UseCases.astro`): Expanded from 6 basic cards to richer content with tabbed/detailed use case descriptions. Broader audience targeting (devs, PMs, designers, support, founders, vibe coders).
- **Features** (`Features.astro`): Copy refresh — tightened descriptions, updated tagline to "Fast tools. Zero friction."
- **Pricing** (`Pricing.astro`): Copy updates across all three tiers. Clearer value props.
- **Download** (`Download.astro`): New headline "Show the thing. Skip the essay." with updated subtitle.
- **FAQ** (`FAQ.astro`): Complete rewrite — 6 new Q&As covering "What is Nudgy?", AI tool compatibility, privacy, pricing, platform support, and getting started. More practical and direct.
- **New: BrandMoment** (`BrandMoment.astro`): Brand personality section — "Nudgy has legs. Tiny ones." tagline with supporting copy.
- **New: PasteIntoAI** (`PasteIntoAI.astro`): Dedicated section showing the screenshot-to-AI workflow. Visual demo of pasting annotated screenshots into AI tools.
- **New: ShareMechanics** (`ShareMechanics.astro`): Section explaining sharing capabilities — drag/drop, clipboard, integrations with Slack/Jira/GitHub/etc.

### What was pushed
All changes are live on `redesign/ai-forward-homepage` branch (commit `29e740a`).

## What Still Needs Doing

### Visual QA — Section-by-section review
The process: screenshot each section in browser → evaluate layout/spacing/typography/hover states/animations → refine → move to next.

**Status of each section:**
1. **Nav** — Functional, not reviewed for polish
2. **Hero** — Copy updated, hero image added, needs visual QA
3. **Workflow** — Simplified, needs visual QA
4. **UseCases** — Expanded content, needs visual QA
5. **PasteIntoAI** — NEW, needs visual QA
6. **Privacy** — Not yet reviewed
7. **Features** — Copy refreshed (layout previously approved), needs visual QA of new copy
8. **ShareMechanics** — NEW, needs visual QA
9. **Pricing** — Copy updated, needs visual QA
10. **Download** — Copy updated, needs visual QA
11. **FAQ** — Rewritten, needs visual QA
12. **Footer** — Not yet reviewed

### Mobile responsiveness
All sections need mobile/tablet viewport testing. Previous session fixed some mobile issues in Nav/Hero/Pricing/Download but the new sections and copy changes haven't been tested on mobile.

### Deployment
Branch `redesign/ai-forward-homepage` needs to be merged to main/production when ready. Confirm deployment pipeline (Cloudflare Pages or similar).

### BrandMoment placement
`BrandMoment.astro` was created but is NOT currently in `index.astro`. Decide where to place it (likely after UseCases or before Download) and add it to the page.

## Key Constraints

- Preserve: dark theme, orange accent (#FF6B2B), bird mascot as sidekick, indie feel, existing animation system
- Evolve: messaging toward AI/vibe-coding, visual prompting, "show AI what you mean"
- macOS only for now (Apple Silicon & Intel, macOS 13.0+)

## File Map

```
src/
├── components/
│   ├── Nav.astro             — Fixed header, scroll detection
│   ├── Hero.astro            — Hero with headline + hero image
│   ├── Workflow.astro        — 3-step capture/annotate/share flow
│   ├── UseCases.astro        — Expanded use case cards (devs, PMs, designers, etc.)
│   ├── PasteIntoAI.astro     — NEW: Screenshot-to-AI workflow demo
│   ├── Privacy.astro         — Privacy-first messaging
│   ├── Features.astro        — 6-card feature grid
│   ├── ShareMechanics.astro  — NEW: Sharing/integration capabilities
│   ├── BrandMoment.astro     — NEW: Brand personality (not yet in index.astro)
│   ├── Pricing.astro         — 3 tiers with annual/monthly toggle
│   ├── Download.astro        — CTA card
│   ├── FAQ.astro             — 6-question accordion
│   ├── Footer.astro          — Multi-column footer
│   └── Screenshots.astro     — Placeholder (not used on homepage)
├── layouts/
│   └── Base.astro            — HTML shell, meta, fonts
├── pages/
│   ├── index.astro           — Homepage composition
│   ├── privacy.astro         — Privacy policy
│   └── terms.astro           — Terms of use
├── styles/
│   └── global.css            — CSS variables, base styles, Tailwind
public/
└── assets/
    └── nudgy-hero.png        — Hero section image
```

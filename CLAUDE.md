# Nudgy Marketing Website — Session Handoff

## Project

Astro 6.0.8 + Tailwind CSS v4.2.2 marketing site for Nudgy (screenshot annotation tool for AI-assisted builders).
Branch: `redesign/ai-forward-homepage` (merged to `main` — all changes are live)
Dev server: `npm run dev` (runs on localhost:4321 or next available port)
Site: https://get-nudged.online
Repo: `pragmatic-labs-development/nudgy-website` on GitHub
Deploy: GitHub Pages via `.github/workflows/deploy.yml` — auto-deploys on push to `main`

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

Nav → Hero → Workflow → UseCases → PasteIntoAI → Privacy → ScrollingCapture → Features → ShareMechanics → Pricing → Download → FAQ → Footer

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

### Session 3 — Polish, new section, hero rewrite, deploy to production
- **Hero** (`Hero.astro`): Complete headline rewrite — "Your AI is guessing. Give it a nudge." Subheadline: "Stop arguing with AI. Just show it." Tagline: "Stop re-prompting. Start dragging and dropping to faster results." Removed `min-height: 100vh` to eliminate dead vertical space. Scroll cue repositioned from absolute to grid flow.
- **New: ScrollingCapture** (`ScrollingCapture.astro`): Dedicated section for scrolling capture — "Grab the whole page. macOS can't do this." Centered chip layout with 10 use cases: Slack Threads, Long PRDs, Contracts, Error Logs, Full Webpages, DocuSign, Code Files, Email Threads, GitHub Issues, Spreadsheets. Positioned after Privacy.
- **Download** (`Download.astro`): Fresh copy — "Ready when you are." / "Free. No account required." Removed duplicate hero headline. Added `scroll-margin-top: 4rem` so nav "Get Started for Free" scrolls to a clean position.
- **Nav** (`Nav.astro`): "Get Started for Free" now scrolls to `#download` section instead of direct .dmg download. Nudgy logo click smooth-scrolls to top of page.
- **Footer** (`Footer.astro`): Tagline updated twice — first to "Feed your AI screenshots. Showing beats telling.", then to "Sometimes AI needs a nudge."
- **FAQ** (`FAQ.astro`): "Why not just use built-in macOS screenshots?" rewritten to highlight scrolling capture as key differentiator, with PRD/DocuSign/long document examples. "How fast is the workflow?" corrected from "under 10 seconds" to "a couple seconds" / "virtually instant."
- **Deployed to production** via GitHub Pages. All changes merged to `main` through PRs #1–#10.

## What Still Needs Doing

### Visual QA — Full section-by-section review
Most sections have had incremental tweaks but haven't had a dedicated visual QA pass (spacing, typography, hover states, animations). Sections needing review:
1. **Nav** — Functional, logo scroll-to-top working
2. **Hero** — Dead space fixed, needs full visual QA
3. **Workflow** — Needs visual QA
4. **UseCases** — Needs visual QA
5. **PasteIntoAI** — Needs visual QA
6. **Privacy** — Not yet reviewed
7. **ScrollingCapture** — NEW, basic visual confirmed
8. **Features** — Needs visual QA of new copy
9. **ShareMechanics** — Needs visual QA
10. **Pricing** — Needs visual QA
11. **Download** — Scroll position confirmed, needs full QA
12. **FAQ** — Copy updated, needs visual QA
13. **Footer** — Not yet reviewed

### Mobile responsiveness
All sections need mobile/tablet viewport testing. The new sections (ScrollingCapture, PasteIntoAI, ShareMechanics) haven't been tested on mobile.

### BrandMoment placement
`BrandMoment.astro` exists but is NOT in `index.astro`. Decide where to place it (likely after UseCases or before Download) and add it to the page.

## Key Constraints

- Preserve: dark theme, orange accent (#FF6B2B), bird mascot as sidekick, indie feel, existing animation system
- Evolve: messaging toward AI/vibe-coding, visual prompting, "show AI what you mean"
- macOS only for now (Apple Silicon & Intel, macOS 13.0+)
- Scrolling capture is a key differentiator vs macOS native — emphasize it

## File Map

```
src/
├── components/
│   ├── Nav.astro              — Fixed header, scroll detection, logo scrolls to top
│   ├── Hero.astro             — Hero with headline + mascot image
│   ├── Workflow.astro         — 3-step capture/annotate/share flow
│   ├── UseCases.astro         — Expanded use case cards (devs, PMs, designers, etc.)
│   ├── PasteIntoAI.astro      — Screenshot-to-AI workflow demo + tool chips
│   ├── Privacy.astro          — Privacy-first messaging
│   ├── ScrollingCapture.astro — NEW: Scrolling capture use cases (10 chips)
│   ├── Features.astro         — 6-card feature grid
│   ├── ShareMechanics.astro   — Sharing/integration capabilities (2x2 grid)
│   ├── BrandMoment.astro      — Brand personality (not yet in index.astro)
│   ├── Pricing.astro          — 3 tiers with annual/monthly toggle
│   ├── Download.astro         — CTA card ("Ready when you are.")
│   ├── FAQ.astro              — 8-question accordion
│   ├── Footer.astro           — Multi-column footer
│   └── Screenshots.astro      — Placeholder (not used on homepage)
├── layouts/
│   └── Base.astro             — HTML shell, meta, fonts
├── pages/
│   ├── index.astro            — Homepage composition
│   ├── privacy.astro          — Privacy policy
│   └── terms.astro            — Terms of use
├── styles/
│   └── global.css             — CSS variables, base styles, Tailwind
public/
└── assets/
    └── kiwi-mascot.png        — Kiwi bird mascot image
```

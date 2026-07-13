# Nudgy Marketing Website — Session Handoff

> **Session wrap-up keyword:** When the user says "pineapple": (1) push all changes, (2) update CLAUDE.md with a session summary (what was done, files changed, deployment status), (3) commit & push, (4) give the user a summary of outstanding work and a prompt to kick off the next session.

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

Nav → Hero → Workflow → UseCases → PasteIntoAI → Privacy → ScrollingCapture → Features → ShareMechanics → BrandMoment → Pricing → Download → FAQ → Footer

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
- **Hero** (`Hero.astro`): Complete headline rewrite — "Your AI is guessing. Give it a nudge." Subheadline: "Stop arguing with AI. Just show it." Tagline: "Stop re-prompting. Drag, drop, done." Removed `min-height: 100vh` to eliminate dead vertical space. Scroll cue repositioned from absolute to grid flow.
- **New: ScrollingCapture** (`ScrollingCapture.astro`): Dedicated section for scrolling capture — "Grab the whole page. macOS can't do this." Centered chip layout with 10 use cases: Slack Threads, Long PRDs, Contracts, Error Logs, Full Webpages, DocuSign, Code Files, Email Threads, GitHub Issues, Spreadsheets. Positioned after Privacy.
- **Download** (`Download.astro`): Fresh copy — "Ready when you are." / "Free. No account required." Removed duplicate hero headline. Added `scroll-margin-top: 4rem` so nav "Get Started for Free" scrolls to a clean position.
- **Nav** (`Nav.astro`): "Get Started for Free" now scrolls to `#download` section instead of direct .dmg download. Nudgy logo click smooth-scrolls to top of page.
- **Footer** (`Footer.astro`): Tagline updated twice — first to "Feed your AI screenshots. Showing beats telling.", then to "Sometimes AI needs a nudge."
- **FAQ** (`FAQ.astro`): "Why not just use built-in macOS screenshots?" rewritten to highlight scrolling capture as key differentiator, with PRD/DocuSign/long document examples. "How fast is the workflow?" corrected from "under 10 seconds" to "a couple seconds" / "virtually instant."
- **Deployed to production** via GitHub Pages. All changes merged to `main` through PRs #1–#10.

### Session 4 — Favicon for Google Search results & download link fix
- **Favicon assets**: Generated full favicon set from the desktop app's `icon-source.png` (1024x1024 orange kiwi on orange background):
  - `public/favicon.ico` — ICO with 16x16, 32x32, 48x48 sizes
  - `public/favicon-48x48.png` — 48x48 PNG
  - `public/favicon-96x96.png` — 96x96 PNG
  - `public/apple-touch-icon.png` — 180x180 PNG
  - `public/site.webmanifest` — Web app manifest with icon references, theme color `#FF6A00`
- **Base.astro** (`src/layouts/Base.astro`): Updated `<head>` with favicon link tags (ICO, PNG 48x48/96x96, SVG, apple-touch-icon, manifest, theme-color meta)
- **Google Search Console**: Verified domain ownership via DNS TXT record on DreamHost. Requested indexing for `https://get-nudged.online/`. Google's favicon cache already shows the kiwi icon.
- **Deployed to production** via PR #13 merged to `main`.

### Session 5 — Release Notes page
- **New: Release Notes page** (`src/pages/releases.astro`): Timeline-style release notes page at `/releases` with version history for v0.1.0 through v0.2.2. Orange dot timeline, color-coded tags (green "New", blue "Fix", purple "Improved"). Responsive design matching site's dark theme.
- **Footer** (`src/components/Footer.astro`): Added "Release Notes" link to the Product column in the footer nav.
- **Deployed to production** — pushed directly to `main`, auto-deployed via GitHub Pages.

### Session 6 — BrandMoment placement
- **Homepage** (`src/pages/index.astro`): Added BrandMoment component to the homepage between ShareMechanics and Pricing. Imported `BrandMoment.astro` and placed it as a brand personality beat ("Tiny legs. Big busywork shredder.") right before the conversion funnel. Rationale: after the feature showcase is complete, the centered minimal text creates an emotional pause before pricing — classic "remind them why they like you" before the money ask.
- **Files changed:** `src/pages/index.astro` (import + placement)
- **Deployment status:** Pushed to `main`, will auto-deploy via GitHub Pages.

### Session 7 — AI Image Upscaler tool
- **New page:** `/tools/image-upscaler` — free browser-based AI image upscaler using Real-ESRGAN x2plus via ONNX Runtime WebGPU
- **New dependency:** `onnxruntime-web` v1.27.0 — ONNX Runtime with WebGPU support for in-browser ML inference
- **Config:** `astro.config.mjs` — added `optimizeDeps.exclude` for onnxruntime-web and `worker.format: 'es'`
- **Layout:** `Base.astro` — added optional `canonicalPath` prop for page-specific canonical URLs
- **Features implemented:**
  - Drag-and-drop, file picker, and paste image input
  - 2x and 4x upscaling (4x runs the 2x model in two passes)
  - Scale toggle (2x/4x radio buttons)
  - Before/after comparison slider with draggable divider (40px handle, 44px hit area)
  - Magnifying loupe on hover — 200px circle split before|after at native pixel resolution
  - Zoom 100% toggle for full pixel-level inspection
  - Model download progress bar (~67 MB, cached in browser Cache API)
  - Tile progress with pass tracking for multi-pass (e.g., "tile 3 of 16 (pass 1/2)")
  - Cancel button during processing
  - PNG download with scale-aware filename (e.g., `image-2x.png`, `image-4x.png`)
  - Alpha/transparency preservation
  - Unsupported browser detection (WebGPU required)
  - Accessible: ARIA roles, keyboard navigation, screen reader announcements
  - Responsive: single-column on mobile
  - Nudgy promo CTA card below results
  - SEO content section explaining the tool
- **Key technical details:**
  - Model has fixed 64x64 input shape — tiles are padded to 64x64 with edge replication, output cropped back
  - 8px tile overlap with linear blending to avoid seams
  - Model URL: `https://huggingface.co/tidus2102/Real-ESRGAN/resolve/main/Real-ESRGAN_x2plus.onnx` (note hyphen in `Real-ESRGAN`)
  - WebGPU execution provider with WASM fallback
- **New files (13):**
  - `src/pages/tools/image-upscaler.astro` — page route
  - `src/components/upscaler/UpscalerHero.astro` — hero headline + trust labels
  - `src/components/upscaler/UpscalerWorkspace.astro` — main tool UI (all states including loupe)
  - `src/components/upscaler/UpscalerPromo.astro` — Nudgy CTA card
  - `src/components/upscaler/BrowserSupportNotice.astro` — unsupported browser message
  - `src/lib/upscaler/upscaler.ts` — main orchestrator (state machine, DOM binding, loupe)
  - `src/lib/upscaler/upscale.worker.ts` — Web Worker for ONNX inference (multi-pass)
  - `src/lib/upscaler/worker-client.ts` — typed wrapper for worker communication
  - `src/lib/upscaler/image-utils.ts` — decode, validate, export utilities
  - `src/lib/upscaler/comparison-slider.ts` — before/after slider component
  - `src/lib/upscaler/capabilities.ts` — WebGPU/Worker detection
  - `src/lib/upscaler/types.ts` — shared TypeScript types
  - `src/lib/upscaler/constants.ts` — limits, tile sizes, model URL
- **Deployment status:** Not yet pushed — all changes on `main`, ready to commit & push

## AI Image Upscaler Architecture

### Model
- **Real-ESRGAN x2plus** (RRDBNet), BSD-3-Clause license
- ~67 MB ONNX model fetched from Hugging Face CDN on first use
- Cached in browser Cache API (`nudgy-upscaler-model-v1`)
- Fixed input: `float32 [1, 3, 64, 64]` (NCHW, RGB, 0-1), Output: `float32 [1, 3, 128, 128]`
- Tiles padded to 64x64 with edge replication, output cropped back to actual tile size
- 4x upscaling = two sequential passes of the 2x model

### Processing Pipeline
1. Image loaded → validated (15MB, 5000px, 16MP limits)
2. Image decoded to ImageData on main thread
3. ImageData sent to Web Worker
4. Worker: init ONNX Runtime (WebGPU EP, WASM fallback)
5. Worker: fetch/cache model with progress
6. Worker: tile image (256px tiles, 16px overlap)
7. Worker: run inference per tile, report progress
8. Worker: reconstruct output with linear blending in overlaps
9. Worker: send result ImageData back to main thread
10. Main thread: show before/after comparison slider + download

### OOM Recovery
If a tile fails with GPU memory error, tile size is halved (min 64px) and retried.

### How to Swap the Model
1. Replace `MODEL_URL` in `src/lib/upscaler/constants.ts`
2. Update `MODEL_CACHE_NAME` to bust the cache
3. Adjust `SCALE_FACTOR` if the new model uses a different scale
4. Update `MODEL_SIZE_MB` for the UI hint

### How to Adjust Limits
Edit `src/lib/upscaler/constants.ts`:
- `MAX_FILE_SIZE` — max input file size in bytes
- `MAX_DIMENSION` — max width or height in pixels
- `MAX_PIXELS` — max total pixel count
- `DEFAULT_TILE_SIZE` — tile size for inference (larger = faster but more VRAM)
- `DEFAULT_OVERLAP` — overlap between tiles (reduces seam artifacts)

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

### Release Notes maintenance
When new versions of Nudgy ship, add entries to `src/pages/releases.astro`. The page uses a timeline layout — add new `<article class="release">` blocks at the top of the `.timeline` div. Use tags: `<span class="tag new">New</span>`, `<span class="tag fix">Fix</span>`, `<span class="tag improved">Improved</span>`.

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
│   ├── ScrollingCapture.astro — Scrolling capture use cases (10 chips)
│   ├── Features.astro         — 6-card feature grid
│   ├── ShareMechanics.astro   — Sharing/integration capabilities (2x2 grid)
│   ├── BrandMoment.astro      — Brand personality (between ShareMechanics and Pricing)
│   ├── Pricing.astro          — 3 tiers with annual/monthly toggle
│   ├── Download.astro         — CTA card ("Ready when you are.")
│   ├── FAQ.astro              — 8-question accordion
│   ├── Footer.astro           — Multi-column footer (links to /releases)
│   ├── Screenshots.astro      — Placeholder (not used on homepage)
│   └── upscaler/
│       ├── UpscalerHero.astro          — Hero headline + trust labels
│       ├── UpscalerWorkspace.astro     — Main tool card (all UI states)
│       ├── UpscalerPromo.astro         — Nudgy CTA card below results
│       └── BrowserSupportNotice.astro  — Unsupported browser message
├── layouts/
│   └── Base.astro             — HTML shell, meta, fonts (supports canonicalPath prop)
├── lib/
│   └── upscaler/
│       ├── upscaler.ts        — Main orchestrator (state machine, DOM binding)
│       ├── upscale.worker.ts  — Web Worker: ONNX init, model load, tiled inference
│       ├── worker-client.ts   — Typed wrapper for worker communication
│       ├── image-utils.ts     — Decode, validate, tile, export utilities
│       ├── comparison-slider.ts — Before/after slider (mouse/touch/keyboard)
│       ├── capabilities.ts    — WebGPU/Worker/Canvas detection
│       ├── types.ts           — Shared TypeScript types
│       └── constants.ts       — Limits, tile sizes, model URL, CDN paths
├── pages/
│   ├── index.astro            — Homepage composition
│   ├── privacy.astro          — Privacy policy
│   ├── releases.astro         — Release notes timeline (v0.1.0–v0.2.2)
│   ├── terms.astro            — Terms of use
│   └── tools/
│       └── image-upscaler.astro — AI image upscaler tool
├── styles/
│   └── global.css             — CSS variables, base styles, Tailwind
public/
├── favicon.ico                — ICO favicon (16/32/48px)
├── favicon-48x48.png          — PNG favicon 48x48
├── favicon-96x96.png          — PNG favicon 96x96
├── favicon.svg                — SVG favicon (orange kiwi)
├── apple-touch-icon.png       — Apple touch icon 180x180
├── site.webmanifest           — Web app manifest
└── assets/
    └── kiwi-mascot.png        — Kiwi bird mascot image
```

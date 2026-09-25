# Nudgy marketing site — ARCHIVED 25 September 2026

Marketing site for **Nudgy the macOS screenshot-annotation tool**, live at
https://get-nudged.online. Built with Astro 6 + Tailwind v4, deployed to GitHub Pages.

**This project is no longer developed.** Nudgy was repositioned into a personal CRM (web + mobile)
in September 2026. That work lives in a new repo. This one is frozen at `v1.0-final`.

## The site is still live, and should stay that way

Archiving this repo makes it read-only and stops GitHub Actions, but **the published site keeps
serving**. That's intentional — the desktop app still exists, people may still have it installed,
and its download link lives here.

Two things must not be deleted:

- **The R2 bucket `nudgy-releases`.** Every installed copy of the desktop app fetches
  `latest-mac.yml` from it every 4 hours to check for updates, and the download buttons in
  `Hero.astro` and `Download.astro` link straight into it. Deleting it silently breaks updates for
  everyone who has the app and 404s the download.
- **The DNS records for `get-nudged.online`** (DreamHost) and `public/CNAME`, which bind the domain
  to Pages.

## If you want the domain back for something else

The custom domain must be released from this repo's Pages settings first, which means briefly
**unarchiving** it. Do that deliberately — and know that installed copies of the desktop app keep
auto-updating from R2 regardless of what happens to this site.

## Restoring or redeploying

Tagged `v1.0-final`. Unarchive, `npm ci && npm run build`, and push to `main` — the workflow in
`.github/workflows/deploy.yml` does the rest. Requires Node 22.

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build && npm run preview
```

## Branches

- `main` — what's live.
- `wip/upscaler-remove-zoom-toggle` — a finished but never-shipped change removing the image
  upscaler's zoom toggle in favour of its hover loupe. Parked here so it wasn't lost.

## Known bugs, left unfixed deliberately

Recorded so they aren't repeated rather than because they're worth fixing now:

- `src/layouts/Base.astro:16` — `og:image` points at `/assets/og-image.png`, **a file that never
  existed**, and is root-relative rather than absolute. Every page emits a broken social-share image.
- `src/layouts/Base.astro:18` — the domain is hardcoded instead of read from `Astro.site`.
- `public/assets/` serves ~5.2 MB of unoptimized PNGs, bypassing Astro's image pipeline entirely.
- No `robots.txt`, no sitemap, no 404 page, no typecheck in CI.

## A caution for whoever writes the next privacy policy

`src/pages/privacy.astro` states that Nudgy "runs entirely on your Mac" and that no data leaves the
device. That was true of a local desktop app. **It is flatly false for anything that syncs.** Do not
port a sentence of it to a hosted product.

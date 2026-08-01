# Maintenance notes

Working notes for future me. Nothing here is needed to run or deploy the site.

## Editing content

| File | What's in it |
|---|---|
| `src/data/site.ts` | Name, email, links, headline, lede, about, highlights, marquee, terminal log lines, SEO description |
| `src/data/skills.ts` | The four stack cards, their icons and tags |
| `src/data/projects.ts` | Featured projects. `repo: null` hides the "View code" link rather than pointing at a dead `#` |
| `src/data/timeline.ts` | Roles and certifications. Add `kind: 'education'` to keep an entry out of the "N roles" counter |
| `src/data/archive/` | Superseded versions kept for rollback. Not imported, so it costs nothing in the build |

Page order lives in `src/pages/index.astro` — reorder by moving lines.

## Gotchas that cost me time

**Astro scopes component CSS** behind a `data-astro-cid-*` attribute stamped onto
template elements. Anything built at runtime with `document.createElement` won't
carry it and renders completely unstyled. The terminal's log lines get around this
by cloning an existing `.line`; the health strip does it by styling cells through
`:global()`. If you add runtime-generated markup to a scoped component, pick one of
those.

**Fonts must be imported from `BaseLayout.astro`, not `global.css`.** Tailwind's
PostCSS `@import` inlines fontsource's CSS without rebasing its relative `url()`
paths, which silently drops every `.woff2` from the build and falls back to system
fonts with no error.

**Tailwind runs through PostCSS, not `@tailwindcss/vite`.** The Vite plugin pins a
newer Vite than Astro's and needs Node ≥ 20.19. Switch back if the toolchain moves.

**Nav and footer links are root-relative** (`/#about`, not `#about`) because they
also render on `/404`, where a bare fragment resolves against the bad path and goes
nowhere.

**`Number(localStorage.getItem(k))` returns 0 for a missing key**, and 0 is a valid
volume — which silently muted every first-time visitor until it read the raw string
and checked for `null` first.

## Theming

Every colour is a custom property in `src/styles/global.css`. Dark is the default,
falling back to the system preference when nothing is stored.

A third, theme-independent `--term-*` set keeps the terminal panels dark in both
themes — a terminal that turns white stops reading as a terminal.

If you change a colour, re-check `--ink-faint` and `--term-dim`. They carry the
small mono labels and have the least contrast headroom. The light accent is
deliberately darker than the dark one: `#0D9668` looked better but only managed
3.76:1 against white button text.

## Regenerating og.png

The 1200×630 link-preview card is generated, not hand-drawn. The script decompresses
the site's own variable `.woff2` fonts to TTF via fontTools, pins each to a weight,
and draws the card with Pillow.

Needs `pillow`, `fonttools` and `brotli`. Re-run it if the name, tagline or domain
change — and remember `og:image` resolves against `site` in `astro.config.mjs`, so
those two have to agree.

## Deploying

`.github/workflows/deploy.yml` builds and publishes on every push to `main`.
Pages source is set to **GitHub Actions** in repo settings.

Moving to a custom domain later: change `site` in `astro.config.mjs`, add a
`public/CNAME` file containing the domain, and point DNS at GitHub Pages.

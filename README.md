# karan.dev

Single-page portfolio. Astro 5 + Tailwind v4, zero framework runtime, one canvas game.

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:4321

---

## Before this goes live — 3 things

### 1. Fill in your real details

Everything editable lives in `src/data/`. You should never need to open a component.

| File | What's in it |
|---|---|
| `src/data/site.ts` | Name, email, GitHub, LinkedIn, headline, lede, about, highlights, marquee, terminal log lines |
| `src/data/timeline.ts` | **Roles and education — currently placeholders.** Replace all of it |
| `src/data/skills.ts` | The four stack cards, their icons and tags |
| `src/data/archive/` | Superseded versions, kept for rollback. Not imported — costs nothing in the build |
| `src/data/projects.ts` | Featured projects. **Every `repo` is `null`** — add the GitHub URLs and the "View code" link appears |

### 2. Add the missing résumé PDF

`public/resume.pdf` — the Resume buttons in the hero and the Experience section both point here
and currently 404.

(`public/og.png` is done — see below.)

### Regenerating og.png

The 1200×630 link-preview card is generated, not hand-drawn. The script lives outside the repo;
it decompresses the site's own variable `.woff2` fonts to TTF via fontTools, pins each to a
weight, and draws the card with Pillow. Re-run it if your name, tagline or domain change:

```bash
python "C:/Users/karan/AppData/Local/Temp/claude/C--Users-karan-OneDrive-Desktop-AI-crypto-buddy/ceb47eb9-c2a5-4d16-a53e-d35bbb9f72bf/scratchpad/make_og.py"
```

That path is a temp directory and will eventually be cleaned up — copy `make_og.py` into the
project (say `scripts/`) if you want to keep it.

Previews won't actually render until the site is live at the domain in `astro.config.mjs`,
since `og:image` resolves to `https://karan.dev/og.png`.

### 3. Check the placeholder email

`karan@karan.dev` in `src/data/site.ts` is a guess. The copy-email button and every
`mailto:` fallback use it.

---

## Pages

`src/pages/index.astro` — the whole site.
`src/pages/404.astro` — terminal-styled not-found page. Cloudflare Pages serves `dist/404.html`
automatically; nothing to configure.

Nav and footer links are **root-relative** (`/#about`, not `#about`) because they also render on
/404, where a bare fragment would resolve against the bad path and go nowhere.

## Structure

```
src/
├── data/           ← edit these
├── components/     one per band of the page
├── game/           physics.ts · render.ts · sound.ts · mount.ts
├── layouts/        BaseLayout.astro — head, meta, OG, JSON-LD, no-flash theme
├── pages/index.astro
└── styles/global.css   ← all design tokens live in :root here
```

Page order is `Hero → Marquee → About → Skills → Projects → Resume → Kickups → Contact`, set in
`src/pages/index.astro`. Reorder by moving lines.

Nav links to About · Stack · Projects · Experience · Play. "Play" is marked `optional` in
`Nav.astro` and drops out below 22rem, where five links push the theme toggle off screen.

The Experience section (`id="experience"`, rendered by `Resume.astro`) holds the role timeline,
education, certifications, and the resume download.

The hero's right-hand column is the **terminal panel**; the game sits in its own band lower down,
between Résumé and Contact.

## The game

`Kickups.astro` owns the markup and the mount script. Two columns on wide screens (copy left,
board right), stacking to one column under 58rem.

The board sizes by **height** (`clamp(32rem, 76svh, 44rem)`) rather than aspect-ratio on desktop,
so a tall play area never ends up taller than the viewport on a short laptop screen. Mobile keeps
a 4:5 aspect.

`touch-action` on the canvas is **`pan-y`, not `none`** — taps still register as kicks, but a
vertical swipe that starts on the board scrolls the page rather than being swallowed by the game.

### Sound control

Bottom-right of the board: a speaker button plus a **volume slider** that slides out on hover or
keyboard focus (always visible on touch, where there is no hover). The icon reflects state — outer
wave drops off below 40%, cross appears at zero.

Volume is a number 0–1 in `localStorage` under `kickups:vol`, not a boolean mute. Zero is simply
silent; the button toggles between zero and whatever level you were last at. `M` does the same
while the canvas is focused.

`setVolume()` in `sound.ts` holds the level *outside* the audio graph so it can be set before any
`AudioContext` exists — constructing one before a user gesture warns in most browsers. At zero,
`audio()` returns null and never builds a context at all.

Plain TypeScript, no engine, no framework. `src/game/physics.ts` has no DOM references, so
it's unit-testable in isolation.

### How a strike works

The impulse runs along the line **from the contact point through the centre**, so hitting the
right-hand side sends the ball left, like a real one. Three things scale with how far off-centre
you connect (`offset`, 0 at dead centre, 1 at the rim):

| | Dead centre | Rim |
|---|---|---|
| Lift | −860 | −568 (34% traded away) |
| Sideways | 0 | ±580 |
| Spin | 0 | ±15 rad/s, decaying over ~1s |

New sideways speed mostly **replaces** the old rather than adding to it (`carryOver: 0.22`), so a
clean centre strike straightens a drifting ball out. Without that, sideways speed piles up across
strikes and the ball becomes unrecoverable.

All of it is tunable in `CONFIG` at the top of `src/game/physics.ts`.

- Fixed 120Hz timestep with an accumulator — verified identical at 30/60/120/144/240 Hz
- Frame delta clamped to 50ms so a tab switch doesn't teleport the ball
- Gravity ramps from 1800 to a 3000 px/s² cap, +90 every 10 kicks
- High-DPI aware, capped at 2× so phones don't render a 3× buffer
- Best score in `localStorage` under `kickups:best`
- Loop pauses when the section leaves the viewport or the tab is hidden
- Respects `prefers-reduced-motion` (no idle float, no autostart)

### Why the ball looks like a ball

`render.ts` doesn't draw a flat decal. It holds the 12 pentagon centres of a
**truncated icosahedron** — the real geometry of a Telstar football — as unit vectors, rotates
them in 3D each frame, culls the back hemisphere, and projects the survivors orthographically.
Panels wrap round the limb and disappear over the horizon the way they actually do.

Two rotation axes, because a ball spinning flat looks wrong: `angle` rolls with horizontal
speed, `tumble` turns with vertical. On top sit a lit body gradient, a terminator shading pass,
a specular highlight, bounced light along the lower edge, and a contact shadow that tightens as
the ball nears the floor.

### Sound

Synthesised with WebAudio — no mp3 to ship or license. A boot-on-ball contact is stacked from
three layers: a bandpassed noise transient (the leather slap, ~45ms), a pitched triangle body
that drops as the panel flexes back (the "pock", ~400-500Hz), and a low sine for mass. Each hit
detunes ±8% and re-rolls its filter frequency so a long rally never sounds cloned, and level
scales with how centrally you struck the ball.

Wall and ceiling contacts get their own duller `playBounce`, gated above 90 px/s so a ball
creeping along a wall doesn't machine-gun. The floor gets a damped, ringless `playDrop`.

Muted state persists in `localStorage`.

The whole module is a separate 6.7 KB chunk, dynamically imported by an `IntersectionObserver`.
Now that the board sits above the fold that observer fires immediately on load — but it's still a
dynamic import, so the physics and render code never blocks first paint.

Tuning constants are in `CONFIG` at the top of `src/game/physics.ts`.

## Theming

Terminal palette — near-black with a green cast, one neon accent. All colour lives in
`:root` / `[data-theme='light']` in `src/styles/global.css`:

| Token | Dark (default) | Light |
|---|---|---|
| `--bg` | `#0A0F0D` | `#F5F9F7` |
| `--surface` | `#0F1613` | `#FFFFFF` |
| `--ink` | `#E6EBE9` | `#0A1210` |
| `--accent` | `#34D399` | `#0B7F58` |

**Dark is the default**, falling back to the system preference when there's no stored choice.
The no-flash script in `BaseLayout.astro` runs before first paint.

The light accent is noticeably darker than the dark one on purpose: `#0D9668` looked better but
only hit 3.76:1 against white button text, under the 4.5:1 floor.

A third, theme-independent set of `--term-*` tokens keeps the terminal panel dark in **both**
themes — a terminal that turns white stops reading as a terminal.

Type is Space Grotesk Variable for display, Inter Variable for body, JetBrains Mono for
everything terminal-flavoured.

All 34 ink-on-surface combinations clear WCAG AA (4.5:1) in both themes; the tightest is 4.67:1.
If you change a colour, re-check `--ink-faint` and `--term-dim` — they carry the mono labels and
have the least headroom.

## The hero terminal

`Terminal.astro` — a demo log tail plus a 30-day pipeline health strip. Lines come from
`logLines` in `src/data/site.ts`; edit them there.

It's labelled **`demo`** in the panel chrome, deliberately. The data is illustrative, and a
portfolio selling observability shouldn't imply a live feed it doesn't have.

Three details that keep it from looking fake:

- **Fixed grid columns** (`4.6rem 6.4rem 1fr`) so message text doesn't jitter as tag widths
  change — the single biggest tell on hand-rolled fake terminals
- Eight lines are **server-rendered**, then their timestamps get backdated on load, so there's
  no empty panel and no layout shift
- The stream only ticks while the panel is **on screen and the tab is visible**

> **If you edit the stream code:** build new rows by cloning an existing `.line`, never with
> `document.createElement`. Astro scopes component CSS behind a `data-astro-cid-*` attribute
> stamped onto template elements; nodes built from scratch don't carry it and render completely
> unstyled. Same trap applies to any runtime-generated markup in a scoped component — the health
> strip dodges it by styling cells through `:global()`.

## Build notes

Tailwind runs through **PostCSS**, not `@tailwindcss/vite`. The Vite plugin pins a newer Vite
than Astro's and needs Node ≥ 20.19; this machine is on 20.9.0. If you upgrade Node to 22 LTS
you can switch back to the Vite plugin, which is marginally faster.

Font faces are imported in `BaseLayout.astro`, **not** in `global.css` — Tailwind's PostCSS
`@import` inlines fontsource's CSS without rebasing its relative `url()` paths, which silently
drops every `.woff2` from the build. Keep them in the layout.

## Deploy

### GitHub Pages (configured)

`.github/workflows/deploy.yml` builds and publishes on every push to `main`. After the first
push, go to **Settings → Pages → Source → GitHub Actions** once, and it's automatic from then on.

**The URL decides whether you need a `base` path:**

| Repo name | Site URL | `astro.config.mjs` |
|---|---|---|
| `Karan7sharma.github.io` | `https://karan7sharma.github.io` | leave as-is |
| anything else, e.g. `portfolio` | `https://karan7sharma.github.io/portfolio` | add `base: '/portfolio'` |
| any repo + custom domain | `https://karan.dev` | leave as-is |

Naming the repo `Karan7sharma.github.io` is the least friction — no `base`, and every absolute
path in the site (`/og.png`, `/resume.pdf`, `/#about`) keeps working untouched.

Also update `site:` in `astro.config.mjs` to the real URL. It's currently `https://karan.dev`,
which is what `og:image` and the canonical link resolve against — previews stay broken until it
matches where the site actually lives.

Note: publishing Pages from a **private** repo needs a paid GitHub plan. From a public repo it's
free.

### Cloudflare Pages (alternative)

Connect the repo, build command `npm run build`, output directory `dist`, Node 20+.
Unlimited bandwidth vs Pages' 100 GB/month soft limit — irrelevant at portfolio scale.

## Output weight

What a visitor actually downloads:

| Asset | Size |
|---|---|
| `index.html` | 19.0 KB |
| CSS | 26.8 KB |
| JS on first paint | 1.4 KB |
| Game chunk (lazy, on scroll) | 6.7 KB |
| Fonts — 4 latin woff2 | 178.9 KB |

`dist/` also contains 8 more woff2 files (~340 KB) for cyrillic, greek, vietnamese and latin-ext.
Those are `unicode-range`-gated, so no visitor on a latin page ever fetches them — they cost CDN
storage, not bandwidth. Fontsource's variable packages don't ship latin-only entrypoints; if you
want them gone, subset the fonts yourself with `glyphhanger` or `fonttools`.

# Archive

Superseded content, kept so you can roll back. **Nothing here is imported** — the build ignores
it, so it costs zero bytes in `dist/`.

| File | What it holds | Replaced |
|---|---|---|
| `skills.v1.ts` | 3 stack cards with a one-line note each | 2026-07-31 |
| `about.v1.ts` | 3-paragraph about + 3 generic highlight cards | 2026-07-31 |

## Rolling back

**Stack** — copy `skillGroupsV1` into `../skills.ts` as `skillGroups`. The shapes differ: v1 has
`glyph` (a text character) and a `note` per card; v2 has `icon` (an SVG path) and no note. So
`src/components/Skills.astro` needs reverting too.

**About** — copy `aboutV1` and `highlightsV1` into `../site.ts` as `about` and `highlights`. Also
flip `.prose :global(strong)` in `src/components/About.astro` back to `var(--accent-ink)`; v2 uses
`var(--ink)` there.

## Worth doing at some point

This folder only exists because the project isn't under version control. One command makes every
future change revertible without hand-copying files:

```bash
git init && git add -A && git commit -m "Portfolio site"
```

After that this folder can go.

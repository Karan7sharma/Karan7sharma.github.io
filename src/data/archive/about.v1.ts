// ARCHIVED 2026-07-31 — superseded by the `about` and `highlights` exports
// in ../site.ts (v2). Nothing imports this file.
//
// To roll back: copy these two arrays over the ones in ../site.ts.
// One component change goes with it — v1 prose used <strong> for accent-green
// emphasis; v2 uses it for brighter-white emphasis. See `.prose :global(strong)`
// in src/components/About.astro.

export const aboutV1 = [
  "I came to this from the Linux side rather than the developer side: a lot of hours in a terminal, then AWS, then containers, then the realisation that clicking things in a console doesn't scale and Terraform does.",
  'Most of my time now goes into infrastructure as code, CI/CD, and observability — the unglamorous middle of the stack where an hour of work quietly saves someone a bad night. I\'m working through the <strong>AWS Solutions Architect Associate</strong> certification at the moment.',
  'I like problems where the fix is boring and permanent rather than clever and fragile.',
];

export const highlightsV1 = [
  '<strong>Automation-first mindset</strong> — if it happens twice, it gets a script; if it matters, it gets a dashboard and an alert.',
  '<strong>Observability that acts</strong> — alerts wired to open and resolve their own tickets, with per-service availability tracked.',
  '<strong>Boring on purpose</strong> — I replace fragile manual processes with dull, reliable automation, then instrument it until problems announce themselves.',
];

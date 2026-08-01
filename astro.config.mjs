// @ts-check
import { defineConfig } from 'astro/config';

// Tailwind v4 runs through PostCSS (see postcss.config.mjs) rather than the
// @tailwindcss/vite plugin — that plugin pins a newer Vite than Astro's, which
// breaks on Node < 20.19.
export default defineConfig({
  // Must match where the site actually lives — og:image and the canonical
  // link resolve against it. Change this one line if you move to a custom
  // domain later (and add a public/CNAME file containing that domain).
  site: 'https://karan7sharma.github.io',
});

// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Tailwind v4 runs through PostCSS (see postcss.config.mjs) rather than the
// @tailwindcss/vite plugin — that plugin pins a newer Vite than Astro's, which
// breaks on Node < 20.19.
export default defineConfig({
  // Single source of truth for the canonical URL: canonical links, OG tags,
  // the JSON-LD Person schema and the sitemap all derive from this. Moving
  // domain means changing it here, in public/robots.txt, and adding a
  // public/CNAME file — nowhere else.
  site: 'https://karan7sharma.github.io',
  integrations: [
    // Don't advertise the 404 page to crawlers.
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
});

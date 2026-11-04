# 0001. Rebuild on Next.js 16

- Date: 2026-11-04
- Status: Accepted

## Context

The old site ran Next 13 with framer-motion, lenis and swiper, five locales, and a CRA-era README.
The overhaul replaces the layout, the content model and the visual concept, so most files change
anyway.

## Options considered

1. Upgrade in place, step by step (13, 14, 15, 16), keeping the old components.
2. Rebuild on Next 16 (App Router, Turbopack, `proxy.js`, async params), carrying over only the
   contact form, the vinyl player and the theme toggle.
3. Move to a lighter static generator (Astro).

## Decision

Option 2. Decided by: Farrez.

## Reasoning

In Farrez's words: "Sekalian bangun ulang" (rebuild it while we are at it). Since the redesign
touches nearly every file, migrating old components first would be work thrown away.

## Consequences

- Pinned versions: next 16.4.5, react 19.2.1, next-intl 4.14.9. `npm audit --omit=dev`: 0
  vulnerabilities on 2026-11-05.
- `middleware.js` is now `proxy.js`; `next lint` no longer exists in Next 16, so the `lint` script
  was replaced by `npm test` (node:test). Adding ESLint is a separate decision.
- Vercel must build with Node 20.9 or newer.
- Revisit if Vercel hosting goes away or a static export is needed.

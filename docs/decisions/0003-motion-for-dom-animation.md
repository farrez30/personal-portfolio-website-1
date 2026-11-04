# 0003. Motion for DOM animation

- Date: 2026-11-04
- Status: Accepted

## Context

The hero headline and the page sections move with scroll. The old site used framer-motion and
lenis. Options were weighed on bundle size, scroll-linked support and how much room they leave for
effects.

## Options considered

1. CSS only (scroll-driven animations, `animation-timeline`), no library.
2. Motion 14 (`motion`, the vanilla successor of framer-motion): `scroll`, `animate`, `stagger`.
3. GSAP with ScrollTrigger.

## Decision

Option 2, pinned at 14.9.1. Decided by: Farrez.

## Reasoning

In Farrez's words: "Ruang untuk efek" (room for effects). CSS scroll timelines are still missing in
some browsers, and GSAP adds weight the site does not need next to three.js.

## Consequences

- framer-motion and lenis were removed; native scrolling stays.
- The headline reads progress from one CSS variable (`--p`) set by Motion's `scroll`, so each
  frame writes a single number.
- With `prefers-reduced-motion`, `--p` is set to 1: the headline shows its final state at once.
- Revisit if CSS scroll-driven animations reach all target browsers.

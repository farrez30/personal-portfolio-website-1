# 0007. One page with a scroll-driven rack

- Date: 2026-11-05
- Status: Accepted

## Context

The first build put the 3D rack in a full-screen layer over the page. Farrez found it too abrupt
and lost the header and the contact footer.

## Options considered

1. Full-screen 3D layer opened from the hero.
2. One landing page: hero, then a sticky section where scrolling moves through the rack, then
   contact. Corner navigation stays while the rack is on screen.
3. Separate route for the rack.

## Decision

Option 2. Decided by: Farrez.

## Reasoning

In Farrez's words: keep the header and the contact footer, and let the rack be part of the page
that moves as he scrolls ("saya ingin bergerak saat saya scroll").

## Consequences

- `RakGulir.jsx` is `(n − 1) × 42vh + 100vh` tall; scroll position maps to the album in front.
- While an album is open, scrolling is held with `preventDefault` on wheel, touch and keys, not
  with `overflow: hidden` (that broke `position: sticky` and turned the screen black).
- Album views are hash routes (`#/slug`, `/buka`, `/putar`, `/buklet`), so Back works.
- Revisit if analytics show visitors not reaching the contact section.

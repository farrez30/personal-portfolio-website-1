# 0005. LeafThrough for the booklet page turns

- Date: 2026-11-04
- Status: Accepted (reason recorded from the request; Farrez to confirm wording)

## Context

The booklet flies out of the lid and its pages turn like paper. A believable page curl needs a
deforming mesh with correct shading in colour, depth and shadow passes.

## Options considered

1. LeafThrough 0.1.8 (MIT, by the author of Discography): `LeafThroughObject` with a `deform`
   GLSL hook, `next()` and `prev()`.
2. Write a page-curl mesh from scratch.
3. A CSS 3D flipbook laid over the canvas.

## Decision

Option 1, pinned at 0.1.8. Decided by: Farrez, in asking for the booklet to behave like
Discography's.

## Reasoning

Recorded by the implementer from Farrez's request ("Discography itu banyak sekali yang bisa
diinteraksikan ... perhatikan secara detail"): LeafThrough is the published, licensed piece of that
work, so the page turn matches it without copying unlicensed code. A CSS flipbook cannot share the
scene's light and shadows.

## Consequences

- Credited in README and `public/credits.txt` (MIT notice kept).
- `next()` returns false while pages load, so page turns are queued and retried per frame.
- Version 0.x: upgrades are read and tested by hand before bumping.
- Revisit if the library is abandoned or breaks on a three.js upgrade.

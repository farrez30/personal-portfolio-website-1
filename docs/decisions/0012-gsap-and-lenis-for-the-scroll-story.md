# 0012. GSAP and Lenis for the scroll story

- Date: 2026-11-10
- Status: Accepted

## Context

Farrez judged the first scroll story (PR #41, ADR 0011) far too plain next to miftahul.com. It
used small CSS reveals per chapter. The rework (`docs/storyboard-gulir.md`) keeps one 3D jewel
case on screen through all eight chapters, with pinned moments, scrubbed text and a handoff to
the rack. That needs ordered scroll choreography across many elements.

## Options considered

1. three.js and Motion only (both already installed); write pinning and choreography by hand.
2. Add GSAP (ScrollTrigger, SplitText) and use the official `greensock/gsap-skills` as guidance.
3. Option 2 plus Lenis smooth scroll.

## Decision

Option 3. Decided by: Farrez, through a structured question on 10 Nov 2026. He also approved
studying `gsap-skills`, MengTo/Skills (cinematic scroll, scroll worlds) and `taste-skill`,
together with the Coderoach pattern bank, and asked for everything in one PR.

## Reasoning

Farrez picked GSAP plus Lenis over the recommendation (GSAP alone). At his request ("kamu yg
tulis", 10 Nov 2026) the reason was written by Claude from what he had said in the same session:
he wants the page to feel as cinematic and smooth as miftahul.com, and the gentle inertia from
Lenis is part of that feel, alongside the pinned and scrubbed scenes from GSAP.
Approved by Farrez in the same session; edit it if the wording does not match his intent.

## Consequences

- `gsap@3.15.0` (released 13 Apr 2026, chosen over 3.15.1 because that one was 6 days old) and
  `lenis@1.3.27` (15 Oct 2026), pinned exactly. `npm audit`: 0 vulnerabilities. No network calls
  found in either package's dist. GSAP is under GreenSock's Standard "no charge" License, which
  allows commercial use except for building a competing no-code tool.
- Lenis runs on the GSAP ticker and stops while an album is open (the rack's own wheel hold from
  ADR 0007 is ignored by Lenis otherwise). Off for `prefers-reduced-motion`.
- The skills were cloned to `D:\Projects\references\` for study; no code was copied. Credit for
  the persistent-world idea is in `public/credits.txt`.
- Immersive mode now runs two WebGL canvases (story and rack). Revisit if phones struggle.

# 0014. One record-shop world with a snake loader

- Date: 2026-11-12
- Status: Accepted. Reverses the "no full-screen loader" decision made earlier the same day. Will supersede ADR 0013 (soundstage) once the shop world ships.

## Context

Farrez wants the hand-off between sections to feel continuous and unguessable, like igloo.inc
(Awwwards Site of the Year 2024). Igloo gets there by drawing one WebGL world and hiding scene
changes inside full-screen effects, and it ships a loader for that
(https://www.awwwards.com/igloo-inc-case-study.html). The home page today is separate DOM sections.
The hero is DOM, the scroll story is a soundstage world (ADR 0013), the CD rack has its own canvas,
and clients and contact are DOM. Each boundary is visible. Moving storyboards are in
`desain/transisi/`.

## Options considered

1. **Overlap + shared object between DOM sections.** Pinned overlap, colour morph, one object
   carried across each boundary. Small effort, no loader, safe on phones. The sections still feel
   like separate boxes.
2. **One continuous 3D world with a loader (chosen).** Every section becomes a place in one scene,
   and one camera moves between them. Text stays in the DOM. Biggest build, longer first load.
3. **3D only around the rack.** Continuous from the end of the story to contact. A middle ground,
   but the seam moves to the hero/story edge.

The world concepts were A (inside a CD player), B (record shop after closing) and C (sound
particles). The loader options were snake, audio cable and CD hole.

## Decision

Option 2 with world B and the snake loader. Decided by: Farrez, through structured questions on
12 Nov 2026. He chose these over my recommendations (cable loader, world A).

- Loader: during loading a snake circles like a spinner and grows with real progress. At 100% it
  slithers toward the viewer, lunges, and its open mouth is a portal to the hero.
- World: listening booth (hero), wall of liner notes (story), CD rack (projects), counter with
  label stickers (clients), shop door and bell (contact).

## Reasoning

In Farrez's words: "Cerita yang menyambung." The sections have to read as one journey, not as
separate boxes, and only a single world makes the transitions truly seamless.

## Consequences

- Loader progress must come from real asset loading and shader warm-up, never from a timer.
- Hero and section text stay server-rendered HTML over the canvas, for SEO and screen readers.
- Reduced motion gets a static loader with a percentage and short cross-fades, with no lunge and
  no camera flight.
- The soundstage story (ADR 0013, PR #51 to #53) and the rack canvas get folded into the shop.
  Their code is reused where it fits, for example `buatKotak` and the warm-up from PR #54.
- The hero intro from PR #57 is replaced by the snake hand-off.
- Section transitions are camera blends: one fast eased move between fixed camera anchors, with
  motion blur scaled to camera speed. No themed effects (Farrez, 12 Nov 2026, after the storyboard
  showed rainbow and light-leak transitions as forced).
- Asset source is a mix, chosen by Farrez after a side-by-side test (12 Nov 2026). The room is
  primitives plus Flow textures. Supporting props are CC0 from Poly Haven, with textures reduced
  to 512 px. Image-to-3D (Hunyuan3D-2) is only for key objects that have no CC0 model, such as
  the headphones and the snake. Hunyuan output still needs the external-component audit
  (Tencent Hunyuan 3D 2.0 Community License, which excludes the EU, UK and South Korea).
- Revisit if phones cannot hold a steady frame rate after the quality tiers are in, or if
  first load passes about 5 s on a mid-range phone.

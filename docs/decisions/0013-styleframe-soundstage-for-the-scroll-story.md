# 0013. Styleframe soundstage for the scroll story (v3)

- Date: 2026-11-11
- Status: Superseded by ADR 0016 (13 Nov 2026). Was: accepted, replacing the one-jewel-case world of v2

## Context

Farrez judged v1 (PR #41) and v2 (PR #43) far from what he pictured: no visible process from a
vague idea to a finished product, and an unpolished look. v3 went through a design pipeline
first: brief, research, ten AI styleframes (Google Flow, Nano Banana 2.1), storyboard boards in
pen.dev and an animatic, all approved (`desain/cerita-v3/`). The concept is a film production
staged on one soundstage, one station per chapter, ending with CDs filed into the rack.

## Options considered

1. **Styleframe layers plus 3D (chosen).** One three.js world. Each station is its approved
   styleframe on a panel standing on a dark studio floor; the camera flies between panels without
   cuts. A red 3D thread, real jewel cases (`buatKotak`) and the rack curtain are true geometry.
   About 0.7 MB of images. Limit: camera angles stay close to each panel's own view.
2. **Full 3D soundstage.** Every station modelled from primitives and CC0 textures. Free camera,
   but the largest build, a real risk of the "3D toy" look the brief rules out, far from the
   approved styleframes, and heavy on phones.
3. **Scrubbed Flow video.** Frames-to-video clips between styleframes (about 100 to 160 of 358
   Flow credits), played by scroll, with 3D only at the end. Most cinematic, but costs credits,
   tens of MB for ten chapters, and clips can fail on object detail.

## Decision

Option 1. Decided by: Farrez, through a structured question on 11 Nov 2026.

## Reasoning

In Farrez's words: "Paling mirip styleframe" (closest to the approved styleframes).

## Consequences

- `components/cerita/naskah.js` is pure data and functions (camera per chapter, thread length,
  case and curtain timing), locked by `tests/naskah.test.mjs`: continuous camera, never through a
  panel, cases one at a time, curtain only after the last case.
- Panels use a small shader: exact styleframe colours (no tone mapping), dimmed with distance,
  stepped lights for the foundation chapter, split grade line for the polish chapter. AgX tone
  mapping applies to the 3D objects. Grain and vignette are CSS overlays.
- Light mode shows the same styleframes as images; reduced motion shows the final states.
- The film stages are a visual frame only; chapter text never names them (tested).
- Revisit if phones struggle with two WebGL canvases (story and rack).
- Look-dev (11 Nov 2026, chosen by Farrez through a structured question: base package, 2.5D
  parallax, room sound, real product screens): parallax comes from local Depth Anything V2 Small
  depth maps (Apache-2.0; the Large model is CC-BY-NC and was not used), screens are composited
  by a homography in the panel shader, sound reuses the rack's engine. No new runtime dependency.

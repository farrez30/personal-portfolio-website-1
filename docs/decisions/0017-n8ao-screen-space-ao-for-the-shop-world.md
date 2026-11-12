# 0017. N8AO for contact shadows in the shop world

- Date: 2026-11-13
- Status: Accepted. Extends ADR 0016 (props tour).

## Context

After two rounds of fixes Farrez still read the story props as "3D mentah atau melayang": objects
did not seem to sit on their tables. Lamp shadows existed but were soft and far; what was missing
was contact darkening where objects meet surfaces and each other. Our own depth AO (8 taps, 30 cm,
desktop only) was too weak to read at story framing.

## Options considered

1. **N8AO** (`n8ao` 2.0.1, ISC, with `postprocessing` 6.39.6, Zlib, as its peer). Screen-space AO
   with denoise, drops into the existing post chain.
2. **Bake AO in Blender** for each prop and the room. Best quality and zero runtime cost, but every
   prop change means a rebake, and the procedural props would need UV2 and a pipeline we do not have.
3. **Strengthen our own SSAO.** No new dependency, but more taps and a denoise pass is rebuilding N8AO.

## Decision

Option 1. Decided by: Farrez, 13 Nov 2026 ("N8AO").

## Reasoning

In Farrez's words: "Hasil cepat, kerja kecil".

## Consequences

- `components/dunia/dunia.js` renders the scene into its own target, N8AO reads that target
  (`autoRenderBeauty: false`) and writes into `hasilAO`, which the existing post shader samples.
  Our own SSAO code and `uAo` are gone.
- Half-resolution mode is off: with a borrowed beauty target it threw on phones. The quality guard
  first drops samples to 8, then switches AO off.
- Audit: `npm audit` 0 vulnerabilities; both packages pinned; `postprocessing` peer range is
  `three >= 0.168 < 0.188`, so a three.js upgrade past 0.187 needs a postprocessing upgrade first.
- Same day, the rack stall: the approved fix was to slim the rack materials (physical to standard).
  Measured, it changed nothing (13 shader programs, stalls 628 and 912 ms), so it was reverted
  before shipping. The probe showed ANGLE finishing a program only at its first draw: the world's
  warm-up skipped meshes outside the camera, and the rack drew everything (and its shadow shaders)
  in one frame. Warm-up draws now include off-screen and hidden meshes and go three meshes per
  frame. Worst stall near the rack went from 912 to 546 ms (desktop), the phone's worst frame on
  the way in from 685 to 170 ms. What is left is PMREM plus geometry when the rack is created.
- Revisit if a three.js upgrade is blocked by the postprocessing peer range, or if baking becomes
  cheap (a fixed prop set).

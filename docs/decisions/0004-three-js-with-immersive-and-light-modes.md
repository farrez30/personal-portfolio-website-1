# 0004. three.js scene with Immersive and Light modes

- Date: 2026-11-04
- Status: Accepted

## Context

The concept is a rack of project CDs: each project is a jewel case with a disc and a booklet, and
a player whose Play button projects the product as a hologram. Farrez asked for it to be as
realistic and interactive as Discography (dmtrbrl), and for two modes he can switch like a game's
graphics setting.

## Options considered

1. three.js 0.187 with hand-written shaders, plus an HTML grid (Light mode) for weak devices.
2. React Three Fiber on top of three.js.
3. Pre-rendered video or image sequences driven by scroll.

## Decision

Option 1. Decided by: Farrez (the two modes are his request; the library follows from it).

## Reasoning

In Farrez's words, he wants the site to be "experience yang menarik ... wow, keren sekali", with a
mode for weaker devices. A video cannot be rotated, opened or clicked; R3F adds a reconciler layer
over a scene that is driven imperatively by scroll and springs.

## Consequences

- `components/mode/pilihMode.js` picks the first mode: Light without WebGL2, with reduced motion,
  save-data, under 4 GB memory or under 4 cores. The visitor's choice is remembered and always wins.
- The scene lives in `components/imersif/` (`adegan.js`, `benda.js`, `gambar.js`), built in
  millimetres (1 unit = 100 mm). It is loaded only in Immersive mode.
- Light mode has the same content: a grid of covers and a dialog per project.
- Revisit if Lighthouse mobile drops below 70 or WebGPU becomes the safer default.

# DESIGN.md

The look of farrez.vercel.app, written down from the code that ships. When the code and this file
disagree, fix one of them in the same change.

## Concept

A record shop shelf for work. Each project is a jewel case on a rack: the cover says what it is,
the booklet says what Farrez did, the disc in the player shows the product running. Everything
should look like a real object photographed on a beige studio table, not a stylised 3D toy.

## Colour tokens (`app/globals.css`)

| Token | Dark (default) | Light | Use |
|---|---|---|---|
| `--bg` | `#161514` | `#f2efe9` | Page |
| `--bg-2`, `--bg-3` | `#1f1e1c`, `#2a2826` | `#e8e4dc`, `#dcd6cc` | Raised surfaces |
| `--ink` | `#ece8e1` | `#1d1b19` | Body text |
| `--ink-2`, `--ink-3` | `#b3ada4`, `#847e75` | `#4f4a43`, `#6f695f` | Secondary, meta |
| `--line` | `#3a3733` | `#cbc4b8` | Borders |
| `--aksen` | `#e0574b` | `#b3322a` | Primary button, highlights |
| `--fokus` | `#f0b35a` | `#8a4b00` | Focus ring |

The rack stage has its own warm palette (`components/imersif/panggung.css`): `--ruang #e9e1d3`
with a radial light and fine grain. The hologram uses one phosphor green, `--fosfor: 150 255 190`,
nothing else.

## Type

- Schibsted Grotesk (`--font-sans`) for headings and body, 17 px base, line height 1.6.
- IBM Plex Mono (`--font-mono`, class `.mono`) for catalogue numbers (FRZ-01), meta lines and the
  hologram's terminal text.
- Headings 600 weight, `text-wrap: balance`, slight negative tracking.

## Shape and spacing

`--r-kecil 4px` for controls, `--r-kotak 10px` for cards. Page width `--lebar 72rem`, side gutter
`--tepi clamp(1rem, 4vw, 2.5rem)`.

## Motion

- DOM: `--t-cepat 160ms`, `--t-sedang 320ms`, `--ease cubic-bezier(0.2, 0.7, 0.2, 1)`. The hero
  headline is driven by scroll through one variable `--p`.
- Scene: springs and eased sub-phases that overlap (open, listen, read), never linear tweens.
  Discs spin at 120 rpm in the player.
- `prefers-reduced-motion`: Light mode by default, headline in its final state, hologram tilt and
  dust off.

## The jewel case (`components/imersif/benda.js`)

Built in millimetres, 1 scene unit = 100 mm. Case 142 × 125 × 10.4 mm. Clear base with a printed
back insert; black tray 136 × 121 mm with a rosette of 12 teeth through the disc hole and two
half-ring clips at the disc edge; ribbed hinge strip (14 mm, 18 ribs) with knuckles at both ends;
disc seated 6 mm right of centre, turned up to ±25° per album. Lid: booklet 120 × 120 × 1.2 mm held
by four round tabs 16 mm in from each corner and two stop ribs; clear sheet 1.5 mm. Clear plastic
shows faint cut edges (lines at 15 to 25% white). Plastic sheen is a soft studio strip reflection,
the disc's data side a diffraction shader.

## Icons and text

Phosphor icons through `react-icons/pi`. UI text follows the `bahasa-lisan` rules: plain
punctuation, no arrows or middle dots joining phrases, no text that explains the page itself.

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

The hero headline's last words get a yellow highlighter stroke (`#ffd84a`, ragged SVG edge,
black text), swept word by word with scroll like a Vox explainer. Yellow appears only there; the
struck-through first half keeps the red accent line, drawn above the letters.

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

## The scroll story (`components/cerita/`, ADR 0011, 0012, 0013)

Ten chapters between the hero and the rack, from an everyday complaint to a system used every
day. The design pipeline (brief, research, styleframes, pen.dev storyboard, animatic, final copy)
lives in `desain/cerita-v3/`.

**Immersive** is one 3D soundstage (`dunia.js`) on a canvas that sticks behind the chapters. Each
chapter has one AI styleframe (`public/assets/cerita/`) on a panel standing on a dark, half-polished
concrete floor; the camera never cuts, it flies between panels in the dark. A film production is
the visual frame only (idea, script, storyboard, set, shoot, edit, grade, screening, seal, release);
chapter text never names those stages.
- the section title sits over a high shot of the whole stage, then the camera cranes down to the desk;
- the foundation chapter's set lights switch on one at a time;
- the shoot chapter is handheld;
- the polish chapter's grading monitor is split raw grey and warm by a moving red line;
- the screening flickers once;
- a red 3D thread on the floor grows with the story and links every station;
- at the end three real jewel cases (`buatKotak`) slide into the rack one by one, a red velvet
  curtain opens, and the screen fades to the rack's beige; the last chapter's text turns to ink.

Panels keep the styleframes' own colours (no tone mapping), dimmed with distance; the 3D objects use
AgX. Grain and vignette are CSS overlays.

Look-dev (11 Nov 2026), all in `dunia.js` without new runtime dependencies:
- panel edges fade into the dark stage (no frames), and panels away from the camera are blurred
  through a mipmap bias, so the stage reads as one room with depth instead of photos on stands;
- each panel is a mesh pushed forward by its depth map (Depth Anything V2 Small, local), so people
  and desks shift against the background as the camera moves (2.5D parallax); the release panel
  stays flat;
- monitors in the build, progress and screening chapters show real product screens (Coderoach OS,
  d-day, Jeda) through a per-screen homography, with occluders kept in front and the same warm
  grade; Light mode uses the same screens baked by `scripts/layar-ringan.mjs`;
- dust motes hang in the air (static; parallax makes them live, no extra redraws), and a hanging
  lamp with a light shaft and floor pool marks each gap between sets;
- the curtain has real folds that bunch as it opens, and the rack light behind it is a warm
  gradient that spills onto the frame;
- grain is finer and lighter, and stops while the story is off screen.

Sound (same engine and mute button as the rack, `components/imersif/suara.js`): a quiet studio room
tone while the story is on screen, the projector hum in the screening chapter, and one-shots tied
to the story beats (`bunyiAntara` in `naskah.js`, tested): paper, typewriter and its bell, pages,
three relay clunks as the foundation lights come on, laptop keys, a knob click, the wax seal, each
jewel case closing into the rack, and the curtain. Only forward scrolling sounds; long jumps are
silent. CC0 recordings from Freesound (`public/assets/suara/PROVENANCE.md`). The scene script is pure data (`naskah.js`, tested in
`tests/naskah.test.mjs`), so scrolling back gives the same frames. Chapter text sits bottom left
over a soft dark fog (bottom on phones), shows "03 / 10", and leaves before the next chapter's text
arrives. If WebGL fails, the story falls back to Light.

**Light** shows each chapter's styleframe as an image beside its text, pushed in slowly by `--p`,
with the same real product screens as the immersive stage.
**Reduced motion** shows the final states.

## The jewel case (`components/imersif/benda.js`)

Built in millimetres, 1 scene unit = 100 mm. Case 142 × 125 × 10.4 mm. Clear base with a printed
back insert; black tray 136 × 121 mm with a rosette of 12 teeth through the disc hole and two
half-ring clips at the disc edge; ribbed hinge strip (14 mm, 18 ribs) with knuckles at both ends;
disc seated 6 mm right of centre, turned up to ±25° per album. Lid: booklet 120 × 120 × 1.2 mm held
by four round tabs 16 mm in from each corner and two stop ribs; clear sheet 1.5 mm. Clear plastic
shows faint cut edges (lines at 15 to 25% white). Plastic sheen is a soft studio strip reflection,
the disc's data side a diffraction shader.

## Album art (`content/album.js`, `components/imersif/tipografi.js`)

Every project CD is its own album: one classic record-design genre each (Swiss, 70s collage,
Bauhaus, mid-century, constructivist, linocut, pop art, ECM, city-pop, Blue Note), table and
reasons in `docs/genre-cd.md`. Front covers carry the Indonesian title lettered by Nano Banana
itself (`sampul-judul.webp`, spelling checked by hand), chosen by Farrez over code-set titles
because the lettering sits inside the art. Everything else is set by code in the genre's typeface
(OFL fonts in `public/assets/album/huruf/`), with a slight misregistered second pass and paper
grain, never a separate title band; the same code version is the fallback front cover. Spines take the album's ink colour with
the title in the genre face and the site logo. Every back insert has its own layout (`tata` in
`content/album.js`), like real CD backs: track list (the architecture story steps), a decorative barcode with
the catalogue number, the site logo as record label, the project's own logo when it has one, and
a small credit line. The plain band Flow left at the bottom of the art is detected and cropped. Projects without album art fall back to the old cream cover with a colour band.

## Icons and text

Phosphor icons through `react-icons/pi`. UI text follows the `bahasa-lisan` rules: plain
punctuation, no arrows or middle dots joining phrases, no text that explains the page itself.

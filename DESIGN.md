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

## The scroll story (`components/cerita/`, ADR 0011, 0012, 0016)

Ten chapters between the hero and the rack, from an everyday complaint to a system used every
day. Pipeline (research, data on what business owners struggle with, previs renders, pen.dev
storyboard v0.1 and v0.2, final copy) lives in `desain/cerita-v4/`; v3 history in `desain/cerita-v3/`.

**Immersive** is a props tour inside the record-shop world: the camera stops at one object per
chapter (`components/dunia/props.js`), each taken from record-shop vocabulary, and blends between
them like the rest of the world. Product screens are textures on the object's own screen or paper.
- complaint: a customer request board and a laptop showing a Meet call;
- plan: a requirements sheet on a clipboard, stamped approved mid-chapter;
- shape: one album in four formats (vinyl, CD, cassette, phone), each lifted in turn;
- foundation: a hi-fi rack seen from behind, labelled cables, three status lights;
- build: a turntable spinning a white-label test pressing beside a design monitor;
- progress: a pre-order board (ordered, on the way, arrived, icons only), one card moving, one held
  with a red note;
- polish: a listening station tablet where a red line wipes a raw cashier form into a tidy one;
- dependable: the shop's power cuts out, a battery player, a phone and an emergency lamp stay on;
- safe: a glass case holding a leather ledger and tabbed archive folders; its lid closes and a padlock locks on the front hasp, beside a key board for cashier, warehouse and owner;
- release: three real jewel-case covers slide into the rack.

Chapter text names situations common to any business; project names stay in the proof links
(tested). Text sits bottom left over a soft dark fog (bottom on phones), shows "03 / 10", and leaves
before the next chapter's text arrives. Sound uses the rack's engine (`bunyiCerita` in
`components/dunia/naskah.js`, tested): one-shots on entering a chapter and at its moments, only
when scrolling forward.

**Light** shows a render of the same object from the world (`public/assets/cerita/<chapter>.webp`)
beside its text, pushed in slowly by `--p`. Switching from Immersive to Light keeps the world in
memory, hidden and not drawing, so switching back shows it at once without the loader. **Reduced motion** shows the final states, and the
world cuts between chapters behind a short crossfade.

## The record-shop world (`components/dunia/`, ADR 0014)

Realistic cinematic night, set by the look-dev sheet `docs/look-dev.md` (target styleframes in
`desain/look-dev/`). Each place has one pendant lamp you can see: bulb, halo sprite, a faint
light cone in the air and a pool on the floor, all additive with no extra pass. Warm `#ffb46a`
inside, blue `#6f8fd6` only from the street door, shadows and fog warm brown `#1a1410`. AgX tone
mapping (exposure 1.3, times a per-place `paparan` in `naskah.js` for the counter and the door,
eased during camera moves); no environment map. The front wall holds a cassette rack behind the
counter, a record crate and a low sleeve shelf on either side of the door, and two posters with
shapes but no lettering, all primitives and InstancedMesh. Floor is worn concrete baked by `scripts/beton.py`.
The screen pass after motion blur lifts the shadows, adds a soft vignette and a film grain that
only changes when the scene redraws. Light mode is the shop in the morning: same rig with the
cones and grain turned down.

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

## Clients and partners (`components/klien/`, `content/klien.js`)

Between the rack and contact, tagged `data-dunia="kasir"` so the shop camera stops at the cashier
counter. Every client is a fully printed CD (`public/assets/klien/cakram/`): the art is Nano Banana
in Flow with the client's real logo as an ingredient, and `scripts/logo-cakram.py` then replaces
the logo with the original file's pixels (never redrawn, only downscaled; provenance per file).
Personal projects reuse their album label style with a lockup of the project icon and name.

- Three tabs: Coderoach (studio clients), Mitraplus (office clients), Personal. The spindle in the
  middle shows the group's own logo.
- **Immersive, 60rem and wider:** the section is pinned for 260vh. The stack blooms into a tilted
  ring over the first 18% and turns once over the next 70%; the ring can also be dragged, and
  arrows or focus bring a disc to the front. The shape is a pure function of progress
  (`cincin.js`, tested), drawn as 2.5D transforms without a WebGL canvas.
- **Light, narrow, and reduced motion:** a snap-scrolling row of discs; reduced motion turns it into
  a static grid.
- A company with several brands is a box set (Masaya Food: Chicken Wow and Geprek Wow): child
  discs peek behind the parent, and the detail card opens both side by side.

## Icons and text

Phosphor icons through `react-icons/pi`. UI text follows the `bahasa-lisan` rules: plain
punctuation, no arrows or middle dots joining phrases, no text that explains the page itself.

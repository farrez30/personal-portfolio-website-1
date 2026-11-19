# 0024. Projects live in a satellite lab module after the globe

- Date: 2026-11-20
- Status: Accepted (direction). Supersedes the filing-cabinet part of ADR 0021 (projects as document
  folders in a toon filing cabinet). The rest of ADR 0021 (the rack and loader join the toon world) stands.

## Context
Story v5 (ADR 0019) ends on a night globe with moving satellites. The project section has to follow it.
Research on carousels and 3D navigation is in `desain/cerita-v5/riset-portofolio.md`: show at most a few
items at once (NN/g), never make a slide the only way to the content (Baymard), keep a parallel DOM list
(three.js practitioners), and give each project its own shape (Igloo Inc).

## Options considered
1. Ring of project cards around the earth.
2. Constellation of ten satellites shaped like each project (recommended in the research).
3. Back down to the office, a filing cabinet.
4. Showroom with turntables.
5. Globe as a backdrop, plain project grid.
6. **Zoom into one satellite that turns out to be a lab module (Farrez's idea, chosen).** Through its
   round window into a corridor of racks, like the lab racks of the ISS Destiny module. Each locker is one
   project; the chosen locker slides out and its card opens.

Previs of all six is in `desain/cerita-v5/previs/papan-porto.webp`, and of option 6 in `porto-lab.html`.

## Decision
Option 6, decided by Farrez on 20 Nov 2026 after watching the previs.

## Reasoning
In Farrez's words, when proposing it: "zoom in ke dalam satelitnya itu ... isinya adalah sebuah modul lab
... ada semacam rak untuk bisa melihat kumpulan project itu, bisa memilih seperti arsip tersebut." (Zoom
into the satellite; inside is a lab module with a rack to browse the projects and pick one, like an archive.)

## Consequences
- The satellites already on the globe become the way in, so no new room appears out of nowhere.
- The HTML list of project names stays visible at all times and mirrors the lockers for keyboard and
  screen readers.
- One new interior set; the corridor needs a wide lens (74° desktop, 88° phone). Locker labels must be
  tested for legibility on a phone.
- Inside the module, Farrez chose (20 Nov 2026, after comparing three videos in `banding-lorong.html`): scroll moves the camera forward along the corridor with soft stops at each group of lockers; background life with characters (a small screen-faced robot on a ceiling rail, a floating astronaut, a tethered cargo bag, breathing ceiling lights); sound off by default with a toggle.
- Revisit if the corridor hides product screens that visitors need, or if the zoom feels long on scroll.

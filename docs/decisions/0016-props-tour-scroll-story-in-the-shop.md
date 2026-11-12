# 0016. Props tour for the scroll story, inside the record-shop world

- Date: 2026-11-13
- Status: Accepted. Supersedes ADR 0013 (styleframe soundstage). ADR 0011, 0012 and 0014 still apply.

## Context

Farrez judged the v3 story (Flow styleframes with product screens composited by a shader) as
flawed, "especially the pasted images": in chapter 06 a monitor cut through the editor's head. ADR
0014 had already planned to fold the story into the one shop world. The storyboard (pen.dev,
`desain/cerita-v4/storyboard.pen`, v0.1 then v0.2) was rendered from the real three.js world so
the approved framing is the framing that ships.

## Options considered

1. **Props tour across the whole shop (chosen).** One object per chapter, the camera blends between
   them. Product screens are textures on the object's own screen or paper.
2. **One wall of liner notes**, the story as cards on a single wall. Smallest, but static and close
   to v1, which Farrez rejected.
3. **Keep the styleframe soundstage and fix the compositing.** Keeps the Flow look, keeps the class of
   bug (2D screens on photos).

## Decision

Option 1. Decided by: Farrez, 12 Nov 2026 ("Tur props seluruh toko"); storyboard v0.2 approved
13 Nov 2026 ("Setuju, lanjut").

## Reasoning

In Farrez's words: the old version had "agak banyak cacat, terutama gambar-gambar yang ditempel".
He also asked that each object say its chapter through record-shop vocabulary, that chapter text
use situations common to any business instead of project names, and that the scene look like real
graphics: "jelas gitu ada efek bayangannya dan ada depth".

## Consequences

- Ten cerita anchors between `dinding` and `rak` (`components/dunia/naskah.js`), each with a `benda`
  point; portrait screens aim below the object so it sits above the text (`anchorTegak`).
- Props (`components/dunia/props.js`) load after the hero (`muatCerita`, requestIdleCallback), with
  compile, one texture per frame, and draws in groups of three. Their lights exist from the start,
  because adding a light later recompiles every shader.
- Shadows from every pendant lamp, the street light and a key light that moves to the active chapter,
  each on its own update schedule. Phones keep only the key and street shadows (seven cube maps
  raised shader compile from 0.4 to 1.9 s). Screen pass adds depth AO (desktop) and depth of field.
- Light mode renders the same objects from the world (`public/assets/cerita/<bab>.webp`); the
  styleframes, depth maps, `PanggungCerita` and its scripts are gone from the site.
- Chapter copy names no project in its sentence (tested); proof links keep the names.
- Revision, 13 Nov 2026 (Farrez's review): the key light now travels with the camera blend
  instead of jumping; the safe chapter shows a padlocked filing cabinet; release cases rise first
  and then slide in, so they never cross a shelf; the light theme's white haze is lifted in story
  chapters; the world stays mounted when switching to Light; the rack canvas is created three
  screens early, while the reader is still in the story, not during the camera's flight to it.
- Revisit if a mid-range phone takes more than about 5 s to the hero, or if the measured value range
  of a chapter stays outside the look-dev sheet after one more lighting pass.

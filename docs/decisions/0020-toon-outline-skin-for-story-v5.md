# 0020. Toon skin with ink outlines for the story v5 world

- Date: 2026-11-19
- Status: Accepted (style direction). The full look-dev sheet and the rack and CD loader decision follow.

## Context
Farrez asked for the story v5 world (ADR 0019) to look more like a cartoon: light, easy on the eye,
with depth still readable. His references were a cartoon-style Minecraft resource pack
(Adventure Time Craft, CurseForge) and designed-to-scale.vercel.app. Checked facts: the pack is
tagged Traditional, Animated and 32x on CurseForge, not "cartoon". Modrinth has no cartoon tag, and
its nearest tags are simplistic and themed. designed-to-scale is an isometric SVG illustration with
flat pastel fills and ink outlines, not WebGL. The 3D term is cel shading, also called toon shading,
a kind of non-photorealistic rendering. Four skins were rendered on the same previs scenes:
`desain/cerita-v5/previs/banding-skin.png`.

## Options considered
1. **Clay**: physical light and ACES, the current look. Heavy and dark.
2. **Toon with outlines (chosen)**: MeshToonMaterial with three steps, a pastel palette per object
   type, OutlineEffect ink lines and a perspective camera.
3. **Flat isometric (recommended)**: the same toon look with an orthographic isometric camera. It
   is closest to designed-to-scale.
4. **Low-poly flat**: pastel flat shading with no outlines.

## Decision
Option 2, decided by Farrez through a structured question on 19 Nov 2026, over the recommendation
(option 3). After the four directions were compared in this skin (`banding-1.png`, `banding-2.png`),
he kept direction G.

## Reasoning
In Farrez's words: "Isometrik terlalu seperti diagram; toon perspektif lebih hidup untuk cerita."
(Isometric feels too much like a diagram; perspective toon is more alive for a story.)

## Consequences
- The palette moves from the dark record-shop look to a cream base #f3ece0 with pastel blue, green,
  yellow, purple and coral, plus the red accent #e0574b. Night scenes (the globe, the closed shop)
  use a starry navy sky. DESIGN.md is rewritten when v5 ships.
- No tone mapping and no IBL: cheaper on phones than the current clay look. Outlines roughly
  double the draw calls of outlined meshes.
- Known flaw: inverted-hull outlines break on hard-edged cylinders (stripes on the scale's base).
  The look-dev sheet should test image-space outlines from depth and normals.
- The night globe uses Natural Earth (public domain) and NASA Black Marble 2016. Credit and terms
  are in `desain/cerita-v5/previs/data/PROVENANCE.md` and must be checked again before shipping.
- Revisit if the look-dev sheet cannot keep outlines clean on phones, or if a styleframe reads as
  generic next to the reference sites.

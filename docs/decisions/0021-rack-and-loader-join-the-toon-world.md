# 0021. The project rack and the loader join the toon world

- Date: 2026-11-19
- Status: Accepted (direction). Will supersede the record-shop parts of ADR 0014 and the CD rack look in DESIGN.md once built.

## Context
Story v5 now has its own world: direction G (ADR 0019) with a toon skin and ink outlines (ADR 0020),
written down in `docs/look-dev/cerita-v5.md`. The project rack (jewel cases, ADR 0007) and the CD
loader (ADR 0014) still belong to the realistic record shop. Keeping them would put two styles side
by side at the hand-off from the closing globe to the rack.

## Options considered
1. **Replace them with the toon world (recommended, chosen).** The closing shot drops from orbit
   back to the desk. Projects become document folders in a filing cabinet drawn in the same toon
   style, and the loader is a balance scale that settles as loading progresses.
2. **Keep the CD rack and loader.** The smallest change, but the seam between two styles stays.
3. **Toon the CD rack.** Keep the jewel-case shapes and swap their materials to toon with outlines.

## Decision
Option 1, decided by Farrez through a structured question on 19 Nov 2026.

## Reasoning
In Farrez's words: "Supaya dari loader sampai rak terasa satu dunia, tanpa sambungan dua gaya." (So
that from the loader to the rack it feels like one world, with no seam between two styles.)

## Consequences
- The rack, the booklet, the disc player, the album art and the CD loader (ADR 0005, 0007, 0009,
  0010 and 0014) need a new design in the toon world. That means a storyboard and previs first, then
  approval, then code.
- DESIGN.md (concept "a record shop shelf for work") is rewritten when v5 ships.
- Project content (`content/proyek.js`, the booklet text, the architecture stories, the demos) stays.
  Only how it is presented changes.
- Revisit if the folder metaphor hides the product screens that the jewel cases show well today.

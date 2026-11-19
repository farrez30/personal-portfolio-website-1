# 0023. Mixed, motivated camera moves between the desks in story v5

- Date: 2026-11-20
- Status: Accepted (direction). Refines ADR 0014's "camera blend between anchors" for the office part of story v5.

## Context
Story v5 (ADR 0019) opens on one office floor: five desks, a glass server room and the exit window,
filmed by one camera with blends between them (`desain/cerita-v5/previs/`). Farrez found the blends
"just moving to the next desk on the right". Measured in the previs, all six moves went the same way
(camera x always rising 3 to 7 m) and six of the seven framings shared the same height and heading,
because the desks stood in one row along one wall. Research: `desain/cerita-v5/riset-transisi-kamera.md`.

## Options considered
All four were rendered as videos and compared side by side (`banding-transisi.html`).
1. **Re-layout plus mixed moves (chosen).** Desks on both sides of an aisle, with pillars. Every move is
   different and has a cause in the world: follow the flying receipt, whip pan, into a tablet screen and
   out at the next desk, orbit, behind a pillar, crane up to the floor plan.
2. **Screen portals all the way.** A tablet with the same screen on every desk. The cut is hidden at full
   screen. Consistent, but repetitive, and tablets compete with existing monitors.
3. **Crane to the floor plan every time.** Dollhouse cutaway. Easy to follow, but weak with a single row
   of desks and repetitive.
4. **One winding long take.** Cheapest, keeps the layout. Less variety because the desks stay in one row.

## Decision
Option 1, decided by Farrez on 20 Nov 2026 after watching the four videos.

## Reasoning
In Farrez's words: "Paling hidup dan bervariasi." (The most alive and varied.)

## Consequences
- The office floor in v5 is laid out as two facing rows across an aisle, with structural pillars.
- Each move needs a visible trigger (receipt, ringing phone, screen, pillar, ceiling), checked frame
  by frame and with a centre raycast before any build.
- No two consecutive moves share the same axis, direction or duration.
- Screen effects stay rejected (ADR 0014); this is camera motion only.
- Revisit if the variety reads as restless on a phone, or if scroll users lose their place.

# 0019. Story v5: what the buyer weighs before deciding

- Date: 2026-11-19
- Status: Accepted (direction only). Supersedes ADR 0018 on the same day. Will supersede ADR 0016 once v5 ships; the rack and CD loader are decided after previs.

## Context
Farrez asked for ADR 0018 (option A, "one receipt") to be challenged against evidence of what
business owners and companies actually complain about and look for. He named traffic load, cyber
security and common field failures in ERP and business software. The critique, buyer research,
field cases and three new sketched storyboards are in `desain/cerita-v5/tantangan-narasi.md` and
`pratinjau/papan-e.png` to `papan-g.png`. The main gaps in A: it follows the developer's process
rather than the buyer's decision. It never names the strongest buyer fears (overruns, misread
requirements, code not handed over), and it has no scene for load, attacks, data loss or migration.

## Options considered
1. **A. One receipt (ADR 0018).** The developer's process, from complaint to release.
2. **E. Stress test (recommended).** One receipt survives the worst day: a rush, a power cut, an
   attack, a lost server, a data migration, a staff change, new branches and handover.
3. **F. One day, played twice.** The owner's day before and after, with Farrez as the guide.
4. **G. What the buyer weighs (chosen).** The push, the cost of standing still and the pull. Then
   each worry is answered in turn: cost, vendor continuity, rush, data, team habits. Ends with a small first step.

## Decision
Option G, decided by Farrez through a structured question on 19 Nov 2026, over the recommendation (E).
Satellites stay in the closing shot (decided earlier today). Farrez confirmed that load testing, backup restore drills, and staged scope and pricing are real practice.
He corrected one point: code is not always handed over. Depending on the contract, ownership is
transferred in full or the client gets a licence, as at his office. The vendor chapter therefore
promises that rights are written down from the start, and that the client's data stays theirs and
can be exported under any scheme. Each claim is tied to a named project when the copy is written.

## Reasoning
In Farrez's words: "Isinya bisa diteruskan pemilik ke orang keuangan dan TI di perusahaannya." (The
owner can pass it on to the finance and IT people in their company.)

## Consequences
- Chapters follow the Jobs To Be Done forces of progress and the JOLT finding that buyers lose
  more deals to indecision than to competitors. Each worry is answered inside its own scene. Fear
  is never the selling point.
- Main risk: G can read as an animated FAQ. Previs must give each worry one concrete event (from
  the field cases in `tantangan-narasi.md`). The camera moves at macro scale only where the event
  is physical: the city for a rush, Indonesia for branches.
- The same technical constraints as ADR 0018 apply: staged zoom, no `logarithmicDepthBuffer`, and
  a self-written globe with instanced arcs and satellites.
- Revisit if previs reads flat next to E, or if a confirmed claim cannot be tied to a project.

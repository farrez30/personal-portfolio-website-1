# 0018. Story v5: one receipt, in the reader's own shop

- Date: 2026-11-19
- Status: Accepted (direction only). Will supersede ADR 0016 once v5 ships; the rack and CD loader are decided later.

## Context
Farrez felt the record-shop metaphor (ADR 0014, 0016) does not match his work, building systems
and apps for businesses. He asked for an everyday analogy with macro scene changes, ending in a
zoom out that shows everything connected around the world. Research with labelled evidence and four
sketched storyboards is in `desain/cerita-v5/` (`riset-arah-narasi.md`, `pratinjau/papan-a.png` to
`papan-d.png`). Practitioners (Fowler, Shore, Atwood) warn that the construction metaphor misleads.
No single analogy fits all ten chapters and also carries a moving object and a global zoom.

## Options considered
1. **A. One receipt (chosen).** The reader's own shop, shown as it is. A red receipt with the
   complaint becomes the requirements list, then screens, then a data point on a map. Zoom: counter,
   shop, branches, Indonesia, globe.
2. **B. A shophouse that grows into a city.** Floor plan, foundation, model, key handover, then the
   building joins the city grid. Easiest to grasp, but it is the most clichéd software analogy.
3. **C. From power socket to satellite.** Electricity and signal, from a socket to the grid and
   satellites. The most cinematic option, but it forces the plan, build and polish chapters.
4. **D. One parcel.** One order from chat to delivery. Strong on progress tracking, weak on
   building, and it frames software as a finished product being shipped.

## Decision
Option A, decided by Farrez through a structured question on 19 Nov 2026. He also asked for
satellites at the very end. The closing shot zooms out to orbit height: the globe has arcs from
Indonesia and satellites relaying signal, and then the camera enters the project rack.

## Reasoning
In Farrez's words: "Ceritanya sama dengan yang memang saya kerjakan: kasir, gudang, cabang, dan
distributor yang tersambung." (The story matches the work I actually do: cashiers, warehouses,
branches and distributors that are connected.)

## Consequences
- `components/dunia/` and `components/imersif/` will be rebuilt for the new world. That needs a
  previs storyboard first, then approval, then code (project memory: storyboard first).
- Zoom is staged (shop, city, Indonesia, globe) with handovers hidden by the existing camera blend
  and motion blur, not one real-scale world. No `logarithmicDepthBuffer`.
- The globe is written on the installed three 0.187, with no new dependency. Land points are baked
  at build time from Natural Earth 110m (public domain). Arcs are instanced with the curve in the
  vertex shader. There are 6 to 12 instanced satellites driven by one time uniform. Target: 5 to 7
  draw calls, no lights, no shadows, pixel ratio 1.5 on phones.
- Submarine cable routes are drawn by hand; TeleGeography data is commercially licensed.
- Revisit if previs shows A reads like an ad for a POS app, or if the globe stage misses frame
  budget on a Galaxy A55 class phone.

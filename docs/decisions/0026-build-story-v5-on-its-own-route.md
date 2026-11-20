# 0026. Build story v5 on its own route, keep the CD version reachable

- Date: 2026-11-21
- Status: Accepted. Supersedes phase F8 of `desain/cerita-v5/storyboard-build.md` ("remove the
  cassette-shop world and CD loader").

## Context
Story v5 (ADR 0019 to 0025) is finished as previs and has to be built into the Next.js site in
phases F1 to F8. The live home page is the cassette-shop (CD) version, and Farrez also asked for a
CMS that manages both versions. The old plan removed the CD world at the end of the build.

## Options considered
1. **Build v5 on its own route (`/v5`, noindex) while the CD version stays the home page; when all
   phases pass, v5 becomes the home page and the CD version moves to `/arsip/cd`.**
2. Replace the home page phase by phase and delete the CD world at the end (old F8).
3. Keep both on the home page with a version switch for visitors.

## Decision (decided by: Farrez)
Option 1.

## Reasoning, in Farrez's words
"Versi CD tetap ada." Follow-up: "saya ingin versi lama tetap bisa diakses juga bisa dilihat."

## Consequences
- The v5 camera script lives in its own module (`components/stasiun/`) and its content in
  `content/cerita-v5.js`; the CD modules (`components/dunia/`, `components/imersif/`) keep working
  unchanged. Shared helpers take the anchor list as a parameter instead of a module constant.
- Two 3D worlds are maintained. Shared data (`content/proyek.js`, `content/klien.js`) stays single.
- The swap is one small PR: routes and links change, nothing is deleted. The archived CD page gets
  a visible link from the new home page.
- Revisit if maintaining both worlds slows work down, or if the CD version stops getting visits.

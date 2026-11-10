# 0011. A scroll story from demo to rack, between the hero and the rack

- Date: 2026-11-10
- Status: Accepted

## Context

Farrez liked miftahul.com (one promise followed by proof, a surprise in every section, a brief
wizard for clients) and wanted his own portfolio to tell how an abstract need becomes a finished
product: design matched to the need, transparency, security, reliability, scalability,
infrastructure. The audit and the full proposal are in `docs/usulan-alur-cerita.md`.

## Options considered

1. "From demo to rack": the steps of recording an album, kept in the CD-rack world.
2. Blueprint: one line drawing the product, neutral but outside the CD metaphor.
3. Apple style: pinned chapters, large product imagery, bento grid.
4. Cinematic like miftahul.com: dark, WebGL light sweeps, video. Clashes with DESIGN.md.

Placement: between hero and rack, on its own page, or a short version plus a full page.

## Decision

Option 1, between the hero and the rack, with a contact wizard (need, users, timing, budget
band) and a greeting from the visitor's local clock. Decided by: Farrez, through a structured
question on 10 Nov 2026.

## Reasoning

In Farrez's words (10 Nov 2026): "Saya ingin desain dan narasinya menyambung mulus dari hero
sampai rak, dan tetap mengikuti pola serta genre yang sudah ada." (I want the design and the
story to run seamlessly from the hero into the rack, while keeping the existing patterns and
genre.)

This is why the other options lost: the blueprint leaves the CD-rack world, Apple style and the
cinematic route both replace the look in DESIGN.md, and a separate page breaks the flow into
the rack.

## Consequences

- `components/cerita/` adds eight chapters, each driven by one `--p` variable through Motion
  `scroll()`, the same approach as the hero. No new dependency, no new canvas, no new font.
- Every sentence is tied to a project already on the rack. `tests/cerita.test.mjs` recounts the
  numbers in the copy from `content/proyek.js`.
- The devices in chapter 2 are CSS 3D, not glTF models, and play existing screen recordings.
- The rack moves down by about 5.5 screens. ADR 0007 already says to revisit the layout if
  visitors stop reaching the contact section. The skip link and the hero button jump to the rack.
- The budget bands (Rp 10, 50, 150 million) are a first guess at the client mix. Revisit them
  once real briefs come in.

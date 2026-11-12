# 0015. Hunyuan3D headphone despite the territory clause

- Date: 2026-11-12
- Status: Accepted

## Context

The listening booth (hero anchor of the record-shop world, ADR 0014) needs a headphone. A
Hunyuan3D-2 mesh was generated from a Flow image in the lab. The Tencent Hunyuan 3D 2.0 Community
License (Jan 21, 2025) forbids using or displaying Output outside the Territory, which excludes the
EU, the UK and South Korea (sections 1(l), 5(c)), and its AUP item 12 asks for machine-generated
content to be labelled. The site is reachable from those regions and shows no such label. Phase 1
(PR #60) shipped a procedural headphone while this was open.

## Options considered

1. Keep the procedural headphone. No licence risk, looks more like a toy.
2. Use the Hunyuan mesh and accept the risk. More convincing shape, 218 KB.
3. Use the Hunyuan mesh and geo-block it (EU, UK, KR get the procedural one via Vercel's country
   header). Closest to the licence, needs a country lookup on a static page.

## Decision

Option 2. Decided by: Farrez, after a side-by-side render of both headphones in the same booth.

## Reasoning

In Farrez's words: "Hunyuan, terima risikonya."

## Consequences

- `public/assets/dunia/headphone.glb` ships to every visitor; provenance and risk are recorded in
  `public/assets/dunia/PROVENANCE.md`.
- Worst written sanction is termination of the licence (section 8(b)). The exit is swapping the
  file for the procedural headphone (commit 718117d) or adding option 3.
- Revisit if Tencent or a visitor raises it, if the site turns commercial at scale (1M MAU clause),
  or if the snake loader also ends up using a Hunyuan mesh.

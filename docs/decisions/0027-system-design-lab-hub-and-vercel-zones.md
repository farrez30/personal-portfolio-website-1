# 0027. System Design Lab hub at /lab, experiment pages served as Vercel zones

- Date: 2026-11-21
- Status: Accepted

## Context
The flash-sale-lab project (FRZ-13) has two pages worth opening from the portfolio: the load test
replay and the scaling simulator. Research 05 in the private repo farrez30/flash-sale-lab records
Farrez's choices of 20 Nov 2026: a lab of its own with the satellite module as the way in, named
System Design Lab, one page per experiment with a plain layer and a technical layer. The pages are
a static Next.js export with absolute `/_next/...` addresses, and this repo is public.

## Options considered
How to embed the pages:
1. `basePath` build copied into `public/lab/flash-sale/`. No new account, but a few MB of build
   output in this public repo and a manual copy after each change.
2. **Each experiment repo deploys its own Vercel project with `basePath=/lab/<slug>`, and this
   site rewrites `/lab/<slug>/<page>` to it (Next.js multi-zones).**
3. Own domain plus an iframe: scroll inside scroll, iframe height on phones, theme not shared.

Visual direction of the hub: DESIGN.md as is, a lab module panel, or Apple style.

## Decision
Decided by Farrez on 21 Nov 2026: option 2, and for the look "opsi 1, di dalam opsi 2 atau bisa
menyatu dengan bagus tanpa kehilangan desain opsi 1" (DESIGN.md tokens and type, framed as a lab
module panel). The zone side is ADR 0009 in flash-sale-lab.

## Reasoning
Farrez chose option 2 from the trade-off table without adding his own words. The deciding points in
that table: no build output in this public repo, and each experiment deploys on its own.

## Consequences
- `content/lab.js` is the single list of experiments. It feeds the hub, the album links (Replay,
  Scaling simulator, System Design Lab on FRZ-13), and the rewrites in `next.config.mjs`.
- Several experiments can share one zone (`zona` in `content/lab.js`): on 23 Nov 2026 payments and
  ledger, backup and restore, and large file upload joined as SDL-02 to SDL-04, all served by the
  flash-sale-lab zone at `/lab/flash-sale/{bayar,backup,berkas}`. Page keys must be unique per zone.
- Only listed pages and their `_next` assets are rewritten. `/lab/<slug>` redirects to `/lab`
  because the zone's root is the shop, which needs an API that is not deployed.
- `proxy.js` skips `lab/` so the zone pages get no locale prefix; the hub `/lab` still gets one.
  The same change fixes the matcher's escaping: `"\."` in a JS string is just `.`, which had kept
  the locale proxy from running on any path except `/`, so `/proyek/<slug>` without a locale
  used to 404.
- Zone pages follow the visitor's OS colour scheme, not this site's theme toggle, and carry their
  own language switch (`?bahasa=en` is passed from the English site).
- Hub texts live in `content/lab.js`, not `messages/`: every namespace there becomes a CMS text
  table that needs a database migration (`tests/cms.test.mjs`).
- The zone's production URL is in `ZONA` (override with `LAB_FLASH_SALE_ASAL`). Preview
  deployments of the zone sit behind Vercel login, so rewrites must point at production.
- Revisit when a second experiment arrives (does the panel still read as a rack?), when the v5
  satellite lab module is built and should link here, or if a zone needs the API live.

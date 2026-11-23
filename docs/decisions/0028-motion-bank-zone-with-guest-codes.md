# 0028. Motion bank at /bank: private zone, one guest code per person

- Date: 2026-11-23
- Status: Accepted

## Context
Farrez's scroll motion bank (109 tested patterns, 23 rebuilds of MIT demos, 5,821 classified
references) moves out of Coderoach OS into a personal catalog at farrez.vercel.app/bank, closed to
the public and opened with a simple code for a few people. Guests must not see original sources;
Farrez does. This repo is public, so the catalog data cannot be committed here.

## Options considered
Where the catalog lives: (1) **a private repo farrez30/bank-gerak deployed as its own Vercel
project with `basePath=/bank`, rewritten from here (multi-zone, like /lab in ADR 0027)**; (2) a
page here with entries in the Payload Postgres and the 23 MB of demos in Vercel Blob; (3) a page
here that pulls from the private coderoach-referensi with a GitHub token.

How people get in: (1) **one code per person, stored as an HMAC fingerprint in a CMS collection,
revocable one by one, with Farrez recognised by his CMS session**; (2) one shared PIN; (3) Vercel
Password Protection (paid add-on, whole deployment).

## Decision
Decided by Farrez on 23 Nov 2026: option 1 for both.

## Reasoning
In Farrez's words: "Supaya isi bank tidak bocor lewat repo portofolio yang publik, dan saya bisa
mencabut akses satu orang tanpa mengganti kode semua orang."

## Consequences
- New collection `kode-bank` (admin only): name, fingerprint, active, valid until, last sign-in.
  The code itself is a virtual field, hashed with a key derived from `PAYLOAD_SECRET` and never
  stored. Codes are made with `npm run bank:kode -- -Nama <name>` (Bitwarden generates and keeps
  the code) and revoked by unticking Active in /admin.
- `POST /api/bank/masuk` checks the code (same-origin only, 10 wrong tries per address per 15 min,
  12 characters minimum) and sets an httpOnly `bank-tamu` ticket signed with the derived key.
  `GET /api/bank/sesi` answers only the role (`pemilik`, `tamu`, or 401) and re-checks the code in
  the database each time, so a revoked code stops at the zone's next check (cached 60 s there).
- The zone holds no secret: it forwards the visitor's `payload-token` and `bank-tamu` cookies to
  `/api/bank/sesi`. `PAYLOAD_SECRET` stays in this project only.
- `proxy.js` skips `/bank` so the zone gets no locale prefix; `content/bank.js` holds the zone
  address (`BANK_GERAK_ASAL` overrides it).
- The zone side, its source-hiding rules and its translations are ADR 0001 in farrez30/bank-gerak.
- Revisit if guests need their own accounts, or if the code check should move to the edge.

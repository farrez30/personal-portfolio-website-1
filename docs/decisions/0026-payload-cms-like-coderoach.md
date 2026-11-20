# 0026. Payload CMS at /admin, the same stack as coderoach.id

- Date: 2026-11-21
- Status: Accepted

## Context
Farrez wants to hide or show clients and projects, reorder them, and edit their copy and the UI
text in both languages without a code change, for the CD shop and for story v5. All of it was
hardcoded in `content/*.js` and `messages/*.json`. coderoach.id already runs Payload v3 at `/admin`
(Postgres on Railway, username or email login, ADR 0011 there). This repo is public, has no CI
besides the Vercel build, and about fifteen client components import the content modules directly.

## Options considered
1. **Small admin of our own that commits JSON to git** (recommended by Claude): no database, every
   reader keeps reading files, content tests gate the build. Publishing waits for a redeploy.
2. **Payload v3 like coderoach.id**: Postgres (Neon) plus the Payload admin; instant publish; the
   components have to get their data from the server instead of importing it.
3. **Git CMS off the shelf** (Keystatic, Decap, Tina): Keystatic and Decap log in with GitHub,
   which Farrez rules out; Tina needs a database and a long dependency list anyway.

## Decision (decided by: Farrez)
Option 2, with username and password plus Google login.

## Reasoning, in Farrez's words
"Sama dengan coderoach.id": one way of working for both sites. Farrez first gave "murah dan
sederhana" as the reason; Claude pointed out that fits option 1 better, and Farrez kept option 2.

## Consequences
- `content/*.js` and `messages/*.json` stay as the shape and the fallback. Payload holds the
  editable values, seeded from those files. If the database is missing or down, the site renders
  the files, so previews, tests and story v5 previs still work.
- Edited in the CMS: visibility, order, titles, summaries, links, status and period of projects;
  every field of clients (new clients too); personal links; all UI text in `id` and `en`.
  Kept in code: architecture stories (ADR 0008 privacy rules), booklet claims (claims audit),
  album art, scene data. New projects still need code because each one needs art and a scene.
- The same privacy checks run in the CMS as in `npm test` (no URLs, hosts or versions in
  summaries; ICU placeholders must match the file version), so an edit cannot skip them.
- Google login is ours, about 100 lines, no auth package: only emails that already have a user
  can log in. Creating users is closed in the admin when nobody is logged in; the first user is
  made by `npm run cms:akun`.
- Pinned to Payload 3.93.0 (3.90.2 had advisories, 3.94.1 was a day old). `npm audit --omit=dev`
  leaves 5 moderate findings in drizzle-kit's esbuild, used only by the migration CLI.
- Images are not uploaded through the CMS yet (no Vercel Blob); paths point at `public/`.
- Revisit if the database cost or cold starts start to hurt, or if images must be swapped often.

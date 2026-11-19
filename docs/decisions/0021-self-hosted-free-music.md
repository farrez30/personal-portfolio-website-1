# 0021. Background music from freely licensed recordings hosted on the site

- Date: 2026-11-19
- Status: Accepted. Supersedes ADR 0009 and ADR 0010.

## Context
The Spotify embed (ADR 0009) plays only 30-second previews in mobile browsers, even when the
visitor is logged in on the web and in the app (Farrez on Android Chrome, many reports on the
Spotify developer forum, and a forum reply around May 2023 that full playback is "desktop web
when authenticated" only). Most visitors arrive on a phone, so the player mostly cut off.
Recordings with an open licence may be copied, re-encoded and served from our own domain.
Licences were read from each Commons file page (the recording, not the composition) and from the
Incompetech FAQ, 19 Nov 2026.

## Options considered
1. **Replace Spotify with freely licensed files hosted here (chosen).** Full tracks everywhere,
   nothing third-party loaded, no Spotify keys. Loses Farrez's own playlist and the
   paste-a-Spotify-link feature; about 3 MB per track in the repo.
2. **Hybrid.** Hosted tracks by default, Spotify link pasting kept. Two players to maintain, two
   sources for the booklet track list.
3. **Keep Spotify.** Previews on phones, with a link out to the Spotify app (PR #96).

## Decision
Option 1, decided by Farrez on 19 Nov 2026, with all three moods (classical piano, pre-1926 jazz
on 78s, modern jazz under CC licences). He picked 23 of 24 candidates on a listening page.

## Reasoning
In Farrez's words: "cuma nyampah doang jadinya kalau Spotify ngegantung seperti ini" (a player
that hangs on previews is just clutter).

## Consequences
- `public/musik/`: 23 MP3 files, loudness normalised to -18 LUFS (EBU R128, two-pass loudnorm)
  and encoded with LAME VBR V5, 78.6 MB, 95.7 minutes. Source, licence and processing per file
  in `public/musik/PROVENANCE.md`; credits in `/credits.txt`, the booklet track list, and the
  player line while a track plays.
- Only CC0, public domain, CC BY and CC BY-SA recordings. Pre-1926 recordings only (US public
  domain under the Music Modernization Act). Re-encoding is a format change; the files keep the
  licence of their source, and BY-SA files stay BY-SA.
- Nothing loads before the visitor presses play: `preload="none"`, one file at a time.
- Removed: Spotify embed, oEmbed, `/api/musik/daftar`, `scripts/spotify-token.mjs`, and the
  `SPOTIFY_*` env vars (to be deleted from Vercel by Farrez).
- Revisit if the repo grows too heavy (move audio to object storage), if a licence on Commons is
  found to be wrong (remove that file), or if visitors ask to bring their own music again.

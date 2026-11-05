# 0009. Background music through the Spotify embed, loaded on click

- Date: 2026-11-05
- Status: Accepted

## Context

The music CD (FRZ-00) played an Epidemic Sound mp3 whose licence was never recorded, and in
Immersive mode the player had no visible control. Farrez (Spotify Premium) wants background
music from Spotify: his own playlist plus whatever a visitor pastes. Spotify audio cannot be
downloaded or rehosted (DRM and Developer Terms), so playback has to go through Spotify.

Limits, checked 5 Nov 2026:
- From 11 Feb 2026 (existing apps from 9 Mar), Web API Development Mode needs a Premium owner and
  allows 5 authorised users per app; wider access needs Extended Quota, which asks for a
  registered business and about 250k MAU (TechCrunch, 6 Feb 2026). A public "log in with
  Spotify" or search for every visitor is therefore out.
- There is no official lyrics endpoint; the unofficial one breaks the terms. The booklet shows
  the cover, title and a link to Spotify, not lyrics.
- oEmbed (`open.spotify.com/oembed`) needs no key and sends `Access-Control-Allow-Origin: *`,
  as do the image CDNs, so the browser can read the title and cover and draw them on a canvas.
  It returns no artist name.

## Options considered

1. Licensed mp3 from a music library, hosted here. Costs a subscription, and visitors cannot
   bring their own music.
2. Web API + Web Playback SDK. Full control and track lists, but blocked by the 5-user cap.
3. Official embed iframe + Embed iFrame API + oEmbed, loaded only after a click.

## Decision

Option 3. Decided by: Farrez (5 Nov 2026, Spotify instead of hosted files).

## Privacy

- Nothing from Spotify loads on page view. The embed script, oEmbed and cover image load only
  after the visitor presses play or submits a link. Before that, no request, no cookie.
- oEmbed and covers are fetched with `credentials: "omit"` and `no-referrer`, so Spotify's
  `sp_t` cookie set by oEmbed is not stored. The embed iframe itself is Spotify's, and its
  cookies follow Spotify's policy once the visitor chooses to play.
- A visitor's link and its title are kept only in their own `localStorage`; nothing is sent to
  this site's server.
- The oEmbed `html` is never injected; the iframe is built from the parsed ID, and covers are
  accepted only from `*.scdn.co` and `*.spotifycdn.com`.

## Consequences

- Visitors logged in to Spotify hear full tracks; everyone else gets previews.
- Spotify art goes through the print filter (`cetakKertas` in `gambar.js`) so it matches the
  other CDs.
- Pausing inside the Spotify iframe does not stop the 3D disc spinning yet.
- Revisit if Spotify changes the embed terms, if oEmbed loses CORS, or if Extended Quota
  becomes reachable.

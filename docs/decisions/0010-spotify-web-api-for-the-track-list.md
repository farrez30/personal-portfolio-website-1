# 0010. Track list from the Spotify Web API with Farrez's own login

- Date: 2026-11-05
- Status: Accepted

## Context

The music CD booklet (ADR 0009) only had a cover and a summary: oEmbed gives no track list.
Farrez wants the booklet to list the songs of his playlist.

Checked 5 Nov 2026 against primary sources:
- The embed page carries the track list in its `__NEXT_DATA__` JSON (tested: 50 tracks). Reading it
  is scraping: Spotify's User Guidelines forbid "crawling" or "scraping", and the Developer Terms
  forbid tools that retrieve Spotify Content, "which includes playlist data". The format is also
  internal and can change without notice.
- February 2026 migration guide: `GET /playlists/{id}/items` replaces `/tracks`, and playlist
  contents are "only returned for playlists the user owns or collaborates on". Client credentials
  get metadata only. Development Mode needs the owner on Premium, 5 users per app.

## Options considered

1. Scrape the embed JSON. Automatic, no setup, but breaks the terms and can break silently.
2. Web API with Farrez's refresh token on the server. Automatic and allowed, one-time setup.
3. Track list written by hand in `content/musik.js`. No setup, but goes stale.

## Decision

Option 2. Decided by: Farrez.

## Reasoning

In Farrez's words: both: it follows the playlist automatically, and it is the official route
that won't break silently like scraping.

## Consequences

- `/api/musik/daftar` reads only the playlist in `content/musik.js`; it takes no input, so it is
  not a proxy. The CDN caches it for an hour, so Spotify sees at most one call an hour.
- Secrets live only in server env (`SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET`,
  `SPOTIFY_REFRESH_TOKEN`). The refresh token is Farrez's login with read-only playlist scopes.
- Visitor picks get no track list: the API only returns playlists the logged-in owner has.
- If Farrez's Premium lapses, the app stops (per the guide) and the booklet has no list until it
  resumes. If the token is revoked, rerun `scripts/spotify-token.mjs`.
- Revisit if Spotify changes `/items` access again, or if the app needs Extended Quota.

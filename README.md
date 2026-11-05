# farrez.vercel.app

Portfolio of Farrez Al Hakim: implementation, business analysis and delivery. Each project is a
CD in a rack. Open the case to read the booklet (Overview, Challenge, Key decisions, Solution,
Delivery & role, Outcome), or put the disc in the player to see the product on a hologram screen.

## Run

Node 20.9 or newer.

```bash
npm ci
npm run dev      # http://localhost:3000
npm test         # node:test, no browser needed
npm run build && npm start
```

### Spotify track list (optional)

The music CD booklet lists the tracks of the playlist in `content/musik.js` through
`/api/musik/daftar` (ADR 0010). One-time setup:

1. Create an app at developer.spotify.com/dashboard (Web API, Redirect URI
   `http://127.0.0.1:8888/callback`). The playlist owner must be the app owner, with Premium.
2. Put `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in `.env.local`.
3. `node scripts/spotify-token.mjs`, log in, and the refresh token is written to `.env.local`.
4. Copy the three values to Vercel (Production) and redeploy.

If the list goes empty, the server log says why (`daftar lagu: token-400` means log in again).

## Layout

| Path | What it holds |
|---|---|
| `content/proyek.js` | The ten albums: titles, summaries, architecture, booklet pages. Privacy rules at the top of the file. |
| `content/musik.js`, `content/situs.js` | The music CD (Spotify playlist link) and personal links (CV, email, socials). |
| `components/musik/` | Spotify mini player for both modes: link parsing, oEmbed, print filter hookup (ADR 0009). |
| `messages/id.json`, `messages/en.json` | All UI text. Same keys in both; `npm test` checks it. |
| `components/imersif/` | Immersive mode: the three.js scene (`adegan.js`), the case, disc and player models (`benda.js`), canvas textures (`gambar.js`, `halamanUV.js`), and the hologram. |
| `components/rak/` | Light mode: grid of covers and a dialog per project. |
| `components/mode/` | Picks Immersive or Light per device; the visitor's choice wins. |
| `docs/decisions/` | Architecture decision records. |
| `docs/naskah-adegan.md` | Scene script and language rules. |
| `DESIGN.md` | Tokens, type, motion and the CD case measurements. |

## Content rules

- Booklet pages other than Overview are claims about Farrez. They stay `null`, and hidden, until the
  claim is rated defensible in `karier-frz/claims-audit.md`.
- Client names from office work are never written. The family business pilot carries no names,
  ad IDs, prices or margins.
- Indonesian copy is written for Indonesian readers, not translated. Work terms stay English.

## Credits

Inspired by [Discography](https://github.com/dmtrbrl/discography) by Dmytro Barylo, rebuilt from
scratch (see `docs/decisions/0006`). Booklet page turns use
[LeafThrough](https://www.npmjs.com/package/leafthrough) (MIT). Full list in `public/credits.txt`.

# Session Summary / Handoff — Portfolio v2 (CRA → Next.js cinematic rebuild)

> **CONVENTION:** This is the single "latest session" handoff file, **tracked &
> committed on branch `porto-v2`** (so another agent who checks out porto-v2 can
> read it). Whenever the user prompts **"rangkum session ini"**, OVERWRITE/UPDATE
> this same file with the newest state (do not create a new file), then **commit
> it and fast-forward porto-v2** like any other change. Keep it self-contained so
> a fresh AI agent in another session can continue with zero prior context.
>
> _Last updated: session that finished all planned features (modal-bleed fix,
> tonearm fix, advanced contact form) and promoted porto-v2 to production._

---

## 1. What this project is

A personal portfolio upgraded from a **Create React App** site into a
**highly interactive, cinematic, premium** experience (inspired by annapurna.com
& Netflix) with **international SEO (i18n)**.

- **Stack:** Next.js **14.2.x** (App Router) · **JavaScript only — NO TypeScript**
  (`.jsx`/`.js`, `jsconfig.json` with `@/*` alias) · pure CSS / per-component CSS
  (NO Tailwind) · `next-intl` v4 · `framer-motion` v12 · `lenis` v1.3 (smooth
  scroll) · `swiper` v10 · `@emailjs/browser` v3 · `sweetalert2` v11 · `react-icons` v4.
- **Owner:** Farrez Al Hakim. Target roles for SEO: **Full-Stack Developer,
  AI Agentic Engineer, Data Engineer**.
- Deploy target: **Vercel** (now serving the new site via `master`, see §10).

## 2. Git workflow (CRITICAL — read before committing)

- All work lands on branch **`porto-v2`**. NO new branches.
- `porto-v2` is checked out in the **main** worktree
  `D:/Projects/ayam/personal-portfolio-website-1`. Throwaway agent worktrees live under
  `.claude/worktrees/<name>` on `claude/<name>` branches. Git forbids checking out the
  same branch twice, so per feature:
  1. Commit in the current worktree.
  2. Fast-forward porto-v2 from the main worktree:
     `git -C "D:/Projects/ayam/personal-portfolio-website-1" merge --ff-only <new-sha>`
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
  PowerShell here-strings break on embedded quotes — write the message to a temp
  file (or use the Bash tool + heredoc) and `git commit -F <file>`.
- **`porto-v2` and `master` are both at the latest commit** (this summary), started
  from CRA base `6d5c786`. `master` was fast-forwarded up to porto-v2 (no force-push).

## 3. Commits done (all on porto-v2)

| Hash | What |
|------|------|
| `625890e` | **Commit 0** — CRA→Next.js scaffold (next, `next.config.js`, `jsconfig.json`; `src/`→`components/`/`app/`/`public/assets/`; `'use client'` where needed). |
| `709a04f` | **Commit 1** — i18n + International SEO. `next-intl` v4, `localePrefix:'always'`, locales **en/id/nl/ja/de**, `defaultLocale:'en'`. per-locale `generateMetadata`, `LanguageSwitcher`. |
| `76b61be` | **Commit 2** — Light/Dark theme. `[data-theme]` vars + glass-surface vars, no-flash `ThemeScript`, `ThemeProvider`, `ThemeToggle`. |
| `eaf6c2d` | **Commit 3** — Cinematic UI. `LenisProvider`, page-fade `template.jsx`, glass floating Nav (framer `layoutId`), 3D parallax hero. Gated by `useReducedMotion`. |
| `e36366e` | **Commit 4** — Floating Vinyl Player (`components/vinyl/VinylPlayer.jsx` + `vinyl.css`). |
| `e2618c3` | **Commit 5** — Portfolio Showroom (`portfolioData.js`, `Portfolio.jsx`, `ShowroomModal.jsx`). |
| `4a75d4b` | **Commit 5.1** — Showroom UX: iframe skeleton, open-in-new-tab, `techStack.js` registry + chips. |
| `6f72940` | **Commit 5.2** — Screenshot-based web previews + Preview/Live toggle. |
| `3a5b49e` | **Fix** — Showroom modal looked empty/broken: bare global `header{height:100vh;overflow:hidden}` / `footer{}` / `section{}` rules (plain CSS imported globally) leaked into the modal's semantic tags. Changed modal `<header>/<footer>/<section>`→`<div>`; scoped the hero rule `header`→`#home`. |
| `bd74748` | **Fix** — Vinyl tonearm reworked to pivot from a hub at the disc's top-right; headshell tip rests on the record; rest (paused) ≈4°, lowered (playing) ≈22°. |
| `949ac29` | **Commit 6** — Advanced Contact Form. Dual send: **Email** (`emailjs.sendForm`, awaited w/ success+error handling) and **WhatsApp** (`wa.me/<NUMBER>?text=` deep link, encoded). Editable pre-filled Subject+Message templates via `defaultValue` (translated per locale, no live re-translation). EmailJS IDs + WhatsApp number from `NEXT_PUBLIC_*` env with literal fallbacks; `.env.example` added. Validation via FormData+trim (fixed old `value===null` no-op + `form.name` gotcha). Themed `.swal-glass` SweetAlert2. Scoped bare global `form/input/textarea`→`.contact__form`. `contact` i18n extended across all 5 locales. |
| `2c23ae1` | chore — Update .gitignore. |

## 4. Status: ALL planned features shipped ✅

Commit 6 (contact form) was the last planned feature. The two follow-up fixes
(modal bleed, tonearm) are also done. The user has configured the env vars.

## 5. Deferred (by user's choice) — Headless CMS

User wants a CMS eventually but chose **keep `portfolioData.js` hardcoded for now**.
Later options: **Keystatic** (Git-based, no DB, no Next upgrade) or **Sanity** (hosted);
**Payload** needs Next **15.2+** + a DB + TS (big lift). Components read one data source,
so swapping `portfolioData.js` for a CMS fetch later is localized.

## 6. Key conventions & hard-won lessons (DON'T re-learn these)

- **Global CSS bleed is the recurring trap.** Per-component `.css` files are plain (NOT
  CSS modules) and imported globally, so **bare element selectors leak app-wide**. This
  broke the showroom modal (`header/footer/section`). When adding components, prefer class
  selectors; if you must style an element, scope it (e.g. `#home`, `.contact__form input`).
- **framer-motion + React StrictMode (dev) is flaky** for `AnimatePresence mode="wait"` exit
  and reactive `animate={cond?A:B}`. **Use CSS transitions/classes for show/hide** (vinyl
  player + showroom modal already do). Plain enter-only `animate` and `useScroll` are fine.
- **Verify in PRODUCTION**: `npm run build` then `next start` (or preview `portfolio-prod`
  :3001). Dev StrictMode double-invokes → false negatives.
- **Preview caveats:** audio won't play; **screenshots time out while the vinyl disc spins
  or an iframe animates** — pause the disc first, and rely on `preview_eval` DOM assertions
  (authoritative). The headless viewport sometimes reports `innerHeight:0`, inflating
  absolute px metrics — trust relative/gap measurements.
- **i18n:** `messages/{en,id,nl,ja,de}.json`, namespaced (`meta,nav,header,about,experience,
  portfolio,contact,footer,player`). Server comps `getTranslations`, client `useTranslations`.
- **Assets** referenced by **string path** from `/public/assets/...` (NOT ES imports / next/image).
- `.claude/` is gitignored (local tooling, incl. `launch.json`). `SESSION_SUMMARY.md` IS tracked.

## 7. Outstanding TODOs (placeholders are wired & graceful)

1. **Screenshots:** drop files into `public/assets/screenshots/` named by project id
   (`viralytics.jpg` ✅ added; still need `raja-roti-cemerlang.jpg`, `uruzin.jpg`,
   `coderoach-studio.jpg`, `tumtim-cookies.jpg`, `locascore.jpg`, `rpn-agro.jpg`,
   `groseria.jpg`). Until then gradient posters show.
2. **`portfolioData.js`** `// TODO` fields: real `year`, `role`, `impact`, `learnings`,
   confirm `tech[]`, add Figma `links`/`media` for Payung Hukum & Cuanbot.
3. **Vinyl player** constants in `VinylPlayer.jsx:8-11`: `PREVIEW_SRC`, `ALBUM_ART`,
   `TRACK_TITLE`, `TRACK_ARTIST` (still the placeholder track/cover).
4. **Review** machine-authored **ja/de/nl** strings (esp. the new `contact.messageTemplate`,
   `subjectTemplate`, `sendEmail`, `sendWhatsapp`, `alertErrorText`).
5. **SEO:** add `public/og/{en,id,nl,ja,de}.png` OG images; set `NEXT_PUBLIC_SITE_URL` to the
   real domain (metadataBase defaults to `https://farrez.vercel.app`).
6. ~~WhatsApp number~~ ✅ `6285884061543`. ~~Move emailjs IDs to env~~ ✅ done. ~~env setup~~ ✅
   user configured (locally + Vercel).

## 8. Project map (key files)

```
app/[locale]/{layout.jsx, page.jsx, template.jsx}   app router + providers + metadata
app/{globals.css, ThemeScript.jsx}
i18n/{routing.js, navigation.js, request.js}        next-intl core
middleware.js  next.config.js  jsconfig.json  .env.example
messages/{en,id,nl,ja,de}.json
components/providers/{ThemeProvider,LenisProvider}.jsx
components/theme/ThemeToggle.jsx  components/i18n/LanguageSwitcher.jsx
components/vinyl/{VinylPlayer.jsx, vinyl.css}
components/portfolio/{Portfolio.jsx, ShowroomModal.jsx, portfolioData.js, techStack.js, portfolio.css}
components/contact/{Contact.jsx, contact.css}       dual email/whatsapp send + .swal-glass
components/{header,nav,about,experience,footer,...}/  (per-component .jsx + .css)
public/assets/...  (audio, pngjpg, webp, screenshots/, FarrezCV.pdf, og/ [todo])
```

## 9. How to verify quickly

`npm install` → `npm run build` (clean, prerenders /en /id /nl /ja /de) → `npm run start`
(or preview `portfolio-prod` :3001) → open `/en`, exercise theme toggle, language switcher,
vinyl (pause disc for screenshots), portfolio modal (Preview/Live toggle), contact form
(WhatsApp deep link + themed Email send). Use `preview_eval` for DOM assertions.

## 10. Deployment (Vercel)

- **master = production**, fast-forwarded up to porto-v2 (clean ff from CRA base `6d5c786`;
  no force-push). Default branch = production = newest code. Keep landing work on porto-v2
  and fast-forward master when promoting.
- **Vercel project was originally CRA** → ensure **Framework Preset = Next.js** (turn OFF any
  CRA Build Command `react-scripts build` / Output Directory `build` overrides; Next auto-uses
  `next build` → `.next`). Node ≥ 18.17.
- **Production env vars** (Settings → Environment Variables; `NEXT_PUBLIC_*` are inlined at
  build, so rebuild after changes): `NEXT_PUBLIC_EMAILJS_SERVICE_ID`,
  `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`, `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`,
  `NEXT_PUBLIC_WHATSAPP_NUMBER`, `NEXT_PUBLIC_SITE_URL`. Code has safe fallbacks for all but
  SITE_URL. `.env.local` is gitignored (never deployed) — see `.env.example`.
- A failed build never takes prod down: Vercel keeps serving the last good deploy.

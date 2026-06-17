# Session Summary / Handoff — Portfolio v2 (CRA → Next.js cinematic rebuild)

> **CONVENTION:** This is the single "latest session" handoff file, **tracked &
> committed on branch `porto-v2`** (so another agent who checks out porto-v2 can
> read it). Whenever the user prompts **"rangkum session ini"**, OVERWRITE/UPDATE
> this same file with the newest state (do not create a new file), then **commit
> it and fast-forward porto-v2** like any other change. Keep it self-contained so
> a fresh AI agent in another session can continue with zero prior context.
>
> _Last updated: end of the migration session that delivered Commits 0–5.2._

---

## 1. What this project is

A personal portfolio being upgraded from a **Create React App** site into a
**highly interactive, cinematic, premium** experience (inspired by annapurna.com
& Netflix) with **international SEO (i18n)**.

- **Stack:** Next.js **14.2.x** (App Router) · **JavaScript only — NO TypeScript**
  (`.jsx`/`.js`, `jsconfig.json` with `@/*` alias) · pure CSS / per-component CSS
  (NO Tailwind) · `next-intl` v4 · `framer-motion` v12 · `lenis` v1.3 (smooth
  scroll) · `swiper` v10 · `@emailjs/browser` v3 · `sweetalert2` v11 · `react-icons` v4.
- **Owner:** Farrez Al Hakim. Target roles for SEO: **Full-Stack Developer,
  AI Agentic Engineer, Data Engineer**.
- Deploy target: **Vercel**.

## 2. Git workflow (CRITICAL — read before committing)

- All work must land on branch **`porto-v2`**. NO new branches.
- This session ran inside a **git worktree** at
  `D:\Projects\ayam\personal-portfolio-website-1\.claude\worktrees\zealous-almeida-e2ab4a`
  on throwaway branch `claude/zealous-almeida-e2ab4a`.
- `porto-v2` is checked out in the **main** worktree
  `D:/Projects/ayam/personal-portfolio-website-1` — git forbids checking out the
  same branch twice, so per feature:
  1. Commit in the current worktree.
  2. Fast-forward porto-v2 from the main worktree:
     `git -C "D:/Projects/ayam/personal-portfolio-website-1" merge --ff-only <new-sha>`
- Commit messages end with: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.
  PowerShell here-strings break on embedded quotes — write the message to a temp
  file and use `git commit -F <file>`.
- **Both branches are currently at `6f72940`** (started from base `6d5c786`).

## 3. Commits done this session (all on porto-v2)

| Hash | What |
|------|------|
| `625890e` | **Commit 0** — CRA→Next.js scaffold. Removed react-scripts/CRA; added next, `next.config.js`, `jsconfig.json`. Moved `src/components`→`components/`, `src/index.css`→`app/globals.css`, `src/assets`→`public/assets/` (referenced by string path). Added `'use client'` to interactive components. |
| `709a04f` | **Commit 1** — i18n + International SEO. `next-intl` v4, `localePrefix:'always'`, locales **en/id/nl/ja/de**, `defaultLocale:'en'`. `i18n/{routing,navigation,request}.js`, `middleware.js`, `app/[locale]/{layout,page}.jsx`, `messages/*.json` (all 5 authored). `generateMetadata` per-locale (title/desc/keywords/OG/twitter/canonical/hreflang+x-default). `LanguageSwitcher`. |
| `76b61be` | **Commit 2** — Light/Dark theme. `app/globals.css` split into `[data-theme="dark"]`/`[data-theme="light"]` + glass-surface vars. `app/ThemeScript.jsx` (no-flash inline), `components/providers/ThemeProvider.jsx`, `components/theme/ThemeToggle.jsx`. |
| `eaf6c2d` | **Commit 3** — Cinematic UI. `LenisProvider` (smooth scroll + anchors), `app/[locale]/template.jsx` (page fade), glass floating Nav with framer `layoutId` active pill + scroll-react, 3D parallax hero in Header. All gated by `useReducedMotion`. |
| `e36366e` | **Commit 4** — Floating Vinyl Player (`components/vinyl/VinylPlayer.jsx` + `vinyl.css`). Spinning grooved record (CSS keyframes) + tonearm + glass Play/Pause/Hide; collapses to a music button. Audio relocated OUT of Header. `player` i18n namespace. |
| `e2618c3` | **Commit 5** — Portfolio Showroom. `portfolioData.js` (web/media/soon), `Portfolio.jsx` (client card grid), `ShowroomModal.jsx` (glass modal: iframe desktop/mobile, swiper carousel for media, soon badge; Escape/backdrop close, Lenis scroll-lock, CSS enter/exit). |
| `4a75d4b` | **Commit 5.1** — Showroom UX fixes. iframe skeleton+spinner, open-in-new-tab, `techStack.js` icon registry + `tech[]` on every project + "Built with" chips + card tech icons. |
| `6f72940` | **Commit 5.2** — Screenshot-based web previews (fixes blank iframe). Web modal now defaults to a **screenshot** (`/assets/screenshots/<id>.jpg`) with gradient-poster fallback; **Preview/Live-preview toggle** makes the live iframe opt-in. Cards: poster base + screenshot overlay that hides on error. `public/assets/screenshots/README.md`. |

## 4. NEXT UP — Commit 6: Advanced Contact Form (FEATURE 5, the last planned feature)

Build `components/contact/Contact.jsx` (already client) into a premium glass form:
- Two send paths: **"Send via Email"** and **"Send via WhatsApp"**.
- Pre-filled **editable** Subject + Message templates; placeholders translated per
  active locale (use `useTranslations`), **NO live re-translation while typing**.
- **Email:** reuse existing `emailjs.sendForm("service_n9r4x8p","template_s50v8c4", form, "sHLzgGlimFe2gylV8")`.
  Move those IDs to `NEXT_PUBLIC_EMAILJS_*` env vars.
- **WhatsApp:** parse inputs → `https://wa.me/<NUMBER>?text=<encoded>` opened in a
  new tab. **User must supply the real WhatsApp number** (placeholder until then;
  repo currently references `6285884061543` in the old contact options).
- **sweetalert2:** override styles to match the premium dark/glass theme for
  success/error (themed popup).
- Add a `contactForm` (or extend `contact`) i18n namespace across all 5 locales.
- Commit msg: `feat: advanced contact form with email + whatsapp and themed sweetalert2`.
- Verify in prod (`next start`), then ff porto-v2.

## 5. Deferred (after Commit 6) — Headless CMS

User wants a CMS eventually but chose **keep `portfolioData.js` hardcoded for now**.
Decision notes for later: **Payload** requires Next.js **15.2+** (we're on 14.2.x),
a hosted DB (Mongo/Postgres) + some TypeScript — a big lift. Lighter fits for a solo
portfolio: **Keystatic** (Git-based, no DB, no Next upgrade) or **Sanity** (hosted).
Components read from one data source, so swapping `portfolioData.js` for a CMS fetch
later is localized.

## 6. Key conventions & hard-won lessons (DON'T re-learn these)

- **framer-motion + React StrictMode (dev) is flaky** for: `AnimatePresence mode="wait"`
  exit (deadlocks, element never unmounts) AND reactive `animate={cond?A:B}` opacity
  (doesn't reapply). **Use CSS transitions/classes for show/hide** instead (the vinyl
  player and the showroom modal already do). Plain enter-only `animate` and `useScroll`
  parallax are fine.
- **Verify in PRODUCTION**, not dev: `npm run build` then `next start`. Dev StrictMode
  double-invokes and produces false negatives. There's a preview config `portfolio-prod`
  (port 3001) for exactly this.
- **Preview tooling:** `.claude/launch.json` defines `portfolio-dev` (npm run dev, :3000)
  and `portfolio-prod` (npm run start -- -p 3001). Use the Claude Preview MCP. Caveats in
  the headless preview: **audio won't play** (can't fully verify vinyl sound) and
  **screenshots time out** when an iframe/continuous animation keeps the renderer busy —
  rely on DOM `preview_eval` assertions instead; those are authoritative.
- **i18n:** message files are `messages/{en,id,nl,ja,de}.json`, namespaced
  (`meta,nav,header,about,experience,portfolio,contact,footer,player`). Server components
  use `getTranslations`, client use `useTranslations`. Tech names stay literal.
- **Assets** are referenced by **string path** from `/public/assets/...` (NOT ES imports,
  NOT next/image) to preserve the hand-tuned `<picture>` and handle pdf/mp3/gif.
- `.claude/` is gitignored (local tooling, incl. launch.json). This summary file
  (`SESSION_SUMMARY.md`) IS tracked and lives on porto-v2.

## 7. Outstanding TODOs the USER must fill (placeholders are wired & graceful)

1. **Screenshots:** drop 8 files into `public/assets/screenshots/` named by project id
   (`viralytics.jpg`, `raja-roti-cemerlang.jpg`, `uruzin.jpg`, `coderoach-studio.jpg`,
   `tumtim-cookies.jpg`, `locascore.jpg`, `rpn-agro.jpg`, `groseria.jpg`). Until then,
   gradient posters show (no broken images). See that folder's README.
2. **`components/portfolio/portfolioData.js`** `// TODO` fields: real `year`, `role`,
   `impact`, `learnings`, confirm `tech[]` (currently guesses), add Figma `links`/`media`
   exports for Payung Hukum & Cuanbot (Cuanbot has 3 placeholder images to replace).
3. **Vinyl player** `components/vinyl/VinylPlayer.jsx`: replace `PREVIEW_SRC` (real ~30s
   MP3), `ALBUM_ART`, `TRACK_TITLE`, `TRACK_ARTIST`.
4. **WhatsApp number** for Commit 6.
5. **SEO:** add `public/og/{en,id,nl,ja,de}.png` OG images; set `NEXT_PUBLIC_SITE_URL`
   env (metadataBase defaults to `https://farrez.vercel.app`).
6. **Review** machine-authored **ja/de/nl** translations.
7. Move emailjs IDs to `NEXT_PUBLIC_EMAILJS_*` env (planned in Commit 6).

## 8. Project map (key files)

```
app/[locale]/{layout.jsx, page.jsx, template.jsx}   app router + providers + metadata
app/{globals.css, ThemeScript.jsx}
i18n/{routing.js, navigation.js, request.js}        next-intl core
middleware.js  next.config.js  jsconfig.json
messages/{en,id,nl,ja,de}.json
components/providers/{ThemeProvider,LenisProvider}.jsx
components/theme/ThemeToggle.jsx  components/i18n/LanguageSwitcher.jsx
components/vinyl/{VinylPlayer.jsx, vinyl.css}
components/portfolio/{Portfolio.jsx, ShowroomModal.jsx, portfolioData.js, techStack.js, portfolio.css}
components/{header,nav,about,experience,contact,footer,...}/   (per-component .jsx + .css)
public/assets/...  (audio, pngjpg, webp, screenshots/, FarrezCV.pdf, og/ [todo])
```

- Full feature-by-feature plan lives at (local, not in repo):
  `C:\Users\LENOVO\.claude\plans\act-as-a-senior-cuddly-crescent.md`.

## 9. How to verify quickly

`npm install` → `npm run build` (must be clean, prerenders /en /id /nl /ja /de) →
`npm run start` (or preview `portfolio-prod` on :3001) → open `/en`, exercise theme
toggle, language switcher, vinyl, portfolio modal (Preview/Live toggle), nav scroll.
Use `preview_eval` for DOM assertions; screenshots may time out (not a bug).

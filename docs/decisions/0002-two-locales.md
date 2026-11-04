# 0002. Two locales: Indonesian and English

- Date: 2026-11-04
- Status: Accepted

## Context

The old site had five locales (en, id, de, ja, nl). The new copy is rewritten per language with
the `bahasa-lisan` rules, not machine-translated, and every project has a booklet of claims that
must stay in sync across languages.

## Options considered

1. Keep five locales and translate the new copy.
2. Indonesian and English only; redirect /de, /ja, /nl to /en.
3. English only.

## Decision

Option 2. Decided by: Farrez.

## Reasoning

In Farrez's words: "Biaya rawat" (upkeep cost). Every claim and label has to be kept true in each
language; three extra languages nobody reads triple that work.

## Consequences

- `i18n/routing.js` lists `id` and `en`; `next.config.js` redirects the dropped locales
  permanently, so old links still land.
- The ID version is written for Indonesian readers, not translated. Work terms stay English
  (Overview, Challenge, Key decisions, Solution, Delivery & role, Outcome).
- `tests/isi.test.mjs` fails when a key exists in one language only.
- Revisit if a recruiter market in another language becomes a real target.

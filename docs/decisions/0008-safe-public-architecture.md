# 0008. Architecture shown as a safe request story

- Date: 2026-11-05
- Status: Accepted

## Context

Each album showed its architecture as a node-and-edge list (`simpul`/`garis`) drawn as a diagram
(SinarX in Light mode, UV ink in the booklet, chips around the hologram). Farrez found the UV page
and the chips confusing: a box list says what exists, not how it works. Some labels also leaked
detail a public page doesn't need ("CI (OIDC)", a hosting provider in brackets). Several labels
were wrong when checked against the repos on 5 Nov 2026: AkarKita sends no invite email, and the
NDS scraper runs in GitHub Actions, not in the Cloudflare Worker.

## Options considered

1. Keep the node list, fix the wrong labels. Cheap, but still answers "what" instead of "how".
2. Full system diagram per project. Most informative, but invites hosts, routes and schemas onto a
   public page, and is hard to keep true.
3. One user request told end to end (4 to 6 steps), each step with the technology that handles
   it, plus technology grouped as features, stack and infrastructure.

## Decision (decided by: Farrez, 5 Nov 2026)

Option 3: "a request story plus a separate page, safe for the public". Data lives in
`content/arsitektur.js`; technology names come from one catalogue,
`components/arsitektur/teknologi.js`. The same data feeds the Light mode album, the new page
`/[locale]/proyek/[slug]/arsitektur`, the booklet's UV ink, the back insert track list and the
hologram chips.

What may be published: product names (Next.js, PostgreSQL, Vercel), generic roles (scheduled job,
share link), and behaviour a user can observe or that shows good practice in general terms ("the
server checks the session", "nothing is saved if the totals don't match").

What is never published: hostnames, URLs, route paths, ports, IPs, version numbers, database
schema or table names, auth mechanisms and token flows, secrets, regions or data residency,
client or brand names, and anything that implies an unreleased system is live.

## Reasoning

A recruiter or client wants to see how Farrez thinks about a request, not the address of the
server. Generic steps are true for longer, can be checked against the repo, and give an attacker
nothing new. Grouping by role reads at a glance where a node list did not.

## Consequences

- `tests/arsitektur.test.mjs` fails on URLs, domains, API paths, version numbers, auth and region
  words, and on client names (checked by hash so the names are not written in this public repo).
- Every story is re-checked against its repo when that project changes; the 5 Nov 2026 check is
  recorded in the PR that introduced this file.
- Revisit if a project becomes open source with public docs, where linking to the real
  architecture would be more useful than a summary.
